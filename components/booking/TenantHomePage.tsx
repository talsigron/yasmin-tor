'use client';

import { useState, useEffect, useCallback } from 'react';
import { Service, Appointment, Customer } from '@/lib/types';
import { getCurrentCustomer, logoutCustomer } from '@/lib/store';
import { fetchCustomerAppointments, cancelAppointmentByCustomer, fetchCustomerById } from '@/lib/supabase-store';
import { useServices, useProfile, useGallery } from '@/hooks/useSupabase';
import { useTenant } from '@/contexts/TenantContext';
import ServiceCard from './ServiceCard';
import BookingFlow from './BookingFlow';
import RegisterForm from './RegisterForm';
import Gallery from './Gallery';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import {
  Phone, Settings, Sparkles, LogOut, User,
  MapPin, Navigation, Calendar, X, Share2, Check,
} from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import TenantHead from '@/components/TenantHead';
import CustomerProfileModal from './CustomerProfileModal';
import ShopSection from './ShopSection';

const CACHE_KEY_PREFIX = 'profile_cache_';

function getCachedProfile(tenantId: string): { logo?: string; name?: string } {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + tenantId);
    return cached ? JSON.parse(cached) : {};
  } catch { return {}; }
}

function setCachedProfile(tenantId: string, logo?: string, name?: string) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + tenantId, JSON.stringify({ logo, name }));
  } catch { /* ignore */ }
}

export default function TenantHomePage() {
  const { supabase, config } = useTenant();
  const { businessId, labels, id: tenantId, slug, defaultColors } = config;

  const { services: allServices, loading: servicesLoading } = useServices();
  const { profile: profileData, loading: profileLoading } = useProfile();
  const { images: galleryImages } = useGallery();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [customer, setCustomer] = useState(() => getCurrentCustomer(tenantId));
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [fullCustomer, setFullCustomer] = useState<Customer | null>(null);
  const isFitness = config.category === 'fitness';

  const services = allServices.filter((s) => s.active);
  const profile = profileData || { name: '', subtitle: '', brands: '', logo: '', description: '', phone: '', instagram: '', address: '', images: [], enableBit: false, bitType: 'regular' as const, enablePaybox: false };

  if (profileData) setCachedProfile(tenantId, profileData.logo, profileData.name);

  const loadMyAppointments = useCallback(async () => {
    const c = getCurrentCustomer(tenantId);
    if (!c) return;
    try {
      let appts = await fetchCustomerAppointments(supabase, businessId, c.id);
      if (appts.length === 0 && c.phone) {
        appts = await fetchCustomerAppointments(supabase, businessId, c.phone);
      }
      setMyAppointments(appts);
    } catch { /* ignore */ }
  }, [supabase, businessId, tenantId]);

  useEffect(() => {
    if (customer) loadMyAppointments();
  }, [customer, loadMyAppointments]);

  if (servicesLoading || profileLoading) {
    const cached = getCachedProfile(tenantId);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        {cached.logo ? (
          <img src={cached.logo} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-lg animate-pulse" />
        ) : cached.name ? (
          <span className="font-display text-4xl animate-pulse" style={{ color: defaultColors.primary }}>
            {cached.name}
          </span>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin"
            style={{ borderTopColor: defaultColors.primary }} />
        )}
      </div>
    );
  }

  const handleCloseBooking = () => {
    setSelectedService(null);
    setCustomer(getCurrentCustomer(tenantId));
  };

  const handleLogout = () => {
    logoutCustomer(tenantId);
    setCustomer(null);
    setMyAppointments([]);
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (!customer) return;
    const confirmed = confirm(labels.confirmCancel);
    if (!confirmed) return;
    try {
      await cancelAppointmentByCustomer(supabase, businessId, apptId, customer.id);
      setMyAppointments((prev) => prev.filter((a) => a.id !== apptId));
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const phoneNumber = profile.phone || '0500000000';
  const whatsappLink = `https://wa.me/972${phoneNumber.replace(/[-\s]/g, '').replace(/^0/, '')}`;

  const handleShare = async () => {
    const url = window.location.href;
    const title = profile.name || 'קביעת תור';
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const brandPrimary = profile.brandColors?.primary || defaultColors.primary;
  const brandSecondary = profile.brandColors?.secondary || defaultColors.secondary;
  const brandBg = profile.brandColors?.background || defaultColors.background;

  return (
    <>
    <TenantHead />
    <main className="min-h-screen" style={{ '--brand-primary': brandPrimary, '--brand-secondary': brandSecondary, '--brand-bg': brandBg, backgroundColor: brandBg } as React.CSSProperties}>
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100/50">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {profile.logo && (
              <img src={profile.logo} alt={profile.name} className="w-8 h-8 rounded-xl object-cover shadow-md" />
            )}
            <span className="font-display text-lg tracking-wide" style={{ color: brandPrimary }}>{profile.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full hover:bg-gray-100 transition-all active:scale-90"
              title="שתף את הדף"
            >
              {shareCopied
                ? <Check size={18} className="text-green-500" />
                : <Share2 size={18} className="text-gray-400" />}
            </button>
            <Link href={`/${slug}/admin`} className="p-2.5 rounded-full hover:bg-gray-100 transition-all active:scale-90 ml-1" title="מערכת ניהול">
              <Settings size={18} className="text-gray-400" />
            </Link>
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer"
              className="p-2.5 rounded-full hover:bg-pink-50 text-pink-500 transition-all active:scale-90" title="Instagram">
              <InstagramIcon size={20} />
            </a>
            <a href={`tel:${phoneNumber}`} className="p-2.5 rounded-full hover:bg-gray-50 transition-all active:scale-90" style={{ color: brandPrimary }} title="התקשר">
              <Phone size={20} />
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="p-2.5 rounded-full hover:bg-green-50 text-green-500 transition-all active:scale-90" title="WhatsApp">
              <WhatsAppIcon size={20} />
            </a>
            {customer && (
              <button onClick={handleLogout} className="p-2.5 rounded-full hover:bg-gray-100 transition-all active:scale-90 cursor-pointer mr-1" title="התנתקות">
                <LogOut size={18} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero with optional cover image */}
      <header className="relative overflow-hidden">
        {/* Cover image background */}
        {profile.coverImage && (
          <>
            <div className="absolute inset-0">
              <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/75" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, var(--brand-bg, #fff) 100%)' }} />
            <div className="absolute top-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(to bottom, var(--brand-bg, #fff) 0%, transparent 100%)' }} />
          </>
        )}
        {!profile.coverImage && (
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${brandSecondary}, ${brandSecondary}4D, transparent)` }} />
        )}
        <div className="relative max-w-3xl mx-auto px-5 pt-12 pb-10 md:pt-20 md:pb-16">
          <div className="text-center animate-fade-in">
            {profile.logo && (
              <div className="flex justify-center mb-5">
                <img
                  src={profile.logo}
                  alt={profile.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover"
                  style={{
                    border: `3px solid ${brandPrimary}30`,
                    boxShadow: profile.coverImage ? `0 0 30px ${brandPrimary}60, 0 8px 32px rgba(0,0,0,0.3)` : '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                />
              </div>
            )}
            <h1
              className="font-display text-4xl md:text-6xl tracking-wide whitespace-nowrap mb-3"
              style={{
                color: profile.coverImage ? '#fff' : brandPrimary,
                textShadow: profile.coverImage ? `0 0 20px ${brandPrimary}80, 0 2px 10px rgba(0,0,0,0.5)` : 'none',
              }}
            >
              {profile.name}
            </h1>
            {profile.subtitle && (
              <p
                className="font-display text-xl md:text-2xl mb-3"
                style={{
                  color: profile.coverImage ? 'rgba(255,255,255,0.9)' : `${brandPrimary}99`,
                  textShadow: profile.coverImage ? '0 1px 8px rgba(0,0,0,0.5)' : 'none',
                }}
              >
                {profile.subtitle}
              </p>
            )}
            {profile.description && (
              <p
                className="text-base md:text-lg max-w-md mx-auto leading-relaxed mb-4"
                style={{
                  color: profile.coverImage ? 'rgba(255,255,255,0.85)' : undefined,
                  textShadow: profile.coverImage ? '0 1px 6px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {profile.description}
              </p>
            )}
          </div>

          {customer ? (
            <div className="text-center mt-5 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full"
                style={{
                  color: profile.coverImage ? '#fff' : brandPrimary,
                  backgroundColor: profile.coverImage ? 'rgba(255,255,255,0.15)' : `${brandPrimary}10`,
                  textShadow: profile.coverImage ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                  backdropFilter: profile.coverImage ? 'blur(4px)' : 'none',
                }}>
                <User size={14} />
                {labels.hello} {customer.fullName}
              </span>
              {isFitness && (
                <button
                  onClick={async () => {
                    const fresh = await fetchCustomerById(supabase, businessId, customer.id);
                    setFullCustomer(fresh ?? customer);
                    setShowProfile(true);
                  }}
                  className="block mx-auto text-xs underline cursor-pointer"
                  style={{
                    color: profile.coverImage ? '#fff' : brandPrimary,
                    textShadow: profile.coverImage ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  השלמת פרופיל
                </button>
              )}
              {myAppointments.length > 0 && (
                <div className="max-w-sm mx-auto space-y-2">
                  <p className="text-xs font-bold text-gray-600 flex items-center justify-center gap-1">
                    <Calendar size={12} />{labels.myBookings}
                  </p>
                  {myAppointments.map((appt) => {
                    const d = new Date(appt.date + 'T00:00:00');
                    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                    const dateStr = `${d.getDate()}.${d.getMonth() + 1}`;
                    const timeStr = appt.time.slice(0, 5);
                    const waReschedule = `https://wa.me/972${phoneNumber.replace(/[-\s]/g, '').replace(/^0/, '')}?text=${encodeURIComponent(labels.rescheduleMsg(appt.serviceName, dateStr, timeStr))}`;
                    const waCancel = `https://wa.me/972${phoneNumber.replace(/[-\s]/g, '').replace(/^0/, '')}?text=${encodeURIComponent(labels.cancelMsg(appt.serviceName, dateStr, timeStr))}`;
                    return (
                      <div key={appt.id} className="bg-white/80 backdrop-blur rounded-xl border p-3"
                        style={{ borderColor: `${brandPrimary}20` }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">יום {dayNames[d.getDay()]}, {dateStr} בשעה {timeStr}</p>
                          <p className="text-sm font-bold text-gray-800">{appt.serviceName}</p>
                        </div>
                        <div className="flex gap-2">
                          {profile.cancelPolicy === 'website' ? (
                            <>
                              <button onClick={() => handleCancelAppointment(appt.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors cursor-pointer">
                                <X size={13} />ביטול
                              </button>
                              <a href={waReschedule} target="_blank" rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80 transition-colors"
                                style={{ borderColor: `${brandPrimary}40`, color: brandPrimary }}>
                                <Calendar size={13} />{labels.changeDate}
                              </a>
                            </>
                          ) : (
                            <>
                              <a href={waCancel} target="_blank" rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors">
                                <X size={13} />ביטול
                              </a>
                              <a href={waReschedule} target="_blank" rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80 transition-colors"
                                style={{ borderColor: `${brandPrimary}40`, color: brandPrimary }}>
                                <Calendar size={13} />{labels.changeDate}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center mt-5">
              <button onClick={() => setShowRegister(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-medium text-sm shadow-lg transition-all hover:shadow-xl active:scale-95 cursor-pointer"
                style={{ backgroundColor: brandPrimary }}>
                <User size={16} />{labels.register}
              </button>
            </div>
          )}
        </div>
      </header>

      <Modal isOpen={showRegister} onClose={() => { setShowRegister(false); setCustomer(getCurrentCustomer(tenantId)); }} title={labels.register} size="md">
        <RegisterForm onComplete={() => { setShowRegister(false); setCustomer(getCurrentCustomer(tenantId)); }} />
      </Modal>

      {/* Social icons */}
      <section className="max-w-3xl mx-auto px-5 mt-4 mb-4">
        <div className="flex items-center justify-center gap-4">
          <a href={profile.instagram} target="_blank" rel="noopener noreferrer"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white hover:shadow-lg transition-all">
            <InstagramIcon size={20} />
          </a>
          <a href={`tel:${phoneNumber}`}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all"
            style={{ backgroundColor: brandPrimary }}>
            <Phone size={20} />
          </a>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-[#25D366] text-white hover:shadow-lg transition-all">
            <WhatsAppIcon size={20} />
          </a>
          {profile.address && (
            <div className="relative">
              <button onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-blue-500 text-white hover:shadow-lg transition-all cursor-pointer">
                <MapPin size={20} />
              </button>
              {showLocationMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowLocationMenu(false)} />
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40 min-w-[160px]">
                    <a href={`https://waze.com/ul?q=${encodeURIComponent(profile.address)}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowLocationMenu(false)}>
                      <Navigation size={16} className="text-blue-500" />Waze
                    </a>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowLocationMenu(false)}>
                      <MapPin size={16} className="text-red-500" />Google Maps
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {galleryImages.length > 0 && (
        <section className="max-w-3xl mx-auto px-5">
          <Gallery images={galleryImages.map((img) => img.url)} />
        </section>
      )}

      <section className="max-w-3xl mx-auto px-5 mt-8" id="services">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={18} style={{ color: brandPrimary }} />
          <h2 className="text-xl font-extrabold text-gray-800">{labels.services}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={(s) => setSelectedService(s)}
              delay={i * 50}
              brandColor={profile.brandColors?.primary || brandPrimary}
            />
          ))}
        </div>
      </section>

      {profile.shopEnabled && <ShopSection brandPrimary={brandPrimary} />}

      <footer className="mt-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-5 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="font-display text-lg" style={{ color: brandPrimary }}>{profile.name}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-gray-50 hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-colors">
              <InstagramIcon size={16} />
            </a>
            <a href={`tel:${phoneNumber}`}
              className="p-2.5 rounded-full bg-gray-50 text-gray-400 transition-colors hover:opacity-70">
              <Phone size={16} />
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors">
              <WhatsAppIcon size={16} />
            </a>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            &copy; {new Date().getFullYear()} כל הזכויות שמורות |{' '}
            <a href="https://talsigron.co.il" target="_blank" rel="noopener noreferrer"
              className="hover:opacity-70 transition-colors">
              טל סיגרון - יסמין תקשורת
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Link href={`/${slug}/privacy`} className="text-[11px] text-gray-500 hover:opacity-70 transition-colors">מדיניות פרטיות</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/${slug}/accessibility`} className="text-[11px] text-gray-500 hover:opacity-70 transition-colors">הצהרת נגישות</Link>
          </div>
          <Link href={`/${slug}/admin`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:border-opacity-50 transition-colors"
            style={{ '--hover-color': brandPrimary } as React.CSSProperties}>
            <Settings size={12} />{labels.businessOwner}
          </Link>
        </div>
      </footer>

      <Modal isOpen={!!selectedService} onClose={handleCloseBooking}
        title={selectedService ? `${labels.makeBooking} - ${selectedService.name}` : ''} size="md">
        {selectedService && <BookingFlow service={selectedService} onClose={handleCloseBooking} />}
      </Modal>

      {isFitness && fullCustomer && (
        <CustomerProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          customer={fullCustomer}
          onUpdate={(updated) => {
            setFullCustomer(updated);
            setCustomer(updated);
          }}
        />
      )}
    </main>
    </>
  );
}
