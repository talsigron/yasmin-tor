'use client';

import { useState, useEffect } from 'react';
import { fetchAdminPassword } from '@/lib/supabase-store';
import { useTenant } from '@/contexts/TenantContext';
import AdminDashboard from './AdminDashboard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminPageContent() {
  const { supabase, config } = useTenant();
  const { businessId, id: tenantId, slug, defaultColors } = config;
  const sessionKey = `${tenantId}_admin_session`;
  const brandPrimary = defaultColors.primary;

  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = typeof window !== 'undefined' && localStorage.getItem(sessionKey);
    if (session === 'true') setLoggedIn(true);
    setChecking(false);
  }, [sessionKey]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const correctPassword = await fetchAdminPassword(supabase, businessId);
      if (password === correctPassword) {
        localStorage.setItem(sessionKey, 'true');
        setLoggedIn(true);
        setError('');
      } else {
        setError('סיסמה שגויה');
      }
    } catch {
      setError('שגיאה בבדיקת סיסמה');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(sessionKey);
    setLoggedIn(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 animate-spin"
          style={{ borderTopColor: brandPrimary }} />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5"
        style={{ background: `linear-gradient(to bottom, ${brandPrimary}10, white)` }}>
        <div className="w-full max-w-sm animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">לוח בקרה</h1>
            <p className="text-sm text-gray-500">כניסה לניהול</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="סיסמה" value={password}
                onChange={(e) => setPassword(e.target.value)} error={error}
                icon={<Lock size={18} />} autoFocus autoComplete="current-password" name="password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" variant="primary" className="w-full" size="lg">כניסה</Button>
          </form>
          <div className="text-center mt-5">
            <a
              href={`https://wa.me/972504558444?text=${encodeURIComponent(`שלום טל, שכחתי את הסיסמה לדשבורד של ${slug}`)}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-400 hover:underline"
            >
              שכחתי סיסמה
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
