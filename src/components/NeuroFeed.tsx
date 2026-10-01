import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Clock, ExternalLink, MessageCircle, RefreshCw, Search } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../lib/utils";
import { fetchNeuroFeed } from "../services/neuroFeedService";
import type { NeuroFeedKind, NeuroFeedResponse } from "../../shared/neuro-feed";

type KindFilter = "all" | NeuroFeedKind;

export function NeuroFeed() {
  const { language } = useSettings();
  const isZh = language === "zh";
  const [feed, setFeed] = useState<NeuroFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [attempt, setAttempt] = useState(0);

  const refresh = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void fetchNeuroFeed(attempt > 0).then((data) => {
      if (active) setFeed(data);
    }).catch(() => {
      if (active) setError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 15 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(isZh ? "zh-CN" : "en-US", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "short", day: "numeric",
  }), [isZh]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (feed?.items ?? []).filter((item) => (kind === "all" || item.kind === kind) &&
      (!needle || [item.title, item.source, item.summary].some((text) => text.toLowerCase().includes(needle))));
  }, [feed, kind, query]);
  const groups = useMemo(() => {
    const entries = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const date = dateFormatter.format(new Date(item.time));
      entries.set(date, [...(entries.get(date) ?? []), item]);
    }
    return [...entries];
  }, [filtered, dateFormatter]);
  const relevantSources = (feed?.sources ?? []).filter((source) => kind === "all" || source.kind === kind);
  const unavailable = relevantSources.filter((source) => source.status === "error" || source.status === "stale");
  const awaitingWechat = (feed?.sources ?? []).filter((source) => source.kind === "wechat" && source.status === "unconfigured");
  const updatedAt = relevantSources.map((source) => source.updatedAt).filter((value): value is string => !!value).sort().at(-1);
  const syncLabel = updatedAt ? new Intl.DateTimeFormat(isZh ? "zh-CN" : "en-US", {
    timeZone: "Asia/Shanghai", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(updatedAt)) : null;

  return (
    <section className="space-y-6" aria-label={isZh ? "神经精神影像与 AI 资讯" : "Neuroimaging and AI feed"}>
      <p className="text-sm leading-6 text-ts-muted">
        {isZh ? "抑郁症 · 阿尔茨海默病 · 帕金森病 · 双相情感障碍，影像模态不限。" : "Depression · Alzheimer's · Parkinson's · Bipolar disorder, across imaging modalities."}
      </p>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "paper", "wechat"] as KindFilter[]).map((candidate) => (
            <button key={candidate} onClick={() => setKind(candidate)} aria-pressed={kind === candidate}
              className={cn("rounded-full px-4 py-2 text-xs font-barlow font-bold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink",
                kind === candidate ? "bg-ts-ink text-ts-canvas" : "bg-ts-surface-elevated text-ts-muted hover:bg-ts-surface hover:text-ts-ink")}>
              {candidate === "all" ? (isZh ? "全部" : "All") : candidate === "paper" ? (isZh ? "论文" : "Papers") : (isZh ? "公众号" : "WeChat")}
            </button>
          ))}
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative min-w-0 flex-1 md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ts-muted-soft" />
            <input value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder={isZh ? "搜索标题、摘要或来源..." : "Search titles, abstracts, or sources..."}
              aria-label={isZh ? "搜索专业资讯" : "Search research feed"}
              className="h-10 w-full rounded-[6px] bg-ts-surface-elevated pl-10 pr-4 text-xs font-medium text-ts-ink placeholder:text-ts-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink" />
          </div>
          <button onClick={refresh} disabled={loading} aria-label={isZh ? "刷新专业资讯" : "Refresh research feed"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-ts-surface-elevated text-ts-muted hover:text-ts-ink disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {!loading && feed && <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ts-muted" aria-live="polite">
        <span>{filtered.length} {isZh ? "条结果" : "results"}</span>
        {syncLabel && <span>{isZh ? "最近同步" : "Last synced"} · {syncLabel}</span>}
      </div>}

      {error && <div role="alert" className="rounded-xl bg-ts-surface-elevated p-4 text-sm text-ts-body">
        <p>{isZh ? "专业资讯加载失败，请稍后重试。" : "Unable to load the research feed. Please try again."}</p>
        <button onClick={refresh} className="mt-2 font-medium underline underline-offset-4">{isZh ? "重新加载" : "Try again"}</button>
      </div>}
      {unavailable.length > 0 && <div role="status" className="rounded-xl bg-ts-surface-elevated p-4 text-xs leading-6 text-ts-muted">
        <p>{isZh ? "部分来源暂时无法更新：" : "Some sources could not update: "}{unavailable.map((source) => source.name).join("、")}
          {unavailable.some((source) => source.status === "stale") && (isZh ? "。当前保留上次成功获取的内容。" : ". Previously fetched content is retained.")}</p>
        <button onClick={refresh} disabled={loading} className="font-medium underline underline-offset-4">{isZh ? "重新加载" : "Try again"}</button>
      </div>}

      {loading && !feed ? <div className="grid animate-pulse gap-5 lg:grid-cols-2" aria-label={isZh ? "正在加载专业资讯" : "Loading research feed"}>
        {[0, 1, 2, 3].map((index) => <div key={index} className="space-y-5 rounded-2xl bg-ts-surface p-6">
          <div className="h-3 w-28 rounded bg-ts-surface-elevated" /><div className="h-12 rounded bg-ts-surface-elevated" />
          <div className="h-16 rounded bg-ts-surface-elevated" />
        </div>)}
      </div> : groups.length > 0 ? <div className="space-y-10">
        {groups.map(([date, items]) => <div key={date}>
          <h2 className="mb-4 inline-flex items-center gap-2 rounded-full bg-ts-surface-elevated px-3 py-1.5 text-xs font-barlow font-bold text-ts-ink">
            <Clock size={13} />{date}
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {items.map((item, index) => <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
              className="group flex flex-col gap-4 rounded-2xl bg-ts-surface p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 break-words text-xs font-barlow font-bold leading-5 text-ts-muted">{item.source}</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ts-surface-elevated px-2.5 py-1 text-[10px] font-bold text-ts-ink/80">
                  {item.kind === "paper" ? <BookOpen size={12} /> : <MessageCircle size={12} />}
                  {item.kind === "wechat" ? (isZh ? "公众号" : "WeChat") : item.preprint ? (isZh ? "预印本" : "Preprint") : (isZh ? "论文" : "Paper")}
                </span>
              </div>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink">
                <h3 className="min-w-0 break-words text-base font-bold leading-snug text-ts-ink sm:text-lg">{item.title}</h3>
                <ExternalLink size={14} className="mt-1 shrink-0 text-ts-muted" />
              </a>
              {item.kind === "paper" && item.summary && <p className="line-clamp-3 text-xs leading-relaxed text-ts-body sm:text-sm">{item.summary}</p>}
              <div className="mt-auto flex items-center justify-between gap-3 pt-1 text-xs text-ts-muted">
                <time dateTime={item.time}>{dateFormatter.format(new Date(item.time))}</time>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:text-ts-ink">
                  {isZh ? "阅读原文" : "Read original"}<ExternalLink size={12} />
                </a>
              </div>
            </motion.article>)}
          </div>
        </div>)}
      </div> : !loading && !error && unavailable.length === 0 && !(kind === "wechat" && awaitingWechat.length > 0) ?
        <div className="rounded-2xl bg-ts-surface-elevated/40 px-6 py-16 text-center text-sm text-ts-muted">
          <p>{isZh ? (query ? "没有匹配的内容。" : "近期暂无新内容。") : (query ? "No matching items." : "No recent items.")}</p>
          {query && <button onClick={() => setQuery("")} className="mt-3 underline underline-offset-4">{isZh ? "清除搜索" : "Clear search"}</button>}
        </div> : null}

      {kind !== "paper" && awaitingWechat.length > 0 && <div className="rounded-2xl bg-ts-surface-elevated/50 p-5 text-xs leading-6 text-ts-muted">
        <p className="font-medium text-ts-ink">{isZh ? "公众号待接入" : "WeChat sources pending"}</p>
        <p className="mt-1">{isZh ? "以下公众号接入后，将在这里展示最新文章。" : "Latest articles will appear here once these sources are connected."}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {awaitingWechat.map((source) => <span key={source.id} className="rounded-md bg-ts-surface px-2.5 py-1">{source.name}</span>)}
        </div>
      </div>}

      <p className="pt-4 text-center text-[11px] leading-5 text-ts-muted">
        {isZh ? "论文来源：" : "Papers via "}<a href="https://europepmc.org" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-ts-ink">Europe PMC</a>
        {isZh ? " · 最近 90 天 · 定期检查更新，标题链接前往原文。" : " · Last 90 days · Updates checked regularly; titles link to originals."}
      </p>
    </section>
  );
}
