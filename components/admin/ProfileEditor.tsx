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
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ProfileEditor() {
  const { supabase, config } = useTenant();
  const { businessId } = config;
  const { profile: profileData, loading: profileLoading, update: updateProfileHook } = useProfile();
  const { images: galleryImages, loading: galleryLoading, add: addGalleryImg, remove: removeGalleryImg, reorder: reorderGalleryImg } = useGallery();
  const [localProfile, setLocalProfile] = useState<BusinessProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('שגיאה בשמירה. נסי שוב.');
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
              <p className="text-[10px] text-gray-400 mt-1">העלי לוגו בקובץ PNG שקוף לתצוגה מושלמת. אם אין, תשאירי ריק 😊</p>
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
            הגדרות קביעת תורים
          </h3>
          <ChevronDown size={16} className={cn('text-gray-400 transition-transform', openSections['booking'] && 'rotate-180')} />
        </button>
        {openSections['booking'] && (
          <div className="space-y-4 pt-2">
            <label className="block text-sm font-medium text-gray-700">כמה זמן קדימה ניתן לקבוע תור?</label>
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
              לקוחות יוכלו לקבוע תורים רק בטווח הזמן שנבחר
            </p>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">כמה תורים לקוחה יכולה לקבוע קדימה?</label>
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
                מונע מלקוחה לתפוס יותר מדי תורים בו-זמנית
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">ביטול תור</label>
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
                  ? 'לקוחות יוכלו לבטל תורים ישירות מהאתר'
                  : 'לקוחות יצטרכו ליצור קשר בוואטסאפ לביטול תור'}
              </p>
            </div>
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
                      הלקוחה תראה כפתור ביט עם המספר שלך והסכום 💳
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
                  הלקוחה תראה כפתור פייבוקס עם המספר שלך והסכום 💳
                </p>
              )}
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
