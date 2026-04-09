'use client';

import { useState, useRef } from 'react';
import { useProfile, useGallery } from '@/hooks/useSupabase';
import { uploadImage, fetchAdminPassword, saveAdminPassword } from '@/lib/supabase-store';
import { useTenant } from '@/contexts/TenantContext';
import { BusinessProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Image,
  Save,
  Plus,
  Trash2,
  Phone,
  Store,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Upload,
  Lock,
  Eye,
  EyeOff,
  Palette,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarClock,
  Megaphone,
  ShoppingBag,
  Scissors,
  Mail,
} from 'lucide-react';
import ShopManager from './ShopManager';
import ServicesManager from './ServicesManager';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ProfileEditor() {
  const { supabase, config } = useTenant();
  const { businessId, labels } = config;
  const { profile: profileData, loading: profileLoading, update: updateProfileHook } = useProfile();
  const { images: galleryImages, loading: galleryLoading, add: addGalleryImg, remove: removeGalleryImg, reorder: reorderGalleryImg } = useGallery();
  const [localProfile, setLocalProfile] = useState<BusinessProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Gallery edit mode
  const [galleryEditMode, setGalleryEditMode] = useState(false);

  // Collapsible sections - all closed by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const handleChangePassword = async () => {
    setPassError('');
    if (!newPass || newPass.length < 4) {
      setPassError('הסיסמה קצרה מדי (לפחות 4 תווים)');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('הסיסמאות לא תואמות 🤔');
      return;
    }
    try {
      const correctPassword = await fetchAdminPassword(supabase, businessId);
      if (currentPass !== correctPassword) {
        setPassError('הסיסמה הנוכחית שגויה');
        return;
      }
      await saveAdminPassword(supabase, businessId, newPass);
      setPassSaved(true);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => {
        setPassSaved(false);
        setShowPasswordChange(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setPassError('שגיאה בשמירת הסיסמה');
    }
  };

  // Sync profile data into local state once loaded
  const profile = localProfile || profileData;

  const setProfile = (p: BusinessProfile) => setLocalProfile(p);

  const handleSave = async () => {
    if (!profile) return;
    try {
      const { images, ...profileWithoutImages } = profile;
      await updateProfileHook(profileWithoutImages);
      setOpenSections({});
      setSaved(true);
      setShowConfetti(true);
      setTimeout(() => setSaved(false), 2500);
      setTimeout(() => setShowConfetti(false), 1800);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('שגיאה בשמירה. נסה שוב.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const maxToUpload = Math.min(files.length, 6 - galleryImages.length);
      for (let i = 0; i < maxToUpload; i++) {
        const url = await uploadImage(supabase, businessId, files[i]);
        await addGalleryImg(url);
      }
    } catch (err) {
      console.error('Failed to upload images:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(supabase, businessId, file);
      setProfile({ ...profile, logo: url });
    } catch (err) {
      console.error('Failed to upload logo:', err);
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(supabase, businessId, file);
      setProfile({ ...profile, coverImage: url });
    } catch (err) {
      console.error('Failed to upload cover:', err);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (id: string) => {
    try {
      await removeGalleryImg(id);
    } catch (err) {
      console.error('Failed to remove image:', err);
    }
  };

  if (profileLoading || galleryLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-3 border-mint-200 border-t-mint-500 animate-spin" />
      </div>
    );
  }

  const bookingOptions = [
    { label: 'שבוע', value: 7 },
    { label: 'שבועיים', value: 14 },
    { label: '3 שבועות', value: 21 },
    { label: 'חודש', value: 30 },
    { label: 'ללא הגבלה', value: 0 },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {showConfetti && <SaveConfetti brandColor={config.defaultColors.primary} />}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">הגדרות העסק</h2>
        <Button
          variant="primary"
          size="sm"
          icon={saved ? <Save size={14} /> : <Save size={14} />}
          onClick={handleSave}
        >
          {saved ? 'עודכן בהצלחה! 💫' : 'שמירה'}
        </Button>
      </div>

      {/* Business name & description */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('business')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Store size={14} className="text-mint-500" />
            פרטי העסק
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['business'] && 'rotate-180')} />
        </button>
        {openSections['business'] && (
          <div className="space-y-4 pt-2">
            <Input
              label="שם העסק"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Menta Nail"
            />
            <div>
              <Input
                label="כותרת משנה / סלוגן"
                value={profile.subtitle || ''}
                onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })}
                placeholder="ציפורניים מושלמות בלחיצה אחת"
              />
              <p className="text-[10px] text-gray-400 mt-1">המשפט שיופיע מתחת לשם העסק</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                placeholder="תיאור קצר על העסק"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-mint-400 focus:ring-4 focus:ring-mint-100 focus:outline-none transition-all duration-200 placeholder:text-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">לוגו</label>
              {profile.logo && (
                <div className="mb-2 flex items-center gap-3">
                  <img src={profile.logo} alt="לוגו" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                  <button
                    onClick={() => setProfile({ ...profile, logo: '' })}
                    className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    הסרת לוגו
                  </button>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={<Upload size={14} />}
                onClick={() => logoInputRef.current?.click()}
                loading={uploadingLogo}
              >
                {uploadingLogo ? 'מעלה לוגו...' : 'העלאת לוגו'}
              </Button>
              <p className="text-[10px] text-gray-400 mt-1">{labels.logoHint}</p>
            </div>

            {/* Cover image */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">תמונה של המקום</label>
              {profile.coverImage && (
                <div className="mb-2">
                  <img src={profile.coverImage} alt="תמונת המקום" className="w-full h-28 rounded-xl object-cover border border-gray-200" />
                  <button
                    onClick={() => setProfile({ ...profile, coverImage: '' })}
                    className="text-xs text-red-500 hover:text-red-600 cursor-pointer mt-1"
                  >
                    הסרת תמונה
                  </button>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={<Upload size={14} />}
                onClick={() => coverInputRef.current?.click()}
                loading={uploadingCover}
              >
                {uploadingCover ? 'מעלה תמונה...' : 'העלאת תמונה'}
              </Button>
              <p className="text-[10px] text-gray-400 mt-1">מומלץ להעלות תמונה מזווית רחבה של המקום. גם בלי, זה ייראה מצוין 😍</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('contact')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Phone size={14} className="text-mint-500" />
            פרטי קשר
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['contact'] && 'rotate-180')} />
        </button>
        {openSections['contact'] && (
          <div className="space-y-4 pt-2">
            <Input
              label="טלפון"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="050-1234567"
              dir="ltr"
              className="text-left"
            />
            <Input
              label="קישור לאינסטגרם"
              type="url"
              value={profile.instagram}
              onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
              placeholder="https://www.instagram.com/..."
              dir="ltr"
              className="text-left"
            />
            <Input
              label="כתובת"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="כתובת העסק"
            />
          </div>
        )}
      </div>

      {/* Booking Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('booking')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <CalendarClock size={14} className="text-mint-500" />
            {labels.bookingSettings}
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['booking'] && 'rotate-180')} />
        </button>
        {openSections['booking'] && (
          <div className="space-y-4 pt-2">
            <label className="block text-sm font-medium text-gray-700">{labels.advanceBookingLabel}</label>
            <div className="flex flex-wrap gap-2">
              {bookingOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setProfile({ ...profile, maxBookingDays: opt.value })}
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer',
                    (profile.maxBookingDays === opt.value || (profile.maxBookingDays === undefined && opt.value === 30))
                      ? 'border-mint-400 bg-mint-50 text-mint-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500">
              {labels.advanceBookingHint}
            </p>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{labels.maxBookingsLabel}</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 0, label: 'ללא הגבלה' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile({ ...profile, maxActiveBookings: opt.value })}
                    className={cn(
                      'py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer',
                      ((profile.maxActiveBookings ?? 1) === opt.value)
                        ? 'border-mint-400 bg-mint-50 text-mint-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {labels.maxBookingsHint}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{labels.cancelBookingLabel}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setProfile({ ...profile, cancelPolicy: 'website' })}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer',
                    (profile.cancelPolicy === 'website')
                      ? 'border-mint-400 bg-mint-50 text-mint-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  באתר
                </button>
                <button
                  onClick={() => setProfile({ ...profile, cancelPolicy: 'whatsapp' })}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer',
                    (!profile.cancelPolicy || profile.cancelPolicy === 'whatsapp')
                      ? 'border-mint-400 bg-mint-50 text-mint-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  בוואטסאפ בלבד
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {profile.cancelPolicy === 'website'
                  ? labels.cancelFromSite
                  : labels.cancelViaWhatsapp}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">זמן מינימלי לפני הזמנה</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 0, label: 'כל הזמן' },
                  { value: 1, label: 'שעה' },
                  { value: 2, label: 'שעתיים' },
                  { value: 3, label: '3 שעות' },
                  { value: 4, label: '4 שעות' },
                  { value: 5, label: '5 שעות' },
                  { value: 6, label: '6 שעות' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile({ ...profile, minHoursBeforeBooking: opt.value })}
                    className={cn(
                      'py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer',
                      ((profile.minHoursBeforeBooking ?? 0) === opt.value)
                        ? 'border-mint-400 bg-mint-50 text-mint-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                כמה זמן מראש לקוח צריך להזמין לפני {labels.booking}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">ביטול תור אחרון (שעות לפני)</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 2, label: '2 שעות' },
                  { value: 4, label: '4 שעות' },
                  { value: 6, label: '6 שעות' },
                  { value: 12, label: '12 שעות' },
                  { value: 24, label: '24 שעות' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile({ ...profile, cancellationHoursLimit: opt.value })}
                    className={cn(
                      'py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer',
                      ((profile.cancellationHoursLimit ?? 6) === opt.value)
                        ? 'border-mint-400 bg-mint-50 text-mint-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                כמה שעות לפני התור הלקוח יכול לבטל בעצמו
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">הצגת משתתפים ללקוחות</label>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    לקוחות יראו מי כבר רשום ליום זה לפני שהם קובעים
                  </p>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, showParticipants: !profile.showParticipants })}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer',
                    profile.showParticipants ? 'bg-mint-500' : 'bg-gray-300'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                    profile.showParticipants ? 'right-0.5' : 'right-[22px]'
                  )} />
                </button>
              </div>
            </div>

            {config.category === 'fitness' && (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">חובת הצהרת בריאות</label>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {profile.requireHealthDeclaration
                        ? 'לקוחות חייבים לאשר הצהרת בריאות לפני קביעת אימון'
                        : 'הפעל כדי לחייב אישור הצהרת בריאות'}
                    </p>
                  </div>
                  <button
                    onClick={() => setProfile({ ...profile, requireHealthDeclaration: !profile.requireHealthDeclaration })}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer',
                      profile.requireHealthDeclaration ? 'bg-mint-500' : 'bg-gray-300'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                      profile.requireHealthDeclaration ? 'right-0.5' : 'right-[22px]'
                    )} />
                  </button>
                </div>
                {profile.requireHealthDeclaration && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    הטקסט המוצג ללקוח הוא טקסט סטנדרטי של הצהרת בריאות לפעילות גופנית, עם שם העסק בכותרת.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popup banner message */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('banner')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Megaphone size={14} className="text-mint-500" />
            הודעה מתפרצת במסך הבית
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['banner'] && 'rotate-180')} />
        </button>
        {openSections['banner'] && profile && (
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-600">הצגת הודעה</span>
              <button
                onClick={() => setProfile({ ...profile, bannerEnabled: !profile.bannerEnabled })}
                className="cursor-pointer"
              >
                {profile.bannerEnabled
                  ? <ToggleRight className="text-mint-500" size={28} />
                  : <ToggleLeft className="text-gray-300" size={28} />}
              </button>
            </div>
            {profile.bannerEnabled && (
              <>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">טקסט ההודעה</label>
                  <textarea
                    value={profile.bannerMessage || ''}
                    onChange={(e) => setProfile({ ...profile, bannerMessage: e.target.value })}
                    placeholder="לדוגמה: בתאריך 29/4 לא יתקיימו אימונים קבוצתיים בשל חג יום העצמאות. חג עצמאות שמח!"
                    className="w-full text-sm border border-gray-200 rounded-lg p-2 min-h-[80px] focus:outline-none focus:border-mint-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">תאריך סיום (אופציונלי)</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={profile.bannerEndDate || ''}
                      onChange={(e) => setProfile({ ...profile, bannerEndDate: e.target.value })}
                      className="flex-1 text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-mint-400"
                    />
                    <input
                      type="time"
                      value={profile.bannerEndTime || ''}
                      onChange={(e) => setProfile({ ...profile, bannerEndTime: e.target.value })}
                      disabled={!profile.bannerEndDate}
                      className="w-28 text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-mint-400 disabled:bg-gray-50 disabled:text-gray-300"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">אם ריק — ההודעה תוצג עד שתעדכן או תכבה אותה ידנית. אם יש תאריך ללא שעה — תסתיים בסוף היום</p>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-600 block">ניתן לסגירה על ידי הלקוח</span>
                    <span className="text-[10px] text-gray-400">לקוח יוכל לסגור את ההודעה בלחיצה על X</span>
                  </div>
                  <button
                    onClick={() => setProfile({ ...profile, bannerDismissible: !(profile.bannerDismissible !== false) })}
                    className="cursor-pointer"
                  >
                    {profile.bannerDismissible !== false
                      ? <ToggleRight className="text-mint-500" size={28} />
                      : <ToggleLeft className="text-gray-300" size={28} />}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('notifications')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Mail size={14} className="text-mint-500" />
            עדכונים
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['notifications'] && 'rotate-180')} />
        </button>
        {openSections['notifications'] && profile && (
          <div className="pt-3 space-y-4">
            <div>
              <label className="text-xs text-gray-600 block mb-1">מייל לקבלת עדכונים</label>
              <input
                type="email"
                value={profile.ownerEmail || ''}
                onChange={(e) => setProfile({ ...profile, ownerEmail: e.target.value })}
                placeholder="your@email.com"
                dir="ltr"
                className="w-full text-sm border border-gray-200 rounded-lg p-2 text-left"
              />
            </div>

            {/* Owner notifications */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-700 mb-2">עדכונים לבעל העסק</p>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={profile.ownerNotify?.email ?? true}
                    onChange={(e) => setProfile({ ...profile, ownerNotify: { ...(profile.ownerNotify || { email: true, sms: false, events: {} }), email: e.target.checked } })}
                  />
                  מייל
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-400">
                  <input type="checkbox" disabled />
                  SMS (בקרוב)
                </label>
              </div>
              <div className="space-y-1.5">
                {([
                  { key: 'new_customer', label: 'לקוח חדש במערכת' },
                  { key: 'customer_booked', label: 'לקוח נרשם לאימון' },
                  { key: 'customer_cancelled', label: 'לקוח ביטל אימון' },
                  { key: 'monthly_summary', label: 'סיכום חודשי' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={profile.ownerNotify?.events?.[key] ?? false}
                      onChange={(e) => setProfile({
                        ...profile,
                        ownerNotify: {
                          ...(profile.ownerNotify || { email: true, sms: false, events: {} }),
                          events: { ...(profile.ownerNotify?.events || {}), [key]: e.target.checked },
                        },
                      })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Customer notifications */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-700 mb-2">עדכונים ללקוח</p>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={profile.customerNotify?.email ?? true}
                    onChange={(e) => setProfile({ ...profile, customerNotify: { ...(profile.customerNotify || { email: true, sms: false, events: {} }), email: e.target.checked } })}
                  />
                  מייל
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-400">
                  <input type="checkbox" disabled />
                  SMS (בקרוב)
                </label>
              </div>
              <div className="space-y-1.5">
                {([
                  { key: 'booking_confirmed', label: 'אישור רישום' },
                  { key: 'cancel_confirmed', label: 'אישור ביטול' },
                  { key: 'birthday_greeting', label: 'ברכת יום הולדת (בשעה 8:00)' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={profile.customerNotify?.events?.[key] ?? false}
                      onChange={(e) => setProfile({
                        ...profile,
                        customerNotify: {
                          ...(profile.customerNotify || { email: true, sms: false, events: {} }),
                          events: { ...(profile.customerNotify?.events || {}), [key]: e.target.checked },
                        },
                      })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('services')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Scissors size={14} className="text-mint-500" />
            {labels.services}
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['services'] && 'rotate-180')} />
        </button>
        {openSections['services'] && (
          <div className="pt-3">
            <ServicesManager />
          </div>
        )}
      </div>

      {/* Shop */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('shop')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ShoppingBag size={14} className="text-mint-500" />
            חנות
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['shop'] && 'rotate-180')} />
        </button>
        {openSections['shop'] && (
          <div className="pt-3">
            <ShopManager />
          </div>
        )}
      </div>

      {/* Gallery images */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('gallery')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Image size={14} className="text-mint-500" />
            תמונות גלריה
            <span className="text-[10px] text-gray-400 font-normal">{galleryImages.length}/6</span>
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['gallery'] && 'rotate-180')} />
        </button>
        {openSections['gallery'] && (
          <div className="space-y-4 pt-2">
            {galleryImages.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setGalleryEditMode(!galleryEditMode)}
                  className="text-xs text-mint-600 hover:text-mint-700 font-medium cursor-pointer px-2 py-1 rounded-lg hover:bg-mint-50 transition-colors"
                >
                  {galleryEditMode ? 'סיום עריכה' : 'עריכה'}
                </button>
              </div>
            )}

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((img, idx) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      src={img.url}
                      alt="תמונת גלריה"
                      className="w-full h-full object-cover"
                    />
                    {galleryEditMode && (
                      <>
                        {/* Delete button */}
                        <button
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer shadow-md"
                        >
                          <Trash2 size={14} />
                        </button>
                        {/* Reorder arrows - always visible in edit mode */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {idx > 0 && (
                            <button
                              onClick={() => reorderGalleryImg(idx, idx - 1)}
                              className="w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer shadow-md active:bg-black/90"
                            >
                              <ChevronRight size={16} />
                            </button>
                          )}
                          {idx < galleryImages.length - 1 && (
                            <button
                              onClick={() => reorderGalleryImg(idx, idx + 1)}
                              className="w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer shadow-md active:bg-black/90"
                            >
                              <ChevronLeft size={16} />
                            </button>
                          )}
                        </div>
                        {/* Position number */}
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-mint-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                          {idx + 1}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {galleryImages.length < 6 && (
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  loading={uploading}
                >
                  {uploading ? 'מעלה תמונות...' : 'העלאת תמונות'}
                </Button>
              </div>
            )}

            <p className="text-[11px] text-gray-500">
              אפשר להעלות עד 6 תמונות בבת אחת 😍
            </p>
          </div>
        )}
      </div>

      {/* Brand Colors */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('colors')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Palette size={14} className="text-mint-500" />
            צבעי מותג
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['colors'] && 'rotate-180')} />
        </button>
        {openSections['colors'] && (
          <div className="space-y-4 pt-2">
            <p className="text-[10px] text-gray-500">
              התאימי את הצבעים של האתר למותג שלך
            </p>

            {/* Primary color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">צבע כותרות וכפתורים</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.brandColors?.primary || '#14b898'}
                  onChange={(e) => setProfile({ ...profile, brandColors: { primary: e.target.value, secondary: profile.brandColors?.secondary || '#f0fdf9', background: profile.brandColors?.background || '#fafffe' } })}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={profile.brandColors?.primary || '#14b898'}
                  onChange={(e) => setProfile({ ...profile, brandColors: { primary: e.target.value, secondary: profile.brandColors?.secondary || '#f0fdf9', background: profile.brandColors?.background || '#fafffe' } })}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-center"
                  dir="ltr"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'מנטה', color: '#14b898' },
                  { label: 'ורוד', color: '#ec4899' },
                  { label: 'סגול', color: '#8b5cf6' },
                  { label: 'זהב', color: '#d97706' },
                  { label: 'אדום', color: '#ef4444' },
                  { label: 'כחול כהה', color: '#1e3a5f' },
                  { label: 'שחור', color: '#1a1a2e' },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setProfile({ ...profile, brandColors: { primary: preset.color, secondary: profile.brandColors?.secondary || '#f0fdf9', background: profile.brandColors?.background || '#fafffe' } })}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 text-[10px] text-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: preset.color }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">צבע רקע משני</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.brandColors?.secondary || '#f0fdf9'}
                  onChange={(e) => setProfile({ ...profile, brandColors: { primary: profile.brandColors?.primary || '#14b898', secondary: e.target.value, background: profile.brandColors?.background || '#fafffe' } })}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={profile.brandColors?.secondary || '#f0fdf9'}
                  onChange={(e) => setProfile({ ...profile, brandColors: { primary: profile.brandColors?.primary || '#14b898', secondary: e.target.value, background: profile.brandColors?.background || '#fafffe' } })}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-center"
                  dir="ltr"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'מנטה בהיר', color: '#f0fdf9' },
                  { label: 'ורוד בהיר', color: '#fdf2f8' },
                  { label: 'סגול בהיר', color: '#f5f3ff' },
                  { label: 'זהב בהיר', color: '#fffbeb' },
                  { label: 'אדום בהיר', color: '#fef2f2' },
                  { label: 'כחול בהיר', color: '#eff6ff' },
                  { label: 'אפור בהיר', color: '#f9fafb' },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setProfile({ ...profile, brandColors: { primary: profile.brandColors?.primary || '#14b898', secondary: preset.color, background: profile.brandColors?.background || '#fafffe' } })}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 text-[10px] text-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ backgroundColor: preset.color }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">צבע רקע מרכזי</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.brandColors?.background || '#fafffe'}
                  onChange={(e) => setProfile({ ...profile, brandColors: { primary: profile.brandColors?.primary || '#14b898', secondary: profile.brandColors?.secondary || '#f0fdf9', background: e.target.value } })}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={profile.brandColors?.background || '#fafffe'}
                  onChange={(e) => setProfile({ ...profile, brandColors: { primary: profile.brandColors?.primary || '#14b898', secondary: profile.brandColors?.secondary || '#f0fdf9', background: e.target.value } })}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-center"
                  dir="ltr"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'מנטה עדין', color: '#fafffe' },
                  { label: 'לבן', color: '#ffffff' },
                  { label: 'ורוד עדין', color: '#fffbfc' },
                  { label: 'סגול עדין', color: '#fdfcff' },
                  { label: 'חם', color: '#fffcf5' },
                  { label: 'אפור עדין', color: '#fafafa' },
                  { label: 'כהה', color: '#1a1a2e' },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setProfile({ ...profile, brandColors: { primary: profile.brandColors?.primary || '#14b898', secondary: profile.brandColors?.secondary || '#f0fdf9', background: preset.color } })}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 text-[10px] text-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ backgroundColor: preset.color }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('payments')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <CreditCard size={14} className="text-mint-500" />
            אפשרויות תשלום
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['payments'] && 'rotate-180')} />
        </button>
        {openSections['payments'] && (
          <div className="space-y-4 pt-2">
            <p className="text-[11px] text-gray-500">
              הלקוחות ישלמו ישירות אליך - בלי עמלות ובלי מתווכים 💰
            </p>

            {/* Bit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ביט</span>
                <button
                  onClick={() => setProfile({ ...profile, enableBit: !profile.enableBit })}
                  className="cursor-pointer"
                >
                  {profile.enableBit ? (
                    <ToggleRight size={32} className="text-mint-500" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-300" />
                  )}
                </button>
              </div>
              {profile.enableBit && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setProfile({ ...profile, bitType: 'regular' })}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer',
                        (!profile.bitType || profile.bitType === 'regular')
                          ? 'border-mint-400 bg-mint-50 text-mint-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      ביט רגיל
                    </button>
                    <button
                      onClick={() => setProfile({ ...profile, bitType: 'business' })}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer',
                        profile.bitType === 'business'
                          ? 'border-mint-400 bg-mint-50 text-mint-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      ביט לעסקים
                    </button>
                  </div>
                  {profile.bitType === 'business' && (
                    <Input
                      value={profile.bitLink || ''}
                      onChange={(e) => setProfile({ ...profile, bitLink: e.target.value })}
                      placeholder="הדביקי את הלינק מביט לעסקים"
                      dir="ltr"
                      className="text-left"
                    />
                  )}
                  {(!profile.bitType || profile.bitType === 'regular') && (
                    <p className="text-[10px] text-gray-500">
                      {labels.clientSeesBit}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* PayBox */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">פייבוקס</span>
                <button
                  onClick={() => setProfile({ ...profile, enablePaybox: !profile.enablePaybox })}
                  className="cursor-pointer"
                >
                  {profile.enablePaybox ? (
                    <ToggleRight size={32} className="text-mint-500" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-300" />
                  )}
                </button>
              </div>
              {profile.enablePaybox && (
                <p className="text-[10px] text-gray-500">
                  {labels.clientSeesPaybox}
                </p>
              )}
            </div>

            {/* Additional payment methods for finance tracking */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-500 mb-2">אמצעי תשלום נוספים (לפילוח בטאב כספים):</p>
              {([
                { key: 'cash', label: 'מזומן' },
                { key: 'credit', label: 'כרטיס אשראי' },
                { key: 'checks', label: 'שיקים' },
                { key: 'bank_transfer', label: 'העברה בנקאית' },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{label}</span>
                  <button
                    onClick={() => setProfile({
                      ...profile,
                      paymentMethods: { ...(profile.paymentMethods || {}), [key]: !(profile.paymentMethods?.[key] ?? false) }
                    })}
                    className="cursor-pointer"
                  >
                    {profile.paymentMethods?.[key] ? (
                      <ToggleRight size={28} className="text-mint-500" />
                    ) : (
                      <ToggleLeft size={28} className="text-gray-300" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Password change */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <button onClick={() => toggleSection('password')} className="w-full flex items-center justify-between py-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Lock size={14} className="text-mint-500" />
            סיסמת כניסה
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['password'] && 'rotate-180')} />
        </button>
        {openSections['password'] && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-end">
              <Button
                variant={showPasswordChange ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => {
                  setShowPasswordChange(!showPasswordChange);
                  setPassError('');
                  setCurrentPass('');
                  setNewPass('');
                  setConfirmPass('');
                }}
              >
                {showPasswordChange ? 'ביטול' : 'שינוי סיסמה'}
              </Button>
            </div>

            {showPasswordChange && (
              <div className="space-y-3 animate-fade-in">
                <div className="relative">
                  <Input
                    label="סיסמה נוכחית"
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="הסיסמה הנוכחית שלך"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="סיסמה חדשה"
                    type={showNewPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="בחרי סיסמה חדשה"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Input
                  label="אימות סיסמה חדשה"
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="שוב את הסיסמה החדשה"
                  error={passError}
                />
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleChangePassword}
                  icon={<Lock size={14} />}
                >
                  {passSaved ? 'הסיסמה שונתה! 🔐' : 'שמירת סיסמה חדשה'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom save button - always accessible */}
      <div className="sticky bottom-20 z-30">
        <Button
          variant="primary"
          className="w-full shadow-lg"
          onClick={handleSave}
          icon={<Save size={16} />}
        >
          {saved ? 'עודכן בהצלחה! 💫' : 'שמירה'}
        </Button>
      </div>
    </div>
  );
}

function SaveConfetti({ brandColor }: { brandColor: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center animate-scale-in"
        style={{ backgroundColor: `${brandColor}18`, border: `2.5px solid ${brandColor}` }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M8 18L15 25L28 11" stroke={brandColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
