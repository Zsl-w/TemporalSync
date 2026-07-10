import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing credentials in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCollection(collectionName: string): Promise<any[]> {
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
  const { error } = await supabase
    .from(collectionName)
    .delete()
    .eq('id', docId);
  if (error) {
    console.error(`Error deleting doc from ${collectionName}:`, error.message);
    throw error;
  }
}
