'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useProfile } from '@/hooks/useSupabase';
import {
  fetchTransactions,
  fetchExpenses,
  createExpense,
  deleteExpense,
  fetchMonthlyGoals,
  upsertMonthlyGoal,
  deleteMonthlyGoal,
  fetchCustomerPunchCards,
  fetchPunchCardTypes,
  fetchCustomerById,
} from '@/lib/supabase-store';
import { Transaction, Expense, MonthlyGoal, PAYMENT_METHOD_LABELS, PaymentMethods, Customer } from '@/lib/types';
import { TrendingUp, TrendingDown, Target, Wallet, AlertCircle, Plus, Trash2, ChevronLeft, ChevronRight, BarChart3, Trophy, Sparkles } from 'lucide-react';
import CustomerDetailModal from './CustomerDetailModal';

type Tab = 'overview' | 'income' | 'expenses' | 'debts' | 'goals';

export default function FinanceManager() {
  const { supabase, config } = useTenant();
  const { businessId, defaultColors } = config;
  const brandPrimary = defaultColors.primary;
  const { profile } = useProfile();

  const [tab, setTab] = useState<Tab>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [debts, setDebts] = useState<{ customerName: string; amount: number; cardName: string; customerId: string; cardId: string; punchCardTypeId: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [projectedIncome, setProjectedIncome] = useState<{ customerName: string; cardName: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  // Selected month for viewing
  const now = new Date();
  const [year, setYearState] = useState(now.getFullYear());
  const [month, setMonthState] = useState(now.getMonth() + 1); // 1-indexed

  const loadData = async () => {
    setLoading(true);
    try {
      const [txs, exps, gs, cards, types] = await Promise.all([
        fetchTransactions(supabase, businessId),
        fetchExpenses(supabase, businessId),
        fetchMonthlyGoals(supabase, businessId, year, month),
        fetchCustomerPunchCards(supabase, businessId),
        fetchPunchCardTypes(supabase, businessId),
      ]);
      setTransactions(txs);
      setExpenses(exps);
      setGoals(gs);

      // Calculate debts: for each unpaid card, compare type.price with sum of transactions for this card
      const debtList = cards
        .filter(c => !c.isPaid)
        .map(c => {
          const type = types.find(t => t.id === c.punchCardTypeId);
          const fullPrice = type?.price || 0;
          const paidSoFar = txs
            .filter(t => t.referenceType === 'punch_card' && t.referenceId === c.id)
            .reduce((s, t) => s + Number(t.amount), 0);
          const debt = fullPrice - paidSoFar;
          return {
            customerId: c.customerId,
            customerName: c.customerName || 'לקוח',
            amount: debt,
            cardName: c.punchCardName,
            cardId: c.id,
            punchCardTypeId: c.punchCardTypeId ?? '',
          };
        })
        .filter(d => d.amount > 0);
      setDebts(debtList);

      // Projected income: cards active during the viewed month, pro-rated across their validity
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);
      const projection: { customerName: string; cardName: string; amount: number }[] = [];

      cards.forEach(c => {
        if (!c.isPaid) return; // only paid cards = guaranteed income
        const type = types.find(t => t.id === c.punchCardTypeId);
        const fullPrice = type?.price || 0;
        if (fullPrice <= 0) return;

        const purchasedAt = new Date(c.purchasedAt);
        const expiresAt = c.expiresAt ? new Date(c.expiresAt) : null;
        if (!expiresAt) return; // no validity = can't project

        // Card must overlap with the viewed month
        if (expiresAt < monthStart || purchasedAt > monthEnd) return;

        // Calculate how many months the card spans
        const totalMonths = Math.max(1,
          (expiresAt.getFullYear() - purchasedAt.getFullYear()) * 12
          + (expiresAt.getMonth() - purchasedAt.getMonth()) + 1);
        const perMonth = fullPrice / totalMonths;

        projection.push({
          customerName: c.customerName || 'לקוח',
          cardName: c.punchCardName,
          amount: perMonth,
        });
      });
      setProjectedIncome(projection);
    } catch (e) {
      console.error('Finance load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // ─── Computed metrics ─────────────────────────────────────
  const monthTxs = useMemo(() => transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  }), [transactions, year, month]);

  const monthExpenses = useMemo(() => expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  }), [expenses, year, month]);

  const totalIncome = monthTxs.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = totalIncome - totalExpenses;
  const totalDebts = debts.reduce((s, d) => s + d.amount, 0);

  const uniqueCustomersInMonth = new Set(monthTxs.filter(t => t.customerId).map(t => t.customerId!)).size;
  const avgPricePerCustomer = uniqueCustomersInMonth > 0 ? totalIncome / uniqueCustomersInMonth : 0;

  // Payment method breakdown (only enabled methods)
  const enabledMethods = (profile?.paymentMethods || {}) as PaymentMethods;
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.forEach(t => {
      const key = t.paymentMethod || 'other';
      map[key] = (map[key] || 0) + Number(t.amount);
    });
    return Object.entries(map)
      .filter(([key]) => enabledMethods[key as keyof PaymentMethods] !== false)
      .sort(([, a], [, b]) => b - a);
  }, [monthTxs, enabledMethods]);

  // Monthly comparison (last 12 months)
  const monthlyComparison = useMemo(() => {
    const arr: { label: string; income: number; expenses: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const inc = transactions
        .filter(t => {
          const td = new Date(t.transactionDate);
          return td.getFullYear() === y && td.getMonth() + 1 === m;
        })
        .reduce((s, t) => s + Number(t.amount), 0);
      const exp = expenses
        .filter(e => {
          const ed = new Date(e.date);
          return ed.getFullYear() === y && ed.getMonth() + 1 === m;
        })
        .reduce((s, e) => s + Number(e.amount), 0);
      arr.push({ label: `${m}/${String(y).slice(2)}`, income: inc, expenses: exp });
    }
    return arr;
  }, [transactions, expenses]);

  // Top spenders this month
  const topSpenders = useMemo(() => {
    const map: Record<string, { name: string; amount: number; customerId: string }> = {};
    monthTxs.forEach(t => {
      if (!t.customerId) return;
      if (!map[t.customerId]) map[t.customerId] = { name: t.customerName || 'לקוח', amount: 0, customerId: t.customerId };
      map[t.customerId].amount += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount).slice(0, 3);
  }, [monthTxs]);

  const openCustomer = async (customerId: string) => {
    setFetchingCustomer(true);
    try {
      const c = await fetchCustomerById(supabase, businessId, customerId);
      if (c) setSelectedCustomer(c);
    } finally {
      setFetchingCustomer(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setYearState(year - 1); setMonthState(12); }
    else setMonthState(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYearState(year + 1); setMonthState(1); }
    else setMonthState(month + 1);
  };

  const monthName = new Date(year, month - 1).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  // Check if viewing a future month (beyond current month)
  const nowDate = new Date();
  const isFutureMonth = year > nowDate.getFullYear() || (year === nowDate.getFullYear() && month > nowDate.getMonth() + 1);

  const totalProjected = projectedIncome.reduce((s, p) => s + p.amount, 0);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">טוען...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="relative">
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-50 active:scale-90 transition-all">
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="font-bold text-gray-800 px-4 py-1 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
          >
            {monthName}
          </button>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-50 active:scale-90 transition-all">
            <ChevronLeft size={18} />
          </button>
        </div>
        {showPicker && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-10 p-4">
            {/* Year selector */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setYearState(year - 1)} className="p-2 rounded-lg hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
              <span className="font-bold text-gray-800">{year}</span>
              <button onClick={() => setYearState(year + 1)} className="p-2 rounded-lg hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
            </div>
            {/* Month grid */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                const d = new Date(year, m - 1);
                const label = d.toLocaleDateString('he-IL', { month: 'short' });
                const isSelected = m === month;
                return (
                  <button
                    key={m}
                    onClick={() => { setMonthState(m); setShowPicker(false); }}
                    className="py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: isSelected ? brandPrimary : '#F9FAFB',
                      color: isSelected ? 'white' : '#374151',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                const n = new Date();
                setYearState(n.getFullYear());
                setMonthState(n.getMonth() + 1);
                setShowPicker(false);
              }}
              className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700"
            >
              חזרה לחודש הנוכחי
            </button>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 overflow-x-auto">
        {([
          { key: 'overview', label: 'סקירה' },
          { key: 'income', label: 'הכנסות' },
          { key: 'debts', label: 'חובות' },
          { key: 'goals', label: 'יעדים' },
          ...(profile?.useExpenses ? [{ key: 'expenses', label: 'הוצאות' }] : []),
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className="flex-1 min-w-max px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: tab === t.key ? brandPrimary : 'transparent',
              color: tab === t.key ? 'white' : '#6B7280',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-3">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={<TrendingUp size={16} />} label="הכנסות" value={`₪${totalIncome.toLocaleString()}`} color="#10B981" onClick={() => setTab('income')} />
            {profile?.useExpenses && (
              <MetricCard icon={<TrendingDown size={16} />} label="הוצאות" value={`₪${totalExpenses.toLocaleString()}`} color="#EF4444" onClick={() => setTab('expenses')} />
            )}
            {profile?.useExpenses && (
              <MetricCard icon={<Wallet size={16} />} label="רווח נטו" value={`₪${netProfit.toLocaleString()}`} color={netProfit >= 0 ? '#10B981' : '#EF4444'} onClick={() => setTab('expenses')} />
            )}
            <MetricCard icon={<AlertCircle size={16} />} label="חובות" value={`₪${totalDebts.toLocaleString()}`} color="#F59E0B" onClick={() => setTab('debts')} />
          </div>

          <MetricCard icon={<BarChart3 size={16} />} label="מחיר ממוצע ללקוח החודש" value={`₪${avgPricePerCustomer.toFixed(0)}`} color={brandPrimary} fullWidth onClick={() => setTab('income')} />

          {/* Projected income - only for future/current months */}
          {projectedIncome.length > 0 && (
            <div className="bg-white rounded-xl border border-purple-100 p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Sparkles size={14} className="text-purple-500" />
                הכנסות צפויות {isFutureMonth ? '(חודש עתידי)' : ''}
              </h3>
              <p className="text-[10px] text-gray-400 mb-3">
                מבוסס על כרטיסיות ששולמו ותקופת התוקף שלהן
              </p>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 mb-2">
                <span className="text-xs text-gray-600">סה&quot;כ צפוי</span>
                <span className="text-lg font-bold text-purple-600">₪{totalProjected.toFixed(0)}</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {projectedIncome.map((p, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <div className="min-w-0">
                      <p className="text-gray-800 truncate">{p.customerName}</p>
                      <p className="text-[10px] text-gray-400">{p.cardName}</p>
                    </div>
                    <span className="text-purple-600 font-bold shrink-0 mr-2">₪{p.amount.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment method breakdown */}
          {paymentBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">פילוח לפי אמצעי תשלום</h3>
              <div className="space-y-2">
                {paymentBreakdown.map(([method, amount]) => {
                  const label = PAYMENT_METHOD_LABELS[method as keyof PaymentMethods] || method;
                  const pct = totalIncome > 0 ? (amount / totalIncome * 100) : 0;
                  return (
                    <div key={method}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700">{label}</span>
                        <span className="font-bold">₪{amount.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: brandPrimary }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top spenders */}
          {topSpenders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Trophy size={14} style={{ color: brandPrimary }} />
                לקוחות מובילים החודש
              </h3>
              <div className="space-y-2">
                {topSpenders.map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <button onClick={() => openCustomer(s.customerId)} className="text-gray-700 hover:underline cursor-pointer text-right">
                      {i + 1}. {s.name}
                    </button>
                    <span className="font-bold" style={{ color: brandPrimary }}>₪{s.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly comparison bar chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">השוואה חודשית (12 חודשים אחרונים)</h3>
            <MonthlyChart data={monthlyComparison} color={brandPrimary} />
          </div>
        </div>
      )}

      {tab === 'income' && (
        <IncomeTab transactions={monthTxs} />
      )}

      {tab === 'expenses' && (
        <ExpensesTab
          expenses={monthExpenses}
          categories={profile?.expenseCategories || []}
          onAdd={async (data) => {
            await createExpense(supabase, businessId, data);
            await loadData();
          }}
          onDelete={async (id) => {
            if (!confirm('למחוק הוצאה?')) return;
            await deleteExpense(supabase, id);
            await loadData();
          }}
        />
      )}

      {tab === 'debts' && (
        <DebtsTab debts={debts} onOpenCustomer={openCustomer} />
      )}

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onSaved={() => { setSelectedCustomer(null); loadData(); }}
          onDeleted={() => { setSelectedCustomer(null); loadData(); }}
        />
      )}

      {tab === 'goals' && (
        <GoalsTab
          goals={goals}
          year={year}
          month={month}
          currentIncome={totalIncome}
          currentCustomers={uniqueCustomersInMonth}
          currentSessions={monthTxs.length}
          onSave={async (goal) => {
            await upsertMonthlyGoal(supabase, businessId, goal);
            await loadData();
          }}
          onDelete={async (id) => {
            await deleteMonthlyGoal(supabase, id);
            await loadData();
          }}
          brandPrimary={brandPrimary}
        />
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color, fullWidth, onClick }: { icon: React.ReactNode; label: string; value: string; color: string; fullWidth?: boolean; onClick?: () => void }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-3 ${fullWidth ? 'col-span-2' : ''} ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98] transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 text-gray-500 text-[10px] mb-1">
        <span style={{ color }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function MonthlyChart({ data, color }: { data: { label: string; income: number; expenses: number }[]; color: string }) {
  const max = Math.max(...data.map(d => Math.max(d.income, d.expenses)), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex items-end gap-0.5 h-28">
            <div
              className="flex-1 rounded-t transition-all"
              style={{ height: `${(d.income / max) * 100}%`, backgroundColor: color, minHeight: d.income > 0 ? '2px' : '0' }}
              title={`הכנסות: ₪${d.income.toLocaleString()}`}
            />
            <div
              className="flex-1 rounded-t transition-all bg-red-400"
              style={{ height: `${(d.expenses / max) * 100}%`, minHeight: d.expenses > 0 ? '2px' : '0' }}
              title={`הוצאות: ₪${d.expenses.toLocaleString()}`}
            />
          </div>
          <span className="text-[8px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function IncomeTab({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">אין הכנסות החודש</div>;
  }
  const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">סה&quot;כ הכנסות</span>
        <span className="text-lg font-bold text-green-600">₪{total.toLocaleString()}</span>
      </div>
      {transactions.map(t => (
        <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-800">{t.customerName || t.description}</p>
            <p className="text-[10px] text-gray-400">{new Date(t.transactionDate).toLocaleDateString('he-IL')}</p>
            {t.paymentMethod && (
              <p className="text-[10px] text-gray-500">{PAYMENT_METHOD_LABELS[t.paymentMethod as keyof PaymentMethods] || t.paymentMethod}</p>
            )}
          </div>
          <span className="text-sm font-bold text-green-600">₪{Number(t.amount).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function ExpensesTab({ expenses, categories, onAdd, onDelete }: {
  expenses: Expense[];
  categories: string[];
  onAdd: (data: Omit<Expense, 'id' | 'businessId' | 'createdAt'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] || 'אחר');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!amount || !category) return;
    await onAdd({ date, amount: parseFloat(amount), category, note });
    setDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setCategory(categories[0] || 'אחר');
    setNote('');
    setShowForm(false);
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
      >
        <Plus size={16} />
        הוספת הוצאה
      </button>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2" />
          <input type="number" placeholder="סכום" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="הערה (אופציונלי)" value={note} onChange={e => setNote(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2" />
          <button onClick={handleSubmit} className="w-full bg-red-500 text-white rounded-lg py-2 text-sm font-bold">שמור</button>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">סה&quot;כ הוצאות</span>
          <span className="text-lg font-bold text-red-500">₪{total.toLocaleString()}</span>
        </div>
      )}

      {expenses.map(e => (
        <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-3 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-red-50 text-red-600 rounded px-2 py-0.5">{e.category}</span>
              <span className="text-[10px] text-gray-400">{new Date(e.date).toLocaleDateString('he-IL')}</span>
            </div>
            {e.note && <p className="text-xs text-gray-500 mt-1">{e.note}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-red-500">₪{Number(e.amount).toLocaleString()}</span>
            <button onClick={() => onDelete(e.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}

      {expenses.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
          אין הוצאות רשומות החודש
        </div>
      )}
    </div>
  );
}

function DebtsTab({ debts, onOpenCustomer }: {
  debts: { customerName: string; amount: number; cardName: string; customerId: string; cardId: string; punchCardTypeId: string }[];
  onOpenCustomer: (customerId: string) => void;
}) {
  if (debts.length === 0) {
    return <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">אין חובות פתוחים 🎉</div>;
  }
  const total = debts.reduce((s, d) => s + d.amount, 0);
  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">סה&quot;כ חובות</span>
        <span className="text-lg font-bold text-amber-600">₪{total.toLocaleString()}</span>
      </div>
      {debts.map((d, i) => (
        <button key={i} onClick={() => onOpenCustomer(d.customerId)}
          className="w-full bg-white rounded-xl border border-gray-100 p-3 flex justify-between items-center hover:bg-amber-50 active:scale-[0.98] transition-all cursor-pointer text-right">
          <div>
            <p className="text-sm font-medium text-gray-800">{d.customerName}</p>
            <p className="text-[10px] text-gray-400">{d.cardName}</p>
          </div>
          <span className="text-sm font-bold text-amber-600">₪{d.amount.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}

function GoalsTab({ goals, year, month, currentIncome, currentCustomers, currentSessions, onSave, onDelete, brandPrimary }: {
  goals: MonthlyGoal[];
  year: number;
  month: number;
  currentIncome: number;
  currentCustomers: number;
  currentSessions: number;
  onSave: (goal: Omit<MonthlyGoal, 'id' | 'businessId'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  brandPrimary: string;
}) {
  const kinds: { key: 'income' | 'new_customers' | 'sessions'; label: string; current: number; prefix?: string; suffix?: string }[] = [
    { key: 'income', label: 'יעד הכנסה חודשי', current: currentIncome, prefix: '₪' },
    { key: 'new_customers', label: 'יעד לקוחות פעילים', current: currentCustomers },
    { key: 'sessions', label: 'יעד מספר אימונים', current: currentSessions },
  ];

  return (
    <div className="space-y-3">
      {kinds.map(k => {
        const goal = goals.find(g => g.kind === k.key);
        const pct = goal ? Math.min(100, (k.current / goal.targetValue) * 100) : 0;
        return (
          <div key={k.key} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Target size={14} style={{ color: brandPrimary }} />
                {k.label}
              </span>
              {goal && (
                <button onClick={() => onDelete(goal.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>
              )}
            </div>
            {goal ? (
              <>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{k.prefix}{k.current.toLocaleString()} מתוך {k.prefix}{goal.targetValue.toLocaleString()}</span>
                  <span className="font-bold" style={{ color: brandPrimary }}>{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: brandPrimary }} />
                </div>
              </>
            ) : (
              <GoalInput kind={k.key} year={year} month={month} onSave={onSave} prefix={k.prefix} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GoalInput({ kind, year, month, onSave, prefix }: {
  kind: 'income' | 'new_customers' | 'sessions';
  year: number;
  month: number;
  onSave: (goal: Omit<MonthlyGoal, 'id' | 'businessId'>) => Promise<void>;
  prefix?: string;
}) {
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-2">
      <input
        type="number"
        placeholder={prefix ? `${prefix}0` : '0'}
        value={value}
        onChange={e => setValue(e.target.value)}
        className="flex-1 text-sm border border-gray-200 rounded-lg p-2"
      />
      <button
        onClick={async () => {
          if (!value) return;
          await onSave({ year, month, kind, targetValue: parseFloat(value) });
          setValue('');
        }}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold"
      >
        קבע יעד
      </button>
    </div>
  );
}
