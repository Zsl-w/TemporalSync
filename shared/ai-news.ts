import { isRecord, safeHttpUrl, validDate } from './neuro-feed';

export type AihotCategory = "ai-models" | "ai-products" | "industry" | "paper" | "tip" | "other";

export interface AihotItem {
  id: string;
  title: string;
  originalTitle: string | null;
  summary: string | null;
  source: { name: string };
  links: { aihot: string; original: string };
  publishedAt: string | null;
  discoveredAt: string;
  category: string | null;
  score: number | null;
  selected: boolean;
}

export interface AihotItemsResponse {
  items: AihotItem[];
}

export interface AihotHotTopic {
  id: string;
  title: string;
  source: { name: string };
  links: { aihot: string; original: string; story?: string };
  sourceCount: number;
  signalCount: number;
  sourceNames: string[];
  latestAt: string;
}

export interface AihotHotTopicsResponse {
  items: AihotHotTopic[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  time: string;
  category: AihotCategory;
  summary: string;
  avatar?: string;
}

export interface HotTopicItem {
  id: string;
  title: string;
  source: string;
  link: string;
  aihotLink: string;
  time: string;
  sourceCount: number;
  signalCount: number;
  sourceNames: string[];
  avatar?: string;
}

function normalizeCategory(category: string | null): AihotCategory {
  switch (category) {
    case "ai-models":
    case "ai-products":
    case "industry":
    case "paper":
    case "tip":
      return category;
    default:
      return "other";
  }
}

export function getAvatarUrl(source: string, link: string): string | undefined {
  const xHandle = source.match(/@([a-zA-Z0-9_]+)/)?.[1];
  if (xHandle) return `https://unavatar.io/x/${xHandle}?fallback=false`;

  try {
    const url = new URL(link);
    const pathOwner = url.pathname.split("/").filter(Boolean)[0];
    if ((url.hostname === "x.com" || url.hostname === "twitter.com") && pathOwner) {
      return `https://unavatar.io/x/${pathOwner}?fallback=false`;
    }
    if (url.hostname === "github.com" && pathOwner) {
      return `https://unavatar.io/github/${pathOwner}?fallback=false`;
    }

    const domain = url.hostname.replace(/^www\./, "");
    if (domain.includes(".") && !domain.includes("localhost")) {
      return `https://unavatar.io/${domain}?fallback=false`;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function createNewsItem(item: AihotItem): NewsItem {
  const source = item.source.name || "AI HOT";
  const link = item.links.original || item.links.aihot;
  const summary = item.summary?.trim() || item.originalTitle?.trim() || item.title;
  const avatar = getAvatarUrl(source, link);

  return {
    id: item.id,
    title: item.title,
    source,
    link,
    time: item.publishedAt || item.discoveredAt,
    category: normalizeCategory(item.category),
    summary: summary.length > 200 ? `${summary.slice(0, 200)}...` : summary,
    ...(avatar ? { avatar } : {}),
  };
}

export function createHotTopicItem(item: AihotHotTopic): HotTopicItem {
  const source = item.source.name || item.sourceNames[0] || "AI HOT";
  const link = item.links.original || item.links.aihot;
  const avatar = getAvatarUrl(source, link);

  return {
    id: item.id,
    title: item.title,
    source,
    link,
    aihotLink: item.links.aihot,
    time: item.latestAt,
    sourceCount: item.sourceCount,
    signalCount: item.signalCount,
    sourceNames: item.sourceNames,
    ...(avatar ? { avatar } : {}),
  };
}

export function sortNewestFirst<T extends { time: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const timeA = Number.isNaN(Date.parse(a.time)) ? 0 : Date.parse(a.time);
    const timeB = Number.isNaN(Date.parse(b.time)) ? 0 : Date.parse(b.time);
    return timeB - timeA;
  });
}

// External JSON is unknown until every field used by the cards is checked.
function parseItems<T>(payload: unknown, parse: (value: unknown) => T | null): T[] {
  if (!isRecord(payload) || !Array.isArray(payload.items)) throw new Error('Invalid AI HOT response');
  const items = payload.items.map(parse).filter((item): item is T => item !== null);
  if (payload.items.length && !items.length) throw new Error('No valid AI HOT items');
  return items;
}

export function parseAINews(payload: unknown): NewsItem[] {
  return sortNewestFirst(parseItems(payload, (value): NewsItem | null => {
    if (!isRecord(value) || typeof value.id !== 'string' || !value.id || typeof value.title !== 'string' || !value.title.trim() ||
      !isRecord(value.links) || !isRecord(value.source)) return null;
    const link = safeHttpUrl(value.links.original) || safeHttpUrl(value.links.aihot);
    const time = validDate(value.publishedAt) ? value.publishedAt : value.discoveredAt;
    if (!link || !validDate(time)) return null;
    return createNewsItem({ id: value.id, title: value.title, source: { name: typeof value.source.name === 'string' ? value.source.name : 'AI HOT' },
      links: { original: link, aihot: safeHttpUrl(value.links.aihot) || link }, publishedAt: time, discoveredAt: time,
      summary: typeof value.summary === 'string' ? value.summary : null, originalTitle: typeof value.originalTitle === 'string' ? value.originalTitle : null,
      category: typeof value.category === 'string' ? value.category : null, score: null, selected: true });
  }));
}

export function parseAIHotTopics(payload: unknown): HotTopicItem[] {
  return sortNewestFirst(parseItems(payload, (value): HotTopicItem | null => {
    if (!isRecord(value) || typeof value.id !== 'string' || !value.id || typeof value.title !== 'string' || !value.title.trim() ||
      !isRecord(value.links) || !isRecord(value.source) || !validDate(value.latestAt) ||
      !Array.isArray(value.sourceNames) || !value.sourceNames.every((name) => typeof name === 'string') ||
      !Number.isSafeInteger(value.sourceCount) || Number(value.sourceCount) < 0 ||
      !Number.isSafeInteger(value.signalCount) || Number(value.signalCount) < 0) return null;
    const link = safeHttpUrl(value.links.original) || safeHttpUrl(value.links.aihot);
    const aihot = safeHttpUrl(value.links.aihot);
    if (!link || !aihot) return null;
    return createHotTopicItem({ id: value.id, title: value.title, source: { name: typeof value.source.name === 'string' ? value.source.name : 'AI HOT' },
      links: { original: link, aihot }, latestAt: value.latestAt, sourceNames: value.sourceNames,
      sourceCount: Number(value.sourceCount), signalCount: Number(value.signalCount) });
  }));
}

export function parseNewsCards(value: unknown): NewsItem[] {
  if (!Array.isArray(value) || !value.every((item) => isRecord(item) && typeof item.id === 'string' && typeof item.title === 'string' &&
    typeof item.source === 'string' && typeof item.summary === 'string' && safeHttpUrl(item.link) && validDate(item.time) &&
    ['ai-models', 'ai-products', 'industry', 'paper', 'tip', 'other'].includes(String(item.category)) &&
    (item.avatar === undefined || safeHttpUrl(item.avatar)))) throw new Error('Invalid news cards');
  return value as NewsItem[];
}

export function parseHotTopicCards(value: unknown): HotTopicItem[] {
  if (!Array.isArray(value) || !value.every((item) => isRecord(item) && typeof item.id === 'string' && typeof item.title === 'string' &&
    typeof item.source === 'string' && safeHttpUrl(item.link) && safeHttpUrl(item.aihotLink) && validDate(item.time) &&
    Number.isSafeInteger(item.sourceCount) && Number(item.sourceCount) >= 0 && Number.isSafeInteger(item.signalCount) && Number(item.signalCount) >= 0 &&
    Array.isArray(item.sourceNames) && item.sourceNames.every((name) => typeof name === 'string') &&
    (item.avatar === undefined || safeHttpUrl(item.avatar)))) throw new Error('Invalid hot topic cards');
  return value as HotTopicItem[];
}
