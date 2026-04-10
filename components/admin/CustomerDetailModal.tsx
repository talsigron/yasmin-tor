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
  updateCustomerPunchCard,
  markPunchCardPaid,
  fetchProfile,
  deleteCustomer,
  createTransaction,
} from '@/lib/supabase-store';
import { X, CreditCard, Trash2, Plus, Save, Phone, Pencil } from 'lucide-react';

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
  const [showPayForCard, setShowPayForCard] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('מזומן');
  const [paying, setPaying] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardTypeId, setEditCardTypeId] = useState('');
  const [editEntriesUsed, setEditEntriesUsed] = useState('');
  const [savingCard, setSavingCard] = useState(false);

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

  const handlePay = async () => {
    if (!showPayForCard) return;
    const card = cards.find(c => c.id === showPayForCard);
    const type = cardTypes.find(t => t.id === card?.punchCardTypeId);
    if (!card || !type) return;
    setPaying(true);
    try {
      const amount = payAmount ? parseFloat(payAmount) : type.price;
      const isFullPayment = amount >= type.price;
      if (isFullPayment) await markPunchCardPaid(supabase, showPayForCard, payMethod);
      await createTransaction(supabase, businessId, {
        customerId: customer.id,
        customerName: customer.fullName,
        description: `תשלום עבור ${card.punchCardName}`,
        amount,
        paymentMethod: payMethod,
        transactionDate: new Date().toISOString(),
        referenceType: 'punch_card',
        referenceId: showPayForCard,
      });
      const fresh = await fetchCustomerPunchCards(supabase, businessId, customer.id);
      setCards(fresh);
      setShowPayForCard(null);
      setPayAmount('');
      setPayMethod('מזומן');
    } catch (e: any) {
      setError(e?.message || 'שגיאה בתשלום');
    } finally {
      setPaying(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCustomer(supabase, customer.id, businessId);
      onDeleted?.();
    } catch (e: any) {
      setError(e?.message || 'שגיאה במחיקה');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const startEditCard = (card: CustomerPunchCard) => {
    setEditingCardId(card.id);
    setEditCardTypeId(card.punchCardTypeId ?? '');
    setEditEntriesUsed(String(card.entriesUsed));
  };

  const handleSaveCardEdit = async () => {
    if (!editingCardId) return;
    setSavingCard(true);
    try {
      const card = cards.find(c => c.id === editingCardId);
      if (!card) return;
      const newType = cardTypes.find(t => t.id === editCardTypeId);
      const typeChanged = newType && editCardTypeId !== card.punchCardTypeId;

      const updates: Parameters<typeof updateCustomerPunchCard>[2] = {
        entriesUsed: parseInt(editEntriesUsed) || 0,
      };

      if (typeChanged && newType) {
        updates.punchCardTypeId = newType.id;
        updates.punchCardName = newType.name;
        updates.measurementType = newType.measurementType;
        updates.entriesTotal = newType.measurementType === 'entries' ? newType.entriesCount : 0;
        // Recalc expiry for time-based types
        if (newType.measurementType === 'months' && newType.monthsCount) {
          const d = new Date();
          d.setMonth(d.getMonth() + newType.monthsCount);
          updates.expiresAt = d.toISOString();
        } else if (newType.validityDays) {
          updates.expiresAt = new Date(Date.now() + newType.validityDays * 86400000).toISOString();
        } else {
          updates.expiresAt = null;
        }
      }

      await updateCustomerPunchCard(supabase, editingCardId, updates);
      const fresh = await fetchCustomerPunchCards(supabase, businessId, customer.id);
      setCards(fresh);
      setEditingCardId(null);
    } catch (e: any) {
      setError(e?.message || 'שגיאה בעדכון כרטיסייה');
    } finally {
      setSavingCard(false);
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
      <div className="bg-white w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[calc(100svh-72px)] sm:max-h-[calc(100vh-120px)]">
        <div className="shrink-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    {editingCardId === c.id ? (
                      /* Edit mode */
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 block">סוג כרטיסייה</label>
                        <select
                          value={editCardTypeId}
                          onChange={e => setEditCardTypeId(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-lg p-2 bg-white"
                        >
                          {cardTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                          {/* Keep current type even if inactive */}
                          {!cardTypes.find(t => t.id === editCardTypeId) && (
                            <option value={editCardTypeId}>{c.punchCardName} (לא פעיל)</option>
                          )}
                        </select>
                        {(() => {
                          const selType = cardTypes.find(t => t.id === editCardTypeId);
                          const mType = selType?.measurementType ?? c.measurementType;
                          return mType === 'entries' ? (
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                כניסות שנוצלו (מתוך {selType ? selType.entriesCount : c.entriesTotal})
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={selType ? selType.entriesCount : c.entriesTotal}
                                value={editEntriesUsed}
                                onChange={e => setEditEntriesUsed(e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-lg p-2"
                              />
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">
                              {mType === 'unlimited' ? 'ללא הגבלת כניסות' : 'כרטיסייה חודשית — תאריך תפוגה יתעדכן'}
                            </p>
                          );
                        })()}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleSaveCardEdit}
                            disabled={savingCard}
                            className="flex-1 py-2 rounded-lg text-white text-xs font-bold disabled:opacity-50"
                            style={{ backgroundColor: brandPrimary }}
                          >
                            {savingCard ? '...' : 'שמור'}
                          </button>
                          <button
                            onClick={() => setEditingCardId(null)}
                            className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold"
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display mode */
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{c.punchCardName}</p>
                          <p className="text-xs text-gray-500">
                            {c.measurementType === 'unlimited'
                              ? 'ללא הגבלת כניסות'
                              : c.measurementType === 'months'
                              ? `כרטיסייה חודשית`
                              : `${c.entriesUsed}/${c.entriesTotal} כניסות`}
                          </p>
                          <p className="text-[10px] mt-1">
                            {c.isPaid ? (
                              <span className="text-green-600">✓ שולם</span>
                            ) : (
                              <button
                                onClick={() => { setShowPayForCard(c.id); setPayAmount(''); setPayMethod('מזומן'); }}
                                className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg text-[10px] font-medium hover:bg-amber-100"
                              >
                                ⚠ לא שולם — גבה
                              </button>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => startEditCard(c)} className="text-gray-300 hover:text-gray-600 active:scale-90 transition-transform">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteCard(c.id)} className="text-gray-300 hover:text-red-500 active:scale-90 transition-transform">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
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

        {/* Save button — outside scroll area, always visible */}
        <div className="shrink-0 bg-white border-t border-gray-100 p-4">
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

      {/* Payment modal */}
      {showPayForCard && (() => {
        const card = cards.find(c => c.id === showPayForCard);
        const type = cardTypes.find(t => t.id === card?.punchCardTypeId);
        const fullPrice = type?.price || 0;
        const entered = payAmount ? parseFloat(payAmount) : fullPrice;
        const isPartial = payAmount !== '' && entered < fullPrice;
        const enabledMethods = Object.entries(profile?.paymentMethods ?? { bit: true, cash: true }) as [keyof PaymentMethods, boolean][];
        const payMethods = [
          ...enabledMethods.filter(([, v]) => v).map(([k]) => ({ key: k, label: PAYMENT_METHOD_LABELS[k] })),
          ...(profile?.enablePaybox ? [{ key: 'paybox', label: PAYMENT_METHOD_LABELS.paybox }] : []),
        ];
        return (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPayForCard(null)}>
            <div className="bg-white rounded-2xl p-5 w-full max-w-xs" onClick={e => e.stopPropagation()}>
              <p className="font-bold text-gray-800 mb-1 text-center">גביית תשלום</p>
              <p className="text-xs text-gray-500 text-center mb-4">{customer.fullName} — {card?.punchCardName}</p>
              <label className="text-xs text-gray-600 mb-1 block">סכום לגביה</label>
              <div className="relative mb-1">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  placeholder={String(fullPrice)}
                  className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-gray-200 text-sm text-right" dir="ltr" />
              </div>
              {isPartial ? (
                <p className="text-xs text-orange-500 mb-3 bg-orange-50 rounded-lg px-2 py-1">תשלום חלקי — הכרטיסייה תישאר כ"לא שולם"</p>
              ) : (
                <p className="text-xs text-green-600 mb-3">מחיר מלא: ₪{fullPrice}</p>
              )}
              <p className="text-xs text-gray-600 mb-2">אמצעי תשלום</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {payMethods.map(m => (
                  <button key={m.key} onClick={() => setPayMethod(m.label)}
                    className={`py-2 rounded-xl text-xs font-medium ${payMethod === m.label ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                    style={payMethod === m.label ? { backgroundColor: brandPrimary } : {}}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handlePay} disabled={paying}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${isPartial ? 'bg-orange-500' : 'bg-green-500'}`}>
                  {paying ? '...' : isPartial ? 'רשום חלקי' : 'אשר תשלום'}
                </button>
                <button onClick={() => setShowPayForCard(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm">ביטול</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
