'use client';

import { useState, useMemo } from 'react';
import { useAppointments, useAvailability } from '@/hooks/useSupabase';
import { Appointment, DayAvailability } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Phone,
  User,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

type CalendarView = 'daily' | 'weekly' | 'biweekly' | 'monthly';
type DisplayMode = 'list' | 'grid';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const DAY_NAMES_SHORT = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

function getWeekDates(baseDate: Date): string[] {
  const day = baseDate.getDay();
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - day + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function getBiweeklyDates(baseDate: Date): string[] {
  const day = baseDate.getDay();
  const dates: string[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - day + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;
}

function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    dates.push(localDateStr(d));
  }
  return dates;
}

function getDefaultDisplayMode(view: CalendarView): DisplayMode {
  return view === 'daily' || view === 'weekly' ? 'list' : 'grid';
}

export default function AppointmentsView() {
  const { appointments, loading, update } = useAppointments();
  const { availability } = useAvailability(60);
  const [view, setView] = useState<CalendarView>('daily');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    try {
      await update(id, { status });
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  const handleViewChange = (v: CalendarView) => {
    setView(v);
    setDisplayMode(getDefaultDisplayMode(v));
  };

  const navigateDate = (direction: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    if (view === 'daily') d.setDate(d.getDate() + direction);
    else if (view === 'weekly') d.setDate(d.getDate() + direction * 7);
    else if (view === 'biweekly') d.setDate(d.getDate() + direction * 14);
    else d.setMonth(d.getMonth() + direction);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const today = new Date().toISOString().split('T')[0];
  const currentDate = new Date(selectedDate + 'T00:00:00');

  // Get dates to display based on view
  const displayDates = useMemo(() => {
    if (view === 'daily') return [selectedDate];
    if (view === 'weekly') return getWeekDates(currentDate);
    if (view === 'biweekly') return getBiweeklyDates(currentDate);
    return getMonthDates(currentDate.getFullYear(), currentDate.getMonth());
  }, [view, selectedDate, currentDate]);

  // Get header text
  const headerText = useMemo(() => {
    if (view === 'daily') {
      const isToday = selectedDate === today;
      return isToday ? `היום - ${formatDate(selectedDate)}` : formatDate(selectedDate);
    }
    if (view === 'weekly') {
      const weekDates = getWeekDates(currentDate);
      return `${formatShortDate(weekDates[0])} - ${formatShortDate(weekDates[6])}`;
    }
    if (view === 'biweekly') {
      const biDates = getBiweeklyDates(currentDate);
      return `${formatShortDate(biDates[0])} - ${formatShortDate(biDates[13])}`;
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [view, selectedDate, today, currentDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-3 border-mint-200 border-t-mint-500 animate-spin" />
      </div>
    );
  }

  const viewLabels: Record<CalendarView, string> = {
    daily: 'יומי',
    weekly: 'שבועי',
    biweekly: 'דו-שבועי',
    monthly: 'חודשי',
  };

  return (
    <div className="animate-fade-in">
      {/* View selector */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">יומן תורים</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['daily', 'weekly', 'biweekly', 'monthly'] as const).map((v) => (
            <button
              key={v}
              onClick={() => handleViewChange(v)}
              className={cn(
                'px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer',
                view === v
                  ? 'bg-white text-mint-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Date navigation + display mode toggle */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-100 p-3">
        <button
          onClick={() => navigateDate(1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronRight size={18} className="text-gray-500" />
        </button>
        <div className="text-center flex-1">
          <span className="text-sm font-bold text-gray-800">{headerText}</span>
          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="block mx-auto text-[10px] text-mint-500 hover:underline cursor-pointer mt-0.5"
            >
              חזרה להיום
            </button>
          )}
        </div>
        {/* Display mode toggles */}
        {view !== 'daily' && (
          <div className="flex items-center gap-1 mx-2">
            <button
              onClick={() => setDisplayMode('list')}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer',
                displayMode === 'list'
                  ? 'bg-mint-100 text-mint-600'
                  : 'text-gray-400 hover:bg-gray-100'
              )}
              title="תצוגת רשימה"
            >
              📋
            </button>
            <button
              onClick={() => setDisplayMode('grid')}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer',
                displayMode === 'grid'
                  ? 'bg-mint-100 text-mint-600'
                  : 'text-gray-400 hover:bg-gray-100'
              )}
              title="תצוגת לוח"
            >
              📅
            </button>
          </div>
        )}
        <button
          onClick={() => navigateDate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Calendar content */}
      {view === 'daily' && (
        <DailyView
          date={selectedDate}
          appointments={appointments.filter((a) => a.date === selectedDate)}
          onStatusChange={handleStatusChange}
        />
      )}

      {view === 'weekly' && displayMode === 'list' && (
        <MultiDayListView
          dates={displayDates}
          appointments={appointments}
          today={today}
          onStatusChange={handleStatusChange}
        />
      )}

      {view === 'weekly' && displayMode === 'grid' && (
        <WeeklyView
          dates={displayDates}
          appointments={appointments}
          selectedDate={selectedDate}
          today={today}
          onSelectDate={(d) => { setSelectedDate(d); handleViewChange('daily'); }}
        />
      )}

      {view === 'biweekly' && displayMode === 'list' && (
        <MultiDayListView
          dates={displayDates}
          appointments={appointments}
          today={today}
          onStatusChange={handleStatusChange}
        />
      )}

      {view === 'biweekly' && displayMode === 'grid' && (
        <BiweeklyView
          dates={displayDates}
          appointments={appointments}
          selectedDate={selectedDate}
          today={today}
          onSelectDate={(d) => { setSelectedDate(d); handleViewChange('daily'); }}
        />
      )}

      {view === 'monthly' && displayMode === 'list' && (
        <MultiDayListView
          dates={displayDates}
          appointments={appointments}
          today={today}
          onStatusChange={handleStatusChange}
        />
      )}

      {view === 'monthly' && displayMode === 'grid' && (
        <MonthlyView
          dates={displayDates}
          appointments={appointments}
          selectedDate={selectedDate}
          today={today}
          availability={availability}
          onSelectDate={(d) => { setSelectedDate(d); handleViewChange('daily'); }}
        />
      )}
    </div>
  );
}

// Daily view - timeline of appointments
function DailyView({
  date,
  appointments,
  onStatusChange,
}: {
  date: string;
  appointments: Appointment[];
  onStatusChange: (id: string, status: Appointment['status']) => void;
}) {
  const sorted = appointments
    .filter((a) => a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500">יום חופשי! ☀️ אין תורים היום</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((appt) => (
        <AppointmentCard key={appt.id} appt={appt} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}

// Shared appointment card used in daily and list views
function AppointmentCard({
  appt,
  onStatusChange,
}: {
  appt: Appointment;
  onStatusChange: (id: string, status: Appointment['status']) => void;
}) {
  const handleCancel = () => {
    const confirmed = confirm(`בטוחה שלבטל את התור של ${appt.customerName} ב-${appt.time.slice(0, 5)}?`);
    if (confirmed) {
      onStatusChange(appt.id, 'cancelled');
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4 transition-all',
        appt.status === 'completed'
          ? 'border-gray-200 opacity-60'
          : 'border-mint-200 hover:shadow-sm'
      )}
    >
      {/* Time bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-mint-500" />
          <span className="text-lg font-bold text-gray-800">{appt.time.slice(0, 5)}</span>
        </div>
        <span className="text-xs text-gray-500">
          {appt.duration} דק&apos;
        </span>
        <span
          className={cn(
            'text-[10px] px-2 py-0.5 rounded-full border mr-auto',
            appt.status === 'confirmed'
              ? 'bg-mint-50 border-mint-200 text-mint-700'
              : 'bg-gray-50 border-gray-200 text-gray-500'
          )}
        >
          {appt.status === 'confirmed' ? 'מאושר' : 'הושלם'}
        </span>
      </div>

      {/* Service name */}
      <p className="text-sm font-semibold text-gray-700 mb-2">{appt.serviceName}</p>

      {/* Customer info with action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User size={13} className="text-gray-500" />
          <span className="text-sm text-gray-600">{appt.customerName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${appt.customerPhone}`}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-mint-50 text-mint-600 hover:bg-mint-100 transition-colors"
            title="התקשרי"
          >
            <Phone size={14} />
          </a>
          <a
            href={`https://wa.me/972${appt.customerPhone.replace(/^0/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            title="WhatsApp"
          >
            <WhatsAppIcon size={14} />
          </a>
          {appt.status === 'confirmed' && (
            <>
              <button
                onClick={() => onStatusChange(appt.id, 'completed')}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors cursor-pointer"
                title="סמני כהושלם"
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleCancel}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                title="ביטול תור"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Multi-day list view - shows appointments grouped by date
function MultiDayListView({
  dates,
  appointments,
  today,
  onStatusChange,
}: {
  dates: string[];
  appointments: Appointment[];
  today: string;
  onStatusChange: (id: string, status: Appointment['status']) => void;
}) {
  const datesWithAppts = dates
    .map((date) => ({
      date,
      appts: appointments
        .filter((a) => a.date === date && a.status !== 'cancelled')
        .sort((a, b) => a.time.localeCompare(b.time)),
    }))
    .filter((d) => d.appts.length > 0);

  if (datesWithAppts.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500">אין תורים בתקופה הזו ☀️</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {datesWithAppts.map(({ date, appts }) => {
        const d = new Date(date + 'T00:00:00');
        const isToday = date === today;
        return (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                'text-sm font-bold',
                isToday ? 'text-mint-600' : 'text-gray-700'
              )}>
                יום {DAY_NAMES[d.getDay()]} {formatShortDate(date)}
              </span>
              {isToday && (
                <span className="text-[10px] bg-mint-100 text-mint-600 px-1.5 py-0.5 rounded-full">
                  היום
                </span>
              )}
              <span className="text-xs text-gray-400">({appts.length} תורים)</span>
            </div>
            <div className="space-y-2">
              {appts.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} onStatusChange={onStatusChange} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Weekly view - 7 day columns (grid)
function WeeklyView({
  dates,
  appointments,
  selectedDate,
  today,
  onSelectDate,
}: {
  dates: string[];
  appointments: Appointment[];
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {dates.map((date) => {
        const d = new Date(date + 'T00:00:00');
        const dayAppts = appointments.filter(
          (a) => a.date === date && a.status !== 'cancelled'
        );
        const isToday = date === today;

        return (
          <button
            key={date}
            onClick={() => onSelectDate(date)}
            className={cn(
              'flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer min-h-[80px]',
              isToday
                ? 'bg-mint-50 border-2 border-mint-300'
                : 'bg-white border border-gray-100 hover:border-mint-200'
            )}
          >
            <span className="text-[10px] text-gray-500">{DAY_NAMES_SHORT[d.getDay()]}</span>
            <span className={cn(
              'text-sm font-bold mb-1',
              isToday ? 'text-mint-600' : 'text-gray-800'
            )}>
              {formatShortDate(date)}
            </span>
            {dayAppts.length > 0 && (
              <div className="w-5 h-5 rounded-full bg-mint-500 text-white text-[10px] font-bold flex items-center justify-center">
                {dayAppts.length}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Biweekly view - 14 day grid (2 rows of 7)
function BiweeklyView({
  dates,
  appointments,
  selectedDate,
  today,
  onSelectDate,
}: {
  dates: string[];
  appointments: Appointment[];
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
}) {
  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES_SHORT.map((name) => (
          <div key={name} className="text-center text-[10px] text-gray-500 py-1">
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date) => {
          const d = new Date(date + 'T00:00:00');
          const dayAppts = appointments.filter(
            (a) => a.date === date && a.status !== 'cancelled'
          );
          const isToday = date === today;
          const isPast = date < today;

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={cn(
                'flex flex-col items-center p-1.5 rounded-xl transition-all cursor-pointer min-h-[68px]',
                isToday
                  ? 'bg-mint-50 border-2 border-mint-300'
                  : isPast
                  ? 'bg-gray-50 text-gray-400'
                  : 'bg-white border border-gray-100 hover:border-mint-200'
              )}
            >
              <span className={cn(
                'text-xs font-bold',
                isToday ? 'text-mint-600' : ''
              )}>
                {formatShortDate(date)}
              </span>
              {dayAppts.length > 0 && (
                <div className="w-5 h-5 rounded-full bg-mint-500 text-white text-[10px] font-bold flex items-center justify-center mt-1">
                  {dayAppts.length}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Monthly view - calendar grid (full screen, improved contrast)
function MonthlyView({
  dates,
  appointments,
  today,
  availability,
  onSelectDate,
}: {
  dates: string[];
  appointments: Appointment[];
  selectedDate: string;
  today: string;
  availability: DayAvailability[];
  onSelectDate: (date: string) => void;
}) {
  const availabilityMap = useMemo(() => {
    const map = new Map<string, DayAvailability>();
    availability.forEach((d) => map.set(d.date, d));
    return map;
  }, [availability]);

  const getAvailableSlots = (date: string, dayAppts: Appointment[]) => {
    const avail = availabilityMap.get(date);
    if (!avail || !avail.isWorking) return 0;
    let totalMinutes = 0;
    (avail.slots || []).forEach((slot: { start: string; end: string }) => {
      const [sh, sm] = slot.start.split(':').map(Number);
      const [eh, em] = slot.end.split(':').map(Number);
      totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
    });
    const bookedMinutes = dayAppts.reduce((sum, a) => sum + a.duration, 0);
    const freeMinutes = Math.max(0, totalMinutes - bookedMinutes);
    return Math.floor(freeMinutes / 45);
  };

  const firstDate = new Date(dates[0] + 'T00:00:00');
  const startDay = firstDate.getDay();

  const paddedDates: (string | null)[] = [];
  for (let i = 0; i < startDay; i++) paddedDates.push(null);
  paddedDates.push(...dates);

  const totalAppts = appointments.filter(a =>
    dates.includes(a.date) && a.status !== 'cancelled'
  ).length;
  const workingDays = dates.filter(d => {
    const avail = availabilityMap.get(d);
    return avail ? avail.isWorking : true;
  }).length;

  // Calculate number of rows for dynamic height
  const totalRows = Math.ceil(paddedDates.length / 7);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 280px)' }}>
      {/* Month stats bar */}
      <div className="flex items-center justify-center gap-6 mb-3 text-xs text-gray-600">
        <span>תורים: <strong className="text-mint-600 text-sm">{totalAppts}</strong></span>
        <span>ימי עבודה: <strong className="text-gray-800 text-sm">{workingDays}</strong></span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {DAY_NAMES_SHORT.map((name) => (
          <div key={name} className="text-center text-xs text-gray-600 py-1.5 font-bold">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid - fills available space */}
      <div className="grid grid-cols-7 gap-1.5 flex-1">
        {paddedDates.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const d = new Date(date + 'T00:00:00');
          const dayAppts = appointments.filter(
            (a) => a.date === date && a.status !== 'cancelled'
          );
          const isToday = date === today;
          const isPast = date < today;
          const avail = availabilityMap.get(date);
          const isWorking = avail ? avail.isWorking : true;
          const freeSlots = !isPast && isWorking ? getAvailableSlots(date, dayAppts) : 0;
          const completedAppts = appointments.filter(
            (a) => a.date === date && a.status === 'completed'
          ).length;

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={cn(
                'flex flex-col items-center p-1.5 rounded-xl transition-all cursor-pointer justify-start relative',
                isToday
                  ? 'bg-mint-100 border-2 border-mint-500 shadow-md'
                  : isPast
                  ? 'bg-gray-50 text-gray-400'
                  : isWorking
                  ? 'bg-white hover:bg-mint-50 border border-gray-200 hover:border-mint-300'
                  : 'bg-gray-100 hover:bg-gray-150 border border-gray-200'
              )}
              style={{ minHeight: `${Math.max(80, Math.floor((100 / totalRows) * 4.5))}px` }}
            >
              {/* Working status dot */}
              <span
                className={cn(
                  'absolute top-1.5 left-1.5 w-2 h-2 rounded-full',
                  isWorking ? 'bg-green-500' : 'bg-gray-300'
                )}
              />

              {/* Date number */}
              <span className={cn(
                'text-base font-bold leading-tight',
                isToday ? 'text-mint-700' : isPast ? 'text-gray-400' : !isWorking ? 'text-gray-400' : 'text-gray-800'
              )}>
                {d.getDate()}
              </span>

              {/* Appointment info */}
              {dayAppts.length > 0 && (
                <div className="flex flex-col items-center mt-1">
                  <span className={cn(
                    'text-[10px] font-bold leading-tight px-1.5 py-0.5 rounded-full',
                    isPast ? 'text-gray-400' : 'bg-mint-200 text-mint-800'
                  )}>
                    {dayAppts.length} תורים
                  </span>
                  {completedAppts > 0 && !isPast && (
                    <span className="text-[9px] text-blue-600 font-medium leading-tight mt-0.5">
                      {completedAppts} הושלמו
                    </span>
                  )}
                </div>
              )}

              {/* Available slots for future working days */}
              {!isPast && isWorking && dayAppts.length === 0 && (
                <span className="text-[10px] text-green-600 font-medium leading-tight mt-1">פנוי</span>
              )}
              {!isPast && isWorking && dayAppts.length > 0 && freeSlots > 0 && (
                <span className="text-[9px] text-green-600 font-medium leading-tight">
                  +{freeSlots} פנויים
                </span>
              )}
              {!isPast && isWorking && dayAppts.length > 0 && freeSlots === 0 && (
                <span className="text-[9px] text-red-500 font-bold leading-tight">מלא</span>
              )}

              {/* Closed day */}
              {!isPast && !isWorking && (
                <span className="text-[10px] text-gray-400 font-medium leading-tight mt-1">סגור</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
