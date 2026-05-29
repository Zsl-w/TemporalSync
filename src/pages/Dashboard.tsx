import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, TrendingUp, Calendar, Clock, ArrowRight, Loader2, Globe, Smartphone, BookOpen, Layers, CheckCircle2, Share2, Info, Settings, LayoutDashboard } from 'lucide-react';
import { useFloatingOrbs } from '../hooks/useFloatingOrbs';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { useScrollRefresh } from '../hooks/useScrollRefresh';
import { cn } from '../lib/utils';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface NewsItem {
  title: string;
  source: string;
  link: string;
  time: string;
  category: string;
  summary: string;
}

const BRAND_COLORS = {
  primary: '#B1555A',
  navy: '#143559',
  success: '#2d7a4f',
  warning: '#c48800',
  muted: '#5B6F90'
};

export const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useFloatingOrbs(containerRef);
  useScrollReveal(containerRef);
  useCounterAnimation(containerRef);
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/ai-news');
        const data = await response.json();
        if (Array.isArray(data)) {
          setNews(data);
        } else {
          console.error('API response is not an array:', data);
          setNews([]);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  useScrollRefresh(newsLoading);

  const stats = useMemo(() => {
    return [
      { label: language === 'zh' ? '情报同步' : 'Intel Synced', value: 128, sub: language === 'zh' ? '全时追踪' : 'Real-time Tracking', icon: <Globe size={14} />, color: 'text-ts-navy-800', bg: 'bg-ts-neutral-50' },
      { label: language === 'zh' ? '追踪热点' : 'Hot Topics', value: 36, sub: language === 'zh' ? '今日聚合' : 'Today Aggregated', icon: <Zap size={14} />, color: 'text-ts-primary', bg: 'bg-ts-rose-100' },
      { label: language === 'zh' ? '健康状态' : 'System Health', value: 100, sub: language === 'zh' ? '神经元连接' : 'Synaptic Connection', icon: <CheckCircle2 size={14} />, color: 'text-ts-success', bg: 'bg-ts-neutral-50' },
      { label: language === 'zh' ? '认知频段' : 'Cognitive Sync', value: 300, sub: 'Hz Synchronized', icon: <Layers size={14} />, color: 'text-ts-muted', bg: 'bg-ts-surface-elevated' },
    ];
  }, [language]);

  const categoryData = useMemo(() => {
    return [
      { name: 'LLMs', value: 45 },
      { name: 'Agents', value: 25 },
      { name: 'Robotics', value: 15 },
      { name: 'Hardware', value: 15 }
    ];
  }, []);

  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    const counts = [12, 19, 32, 45, 68, 92, 128]; // Simulating cumulative growth curve

    return last7Days.map((date, i) => {
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count: counts[i]
      };
    });
  }, []);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return '刚刚';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    return `${Math.floor(diff / 86400)} 天前`;
  };

  const t = {
    zh: {
      welcome: '你好，',
      subtitle: '博观而约取，厚积而薄发。时间同步正在智能医学时代与您共同成长。',
      growthTrend: '认知进化曲线',
      growthTrendSub: '最近 7 个周期的情报同步积累',
      intelInsights: 'AI 情报洞察',
      intelInsightsSub: '实时情报流',
      domainSync: '领域同步',
      domainSyncSub: '领域板块',
      latestUpdates: '最新动态',
      quickAccess: '快速访问',
      nav: {
        about: '关于项目',
        hot: 'AI 热点',
        settings: '偏好设置'
      }
    },
    en: {
      welcome: 'Hello, ',
      subtitle: 'Documenting progress and growing together in the era of intelligent medicine.',
      growthTrend: 'Evolution Curve',
      growthTrendSub: 'Cumulative synced intelligence in the last 7 cycles',
      intelInsights: 'AI Intel Insights',
      intelInsightsSub: 'Real-time Intel Stream',
      domainSync: 'Domain Alignment',
      domainSyncSub: 'Domain Fields',
      latestUpdates: 'Latest Updates',
      quickAccess: 'Quick Access',
      nav: {
        about: 'About Project',
        hot: 'AI Hot Topics',
        settings: 'Settings'
      }
    }
  }[language];

  return (
    <div ref={containerRef} className="space-y-12 pb-24 immersive-section">
      {/* Immersive Welcome Hero */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-ts-primary" />
            <span className="text-[12px] font-black text-ts-primary uppercase tracking-[0.3em]">
              {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </span>
          </div>
          <h1 className="text-[64px] lg:text-[84px] font-display font-black text-ts-neutral-900 leading-[0.9] tracking-tighter mb-6">
            {t.welcome}<br />
            <span className="text-ts-navy-800 drop-shadow-[0_0_15px_rgba(0,47,167,0.1)]"> {user?.displayName || (language === 'zh' ? '访客' : 'Guest')}.</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <p className="text-ts-neutral-400 text-[15px] font-medium max-w-md leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Floating Background Element */}
        <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-ts-primary/5 rounded-full blur-[100px] floating-element" />
      </section>

      {/* Stats Pillars */}
      <div data-scroll-reveal data-scroll-reveal-stagger="0.1" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-8 group hover:-translate-y-2 transition-all cursor-default"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                {stat.icon}
              </div>
              <span className="text-[11px] font-black text-ts-neutral-300 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="relative">
              <div className="text-[48px] font-display font-black text-ts-neutral-900 leading-none" data-counter={stat.value}>0</div>
              <div className="flex items-center gap-2 mt-4">
                <span className={cn("text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg", stat.bg, stat.color)}>
                  {stat.sub}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div data-scroll-reveal className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          
          {/* Immersive Trend Chart */}
          <section className="glass-card p-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-[20px] font-display font-black text-ts-neutral-900">{t.growthTrend}</h2>
                <p className="text-[11px] font-bold text-ts-neutral-400 uppercase tracking-widest mt-1">{t.growthTrendSub}</p>
              </div>
              <div className="w-12 h-12 rounded-full border border-ts-hairline flex items-center justify-center text-ts-navy-800">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_COLORS.navy} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={BRAND_COLORS.navy} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0ddd8" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke={BRAND_COLORS.navy} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* AI Hot Topics Preview */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-display font-black text-ts-neutral-900 uppercase">{t.intelInsights}</h2>
                <p className="text-[11px] font-bold text-ts-neutral-400 uppercase tracking-widest mt-1">{t.intelInsightsSub}</p>
              </div>
              <RouterLink to="/hot" className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-ts-primary hover:bg-ts-primary hover:text-white transition-all">
                <ArrowRight size={20} />
              </RouterLink>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsLoading ? (
                <div className="col-span-full h-32 flex items-center justify-center glass-card border-dashed">
                  <Loader2 size={24} className="animate-spin text-ts-neutral-400" />
                </div>
              ) : (
                news.slice(0, 3).map((topic, i) => (
                  <motion.a 
                    whileHover={{ y: -8 }}
                    key={i} 
                    href={topic.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="glass-card p-6 flex flex-col gap-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none bg-ts-neutral-100 text-ts-neutral-500">
                        {i === 0 ? (language === 'zh' ? '趋势' : 'Trends') : `Node ${i + 1}`}
                      </span>
                      <Zap size={14} className={i === 0 ? "text-ts-primary" : "text-ts-neutral-200"} />
                    </div>
                    <h3 className="text-[14px] font-bold text-ts-neutral-900 group-hover:text-ts-primary transition-colors line-clamp-2 leading-snug flex-1">
                      {topic.title}
                    </h3>
                    <div className="flex items-center justify-between pt-4 border-t border-ts-neutral-50">
                      <span className="text-[10px] font-black text-ts-neutral-400 uppercase">{topic.source}</span>
                      <span className="text-[10px] font-bold text-ts-neutral-300 italic">{formatTime(topic.time)}</span>
                    </div>
                  </motion.a>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-12">
          
          {/* Category Distribution Chart */}
          <section className="glass-card p-8">
            <h2 className="text-[16px] font-display font-black text-ts-neutral-900 mb-8 uppercase tracking-widest flex items-center gap-2">
              <Layers size={20} className="text-ts-navy-800" />
              {t.domainSync}
            </h2>
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={[BRAND_COLORS.navy, BRAND_COLORS.primary, BRAND_COLORS.success, BRAND_COLORS.warning][index % 4]} 
                        className="hover:opacity-80 transition-opacity outline-none cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '11px', fontWeight: '900', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-[24px] font-display font-black text-ts-neutral-900 leading-none">{categoryData.length}</div>
                  <div className="text-[8px] font-black text-ts-neutral-400 uppercase tracking-widest mt-1">{t.domainSyncSub}</div>
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-ts-surface-elevated border border-ts-hairline">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [BRAND_COLORS.navy, BRAND_COLORS.primary, BRAND_COLORS.success, BRAND_COLORS.warning][index % 4] }} />
                    <span className="text-[11px] font-black text-ts-neutral-600 uppercase tracking-widest truncate">{entry.name}</span>
                  </div>
                  <span className="text-[12px] font-display font-black text-ts-neutral-900">{entry.value}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Latest news list as "Latest updates" */}
          <section className="space-y-6">
            <h2 className="text-[16px] font-display font-black text-ts-neutral-900 uppercase tracking-widest pl-2">{t.latestUpdates}</h2>
            <div className="glass-card overflow-hidden">
              <div className="divide-y divide-white/20">
                {newsLoading ? (
                  <div className="p-6 text-center">
                    <Loader2 size={16} className="animate-spin mx-auto text-ts-muted" />
                  </div>
                ) : (
                  news.slice(0, 5).map((item, i) => (
                    <motion.a 
                      whileHover={{ x: 5 }}
                      key={i} 
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-6 flex gap-4 hover:bg-ts-surface-elevated transition-all group cursor-pointer"
                    >
                      <div className="w-3 h-3 mt-1.5 rounded-full ring-4 ring-white/50 shrink-0 shadow-lg bg-ts-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-ts-neutral-800 line-clamp-1 group-hover:text-ts-navy-800 transition-colors leading-snug">{item.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[9px] font-black text-ts-neutral-400 uppercase tracking-[0.2em] bg-ts-surface-elevated px-2 py-0.5 rounded-md">{item.source}</p>
                          <p className="text-[10px] font-bold text-ts-neutral-300 italic">{formatTime(item.time)}</p>
                        </div>
                      </div>
                    </motion.a>
                  ))
                )}
              </div>
              <RouterLink to="/hot" className="group block w-full py-5 bg-white/10 text-ts-neutral-900 text-[11px] hover:bg-ts-neutral-900 hover:text-white font-black uppercase tracking-[0.3em] text-center border-t border-ts-hairline transition-all">
                {language === 'zh' ? '查看更多热点' : 'View More Hot Topics'} <ArrowRight size={14} className="inline ml-2 group-hover:translate-x-2 transition-transform" />
              </RouterLink>
            </div>
          </section>

          {/* Quick Access */}
          <section className="space-y-6">
            <h2 className="text-[16px] font-display font-black text-ts-neutral-900 uppercase tracking-widest pl-2">{t.quickAccess}</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t.nav.about, icon: <Info size={18} />, link: '/', color: 'hover:text-ts-navy-800' },
                { label: t.nav.hot, icon: <Zap size={18} />, link: '/hot', color: 'hover:text-ts-primary' },
                { label: t.nav.settings, icon: <Settings size={18} />, link: '/settings', color: 'hover:text-ts-neutral-900' },
              ].map((btn, i) => (
                <RouterLink 
                  key={i} 
                  to={btn.link}
                  className={cn(
                    "glass-card h-16 rounded-[8px] flex items-center justify-center gap-3 text-ts-neutral-400 transition-all hover:translate-y-[-4px] hover:shadow-xl",
                    btn.color
                  )}
                >
                   {btn.icon}
                   <span className="text-[11px] font-black uppercase tracking-widest">{btn.label}</span>
                </RouterLink>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
