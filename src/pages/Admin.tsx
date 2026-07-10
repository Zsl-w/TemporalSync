import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Loader2, 
  Upload, 
  Search, 
  LogOut, 
  Lock, 
  Eye, 
  Check,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument 
} from '../lib/supabase';
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

// Markdown Front Matter Parser
const parseMarkdownFile = (fileName: string, rawText: string) => {
  let title = '';
  let summary = '';
  let tags: string[] = [];
  let content = rawText;

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
    if (plainText.length > 120) summary += '...';
  }

  return { title, summary, tags: tags.filter(Boolean), content };
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
  } catch (_) {
    return dateStr;
  }
};

const getReadTime = (content: string, isZh: boolean) => {
  if (!content) return isZh ? '1 分钟' : '1 min';
  const words = content.trim().split(/\s+/).length;
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const minutes = Math.max(1, Math.ceil(words / 200 + chineseChars / 400));
  return isZh ? `${minutes} 分钟` : `${minutes} min`;
};

export const AdminPage = () => {
  const { language } = useSettings();
  const navigate = useNavigate();

  // Auth Status
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('ts-admin-logged-in') === 'true';
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Blog states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing workspace states
  const [activePostId, setActivePostId] = useState<string | null>(null); // null means "New Post"
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authenticate Admin
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'tsync2026') {
      setIsAuthenticated(true);
      localStorage.setItem('ts-admin-logged-in', 'true');
      setAuthError('');
    } else {
      setAuthError(language === 'zh' ? '密码错误，验证失败' : 'Invalid passcode');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ts-admin-logged-in');
  };

  // Fetch blogs
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
        console.warn('Cloudbase fetch failed', e);
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
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  // Select post to edit
  const handleSelectPost = (post: BlogPost) => {
    setActivePostId(post.id);
    setTitle(post.title);
    setSummary(post.summary);
    setTags(post.tags.join(', '));
    setContent(post.content);
  };

  // Switch to "New Post"
  const handleNewPost = () => {
    setActivePostId(null);
    setTitle('');
    setSummary('');
    setTags('');
    setContent('');
  };

  // MD File Import Handler
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    };
    reader.readAsText(file);
  };

  // Publish or Save Changes
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
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
      userId: 'admin',
      userName: 'Admin',
      updatedAt: new Date().toISOString()
    };

    try {
      if (activePostId) {
        // Update
        const isLocal = activePostId.startsWith('local_');
        if (isLocal) {
          const localBlogsRaw = localStorage.getItem('ts-local-blogs');
          if (localBlogsRaw) {
            let localBlogs = JSON.parse(localBlogsRaw);
            localBlogs = localBlogs.map((p: any) => p.id === activePostId ? {
              ...p,
              ...postData
            } : p);
            localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
          }
        } else {
          await updateDocument('blogs', activePostId, postData);
        }
      } else {
        // Create new
        const newPostData = {
          ...postData,
          createdAt: new Date().toISOString()
        };
        try {
          await addDocument('blogs', newPostData);
        } catch (dbErr) {
          console.warn('Database save failed, writing to localStorage fallback', dbErr);
          const localBlogsRaw = localStorage.getItem('ts-local-blogs');
          const localBlogs = localBlogsRaw ? JSON.parse(localBlogsRaw) : [];
          localBlogs.unshift({
            ...newPostData,
            id: `local_${Date.now()}`
          });
          localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
        }
      }

      handleNewPost();
      await fetchPosts();
    } catch (err) {
      console.error('Publishing failed:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string) => {
    if (!window.confirm(language === 'zh' ? '确定要删除这篇文章吗？此操作无法撤销。' : 'Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    try {
      const isLocal = id.startsWith('local_');
      if (isLocal) {
        const localBlogsRaw = localStorage.getItem('ts-local-blogs');
        if (localBlogsRaw) {
          let localBlogs = JSON.parse(localBlogsRaw);
          localBlogs = localBlogs.filter((p: any) => p.id !== id);
          localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
        }
      } else {
        await deleteDocument('blogs', id);
      }

      if (activePostId === id) {
        handleNewPost();
      }
      await fetchPosts();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().trim();
    return posts.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const renderMarkdown = (md: string) => {
    try {
      return { __html: marked.parse(md) };
    } catch (_) {
      return { __html: md };
    }
  };

  // === LOGIN UI ===
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-ts-canvas px-6 select-none">
        <form 
          onSubmit={handleLogin}
          className="w-full max-w-[380px] p-8 rounded-2xl border border-ts-hairline bg-ts-surface space-y-6 text-left shadow-2xl"
        >
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-ts-primary/10 flex items-center justify-center text-ts-primary mx-auto mb-4">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ts-ink font-display uppercase">
              {language === 'zh' ? '管理员后台' : 'Admin Console'}
            </h1>
            <p className="text-xs text-ts-body">
              {language === 'zh' ? '请输入验证密码以继续' : 'Enter passkey to write blogs'}
            </p>
          </div>

          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'zh' ? '密码' : 'Passkey'}
              className="w-full h-11 px-4 rounded-lg bg-ts-surface-elevated border border-ts-hairline text-sm text-ts-ink focus:border-ts-primary outline-none transition-all placeholder:text-ts-muted"
              autoFocus
            />
            {authError && (
              <p className="text-xs text-[#c66058] font-semibold pl-1 pt-1">
                {authError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-ts-ink text-ts-canvas font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 font-display uppercase tracking-wider"
          >
            <span>{language === 'zh' ? '解锁控制台' : 'Unlock Dashboard'}</span>
          </button>
        </form>
      </div>
    );
  }

  // === DASHBOARD UI ===
  return (
    <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto px-6 py-6 gap-6 h-[calc(100vh-5rem)] min-h-0 select-none text-left">
      
      {/* 1. LEFT SIDEBAR: Post List */}
      <div className="w-full md:w-80 flex flex-col border border-ts-hairline bg-ts-surface rounded-2xl overflow-hidden shadow-lg h-full min-h-0">
        {/* Header toolbar */}
        <div className="p-4 border-b border-ts-hairline flex items-center justify-between gap-3 bg-ts-surface-elevated/40">
          <button
            onClick={handleNewPost}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-ts-primary text-white text-xs font-bold font-display uppercase tracking-wider cursor-pointer hover:opacity-95"
          >
            <Plus size={14} />
            {language === 'zh' ? '新建博客' : 'New Post'}
          </button>
          
          <button
            onClick={fetchPosts}
            title={language === 'zh' ? '刷新列表' : 'Refresh'}
            className="p-2 hover:bg-ts-surface-elevated rounded-lg text-ts-muted hover:text-ts-ink transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          </button>

          <button
            onClick={handleLogout}
            title={language === 'zh' ? '退出登录' : 'Logout'}
            className="p-2 hover:bg-ts-surface-elevated rounded-lg text-[#c66058] hover:bg-[#c66058]/10 transition-all cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-ts-hairline relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ts-muted" size={14} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-ts-surface-elevated text-ts-ink border border-ts-hairline pl-9 pr-3 h-9 w-full rounded-lg text-xs outline-none focus:border-ts-primary placeholder:text-ts-muted"
            placeholder={language === 'zh' ? '搜索博客...' : 'Search...'}
          />
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
          {loading && posts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-50">
              <Loader2 className="animate-spin text-ts-muted" size={20} />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-xs text-ts-muted uppercase tracking-wider font-mono">
              {language === 'zh' ? '无博客内容' : 'Empty List'}
            </div>
          ) : (
            filteredPosts.map(p => {
              const isActive = p.id === activePostId;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPost(p)}
                  className={cn(
                    "p-3 rounded-lg border text-left cursor-pointer transition-all flex justify-between items-start gap-2 relative group",
                    isActive 
                      ? "bg-ts-surface-elevated border-ts-primary/40" 
                      : "bg-transparent border-ts-hairline/50 hover:bg-ts-surface-elevated/55 hover:border-ts-hairline"
                  )}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-ts-ink line-clamp-1 group-hover:text-ts-primary transition-colors leading-tight">
                      {p.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-ts-muted font-mono uppercase">
                      <span>{formatDate(p.createdAt)}</span>
                      {p.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-ts-primary truncate max-w-[80px]">{p.tags[0]}</span>
                        </>
                      )}
                      {p.id.startsWith('local_') && (
                        <span className="text-[#c66058] px-1 rounded bg-[#c66058]/10 text-[8px]">LOCAL</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(p.id);
                    }}
                    className="p-1 hover:bg-[#c66058]/10 rounded text-ts-muted hover:text-[#c66058] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title={language === 'zh' ? '删除文章' : 'Delete'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. MIDDLE PANEL: Markdown Editor */}
      <div className="flex-1 flex flex-col border border-ts-hairline bg-ts-surface rounded-2xl overflow-hidden shadow-lg h-full min-h-0">
        <form onSubmit={handleSavePost} className="flex-1 flex flex-col h-full min-h-0">
          
          {/* Form Header */}
          <div className="p-4 border-b border-ts-hairline flex justify-between items-center bg-ts-surface-elevated/40">
            <h2 className="text-xs font-bold text-ts-ink font-display uppercase tracking-wider flex items-center gap-2">
              <span>{activePostId ? (language === 'zh' ? '编辑文章' : 'Edit Mode') : (language === 'zh' ? '撰写新文章' : 'New Post Mode')}</span>
              {activePostId && <span className="text-[10px] font-mono text-ts-muted">ID: {activePostId.slice(0, 8)}</span>}
            </h2>

            <div className="flex items-center gap-2">
              {/* MD Import button */}
              <button
                type="button"
                onClick={handleImportClick}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-ts-hairline bg-ts-surface-elevated text-ts-muted hover:text-ts-ink text-xs font-bold transition-all cursor-pointer"
              >
                <Upload size={12} />
                <span>{language === 'zh' ? '导入 MD' : 'Import MD'}</span>
              </button>

              {/* Publish button */}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-ts-ink text-ts-canvas text-xs font-bold font-display uppercase tracking-wider cursor-pointer hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                <span>{activePostId ? (language === 'zh' ? '更新' : 'Save') : (language === 'zh' ? '发布' : 'Publish')}</span>
              </button>
            </div>
          </div>

          {/* Form Fields container */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider font-display">{language === 'zh' ? '文章标题' : 'Post Title'}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title..."
                className="w-full h-10 px-3.5 rounded-lg bg-ts-surface-elevated border border-ts-hairline text-xs font-semibold text-ts-ink focus:border-ts-primary outline-none transition-all placeholder:text-ts-muted"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tags */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider font-display">{language === 'zh' ? '标签 (逗号隔开)' : 'Tags (comma separated)'}</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Apple, Wallpapers, Guide"
                  className="w-full h-10 px-3.5 rounded-lg bg-ts-surface-elevated border border-ts-hairline text-xs font-semibold text-ts-ink focus:border-ts-primary outline-none transition-all placeholder:text-ts-muted"
                />
              </div>

              {/* Summary */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider font-display">{language === 'zh' ? '博客摘要 (一行)' : 'Summary Description'}</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summary..."
                  className="w-full h-10 px-3.5 rounded-lg bg-ts-surface-elevated border border-ts-hairline text-xs font-semibold text-ts-ink focus:border-ts-primary outline-none transition-all placeholder:text-ts-muted"
                />
              </div>
            </div>

            {/* Markdown Textarea */}
            <div className="space-y-1.5 flex-1 flex flex-col h-[320px] sm:h-[calc(100vh-25rem)] min-h-0">
              <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider font-display">{language === 'zh' ? '正文内容 (支持 Markdown)' : 'Content (Markdown)'}</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Header 1\nType your content here..."
                className="flex-1 w-full p-4 rounded-lg bg-ts-surface-elevated border border-ts-hairline text-xs font-mono text-ts-ink focus:border-ts-primary outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </form>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".md"
          className="hidden"
        />
      </div>

      {/* 3. RIGHT PANEL: Live Preview */}
      <div className="flex-1 hidden lg:flex flex-col border border-ts-hairline bg-ts-surface rounded-2xl overflow-hidden shadow-lg h-full min-h-0">
        {/* Preview Header */}
        <div className="p-4 border-b border-ts-hairline flex items-center justify-between bg-ts-surface-elevated/40 h-14">
          <h2 className="text-xs font-bold text-ts-muted font-display uppercase tracking-wider flex items-center gap-1.5">
            <Eye size={12} />
            <span>{language === 'zh' ? '实时效果预览' : 'Live Preview'}</span>
          </h2>
          <span className="text-[9px] font-mono text-ts-muted uppercase bg-ts-surface-elevated px-2 py-0.5 rounded">
            {getReadTime(content, language === 'zh')} {language === 'zh' ? '阅读' : 'read'}
          </span>
        </div>

        {/* Preview Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-ts-canvas select-text">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Title Render */}
            <div className="space-y-3 pb-5 border-b border-ts-hairline">
              <h1 className="text-2xl font-bold tracking-tight text-ts-ink">
                {title || (language === 'zh' ? '文章标题预览' : 'Post Title Preview')}
              </h1>
              {tags.trim() && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-ts-surface-elevated text-ts-primary border border-ts-hairline"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Markdown rendered body */}
            <div 
              className="blog-content prose dark:prose-invert max-w-none text-ts-ink/90 leading-relaxed text-xs space-y-4 text-left
                [&>h1]:text-lg [&>h1]:font-bold [&>h1]:text-ts-ink [&>h1]:mt-6 [&>h1]:mb-2 [&>h1]:border-b [&>h1]:border-ts-hairline [&>h1]:pb-1.5
                [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-ts-ink [&>h2]:mt-5 [&>h2]:mb-2
                [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-ts-ink [&>h3]:mt-3 [&>h3]:mb-1
                [&>p]:mb-3
                [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-3 [&>ul]:space-y-1
                [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-3 [&>ol]:space-y-1
                [&>blockquote]:border-l-4 [&>blockquote]:border-ts-primary [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-ts-muted [&>blockquote]:my-3
                [&>pre]:bg-ts-surface-elevated [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-3 [&>pre]:font-mono [&>pre]:text-[10px] [&>pre]:border [&>pre]:border-ts-hairline
                [&>code]:font-mono [&>code]:bg-ts-surface-elevated [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-ts-primary"
              dangerouslySetInnerHTML={renderMarkdown(content)}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
