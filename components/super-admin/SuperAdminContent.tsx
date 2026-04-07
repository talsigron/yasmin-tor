'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { getTenantByBusinessId } from '@/tenants';
import {
  Building2,
  Users,
  CalendarCheck,
  LogIn,
  LogOut,
  RefreshCw,
  Phone,
  Clock,
  Dumbbell,
  Sparkles,
} from 'lucide-react';

const SUPER_ADMIN_PASSWORD = 'yasmin2024';
const SESSION_KEY = 'yasmin_super_admin_session';

type CategoryFilter = 'all' | 'fitness' | 'nails';

interface BusinessWithStats {
  id: string;
  name: string;
  phone: string;
  description: string;
  created_at: string;
  customerCount: number;
  appointmentCount: number;
  tenantSlug: string | null;
  category: string | null;
  primaryColor: string;
}

async function fetchAllBusinessStats(): Promise<BusinessWithStats[]> {
  const db = getAdminSupabase();
  const { data: businesses, error } = await db
    .from('business_profiles')
    .select('id, name, phone, description, created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const withStats: BusinessWithStats[] = await Promise.all(
    (businesses ?? []).map(async (b) => {
      const [custRes, apptRes] = await Promise.all([
        db.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', b.id),
        db.from('appointments').select('*', { count: 'exact', head: true }).eq('business_id', b.id),
      ]);

      const tenant = getTenantByBusinessId(b.id);

      return {
        id: b.id,
        name: b.name ?? '',
        phone: b.phone ?? '',
        description: b.description ?? '',
        created_at: b.created_at ?? '',
        customerCount: custRes.count ?? 0,
        appointmentCount: apptRes.count ?? 0,
        tenantSlug: tenant?.slug ?? null,
        category: tenant?.category ?? null,
        primaryColor: tenant?.defaultColors.primary ?? '#6b7280',
      };
    })
  );

  return withStats;
}

const CATEGORY_TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'כל העסקים' },
  { key: 'fitness', label: 'כושר' },
  { key: 'nails', label: 'בונות ציפורניים' },
];

function CategoryIcon({ category, color }: { category: string | null; color: string }) {
  if (category === 'fitness') return <Dumbbell size={16} style={{ color }} />;
  if (category === 'nails') return <Sparkles size={16} style={{ color }} />;
  return <Building2 size={16} style={{ color }} />;
}

export default function SuperAdminContent() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<BusinessWithStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session === 'true') setAuthenticated(true);
    setLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchAllBusinessStats();
      setBusinesses(data);
    } catch (err) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SUPER_ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('סיסמה שגויה');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
    setBusinesses([]);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  const filteredBusinesses = businesses.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  const totalCustomers = filteredBusinesses.reduce((s, b) => s + b.customerCount, 0);
  const totalAppointments = filteredBusinesses.reduce((s, b) => s + b.appointmentCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 rounded-full border-[3px] border-yellow-200 border-t-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4" dir="rtl">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-black text-gray-900">Y</span>
            </div>
            <h1 className="text-2xl font-bold text-white">יסמין תקשורת</h1>
            <p className="text-gray-400 text-sm mt-1">ניהול ראשי – Super Admin</p>
          </div>

          <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-6 shadow-xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">סיסמת מנהל</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
              placeholder="הכנס סיסמה"
              autoFocus
            />
            {loginError && <p className="text-red-400 text-sm mt-2">{loginError}</p>}
            <button
              type="submit"
              className="w-full mt-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={18} />
              כניסה
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <span className="text-lg font-black text-gray-900">Y</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">יסמין תקשורת</h1>
              <p className="text-xs text-gray-400">Super Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              title="רענון"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title="יציאה"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === tab.key
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="mr-1.5 text-xs opacity-70">
                  ({businesses.filter((b) => b.category === tab.key).length})
                </span>
              )}
              {tab.key === 'all' && (
                <span className="mr-1.5 text-xs opacity-70">({businesses.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <Building2 size={24} className="text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{filteredBusinesses.length}</p>
            <p className="text-xs text-gray-500">עסקים</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <Users size={24} className="text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{totalCustomers}</p>
            <p className="text-xs text-gray-500">לקוחות</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <CalendarCheck size={24} className="text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{totalAppointments}</p>
            <p className="text-xs text-gray-500">תורים</p>
          </div>
        </div>

        {/* Businesses list */}
        {refreshing && filteredBusinesses.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-[3px] border-yellow-200 border-t-yellow-500 animate-spin" />
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">אין עסקים בקטגוריה זו</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={biz.category} color={biz.primaryColor} />
                    <div>
                      <h3 className="text-base font-bold text-gray-800">{biz.name || 'ללא שם'}</h3>
                      {biz.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                          <Phone size={12} />
                          <span dir="ltr">{biz.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>{formatDate(biz.created_at)}</span>
                  </div>
                </div>

                {biz.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{biz.description}</p>
                )}

                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-blue-500" />
                    <span className="text-gray-700 font-medium">{biz.customerCount}</span>
                    <span className="text-gray-400">לקוחות</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck size={14} className="text-green-500" />
                    <span className="text-gray-700 font-medium">{biz.appointmentCount}</span>
                    <span className="text-gray-400">תורים</span>
                  </div>
                </div>

                {biz.tenantSlug && (
                  <div className="pt-3 border-t border-gray-100">
                    <a
                      href={`/${biz.tenantSlug}/admin`}
                      className="block w-full py-2 text-center text-sm font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: `${biz.primaryColor}18`,
                        color: biz.primaryColor,
                      }}
                    >
                      כניסה לדשבורד
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
