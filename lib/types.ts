export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
  image?: string;
  order: number;
  active: boolean;
  showPrice?: boolean;    // null = inherit from features.showPrice
  showDuration?: boolean; // null = inherit from features.showDuration
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
  // Extended fields (fitness category)
  dateOfBirth?: string | null;
  idNumber?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  paymentMethod?: 'cash' | 'bit' | 'bank_transfer' | 'check' | null;
  healthDeclarationUrl?: string | null;
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
  autoApprove?: boolean | null; // null = use static config default
  minHoursBeforeBooking?: number | null; // null = no limit (0 means allow anytime)
}
