import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;

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

export async function getCollection(collectionName: string): Promise<any[]> {
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
  data: Record<string, any>
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
  data: Record<string, any>
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
export async function loginAdmin(email: string, password: string): Promise<any> {
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
  return data;
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

export async function getCurrentUser(): Promise<any> {
  if (!supabase) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
}
