import { useState, useEffect, useCallback } from 'react';
import { getCollection } from '../lib/supabase';
import { normalizePost, parseStoredPosts, type BlogPost } from '../lib/blogPosts';

export type { BlogPost } from '../lib/blogPosts';

export function usePosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let fetched: BlogPost[] = [];
      try {
        const data = await getCollection('blogs');
        fetched = data.map(normalizePost).filter((post): post is BlogPost => post !== null);
      } catch (e) {
        console.warn('Supabase fetch failed, checking local', e);
      }

      const localBlogs = parseStoredPosts(localStorage.getItem('ts-local-blogs'));

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
