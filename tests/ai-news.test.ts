import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createHotTopicItem,
  createNewsItem,
  getAvatarUrl,
  sortNewestFirst,
} from '../shared/ai-news';

test('normalizes an AI HOT item for the timeline', () => {
  const article = createNewsItem({
    id: 'item-1',
    title: 'New 编码智能体模型',
    originalTitle: 'New coding agent model',
    summary: 'A model for agent coding workflows.',
    source: { name: 'Lab' },
    links: { aihot: 'https://aihot.virxact.com/items/item-1', original: 'https://github.com/example/project' },
    publishedAt: '2026-07-15T10:00:00.000Z',
    discoveredAt: '2026-07-15T11:00:00.000Z',
    category: 'ai-models',
    score: 80,
    selected: true,
  });

  assert.equal(article.category, 'ai-models');
  assert.equal(article.source, 'Lab');
  assert.equal(article.avatar, 'https://unavatar.io/github/example?fallback=false');
});

test('uses a title fallback, truncates summaries, and normalizes hot topics', () => {
  const fallback = createNewsItem({
    id: 'fallback', title: 'Fallback', originalTitle: null, summary: null, source: { name: 'AI HOT' },
    links: { aihot: 'https://aihot.virxact.com/items/fallback', original: 'https://example.com/fallback' },
    publishedAt: null, discoveredAt: '2026-07-15T10:00:00.000Z', category: null, score: null, selected: true,
  });
  assert.equal(fallback.summary, 'Fallback');
  assert.equal(createNewsItem({ ...fallback, source: { name: 'AI HOT' }, links: { aihot: 'https://aihot.virxact.com/items/long', original: 'https://example.com/long' }, summary: 'x'.repeat(201), originalTitle: null, title: 'Long', id: 'long', publishedAt: null, discoveredAt: '2026-07-15T10:00:00.000Z', category: 'industry', score: null, selected: true }).summary.length, 203);

  const topic = createHotTopicItem({
    id: 'topic-1', title: 'A shared AI event', source: { name: 'Source A' },
    links: { aihot: 'https://aihot.virxact.com/topics/topic-1', original: 'https://example.com/story' },
    sourceCount: 3, signalCount: 6, sourceNames: ['Source A', 'Source B', 'Source C'], latestAt: '2026-07-16T10:00:00.000Z',
  });
  assert.equal(topic.sourceCount, 3);
  assert.equal(topic.link, 'https://example.com/story');
});

test('sorts newest articles first and rejects unsafe avatar inputs', () => {
  assert.deepEqual(sortNewestFirst([{ title: 'Old', time: '2025-01-01' }, { title: 'New', time: '2026-01-01' }]).map(({ title }) => title), ['New', 'Old']);
  assert.equal(getAvatarUrl('Unknown', 'javascript:alert(1)'), undefined);
});
