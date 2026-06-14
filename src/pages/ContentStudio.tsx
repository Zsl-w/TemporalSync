import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Globe2,
  Link2,
  ListTree,
  Loader2,
  Map,
  PenLine,
  Plus,
  Quote,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../lib/utils";
import "./content-studio.css";

type SourceItem = {
  id: string;
  type: "url" | "pdf";
  name: string;
  url?: string;
  file?: File;
};

type EvidenceCard = {
  id: string;
  claim: string;
  sourceId: string;
  sourceName: string;
  locator: string;
  quote: string;
  confidence: "高" | "中" | "低";
  stance: "支持" | "反对" | "待确认";
};

type StudioResult = {
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

const SAMPLE_RESULT: StudioResult = {
  demo: true,
  notice: "示例研究包 · 点击“返回素材”可使用你自己的链接和 PDF",
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
      claim: "开发者使用生成式 AI 的比例在 2023 年达到 76%，较 2022 年提升 21 个百分点。",
      sourceId: "S01",
      sourceName: "Stack Overflow 2024 开发者调查",
      locator: "p.12 / 图表 6",
      quote: "76% of respondents are using or planning to use AI tools in their development process.",
      confidence: "高",
      stance: "支持",
    },
    {
      id: "E02",
      claim: "生成式 AI 主要提升了代码补全的效率，但尚未显著提升系统设计等高阶任务的质量。",
      sourceId: "S02",
      sourceName: "GitHub Copilot 经济影响研究",
      locator: "§3.2 / p.15",
      quote: "Developers completed the controlled coding task faster with AI assistance.",
      confidence: "高",
      stance: "支持",
    },
    {
      id: "E03",
      claim: "部分团队出现过度依赖 AI 的倾向，导致代码可维护性下降。",
      sourceId: "S03",
      sourceName: "Generative AI and Developer Productivity",
      locator: "p.28 / §4.1",
      quote: "Local speed gains did not consistently translate into system-level productivity.",
      confidence: "中",
      stance: "反对",
    },
    {
      id: "E04",
      claim: "复杂项目中的 AI 建议可能引入安全隐患，需要人工审核与测试。",
      sourceId: "S03",
      sourceName: "Generative AI and Developer Productivity",
      locator: "p.17 / §2.3",
      quote: "Generated code required additional review for correctness and security.",
      confidence: "中",
      stance: "反对",
    },
    {
      id: "E05",
      claim: "目前证据不足以证明生成式 AI 会导致开发者岗位大规模消失。",
      sourceId: "S04",
      sourceName: "世界经济论坛：就业展望",
      locator: "p.34 / §5.4",
      quote: "Long-term occupational effects remain uncertain across sectors.",
      confidence: "中",
      stance: "待确认",
    },
  ],
  argumentMap: {
    supporting: ["E01 使用比例显著上升", "E02 提升编码效率", "E05 尚未导致大规模失业"],
    opposing: ["E03 过度依赖影响质量", "E04 安全隐患增加"],
    gaps: ["长期对开发者职业发展的影响数据不足", "不同企业、团队规模的差异缺乏量化研究"],
  },
  outline: [
    { heading: "AI 已经进入工作流", purpose: "确认变化真实存在", evidenceIds: ["E01"] },
    { heading: "效率提升发生在哪里", purpose: "拆分局部任务与整体产出", evidenceIds: ["E02", "E03"] },
    { heading: "被重新分配的责任", purpose: "讨论验证、安全和系统判断", evidenceIds: ["E04"] },
    { heading: "不要提前宣布职业终结", purpose: "明确证据边界", evidenceIds: ["E05"] },
  ],
  draft: `# 生成式 AI 正在重写开发者的工作，但不是你想的那样

过去一年，生成式 AI 从实验性工具变成了开发者日常工作流的一部分。Stack Overflow 的调查显示，越来越多开发者已经使用或计划使用 AI 工具。[E01]

最容易被观察到的是局部速度。代码补全和对话式编程工具可以缩短一些边界清晰的编码任务。[E02] 但把这一结果直接外推为“软件开发整体效率大幅提升”，证据还不充分。真实项目还包含需求澄清、系统设计、代码审查、维护和返工，局部提速可能被新的验证成本抵消。[E03]

这意味着 AI 没有简单地拿走工作，而是在重新分配责任。生成代码变得更快，判断代码是否正确、安全、适合当前系统则变得更重要。[E04] 开发者的价值正在从“输入多少代码”转向“能否定义问题、约束系统并承担结果”。

因此，现在就宣布开发者岗位将大规模消失，并不符合现有证据。[E05] 更准确的判断是：AI 首先改变任务结构，然后才可能影响岗位结构。两者之间还有很长的因果链，需要长期数据，而不是几次工具演示来证明。`,
  quality: {
    traceableRate: 96,
    unsupportedClaims: ["“越来越多”应补充明确的时间范围。", "“过去一年”缺少起止日期。"],
    possibleFabrications: [],
    overreach: ["不能由局部任务提速直接推导整体生产率提升。"],
    aiTone: ["减少“真正值得讨论的是”一类模板化转折。"],
    medicalDisclaimerRequired: false,
  },
};

const stages = [
  { id: 1, label: "素材输入", icon: FileText },
  { id: 2, label: "证据图谱", icon: Map },
  { id: 3, label: "文章结构", icon: ListTree },
  { id: 4, label: "初稿编辑", icon: PenLine },
  { id: 5, label: "质量报告", icon: ShieldCheck },
];

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const downloadText = (filename: string, content: string, mime = "text/markdown") => {
  const blob = new Blob(["\uFEFF", content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const ContentStudio = () => {
  const { language } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState(2);
  const [topic, setTopic] = useState("生成式 AI 是否正在改变开发者工作？");
  const [audience, setAudience] = useState("关注 AI 与技术趋势的知识工作者");
  const [angle, setAngle] = useState("区分局部效率提升与职业替代，呈现支持证据和反方证据");
  const [urlValue, setUrlValue] = useState("");
  const [sources, setSources] = useState<SourceItem[]>([
    {
      id: "S01",
      type: "url",
      name: "Stack Overflow 2024 开发者调查报告",
      url: "https://survey.stackoverflow.co/2024/",
    },
    {
      id: "S02",
      type: "url",
      name: "GitHub Copilot 经济影响研究",
      url: "https://github.blog/",
    },
    {
      id: "S03",
      type: "pdf",
      name: "Generative AI and Developer Productivity.pdf",
    },
  ]);
  const [styleSamples, setStyleSamples] = useState<string[]>(["", "", ""]);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [result, setResult] = useState<StudioResult>(SAMPLE_RESULT);
  const [draft, setDraft] = useState(SAMPLE_RESULT.draft);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"全部" | EvidenceCard["stance"]>("全部");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceCard>(SAMPLE_RESULT.evidence[0]);
  const [showSourceDetails, setShowSourceDetails] = useState(true);
  const [saved, setSaved] = useState(false);

  const visibleEvidence = useMemo(
    () => result.evidence.filter((item) => filter === "全部" || item.stance === filter),
    [filter, result.evidence],
  );

  const addUrl = async () => {
    const raw = urlValue.trim();
    if (!raw || sources.length >= 10) return;
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    let title = normalized;
    try {
      const response = await fetch(`/api/link-metadata?url=${encodeURIComponent(normalized)}`);
      const data = await response.json();
      if (data.title) title = data.title;
    } catch {
      // Keep the URL as the visible name when metadata is unavailable.
    }
    setSources((current) => [
      ...current,
      { id: `S${String(current.length + 1).padStart(2, "0")}`, type: "url", name: title, url: normalized },
    ]);
    setUrlValue("");
  };

  const addPdfFiles = (files: FileList | null) => {
    if (!files) return;
    setError("");
    const fileArray = Array.from(files);
    const rejectedReason: string[] = [];
    const acceptedFiles: File[] = [];

    for (const file of fileArray) {
      if (file.type !== "application/pdf") {
        rejectedReason.push(`“${file.name}”不是 PDF 格式`);
      } else if (file.size > 5 * 1024 * 1024) {
        rejectedReason.push(`“${file.name}”大小超过 5 MB`);
      } else {
        acceptedFiles.push(file);
      }
    }

    if (rejectedReason.length > 0) {
      setError(`以下文件未添加：${rejectedReason.join("；")}`);
    }

    const maxToAdd = Math.max(0, 10 - sources.length);
    const toAdd = acceptedFiles.slice(0, maxToAdd);
    if (acceptedFiles.length > maxToAdd) {
      setError((prev) => (prev ? prev + "；" : "") + `已达 10 个来源上限，部分 PDF 未添加`);
    }

    if (toAdd.length === 0) return;

    setSources((current) => [
      ...current,
      ...toAdd.map((file, index) => ({
        id: `S${String(current.length + index + 1).padStart(2, "0")}`,
        type: "pdf" as const,
        name: file.name,
        file,
      })),
    ]);
  };

  const removeSource = (id: string) => {
    setSources((current) =>
      current
        .filter((source) => source.id !== id)
        .map((source, index) => ({ ...source, id: `S${String(index + 1).padStart(2, "0")}` })),
    );
  };

  const generate = async () => {
    if (!privacyConfirmed || !rightsConfirmed) {
      setError("请先确认素材不含患者隐私，并且你有权使用这些资料。");
      return;
    }
    const unresolvedPdf = sources.find((source) => source.type === "pdf" && !source.file);
    if (unresolvedPdf) {
      setError(`示例文件“${unresolvedPdf.name}”尚未真正上传。请删除它并上传你的 PDF，或直接查看当前示例研究包。`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payloadSources = await Promise.all(
        sources.map(async (source) => ({
          id: source.id,
          type: source.type,
          name: source.name,
          url: source.url,
          mimeType: source.file?.type,
          base64: source.file ? await fileToBase64(source.file) : undefined,
        })),
      );
      const response = await fetch("/api/content-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          audience,
          angle,
          sources: payloadSources,
          styleSamples: styleSamples.filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败");
      setResult(data);
      setDraft(data.draft);
      setSelectedEvidence(data.evidence[0]);
      setStage(2);
    } catch (caught: any) {
      setError(caught?.message || "生成失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const saveProject = () => {
    setError("");
    try {
      localStorage.setItem(
        "ts-content-studio-project",
        JSON.stringify({ topic, audience, angle, result, draft, savedAt: new Date().toISOString() }),
      );
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (caught: any) {
      console.warn("Failed to save full project to localStorage:", caught);
      try {
        localStorage.setItem(
          "ts-content-studio-project",
          JSON.stringify({ topic, audience, angle, savedAt: new Date().toISOString() }),
        );
        setError("由于浏览器空间限制，仅保存了项目配置，未保存初稿与分析地图。");
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1800);
      } catch (innerCaught: any) {
        setError("保存失败：本地存储空间已满。");
      }
    }
  };

  const exportMarkdown = () => {
    const evidenceAppendix = result.evidence
      .map(
        (item) =>
          `- **${item.id} · ${item.stance} · ${item.confidence}可信度**：${item.claim}\n  - 来源：${item.sourceName}（${item.locator}）\n  - 原文：${item.quote}`,
      )
      .join("\n");
    downloadText(`${topic || "TSync研究稿"}.md`, `${draft}\n\n---\n\n## 证据附录\n\n${evidenceAppendix}`);
  };

  const exportWord = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:"Noto Serif SC",serif;line-height:1.8;max-width:760px;margin:40px auto;color:#2c2621}h1{font-size:30px}p{font-size:16px}</style></head><body>${draft
      .split("\n")
      .map((line) => {
        if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
        return line.trim() ? `<p>${line}</p>` : "";
      })
      .join("")}</body></html>`;
    downloadText(`${topic || "TSync研究稿"}.doc`, html, "application/msword");
  };

  const stageTitle = {
    1: "把来源交给我们，判断仍然属于你。",
    2: "证据不是装饰，是文章的骨架。",
    3: "先让逻辑成立，再开始写作。",
    4: "每一句判断，都应该知道自己从哪里来。",
    5: "发布以前，先对事实负责。",
  }[stage];

  return (
    <div className="studio-shell">
      <header className="studio-project-bar">
        <div>
          <span className="studio-kicker">TSync · CONTENT STUDIO</span>
          <span className="studio-project-dot" />
          <span className="studio-project-name">{topic || "未命名研究项目"}</span>
        </div>
        <div className="studio-project-actions">
          <button onClick={saveProject} className="studio-quiet-button">
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? "已保存" : "保存"}
          </button>
          <button onClick={exportMarkdown} className="studio-quiet-button">
            <Download size={15} />
            Markdown
          </button>
          <button onClick={exportWord} className="studio-quiet-button">
            <Download size={15} />
            Word
          </button>
        </div>
      </header>

      <div className="studio-workspace">
        <aside className="studio-stage-rail" aria-label="内容生产流程">
          <div className="studio-stage-list">
            {stages.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setStage(item.id)}
                  className={cn("studio-stage", stage === item.id && "is-active")}
                >
                  <span className="studio-stage-number">0{item.id}</span>
                  <span className="studio-stage-label">{item.label}</span>
                  <Icon size={17} />
                </button>
              );
            })}
          </div>
          <button className="studio-help-button" title="当前为公开测试版">
            <CircleHelp size={16} />
            测试说明
          </button>
        </aside>

        <main className="studio-main">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="studio-main-inner"
          >
            <div className="studio-heading">
              <span className="studio-heading-rule" />
              <div>
                <p>RESEARCH WITH RECEIPTS</p>
                <h1>{stageTitle}</h1>
                <span>{topic}</span>
              </div>
            </div>

            {result.notice && stage !== 1 && (
              <div className="studio-notice">
                <AlertTriangle size={15} />
                <span>{result.notice}</span>
              </div>
            )}

            {stage === 1 && (
              <section className="studio-input-layout">
                <div className="studio-input-column">
                  <div className="studio-form-grid">
                    <label>
                      <span>文章主题</span>
                      <input value={topic} onChange={(event) => setTopic(event.target.value)} />
                    </label>
                    <label>
                      <span>目标读者</span>
                      <input value={audience} onChange={(event) => setAudience(event.target.value)} />
                    </label>
                    <label className="studio-form-full">
                      <span>期望角度</span>
                      <textarea rows={3} value={angle} onChange={(event) => setAngle(event.target.value)} />
                    </label>
                  </div>

                  <div className="studio-section-heading">
                    <div>
                      <span>研究来源</span>
                      <small>1–10 个公开网页或可复制文本的 PDF</small>
                    </div>
                    <span>{sources.length}/10</span>
                  </div>

                  <div className="studio-add-source">
                    <Link2 size={17} />
                    <input
                      value={urlValue}
                      onChange={(event) => setUrlValue(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && addUrl()}
                      placeholder="粘贴网页链接"
                    />
                    <button onClick={addUrl}>添加链接</button>
                    <span />
                    <button onClick={() => fileInputRef.current?.click()}>
                      <Upload size={15} />
                      上传 PDF
                    </button>
                    <input
                      ref={fileInputRef}
                      hidden
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={(event) => addPdfFiles(event.target.files)}
                    />
                  </div>

                  <div className="studio-source-list">
                    {sources.map((source) => (
                      <div key={source.id} className="studio-source-row">
                        <span className="studio-source-icon">
                          {source.type === "url" ? <Globe2 size={17} /> : <FileText size={17} />}
                        </span>
                        <div>
                          <strong>{source.name}</strong>
                          <small>{source.type === "url" ? source.url : source.file ? `${(source.file.size / 1024 / 1024).toFixed(1)} MB` : "示例占位文件"}</small>
                        </div>
                        <span className="studio-source-id">{source.id}</span>
                        <button onClick={() => removeSource(source.id)} title="移除来源">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="studio-section-heading">
                    <div>
                      <span>文风参考（可选）</span>
                      <small>最多粘贴 3 篇旧文，只学习表达，不改变事实</small>
                    </div>
                  </div>
                  <div className="studio-style-samples">
                    {styleSamples.map((sample, index) => (
                      <textarea
                        key={index}
                        rows={3}
                        value={sample}
                        onChange={(event) =>
                          setStyleSamples((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                          )
                        }
                        placeholder={`历史文章 ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <aside className="studio-input-summary">
                  <span className="studio-summary-eyebrow">本次研究</span>
                  <dl>
                    <div><dt>来源数量</dt><dd>{sources.length}</dd></div>
                    <div><dt>语言</dt><dd>中 / EN</dd></div>
                    <div><dt>交付</dt><dd>研究包 + 初稿</dd></div>
                    <div><dt>首篇试用</dt><dd>最多 3 个来源</dd></div>
                  </dl>
                  <label className="studio-confirm">
                    <input
                      type="checkbox"
                      checked={privacyConfirmed}
                      onChange={(event) => setPrivacyConfirmed(event.target.checked)}
                    />
                    <span>素材不含患者隐私、个人身份信息或未脱敏数据</span>
                  </label>
                  <label className="studio-confirm">
                    <input
                      type="checkbox"
                      checked={rightsConfirmed}
                      onChange={(event) => setRightsConfirmed(event.target.checked)}
                    />
                    <span>我有权使用这些资料，不要求大规模转载受版权保护内容</span>
                  </label>
                  {error && <p className="studio-error">{error}</p>}
                  <button disabled={loading || sources.length === 0} onClick={generate} className="studio-primary-button">
                    {loading ? <Loader2 className="animate-spin" size={17} /> : <Sparkles size={17} />}
                    {loading ? "正在整理来源…" : "开始整理"}
                  </button>
                  <p>扫描版 PDF 暂不支持。AI 结果必须经过人工复核。</p>
                </aside>
              </section>
            )}

            {stage === 2 && (
              <>
                <section className="studio-source-strip">
                  <button className="studio-source-strip-title" onClick={() => setShowSourceDetails(!showSourceDetails)}>
                    <span>本次素材（{sources.length}）</span>
                    <ChevronDown size={15} className={cn(showSourceDetails && "rotate-180")} />
                  </button>
                  {showSourceDetails && (
                    <div className="studio-source-strip-items">
                      {sources.slice(0, 3).map((source) => (
                        <div key={source.id}>
                          {source.type === "url" ? <Globe2 size={17} /> : <FileText size={17} />}
                          <span>{source.name}</span>
                          {source.url && <ExternalLink size={13} />}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="studio-evidence-layout">
                  <div className="studio-panel studio-evidence-panel">
                    <div className="studio-panel-heading">
                      <div>
                        <h2>证据卡片（{result.evidence.length}）</h2>
                        <span>每个判断都保留来源和原文位置</span>
                      </div>
                      <div className="studio-filter">
                        <Filter size={14} />
                        {(["全部", "支持", "反对", "待确认"] as const).map((item) => (
                          <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={cn(filter === item && "is-active")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="studio-evidence-list">
                      {visibleEvidence.map((item) => (
                        <button
                          key={item.id}
                          className={cn("studio-evidence-card", selectedEvidence?.id === item.id && "is-selected")}
                          onClick={() => setSelectedEvidence(item)}
                        >
                          <div className="studio-evidence-card-top">
                            <span className="studio-evidence-id">{item.id}</span>
                            <span className={cn("studio-stance", `is-${item.stance}`)}>{item.stance}</span>
                          </div>
                          <strong>{item.claim}</strong>
                          <div className="studio-evidence-meta">
                            <span><BookOpen size={13} />{item.sourceName}</span>
                            <span><Quote size={13} />{item.locator}</span>
                            <span className={cn("studio-confidence", `is-${item.confidence}`)}>{item.confidence}可信度</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="studio-panel studio-map-panel">
                    <div className="studio-panel-heading">
                      <div>
                        <h2>论证地图</h2>
                        <span>先看证据之间如何发生关系</span>
                      </div>
                    </div>
                    <div className="studio-argument-map">
                      <div className="studio-thesis-node">
                        <span>核心判断</span>
                        <p>{result.coreThesis}</p>
                      </div>
                      <div className="studio-map-branches">
                        <div className="studio-map-node is-support">
                          <span>支持证据</span>
                          {result.argumentMap.supporting.map((item) => <p key={item}>{item}</p>)}
                        </div>
                        <div className="studio-map-node is-oppose">
                          <span>反方证据</span>
                          {result.argumentMap.opposing.map((item) => <p key={item}>{item}</p>)}
                        </div>
                      </div>
                      <div className="studio-gap-node">
                        <span>信息缺口</span>
                        {result.argumentMap.gaps.map((item) => <p key={item}>· {item}</p>)}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {stage === 3 && (
              <section className="studio-structure">
                <div className="studio-thesis-banner">
                  <span>核心判断</span>
                  <p>{result.coreThesis}</p>
                </div>
                <div className="studio-outline-list">
                  {result.outline.map((item, index) => (
                    <div key={item.heading} className="studio-outline-item">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h2>{item.heading}</h2>
                        <p>{item.purpose}</p>
                      </div>
                      <div>{item.evidenceIds.map((id) => <span key={id}>[{id}]</span>)}</div>
                    </div>
                  ))}
                </div>
                <div className="studio-title-options">
                  <span>标题方向</span>
                  {result.titleOptions.map((title, index) => (
                    <button key={title} onClick={() => setDraft((current) => current.replace(/^# .+/, `# ${title}`))}>
                      <span>0{index + 1}</span>{title}<ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {stage === 4 && (
              <section className="studio-editor-layout">
                <div className="studio-editor">
                  <div className="studio-editor-toolbar">
                    <span>MARKDOWN · 自动保存到当前浏览器</span>
                    <span>{draft.length} 字符</span>
                  </div>
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} />
                  {result.quality.medicalDisclaimerRequired && (
                    <div className="studio-medical-disclaimer">
                      <ShieldCheck size={16} />
                      本文仅用于知识传播，不构成诊疗建议；发布前需由具备相关资质的人员复核。
                    </div>
                  )}
                </div>
                <aside className="studio-proof-panel">
                  <span className="studio-summary-eyebrow">写作校样</span>
                  <div className="studio-proof-score">
                    <strong>{result.quality.traceableRate}%</strong>
                    <span>引用可定位率</span>
                  </div>
                  <div className="studio-proof-metrics">
                    <button onClick={() => setStage(5)}>
                      <span>无来源断言</span><strong>{result.quality.unsupportedClaims.length}</strong>
                    </button>
                    <button onClick={() => setStage(5)}>
                      <span>疑似编造</span><strong>{result.quality.possibleFabrications.length}</strong>
                    </button>
                    <button onClick={() => setStage(5)}>
                      <span>过度推断</span><strong>{result.quality.overreach.length}</strong>
                    </button>
                    <button onClick={() => setStage(5)}>
                      <span>AI 腔提示</span><strong>{result.quality.aiTone.length}</strong>
                    </button>
                  </div>
                  {selectedEvidence && (
                    <div className="studio-citation-preview">
                      <span>{selectedEvidence.id} · 原文</span>
                      <Quote size={15} />
                      <p>{selectedEvidence.quote}</p>
                      <small>{selectedEvidence.sourceName} · {selectedEvidence.locator}</small>
                    </div>
                  )}
                </aside>
              </section>
            )}

            {stage === 5 && (
              <section className="studio-quality-layout">
                <div className="studio-quality-score">
                  <span>TRACEABILITY</span>
                  <strong>{result.quality.traceableRate}%</strong>
                  <p>关键引用可定位率</p>
                </div>
                <div className="studio-quality-groups">
                  {[
                    ["无来源断言", result.quality.unsupportedClaims, AlertTriangle],
                    ["疑似编造", result.quality.possibleFabrications, X],
                    ["过度推断", result.quality.overreach, CircleHelp],
                    ["AI 腔提示", result.quality.aiTone, PenLine],
                  ].map(([label, items, Icon]: any) => (
                    <div key={label} className="studio-quality-group">
                      <div><Icon size={17} /><h2>{label}</h2><span>{items.length}</span></div>
                      {items.length ? items.map((item: string) => <p key={item}>{item}</p>) : <p className="is-clear"><Check size={14} />未发现问题</p>}
                    </div>
                  ))}
                </div>
                <div className="studio-review-note">
                  <FileCheck2 size={20} />
                  <div>
                    <strong>人工复核清单</strong>
                    <p>逐条打开关键来源，确认数据、时间范围和语境；医疗内容必须补充证据等级与非诊疗声明。</p>
                  </div>
                </div>
              </section>
            )}

            {stage !== 1 && (
              <footer className="studio-action-bar">
                <button onClick={() => setStage(Math.max(1, stage - 1))}>
                  <ArrowLeft size={16} />
                  {stage === 2 ? "返回素材" : "上一步"}
                </button>
                <button onClick={() => setStage(stage === 5 ? 4 : Math.min(5, stage + 1))} className="studio-primary-button">
                  {stage === 2 && <ListTree size={16} />}
                  {stage === 3 && <PenLine size={16} />}
                  {stage === 4 && <ShieldCheck size={16} />}
                  {stage === 5 && <PenLine size={16} />}
                  {stage === 2 ? "查看文章结构" : stage === 3 ? "生成可编辑初稿" : stage === 4 ? "查看质量报告" : "返回初稿"}
                </button>
              </footer>
            )}
          </motion.div>
        </main>

        {stage === 2 && (
          <aside className="studio-proof-preview">
            <div className="studio-preview-header">
              <div><PenLine size={16} /><span>写作校样</span></div>
              <span>预览</span>
            </div>
            <article>
              <span>初稿节选</span>
              <p>
                过去一年，生成式 AI 从实验性工具变成了开发者日常工作流的一部分。
                <button onClick={() => setSelectedEvidence(result.evidence[0])}>[E01]</button>
              </p>
              <p>
                这种变化最直观地发生在编码阶段，但它没有直接证明整体生产率提升。
                <button onClick={() => setSelectedEvidence(result.evidence[2])}>[E03]</button>
              </p>
            </article>
            {selectedEvidence && (
              <div className="studio-selected-evidence">
                <span>{selectedEvidence.id} · {selectedEvidence.stance}</span>
                <p>{selectedEvidence.quote}</p>
                <small>{selectedEvidence.sourceName}<br />{selectedEvidence.locator}</small>
              </div>
            )}
            <div className="studio-preview-quality">
              <div><span>引用可定位率</span><strong>{result.quality.traceableRate}%</strong></div>
              <div><span>无来源断言</span><strong>{result.quality.unsupportedClaims.length}</strong></div>
              <div><span>过度推断</span><strong>{result.quality.overreach.length}</strong></div>
              <button onClick={() => setStage(5)}>查看全部问题 <ArrowRight size={14} /></button>
            </div>
          </aside>
        )}
      </div>

      <span className="studio-language-note">{language === "zh" ? "中文界面" : "Chinese-first beta"}</span>
    </div>
  );
};
