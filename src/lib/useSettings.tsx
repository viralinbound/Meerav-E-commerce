import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MiraDB } from './supabase.js';

export interface SiteSettings {
  siteName?: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  accentLightColor?: string;
  headingColor?: string;
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  headingFontFamily?: string;
  announcementText?: string;
  heroCtaText?: string;
  heroSecondaryCtaText?: string;
  whatsappNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  footerText?: string;
}

interface SettingsContextValue {
  settings: SiteSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({ settings: null, loading: true });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    MiraDB.fetchSiteSettings()
      .then((data: SiteSettings | null) => {
        if (!cancelled) setSettings(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    if (typeof MiraDB.subscribeTable === 'function') {
      const sub = MiraDB.subscribeTable('site_settings', (payload: any) => {
        if (payload.new) {
          MiraDB.fetchSiteSettings().then((data: SiteSettings | null) => {
            if (!cancelled) setSettings(data);
          });
        }
      });
      return () => {
        cancelled = true;
        sub?.unsubscribe?.();
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return <SettingsContext.Provider value={{ settings, loading }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
