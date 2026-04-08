import type { TenantLabels, TenantFeatures } from './types';

type Category = 'nails' | 'fitness' | 'other';

export function getDefaultLabels(category: Category): TenantLabels {
  if (category === 'nails') {
    return {
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
      bookingSettings: 'הגדרות קביעת תורים',
      advanceBookingLabel: 'כמה זמן קדימה ניתן לקבוע תור?',
      advanceBookingHint: 'לקוחות יוכלו לקבוע תורים רק בטווח הזמן שנבחר',
      maxBookingsLabel: 'כמה תורים לקוחה יכולה לקבוע קדימה?',
      maxBookingsHint: 'מונע מלקוחה לתפוס יותר מדי תורים בו-זמנית',
      cancelBookingLabel: 'ביטול תור',
      cancelFromSite: 'לקוחות יוכלו לבטל תורים ישירות מהאתר',
      cancelViaWhatsapp: 'לקוחות יצטרכו ליצור קשר בוואטסאפ לביטול תור',
      servicePlaceholder: "מניקור ג'ל",
      clientSeesBit: 'הלקוחה תראה כפתור ביט עם המספר שלך והסכום',
      clientSeesPaybox: 'הלקוחה תראה כפתור פייבוקס עם המספר שלך והסכום',
      logoHint: 'העלי לוגו לתצוגה מושלמת. גם תמונה שלך יכולה לעבוד. אם אין, תשאירי ריק',
      customerApproved: 'מאושרת!',
      customerPending: 'ממתינה לאישור',
      pendingTab: 'ממתינות לאישור',
      noPendingCustomers: 'אין לקוחות ממתינות!',
      customersListEmpty: 'עוד רגע מגיעות! רשימת הלקוחות שלך ריקה',
      customerApprovedToast: 'הלקוחה אושרה!',
      sendWhatsappApproval: 'שלחי הודעה בוואטסאפ',
      customerApprovalMsg: (name, businessName, url) =>
        `היי ${name}! אושרת כלקוחה ב-${businessName}. אפשר לקבוע תור: ${url}`,
    };
  }

  // fitness + other — masculine labels
  const isFitness = category === 'fitness';
  const bookingWord = isFitness ? 'אימון' : 'תור';
  const bookingsWord = isFitness ? 'אימונים' : 'תורים';

  return {
    booking: bookingWord,
    bookings: bookingsWord,
    makeBooking: `קביעת ${bookingWord}`,
    calendar: `יומן ${bookingsWord}`,
    services: isFitness ? 'סוגי האימונים' : 'השירותים שלנו',
    service: isFitness ? 'אימון' : 'שירות',
    customer: 'לקוח',
    customers: 'לקוחות',
    register: 'הרשמה כלקוח',
    businessOwner: 'כניסת בעל העסק',
    confirmCancel: `בטוח שלבטל את ה${bookingWord}?`,
    myBookings: `ה${bookingsWord} שלי`,
    changeDate: 'שינוי מועד',
    hello: 'שלום',
    rescheduleMsg: (svc, date, time) =>
      `היי, אני רוצה לשנות מועד של ה${bookingWord} ${svc} ב-${date} בשעה ${time}`,
    cancelMsg: (svc, date, time) =>
      `היי, אני צריך לבטל את ה${bookingWord} ${svc} ב-${date} בשעה ${time}`,
    bookingSettings: `הגדרות קביעת ${bookingsWord}`,
    advanceBookingLabel: `כמה זמן קדימה ניתן לקבוע ${bookingWord}?`,
    advanceBookingHint: `לקוחות יוכלו לקבוע ${bookingsWord} רק בטווח הזמן שנבחר`,
    maxBookingsLabel: `כמה ${bookingsWord} לקוח יכול לקבוע קדימה?`,
    maxBookingsHint: `מונע מלקוח לתפוס יותר מדי ${bookingsWord} בו-זמנית`,
    cancelBookingLabel: `ביטול ${bookingWord}`,
    cancelFromSite: `לקוחות יוכלו לבטל ${bookingsWord} ישירות מהאתר`,
    cancelViaWhatsapp: `לקוחות יצטרכו ליצור קשר בוואטסאפ לביטול ${bookingWord}`,
    servicePlaceholder: isFitness ? 'אימון אישי' : 'שם השירות',
    clientSeesBit: 'הלקוח יראה כפתור ביט עם המספר שלך והסכום',
    clientSeesPaybox: 'הלקוח יראה כפתור פייבוקס עם המספר שלך והסכום',
    logoHint: 'העלה לוגו לתצוגה מושלמת. גם תמונה שלך יכולה לעבוד. אם אין, תשאיר ריק',
    customerApproved: 'מאושר!',
    customerPending: 'ממתין לאישור',
    pendingTab: 'ממתינים לאישור',
    noPendingCustomers: 'אין לקוחות ממתינים!',
    customersListEmpty: 'עוד רגע מגיעים! רשימת הלקוחות שלך ריקה',
    customerApprovedToast: 'הלקוח אושר!',
    sendWhatsappApproval: 'שלח הודעה בוואטסאפ',
    customerApprovalMsg: (name, businessName, url) =>
      `היי ${name}! אושרת כלקוח ב-${businessName}. אפשר לקבוע ${bookingWord}: ${url}`,
  };
}

export function getDefaultFeatures(category: Category): TenantFeatures {
  if (category === 'fitness') {
    return {
      autoApprove: true,
      groupSessions: true,
      customerCategories: true,
      showPrice: false,
      showDuration: true,
    };
  }
  return {
    autoApprove: false,
    groupSessions: false,
    customerCategories: false,
    showPrice: true,
    showDuration: true,
  };
}

export function getDefaultColors() {
  return {
    primary: '#14b898',
    secondary: '#f0fdf9',
    background: '#fafffe',
  };
}
