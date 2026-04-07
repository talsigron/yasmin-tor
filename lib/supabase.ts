import { createClient, SupabaseClient } from '@supabase/supabase-js';

const clients = new Map<string, SupabaseClient>();

export function getSupabaseClient(url: string, key: string): SupabaseClient {
  const cacheKey = `${url}::${key}`;
  if (!clients.has(cacheKey)) {
    clients.set(cacheKey, createClient(url, key));
  }
  return clients.get(cacheKey)!;
}
