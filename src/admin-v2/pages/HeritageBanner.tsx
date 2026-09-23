import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { Card, LoadingState, ErrorState } from '../ui';
import { StylePanel, type Styleable } from '../StylePanel';

interface AdminHeritageContent extends Styleable {
  title: string;
  subtitle: string;
  cta: string;
}

const DEFAULT_CONTENT: AdminHeritageContent = {
  title: '',
  subtitle: '',
  cta: 'Explore Our Snacks',
  titleSize: 'md',
  subtitleSize: 'md',
  titleColor: '#7a2026',
  buttonSize: 'md',
  buttonBgColor: '#fdf9f0',
  buttonTextColor: '#7a2026',
};

export function HeritageBanner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [content, setContent] = useState<AdminHeritageContent>(DEFAULT_CONTENT);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    MiraDB.fetchHeritageContent(MiraDB.adminClient)
      .then((row: AdminHeritageContent | null) => {
        if (row) {
          setContent(row);
          setUnavailable(false);
        } else {
          setUnavailable(true);
        }
      })
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const persist = async (updated: AdminHeritageContent) => {
    setSaving(true);
    const ok = await MiraDB.dbUpsertHeritageContent(updated, MiraDB.adminClient);
    setSaving(false);
    if (ok) {
      setUnavailable(false);
    } else {
      alert('Could not save this change. Please try again.');
      load();
    }
  };

  const editLocally = (patch: Partial<AdminHeritageContent>) => {
    setContent((cur) => ({ ...cur, ...patch }));
  };

  const handleUpdate = (patch: Partial<AdminHeritageContent>) => {
    const updated = { ...content, ...patch };
    setContent(updated);
    persist(updated);
  };

  if (loading) return <LoadingState label="Loading heritage banner…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      {unavailable && (
        <Card className="p-5 flex items-start gap-3 border-saffron-300 bg-saffron-50">
          <ImageOff className="w-5 h-5 text-saffron-700 shrink-0 mt-0.5" />
          <div className="text-sm text-charcoal-700">
            <p className="font-semibold mb-1">Heritage banner text management isn't set up in the database yet.</p>
            <p>
              Run <code className="px-1.5 py-0.5 bg-white rounded border border-cream-300 text-xs">supabase/add_heritage_content.sql</code> once
              in the Supabase SQL Editor to enable this page — the banner keeps working with its current photo until you add text here.
            </p>
          </div>
        </Card>
      )}

      <Card>
        <div className={`px-5 py-4 border-b border-cream-200 transition-opacity ${saving ? 'opacity-60' : ''}`}>
          <h3 className="font-serif text-lg font-bold text-maroon-900">Heritage Banner</h3>
          <p className="text-sm text-charcoal-400 mb-4">
            The "Heritage of Bikaner" section, right after Fan Favourites. Its photo is edited in Admin &gt; Site Photos — this page controls
            the optional title/subtitle overlay and the Explore Our Snacks button. Leave title blank to show just the photo, exactly as now.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={content.title}
              onChange={(e) => editLocally({ title: e.target.value })}
              onBlur={() => persist(content)}
              placeholder="Title (leave blank to show just the photo)"
              className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
            />
            <input
              value={content.cta}
              onChange={(e) => editLocally({ cta: e.target.value })}
              onBlur={() => persist(content)}
              placeholder="Button text"
              className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
            />
            <textarea
              value={content.subtitle}
              onChange={(e) => editLocally({ subtitle: e.target.value })}
              onBlur={() => persist(content)}
              placeholder="Subtitle"
              rows={2}
              className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white sm:col-span-2 resize-none"
            />
          </div>
        </div>

        <StylePanel value={content} onChange={handleUpdate} />
      </Card>
    </div>
  );
}
