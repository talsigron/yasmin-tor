'use client';

import { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useProfile } from '@/hooks/useSupabase';

export default function TenantHead() {
  const { config } = useTenant();
  const { profile } = useProfile();

  useEffect(() => {
    const name = profile?.name || config.id;
    document.title = name;

    let metaTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
    if (!metaTitle) {
      metaTitle = document.createElement('meta');
      metaTitle.name = 'apple-mobile-web-app-title';
      document.head.appendChild(metaTitle);
    }
    metaTitle.content = name;

    if (profile?.logo) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'apple-touch-icon';
        document.head.appendChild(link);
      }
      link.href = profile.logo;
    }
  }, [profile, config.id]);

  return null;
}
