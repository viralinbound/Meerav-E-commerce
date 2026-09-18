import { useState, useEffect } from 'react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CatalogProvider, useCatalog } from '@/lib/useCatalog';
import { SettingsProvider } from '@/lib/useSettings';
import { DynamicTheme } from '@/components/DynamicTheme';
import { AuthModal } from '@/components/AuthModal';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { BrandStory } from '@/components/BrandStory';
import { HeritageSection } from '@/components/HeritageSection';
import { GiftShowcase } from '@/components/GiftShowcase';
import { BestSellers } from '@/components/BestSellers';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTracker } from '@/components/OrderTracker';
import { Testimonials, KitchenStories, InstagramFeed, FAQSection } from '@/components/Sections';
import { Footer } from '@/components/Footer';
import type { Product } from '@/data/products';

function AppContent() {
  const { loading, error } = useCatalog();
  const { customer } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleNavigate = (section: string) => {
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'products') {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'story') {
      const el = document.getElementById('story');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'faq') {
      const el = document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'track') {
      setTrackerOpen(true);
    } else if (section === 'account') {
      setAuthOpen(true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (catId: string | null) => {
    setSelectedCategory(catId);
    setSearchQuery('');
  };

  const handleShopNow = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShopGifts = () => {
    setSelectedCategory('gifts');
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckout = () => {
    if (!customer) {
      setAuthOpen(true);
      return;
    }
    setCheckoutOpen(true);
  };

  const handleOrderComplete = (_orderNumber: string) => {
    // Order completed - cart is cleared in the modal
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 text-charcoal-500">
        Loading fresh batches from the kitchen…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 text-charcoal-500">
        Couldn't load live data from Supabase: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <DynamicTheme />
      <Header
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
      />

      <main>
        <div id="home">
          <Hero onShopNow={handleShopNow} />
        </div>

        <div id="story">
          <BrandStory />
        </div>

        <BestSellers
          onProductClick={setSelectedProduct}
          onViewAll={() => {
            const el = document.getElementById('products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <ProductGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategoryChange={handleCategorySelect}
          onProductClick={setSelectedProduct}
        />

        <HeritageSection onShopNow={handleShopNow} />

        <GiftShowcase onShopGifts={handleShopGifts} />

        <Testimonials />

        <KitchenStories />

        <InstagramFeed />

        <FAQSection />
      </main>

      <Footer onNavigate={handleNavigate} onCategorySelect={handleCategorySelect} />

      {/* Overlays */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CartDrawer onCheckout={handleCheckout} />
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderComplete={handleOrderComplete}
        customer={customer}
      />
      <OrderTracker isOpen={trackerOpen} onClose={() => setTrackerOpen(false)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <CatalogProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </CatalogProvider>
    </SettingsProvider>
  );
}
