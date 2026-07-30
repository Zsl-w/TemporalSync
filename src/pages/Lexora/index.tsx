import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, Download, ExternalLink, Layers3, MessageCircle, MousePointer2, Search } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const supportUrl = 'https://lexora-support.wangzouszz.chatgpt.site/support';
const privacyUrl = 'https://lexora-support.wangzouszz.chatgpt.site/privacy';
const downloadUrl = 'https://github.com/Zsl-w/Lexora/releases/download/v0.8.7/lexora-extension-0.8.7-chrome.zip';

export const Lexora: React.FC = () => {
  const { language } = useSettings();
  const isZh = language === 'zh';
  const copy = isZh ? {
    eyebrow: 'LEXORA · 浏览器扩展', title: '读到不懂的专业术语，\n当场弄明白。', subtitle: 'Lexora 是一个轻量的划词解读工具。选中术语、缩写或一段话，它会结合上下文，给出清楚的中英文对应、简要解释与可继续追问的入口。',
    test: 'v0.8.7 · 公开测试中', primary: '下载 v0.8.7', secondary: '查看使用演示', what: '不是翻译，是理解。', whatText: '普通划词工具只告诉你“怎么翻”。Lexora 更关心它在这段文字里“指什么、为什么重要、还可以问什么”。',
    features: [['划词即问', '选中词、缩写、句子或多个关键词，L 解读会在选区末尾出现。'], ['把上下文算进去', '识别术语所在的句子和周围信息，避免脱离语境的字面翻译。'], ['从快到深', '先呈现一句话和简要说明；需要时再展开深入解读、来源和继续追问。']],
    flow: '使用方式', steps: [['1', '划选', '在网页、论文或输入框里选中想弄懂的内容。'], ['2', '点击 L 解读', '悬浮入口就在选区下方，无需切换页面。'], ['3', '继续探索', '从一句话理解开始，按需要展开简要、深入或向 AI 追问。']],
    madeFor: '为阅读中的“卡住一秒”而做', madeForText: '医学、AI 只是起点。Lexora 面向所有需要理解专业表达的阅读场景，并会随着使用逐步拓展。',
    sourceTitle: '深入时，才去找出处', sourceText: '需要深入解读时，Lexora 会按主题检索公开学术来源，并将引用直接标在对应说明旁。引用用于帮助回查，不替代专业判断。',
    ctaTitle: '让专业阅读，少一点中断。', ctaText: 'Lexora 正在公开测试。下载后解压文件，并在 Chrome 的开发者模式中加载已解压的扩展程序；也欢迎把你遇到的术语和问题告诉我们。', apply: '下载 v0.8.7', feedback: '反馈或建议', privacy: '隐私政策', demo: '打开概念智库演示',
  } : {
    eyebrow: 'LEXORA · BROWSER EXTENSION', title: 'Understand specialist terms\nwithout leaving the page.', subtitle: 'Lexora is a lightweight selection assistant. Highlight a term, acronym, phrase, or sentence to get a contextual explanation, bilingual mapping, and a place to keep asking.',
    test: 'v0.8.7 · PUBLIC BETA', primary: 'Download v0.8.7', secondary: 'See it in action', what: 'Not just translation. Understanding.', whatText: 'Translation tells you what a word says. Lexora helps you understand what it means here, why it matters, and what to explore next.',
    features: [['Ask from a selection', 'Highlight words, acronyms, sentences, or multiple keywords. The L action appears at the end of your selection.'], ['Keep the context', 'Lexora reads the surrounding sentence so answers do not stop at a literal translation.'], ['Start fast, go deeper', 'Get a one-line answer first, then open concise detail, sources, and follow-up questions when needed.']],
    flow: 'HOW IT WORKS', steps: [['1', 'Highlight', 'Select the part you want to understand on a page, paper, or in a text field.'], ['2', 'Click L', 'The compact action appears directly below your selection.'], ['3', 'Keep exploring', 'Start with a quick definition, then expand or ask AI for more.']],
    madeFor: 'Built for the small moments that stop your reading', madeForText: 'Medicine and AI are only the start. Lexora is designed for any reading context where specialist language gets in the way.',
    sourceTitle: 'Sources only when you go deeper', sourceText: 'For in-depth explanations, Lexora searches public scholarly sources by topic and places citations next to the relevant claims. Citations support verification; they do not replace professional judgement.',
    ctaTitle: 'Keep your reading in flow.', ctaText: 'Lexora is in public beta. Download the ZIP, extract it, and load the unpacked extension from Chrome developer mode. Then tell us which terms or moments it should handle better.', apply: 'Download v0.8.7', feedback: 'Feedback or support', privacy: 'Privacy policy', demo: 'Open concept hub demo',
  };

  return <div className="overflow-hidden bg-ts-canvas text-ts-ink">
    <section className="relative">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:px-12 md:py-28 lg:gap-20">
        <div className="flex flex-col justify-center">
          <div className="mb-7 flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-ts-ink/60">{copy.eyebrow}</div>
          <h1 className="whitespace-pre-line text-4xl font-semibold leading-[1.15] tracking-[-0.045em] md:text-5xl lg:text-[54px]">{copy.title}</h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-ts-ink/65 md:text-lg">{copy.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href={downloadUrl} className="inline-flex items-center gap-2 rounded-full bg-ts-ink px-5 py-3 text-sm font-medium text-ts-canvas transition-transform hover:-translate-y-0.5"><Download size={16} />{copy.primary}</a><a href="#how-it-works" className="inline-flex items-center gap-2 rounded-full border border-ts-ink/15 px-5 py-3 text-sm font-medium transition-colors hover:bg-ts-ink/5"><ArrowRight size={16} />{copy.secondary}</a></div>
          <p className="mt-5 text-xs tracking-wide text-ts-muted">{copy.test}</p>
        </div>
        <div className="relative mx-auto w-full max-w-[640px] self-center"><img src="/assets/lexora/ai-result.jpg" alt="Lexora 浏览器扩展解读界面" className="relative w-full rounded-2xl border border-ts-hairline bg-ts-surface/60 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" /></div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[0.75fr_1.25fr] md:px-12 md:py-28">
      <div><p className="text-xs font-semibold tracking-[0.18em] text-ts-ink">WHY LEXORA</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">{copy.what}</h2><p className="mt-5 max-w-md leading-8 text-ts-muted">{copy.whatText}</p></div>
      <div className="grid gap-4 sm:grid-cols-3">{copy.features.map(([title, text], index) => <article key={title} className="rounded-2xl border border-ts-hairline bg-ts-surface/60 backdrop-blur-2xl shadow-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"><div className="mb-8 text-ts-ink">{index === 0 ? <MousePointer2 size={22} /> : index === 1 ? <Layers3 size={22} /> : <MessageCircle size={22} />}</div><h3 className="font-semibold text-ts-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-ts-body">{text}</p></article>)}</div>
    </section>

    <section id="how-it-works"><div className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28"><p className="text-xs font-semibold tracking-[0.18em] text-ts-ink">{copy.flow}</p><div className="mt-10 grid gap-5 md:grid-cols-3">{copy.steps.map(([number, title, text]) => <article key={number} className="rounded-2xl border border-ts-hairline bg-ts-surface/60 backdrop-blur-2xl shadow-xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"><span className="text-sm font-semibold text-ts-ink">{number}</span><h3 className="mt-10 text-xl font-semibold text-ts-ink">{title}</h3><p className="mt-3 leading-7 text-ts-body">{text}</p></article>)}</div></div></section>

    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:px-12 md:py-28"><div className="overflow-hidden rounded-2xl border border-ts-hairline bg-ts-surface/60 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"><img src="/assets/lexora/selection.jpg" alt="Lexora 划词后显示 L 解读入口" className="h-full w-full object-cover" /></div><div className="flex flex-col justify-center"><BookOpen className="text-ts-ink" size={25} /><h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] md:text-4xl text-ts-ink">{copy.madeFor}</h2><p className="mt-5 max-w-lg leading-8 text-ts-muted">{copy.madeForText}</p><div className="mt-8 flex items-start gap-3 rounded-xl border border-ts-hairline bg-ts-surface/60 backdrop-blur-2xl shadow-xl p-4 text-sm leading-6 text-ts-body transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"><Check className="mt-0.5 shrink-0 text-ts-ink" size={17} />{copy.sourceText}</div><h3 className="mt-7 font-semibold text-ts-ink">{copy.sourceTitle}</h3></div></section>

    <section><div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28"><h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">{copy.ctaTitle}</h2><p className="mx-auto mt-5 max-w-2xl leading-8 text-ts-muted">{copy.ctaText}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><a href={downloadUrl} className="inline-flex items-center gap-2 rounded-full bg-ts-ink px-5 py-3 text-sm font-medium text-ts-canvas"><Download size={16} />{copy.apply}</a><a href={supportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ts-ink/15 px-5 py-3 text-sm font-medium hover:bg-ts-ink/5"><ExternalLink size={16} />{copy.feedback}</a></div><div className="mt-7 flex justify-center gap-5 text-xs text-ts-muted underline underline-offset-4"><a href={privacyUrl} target="_blank" rel="noreferrer">{copy.privacy}</a><Link to="/lexora/app">{copy.demo}</Link></div></div></section>
  </div>;
};
