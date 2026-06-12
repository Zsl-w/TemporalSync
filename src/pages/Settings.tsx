import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Monitor, Type, Palette, CheckCircle2, RotateCcw, User as UserIcon, LogOut, ShieldCheck, Mail, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { UI_CLASSES } from '../constants/ui';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize, language, setLanguage, resetSettings } = useSettings();
  const { user, signOut } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[700px] mx-auto space-y-12 pb-20 mt-10 px-6"
    >
      <div className="space-y-2">
        <h1 className="text-[28px] font-black text-ts-neutral-900 tracking-tight">偏好设置</h1>
        <p className="text-ts-neutral-500 text-[13px] font-bold uppercase tracking-widest">个性化您的同步空间</p>
      </div>

      {/* Account Section */}
      <section className={cn(UI_CLASSES.card, "p-10 relative overflow-hidden group")}>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-ts-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10 space-y-10">
          <div className="flex items-start gap-3 px-1">
            <UserIcon size={14} className="text-ts-primary" />
            <h2 className="text-[11px] font-black text-ts-neutral-400 uppercase tracking-widest">账户管理</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-[8px] bg-ts-primary flex items-center justify-center text-white overflow-hidden shadow-2xl">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={32} />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white text-ts-success">
                  <ShieldCheck size={16} fill="currentColor" className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-[20px] font-display font-black text-ts-neutral-900">{user?.displayName || '未认证访客'}</h3>
                <div className="flex items-center gap-2 mt-1 text-ts-neutral-400">
                  <Mail size={12} />
                  <span className="text-[12px] font-medium">{user?.email || '未绑定邮箱'}</span>
                </div>
              </div>
            </div>

            {user && (
              <button 
                onClick={signOut}
                className="px-8 h-14 glass-card rounded-2xl flex items-center gap-3 text-ts-error hover:bg-ts-error hover:text-white transition-all text-[12px] font-black uppercase tracking-widest group/logout"
              >
                登出账户
                <LogOut size={18} className="group-hover/logout:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Language */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Globe size={14} className="text-ts-primary" />
          <h2 className="text-[11px] font-black text-ts-neutral-400 uppercase tracking-widest">语言 / Language</h2>
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
                "bg-ts-surface border-2 rounded-[12px] flex items-center justify-center gap-3 h-16 px-4 transition-all",
                language === lang.id ? "border-ts-primary shadow-lg shadow-ts-primary/10" : "border-ts-hairline hover:border-ts-muted-soft"
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
                language === lang.id ? "text-ts-primary-light" : "text-ts-muted-soft"
              )}>
                {lang.sub}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Visual Tuning */}
      <section className={cn(UI_CLASSES.card, "p-10 space-y-10")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[20px] bg-ts-primary/10 text-ts-primary flex items-center justify-center shadow-inner">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-display font-black text-ts-neutral-900 uppercase tracking-tight">主题基调</h3>
              <p className="text-ts-neutral-400 text-[11px] font-bold mt-0.5">选取全站核心感知色</p>
            </div>
          </div>
          <div className="flex gap-4">
            {['#B497CF', '#ff9aa5', '#f7d070', '#85e3b2', '#c084fc'].map(color => (
              <button 
                key={color} 
                onClick={() => setAccentColor(color)}
                className={cn(
                  "w-12 h-12 rounded-[18px] transition-all hover:scale-110 flex items-center justify-center border-4 border-transparent shadow-lg",
                  color === accentColor ? "border-white ring-2 ring-ts-primary" : "opacity-40 hover:opacity-100"
                )}
                style={{ backgroundColor: color }}
              >
                {color === accentColor && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-ts-surface-elevated" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[20px] bg-ts-primary/10 text-ts-primary flex items-center justify-center shadow-inner">
              <Type size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-display font-black text-ts-neutral-900 uppercase tracking-tight">文字缩放</h3>
              <p className="text-ts-neutral-400 text-[11px] font-bold mt-0.5">调优阅读辅助体验 ({fontSize}%)</p>
            </div>
          </div>
          <div className="flex items-center gap-6 w-full sm:w-72 bg-ts-surface-elevated px-6 py-5 rounded-2xl border border-ts-hairline">
            <span className="text-[10px] text-ts-neutral-400 font-black italic">MIN</span>
            <input 
              type="range" 
              min="90" 
              max="110" 
              step="5"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="flex-1 accent-ts-primary h-2 rounded-full cursor-pointer appearance-none bg-ts-hairline" 
            />
            <span className="text-[10px] text-ts-neutral-400 font-black italic">MAX</span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col sm:flex-row justify-end gap-4">
        <button 
          onClick={resetSettings}
          className={cn(UI_CLASSES.buttonOutline, "h-16 px-10 rounded-[8px] border-ts-hairline text-ts-neutral-400 hover:text-ts-neutral-900 flex items-center gap-3")}
        >
          <RotateCcw size={20} />
          <span className="font-black text-[14px] uppercase tracking-widest leading-none">重置为默认</span>
        </button>
        <button 
          onClick={handleSave}
          disabled={saved}
          className={cn(
            UI_CLASSES.buttonPrimary, 
            "h-16 px-14 rounded-[8px] shadow-2xl shadow-ts-primary/20 relative min-w-[240px]"
          )}
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div 
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                已同步全局偏好 <CheckCircle2 size={24} />
              </motion.div>
            ) : (
              <motion.span
                key="save"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-black text-[15px] uppercase tracking-[0.2em]"
              >
                同步设置
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </section>
    </motion.div>
  );
};
