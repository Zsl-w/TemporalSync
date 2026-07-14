import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Search, X } from 'lucide-react';
import { marked } from 'marked';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { BlogPost, usePosts } from '../hooks/usePosts';

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
  const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch?.[1]) return markdownMatch[1];
  const htmlMatch = content.match(/<img\s+[^>]*src=["']([^"']+)["']/);
  return htmlMatch?.[1] ?? null;
};

const CoverPlaceholder = () => (
  <div className="absolute inset-0 flex select-none flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-ts-canvas to-ts-surface-elevated p-6">
    <div className="absolute inset-0 bg-[radial-gradient(rgba(120,119,198,0.08)_1px,transparent_1px)] [background-size:20px_20px]" />
    <div className="absolute h-28 w-28 rounded-full bg-ts-primary/15 blur-2xl" />
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div className="rounded-2xl bg-ts-surface/60 p-3.5 shadow-sm backdrop-blur-md transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none">
        <img src="/logo-mark.png" alt="" className="h-11 w-11 object-contain" />
      </div>
      <span className="font-display text-[10px] font-black uppercase tracking-[0.25em] text-ts-ink/35">TemporalSync</span>
    </div>
  </div>
);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
};

const formatMetaDate = (dateStr: string, isZh: boolean) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  if (isZh) return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const renderMarkdown = (markdown: string) => {
  if (!markdown) return { __html: '' };
  try {
    const withoutCover = markdown
      .replace(/!\[.*?\]\((.*?)\)/, '')
      .replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/, '');
    return { __html: DOMPurify.sanitize(marked.parse(withoutCover) as string) };
  } catch {
    return { __html: DOMPurify.sanitize(markdown) };
  }
};

export const Blog = () => {
  const { language } = useSettings();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const isZh = language === 'zh';
  const { posts, loading } = usePosts();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!id) {
      setSelectedPost(null);
      return;
    }
    const post = posts.find((item) => item.id === id);
    if (post) setSelectedPost(post);
    else navigate('/blog', { replace: true });
  }, [id, loading, navigate, posts]);

  useEffect(() => {
    if (selectedPost) document.title = `${selectedPost.title} · TemporalSync`;
  }, [selectedPost]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query) ||
        getPlainText(post.content).toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [posts, searchQuery]);

  const copy = isZh
    ? {
        eyebrow: 'NOTES & FIELDWORK',
        title: '想法流',
        subtitle: '记录 AI、设计、独立开发与个人工作流中的判断和实践。',
        searchPlaceholder: '搜索标题、内容或标签',
        posts: '篇文章',
        featured: '最新文章',
        readArticle: '阅读全文',
        back: '返回文章列表',
        empty: '暂无博客内容',
        noResults: `没有找到与“${searchQuery.trim()}”相关的文章`,
        clear: '清除搜索',
      }
    : {
        eyebrow: 'NOTES & FIELDWORK',
        title: 'BLOG',
        subtitle: 'Working notes on AI, design, independent development, and personal systems.',
        searchPlaceholder: 'Search titles, content, or tags',
        posts: 'posts',
        featured: 'Latest story',
        readArticle: 'Read article',
        back: 'Back to all posts',
        empty: 'No posts available',
        noResults: `No posts found for “${searchQuery.trim()}”`,
        clear: 'Clear search',
      };

  if (loading && posts.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center p-12 text-ts-ink/55">
        <Loader2 size={32} className="animate-spin" aria-hidden="true" />
        <span className="mt-4 font-barlow text-[10px] font-bold uppercase tracking-[0.4em]">Loading</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-ts-canvas pb-24">
      <div className="immersive-section text-left">
        {!id ? (
          <>
            <header className="border-b border-ts-ink/10 py-14 sm:py-20">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
                <div className="max-w-3xl">
                  <p className="font-barlow text-xs font-bold tracking-[0.24em] text-ts-primary">{copy.eyebrow}</p>
                  <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.04em] text-ts-ink sm:text-6xl lg:text-7xl">{copy.title}</h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-ts-ink/65 sm:text-lg">{copy.subtitle}</p>
                  <p className="mt-5 font-barlow text-xs font-bold uppercase tracking-[0.14em] text-ts-ink/45">
                    {posts.length} {copy.posts}
                  </p>
                </div>
                {posts.length > 0 && (
                  <div>
                    <label htmlFor="blog-search" className="sr-only">{copy.searchPlaceholder}</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ts-ink/45" size={17} aria-hidden="true" />
                      <input
                        id="blog-search"
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="h-12 w-full rounded-full border border-ts-ink/10 bg-ts-surface-elevated pl-11 pr-12 text-sm text-ts-ink shadow-sm outline-none transition focus:border-ts-primary/60 focus:ring-2 focus:ring-ts-primary/20"
                        placeholder={copy.searchPlaceholder}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ts-ink/45 transition hover:bg-ts-ink/5 hover:text-ts-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
                          aria-label={copy.clear}
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className="mt-2 pl-4 font-barlow text-xs font-bold tracking-wider text-ts-ink/45" aria-live="polite">
                        {filteredPosts.length} {copy.posts}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </header>

            {filteredPosts.length === 0 ? (
              <section className="my-16 flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-ts-ink/10 bg-ts-surface-elevated/60 px-6 text-center shadow-sm">
                <BookOpen size={42} className="mb-4 text-ts-ink/35" aria-hidden="true" />
                <p className="font-display text-lg font-bold text-ts-ink">{searchQuery ? copy.noResults : copy.empty}</p>
              </section>
            ) : (
              <section className="space-y-16 py-16 sm:py-24" aria-label={isZh ? '文章列表' : 'Post list'}>
                {(() => {
                  const featured = filteredPosts[0];
                  const coverUrl = getFirstImageUrl(featured.content);
                  return (
                    <motion.article
                      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                    >
                      <Link
                        to={`/blog/${featured.id}`}
                        className="group grid overflow-hidden rounded-[28px] border border-ts-ink/10 bg-ts-surface-elevated shadow-[0_24px_70px_rgba(15,23,42,0.09)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,23,42,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ts-canvas motion-reduce:transition-none lg:grid-cols-[1.18fr_0.82fr]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-ts-canvas lg:aspect-auto lg:min-h-[28rem]">
                          {coverUrl ? (
                            <img src={coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none" />
                          ) : (
                            <CoverPlaceholder />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </div>
                        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                          <p className="font-barlow text-xs font-bold uppercase tracking-[0.2em] text-ts-primary">{copy.featured}</p>
                          <div className="mt-5 font-barlow text-xs font-bold uppercase tracking-[0.12em] text-ts-ink/45">
                            {formatDate(featured.createdAt)} · {getReadTime(featured.content, isZh)}
                          </div>
                          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ts-ink sm:text-4xl">{featured.title}</h2>
                          <p className="mt-5 line-clamp-3 text-sm leading-7 text-ts-ink/65 sm:text-base">{featured.summary}</p>
                          <span className="mt-8 inline-flex min-h-11 items-center gap-2 self-start font-display text-xs font-bold uppercase tracking-[0.12em] text-ts-ink">
                            <span className="underline decoration-ts-ink/30 underline-offset-4">{copy.readArticle}</span>
                            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })()}

                {filteredPosts.length > 1 && (
                  <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2">
                    {filteredPosts.slice(1).map((post, index) => {
                      const coverUrl = getFirstImageUrl(post.content);
                      return (
                        <motion.article
                          key={post.id}
                          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.15 }}
                          transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
                        >
                          <Link
                            to={`/blog/${post.id}`}
                            className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary focus-visible:ring-offset-4 focus-visible:ring-offset-ts-canvas"
                          >
                            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-ts-ink/10 bg-ts-surface-elevated shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl motion-reduce:transition-none">
                              {coverUrl ? (
                                <img src={coverUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" />
                              ) : (
                                <CoverPlaceholder />
                              )}
                            </div>
                            <div className="mt-5 font-barlow text-xs font-bold uppercase tracking-[0.12em] text-ts-ink/45">
                              {formatDate(post.createdAt)} · {getReadTime(post.content, isZh)}
                              {post.tags[0] && <span className="text-ts-primary"> · {post.tags[0]}</span>}
                            </div>
                            <h2 className="mt-3 line-clamp-2 font-display text-2xl font-bold leading-tight tracking-tight text-ts-ink">{post.title}</h2>
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-ts-ink/62 sm:text-base">{post.summary}</p>
                            <span className="mt-5 inline-flex min-h-11 items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.12em] text-ts-ink">
                              <span className="underline decoration-ts-ink/30 underline-offset-4">{copy.readArticle}</span>
                              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                            </span>
                          </Link>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          <div className="mx-auto max-w-5xl pt-10 sm:pt-14">
            <Link
              to="/blog"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-display text-xs font-bold text-ts-ink/55 transition hover:text-ts-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {copy.back}
            </Link>

            {!selectedPost ? (
              <div className="flex min-h-72 items-center justify-center">
                <Loader2 size={32} className="animate-spin text-ts-ink/45" aria-hidden="true" />
              </div>
            ) : (
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="space-y-10 pb-12"
              >
                <header className="mx-auto max-w-4xl pt-8 text-center">
                  <p className="font-barlow text-[11px] font-bold uppercase tracking-[0.2em] text-ts-ink/45">
                    {selectedPost.tags.length > 0 && `${selectedPost.tags.map((tag) => tag.toUpperCase()).join(' · ')} · `}
                    {formatMetaDate(selectedPost.createdAt, isZh)}
                  </p>
                  <h1 className="mt-5 font-display text-3xl font-bold leading-[1.16] tracking-tight text-ts-ink sm:text-5xl lg:text-[3.5rem]">{selectedPost.title}</h1>
                  {selectedPost.summary && <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ts-ink/58">{selectedPost.summary}</p>}
                </header>

                {getFirstImageUrl(selectedPost.content) && (
                  <div className="overflow-hidden rounded-[24px] border border-ts-ink/10 bg-ts-surface-elevated shadow-sm">
                    <img src={getFirstImageUrl(selectedPost.content)!} alt="" className="max-h-[760px] w-full object-cover" />
                  </div>
                )}

                <div
                  className="blog-content prose mx-auto max-w-3xl text-[15px] leading-8 text-ts-ink/82 dark:prose-invert sm:text-base
                    [&>h1]:mb-4 [&>h1]:mt-10 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-ts-ink
                    [&>h2]:mb-4 [&>h2]:mt-10 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-ts-ink
                    [&>h3]:mb-3 [&>h3]:mt-8 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-ts-ink
                    [&>p]:mb-6 [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6
                    [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-6
                    [&>blockquote]:my-7 [&>blockquote]:border-l-4 [&>blockquote]:border-ts-primary/55 [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-ts-ink/60
                    [&>pre]:my-7 [&>pre]:overflow-x-auto [&>pre]:rounded-xl [&>pre]:bg-neutral-100 [&>pre]:p-5 [&>pre]:font-mono [&>pre]:text-xs [&>pre]:text-neutral-800 dark:[&>pre]:bg-[#1C1C24] dark:[&>pre]:text-[#E3E3E6]
                    [&>code]:rounded [&>code]:bg-neutral-100 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:font-mono [&>code]:text-[#c13838] dark:[&>code]:bg-[#1C1C24] dark:[&>code]:text-[#F9B6B6]"
                  dangerouslySetInnerHTML={renderMarkdown(selectedPost.content)}
                />
              </motion.article>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
