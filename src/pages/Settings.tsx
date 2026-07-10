import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Type, Palette, CheckCircle2, RotateCcw, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { UI_CLASSES } from '../constants/ui';
import { useSettings } from '../context/SettingsContext';

export const SettingsPage = () => {
  const { theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize, language, setLanguage, resetSettings } = useSettings();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[700px] mx-auto space-y-12 pb-20 mt-10 px-6 text-left"
    >
      <div className="space-y-2">
        <h1 className="text-[28px] font-black text-ts-ink tracking-tight">
          {language === 'zh' ? '偏好设置' : 'Preferences'}
        </h1>
        <p className="text-ts-muted text-[13px] font-bold uppercase tracking-widest">
          {language === 'zh' ? '个性化您的同步空间' : 'Personalize Your Space'}
        </p>
      </div>

      {/* Language */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Globe size={14} className="text-ts-primary" />
          <h2 className="text-[11px] font-black text-ts-muted uppercase tracking-widest">
            {language === 'zh' ? '语言 / Language' : 'Language / 语言'}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'zh', label: '中文', sub: 'Chinese' },
            { id: 'en', label: 'English', sub: '英文' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as any)}
              className={cn(
                "bg-ts-surface border rounded-[12px] flex items-center justify-center gap-3 h-16 px-4 transition-all cursor-pointer",
                language === lang.id ? "border-ts-primary shadow-lg shadow-ts-primary/5" : "border-ts-hairline hover:border-ts-muted-soft"
              )}
            >
              <span className={cn(
                "text-[14px] font-semibold",
                language === lang.id ? "text-ts-primary" : "text-ts-muted"
              )}>
                {lang.label}
              </span>
              <span className={cn(
                "text-[11px]",
                language === lang.id ? "text-ts-primary/75" : "text-ts-muted-soft"
              )}>
                {lang.sub}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Visual Tuning */}
      <section className={cn("p-10 space-y-10 rounded-[12px] border border-ts-hairline bg-ts-surface")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[20px] bg-ts-primary/10 text-ts-primary flex items-center justify-center shadow-inner">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-ts-ink uppercase tracking-tight">
                {language === 'zh' ? '主题基调' : 'Accent Theme'}
              </h3>
              <p className="text-ts-muted text-[11px] font-bold mt-0.5">
                {language === 'zh' ? '选取全站核心感知色' : 'Select core accents'}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            {['#B497CF', '#ff9aa5', '#f7d070', '#85e3b2', '#c084fc'].map(color => (
              <button 
                key={color} 
                onClick={() => setAccentColor(color)}
                className={cn(
                  "w-12 h-12 rounded-[18px] transition-all hover:scale-110 flex items-center justify-center border-4 border-transparent shadow-lg cursor-pointer",
                  color === accentColor ? "border-white ring-2 ring-ts-primary" : "opacity-40 hover:opacity-100"
                )}
                style={{ backgroundColor: color }}
              >
                {color === accentColor && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-ts-hairline" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[20px] bg-ts-primary/10 text-ts-primary flex items-center justify-center shadow-inner">
              <Type size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-ts-ink uppercase tracking-tight">
                {language === 'zh' ? '文字缩放' : 'Text Scaling'}
              </h3>
              <p className="text-ts-muted text-[11px] font-bold mt-0.5">
                {language === 'zh' ? `调优阅读辅助体验 (${fontSize}%)` : `Tune layout scaling (${fontSize}%)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 w-full sm:w-72 bg-ts-surface-elevated px-6 py-5 rounded-2xl border border-ts-hairline">
            <span className="text-[10px] text-ts-muted font-black italic">MIN</span>
            <input 
              type="range" 
              min="90" 
              max="110" 
              step="5"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="flex-1 accent-ts-primary h-2 rounded-full cursor-pointer appearance-none bg-ts-hairline" 
            />
            <span className="text-[10px] text-ts-muted font-black italic">MAX</span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col sm:flex-row justify-end gap-4">
        <button 
          onClick={resetSettings}
          className="h-16 px-10 rounded-[8px] border border-ts-hairline text-ts-muted hover:text-ts-ink flex items-center justify-center gap-3 bg-transparent cursor-pointer transition-colors"
        >
          <RotateCcw size={20} />
          <span className="font-black text-[14px] uppercase tracking-widest leading-none">
            {language === 'zh' ? '重置为默认' : 'Reset defaults'}
          </span>
        </button>
        <button 
          onClick={handleSave}
          disabled={saved}
          className="h-16 px-14 rounded-[8px] shadow-2xl relative min-w-[240px] bg-ts-primary text-white hover:bg-ts-primary-hover transition-colors font-bold uppercase tracking-widest cursor-pointer disabled:opacity-80"
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div 
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3"
              >
                {language === 'zh' ? '已同步全局偏好' : 'Preferences Synced'} <CheckCircle2 size={24} />
              </motion.div>
            ) : (
              <motion.span
                key="save"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-black text-[15px] uppercase tracking-[0.2em]"
              >
                {language === 'zh' ? '同步设置' : 'Sync Preferences'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </section>
    </motion.div>
  );
};
