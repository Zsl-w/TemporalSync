import { sortNewestFirst } from "./ai-news";
import { isRecord, validDate,
  type NeuroFeedItem, type NeuroFeedResponse, type NeuroFeedSource } from "./neuro-feed";

const HOUR = 60 * 60 * 1000;
const WINDOW_DAYS = 90;

function shanghaiDay(now: Date): string {
  return new Date(now.getTime() + 8 * HOUR).toISOString().slice(0, 10);
}

export function plainText(value: unknown, limit = 480): string {
  if (typeof value !== "string") return "";
  const text = value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code: string) => {
      const number = code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code);
      return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : " ";
    }).replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

export function buildPaperSearchUrl(now = new Date()): string {
  const start = shanghaiDay(new Date(now.getTime() - WINDOW_DAYS * 24 * HOUR));
  const end = shanghaiDay(now);
  const query = [
    '(TITLE_ABS:depression OR TITLE_ABS:"major depressive" OR TITLE_ABS:alzheimer* OR TITLE_ABS:parkinson* OR TITLE_ABS:bipolar)',
    '(TITLE_ABS:neuroimaging OR TITLE_ABS:MRI OR TITLE_ABS:fMRI OR TITLE_ABS:"magnetic resonance" OR TITLE_ABS:PET OR TITLE_ABS:connectom* OR TITLE_ABS:"brain imaging" OR TITLE_ABS:EEG OR TITLE_ABS:MEG OR TITLE_ABS:fNIRS OR TITLE_ABS:"computed tomography" OR TITLE_ABS:electroencephalogra* OR TITLE_ABS:magnetoencephalogra*)',
    '(TITLE_ABS:"machine learning" OR TITLE_ABS:"deep learning" OR TITLE_ABS:"artificial intelligence" OR TITLE_ABS:"foundation model" OR TITLE_ABS:"graph neural" OR TITLE_ABS:"neural network" OR TITLE_ABS:"large language model")',
    `FIRST_PDATE:[${start} TO ${end}]`,
  ].join(" AND ");
  const url = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
  url.search = new URLSearchParams({ query: `${query} sort_date:y`, format: "json", resultType: "core", pageSize: "60" }).toString();
  return url.href;
}

export function normalizePapers(value: unknown): NeuroFeedItem[] {
  if (!isRecord(value) || !isRecord(value.resultList) || !Array.isArray(value.resultList.result)) {
    throw new Error("Invalid literature response");
  }
  const items: NeuroFeedItem[] = [];
  for (const record of value.resultList.result) {
    if (!isRecord(record) || typeof record.id !== "string" || !record.id ||
      typeof record.source !== "string" || !/^[A-Z]+$/.test(record.source) ||
      !validDate(record.firstPublicationDate)) continue;
    const title = plainText(record.title, 600);
    if (!title) continue;
    const journalInfo = isRecord(record.journalInfo) ? record.journalInfo : {};
    const journal = isRecord(journalInfo.journal) ? journalInfo.journal : {};
    const preprint = record.source === "PPR";
    const doi = typeof record.doi === "string" && /^10\.\d{4,9}\/\S+$/i.test(record.doi) ? record.doi : undefined;
    const link = doi ? `https://doi.org/${encodeURI(doi)}` : record.source === "MED" && /^\d+$/.test(record.id)
      ? `https://pubmed.ncbi.nlm.nih.gov/${record.id}/`
      : `https://europepmc.org/article/${record.source}/${encodeURIComponent(record.id)}`;
    items.push({ id: `paper:${record.source}:${record.id}`, kind: "paper", title,
      source: plainText(journal.title, 160) || (preprint ? "Preprint" : "Europe PMC"),
      link, time: record.firstPublicationDate, summary: plainText(record.abstractText), preprint,
      ...(doi ? { doi } : {}) });
  }
  if (value.resultList.result.length && !items.length) throw new Error("No valid literature records");
  return uniqueItems(items);
}

function uniqueItems(items: NeuroFeedItem[]): NeuroFeedItem[] {
  const seen = new Set<string>();
  return sortNewestFirst(items).filter((item) => {
    const key = item.doi?.toLowerCase() || item.link;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

interface SourceResult { items: NeuroFeedItem[]; source: NeuroFeedSource }

export function createNeuroFeedLoader(fetcher: typeof fetch = fetch, clock: () => Date = () => new Date()) {
  const cache = new Map<string, { items: NeuroFeedItem[]; updatedAt: string }>();
  const pending = new Map<string, Promise<SourceResult>>();

  async function loadSource(key: string, source: Omit<NeuroFeedSource, "status">, load: () => Promise<NeuroFeedItem[]>): Promise<SourceResult> {
    const previous = cache.get(key);
    if (previous && clock().getTime() - Date.parse(previous.updatedAt) < HOUR &&
      shanghaiDay(new Date(previous.updatedAt)) === shanghaiDay(clock())) {
      return { items: previous.items, source: { ...source, status: "ready", updatedAt: previous.updatedAt } };
    }
    const active = pending.get(key);
    if (active) return active;
    const promise = (async (): Promise<SourceResult> => {
      try {
        const items = await load();
        const updatedAt = clock().toISOString();
        cache.set(key, { items, updatedAt });
        return { items, source: { ...source, status: "ready", updatedAt } };
      } catch {
        // Keep upstream failures isolated and return only the source status.
        if (previous && clock().getTime() - Date.parse(previous.updatedAt) < 7 * 24 * HOUR) {
          return { items: previous.items, source: { ...source, status: "stale", updatedAt: previous.updatedAt } };
        }
        return { items: [], source: { ...source, status: "error" } };
      } finally { pending.delete(key); }
    })();
    pending.set(key, promise);
    return promise;
  }

  async function request(url: string): Promise<Response> {
    const response = await fetcher(url, { signal: AbortSignal.timeout(12_000), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Source unavailable");
    return response;
  }

  return async (): Promise<NeuroFeedResponse> => {
    const now = clock();
    const result = await loadSource("papers", { id: "europe-pmc", name: "Europe PMC", kind: "paper" }, async () => {
      const response = await request(buildPaperSearchUrl(now));
      const payload: unknown = await response.json();
      return normalizePapers(payload);
    });
    const cutoff = Date.parse(`${shanghaiDay(new Date(now.getTime() - WINDOW_DAYS * 24 * HOUR))}T00:00:00+08:00`);
    const endOfDay = Date.parse(`${shanghaiDay(now)}T23:59:59.999+08:00`);
    return { items: uniqueItems(result.items)
      .filter((item) => Date.parse(item.time) >= cutoff && Date.parse(item.time) <= endOfDay),
      sources: [result.source], fetchedAt: clock().toISOString() };
  };
}

export const loadNeuroFeed = createNeuroFeedLoader();
