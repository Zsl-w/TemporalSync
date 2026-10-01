import { parseAINews, parseAIHotTopics } from "../../shared/ai-news";
import { parseExplainInput, parseTutorInput, parseConcept, completionText } from "../../shared/lexora-validation";
import { loadNeuroFeed } from "../../shared/neuro-feed-server";

const AIHOT_API_BASE = "https://aihot.virxact.com/api/v1";
const AI_NEWS_URL = `${AIHOT_API_BASE}/items?mode=selected&window=7d&limit=100&by=timeline`;
const AI_HOT_TOPICS_URL = `${AIHOT_API_BASE}/hot-topics`;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function handleAINews(): Promise<Response> {
  const startTime = Date.now();
  try {
    const apiResponse = await fetch(AI_NEWS_URL, { signal: AbortSignal.timeout(10_000) });
    if (!apiResponse.ok) {
      throw new Error(`AI HOT items fetch failed: ${apiResponse.status}`);
    }

    const payload: unknown = await apiResponse.json();
    const articles = parseAINews(payload);
    const elapsed = Date.now() - startTime;

    console.log(`AI news completed in ${elapsed}ms, ${articles.length} items`);
    return new Response(JSON.stringify(articles), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, max-age=60",
        "X-Response-Time": String(elapsed),
      },
    });
  } catch (error: unknown) {
    console.error("News fetch error:", getErrorMessage(error));
    return new Response(JSON.stringify({ error: "Failed to fetch news" }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}

async function handleAIHotTopics(): Promise<Response> {
  const startTime = Date.now();
  try {
    const apiResponse = await fetch(AI_HOT_TOPICS_URL, { signal: AbortSignal.timeout(10_000) });
    if (!apiResponse.ok) {
      throw new Error(`AI HOT hot-topics fetch failed: ${apiResponse.status}`);
    }

    const payload: unknown = await apiResponse.json();
    const topics = parseAIHotTopics(payload);
    const elapsed = Date.now() - startTime;

    console.log(`AI hot topics completed in ${elapsed}ms, ${topics.length} items`);
    return new Response(JSON.stringify(topics), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, max-age=300",
        "X-Response-Time": String(elapsed),
      },
    });
  } catch (error: unknown) {
    console.error("AI hot topics fetch error:", getErrorMessage(error));
    return new Response(JSON.stringify({ error: "Failed to fetch hot topics" }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}

async function handleLexoraExplain(request: Request, env: Record<string, string>): Promise<Response> {
  const apiKey = env.DEEPSEEK_API_KEY || (typeof process !== "undefined" ? process.env.DEEPSEEK_API_KEY : "");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY environment variable is not configured on EdgeOne." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  let body: ReturnType<typeof parseExplainInput>;
  try {
    body = parseExplainInput(await request.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const { query } = body;

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
      signal: AbortSignal.timeout(25_000),
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
      throw new Error(`Upstream returned ${response.status}`);
    }

    const data = await response.json();
    const parsed = parseConcept(JSON.parse(completionText(data)));

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Lexora explain request failed");
    return new Response(JSON.stringify({ error: "Upstream request failed. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}

async function handleLexoraTutor(request: Request, env: Record<string, string>): Promise<Response> {
  const apiKey = env.DEEPSEEK_API_KEY || (typeof process !== "undefined" ? process.env.DEEPSEEK_API_KEY : "");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY environment variable is not configured on EdgeOne." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  let body: ReturnType<typeof parseTutorInput>;
  try {
    body = parseTutorInput(await request.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const { conceptEnglish, conceptChinese, conciseDefinition, question } = body;

  const systemPrompt = `You are Lexora AI Tutor, a patient, clear, and encouraging professional AI tutor.
The user is currently studying the concept: "${conceptEnglish || ''} (${conceptChinese || ''})".
Context definition: "${conciseDefinition || ''}".
Answer the user's follow-up question or request in clear, friendly, and structured Markdown (in Chinese). Use bullet points, bold text, or code/math blocks where helpful. Keep the answer focused on helping the user master this concept.`;

  const model = env.DEEPSEEK_MODEL || (typeof process !== "undefined" ? process.env.DEEPSEEK_MODEL : "") || "deepseek-chat";

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(25_000),
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
      throw new Error(`Upstream returned ${response.status}`);
    }

    const data = await response.json();
    const answer = completionText(data);

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Lexora tutor request failed");
    return new Response(JSON.stringify({ error: "Upstream request failed. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}

async function handleBlogs(env: Record<string, string>): Promise<Response> {
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || (typeof process !== "undefined" ? (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) : "");
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || (typeof process !== "undefined" ? (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) : "");

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: "Supabase credentials are not configured on server." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/blogs?select=*`;
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase REST error: ${res.status}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, max-age=60",
      },
    });
  } catch (error: unknown) {
    console.error("Supabase blogs proxy error:", getErrorMessage(error));
    return new Response(JSON.stringify({ error: "Upstream request failed. Please try again." }), {
      status: 502,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}

export async function onRequest(context: {
  request: Request;
  env: Record<string, string>;
  params: Record<string, string>;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const methods: Record<string, string> = {
    '/api/neuro-feed': 'GET', '/api/ai-news': 'GET', '/api/ai-hot-topics': 'GET', '/api/blogs': 'GET',
    '/api/lexora/explain': 'POST', '/api/lexora/tutor': 'POST', '/api/content-studio/generate': 'POST',
  };
  const allowed = methods[url.pathname];
  if (allowed && context.request.method !== allowed) {
    if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { Allow: `${allowed}, OPTIONS`, 'Access-Control-Allow-Methods': `${allowed}, OPTIONS`, 'Access-Control-Allow-Headers': 'Content-Type' } });
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: `${allowed}, OPTIONS` } });
  }

  if (url.pathname === "/api/neuro-feed" && context.request.method === "GET") {
    try {
      const feed = await loadNeuroFeed(context.env);
      const healthy = feed.sources.every((source) => source.status === "ready" || source.status === "unconfigured");
      return new Response(JSON.stringify(feed), { headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": healthy ? "public, s-maxage=300, max-age=60" : "no-store",
      } });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to fetch neuro feed" }), {
        status: 502, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
  }
  if (url.pathname === "/api/ai-news") return handleAINews();
  if (url.pathname === "/api/ai-hot-topics") return handleAIHotTopics();
  if (url.pathname === "/api/blogs") return handleBlogs(context.env);
  if (url.pathname === "/api/lexora/explain" && context.request.method === "POST") {
    return handleLexoraExplain(context.request, context.env);
  }
  if (url.pathname === "/api/lexora/tutor" && context.request.method === "POST") {
    return handleLexoraTutor(context.request, context.env);
  }
  if (url.pathname === "/api/content-studio/generate" && context.request.method === "POST") {
    return new Response(JSON.stringify({ error: "Content Studio 已迁移至独立服务。" }), {
      status: 410,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new Response(JSON.stringify({ error: `Not found: ${url.pathname}` }), {
    status: 404,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
