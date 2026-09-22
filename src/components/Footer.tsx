import { useState } from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Truck, Leaf, Facebook, Instagram, Youtube, Linkedin, Send } from 'lucide-react';
import { useSettings } from '@/lib/useSettings';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-charcoal-900 text-cream-100">
      {/* Newsletter Section */}
      <div className="border-b border-charcoal-700">
        <div className="container-max section-padding py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-serif text-2xl font-bold text-cream-50 mb-2">
                Drop your email for offers & fresh-batch alerts
              </h3>
              <p className="text-cream-300 text-sm">
                Get 10% off your first order, plus early access to new launches and seasonal specials.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full pl-11 pr-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-cream-50 placeholder-charcoal-500 focus:outline-none focus:border-saffron-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-3 bg-saffron-500 text-white font-semibold rounded-lg hover:bg-saffron-600 transition-colors active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>
            {subscribed && (
              <p className="text-green-400 text-sm mt-2 animate-fade-in">
                Thank you! Check your inbox for a 10% off coupon.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-max section-padding py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/meerav_logo.png" alt="Meerav" className="h-12 w-auto object-contain" />
              <div>
                <h4 className="font-serif text-xl font-bold text-cream-50">Meerav</h4>
                <p className="text-[10px] text-cream-400 tracking-widest uppercase">Bikaneri Namkeens</p>
              </div>
            </div>
            <p className="text-sm text-cream-300 leading-relaxed mb-4">
              Authentic royal Bikaneri namkeens, sweets, and roasted diet savories crafted daily in
              pure groundnut oil with zero palm oil.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Instagram, href: 'https://www.instagram.com/meeravnamkeen' },
                { Icon: Youtube, href: '#' },
                { Icon: Linkedin, href: 'https://www.linkedin.com/company/meerav/' },
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-charcoal-800 rounded-full flex items-center justify-center hover:bg-saffron-500 transition-colors"
                >
                  <Icon className="w-4 h-4 text-cream-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-cream-50 mb-4 text-sm uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('browseProducts')}
                  className="text-sm text-cream-300 hover:text-saffron-400 transition-colors"
                >
                  All Products
                </button>
              </li>
            </ul>
          </div>

          {/* Purity Guarantees */}
          <div>
            <h4 className="font-semibold text-cream-50 mb-4 text-sm uppercase tracking-wide">Purity Guarantees</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-cream-300">
                <Leaf className="w-4 h-4 text-green-400 shrink-0" /> Pure Groundnut Oil
              </li>
              <li className="flex items-center gap-2 text-sm text-cream-300">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" /> No Preservatives
              </li>
              <li className="flex items-center gap-2 text-sm text-cream-300">
                <Truck className="w-4 h-4 text-green-400 shrink-0" /> Same-Day Packing
              </li>
              <li className="flex items-center gap-2 text-sm text-cream-300">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" /> FSSAI Certified
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-semibold text-cream-50 mb-4 text-sm uppercase tracking-wide">Contact & Support</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-cream-300">
                <Phone className="w-4 h-4 text-saffron-400 shrink-0 mt-0.5" />
                <div>
                  <p>{settings?.contactPhone || '1800 102 9046'}</p>
                  <p className="text-xs text-cream-400">Mon-Sat 11 AM to 5 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm text-cream-300">
                <Mail className="w-4 h-4 text-saffron-400 shrink-0 mt-0.5" />
                <span>{settings?.contactEmail || 'care@meerav.com'}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-cream-300">
                <MapPin className="w-4 h-4 text-saffron-400 shrink-0 mt-0.5" />
                <span>{settings?.contactAddress || 'Bikaner, Rajasthan 334001'}</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-charcoal-700 py-6">
        <div className="container-max section-padding text-center">
          <p className="text-sm text-cream-400">
            &copy; {new Date().getFullYear()} Meerav Namkeens. All rights reserved. Authentic royal
            Bikaneri namkeens, crafted with love in Bikaner, Rajasthan.
          </p>
        </div>
      </div>
    </footer>
  );
}
