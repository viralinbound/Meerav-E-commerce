import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MiraDB } from './supabase.js';
import { resolveImagePath } from './resolveImage.js';
import type { Product } from '@/data/products';
import { heroBanners as staticHeroBanners } from '@/data/products';

export interface HeroBanner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  buttonX?: number;
  buttonY?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  avatar: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface KitchenStory {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
}

interface CatalogValue {
  products: Product[];
  heroBanners: HeroBanner[];
  testimonials: Testimonial[];
  faqs: Faq[];
  kitchenStories: KitchenStory[];
  loading: boolean;
  error: string | null;
}

const CatalogContext = createContext<CatalogValue | null>(null);

function toProduct(row: any): Product {
  const variants = (row.variants && row.variants.length ? row.variants : [{}]).map((v: any) => ({
    weight: v.weight || '',
    price: Number(v.price) || 0,
    originalPrice: v.originalPrice != null ? Number(v.originalPrice) : undefined,
  }));
  const variant = variants[0];
  const tag = (row.tag || '').toLowerCase();
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: variant.price,
    weight: variant.weight,
    variants,
    image: resolveImagePath(row.image),
    photos: (row.photos && row.photos.length ? row.photos : [row.image].filter(Boolean)).map(resolveImagePath),
    videos: (row.videos || []).map(resolveImagePath),
    description: row.description || '',
    ingredients: row.ingredients || '',
    nutrition: row.nutrition || { protein: '-', carbs: '-', fat: '-', calories: '-' },
    spiceLevel: (row.spiceLevel || 'mild') as Product['spiceLevel'],
    isBestseller: tag.includes('best'),
    isNew: tag.includes('new'),
    rating: Number(row.rating) || 0,
    reviews: Number(row.reviewsCount) || 0,
  };
}

const CACHE_KEY = 'meerav_catalog_cache_v1';

function readCache(): Pick<CatalogValue, 'products' | 'heroBanners' | 'testimonials' | 'faqs' | 'kitchenStories'> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(data: Pick<CatalogValue, 'products' | 'heroBanners' | 'testimonials' | 'faqs' | 'kitchenStories'>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — the live fetch still renders fine without it.
  }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  // Hydrate instantly from whatever was cached on the last successful load —
  // so a refresh shows real content immediately instead of the loading
  // screen, while a fresh fetch still runs underneath to catch any updates.
  const cached = readCache();
  const [products, setProducts] = useState<Product[]>(cached?.products || []);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(cached?.heroBanners || staticHeroBanners);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(cached?.testimonials || []);
  const [faqs, setFaqs] = useState<Faq[]>(cached?.faqs || []);
  const [kitchenStories, setKitchenStories] = useState<KitchenStory[]>(cached?.kitchenStories || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      MiraDB.fetchProducts(),
      MiraDB.fetchHeroBanners(),
      MiraDB.fetchTestimonials(),
      MiraDB.fetchFaqs(),
      MiraDB.fetchBroadcastStories(),
    ])
      .then(([prods, banners, testi, faqRows, stories]) => {
        if (cancelled) return;
        const freshProducts = prods.map(toProduct);
        // Falls back to the hardcoded banners (see useState above) if the
        // hero_banners table doesn't exist yet or is empty, so the hero
        // carousel never goes blank.
        const freshHeroBanners =
          banners && banners.length
            ? banners
                .filter((b: any) => b.isVisible)
                .map((b: any) => ({
                  id: b.id,
                  image: resolveImagePath(b.image),
                  title: b.title,
                  subtitle: b.subtitle,
                  cta: b.cta,
                  buttonX: b.buttonX,
                  buttonY: b.buttonY,
                }))
            : heroBanners;
        const freshTestimonials = testi
          .filter((t: any) => t.isVisible)
          .map((t: any) => ({
            id: t.id,
            name: t.name,
            city: t.city,
            rating: t.rating,
            text: t.reviewText,
            avatar: resolveImagePath(t.avatar),
          }));
        const freshFaqs = faqRows
          .filter((f: any) => f.isVisible)
          .map((f: any) => ({ id: f.id, question: f.question, answer: f.answer }));
        const freshKitchenStories = stories
          .filter((s: any) => s.isVisible)
          .map((s: any) => ({
            id: s.id,
            title: s.title,
            description: `₹${s.price} (was ₹${s.originalPrice})`,
            image: resolveImagePath(s.posterUrl),
            duration: s.tag,
          }));

        setProducts(freshProducts);
        setHeroBanners(freshHeroBanners);
        setTestimonials(freshTestimonials);
        setFaqs(freshFaqs);
        setKitchenStories(freshKitchenStories);
        setError(null);
        writeCache({
          products: freshProducts,
          heroBanners: freshHeroBanners,
          testimonials: freshTestimonials,
          faqs: freshFaqs,
          kitchenStories: freshKitchenStories,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        // If we already have cached content on screen, a failed background
        // refresh shouldn't rip it out from under the visitor — just log it.
        if (cached) {
          console.warn('Catalog refresh failed, keeping cached content:', e);
        } else {
          setError(e.message || String(e));
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CatalogContext.Provider value={{ products, heroBanners, testimonials, faqs, kitchenStories, loading, error }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
