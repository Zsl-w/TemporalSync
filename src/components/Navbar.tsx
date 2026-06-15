import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Shield, ShieldOff, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';

interface NavItemProps {
  to: string;
  label: string;
}

const NavItem = ({ to, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center h-full px-4 text-[13px] font-medium transition-all relative group",
        isActive ? "text-ts-primary" : "text-ts-muted hover:text-ts-ink"
      )
    }
  >
    {({ isActive }) => (
      <>
        <span>{label}</span>
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

interface NavbarProps {
  showContact: boolean;
  setShowContact: (show: boolean) => void;
}

export const Navbar = ({ showContact, setShowContact }: NavbarProps) => {
  const { isAdmin, toggleAdmin } = useAuth();
  const { language, setLanguage } = useSettings();
  const navRef = useRef<HTMLElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

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

  const handleAdminToggle = () => {
    if (isAdmin) {
      toggleAdmin(); // logout
    } else {
      setShowAdminPrompt(true);
    }
  };

  const handleAdminSubmit = () => {
    const success = toggleAdmin(adminPassword);
    if (success) {
      setShowAdminPrompt(false);
      setAdminPassword('');
    } else {
      setAdminPassword('');
    }
  };

  return (
    <header 
      ref={navRef} 
      className="sticky top-4 mt-4 z-50 w-[calc(100%-2rem)] max-w-7xl mx-auto h-14 border rounded-[12px] shadow-sm transition-all duration-300"
      style={{
        backgroundColor: 'var(--color-ts-surface)',
        borderColor: 'var(--color-ts-hairline)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      <div className="h-full px-6 flex items-center justify-between relative">
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-mark.png"
              alt=""
              className="h-[30px] w-[30px] transition-all duration-500 group-hover:-translate-y-0.5"
            />
            <span className="font-display font-bold text-base text-ts-ink tracking-tight">
              {language === 'zh' ? '时韵' : 'TSync'}
            </span>
          </NavLink>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center h-full gap-1">
            <NavItem to="/hot" label={language === 'zh' ? '热点' : 'HOT'} />
            <NavItem to="/work" label={language === 'zh' ? '自习室' : 'WORK'} />
            <NavItem to="/writing" label={language === 'zh' ? '博客' : 'WRITING'} />
            <NavItem to="/studio" label="STUDIO" />
            <button
              onClick={() => setShowContact(!showContact)}
              className={cn(
                "flex items-center h-full px-4 text-[13px] font-medium transition-all relative group bg-transparent border-none cursor-pointer outline-none",
                showContact ? "text-ts-primary" : "text-ts-muted hover:text-ts-ink"
              )}
            >
              <span>{language === 'zh' ? '联系' : 'CONTACT'}</span>
              {showContact && (
                <motion.div
                  layoutId="navActive"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-ts-primary rounded-full"
                />
              )}
            </button>
          </nav>

          <span className="w-px h-4 bg-ts-hairline" />

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

            {/* Admin toggle button */}
            <button
              onClick={handleAdminToggle}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-[6px] transition-all",
                isAdmin
                  ? "bg-ts-primary text-white hover:bg-ts-primary-hover"
                  : "text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated"
              )}
              title={isAdmin ? (language === 'zh' ? '退出管理模式' : 'Exit Admin Mode') : (language === 'zh' ? '进入管理模式' : 'Enter Admin Mode')}
            >
              {isAdmin ? <ShieldOff size={16} /> : <Shield size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Admin password prompt */}
      {showAdminPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="w-[320px] p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-ts-surface)',
              border: '1px solid var(--color-ts-hairline)',
            }}
          >
            <h3 className="text-lg font-semibold text-ts-ink mb-2">
              {language === 'zh' ? '管理员验证' : 'Admin Verification'}
            </h3>
            <p className="text-sm text-ts-muted mb-4">
              {language === 'zh' ? '输入管理员密码以启用编辑功能' : 'Enter admin password to enable editing'}
            </p>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSubmit()}
              placeholder={language === 'zh' ? '密码' : 'Password'}
              className="w-full h-10 px-3 rounded-lg border text-sm text-ts-ink"
              style={{ borderColor: 'var(--color-ts-hairline)', backgroundColor: 'var(--color-ts-surface-elevated)' }}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAdminSubmit}
                className="flex-1 h-9 bg-ts-primary text-white rounded-lg text-sm font-medium hover:bg-ts-primary-hover transition-all"
              >
                {language === 'zh' ? '确认' : 'Confirm'}
              </button>
              <button
                onClick={() => { setShowAdminPrompt(false); setAdminPassword(''); }}
                className="flex-1 h-9 rounded-lg text-sm font-medium text-ts-muted hover:text-ts-ink transition-all"
                style={{ border: '1px solid var(--color-ts-hairline)' }}
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};