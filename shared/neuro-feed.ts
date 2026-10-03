export type NeuroFeedKind = "paper";
export type NeuroSourceStatus = "ready" | "error" | "stale";

export interface NeuroFeedItem {
  id: string;
  kind: NeuroFeedKind;
  title: string;
  source: string;
  link: string;
  time: string;
  summary: string;
  doi?: string;
  preprint?: boolean;
}

export interface NeuroFeedSource {
  id: string;
  name: string;
  kind: NeuroFeedKind;
  status: NeuroSourceStatus;
  updatedAt?: string;
}

export interface NeuroFeedResponse {
  items: NeuroFeedItem[];
  sources: NeuroFeedSource[];
  fetchedAt: string;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) return url.href;
  } catch { /* Invalid upstream links are omitted. */ }
  return undefined;
}

export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim() || Number.isNaN(Date.parse(value))) return false;
  return !/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value).toISOString().slice(0, 10) === value;
}

export function parseNeuroFeedResponse(value: unknown): NeuroFeedResponse {
  if (!isRecord(value) || !Array.isArray(value.items) || !Array.isArray(value.sources) || !validDate(value.fetchedAt)) {
    throw new Error("Invalid neuro feed response");
  }
  const items = value.items.map((item): NeuroFeedItem => {
    if (!isRecord(item) || typeof item.id !== "string" || !item.id ||
      item.kind !== "paper" || typeof item.title !== "string" || !item.title.trim() ||
      typeof item.source !== "string" || !item.source.trim() || !safeHttpUrl(item.link) ||
      !validDate(item.time) || typeof item.summary !== "string" ||
      (item.doi !== undefined && typeof item.doi !== "string") ||
      (item.preprint !== undefined && typeof item.preprint !== "boolean")) {
      throw new Error("Invalid neuro feed item");
    }
    return { id: item.id, kind: item.kind, title: item.title, source: item.source,
      link: safeHttpUrl(item.link)!, time: item.time, summary: item.summary,
      ...(typeof item.doi === "string" ? { doi: item.doi } : {}),
      ...(typeof item.preprint === "boolean" ? { preprint: item.preprint } : {}) };
  });
  const sources = value.sources.map((source): NeuroFeedSource => {
    if (!isRecord(source) || typeof source.id !== "string" || typeof source.name !== "string" ||
      source.kind !== "paper" ||
      !["ready", "error", "stale"].includes(String(source.status)) ||
      (source.updatedAt !== undefined && !validDate(source.updatedAt))) {
      throw new Error("Invalid neuro feed source");
    }
    return { id: source.id, name: source.name, kind: source.kind, status: source.status as NeuroSourceStatus,
      ...(typeof source.updatedAt === "string" ? { updatedAt: source.updatedAt } : {}) };
  });
  return { items, sources, fetchedAt: value.fetchedAt };
}
