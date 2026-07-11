import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Check, Upload, Sparkles, Heart, MessageCircle, Star } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { marked } from 'marked';

const initialSample = `# 🎯 3个步骤，彻底戒掉拖延症！

拖延症不可怕，主要是你没找到科学的大脑对策。试试这三个神经同步步骤：

📌 **1. 5分钟法则**：只要开始做5分钟，你的大脑就会自动建立专注习惯。
🚀 **2. 极简拆解**：把大任务拆成比芝麻还小的微型步骤，消灭畏难情绪。
💡 **3. 即时反馈**：每完成一步，就给大脑发送一次成就感奖励！

#时间同步 #自律成长 #干货分享 #自我提升`;

export const Md2Red = () => {
  const navigate = useNavigate();
  const { language } = useSettings();
  const [markdown, setMarkdown] = useState<string>(initialSample);
  const [toastMessage, setToastMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleReset = () => {
    setMarkdown(initialSample);
    showToast(language === 'zh' ? '已恢复示例数据' : 'Restored sample data');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setMarkdown(text);
        showToast(language === 'zh' ? '导入成功' : 'Imported successfully');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyText = () => {
    navigator.clipboard.writeText(markdown);
    showToast(language === 'zh' ? '已复制帖子文本' : 'Copied post text');
  };

  const previewHtml = useMemo(() => {
    try {
      return marked.parse(markdown) as string;
    } catch (e) {
      return markdown.replace(/\n/g, '<br/>');
    }
  }, [markdown]);

  const t = {
    zh: {
      title: '小红书排版卡片生成器',
      desc: '将 Markdown 笔记秒级转换为精美的小红书爆款排版卡片，自带社交交互预览。',
      editorTitle: 'Markdown 原文',
      editorHint: '支持标题、列表、加粗、标签及 Emoji 符号',
      previewTitle: '小红书实机卡片预览',
      previewHint: '高保真还原小红书移动端显示效果',
      reset: '恢复示例',
      import: '导入 MD',
      copyText: '复制帖子文本',
      back: '返回自习室'
    },
    en: {
      title: 'Xiaohongshu Card Formatter',
      desc: 'Convert Markdown notes into trending Xiaohongshu styled social cards with interaction preview.',
      editorTitle: 'Markdown Source',
      editorHint: 'Supports headers, list items, bolding, tags, and emojis',
      previewTitle: 'Xiaohongshu Phone Preview',
      previewHint: 'High-fidelity mobile UI display representation',
      reset: 'Restore Sample',
      import: 'Import MD',
      copyText: 'Copy Post Text',
      back: 'Back to Work'
    }
  }[language];

  return (
    <div className="w-full min-h-screen flex flex-col bg-ts-canvas">
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-10 pb-8 flex flex-col gap-6 text-left relative select-none">
        
        {/* Back button and page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4">
          <div className="space-y-1.5">
            <button
              onClick={() => navigate('/work')}
              className="inline-flex items-center gap-1 text-xs font-display font-bold text-ts-body hover:text-ts-ink transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{t.back}</span>
            </button>
            <h1 className="text-xl md:text-2xl font-display font-bold text-ts-ink flex items-center gap-2">
              <span>{t.title}</span>
              <Sparkles size={16} className="text-ts-primary animate-pulse" />
            </h1>
            <p className="text-xs text-ts-body">
              {t.desc}
            </p>
          </div>

          {/* Action button toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 h-9 px-3 rounded-lg bg-ts-surface-elevated text-ts-body hover:text-ts-ink text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <RefreshCw size={13} />
              <span>{t.reset}</span>
            </button>

            <button
              onClick={handleImportClick}
              className="flex items-center gap-1 h-9 px-3 rounded-lg bg-ts-surface-elevated text-ts-body hover:text-ts-ink text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <Upload size={13} />
              <span>{t.import}</span>
            </button>

            <button
              onClick={copyText}
              className="flex items-center gap-1.5 h-9 px-4.5 rounded-lg bg-ts-ink text-ts-canvas text-xs font-bold font-display uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Copy size={13} />
              <span>{t.copyText}</span>
            </button>
          </div>
        </div>

        {/* Editor & Preview Workspace Grid */}
        <div className="h-[calc(100vh-16rem)] min-h-[500px] grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left pane: Editor */}
        <div className="flex flex-col bg-ts-surface rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] h-full min-h-0">
          <div className="p-3 flex items-center justify-between bg-ts-surface-elevated/40">
            <span className="text-xs font-bold text-ts-ink font-display uppercase tracking-wider">{t.editorTitle}</span>
            <span className="text-[10px] text-ts-body">{t.editorHint}</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full p-5 bg-transparent text-ts-ink text-xs font-mono resize-none outline-none leading-relaxed border-none focus:ring-0"
            spellCheck="false"
            placeholder="Type or paste markdown..."
          />
        </div>

        {/* Right pane: Phone simulator preview */}
        <div className="flex flex-col bg-ts-surface rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] h-full min-h-0">
          <div className="p-3 flex items-center justify-between bg-ts-surface-elevated/40">
            <span className="text-xs font-bold text-ts-ink font-display uppercase tracking-wider">{t.previewTitle}</span>
            <span className="text-[10px] text-ts-body">{t.previewHint}</span>
          </div>
          {/* Mobile simulator environment */}
          <div className="flex-1 overflow-y-auto p-6 bg-ts-canvas/40 dark:bg-black/20 flex justify-center items-center select-text scrollbar-thin">
            <div className="relative w-full max-w-[290px] bg-white dark:bg-[#1E1E1E] text-neutral-800 dark:text-neutral-200 border dark:border-white/5 rounded-[24px] shadow-2xl flex flex-col overflow-hidden aspect-[3/4] h-[380px]">
              
              {/* Dynamic Header top band */}
              <div className="h-2.5 bg-gradient-to-r from-ts-primary to-orange-500 shrink-0" />
              
              {/* Card Content (Xiaohongshu post body) */}
              <div className="flex-1 p-4 overflow-y-auto scrollbar-thin text-left select-none">
                <div 
                  className="prose prose-sm text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans space-y-2
                    [&>h1]:text-[13px] [&>h1]:font-black [&>h1]:text-neutral-900 dark:[&>h1]:text-white [&>h1]:mb-3 [&>h1]:pb-1.5 [&>h1]:border-b [&>h1]:border-neutral-100 dark:[&>h1]:border-neutral-850
                    [&>p]:mb-2
                    [&>ul]:list-none [&>ul]:pl-0 [&>ul]:space-y-1.5
                    [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:space-y-1.5
                    [&>strong]:text-neutral-900 dark:[&>strong]:text-white [&>strong]:font-bold"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>

              {/* Interaction simulation footer */}
              <div className="bg-white dark:bg-[#1E1E1E] border-t dark:border-white/5 px-4 py-3 flex items-center justify-between text-neutral-400 dark:text-neutral-500 text-[10px] shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-5.5 h-5.5 rounded-full bg-ts-primary/10 flex items-center justify-center text-ts-primary font-bold text-[9px]">
                    时
                  </div>
                  <span className="font-bold text-neutral-600 dark:text-neutral-400">时间同步.md</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 text-rose-500">
                    <Heart size={12} fill="currentColor" />
                    <span className="font-bold">99+</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star size={12} />
                    <span className="font-bold">88</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <MessageCircle size={12} />
                    <span className="font-bold">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md"
        className="hidden"
      />

      {/* Global rich overlay toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4.5 py-2.5 rounded-lg bg-ts-surface-elevated text-ts-ink font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={14} className="text-ts-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      </div>
    </div>
  );
};
