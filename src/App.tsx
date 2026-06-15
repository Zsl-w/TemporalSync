import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';
import { prefetchNews } from './services/newsService';
import PixelBlast from './components/PixelBlast';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';

const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const HotTopics = lazy(() => import('./pages/HotTopics').then(m => ({ default: m.HotTopics })));
const StudyRoom = lazy(() => import('./pages/StudyRoom').then(m => ({ default: m.StudyRoom })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));
const ContentStudio = lazy(() => import('./pages/ContentStudio').then(m => ({ default: m.ContentStudio })));
import Lanyard from './components/Lanyard';

const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 opacity-50">
    <Loader2 size={32} className="animate-spin text-ts-primary" />
    <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-ts-muted">Loading...</span>
  </div>
);

// Prefetch news data as soon as the app mounts (fire-and-forget)
const NewsPrefetcher = () => {
  useEffect(() => { prefetchNews(); }, []);
  return null;
};

const AnimatedAppContent = () => {
  const location = useLocation();
  const [showContact, setShowContact] = React.useState(false);
  const { accentColor } = useSettings();

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-ts-primary selection:text-white bg-ts-canvas">
      <NewsPrefetcher />
      {/* Background Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color={accentColor}
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>

      <div className="atmosphere-bg" />
      <Navbar showContact={showContact} setShowContact={setShowContact} />

      {/* Dropdown Lanyard Overlay */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ y: -800, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -800, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 80 }}
            className="fixed top-0 right-0 w-[410px] sm:w-[560px] md:w-[640px] lg:w-[720px] h-screen z-40 pointer-events-none"
          >
            <div className="w-full h-full pointer-events-auto">
              <Lanyard position={[0, 0, 21]} gravity={[0, -40, 0]} fov={20} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full mx-auto relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.startsWith('/writing') ? '/writing' : location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
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
                <Route path="/studio" element={<ContentStudio />} />
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
        <AuthProvider>
          <AnimatedAppContent />
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}
