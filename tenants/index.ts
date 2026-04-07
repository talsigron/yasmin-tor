import { TenantConfig } from './types';
import { mentanailConfig } from './mentanail';
import { studio180Config } from './studio180';

export { mentanailConfig, studio180Config };
export type { TenantConfig };

const tenants: Record<string, TenantConfig> = {
  mentanail: mentanailConfig,
  '180studio': studio180Config,
};

export function getTenantConfig(slug: string): TenantConfig | null {
  return tenants[slug] ?? null;
}
