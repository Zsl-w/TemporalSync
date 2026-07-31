import type { HotTopicItem, NewsItem } from "../../shared/ai-news";

export type { HotTopicItem, NewsItem };

let cachedNews: NewsItem[] | null = null;
let cachedHotTopics: HotTopicItem[] | null = null;
let newsPromise: Promise<NewsItem[]> | null = null;
let hotTopicsPromise: Promise<HotTopicItem[]> | null = null;

async function requestItems<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`News API returned ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("News API returned an invalid response");
  }

  return data as T[];
}

function loadNews(): Promise<NewsItem[]> {
  if (cachedNews) return Promise.resolve(cachedNews);
  if (!newsPromise) {
    newsPromise = requestItems<NewsItem>("/api/ai-news")
      .then((items) => {
        cachedNews = items;
        return items;
      })
      .finally(() => {
        newsPromise = null;
      });
  }
  return newsPromise;
}

function loadHotTopics(): Promise<HotTopicItem[]> {
  if (cachedHotTopics) return Promise.resolve(cachedHotTopics);
  if (!hotTopicsPromise) {
    hotTopicsPromise = requestItems<HotTopicItem>("/api/ai-hot-topics")
      .then((items) => {
        cachedHotTopics = items;
        return items;
      })
      .finally(() => {
        hotTopicsPromise = null;
      });
  }
  return hotTopicsPromise;
}

export function getCachedNews(): NewsItem[] | null {
  return cachedNews;
}

export function getCachedHotTopics(): HotTopicItem[] | null {
  return cachedHotTopics;
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
