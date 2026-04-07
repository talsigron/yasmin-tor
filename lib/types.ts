export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
  image?: string;
  order: number;
  active: boolean;
}

export interface TimeSlot {
  start: string; // HH:MM
  end: string;   // HH:MM
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  isWorking: boolean;
  slots: TimeSlot[];
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  notificationEnabled: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  subtitle?: string;
  brands?: string;
  logo?: string;
  description: string;
  phone: string;
  instagram: string;
  address: string;
  images: string[];
  enableBit?: boolean;
  bitType?: 'regular' | 'business';
  bitLink?: string; // for business bit only
  enablePaybox?: boolean;
  payboxLink?: string;
  brandColors?: {
    primary: string;    // כותרות וכפתורים
    secondary: string;  // רקע משני
    background: string; // רקע מרכזי
  };
  maxBookingDays?: number; // 7, 14, 21, 30, or 0 (unlimited)
  cancelPolicy?: 'website' | 'whatsapp'; // how customers can cancel
  maxActiveBookings?: number; // 1, 2, 3, 4, or 0 (unlimited)
}
