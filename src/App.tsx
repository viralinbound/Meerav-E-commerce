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
import { ProductPage } from '@/components/ProductPage';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderHistory } from '@/components/OrderHistory';
import { Testimonials, KitchenStories, InstagramFeed, FAQSection } from '@/components/Sections';
import { Footer } from '@/components/Footer';
import { ShopPage } from '@/components/ShopPage';
import { LegalPage, type LegalSection } from '@/components/LegalPage';
import type { Product } from '@/data/products';

function AppContent() {
  const { loading, error } = useCatalog();
  const { customer } = useAuth();
  const [page, setPage] = useState<'home' | 'shop' | 'product' | LegalSection>('home');
  const [returnPage, setReturnPage] = useState<'home' | 'shop'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | null>(null);

  // PayU's server-to-server callback redirects the browser back here with
  // ?payment=success/failed after the customer pays -- this is just the
  // banner shown for that; the order's real paid/failed status was already
  // set server-side in the payu-callback Edge Function, never trusted here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('payment');
    if (result === 'success' || result === 'failed') {
      setPaymentResult(result);
      params.delete('payment');
      params.delete('order');
      params.delete('reason');
      const rest = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
    }
  }, []);

  // Clicking any product card opens its own full page — never a popup —
  // so shoppers see the real packaging front, back-of-pack nutrition label,
  // and lifestyle photos at full size before deciding to buy.
  const openProduct = (product: Product, initialWeight?: string) => {
    setReturnPage(page === 'shop' ? 'shop' : 'home');
    setSelectedProduct(product);
    setSelectedWeight(initialWeight || null);
    setPage('product');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const backFromProduct = () => {
    setPage(returnPage);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

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
    } else if (section === 'browseProducts') {
      // Footer's "All Products" — scrolls to the Our Collection section on
      // this same page instead of navigating to the separate Shop page,
      // matching Shop Now / Explore Our Snacks elsewhere. Distinct from
      // 'products' above, which the header search relies on for real
      // filtered results.
      if (page !== 'home') setPage('home');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
        });
      });
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
    } else if (section === 'fanFavourites') {
      if (page !== 'home') setPage('home');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById('best-sellers-scroll')?.scrollIntoView({ behavior: 'smooth' });
        });
      });
    } else if (section === 'contact') {
      if (page !== 'home') { setPage('home'); }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        });
      });
    } else if (section === 'track') {
      if (customer) {
        setTrackerOpen(true);
      } else {
        setAuthOpen(true);
      }
    } else if (section === 'account') {
      setAuthOpen(true);
    } else if (section === 'terms' || section === 'privacy' || section === 'refund') {
      setPage(section);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage('shop');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  // "Shop Now" / "Explore Our Snacks" scroll to the Our Collection section
  // on this same page instead of navigating to the separate all-products
  // Shop page — no page redirect.
  const handleShopNow = () => {
    if (page !== 'home') {
      setPage('home');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
        });
      });
      return;
    }
    document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
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

  if (page === 'terms' || page === 'privacy' || page === 'refund') {
    return (
      <>
        <DynamicTheme />
        <LegalPage section={page} onNavigate={(s) => setPage(s)} onBack={goHome} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <DynamicTheme />
      <Header onNavigate={handleNavigate} onSearch={handleSearch} />

      <main>
        {page === 'product' && selectedProduct ? (
          <ProductPage product={selectedProduct} initialWeight={selectedWeight} onBack={backFromProduct} />
        ) : page === 'shop' ? (
          <ShopPage searchQuery={searchQuery} onProductClick={openProduct} onBackHome={goHome} />
        ) : (
          <>
            <div id="home">
              <Hero onShopNow={handleShopNow} />
            </div>

            <div id="story">
              <BrandStory />
            </div>

            <BestSellersScroll onProductClick={openProduct} />

            <BestSellers onProductClick={openProduct} />

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
      <CartDrawer onCheckout={handleCheckout} />
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderComplete={handleOrderComplete}
        customer={customer}
      />
      <OrderHistory isOpen={trackerOpen} onClose={() => setTrackerOpen(false)} customer={customer} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {paymentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={() => setPaymentResult(null)} />
          <div className="relative bg-cream-50 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-scale-in">
            {paymentResult === 'success' ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Payment Successful</h3>
                <p className="text-sm text-charcoal-500 mb-6">
                  Your payment was received and your order is confirmed. Check "Your Orders" for details.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✕</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Payment Failed</h3>
                <p className="text-sm text-charcoal-500 mb-6">
                  Your payment didn't go through and no amount was deducted for this attempt. Please try again or choose Cash on Delivery.
                </p>
              </>
            )}
            <button onClick={() => setPaymentResult(null)} className="btn-primary w-full justify-center">
              Continue
            </button>
          </div>
        </div>
      )}
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
