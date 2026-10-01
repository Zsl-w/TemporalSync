import { parseNeuroFeedResponse, type NeuroFeedResponse } from "../../shared/neuro-feed";

const CACHE_TTL = 5 * 60 * 1000;
let cached: { data: NeuroFeedResponse; expiresAt: number } | null = null;
let pending: Promise<NeuroFeedResponse> | null = null;

export function fetchNeuroFeed(refresh = false): Promise<NeuroFeedResponse> {
  if (!refresh && cached && Date.now() < cached.expiresAt) return Promise.resolve(cached.data);
  if (!pending) {
    pending = fetch("/api/neuro-feed", { cache: refresh ? "no-cache" : "default", signal: AbortSignal.timeout(20_000) })
      .then(async (response) => {
        if (!response.ok) throw new Error("Neuro feed unavailable");
        const payload: unknown = await response.json();
        const data = parseNeuroFeedResponse(payload);
        const healthy = data.sources.every((source) => source.status === "ready" || source.status === "unconfigured");
        cached = healthy ? { data, expiresAt: Date.now() + CACHE_TTL } : null;
        return data;
      }).finally(() => { pending = null; });
  }
  return pending;
}
