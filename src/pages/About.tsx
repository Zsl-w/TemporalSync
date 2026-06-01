import React, { useRef } from 'react';
import { ArrowRight, Zap, Info, Settings, LayoutDashboard, Github, Mail } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const About = () => {
  const { user } = useAuth();
  const { language } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useScrollReveal(containerRef);
  useHeroAnimation(heroRef);

  const t = {
    zh: {
      name: '时间同步',
      subtitle: '和你一起在智能医学时代慢慢自习',
      bio: '记录 AI 医学、科研工具、论文阅读、大模型应用与研究生成长。',
      cta: '进入工作台',
      sections: {
        about: { title: '关于项目', desc: '了解时间同步的愿景与功能' },
        dashboard: { title: '控制台', desc: '查看今日情报与同步状态' },
        hot: { title: 'AI 热点', desc: '聚合全球最热门 AI 资讯' },
        settings: { title: '偏好设置', desc: '个性化定制您的同步空间' },
      },
      signIn: '登录以使用完整功能',
    },
    en: {
      name: 'TimeSync',
      subtitle: 'Studying together in the era of intelligent medicine',
      bio: 'Documenting progress in AI medicine, research tools, literature reading, LLM applications, and graduate student growth.',
      cta: 'Enter Workspace',
      sections: {
        about: { title: 'About Project', desc: 'Learn about TimeSync\'s vision & features' },
        dashboard: { title: 'Dashboard', desc: 'Check today\'s intel and sync status' },
        hot: { title: 'AI Hot Topics', desc: 'Aggregate the hottest AI news globally' },
        settings: { title: 'Preferences', desc: 'Personalize your synchronization workspace' },
      },
      signIn: 'Sign in for full functionality',
    },
  }[language];

  return (
    <div ref={containerRef} className="flex flex-col relative overflow-hidden">

      {/* Hero */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 relative z-10">
        <div className="w-full mx-auto text-center space-y-10">
          <div className="select-none py-4 flex flex-col items-center justify-center">
            {language === 'zh' ? (
              <h1 className="flex flex-col items-center text-center leading-[1.1]">
                <span 
                  data-hero-title 
                  className="text-[90px] md:text-[135px] lg:text-[170px] font-display font-black text-ts-navy-900 dark:text-white tracking-tight"
                >
                  时间同步
                </span>
                <span 
                  data-hero-title-en 
                  className="text-[20px] md:text-[26px] lg:text-[32px] font-sans font-black text-ts-primary uppercase tracking-[0.3em] mt-3 md:mt-4"
                >
                  Temporal Sync
                </span>
              </h1>
            ) : (
              <h1 className="flex flex-col items-center text-center leading-[1.1]">
                <span 
                  data-hero-title 
                  className="text-[90px] md:text-[135px] lg:text-[170px] font-sans font-black text-ts-navy-900 dark:text-white tracking-tight uppercase"
                >
                  TimeSync
                </span>
              </h1>
            )}
          </div>

          <p data-hero-subtitle className="text-[16px] md:text-[20px] font-sans font-medium text-ts-navy-800/80 dark:text-ts-neutral-300/80 tracking-[0.12em] leading-relaxed max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          <div className="pt-2">
            <p data-hero-bio className="text-[13px] md:text-[14px] text-ts-muted dark:text-ts-neutral-400 font-sans font-medium tracking-[0.05em] border-y border-ts-hairline/80 py-3.5 px-8 inline-block max-w-2xl mx-auto backdrop-blur-[2px] bg-white/5 dark:bg-white/2 rounded-[6px] shadow-inner">
              {t.bio}
            </p>
          </div>

          <div data-hero-cta className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <RouterLink
              to="/dashboard"
              className="group flex items-center gap-3 bg-ts-primary text-white px-8 h-12 rounded-[6px] text-[14px] font-medium hover:bg-ts-primary-hover transition-all"
            >
              {t.cta}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </RouterLink>
            {!user && (
              <p className="text-[12px] text-ts-muted-soft">{t.signIn}</p>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24 w-full relative z-10">
        <div data-scroll-reveal data-scroll-reveal-stagger="0.1" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Info size={20} />, ...t.sections.about, link: '/', color: 'text-ts-navy-800' },
            { icon: <LayoutDashboard size={20} />, ...t.sections.dashboard, link: '/dashboard', color: 'text-ts-navy-600' },
            { icon: <Zap size={20} />, ...t.sections.hot, link: '/hot', color: 'text-ts-primary' },
            { icon: <Settings size={20} />, ...t.sections.settings, link: '/settings', color: 'text-ts-muted' },
          ].map((section, i) => (
            <RouterLink
              key={i}
              to={section.link}
              className="group block p-6 bg-ts-surface border border-ts-hairline rounded-[12px] hover:shadow-[0_4px_12px_rgba(19,27,54,0.1)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`${section.color} mb-4`}>
                {section.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-ts-ink mb-1">{section.title}</h3>
              <p className="text-[13px] text-ts-muted-soft leading-relaxed">{section.desc}</p>
            </RouterLink>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ts-hairline py-8 px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[12px] text-ts-muted-soft">
            <span>&copy; {new Date().getFullYear()} TemporalSync</span>
            <span className="hidden sm:inline opacity-30">|</span>
            <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noopener noreferrer" className="hover:text-ts-primary transition-colors">
              渝ICP备2026010591号
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-ts-muted-soft hover:text-ts-ink transition-colors">
              <Github size={16} />
            </a>
            <a href="mailto:hello@example.com" className="text-ts-muted-soft hover:text-ts-ink transition-colors">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
