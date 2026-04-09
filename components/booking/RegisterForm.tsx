'use client';

import { useState, useEffect } from 'react';
import { registerNewCustomer, uploadHealthDeclaration, fetchAutoApproveSetting, fetchPunchCardTypes } from '@/lib/supabase-store';
import type { CustomerExtendedFields } from '@/lib/supabase-store';
import { setCurrentCustomer } from '@/lib/store';
import { useTenant } from '@/contexts/TenantContext';
import { User, Phone, Clock, Bell, Upload } from 'lucide-react';
import { PunchCardType } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DateOfBirthInput from '@/components/ui/DateOfBirthInput';

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

  const isFitness = config.category === 'fitness';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; consent?: string }>({});
  const [pendingMessage, setPendingMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Extended fitness fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [gender, setGender] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [healthFile, setHealthFile] = useState<File | null>(null);
  const [cardTypes, setCardTypes] = useState<PunchCardType[]>([]);
  const [selectedCardTypeId, setSelectedCardTypeId] = useState('');

  useEffect(() => {
    fetchPunchCardTypes(supabase, businessId)
      .then(types => setCardTypes(types.filter(t => t.isActive)))
      .catch(() => { /* silent */ });
  }, [supabase, businessId]);

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

      // Resolve effective autoApprove from DB (overrides static config)
      const dbVal = await fetchAutoApproveSetting(supabase, businessId);
      const effectiveAutoApprove = dbVal !== null ? dbVal : features.autoApprove;

      // Build extended fields for fitness
      let extended: CustomerExtendedFields | undefined;
      if (isFitness) {
        extended = {};
        if (dateOfBirth) extended.dateOfBirth = dateOfBirth;
        if (idNumber.trim()) extended.idNumber = idNumber.trim();
        if (gender) extended.gender = gender as CustomerExtendedFields['gender'];
        if (paymentMethod) extended.paymentMethod = paymentMethod as CustomerExtendedFields['paymentMethod'];
      }

      const customer = await registerNewCustomer(
        supabase, businessId,
        name.trim(), phone.replace(/[-\s]/g, ''),
        notificationGranted, effectiveAutoApprove, extended
      );

      // If a punch card type was selected at registration, create a matching unpaid card
      if (selectedCardTypeId && customer.id) {
        try {
          const type = cardTypes.find(t => t.id === selectedCardTypeId);
          if (type) {
            const { createCustomerPunchCard } = await import('@/lib/supabase-store');
            let expiresAt: string | undefined;
            if (type.measurementType === 'months' && type.monthsCount) {
              const d = new Date();
              d.setMonth(d.getMonth() + type.monthsCount);
              expiresAt = d.toISOString();
            } else if (type.validityDays) {
              expiresAt = new Date(Date.now() + type.validityDays * 86400000).toISOString();
            }
            await createCustomerPunchCard(supabase, businessId, {
              customerId: customer.id,
              customerName: customer.fullName,
              punchCardTypeId: type.id,
              punchCardName: type.name,
              measurementType: type.measurementType,
              entriesTotal: type.measurementType === 'entries' ? type.entriesCount : 0,
              entriesUsed: 0,
              purchasedAt: new Date().toISOString(),
              expiresAt,
              isPaid: false,
            });
          }
        } catch (cardErr) {
          console.error('Failed to create punch card at registration:', cardErr);
        }
      }

      // Upload health declaration after customer is created (need customer.id)
      if (isFitness && healthFile && customer.id) {
        try {
          const url = await uploadHealthDeclaration(supabase, businessId, customer.id, healthFile);
          customer.healthDeclarationUrl = url;
          // Update customer record with the URL
          const { updateCustomerProfile } = await import('@/lib/supabase-store');
          await updateCustomerProfile(supabase, businessId, customer.id, { healthDeclarationUrl: url });
        } catch (uploadErr) {
          console.error('Health declaration upload failed:', uploadErr);
        }
      }

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

      {/* Extended fitness fields */}
      {isFitness && (
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">פרטים נוספים (אופציונלי — ניתן להשלים מאוחר יותר)</p>

          <DateOfBirthInput label="תאריך לידה" value={dateOfBirth} onChange={setDateOfBirth} />

          <Input label="תעודת זהות" type="text" placeholder="מספר ת.ז" value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)} dir="ltr" className="text-left" />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">מין</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-100 focus:outline-none transition-all text-sm text-gray-700">
              <option value="">לא צוין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">אופן תשלום</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-100 focus:outline-none transition-all text-sm text-gray-700">
              <option value="">לא צוין</option>
              <option value="cash">מזומן</option>
              <option value="bit">ביט</option>
              <option value="bank_transfer">העברה בנקאית</option>
              <option value="check">שיק</option>
            </select>
          </div>

          {cardTypes.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">סוג מוצר</label>
              <select value={selectedCardTypeId} onChange={(e) => setSelectedCardTypeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-100 focus:outline-none transition-all text-sm text-gray-700">
                <option value="">לא נבחר</option>
                {cardTypes.map(t => {
                  const desc =
                    t.measurementType === 'entries' ? `${t.entriesCount} כניסות` :
                    t.measurementType === 'months' ? `${t.monthsCount ?? ''} חודשים` :
                    'ללא הגבלה';
                  return <option key={t.id} value={t.id}>{t.name} — {desc} — ₪{t.price}</option>;
                })}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">הצהרת בריאות</label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 bg-white cursor-pointer hover:border-mint-400 transition-colors">
              <Upload size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 truncate">
                {healthFile ? healthFile.name : 'העלאת תמונה או מסמך'}
              </span>
              <input type="file" accept="image/*,.pdf" className="hidden"
                onChange={(e) => setHealthFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
      )}

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
