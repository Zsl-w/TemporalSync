import "dotenv/config";
import axios from "axios";
import express from "express";
import path from "path";
import Parser from "rss-parser";
import { createServer as createViteServer } from "vite";
import {
  createEnrichedArticle,
  sortArticlesNewestFirst,
  type FeedItem,
} from "./shared/ai-news";

const parser = new Parser();
const FEED_URL = "https://aihot.virxact.com/feed.xml";
const FEED_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json());

  app.get("/api/ai-news", async (_request, response) => {
    const startTime = Date.now();
    try {
      const feedResponse = await axios.get<string>(FEED_URL, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
          "User-Agent": FEED_USER_AGENT,
        },
        timeout: 10_000,
      });
      const feed = await parser.parseString(feedResponse.data);
      const articles = sortArticlesNewestFirst(
        feed.items.map((item) => createEnrichedArticle(item as FeedItem)),
      );

      console.log(`AI news completed in ${Date.now() - startTime}ms, ${articles.length} items`);
      response.json(articles);
    } catch (error: unknown) {
      console.error("Failed to fetch AI news:", getErrorMessage(error));
      response.status(502).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/lexora/explain", async (request, response) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return response.status(500).json({ error: "本地 .env 文件中未配置 DEEPSEEK_API_KEY。" });
    }

    const { query } = request.body || {};
    if (!query || typeof query !== "string") {
      return response.status(400).json({ error: "缺少 query 参数" });
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

    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    try {
      const res = await axios.post(
        "https://api.deepseek.com/chat/completions",
        {
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Please explain the concept: "${query}"` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 30_000,
        }
      );

      const resultText = res.data?.choices?.[0]?.message?.content;
      const parsed = typeof resultText === "string" ? JSON.parse(resultText) : resultText;
      response.json(parsed);
    } catch (error: unknown) {
      console.error("Lexora local explain error:", getErrorMessage(error));
      response.status(500).json({ error: getErrorMessage(error) });
    }
  });

  app.post("/api/lexora/tutor", async (request, response) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return response.status(500).json({ error: "本地 .env 文件中未配置 DEEPSEEK_API_KEY。" });
    }

    const { conceptEnglish, conceptChinese, conciseDefinition, question } = request.body || {};
    if (!question || typeof question !== "string") {
      return response.status(400).json({ error: "缺少 question 参数" });
    }

    const systemPrompt = `You are Lexora AI Tutor, a patient, clear, and encouraging professional AI tutor.
The user is currently studying the concept: "${conceptEnglish || ''} (${conceptChinese || ''})".
Context definition: "${conciseDefinition || ''}".
Answer the user's follow-up question or request in clear, friendly, and structured Markdown (in Chinese). Use bullet points, bold text, or code/math blocks where helpful. Keep the answer focused on helping the user master this concept.`;

    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    try {
      const res = await axios.post(
        "https://api.deepseek.com/chat/completions",
        {
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          temperature: 0.5
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 30_000,
        }
      );

      const answer = res.data?.choices?.[0]?.message?.content || "";
      response.json({ answer });
    } catch (error: unknown) {
      console.error("Lexora local tutor error:", getErrorMessage(error));
      response.status(500).json({ error: getErrorMessage(error) });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      define: {
        "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID || ""),
      },
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_request, response) => {
      response.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

void startServer();
