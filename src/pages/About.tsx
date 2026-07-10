import { useRef } from 'react';
import { Github, Mail, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { SplitText } from '../components/SplitText';

export const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useSettings();

  const line1 = language === 'zh' ? '白昼，与万象同频。' : 'By day, I sync intelligence.';
  const line2 = language === 'zh' ? '入夜，为时间塑形。' : 'By night, I shape time.';

  const heroCopy =
    language === 'zh'
      ? '一个人的时间工作室：整理智能情报，记录创造过程，把高速流动的信息变成可读、可用、可回看的节奏。'
      : 'A one-person time studio for intelligence, writing, and tools that turn fast-moving signals into usable rhythm.';

  const titleClass = 'max-w-none w-full text-center font-display text-[44px] font-bold leading-none tracking-[0.03em] md:text-[76px] lg:text-[92px] lg:tracking-[0.06em] lg:whitespace-nowrap';

  return (
    <div ref={containerRef} className="w-full min-h-screen flex flex-col bg-ts-canvas">
      {/* 1. HERO CONTENT SECTION */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative py-12">
        {/* Background Grid & Decorative Shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:96px_96px] opacity-40" />
          <div className="absolute left-[-8%] top-[17%] h-[58vh] w-[48vw] rotate-[-11deg] rounded-full border border-ts-hairline blur-[1px]" />
          <div className="absolute left-[18%] top-[11%] h-[82vh] w-[1px] rotate-[72deg] bg-ts-hairline" />
        </div>

        {/* Hero Content Main Block */}
        <div className="relative z-10 max-w-[1300px] flex flex-col items-center justify-center text-center mx-auto pb-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8 flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.48em] text-ts-muted"
          >
            <span className="h-px w-12 bg-ts-muted/50" />
            <span>TemporalSync studio</span>
            <span className="h-px w-12 bg-ts-muted/50" />
          </motion.div>

          {/* Hero Title Area */}
          <div className="relative w-full">
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

          {/* Subtitle Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.25, ease: 'easeOut' }}
            className="mt-8 max-w-[720px] mx-auto text-[15.3px] font-semibold leading-relaxed text-ts-body md:text-lg text-center"
          >
            {heroCopy}
          </motion.p>

          {/* Studio Focus Badges */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: 'easeOut' }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {['AI WATCH', 'BLOG', 'TOOLS', 'STUDIO ID'].map(item => (
              <span
                key={item}
                className="bg-ts-surface/40 dark:bg-black/10 backdrop-blur-sm px-4.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.28em] text-ts-body/80 shadow-sm"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Floating Side Info Panel (keeps layout balanced) */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
          className="absolute right-[5%] top-[10%] hidden max-w-[260px] text-right text-sm font-bold leading-snug text-ts-muted lg:block"
        >
          <p>AI signal watcher & writer of systems.</p>
          <p>Studio of one.</p>
        </motion.div>
      </div>

      {/* 2. FOOTER SECTION */}
      <footer className="relative z-10 px-6 py-6 border-t border-ts-hairline/25">
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
