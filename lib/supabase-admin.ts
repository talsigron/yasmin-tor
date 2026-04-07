import { getSupabaseClient } from './supabase';

export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_MENTANAIL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MENTANAIL ?? '';
  return getSupabaseClient(url, key);
}
