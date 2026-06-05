import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('./shiyun-wechat-converter.html', 'utf8');

assert.doesNotMatch(html, /import\s+\{[^}]+convertMarkdownToWechatHtml/);
assert.match(html, /function convertMarkdownToWechatHtml/);
assert.match(html, /id="markdownInput"/);
assert.match(html, /id="preview"/);

const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'inline script should exist');
new Function(script);

const elements = {
  '#markdownInput': {
    value: '',
    addEventListener() {},
  },
  '#preview': {
    innerHTML: '',
    innerText: '',
  },
  '#htmlOutput': {
    value: '',
    focus() {},
    select() {},
  },
  '#toast': {
    textContent: '',
    classList: {
      add() {},
      remove() {},
    },
  },
  '#sampleBtn': {
    addEventListener() {},
  },
  '#copyHtmlBtn': {
    addEventListener() {},
  },
  '#copyRichBtn': {
    addEventListener() {},
  },
};

const documentStub = {
  querySelector(selector) {
    return elements[selector];
  },
  createRange() {
    return { selectNodeContents() {} };
  },
  execCommand() {
    return true;
  },
};

const windowStub = {
  isSecureContext: false,
  getSelection() {
    return {
      removeAllRanges() {},
      addRange() {},
    };
  },
};

new Function('document', 'window', 'navigator', 'setTimeout', 'console', script)(
  documentStub,
  windowStub,
  {},
  () => {},
  console,
);

assert.match(elements['#preview'].innerHTML, /<section/);
assert.ok(elements['#preview'].innerHTML.length > 100, 'preview should render initial content');
