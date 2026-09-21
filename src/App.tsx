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
import { BestSellersScroll } from '@/components/BestSellersScroll';
import { BestSellers } from '@/components/BestSellers';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTracker } from '@/components/OrderTracker';
import { Testimonials, KitchenStories, InstagramFeed, FAQSection } from '@/components/Sections';
import { Footer } from '@/components/Footer';
import { ShopPage } from '@/components/ShopPage';
import type { Product } from '@/data/products';

function AppContent() {
  const { loading, error } = useCatalog();
  const { customer } = useAuth();
  const [page, setPage] = useState<'home' | 'shop'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const goToShop = () => {
    setSearchQuery('');
    setPage('shop');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const goHome = () => {
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleNavigate = (section: string) => {
    if (section === 'home') {
      goHome();
    } else if (section === 'products') {
      // Callers that just called onSearch rely on that state surviving this
      // call — never touch searchQuery here, or a stale closure would
      // clobber the fresh pick.
      setPage('shop');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else if (section === 'story') {
      if (page !== 'home') { setPage('home'); }
      requestAnimationFrame(() => {
        const el = document.getElementById('story');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    } else if (section === 'faq') {
      if (page !== 'home') { setPage('home'); }
      requestAnimationFrame(() => {
        const el = document.getElementById('faq');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    } else if (section === 'track') {
      setTrackerOpen(true);
    } else if (section === 'account') {
      setAuthOpen(true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage('shop');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleShopNow = () => goToShop();

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
      <Header onNavigate={handleNavigate} onSearch={handleSearch} />

      <main>
        {page === 'shop' ? (
          <ShopPage searchQuery={searchQuery} onProductClick={setSelectedProduct} onBackHome={goHome} />
        ) : (
          <>
            <div id="home">
              <Hero onShopNow={handleShopNow} />
            </div>

            <div id="story">
              <BrandStory />
            </div>

            <BestSellersScroll onProductClick={setSelectedProduct} />

            <BestSellers onProductClick={setSelectedProduct} />

            <HeritageSection onShopNow={handleShopNow} />

            <GiftShowcase onShopGifts={handleShopNow} />

            <Testimonials />

            <KitchenStories />

            <InstagramFeed />

            <FAQSection />
          </>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

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
