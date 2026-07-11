import React, { useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Code, AppWindow, ArrowRight, Heart, Star } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';



export const StudyRoom = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useSettings();

  const apps = useMemo(() => [
    {
      id: 'md2red',
      title: 'md2red',
      subtitle: language === 'zh' ? '小红书排版卡片生成器' : 'Markdown to Xiaohongshu Card',
      desc: language === 'zh' 
        ? '一键将 Markdown 格式 of 笔记、文章转化为符合小红书（Red）社交风格、精美排版、带表情符号和智能标签的移动端分享卡片，极大提升内容分发速度。'
        : 'Convert your Markdown files instantly into beautiful, mobile-friendly social sharing cards styled for Xiaohongshu (Red), with automatic emoji insertion and tag layout.',
      features: language === 'zh'
        ? [
            '🚀 智能解析与爆款排版样式匹配',
            '💡 自动提取核心论点，插入丰富契合的 Emoji 表情包',
            '📌 智能分类并追加社交平台爆款话题标签（Tag）',
            '🎨 响应式卡片排布与导出支持'
          ]
        : [
            '🚀 Intelligent Markdown compilation and formatting alignment',
            '💡 Automated emoji matching to keep readers engaged',
            '📌 Social media tag layout generator',
            '🎨 Export-ready mobile design templates'
          ],
      isInteractive: false,
      imageContent: (
        <div className="card w-full aspect-[4/3] relative rounded-2xl overflow-hidden bg-gradient-to-br from-rose-950 via-pink-900 to-neutral-950 border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.3)] group flex items-center justify-center p-8 select-none">
          {/* Subtle Ambient Mesh Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(244,63,94,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          
          {/* Glassmorphic Mobile Card Mockup */}
          <div className="relative z-10 w-[55%] aspect-[3/4.2] bg-white/[0.03] dark:bg-black/25 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-[1.03] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            {/* Mock Image Top Banner */}
            <div className="h-16 bg-gradient-to-tr from-rose-500 via-pink-500 to-orange-400 relative flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold tracking-widest text-white/50 uppercase">COVER CARD</span>
            </div>
            
            {/* Card Content */}
            <div className="flex-1 p-3.5 space-y-3 text-left">
              <div className="space-y-1">
                <div className="h-3 w-[90%] bg-white/10 rounded-md" />
                <div className="h-3 w-[70%] bg-white/10 rounded-md" />
              </div>
              
              {/* Bullets with tiny emoji mockup lines */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px]">📌</span>
                  <div className="h-1.5 w-full bg-white/5 rounded-full" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px]">🚀</span>
                  <div className="h-1.5 w-[85%] bg-white/5 rounded-full" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px]">💡</span>
                  <div className="h-1.5 w-[90%] bg-white/5 rounded-full" />
                </div>
              </div>

              {/* Tags at bottom */}
              <div className="flex gap-1 pt-1.5">
                <div className="h-3.5 px-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[7px] font-mono">#时间同步</div>
                <div className="h-3.5 px-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[7px] font-mono">#自律</div>
              </div>
            </div>
          </div>
          
          {/* Floating Heart / Like badge */}
          <div className="absolute top-10 right-10 z-20 bg-rose-500 text-white font-bold text-[9px] font-mono rounded-full px-2.5 py-1 flex items-center gap-1 shadow-lg shadow-rose-500/20 transform -translate-y-2 translate-x-2 transition-transform duration-700 group-hover:translate-y-0 group-hover:translate-x-0">
            <Heart size={10} fill="currentColor" />
            <span>99+</span>
          </div>

          {/* Floating Sparkles badge */}
          <div className="absolute bottom-10 left-10 z-20 bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 text-white/70 text-[9px] font-mono rounded-full px-2.5 py-1 flex items-center gap-1 shadow-lg transform translate-y-2 -translate-x-2 transition-transform duration-700 group-hover:translate-y-0 group-hover:translate-x-0">
            <Sparkles size={10} className="text-orange-400" />
            <span>Card generated</span>
          </div>
        </div>
      ),
      link: '/md2red'
    },
    {
      id: 'shiyun-wechat-md',
      title: 'shiyun-wechat-md',
      subtitle: language === 'zh' ? '时韵公众号排版转换器' : 'Shiyun WeChat Post Converter',
      desc: language === 'zh'
        ? '专门为「时韵的AI自习室」定制的公众号排版工具。支持将 Markdown 瞬间排版为优雅、清新的公众号推文格式，并提供快捷复制功能。'
        : 'A Markdown-to-WeChat post formatter custom-tailored for the Shiyun brand. Parses headers, quotes, lists, and tables into responsive WeChat styles.',
      features: language === 'zh'
        ? [
            '🎨 极简清新设计，特调「时韵自习室」公众号主题配色',
            '📈 内置文章结构化解析（大标题、序号标题、引用块）',
            '📋 支持一键复制富文本至微信公众号后台，格式无缝对接',
            '⚡ 支持表格与行内代码块的优雅美化排版'
          ]
        : [
            '🎨 Custom color scheme aligned with WeChat official account branding',
            '📈 Pre-defined WeChat styling structures for headings, tables, and quotes',
            '📋 One-click clipboard copy as Rich Text for zero-hassle formatting',
            '⚡ Formats inline code and tables automatically'
          ],
      isInteractive: false,
      imageContent: (
        <div className="card w-full aspect-[4/3] relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-950 via-emerald-900 to-neutral-950 border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.3)] group flex items-center justify-center p-8 select-none">
          {/* Subtle Ambient Mesh Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          
          {/* Glassmorphic Document Board */}
          <div className="relative z-10 w-[75%] aspect-[1.4/1] bg-white/[0.03] dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-5 flex flex-col justify-between transition-all duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-[1.03] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            {/* Top Bar / Header of Mock Document */}
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
              <div className="h-3 w-20 bg-white/10 rounded-full" />
              <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center text-[7px] text-teal-400 font-bold font-mono">EN</div>
            </div>

            {/* Content Abstract Lines with Green Highlight Elements */}
            <div className="flex-1 py-4 space-y-3 flex flex-col justify-center">
              <div className="space-y-1.5">
                <div className="h-3.5 w-[85%] bg-gradient-to-r from-teal-400/30 to-emerald-400/10 rounded-md" />
                <div className="h-2 w-full bg-white/5 rounded-full" />
                <div className="h-2 w-[90%] bg-white/5 rounded-full" />
              </div>

              {/* Blockquote Mockup with distinct Teal sidebar */}
              <div className="border-l-[3px] border-teal-400 pl-3 py-1 space-y-1 bg-teal-500/[0.03] rounded-r">
                <div className="h-1.5 w-[70%] bg-white/10 rounded-full" />
                <div className="h-1.5 w-[60%] bg-white/10 rounded-full" />
              </div>
            </div>

            {/* Bottom floating format pill */}
            <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-mono text-white/40">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500/30 border border-teal-500/50" />
                <span>Format: WeChat Style</span>
              </div>
              <div className="h-5 px-3 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold flex items-center gap-1">
                <span>Copy Rich Text</span>
              </div>
            </div>
          </div>
          
          {/* Secondary floating element */}
          <div className="absolute bottom-6 right-8 z-20 bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 shadow-lg text-[9px] font-mono text-white/60 flex items-center gap-1.5 transform translate-y-2 translate-x-2 transition-transform duration-700 group-hover:translate-y-0 group-hover:translate-x-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Ready for copy</span>
          </div>
        </div>
      ),
      link: '/shiyun-wechat-md'
    },
    {
      id: 'timesync-agent',
      title: 'TimeSync Agent',
      subtitle: language === 'zh' ? 'AI 神经元信息集成流' : 'AI Synaptic Information Stream',
      desc: language === 'zh'
        ? '本站后台运行的自动资讯整合程序。通过爬虫与大语言模型 (MIMO) 协同，全天候定时抓取海量科研动态、社媒观点与论文发布，自动进行去噪、归纳、翻译与分类。'
        : 'The automated intelligence collection server running behind this project. Cooperating with crawlers and LLMs, it scrapes paper releases, social posts, and compiles them in real-time.',
      features: language === 'zh'
        ? [
            '🧠 基于 MIMO 大模型进行智能分类与高质量翻译',
            '🛡️ 内置容错抓取机制，多层缓冲防止 304 或服务中断',
            '⚡ 自动关联作者社交账号头图以提高信息可读性',
            '📈 生成全时段的科技同步增长与热点板块分布曲线'
          ]
        : [
            '🧠 Intelligent translation & enrichment powered by MIMO',
            '🛡️ Robust fallback scrapers caching local content seamlessly',
            '⚡ Localized proxy for user profile picture delivery',
            '📈 Synaptic distribution metadata generated daily'
          ],
      isInteractive: false,
      imageContent: (
        <div className="card w-full aspect-[4/3] relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.3)] group flex items-center justify-center p-8 select-none">
          {/* Subtle Ambient Mesh Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          
          {/* Glowing orbital lines / Abstract AI core */}
          <div className="absolute w-48 h-48 rounded-full border border-dashed border-indigo-500/25 animate-[spin_40s_linear_infinite]" />
          <div className="absolute w-36 h-36 rounded-full border border-indigo-500/10 animate-[spin_20s_linear_infinite_reverse]" />
          
          {/* Glowing AI Core Node */}
          <div className="absolute w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center backdrop-blur-sm shadow-[0_0_40px_rgba(99,102,241,0.15)] group-hover:scale-105 transition-transform duration-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Code size={18} className="animate-pulse" />
            </div>
          </div>
          
          {/* Floating Data Node 1 - Scraper */}
          <div className="absolute top-12 left-12 z-20 bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 shadow-lg flex flex-col gap-1 transition-all duration-700 ease-out group-hover:translate-x-1 group-hover:translate-y-1">
            <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Scraper</span>
            <div className="h-1.5 w-12 bg-white/10 rounded-full" />
            <div className="h-1 w-8 bg-emerald-500/30 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>

          {/* Floating Data Node 2 - MIMO LLM */}
          <div className="absolute bottom-12 right-12 z-20 bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 shadow-lg flex flex-col gap-1 transition-all duration-700 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1">
            <span className="text-[8px] font-mono text-purple-400 font-bold uppercase tracking-wider">MIMO LLM</span>
            <div className="h-1.5 w-16 bg-white/10 rounded-full" />
            <span className="text-[8px] text-white/40">Translate & Tag</span>
          </div>

          {/* Connected Synaptic Lines Mockup */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-indigo-500/20" strokeWidth="1" fill="none">
            <line x1="20%" y1="20%" x2="50%" y2="50%" strokeDasharray="3 3" />
            <line x1="80%" y1="80%" x2="50%" y2="50%" strokeDasharray="3 3" />
          </svg>
        </div>
      )
    }
  ], [language]);

  const t = {
    zh: {
      tag: '开发沙盒',
      title: '自习室',
      subtitle: '探索我的独立应用与实验原型',
      exploreBtn: '了解详情',
      upcomingTitle: '更多好玩的正在神经元中孕育...',
      upcomingDesc: '每一次开发都是为了在数据洪流中留下思考的锚点。'
    },
    en: {
      tag: 'Dev Sandbox',
      title: 'WORK',
      subtitle: 'Explore my independent apps and prototypes',
      exploreBtn: 'Explore',
      upcomingTitle: 'More experiments are brewing...',
      upcomingDesc: 'Every project is an anchor of thought in the torrent of information.'
    }
  }[language];

  return (
    <div className="w-full min-h-screen flex flex-col bg-ts-canvas">
      <div ref={containerRef} className="pb-24 immersive-section text-left pt-10 space-y-16">

      {/* Alternating App Showcase Grid */}
      <div className="space-y-24">
        {apps.map((app, index) => {
          // zigzag: index % 2 === 0 -> media left, desc right; index % 2 === 1 -> media right, desc left
          const isReverse = index % 2 === 1;

          return (
            <motion.div 
              key={app.id} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
              className={cn(
                "flex flex-col gap-10 lg:gap-16 items-center justify-between w-full",
                isReverse ? "lg:flex-row-reverse" : "lg:flex-row"
              )}
            >
              {/* Media Display Area (Interactive Component or Image) */}
              <div className="w-full lg:w-1/2">
                {app.imageContent}
              </div>

              {/* Description Content Area */}
              <div className="w-full lg:w-[45%] space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase text-ts-primary px-2.5 py-0.5 rounded bg-ts-primary/10">
                      {app.title}
                    </span>
                    <Sparkles className="text-ts-primary" size={14} />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ts-ink leading-tight">
                    {app.subtitle}
                  </h3>
                  <p className="text-sm text-ts-muted leading-relaxed pt-2">
                    {app.desc}
                  </p>
                </div>

                {/* Bullet features */}
                <ul className="space-y-2.5">
                  {app.features.map((feature, i) => (
                    <li key={i} className="text-xs font-medium text-ts-body flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ts-primary/80 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Call to action (if applicable) */}
                {app.link && (
                  <div className="pt-4">
                    {app.link.startsWith('/') ? (
                      <Link
                        to={app.link}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-ts-navy-800 hover:bg-ts-navy-900 text-white text-xs font-bold transition-all hover:translate-x-1 shadow-sm font-display uppercase tracking-wider"
                      >
                        {language === 'zh' ? '前往体验' : 'Visit App'}
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <a
                        href={app.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-ts-navy-800 hover:bg-ts-navy-900 text-white text-xs font-bold transition-all hover:translate-x-1 shadow-sm font-display uppercase tracking-wider"
                      >
                        {language === 'zh' ? '前往体验' : 'Visit App'}
                        <ArrowRight size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lab Footer / Upcoming section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: apps.length * 0.15 + 0.1 }}
        className="card p-10 flex flex-col items-center text-center max-w-3xl mx-auto bg-ts-surface-elevated/40 shadow-sm"
      >
        <AppWindow size={36} className="text-ts-primary/45 mb-4 animate-pulse" />
        <h4 className="text-base font-bold text-ts-ink uppercase tracking-wider">{t.upcomingTitle}</h4>
        <p className="text-xs text-ts-muted mt-2 max-w-md">{t.upcomingDesc}</p>
      </motion.div>
      </div>
    </div>
  );
};
