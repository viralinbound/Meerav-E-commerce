import { createContext, useContext, useEffect, useState } from "react";
import { MiraDB } from "../lib/supabase.js";
import { resolveImagePath } from "../lib/resolveImage.js";
import { withRealPhoto } from "../data/realPhotos.js";

const CatalogContext = createContext(null);

function bySort(a, b) {
  return (a.sortOrder || 0) - (b.sortOrder || 0);
}

function normalizeCategory(c) {
  return { ...c, image: resolveImagePath(c.image) };
}

function normalizeProduct(p) {
  const withImage = {
    ...p,
    image: resolveImagePath(p.image),
    photos: (p.photos || []).map(resolveImagePath),
  };
  return withRealPhoto(withImage);
}

function normalizeTestimonial(t) {
  return { ...t, avatar: resolveImagePath(t.avatar) };
}

function normalizeTrustBadge(b) {
  return { ...b, image: resolveImagePath(b.image) };
}

function normalizeBroadcastStory(s) {
  return { ...s, posterUrl: resolveImagePath(s.posterUrl) };
}

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [trustBadges, setTrustBadges] = useState([]);
  const [broadcastStories, setBroadcastStories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      MiraDB.fetchCategories(),
      MiraDB.fetchProducts(),
      MiraDB.fetchTestimonials(),
      MiraDB.fetchFaqs(),
      MiraDB.fetchTrustBadges(),
      MiraDB.fetchBroadcastStories(),
      MiraDB.fetchCoupons(),
    ])
      .then(([cats, prods, testi, faqRows, badges, stories, coup]) => {
        if (cancelled) return;
        setCategories(cats.map(normalizeCategory));
        setProducts(prods.map(normalizeProduct));
        setTestimonials(testi.filter((t) => t.isVisible).sort(bySort).map(normalizeTestimonial));
        setFaqs(faqRows.filter((f) => f.isVisible).sort(bySort));
        setTrustBadges(badges.filter((b) => b.isVisible).sort(bySort).map(normalizeTrustBadge));
        setBroadcastStories(stories.filter((s) => s.isVisible).sort(bySort).map(normalizeBroadcastStory));
        setCoupons(coup.filter((c) => c.isActive));
      })
      .catch((e) => !cancelled && setError(e.message || String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function getProduct(id) {
    return products.find((p) => p.id === id);
  }

  function getCategory(id) {
    return categories.find((c) => c.id === id);
  }

  function productsByCategory(catId) {
    if (!catId || catId === "all") return products;
    return products.filter((p) => p.category === catId);
  }

  function relatedProducts(product, limit = 4) {
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit);
  }

  function bestSellers(limit = 8) {
    return [...products].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, limit);
  }

  function discountPercent(variant) {
    if (!variant?.originalPrice || variant.originalPrice <= variant.price) return 0;
    return Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
  }

  return (
    <CatalogContext.Provider
      value={{
        categories,
        products,
        testimonials,
        faqs,
        trustBadges,
        broadcastStories,
        coupons,
        loading,
        error,
        getProduct,
        getCategory,
        productsByCategory,
        relatedProducts,
        bestSellers,
        discountPercent,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
