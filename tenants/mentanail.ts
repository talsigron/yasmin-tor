import { TenantConfig } from './types';

export const mentanailConfig: TenantConfig = {
  id: 'mentanail',
  slug: 'mentanail',
  businessId: 'f88f93c9-563b-42e1-9624-3a8817cab842',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL_MENTANAIL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_MENTANAIL ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  labels: {
    booking: 'תור',
    bookings: 'תורים',
    makeBooking: 'קביעת תור',
    calendar: 'יומן תורים',
    services: 'השירותים שלנו',
    service: 'שירות',
    customer: 'לקוחה',
    customers: 'לקוחות',
    register: 'הרשמה כלקוחה',
    businessOwner: 'כניסת בעלת העסק',
    confirmCancel: 'בטוחה שלבטל את התור?',
    myBookings: 'התורים שלי',
    changeDate: 'שינוי מועד',
    hello: 'שלום',
    rescheduleMsg: (svc, date, time) =>
      `היי, אני רוצה לשנות מועד של התור ל${svc} ב-${date} בשעה ${time}`,
    cancelMsg: (svc, date, time) =>
      `היי, אני צריכה לבטל את התור ל${svc} ב-${date} בשעה ${time}`,
  },
  features: {
    autoApprove: false,
    groupSessions: false,
    customerCategories: false,
  },
  defaultColors: {
    primary: '#14b898',
    secondary: '#f0fdf9',
    background: '#fafffe',
  },
  defaultPassword: 'menta2024',
  storagePrefix: 'mentanail',
};
