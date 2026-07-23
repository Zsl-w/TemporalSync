import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AppErrorBoundary } from './components/AppErrorBoundary';

const HotTopics = lazy(() => import('./pages/HotTopics').then(m => ({ default: m.HotTopics })));
const StudyRoom = lazy(() => import('./pages/StudyRoom').then(m => ({ default: m.StudyRoom })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminPage })));
const WeChatConverter = lazy(() => import('./pages/WeChatConverter').then(m => ({ default: m.WeChatConverter })));
const Md2Red = lazy(() => import('./pages/Md2Red').then(m => ({ default: m.Md2Red })));
const Lexora = lazy(() => import('./pages/Lexora').then(m => ({ default: m.Lexora })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 opacity-50">
    <Loader2 size={32} className="animate-spin text-ts-primary" />
    <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-ts-muted">Loading...</span>
  </div>
);

const AnimatedAppContent = () => {
  const location = useLocation();
  const { language } = useSettings();

  useEffect(() => {
    const routeTitles: Record<string, Record<string, string>> = {
      zh: {
        '/': '博客 · TemporalSync',
        '/hot': 'AI 热点 · TemporalSync',
        '/work': '自习室 · TemporalSync',
        '/blog': '博客 · TemporalSync',
        '/settings': '设置 · TemporalSync',
        '/admin': '控制台 · TemporalSync',
        '/shiyun-wechat-md': '微信排版转换器 · TemporalSync',
        '/md2red': '小红书卡片生成器 · TemporalSync',
        '/lexora': 'Lexora 知识伴侣'
      },
      en: {
        '/': 'Blog · TemporalSync',
        '/hot': 'AI Hot Topics · TemporalSync',
        '/work': 'Study Room · TemporalSync',
        '/blog': 'Blog · TemporalSync',
        '/settings': 'Settings · TemporalSync',
        '/admin': 'Dashboard · TemporalSync',
        '/shiyun-wechat-md': 'WeChat Post Formatter · TemporalSync',
        '/md2red': 'Xiaohongshu Card Formatter · TemporalSync',
        '/lexora': 'Lexora AI Knowledge Companion'
      }
    };

    const path = location.pathname;
    const titles = routeTitles[language] || routeTitles.en;
    if (titles[path]) {
      document.title = titles[path];
    } else if (path.startsWith('/blog/')) {
      document.title = language === 'zh' ? '博客文章 · TemporalSync' : 'Blog Article · TemporalSync';
    } else {
      document.title = language === 'zh' ? '页面未找到 · TemporalSync' : 'Page Not Found · TemporalSync';
    }
  }, [location.pathname, language]);

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-ts-primary selection:text-white bg-ts-canvas">
      <Navbar />
  
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
                <Route path="/" element={<Blog />} />
                <Route path="/hot" element={<HotTopics />} />
                <Route path="/work" element={<StudyRoom />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<Blog />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/shiyun-wechat-md" element={<WeChatConverter />} />
                <Route path="/md2red" element={<Md2Red />} />
                <Route path="/lexora" element={<Lexora />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <AppErrorBoundary>
          <AnimatedAppContent />
        </AppErrorBoundary>
      </SettingsProvider>
    </Router>
  );
}
