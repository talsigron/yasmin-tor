'use client';

import { useState } from 'react';
import { useAvailability, useDefaultHours } from '@/hooks/useSupabase';
import { TimeSlot } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Clock,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Save,
} from 'lucide-react';
import Button from '@/components/ui/Button';

type ScheduleView = 'daily' | 'weekly' | 'biweekly' | 'monthly';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

interface DefaultDayHours {
  dayOfWeek: number;
  isWorking: boolean;
  slots: TimeSlot[];
}

function getInitialDefaults(): DefaultDayHours[] {
  return [
    { dayOfWeek: 0, isWorking: true, slots: [{ start: '09:00', end: '15:00' }] },
    { dayOfWeek: 1, isWorking: true, slots: [{ start: '09:00', end: '15:00' }] },
    { dayOfWeek: 2, isWorking: true, slots: [{ start: '09:00', end: '15:00' }] },
    { dayOfWeek: 3, isWorking: true, slots: [{ start: '09:00', end: '15:00' }] },
    { dayOfWeek: 4, isWorking: true, slots: [{ start: '09:00', end: '15:00' }] },
    { dayOfWeek: 5, isWorking: false, slots: [] },
    { dayOfWeek: 6, isWorking: false, slots: [] },
  ];
}

export default function ScheduleManager() {
  const [view, setView] = useState<ScheduleView>('biweekly');
  const numDays = view === 'daily' ? 1 : view === 'weekly' ? 7 : view === 'biweekly' ? 14 : 30;
  const { availability, loading: availLoading, updateDay } = useAvailability(numDays);
  const { hours: defaultHoursData, loading: defaultsLoading, save: saveDefaultHoursAsync } = useDefaultHours();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showDefaults, setShowDefaults] = useState(false);
  const [localDefaults, setLocalDefaults] = useState<DefaultDayHours[]>(getInitialDefaults());
  const [defaultsSaved, setDefaultsSaved] = useState(false);
  const [defaultsInitialized, setDefaultsInitialized] = useState(false);

  // Sync fetched default hours into local state once loaded
  if (!defaultsInitialized && !defaultsLoading && defaultHoursData.length > 0) {
    const mapped = Array.from({ length: 7 }, (_, i) => {
      const found = defaultHoursData.find((h) => h.dayOfWeek === i);
      return found || getInitialDefaults()[i];
    });
    setLocalDefaults(mapped);
    setDefaultsInitialized(true);
  }

  const toggleWorking = async (date: string, currentlyWorking: boolean) => {
    const d = new Date(date + 'T00:00:00');
    const dayDefaults = localDefaults[d.getDay()];
    try {
      await updateDay(date, {
        isWorking: !currentlyWorking,
        slots: !currentlyWorking ? (dayDefaults.slots.length > 0 ? [...dayDefaults.slots] : [{ start: '09:00', end: '15:00' }]) : [],
      });
    } catch (err) {
      console.error('Failed to toggle working:', err);
    }
  };

  const updateSlot = async (
    date: string,
    slotIndex: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const day = availability.find((d) => d.date === date);
    if (!day) return;
    const newSlots = [...day.slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    try {
      await updateDay(date, { slots: newSlots });
      const updatedSlot = newSlots[slotIndex];
      if (updatedSlot.end && updatedSlot.start && updatedSlot.end < updatedSlot.start) {
        alert('שימי לב! שעת הסיום לפני שעת ההתחלה 🤔');
      }
    } catch (err) {
      console.error('Failed to update slot:', err);
    }
  };

  const addSlot = async (date: string) => {
    const day = availability.find((d) => d.date === date);
    if (!day) return;
    const newSlots = [...day.slots, { start: '14:00', end: '15:00' }];
    try {
      await updateDay(date, { slots: newSlots });
    } catch (err) {
      console.error('Failed to add slot:', err);
    }
  };

  const removeSlot = async (date: string, slotIndex: number) => {
    const day = availability.find((d) => d.date === date);
    if (!day) return;
    const newSlots = day.slots.filter((_, i) => i !== slotIndex);
    try {
      await updateDay(date, {
        slots: newSlots,
        isWorking: newSlots.length > 0,
      });
    } catch (err) {
      console.error('Failed to remove slot:', err);
    }
  };

  // Default hours handlers (local state only until save)
  const updateDefaultSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    const newDefaults = [...localDefaults];
    const newSlots = [...newDefaults[dayIndex].slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    newDefaults[dayIndex] = { ...newDefaults[dayIndex], slots: newSlots };
    setLocalDefaults(newDefaults);
  };

  const addDefaultSlot = (dayIndex: number) => {
    const newDefaults = [...localDefaults];
    newDefaults[dayIndex] = {
      ...newDefaults[dayIndex],
      slots: [...newDefaults[dayIndex].slots, { start: '14:00', end: '15:00' }],
    };
    setLocalDefaults(newDefaults);
  };

  const removeDefaultSlot = (dayIndex: number, slotIndex: number) => {
    const newDefaults = [...localDefaults];
    const newSlots = newDefaults[dayIndex].slots.filter((_, i) => i !== slotIndex);
    newDefaults[dayIndex] = { ...newDefaults[dayIndex], slots: newSlots, isWorking: newSlots.length > 0 };
    setLocalDefaults(newDefaults);
  };

  const toggleDefaultWorking = (dayIndex: number) => {
    const newDefaults = [...localDefaults];
    const current = newDefaults[dayIndex];
    newDefaults[dayIndex] = {
      ...current,
      isWorking: !current.isWorking,
      slots: !current.isWorking ? [{ start: '09:00', end: '15:00' }] : [],
    };
    setLocalDefaults(newDefaults);
  };

  const handleSaveDefaults = async () => {
    try {
      await saveDefaultHoursAsync(localDefaults);
      setDefaultsSaved(true);
      setTimeout(() => {
        setDefaultsSaved(false);
        setShowDefaults(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to save defaults:', err);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const visibleDays = availability;

  if (availLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-3 border-mint-200 border-t-mint-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">ניהול לוח זמנים</h2>
        <Button
          variant={showDefaults ? 'primary' : 'secondary'}
          size="sm"
          icon={<Settings size={14} />}
          onClick={() => setShowDefaults(!showDefaults)}
        >
          שעות קבועות
        </Button>
      </div>

      {/* Default Hours Editor */}
      {showDefaults && (
        <div className="bg-mint-50 rounded-2xl border border-mint-200 p-4 mb-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">⏰ שעות קבועות</h3>
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={12} />}
              onClick={handleSaveDefaults}
            >
              {defaultsSaved ? 'נשמר! ✨' : 'שמירה'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            הגדירי שעות קבועות לכל יום בשבוע. אפשר להוסיף כמה חלונות שרוצים (בוקר + ערב למשל) 😊
          </p>

          <div className="space-y-2">
            {DAY_NAMES.map((name, dayIndex) => {
              // Map: Sunday=0 in JS, but DAY_NAMES starts with ראשון=Sunday
              const dayData = localDefaults[dayIndex];
              return (
                <div key={dayIndex} className="bg-white rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">יום {name}</span>
                    <button
                      onClick={() => toggleDefaultWorking(dayIndex)}
                      className="cursor-pointer"
                    >
                      {dayData.isWorking ? (
                        <ToggleRight size={28} className="text-mint-500" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300" />
                      )}
                    </button>
                  </div>
                  {dayData.isWorking && (
                    <div className="space-y-1.5">
                      {dayData.slots.map((slot, si) => (
                        <div key={si} className="flex items-center gap-2" dir="ltr">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateDefaultSlot(dayIndex, si, 'start', e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm w-24 focus:border-mint-400 focus:outline-none"
                          />
                          <span className="text-gray-400 text-xs">&gt;</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateDefaultSlot(dayIndex, si, 'end', e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm w-24 focus:border-mint-400 focus:outline-none"
                          />
                          {dayData.slots.length > 1 && (
                            <button
                              onClick={() => removeDefaultSlot(dayIndex, si)}
                              className="p-1 text-red-400 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addDefaultSlot(dayIndex)}
                        className="flex items-center gap-1 text-[10px] text-mint-600 hover:text-mint-700 cursor-pointer"
                      >
                        <Plus size={10} />
                        חלון נוסף
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View selector */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {(['daily', 'weekly', 'biweekly', 'monthly'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
              view === v
                ? 'bg-white text-mint-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {v === 'daily' ? 'יומי' : v === 'weekly' ? 'שבועי' : v === 'biweekly' ? 'דו-שבועי' : 'חודשי'}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        לחצי על יום כדי לערוך שעות. השעות הקבועות מתמלאות אוטומטית 🪄
      </p>

      <div className="space-y-2">
        {visibleDays.map((day) => {
          const isExpanded = expandedDay === day.date;
          const date = new Date(day.date + 'T00:00:00');
          const isPast = day.date < today;
          const isToday = day.date === today;
          const dateDisplay = `${date.getDate()}.${date.getMonth() + 1}`;

          return (
            <div
              key={day.date}
              className={cn(
                'bg-white rounded-xl border transition-all',
                isExpanded ? 'border-mint-200 shadow-sm' : 'border-gray-100',
                isPast && 'opacity-50 pointer-events-none'
              )}
            >
              {/* Day header */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                className="w-full p-4 flex items-center justify-between cursor-pointer"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold',
                      day.isWorking
                        ? 'bg-mint-50 text-mint-600'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {dateDisplay}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        יום {DAY_NAMES[date.getDay()]}
                      </span>
                      {isToday && (
                        <span className="text-[10px] bg-mint-100 text-mint-600 px-1.5 py-0.5 rounded-full">
                          היום
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {day.isWorking
                        ? day.slots
                            .map((s) => `${s.start} > ${s.end}`)
                            .join(' | ')
                        : 'לא עובדת'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWorking(day.date, day.isWorking);
                    }}
                    className="cursor-pointer"
                  >
                    {day.isWorking ? (
                      <ToggleRight size={36} className="text-mint-500" />
                    ) : (
                      <ToggleLeft size={36} className="text-gray-300" />
                    )}
                  </button>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded slots editor */}
              {isExpanded && day.isWorking && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 animate-fade-in">
                  <div className="space-y-2">
                    {day.slots.map((slot, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
                      >
                        <Clock size={14} className="text-gray-400 shrink-0" />
                        <div className="flex items-center gap-2 flex-1" dir="ltr">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              updateSlot(day.date, i, 'start', e.target.value)
                            }
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-24 focus:border-mint-400 focus:outline-none"
                          />
                          <span className="text-gray-400 text-xs">&gt;</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              updateSlot(day.date, i, 'end', e.target.value)
                            }
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-24 focus:border-mint-400 focus:outline-none"
                          />
                        </div>
                        {day.slots.length > 1 && (
                          <button
                            onClick={() => removeSlot(day.date, i)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addSlot(day.date)}
                    className="mt-2 flex items-center gap-1.5 text-xs text-mint-600 hover:text-mint-700 px-2 py-1.5 rounded-lg hover:bg-mint-50 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    הוספת חלון שעות
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
