import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { hasAdminRole } from './auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('[Supabase] Failed to initialize client:', err);
  }
} else {
  console.warn('[Supabase] Missing credentials in environment variables.');
}

export const supabase = supabaseClient;

export async function getCollection(collectionName: string): Promise<Record<string, unknown>[]> {
  let isAuth = false;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      isAuth = true;
    }
  }

  // Use CDN proxy for blogs only if NOT authenticated.
  // This prevents the 5-minute CDN cache from hiding newly published posts from the admin.
  if (collectionName === 'blogs' && !isAuth) {
    try {
      const res = await fetch('/api/blogs', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (err) {
      console.warn('[Supabase Proxy] /api/blogs fetch failed or timed out, using direct SDK client fallback:', err);
    }
  }

  if (!supabase) {
    throw new Error('Supabase client is not initialized due to missing environment variables.');
  }
  const { data, error } = await supabase
    .from(collectionName)
    .select('*');
  if (error) {
    console.error(`Error fetching from ${collectionName}:`, error.message);
    throw error;
  }
  return data || [];
}

export async function addDocument(
  collectionName: string,
  data: Record<string, unknown>
): Promise<{ id: string }> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized due to missing environment variables.');
  }
  const cleanData = { ...data };
  // Remove fields that might cause primary key conflicts or type mismatches
  delete cleanData.id;
  delete cleanData._id;

  const { data: inserted, error } = await supabase
    .from(collectionName)
    .insert([cleanData])
    .select();
  if (error) {
    console.error(`Error adding doc to ${collectionName}:`, error.message);
    throw error;
  }
  const doc = inserted?.[0];
  return { id: doc?.id || "" };
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized due to missing environment variables.');
  }
  const cleanData = { ...data };
  delete cleanData.id;
  delete cleanData._id;

  const { error } = await supabase
    .from(collectionName)
    .update(cleanData)
    .eq('id', docId);
  if (error) {
    console.error(`Error updating doc in ${collectionName}:`, error.message);
    throw error;
  }
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized due to missing environment variables.');
  }
  const { error } = await supabase
    .from(collectionName)
    .delete()
    .eq('id', docId);
  if (error) {
    console.error(`Error deleting doc from ${collectionName}:`, error.message);
    throw error;
  }
}

// Authentication Helpers
export async function loginAdmin(email: string, password: string): Promise<User> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized due to missing environment variables.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  if (!hasAdminRole(data.user)) {
    await supabase.auth.signOut();
    throw new Error('This account does not have administrator access.');
  }
  return data.user;
}

export async function logoutAdmin(): Promise<void> {
  if (!supabase) {
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentAdminUser(): Promise<User | null> {
  if (!supabase) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return hasAdminRole(user) ? user : null;
}
