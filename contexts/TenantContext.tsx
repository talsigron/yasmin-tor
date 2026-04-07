'use client';

import { createContext, useContext } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TenantConfig } from '@/tenants/types';

export interface TenantContextValue {
  config: TenantConfig;
  supabase: SupabaseClient;
}

export const TenantContext = createContext<TenantContextValue | null>(null);

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used inside TenantProvider');
  return ctx;
}
