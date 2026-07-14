import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { hasAdminRole } from '../src/lib/auth';
import { parseStoredPosts } from '../src/lib/blogPosts';

test('accepts only the server-controlled admin role', () => {
  assert.equal(hasAdminRole({ app_metadata: { role: 'admin' } }), true);
  assert.equal(hasAdminRole({ app_metadata: { role: 'editor' } }), false);
  assert.equal(hasAdminRole({ app_metadata: {}, user_metadata: { role: 'admin' } } as never), false);
  assert.equal(hasAdminRole(null), false);
});

test('all Markdown rendering boundaries retain DOMPurify sanitation', async () => {
  const files = ['src/pages/Admin.tsx', 'src/pages/Blog.tsx', 'src/pages/Md2Red.tsx'];
  for (const file of files) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /DOMPurify\.sanitize\(/, `${file} must sanitize rendered Markdown`);
  }
});

test('rejects malformed local blog storage at the browser trust boundary', () => {
  assert.deepEqual(parseStoredPosts('{invalid'), []);
  assert.deepEqual(parseStoredPosts(JSON.stringify([{ title: 'Missing id' }, null])), []);
  assert.equal(parseStoredPosts(JSON.stringify([{ id: '1', title: 'Valid' }]))[0]?.title, 'Valid');
});
