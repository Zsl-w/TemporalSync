import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ExternalLink, Loader2, Zap, Clock, ArrowRight, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import { fetchNews, getCachedNews } from '../services/newsService';

interface NewsItem {
  title: string;
  source: string;
  link: string;
  time: string;
  category: string;
  summary: string;
  image?: string;
  tags?: string[];
  recommendedReason?: string;
  avatar?: string;
}

const AuthorAvatar = ({ avatarUrl, source }: { avatarUrl?: string; source: string }) => {
  const [failed, setFailed] = useState(false);

  if (!avatarUrl || failed) {
    return null;
  }

  return (
    <div className="w-8 h-8 rounded-full border border-ts-hairline overflow-hidden flex-shrink-0 bg-ts-surface">
      <img
        src={avatarUrl}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export const HotTopics = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useSettings();
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLong, setLoadingLong] = useState(false); // shows hint after 5s
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [collapsedGroups, setCollapsedGroups] = useState<{[key: string]: boolean}>({});

  const toggleGroup = (dateLabel: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [dateLabel]: !prev[dateLabel]
    }));
  };

  useEffect(() => {
    let hintTimer: ReturnType<typeof setTimeout>;
    
    // Check cache first — may already be populated by prefetch
    const cached = getCachedNews();
    if (cached) {
      setNews(cached);
      setLoading(false);
      return;
    }

    const loadNews = async () => {
      hintTimer = setTimeout(() => setLoadingLong(true), 5000);
      try {
        const data = await fetchNews();
        if (Array.isArray(data)) {
          setNews(data);
        } else {
          setNews([]);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        clearTimeout(hintTimer);
        setLoading(false);
        setLoadingLong(false);
      }
    };

    loadNews();
    return () => clearTimeout(hintTimer);
  }, []);

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.source.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [news, searchQuery, selectedCategory]);

  const formatDateLabel = (timeStr: string) => {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return '较早之前';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const formatItemTime = (timeStr: string) => {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return '00:00';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const groupedNews = useMemo(() => {
    const groups: { [key: string]: NewsItem[] } = {};
    filteredNews.forEach(item => {
      const label = formatDateLabel(item.time);
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(item);
    });
    
    return Object.entries(groups).map(([dateLabel, items]) => ({
      dateLabel,
      items
    }));
  }, [filteredNews]);

  const t = {
    zh: {
      tag: '智能情报流',
      title: '精选',
      subtitle: 'AI 自动筛选的高价值内容',
      searchPlaceholder: '搜索标题/摘要...',
      searchBtn: '搜索',
      emptyTitle: '神经链接中断',
      emptyDesc: '在当前认知流中未找到匹配的热点话题。',
      resetBtn: '重置资讯流'
    },
    en: {
      tag: 'Smart Intel Stream',
      title: 'Curated',
      subtitle: 'AI-curated high-value content',
      searchPlaceholder: 'Search titles/summary...',
      searchBtn: 'Search',
      emptyTitle: 'Neural Link Broken',
      emptyDesc: 'No matching hot topics found in the current cognitive stream.',
      resetBtn: 'Reset Stream'
    }
  }[language];

  return (
    <div className="w-full min-h-screen flex flex-col bg-ts-canvas">
      {/* Sunset Fluid Header Banner */}
      <div 
        className="w-full h-[220px] mt-[-4rem] relative overflow-hidden flex items-end pb-7 select-none z-10 shadow-inner"
        style={{
          background: 'radial-gradient(circle at 10% 20%, rgba(244, 192, 149, 0.9) 0%, transparent 45%), radial-gradient(circle at 90% 10%, rgba(168, 74, 140, 0.9) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(225, 81, 110, 0.95) 0%, transparent 60%), radial-gradient(circle at 80% 90%, rgba(106, 55, 131, 1) 0%, transparent 60%), radial-gradient(circle at 0% 90%, rgba(238, 123, 98, 0.95) 0%, transparent 55%), linear-gradient(135deg, #EE7B62, #6A3783)'
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px] opacity-40 mix-blend-overlay" />
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex items-center relative z-10">
          <div className="flex items-center gap-5 bg-white/10 dark:bg-black/15 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-white/15 dark:hover:bg-black/20 hover:scale-[1.01] hover:-translate-y-0.5 group/capsule cursor-pointer max-w-xl">
            
            {/* Layered 3D Sticker Stack */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#FF9F66] to-[#FF416C] opacity-40 transform -rotate-12 translate-x-[-2px] translate-y-[2px] transition-transform duration-500 group-hover/capsule:-rotate-[18deg]" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#A84A8C] to-[#6A3783] opacity-60 transform rotate-6 translate-x-[2px] translate-y-[-1px] transition-transform duration-500 group-hover/capsule:rotate-[12deg]" />
              <div className="absolute inset-0 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-md transition-transform duration-500 group-hover/capsule:scale-105">
                <Zap size={20} className="text-white fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
              </div>
            </div>

            {/* Text Slogan */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/55 tracking-[0.2em] uppercase leading-none block">
                {language === 'zh' ? '动态热点' : 'Intel Stream'}
              </span>
              <span className="text-[14px] sm:text-[15px] font-display font-bold tracking-[0.06em] text-white uppercase leading-snug block drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                {language === 'zh' ? 'AI热点 · 跟踪最前沿的技术情报' : 'TRACKING LATEST AI FRONTIERS & INTELLIGENCE'}
              </span>
            </div>

          </div>
        </div>
      </div>

      <div ref={containerRef} className="pb-24 immersive-section text-left pt-12 space-y-8">

      {/* Category Tabs & Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 relative z-20">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1 relative z-20">
          {["全部", "模型", "产品", "行业", "论文", "技巧"].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "relative px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-colors duration-300 whitespace-nowrap outline-none cursor-pointer",
                  isActive ? "text-white shadow-sm" : "text-ts-muted hover:text-ts-ink"
                )}
              >
                {/* Active Slider Background Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-ts-primary rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                {/* Inactive Button Background & Border */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-full border border-ts-hairline -z-20 transition-all duration-300",
                    isActive ? "opacity-0" : "bg-ts-surface-elevated hover:bg-ts-surface opacity-100"
                  )} 
                />

                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ts-muted-soft" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-ts-surface-elevated text-ts-ink border border-ts-hairline pl-10 pr-4 h-10 rounded-[6px] text-xs font-medium focus:bg-ts-surface focus:border-ts-primary outline-none transition-all placeholder:text-ts-muted-soft w-full md:w-64"
              placeholder={t.searchPlaceholder}
            />
          </div>
          <button 
            className="px-5 h-10 bg-ts-navy-800 text-white rounded-[6px] text-xs font-semibold hover:bg-ts-navy-900 transition-all shadow-sm whitespace-nowrap"
          >
            {t.searchBtn}
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative pt-4">
        {loading ? (
          <div className="relative pl-6 md:pl-20 space-y-12 animate-pulse">
            <div className="absolute left-[34px] md:left-[82px] top-2 bottom-2 w-[4px] bg-ts-ink/5 dark:bg-white/5 rounded-full backdrop-blur-[1px] border-l border-white/20 dark:border-white/10 border-r border-black/5 dark:border-black/20 shadow-sm" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-6 md:gap-12">
                <div className="hidden md:block w-16 h-4 bg-ts-surface-elevated rounded mt-6" />
                <div className="w-3.5 h-3.5 rounded-full bg-ts-surface-elevated border-4 border-ts-canvas mt-6" />
                <div className="bg-ts-surface rounded-2xl flex-1 p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-ts-surface-elevated/60" />
                      <div className="w-20 h-3 bg-ts-surface-elevated/60 rounded" />
                    </div>
                    <div className="w-16 h-4 bg-ts-surface-elevated/60 rounded-full" />
                  </div>
                  <div className="w-2/3 h-5 bg-ts-surface-elevated/60 rounded" />
                  <div className="w-full h-12 bg-ts-surface-elevated/60 rounded" />
                </div>
              </div>
            ))}
            {loadingLong && (
              <div className="mt-8 text-center">
                <p className="text-sm text-ts-muted animate-pulse">
                  {language === 'zh' 
                    ? '正在全网萃取最新 AI 资讯，请耐心等待...' 
                    : 'Extracting the latest AI intelligence across the web...'}
                </p>
              </div>
            )}
          </div>
        ) : groupedNews.length > 0 ? (
          <div className="space-y-12">
            {groupedNews.map((group) => (
              <div key={group.dateLabel} className="flex flex-col">
                {/* Date Header */}
                <button
                  onClick={() => toggleGroup(group.dateLabel)}
                  className="flex items-center gap-2 select-none pl-6 md:pl-20 hover:text-ts-primary transition-colors duration-200 outline-none group cursor-pointer"
                >
                  <span className="text-sm font-bold text-ts-ink tracking-wider group-hover:text-ts-primary transition-colors">
                    {group.dateLabel}
                  </span>
                  <svg 
                    className={cn(
                      "w-4 h-4 text-ts-muted transition-transform duration-300 ease-out group-hover:text-ts-primary", 
                      collapsedGroups[group.dateLabel] ? "-rotate-90" : "rotate-0"
                    )} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Timeline Items */}
                <AnimatePresence initial={false}>
                  {!collapsedGroups[group.dateLabel] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        height: { type: 'spring', stiffness: 200, damping: 25 },
                        opacity: { duration: 0.2, ease: 'easeInOut' }
                      }}
                      className="relative pl-6 md:pl-20 space-y-8 overflow-hidden pt-6"
                    >
                      {/* Vertical line connecting all items inside this date group */}
                      <div className="absolute left-[34px] md:left-[82px] top-2 bottom-2 w-[4px] bg-ts-ink/5 dark:bg-white/5 rounded-full backdrop-blur-[1px] border-l border-white/20 dark:border-white/10 border-r border-black/5 dark:border-black/20 shadow-sm" />

                      {group.items.map((item) => {
                        const timeStr = formatItemTime(item.time);
                        return (
                          <div key={item.link} className="relative flex flex-col md:flex-row gap-4 md:gap-12">
                            {/* Time Column (Left of Timeline) */}
                            <div className="hidden md:flex md:w-16 items-start justify-end pt-5 text-sm font-bold text-ts-ink font-mono tracking-tight">
                              {timeStr}
                            </div>

                            {/* Timeline Node/Dot */}
                            <div className="absolute left-[29px] md:left-[77px] top-6 w-3.5 h-3.5 rounded-full bg-ts-primary border-4 border-ts-canvas dark:border-ts-canvas z-10 shadow-[0_0_10px_rgba(249,185,166,0.3)]" />

                            {/* Mobile Time (Show time inline for smaller screens) */}
                            <div className="md:hidden flex items-center gap-2 pl-8 text-xs font-bold text-ts-muted font-mono">
                              <Clock size={12} />
                              {timeStr}
                            </div>

                            {/* Card container */}
                            <div className="flex-1 pl-8 md:pl-0">
                              <div className="bg-ts-surface rounded-2xl p-6 md:p-8 flex flex-col gap-5 transition-all duration-300 relative group overflow-hidden">
                                {/* Header: Author + Score */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <AuthorAvatar avatarUrl={item.avatar} source={item.source} />
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-ts-ink">
                                        {item.source}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Title & Link */}
                                <div className="space-y-2">
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 group/link"
                                  >
                                    <h3 className="text-base md:text-lg font-bold text-ts-ink leading-snug group-hover/link:text-ts-primary transition-colors">
                                      {item.title}
                                    </h3>
                                    <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 text-ts-primary transition-opacity shrink-0" />
                                  </a>
                                  <p className="text-ts-body text-sm leading-relaxed">
                                    {item.summary}
                                  </p>
                                </div>

                                {/* Image: Display if exists */}
                                {item.image && (
                                  <div className="w-full max-w-xl rounded-[8px] overflow-hidden border border-ts-hairline">
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full max-h-60 md:max-h-80 object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
                                      loading="lazy"
                                      onError={(e) => {
                                        (e.target as HTMLElement).parentElement!.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2.5 py-1 rounded-[4px] text-[10px] font-semibold bg-ts-surface-elevated text-ts-primary border border-ts-hairline"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-24 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ts-hairline bg-ts-surface-elevated/40">
            <Zap size={48} className="text-ts-muted mb-4" />
            <p className="text-sm font-bold text-ts-ink uppercase tracking-wider">{t.emptyTitle}</p>
            <p className="text-xs text-ts-muted-soft mt-1">{t.emptyDesc}</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('全部'); }}
              className="mt-6 px-6 py-2.5 bg-ts-primary text-white rounded-[6px] text-xs font-semibold hover:bg-ts-primary-hover transition-all shadow-sm"
            >
              {t.resetBtn}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
