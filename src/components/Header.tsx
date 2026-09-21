import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Phone, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/lib/useSettings';

interface HeaderProps {
  onNavigate: (section: string) => void;
  onSearch: (query: string) => void;
}

export function Header({ onNavigate, onSearch }: HeaderProps) {
  const { itemCount, openDrawer } = useCart();
  const { customer } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const announcements = settings?.announcementText
    ? [settings.announcementText]
    : [
        'Min Order Value Rs 500 | Free delivery across India',
        'For Online Order Enquiry: 1800 102 9046 (Mon-Sat 11 AM to 5 PM)',
        'Use code MEERAV10 for 10% off your first order',
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onNavigate('products');
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-maroon-800 text-cream-50 text-sm overflow-hidden">
        <div className="container-max section-padding py-2 flex items-center justify-center relative">
          <span key={announcementIndex} className="animate-fade-in text-center">
            {announcements[announcementIndex]}
          </span>
          <a
            href="/admin.html"
            className="hidden sm:inline absolute right-4 text-cream-200 hover:text-saffron-300 transition-colors text-xs whitespace-nowrap"
          >
            Admin Login
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 bg-cream-50 transition-all duration-300 ${
          scrolled ? 'shadow-lg' : 'shadow-sm'
        }`}
      >
        <div className="container-max section-padding">
          <div className="flex items-center flex-nowrap py-2.5 gap-3 lg:gap-6">
            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 shrink-0">
              <img src="/images/meerav_logo.png" alt="Meerav" className="h-14 lg:h-16 w-auto object-contain shrink-0 drop-shadow-md" />
              <div className="text-left hidden lg:block">
                <h1 className="font-serif text-lg font-bold text-maroon-800 leading-none whitespace-nowrap">{settings?.siteName || 'Meerav'}</h1>
                <p className="text-[9px] text-charcoal-500 tracking-widest uppercase whitespace-nowrap">{settings?.tagline || 'Bikaneri Namkeens'}</p>
              </div>
            </button>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 min-w-0 max-w-md xl:max-w-lg mx-auto">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for namkeens, sweets & more..."
                  className="w-full pl-4 pr-10 py-2 border-2 border-cream-300 rounded-full focus:border-saffron-400 focus:outline-none transition-colors text-sm"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-saffron-500 rounded-full flex items-center justify-center text-white hover:bg-saffron-600 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 lg:gap-3 shrink-0 ml-auto lg:ml-0">
              <button
                onClick={() => onNavigate('account')}
                className="hidden lg:flex items-center gap-1 text-xs text-charcoal-600 hover:text-maroon-700 transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                {customer ? customer.name.split(' ')[0] : 'Sign In'}
              </button>
              <button
                onClick={openDrawer}
                className="relative flex items-center gap-1 px-2.5 py-1.5 bg-maroon-700 text-cream-50 rounded-full hover:bg-maroon-800 transition-colors shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium whitespace-nowrap">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-saffron-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-charcoal-700 shrink-0"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-cream-50 border-t border-cream-200 animate-slide-up">
            <div className="container-max section-padding py-4 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-4 pr-12 py-2.5 border-2 border-cream-300 rounded-full focus:border-saffron-400 focus:outline-none text-sm"
                  />
                  <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-saffron-500 rounded-full flex items-center justify-center text-white">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <button
                onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-100 rounded-md"
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate('products'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-100 rounded-md"
              >
                All Products
              </button>
              <button
                onClick={() => { onNavigate('story'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-100 rounded-md"
              >
                Our Story
              </button>
              <button
                onClick={() => { onNavigate('faq'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-100 rounded-md"
              >
                FAQ
              </button>
              <div className="flex gap-2 pt-2 border-t border-cream-200 mt-2">
                <button
                  onClick={() => { onNavigate('track'); setMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-charcoal-600 border border-cream-300 rounded-md"
                >
                  <MapPin className="w-4 h-4" /> Track Order
                </button>
                <button
                  onClick={() => { onNavigate('account'); setMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-charcoal-600 border border-cream-300 rounded-md"
                >
                  <Phone className="w-4 h-4" /> {customer ? customer.name.split(' ')[0] : 'Sign In'}
                </button>
              </div>
              <a
                href="/admin.html"
                className="block text-center mt-2 pt-2 text-xs text-charcoal-400 hover:text-maroon-700"
              >
                Admin Login
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
