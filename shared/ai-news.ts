export interface FeedItem {
  title?: unknown;
  link?: unknown;
  author?: unknown;
  contentSnippet?: unknown;
  description?: unknown;
  pubDate?: unknown;
  isoDate?: unknown;
}

export interface EnrichedArticle {
  title: string;
  source: string;
  link: string;
  time: string;
  category: string;
  summary: string;
  tags: string[];
  recommendedReason: string;
  avatar?: string;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
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

export function getFallbackEnrichment(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  let category = "行业";

  if (/模型|grok|gemini|claude|qwen|deepseek|llama|moe|参数/.test(text)) {
    category = "模型";
  } else if (/论文|arxiv|研究|paper|基准|dataset/.test(text)) {
    category = "论文";
  } else if (/工具|app|发布了|推出了|编辑器|功能|应用|开源了/.test(text)) {
    category = "产品";
  } else if (/教程|指南|技巧|提示词|部署|如何|怎么/.test(text)) {
    category = "技巧";
  }

  const tags: string[] = [];
  if (/智能体|agent/.test(text)) tags.push("智能体");
  if (/编码|code|编程|开发/.test(text)) tags.push("编码");
  if (/融资|估值|亿美元|亿人民币/.test(text)) tags.push("商业/资本");
  if (/芯片|gpu|英伟达|amd/.test(text)) tags.push("硬件/算力");
  if (/推理|搜索|思考/.test(text)) tags.push("搜索/推理");
  if (tags.length === 0) tags.push("AI热点", category);
  if (tags.length === 1) tags.push("动态");

  const cleanSummary = summary.replace(/\.\.\.$/, "").trim();
  const recommendedReason = cleanSummary.length > 10
    ? `推荐理由: ${cleanSummary.slice(0, 70)}${cleanSummary.length > 70 ? "..." : ""}`
    : `推荐理由: 关注 ${title}，获取最新的行业前沿进展。`;

  return { category, tags, recommendedReason };
}

export function createEnrichedArticle(
  item: FeedItem,
  now: () => string = () => new Date().toISOString(),
): EnrichedArticle {
  const title = asString(item.title);
  const link = asString(item.link);
  const author = asString(item.author);
  const source = author.match(/\((.*)\)/)?.[1] || "AIHot";
  const rawSummary = asString(item.contentSnippet) || asString(item.description);
  const completeSummary = !rawSummary.trim() || rawSummary.trim() === "..." ? title : rawSummary;
  const summary = completeSummary.length > 200
    ? `${completeSummary.slice(0, 200)}...`
    : completeSummary;
  const enrichment = getFallbackEnrichment(title, summary);
  const avatar = getAvatarUrl(source, link);

  return {
    title,
    source,
    link,
    time: asString(item.pubDate) || asString(item.isoDate) || now(),
    category: enrichment.category,
    summary,
    tags: enrichment.tags,
    recommendedReason: enrichment.recommendedReason,
    ...(avatar ? { avatar } : {}),
  };
}

export function sortArticlesNewestFirst(articles: EnrichedArticle[]): EnrichedArticle[] {
  return articles.sort((a, b) => {
    const timeA = Number.isNaN(Date.parse(a.time)) ? 0 : Date.parse(a.time);
    const timeB = Number.isNaN(Date.parse(b.time)) ? 0 : Date.parse(b.time);
    return timeB - timeA;
  });
}
