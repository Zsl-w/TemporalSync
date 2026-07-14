import Parser from "rss-parser";
import {
  createEnrichedArticle,
  sortArticlesNewestFirst,
  type FeedItem,
} from "../../shared/ai-news";

const parser = new Parser();
const FEED_URL = "https://aihot.virxact.com/feed.xml";
const FEED_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function handleAINews(): Promise<Response> {
  const startTime = Date.now();
  try {
    const feedResponse = await fetch(FEED_URL, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent": FEED_USER_AGENT,
      },
    });
    if (!feedResponse.ok) {
      throw new Error(`Feed fetch failed: ${feedResponse.status}`);
    }

    const feed = await parser.parseString(await feedResponse.text());
    const articles = sortArticlesNewestFirst(
      feed.items.map((item) => createEnrichedArticle(item as FeedItem)),
    );
    const elapsed = Date.now() - startTime;

    console.log(`AI news completed in ${elapsed}ms, ${articles.length} items`);
    return new Response(JSON.stringify(articles), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=600, max-age=120",
        "X-Response-Time": String(elapsed),
      },
    });
  } catch (error: unknown) {
    console.error("News fetch error:", getErrorMessage(error));
    return new Response(JSON.stringify({ error: "Failed to fetch news" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequest(context: {
  request: Request;
  env: Record<string, string>;
  params: Record<string, string>;
}): Promise<Response> {
  const url = new URL(context.request.url);

  if (url.pathname === "/api/ai-news") return handleAINews();
  if (url.pathname === "/api/content-studio/generate" && context.request.method === "POST") {
    return new Response(JSON.stringify({ error: "Content Studio 已迁移至独立服务。" }), {
      status: 410,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  return new Response(JSON.stringify({ error: `Not found: ${url.pathname}` }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
