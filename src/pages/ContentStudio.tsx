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
import { useAuth } from "../context/AuthContext";
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
  const { isAdmin } = useAuth();
  const { language } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState(1);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [angle, setAngle] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [styleSamples, setStyleSamples] = useState<string[]>(["", "", ""]);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [result, setResult] = useState<StudioResult | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"全部" | EvidenceCard["stance"]>("全部");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceCard | null>(null);
  const [showSourceDetails, setShowSourceDetails] = useState(true);
  const [saved, setSaved] = useState(false);

  const visibleEvidence = useMemo(
    () => (result?.evidence ?? []).filter((item) => filter === "全部" || item.stance === filter),
    [filter, result],
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
        rejectedReason.push(`"${file.name}"不是 PDF 格式`);
      } else if (file.size > 5 * 1024 * 1024) {
        rejectedReason.push(`"${file.name}"大小超过 5 MB`);
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
      setError(`示例文件"${unresolvedPdf.name}"尚未真正上传。请删除它并上传你的 PDF，或直接查看当前示例研究包。`);
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
    const evidenceAppendix = (result?.evidence ?? [])
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

  if (!isAdmin) {
    return (
      <div className="studio-shell">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
          <div className="w-20 h-20 rounded-full bg-ts-primary/10 border border-ts-primary/20 flex items-center justify-center text-ts-primary shadow-lg">
            <ShieldCheck size={36} />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-xl font-display font-black text-ts-ink">
              {language === "zh" ? "仅限管理员访问" : "Admin Access Only"}
            </h2>
            <p className="text-sm text-ts-muted leading-relaxed">
              {language === "zh"
                ? "Content Studio 是管理员专用的深度内容研究工具。请使用管理员账户登录后访问。"
                : "Content Studio is a research tool for administrators only. Please log in with an admin account."}
            </p>
          </div>
        </div>
        <span className="studio-language-note">{language === "zh" ? "中文界面" : "Chinese-first beta"}</span>
      </div>
    );
  }

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

            {result?.notice && stage !== 1 && (
              <div className="studio-notice">
                <AlertTriangle size={15} />
                <span>{result?.notice}</span>
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

                {result && (
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
                )}
              </>
            )}

            {stage === 3 && result && (
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

            {stage === 4 && result && (
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

            {stage === 5 && result && (
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

        {stage === 2 && result && (
          <aside className="studio-proof-preview">
            <div className="studio-preview-header">
              <div><PenLine size={16} /><span>写作校样</span></div>
              <span>预览</span>
            </div>
            <article>
              <span>初稿节选</span>
              {result.draft.split("\n").filter(line => line.trim() && !line.startsWith("#")).slice(0, 3).map((line, i) => {
                // Extract evidence references like [E01]
                const parts = line.split(/(\[E\d+\])/g);
                return (
                  <p key={i}>
                    {parts.map((part, j) => {
                      const match = part.match(/^\[(E\d+)\]$/);
                      if (match) {
                        const ev = result.evidence.find(e => e.id === match[1]);
                        return ev ? (
                          <button key={j} onClick={() => setSelectedEvidence(ev)}>[{match[1]}]</button>
                        ) : part;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
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
