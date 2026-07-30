import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'zh' | 'en';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme, event?: React.MouseEvent | MouseEvent) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('ts-theme') as Theme) || 'dark'
  );
  const [accentColor, setAccentColor] = useState(
    () => {
      const stored = localStorage.getItem('ts-accent');
      if (!stored || stored === '#B497CF' || stored === '#c084fc') {
        localStorage.setItem('ts-accent', '#F9B9A6');
        return '#F9B9A6';
      }
      return stored;
    }
  );
  const [fontSize, setFontSize] = useState(
    () => parseInt(localStorage.getItem('ts-font-size') || '100')
  );
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('ts-lang') as Language) || 'en'
  );

  // Apply Theme DOM mutation
  useEffect(() => {
    localStorage.setItem('ts-theme', theme);
    const root = window.document.documentElement;
    const meta = window.document.getElementById('theme-color-meta');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.backgroundColor = '#120D26';
      if (meta) meta.setAttribute('content', '#120D26');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.backgroundColor = 'rgb(250, 250, 250)';
      if (meta) meta.setAttribute('content', 'rgb(250, 250, 250)');
    }
  }, [theme]);

  const setThemeWithTransition = (newTheme: Theme, event?: React.MouseEvent | MouseEvent) => {
    if (newTheme === theme) return;

    // Synchronously capture click coordinates before any async event pooling
    const x = event && typeof (event as MouseEvent).clientX === 'number' && (event as MouseEvent).clientX !== 0
      ? (event as MouseEvent).clientX
      : window.innerWidth - 80;
    const y = event && typeof (event as MouseEvent).clientY === 'number' && (event as MouseEvent).clientY !== 0
      ? (event as MouseEvent).clientY
      : 32;

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      // 2.5x screen diagonal guarantees 100% coverage of all corners (including bottom-right)
      const screenDiagonal = Math.hypot(
        Math.max(window.innerWidth, document.documentElement.clientWidth, 1440),
        Math.max(window.innerHeight, document.documentElement.clientHeight, 900)
      );
      const endRadius = Math.ceil(screenDiagonal * 2.5);

      const transition = (document as any).startViewTransition(() => {
        setTheme(newTheme);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          [
            {
              clipPath: `circle(0px at ${x}px ${y}px)`
            },
            {
              clipPath: `circle(${endRadius}px at ${x}px ${y}px)`
            }
          ],
          {
            duration: 650,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    } else {
      setTheme(newTheme);
    }
  };

  // Apply Accent Color
  useEffect(() => {
    localStorage.setItem('ts-accent', accentColor);
    document.documentElement.style.setProperty('--color-ts-primary', accentColor);
    document.documentElement.style.setProperty('--color-ts-sunset', accentColor);
  }, [accentColor]);

  // Apply Font Size
  useEffect(() => {
    localStorage.setItem('ts-font-size', fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  // Apply Language
  useEffect(() => {
    localStorage.setItem('ts-lang', language);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  const resetSettings = () => {
    setTheme('dark');
    setAccentColor('#F9B9A6');
    setFontSize(100);
    setLanguage('en');
  };

  return (
    <SettingsContext.Provider value={{
      theme, setTheme: setThemeWithTransition,
      accentColor, setAccentColor,
      fontSize, setFontSize,
      language, setLanguage,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
