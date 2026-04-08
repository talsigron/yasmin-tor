'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Service,
  Appointment,
  DayAvailability,
  TimeSlot,
  BusinessProfile,
  Customer,
} from '@/lib/types';
import {
  fetchServices,
  createService,
  updateServiceById,
  deleteServiceById,
  reorderServices,
  fetchProfile,
  updateProfileData,
  fetchAutoApproveSetting,
  fetchCustomers,
  registerNewCustomer,
  approveCustomerById,
  rejectCustomerById,
  fetchPendingCustomers,
  fetchAppointments,
  createAppointment,
  updateAppointmentById,
  fetchAvailability,
  updateAvailabilityDay,
  fetchDefaultHours,
  saveDefaultHoursData,
  fetchGalleryImages,
  addGalleryImage,
  removeGalleryImage,
  reorderGalleryImages,
  GalleryImage,
  DefaultHoursEntry,
  CustomerExtendedFields,
} from '@/lib/supabase-store';
import { useTenant } from '@/contexts/TenantContext';

// ─── useServices ──────────────────────────────────────────

export function useServices() {
  const { supabase, config } = useTenant();
  const { businessId } = config;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchServices(supabase, businessId);
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, businessId]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(
    async (service: Omit<Service, 'id' | 'order'>) => {
      const created = await createService(supabase, businessId, service);
      setServices((prev) => [...prev, created]);
      return created;
    },
    [supabase, businessId]
  );

  const update = useCallback(
    async (id: string, updates: Partial<Service>) => {
      await updateServiceById(supabase, businessId, id, updates);
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    },
    [supabase, businessId]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteServiceById(supabase, businessId, id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    },
    [supabase, businessId]
  );

  const reorder = useCallback(
    async (orderedServices: { id: string; order: number }[]) => {
      await reorderServices(supabase, businessId, orderedServices);
      setServices((prev) => {
        const map = new Map(orderedServices.map((s) => [s.id, s.order]));
        return [...prev]
          .map((s) => ({ ...s, order: map.get(s.id) ?? s.order }))
          .sort((a, b) => a.order - b.order);
      });
    },
    [supabase, businessId]
  );

  return { services, loading, refresh, add, update, remove, reorder };
}

// ─── useProfile ───────────────────────────────────────────

export function useProfile() {
  const { supabase, config } = useTenant();
  const { businessId } = config;
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProfile(supabase, businessId);
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, businessId]);

  useEffect(() => { refresh(); }, [refresh]);

  const update = useCallback(
    async (updates: Partial<BusinessProfile>) => {
      await updateProfileData(supabase, businessId, updates);
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    [supabase, businessId]
  );

  return { profile, loading, refresh, update };
}

// ─── useBusinessSettings ──────────────────────────────────

export function useBusinessSettings() {
  const { supabase, config } = useTenant();
  const { businessId, features } = config;
  const [dbAutoApprove, setDbAutoApprove] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutoApproveSetting(supabase, businessId).then((val) => {
      setDbAutoApprove(val);
      setLoading(false);
    });
  }, [supabase, businessId]);

  const autoApprove = dbAutoApprove !== null ? dbAutoApprove : features.autoApprove;

  const toggleAutoApprove = useCallback(
    async (value: boolean) => {
      await updateProfileData(supabase, businessId, { autoApprove: value });
      setDbAutoApprove(value);
    },
    [supabase, businessId]
  );

  return { autoApprove, loading, toggleAutoApprove };
}

// ─── useCustomers ─────────────────────────────────────────

export function useCustomers() {
  const { supabase, config } = useTenant();
  const { businessId, features } = config;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pending, setPending] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [all, pend] = await Promise.all([
        fetchCustomers(supabase, businessId),
        fetchPendingCustomers(supabase, businessId),
      ]);
      setCustomers(all);
      setPending(pend);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, businessId]);

  useEffect(() => { refresh(); }, [refresh]);

  const register = useCallback(
    async (name: string, phone: string, notificationEnabled = false, extended?: CustomerExtendedFields) => {
      const dbVal = await fetchAutoApproveSetting(supabase, businessId);
      const effectiveAutoApprove = dbVal !== null ? dbVal : features.autoApprove;
      const customer = await registerNewCustomer(
        supabase, businessId, name, phone, notificationEnabled, effectiveAutoApprove, extended
      );
      await refresh();
      return customer;
    },
    [supabase, businessId, features.autoApprove, refresh]
  );

  const approve = useCallback(
    async (id: string) => {
      await approveCustomerById(supabase, businessId, id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'approved' as const } : c)));
      setPending((prev) => prev.filter((c) => c.id !== id));
    },
    [supabase, businessId]
  );

  const reject = useCallback(
    async (id: string) => {
      await rejectCustomerById(supabase, businessId, id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'rejected' as const } : c)));
      setPending((prev) => prev.filter((c) => c.id !== id));
    },
    [supabase, businessId]
  );

  return { customers, pending, loading, refresh, register, approve, reject };
}

// ─── useAppointments ──────────────────────────────────────

export function useAppointments() {
  const { supabase, config } = useTenant();
  const { businessId } = config;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments(supabase, businessId);
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, businessId]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(
    async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
      const created = await createAppointment(supabase, businessId, appointment);
      setAppointments((prev) => [...prev, created]);
      return created;
    },
    [supabase, businessId]
  );

  const update = useCallback(
    async (id: string, updates: Partial<Appointment>) => {
      await updateAppointmentById(supabase, businessId, id, updates);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    },
    [supabase, businessId]
  );

  return { appointments, loading, refresh, add, update };
}

// ─── useAvailability ──────────────────────────────────────

export function useAvailability(numDays: number = 14) {
  const { supabase, config } = useTenant();
  const { businessId } = config;
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAvailability(supabase, businessId, numDays);
      setAvailability(data);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, businessId, numDays]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateDay = useCallback(
    async (date: string, update: Partial<DayAvailability>) => {
      await updateAvailabilityDay(supabase, businessId, date, update);
      setAvailability((prev) => prev.map((d) => (d.date === date ? { ...d, ...update } : d)));
    },
    [supabase, businessId]
  );

  return { availability, loading, refresh, updateDay };
}

// ─── useDefaultHours ──────────────────────────────────────

export function useDefaultHours() {
  const { supabase, config } = useTenant();
  const { businessId } = config;
  const [hours, setHours] = useState<DefaultHoursEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDefaultHours(supabase, businessId);
      setHours(data);
    } catch (err) {
      console.error('Failed to fetch default hours:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, businessId]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(
    async (newHours: DefaultHoursEntry[]) => {
      await saveDefaultHoursData(supabase, businessId, newHours);
      setHours(newHours);
    },
    [supabase, businessId]
  );

  return { hours, loading, refresh, save };
}

// ─── useGallery ───────────────────────────────────────────

export function useGallery() {
  const { supabase, config } = useTenant();
  const { businessId } = config;
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGalleryImages(supabase, businessId);
      setImages(data);
    } catch (err) {
      console.error('Failed to fetch gallery images:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, businessId]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(
    async (url: string) => {
      const image = await addGalleryImage(supabase, businessId, url);
      setImages((prev) => [image, ...prev]);
      return image;
    },
    [supabase, businessId]
  );

  const remove = useCallback(
    async (id: string) => {
      await removeGalleryImage(supabase, businessId, id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    },
    [supabase, businessId]
  );

  const reorder = useCallback(
    async (fromIndex: number, toIndex: number) => {
      setImages((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        reorderGalleryImages(supabase, updated.map((img) => img.id)).catch(console.error);
        return updated;
      });
    },
    [supabase]
  );

  return { images, loading, refresh, add, remove, reorder };
}
