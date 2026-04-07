export function formatPrice(price: number): string {
  if (price === 0) return 'חינם';
  return `₪${price}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} דק'`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} ${h > 1 ? 'שעות' : 'שעה'}`;
  return `${h}:${m.toString().padStart(2, '0')} שעות`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
  ];
  return `יום ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
  return `${days[date.getDay()]} ${date.getDate()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

export function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === tomorrow.toISOString().split('T')[0];
}

export function generateCalendarLink(
  title: string,
  date: string,
  time: string,
  duration: number,
  location: string
): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const [year, month, day] = date.split('-');
  const [hour, minute] = time.split(':');

  const startStr = `${year}${pad(parseInt(month))}${pad(parseInt(day))}T${pad(parseInt(hour))}${pad(parseInt(minute))}00`;

  const endMinutes = parseInt(hour) * 60 + parseInt(minute) + duration;
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  const endStr = `${year}${pad(parseInt(month))}${pad(parseInt(day))}T${pad(endH)}${pad(endM)}00`;

  // Generate ICS file content (universal - works on iPhone, Android, desktop)
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MentaNail//Appointment//HE',
    'BEGIN:VEVENT',
    `DTSTART;TZID=Asia/Jerusalem:${startStr}`,
    `DTEND;TZID=Asia/Jerusalem:${endStr}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:תור ב-Menta Nail`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  // Create data URI for download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

export function cn(...classes: (string | boolean | undefined | null | number)[]): string {
  return classes.filter((c) => typeof c === 'string' && c.length > 0).join(' ');
}
