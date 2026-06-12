const colors = {
  ink: '#24302f',
  title: '#223030',
  body: '#4f5b58',
  muted: '#7a817b',
  green: '#7f9b75',
  greenText: '#3f583f',
  greenSoft: '#edf4e7',
  paper: '#fffdf8',
  blueText: '#426475',
  blueSoft: '#e7f0f4',
  warmSoft: '#fffaf2',
  border: '#eee6d6',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function smartJoinLines(lines) {
  if (lines.length === 0) return '';
  let result = lines[0];
  const cjkRegex = /[\u4e00-\u9fa5\u3040-\u30ff\u3400-\u4dbf\uf900-\ufaff\uff00-\uffef]/;
  for (let i = 1; i < lines.length; i++) {
    const prev = result.trimEnd();
    const curr = lines[i].trimStart();
    if (prev === '' || curr === '') {
      result += curr;
      continue;
    }
    const lastChar = prev[prev.length - 1];
    const firstChar = curr[0];
    if (cjkRegex.test(lastChar) || cjkRegex.test(firstChar)) {
      result = prev + curr;
    } else {
      result = prev + ' ' + curr;
    }
  }
  return result;
}

function inlineMarkdown(value) {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, `<code style="padding:2px 5px;border-radius:4px;background:#eef3ee;color:${colors.greenText};font-size:13px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;">$1</code>`);
  text = text.replace(/\*\*([^*]+)\*\*/g, `<strong style="padding:1px 4px;border-radius:4px;background:${colors.greenSoft};color:${colors.greenText};font-weight:800;">$1</strong>`);
  return text;
}

function paragraph(text) {
  return `<p style="margin:0 0 16px;color:${colors.body};font-size:15px;line-height:1.95;text-align:left;">${inlineMarkdown(text)}</p>`;
}

function h1(text) {
  return `<h1 style="margin:0 0 12px;color:${colors.title};font-size:26px;line-height:1.35;font-weight:800;letter-spacing:0;">${inlineMarkdown(text)}</h1>`;
}

function h2(text) {
  const match = text.match(/^(\d{1,2})[\s.、-]+(.+)$/);
  const no = match ? match[1].padStart(2, '0') : '';
  const title = match ? match[2] : text;
  if (no) {
    return `<section style="margin:30px 0 14px;"><p style="margin:0;color:${colors.ink};font-size:19px;line-height:1.6;font-weight:800;"><span style="display:inline-block;width:34px;height:34px;margin-right:8px;border-radius:50%;background:${colors.blueSoft};color:${colors.blueText};text-align:center;line-height:34px;font-family:Georgia,serif;font-size:16px;font-weight:800;">${no}</span>${inlineMarkdown(title)}</p></section>`;
  }
  return `<p style="margin:28px 0 12px;color:${colors.blueText};font-size:17px;line-height:1.7;font-weight:800;">${inlineMarkdown(text)}</p>`;
}

function h3(text) {
  return `<p style="margin:24px 0 10px;color:${colors.blueText};font-size:16px;line-height:1.7;font-weight:800;">${inlineMarkdown(text)}</p>`;
}

function h4(text) {
  return `<p style="margin:20px 0 8px;color:${colors.greenText};font-size:15px;line-height:1.7;font-weight:800;"><span style="display:inline-block;width:6px;height:6px;margin-right:7px;border-radius:50%;background:${colors.green};vertical-align:middle;"></span>${inlineMarkdown(text)}</p>`;
}

function image(alt, src) {
  const safeAlt = escapeHtml(alt || '图片');
  const safeSrc = escapeHtml(src);
  return `<section style="margin:22px 0;text-align:center;"><img src="${safeSrc}" alt="${safeAlt}" style="display:block;width:100%;max-width:100%;height:auto;border-radius:8px;border:1px solid ${colors.border};"></section>`;
}

function quote(lines) {
  const content = inlineMarkdown(smartJoinLines(lines));
  return `<section style="margin:0 0 24px;padding:14px 15px;border-left:4px solid ${colors.green};background:#f5f8f0;border-radius:0 8px 8px 0;"><p style="margin:0;color:#475547;font-size:15px;line-height:1.85;text-align:left;">${content}</p></section>`;
}

function codeBlock(code, lang = '') {
  const label = lang ? `示例代码 · ${escapeHtml(lang)}` : '示例代码';
  const formattedCode = escapeHtml(code.trimEnd())
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    .replace(/ /g, '&nbsp;')
    .replace(/\n/g, '<br>');
  return `<section style="margin:0 0 22px;border:1px solid #dfe5d7;background:#f6f8f2;border-radius:8px;overflow:hidden;"><section style="padding:8px 12px;background:#e9f0e4;border-bottom:1px solid #dfe5d7;"><p style="margin:0;color:#587052;font-size:13px;font-weight:800;line-height:1.6;">${label}</p></section><section style="padding:14px 15px;"><p style="margin:0;color:#40504a;font-size:13px;line-height:1.8;font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;white-space:pre-wrap;text-align:left;">${formattedCode}</p></section></section>`;
}

function list(items) {
  return `<section style="margin:20px 0;padding:14px 15px;border:1px solid #e9e0d0;background:${colors.warmSoft};border-radius:8px;">${items.map(item => `<p style="margin:6px 0;color:#5f6964;font-size:15px;line-height:1.85;text-align:left;">· ${inlineMarkdown(item)}</p>`).join('')}</section>`;
}

function table(lines) {
  const rows = lines
    .map(line => line.trim())
    .filter(line => line.startsWith('|'))
    .map(line => line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()))
    .filter(cells => !cells.every(cell => /^:?-{3,}:?$/.test(cell)));
  if (!rows.length) return '';
  const [head, ...body] = rows;
  const headHtml = head.map(cell => `<th style="padding:11px 10px;background:${colors.blueSoft};color:${colors.blueText};font-size:14px;line-height:1.6;text-align:left;font-weight:800;border-bottom:1px solid #d8e5ea;">${inlineMarkdown(cell)}</th>`).join('');
  const bodyHtml = body.map((row, rowIndex) => {
    const isLast = rowIndex === body.length - 1;
    return `<tr>${row.map((cell, cellIndex) => `<td style="padding:11px 10px;color:${cellIndex === 0 ? colors.ink : '#5f6964'};font-size:14px;line-height:1.75;${cellIndex === 0 ? 'font-weight:700;' : ''}${isLast ? '' : `border-bottom:1px solid ${colors.border};`}">${inlineMarkdown(cell)}</td>`).join('')}</tr>`;
  }).join('');
  return `<section style="margin:24px 0;"><table style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e4ddd0;border-radius:8px;overflow:hidden;background:${colors.paper};"><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></section>`;
}

function hr() {
  return `<section style="margin:30px 0;text-align:center;"><span style="display:inline-block;width:96px;height:1px;background:#d9d2c4;vertical-align:middle;line-height:0;font-size:0;overflow:hidden;">&nbsp;</span></section>`;
}

function wrapDocument(content) {
  return `<section style="max-width:720px;margin:0 auto;padding:28px 24px 56px;background:${colors.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;color:${colors.ink};">${content}</section>`;
}

export function convertMarkdownToWechatHtml(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const output = [];
  let paragraphLines = [];
  let quoteLines = [];
  let listItems = [];

  function flushParagraph() {
    if (paragraphLines.length) {
      output.push(paragraph(smartJoinLines(paragraphLines)));
      paragraphLines = [];
    }
  }

  function flushQuote() {
    if (quoteLines.length) {
      output.push(quote(quoteLines));
      quoteLines = [];
    }
  }

  function flushList() {
    if (listItems.length) {
      output.push(list(listItems));
      listItems = [];
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      flushParagraph();
      flushQuote();
      flushList();
      continue;
    }

    if (/^---+\s*$/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      flushList();
      output.push(hr());
      continue;
    }

    const fence = trimmed.match(/^```(\w+)?/);
    if (fence) {
      flushParagraph();
      flushQuote();
      flushList();
      const lang = fence[1] || '';
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      output.push(codeBlock(codeLines.join('\n'), lang));
      continue;
    }

    if (trimmed.startsWith('|')) {
      flushParagraph();
      flushQuote();
      flushList();
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      i -= 1;
      output.push(table(tableLines));
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      quoteLines.push(trimmed.replace(/^>\s?/, ''));
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      flushQuote();
      listItems.push(listMatch[1]);
      continue;
    }

    flushQuote();
    flushList();

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      output.push(h1(trimmed.slice(2).trim()));
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      output.push(h2(trimmed.slice(3).trim()));
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      output.push(h3(trimmed.slice(4).trim()));
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushParagraph();
      output.push(h4(trimmed.slice(5).trim()));
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      output.push(image(imageMatch[1], imageMatch[2]));
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushQuote();
  flushList();

  return wrapDocument(output.join('\n'));
}

export function getExampleMarkdown() {
  return `# 用 AI 读医学论文，我会先问这 3 个问题

> 自习室便签：这篇不是教你把论文丢给 AI 直接总结，而是把 AI 当成一个帮你拆结构的同桌。

## 01 先问问题，不急着要总结

读医学论文时，我会先让 AI 帮我找出研究问题、研究对象、方法和主要指标，而不是直接生成一段看起来很完整的摘要。

真正重要的不是 \`AI summary\` 写得像不像，而是 **它有没有帮你把问题拆清楚**。

- 研究对象是谁？
- 主要任务是什么？
- 结论依赖哪些数据和指标？

### 一个可以直接复制的提问方式

\`\`\`text
请帮我拆解这篇论文：研究问题、研究对象、数据来源、方法、评价指标、主要结论和局限。
不要直接写成摘要，先用表格列出结构。
\`\`\`

| 字段 | 自习时要看什么 |
| --- | --- |
| 研究问题 | 论文到底想解决哪一个医学或临床问题 |
| 数据来源 | 数据来自公开数据集、医院真实数据，还是模拟样本 |
| 评价指标 | 指标是否真的对应医学场景里的有效性 |

## 02 把回答拆成证据和局限

AI 给出的结论要被拆开：一边放它引用到的证据，一边放它没有说清楚的限制。
`;
}
