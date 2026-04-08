import { notFound } from 'next/navigation';
import { getTenantConfigAsync } from '@/tenants';
import { TenantClientProvider } from './tenant-provider';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const config = await getTenantConfigAsync(tenant);

  if (!config) notFound();

  // Serialize only plain data (no functions) for client
  const configData = {
    id: config.id,
    slug: config.slug,
    category: config.category,
    businessId: config.businessId,
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    features: config.features,
    defaultColors: config.defaultColors,
    defaultPassword: config.defaultPassword,
    storagePrefix: config.storagePrefix,
  };

  return (
    <TenantClientProvider configData={configData}>
      {children}
    </TenantClientProvider>
  );
}
