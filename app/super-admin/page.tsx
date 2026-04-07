import dynamic from 'next/dynamic';

const SuperAdminContent = dynamic(
  () => import('@/components/super-admin/SuperAdminContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-yellow-200 border-t-yellow-500 animate-spin" />
      </div>
    ),
  }
);

export default function SuperAdminPage() {
  return <SuperAdminContent />;
}
