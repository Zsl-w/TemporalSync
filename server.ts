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
