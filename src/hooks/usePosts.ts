import { useState, useEffect, useCallback } from 'react';
import { getCollection } from '../lib/supabase';

export interface BlogPost {
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

export function usePosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
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
        console.warn('Supabase fetch failed, checking local', e);
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
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, fetchPosts };
}
