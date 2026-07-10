import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Instagram, Twitter, Globe, Settings, Github } from 'lucide-react';
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
        "flex items-center h-full px-4 text-[15.3px] font-bold tracking-[0.08em] transition-all relative text-ts-ink/70 hover:text-ts-ink uppercase",
        isActive && "text-ts-ink"
      )
    }
  >
    {({ isActive }) => (
      <>
        <span>{label}</span>
        {isActive && (
          <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-ts-primary rounded-full" />
        )}
      </>
    )}
  </NavLink>
);

export const Navbar = () => {
  const { language, setLanguage } = useSettings();

  return (
    <header className="w-full h-16 sticky top-0 bg-ts-canvas/80 backdrop-blur-md flex items-center select-none z-50 transition-all duration-300">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-full">
        {/* Left Section: Logo & Brand */}
        <div className="flex items-center h-full">
          <NavLink to="/" className="flex items-center gap-3 group mr-8">
            <img
              src="/logo-mark.png"
              alt="Logo"
              className="h-[28px] w-[28px] object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
            />
            <span className="font-sans font-bold text-sm tracking-widest text-ts-ink uppercase">
              {language === 'zh' ? '时韵' : 'TSync'}
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center h-full gap-1">
            <NavItem to="/" label={language === 'zh' ? '关于' : 'ABOUT'} />
            <NavItem to="/hot" label={language === 'zh' ? '热点' : 'HOT'} />
            <NavItem to="/work" label={language === 'zh' ? '自习室' : 'WORK'} />
            <NavItem to="/blog" label={language === 'zh' ? '博客' : 'BLOG'} />
          </nav>
        </div>

        {/* Right Section: Language, Settings & Social Icons */}
        <div className="flex items-center gap-4 sm:gap-6 text-ts-ink/70">
          {/* Mobile Nav Links */}
          <nav className="flex md:hidden items-center gap-1">
            <NavItem to="/" label="ABOUT" />
            <NavItem to="/hot" label="HOT" />
            <NavItem to="/work" label="WORK" />
            <NavItem to="/blog" label="BLOG" />
          </nav>

          <span className="hidden sm:inline w-px h-4 bg-ts-hairline" />

          {/* Social Icons & Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="p-1.5 hover:text-ts-ink transition-colors rounded-md hover:bg-ts-ink/5 cursor-pointer"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe size={16} />
            </button>

            {/* Settings Link */}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "p-1.5 hover:text-ts-ink transition-colors rounded-md hover:bg-ts-ink/5",
                  isActive && "text-ts-ink"
                )
              }
              title="Settings"
            >
              <Settings size={16} />
            </NavLink>

            {/* Social Medias */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 hover:text-ts-ink transition-colors rounded-md hover:bg-ts-ink/5"
              title="GitHub"
            >
              <Github size={16} />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 hover:text-ts-ink transition-colors rounded-md hover:bg-ts-ink/5"
              title="Twitter/X"
            >
              <Twitter size={16} />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 hover:text-ts-ink transition-colors rounded-md hover:bg-ts-ink/5"
              title="Instagram"
            >
              <Instagram size={16} />
            </a>

            <a
              href="mailto:contact@temporalsync.online"
              className="p-1.5 hover:text-ts-ink transition-colors rounded-md hover:bg-ts-ink/5"
              title="Email"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
