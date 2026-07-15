import { useRef } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { SplitText } from '../components/SplitText';

export const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useSettings();

  const line1 = language === 'zh' ? '与智能同频，向医学求真。' : 'In sync with intelligence.';
  const line2 = language === 'zh' ? '用代码造物，为时间留痕。' : 'Building what endures.';

  const heroCopy =
    language === 'zh'
      ? '我是十月七，一名 AI 医学方向的准研究生，也是一人开发者。这里记录我如何把情报、研究与创作，沉淀为可复用的知识、工具和作品。'
      : 'I am October Seven, an incoming graduate student in AI medicine and an independent developer. This is where signals, research, and creative work become reusable knowledge, tools, and products.';

  const eyebrow = language === 'zh' ? '十月七 · TEMPORALSYNC' : 'OCTOBER SEVEN · TEMPORALSYNC';

  const titleClass = 'max-w-none w-full text-center font-display text-[27px] font-bold leading-none tracking-[0.01em] sm:text-[44px] sm:tracking-[0.03em] md:text-[76px] lg:text-[92px] lg:tracking-[0.06em] lg:whitespace-nowrap';

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
            <span>{eyebrow}</span>
            <span className="h-px w-12 bg-ts-muted/50" />
          </motion.div>

          {/* Hero Title Area */}
          <div className="relative w-full">
            <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-5 w-full">
              <SplitText
                key={`${language}-hero-line-1`}
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
                key={`${language}-hero-line-2`}
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

          {/* Primary product paths */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: 'easeOut' }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/hot"
              className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-ts-primary px-6 text-sm font-bold text-white shadow-lg shadow-ts-primary/10 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ts-canvas"
            >
              {language === 'zh' ? '浏览 AI 情报' : 'Explore AI Signals'}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/work"
              className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-ts-hairline bg-ts-surface/70 px-6 text-sm font-bold text-ts-ink transition-colors hover:bg-ts-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
            >
              {language === 'zh' ? '打开创作工具' : 'Open Creative Tools'}
            </Link>
          </motion.div>
        </div>

        {/* Floating Side Info Panel (keeps layout balanced) */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
          className="absolute right-[5%] top-[10%] hidden max-w-[260px] text-right text-sm font-bold leading-snug text-ts-muted lg:block"
        >
          <p>AI MEDICINE · INDEPENDENT DEV</p>
          <p>RESEARCH · WRITING · SYSTEMS</p>
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
            <a href="mailto:contact@temporalsync.online" aria-label="Email" className="text-ts-muted transition-colors hover:text-ts-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
