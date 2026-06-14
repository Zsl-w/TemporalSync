// EdgeOne Pages Node Functions — API handler
// Node Functions support full Node.js runtime: http, https, crypto, cheerio, rss-parser, etc.

import * as cheerio from "cheerio";
import Parser from "rss-parser";

// Lazy-load content-studio-core to avoid crashing the entire function
// when pdf-parse native dependencies are unavailable in the EdgeOne runtime.
let generateContentStudio: typeof import("../../content-studio-core").generateContentStudio | null = null;
async function getGenerateContentStudio() {
  if (generateContentStudio) return generateContentStudio;
  try {
    const mod = await import("../../content-studio-core");
    generateContentStudio = mod.generateContentStudio;
    return generateContentStudio;
  } catch (err) {
    console.error("Failed to load content-studio-core:", err);
    return null;
  }
}

const parser = new Parser();

// ── Types ───────────────────────────────────────────────────────────

interface EnrichedArticle {
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

// ── Cache ───────────────────────────────────────────────────────────

const articleCache = new Map<string, EnrichedArticle>();

// ── Text Decoding ────────────────────────────────────────────────────

function detectCharsetFromHeaders(headers: Headers): string {
  const ct = headers.get("content-type") || "";
  const m = ct.match(/charset=([a-zA-Z0-9\-]+)/i);
  return m ? m[1] : "utf-8";
}

function decodeBuffer(buffer: ArrayBuffer, charset: string): string {
  try {
    return new TextDecoder(charset.toLowerCase()).decode(buffer);
  } catch {
    try {
      return new TextDecoder("utf-8").decode(buffer);
    } catch {
      return "";
    }
  }
}

// ── Placeholder avatar detection ────────────────────────────────────

function isPlaceholderAvatar(buffer: ArrayBuffer, contentType: string): boolean {
  if (contentType.includes("svg") && buffer.byteLength < 2000) return true;
  return false;
}

// ── Scraper helpers ──────────────────────────────────────────────────

const SCRAPE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchWithTimeout(url: string, timeoutMs: number, headers?: Record<string, string>): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": SCRAPE_UA, ...headers },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ── Avatar URL builder ──────────────────────────────────────────────

function getAvatarUrl(source: string, link: string): string | undefined {
  const xMatch = source.match(/@([a-zA-Z0-9_]+)/);
  if (xMatch && xMatch[1]) {
    return `https://unavatar.io/x/${xMatch[1]}?fallback=false`;
  }
  if (link.includes("x.com") || link.includes("twitter.com")) {
    const urlParts = link.split("/");
    const xIndex = urlParts.findIndex(p => p.includes("x.com") || p.includes("twitter.com"));
    if (xIndex !== -1 && urlParts[xIndex + 1]) {
      return `https://unavatar.io/x/${urlParts[xIndex + 1]}?fallback=false`;
    }
  }
  if (link.includes("github.com")) {
    const urlParts = link.split("/");
    const ghIndex = urlParts.findIndex(p => p.includes("github.com"));
    if (ghIndex !== -1 && urlParts[ghIndex + 1]) {
      return `https://unavatar.io/github/${urlParts[ghIndex + 1]}?fallback=false`;
    }
  }
  try {
    const parsedUrl = new URL(link);
    const domain = parsedUrl.hostname.replace(/^www\./, "");
    if (domain && domain.includes(".") && !domain.includes("localhost")) {
      return `https://unavatar.io/${domain}?fallback=false`;
    }
  } catch (_) {}
  return undefined;
}

// ── Article scraping ────────────────────────────────────────────────

async function scrapeArticle(url: string) {
  if (!url) return { image: "", description: "" };
  if (url.includes("x.com") || url.includes("twitter.com")) {
    return { image: "", description: "" };
  }
  try {
    const response = await fetchWithTimeout(url, 2000);
    const arrayBuf = await response.arrayBuffer();
    const charset = detectCharsetFromHeaders(response.headers);
    let html = decodeBuffer(arrayBuf, charset);
    let $ = cheerio.load(html);

    const metaCharset =
      $("meta[charset]").attr("charset") ||
      $('meta[http-equiv="Content-Type"]')
        .attr("content")
        ?.match(/charset=([a-zA-Z0-9\-]+)/i)?.[1];
    if (metaCharset && metaCharset.toLowerCase() !== charset.toLowerCase()) {
      html = decodeBuffer(arrayBuf, metaCharset);
      $ = cheerio.load(html);
    }

    let image =
      $("meta[property='og:image']").attr("content") ||
      $("meta[name='twitter:image']").attr("content") ||
      $("meta[itemprop='image']").attr("content") ||
      "";
    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, new URL(url).origin).toString();
      } catch (_) {}
    }
    if (!image) {
      $("img").each((_i, el) => {
        const src = $(el).attr("src");
        if (
          src &&
          src.startsWith("http") &&
          !src.includes("avatar") &&
          !src.includes("logo") &&
          !src.includes("icon") &&
          !src.includes("loading")
        ) {
          image = src;
          return false;
        }
      });
    }

    const description =
      $("meta[property='og:description']").attr("content") ||
      $("meta[name='description']").attr("content") ||
      "";
    return { image, description };
  } catch (err: any) {
    console.error(`Scrape error for ${url}:`, err.message);
    return { image: "", description: "" };
  }
}

// ── MIMO enrichment (replaces Gemini) ─────────────────────────────────

function getMimoApiKey(): string {
  return process.env.MIMO_API_KEY || "";
}

function getMimoBaseUrl(): string {
  return process.env.MIMO_BASE_URL || "https://api.mimo.run/v1";
}

function getMimoModel(): string {
  return process.env.MIMO_MODEL || "mimo-v2";
}

async function getAIEnrichment(title: string, summary: string) {
  const apiKey = getMimoApiKey();
  if (!apiKey) {
    console.warn("MIMO_API_KEY not set, using fallback enrichment");
    return null;
  }

  try {
    const prompt = `分析以下 AI 新闻的标题和摘要，并返回一个 JSON 对象，必须包含以下字段：
- category: 必须是 "模型", "产品", "行业", "论文", "技巧" 之一
- tags: 必须是 2-3 个相关的中文标签数组，例如 ["智能体", "编码"]
- recommendedReason: 1-2 句话的中文推荐理由，必须以 "推荐理由: " 开头

新闻标题: ${title}
新闻摘要: ${summary}

注意：只返回纯 JSON，不要任何 markdown 标记（如 \`\`\`json）。`;

    const baseUrl = getMimoBaseUrl();
    const model = getMimoModel();

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "你是一个专业的 AI 新闻分析助手，只输出 JSON 格式的响应。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error(`MIMO API error: ${response.status}`);
      return null;
    }

    const json: any = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (content) {
      const data = JSON.parse(content.trim());
      if (data && data.category && Array.isArray(data.tags)) {
        return {
          category: data.category,
          tags: data.tags,
          recommendedReason: data.recommendedReason || `推荐理由: 关注 AI 最新动态。`,
        };
      }
    }
  } catch (err: any) {
    console.error("MIMO API enrichment error:", err.message);
  }
  return null;
}

// ── Fallback enrichment ─────────────────────────────────────────────

function getFallbackEnrichment(title: string, summary: string) {
  let category = "行业";
  const lower = (title + " " + summary).toLowerCase();

  if (/模型|grok|gemini|claude|qwen|deepseek|llama|moe|参数/.test(lower)) {
    category = "模型";
  } else if (/论文|arxiv|研究|paper|基准|dataset/.test(lower)) {
    category = "论文";
  } else if (/工具|app|发布了|推出了|编辑器|功能|应用|开源了/.test(lower)) {
    category = "产品";
  } else if (/教程|指南|技巧|提示词|部署|如何|怎么/.test(lower)) {
    category = "技巧";
  }

  const tags: string[] = [];
  if (/智能体|agent/.test(lower)) tags.push("智能体");
  if (/编码|code|编程|开发/.test(lower)) tags.push("编码");
  if (/融资|估值|亿美元|亿人民币/.test(lower)) tags.push("商业/资本");
  if (/芯片|gpu|英伟达|amd/.test(lower)) tags.push("硬件/算力");
  if (/推理|搜索|思考/.test(lower)) tags.push("搜索/推理");
  if (tags.length === 0) {
    tags.push("AI热点");
    tags.push(category);
  } else if (tags.length === 1) {
    tags.push("动态");
  }

  let recommendedReason = "";
  if (summary && summary.trim().length > 10) {
    const clean = summary.replace(/\.\.\.$/, "").trim();
    recommendedReason = `推荐理由: ${clean.slice(0, 70)}${clean.length > 70 ? "..." : ""}`;
  } else {
    recommendedReason = `推荐理由: 关注 ${title}，获取最新的行业前沿进展。`;
  }
  return { category, tags, recommendedReason };
}

// ── API Handlers ────────────────────────────────────────────────────

async function handleLinkMetadata(url: URL): Promise<Response> {
  const target = url.searchParams.get("url");
  if (!target) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const targetUrl = target.startsWith("http") ? target : `https://${target}`;
    const response = await fetchWithTimeout(targetUrl, 10000, {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      Referer: targetUrl,
    });

    const arrayBuf = await response.arrayBuffer();
    const charset = detectCharsetFromHeaders(response.headers);
    let html = decodeBuffer(arrayBuf, charset);
    let $ = cheerio.load(html);

    const metaCharset =
      $("meta[charset]").attr("charset") ||
      $('meta[http-equiv="Content-Type"]')
        .attr("content")
        ?.match(/charset=([a-zA-Z0-9\-]+)/i)?.[1];
    if (metaCharset && metaCharset.toLowerCase() !== charset.toLowerCase()) {
      html = decodeBuffer(arrayBuf, metaCharset);
      $ = cheerio.load(html);
    }

    const title =
      $("title").text().trim() ||
      $("meta[property='og:title']").attr("content") ||
      $("meta[name='twitter:title']").attr("content") ||
      $("h1").first().text().trim() ||
      target;

    let cleanTitle = title;
    if (targetUrl.includes("zhihu.com")) cleanTitle = title.replace(" - 知乎", "");
    else if (targetUrl.includes("csdn.net"))
      cleanTitle = title.replace("_CSDN博客", "").replace("_csdn", "").replace("-CSDN博客", "");
    else if (targetUrl.includes("bilibili.com"))
      cleanTitle = title.replace("_哔哩哔哩_bilibili", "");
    else if (targetUrl.includes("github.com"))
      cleanTitle = title.replace("GitHub - ", "");

    cleanTitle = cleanTitle.split(" - ")[0].split(" | ")[0].split(" – ")[0].trim();

    return new Response(JSON.stringify({ title: cleanTitle || title }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return new Response(JSON.stringify({ title: target }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleAvatar(url: URL): Promise<Response> {
  const target = url.searchParams.get("url");
  if (!target) {
    return new Response("URL is required", { status: 400 });
  }

  try {
    const response = await fetchWithTimeout(target, 8000);
    if (!response.ok) {
      return new Response("Avatar not found", { status: 404 });
    }

    const arrayBuf = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    if (isPlaceholderAvatar(arrayBuf, contentType)) {
      return new Response("Fallback placeholder avatar detected", { status: 404 });
    }

    return new Response(arrayBuf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new Response("Avatar not found", { status: 404 });
  }
}

async function handleAINews(): Promise<Response> {
  const startTime = Date.now();
  const ENRICH_COUNT = 5;        // only deep-enrich first N articles
  const ENRICH_DEADLINE_MS = 12000; // 12s hard deadline for enrichment batch

  try {
    // 1. Fetch RSS feed (fast)
    const feedResponse = await fetch("https://aihot.virxact.com/feed.xml", {
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "User-Agent": SCRAPE_UA,
      },
    });
    if (!feedResponse.ok) {
      throw new Error(`Feed fetch failed: ${feedResponse.status}`);
    }
    const xmlData = await feedResponse.text();
    const feed = await parser.parseString(xmlData);

    const processItem = async (item: any, index: number): Promise<EnrichedArticle> => {
      const link = item.link || "";
      const title = item.title || "";
      const authorMatch = item.author?.match(/\((.*)\)/);
      const source = authorMatch ? authorMatch[1] : "AIHot";

      if (articleCache.has(link)) {
        return articleCache.get(link)!;
      }

      let image = "";
      let summary = item.contentSnippet || item.description || "";
      let enriched: any = null;

      // Deep enrichment only for first N articles, with timeout guard
      if (index < ENRICH_COUNT && (Date.now() - startTime) < ENRICH_DEADLINE_MS) {
        try {
          const scraped = await scrapeArticle(link);
          image = scraped.image;
          if (!summary || summary.trim().length === 0 || summary === "...") {
            summary = scraped.description || title || "";
          }
          enriched = await getAIEnrichment(title, summary);
        } catch {
          // scrape or AI enrichment failed — fall through to fallback
        }
      }

      if (!enriched) {
        if (!summary || summary.trim().length === 0 || summary === "...") {
          summary = title || "";
        }
        enriched = getFallbackEnrichment(title, summary);
      }

      if (summary.length > 200) {
        summary = summary.slice(0, 200) + "...";
      }

      const avatarUrl = getAvatarUrl(source, link);
      const article: EnrichedArticle = {
        title,
        source,
        link,
        time: item.pubDate || item.isoDate || new Date().toISOString(),
        category: enriched.category,
        summary,
        image: image || undefined,
        tags: enriched.tags,
        recommendedReason: enriched.recommendedReason,
        avatar: avatarUrl ? `/api/avatar?url=${encodeURIComponent(avatarUrl)}` : undefined,
      };

      articleCache.set(link, article);
      return article;
    };

    const results = await Promise.all(
      feed.items.map((item: any, index: number) => processItem(item, index))
    );

    results.sort((a, b) => {
      const ta = a.time ? new Date(a.time).getTime() : 0;
      const tb = b.time ? new Date(b.time).getTime() : 0;
      return tb - ta;
    });

    const elapsed = Date.now() - startTime;
    console.log(`handleAINews completed in ${elapsed}ms, ${results.length} items`);

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=600, max-age=120",
        "X-Response-Time": String(elapsed),
      },
    });
  } catch (error: any) {
    console.error("News fetch error:", error.message);
    return new Response(JSON.stringify({ error: "Failed to fetch news" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ── EdgeOne Pages Node Functions Route Handler ──────────────────────

export async function onRequest(context: {
  request: Request;
  env: Record<string, string>;
  params: Record<string, string>;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === "/api/link-metadata") return handleLinkMetadata(url);
  if (path === "/api/avatar") return handleAvatar(url);
  if (path === "/api/ai-news") return handleAINews();
  if (path === "/api/content-studio/generate" && context.request.method === "POST") {
    try {
      const body = await context.request.json();
      const fn = await getGenerateContentStudio();
      if (!fn) {
        return new Response(JSON.stringify({ error: "内容工作室服务暂不可用，请稍后重试。" }), {
          status: 503,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      return fn(
        body as any,
        {
          apiKey: context.env.MIMO_API_KEY || process.env.MIMO_API_KEY || "",
          baseUrl: context.env.MIMO_BASE_URL || process.env.MIMO_BASE_URL,
          model: context.env.MIMO_MODEL || process.env.MIMO_MODEL,
        },
      );
    } catch {
      return new Response(JSON.stringify({ error: "请求数据格式无效。" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
  }

  return new Response(JSON.stringify({ error: `Not found: ${path}` }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
