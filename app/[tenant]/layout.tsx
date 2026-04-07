'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { getTenantConfig } from '@/tenants';
import { getSupabaseClient } from '@/lib/supabase';
import { TenantContext } from '@/contexts/TenantContext';

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Promise<any>;
}) {
  const { tenant } = use(params) as { tenant: string };
  const config = getTenantConfig(tenant);

  if (!config) notFound();

  const supabase = getSupabaseClient(config.supabaseUrl, config.supabaseAnonKey);

  return (
    <TenantContext.Provider value={{ config, supabase }}>
      {children}
    </TenantContext.Provider>
  );
}
