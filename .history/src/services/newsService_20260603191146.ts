// Module-level cache for AI news data
// Prefetched on app mount so HotTopics page loads instantly

interface NewsItem {
  title: string;
  source: string;
  link: string;
  time: string;
  category: string;
  summary: string;
  image?: string;
  tags?: string[];
  recommendedReason?: string;
  avatar?: string;
}

let cachedNews: NewsItem[] | null = null;
let fetchPromise: Promise<NewsItem[]> | null = null;

export function getCachedNews(): NewsItem[] | null {
  return cachedNews;
}

export function prefetchNews(): void {
  if (fetchPromise) return; // already fetching
  fetchPromise = fetch('/api/ai-news')
    .then(r => r.json())
    .then((data) => {
      if (Array.isArray(data)) {
        cachedNews = data;
      }
      return data;
    })
    .catch((err) => {
      console.warn('News prefetch failed:', err.message);
      return [];
    })
    .finally(() => {
      fetchPromise = null;
    });
}

export function fetchNews(): Promise<NewsItem[]> {
  if (cachedNews) return Promise.resolve(cachedNews);
  if (fetchPromise) return fetchPromise;
  prefetchNews();
  return fetchPromise!;
}
