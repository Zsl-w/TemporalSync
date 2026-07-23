import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Mail, Globe, Settings, Menu, X, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';

interface NavItemProps {
  to: string;
  label: string;
}

const NavItem = ({ to, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center h-full px-4 text-[15.3px] font-medium tracking-[0.08em] transition-all relative text-ts-ink/70 hover:text-ts-ink uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ts-primary",
        isActive && "text-ts-ink"
      )
    }
  >
    {({ isActive }) => (
      <>
        <span>{label}</span>
        {isActive && (
          <div aria-hidden="true" className="absolute bottom-0 left-4 right-4 h-[2px] bg-ts-primary rounded-full" />
        )}
      </>
    )}
  </NavLink>
);

export const Navbar = () => {
  const { language, setLanguage, theme, setTheme } = useSettings();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setWorkDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const mobileItems = [
    { to: '/', label: language === 'zh' ? '博客' : 'Blog' },
    { to: '/hot', label: language === 'zh' ? 'AI 热点' : 'AI Hot Topics' },
    { to: '/work', label: language === 'zh' ? '自习室' : 'Study Room' },
    { to: '/shiyun-wechat-md', label: language === 'zh' ? '微信排版工具' : 'WeChat Formatter' },
    { to: '/md2red', label: language === 'zh' ? '小红书卡片生成' : 'Red Formatter' },
    { to: '/settings', label: language === 'zh' ? '偏好设置' : 'Settings' },
  ];

  return (
    <header className="w-full h-16 sticky top-0 bg-ts-canvas/85 dark:bg-[#72758d]/35 backdrop-blur-xl border-b border-transparent dark:border-white/10 shadow-none dark:shadow-[0_4px_30px_rgba(0,0,0,0.25)] flex items-center select-none z-50 transition-all duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between h-full">
        {/* Left Section: Logo & Brand */}
        <div className="flex items-center h-full">
          <NavLink to="/" className="flex items-center gap-3 group md:mr-8" aria-label="TemporalSync home">
            <img
              src="/logo-mark.png"
              alt="Logo"
              className="h-[28px] w-[28px] object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
            />
            <span className="font-sans font-medium text-sm tracking-widest text-ts-ink uppercase">
              {language === 'zh' ? '时韵' : 'TSync'}
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center h-full gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center h-full px-4 text-[15.3px] font-medium tracking-[0.08em] transition-all relative text-ts-ink/70 hover:text-ts-ink uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ts-primary",
                  (isActive || location.pathname.startsWith('/blog')) && "text-ts-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span>{language === 'zh' ? '博客' : 'BLOG'}</span>
                  {(isActive || location.pathname.startsWith('/blog')) && (
                    <div aria-hidden="true" className="absolute bottom-0 left-4 right-4 h-[2px] bg-ts-primary rounded-full" />
                  )}
                </>
              )}
            </NavLink>
            <NavItem to="/hot" label={language === 'zh' ? '热点' : 'HOT'} />
            
            {/* WORK Item with hover sub-navigation */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setWorkDropdownOpen(true)}
              onMouseLeave={() => setWorkDropdownOpen(false)}
              onFocus={() => setWorkDropdownOpen(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setWorkDropdownOpen(false);
                }
              }}
            >
              <NavLink
                to="/work"
                className={({ isActive }) =>
                  cn(
                    "flex items-center h-full px-4 text-[15.3px] font-medium tracking-[0.08em] transition-all relative text-ts-ink/70 hover:text-ts-ink uppercase",
                    (isActive || location.pathname === '/shiyun-wechat-md' || location.pathname === '/md2red') && "text-ts-ink"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{language === 'zh' ? '自习室' : 'WORK'}</span>
                    {(isActive || location.pathname === '/shiyun-wechat-md' || location.pathname === '/md2red') && (
                      <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-ts-primary rounded-full" />
                    )}
                  </>
                )}
              </NavLink>

              {/* Sub-navigation Dropdown popup (Replicating user's design reference) */}
              <div 
                className={cn(
                  "absolute top-[calc(100%-12px)] left-4 pt-3.5 transition-all duration-300 ease-out origin-top-left z-[100] w-60",
                  workDropdownOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                )}
              >
                <div className="bg-white/40 dark:bg-[#12121a]/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[20px] shadow-2xl p-6 flex flex-col gap-4 select-none">
                  <NavLink
                    to="/shiyun-wechat-md"
                    className={({ isActive }) =>
                      cn(
                        "text-[13.5px] font-medium font-display uppercase tracking-[0.08em] transition-colors block text-left",
                        isActive
                          ? "text-ts-ink"
                          : "text-ts-ink/75 hover:text-ts-ink"
                      )
                    }
                  >
                    {language === 'zh' ? '微信排版工具' : 'WeChat Formatter'}
                  </NavLink>
                  <NavLink
                    to="/md2red"
                    className={({ isActive }) =>
                      cn(
                        "text-[13.5px] font-medium font-display uppercase tracking-[0.08em] transition-colors block text-left",
                        isActive
                          ? "text-ts-ink"
                          : "text-ts-ink/75 hover:text-ts-ink"
                      )
                    }
                  >
                    {language === 'zh' ? '小红书卡片生成' : 'Red Formatter'}
                  </NavLink>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-4 text-ts-ink/70">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="h-11 w-11 inline-flex items-center justify-center hover:text-ts-ink transition-colors rounded-xl hover:bg-ts-ink/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
              aria-label={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe size={16} />
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-11 w-11 inline-flex items-center justify-center hover:text-ts-ink transition-colors rounded-xl hover:bg-ts-ink/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Settings Link */}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "h-11 w-11 inline-flex items-center justify-center hover:text-ts-ink transition-colors rounded-xl hover:bg-ts-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary",
                  isActive && "text-ts-ink"
                )
              }
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={16} />
            </NavLink>

            <a
              href="mailto:contact@temporalsync.online"
              className="h-11 w-11 inline-flex items-center justify-center hover:text-ts-ink transition-colors rounded-xl hover:bg-ts-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
              title="Email"
              aria-label="Email"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2 text-ts-ink/75">
          <button
            type="button"
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="h-11 w-11 inline-flex items-center justify-center rounded-xl hover:bg-ts-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
            aria-label={language === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <Globe size={18} />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(open => !open)}
            className="h-11 w-11 inline-flex items-center justify-center rounded-xl hover:bg-ts-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
            aria-label={mobileMenuOpen ? (language === 'zh' ? '关闭菜单' : 'Close menu') : (language === 'zh' ? '打开菜单' : 'Open menu')}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-16 md:hidden border-t border-ts-hairline bg-ts-canvas/95 backdrop-blur-xl shadow-2xl"
        >
          <nav className="px-6 py-5 grid grid-cols-1 gap-1" aria-label="Mobile navigation">
            {mobileItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "min-h-11 flex items-center justify-between rounded-xl px-4 text-sm font-medium tracking-wide text-ts-ink/75 hover:bg-ts-surface-elevated hover:text-ts-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary",
                  isActive && "bg-ts-surface-elevated text-ts-ink"
                )}
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="min-h-11 flex items-center justify-between rounded-xl px-4 text-sm font-medium tracking-wide text-ts-ink/75 hover:bg-ts-surface-elevated hover:text-ts-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
            >
              <span>{language === 'zh' ? '外观模式' : 'Appearance'}</span>
              <span className="inline-flex items-center gap-2 text-xs text-ts-muted">
                {theme === 'dark'
                  ? (language === 'zh' ? '深色' : 'Dark')
                  : (language === 'zh' ? '浅色' : 'Light')}
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </span>
            </button>
          </nav>
          <div className="px-10 pb-6 flex items-center gap-3 text-sm text-ts-muted">
            <Mail size={17} />
            <a href="mailto:contact@temporalsync.online" className="hover:text-ts-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary">
              contact@temporalsync.online
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
