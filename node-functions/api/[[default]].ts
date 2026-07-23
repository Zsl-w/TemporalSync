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

async function handleLexoraExplain(request: Request, env: Record<string, string>): Promise<Response> {
  const apiKey = env.DEEPSEEK_API_KEY || (typeof process !== "undefined" ? process.env.DEEPSEEK_API_KEY : "");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY environment variable is not configured on EdgeOne." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  let body: { query?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const query = body.query?.trim();
  if (!query) {
    return new Response(JSON.stringify({ error: "Query parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const systemPrompt = `You are Lexora, an AI professional knowledge companion.
Your job is to explain unfamiliar specialist concepts (especially in AI/ML, Medicine, Biology, Engineering, etc.) in a structured format.
Given a user query (term or concept), produce a JSON object with EXACTLY the following structure:
{
  "id": string (kebab-case identifier e.g. "synaptic-plasticity"),
  "domain": string (e.g. "MEDICINE · NEUROSCIENCE" or "AI · MACHINE LEARNING"),
  "english": string (canonical English term),
  "chinese": string (canonical Chinese translation),
  "pronunciation": string (IPA phonetic transcription e.g. "/sɪˈnæptɪk/"),
  "conciseDefinition": string (1-3 sentences concise definition in Chinese),
  "deepExplanation": array of strings (2-4 paragraphs in Chinese explaining mechanisms, background, applications),
  "learningState": "new",
  "relations": array of objects:
    [
      { "id": string, "type": "prerequisite", "english": string, "chinese": string },
      { "id": string, "type": "current", "english": string, "chinese": string },
      { "id": string, "type": "derived", "english": string, "chinese": string },
      { "id": string, "type": "analogy", "english": string, "chinese": string }
    ]
}
Return ONLY valid JSON matching this schema. Do not include markdown code block syntax.`;

  const model = env.DEEPSEEK_MODEL || (typeof process !== "undefined" ? process.env.DEEPSEEK_MODEL : "") || "deepseek-chat";

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please explain the concept: "${query}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(resultText);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error: unknown) {
    console.error("Lexora explain error:", getErrorMessage(error));
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}

async function handleLexoraTutor(request: Request, env: Record<string, string>): Promise<Response> {
  const apiKey = env.DEEPSEEK_API_KEY || (typeof process !== "undefined" ? process.env.DEEPSEEK_API_KEY : "");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY environment variable is not configured on EdgeOne." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  let body: { conceptEnglish?: string; conceptChinese?: string; conciseDefinition?: string; question?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const { conceptEnglish, conceptChinese, conciseDefinition, question } = body;
  if (!question?.trim()) {
    return new Response(JSON.stringify({ error: "Question parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const systemPrompt = `You are Lexora AI Tutor, a patient, clear, and encouraging professional AI tutor.
The user is currently studying the concept: "${conceptEnglish || ''} (${conceptChinese || ''})".
Context definition: "${conciseDefinition || ''}".
Answer the user's follow-up question or request in clear, friendly, and structured Markdown (in Chinese). Use bullet points, bold text, or code/math blocks where helpful. Keep the answer focused on helping the user master this concept.`;

  const model = env.DEEPSEEK_MODEL || (typeof process !== "undefined" ? process.env.DEEPSEEK_MODEL : "") || "deepseek-chat";

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error: unknown) {
    console.error("Lexora tutor error:", getErrorMessage(error));
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
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
  if (url.pathname === "/api/lexora/explain" && context.request.method === "POST") {
    return handleLexoraExplain(context.request, context.env);
  }
  if (url.pathname === "/api/lexora/tutor" && context.request.method === "POST") {
    return handleLexoraTutor(context.request, context.env);
  }
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
