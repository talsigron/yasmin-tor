import type { SupabaseClient } from '@supabase/supabase-js';
import {
  Service,
  Appointment,
  DayAvailability,
  TimeSlot,
  BusinessProfile,
  Customer,
} from './types';

// ─── Helpers ──────────────────────────────────────────────

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Services ─────────────────────────────────────────────

export async function fetchServices(db: SupabaseClient, businessId: string): Promise<Service[]> {
  const { data, error } = await db
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    duration: row.duration,
    description: row.description ?? '',
    image: row.image ?? undefined,
    order: row.sort_order ?? 0,
    active: row.active ?? true,
    showPrice: row.show_price ?? undefined,
    showDuration: row.show_duration ?? undefined,
  }));
}

export async function createService(
  db: SupabaseClient,
  businessId: string,
  service: Omit<Service, 'id' | 'order'>
): Promise<Service> {
  const { data: existing } = await db
    .from('services')
    .select('sort_order')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 1;

  const { data, error } = await db
    .from('services')
    .insert({
      business_id: businessId,
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description,
      image: service.image ?? null,
      sort_order: nextOrder,
      active: service.active,
      show_price: service.showPrice ?? null,
      show_duration: service.showDuration ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    price: data.price,
    duration: data.duration,
    description: data.description ?? '',
    image: data.image ?? undefined,
    order: data.sort_order ?? 0,
    active: data.active ?? true,
    showPrice: data.show_price ?? undefined,
    showDuration: data.show_duration ?? undefined,
  };
}

export async function updateServiceById(
  db: SupabaseClient,
  businessId: string,
  id: string,
  updates: Partial<Service>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.price !== undefined) row.price = updates.price;
  if (updates.duration !== undefined) row.duration = updates.duration;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.image !== undefined) row.image = updates.image;
  if (updates.order !== undefined) row.sort_order = updates.order;
  if (updates.active !== undefined) row.active = updates.active;
  if (updates.showPrice !== undefined) row.show_price = updates.showPrice;
  if (updates.showDuration !== undefined) row.show_duration = updates.showDuration;

  const { error } = await db
    .from('services')
    .update(row)
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) throw error;
}

export async function deleteServiceById(db: SupabaseClient, businessId: string, id: string): Promise<void> {
  const { error } = await db
    .from('services')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) throw error;
}

export async function reorderServices(
  db: SupabaseClient,
  businessId: string,
  services: { id: string; order: number }[]
): Promise<void> {
  const updates = services.map((s) =>
    db
      .from('services')
      .update({ sort_order: s.order })
      .eq('id', s.id)
      .eq('business_id', businessId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

// ─── Profile ──────────────────────────────────────────────

export async function fetchProfile(db: SupabaseClient, businessId: string): Promise<BusinessProfile> {
  const { data, error } = await db
    .from('business_profiles')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error) throw error;

  return {
    name: data.name ?? '',
    subtitle: data.subtitle ?? undefined,
    brands: data.brands ?? undefined,
    logo: data.logo ?? undefined,
    description: data.description ?? '',
    phone: data.phone ?? '',
    instagram: data.instagram ?? '',
    address: data.address ?? '',
    images: data.images ?? [],
    enableBit: data.enable_bit ?? false,
    bitType: data.bit_type ?? 'regular',
    bitLink: data.bit_link ?? undefined,
    enablePaybox: data.enable_paybox ?? false,
    payboxLink: data.paybox_link ?? undefined,
    brandColors: data.brand_colors ?? undefined,
    maxBookingDays: data.max_booking_days ?? 30,
    cancelPolicy: data.cancel_policy ?? 'whatsapp',
    maxActiveBookings: data.max_active_bookings ?? 1,
    autoApprove: data.auto_approve ?? null,
    minHoursBeforeBooking: data.min_hours_before_booking ?? null,
    requireHealthDeclaration: data.require_health_declaration ?? false,
  };
}

export async function updateProfileData(
  db: SupabaseClient,
  businessId: string,
  updates: Partial<BusinessProfile>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.subtitle !== undefined) row.subtitle = updates.subtitle;
  if (updates.brands !== undefined) row.brands = updates.brands;
  if (updates.logo !== undefined) row.logo = updates.logo;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.instagram !== undefined) row.instagram = updates.instagram;
  if (updates.address !== undefined) row.address = updates.address;
  if (updates.enableBit !== undefined) row.enable_bit = updates.enableBit;
  if (updates.bitType !== undefined) row.bit_type = updates.bitType;
  if (updates.bitLink !== undefined) row.bit_link = updates.bitLink;
  if (updates.enablePaybox !== undefined) row.enable_paybox = updates.enablePaybox;
  if (updates.payboxLink !== undefined) row.paybox_link = updates.payboxLink;
  if (updates.brandColors !== undefined) row.brand_colors = updates.brandColors;
  if (updates.maxBookingDays !== undefined) row.max_booking_days = updates.maxBookingDays;
  if (updates.cancelPolicy !== undefined) row.cancel_policy = updates.cancelPolicy;
  if (updates.maxActiveBookings !== undefined) row.max_active_bookings = updates.maxActiveBookings;
  if (updates.autoApprove !== undefined) row.auto_approve = updates.autoApprove;
  if (updates.minHoursBeforeBooking !== undefined) row.min_hours_before_booking = updates.minHoursBeforeBooking;
  if (updates.requireHealthDeclaration !== undefined) row.require_health_declaration = updates.requireHealthDeclaration;

  const { error } = await db
    .from('business_profiles')
    .update(row)
    .eq('id', businessId);

  if (error) throw error;
}

export async function fetchAutoApproveSetting(db: SupabaseClient, businessId: string): Promise<boolean | null> {
  const { data, error } = await db
    .from('business_profiles')
    .select('auto_approve')
    .eq('id', businessId)
    .single();

  if (error) return null;
  return data.auto_approve ?? null;
}

// ─── Admin Password ───────────────────────────────────────

export async function fetchAdminPassword(db: SupabaseClient, businessId: string): Promise<string> {
  const { data, error } = await db
    .from('business_profiles')
    .select('admin_password')
    .eq('id', businessId)
    .single();

  if (error) throw error;
  return data.admin_password ?? 'admin2024';
}

export async function saveAdminPassword(db: SupabaseClient, businessId: string, password: string): Promise<void> {
  const { error } = await db
    .from('business_profiles')
    .update({ admin_password: password })
    .eq('id', businessId);

  if (error) throw error;
}

// ─── Customers ────────────────────────────────────────────

export async function fetchCustomers(db: SupabaseClient, businessId: string): Promise<Customer[]> {
  const { data, error } = await db
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => mapCustomerRow(row));
}

function mapCustomerRow(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    fullName: (row.full_name as string) ?? '',
    phone: (row.phone as string) ?? '',
    status: (row.status as Customer['status']) ?? 'pending',
    notificationEnabled: (row.notification_enabled as boolean) ?? false,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    dateOfBirth: (row.date_of_birth as string) ?? null,
    idNumber: (row.id_number as string) ?? null,
    gender: (row.gender as Customer['gender']) ?? null,
    paymentMethod: (row.payment_method as Customer['paymentMethod']) ?? null,
    healthDeclarationUrl: (row.health_declaration_url as string) ?? null,
  };
}

export interface CustomerExtendedFields {
  dateOfBirth?: string | null;
  idNumber?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  paymentMethod?: 'cash' | 'bit' | 'bank_transfer' | 'check' | null;
  healthDeclarationUrl?: string | null;
}

export async function registerNewCustomer(
  db: SupabaseClient,
  businessId: string,
  name: string,
  phone: string,
  notificationEnabled: boolean = false,
  autoApprove: boolean = false,
  extended?: CustomerExtendedFields
): Promise<Customer> {
  const { data: existing } = await db
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .limit(1);

  if (existing && existing.length > 0) {
    const row = existing[0];
    const updates: Record<string, unknown> = {};
    if (notificationEnabled && !row.notification_enabled) updates.notification_enabled = true;
    if (extended?.dateOfBirth) updates.date_of_birth = extended.dateOfBirth;
    if (extended?.idNumber) updates.id_number = extended.idNumber;
    if (extended?.gender) updates.gender = extended.gender;
    if (extended?.paymentMethod) updates.payment_method = extended.paymentMethod;
    if (extended?.healthDeclarationUrl) updates.health_declaration_url = extended.healthDeclarationUrl;

    if (Object.keys(updates).length > 0) {
      await db.from('customers').update(updates).eq('id', row.id);
    }
    return mapCustomerRow({ ...row, ...updates, notification_enabled: notificationEnabled || row.notification_enabled });
  }

  const insertRow: Record<string, unknown> = {
    business_id: businessId,
    full_name: name,
    phone,
    status: autoApprove ? 'approved' : 'pending',
    notification_enabled: notificationEnabled,
  };
  if (extended?.dateOfBirth) insertRow.date_of_birth = extended.dateOfBirth;
  if (extended?.idNumber) insertRow.id_number = extended.idNumber;
  if (extended?.gender) insertRow.gender = extended.gender;
  if (extended?.paymentMethod) insertRow.payment_method = extended.paymentMethod;
  if (extended?.healthDeclarationUrl) insertRow.health_declaration_url = extended.healthDeclarationUrl;

  const { data, error } = await db
    .from('customers')
    .insert(insertRow)
    .select()
    .single();

  if (error) throw error;

  return mapCustomerRow(data);
}

export async function checkCustomerStatus(db: SupabaseClient, businessId: string, phone: string): Promise<string | null> {
  const { data } = await db
    .from('customers')
    .select('status')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .limit(1);
  if (data && data.length > 0) return data[0].status;
  return null;
}

export async function approveCustomerById(db: SupabaseClient, businessId: string, id: string): Promise<void> {
  const { error } = await db
    .from('customers')
    .update({ status: 'approved' })
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) throw error;
}

export async function rejectCustomerById(db: SupabaseClient, businessId: string, id: string): Promise<void> {
  const { error } = await db
    .from('customers')
    .update({ status: 'rejected' })
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) throw error;
}

export async function fetchPendingCustomers(db: SupabaseClient, businessId: string): Promise<Customer[]> {
  const { data, error } = await db
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => mapCustomerRow(row));
}

export async function fetchCustomerById(db: SupabaseClient, businessId: string, customerId: string): Promise<Customer | null> {
  const { data, error } = await db
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .eq('business_id', businessId)
    .single();

  if (error || !data) return null;
  return mapCustomerRow(data);
}

export async function updateCustomerProfile(
  db: SupabaseClient,
  businessId: string,
  customerId: string,
  updates: CustomerExtendedFields
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.dateOfBirth !== undefined) row.date_of_birth = updates.dateOfBirth;
  if (updates.idNumber !== undefined) row.id_number = updates.idNumber;
  if (updates.gender !== undefined) row.gender = updates.gender;
  if (updates.paymentMethod !== undefined) row.payment_method = updates.paymentMethod;
  if (updates.healthDeclarationUrl !== undefined) row.health_declaration_url = updates.healthDeclarationUrl;

  const { error } = await db
    .from('customers')
    .update(row)
    .eq('id', customerId)
    .eq('business_id', businessId);

  if (error) throw error;
}

export async function uploadHealthDeclaration(db: SupabaseClient, businessId: string, customerId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `health-declarations/${businessId}/${customerId}/${Date.now()}.${ext}`;

  const { error } = await db.storage
    .from('images')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = db.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Appointments ─────────────────────────────────────────

export async function fetchAppointments(db: SupabaseClient, businessId: string): Promise<Appointment[]> {
  const { data, error } = await db
    .from('appointments')
    .select('*')
    .eq('business_id', businessId)
    .order('date', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    customerId: row.customer_id ?? '',
    customerName: row.customer_name ?? '',
    customerPhone: row.customer_phone ?? '',
    serviceId: row.service_id ?? '',
    serviceName: row.service_name ?? '',
    date: row.date ?? '',
    time: row.time ?? '',
    duration: row.duration ?? 0,
    status: row.status ?? 'confirmed',
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
}

export async function createAppointment(
  db: SupabaseClient,
  businessId: string,
  appointment: Omit<Appointment, 'id' | 'createdAt'>
): Promise<Appointment> {
  const { data: customer } = await db
    .from('customers')
    .select('status')
    .eq('id', appointment.customerId)
    .eq('business_id', businessId)
    .single();

  if (customer && customer.status !== 'approved') {
    throw new Error('CUSTOMER_NOT_APPROVED');
  }

  const { data: existing } = await db
    .from('appointments')
    .select('time, duration')
    .eq('business_id', businessId)
    .eq('date', appointment.date)
    .neq('status', 'cancelled');

  if (existing && existing.length > 0) {
    const [h, m] = appointment.time.split(':').map(Number);
    const newStart = h * 60 + m;
    const newEnd = newStart + appointment.duration;

    const conflict = existing.some((a) => {
      const [ah, am] = (a.time as string).split(':').map(Number);
      const aStart = ah * 60 + am;
      const aEnd = aStart + (a.duration as number);
      return newStart < aEnd && newEnd > aStart;
    });

    if (conflict) {
      throw new Error('DOUBLE_BOOKED');
    }
  }

  const { data, error } = await db
    .from('appointments')
    .insert({
      business_id: businessId,
      customer_id: appointment.customerId,
      customer_name: appointment.customerName,
      customer_phone: appointment.customerPhone,
      service_id: appointment.serviceId,
      service_name: appointment.serviceName,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      status: appointment.status,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    customerId: data.customer_id ?? '',
    customerName: data.customer_name ?? '',
    customerPhone: data.customer_phone ?? '',
    serviceId: data.service_id ?? '',
    serviceName: data.service_name ?? '',
    date: data.date ?? '',
    time: data.time ?? '',
    duration: data.duration ?? 0,
    status: data.status ?? 'confirmed',
    createdAt: data.created_at ?? new Date().toISOString(),
  };
}

export async function fetchCustomerAppointments(
  db: SupabaseClient,
  businessId: string,
  customerIdOrPhone: string
): Promise<Appointment[]> {
  let query = db
    .from('appointments')
    .select('*')
    .eq('business_id', businessId)
    .neq('status', 'cancelled')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (customerIdOrPhone.includes('-')) {
    query = query.eq('customer_id', customerIdOrPhone);
  } else {
    query = query.eq('customer_phone', customerIdOrPhone);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    customerId: row.customer_id ?? '',
    customerName: row.customer_name ?? '',
    customerPhone: row.customer_phone ?? '',
    serviceId: row.service_id ?? '',
    serviceName: row.service_name ?? '',
    date: row.date ?? '',
    time: row.time ?? '',
    duration: row.duration ?? 0,
    status: row.status ?? 'confirmed',
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
}

export async function cancelAppointmentByCustomer(
  db: SupabaseClient,
  businessId: string,
  appointmentId: string,
  customerId: string
): Promise<void> {
  const { error } = await db
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .eq('customer_id', customerId)
    .eq('business_id', businessId);

  if (error) throw error;
}

export async function updateAppointmentById(
  db: SupabaseClient,
  businessId: string,
  id: string,
  updates: Partial<Appointment>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.customerName !== undefined) row.customer_name = updates.customerName;
  if (updates.customerPhone !== undefined) row.customer_phone = updates.customerPhone;
  if (updates.serviceId !== undefined) row.service_id = updates.serviceId;
  if (updates.serviceName !== undefined) row.service_name = updates.serviceName;
  if (updates.date !== undefined) row.date = updates.date;
  if (updates.time !== undefined) row.time = updates.time;
  if (updates.duration !== undefined) row.duration = updates.duration;
  if (updates.status !== undefined) row.status = updates.status;

  const { error } = await db
    .from('appointments')
    .update(row)
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) throw error;
}

// ─── Availability ─────────────────────────────────────────

export async function fetchAvailability(
  db: SupabaseClient,
  businessId: string,
  numDays: number = 14
): Promise<DayAvailability[]> {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + numDays - 1);

  const startStr = toDateStr(today);
  const endStr = toDateStr(endDate);

  const { data: overrides, error } = await db
    .from('availability')
    .select('*')
    .eq('business_id', businessId)
    .gte('date', startStr)
    .lte('date', endStr);

  if (error) throw error;

  const { data: defaults } = await db
    .from('default_hours')
    .select('*')
    .eq('business_id', businessId);

  const overrideMap = new Map(
    (overrides ?? []).map((row) => [row.date as string, row])
  );

  const defaultMap = new Map(
    (defaults ?? []).map((row) => [row.day_of_week as number, row])
  );

  const result: DayAvailability[] = [];

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = toDateStr(date);
    const dayOfWeek = date.getDay();

    const override = overrideMap.get(dateStr);
    if (override) {
      result.push({
        date: dateStr,
        isWorking: override.is_working ?? true,
        slots: (override.slots as TimeSlot[]) ?? [],
      });
    } else {
      const def = defaultMap.get(dayOfWeek);
      if (def) {
        result.push({
          date: dateStr,
          isWorking: def.is_working ?? true,
          slots: (def.slots as TimeSlot[]) ?? [],
        });
      } else {
        const isWorking = dayOfWeek !== 5 && dayOfWeek !== 6;
        result.push({
          date: dateStr,
          isWorking,
          slots: isWorking ? [{ start: '09:00', end: '15:00' }] : [],
        });
      }
    }
  }

  return result;
}

export async function updateAvailabilityDay(
  db: SupabaseClient,
  businessId: string,
  date: string,
  update: Partial<DayAvailability>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (update.isWorking !== undefined) row.is_working = update.isWorking;
  if (update.slots !== undefined) row.slots = update.slots;

  const { error } = await db
    .from('availability')
    .upsert(
      { business_id: businessId, date, ...row },
      { onConflict: 'business_id,date' }
    );

  if (error) throw error;
}

// ─── Default Hours ────────────────────────────────────────

export interface DefaultHoursEntry {
  dayOfWeek: number;
  isWorking: boolean;
  slots: TimeSlot[];
}

export async function fetchDefaultHours(db: SupabaseClient, businessId: string): Promise<DefaultHoursEntry[]> {
  const { data, error } = await db
    .from('default_hours')
    .select('*')
    .eq('business_id', businessId)
    .order('day_of_week', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    dayOfWeek: row.day_of_week as number,
    isWorking: (row.is_working as boolean) ?? true,
    slots: (row.slots as TimeSlot[]) ?? [],
  }));
}

export async function saveDefaultHoursData(
  db: SupabaseClient,
  businessId: string,
  hours: DefaultHoursEntry[]
): Promise<void> {
  const rows = hours.map((h) => ({
    business_id: businessId,
    day_of_week: h.dayOfWeek,
    is_working: h.isWorking,
    slots: h.slots,
  }));

  const { error } = await db
    .from('default_hours')
    .upsert(rows, { onConflict: 'business_id,day_of_week' });

  if (error) throw error;
}

// ─── Gallery ──────────────────────────────────────────────

export interface GalleryImage {
  id: string;
  url: string;
  createdAt: string;
}

export async function fetchGalleryImages(db: SupabaseClient, businessId: string): Promise<GalleryImage[]> {
  const { data, error } = await db
    .from('gallery_images')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    url: row.url as string,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  }));
}

export async function addGalleryImage(db: SupabaseClient, businessId: string, url: string): Promise<GalleryImage> {
  const { data, error } = await db
    .from('gallery_images')
    .insert({ business_id: businessId, url })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id as string,
    url: data.url as string,
    createdAt: (data.created_at as string) ?? new Date().toISOString(),
  };
}

export async function removeGalleryImage(db: SupabaseClient, businessId: string, id: string): Promise<void> {
  const { error } = await db
    .from('gallery_images')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) throw error;
}

export async function reorderGalleryImages(db: SupabaseClient, orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .from('gallery_images')
      .update({ sort_order: i })
      .eq('id', orderedIds[i]);
  }
}

// ─── Image Upload ─────────────────────────────────────────

export async function uploadImage(db: SupabaseClient, businessId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${businessId}/${Date.now()}.${ext}`;

  const { error } = await db.storage
    .from('images')
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = db.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Available Slots ──────────────────────────────────────

export interface SlotInfo {
  time: string;
  preferred: boolean;
}

export async function getAvailableSlotsAsync(
  db: SupabaseClient,
  businessId: string,
  date: string,
  serviceDuration: number,
  minHoursBeforeBooking?: number | null
): Promise<SlotInfo[]> {
  const availability = await fetchAvailability(db, businessId, 60);
  const day = availability.find((d) => d.date === date);
  if (!day || !day.isWorking || day.slots.length === 0) return [];

  const { data: apptRows } = await db
    .from('appointments')
    .select('time, duration')
    .eq('business_id', businessId)
    .eq('date', date)
    .neq('status', 'cancelled');

  const occupied = (apptRows ?? []).map((a) => {
    const [h, m] = (a.time as string).split(':').map(Number);
    return { start: h * 60 + m, end: h * 60 + m + (a.duration as number) };
  });

  const slots: SlotInfo[] = [];

  const now = new Date();
  const todayStr = toDateStr(now);
  const isToday = date === todayStr;
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  // Calculate minimum allowed slot time based on minHoursBeforeBooking
  let minAllowedMinutes = 0;
  if (minHoursBeforeBooking && minHoursBeforeBooking > 0) {
    const minTime = new Date(now.getTime() + minHoursBeforeBooking * 60 * 60 * 1000);
    const minDateStr = toDateStr(minTime);
    if (date < minDateStr) return []; // entire day is too soon
    if (date === minDateStr) {
      minAllowedMinutes = minTime.getHours() * 60 + minTime.getMinutes();
    }
  }

  for (const timeRange of day.slots) {
    const [startH, startM] = timeRange.start.split(':').map(Number);
    const [endH, endM] = timeRange.end.split(':').map(Number);
    const rangeStart = startH * 60 + startM;
    const rangeEnd = endH * 60 + endM;

    for (let time = rangeStart; time + serviceDuration <= rangeEnd; time += 30) {
      if (isToday && time <= currentMinutes) continue;
      if (minAllowedMinutes > 0 && time < minAllowedMinutes) continue;

      const slotStart = time;
      const slotEnd = time + serviceDuration;

      const isAvailable = !occupied.some(
        (o) => slotStart < o.end && slotEnd > o.start
      );

      if (isAvailable) {
        const isPreferred =
          occupied.length > 0 &&
          occupied.some((o) => slotEnd === o.start || slotStart === o.end);

        const h = Math.floor(time / 60);
        const m = time % 60;
        slots.push({
          time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
          preferred: isPreferred,
        });
      }
    }
  }

  slots.sort((a, b) => {
    if (a.preferred && !b.preferred) return -1;
    if (!a.preferred && b.preferred) return 1;
    return a.time.localeCompare(b.time);
  });

  return slots;
}
