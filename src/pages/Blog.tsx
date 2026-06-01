import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { 
  Plus, 
  BookOpen, 
  PenTool, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Eye, 
  Check, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  Loader2, 
  Sparkles,
  Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useFloatingOrbs } from '../hooks/useFloatingOrbs';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { marked } from 'marked';

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

interface ParsedMarkdown {
  title: string;
  summary: string;
  tags: string[];
  content: string;
}

const parseMarkdownFile = (fileName: string, rawText: string): ParsedMarkdown => {
  let title = '';
  let summary = '';
  let tags: string[] = [];
  let content = rawText;

  // 1. Try to parse front matter (YAML format, bounded by ---)
  const frontMatterMatch = rawText.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  
  if (frontMatterMatch) {
    const yamlContent = frontMatterMatch[1];
    content = frontMatterMatch[2];

    const lines = yamlContent.split('\n');
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim().toLowerCase();
        let value = line.slice(colonIndex + 1).trim();
        
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        if (key === 'title') {
          title = value;
        } else if (key === 'summary' || key === 'description') {
          summary = value;
        } else if (key === 'tags' || key === 'keywords') {
          if (value.startsWith('[') && value.endsWith(']')) {
            try {
              const cleanedValue = value.replace(/'/g, '"');
              const parsed = JSON.parse(cleanedValue);
              if (Array.isArray(parsed)) {
                tags = parsed.map(t => String(t).trim());
              }
            } catch (_) {
              tags = value.slice(1, -1).split(',').map(t => t.trim());
            }
          } else {
            tags = value.split(',').map(t => t.trim());
          }
        }
      }
    });
  }

  // 2. Fallbacks for missing fields
  if (!title) {
    const h1Match = content.match(/^(?:#\s+)(.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
      content = content.replace(/^(?:#\s+)(.+)$/m, '').trim();
    } else {
      title = fileName.replace(/\.[^/.]+$/, "");
    }
  }

  if (!summary) {
    const plainText = content
      .replace(/[#*`_\[\]()\-+]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    summary = plainText.slice(0, 120);
    if (plainText.length > 120) {
      summary += '...';
    }
  }

  tags = tags.filter(Boolean);

  return { title, summary, tags, content };
};

export const isAdmin = (user: any) => {
  if (!user) return false;
  if (user.isMock) {
    return user.role === 'Developer';
  }
  return user.email === 'wangzouszz@gmail.com';
};

export const Blog = () => {
  const { user } = useAuth();
  const { language } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);

  useFloatingOrbs(containerRef);
  useScrollReveal(containerRef);

  // States
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Editor inputs
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // File import refs & handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importSourceRef = useRef<'list' | 'editor'>('list');

  const handleImportClick = (source: 'list' | 'editor') => {
    importSourceRef.current = source;
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (typeof text !== 'string') return;

      const parsed = parseMarkdownFile(file.name, text);
      
      setTitle(parsed.title);
      setSummary(parsed.summary);
      setTags(parsed.tags.join(', '));
      setContent(parsed.content);

      if (importSourceRef.current === 'list') {
        setView('create');
      }
    };
    reader.readAsText(file);
  };

  // Fetch blogs from Firestore
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let fetched: BlogPost[] = [];
      
      // 1. Try to fetch from Firebase
      try {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        fetched = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            summary: data.summary || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            content: data.content || '',
            userId: data.userId || '',
            userName: data.userName || 'Anonymous',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          } as BlogPost;
        });
      } catch (firestoreError) {
        console.warn('Firestore fetch failed, relying on local fallback:', firestoreError);
      }

      // 2. Fetch from Local Storage
      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      let localBlogs: BlogPost[] = [];
      if (localBlogsRaw) {
        try {
          localBlogs = JSON.parse(localBlogsRaw);
        } catch (_) {}
      }

      // 3. Combine both and filter duplicates
      const combined = [...localBlogs, ...fetched.filter(fbPost => !localBlogs.some(lp => lp.id === fbPost.id))];
      
      // Sort combined by createdAt desc
      combined.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });

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

  // Handle Publish / Create
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const postData = {
      title: title.trim(),
      summary: summary.trim() || (content.slice(0, 120) + '...'),
      tags: parsedTags,
      content: content,
      userId: user.uid,
      userName: user.displayName || user.email || 'Author',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (user.isMock) {
      // Offline mock storage
      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      const localBlogs = localBlogsRaw ? JSON.parse(localBlogsRaw) : [];
      const newPost = {
        ...postData,
        id: `local_${Date.now()}`
      };
      localBlogs.unshift(newPost);
      localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
      
      setTitle('');
      setSummary('');
      setTags('');
      setContent('');
      setView('list');
      await fetchPosts();
      setSaving(false);
      return;
    }

    try {
      const firestorePostData = {
        ...postData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await addDoc(collection(db, 'blogs'), firestorePostData);
      
      setTitle('');
      setSummary('');
      setTags('');
      setContent('');
      setView('list');
      await fetchPosts();
    } catch (error) {
      console.error('Firestore save failed, saving to localStorage:', error);
      // Fallback
      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      const localBlogs = localBlogsRaw ? JSON.parse(localBlogsRaw) : [];
      const newPost = {
        ...postData,
        id: `local_${Date.now()}`
      };
      localBlogs.unshift(newPost);
      localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
      
      setTitle('');
      setSummary('');
      setTags('');
      setContent('');
      setView('list');
      await fetchPosts();
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Mode
  const handleOpenEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setTitle(post.title);
    setSummary(post.summary);
    setTags(post.tags.join(', '));
    setContent(post.content);
    setView('edit');
  };

  // Handle Save Update
  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPost) return;
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const isLocal = selectedPost.id.startsWith('local_') || user.isMock;

    if (isLocal) {
      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      if (localBlogsRaw) {
        try {
          let localBlogs = JSON.parse(localBlogsRaw);
          localBlogs = localBlogs.map((p: any) => p.id === selectedPost.id ? {
            ...p,
            title: title.trim(),
            summary: summary.trim() || (content.slice(0, 120) + '...'),
            tags: parsedTags,
            content: content,
            updatedAt: new Date().toISOString()
          } : p);
          localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
        } catch (_) {}
      }
      setView('list');
      setSelectedPost(null);
      await fetchPosts();
      setSaving(false);
      return;
    }

    try {
      const postRef = doc(db, 'blogs', selectedPost.id);
      await updateDoc(postRef, {
        title: title.trim(),
        summary: summary.trim() || (content.slice(0, 120) + '...'),
        tags: parsedTags,
        content: content,
        updatedAt: Timestamp.now()
      });

      setView('list');
      setSelectedPost(null);
      await fetchPosts();
    } catch (error) {
      console.error('Firestore update failed, falling back to local edit:', error);
      // Fallback: update in local storage if not found in Firestore or if auth failed
      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      if (localBlogsRaw) {
        try {
          let localBlogs = JSON.parse(localBlogsRaw);
          if (localBlogs.some((p: any) => p.id === selectedPost.id)) {
            localBlogs = localBlogs.map((p: any) => p.id === selectedPost.id ? {
              ...p,
              title: title.trim(),
              summary: summary.trim() || (content.slice(0, 120) + '...'),
              tags: parsedTags,
              content: content,
              updatedAt: new Date().toISOString()
            } : p);
            localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
          }
        } catch (_) {}
      }
      setView('list');
      setSelectedPost(null);
      await fetchPosts();
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(language === 'zh' ? '确定要删除这篇博客吗？' : 'Are you sure you want to delete this post?')) return;
    
    const isLocal = postId.startsWith('local_');
    if (isLocal) {
      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      if (localBlogsRaw) {
        try {
          let localBlogs = JSON.parse(localBlogsRaw);
          localBlogs = localBlogs.filter((p: any) => p.id !== postId);
          localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
        } catch (_) {}
      }
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
        setView('list');
      }
      await fetchPosts();
      return;
    }

    try {
      await deleteDoc(doc(db, 'blogs', postId));
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
        setView('list');
      }
      await fetchPosts();
    } catch (error) {
      console.error('Firestore delete failed, checking local fallback:', error);
      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      if (localBlogsRaw) {
        try {
          let localBlogs = JSON.parse(localBlogsRaw);
          localBlogs = localBlogs.filter((p: any) => p.id !== postId);
          localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
        } catch (_) {}
      }
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
        setView('list');
      }
      await fetchPosts();
    }
  };

  // Render compiled Markdown helper
  const renderMarkdown = (md: string) => {
    try {
      return { __html: marked.parse(md) };
    } catch (e) {
      return { __html: md.replace(/\n/g, '<br/>') };
    }
  };

  // Date formatting helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // UI Texts
  const t = {
    zh: {
      tag: '思考锚点',
      title: '博客',
      subtitle: '分享技术感悟、开发日常与奇思妙想。',
      newPost: '撰写博客',
      empty: '暂无博客文章。',
      back: '返回列表',
      edit: '编辑',
      delete: '删除',
      publishing: '发布中...',
      publish: '发布博客',
      updating: '更新中...',
      save: '保存修改',
      inputTitle: '文章标题',
      inputSummary: '内容简述',
      inputTags: '标签 (用逗号分隔)',
      inputContent: '正文 (支持 Markdown 语法)',
      preview: '实时预览',
      editTab: '编辑内容',
      author: '作者',
      pubTime: '发布时间',
      importMd: '导入 MD',
      importMdFile: '导入 MD 文件'
    },
    en: {
      tag: 'Anchors of Thought',
      title: 'Blog',
      subtitle: 'Sharing technical guides, development notes, and creative thoughts.',
      newPost: 'New Post',
      empty: 'No blog posts found.',
      back: 'Back to List',
      edit: 'Edit',
      delete: 'Delete',
      publishing: 'Publishing...',
      publish: 'Publish Post',
      updating: 'Updating...',
      save: 'Save Changes',
      inputTitle: 'Post Title',
      inputSummary: 'Summary/Description',
      inputTags: 'Tags (comma separated)',
      inputContent: 'Content (Markdown supported)',
      preview: 'Live Preview',
      editTab: 'Edit Content',
      author: 'Author',
      pubTime: 'Published',
      importMd: 'Import MD',
      importMdFile: 'Import MD File'
    }
  }[language];

  return (
    <div ref={containerRef} className="space-y-12 pb-24 immersive-section">
      
      {/* Immersive Header Section (Lists only, details handle internally) */}
      {view === 'list' && (
        <section className="relative pt-12 pb-8 overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-[1px] bg-ts-primary" />
                <span className="text-[12px] font-black text-ts-primary uppercase tracking-[0.3em]">
                  {t.tag}
                </span>
              </div>
              <h1 className="text-[64px] lg:text-[84px] font-display font-black leading-[0.9] tracking-tighter mb-6">
                <span className="text-ts-primary block">博客</span>
                <span className="text-ts-navy-800 dark:text-white drop-shadow-[0_0_15px_rgba(20,53,89,0.15)] block mt-2">
                  Sync Thoughts.
                </span>
              </h1>
              <p className="text-ts-neutral-400 dark:text-ts-neutral-300 text-[15px] font-medium max-w-md leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {isAdmin(user) && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleImportClick('list')}
                  className="flex items-center gap-2 px-5 py-3 rounded-[8px] border border-ts-hairline dark:border-ts-navy-700 bg-ts-surface-elevated text-ts-muted text-xs font-bold hover:text-ts-ink hover:bg-ts-surface-elevated/80 transition-all shadow-sm cursor-pointer"
                >
                  <Upload size={16} />
                  {t.importMd}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setSummary('');
                    setTags('');
                    setContent('');
                    setView('create');
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-[8px] bg-ts-primary text-white text-xs font-bold hover:bg-ts-primary-hover transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  {t.newPost}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* VIEW: Blog List */}
      {view === 'list' && (
        <div className="relative pt-4">
          {loading ? (
            <div className="flex items-center justify-center p-24">
              <Loader2 size={32} className="animate-spin text-ts-primary" />
            </div>
          ) : posts.length > 0 ? (
            <div className="relative w-full max-w-5xl mx-auto py-8">
              {/* Mobile-only straight vertical timeline line on the left */}
              <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-ts-hairline dark:bg-ts-navy-800 md:hidden block" />

              {posts.map((post, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div 
                    key={post.id}
                    className={cn(
                      "relative flex flex-col md:flex-row items-stretch w-full mb-12 last:mb-0 group/row",
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    )}
                  >
                    {/* 1. Blog Card Side */}
                    <div className="w-full md:w-[calc(50%-60px)] flex flex-col justify-center items-stretch md:pl-0 pl-12">
                      <div className="card p-8 flex flex-col gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-ts-surface dark:bg-ts-surface border border-ts-hairline dark:border-ts-navy-800">
                        {/* Hover subtle glow highlight background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-ts-primary/0 via-ts-primary/0 to-ts-primary/0 group-hover/row:to-ts-primary/[0.03] dark:group-hover/row:to-ts-primary/[0.05] transition-all duration-500 pointer-events-none" />

                        <div className="space-y-3 flex-1 relative z-10">
                          <div className="flex items-center justify-between text-[10px] text-ts-muted dark:text-ts-neutral-400 font-bold uppercase tracking-wider font-mono">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-ts-primary" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserIcon size={12} className="text-ts-primary" />
                              <span>{post.userName}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => { setSelectedPost(post); setView('detail'); }}
                            className="text-left block group/title text-xl font-display font-black text-ts-ink dark:text-white leading-snug hover:text-ts-primary transition-colors cursor-pointer"
                          >
                            {post.title}
                          </button>
                          
                          <p className="text-ts-body dark:text-ts-neutral-300 text-sm leading-relaxed line-clamp-3">
                            {post.summary}
                          </p>
                        </div>

                        {/* Tags & Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-ts-hairline dark:border-ts-navy-700 relative z-10">
                          <div className="flex flex-wrap gap-1.5">
                            {post.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-medium bg-ts-surface-elevated text-ts-muted border border-ts-hairline flex items-center gap-1"
                              >
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>

                          {isAdmin(user) && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(post)}
                                className="p-2 text-ts-muted-soft hover:text-ts-navy-800 dark:hover:text-white hover:bg-ts-surface-elevated rounded-[6px] transition-all cursor-pointer"
                                title={t.edit}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-2 text-ts-muted-soft hover:text-ts-error hover:bg-ts-error-bg rounded-[6px] transition-all cursor-pointer"
                                title={t.delete}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 2. Center Timeline Track */}
                    <div className="relative w-full md:w-[120px] shrink-0 flex md:flex-col items-center justify-center py-4 md:py-0">
                      {/* Mobile-only timeline dot indicator */}
                      <div className="absolute left-[19px] w-3 h-3 rounded-full border-2 border-ts-canvas dark:border-ts-neutral-900 bg-ts-primary shadow-md md:hidden block z-10" />

                      {/* Desktop winding track Segment */}
                      <div className="absolute inset-0 md:flex hidden items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 120 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id={`grad-${post.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#143559" stopOpacity="0.3" className="group-hover/row:stop-color-ts-navy group-hover/row:stop-opacity-80 transition-all duration-500" />
                              <stop offset="50%" stopColor="#B1555A" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#143559" stopOpacity="0.3" className="group-hover/row:stop-color-ts-navy group-hover/row:stop-opacity-80 transition-all duration-500" />
                            </linearGradient>
                            <filter id={`glow-${post.id}`} x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>

                          {/* Sinuous Bezier S-Curve */}
                          <path 
                            d={isEven ? "M 60,0 C 15,25 15,75 60,100" : "M 60,0 C 105,25 105,75 60,100"} 
                            fill="none" 
                            stroke={`url(#grad-${post.id})`}
                            strokeWidth="3" 
                            className="stroke-ts-muted/20 group-hover/row:stroke-ts-primary transition-all duration-500"
                            style={{
                              filter: 'drop-shadow(0 0 1px rgba(177, 85, 90, 0.1))'
                            }}
                          />

                          {/* Pulsing glow under the node circle */}
                          <circle 
                            cx={isEven ? "26.25" : "93.75"} 
                            cy="50" 
                            r="12" 
                            className="fill-ts-primary/20 stroke-none opacity-0 group-hover/row:opacity-100 group-hover/row:scale-125 [transform-origin:center] transition-all duration-500 animate-ping"
                            style={{
                              transformOrigin: isEven ? '26.25px 50px' : '93.75px 50px'
                            }}
                          />
                          
                          {/* Node outer outline */}
                          <circle 
                            cx={isEven ? "26.25" : "93.75"} 
                            cy="50" 
                            r="7" 
                            className="fill-ts-canvas dark:fill-ts-neutral-900 stroke-ts-primary stroke-2 shadow-lg transition-all duration-300"
                          />

                          {/* Node inner core */}
                          <circle 
                            cx={isEven ? "26.25" : "93.75"} 
                            cy="50" 
                            r="3" 
                            className="fill-ts-primary group-hover/row:fill-ts-primary-hover group-hover/row:r-4 transition-all duration-300"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* 3. Opposite Column (Metadata card: Date & tags on desktop) */}
                    <div className="hidden md:flex w-full md:w-[calc(50%-60px)] flex-col justify-center items-start text-left md:px-8 px-12">
                      <div className="opacity-40 group-hover/row:opacity-100 transition-opacity duration-300 space-y-2.5 pl-6 border-l-2 border-ts-hairline dark:border-ts-navy-800 group-hover/row:border-ts-primary py-2">
                        <span className="text-[12px] font-black text-ts-navy-800 dark:text-ts-neutral-300 block uppercase tracking-[0.2em]">
                          {formatDate(post.createdAt)}
                        </span>
                        <span className="text-[10px] font-medium text-ts-muted-soft dark:text-ts-neutral-400 block font-mono">
                          由 {post.userName} 发布
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[9px] font-semibold text-ts-muted dark:text-ts-neutral-400 bg-ts-surface-elevated px-2 py-0.5 rounded border border-ts-hairline dark:border-ts-navy-800">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center card border-dashed border-ts-hairline bg-ts-surface-elevated/40">
              <BookOpen size={48} className="text-ts-muted mb-4" />
              <p className="text-sm font-bold text-ts-ink dark:text-white uppercase tracking-wider">{t.empty}</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Blog Detail */}
      {view === 'detail' && selectedPost && (
        <div className="space-y-8 max-w-3xl mx-auto pt-6">
          {/* Back button & controls */}
          <div className="flex justify-between items-center pb-4 border-b border-ts-hairline dark:border-ts-navy-700">
            <button
              onClick={() => { setView('list'); setSelectedPost(null); }}
              className="inline-flex items-center gap-2 text-xs font-bold text-ts-muted hover:text-ts-ink transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              {t.back}
            </button>

            {isAdmin(user) && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenEdit(selectedPost)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-ts-hairline text-xs font-bold text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated transition-all cursor-pointer"
                >
                  <Edit3 size={12} />
                  {t.edit}
                </button>
                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-ts-error/20 bg-ts-error-bg text-xs font-bold text-ts-error hover:bg-ts-error/15 transition-all cursor-pointer"
                >
                  <Trash2 size={12} />
                  {t.delete}
                </button>
              </div>
            )}
          </div>

          {/* Article Header */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-display font-black text-ts-ink dark:text-white leading-tight tracking-tight">
              {selectedPost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ts-muted font-medium pt-2 border-b border-ts-hairline/50 pb-6">
              <span className="flex items-center gap-1">
                <UserIcon size={14} className="text-ts-primary" />
                <strong>{t.author}:</strong> {selectedPost.userName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-ts-hairline" />
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-ts-primary" />
                <strong>{t.pubTime}:</strong> {formatDate(selectedPost.createdAt)}
              </span>
            </div>
          </div>

          {/* Article Content Renders HTML compilation from Markdown */}
          <div 
            className="blog-content prose dark:prose-invert max-w-none text-sm leading-relaxed text-ts-body dark:text-ts-neutral-300 space-y-4
              [&>h1]:text-2xl [&>h1]:font-black [&>h1]:text-ts-ink [&>h1]:dark:text-white [&>h1]:mt-8 [&>h1]:mb-4
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-ts-ink [&>h2]:dark:text-white [&>h2]:mt-6 [&>h2]:mb-3
              [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-ts-ink [&>h3]:dark:text-white [&>h3]:mt-4 [&>h3]:mb-2
              [&>p]:mb-4 [&>p]:leading-relaxed
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:space-y-1.5
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol]:space-y-1.5
              [&>li]:text-ts-body [&>li]:dark:text-ts-neutral-300
              [&>blockquote]:border-l-4 [&>blockquote]:border-ts-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-ts-muted [&>blockquote]:dark:text-ts-neutral-400 [&>blockquote]:my-4
              [&>pre]:bg-ts-surface-elevated [&>pre]:dark:bg-ts-navy-800 [&>pre]:p-4 [&>pre]:rounded-[8px] [&>pre]:overflow-x-auto [&>pre]:border [&>pre]:border-ts-hairline [&>pre]:dark:border-ts-navy-700 [&>pre]:my-4 [&>pre]:font-mono [&>pre]:text-xs
              [&>code]:font-mono [&>code]:bg-ts-surface-elevated [&>code]:dark:bg-ts-navy-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-ts-primary [&>code]:text-xs [&>code]:font-bold"
            dangerouslySetInnerHTML={renderMarkdown(selectedPost.content)}
          />

          {/* Article tags footer */}
          <div className="flex flex-wrap gap-1.5 pt-8 border-t border-ts-hairline dark:border-ts-navy-700">
            {selectedPost.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 rounded-[4px] text-xs font-semibold bg-ts-surface-elevated text-ts-muted border border-ts-hairline flex items-center gap-1.5"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: Blog Create / Edit Editor View */}
      {(view === 'create' || view === 'edit') && (
        <div className="space-y-8 max-w-6xl mx-auto pt-6">
          {/* Header Bar */}
          <div className="flex justify-between items-center pb-4 border-b border-ts-hairline dark:border-ts-navy-700">
            <button
              onClick={() => { setView('list'); setSelectedPost(null); }}
              className="inline-flex items-center gap-2 text-xs font-bold text-ts-muted hover:text-ts-ink transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              {t.back}
            </button>
            <span className="text-xs font-mono font-black uppercase text-ts-primary flex items-center gap-1.5">
              <PenTool size={14} />
              {view === 'create' ? t.publish : t.save}
            </span>
          </div>

          <form onSubmit={view === 'create' ? handleCreatePost : handleUpdatePost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form Input fields */}
              <div className="md:col-span-1 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-ts-muted uppercase tracking-wider">{t.inputTitle}</label>
                    <button
                      type="button"
                      onClick={() => handleImportClick('editor')}
                      className="text-[10px] text-ts-primary hover:text-ts-primary-hover font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                    >
                      <Upload size={10} />
                      {t.importMdFile}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-ts-surface text-ts-ink border border-ts-hairline pl-4 pr-4 h-11 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all"
                    placeholder="Enter blog title..."
                  />
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ts-muted uppercase tracking-wider">{t.inputSummary}</label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full bg-ts-surface text-ts-ink border border-ts-hairline p-4 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all resize-none"
                    placeholder="Optional brief description..."
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ts-muted uppercase tracking-wider">{t.inputTags}</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-ts-surface text-ts-ink border border-ts-hairline pl-4 pr-4 h-11 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all"
                    placeholder="e.g. React, Code, AI"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 h-11 bg-ts-primary text-white rounded-[6px] text-xs font-bold hover:bg-ts-primary-hover transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {view === 'create' ? t.publishing : t.updating}
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        {view === 'create' ? t.publish : t.save}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editor Workspace (Markdown Content textarea & Preview pane) */}
              <div className="md:col-span-2 flex flex-col md:flex-row gap-4 h-[550px]">
                {/* Editor Textarea */}
                <div className="flex-1 flex flex-col border border-ts-hairline dark:border-ts-navy-700 bg-ts-surface dark:bg-ts-navy-900 rounded-[12px] overflow-hidden">
                  <div className="bg-ts-surface-elevated dark:bg-ts-navy-800/50 px-4 py-2 border-b border-ts-hairline dark:border-ts-navy-700 text-[10px] font-bold text-ts-muted uppercase tracking-wider font-mono">
                    {t.editTab}
                  </div>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 w-full p-4 text-xs font-mono bg-transparent text-ts-ink dark:text-ts-neutral-200 resize-none outline-none leading-relaxed border-none focus:ring-0"
                    placeholder="# Hello World&#10;&#10;Write your post using Markdown formatting..."
                  />
                </div>

                {/* Markdown Preview */}
                <div className="flex-1 flex flex-col border border-ts-hairline dark:border-ts-navy-700 bg-ts-surface dark:bg-ts-navy-900 rounded-[12px] overflow-hidden">
                  <div className="bg-ts-surface-elevated dark:bg-ts-navy-800/50 px-4 py-2 border-b border-ts-hairline dark:border-ts-navy-700 text-[10px] font-bold text-ts-muted uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Eye size={12} />
                    {t.preview}
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto bg-ts-canvas/40 dark:bg-ts-navy-950/25">
                    <div 
                      className="blog-content prose dark:prose-invert max-w-none text-xs text-left leading-relaxed text-ts-body dark:text-ts-neutral-300 space-y-4
                        [&>h1]:text-lg [&>h1]:font-black [&>h1]:text-ts-ink [&>h1]:dark:text-white [&>h1]:mt-4 [&>h1]:mb-2 [&>h1]:pb-1 [&>h1]:border-b [&>h1]:border-ts-hairline
                        [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-ts-ink [&>h2]:dark:text-white [&>h2]:mt-3 [&>h2]:mb-2
                        [&>p]:mb-3
                        [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-3 [&>ul]:space-y-1
                        [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-3 [&>ol]:space-y-1
                        [&>blockquote]:border-l-4 [&>blockquote]:border-ts-primary [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-ts-muted [&>blockquote]:my-3
                        [&>pre]:bg-ts-surface-elevated [&>pre]:dark:bg-ts-navy-800 [&>pre]:p-3 [&>pre]:rounded-[6px] [&>pre]:overflow-x-auto [&>pre]:my-3 [&>pre]:font-mono [&>pre]:text-[10px]
                        [&>code]:font-mono [&>code]:bg-ts-surface-elevated [&>code]:dark:bg-ts-navy-800 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-ts-primary"
                      dangerouslySetInnerHTML={renderMarkdown(content)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md"
        className="hidden"
      />
    </div>
  );
};
