import express from "express";
import path from "path";
import Parser from "rss-parser";
import axios from "axios";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import crypto from "crypto";

const parser = new Parser();
const app = express();

app.use(express.json());

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

const articleCache = new Map<string, EnrichedArticle>();

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
    const domain = parsedUrl.hostname.replace(/^www\./, '');
    if (domain && domain.includes('.') && !domain.includes('localhost')) {
      return `https://unavatar.io/${domain}?fallback=false`;
    }
  } catch (_) {}

  return undefined;
}

async function scrapeArticle(url: string) {
  if (!url) return { image: "", description: "" };
  if (url.includes("x.com") || url.includes("twitter.com")) {
    return { image: "", description: "" };
  }
  try {
    const response = await axios.get(url, {
      timeout: 4000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    
    let charset = 'utf-8';
    const contentType = response.headers['content-type'];
    if (typeof contentType === 'string') {
      const matches = contentType.match(/charset=([a-zA-Z0-9-]*)/i);
      if (matches) charset = matches[1];
    }
    
    let html = iconv.decode(Buffer.from(response.data), charset);
    let $ = cheerio.load(html);
    
    const metaCharset = $('meta[charset]').attr('charset') || 
                        $('meta[http-equiv="Content-Type"]').attr('content')?.match(/charset=([a-zA-Z0-9-]*)/i)?.[1];
    if (metaCharset && metaCharset.toLowerCase() !== charset.toLowerCase()) {
      html = iconv.decode(Buffer.from(response.data), metaCharset);
      $ = cheerio.load(html);
    }
    
    let image = $("meta[property='og:image']").attr("content") || 
                $("meta[name='twitter:image']").attr("content") || 
                $("meta[itemprop='image']").attr("content") || "";
    
    if (image && !image.startsWith("http")) {
      try {
        const parsedUrl = new URL(url);
        image = new URL(image, parsedUrl.origin).toString();
      } catch (_) {}
    }
    
    if (!image) {
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.startsWith('http') && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon') && !src.includes('loading')) {
          image = src;
          return false;
        }
      });
    }

    let description = $("meta[property='og:description']").attr("content") || 
                      $("meta[name='description']").attr("content") || "";
    
    return { image, description };
  } catch (err: any) {
    console.error(`Scrape error for ${url}:`, err.message);
    return { image: "", description: "" };
  }
}

async function getGeminiEnrichment(title: string, summary: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
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

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      },
      {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const data = JSON.parse(text.trim());
      if (data && data.category && Array.isArray(data.tags)) {
        return {
          category: data.category,
          tags: data.tags,
          recommendedReason: data.recommendedReason || `推荐理由: 关注 AI 最新动态。`
        };
      }
    }
  } catch (err: any) {
    console.error("Gemini API enrichment error:", err.message);
  }
  return null;
}

function getFallbackEnrichment(title: string, summary: string) {
  let category = "行业";
  const titleAndSummary = (title + " " + summary).toLowerCase();
  
  if (
    titleAndSummary.includes("模型") || 
    titleAndSummary.includes("grok") || 
    titleAndSummary.includes("gemini") || 
    titleAndSummary.includes("claude") || 
    titleAndSummary.includes("qwen") || 
    titleAndSummary.includes("deepseek") || 
    titleAndSummary.includes("llama") || 
    titleAndSummary.includes("moe") || 
    titleAndSummary.includes("参数")
  ) {
    category = "模型";
  } else if (
    titleAndSummary.includes("论文") || 
    titleAndSummary.includes("arxiv") || 
    titleAndSummary.includes("研究") || 
    titleAndSummary.includes("paper") || 
    titleAndSummary.includes("基准") || 
    titleAndSummary.includes("dataset")
  ) {
    category = "论文";
  } else if (
    titleAndSummary.includes("工具") || 
    titleAndSummary.includes("app") || 
    titleAndSummary.includes("发布了") || 
    titleAndSummary.includes("推出了") || 
    titleAndSummary.includes("编辑器") || 
    titleAndSummary.includes("功能") || 
    titleAndSummary.includes("应用") || 
    titleAndSummary.includes("开源了")
  ) {
    category = "产品";
  } else if (
    titleAndSummary.includes("教程") || 
    titleAndSummary.includes("指南") || 
    titleAndSummary.includes("技巧") || 
    titleAndSummary.includes("提示词") || 
    titleAndSummary.includes("部署") || 
    titleAndSummary.includes("如何") || 
    titleAndSummary.includes("怎么")
  ) {
    category = "技巧";
  }
  
  const tags: string[] = [];
  if (titleAndSummary.includes("智能体") || titleAndSummary.includes("agent")) tags.push("智能体");
  if (titleAndSummary.includes("编码") || titleAndSummary.includes("code") || titleAndSummary.includes("编程") || titleAndSummary.includes("开发")) tags.push("编码");
  if (titleAndSummary.includes("融资") || titleAndSummary.includes("估值") || titleAndSummary.includes("亿美元") || titleAndSummary.includes("亿人民币")) tags.push("商业/资本");
  if (titleAndSummary.includes("芯片") || titleAndSummary.includes("gpu") || titleAndSummary.includes("英伟达") || titleAndSummary.includes("amd")) tags.push("硬件/算力");
  if (titleAndSummary.includes("推理") || titleAndSummary.includes("搜索") || titleAndSummary.includes("思考")) tags.push("搜索/推理");
  
  if (tags.length === 0) {
    tags.push("AI热点");
    tags.push(category);
  } else if (tags.length === 1) {
    tags.push("动态");
  }

  let recommendedReason = "";
  if (summary && summary.trim().length > 10) {
    const cleanSummary = summary.replace(/\.\.\.$/, "").trim();
    recommendedReason = `推荐理由: ${cleanSummary.slice(0, 70)}${cleanSummary.length > 70 ? '...' : ''}`;
  } else {
    recommendedReason = `推荐理由: 关注 ${title}，获取最新的行业前沿进展。`;
  }

  return { category, tags, recommendedReason };
}

// API Route: Link Metadata
app.get("/api/link-metadata", async (req, res) => {
  const url = req.query.url as string;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    const response = await axios.get(targetUrl, { 
      timeout: 10000,
      responseType: 'arraybuffer',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': targetUrl
      }
    });

    let charset = 'utf-8';
    const contentType = response.headers['content-type'];
    if (typeof contentType === 'string') {
      const matches = contentType.match(/charset=([a-zA-Z0-9-]*)/i);
      if (matches) charset = matches[1];
    }

    let html = iconv.decode(Buffer.from(response.data), charset);
    let $ = cheerio.load(html);

    const metaCharset = $('meta[charset]').attr('charset') || 
                        $('meta[http-equiv="Content-Type"]').attr('content')?.match(/charset=([a-zA-Z0-9-]*)/i)?.[1];
    if (metaCharset && metaCharset.toLowerCase() !== charset.toLowerCase()) {
      html = iconv.decode(Buffer.from(response.data), metaCharset);
      $ = cheerio.load(html);
    }

    const title = $("title").text().trim() || 
                  $("meta[property='og:title']").attr("content") || 
                  $("meta[name='twitter:title']").attr("content") || 
                  $("h1").first().text().trim() || 
                  url;

    let cleanTitle = title;
    if (targetUrl.includes('zhihu.com')) {
      cleanTitle = title.replace(' - 知乎', '');
    } else if (targetUrl.includes('csdn.net')) {
      cleanTitle = title.replace('_CSDN博客', '').replace('_csdn', '').replace('-CSDN博客', '');
    } else if (targetUrl.includes('bilibili.com')) {
      cleanTitle = title.replace('_哔哩哔哩_bilibili', '');
    } else if (targetUrl.includes('github.com')) {
      cleanTitle = title.replace('GitHub - ', '');
    }

    cleanTitle = cleanTitle.split(' - ')[0].split(' | ')[0].split(' – ')[0].trim();
    res.json({ title: cleanTitle || title });
  } catch (error) {
    console.error("Metadata fetch error:", error);
    res.json({ title: url });
  }
});

// API Route: Avatar Proxy
app.get("/api/avatar", async (req, res) => {
  const url = req.query.url as string;
  if (!url) return res.status(400).send("URL is required");

  try {
    const response = await axios.get(url, {
      timeout: 8000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const hash = crypto.createHash('md5').update(Buffer.from(response.data)).digest('hex');
    if (hash === '3db1ae56a24dc2d45a165e19489a9caf') {
      return res.status(404).send("Fallback placeholder avatar detected");
    }

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(response.data);
  } catch (error) {
    res.status(404).send("Avatar not found");
  }
});

// API Route: AI Hot Topics
app.get("/api/ai-news", async (req, res) => {
  try {
    const feedResponse = await axios.get("https://aihot.virxact.com/feed.xml", {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    const xmlData = feedResponse.data;
    const feed = await parser.parseString(xmlData);
    
    const processItem = async (item: any, index: number) => {
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

      if (index < 15) {
        const scraped = await scrapeArticle(link);
        image = scraped.image;
        if (!summary || summary.trim().length === 0 || summary === "...") {
          summary = scraped.description || title || "";
        }
        enriched = await getGeminiEnrichment(title, summary);
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
      const enrichedArticle: EnrichedArticle = {
        title,
        source,
        link,
        time: item.pubDate || item.isoDate || new Date().toISOString(),
        category: enriched.category,
        summary,
        image: image || undefined,
        tags: enriched.tags,
        recommendedReason: enriched.recommendedReason,
        avatar: avatarUrl ? `/api/avatar?url=${encodeURIComponent(avatarUrl)}` : undefined
      };

      articleCache.set(link, enrichedArticle);
      return enrichedArticle;
    };

    const results = await Promise.all(
      feed.items.map((item, index) => processItem(item, index))
    );

    results.sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA;
    });

    res.json(results);
  } catch (error) {
    console.error("News fetch error inside cloud function:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Fallback routing for Express subpathing mapping
app.get("*", (req, res) => {
  res.status(404).json({ error: `Not found: ${req.url}` });
});

export default app;
