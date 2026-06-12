import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'zh' | 'en';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
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
    () => (localStorage.getItem('ts-theme') as Theme) || 'light'
  );
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem('ts-accent') || '#B497CF'
  );
  const [fontSize, setFontSize] = useState(
    () => parseInt(localStorage.getItem('ts-font-size') || '100')
  );
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('ts-lang') as Language) || 'en'
  );

  // Apply Theme (Permanently forced to dark mode for Raycast background)
  useEffect(() => {
    localStorage.setItem('ts-theme', 'dark');
    const root = window.document.documentElement;
    const meta = window.document.getElementById('theme-color-meta');

    root.classList.add('dark');
    root.classList.remove('light');
    root.style.backgroundColor = '#FAF6EE';
    if (meta) meta.setAttribute('content', '#FAF6EE');
  }, [theme]);

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
    setAccentColor('#B497CF');
    setFontSize(100);
    setLanguage('en');
  };

  return (
    <SettingsContext.Provider value={{
      theme, setTheme,
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
