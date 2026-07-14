import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ExternalLink, Zap, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { cn } from '../lib/utils';
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
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-ts-surface shadow-sm">
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
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
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
      setLoading(true);
      setLoadError(false);
      try {
        const data = await fetchNews();
        if (Array.isArray(data)) {
          setNews(data);
        } else {
          setNews([]);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        setLoadError(true);
      } finally {
        clearTimeout(hintTimer);
        setLoading(false);
        setLoadingLong(false);
      }
    };

    loadNews();
    return () => clearTimeout(hintTimer);
  }, [loadAttempt]);

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
      emptyTitle: '神经链接中断',
      emptyDesc: '在当前认知流中未找到匹配的热点话题。',
      resetBtn: '重置资讯流',
      retryBtn: '重新加载',
      errorTitle: '资讯加载失败',
      errorDesc: '暂时无法连接资讯源，请稍后重试。'
    },
    en: {
      tag: 'Smart Intel Stream',
      title: 'Curated',
      subtitle: 'AI-curated high-value content',
      searchPlaceholder: 'Search titles/summary...',
      emptyTitle: 'Neural Link Broken',
      emptyDesc: 'No matching hot topics found in the current cognitive stream.',
      resetBtn: 'Reset Stream',
      retryBtn: 'Try again',
      errorTitle: 'Unable to load news',
      errorDesc: 'The news source is temporarily unavailable. Please try again.'
    }
  }[language];

  return (
    <div className="w-full min-h-screen flex flex-col bg-ts-canvas">
      <div ref={containerRef} className="pb-24 immersive-section text-left pt-10 space-y-8">

      {/* Category Tabs & Search Bar Row */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 relative z-20"
      >
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1 relative z-20">
          {["全部", "模型", "产品", "行业", "论文", "技巧"].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "relative px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary",
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
                    "absolute inset-0 rounded-full -z-20 transition-all duration-300",
                    isActive ? "opacity-0" : "bg-ts-surface-elevated hover:bg-ts-surface opacity-100 shadow-sm"
                  )} 
                />

                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ts-muted-soft" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-ts-surface-elevated text-ts-ink pl-10 pr-4 h-10 rounded-[6px] text-xs font-medium focus:bg-ts-surface transition-all placeholder:text-ts-muted-soft w-full md:w-72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
            />
          </div>
        </div>
      </motion.div>

      {!loading && !loadError && (
        <p className="-mt-6 text-xs text-ts-muted" aria-live="polite">
          {language === 'zh' ? `${filteredNews.length} 条结果` : `${filteredNews.length} results`}
        </p>
      )}

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
            {groupedNews.map((group, groupIdx) => (
              <motion.div 
                key={group.dateLabel} 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: groupIdx * 0.12, ease: 'easeOut' }}
                className="flex flex-col"
              >
                {/* Date Header */}
                <button
                  onClick={() => toggleGroup(group.dateLabel)}
                  className="flex items-center gap-2 select-none pl-6 md:pl-20 hover:text-ts-primary transition-colors duration-200 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
                  aria-expanded={!collapsedGroups[group.dateLabel]}
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
                                  <p className="text-ts-body text-sm leading-relaxed line-clamp-3">
                                    {item.summary}
                                  </p>
                                </div>

                                {/* Image: Display if exists */}
                                {item.image && (
                                  <div className="w-full max-w-[480px] rounded-[12px] overflow-hidden shadow-md">
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
                                    {item.tags.slice(0, 2).map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2.5 py-1 rounded-[4px] text-[10px] font-semibold bg-ts-surface-elevated text-ts-primary"
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
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-24 flex flex-col items-center justify-center rounded-2xl bg-ts-surface-elevated/40 shadow-sm">
            <Zap size={48} className="text-ts-muted mb-4" />
            <p className="text-sm font-bold text-ts-ink uppercase tracking-wider">{loadError ? t.errorTitle : t.emptyTitle}</p>
            <p className="text-xs text-ts-muted mt-1">{loadError ? t.errorDesc : t.emptyDesc}</p>
            <button 
              onClick={() => {
                if (loadError) {
                  setLoadAttempt(attempt => attempt + 1);
                } else {
                  setSearchQuery('');
                  setSelectedCategory('全部');
                }
              }}
              className="mt-6 px-6 py-2.5 bg-ts-primary text-white rounded-[6px] text-xs font-semibold hover:bg-ts-primary-hover transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
            >
              {loadError ? t.retryBtn : t.resetBtn}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
