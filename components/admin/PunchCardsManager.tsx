'use client';

import { useState, useEffect } from 'react';
import { PunchCardType, CustomerPunchCard, Customer } from '@/lib/types';
import { useTenant } from '@/contexts/TenantContext';
import {
  fetchPunchCardTypes, createPunchCardType, updatePunchCardType, deletePunchCardType,
  fetchCustomerPunchCards, createCustomerPunchCard, markPunchCardPaid,
  usePunchCardEntry, deleteCustomerPunchCard, fetchCustomers, createTransaction,
} from '@/lib/supabase-store';
import { Plus, Edit2, Trash2, CheckCircle, MinusCircle } from 'lucide-react';

const PAYMENT_METHODS = ['מזומן', 'ביט', 'פייבוקס'] as const;

export default function PunchCardsManager() {
  const { supabase, config } = useTenant();
  const { businessId } = config;

  const [cardTypes, setCardTypes] = useState<PunchCardType[]>([]);
  const [customerCards, setCustomerCards] = useState<CustomerPunchCard[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cards' | 'near_end' | 'debts' | 'types'>('cards');

  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<PunchCardType | null>(null);
  const [typeForm, setTypeForm] = useState({
    name: '',
    measurementType: 'entries' as 'entries' | 'months' | 'unlimited',
    entriesCount: '10',
    monthsCount: '1',
    price: '',
    validityDays: '',
    nearEndDays: '3',
  });

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({ customerId: '', punchCardTypeId: '', isPaid: false, paymentMethod: 'מזומן' });

  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<string>('מזומן');
  const [payAmount, setPayAmount] = useState<string>('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [types, cards, custs] = await Promise.all([
        fetchPunchCardTypes(supabase, businessId),
        fetchCustomerPunchCards(supabase, businessId),
        fetchCustomers(supabase, businessId),
      ]);
      setCardTypes(types);
      setCustomerCards(cards);
      setCustomers(custs.filter(c => c.status === 'approved'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function saveType() {
    if (!typeForm.name || !typeForm.price) return;
    try {
      const d: Omit<PunchCardType, 'id' | 'businessId' | 'createdAt'> = {
        name: typeForm.name,
        measurementType: typeForm.measurementType,
        entriesCount: typeForm.measurementType === 'entries' ? Number(typeForm.entriesCount) : 0,
        monthsCount: typeForm.measurementType === 'months' ? Number(typeForm.monthsCount) : undefined,
        price: Number(typeForm.price),
        validityDays: typeForm.validityDays ? Number(typeForm.validityDays) : undefined,
        nearEndDays: typeForm.nearEndDays ? Number(typeForm.nearEndDays) : 3,
        isActive: true,
      };
      if (editingType) await updatePunchCardType(supabase, editingType.id, d);
      else await createPunchCardType(supabase, businessId, d);
      setShowTypeForm(false); setEditingType(null);
      setTypeForm({ name: '', measurementType: 'entries', entriesCount: '10', monthsCount: '1', price: '', validityDays: '', nearEndDays: '3' });
      loadAll();
    } catch (e) { console.error(e); }
  }

  async function handleAssign() {
    const type = cardTypes.find(t => t.id === assignForm.punchCardTypeId);
    const customer = customers.find(c => c.id === assignForm.customerId);
    if (!type || !customer) return;
    try {
      // Compute expiresAt based on measurement type
      let expiresAt: string | undefined;
      if (type.measurementType === 'months' && type.monthsCount) {
        const d = new Date();
        d.setMonth(d.getMonth() + type.monthsCount);
        expiresAt = d.toISOString();
      } else if (type.validityDays) {
        expiresAt = new Date(Date.now() + type.validityDays * 86400000).toISOString();
      }

      const card = await createCustomerPunchCard(supabase, businessId, {
        customerId: customer.id, customerName: customer.fullName,
        punchCardTypeId: type.id, punchCardName: type.name,
        measurementType: type.measurementType,
        entriesTotal: type.measurementType === 'entries' ? type.entriesCount : 0,
        entriesUsed: 0,
        isPaid: assignForm.isPaid, paymentMethod: assignForm.isPaid ? assignForm.paymentMethod : undefined,
        purchasedAt: new Date().toISOString(), expiresAt,
      });
      if (assignForm.isPaid) {
        await createTransaction(supabase, businessId, {
          customerId: customer.id, customerName: customer.fullName,
          description: `תשלום עבור ${type.name}`,
          amount: type.price, paymentMethod: assignForm.paymentMethod,
          transactionDate: new Date().toISOString(),
          referenceType: 'punch_card', referenceId: card.id,
        });
      }
      setShowAssignForm(false);
      setAssignForm({ customerId: '', punchCardTypeId: '', isPaid: false, paymentMethod: 'מזומן' });
      loadAll();
    } catch (e) { console.error(e); }
  }

  async function handleMarkPaid(cardId: string) {
    const card = customerCards.find(c => c.id === cardId);
    if (!card) return;
    const type = cardTypes.find(t => t.id === card.punchCardTypeId);
    const fullPrice = type?.price || 0;
    const amount = payAmount ? Number(payAmount) : fullPrice;
    const isFullPayment = amount >= fullPrice;
    try {
      if (isFullPayment) {
        await markPunchCardPaid(supabase, cardId, payMethod);
      }
      await createTransaction(supabase, businessId, {
        customerId: card.customerId, customerName: card.customerName,
        description: isFullPayment
          ? `תשלום עבור ${card.punchCardName}`
          : `תשלום חלקי (₪${amount} מתוך ₪${fullPrice}) עבור ${card.punchCardName}`,
        amount, paymentMethod: payMethod,
        transactionDate: new Date().toISOString(),
        referenceType: 'punch_card', referenceId: cardId,
      });
      setShowPayModal(null);
      setPayAmount('');
      loadAll();
    } catch (e) { console.error(e); }
  }

  const formatDate = (s?: string) => {
    if (!s) return '';
    const d = new Date(s);
    return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${String(d.getFullYear()).slice(2)}`;
  };

  const daysUntilExpiry = (card: CustomerPunchCard): number | null => {
    if (!card.expiresAt) return null;
    return Math.ceil((new Date(card.expiresAt).getTime() - Date.now()) / 86400000);
  };

  const isExpired = (card: CustomerPunchCard) => {
    if (card.expiresAt && new Date(card.expiresAt) < new Date()) return true;
    return false;
  };

  const isNearEnd = (card: CustomerPunchCard): boolean => {
    const type = cardTypes.find(t => t.id === card.punchCardTypeId);
    const threshold = type?.nearEndDays ?? 3;
    if (card.measurementType === 'months' || card.measurementType === 'unlimited') {
      const days = daysUntilExpiry(card);
      return days !== null && days <= threshold && days >= 0;
    }
    // entries-based
    const rem = card.entriesTotal - card.entriesUsed;
    return rem > 0 && rem <= 2;
  };

  const isFullyUsed = (card: CustomerPunchCard): boolean => {
    if (card.measurementType === 'entries') return card.entriesUsed >= card.entriesTotal;
    return false; // time-based and unlimited don't get "used up" by entries
  };

  const getStatus = (card: CustomerPunchCard) => {
    if (!card.isPaid) return { cls: 'bg-red-100 text-red-700', label: 'לא שולם' };
    if (isExpired(card)) return { cls: 'bg-gray-100 text-gray-500', label: 'פג תוקף' };
    if (isFullyUsed(card)) return { cls: 'bg-gray-100 text-gray-500', label: 'נוצל' };
    if (isNearEnd(card)) {
      if (card.measurementType === 'months' || card.measurementType === 'unlimited') {
        const days = daysUntilExpiry(card);
        return { cls: 'bg-orange-100 text-orange-700', label: `לפני סיום (${days}י׳)` };
      }
      const rem = card.entriesTotal - card.entriesUsed;
      return { cls: 'bg-orange-100 text-orange-700', label: `נשארו ${rem}` };
    }
    return { cls: 'bg-green-100 text-green-700', label: 'פעיל' };
  };

  const activeCards = customerCards.filter(c => c.isPaid && !isFullyUsed(c) && !isExpired(c));
  const almostDone = customerCards.filter(c => c.isPaid && !isFullyUsed(c) && !isExpired(c) && isNearEnd(c));
  const debtCards = customerCards.filter(c => !c.isPaid);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: '#6366f1' }} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setActiveTab('cards')} className="bg-green-50 rounded-xl p-3 text-center cursor-pointer">
          <p className="text-2xl font-bold text-green-700">{activeCards.length}</p>
          <p className="text-xs text-green-600 mt-0.5">פעילות</p>
        </button>
        <button onClick={() => setActiveTab('near_end')} className="bg-orange-50 rounded-xl p-3 text-center cursor-pointer">
          <p className="text-2xl font-bold text-orange-600">{almostDone.length}</p>
          <p className="text-xs text-orange-500 mt-0.5">לפני סיום</p>
        </button>
        <button onClick={() => setActiveTab('debts')} className="bg-red-50 rounded-xl p-3 text-center cursor-pointer">
          <p className="text-2xl font-bold text-red-600">{debtCards.length}</p>
          <p className="text-xs text-red-500 mt-0.5">חובות</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          ['cards','כרטיסיות'],
          ['near_end',`לפני סיום (${almostDone.length})`],
          ['debts',`חובות (${debtCards.length})`],
          ['types','סוגים']
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${activeTab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* CARDS TAB */}
      {activeTab === 'cards' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">כרטיסיות לקוחות</span>
            <button onClick={() => setShowAssignForm(!showAssignForm)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white rounded-xl text-xs font-medium cursor-pointer">
              <Plus size={13} /> הקצה כרטיסייה
            </button>
          </div>

          {showAssignForm && (
            <div className="bg-indigo-50 rounded-xl p-4 space-y-3 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-700">הקצאת כרטיסייה ללקוח</p>
              <select value={assignForm.customerId} onChange={e => setAssignForm(p => ({...p, customerId: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="">— בחר לקוח —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
              <select value={assignForm.punchCardTypeId} onChange={e => setAssignForm(p => ({...p, punchCardTypeId: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="">— בחר סוג כרטיסייה —</option>
                {cardTypes.filter(t => t.isActive).map(t => {
                  const desc =
                    t.measurementType === 'entries' ? `${t.entriesCount} כניסות` :
                    t.measurementType === 'months' ? `${t.monthsCount ?? ''} חודשים` :
                    'ללא הגבלה';
                  return <option key={t.id} value={t.id}>{t.name} ({desc} — ₪{t.price})</option>;
                })}
              </select>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={assignForm.isPaid} onChange={e => setAssignForm(p => ({...p, isPaid: e.target.checked}))} />
                שולם עכשיו
              </label>
              {assignForm.isPaid && (
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m} onClick={() => setAssignForm(p => ({...p, paymentMethod: m}))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${assignForm.paymentMethod === m ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={handleAssign} disabled={!assignForm.customerId || !assignForm.punchCardTypeId}
                  className="flex-1 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50">הקצה</button>
                <button onClick={() => setShowAssignForm(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium cursor-pointer">ביטול</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {customerCards.length === 0 && <p className="text-center text-gray-400 text-sm py-6">אין כרטיסיות עדיין</p>}
            {customerCards.map(card => {
              const { cls, label } = getStatus(card);
              const isEntries = card.measurementType === 'entries';
              const pct = isEntries && card.entriesTotal > 0
                ? Math.round((card.entriesUsed / card.entriesTotal) * 100)
                : 0;
              const canUseEntry = isEntries && card.entriesUsed < card.entriesTotal;
              return (
                <div key={card.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{card.customerName}</p>
                      <p className="text-xs text-gray-500">{card.punchCardName}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
                  </div>
                  {isEntries ? (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{card.entriesUsed} שומשו</span>
                        <span>{card.entriesTotal - card.entriesUsed} נשארו מתוך {card.entriesTotal}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                  ) : (
                    <div className="mb-2 text-xs text-gray-500">
                      {card.measurementType === 'months' ? '⏳ כרטיסייה על בסיס חודשים' : '♾️ ללא הגבלת כניסות'}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{card.expiresAt ? `עד ${formatDate(card.expiresAt)}` : 'ללא תוקף'}</span>
                    <div className="flex gap-1">
                      {!card.isPaid && (
                        <button onClick={() => { setShowPayModal(card.id); setPayMethod('מזומן'); setPayAmount(''); }}
                          className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs cursor-pointer hover:bg-red-100">
                          <CheckCircle size={11} /> גבה
                        </button>
                      )}
                      {card.isPaid && (
                        <button onClick={() => { setShowPayModal(card.id); setPayMethod('מזומן'); setPayAmount(''); }}
                          className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs cursor-pointer hover:bg-indigo-100">
                          <CheckCircle size={11} /> תשלום נוסף
                        </button>
                      )}
                      {canUseEntry && (
                        <button onClick={() => usePunchCardEntry(supabase, card.id).then(loadAll)}
                          className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs cursor-pointer hover:bg-indigo-100">
                          <MinusCircle size={11} /> ניצל
                        </button>
                      )}
                      <button onClick={() => { if (confirm('למחוק?')) deleteCustomerPunchCard(supabase, card.id).then(loadAll); }}
                        className="p-1 text-gray-300 hover:text-red-400 cursor-pointer"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NEAR END TAB */}
      {activeTab === 'near_end' && (
        <div className="space-y-2">
          {almostDone.length === 0 && <div className="text-center py-10 text-gray-400">אין כרטיסיות לפני סיום 🎉</div>}
          {almostDone.map(card => {
            const { cls, label } = getStatus(card);
            return (
              <div key={card.id} className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{card.customerName}</p>
                    <p className="text-xs text-gray-500">{card.punchCardName}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-500">
                    {card.measurementType === 'entries'
                      ? `נשארו ${card.entriesTotal - card.entriesUsed} כניסות`
                      : card.expiresAt ? `מסתיים ב-${formatDate(card.expiresAt)}` : ''}
                  </span>
                  <a href={`https://wa.me/972${(customers.find(c => c.id === card.customerId)?.phone || '').replace(/^0/, '')}?text=${encodeURIComponent(`היי ${card.customerName}! רציתי להזכיר לך שה${card.punchCardName} שלך עומד להסתיים 💪`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[10px] bg-green-500 text-white px-3 py-1 rounded-lg font-medium">
                    שלח תזכורת
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DEBTS TAB */}
      {activeTab === 'debts' && (
        <div className="space-y-2">
          {debtCards.length === 0 && <div className="text-center py-10 text-gray-400">אין חובות 🎉</div>}
          {debtCards.map(card => {
            const type = cardTypes.find(t => t.id === card.punchCardTypeId);
            return (
              <div key={card.id} className="bg-red-50 border border-red-100 rounded-xl p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-gray-800 text-sm">{card.customerName}</p>
                  <p className="text-sm font-bold text-red-600">₪{type?.price ?? '?'}</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">{card.punchCardName} | {formatDate(card.purchasedAt)}</p>
                <div className="flex gap-1.5">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m} onClick={async () => {
                      await markPunchCardPaid(supabase, card.id, m);
                      if (type) await createTransaction(supabase, businessId, { customerId: card.customerId, customerName: card.customerName, description: `תשלום עבור ${card.punchCardName}`, amount: type.price, paymentMethod: m, transactionDate: new Date().toISOString(), referenceType: 'punch_card', referenceId: card.id });
                      loadAll();
                    }} className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-50">{m}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TYPES TAB */}
      {activeTab === 'types' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">סוגי כרטיסיות</span>
            <button onClick={() => { setShowTypeForm(!showTypeForm); setEditingType(null); setTypeForm({ name: '', measurementType: 'entries', entriesCount: '10', monthsCount: '1', price: '', validityDays: '', nearEndDays: '3' }); }}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white rounded-xl text-xs font-medium cursor-pointer">
              <Plus size={13} /> סוג חדש
            </button>
          </div>
          {showTypeForm && (
            <div className="bg-indigo-50 rounded-xl p-4 space-y-2.5 border border-indigo-100">
              <input value={typeForm.name} onChange={e => setTypeForm(p => ({...p, name: e.target.value}))}
                placeholder="שם (למשל: 10 כניסות קבוצתי)" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />

              {/* Measurement type selector */}
              <div>
                <p className="text-xs text-gray-600 mb-1.5">סוג מדידה</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'entries', label: 'לפי כניסות' },
                    { key: 'months', label: 'לפי חודשים' },
                    { key: 'unlimited', label: 'ללא הגבלה' },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setTypeForm(p => ({ ...p, measurementType: key }))}
                      className={`py-2 rounded-lg text-[11px] font-medium transition-colors ${typeForm.measurementType === key ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {typeForm.measurementType === 'entries' && (
                <input type="number" value={typeForm.entriesCount} onChange={e => setTypeForm(p => ({...p, entriesCount: e.target.value}))}
                  placeholder="מספר כניסות" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />
              )}

              {typeForm.measurementType === 'months' && (
                <input type="number" value={typeForm.monthsCount} onChange={e => setTypeForm(p => ({...p, monthsCount: e.target.value}))}
                  placeholder="מספר חודשי תוקף" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />
              )}

              {typeForm.measurementType === 'unlimited' && (
                <input type="number" value={typeForm.validityDays} onChange={e => setTypeForm(p => ({...p, validityDays: e.target.value}))}
                  placeholder="תוקף בימים (ריק = ללא)" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />
              )}

              <input type="number" value={typeForm.price} onChange={e => setTypeForm(p => ({...p, price: e.target.value}))}
                placeholder="מחיר ₪" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />

              <div>
                <label className="text-[10px] text-gray-500 block mb-1">התראה &quot;לפני סיום&quot; — כמה ימים לפני פקיעה</label>
                <input type="number" value={typeForm.nearEndDays} onChange={e => setTypeForm(p => ({...p, nearEndDays: e.target.value}))}
                  placeholder="3" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />
              </div>

              <div className="flex gap-2">
                <button onClick={saveType} className="flex-1 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium cursor-pointer">שמור</button>
                <button onClick={() => { setShowTypeForm(false); setEditingType(null); }} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium cursor-pointer">ביטול</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {cardTypes.length === 0 && <p className="text-center text-gray-400 text-sm py-4">אין סוגי כרטיסיות</p>}
            {cardTypes.map(t => {
              const measureLabel =
                t.measurementType === 'entries' ? `${t.entriesCount} כניסות` :
                t.measurementType === 'months' ? `${t.monthsCount ?? ''} חודשים` :
                'ללא הגבלה';
              return (
                <div key={t.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{measureLabel} · ₪{t.price}{t.validityDays && t.measurementType !== 'months' ? ` · תוקף ${t.validityDays} יום` : ''}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => {
                      setEditingType(t);
                      setTypeForm({
                        name: t.name,
                        measurementType: t.measurementType,
                        entriesCount: String(t.entriesCount),
                        monthsCount: String(t.monthsCount ?? '1'),
                        price: String(t.price),
                        validityDays: t.validityDays ? String(t.validityDays) : '',
                        nearEndDays: String(t.nearEndDays ?? 3),
                      });
                      setShowTypeForm(true);
                    }}
                      className="p-1.5 text-gray-400 hover:text-indigo-500 cursor-pointer"><Edit2 size={13} /></button>
                    <button onClick={() => { if (confirm('למחוק?')) deletePunchCardType(supabase, t.id).then(loadAll); }}
                      className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pay modal */}
      {showPayModal && (() => {
        const modalCard = customerCards.find(c => c.id === showPayModal);
        const modalType = cardTypes.find(t => t.id === modalCard?.punchCardTypeId);
        const fullPrice = modalType?.price || 0;
        const enteredAmount = payAmount ? Number(payAmount) : fullPrice;
        const remaining = fullPrice - enteredAmount;
        const isPartial = payAmount !== '' && enteredAmount < fullPrice;
        return (
          <div className="fixed inset-x-0 top-0 bottom-[72px] md:inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={() => { setShowPayModal(null); setPayAmount(''); }}>
            <div className="bg-white rounded-2xl p-5 w-full max-w-xs" onClick={e => e.stopPropagation()}>
              <p className="font-bold text-gray-800 mb-1 text-center">גביית תשלום</p>
              {modalCard && <p className="text-xs text-gray-500 text-center mb-4">{modalCard.customerName} — {modalCard.punchCardName}</p>}

              {/* Amount field */}
              <div className="mb-3">
                <label className="text-xs text-gray-600 mb-1 block">סכום לגביה</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    placeholder={String(fullPrice)}
                    className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-gray-200 text-sm text-right"
                    dir="ltr"
                  />
                </div>
                {isPartial && remaining > 0 && (
                  <p className="text-xs text-orange-600 mt-1.5 bg-orange-50 rounded-lg px-2 py-1">
                    נשאר לתשלום: ₪{remaining} — הכרטיסייה לא תסומן כשולמה
                  </p>
                )}
                {!isPartial && fullPrice > 0 && (
                  <p className="text-xs text-green-600 mt-1.5">מחיר מלא: ₪{fullPrice}</p>
                )}
              </div>

              <p className="text-xs text-gray-600 mb-2">אמצעי תשלום</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PAYMENT_METHODS.map(m => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={`py-2.5 rounded-xl text-sm font-medium cursor-pointer ${payMethod === m ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{m}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleMarkPaid(showPayModal)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-white ${isPartial ? 'bg-orange-500' : 'bg-green-500'}`}>
                  {isPartial ? 'רשום תשלום חלקי' : 'אשר תשלום'}
                </button>
                <button onClick={() => { setShowPayModal(null); setPayAmount(''); }} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm cursor-pointer">ביטול</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
