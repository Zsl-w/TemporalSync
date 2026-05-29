import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';

const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const HotTopics = lazy(() => import('./pages/HotTopics').then(m => ({ default: m.HotTopics })));
const StudyRoom = lazy(() => import('./pages/StudyRoom').then(m => ({ default: m.StudyRoom })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));

const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 opacity-50">
    <Loader2 size={32} className="animate-spin text-ts-primary" />
    <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-ts-muted">Loading...</span>
  </div>
);

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <div className="min-h-screen relative flex flex-col font-sans selection:bg-ts-primary selection:text-white bg-ts-canvas">
            {/* CSS Keyframes for automatic organic float */}
            <style>{`
              @keyframes floatOrb1 {
                0% { transform: translate3d(0px, 0px, 0px) scale(1); }
                25% { transform: translate3d(90px, 60px, 0px) scale(1.08); }
                50% { transform: translate3d(180px, -40px, 0px) scale(0.92); }
                75% { transform: translate3d(50px, 120px, 0px) scale(1.04); }
                100% { transform: translate3d(0px, 0px, 0px) scale(1); }
              }
              @keyframes floatOrb2 {
                0% { transform: translate3d(0px, 0px, 0px) scale(1); }
                33% { transform: translate3d(-120px, -90px, 0px) scale(0.92); }
                66% { transform: translate3d(-50px, 70px, 0px) scale(1.1); }
                100% { transform: translate3d(0px, 0px, 0px) scale(1); }
              }
              @keyframes floatOrb3 {
                0% { transform: translate3d(0px, 0px, 0px) scale(1); }
                30% { transform: translate3d(60px, -100px, 0px) scale(1.05); }
                70% { transform: translate3d(-90px, -30px, 0px) scale(0.95); }
                100% { transform: translate3d(0px, 0px, 0px) scale(1); }
              }
              @keyframes driftInner1 {
                0% { transform: translate3d(0px, 0px, 0px); }
                100% { transform: translate3d(60px, 40px, 0px); }
              }
              @keyframes driftInner2 {
                0% { transform: translate3d(0px, 0px, 0px); }
                100% { transform: translate3d(-40px, -50px, 0px); }
              }
              @keyframes driftInner3 {
                0% { transform: translate3d(0px, 0px, 0px); }
                100% { transform: translate3d(40px, -30px, 0px); }
              }
              .animate-orb-1 {
                animation: floatOrb1 26s ease-in-out infinite;
              }
              .animate-orb-2 {
                animation: floatOrb2 32s ease-in-out infinite;
              }
              .animate-orb-3 {
                animation: floatOrb3 20s ease-in-out infinite;
              }
              .animate-inner-1 {
                animation: driftInner1 12s ease-in-out infinite alternate;
              }
              .animate-inner-2 {
                animation: driftInner2 15s ease-in-out infinite alternate;
              }
              .animate-inner-3 {
                animation: driftInner3 10s ease-in-out infinite alternate;
              }
            `}</style>

            {/* Google-like Gradient Light Orbs (Klein Blue, Sunset Orange, Violet) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              {/* Klein Blue Orb Container */}
              <div 
                className="absolute w-[600px] h-[600px] rounded-full animate-orb-1" 
                style={{ 
                  top: '5%', 
                  left: '5%',
                }}
              >
                <div 
                  className="w-full h-full rounded-full opacity-65 dark:opacity-45 animate-inner-1"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 47, 167, 0.6) 0%, rgba(0, 47, 167, 0.25) 35%, rgba(0, 47, 167, 0) 65%)',
                    filter: 'blur(35px)'
                  }}
                />
              </div>

              {/* Sunset Orange Orb Container */}
              <div 
                className="absolute w-[550px] h-[550px] rounded-full animate-orb-2" 
                style={{ 
                  top: '35%', 
                  left: '50%',
                }}
              >
                <div 
                  className="w-full h-full rounded-full opacity-65 dark:opacity-45 animate-inner-2"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 94, 58, 0.65) 0%, rgba(255, 94, 58, 0.3) 35%, rgba(255, 94, 58, 0) 65%)',
                    filter: 'blur(35px)'
                  }}
                />
              </div>

              {/* Intermediate Violet Orb Container */}
              <div 
                className="absolute w-[500px] h-[500px] rounded-full animate-orb-3" 
                style={{ 
                  top: '20%', 
                  left: '25%',
                }}
              >
                <div 
                  className="w-full h-full rounded-full opacity-55 dark:opacity-35 animate-inner-3"
                  style={{
                    background: 'radial-gradient(circle, rgba(138, 43, 226, 0.55) 0%, rgba(138, 43, 226, 0.2) 35%, rgba(138, 43, 226, 0) 60%)',
                    filter: 'blur(30px)'
                  }}
                />
              </div>
            </div>

            <div className="atmosphere-bg" />
            <Navbar />
            <main className="flex-1 w-full mx-auto relative z-10 flex flex-col">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<About />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/hot" element={<HotTopics />} />
                  <Route path="/study" element={<StudyRoom />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}
