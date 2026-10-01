import { parseNewsCards, parseHotTopicCards, type HotTopicItem, type NewsItem } from "../../shared/ai-news";

export type { HotTopicItem, NewsItem };

let cachedNews: NewsItem[] | null = null;
let cachedHotTopics: HotTopicItem[] | null = null;
const CACHE_TTL = 5 * 60 * 1000;
let newsUpdatedAt = 0;
let topicsUpdatedAt = 0;
let newsPromise: Promise<NewsItem[]> | null = null;
let hotTopicsPromise: Promise<HotTopicItem[]> | null = null;

async function requestItems<T>(endpoint: string, parse: (value: unknown) => T[]): Promise<T[]> {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    throw new Error(`News API returned ${response.status}`);
  }

  const data: unknown = await response.json();
  return parse(data);
}

function loadNews(): Promise<NewsItem[]> {
  if (getCachedNews()) return Promise.resolve(cachedNews!);
  if (!newsPromise) {
    newsPromise = requestItems("/api/ai-news", parseNewsCards)
      .then((items) => {
        cachedNews = items;
        newsUpdatedAt = Date.now();
        return items;
      })
      .finally(() => {
        newsPromise = null;
      });
  }
  return newsPromise;
}

function loadHotTopics(): Promise<HotTopicItem[]> {
  if (getCachedHotTopics()) return Promise.resolve(cachedHotTopics!);
  if (!hotTopicsPromise) {
    hotTopicsPromise = requestItems("/api/ai-hot-topics", parseHotTopicCards)
      .then((items) => {
        cachedHotTopics = items;
        topicsUpdatedAt = Date.now();
        return items;
      })
      .finally(() => {
        hotTopicsPromise = null;
      });
  }
  return hotTopicsPromise;
}

export function getCachedNews(): NewsItem[] | null {
  return Date.now() - newsUpdatedAt < CACHE_TTL ? cachedNews : null;
}

export function getCachedHotTopics(): HotTopicItem[] | null {
  return Date.now() - topicsUpdatedAt < CACHE_TTL ? cachedHotTopics : null;
}

export function prefetchNews(): void {
  void loadNews().catch((error: unknown) => {
    console.warn("News prefetch failed:", error);
  });
}

export function fetchNews(): Promise<NewsItem[]> {
  return loadNews();
}

export function fetchHotTopics(): Promise<HotTopicItem[]> {
  return loadHotTopics();
}
