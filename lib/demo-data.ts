import { Service, Appointment, DayAvailability, BusinessProfile, Customer } from './types';

export const demoServices: Service[] = [
  {
    id: '1',
    name: 'מניקור קלאסי',
    price: 80,
    duration: 45,
    description: 'טיפול מניקור מקצועי עם לק רגיל',
    order: 1,
    active: true,
  },
  {
    id: '2',
    name: 'מניקור ג\'ל',
    price: 120,
    duration: 60,
    description: 'מניקור עם לק ג\'ל עמיד לשבועות',
    order: 2,
    active: true,
  },
  {
    id: '3',
    name: 'פדיקור קלאסי',
    price: 100,
    duration: 50,
    description: 'טיפול פדיקור מלא עם לק',
    order: 3,
    active: true,
  },
  {
    id: '4',
    name: 'פדיקור ג\'ל',
    price: 140,
    duration: 60,
    description: 'פדיקור מקצועי עם לק ג\'ל',
    order: 4,
    active: true,
  },
  {
    id: '5',
    name: 'בניית ציפורניים',
    price: 200,
    duration: 90,
    description: 'בנייה מלאה של ציפורניים באקריל או ג\'ל',
    order: 5,
    active: true,
  },
  {
    id: '6',
    name: 'מילוי ציפורניים',
    price: 150,
    duration: 60,
    description: 'מילוי לציפורניים בנויות',
    order: 6,
    active: true,
  },
  {
    id: '7',
    name: 'עיצוב ציפורניים',
    price: 30,
    duration: 20,
    description: 'עיצובים מיוחדים - ציורים, אבנים, נצנצים',
    order: 7,
    active: true,
  },
];

export const demoProfile: BusinessProfile = {
  name: 'Menta Nail',
  description: 'סטודיו לציפורניים מקצועי. חוויה מפנקת של יופי ועיצוב ציפורניים ברמה הגבוהה ביותר.',
  phone: '050-4945049',
  instagram: 'https://www.instagram.com/menta_nail_s',
  address: '',
  images: [],
};

// Generate availability for the next 14 days
export function generateDemoAvailability(): DayAvailability[] {
  const days: DayAvailability[] = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    // Friday (5) and Saturday (6) - closed by default
    const isWorking = dayOfWeek !== 5 && dayOfWeek !== 6;

    days.push({
      date: date.toISOString().split('T')[0],
      isWorking,
      slots: isWorking
        ? [{ start: '09:00', end: '15:00' }]
        : [],
    });
  }

  return days;
}

export const demoCustomers: Customer[] = [];
export const demoAppointments: Appointment[] = [];
