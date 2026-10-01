import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequest } from '../node-functions/api/[[default]]';
import { parseAINews, parseAIHotTopics, parseNewsCards } from '../shared/ai-news';
import { parseExplainInput, parseTutorInput, parseConcept } from '../shared/lexora-validation';
import { fetchNews, getCachedNews } from '../src/services/newsService';

const item = { id: '1', title: 'Title', summary: 'Summary', source: { name: 'Lab' }, links: { original: 'https://example.com/article', aihot: 'https://example.com/1' }, discoveredAt: '2026-10-01T00:00:00Z' };

test('invalid upstream records cannot break cards or introduce executable links', () => {
  const cards = parseAINews({ items: [null, { ...item, links: { original: 'javascript:alert(1)', aihot: '' } }, item] });
  assert.equal(cards.length, 1);
  assert.deepEqual(parseNewsCards(cards), cards);
  assert.throws(() => parseAINews({ items: [{ ...item, discoveredAt: 'bad date' }] }));
  assert.throws(() => parseNewsCards([{ ...cards[0], summary: null }]));
  assert.throws(() => parseAIHotTopics({ items: [{ ...item, latestAt: item.discoveredAt, sourceNames: ['Lab'], sourceCount: -1, signalCount: 2 }] }));
});

test('Lexora validates input types, limits and model output before rendering', () => {
  for (const value of [null, [], { query: 123 }, { query: ' ' }, { query: 'x'.repeat(2001) }]) assert.throws(() => parseExplainInput(value));
  assert.equal(parseExplainInput({ query: '  MRI  ' }).query, 'MRI');
  assert.throws(() => parseTutorInput({ question: 'What?', conceptEnglish: {} }));
  assert.throws(() => parseConcept({ id: 'bad', deepExplanation: null }));
});

test('Node entry rejects wrong methods and malformed bodies without upstream requests', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error('Must not call upstream'); };
  try {
    for (const [path, method, body, expected] of [
      ['/api/ai-news', 'POST', '{}', 405], ['/api/neuro-feed', 'OPTIONS', undefined, 204],
      ['/api/lexora/explain', 'POST', 'null', 400], ['/api/lexora/explain', 'POST', '{"query":123}', 400],
      ['/api/lexora/tutor', 'POST', '{"question":[]}', 400], ['/api/unknown', 'GET', undefined, 404],
    ] as const) {
      const response = await onRequest({ request: new Request(`https://example.com${path}`, { method, body }), env: { DEEPSEEK_API_KEY: 'test-only' }, params: {} });
      assert.equal(response.status, expected, path);
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('Node entry validates AI HOT JSON and supplies an upstream timeout', async () => {
  const originalFetch = globalThis.fetch;
  let broken = false;
  globalThis.fetch = async (_url, init) => {
    assert.ok(init?.signal);
    return Response.json(broken ? { items: [{ ...item, title: null }] } : { items: [item] });
  };
  try {
    const context = { request: new Request('https://example.com/api/ai-news'), env: {}, params: {} };
    const good = await onRequest(context);
    assert.equal(good.status, 200);
    assert.equal((await good.json()).length, 1);
    broken = true;
    assert.equal((await onRequest(context)).status, 502);
  } finally { globalThis.fetch = originalFetch; }
});

test('Timeline cache expires and concurrent reloads share one request', async () => {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = originalNow();
  let calls = 0;
  Date.now = () => now;
  globalThis.fetch = async () => { calls += 1; return Response.json(parseAINews({ items: [item] })); };
  try {
    await Promise.all([fetchNews(), fetchNews()]);
    assert.equal(calls, 1);
    assert.ok(getCachedNews());
    now += 5 * 60 * 1000 + 1;
    assert.equal(getCachedNews(), null);
    await fetchNews();
    assert.equal(calls, 2);
  } finally { globalThis.fetch = originalFetch; Date.now = originalNow; }
});
