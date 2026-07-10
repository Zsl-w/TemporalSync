import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const ThemeToggle = () => {
  const { theme, setTheme } = useSettings();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed bottom-6 left-6 z-[100] w-10 h-10 rounded-full flex items-center justify-center bg-ts-surface-elevated text-ts-ink border border-ts-hairline shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-amber-400" />
      ) : (
        <Moon size={18} className="text-[#86868B]" />
      )}
    </button>
  );
};
