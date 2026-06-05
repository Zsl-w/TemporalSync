import assert from 'node:assert/strict';
import { convertMarkdownToWechatHtml } from './shiyun-converter.mjs';

const markdown = `# 用 AI 读医学论文

> 自习室便签：先拆结构，再看结论。

## 01 先问问题

#### 小节提示

正文里有 \`AUC\` 这样的术语，也有 **重点判断**。

![流程图](https://example.com/workflow.png)

\`\`\`python
prompt = "拆解论文"
\`\`\`

| 字段 | 含义 |
| --- | --- |
| 数据来源 | 公开数据集 |

- 研究对象是谁？
- 指标是否合适？
`;

const html = convertMarkdownToWechatHtml(markdown);

assert.match(html, /用 AI 读医学论文/);
assert.match(html, /padding:28px 24px 56px/);
assert.match(html, /自习室便签/);
assert.match(html, /先拆结构，再看结论。/);
assert.match(html, /01/);
assert.match(html, /先问问题/);
assert.match(html, /小节提示/);
assert.match(html, /AUC/);
assert.match(html, /重点判断/);
assert.match(html, /<img/);
assert.match(html, /https:\/\/example.com\/workflow.png/);
assert.match(html, /流程图/);
assert.match(html, /示例代码/);
assert.match(html, /prompt&nbsp;=&nbsp;&quot;拆解论文&quot;/);
assert.match(html, /<table/);
assert.match(html, /数据来源/);
assert.match(html, /研究对象是谁？/);

// New assertions for layout requirements
assert.match(html, /text-align:left;/);
assert.doesNotMatch(html, /自习清单/);

// Smart Chinese line joining verification
const chineseJoinMarkdown = `中文段落第一行
中文段落第二行

English line one
English line two`;
const joinHtml = convertMarkdownToWechatHtml(chineseJoinMarkdown);
assert.match(joinHtml, /中文段落第一行中文段落第二行/);
assert.match(joinHtml, /English line one English line two/);

// Verify divider syntax
const dividerHtml = convertMarkdownToWechatHtml('---');
assert.match(dividerHtml, /width:96px/);
assert.match(dividerHtml, /background:#d9d2c4/);
assert.doesNotMatch(dividerHtml, /继续自习/);


