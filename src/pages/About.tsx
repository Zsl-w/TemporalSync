import { useRef, useEffect, useCallback } from 'react';
import { Github, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { SplitText } from '../components/SplitText';

gsap.registerPlugin(ScrollTrigger);

export const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroInnerRef = useRef<HTMLDivElement>(null);
  const studioSectionRef = useRef<HTMLDivElement>(null);
  const atlasSectionRef = useRef<HTMLDivElement>(null);
  const { language } = useSettings();

  useGSAP(() => {
    // 1. Hero Content slide up and fade out as we scroll
    if (heroInnerRef.current) {
      gsap.to(heroInnerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom 40%',
          scrub: true,
        },
        y: -100,
        opacity: 0,
        ease: 'none',
      });
    }

    // 2. TSync Studio section animations (text and mockup)
    if (studioSectionRef.current) {
      gsap.fromTo('.studio-info-panel', 
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: studioSectionRef.current,
            start: 'top 85%',
            end: 'top 50%',
            scrub: true,
          },
          y: 0,
          opacity: 1,
          ease: 'power2.out',
        }
      );
      gsap.fromTo('.studio-visual-panel', 
        { y: 80, opacity: 0, scale: 0.96 },
        {
          scrollTrigger: {
            trigger: studioSectionRef.current,
            start: 'top 80%',
            end: 'top 45%',
            scrub: true,
          },
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
        }
      );
    }

    // 3. TSync Atlas section animations (text and mockup)
    if (atlasSectionRef.current) {
      gsap.fromTo('.atlas-info-panel', 
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: atlasSectionRef.current,
            start: 'top 85%',
            end: 'top 50%',
            scrub: true,
          },
          y: 0,
          opacity: 1,
          ease: 'power2.out',
        }
      );
      gsap.fromTo('.atlas-visual-panel', 
        { y: 80, opacity: 0, scale: 0.96 },
        {
          scrollTrigger: {
            trigger: atlasSectionRef.current,
            start: 'top 80%',
            end: 'top 45%',
            scrub: true,
          },
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
        }
      );
    }
  }, { scope: containerRef });

  const line1 = language === 'zh' ? '白昼，与万象同频。' : 'By day, I sync intelligence.';
  const line2 = language === 'zh' ? '入夜，为时间塑形。' : 'By night, I shape time.';

  const heroCopy =
    language === 'zh'
      ? '一个人的时间工作室：整理智能情报，记录创造过程，把高速流动的信息变成可读、可用、可回看的节奏。'
      : 'A one-person time studio for intelligence, writing, and tools that turn fast-moving signals into usable rhythm.';

  const titleClass = 'max-w-none w-full text-center font-display text-[44px] font-bold leading-none tracking-[0.03em] md:text-[76px] lg:text-[92px] lg:tracking-[0.06em] lg:whitespace-nowrap';

  return (
    <div ref={containerRef} className="relative flex flex-col overflow-hidden">
      <section className="relative z-10 min-h-screen overflow-hidden px-6 pb-10 pt-24 md:px-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:96px_96px] opacity-40" />
          <div className="absolute left-[-8%] top-[17%] h-[58vh] w-[48vw] rotate-[-11deg] rounded-full border border-ts-hairline blur-[1px]" />
          <div className="absolute left-[18%] top-[11%] h-[82vh] w-[1px] rotate-[72deg] bg-ts-hairline" />
        </div>

        <div ref={heroInnerRef} className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center gap-10">
          <div className="relative z-10 max-w-[1300px] select-none pb-8 md:pb-14 flex flex-col items-center justify-center text-center mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-12 flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.48em] text-ts-muted"
            >
              <span className="h-px w-12 bg-ts-muted/50" />
              <span>TemporalSync studio</span>
              <span className="h-px w-12 bg-ts-muted/50" />
            </motion.div>

            {/* Hero Title Area */}
            <div className="relative w-full">
              {/* === Base Layer: animated entrance, dark ink text === */}
              <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-5 w-full">
                <SplitText
                  text={line1}
                  className={`${titleClass} text-ts-ink drop-shadow-[0_4px_12px_rgba(255,255,255,0.01)] pointer-events-none`}
                  delay={32}
                  duration={0.9}
                  ease="power3.out"
                  splitType={language === 'zh' ? 'chars' : 'words'}
                  from={{ opacity: 0, y: 42 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="center"
                  overflow="visible"
                  tag="h1"
                />
                <SplitText
                  text={line2}
                  className={`${titleClass} text-ts-ink drop-shadow-[0_4px_12px_rgba(255,255,255,0.01)] pointer-events-none`}
                  delay={48}
                  duration={0.9}
                  ease="power3.out"
                  splitType={language === 'zh' ? 'chars' : 'words'}
                  from={{ opacity: 0, y: 42 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="center"
                  overflow="visible"
                  tag="h1"
                />
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.25, ease: 'easeOut' }}
              className="mt-10 max-w-[720px] mx-auto text-[15px] font-semibold leading-relaxed text-ts-body md:text-lg text-center"
            >
              {heroCopy}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease: 'easeOut' }}
              className="mt-14 flex flex-wrap items-center justify-center gap-3"
            >
              {['AI WATCH', 'WRITING', 'TOOLS', 'STUDIO ID'].map(item => (
                <span
                  key={item}
                  className="border border-ts-hairline bg-ts-surface px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-ts-body/80"
                >
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
            className="absolute right-[5%] top-[3%] hidden max-w-[260px] text-right text-xl font-bold leading-snug text-ts-muted lg:block"
          >
            <p>AI signal watcher & writer of systems.</p>
            <p>Studio of one.</p>
          </motion.div>
        </div>
      </section>

      {/* TSync Studio Section */}
      <section ref={studioSectionRef} className="project-scroll-section py-20 lg:py-32 relative z-10">
        <div className="project-layout">
          <div className="project-info studio-info-panel">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-ts-shiyun-green">
              <span>TSync Studio</span>
              <span className="h-px w-6 bg-ts-shiyun-green/45" />
            </div>
            <h2 className="font-display text-3xl font-bold md:text-4xl text-ts-ink leading-tight">
              {language === 'zh' ? '公众号深度文章工作台' : 'In-depth WeChat Article Studio'}
            </h2>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-ts-body">
              {language === 'zh' 
                ? '专为深度创作者打造的智能写作空间。将零散的研究数据、论文证据一键梳理，自动生成逻辑严密、来源可追溯的微信公众号文章草稿，让智能为你的表达赋予深度。'
                : 'A smart writing environment for creators. Turn raw research notes, data, and papers into cohesive, rigorous, and traceable WeChat drafts with one click. Let intelligence empower your writing.'}
            </p>
            <div className="mt-4">
              <a
                href="https://studio.temporalsync.online/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-ts-shiyun-green bg-ts-shiyun-green-soft/60 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider text-ts-shiyun-ink hover:bg-ts-shiyun-green hover:text-white transition-all uppercase"
              >
                {language === 'zh' ? '进入 Studio 工作台' : 'Open Studio Workspace'}
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <div className="project-visual studio-visual-panel">
            <div className="ui-mockup-browser">
              <div className="browser-header">
                <div className="browser-dots">
                  <div className="browser-dot red" />
                  <div className="browser-dot yellow" />
                  <div className="browser-dot green" />
                </div>
                <div className="browser-address">studio.temporalsync.online</div>
              </div>
              <div className="browser-body">
                {/* Simulated outline */}
                <div className="studio-outline">
                  <div className="font-semibold text-[9px] uppercase tracking-wider mb-2">
                    {language === 'zh' ? '大纲/数据' : 'OUTLINES'}
                  </div>
                  <div className="studio-outline-item opacity-90 w-full" />
                  <div className="studio-outline-item opacity-70 w-[80%]" />
                  <div className="studio-outline-item opacity-80 w-[90%]" />
                  <div className="studio-outline-item opacity-60 w-[75%]" />
                </div>
                {/* Simulated editor */}
                <div className="studio-editor">
                  <div className="studio-editor-title">
                    {language === 'zh' ? 'AI 与人类智能的协同演化' : 'Co-evolution of AI & Human'}
                  </div>
                  <div className="flex flex-col gap-2 opacity-80 leading-relaxed text-[10px]">
                    <p>
                      {language === 'zh' 
                        ? '在信息高速流动的时代，如何将碎片化的智能情报转化为深度思考？' 
                        : 'In the era of rapid information flow, how do we turn fragmented intelligence into deep thinking?'}
                    </p>
                    <p>
                      {language === 'zh' 
                        ? 'TSync 提供了一种全新的结构化写作方案。通过对学术论文和可信数据的追溯验证，为内容创作者提供高可信度的知识支撑...' 
                        : 'TSync provides a brand-new structured writing paradigm. By tracing and verifying academic papers, we provide creators with highly credible knowledge support...'}
                    </p>
                  </div>
                </div>
                {/* Simulated WeChat Preview */}
                <div className="studio-preview">
                  <div className="studio-preview-header">
                    {language === 'zh' ? '公众号预览' : 'PREVIEW'}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="font-bold text-[10px] text-ts-shiyun-ink">
                      {language === 'zh' ? '协同智能的未来趋势' : 'Future Trends of Co-Intelligence'}
                    </div>
                    <div className="text-[7px] text-ts-shiyun-muted flex items-center gap-1">
                      <span>时韵 TemporalSync</span>
                    </div>
                    <div className="h-12 bg-white/60 border border-ts-shiyun-green/10 rounded p-1 text-[8px] opacity-90 overflow-hidden leading-normal">
                      {language === 'zh' ? '在信息爆炸中寻找可信的节奏，让AI与研究报告无缝融合，创作可追溯、可验证的深度文章。' : 'Seeking a trusted rhythm in information explosion, blending AI and research seamlessly into verifiable deep articles.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TSync Atlas Section */}
      <section ref={atlasSectionRef} className="project-scroll-section py-20 lg:py-32 relative z-10">
        <div className="project-layout">
          <div className="project-info atlas-info-panel">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-ts-primary">
              <span>TSync Atlas</span>
              <span className="h-px w-6 bg-ts-primary/45" />
            </div>
            <h2 className="font-display text-3xl font-bold md:text-4xl text-ts-ink leading-tight">
              {language === 'zh' ? '可信知识可视化' : 'Trusted Knowledge Visualizer'}
            </h2>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-ts-body">
              {language === 'zh' 
                ? '把复杂的科学发现与可信研究转化为结构化的可视化卡片。每一张知识卡片都清晰展示出其所依赖的客观证据链、边界条件与潜在反证，构建直观、可编辑、可溯源的知识图谱。'
                : 'Transform complex scientific discoveries and trusted research into structured visual cards. Each card explicitly displays its supporting evidence chains, boundaries, and counterarguments, creating an intuitive, editable, and traceable knowledge map.'}
            </p>
            <div className="mt-4">
              <a
                href="https://atlas.temporalsync.online/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-ts-primary bg-ts-primary-bg px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider text-ts-ink hover:bg-ts-primary hover:text-white transition-all uppercase"
              >
                {language === 'zh' ? '进入 Atlas 画布' : 'Open Atlas Canvas'}
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <div className="project-visual atlas-visual-panel">
            <div className="ui-mockup-browser">
              <div className="browser-header">
                <div className="browser-dots">
                  <div className="browser-dot red" />
                  <div className="browser-dot yellow" />
                  <div className="browser-dot green" />
                </div>
                <div className="browser-address">atlas.temporalsync.online</div>
              </div>
              <div className="browser-body">
                <div className="atlas-canvas">
                  {/* Claim Card */}
                  <div className="atlas-mock-card" style={{ top: '25px', left: '25px', width: '220px' }}>
                    <div className="atlas-card-meta">{language === 'zh' ? '论点卡片' : 'CLAIM'} CARD-01</div>
                    <div className="atlas-card-title">{language === 'zh' ? '智能共生效应显著' : 'Co-Intelligence Effect'}</div>
                    <div className="text-[8px] text-ts-muted flex justify-between">
                      <span>{language === 'zh' ? '可信度 94%' : 'Confidence 94%'}</span>
                      <span>12 {language === 'zh' ? '条研究证据' : 'evidences'}</span>
                    </div>
                  </div>

                  {/* Evidence Card */}
                  <div className="atlas-mock-card" style={{ bottom: '30px', right: '35px', width: '220px' }}>
                    <div className="atlas-card-meta">{language === 'zh' ? '支持证据' : 'EVIDENCE'} EVI-07</div>
                    <div className="atlas-card-title">{language === 'zh' ? '双盲对照实验证实协同增效' : 'Double-Blind Study Confirms'}</div>
                    <div className="text-[8px] text-ts-muted">
                      {language === 'zh' ? '来源: Nature Intelligence (2025)' : 'Source: Nature Intelligence (2025)'}
                    </div>
                  </div>

                  {/* SVG animated connections */}
                  <svg className="atlas-svg-overlay w-full h-full">
                    <path 
                      d="M 135 75 Q 260 100, 320 310" 
                      className="atlas-svg-path"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <footer className="relative z-10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 text-[12px] text-ts-muted sm:flex-row sm:gap-4">
            <span>&copy; {new Date().getFullYear()} TemporalSync</span>
            <span className="hidden opacity-30 sm:inline">|</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ts-ink"
            >
              渝ICP备2026010591号-1
            </a>
            <span className="hidden opacity-30 sm:inline">|</span>
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=50010602505214"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-ts-ink"
            >
              <img
                src="/assets/备案图标.png"
                alt="公安备案图标"
                className="h-4 w-4 object-contain"
              />
              <span>渝公网安备50010602505214号</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-ts-muted transition-colors hover:text-ts-ink">
              <Github size={16} />
            </a>
            <a href="mailto:hello@example.com" className="text-ts-muted transition-colors hover:text-ts-ink">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
