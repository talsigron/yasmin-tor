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
  email?: string | null;
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
  requireHealthDeclaration?: boolean; // fitness: block booking without health declaration
  coverImage?: string; // wide-angle photo of the place, shown as background
  cancellationHoursLimit?: number;
  shopEnabled?: boolean;
  bannerEnabled?: boolean;
  bannerMessage?: string;
  bannerEndDate?: string; // YYYY-MM-DD or undefined = until new message
  bannerEndTime?: string; // HH:mm or undefined = end of day (23:59)
  bannerDismissible?: boolean;
  paymentMethods?: PaymentMethods;
  useExpenses?: boolean;
  expenseCategories?: string[];
  showParticipants?: boolean; // show names of existing session attendees in booking flow
  ownerEmail?: string;
  ownerNotify?: NotificationPreferences;
  customerNotify?: NotificationPreferences;
  healthDeclarationText?: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  events: Record<string, boolean>;
}

export interface PaymentMethods {
  bit?: boolean;
  paybox?: boolean;
  cash?: boolean;
  credit?: boolean;
  checks?: boolean;
  bank_transfer?: boolean;
}

export const PAYMENT_METHOD_LABELS: Record<keyof PaymentMethods, string> = {
  bit: 'ביט',
  paybox: 'פייבוקס',
  cash: 'מזומן',
  credit: 'כרטיס אשראי',
  checks: 'שיקים',
  bank_transfer: 'העברה בנקאית',
};

export interface Expense {
  id: string;
  businessId: string;
  date: string;
  amount: number;
  category: string;
  note?: string;
  createdAt: string;
}

export interface MonthlyGoal {
  id: string;
  businessId: string;
  year: number;
  month: number;
  kind: 'income' | 'new_customers' | 'sessions';
  targetValue: number;
}

export type PunchCardMeasurementType = 'entries' | 'months' | 'unlimited';

export interface PunchCardType {
  id: string;
  businessId: string;
  name: string;
  measurementType: PunchCardMeasurementType;
  entriesCount: number; // used when measurementType === 'entries'
  monthsCount?: number; // used when measurementType === 'months'
  price: number;
  validityDays?: number; // optional extra validity for entries-based
  nearEndDays?: number; // threshold for "near end" badge (default 3)
  isActive: boolean;
  createdAt: string;
}

export interface CustomerPunchCard {
  id: string;
  businessId: string;
  customerId: string;
  customerName?: string;
  punchCardTypeId?: string;
  punchCardName: string;
  measurementType: PunchCardMeasurementType;
  entriesTotal: number;
  entriesUsed: number;
  purchasedAt: string;
  expiresAt?: string;
  isPaid: boolean;
  paymentMethod?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string; // requires: ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS image_url TEXT;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  businessId: string;
  customerId?: string;
  customerName?: string;
  description: string;
  amount: number;
  paymentMethod: string;
  transactionDate: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}
