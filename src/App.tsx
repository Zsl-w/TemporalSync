import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SettingsProvider } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';
import { prefetchNews } from './services/newsService';
import { ThemeToggle } from './components/ThemeToggle';
import { AnimatePresence, motion } from 'motion/react';

const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const HotTopics = lazy(() => import('./pages/HotTopics').then(m => ({ default: m.HotTopics })));
const StudyRoom = lazy(() => import('./pages/StudyRoom').then(m => ({ default: m.StudyRoom })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminPage })));
const WeChatConverter = lazy(() => import('./pages/WeChatConverter').then(m => ({ default: m.WeChatConverter })));

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

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-ts-primary selection:text-white bg-ts-canvas">
      <NewsPrefetcher />
      
      <Navbar />

      <main className="flex-1 w-full mx-auto relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.startsWith('/writing') ? '/writing' : location.pathname}
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
                <Route path="/writing" element={<Blog />} />
                <Route path="/writing/:id" element={<Blog />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/shiyun-wechat-md" element={<WeChatConverter />} />
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
