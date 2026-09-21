import { useEffect, useState, type FormEvent } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { Card, LoadingState, ErrorState } from '../ui';
import { useAdminAuth } from '../useAdminAuth';
import { logChange } from '../activityLog';

const FONT_OPTIONS = [
  'Playfair Display', 'Poppins', 'Merriweather', 'Newsreader', 'Manrope',
  'Nunito Sans', 'Cormorant Garamond', 'Baloo 2', 'Fredoka', 'Work Sans',
  'Fraunces', 'Plus Jakarta Sans', 'Outfit', 'Josefin Sans', 'Cinzel',
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-11 h-11 rounded-lg border border-cream-300 cursor-pointer shrink-0"
        />
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
        />
      </div>
    </div>
  );
}

export function StoreSettings() {
  const { admin: me } = useAdminAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    MiraDB.fetchSiteSettings()
      .then((data: any) => setSettings(data || {}))
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = (key: string, value: any) => setSettings((s: any) => ({ ...s, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const { data: beforeRow } = await MiraDB.adminClient.from('site_settings').select('*').eq('id', 'default').maybeSingle();
    const ok = await MiraDB.dbUpsertSiteSettings(settings, MiraDB.adminClient);
    setSaving(false);
    if (ok) {
      const { data: afterRow } = await MiraDB.adminClient.from('site_settings').select('*').eq('id', 'default').maybeSingle();
      await logChange(me, 'settings.update', 'Store Settings', 'site_settings', 'default', beforeRow, afterRow);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('Could not save settings. Please try again.');
    }
  };

  if (loading) return <LoadingState label="Loading store settings…" />;
  if (error && !settings) return <ErrorState message={error} onRetry={load} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal-500">Changes here go live on the storefront immediately after saving.</p>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-maroon-700 text-cream-50 text-sm font-semibold hover:bg-maroon-800 transition-colors disabled:opacity-60 shrink-0"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <Card className="p-6">
        <h3 className="font-serif text-lg font-bold text-maroon-900 mb-4">Brand Identity</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Site Name</label>
            <input
              value={settings.siteName || ''}
              onChange={(e) => update('siteName', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Tagline</label>
            <input
              value={settings.tagline || ''}
              onChange={(e) => update('tagline', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-serif text-lg font-bold text-maroon-900 mb-4">Theme — Colors &amp; Typography</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <ColorField label="Primary Color" value={settings.primaryColor} onChange={(v) => update('primaryColor', v)} />
          <ColorField label="Secondary Color" value={settings.secondaryColor} onChange={(v) => update('secondaryColor', v)} />
          <ColorField label="Accent Color" value={settings.accentColor} onChange={(v) => update('accentColor', v)} />
          <ColorField label="Heading Text Color" value={settings.headingColor} onChange={(v) => update('headingColor', v)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Heading Font</label>
            <select
              value={settings.headingFontFamily || ''}
              onChange={(e) => update('headingFontFamily', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            >
              {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Body Font</label>
            <select
              value={settings.fontFamily || ''}
              onChange={(e) => update('fontFamily', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            >
              {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-serif text-lg font-bold text-maroon-900 mb-4">Storefront Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Top Announcement Bar Text</label>
            <input
              value={settings.announcementText || ''}
              onChange={(e) => update('announcementText', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Hero Primary Button Text</label>
              <input
                value={settings.heroCtaText || ''}
                onChange={(e) => update('heroCtaText', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Hero Secondary Button Text</label>
              <input
                value={settings.heroSecondaryCtaText || ''}
                onChange={(e) => update('heroSecondaryCtaText', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Footer Copyright Text</label>
            <input
              value={settings.footerText || ''}
              onChange={(e) => update('footerText', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-serif text-lg font-bold text-maroon-900 mb-4">Contact &amp; Social</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">WhatsApp Number</label>
            <input
              value={settings.whatsappNumber || ''}
              onChange={(e) => update('whatsappNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Contact Email</label>
            <input
              value={settings.contactEmail || ''}
              onChange={(e) => update('contactEmail', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Contact Phone</label>
            <input
              value={settings.contactPhone || ''}
              onChange={(e) => update('contactPhone', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Address</label>
            <input
              value={settings.contactAddress || ''}
              onChange={(e) => update('contactAddress', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
        </div>
      </Card>
    </form>
  );
}
