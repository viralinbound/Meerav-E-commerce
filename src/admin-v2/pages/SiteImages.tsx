import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { Card, LoadingState, ErrorState } from '../ui';
import { MediaUploader } from '../MediaUploader';
import { useAdminAuth } from '../useAdminAuth';
import { logChange } from '../activityLog';

interface AdminSiteImage {
  id: string;
  label: string;
  image: string;
  sortOrder: number;
}

// Fixed set of named photo slots used across the storefront (Heritage
// banner, Our Tradition photo, Gift Collection cards). These always render
// here even before the migration is run, so the admin can see exactly what
// will become editable once the site_images table exists.
const DEFAULT_SLOTS: AdminSiteImage[] = [
  {
    id: 'heritage-banner',
    label: 'Heritage Banner (below Fan Favourites)',
    image: 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/sections/heritage-section-banner.webp',
    sortOrder: 1,
  },
  {
    id: 'tradition-banner',
    label: 'Our Tradition Photo',
    image: 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/sections/our-tradition-banner.webp',
    sortOrder: 2,
  },
  {
    id: 'gift-boxes',
    label: 'Curated Collections — Gift Boxes',
    image: 'https://images.pexels.com/photos/28769884/pexels-photo-28769884.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    sortOrder: 3,
  },
  {
    id: 'handmade-gourmet',
    label: 'Curated Collections — Handmade Gourmet',
    image: 'https://images.pexels.com/photos/8887061/pexels-photo-8887061.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    sortOrder: 4,
  },
  {
    id: 'festive-specials',
    label: 'Curated Collections — Festive Specials',
    image: 'https://images.pexels.com/photos/8887011/pexels-photo-8887011.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    sortOrder: 5,
  },
];

export function SiteImages() {
  const { admin: me } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [images, setImages] = useState<AdminSiteImage[]>(DEFAULT_SLOTS);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    MiraDB.fetchSiteImages(MiraDB.adminClient)
      .then((rows: AdminSiteImage[]) => {
        if (rows.length) {
          setImages(rows);
          setUnavailable(false);
        } else {
          setUnavailable(true);
        }
      })
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReplace = async (slot: AdminSiteImage, url: string) => {
    const updated = { ...slot, image: url };
    setImages((cur) => cur.map((s) => (s.id === slot.id ? updated : s)));
    setSavingId(slot.id);
    const ok = await MiraDB.dbUpsertSiteImage(updated, MiraDB.adminClient);
    setSavingId(null);
    if (ok) {
      setUnavailable(false);
      await logChange(me, 'site_image.update', slot.label, 'site_images', slot.id, slot, updated);
    } else {
      alert('Could not save this photo. Please try again.');
      load();
    }
  };

  if (loading) return <LoadingState label="Loading site photos…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      {unavailable && (
        <Card className="p-5 flex items-start gap-3 border-saffron-300 bg-saffron-50">
          <ImageOff className="w-5 h-5 text-saffron-700 shrink-0 mt-0.5" />
          <div className="text-sm text-charcoal-700">
            <p className="font-semibold mb-1">Site photo management isn't set up in the database yet.</p>
            <p>
              Run <code className="px-1.5 py-0.5 bg-white rounded border border-cream-300 text-xs">supabase/add_site_images.sql</code> once
              in the Supabase SQL Editor to enable this page — it seeds your current photos automatically so nothing changes on the
              website until you replace them here.
            </p>
          </div>
        </Card>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-cream-200">
          <h3 className="font-serif text-lg font-bold text-maroon-900">Site Photos</h3>
          <p className="text-sm text-charcoal-400">
            Replace any of these key website photos — changes save live and update the site immediately, no publish step needed.
          </p>
        </div>

        <div className="divide-y divide-cream-100">
          {images.map((slot) => (
            <div
              key={slot.id}
              className={`flex flex-col sm:flex-row gap-4 px-5 py-4 transition-opacity ${savingId === slot.id ? 'opacity-60' : ''}`}
            >
              <img
                src={slot.image}
                alt=""
                className="w-40 h-24 object-cover rounded-lg bg-cream-100 border border-cream-300 shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                <p className="text-sm font-medium text-charcoal-800">{slot.label}</p>
                <MediaUploader
                  folder="site-images"
                  accept="image/*"
                  label="Replace Photo"
                  onUploaded={(url) => handleReplace(slot, url)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
