import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, ExternalLink, Radio, Search, Sparkles, Zap } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../lib/utils";
import {
  fetchHotTopics,
  fetchNews,
  getCachedHotTopics,
  getCachedNews,
  type HotTopicItem,
  type NewsItem,
} from "../services/newsService";
import type { AihotCategory } from "../../shared/ai-news";

type FeedView = "timeline" | "hotspots";
type CategoryFilter = "all" | Exclude<AihotCategory, "other">;

const categoryKeys: Exclude<AihotCategory, "other">[] = ["ai-models", "ai-products", "industry", "paper", "tip"];

const categoryLabels: Record<AihotCategory, { zh: string; en: string }> = {
  "ai-models": { zh: "模型", en: "Models" },
  "ai-products": { zh: "产品", en: "Products" },
  industry: { zh: "行业", en: "Industry" },
  paper: { zh: "论文", en: "Papers" },
  tip: { zh: "技巧", en: "Tips" },
  other: { zh: "其他", en: "Other" },
};

const AuthorAvatar = ({ avatarUrl }: { avatarUrl?: string }) => {
  const [failed, setFailed] = useState(false);
  if (!avatarUrl || failed) return null;

  return (
    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-ts-surface shadow-sm">
      <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
    </div>
  );
};

export const HotTopics = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useSettings();
  const [view, setView] = useState<FeedView>("timeline");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [hotTopics, setHotTopics] = useState<HotTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadingLong, setLoadingLong] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const t = language === "zh" ? {
    timeline: "资讯流",
    hotspots: "热点",
    searchNews: "搜索标题、摘要或来源...",
    searchTopics: "搜索热点或来源...",
    results: "条结果",
    sources: "个来源",
    signals: "条信号",
    latest: "最近更新",
    emptyNewsTitle: "暂无精选资讯",
    emptyNewsDesc: "当前筛选条件下没有匹配的资讯。",
    emptyHotTitle: "暂无聚合热点",
    emptyHotDesc: "当前没有可展示的多来源热点事件。",
    retry: "重新加载",
    reset: "重置筛选",
    errorTitle: "资讯加载失败",
    errorDesc: "暂时无法连接资讯源，请稍后重试。",
    loading: "正在获取最新 AI 资讯...",
    all: "全部",
  } : {
    timeline: "Timeline",
    hotspots: "Hot topics",
    searchNews: "Search titles, summaries, or sources...",
    searchTopics: "Search topics or sources...",
    results: "results",
    sources: "sources",
    signals: "signals",
    latest: "Latest",
    emptyNewsTitle: "No curated items",
    emptyNewsDesc: "No items match the current filters.",
    emptyHotTitle: "No aggregated topics",
    emptyHotDesc: "There are no multi-source topics to show right now.",
    retry: "Try again",
    reset: "Reset filters",
    errorTitle: "Unable to load news",
    errorDesc: "The news source is temporarily unavailable. Please try again.",
    loading: "Fetching the latest AI intelligence...",
    all: "All",
  };

  useEffect(() => {
    let hintTimer: ReturnType<typeof setTimeout>;
    const cachedNews = view === "timeline" ? getCachedNews() : null;
    const cachedTopics = view === "hotspots" ? getCachedHotTopics() : null;

    if (cachedNews) {
      setNews(cachedNews);
      setLoading(false);
      setLoadError(false);
      return;
    }

    if (cachedTopics) {
      setHotTopics(cachedTopics);
      setLoading(false);
      setLoadError(false);
      return;
    }

    const load = async () => {
      hintTimer = setTimeout(() => setLoadingLong(true), 5000);
      setLoading(true);
      setLoadError(false);
      try {
        if (view === "timeline") setNews(await fetchNews());
        else setHotTopics(await fetchHotTopics());
      } catch (error) {
        console.error("Failed to fetch AI HOT data:", error);
        setLoadError(true);
      } finally {
        clearTimeout(hintTimer);
        setLoading(false);
        setLoadingLong(false);
      }
    };

    void load();
    return () => clearTimeout(hintTimer);
  }, [loadAttempt, view]);

  const filteredNews = useMemo(() => news.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || [item.title, item.summary, item.source].some((value) => value.toLowerCase().includes(query));
    return matchesSearch && (selectedCategory === "all" || item.category === selectedCategory);
  }), [news, searchQuery, selectedCategory]);

  const filteredHotTopics = useMemo(() => hotTopics.filter((item) => {
    const query = searchQuery.toLowerCase();
    return !query || [item.title, item.source, ...item.sourceNames].some((value) => value.toLowerCase().includes(query));
  }), [hotTopics, searchQuery]);

  const groupedNews = useMemo(() => {
    const groups: Record<string, NewsItem[]> = {};
    filteredNews.forEach((item) => {
      const date = new Date(item.time);
      const label = Number.isNaN(date.getTime())
        ? (language === "zh" ? "较早之前" : "Earlier")
        : new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric" }).format(date);
      (groups[label] ??= []).push(item);
    });
    return Object.entries(groups).map(([dateLabel, items]) => ({ dateLabel, items }));
  }, [filteredNews, language]);

  const activeResultCount = view === "timeline" ? filteredNews.length : filteredHotTopics.length;
  const toggleGroup = (dateLabel: string) => setCollapsedGroups((current) => ({ ...current, [dateLabel]: !current[dateLabel] }));
  const formatTime = (time: string) => {
    const date = new Date(time);
    return Number.isNaN(date.getTime()) ? "--:--" : new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  };
  const categoryLabel = (category: AihotCategory) => categoryLabels[category][language];

  return (
    <div className="flex min-h-screen w-full flex-col bg-ts-canvas">
      <div ref={containerRef} className="immersive-section space-y-8 pb-24 pt-10 text-left">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            {(["timeline", "hotspots"] as FeedView[]).map((candidate) => {
              const active = view === candidate;
              const Icon = candidate === "timeline" ? Clock : Radio;
              return (
                <button
                  key={candidate}
                  onClick={() => { setView(candidate); setSearchQuery(""); }}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-barlow font-bold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink",
                    active ? "bg-ts-ink text-ts-canvas shadow-sm" : "bg-ts-surface-elevated text-ts-muted hover:bg-ts-surface hover:text-ts-ink",
                  )}
                  aria-pressed={active}
                >
                  <Icon size={14} />
                  {candidate === "timeline" ? t.timeline : t.hotspots}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {view === "timeline" ? (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {(["all", ...categoryKeys] as CategoryFilter[]).map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "relative whitespace-nowrap rounded-full px-4 py-2 text-xs font-barlow font-bold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink",
                        active ? "bg-ts-ink text-ts-canvas shadow-sm" : "bg-ts-surface-elevated text-ts-muted hover:bg-ts-surface hover:text-ts-ink",
                      )}
                    >
                      {category === "all" ? t.all : categoryLabel(category)}
                    </button>
                  );
                })}
              </div>
            ) : <div className="hidden md:block" />}

            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ts-muted-soft" size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 w-full rounded-[6px] bg-ts-surface-elevated pl-10 pr-4 text-xs font-medium text-ts-ink placeholder:text-ts-muted-soft transition-all focus:bg-ts-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink"
                placeholder={view === "timeline" ? t.searchNews : t.searchTopics}
                aria-label={view === "timeline" ? t.searchNews : t.searchTopics}
              />
            </div>
          </div>
        </motion.div>

        {!loading && !loadError && <p className="-mt-4 text-xs text-ts-muted" aria-live="polite">{activeResultCount} {t.results}</p>}

        <div className="relative pt-2">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-4 rounded-2xl bg-ts-surface p-6 shadow-md">
                  <div className="h-3 w-28 rounded bg-ts-surface-elevated" />
                  <div className="h-5 w-2/3 rounded bg-ts-surface-elevated" />
                  <div className="h-12 rounded bg-ts-surface-elevated" />
                </div>
              ))}
              {loadingLong && <p className="pt-4 text-center text-sm text-ts-muted">{t.loading}</p>}
            </div>
          ) : loadError ? (
            <EmptyState title={t.errorTitle} description={t.errorDesc} actionLabel={t.retry} onAction={() => setLoadAttempt((attempt) => attempt + 1)} />
          ) : view === "timeline" ? (
            groupedNews.length > 0 ? (
              <div className="space-y-12">
                {groupedNews.map((group, groupIndex) => (
                  <motion.div
                    key={group.dateLabel}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: groupIndex * 0.08, ease: "easeOut" }}
                  >
                    <button
                      onClick={() => toggleGroup(group.dateLabel)}
                      className="mb-4 inline-flex items-center gap-2 rounded-full bg-ts-surface-elevated px-3 py-1.5 text-xs font-barlow font-bold tracking-wider text-ts-ink shadow-sm transition-colors hover:bg-ts-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink"
                      aria-expanded={!collapsedGroups[group.dateLabel]}
                    >
                      <Clock size={13} />
                      {group.dateLabel}
                    </button>

                    <AnimatePresence initial={false}>
                      {!collapsedGroups[group.dateLabel] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ height: { duration: 0.25 }, opacity: { duration: 0.2 } }}
                          className="grid gap-5 overflow-hidden lg:grid-cols-2"
                        >
                          {group.items.map((item) => (
                            <article key={item.id} className="group flex min-h-56 flex-col rounded-2xl bg-ts-surface p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <AuthorAvatar avatarUrl={item.avatar} />
                                  <span className="truncate text-xs font-barlow font-bold tracking-wide text-ts-ink">{item.source}</span>
                                </div>
                                <time className="shrink-0 text-xs font-barlow font-bold text-ts-muted">{formatTime(item.time)}</time>
                              </div>
                              <div className="mt-5 space-y-2">
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 group/link">
                                  <h3 className="text-base font-bold leading-snug text-ts-ink transition-colors group-hover/link:text-ts-body sm:text-lg">{item.title}</h3>
                                  <ExternalLink size={14} className="mt-1 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                                </a>
                                <p className="line-clamp-3 text-xs leading-relaxed text-ts-body sm:text-sm">{item.summary}</p>
                              </div>
                              <span className="mt-auto inline-flex w-fit rounded-md bg-ts-surface-elevated px-2.5 py-1 text-[10px] font-barlow font-bold tracking-wide text-ts-ink/80">{categoryLabel(item.category)}</span>
                            </article>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            ) : <EmptyState title={t.emptyNewsTitle} description={t.emptyNewsDesc} actionLabel={t.reset} onAction={() => { setSearchQuery(""); setSelectedCategory("all"); }} />
          ) : filteredHotTopics.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredHotTopics.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
                  className="group flex min-h-56 flex-col rounded-2xl bg-ts-surface p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <AuthorAvatar avatarUrl={item.avatar} />
                      <span className="truncate text-xs font-barlow font-bold tracking-wide text-ts-ink">{item.source}</span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ts-surface-elevated px-2.5 py-1 text-[10px] font-barlow font-bold tracking-wide text-ts-muted"><Radio size={11} /> {item.sourceCount} {t.sources}</span>
                  </div>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-start gap-1.5 group/link">
                    <h3 className="text-lg font-bold leading-snug text-ts-ink transition-colors group-hover/link:text-ts-body">{item.title}</h3>
                    <ExternalLink size={15} className="mt-1 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                  </a>
                  <div className="mt-auto space-y-4 pt-6">
                    <div className="flex flex-wrap gap-1.5">
                      {item.sourceNames.slice(0, 4).map((source) => <span key={source} className="rounded-md bg-ts-surface-elevated px-2.5 py-1 text-[10px] font-barlow font-bold tracking-wide text-ts-ink/80">{source}</span>)}
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs font-barlow font-bold text-ts-muted">
                      <span className="inline-flex items-center gap-1.5"><Sparkles size={12} /> {item.signalCount} {t.signals}</span>
                      <span>{t.latest} · {formatTime(item.time)}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : <EmptyState title={t.emptyHotTitle} description={t.emptyHotDesc} actionLabel={t.reset} onAction={() => setSearchQuery("")} />}
        </div>

        <p className="pt-4 text-center text-[11px] leading-5 text-ts-muted">
          {language === "zh" ? "数据由 " : "Data via "}
          <a
            href="https://aihot.virxact.com/agent?tab=api"
            target="_blank"
            rel="noopener noreferrer"
            className="font-barlow font-bold tracking-wide text-ts-muted transition-colors hover:text-ts-ink"
          >
            AI HOT Public API
          </a>
          {language === "zh" ? " 提供；标题链接前往原文。" : "; headlines link to the original source."}
        </p>
      </div>
    </div>
  );
};

function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-ts-surface-elevated/40 py-24 text-center shadow-sm">
      <Zap size={44} className="mb-4 text-ts-muted" />
      <p className="text-sm font-barlow font-bold tracking-wider text-ts-ink">{title}</p>
      <p className="mt-1 text-xs text-ts-muted">{description}</p>
      <button onClick={onAction} className="mt-6 rounded-[6px] bg-ts-ink px-6 py-2.5 text-xs font-barlow font-bold tracking-wide text-ts-canvas shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink">{actionLabel}</button>
    </div>
  );
}
