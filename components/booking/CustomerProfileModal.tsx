'use client';

import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Customer } from '@/lib/types';
import { updateCustomerProfile, uploadHealthDeclaration, CustomerExtendedFields } from '@/lib/supabase-store';
import { setCurrentCustomer } from '@/lib/store';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Upload, Check, X as XIcon } from 'lucide-react';
import DateOfBirthInput from '@/components/ui/DateOfBirthInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onUpdate: (updated: Customer) => void;
}

const GENDER_MAP: Record<string, string> = { male: 'זכר', female: 'נקבה', other: 'אחר' };
const PAYMENT_MAP: Record<string, string> = { cash: 'מזומן', bit: 'ביט', bank_transfer: 'העברה בנקאית', check: 'שיק' };

export default function CustomerProfileModal({ isOpen, onClose, customer, onUpdate }: Props) {
  const { supabase, config } = useTenant();
  const { businessId, id: tenantId } = config;

  const [dateOfBirth, setDateOfBirth] = useState(customer.dateOfBirth ?? '');
  const [idNumber, setIdNumber] = useState(customer.idNumber ?? '');
  const [gender, setGender] = useState(customer.gender ?? '');
  const [paymentMethod, setPaymentMethod] = useState(customer.paymentMethod ?? '');
  const [healthFile, setHealthFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const hasHealthDecl = !!customer.healthDeclarationUrl;

  const fields = [
    { label: 'תעודת זהות', filled: !!customer.idNumber },
    { label: 'תאריך לידה', filled: !!customer.dateOfBirth },
    { label: 'מין', filled: !!customer.gender },
    { label: 'אופן תשלום', filled: !!customer.paymentMethod },
    { label: 'הצהרת בריאות', filled: hasHealthDecl },
  ];
  const filledCount = fields.filter((f) => f.filled).length;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: CustomerExtendedFields = {};
      if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
      if (idNumber.trim()) updates.idNumber = idNumber.trim();
      if (gender) updates.gender = gender as CustomerExtendedFields['gender'];
      if (paymentMethod) updates.paymentMethod = paymentMethod as CustomerExtendedFields['paymentMethod'];

      if (healthFile) {
        const url = await uploadHealthDeclaration(supabase, businessId, customer.id, healthFile);
        updates.healthDeclarationUrl = url;
      }

      await updateCustomerProfile(supabase, businessId, customer.id, updates);

      const updated: Customer = {
        ...customer,
        dateOfBirth: updates.dateOfBirth ?? customer.dateOfBirth,
        idNumber: updates.idNumber ?? customer.idNumber,
        gender: (updates.gender ?? customer.gender) as Customer['gender'],
        paymentMethod: (updates.paymentMethod ?? customer.paymentMethod) as Customer['paymentMethod'],
        healthDeclarationUrl: updates.healthDeclarationUrl ?? customer.healthDeclarationUrl,
      };
      setCurrentCustomer(tenantId, updated);
      onUpdate(updated);
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="הפרופיל שלי"
      footer={
        <div className="flex gap-3 px-6 pb-6 pt-3 border-t border-gray-100">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            ביטול
          </Button>
          <Button type="button" variant="primary" className="flex-1" onClick={handleSave} loading={saving}>
            שמירה
          </Button>
        </div>
      }
    >
      {/* Completion status */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">השלמת פרופיל ({filledCount}/5)</p>
        <div className="flex gap-1.5 flex-wrap">
          {fields.map((f) => (
            <span key={f.label} className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5 ${f.filled ? 'bg-mint-50 text-mint-700' : 'bg-red-50 text-red-500'}`}>
              {f.filled ? <Check size={9} /> : <XIcon size={9} />}
              {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Read-only fields */}
      <div className="space-y-1.5 mb-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>שם</span>
          <span className="font-medium text-gray-800">{customer.fullName}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>טלפון</span>
          <span className="font-medium text-gray-800" dir="ltr">{customer.phone}</span>
        </div>
      </div>

      {/* Editable fields */}
      <div className="space-y-3">
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

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">הצהרת בריאות</label>
          {hasHealthDecl && !healthFile && (
            <p className="text-xs text-mint-600 mb-1 flex items-center gap-1">
              <Check size={12} /> הועלה בעבר
            </p>
          )}
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 bg-white cursor-pointer hover:border-mint-400 transition-colors">
            <Upload size={16} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-500 truncate">
              {healthFile ? healthFile.name : hasHealthDecl ? 'החלפת קובץ' : 'העלאת תמונה או מסמך'}
            </span>
            <input type="file" accept="image/*,.pdf" className="hidden"
              onChange={(e) => setHealthFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      </div>
    </Modal>
  );
}
