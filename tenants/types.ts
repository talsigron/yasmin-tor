export interface TenantLabels {
  booking: string;         // "תור" / "אימון"
  bookings: string;        // "תורים" / "אימונים"
  makeBooking: string;     // "קביעת תור" / "קביעת אימון"
  calendar: string;        // "יומן תורים" / "יומן אימונים"
  services: string;        // "השירותים שלנו" / "סוגי האימונים"
  service: string;         // "שירות" / "אימון"
  customer: string;        // "לקוחה" / "לקוח"
  customers: string;       // "לקוחות"
  register: string;        // "הרשמה כלקוחה" / "הרשמה כלקוח"
  businessOwner: string;   // "כניסת בעלת העסק" / "כניסת בעל העסק"
  confirmCancel: string;   // "בטוחה שלבטל?" / "בטוח שלבטל?"
  myBookings: string;      // "התורים שלי" / "האימונים שלי"
  changeDate: string;      // "שינוי מועד"
  hello: string;           // "שלום"
  rescheduleMsg: (serviceName: string, dateStr: string, timeStr: string) => string;
  cancelMsg: (serviceName: string, dateStr: string, timeStr: string) => string;
  // ProfileEditor strings
  bookingSettings: string;     // "הגדרות קביעת תורים" / "הגדרות קביעת אימונים"
  advanceBookingLabel: string; // "כמה זמן קדימה ניתן לקבוע תור?"
  advanceBookingHint: string;  // "לקוחות יוכלו לקבוע תורים רק..."
  maxBookingsLabel: string;    // "כמה תורים לקוחה יכולה לקבוע?"
  maxBookingsHint: string;     // "מונע מלקוחה לתפוס..."
  cancelBookingLabel: string;  // "ביטול תור" / "ביטול אימון"
  cancelFromSite: string;      // "לקוחות יוכלו לבטל תורים ישירות מהאתר"
  cancelViaWhatsapp: string;   // "לקוחות יצטרכו ליצור קשר בוואטסאפ לביטול תור"
  servicePlaceholder: string;  // "מניקור ג'ל" / "אימון אישי"
  clientSeesBit: string;       // "הלקוחה תראה כפתור ביט..."
  clientSeesPaybox: string;    // "הלקוחה תראה כפתור פייבוקס..."
  logoHint: string;            // "העלי לוגו..." / "העלה לוגו..."
}

export interface TenantFeatures {
  autoApprove: boolean;        // האם הרשמה אוטומטית (ללא אישור)
  groupSessions: boolean;      // אימונים קבוצתיים עם מינ/מקס משתתפים
  customerCategories: boolean; // סיווג לקוחות (חדר כושר / אישי / קבוצתי)
  showPrice: boolean;          // האם להציג מחיר ברירת מחדל
  showDuration: boolean;       // האם להציג משך זמן ברירת מחדל
}

export interface TenantConfig {
  id: string;              // 'mentanail' | 'studio180'
  slug: string;            // URL path segment: 'mentanail' | '180studio'
  businessId: string;      // Supabase business_profiles UUID
  supabaseUrl: string;
  supabaseAnonKey: string;
  labels: TenantLabels;
  features: TenantFeatures;
  defaultColors: {
    primary: string;
    secondary: string;
    background: string;
  };
  defaultPassword: string;
  storagePrefix: string;   // localStorage key prefix
}
