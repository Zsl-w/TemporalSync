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
  return cachedNews && cachedNews.length > 0 ? cachedNews : null;
}

export function prefetchNews(): void {
  if (fetchPromise) return; // already fetching
  fetchPromise = fetch('/api/ai-news')
    .then(async (r) => {
      if (!r.ok) {
        console.warn(`News API returned ${r.status}, skipping prefetch`);
        return [];
      }
      const text = await r.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          cachedNews = data;
        }
        return data;
      } catch {
        console.warn('News API returned non-JSON response, skipping prefetch');
        return [];
      }
    })
    .catch((err) => {
      console.warn('News prefetch failed:', err.message);
      return []; // don't cache on error
    })
    .finally(() => {
      fetchPromise = null;
    });
}

export function fetchNews(): Promise<NewsItem[]> {
  if (cachedNews && cachedNews.length > 0) return Promise.resolve(cachedNews);
  if (fetchPromise) return fetchPromise;
  prefetchNews();
  return fetchPromise!;
}
