import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createEnrichedArticle,
  getAvatarUrl,
  sortArticlesNewestFirst,
} from '../shared/ai-news';

test('normalizes a feed item and applies deterministic fallback enrichment', () => {
  const article = createEnrichedArticle({
    title: 'New 编码智能体模型',
    link: 'https://github.com/example/project',
    author: 'Example (Lab)',
    contentSnippet: 'A model for agent coding workflows.',
    pubDate: '2026-07-15T10:00:00.000Z',
  });

  assert.equal(article.category, '模型');
  assert.deepEqual(article.tags, ['智能体', '编码']);
  assert.equal(article.source, 'Lab');
  assert.equal(article.avatar, 'https://unavatar.io/github/example?fallback=false');
});

test('uses the title for empty summaries and truncates long summaries', () => {
  assert.equal(createEnrichedArticle({ title: 'Fallback', description: '...' }).summary, 'Fallback');
  assert.equal(createEnrichedArticle({ title: 'Long', description: 'x'.repeat(201) }).summary.length, 203);
});

test('sorts newest articles first and rejects unsafe avatar inputs', () => {
  const oldArticle = createEnrichedArticle({ title: 'Old', pubDate: '2025-01-01' });
  const newArticle = createEnrichedArticle({ title: 'New', pubDate: '2026-01-01' });
  assert.deepEqual(sortArticlesNewestFirst([oldArticle, newArticle]).map(({ title }) => title), ['New', 'Old']);
  assert.equal(getAvatarUrl('Unknown', 'javascript:alert(1)'), undefined);
});
