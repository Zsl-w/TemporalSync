import assert from 'node:assert/strict';
import test from 'node:test';
import { parseFrontmatter, parseMarkdownFile } from '../src/lib/frontmatter';

test('parses the supported frontmatter subset', () => {
  const result = parseFrontmatter(`---
title: "A quoted title"
published: true
priority: 2
tags: [AI, "medical data"]
---
# Body`);

  assert.deepEqual(result.data, {
    title: 'A quoted title',
    published: true,
    priority: 2,
    tags: ['AI', 'medical data'],
  });
  assert.equal(result.content, '# Body');
});

test('preserves malformed frontmatter and falls back to filename metadata', () => {
  const raw = '---\ntitle: Unclosed\n# Body';
  assert.deepEqual(parseFrontmatter(raw), { data: {}, content: raw });

  const parsed = parseMarkdownFile('fallback.md', 'Plain body content');
  assert.equal(parsed.title, 'fallback');
  assert.equal(parsed.summary, 'Plain body content');
});

test('uses heading, description and comma-separated keywords fallbacks', () => {
  const parsed = parseMarkdownFile('ignored.md', `---
description: Summary
keywords: AI, Medicine
---
# Heading
Content`);

  assert.equal(parsed.title, 'Heading');
  assert.equal(parsed.summary, 'Summary');
  assert.deepEqual(parsed.tags, ['AI', 'Medicine']);
  assert.equal(parsed.content, 'Content');
});
