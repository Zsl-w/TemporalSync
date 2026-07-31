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
