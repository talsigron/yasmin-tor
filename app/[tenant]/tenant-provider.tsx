'use client';

import { TenantContext } from '@/contexts/TenantContext';
import { getSupabaseClient } from '@/lib/supabase';
import { getDefaultLabels } from '@/tenants/defaults';
import type { TenantConfig, TenantFeatures } from '@/tenants/types';

interface SerializedConfigData {
  id: string;
  slug: string;
  category: 'nails' | 'fitness' | 'other';
  businessId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  features: TenantFeatures;
  defaultColors: { primary: string; secondary: string; background: string };
  defaultPassword: string;
  storagePrefix: string;
}

export function TenantClientProvider({
  configData,
  children,
}: {
  configData: SerializedConfigData;
  children: React.ReactNode;
}) {
  const config: TenantConfig = {
    ...configData,
    labels: getDefaultLabels(configData.category),
  };

  const supabase = getSupabaseClient(config.supabaseUrl, config.supabaseAnonKey);

  return (
    <TenantContext.Provider value={{ config, supabase }}>
      {children}
    </TenantContext.Provider>
  );
}
