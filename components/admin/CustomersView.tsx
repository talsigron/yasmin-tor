'use client';

import { useState, useEffect } from 'react';
import { useCustomers, useAppointments, useProfile, useBusinessSettings } from '@/hooks/useSupabase';
import { Customer } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import {
  Users,
  Phone,
  Search,
  Calendar,
  Check,
  X,
  ChevronDown,
  AlertCircle,
  FileText,
  Activity,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { useTenant } from '@/contexts/TenantContext';

type CustomerTab = 'all' | 'pending';

interface ApprovalToast {
  customer: Customer;
  visible: boolean;
}

const GENDER_MAP: Record<string, string> = { male: 'זכר', female: 'נקבה', other: 'אחר' };
const PAYMENT_MAP: Record<string, string> = { cash: 'מזומן', bit: 'ביט', bank_transfer: 'העברה בנקאית', check: 'שיק' };

function calcAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const diff = (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return diff.toFixed(1);
}

function formatDob(dob: string): string {
  const d = new Date(dob);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

export default function CustomersView() {
  const { config } = useTenant();
  const { labels, slug, category } = config;
  const isFitness = category === 'fitness';
  const { customers, loading: custLoading, approve, reject } = useCustomers();
  const { appointments, loading: apptLoading } = useAppointments();
  const { profile } = useProfile();
  const { autoApprove, toggleAutoApprove } = useBusinessSettings();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<CustomerTab>('all');
  const [approvalToast, setApprovalToast] = useState<ApprovalToast | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const loading = custLoading || apptLoading;

  const pendingCount = customers.filter((c) => c.status === 'pending').length;
  const approvedCustomers = customers.filter((c) => c.status === 'approved');

  // Stats computation
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const getLastApptDate = (customerId: string): Date | null => {
    const appts = appointments
      .filter((a) => a.customerId === customerId && a.status !== 'cancelled')
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
    return appts.length > 0 ? new Date(appts[0].date + 'T' + appts[0].time) : null;
  };

  const getApptCount = (customerId: string) =>
    appointments.filter((a) => a.customerId === customerId && a.status !== 'cancelled').length;

  const missingFieldsCount = isFitness
    ? approvedCustomers.filter((c) => !c.idNumber || !c.dateOfBirth || !c.gender || !c.paymentMethod || !c.healthDeclarationUrl).length
    : 0;

  const inactiveBreakdown = {
    week: 0,
    twoWeeks: 0,
    threeWeeks: 0,
    month: 0,
  };
  approvedCustomers.forEach((c) => {
    const last = getLastApptDate(c.id);
    if (!last) { inactiveBreakdown.month++; return; }
    const diff = now.getTime() - last.getTime();
    if (diff > 30 * dayMs) inactiveBreakdown.month++;
    else if (diff > 21 * dayMs) inactiveBreakdown.threeWeeks++;
    else if (diff > 14 * dayMs) inactiveBreakdown.twoWeeks++;
    else if (diff > 7 * dayMs) inactiveBreakdown.week++;
  });

  const activeThisMonth = approvedCustomers.filter((c) => {
    const last = getLastApptDate(c.id);
    return last && (now.getTime() - last.getTime()) < 30 * dayMs;
  }).length;

  const newThisMonth = customers.filter((c) => {
    const d = new Date(c.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const [showStats, setShowStats] = useState(false);

  const displayCustomers = tab === 'pending'
    ? customers.filter((c) => c.status === 'pending')
    : customers.filter((c) => c.status === 'approved');

  const filtered = displayCustomers.filter(
    (c) =>
      c.fullName.includes(search) ||
      c.phone.includes(search)
  );

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!approvalToast?.visible) return;
    const timer = setTimeout(() => {
      setApprovalToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [approvalToast]);

  const businessName = profile?.name || 'העסק';
  const appUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${slug}`
    : `https://talsigron.co.il/${slug}`;

  const buildWhatsAppApprovalLink = (customer: Customer) => {
    const phoneClean = customer.phone.replace(/^0/, '');
    const text = encodeURIComponent(
      labels.customerApprovalMsg(customer.fullName, businessName, appUrl)
    );
    return `https://wa.me/972${phoneClean}?text=${text}`;
  };

  const handleApprove = async (id: string) => {
    try {
      const customer = customers.find((c) => c.id === id);
      await approve(id);
      if (customer) {
        setApprovalToast({ customer, visible: true });
      }
    } catch (err) {
      console.error('Failed to approve customer:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject(id);
    } catch (err) {
      console.error('Failed to reject customer:', err);
    }
  };

  // Get appointment count per customer
  const getCustomerAppointments = (customerId: string) => {
    return appointments.filter((a) => a.customerId === customerId);
  };

  const getLastAppointment = (customerId: string) => {
    const appts = getCustomerAppointments(customerId)
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
    return appts[0] || null;
  };

  const statusLabel = (status: Customer['status']) => {
    switch (status) {
      case 'approved': return labels.customerApproved;
      case 'rejected': return 'לא אושר/ה';
      case 'pending': return labels.customerPending;
    }
  };

  const statusColors = (status: Customer['status']) => {
    switch (status) {
      case 'approved': return 'bg-mint-50 text-mint-700 border-mint-200';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-3 border-mint-200 border-t-mint-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">לקוחות</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {customers.length} לקוחות
        </span>
      </div>

      {/* Auto-approve toggle */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-700">
            {autoApprove ? 'אישור אוטומטי' : 'אישור ידני'}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {autoApprove
              ? 'לקוחות חדשים יכולים לקבוע תורים מיד'
              : 'תאשר כל לקוח חדש לפני שיוכל לקבוע תורים'}
          </p>
        </div>
        <button
          onClick={() => toggleAutoApprove(!autoApprove)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer',
            autoApprove ? 'bg-mint-500' : 'bg-gray-300'
          )}
        >
          <span className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            autoApprove ? 'right-0.5' : 'right-[22px]'
          )} />
        </button>
      </div>

      {/* Stats summary */}
      <div className="mb-4">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2.5 cursor-pointer"
        >
          <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
            <Activity size={13} className="text-mint-500" />
            סטטיסטיקות
          </span>
          <ChevronDown size={14} className={cn('text-gray-400 transition-transform', showStats && 'rotate-180')} />
        </button>
        {showStats && (
          <div className="mt-2 space-y-2 animate-fade-in">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-mint-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-mint-700">{approvedCustomers.length}</p>
                <p className="text-[10px] text-mint-600 flex items-center justify-center gap-1 mt-0.5">
                  <UserCheck size={10} /> לקוחות רשומים
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-700">{activeThisMonth}</p>
                <p className="text-[10px] text-blue-600 flex items-center justify-center gap-1 mt-0.5">
                  <Activity size={10} /> פעילים החודש
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-purple-700">{newThisMonth}</p>
                <p className="text-[10px] text-purple-600 flex items-center justify-center gap-1 mt-0.5">
                  <Users size={10} /> חדשים החודש
                </p>
              </div>
              {isFitness && (
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-700">{missingFieldsCount}</p>
                  <p className="text-[10px] text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                    <AlertCircle size={10} /> פרטים חסרים
                  </p>
                </div>
              )}
              {!isFitness && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-700">{pendingCount}</p>
                  <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1 mt-0.5">
                    <Clock size={10} /> ממתינים לאישור
                  </p>
                </div>
              )}
            </div>

            {/* Inactive breakdown */}
            {(inactiveBreakdown.week + inactiveBreakdown.twoWeeks + inactiveBreakdown.threeWeeks + inactiveBreakdown.month) > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                  <UserX size={12} className="text-red-400" />
                  לקוחות לא פעילים
                </p>
                <div className="space-y-1.5">
                  {inactiveBreakdown.week > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">שבוע+</span>
                      <span className="font-medium text-amber-600">{inactiveBreakdown.week}</span>
                    </div>
                  )}
                  {inactiveBreakdown.twoWeeks > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">שבועיים+</span>
                      <span className="font-medium text-orange-600">{inactiveBreakdown.twoWeeks}</span>
                    </div>
                  )}
                  {inactiveBreakdown.threeWeeks > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">3 שבועות+</span>
                      <span className="font-medium text-red-500">{inactiveBreakdown.threeWeeks}</span>
                    </div>
                  )}
                  {inactiveBreakdown.month > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">חודש+</span>
                      <span className="font-medium text-red-700">{inactiveBreakdown.month}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Top customers by appointments */}
            {approvedCustomers.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                  <Calendar size={12} className="text-mint-500" />
                  לקוחות מובילים (לפי {labels.bookings})
                </p>
                <div className="space-y-1.5">
                  {approvedCustomers
                    .map((c) => ({ ...c, apptCount: getApptCount(c.id) }))
                    .filter((c) => c.apptCount > 0)
                    .sort((a, b) => b.apptCount - a.apptCount)
                    .slice(0, 5)
                    .map((c, i) => (
                      <div key={c.id} className="flex justify-between text-xs items-center">
                        <span className="text-gray-700 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-mint-100 text-mint-700 text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                          {c.fullName}
                        </span>
                        <span className="font-medium text-gray-600">{c.apptCount} {labels.bookings}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => setTab('all')}
          className={cn(
            'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
            tab === 'all'
              ? 'bg-white text-mint-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          כל הלקוחות
        </button>
        <button
          onClick={() => setTab('pending')}
          className={cn(
            'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-center relative',
            tab === 'pending'
              ? 'bg-white text-mint-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {labels.pendingTab}
          {pendingCount > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="חיפוש לפי שם או טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">
            {search ? 'לא נמצאו לקוחות' : tab === 'pending' ? labels.noPendingCustomers : labels.customersListEmpty}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => {
            const apptCount = getCustomerAppointments(customer.id).length;
            const lastAppt = getLastAppointment(customer.id);

            const isExpanded = expandedId === customer.id;
            const missingFields = isFitness ? [
              !customer.idNumber && 'תעודת זהות',
              !customer.dateOfBirth && 'תאריך לידה',
              !customer.gender && 'מין',
              !customer.paymentMethod && 'אופן תשלום',
              !customer.healthDeclarationUrl && 'הצהרת בריאות',
            ].filter(Boolean) as string[] : [];

            return (
              <div
                key={customer.id}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
              >
                <div
                  className={cn('flex items-start justify-between gap-3', isFitness && 'cursor-pointer')}
                  onClick={() => isFitness && setExpandedId(isExpanded ? null : customer.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {customer.fullName}
                      </h3>
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full border',
                        statusColors(customer.status || 'approved')
                      )}>
                        {statusLabel(customer.status || 'approved')}
                      </span>
                      {isFitness && missingFields.length > 0 && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                          <AlertCircle size={10} />
                          {missingFields.length} חסרים
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1" dir="ltr">
                        <Phone size={11} />
                        {customer.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {apptCount} תורים
                      </span>
                    </div>
                    {lastAppt && (
                      <div className="text-[11px] text-gray-500">
                        תור אחרון: {formatDate(lastAppt.date)} | {lastAppt.serviceName}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 shrink-0 items-center">
                    {customer.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApprove(customer.id); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-mint-50 text-mint-600 hover:bg-mint-100 transition-colors cursor-pointer"
                          title="אישור"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReject(customer.id); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                          title="דחייה"
                        >
                          <X size={15} />
                        </button>
                      </>
                    )}
                    <a
                      href={`tel:${customer.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-mint-50 text-mint-600 hover:bg-mint-100 transition-colors"
                      title="התקשר"
                    >
                      <Phone size={15} />
                    </a>
                    <a
                      href={`https://wa.me/972${customer.phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      title="WhatsApp"
                    >
                      <WhatsAppIcon size={15} />
                    </a>
                    {isFitness && (
                      <ChevronDown size={14} className={cn('text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                    )}
                  </div>
                </div>

                {/* Expanded fitness details */}
                {isFitness && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">תעודת זהות</span>
                      {customer.idNumber
                        ? <span className="font-medium text-gray-800" dir="ltr">{customer.idNumber}</span>
                        : <span className="text-red-400">חסר</span>}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">גיל</span>
                      {customer.dateOfBirth
                        ? <span className="font-medium text-gray-800">{calcAge(customer.dateOfBirth)} ({formatDob(customer.dateOfBirth).replace(/\./g, '/')})</span>
                        : <span className="text-red-400">חסר</span>}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">מין</span>
                      {customer.gender
                        ? <span className="font-medium text-gray-800">{GENDER_MAP[customer.gender] ?? customer.gender}</span>
                        : <span className="text-red-400">חסר</span>}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">טלפון</span>
                      <span className="font-medium text-gray-800" dir="ltr">{customer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">אופן תשלום</span>
                      {customer.paymentMethod
                        ? <span className="font-medium text-gray-800">{PAYMENT_MAP[customer.paymentMethod] ?? customer.paymentMethod}</span>
                        : <span className="text-red-400">חסר</span>}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">הצהרת בריאות</span>
                      {customer.healthDeclarationUrl
                        ? <a href={customer.healthDeclarationUrl} target="_blank" rel="noopener noreferrer" className="text-mint-600 font-medium flex items-center gap-1">
                            <FileText size={11} /> יש
                          </a>
                        : <span className="text-red-400">אין</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approval Toast */}
      {approvalToast?.visible && (
        <div
          className="fixed bottom-6 left-4 right-4 z-50 animate-fade-in"
          onClick={() => setApprovalToast(null)}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-mint-200 p-4 max-w-sm mx-auto">
            <div className="text-center mb-3">
              <p className="font-bold text-gray-800">
                {labels.customerApprovedToast}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {approvalToast.customer.fullName}
              </p>
            </div>
            <a
              href={buildWhatsAppApprovalLink(approvalToast.customer)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#1fb855] transition-colors"
            >
              <WhatsAppIcon size={16} />
              {labels.sendWhatsappApproval}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
