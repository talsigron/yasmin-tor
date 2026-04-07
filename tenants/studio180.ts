import { TenantConfig } from './types';

export const studio180Config: TenantConfig = {
  id: 'studio180',
  slug: '180studio',
  businessId: process.env.NEXT_PUBLIC_BUSINESS_ID_STUDIO180 ?? '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL_STUDIO180 ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STUDIO180 ?? '',
  labels: {
    booking: 'אימון',
    bookings: 'אימונים',
    makeBooking: 'קביעת אימון',
    calendar: 'יומן אימונים',
    services: 'סוגי האימונים',
    service: 'אימון',
    customer: 'לקוח',
    customers: 'לקוחות',
    register: 'הרשמה כלקוח',
    businessOwner: 'כניסת בעל העסק',
    confirmCancel: 'בטוח שלבטל את האימון?',
    myBookings: 'האימונים שלי',
    changeDate: 'שינוי מועד',
    hello: 'שלום',
    rescheduleMsg: (svc, date, time) =>
      `היי, אני רוצה לשנות מועד של האימון ${svc} ב-${date} בשעה ${time}`,
    cancelMsg: (svc, date, time) =>
      `היי, אני צריך לבטל את האימון ${svc} ב-${date} בשעה ${time}`,
  },
  features: {
    autoApprove: true,
    groupSessions: true,
    customerCategories: true,
  },
  defaultColors: {
    primary: '#00BCD4',
    secondary: '#E0F7FA',
    background: '#F5FEFF',
  },
  defaultPassword: '180admin',
  storagePrefix: 'studio180',
};
