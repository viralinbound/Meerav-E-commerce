import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, ImageOff, Move, ChevronUp, ChevronDown } from 'lucide-react';

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)($|\?)/i;
function isVideoUrl(url: string) {
  return VIDEO_EXTENSIONS.test(url);
}
import { MiraDB } from '@/lib/supabase.js';
import { Card, LoadingState, ErrorState, EmptyState } from '../ui';
import { MediaUploader } from '../MediaUploader';

interface AdminHeroBanner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  buttonX: number;
  buttonY: number;
  sortOrder: number;
  isVisible: boolean;
}

function ButtonPositionPicker({
  banner,
  onDrag,
  onDrop,
}: {
  banner: AdminHeroBanner;
  onDrag: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const posFromEvent = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return null;
    const rect = box.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const pos = posFromEvent(e.clientX, e.clientY);
    if (pos) onDrag(pos.x, pos.y);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const pos = posFromEvent(e.clientX, e.clientY);
    if (pos) onDrop(pos.x, pos.y);
  };

  return (
    <div className="px-5 pb-4">
      <p className="text-xs text-charcoal-400 mb-2 flex items-center gap-1.5">
        <Move className="w-3.5 h-3.5" /> Drag the button below to reposition it on this banner.
      </p>
      <div
        ref={boxRef}
        className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-cream-300 bg-cream-100 select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {isVideoUrl(banner.image) ? (
          <video
            src={banner.image}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            muted
            autoPlay
            loop
            playsInline
          />
        ) : (
          <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
        )}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            draggingRef.current = true;
          }}
          style={{
            left: `${banner.buttonX ?? 50}%`,
            top: `${banner.buttonY ?? 82}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute px-4 py-2 bg-cream-50 text-maroon-800 text-xs font-semibold rounded-full shadow-lg cursor-grab active:cursor-grabbing touch-none whitespace-nowrap"
        >
          {banner.cta || 'Shop Now'}
        </button>
      </div>
    </div>
  );
}

export function HeroBanners() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [banners, setBanners] = useState<AdminHeroBanner[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [positioningId, setPositioningId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    MiraDB.fetchHeroBanners(MiraDB.adminClient)
      .then((rows: AdminHeroBanner[]) => {
        setBanners(rows);
        setUnavailable(rows.length === 0);
      })
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const persistOrder = async (ordered: AdminHeroBanner[]) => {
    setBanners(ordered);
    await MiraDB.reorderHeroBanners(ordered.map((b) => b.id), MiraDB.adminClient);
  };

  const moveByOffset = (bannerId: string, offset: 1 | -1) => {
    const list = [...banners];
    const idx = list.findIndex((b) => b.id === bannerId);
    const targetIdx = idx + offset;
    if (idx === -1 || targetIdx < 0 || targetIdx >= list.length) return;
    [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
    persistOrder(list);
  };

  const handleDrop = (targetId: string) => {
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId) return;
    const list = [...banners];
    const fromIdx = list.findIndex((b) => b.id === sourceId);
    const toIdx = list.findIndex((b) => b.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    persistOrder(list);
  };

  const handleAdd = async (url: string) => {
    const id = `hero-${Date.now().toString(36)}`;
    const banner: AdminHeroBanner = {
      id,
      image: url,
      title: '',
      subtitle: '',
      cta: 'Shop Now',
      buttonX: 50,
      buttonY: 82,
      sortOrder: banners.length + 1,
      isVisible: true,
    };
    setSavingId(id);
    const ok = await MiraDB.dbUpsertHeroBanner(banner, MiraDB.adminClient);
    setSavingId(null);
    if (ok) {
      setBanners((cur) => [...cur, banner]);
      setUnavailable(false);
    } else {
      alert('Could not add this banner. Please try again.');
    }
  };

  // Splits local edits (every keystroke, cheap) from persisting to Supabase
  // (only on blur / toggle) -- upserting on every keystroke would fire a
  // network request per character typed.
  const editLocally = (bannerId: string, patch: Partial<AdminHeroBanner>) => {
    setBanners((cur) => cur.map((b) => (b.id === bannerId ? { ...b, ...patch } : b)));
  };

  const persistBanner = async (banner: AdminHeroBanner) => {
    setSavingId(banner.id);
    const ok = await MiraDB.dbUpsertHeroBanner(banner, MiraDB.adminClient);
    setSavingId(null);
    if (!ok) {
      alert('Could not save this change. Please try again.');
      load();
    }
  };

  const handleUpdate = (banner: AdminHeroBanner, patch: Partial<AdminHeroBanner>) => {
    const updated = { ...banner, ...patch };
    setBanners((cur) => cur.map((b) => (b.id === banner.id ? updated : b)));
    persistBanner(updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this banner from the hero carousel?')) return;
    setSavingId(id);
    const ok = await MiraDB.dbDeleteHeroBanner(id, MiraDB.adminClient);
    setSavingId(null);
    if (ok) {
      setBanners((cur) => cur.filter((b) => b.id !== id));
    } else {
      alert('Could not remove this banner. Please try again.');
    }
  };

  if (loading) return <LoadingState label="Loading hero banners…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      {unavailable && (
        <Card className="p-5 flex items-start gap-3 border-saffron-300 bg-saffron-50">
          <ImageOff className="w-5 h-5 text-saffron-700 shrink-0 mt-0.5" />
          <div className="text-sm text-charcoal-700">
            <p className="font-semibold mb-1">Hero banner management isn't set up in the database yet.</p>
            <p>
              Run <code className="px-1.5 py-0.5 bg-white rounded border border-cream-300 text-xs">supabase/add_hero_banners.sql</code> once
              in the Supabase SQL Editor to enable this page — it seeds your current 3 banners automatically so nothing changes on the
              website until you edit them here.
            </p>
          </div>
        </Card>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-maroon-900">Hero Banners</h3>
            <p className="text-sm text-charcoal-400">Drag to reorder — changes save live, no publish step needed.</p>
          </div>
        </div>

        {banners.length === 0 ? (
          <EmptyState label="No hero banners" hint="Add one below to get started." />
        ) : (
          <div className="divide-y divide-cream-100">
            {banners.map((banner, idx) => (
              <div key={banner.id}>
                <div
                  draggable
                  onDragStart={() => (dragId.current = banner.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(banner.id)}
                  className={`flex flex-col sm:flex-row gap-4 px-5 py-4 transition-opacity ${savingId === banner.id ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <GripVertical className="w-5 h-5 text-charcoal-300 cursor-grab active:cursor-grabbing shrink-0" />
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveByOffset(banner.id, -1)}
                        disabled={idx === 0}
                        className="w-6 h-5 flex items-center justify-center rounded text-charcoal-500 hover:bg-cream-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move up"
                        title="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveByOffset(banner.id, 1)}
                        disabled={idx === banners.length - 1}
                        className="w-6 h-5 flex items-center justify-center rounded text-charcoal-500 hover:bg-cream-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move down"
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isVideoUrl(banner.image) ? (
                      <video
                        src={banner.image}
                        className="w-28 h-16 object-cover rounded-lg bg-cream-100 border border-cream-300 shrink-0"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={banner.image}
                        alt=""
                        className="w-28 h-16 object-cover rounded-lg bg-cream-100 border border-cream-300 shrink-0"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 grid sm:grid-cols-3 gap-2">
                    <input
                      value={banner.title}
                      onChange={(e) => editLocally(banner.id, { title: e.target.value })}
                      onBlur={() => persistBanner(banner)}
                      placeholder="Title (leave blank if baked into image)"
                      className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white sm:col-span-1"
                    />
                    <input
                      value={banner.subtitle}
                      onChange={(e) => editLocally(banner.id, { subtitle: e.target.value })}
                      onBlur={() => persistBanner(banner)}
                      placeholder="Subtitle"
                      className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white sm:col-span-1"
                    />
                    <input
                      value={banner.cta}
                      onChange={(e) => editLocally(banner.id, { cta: e.target.value })}
                      onBlur={() => persistBanner(banner)}
                      placeholder="Button text"
                      className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white sm:col-span-1"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPositioningId((cur) => (cur === banner.id ? null : banner.id))}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                        positioningId === banner.id ? 'bg-maroon-700 text-cream-50' : 'text-charcoal-500 hover:bg-cream-200'
                      }`}
                      aria-label="Reposition button"
                      title="Drag to reposition the Shop Now button"
                    >
                      <Move className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdate(banner, { isVisible: !banner.isVisible })}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-charcoal-500 hover:bg-cream-200 transition-colors"
                      aria-label={banner.isVisible ? 'Hide banner' : 'Show banner'}
                      title={banner.isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
                    >
                      {banner.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-charcoal-300" />}
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={savingId === banner.id}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label="Delete banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {positioningId === banner.id && (
                  <ButtonPositionPicker
                    banner={banner}
                    onDrag={(x, y) => editLocally(banner.id, { buttonX: x, buttonY: y })}
                    onDrop={(x, y) => persistBanner({ ...banner, buttonX: x, buttonY: y })}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-5 border-t border-cream-200">
          <MediaUploader folder="hero" accept="image/*,video/*" label="Add Hero Banner Photo or Video" onUploaded={handleAdd} />
          <p className="text-xs text-charcoal-400 mt-2 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add as many photos or short videos as you want — the carousel adapts automatically.
          </p>
        </div>
      </Card>
    </div>
  );
}
