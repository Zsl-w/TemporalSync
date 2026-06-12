import { useRef, useEffect, useCallback } from 'react';
import { Github, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

import { SplitText } from '../components/SplitText';

export const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const { language } = useSettings();

  const spotlightRadius = useRef(140);

  useEffect(() => {
    const handleResize = () => {
      spotlightRadius.current = window.innerWidth < 768 ? 80 : 140;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!revealRef.current) return;
    const rect = revealRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cp = `circle(${spotlightRadius.current}px at ${x}px ${y}px)`;
    revealRef.current.style.clipPath = cp;
    (revealRef.current.style as any).WebkitClipPath = cp;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!revealRef.current) return;
    revealRef.current.style.clipPath = 'circle(0px at -300px -300px)';
    (revealRef.current.style as any).WebkitClipPath = 'circle(0px at -300px -300px)';
  }, []);

  const line1 = language === 'zh' ? '白昼，与万象同频。' : 'By day, I sync intelligence.';
  const line2 = language === 'zh' ? '入夜，为时间塑形。' : 'By night, I shape time.';
  const altLine1 = language === 'zh' ? 'By day, I sync intelligence.' : '白昼，与万象同频。';
  const altLine2 = language === 'zh' ? 'By night, I shape time.' : '入夜，为时间塑形。';

  const heroCopy =
    language === 'zh'
      ? '一个人的时间工作室：整理智能情报，记录创造过程，把高速流动的信息变成可读、可用、可回看的节奏。'
      : 'A one-person time studio for intelligence, writing, and tools that turn fast-moving signals into usable rhythm.';

  const titleClass = 'max-w-none w-full text-center font-display text-[44px] font-bold leading-none tracking-[0.03em] md:text-[76px] lg:text-[92px] lg:tracking-[0.06em] lg:whitespace-nowrap';

  return (
    <div ref={containerRef} className="relative flex flex-col overflow-hidden">
      <section className="relative z-10 min-h-screen overflow-hidden px-6 pb-10 pt-24 md:px-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:96px_96px] opacity-35" />
          <div className="absolute left-[-8%] top-[17%] h-[58vh] w-[48vw] rotate-[-11deg] rounded-full border border-ts-hairline blur-[1px]" />
          <div className="absolute left-[18%] top-[11%] h-[82vh] w-[1px] rotate-[72deg] bg-ts-hairline" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center gap-10">
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
              {/* Invisible full-viewport mouse capture layer */}
              <div
                ref={heroRef}
                className="absolute z-20 cursor-default"
                style={{ left: 'calc(-50vw + 50%)', width: '100vw', top: '-6rem', bottom: '-6rem' }}

                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              {/* === Base Layer: animated entrance, dark ink text === */}
              <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-5 w-full">
                <SplitText
                  text={line1}
                  className={`${titleClass} text-ts-ink drop-shadow-[0_4px_12px_rgba(44,38,33,0.05)] pointer-events-none`}
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
                  className={`${titleClass} text-ts-ink drop-shadow-[0_4px_12px_rgba(44,38,33,0.05)] pointer-events-none`}
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

              {/* === Reveal Layer: static text, dark bg + light text, clip-path spotlight === */}
              <div
                ref={revealRef}
                className="absolute inset-0 pointer-events-none select-none z-10 rounded-lg"
                style={{
                  clipPath: 'circle(0px at -300px -300px)',
                  WebkitClipPath: 'circle(0px at -300px -300px)',
                  transition: 'clip-path 0.06s linear, -webkit-clip-path 0.06s linear',
                  backgroundColor: '#2C2621',
                  willChange: 'clip-path',
                }}
              >
                <div className="flex flex-col items-center gap-2 md:gap-4 lg:gap-5 w-full h-full justify-center">
                  <h1
                    className={`${titleClass} text-[#FAF6EE] drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}
                    style={{ display: 'inline-block', textAlign: 'center', overflow: 'visible' }}
                  >
                    {altLine1}
                  </h1>
                  <h1
                    className={`${titleClass} text-[#FAF6EE] drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}
                    style={{ display: 'inline-block', textAlign: 'center', overflow: 'visible' }}
                  >
                    {altLine2}
                  </h1>
                </div>
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

      <footer className="relative z-10 border-t border-ts-hairline px-6 py-8">
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
