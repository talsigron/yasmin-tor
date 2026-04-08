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
  ClipboardList,
  CheckCircle,
  XCircle,
  MessageCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const SUPER_ADMIN_PASSWORD = 'yasmin2024';
const SESSION_KEY = 'yasmin_super_admin_session';

type CategoryFilter = 'all' | 'fitness' | 'nails';
type MainTab = 'businesses' | 'registrations';

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

interface Registration {
  id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  category: string;
  status: string;
  terms_accepted: boolean;
  notes: string | null;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  nails: 'ציפורניים / ביוטי',
  fitness: 'כושר / פילאטיס / יוגה',
  hair: 'תספורת / שיער',
  spa: 'ספא / טיפולי פנים',
  other: 'אחר',
};

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

async function fetchRegistrations(): Promise<Registration[]> {
  const db = getAdminSupabase();
  const { data, error } = await db
    .from('business_registrations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function updateRegistrationStatus(id: string, status: string) {
  const db = getAdminSupabase();
  const { error } = await db
    .from('business_registrations')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: 'ממתין', bg: '#fef9c3', color: '#854d0e' },
    approved: { label: 'אושר', bg: '#dcfce7', color: '#166534' },
    rejected: { label: 'נדחה', bg: '#fee2e2', color: '#991b1b' },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export default function SuperAdminContent() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<BusinessWithStats[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [mainTab, setMainTab] = useState<MainTab>('businesses');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session === 'true') setAuthenticated(true);
    setLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [bizData, regData] = await Promise.all([
        fetchAllBusinessStats(),
        fetchRegistrations(),
      ]);
      setBusinesses(bizData);
      setRegistrations(regData);
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
    setRegistrations([]);
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateRegistrationStatus(id, status);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprove = async (reg: Registration) => {
    setUpdatingId(reg.id);
    try {
      const res = await fetch('/api/approve-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: reg.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? 'שגיאה באישור');
        return;
      }

      // Update local state
      setRegistrations((prev) =>
        prev.map((r) => (r.id === reg.id ? { ...r, status: 'approved' } : r))
      );

      // Open WhatsApp with REAL slug + password
      openWhatsApp(reg, data.slug, data.password);
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('שגיאה באישור העסק');
    } finally {
      setUpdatingId(null);
    }
  };

  const openWhatsApp = (reg: Registration, slug?: string, password?: string) => {
    const categoryLabel = CATEGORY_LABELS[reg.category] ?? reg.category;
    const link = slug ? `yasmin-tor.vercel.app/${slug}/admin` : '[SLUG]';
    const pass = password ?? '[PASSWORD]';
    const msg = encodeURIComponent(
      `שלום ${reg.owner_name}!\n` +
        `קיבלתי את פנייתך ל-יסמין תור.\n` +
        `שם העסק: ${reg.business_name} (${categoryLabel})\n\n` +
        `המערכת שלך מוכנה! הנה הפרטים:\n` +
        `לינק לדשבורד: ${link}\n` +
        `סיסמה ראשונית: ${pass}\n\n` +
        `עכשיו נכנסים ללינק, מגדירים שירותים ושעות פעילות, ומתחילים לקבל תורים.\n\n` +
        `המחיר: 50 ₪/חודש (חודש ראשון חינם)\n` +
        `לכל שאלה — אני כאן`
    );
    window.open(`https://wa.me/972${reg.phone.replace(/[-\s]/g, '')}?text=${msg}`, '_blank');
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
  const pendingCount = registrations.filter((r) => r.status === 'pending').length;

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

          <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-6 shadow-xl" autoComplete="on">
            <label className="block text-sm font-medium text-gray-300 mb-2">סיסמת מנהל</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="super-admin-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors pl-11"
                placeholder="הכנס סיסמה"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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

      {/* Main tab switcher */}
      <div className="max-w-4xl mx-auto px-4 pt-5">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMainTab('businesses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              mainTab === 'businesses'
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Building2 size={16} />
            עסקים ({businesses.length})
          </button>
          <button
            onClick={() => setMainTab('registrations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer relative ${
              mainTab === 'registrations'
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ClipboardList size={16} />
            פניות הרשמה ({registrations.length})
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* ── BUSINESSES TAB ── */}
        {mainTab === 'businesses' && (
          <>
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
              <div className="space-y-3 pb-8">
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
          </>
        )}

        {/* ── REGISTRATIONS TAB ── */}
        {mainTab === 'registrations' && (
          <div className="pb-8">
            {refreshing && registrations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-[3px] border-yellow-200 border-t-yellow-500 animate-spin" />
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <ClipboardList size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">אין פניות עדיין</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{reg.business_name}</h3>
                        <p className="text-sm text-gray-500">{reg.owner_name}</p>
                      </div>
                      <StatusBadge status={reg.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400" />
                        <span dir="ltr">{reg.phone}</span>
                      </span>
                      <span>{CATEGORY_LABELS[reg.category] ?? reg.category}</span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock size={11} />
                        {formatDate(reg.created_at)}
                      </span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {/* WhatsApp — always shown */}
                      <button
                        onClick={() => openWhatsApp(reg)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
                        style={{ background: '#25D366' }}
                      >
                        <MessageCircle size={14} />
                        שלח וואטסאפ
                      </button>

                      {reg.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(reg)}
                            disabled={updatingId === reg.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                            {updatingId === reg.id ? 'יוצר עסק...' : 'אשר + צור עסק'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(reg.id, 'rejected')}
                            disabled={updatingId === reg.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            דחה
                          </button>
                        </>
                      )}

                      {reg.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(reg.id, 'pending')}
                          disabled={updatingId === reg.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 text-xs"
                        >
                          בטל אישור
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
