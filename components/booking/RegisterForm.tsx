'use client';

import { useState } from 'react';
import { registerNewCustomer } from '@/lib/supabase-store';
import { setCurrentCustomer } from '@/lib/store';
import { useTenant } from '@/contexts/TenantContext';
import { User, Phone, Clock, Bell } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface RegisterFormProps {
  onComplete: () => void;
}

async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export default function RegisterForm({ onComplete }: RegisterFormProps) {
  const { supabase, config } = useTenant();
  const { businessId, features, labels, id: tenantId, defaultColors, slug } = config;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; consent?: string }>({});
  const [pendingMessage, setPendingMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const brandPrimary = defaultColors.primary;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'נא להזין שם מלא';
    if (!phone.trim() || !/^0\d{8,9}$/.test(phone.replace(/[-\s]/g, '')))
      newErrors.phone = 'נא להזין מספר טלפון תקין';
    if (!privacyConsent) newErrors.consent = 'יש לאשר את מדיניות הפרטיות';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let notificationGranted = false;
      if (notifyEnabled) notificationGranted = await requestNotificationPermission();

      const customer = await registerNewCustomer(
        supabase, businessId,
        name.trim(), phone.replace(/[-\s]/g, ''),
        notificationGranted, features.autoApprove
      );
      setCurrentCustomer(tenantId, customer);

      if (customer.status === 'pending') {
        setPendingMessage(true);
      } else {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to register:', err);
      setErrors({ phone: 'שגיאה בהרשמה. נסה שוב.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingMessage) {
    if (features.autoApprove) { onComplete(); return null; }
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${brandPrimary}20` }}>
          <Clock size={28} style={{ color: brandPrimary }} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">נרשמת בהצלחה! 🎉</h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          ממתין לאישור ואז אפשר לקבוע {labels.bookings}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${brandPrimary}15` }}>
          <User size={24} style={{ color: brandPrimary }} />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">כמה פרטים קטנים ויוצאים לדרך</h3>
        <p className="text-sm text-gray-500">רק שם וטלפון ואפשר לקבוע {labels.booking}</p>
      </div>

      <Input label="שם מלא" type="text" placeholder="השם שלך" value={name}
        onChange={(e) => setName(e.target.value)} error={errors.name}
        icon={<User size={18} />} autoComplete="name" />

      <Input label="מספר טלפון" type="tel" placeholder="050-1234567" value={phone}
        onChange={(e) => setPhone(e.target.value)} error={errors.phone}
        icon={<Phone size={18} />} autoComplete="tel" dir="ltr" className="text-left" />

      <div className="bg-gray-50 rounded-xl p-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input type="checkbox" checked={notifyEnabled}
              onChange={(e) => setNotifyEnabled(e.target.checked)} className="sr-only peer" />
            <div className="w-10 h-6 bg-gray-300 rounded-full transition-colors"
              style={{ backgroundColor: notifyEnabled ? brandPrimary : undefined }} />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
              style={{ transform: notifyEnabled ? 'translateX(1rem)' : 'translateX(0)' }} />
          </div>
          <div className="flex items-center gap-1.5">
            <Bell size={15} style={{ color: brandPrimary }} />
            <span className="text-sm font-medium text-gray-700">קבלת עדכונים 🔔</span>
          </div>
        </label>
        <p className="text-[11px] text-gray-400 mt-1.5 mr-[52px]">
          תקבל עדכון כשתאושר כ{labels.customer} וכשיאושר {labels.booking}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={privacyConsent}
            onChange={(e) => { setPrivacyConsent(e.target.checked); if (e.target.checked) setErrors((p) => ({ ...p, consent: undefined })); }}
            className="mt-0.5 w-4 h-4 rounded" style={{ accentColor: brandPrimary }} />
          <span className="text-xs text-gray-600 leading-relaxed">
            אני מסכים/ה ל
            <a href={`/${slug}/privacy`} target="_blank" className="underline hover:opacity-80"
              style={{ color: brandPrimary }}>מדיניות הפרטיות</a>
            {' '}ולשמירת הפרטים שלי לצורך {labels.makeBooking} ויצירת קשר
          </span>
        </label>
        {errors.consent && <p className="text-xs text-red-500 mt-1.5 mr-7">{errors.consent}</p>}
      </div>

      <Button type="submit" variant="primary" className="w-full" size="lg" loading={submitting}>
        המשך ל{labels.makeBooking}
      </Button>
    </form>
  );
}
