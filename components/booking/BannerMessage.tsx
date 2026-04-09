'use client';

import { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';

interface BannerMessageProps {
  message: string;
  endDate?: string;
  dismissible?: boolean;
  brandPrimary: string;
  tenantId: string;
}

export default function BannerMessage({ message, endDate, dismissible = true, brandPrimary, tenantId }: BannerMessageProps) {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when message changes
  const storageKey = `banner_dismissed_${tenantId}_${encodeURIComponent(message).slice(0, 40)}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(storageKey) === '1') setDismissed(true);
  }, [storageKey]);

  // Check if banner expired
  if (endDate) {
    const today = new Date().toISOString().split('T')[0];
    if (today > endDate) return null;
  }

  if (!message || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(storageKey, '1'); } catch { /* ignore */ }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 mt-4">
      <div
        className="relative rounded-2xl p-4 shadow-md text-white flex items-start gap-3"
        style={{ backgroundColor: brandPrimary }}
      >
        <Megaphone size={20} className="shrink-0 mt-0.5" />
        <p className="flex-1 text-sm font-medium leading-relaxed whitespace-pre-wrap">{message}</p>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 -m-1 rounded-full hover:bg-white/20 transition-all active:scale-90"
            aria-label="סגור"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
