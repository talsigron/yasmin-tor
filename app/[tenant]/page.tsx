import dynamic from 'next/dynamic';
import { getTenantConfigAsync } from '@/tenants';
import { getAdminSupabase } from '@/lib/supabase-admin';
import type { Metadata } from 'next';

const TenantHomePage = dynamic(() => import('@/components/booking/TenantHomePage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-gray-500 animate-spin" />
    </div>
  ),
});

export async function generateMetadata(
  { params }: { params: Promise<{ tenant: string }> }
): Promise<Metadata> {
  const { tenant } = await params;
  const config = await getTenantConfigAsync(tenant);
  if (!config) return {};

  try {
    const db = getAdminSupabase();
    const { data } = await db
      .from('business_profiles')
      .select('name, logo, description')
      .eq('id', config.businessId)
      .single();

    const name = data?.name || tenant;
    const description = data?.description || 'קביעת תור אונליין — פשוט ומהיר';
    const logo = data?.logo || null;

    return {
      title: name,
      description,
      openGraph: {
        title: name,
        description,
        ...(logo ? { images: [{ url: logo, width: 400, height: 400 }] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default function TenantPage() {
  return <TenantHomePage />;
}
