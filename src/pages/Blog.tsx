import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { db, getCollection, addDocument, updateDocument, deleteDocument, handleCloudbaseError, OperationType } from '../lib/cloudbase';
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
  Upload,
  Clock,
  ArrowRight,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useFloatingOrbs } from '../hooks/useFloatingOrbs';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { marked } from 'marked';
import BorderGlow from '../components/BorderGlow';

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

const getPlainText = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove links
    .replace(/#{1,6}\s+/g, '') // remove headings
    .replace(/[*_`~]/g, '') // remove styling symbols
    .replace(/>+/g, '') // remove blockquotes
    .replace(/-\s+/g, '') // remove list symbols
    .replace(/\s+/g, ' ') // collapse whitespaces
    .trim();
};

const getReadTime = (content: string, isZh: boolean) => {
  if (!content) return isZh ? '1 分钟阅读' : '1 min read';
  const words = content.trim().split(/\s+/).length;
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const minutes = Math.max(1, Math.ceil(words / 200 + chineseChars / 400));
  return isZh ? `${minutes} 分钟阅读` : `${minutes} min read`;
};

// isAdmin is now imported from AuthContext

const getFirstImageUrl = (content: string): string | null => {
  if (!content) return null;
  // Match markdown image syntax: ![alt](url)
  const mdImageRegex = /!\[.*?\]\((.*?)\)/;
  const match = content.match(mdImageRegex);
  if (match && match[1]) {
    return match[1];
  }
  
  // Match HTML img tag: <img src="url" ...>
  const htmlImageRegex = /<img\s+[^>]*src=["']([^"']+)["']/;
  const htmlMatch = content.match(htmlImageRegex);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1];
  }

  return null;
};

const CoverPlaceholder = ({ title }: { title: string }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#B497CF]/20 via-[#FAF6EE] to-[#ff9aa5]/10 relative flex flex-col justify-between p-6 select-none overflow-hidden border-b border-ts-hairline">
      {/* Background abstract layout elements representing a magazine page */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(180,151,207,0.06)_1px,transparent_1px)] [background-size:12px_12px]" />
      <div className="absolute right-[-10%] top-[-10%] w-48 h-48 bg-[#B497CF]/5 rounded-full blur-2xl" />
      <div className="absolute left-[10%] bottom-[10%] w-40 h-40 bg-[#ff9aa5]/5 rounded-full blur-2xl" />
      
      {/* Grid line pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(44,38,33,0.01)_1px,transparent_1px),linear-gradient(0deg,rgba(44,38,33,0.01)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
      
      {/* Top Header Tag */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#B497CF]/10 pb-2.5">
        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#B497CF]">TSync Studio</span>
        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-ts-muted">Writing</span>
      </div>
      
      {/* Centered Graphic Element */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center gap-2 text-center">
        <div className="w-10 h-10 rounded-[10px] bg-white border border-[#B497CF]/15 flex items-center justify-center text-[#B497CF] shadow-[0_2px_8px_rgba(180,151,207,0.12)]">
          <BookOpen size={20} />
        </div>
      </div>
      
      {/* Footer Title / Date */}
      <div className="relative z-10 pt-2 border-t border-[#B497CF]/10 flex justify-between items-end">
        <span className="text-[9px] font-bold text-ts-muted tracking-tight font-serif truncate max-w-[70%]">
          {title}
        </span>
        <span className="text-[7px] font-black uppercase tracking-widest text-[#B497CF]/60 font-mono">
          Vol. {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
};

const wxColors = {
  ink: '#24302f',
  title: '#223030',
  body: '#4f5b58',
  muted: '#7a817b',
  green: '#7f9b75',
  greenText: '#3f583f',
  greenSoft: '#edf4e7',
  paper: '#fffdf8',
  blueText: '#426475',
  blueSoft: '#e7f0f4',
  warmSoft: '#fffaf2',
  border: '#eee6d6',
};

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function smartJoinLines(lines: string[]): string {
  if (lines.length === 0) return '';
  let result = lines[0];
  const cjkRegex = /[\u4e00-\u9fa5\u3040-\u30ff\u3400-\u4dbf\uf900-\ufaff\uff00-\uffef]/;
  for (let i = 1; i < lines.length; i++) {
    const prev = result.trimEnd();
    const curr = lines[i].trimStart();
    if (prev === '' || curr === '') {
      result += curr;
      continue;
    }
    const lastChar = prev[prev.length - 1];
    const firstChar = curr[0];
    if (cjkRegex.test(lastChar) || cjkRegex.test(firstChar)) {
      result = prev + curr;
    } else {
      result = prev + ' ' + curr;
    }
  }
  return result;
}

function inlineMarkdown(value: string): string {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, `<code style="padding:2px 5px;border-radius:4px;background:#eef3ee;color:${wxColors.greenText};font-size:13px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;">$1</code>`);
  text = text.replace(/\*\*([^*]+)\*\*/g, `<strong style="padding:1px 4px;border-radius:4px;background:${wxColors.greenSoft};color:${wxColors.greenText};font-weight:800;">$1</strong>`);
  return text;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;color:${wxColors.body};font-size:15px;line-height:1.95;text-align:left;">${inlineMarkdown(text)}</p>`;
}

function wxH1(text: string): string {
  return `<h1 style="margin:0 0 12px;color:${wxColors.title};font-size:26px;line-height:1.35;font-weight:800;letter-spacing:0;">${inlineMarkdown(text)}</h1>`;
}

function wxH2(text: string): string {
  const match = text.match(/^(\d{1,2})[\s.、-]+(.+)$/);
  const no = match ? match[1].padStart(2, '0') : '';
  const title = match ? match[2] : text;
  if (no) {
    return `<section style="margin:30px 0 14px;"><p style="margin:0;color:${wxColors.ink};font-size:19px;line-height:1.6;font-weight:800;"><span style="display:inline-block;width:34px;height:34px;margin-right:8px;border-radius:50%;background:${wxColors.blueSoft};color:${wxColors.blueText};text-align:center;line-height:34px;font-family:Georgia,serif;font-size:16px;font-weight:800;">${no}</span>${inlineMarkdown(title)}</p></section>`;
  }
  return `<p style="margin:28px 0 12px;color:${wxColors.blueText};font-size:17px;line-height:1.7;font-weight:800;">${inlineMarkdown(text)}</p>`;
}

function wxH3(text: string): string {
  return `<p style="margin:24px 0 10px;color:${wxColors.blueText};font-size:16px;line-height:1.7;font-weight:800;">${inlineMarkdown(text)}</p>`;
}

function wxH4(text: string): string {
  return `<p style="margin:20px 0 8px;color:${wxColors.greenText};font-size:15px;line-height:1.7;font-weight:800;"><span style="display:inline-block;width:6px;height:6px;margin-right:7px;border-radius:50%;background:${wxColors.green};vertical-align:middle;"></span>${inlineMarkdown(text)}</p>`;
}

function image(alt: string, src: string): string {
  const safeAlt = escapeHtml(alt || '图片');
  const safeSrc = escapeHtml(src);
  return `<section style="margin:22px 0;text-align:center;"><img src="${safeSrc}" alt="${safeAlt}" style="display:block;width:100%;max-width:100%;height:auto;border-radius:8px;border:1px solid ${wxColors.border};"><p style="margin:8px 0 0;color:${wxColors.muted};font-size:13px;line-height:1.7;">${safeAlt}</p></section>`;
}

function quote(lines: string[]): string {
  const content = inlineMarkdown(smartJoinLines(lines));
  return `<section style="margin:0 0 24px;padding:14px 15px;border-left:4px solid ${wxColors.green};background:#f5f8f0;border-radius:0 8px 8px 0;"><p style="margin:0;color:#475547;font-size:15px;line-height:1.85;text-align:left;">${content}</p></section>`;
}

function codeBlock(code: string, lang: string = ''): string {
  const label = lang ? `示例代码 · ${escapeHtml(lang)}` : '示例代码';
  const formattedCode = escapeHtml(code.trimEnd())
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    .replace(/ /g, '&nbsp;')
    .replace(/\n/g, '<br>');
  return `<section style="margin:0 0 22px;border:1px solid #dfe5d7;background:#f6f8f2;border-radius:8px;overflow:hidden;"><section style="padding:8px 12px;background:#e9f0e4;border-bottom:1px solid #dfe5d7;"><p style="margin:0;color:#587052;font-size:13px;font-weight:800;line-height:1.6;">${label}</p></section><section style="padding:14px 15px;"><p style="margin:0;color:#40504a;font-size:13px;line-height:1.8;font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;white-space:pre-wrap;text-align:left;">${formattedCode}</p></section></section>`;
}

function list(items: string[]): string {
  return `<section style="margin:20px 0;padding:14px 15px;border:1px solid #e9e0d0;background:${wxColors.warmSoft};border-radius:8px;">${items.map(item => `<p style="margin:6px 0;color:#5f6964;font-size:15px;line-height:1.85;text-align:left;">· ${inlineMarkdown(item)}</p>`).join('')}</section>`;
}

function table(lines: string[]): string {
  const rows = lines
    .map(line => line.trim())
    .filter(line => line.startsWith('|'))
    .map(line => line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()))
    .filter(cells => !cells.every(cell => /^:?-{3,}:?$/.test(cell)));
  if (!rows.length) return '';
  const [head, ...body] = rows;
  const headHtml = head.map(cell => `<th style="padding:11px 10px;background:${wxColors.blueSoft};color:${wxColors.blueText};font-size:14px;line-height:1.6;text-align:left;font-weight:800;border-bottom:1px solid #d8e5ea;">${inlineMarkdown(cell)}</th>`).join('');
  const bodyHtml = body.map((row, rowIndex) => {
    const isLast = rowIndex === body.length - 1;
    return `<tr>${row.map((cell, cellIndex) => `<td style="padding:11px 10px;color:${cellIndex === 0 ? wxColors.ink : '#5f6964'};font-size:14px;line-height:1.75;${cellIndex === 0 ? 'font-weight:700;' : ''}${isLast ? '' : `border-bottom:1px solid ${wxColors.border};`}">${inlineMarkdown(cell)}</td>`).join('')}</tr>`;
  }).join('');
  return `<section style="margin:24px 0;"><table style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e4ddd0;border-radius:8px;overflow:hidden;background:${wxColors.paper};"><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></section>`;
}

function hr(): string {
  return `<section style="margin:30px 0;text-align:center;"><span style="display:inline-block;width:96px;height:1px;background:#d9d2c4;vertical-align:middle;line-height:0;font-size:0;overflow:hidden;">&nbsp;</span></section>`;
}

function wrapDocumentInner(content: string): string {
  return `<div style="padding:0 24px 56px;background:${wxColors.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;color:${wxColors.ink};">${content}</div>`;
}

function convertMarkdownToWechatHtmlInner(markdown: string): string {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const output: string[] = [];
  let paragraphLines: string[] = [];
  let quoteLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length) {
      output.push(paragraph(smartJoinLines(paragraphLines)));
      paragraphLines = [];
    }
  }

  function flushQuote() {
    if (quoteLines.length) {
      output.push(quote(quoteLines));
      quoteLines = [];
    }
  }

  function flushList() {
    if (listItems.length) {
      output.push(list(listItems));
      listItems = [];
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      flushParagraph();
      flushQuote();
      flushList();
      continue;
    }

    if (/^---+\s*$/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      flushList();
      output.push(hr());
      continue;
    }

    const fence = trimmed.match(/^```(\w+)?/);
    if (fence) {
      flushParagraph();
      flushQuote();
      flushList();
      const lang = fence[1] || '';
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      output.push(codeBlock(codeLines.join('\n'), lang));
      continue;
    }

    if (trimmed.startsWith('|')) {
      flushParagraph();
      flushQuote();
      flushList();
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      i -= 1;
      output.push(table(tableLines));
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      quoteLines.push(trimmed.replace(/^>\s?/, ''));
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      flushQuote();
      listItems.push(listMatch[1]);
      continue;
    }

    flushQuote();
    flushList();

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      output.push(wxH1(trimmed.slice(2).trim()));
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      output.push(wxH2(trimmed.slice(3).trim()));
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      output.push(wxH3(trimmed.slice(4).trim()));
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushParagraph();
      output.push(wxH4(trimmed.slice(5).trim()));
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      output.push(image(imageMatch[1], imageMatch[2]));
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushQuote();
  flushList();

  return wrapDocumentInner(output.join('\n'));
}

export const Blog = () => {
  const { user, isAdmin } = useAuth();
  const { language } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  useFloatingOrbs(containerRef);
  useScrollReveal(containerRef);

  // States
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const queryLower = searchQuery.toLowerCase().trim();
    return posts.filter(post => 
      post.title.toLowerCase().includes(queryLower) ||
      post.summary.toLowerCase().includes(queryLower) ||
      getPlainText(post.content).toLowerCase().includes(queryLower) ||
      post.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }, [posts, searchQuery]);
  
  const existingTags = useMemo(() => {
    const allTags = posts.flatMap(post => post.tags || []);
    return Array.from(new Set(allTags)).filter(Boolean);
  }, [posts]);

  useEffect(() => {
    if (loading) return;

    if (id) {
      const post = posts.find(p => p.id === id);
      if (post) {
        setSelectedPost(post);
        setView('detail');
      } else {
        navigate('/writing', { replace: true });
      }
    } else {
      if (view === 'detail') {
        setSelectedPost(null);
        setView('list');
      }
    }
  }, [id, posts, loading]);

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

  // Fetch blogs from CloudBase
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let fetched: BlogPost[] = [];
      
      // 1. Try to fetch from CloudBase
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
      } catch (cloudbaseError) {
        console.warn('CloudBase fetch failed, relying on local fallback:', cloudbaseError);
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
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
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
      await fetchPosts();
      navigate('/writing');
      setSaving(false);
      return;
    }

    try {
      await addDocument('blogs', postData);
      
      setTitle('');
      setSummary('');
      setTags('');
      setContent('');
      await fetchPosts();
      navigate('/writing');
    } catch (error) {
      console.error('CloudBase save failed, saving to localStorage:', error);
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
      await fetchPosts();
      navigate('/writing');
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
      await fetchPosts();
      navigate('/writing');
      setSaving(false);
      return;
    }

    try {
      await updateDocument('blogs', selectedPost.id, {
        title: title.trim(),
        summary: summary.trim() || (content.slice(0, 120) + '...'),
        tags: parsedTags,
        content: content,
        updatedAt: new Date().toISOString(),
      });

      await fetchPosts();
      navigate('/writing');
    } catch (error) {
      console.error('CloudBase update failed, falling back to local edit:', error);
      // Fallback: update in local storage if not found in CloudBase or if auth failed
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
      await fetchPosts();
      navigate('/writing');
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
      await fetchPosts();
      if (selectedPost?.id === postId) {
        navigate('/writing');
      }
      return;
    }

    try {
      await deleteDocument('blogs', postId);
      await fetchPosts();
      if (selectedPost?.id === postId) {
        navigate('/writing');
      }
    } catch (error) {
      console.error('CloudBase delete failed, checking local fallback:', error);
      const localBlogsRaw = localStorage.getItem('ts-local-blogs');
      if (localBlogsRaw) {
        try {
          let localBlogs = JSON.parse(localBlogsRaw);
          localBlogs = localBlogs.filter((p: any) => p.id !== postId);
          localStorage.setItem('ts-local-blogs', JSON.stringify(localBlogs));
        } catch (_) {}
      }
      await fetchPosts();
      if (selectedPost?.id === postId) {
        navigate('/writing');
      }
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
    const date = new Date(timestamp);
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
      title: 'WRITING',
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
                <span className="text-ts-primary block">{t.title}</span>
                <span className="text-ts-ink/80 block mt-2">
                  Sync Thoughts.
                </span>
              </h1>
              <p className="text-ts-body text-[15px] font-semibold max-w-md leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {isAdmin && (
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
        <div className="relative pt-4 space-y-6">
          {posts.length > 0 && (
            <div className="flex justify-end w-full max-w-[1200px] mx-auto px-4 relative z-20">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ts-muted-soft" size={16} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-ts-surface-elevated/40 backdrop-blur-md text-ts-ink border border-ts-hairline pl-10 pr-4 h-11 rounded-[8px] text-xs font-semibold focus:bg-ts-surface/60 focus:border-ts-primary outline-none transition-all placeholder:text-ts-muted-soft w-full shadow-inner"
                  placeholder={language === 'zh' ? '搜索文章标题、内容或标签...' : 'Search posts, content or tags...'}
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-24">
              <Loader2 size={32} className="animate-spin text-ts-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center card border-dashed border-ts-hairline bg-ts-surface-elevated/40">
              <BookOpen size={48} className="text-ts-muted mb-4" />
              <p className="text-sm font-bold text-ts-ink uppercase tracking-wider">{t.empty}</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1200px] mx-auto py-10 px-4">
              {filteredPosts.map((post) => {
                const coverUrl = getFirstImageUrl(post.content);
                return (
                  <BorderGlow
                    key={post.id}
                    edgeSensitivity={30}
                    glowColor="271 37 70"
                    backgroundColor="var(--color-ts-surface)"
                    borderRadius={12}
                    glowRadius={30}
                    glowIntensity={0.8}
                    coneSpread={20}
                    animated={false}
                    colors={['#B497CF', '#ff9aa5', '#e2d6f5']}
                    className="flex flex-col h-[380px] w-full"
                  >
                    {/* Header Image Cover */}
                    <div className="relative w-full h-[190px] overflow-hidden bg-ts-surface-elevated/40 shrink-0">
                      {coverUrl ? (
                        <img 
                          src={coverUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <CoverPlaceholder title={post.title} />
                      )}
                    </div>

                    {/* Card Content body */}
                    <div className="flex-1 p-5 flex flex-col justify-between min-h-0 bg-transparent">
                      {/* Meta & Title */}
                      <div className="space-y-2 min-h-0">
                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-2 text-[9px] text-ts-muted font-bold uppercase tracking-wider font-mono">
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="w-1 h-1 rounded-full bg-ts-hairline" />
                          <span>{getReadTime(post.content, language === 'zh')}</span>
                        </div>

                        {/* Title button */}
                        <button
                          onClick={() => navigate(`/writing/${post.id}`)}
                          className="text-left block group/title font-serif text-lg font-bold text-ts-ink leading-snug cursor-pointer transition-colors max-h-[48px] overflow-hidden line-clamp-2"
                          title={post.title}
                        >
                          <span className="relative inline-block hover:text-ts-primary">
                            {post.title}
                          </span>
                        </button>
                      </div>

                      {/* Footer: Tags & Actions */}
                      <div className="pt-3 border-t border-ts-hairline flex flex-col gap-2.5">
                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-h-[20px] overflow-hidden">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span 
                                key={tag}
                                className="px-1.5 py-0.5 rounded-[4px] text-[8px] font-semibold bg-ts-surface-elevated text-ts-muted border border-ts-hairline flex items-center gap-0.5"
                              >
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between">
                          {isAdmin ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(post)}
                                className="p-1 text-ts-muted-soft hover:text-ts-ink hover:bg-ts-surface-elevated rounded-[4px] transition-all cursor-pointer"
                                title={t.edit}
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1 text-ts-muted-soft hover:text-ts-error hover:bg-ts-error-bg rounded-[4px] transition-all cursor-pointer"
                                title={t.delete}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <div />
                          )}

                          <button
                            onClick={() => navigate(`/writing/${post.id}`)}
                            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-ts-muted hover:text-ts-primary transition-colors group/read cursor-pointer"
                          >
                            <span>{language === 'zh' ? '阅读全文' : 'Read Article'}</span>
                            <ArrowRight size={10} className="transform group-hover/read:translate-x-1 transition-transform duration-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </BorderGlow>
                );
              })}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center card border-dashed border-ts-hairline bg-ts-surface-elevated/40 max-w-[1200px] mx-auto">
              <Search size={48} className="text-ts-muted mb-4" />
              <p className="text-sm font-bold text-ts-ink uppercase tracking-wider">
                {language === 'zh' ? '没有找到相关的博客文章。' : 'No matching blog posts found.'}
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 px-6 py-2.5 bg-ts-primary text-white rounded-[6px] text-xs font-semibold hover:bg-ts-primary-hover transition-all shadow-sm cursor-pointer"
              >
                {language === 'zh' ? '清空搜索词' : 'Clear Search Query'}
              </button>
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
              onClick={() => navigate('/writing')}
              className="inline-flex items-center gap-2 text-xs font-bold text-ts-muted hover:text-ts-ink transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              {t.back}
            </button>

            {isAdmin && (
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

          {/* Shiyun WeChat MD Style Reading Interface */}
          <div className="w-full bg-[#f3f1ea] p-4 sm:p-6 md:p-8 rounded-[12px] border border-[#eee6d6] shadow-[0_4px_24px_rgba(44,38,33,0.05)] text-left">
            <article className="max-w-[720px] mx-auto bg-[#fffdf8] rounded-[8px] border border-[#eee6d6] overflow-hidden">
              {/* Header section (styled inline WeChat-style) */}
              <div style={{ padding: "28px 24px 0", background: "#fffdf8", color: "#24302f", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif" }}>
                {/* Top Tags */}
                <div style={{ margin: "0 0 18px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedPost.tags.length > 0 ? (
                    selectedPost.tags.map((tag) => (
                      <span key={tag} style={{ display: "inline-block", padding: "4px 10px", borderRadius: "999px", background: "#edf4e7", color: "#5b7855", fontSize: "13px", fontWeight: 700, lineHeight: 1.6 }}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "999px", background: "#edf4e7", color: "#5b7855", fontSize: "13px", fontWeight: 700, lineHeight: 1.6 }}>
                      {language === 'zh' ? '自修笔记' : 'Notes'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 style={{ margin: "0 0 12px", color: "#223030", fontSize: "26px", lineHeight: 1.35, fontWeight: 800, letterSpacing: 0 }}>
                  {selectedPost.title}
                </h1>

                {/* Metadata */}
                <p style={{ margin: "0 0 26px", color: "#7a817b", fontSize: "13px", lineHeight: 1.8 }}>
                  作者: {selectedPost.userName} / 发布时间: {formatDate(selectedPost.createdAt)} / {getReadTime(selectedPost.content, language === 'zh')}
                </p>
              </div>

              {/* WeChat Article Body */}
              <div 
                dangerouslySetInnerHTML={{ __html: convertMarkdownToWechatHtmlInner(selectedPost.content) }}
              />

              {/* Tags footer */}
              {selectedPost.tags.length > 0 && (
                <div style={{ padding: "0 24px 28px", background: "#fffdf8", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedPost.tags.map((tag) => (
                    <span 
                      key={tag}
                      style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, background: "#edf4e7", color: "#3f583f", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      )}

      {/* VIEW: Blog Create / Edit Editor View */}
      {(view === 'create' || view === 'edit') && (
        <div className="space-y-8 max-w-6xl mx-auto pt-6">
          {/* Header Bar */}
          <div className="flex justify-between items-center pb-4 border-b border-ts-hairline dark:border-ts-navy-700">
            <button
              onClick={() => navigate('/writing')}
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
                  {existingTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      <span className="text-[10px] text-ts-muted mr-1 self-center">
                        {language === 'zh' ? '已有标签:' : 'Existing tags:'}
                      </span>
                      {existingTags.map(tag => {
                        const currentTagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
                        const isSelected = currentTagsArray.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                const nextTags = currentTagsArray.filter(t => t !== tag).join(', ');
                                setTags(nextTags);
                              } else {
                                const nextTags = [...currentTagsArray, tag].join(', ');
                                setTags(nextTags);
                              }
                            }}
                            className={cn(
                              "px-2 py-1 rounded-[4px] text-[10px] font-bold border transition-all cursor-pointer",
                              isSelected 
                                ? "bg-ts-primary/10 border-ts-primary text-ts-primary" 
                                : "bg-ts-surface-elevated/40 border-ts-hairline text-ts-muted hover:text-ts-ink"
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  )}
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
                <div className="card flex-1 flex flex-col border border-ts-hairline dark:border-ts-navy-700 bg-ts-surface dark:bg-ts-navy-900 rounded-[12px] overflow-hidden">
                  <div className="bg-ts-surface-elevated dark:bg-ts-navy-800/50 px-4 py-2 border-b border-ts-hairline dark:border-ts-navy-700 text-[10px] font-bold text-ts-muted uppercase tracking-wider font-mono">
                    {t.editTab}
                  </div>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 w-full p-4 text-xs font-mono bg-transparent text-ts-ink resize-none outline-none leading-relaxed border-none focus:ring-0"
                    placeholder="# Hello World&#10;&#10;Write your post using Markdown formatting..."
                  />
                </div>

                {/* Markdown Preview */}
                <div className="card flex-1 flex flex-col border border-ts-hairline dark:border-ts-navy-700 bg-ts-surface dark:bg-ts-navy-900 rounded-[12px] overflow-hidden">
                  <div className="bg-ts-surface-elevated dark:bg-ts-navy-800/50 px-4 py-2 border-b border-ts-hairline dark:border-ts-navy-700 text-[10px] font-bold text-ts-muted uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Eye size={12} />
                    {t.preview}
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto bg-ts-canvas/40 dark:bg-ts-navy-950/25">
                    <div 
                      className="blog-content prose dark:prose-invert max-w-none text-xs text-left leading-relaxed text-ts-body space-y-4
                        [&>h1]:text-lg [&>h1]:font-black [&>h1]:text-ts-ink [&>h1]:mt-4 [&>h1]:mb-2 [&>h1]:pb-1 [&>h1]:border-b [&>h1]:border-ts-hairline
                        [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-ts-ink [&>h2]:mt-3 [&>h2]:mb-2
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
