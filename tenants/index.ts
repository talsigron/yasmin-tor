import { TenantConfig } from './types';
import { mentanailConfig } from './mentanail';
import { studio180Config } from './studio180';
import { getDefaultLabels, getDefaultFeatures, getDefaultColors } from './defaults';
import { getAdminSupabase } from '@/lib/supabase-admin';

export { mentanailConfig, studio180Config };
export type { TenantConfig };

/* ── Static tenants (backward compat) ── */
const staticTenants: Record<string, TenantConfig> = {
  mentanail: mentanailConfig,
  '180studio': studio180Config,
};

/* ── Sync lookup (static only) ── */
export function getTenantConfig(slug: string): TenantConfig | null {
  return staticTenants[slug] ?? null;
}

/* ── Async lookup (static first, then DB) ── */
export async function getTenantConfigAsync(slug: string): Promise<TenantConfig | null> {
  // 1. Static config wins
  const staticConfig = staticTenants[slug];
  if (staticConfig) return staticConfig;

  // 2. Try DB
  try {
    const db = getAdminSupabase();
    const { data, error } = await db
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error || !data) return null;

    return buildTenantConfig(data);
  } catch {
    return null;
  }
}

/* ── Build TenantConfig from DB row ── */
interface TenantRow {
  slug: string;
  business_id: string;
  category: 'nails' | 'fitness' | 'other';
  owner_name: string | null;
  owner_phone: string | null;
  colors: Record<string, string> | null;
  features: Record<string, boolean> | null;
  active: boolean;
}

function buildTenantConfig(row: TenantRow): TenantConfig {
  const category = (['nails', 'fitness', 'other'].includes(row.category)
    ? row.category
    : 'other') as 'nails' | 'fitness' | 'other';

  const defaults = getDefaultFeatures(category);
  const features = row.features
    ? { ...defaults, ...row.features }
    : defaults;

  const colors = row.colors && row.colors.primary
    ? row.colors as { primary: string; secondary: string; background: string }
    : getDefaultColors();

  return {
    id: row.slug,
    slug: row.slug,
    category,
    businessId: row.business_id,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL_MENTANAIL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MENTANAIL ?? '',
    labels: getDefaultLabels(category),
    features: features as TenantConfig['features'],
    defaultColors: colors,
    defaultPassword: '',
    storagePrefix: row.slug,
  };
}

/* ── Existing helpers ── */
export function getTenantByBusinessId(businessId: string): TenantConfig | null {
  return Object.values(staticTenants).find((t) => t.businessId === businessId) ?? null;
}

export function getAllTenants(): TenantConfig[] {
  return Object.values(staticTenants);
}
