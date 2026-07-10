import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { getCollection } from '../lib/cloudbase';
import { 
  BookOpen, 
  ArrowLeft, 
  Tag, 
  Loader2, 
  Search, 
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { marked } from 'marked';
import { FluidCanvas } from '../components/FluidCanvas';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  content: string;
  userId: string;
  userName: string;
  createdAt: any;
  updatedAt: any;
}

const getPlainText = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/>+/g, '')
    .replace(/-\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getReadTime = (content: string, isZh: boolean) => {
  if (!content) return isZh ? '1 分钟阅读' : '1 min read';
  const words = content.trim().split(/\s+/).length;
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const minutes = Math.max(1, Math.ceil(words / 200 + chineseChars / 400));
  return isZh ? `${minutes} 分钟阅读` : `${minutes} min read`;
};

const getFirstImageUrl = (content: string): string | null => {
  if (!content) return null;
  const mdImageRegex = /!\[.*?\]\((.*?)\)/;
  const match = content.match(mdImageRegex);
  if (match && match[1]) {
    return match[1];
  }
  const htmlImageRegex = /<img\s+[^>]*src=["']([^"']+)["']/;
  const htmlMatch = content.match(htmlImageRegex);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1];
  }
  return null;
};

// Apple inspired dynamic brand logo cover placeholder
const CoverPlaceholder = () => {
  return (
    <div className="w-full h-full absolute inset-0 select-none overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-ts-canvas to-ts-surface-elevated transition-colors duration-500">
      {/* Dynamic Background subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(120,119,198,0.05)_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
      
      {/* Accent glow behind logo */}
      <div className="absolute w-24 h-24 rounded-full bg-ts-primary/10 blur-xl pointer-events-none" />

      {/* Brand logo container */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="p-3.5 rounded-2xl bg-ts-surface/40 backdrop-blur-md shadow-sm transition-transform duration-500 group-hover:scale-[1.08]">
          <img 
            src="/logo-mark.png" 
            alt="TSync Logo" 
            className="h-10 w-10 md:h-12 md:w-12 object-contain"
          />
        </div>
        <span className="font-display font-black text-[10px] md:text-[11px] tracking-[0.25em] text-ts-ink/35 uppercase select-none text-center leading-none mt-1">
          TemporalSync
        </span>
      </div>
    </div>
  );
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
  } catch (_) {
    return dateStr;
  }
};

const formatMetaDate = (dateStr: string, isZh: boolean) => {
  try {
    const d = new Date(dateStr);
    if (isZh) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()].toUpperCase()} ${d.getDate()}, ${d.getFullYear()}`;
  } catch (_) {
    return dateStr;
  }
};

export const Blog = () => {
  const { language } = useSettings();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let fetched: BlogPost[] = [];
      try {
        const data = await getCollection('blogs');
        fetched = (data || []).map((doc: any) => ({
          id: doc._id || doc.id || '',
          title: doc.title || '',
          summary: doc.summary || '',
          tags: Array.isArray(doc.tags) ? doc.tags : [],
          content: doc.content || '',
          userId: doc.userId || '',
          userName: doc.userName || 'Anonymous',
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: doc.updatedAt || new Date().toISOString(),
        } as BlogPost));
      } catch (e) {
        console.warn('Cloudbase fetch failed, checking local', e);
      }

      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      let localBlogs: BlogPost[] = [];
      if (localBlogsRaw) {
        try {
          localBlogs = JSON.parse(localBlogsRaw);
        } catch (_) {}
      }

      const combined = [...localBlogs, ...fetched.filter(fb => !localBlogs.some(lp => lp.id === fb.id))];
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(combined);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (id) {
      const post = posts.find(p => p.id === id);
      if (post) {
        setSelectedPost(post);
      } else {
        navigate('/blog', { replace: true });
      }
    } else {
      setSelectedPost(null);
    }
  }, [id, posts, loading]);

  useEffect(() => {
    if (selectedPost) {
      document.title = `${selectedPost.title} · TemporalSync`;
    }
  }, [selectedPost]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase().trim();
    return posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.summary.toLowerCase().includes(query) ||
      getPlainText(post.content).toLowerCase().includes(query) ||
      post.tags.some(t => t.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  const renderMarkdown = (md: string) => {
    try {
      const html = marked.parse(md);
      return { __html: html };
    } catch (_) {
      return { __html: md };
    }
  };

  // Translations
  const t = {
    zh: {
      title: '想法流',
      subtitle: '技术、设计与日常效率工具的思考日志。',
      searchPlaceholder: '搜索文章...',
      empty: '暂无博客内容',
      readTime: '分钟阅读',
      back: '返回列表',
      readArticle: '阅读全文'
    },
    en: {
      title: 'BLOG',
      subtitle: 'Thoughts on tech, design, and personal workflows.',
      searchPlaceholder: 'Search posts...',
      empty: 'No posts available',
      readTime: 'min read',
      back: 'Back to List',
      readArticle: 'Read Article'
    }
  }[language];

  if (loading && posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-24 opacity-50 text-ts-ink">
        <Loader2 size={32} className="animate-spin text-[#1D1D1F]/50" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] mt-4">Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-ts-canvas">
      {!id && (
        <div className="w-full h-[220px] mt-[-4rem] relative overflow-hidden flex items-end pb-7 select-none z-10 shadow-inner bg-[#53216f]">
          {/* Fluid GPU Shader Canvas Engine */}
          <FluidCanvas />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px] opacity-40 mix-blend-overlay pointer-events-none" />
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex items-center relative z-10">
            <div className="flex items-center gap-5 bg-white/10 dark:bg-black/15 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-white/15 dark:hover:bg-black/20 hover:scale-[1.01] hover:-translate-y-0.5 group/capsule cursor-pointer max-w-xl">
              
              {/* Layered 3D Sticker Stack */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#FF9F66] to-[#FF416C] opacity-40 transform -rotate-12 translate-x-[-2px] translate-y-[2px] transition-transform duration-500 group-hover/capsule:-rotate-[18deg]" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#A84A8C] to-[#6A3783] opacity-60 transform rotate-6 translate-x-[2px] translate-y-[-1px] transition-transform duration-500 group-hover/capsule:rotate-[12deg]" />
                <div className="absolute inset-0 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-md transition-transform duration-500 group-hover/capsule:scale-105">
                  <BookOpen size={20} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
                </div>
              </div>

              {/* Text Slogan */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/55 tracking-[0.2em] uppercase leading-none block">
                  {language === 'zh' ? '主题专栏' : 'Theme Slogan'}
                </span>
                <span className="text-[14px] sm:text-[15px] font-display font-bold tracking-[0.06em] text-white uppercase leading-snug block drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                  {language === 'zh' ? '想法流 · 记录创造与技术日常' : 'LOGGING COGNITIVE FLUX & DIGITAL CRAFTS'}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "pb-24 immersive-section text-left",
        !id ? "pt-12 space-y-8" : "pt-6 space-y-8"
      )}>
        {!id ? (
          /* LIST VIEW */
          <div className="space-y-8">
            {/* Search Row */}
            {posts.length > 0 && (
              <div className="flex justify-end mb-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={16} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-ts-surface-elevated text-ts-ink border border-ts-hairline pl-11 pr-4 h-11 w-full rounded-lg text-sm focus:border-ts-primary outline-none transition-all placeholder:text-[#86868B]"
                    placeholder={t.searchPlaceholder}
                  />
                </div>
              </div>
            )}

          {/* Post Grid */}
          {filteredPosts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center border border-dashed border-ts-hairline rounded-2xl bg-ts-surface-elevated/40">
              <BookOpen size={48} className="text-[#86868B] mb-4" />
              <p className="text-sm font-bold text-ts-ink uppercase tracking-wider">{t.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
              {filteredPosts.map((post) => {
                const coverUrl = getFirstImageUrl(post.content);
                return (
                  <div
                    key={post.id}
                    className="group flex flex-col space-y-4 cursor-pointer"
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    {/* Cover image wrapper (elevated on hover with shadow transformations) */}
                    <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden relative bg-ts-surface-elevated shadow-md dark:shadow-black/25 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-black/10 dark:group-hover:shadow-black/50">
                      {coverUrl ? (
                        <img 
                          src={coverUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                          loading="lazy"
                        />
                      ) : (
                        <CoverPlaceholder />
                      )}
                    </div>

                    {/* Metadata (Barlow Condensed style) */}
                    <div className="text-[12px] font-barlow font-bold tracking-widest text-[#86868B] uppercase">
                      <span>{formatDate(post.createdAt)}</span>
                      <span className="mx-2 font-mono text-[9px] opacity-30">|</span>
                      <span>{getReadTime(post.content, language === 'zh')}</span>
                      {post.tags.length > 0 && (
                        <>
                          <span className="mx-2 font-mono text-[9px] opacity-30">|</span>
                          <span className="text-ts-primary">{post.tags[0]}</span>
                        </>
                      )}
                    </div>

                    {/* Content info */}
                    <div className="space-y-2">
                      <h3 className="text-xl md:text-2xl font-display font-bold text-ts-ink leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-ts-ink text-sm md:text-base line-clamp-2 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>

                    {/* Read Link */}
                    <div className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-ts-ink">
                      <span className="underline underline-offset-4 decoration-ts-ink/40">{t.readArticle}</span>
                      <ArrowRight size={12} className="transform transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* DETAIL VIEW */
        <div className="max-w-3xl mx-auto space-y-8 pt-6">
          {/* Back button */}
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-[#86868B] hover:text-ts-ink transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            {t.back}
          </button>

          {!selectedPost ? (
            <div className="flex items-center justify-center p-24">
              <Loader2 size={32} className="animate-spin text-[#86868B]" />
            </div>
          ) : (
            <article className="space-y-10">
              {/* Title & Metadata */}
              <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                <div className="text-[10px] sm:text-[11px] font-display font-bold tracking-[0.22em] text-[#86868B] uppercase text-center">
                  {selectedPost.tags.length > 0 ? (
                    `${selectedPost.tags.map(t => t.toUpperCase()).join(' · ')} · ${formatMetaDate(selectedPost.createdAt, language === 'zh')}`
                  ) : (
                    formatMetaDate(selectedPost.createdAt, language === 'zh')
                  )}
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-[46px] font-display font-bold tracking-tight text-ts-ink leading-[1.2] text-center uppercase max-w-2xl mx-auto">
                  {selectedPost.title}
                </h1>
              </div>

              {/* Cover Image if exists */}
              {getFirstImageUrl(selectedPost.content) && (
                <div className="w-full rounded-2xl overflow-hidden bg-[#1C1C24]/10 border border-ts-hairline shadow-sm">
                  <img 
                    src={getFirstImageUrl(selectedPost.content)!} 
                    alt={selectedPost.title}
                    className="w-full h-auto object-cover max-h-[640px] md:max-h-[800px]" 
                  />
                </div>
              )}

              {/* Main Content */}
              <div 
                className="blog-content prose dark:prose-invert max-w-none text-ts-ink/90 leading-relaxed text-sm md:text-base space-y-6
                  [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-ts-ink [&>h1]:mt-8 [&>h1]:mb-4 [&>h1]:border-b [&>h1]:border-ts-hairline [&>h1]:pb-2
                  [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-ts-ink [&>h2]:mt-6 [&>h2]:mb-3
                  [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-ts-ink [&>h3]:mt-4 [&>h3]:mb-2
                  [&>p]:mb-4
                  [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul]:space-y-1.5
                  [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>ol]:space-y-1.5
                  [&>blockquote]:border-l-4 [&>blockquote]:border-[#F9B9A6] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#86868B] [&>blockquote]:my-4
                  [&>pre]:bg-[#1C1C24] dark:[&>pre]:bg-[#1C1C24] [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-4 [&>pre]:font-mono [&>pre]:text-xs [&>pre]:border [&>pre]:border-ts-hairline
                  [&>code]:font-mono [&>code]:bg-[#1C1C24] dark:[&>code]:bg-[#1C1C24] [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-[#F9B6B6]"
                dangerouslySetInnerHTML={renderMarkdown(selectedPost.content)}
              />
            </article>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
