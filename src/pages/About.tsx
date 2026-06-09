import { useRef } from 'react';
import { Github, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

import { SplitText } from '../components/SplitText';

export const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useSettings();

  const heroTitle =
    language === 'zh'
      ? '白天，我同步信息。夜晚，我制造时间感。'
      : 'By day, I sync intelligence. By night, I shape time.';

  const heroCopy =
    language === 'zh'
      ? '一个人的时间工作室：整理智能情报，记录创造过程，把高速流动的信息变成可读、可用、可回看的节奏。'
      : 'A one-person time studio for intelligence, writing, and tools that turn fast-moving signals into usable rhythm.';

  return (
    <div ref={containerRef} className="relative flex flex-col overflow-hidden">
      <section className="relative z-10 min-h-screen overflow-hidden px-6 pb-10 pt-24 md:px-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:96px_96px] opacity-35" />
          <div className="absolute left-[-8%] top-[17%] h-[58vh] w-[48vw] rotate-[-11deg] rounded-full border border-white/10 blur-[1px]" />
          <div className="absolute left-[18%] top-[11%] h-[82vh] w-[1px] rotate-[72deg] bg-white/12" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-end justify-between gap-10">
          <div className="relative z-10 max-w-[920px] select-none pb-8 md:pb-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-8 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.48em] text-[#9e9488]"
            >
              <span className="h-px w-12 bg-[#9e9488]/50" />
              <span>TemporalSync studio</span>
            </motion.div>

            <SplitText
              text={heroTitle}
              className="max-w-[960px] text-left font-sans text-[48px] font-black leading-[1.04] tracking-normal text-[#f0e8e0] drop-shadow-[0_18px_55px_rgba(0,0,0,0.72)] md:text-[82px] lg:text-[94px]"
              delay={32}
              duration={0.9}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 42 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="left"
              overflow="visible"
              tag="h1"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.25, ease: 'easeOut' }}
              className="mt-7 max-w-[620px] text-[15px] font-semibold leading-relaxed text-[#c8bfb4]/90 md:text-lg"
            >
              {heroCopy}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease: 'easeOut' }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              {['AI WATCH', 'WRITING', 'TOOLS', 'STUDIO ID'].map(item => (
                <span
                  key={item}
                  className="border border-[#9e9488]/18 bg-[#9e9488]/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#c8bfb4]/74"
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
            className="absolute right-[5%] top-[3%] hidden max-w-[260px] text-right text-xl font-bold leading-snug text-[#c8bfb4]/66 lg:block"
          >
            <p>AI signal watcher.</p>
            <p>Writer of systems.</p>
            <p>Studio of one.</p>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#e8e0d8]/10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 text-[12px] text-[#9e9488] sm:flex-row sm:gap-4">
            <span>&copy; {new Date().getFullYear()} TemporalSync</span>
            <span className="hidden opacity-30 sm:inline">|</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#e8e0d8]"
            >
              渝ICP备2026010591号-1
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#9e9488] transition-colors hover:text-[#e8e0d8]">
              <Github size={16} />
            </a>
            <a href="mailto:hello@example.com" className="text-[#9e9488] transition-colors hover:text-[#e8e0d8]">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
