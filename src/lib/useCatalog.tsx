import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MiraDB } from './supabase.js';
import { resolveImagePath } from './resolveImage.js';
import type { Product, Category } from '@/data/products';

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
  categories: Category[];
  products: Product[];
  testimonials: Testimonial[];
  faqs: Faq[];
  kitchenStories: KitchenStory[];
  loading: boolean;
  error: string | null;
}

const CatalogContext = createContext<CatalogValue | null>(null);

function toProduct(row: any): Product {
  const variant = (row.variants && row.variants[0]) || {};
  const tag = (row.tag || '').toLowerCase();
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(variant.price) || 0,
    weight: variant.weight || '',
    image: resolveImagePath(row.image),
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

function toCategory(row: any): Category {
  return { id: row.id, name: row.name, description: row.description || '', icon: row.icon || 'Cookie' };
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [kitchenStories, setKitchenStories] = useState<KitchenStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      MiraDB.fetchCategories(),
      MiraDB.fetchProducts(),
      MiraDB.fetchTestimonials(),
      MiraDB.fetchFaqs(),
      MiraDB.fetchBroadcastStories(),
    ])
      .then(([cats, prods, testi, faqRows, stories]) => {
        if (cancelled) return;
        setCategories(cats.filter((c: any) => c.id !== 'all').map(toCategory));
        setProducts(prods.map(toProduct));
        setTestimonials(
          testi
            .filter((t: any) => t.isVisible)
            .map((t: any) => ({
              id: t.id,
              name: t.name,
              city: t.city,
              rating: t.rating,
              text: t.reviewText,
              avatar: resolveImagePath(t.avatar),
            }))
        );
        setFaqs(faqRows.filter((f: any) => f.isVisible).map((f: any) => ({ id: f.id, question: f.question, answer: f.answer })));
        setKitchenStories(
          stories
            .filter((s: any) => s.isVisible)
            .map((s: any) => ({
              id: s.id,
              title: s.title,
              description: `₹${s.price} (was ₹${s.originalPrice})`,
              image: resolveImagePath(s.posterUrl),
              duration: s.tag,
            }))
        );
      })
      .catch((e) => !cancelled && setError(e.message || String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CatalogContext.Provider value={{ categories, products, testimonials, faqs, kitchenStories, loading, error }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
