'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Scissors, Clock, LogOut, Home, Settings, Users, Edit3, Bell, BellOff, CreditCard, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchPendingCustomers } from '@/lib/supabase-store';
import { useTenant } from '@/contexts/TenantContext';
import { useProfile } from '@/hooks/useSupabase';
import {
  isNotificationSupported, isNotificationEnabled,
  requestNotificationPermission, disableNotifications, getNotificationPermission,
} from '@/lib/notifications';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import AppointmentsView from './AppointmentsView';
import ServicesManager from './ServicesManager';
import ScheduleManager from './ScheduleManager';
import ProfileEditor from './ProfileEditor';
import CustomersView from './CustomersView';
import PunchCardsManager from './PunchCardsManager';
import ShopManager from './ShopManager';
import Link from 'next/link';
import TenantHead from '@/components/TenantHead';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'appointments' | 'services' | 'schedule' | 'customers' | 'profile' | 'punch-cards' | 'shop';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { supabase, config } = useTenant();
  const { businessId, labels, slug, defaultColors } = config;
  const brandPrimary = defaultColors.primary;
  const { profile } = useProfile();

  const tabs: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'appointments', label: labels.calendar.replace('יומן ', ''), icon: Calendar },
    { key: 'services', label: labels.services.replace('ה', ''), icon: Scissors },
    { key: 'schedule', label: 'לו"ז', icon: Clock },
    { key: 'customers', label: labels.customers, icon: Users },
    { key: 'punch-cards', label: 'כרטיסיות', icon: CreditCard },
    { key: 'shop', label: 'חנות', icon: ShoppingBag },
    { key: 'profile', label: 'עריכה', icon: Edit3 },
  ];

  const tabStorageKey = `${config.id}_admin_tab`;
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'appointments';
    const stored = localStorage.getItem(tabStorageKey);
    return (stored as Tab) || 'appointments';
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem(tabStorageKey, tab);
  };
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationsOn, setNotificationsOn] = useState(false);

  const tenantId = config.id;
  useEffect(() => { setNotificationsOn(isNotificationEnabled(tenantId)); }, [tenantId]);
  useRealtimeNotifications(notificationsOn);

  const toggleNotifications = useCallback(async () => {
    if (notificationsOn) {
      disableNotifications(tenantId);
      setNotificationsOn(false);
    } else {
      const granted = await requestNotificationPermission(tenantId);
      setNotificationsOn(granted);
      if (!granted && getNotificationPermission() === 'denied') {
        alert('ההתראות חסומות בדפדפן. יש לאפשר התראות בהגדרות הדפדפן');
      }
    }
  }, [notificationsOn, tenantId]);

  useEffect(() => {
    const update = async () => {
      try {
        const pending = await fetchPendingCustomers(supabase, businessId);
        setPendingCount(pending.length);
      } catch { /* ignore */ }
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [supabase, businessId]);

  return (
    <>
    <TenantHead />
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-sm font-bold text-gray-800">ניהול</span>
              <span className="text-[10px] text-gray-400 block">{profile?.name || ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isNotificationSupported() && (
              <button onClick={toggleNotifications}
                className="p-2.5 rounded-xl transition-all active:scale-90 cursor-pointer"
                style={{ backgroundColor: notificationsOn ? `${brandPrimary}15` : undefined, color: notificationsOn ? brandPrimary : '#9CA3AF' }}
                title={notificationsOn ? 'התראות פעילות' : 'הפעל התראות'}>
                {notificationsOn ? <Bell size={20} /> : <BellOff size={20} />}
              </button>
            )}
            <Link href={`/${slug}`} className="p-2.5 rounded-xl hover:bg-gray-100 transition-all active:scale-90 text-gray-400 hover:text-gray-600">
              <Home size={20} />
            </Link>
            <button onClick={onLogout} className="p-2.5 rounded-xl hover:bg-gray-100 transition-all active:scale-90 text-gray-400 hover:text-gray-600 cursor-pointer">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 pt-4">
        {activeTab === 'appointments' && <AppointmentsView />}
        {activeTab === 'services' && <ServicesManager />}
        {activeTab === 'schedule' && <ScheduleManager />}
        {activeTab === 'customers' && <CustomersView />}
        {activeTab === 'punch-cards' && <PunchCardsManager />}
        {activeTab === 'shop' && <ShopManager />}
        {activeTab === 'profile' && <ProfileEditor />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                className="flex-1 flex flex-col items-center gap-1 py-4 transition-all active:scale-90 cursor-pointer relative"
                style={{ color: isActive ? brandPrimary : '#9CA3AF' }}>
                <div className="relative">
                  <Icon size={22} />
                  {tab.key === 'customers' && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-0.5 rounded-full" style={{ backgroundColor: brandPrimary }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
    </>
  );
}
