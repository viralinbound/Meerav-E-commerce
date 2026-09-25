import { useState, type FormEvent } from 'react';
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { useAdminAuth } from '../useAdminAuth';
import { logChange } from '../activityLog';
import { MediaUploader } from '../MediaUploader';

export interface AdminProduct {
  id: string;
  name: string;
  tag: string;
  rating: number;
  reviewsCount: number;
  spiceLevel: string;
  dietary: string[];
  image: string;
  photos: string[];
  videos: string[];
  description: string;
  ingredients: string;
  nutrition: { energy?: string; protein?: string; carbs?: string; fat?: string };
  inStock: boolean;
  variants: { weight: string; price: number; originalPrice?: number; stock?: number }[];
}

export function blankProduct(): AdminProduct {
  return {
    id: '',
    name: '',
    tag: '',
    rating: 5,
    reviewsCount: 0,
    spiceLevel: '',
    dietary: [],
    image: '',
    photos: [],
    videos: [],
    description: '',
    ingredients: '',
    nutrition: { energy: '', protein: '', carbs: '', fat: '' },
    inStock: true,
    variants: [{ weight: '200 g', price: 0, originalPrice: undefined }],
  };
}

interface ProductFormModalProps {
  product: AdminProduct;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const { admin: me } = useAdminAuth();
  const [form, setForm] = useState<AdminProduct>(product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !product.id;

  const update = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateVariant = (idx: number, field: 'weight' | 'price' | 'originalPrice' | 'stock', value: string) => {
    setForm((f) => {
      const variants = [...f.variants];
      if (field === 'stock') {
        // Blank means "unlimited" -- only a real number turns on stock
        // tracking for this variant, so leaving it empty never blocks sales.
        const { stock, ...rest } = variants[idx];
        variants[idx] = value.trim() === '' ? rest : { ...rest, stock: Math.max(0, Number(value) || 0) };
      } else {
        variants[idx] = {
          ...variants[idx],
          [field]: field === 'weight' ? value : Number(value) || 0,
        };
      }
      return { ...f, variants };
    });
  };

  const movePhoto = (idx: number, direction: -1 | 1) => {
    setForm((f) => {
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= f.photos.length) return f;
      const photos = [...f.photos];
      [photos[idx], photos[swapIdx]] = [photos[swapIdx], photos[idx]];
      return { ...f, photos };
    });
  };

  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { weight: '', price: 0 }] }));
  const removeVariant = (idx: number) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError('Product name is required.');
    if (form.variants.length === 0 || form.variants.some((v) => !v.weight || v.price <= 0)) {
      return setError('Every variant needs a weight and a price greater than 0.');
    }

    if (form.photos.length === 0) return setError('Upload at least one product photo.');

    setSaving(true);
    const id = isNew ? String(await MiraDB.getNextProductSerial(MiraDB.adminClient)) : form.id;
    const payload = {
      ...form,
      id,
      dietary: form.dietary.filter(Boolean),
      image: form.photos[0],
    };

    const { data: beforeRow } = await MiraDB.adminClient.from('products').select('*').eq('id', id).maybeSingle();
    const ok = await MiraDB.dbUpsertProduct(payload, MiraDB.adminClient);
    setSaving(false);
    if (!ok) {
      setError('Could not save the product. Check your connection and try again.');
      return;
    }
    const { data: afterRow } = await MiraDB.adminClient.from('products').select('*').eq('id', id).maybeSingle();
    await logChange(me, isNew ? 'product.create' : 'product.update', form.name, 'products', id, beforeRow || null, afterRow);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="font-serif text-lg font-bold">{isNew ? 'Add Product' : `Edit: ${product.name}`}</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Product Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Badge Tag</label>
            <input
              value={form.tag}
              onChange={(e) => update('tag', e.target.value)}
              placeholder="e.g. Best Seller"
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Product Photos * <span className="font-normal text-charcoal-400">(add as many as you like — first one is the cover; use the arrows to reorder)</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
              {form.photos.map((url, idx) => (
                <div key={url + idx} className="relative aspect-square rounded-lg overflow-hidden bg-cream-100 border border-cream-300 group">
                  <img src={url.startsWith('http') || url.startsWith('/') ? url : `/${url}`} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-maroon-700 text-cream-50 text-[9px] font-bold rounded">COVER</span>
                  )}
                  <button
                    type="button"
                    onClick={() => update('photos', form.photos.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => movePhoto(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Move photo left"
                      className="w-6 h-6 flex items-center justify-center rounded bg-white/90 text-charcoal-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(idx, 1)}
                      disabled={idx === form.photos.length - 1}
                      aria-label="Move photo right"
                      className="w-6 h-6 flex items-center justify-center rounded bg-white/90 text-charcoal-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <MediaUploader
              folder={`products/${form.id || 'new'}`}
              accept="image/*"
              label="Upload Photo"
              onUploaded={(url) => update('photos', [...form.photos, url])}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Product Videos <span className="font-normal text-charcoal-400">(optional)</span>
            </label>
            {form.videos.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
                {form.videos.map((url, idx) => (
                  <div key={url + idx} className="relative aspect-square rounded-lg overflow-hidden bg-charcoal-800 border border-cream-300 group flex items-center justify-center">
                    <Play className="w-6 h-6 text-cream-50" />
                    <button
                      type="button"
                      onClick={() => update('videos', form.videos.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <MediaUploader
              folder={`products/${form.id || 'new'}`}
              accept="video/*"
              label="Upload Video"
              onUploaded={(url) => update('videos', [...form.videos, url])}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Ingredients</label>
            <input
              value={form.ingredients}
              onChange={(e) => update('ingredients', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-charcoal-700">Pack Size Variants *</label>
              <button type="button" onClick={addVariant} className="text-xs font-medium text-maroon-700 hover:underline">
                + Add Variant
              </button>
            </div>
            <p className="text-xs text-charcoal-400 mb-3">Leave Stock blank for unlimited — a variant only stops selling once you set a number and it reaches 0.</p>
            <div className="space-y-3">
              {form.variants.map((v, idx) => {
                const soldOut = v.stock != null && v.stock <= 0;
                return (
                <div key={idx} className={`relative border rounded-xl p-3 ${soldOut ? 'border-red-200 bg-red-50' : 'border-cream-300 bg-cream-50'}`}>
                  {soldOut && (
                    <span className="absolute -top-2 left-3 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full">
                      OUT OF STOCK
                    </span>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-500 mb-1">Weight</label>
                      <input
                        placeholder="200 g"
                        value={v.weight}
                        onChange={(e) => updateVariant(idx, 'weight', e.target.value)}
                        className="w-full px-3 py-2.5 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal-500 mb-1">Price</label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price || ''}
                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                        className="w-full px-3 py-2.5 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal-500 mb-1">MRP (optional)</label>
                      <input
                        type="number"
                        placeholder="MRP"
                        value={v.originalPrice || ''}
                        onChange={(e) => updateVariant(idx, 'originalPrice', e.target.value)}
                        className="w-full px-3 py-2.5 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal-500 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Blank = ∞"
                        value={v.stock ?? ''}
                        onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white ${soldOut ? 'border-red-300 text-red-700 font-semibold' : 'border-cream-300'}`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    disabled={form.variants.length <= 1}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2.5 min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => update('inStock', e.target.checked)}
              className="w-5 h-5 accent-maroon-700"
            />
            <span className="text-sm font-medium text-charcoal-700">In Stock</span>
          </label>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium text-charcoal-600 hover:bg-cream-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold bg-maroon-700 text-cream-50 hover:bg-maroon-800 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
