'use client';

import { useState, useEffect } from 'react';
import { Service, DayAvailability } from '@/lib/types';
import { getCurrentCustomer, setCurrentCustomer } from '@/lib/store';
import { useAvailability, useProfile } from '@/hooks/useSupabase';
import { createAppointment, getAvailableSlotsAsync, checkCustomerStatus, fetchCustomerAppointments, SlotInfo } from '@/lib/supabase-store';
import { formatDate, formatPrice, formatDuration, generateCalendarLink, cn } from '@/lib/utils';
import { useTenant } from '@/contexts/TenantContext';
import {
  Calendar, Clock, ChevronRight, Check, CalendarPlus,
  Sparkles, MessageCircle, Hourglass,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import RegisterForm from './RegisterForm';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

interface BookingFlowProps {
  service: Service;
  onClose: () => void;
}

type Step = 'register' | 'date' | 'time' | 'confirm' | 'success';

export default function BookingFlow({ service, onClose }: BookingFlowProps) {
  const { supabase, config } = useTenant();
  const { businessId, labels, id: tenantId, defaultColors } = config;
  const brandPrimary = defaultColors.primary;

  const [step, setStep] = useState<Step>('register');

  useEffect(() => {
    const customer = getCurrentCustomer(tenantId);
    if (!customer) { setStep('register'); return; }
    checkCustomerStatus(supabase, businessId, customer.phone).then((serverStatus) => {
      if (serverStatus === 'approved') {
        const updated = { ...customer, status: 'approved' as const };
        setCurrentCustomer(tenantId, updated);
        setStep('date');
      } else if (serverStatus === 'pending') {
        setStep('register');
      } else {
        setStep('register');
      }
    }).catch(() => {
      const c = getCurrentCustomer(tenantId);
      if (c?.status === 'approved') setStep('date');
    });
  }, [supabase, businessId, tenantId]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const { profile: profileData } = useProfile();
  const maxDays = profileData?.maxBookingDays || 30;
  const { availability, loading: availabilityLoading } = useAvailability(maxDays === 0 ? 90 : maxDays);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [doubleBookError, setDoubleBookError] = useState(false);
  const [bookingLimitReached, setBookingLimitReached] = useState(false);

  useEffect(() => {
    const maxActive = profileData?.maxActiveBookings ?? 1;
    if (maxActive === 0 || step !== 'date') return;
    const customer = getCurrentCustomer(tenantId);
    if (!customer) return;
    fetchCustomerAppointments(supabase, businessId, customer.id)
      .then((appts) => { if (appts.length >= maxActive) setBookingLimitReached(true); })
      .catch(() => {});
  }, [step, profileData, supabase, businessId, tenantId]);

  useEffect(() => {
    if (selectedDate) {
      setSlotsLoading(true);
      getAvailableSlotsAsync(supabase, businessId, selectedDate, service.duration)
        .then((slots) => setAvailableSlots(slots))
        .catch(() => setAvailableSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedDate, service.duration, supabase, businessId]);

  const handleConfirm = async () => {
    const customer = getCurrentCustomer(tenantId);
    if (!customer) return;
    setLoading(true);
    try {
      await createAppointment(supabase, businessId, {
        customerId: customer.id,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        serviceId: service.id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        duration: service.duration,
        status: 'confirmed',
      });
      setStep('success');
    } catch (err) {
      if (err instanceof Error && err.message === 'DOUBLE_BOOKED') {
        setDoubleBookError(true);
        setSelectedTime('');
        setStep('time');
      }
    } finally {
      setLoading(false);
    }
  };

  const profile = profileData || { name: '', phone: '', instagram: '', address: '', description: '', images: [], enableBit: false, bitType: 'regular' as const, enablePaybox: false };
  const phoneNumber = profile.phone || '0500000000';
  const whatsappLink = `https://wa.me/972${phoneNumber.replace(/^0/, '')}`;
  const calendarLink = selectedDate && selectedTime
    ? generateCalendarLink(`${labels.booking} - ${service.name}`, selectedDate, selectedTime, service.duration, profile.name)
    : '';
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(`קבעתי ${labels.booking} ב-${profile.name}! ${service.name} ב-${selectedDate ? formatDate(selectedDate) : ''} בשעה ${selectedTime}`)}`;

  const steps: { key: Step; label: string }[] = [
    { key: 'register', label: 'הרשמה' },
    { key: 'date', label: 'תאריך' },
    { key: 'time', label: 'שעה' },
    { key: 'confirm', label: 'אישור' },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-[400px] flex flex-col">
      <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
        style={{ background: `linear-gradient(to left, ${brandPrimary}10, white)` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${brandPrimary}20` }}>
          <Sparkles size={20} style={{ color: brandPrimary }} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{service.name}</h3>
          <p className="text-sm text-gray-500">{formatPrice(service.price)} &middot; {formatDuration(service.duration)}</p>
        </div>
      </div>

      {step !== 'success' && (
        <div className="flex items-center gap-1 mb-6 px-2">
          {steps.map((s, i) => {
            if (s.key === 'register' && getCurrentCustomer(tenantId)) return null;
            const isActive = s.key === step;
            const isDone = i < currentStepIndex;
            return (
              <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
                <div className="h-1 w-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: isDone ? brandPrimary : isActive ? `${brandPrimary}80` : '#E5E7EB' }} />
                <span className="text-[10px]"
                  style={{ color: isActive ? brandPrimary : '#9CA3AF', fontWeight: isActive ? 500 : 400 }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1">
        {step === 'register' && (() => {
          const cust = getCurrentCustomer(tenantId);
          if (cust?.status === 'pending') {
            return (
              <div className="animate-fade-in text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${brandPrimary}15` }}>
                  <Hourglass size={28} style={{ color: brandPrimary }} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">ההרשמה שלך בבדיקה ✨</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  ברגע שתאושר תוכל לקבוע {labels.booking}
                </p>
              </div>
            );
          }
          if (cust?.status === 'rejected') {
            return (
              <div className="animate-fade-in text-center py-8">
                <p className="text-sm text-gray-500">לא ניתן לקבוע {labels.booking} כרגע.</p>
              </div>
            );
          }
          return <div className="animate-fade-in"><RegisterForm onComplete={() => setStep('date')} /></div>;
        })()}

        {step === 'date' && bookingLimitReached ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">יש לך כבר {labels.booking} קבוע 😊</h3>
          </div>
        ) : step === 'date' && (
          availabilityLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 animate-spin"
                style={{ borderTopColor: brandPrimary }} />
            </div>
          ) : (
            <DatePicker
              maxBookingDays={maxDays}
              availability={availability}
              selectedDate={selectedDate}
              onSelect={(date) => { setSelectedDate(date); setSelectedTime(''); setStep('time'); }}
              brandPrimary={brandPrimary}
            />
          )
        )}

        {step === 'time' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep('date')}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: brandPrimary }} />
                <span className="text-sm font-medium text-gray-600">{formatDate(selectedDate)}</span>
              </div>
            </div>
            {doubleBookError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-sm text-amber-700">אופס! מישהו הספיק לפנייך 😅 בחר שעה אחרת</p>
              </div>
            )}
            {slotsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 animate-spin"
                  style={{ borderTopColor: brandPrimary }} />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">אין שעות פנויות ביום זה</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setStep('date')}>בחר יום אחר</Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">באיזו שעה? ⏰ ({availableSlots.length} פנויות)</p>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button key={slot.time}
                      onClick={() => { setSelectedTime(slot.time); setDoubleBookError(false); setStep('confirm'); }}
                      className="py-3 px-2 rounded-xl text-center text-sm font-medium border-2 transition-all duration-200 cursor-pointer"
                      style={{
                        borderColor: selectedTime === slot.time ? brandPrimary : slot.preferred ? `${brandPrimary}60` : '#E5E7EB',
                        backgroundColor: selectedTime === slot.time ? `${brandPrimary}10` : slot.preferred ? `${brandPrimary}06` : 'transparent',
                        color: selectedTime === slot.time || slot.preferred ? brandPrimary : '#374151',
                      }}>
                      {slot.time}
                      {slot.preferred && <span className="block text-[9px] mt-0.5">מועדף</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="animate-fade-in">
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-6">
              <h3 className="font-bold text-gray-800 text-center mb-4">הכל נראה טוב? 👀</h3>
              <div className="space-y-3">
                {[
                  { label: labels.service, value: service.name },
                  { label: 'תאריך', value: formatDate(selectedDate) },
                  { label: 'שעה', value: selectedTime },
                  { label: 'משך', value: formatDuration(service.duration) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-gray-500">מחיר</span>
                  <span className="text-lg font-bold" style={{ color: brandPrimary }}>{formatPrice(service.price)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('time')}>חזרה</Button>
              <Button variant="primary" className="flex-1" onClick={handleConfirm} icon={<Check size={18} />} loading={loading}>
                אישור {labels.booking}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-scale-in text-center py-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: `${brandPrimary}20` }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: brandPrimary }}>
                <Check size={28} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">איזה כיף! 🎉 ה{labels.booking} נקבע</h2>
            <p className="text-gray-500 mb-6">
              {service.name} &middot; {formatDate(selectedDate)} בשעה {selectedTime}
            </p>
            <div className="rounded-2xl border-2 p-5 mb-6 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${brandPrimary}08, white, ${brandPrimary}08)`, borderColor: `${brandPrimary}40` }}>
              <div className="absolute top-0 left-0 w-full h-1"
                style={{ background: `linear-gradient(to left, ${brandPrimary}60, ${brandPrimary})` }} />
              <p className="text-xs font-medium mb-3" style={{ color: brandPrimary }}>{profile.name}</p>
              <p className="font-bold text-gray-800 text-lg mb-1">{service.name}</p>
              <p className="text-gray-600 text-sm mb-2">{formatDate(selectedDate)} | {selectedTime}</p>
              <p className="font-bold text-xl" style={{ color: brandPrimary }}>{formatPrice(service.price)}</p>
            </div>
            <div className="flex gap-3 mb-3">
              <a href={calendarLink} download="appointment.ics" className="flex-1">
                <Button variant="primary" className="w-full" icon={<CalendarPlus size={18} />}>הוספה ליומן 📅</Button>
              </a>
            </div>
            {(() => {
              const hasPayment = profile.enableBit || profile.enablePaybox;
              if (!hasPayment || service.price === 0) return null;
              const isBitBusiness = profile.bitType === 'business' && profile.bitLink;
              const bitUrl = isBitBusiness
                ? (profile.bitLink!.includes('?') ? `${profile.bitLink}&amount=${service.price}` : `${profile.bitLink}?amount=${service.price}`)
                : `https://www.bit.co.il/pay?phone=${profile.phone}&amount=${service.price}`;
              return (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 text-center mb-3">רוצה לסגור את התשלום עכשיו? 💁</p>
                  <div className="flex gap-2 justify-center">
                    {profile.enableBit && (
                      <a href={bitUrl} target="_blank" rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-[#3DD8C5] text-white text-sm font-bold hover:bg-[#2bc4b1] transition-colors">ביט</a>
                    )}
                    {profile.enablePaybox && profile.payboxLink && (
                      <a href={profile.payboxLink} target="_blank" rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-bold hover:bg-[#e55a25] transition-colors">פייבוקס</a>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-2">אפשר גם לשלם במפגש. בלי לחץ 😊</p>
                </div>
              );
            })()}
            <div className="mb-4">
              <a href={whatsappShareLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#1fb855] transition-colors">
                <WhatsAppIcon size={16} />שתף בוואטסאפ
              </a>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors">
                <MessageCircle size={14} />רוצה לשנות או לבטל? צור קשר בוואטסאפ 💬
              </a>
            </div>
            <Button variant="ghost" onClick={onClose} className="w-full">סגירה</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function DatePicker({
  availability, selectedDate, onSelect, maxBookingDays, brandPrimary,
}: {
  availability: DayAvailability[];
  selectedDate: string;
  onSelect: (date: string) => void;
  maxBookingDays?: number;
  brandPrimary: string;
}) {
  const today = new Date().toISOString().split('T')[0];
  let maxDate: string | null = null;
  if (maxBookingDays && maxBookingDays > 0) {
    const max = new Date();
    max.setDate(max.getDate() + maxBookingDays);
    maxDate = max.toISOString().split('T')[0];
  }
  const workingDays = availability.filter((d) => d.isWorking && d.date >= today && (!maxDate || d.date <= maxDate));
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="animate-fade-in">
      <p className="text-sm text-gray-500 mb-3">מתי נוח לך? 📅</p>
      <div className="grid grid-cols-2 gap-2">
        {workingDays.map((day) => {
          const date = new Date(day.date + 'T00:00:00');
          const isSelected = day.date === selectedDate;
          return (
            <button key={day.date} onClick={() => onSelect(day.date)}
              className="p-3 rounded-xl text-right transition-all duration-200 cursor-pointer border-2"
              style={{
                borderColor: isSelected ? brandPrimary : '#F3F4F6',
                backgroundColor: isSelected ? `${brandPrimary}08` : 'transparent',
              }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: isSelected ? brandPrimary : '#6B7280' }}>
                  {day.date === today ? 'היום' : `יום ${dayNames[date.getDay()]}`}
                </span>
                <span className="text-lg font-bold" style={{ color: isSelected ? brandPrimary : '#1F2937' }}>
                  {date.getDate()}
                </span>
              </div>
              <span className="text-[11px] text-gray-500">
                {day.slots.map((s) => `${s.start} > ${s.end}`).join(', ')}
              </span>
            </button>
          );
        })}
      </div>
      {workingDays.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">אין ימים פנויים כרגע</p>
        </div>
      )}
    </div>
  );
}
