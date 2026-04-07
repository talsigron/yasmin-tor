'use client';

import { useEffect, useRef } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import {
  isNotificationEnabled,
  notifyNewAppointment,
  notifyNewCustomer,
} from '@/lib/notifications';

export function useRealtimeNotifications(enabled: boolean = true) {
  const { supabase } = useTenant();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!enabled || !isNotificationEnabled()) return;

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments' },
        (payload) => {
          const record = payload.new;
          if (record) {
            notifyNewAppointment(
              record.customer_name as string,
              record.service_name as string,
              `${record.date} ${record.time}`
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'customers' },
        (payload) => {
          const record = payload.new;
          if (record) {
            notifyNewCustomer(record.full_name as string);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [enabled, supabase]);
}
