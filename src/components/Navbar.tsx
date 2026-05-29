import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Settings, LogIn, LogOut, Globe, BookOpen, Laptop } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { LoginModal } from './LoginModal';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-2 h-full px-4 text-[13px] font-medium transition-all relative group",
        isActive ? "text-ts-primary" : "text-ts-muted hover:text-ts-ink"
      )
    }
  >
    {({ isActive }) => (
      <>
        <div className={cn(
          "transition-all duration-300",
          isActive ? "scale-110" : "group-hover:scale-110"
        )}>
          {icon}
        </div>
        <span className="hidden lg:inline">{label}</span>
        {isActive && (
          <motion.div
            layoutId="navActive"
            className="absolute bottom-0 left-2 right-2 h-[2px] bg-ts-primary rounded-full"
          />
        )}
      </>
    )}
  </NavLink>
);

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useSettings();
  const navRef = useRef<HTMLElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      const darkClass = document.documentElement.classList.contains('dark');
      setIsDark(darkClass);
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    signOut();
  };

  return (
    <header 
      ref={navRef} 
      className="sticky top-4 mt-4 z-50 w-[calc(100%-2rem)] max-w-7xl mx-auto h-14 border rounded-[12px] shadow-sm transition-all duration-300"
      style={{
        backgroundColor: isDark ? 'rgba(20, 53, 89, 0.65)' : 'rgba(255, 255, 255, 0.65)',
        borderColor: isDark ? 'rgba(42, 63, 92, 0.45)' : 'rgba(224, 221, 216, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      <div className="h-full px-6 flex items-center justify-between relative">
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="flex items-end gap-[3px] h-7">
              <div className="w-[3px] h-full bg-ts-primary rounded-full transition-all duration-500 group-hover:h-[60%]" />
              <div className="w-[3px] h-[60%] bg-ts-navy-800 rounded-full transition-all duration-500 group-hover:h-full" />
            </div>
            <span className="font-display font-bold text-xl text-ts-ink tracking-tight">
              时间同步
            </span>
          </NavLink>
        </div>

        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center h-full overflow-x-auto hide-scrollbar max-w-[50vw]">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={15} />} label={language === 'zh' ? '工作台' : 'Dashboard'} />
          <NavItem to="/hot" icon={<Zap size={15} />} label={language === 'zh' ? '热点' : 'Hot'} />
          <NavItem to="/study" icon={<Laptop size={15} />} label={language === 'zh' ? '自习室' : 'Lab'} />
          <NavItem to="/blog" icon={<BookOpen size={15} />} label={language === 'zh' ? '博客' : 'Blog'} />
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="h-9 px-3 flex items-center gap-1.5 rounded-[6px] text-[12px] font-medium text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated transition-all"
            title={language === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <Globe size={14} />
            <span>{language === 'zh' ? '中' : 'EN'}</span>
          </button>

          <NavLink to="/settings" className="w-9 h-9 flex items-center justify-center rounded-[6px] text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated transition-all">
            <Settings size={18} />
          </NavLink>

          {user ? (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-ts-hairline">
              <div
                className="w-8 h-8 rounded-full border border-ts-hairline overflow-hidden"
                title={user.displayName || (language === 'zh' ? '用户' : 'User')}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-ts-primary flex items-center justify-center text-white text-[11px] font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] text-ts-muted-soft hover:text-ts-error hover:bg-ts-error-bg transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 h-9 bg-ts-primary text-white rounded-[6px] text-[13px] font-medium hover:bg-ts-primary-hover transition-all flex items-center gap-2 ml-2 cursor-pointer"
            >
              <LogIn size={15} />
              {language === 'zh' ? '登录' : 'Sign In'}
            </button>
          )}
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};
