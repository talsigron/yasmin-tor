'use client';

import { useState, useEffect } from 'react';
import { Customer, CustomerPunchCard, PunchCardType, PaymentMethods, PAYMENT_METHOD_LABELS } from '@/lib/types';
import { useTenant } from '@/contexts/TenantContext';
import {
  updateCustomerProfile,
  fetchCustomerPunchCards,
  fetchPunchCardTypes,
  createCustomerPunchCard,
  deleteCustomerPunchCard,
  markPunchCardPaid,
  fetchProfile,
  deleteCustomer,
} from '@/lib/supabase-store';
import { X, CreditCard, Trash2, Plus, Save, Phone } from 'lucide-react';

interface Props {
  customer: Customer;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}

export default function CustomerDetailModal({ customer, onClose, onSaved, onDeleted }: Props) {
  const { supabase, config } = useTenant();
  const { businessId, defaultColors } = config;
  const brandPrimary = defaultColors.primary;

  const [fullName, setFullName] = useState(customer.fullName);
  const [phone, setPhone] = useState(customer.phone);
  const [dateOfBirth, setDateOfBirth] = useState(customer.dateOfBirth || '');
  const [gender, setGender] = useState(customer.gender || '');
  const [idNumber, setIdNumber] = useState(customer.idNumber || '');
  const [paymentMethod, setPaymentMethod] = useState(customer.paymentMethod || '');

  const [cards, setCards] = useState<CustomerPunchCard[]>([]);
  const [cardTypes, setCardTypes] = useState<PunchCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTypeId, setNewCardTypeId] = useState('');
  const [newCardPaid, setNewCardPaid] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [c, t, p] = await Promise.all([
          fetchCustomerPunchCards(supabase, businessId, customer.id),
          fetchPunchCardTypes(supabase, businessId),
          fetchProfile(supabase, businessId),
        ]);
        setCards(c);
        setCardTypes(t.filter(ct => ct.isActive));
        setProfile(p);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'שגיאה');
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase, businessId, customer.id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateCustomerProfile(supabase, businessId, customer.id, {
        dateOfBirth: dateOfBirth || null,
        idNumber: idNumber || null,
        gender: (gender as any) || null,
        paymentMethod: (paymentMethod as any) || null,
      });
      // Note: fullName and phone updates are not yet supported in updateCustomerProfile.
      // If needed, add those fields to the function.
      onSaved();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = async () => {
    const type = cardTypes.find(t => t.id === newCardTypeId);
    if (!type) return;
    try {
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
        isPaid: newCardPaid,
      });
      const fresh = await fetchCustomerPunchCards(supabase, businessId, customer.id);
      setCards(fresh);
      setShowAddCard(false);
      setNewCardTypeId('');
      setNewCardPaid(false);
    } catch (e: any) {
      setError(e?.message || 'שגיאה בהוספת כרטיסייה');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('למחוק את הכרטיסייה?')) return;
    try {
      await deleteCustomerPunchCard(supabase, id);
      setCards(cards.filter(c => c.id !== id));
    } catch (e: any) {
      setError(e?.message || 'שגיאה במחיקה');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCustomer(supabase, customer.id);
      onDeleted?.();
    } catch (e: any) {
      setError(e?.message || 'שגיאה במחיקה');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleMarkPaid = async (id: string, method: string) => {
    try {
      await markPunchCardPaid(supabase, id, method);
      const fresh = await fetchCustomerPunchCards(supabase, businessId, customer.id);
      setCards(fresh);
    } catch (e: any) {
      setError(e?.message || 'שגיאה');
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-[72px] sm:inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-full sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">{customer.fullName}</h2>
          <div className="flex items-center gap-2">
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="p-1 rounded-full hover:bg-red-50 text-red-400">
                <Trash2 size={18} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">למחוק את הלקוח?</span>
                <button onClick={handleDelete} disabled={deleting} className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-medium disabled:opacity-50">
                  {deleting ? '...' : 'כן'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
                  לא
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2">{error}</div>}

          {/* Basic info */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-700">פרטים אישיים</h3>
            <div>
              <label className="text-xs text-gray-500 block mb-1">שם מלא</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">טלפון</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                dir="ltr"
                className="w-full text-sm border border-gray-200 rounded-lg p-2 text-left"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">תאריך לידה</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">מין</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg p-2"
              >
                <option value="">— לא מוגדר —</option>
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">תעודת זהות</label>
              <input
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                dir="ltr"
                className="w-full text-sm border border-gray-200 rounded-lg p-2 text-left"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">אמצעי תשלום</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg p-2"
              >
                <option value="">— לא מוגדר —</option>
                {(Object.entries(profile?.paymentMethods ?? { bit: true, cash: true }) as [keyof PaymentMethods, boolean][])
                  .filter(([, enabled]) => enabled)
                  .map(([key]) => (
                    <option key={key} value={key}>{PAYMENT_METHOD_LABELS[key]}</option>
                  ))}
                {profile?.enablePaybox && (
                  <option value="paybox">{PAYMENT_METHOD_LABELS.paybox}</option>
                )}
              </select>
            </div>
          </div>

          {/* Punch cards */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <CreditCard size={14} /> כרטיסיות
              </h3>
              <button
                onClick={() => setShowAddCard(!showAddCard)}
                className="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ color: brandPrimary }}
              >
                <Plus size={12} /> הוספה
              </button>
            </div>

            {showAddCard && cardTypes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <select
                  value={newCardTypeId}
                  onChange={e => setNewCardTypeId(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2 bg-white"
                >
                  <option value="">— בחר סוג כרטיסייה —</option>
                  {cardTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.entriesCount} כניסות — ₪{t.price}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={newCardPaid} onChange={e => setNewCardPaid(e.target.checked)} />
                  שולם במלואו
                </label>
                <button
                  onClick={handleAddCard}
                  disabled={!newCardTypeId}
                  className="w-full py-2 rounded-lg text-white text-xs font-bold disabled:opacity-50"
                  style={{ backgroundColor: brandPrimary }}
                >
                  הוסף
                </button>
              </div>
            )}

            {loading ? (
              <p className="text-xs text-gray-400 text-center py-4">טוען...</p>
            ) : cards.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">אין כרטיסיות</p>
            ) : (
              <div className="space-y-2">
                {cards.map(c => (
                  <div key={c.id} className="bg-white border border-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{c.punchCardName}</p>
                        <p className="text-xs text-gray-500">
                          {c.entriesUsed}/{c.entriesTotal} כניסות
                        </p>
                        <p className="text-[10px] mt-1">
                          {c.isPaid ? (
                            <span className="text-green-600">✓ שולם</span>
                          ) : (
                            <span className="text-amber-600">⚠ לא שולם</span>
                          )}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteCard(c.id)} className="text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex gap-2">
              <a
                href={`tel:${customer.phone}`}
                className="flex-1 py-2 rounded-lg bg-mint-50 text-mint-700 text-xs font-medium flex items-center justify-center gap-1"
              >
                <Phone size={14} /> התקשר
              </a>
              <a
                href={`https://wa.me/972${customer.phone.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-medium flex items-center justify-center"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Sticky save button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-lg text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: brandPrimary }}
          >
            <Save size={16} />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>
    </div>
  );
}
