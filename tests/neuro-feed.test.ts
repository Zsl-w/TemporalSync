import assert from "node:assert/strict";
import test from "node:test";
import { buildPaperSearchUrl, createNeuroFeedLoader, normalizePapers, normalizeWechat, plainText } from "../shared/neuro-feed-server";
import { parseNeuroFeedResponse } from "../shared/neuro-feed";

const paper = {
  id: "123", source: "MED", title: "MRI and machine learning in depression",
  firstPublicationDate: "2026-09-30", doi: "10.1234/test",
  journalInfo: { journal: { title: "Test journal" } },
  abstractText: "<h4>Background</h4>A &amp; B <script>alert(1)</script>study.",
};
const paperResponse = (records: unknown[] = [paper]) => Response.json({ resultList: { result: records } });

test("paper query requires disease, imaging and AI, with a rolling window in Shanghai time", () => {
  const url = new URL(buildPaperSearchUrl(new Date("2026-09-30T16:05:00Z")));
  const query = url.searchParams.get("query")!;
  assert.match(query, /FIRST_PDATE:\[2026-07-03 TO 2026-10-01\]/);
  for (const term of ["depression", "alzheimer", "parkinson", "bipolar", "MRI", "PET", "fNIRS", "machine learning", "deep learning"]) {
    assert.ok(query.includes(term), term);
  }
  assert.equal(url.searchParams.get("resultType"), "core");
  assert.match(query, /\) AND \(/);
});

test("normalizes and deduplicates real metadata, distinguishing preprints and rejecting missing dates", () => {
  const items = normalizePapers({ resultList: { result: [paper,
    { ...paper, id: "PMC123", source: "PMC" },
    { ...paper, id: "PPR1", source: "PPR", doi: undefined, journalInfo: undefined, firstPublicationDate: "2026-10-01" },
    { ...paper, id: "missing-date", firstPublicationDate: undefined },
    { ...paper, id: "invalid-date", firstPublicationDate: "2026-02-31" }, null,
  ] } });
  assert.equal(items.length, 2);
  assert.equal(items[0].preprint, true);
  assert.equal(items[0].source, "Preprint");
  assert.equal(items[1].source, "Test journal");
  assert.equal(items[1].summary, "Background A & B study.");
  assert.equal(items[1].link, "https://doi.org/10.1234/test");
  assert.equal(plainText("&#999999999; &lt;hello&gt;"), "<hello>");
  assert.throws(() => normalizePapers({ error: "upstream changed" }));
});

test("WeChat articles require original links and publication dates, and discard tracking duplicates", () => {
  const valid = { title: "公众号文章", link: "https://mp.weixin.qq.com/s/example?scene=27", isoDate: "2026-09-30T08:00:00Z" };
  const items = normalizeWechat([valid, { ...valid, link: "https://mp.weixin.qq.com/s/example?scene=23" },
    { ...valid, link: "javascript:alert(1)" }, { ...valid, link: "https://example.com/post" },
    { ...valid, isoDate: undefined }, { ...valid, title: "" }, null], "精神影像学");
  assert.equal(items.length, 1);
  assert.equal(items[0].link, "https://mp.weixin.qq.com/s/example");
  assert.equal(items[0].source, "精神影像学");
  assert.equal(items[0].summary, "");
});

test("unconfigured WeChat sources stay explicit; concurrent loads share one request and refresh next day", async () => {
  let calls = 0;
  let now = new Date("2026-09-30T15:50:00Z");
  const loader = createNeuroFeedLoader(async () => { calls += 1; return paperResponse(); }, () => now);
  const [first, concurrent] = await Promise.all([loader(), loader()]);
  assert.equal(calls, 1);
  assert.equal(first.items.length, 1);
  assert.deepEqual(first, concurrent);
  assert.equal(first.sources.filter((source) => source.status === "unconfigured").length, 4);
  assert.deepEqual(parseNeuroFeedResponse(first), first);
  now = new Date("2026-09-30T16:05:00Z");
  await loader();
  assert.equal(calls, 2, "Shanghai midnight invalidates yesterday's cache");
  await loader();
  assert.equal(calls, 2, "fresh cache avoids repeated upstream requests");
  now = new Date("2026-09-30T17:06:00Z");
  await loader();
  assert.equal(calls, 3, "hourly expiry fetches upstream again");
});

test("failed paper source does not prevent configured RSS articles from loading", async () => {
  const rss = '<rss version="2.0"><channel><title>Example</title><item><title>New article</title><link>https://mp.weixin.qq.com/s/example</link><pubDate>Wed, 30 Sep 2026 08:00:00 GMT</pubDate></item></channel></rss>';
  const loader = createNeuroFeedLoader(async (input) => String(input).startsWith("https://www.ebi.ac.uk")
    ? new Response("Unavailable", { status: 503 }) : new Response(rss), () => new Date("2026-10-01T02:00:00Z"));
  const result = await loader({ NEURO_WECHAT_FEEDS: JSON.stringify({ "psycho-imaging": "https://feeds.example.com/psycho.xml" }) });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].kind, "wechat");
  assert.equal(result.sources[0].status, "error");
  assert.equal(result.sources[1].status, "ready");
  assert.deepEqual(parseNeuroFeedResponse(result), result);
});

test("expired content is marked stale on failure and is dropped after seven days", async () => {
  let now = new Date("2026-10-01T02:00:00Z");
  let fail = false;
  const loader = createNeuroFeedLoader(async () => { if (fail) throw new Error("network failure"); return paperResponse(); }, () => now);
  const first = await loader();
  fail = true;
  now = new Date("2026-10-01T04:00:00Z");
  const stale = await loader();
  assert.equal(stale.sources[0].status, "stale");
  assert.equal(stale.sources[0].updatedAt, first.sources[0].updatedAt);
  assert.equal(stale.items.length, 1);
  now = new Date("2026-10-09T04:00:00Z");
  const expired = await loader();
  assert.equal(expired.sources[0].status, "error");
  assert.equal(expired.items.length, 0);
});

test("malformed configuration and RSS cannot masquerade as connected sources", async () => {
  let calls = 0;
  const loader = createNeuroFeedLoader(async () => { calls += 1; return paperResponse(); }, () => new Date("2026-10-01T02:00:00Z"));
  const malformed = await loader({ NEURO_WECHAT_FEEDS: "{broken" });
  assert.equal(malformed.sources.filter((source) => source.kind === "wechat" && source.status === "error").length, 4);
  const unsafe = await loader({ NEURO_WECHAT_FEEDS: JSON.stringify({ neuroai: "javascript:alert(1)" }) });
  assert.equal(unsafe.sources.find((source) => source.id === "neuroai")?.status, "error");
  assert.equal(calls, 1, "invalid feed URLs are never requested");
  const badRssLoader = createNeuroFeedLoader(async (input) => String(input).includes("ebi.ac.uk") ? paperResponse() : new Response("<!DOCTYPE rss><rss/>"), () => new Date("2026-10-01T02:00:00Z"));
  const badRss = await badRssLoader({ NEURO_WECHAT_FEEDS: JSON.stringify({ neuroai: "https://feeds.example.com/neuroai.xml" }) });
  assert.equal(badRss.sources.find((source) => source.id === "neuroai")?.status, "error");
});

test("recent feed excludes future and out-of-window publication dates and rejects unsafe API payloads", async () => {
  const loader = createNeuroFeedLoader(async () => paperResponse([paper,
    { ...paper, id: "future", doi: "10.1234/future", firstPublicationDate: "2026-10-02" },
    { ...paper, id: "old", doi: "10.1234/old", firstPublicationDate: "2026-01-01" },
  ]), () => new Date("2026-10-01T02:00:00Z"));
  const result = await loader();
  assert.equal(result.items.length, 1);
  assert.throws(() => parseNeuroFeedResponse({ ...result, items: [{ ...result.items[0], link: "javascript:alert(1)" }] }));
  assert.throws(() => parseNeuroFeedResponse({ ...result, sources: [{ ...result.sources[0], status: "connected" }] }));
});

test('timestamped articles use Shanghai date boundaries, excluding tomorrow before UTC midnight', async () => {
  const rss = '<rss version="2.0"><channel><title>Example</title><item><title>Tomorrow</title><link>https://mp.weixin.qq.com/s/tomorrow</link><pubDate>Thu, 01 Oct 2026 17:00:00 GMT</pubDate></item></channel></rss>';
  const loader = createNeuroFeedLoader(async (input) => String(input).includes('ebi.ac.uk') ? paperResponse() : new Response(rss), () => new Date('2026-10-01T14:00:00Z'));
  const result = await loader({ NEURO_WECHAT_FEEDS: JSON.stringify({ neuroai: 'https://feeds.example.com/feed.xml' }) });
  assert.equal(result.sources.at(-1)?.status, 'ready');
  assert.equal(result.items.some((item) => item.kind === 'wechat'), false);
});
