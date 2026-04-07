'use client';

import dynamic from 'next/dynamic';

const TenantHomePage = dynamic(() => import('@/components/booking/TenantHomePage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-gray-500 animate-spin" />
    </div>
  ),
});

export default function TenantPage() {
  return <TenantHomePage />;
}
