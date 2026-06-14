import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";

export type ContentSource = {
  id: string;
  type: "url" | "pdf";
  name: string;
  url?: string;
  mimeType?: string;
  base64?: string;
};

export type ContentStudioRequest = {
  topic: string;
  audience: string;
  angle: string;
  sources: ContentSource[];
  styleSamples?: string[];
};

export type EvidenceCard = {
  id: string;
  claim: string;
  sourceId: string;
  sourceName: string;
  locator: string;
  quote: string;
  confidence: "高" | "中" | "低";
  stance: "支持" | "反对" | "待确认";
};

export type ContentStudioResult = {
  demo: boolean;
  notice?: string;
  titleOptions: string[];
  coreThesis: string;
  evidence: EvidenceCard[];
  argumentMap: {
    supporting: string[];
    opposing: string[];
    gaps: string[];
  };
  outline: Array<{ heading: string; purpose: string; evidenceIds: string[] }>;
  draft: string;
  quality: {
    traceableRate: number;
    unsupportedClaims: string[];
    possibleFabrications: string[];
    overreach: string[];
    aiTone: string[];
    medicalDisclaimerRequired: boolean;
  };
};

export type ContentStudioModelConfig = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function isPublicHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function getScrapeHeaders(urlStr: string): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Connection": "keep-alive",
  };

  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    if (host.includes("zhihu.com")) {
      headers["Referer"] = "https://www.zhihu.com/";
      headers["sec-ch-ua"] = '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"';
      headers["sec-ch-ua-mobile"] = "?0";
      headers["sec-ch-ua-platform"] = '"Windows"';
      headers["sec-fetch-dest"] = "document";
      headers["sec-fetch-mode"] = "navigate";
      headers["sec-fetch-site"] = "same-origin";
      headers["upgrade-insecure-requests"] = "1";
    } else if (host.includes("weixin.qq.com")) {
      headers["Referer"] = "https://mp.weixin.qq.com/";
      headers["sec-ch-ua"] = '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"';
      headers["sec-ch-ua-mobile"] = "?0";
      headers["sec-ch-ua-platform"] = '"Windows"';
      headers["sec-fetch-dest"] = "document";
      headers["sec-fetch-mode"] = "navigate";
      headers["sec-fetch-site"] = "none";
      headers["upgrade-insecure-requests"] = "1";
    } else {
      headers["Referer"] = "https://www.google.com/";
    }
  } catch {
    headers["Referer"] = "https://www.google.com/";
  }

  return headers;
}

async function fetchTextSource(source: ContentSource): Promise<string> {
  if (!source.url || !isPublicHttpUrl(source.url)) {
    throw new Error(`来源 ${source.name} 不是可访问的公开 HTTP(S) 链接。`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      redirect: "follow",
      headers: getScrapeHeaders(source.url),
    });
    if (!response.ok) {
      throw new Error(`抓取失败（HTTP ${response.status}）`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/") && !contentType.includes("html")) {
      throw new Error("链接不是可解析的文本网页");
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    $("script,style,noscript,nav,footer,header,aside,form").remove();
    const title =
      $("meta[property='og:title']").attr("content") ||
      $("title").first().text().trim() ||
      source.name;
    const articleText =
      $("article").text().trim() ||
      $("main").text().trim() ||
      $("body").text().trim();
    const cleaned = articleText.replace(/\s+/g, " ").slice(0, 18_000);
    if (cleaned.length < 120) throw new Error("网页正文过短或无法提取");
    return `来源ID: ${source.id}\n标题: ${title}\nURL: ${source.url}\n正文: ${cleaned}`;
  } finally {
    clearTimeout(timeout);
  }
}

async function extractPdfSource(source: ContentSource): Promise<string> {
  if (!source.base64 || source.mimeType !== "application/pdf") {
    throw new Error(`PDF ${source.name} 的数据无效。`);
  }

  const parser = new PDFParse({
    data: Uint8Array.from(Buffer.from(source.base64, "base64")),
  });

  try {
    const result = await parser.getText();
    const pages = result.pages
      .map((page, index) => {
        const text = page.text.replace(/\s+/g, " ").trim();
        return text ? `[第 ${index + 1} 页]\n${text}` : "";
      })
      .filter(Boolean)
      .join("\n\n");

    if (pages.length < 120) {
      throw new Error(`PDF ${source.name} 未提取到足够的可复制文本。`);
    }

    return `来源ID: ${source.id}\n标题: ${source.name}\n类型: PDF\n正文:\n${pages.slice(0, 80_000)}`;
  } finally {
    await parser.destroy();
  }
}

function validateRequest(body: ContentStudioRequest): string | null {
  if (!body || typeof body !== "object") return "请求格式无效。";
  if (!body.topic?.trim()) return "请填写文章主题。";
  if (!body.audience?.trim()) return "请填写目标读者。";
  if (!Array.isArray(body.sources) || body.sources.length < 1 || body.sources.length > 10) {
    return "来源数量必须为 1–10 个。";
  }
  const totalPdfBytes = body.sources.reduce((sum, source) => {
    if (source.type !== "pdf" || !source.base64) return sum;
    return sum + Math.ceil((source.base64.length * 3) / 4);
  }, 0);
  if (totalPdfBytes > 12 * 1024 * 1024) return "PDF 总大小不能超过 12 MB。";
  if ((body.styleSamples?.length || 0) > 3) return "最多上传 3 篇历史文章。";
  return null;
}

function demoResult(): ContentStudioResult {
  return {
    demo: true,
    notice: "当前未配置 MIMO_API_KEY，以下为内置示例数据，不代表对你上传来源的真实分析。",
    titleOptions: [
      "生成式 AI 正在重写开发者的工作，但不是你想的那样",
      "AI 没有替代程序员，它先改变了“写代码”的含义",
      "从补全代码到重组工作流：开发者正在经历什么",
    ],
    coreThesis:
      "生成式 AI 正在显著改变开发者的工作方式，但现有证据更支持“任务重组”而非“职业替代”：它提升局部效率，也把注意力推向系统设计、验证与风险判断。",
    evidence: [
      {
        id: "E01",
        claim: "调查显示，生成式 AI 已进入大量开发者的日常工作流。",
        sourceId: "S01",
        sourceName: "Stack Overflow Developer Survey",
        locator: "AI tools / usage",
        quote: "示例引用：开发者报告正在使用或计划使用 AI 工具。",
        confidence: "高",
        stance: "支持",
      },
      {
        id: "E02",
        claim: "代码补全工具在部分受控任务中缩短了完成时间。",
        sourceId: "S02",
        sourceName: "GitHub Copilot productivity study",
        locator: "Results §3.2",
        quote: "示例引用：实验组完成指定任务所需时间更短。",
        confidence: "高",
        stance: "支持",
      },
      {
        id: "E03",
        claim: "速度提升不必然转化为复杂系统中的整体生产率提升。",
        sourceId: "S03",
        sourceName: "Developer productivity review",
        locator: "Discussion p.28",
        quote: "示例引用：局部指标无法覆盖维护、审查和返工成本。",
        confidence: "中",
        stance: "反对",
      },
      {
        id: "E04",
        claim: "AI 生成代码可能增加安全审查和验证负担。",
        sourceId: "S03",
        sourceName: "Developer productivity review",
        locator: "Limitations §4.1",
        quote: "示例引用：生成结果仍需经过人工验证。",
        confidence: "中",
        stance: "反对",
      },
      {
        id: "E05",
        claim: "现有公开证据不足以判断生成式 AI 会导致开发者岗位大规模消失。",
        sourceId: "S04",
        sourceName: "Evidence gap",
        locator: "待补充长期数据",
        quote: "缺少跨周期、跨团队和可比口径的职业数据。",
        confidence: "中",
        stance: "待确认",
      },
    ],
    argumentMap: {
      supporting: ["E01 使用比例持续上升", "E02 局部编码任务提速"],
      opposing: ["E03 整体生产率证据不一致", "E04 验证与安全成本增加"],
      gaps: ["缺少长期职业影响数据", "不同团队规模的收益差异尚不清楚"],
    },
    outline: [
      { heading: "AI 已经进入工作流", purpose: "确认变化真实存在", evidenceIds: ["E01"] },
      { heading: "效率提升发生在哪里", purpose: "拆分局部任务与整体产出", evidenceIds: ["E02", "E03"] },
      { heading: "被重新分配的责任", purpose: "讨论验证、安全和系统判断", evidenceIds: ["E04"] },
      { heading: "不要提前宣布职业终结", purpose: "明确证据边界", evidenceIds: ["E05"] },
    ],
    draft: `# 生成式 AI 正在重写开发者的工作，但不是你想的那样

过去一年，生成式 AI 从实验性工具变成了开发者日常工作流的一部分。[E01] 这件事已经没有太多争议。真正值得讨论的，不是开发者“会不会使用 AI”，而是使用之后，工作的哪一部分发生了变化。

最容易被观察到的是局部速度。代码补全和对话式编程工具可以缩短一些边界清晰的编码任务。[E02] 但把这一结果直接外推为“软件开发整体效率大幅提升”，证据还不充分。真实项目还包含需求澄清、系统设计、代码审查、维护和返工，局部提速可能被新的验证成本抵消。[E03]

这意味着 AI 没有简单地拿走工作，而是在重新分配责任。生成代码变得更快，判断代码是否正确、安全、适合当前系统则变得更重要。[E04] 开发者的价值正在从“输入多少代码”转向“能否定义问题、约束系统并承担结果”。

因此，现在就宣布开发者岗位将大规模消失，并不符合现有证据。[E05] 更准确的判断是：AI 首先改变任务结构，然后才可能影响岗位结构。两者之间还有很长的因果链，需要长期数据，而不是几次工具演示来证明。`,
    quality: {
      traceableRate: 96,
      unsupportedClaims: ["“过去一年”需要补充明确的统计时间范围。"],
      possibleFabrications: [],
      overreach: ["不能由局部任务提速直接推导整体生产率提升。"],
      aiTone: ["减少“真正值得讨论的是”一类模板化转折。"],
      medicalDisclaimerRequired: false,
    },
  };
}

function buildPrompt(
  input: ContentStudioRequest,
  textSources: string[],
): string {
  const style = (input.styleSamples || [])
    .filter(Boolean)
    .map((sample, index) => `历史文章 ${index + 1}:\n${sample.slice(0, 6000)}`)
    .join("\n\n");

  return `你是 TSync 的资深研究编辑。请仅根据提供的来源，生成一份可审计的中文深度文章研究包。

文章主题：${input.topic}
目标读者：${input.audience}
期望角度：${input.angle || "从证据出发形成清晰判断"}

硬性规则：
1. 不得编造事实、数据、作者、日期、引用或页码。
2. 每张证据卡必须引用来源 ID，并提供原文短句和可定位位置。无法定位时写“待人工定位”并降低可信度。
3. 明确区分支持、反对和待确认，不要把相关性写成因果性。
4. 草稿中的事实性断言使用 [E01] 格式关联证据卡。
5. 资料发生冲突时必须写入 opposing 或 gaps，不要强行调和。
6. 文章为 1500–3000 个中文字符，避免空洞排比、机械小标题和常见 AI 套话。
7. 历史文章只用于语气与结构适配，不得改变事实含义。
8. 若涉及医疗健康，medicalDisclaimerRequired 必须为 true，并且不得提供个体诊疗建议。

网页来源：
${textSources.join("\n\n---\n\n") || "无网页来源"}

${style ? `文风参考：\n${style}` : "无历史文章，使用理性克制、结构清楚的默认文风。"}

返回纯 JSON，结构必须严格符合：
{
  "titleOptions": ["", "", ""],
  "coreThesis": "",
  "evidence": [{
    "id": "E01",
    "claim": "",
    "sourceId": "S01",
    "sourceName": "",
    "locator": "",
    "quote": "",
    "confidence": "高|中|低",
    "stance": "支持|反对|待确认"
  }],
  "argumentMap": {
    "supporting": [""],
    "opposing": [""],
    "gaps": [""]
  },
  "outline": [{
    "heading": "",
    "purpose": "",
    "evidenceIds": ["E01"]
  }],
  "draft": "",
  "quality": {
    "traceableRate": 0,
    "unsupportedClaims": [""],
    "possibleFabrications": [""],
    "overreach": [""],
    "aiTone": [""],
    "medicalDisclaimerRequired": false
  }
}`;
}

export async function generateContentStudio(
  input: ContentStudioRequest,
  config: ContentStudioModelConfig,
): Promise<Response> {
  const validationError = validateRequest(input);
  if (validationError) return jsonResponse({ error: validationError }, 400);

  if (!config.apiKey || config.apiKey === "MY_MIMO_API_KEY") {
    return jsonResponse(demoResult());
  }

  try {
    const textSources = await Promise.all(
      input.sources.map((source) =>
        source.type === "pdf" ? extractPdfSource(source) : fetchTextSource(source),
      ),
    );

    const response = await fetch(
      `${(config.baseUrl || "https://api.xiaomimimo.com/v1").replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || "mimo-v2.5-pro",
          messages: [
            {
              role: "system",
              content:
                "你是 MiMo，是 TSync 的资深研究编辑。只依据用户提供的来源工作，所有输出必须是可解析的 JSON。",
            },
            { role: "user", content: buildPrompt(input, textSources) },
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 24_000,
          temperature: 0.25,
          stream: false,
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();
      console.error("Content Studio MiMo error:", response.status, message.slice(0, 500));
      return jsonResponse({ error: "模型服务暂时不可用，请稍后重试。" }, 502);
    }

    const payload: any = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    if (!text) return jsonResponse({ error: "模型未返回可用结果。" }, 502);
    const result = JSON.parse(
      text.replace(/^```json\s*/i, "").replace(/\s*```$/, ""),
    ) as Omit<ContentStudioResult, "demo">;
    return jsonResponse({ ...result, demo: false });
  } catch (error: any) {
    console.error("Content Studio generation failed:", error);
    return jsonResponse(
      { error: error?.message || "研究包生成失败，请检查来源后重试。" },
      500,
    );
  }
}
