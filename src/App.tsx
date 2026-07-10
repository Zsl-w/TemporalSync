import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';
import { prefetchNews } from './services/newsService';
import { ThemeToggle } from './components/ThemeToggle';
import { AnimatePresence, motion } from 'motion/react';
import { FluidCanvas } from './components/FluidCanvas';

const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const HotTopics = lazy(() => import('./pages/HotTopics').then(m => ({ default: m.HotTopics })));
const StudyRoom = lazy(() => import('./pages/StudyRoom').then(m => ({ default: m.StudyRoom })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminPage })));
const WeChatConverter = lazy(() => import('./pages/WeChatConverter').then(m => ({ default: m.WeChatConverter })));
const Md2Red = lazy(() => import('./pages/Md2Red').then(m => ({ default: m.Md2Red })));

const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 opacity-50">
    <Loader2 size={32} className="animate-spin text-ts-primary" />
    <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-ts-muted">Loading...</span>
  </div>
);

const NewsPrefetcher = () => {
  useEffect(() => { prefetchNews(); }, []);
  return null;
};

const AnimatedAppContent = () => {
  const location = useLocation();
  const { language } = useSettings();

  useEffect(() => {
    const routeTitles: Record<string, Record<string, string>> = {
      zh: {
        '/': '关于 · TemporalSync',
        '/hot': 'AI 热点 · TemporalSync',
        '/work': '自习室 · TemporalSync',
        '/blog': '博客 · TemporalSync',
        '/settings': '设置 · TemporalSync',
        '/admin': '控制台 · TemporalSync',
        '/shiyun-wechat-md': '微信排版转换器 · TemporalSync',
        '/md2red': '小红书卡片生成器 · TemporalSync'
      },
      en: {
        '/': 'About · TemporalSync',
        '/hot': 'AI Hot Topics · TemporalSync',
        '/work': 'Study Room · TemporalSync',
        '/blog': 'Blog · TemporalSync',
        '/settings': 'Settings · TemporalSync',
        '/admin': 'Dashboard · TemporalSync',
        '/shiyun-wechat-md': 'WeChat Post Formatter · TemporalSync',
        '/md2red': 'Xiaohongshu Card Formatter · TemporalSync'
      }
    };

    const path = location.pathname;
    const titles = routeTitles[language] || routeTitles.en;
    if (titles[path]) {
      document.title = titles[path];
    } else if (path.startsWith('/blog/')) {
      document.title = language === 'zh' ? '博客文章 · TemporalSync' : 'Blog Article · TemporalSync';
    }
  }, [location.pathname, language]);

  const showFluid = ['/', '/hot', '/work', '/blog', '/shiyun-wechat-md', '/md2red'].includes(location.pathname);

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-ts-primary selection:text-white bg-ts-canvas">
      <NewsPrefetcher />
      
      <Navbar />

      {showFluid && (
        <div className="absolute top-0 left-0 w-full h-[160px] overflow-hidden pointer-events-none z-0">
          <span className="absolute inset-0 block"><FluidCanvas /></span>
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px] opacity-40 mix-blend-overlay pointer-events-none" />
        </div>
      )}
  
      <main className="flex-1 w-full mx-auto relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.startsWith('/blog') ? '/blog' : location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1 flex flex-col w-full"
          >
            <Suspense fallback={<LoadingFallback />}>
              <Routes location={location}>
                <Route path="/" element={<About />} />
                <Route path="/hot" element={<HotTopics />} />
                <Route path="/work" element={<StudyRoom />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<Blog />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/shiyun-wechat-md" element={<WeChatConverter />} />
                <Route path="/md2red" element={<Md2Red />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <ThemeToggle />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <AnimatedAppContent />
      </SettingsProvider>
    </Router>
  );
}
