import { useState } from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Truck, Leaf, Instagram, Linkedin, Send } from 'lucide-react';
import { useSettings } from '@/lib/useSettings';
import { MiraDB } from '@/lib/supabase.js';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribing) return;
    setSubscribing(true);
    setSubscribeError('');
    const result = await MiraDB.subscribeToNewsletter(email);
    setSubscribing(false);
    if (result?.error) {
      setSubscribeError(result.error);
      return;
    }
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
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
                Be the first to hear about fresh-batch alerts, new launches, and seasonal specials.
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
                disabled={subscribing}
                className="flex items-center gap-2 px-5 py-3 bg-saffron-500 text-white font-semibold rounded-lg hover:bg-saffron-600 transition-colors active:scale-95 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{subscribing ? 'Subscribing…' : 'Subscribe'}</span>
              </button>
            </form>
            {subscribed && (
              <p className="text-green-400 text-sm mt-2 animate-fade-in">
                Thank you for subscribing! Check your inbox — you're on the list for fresh-batch alerts and offers.
              </p>
            )}
            {subscribeError && (
              <p className="text-red-400 text-sm mt-2 animate-fade-in">{subscribeError}</p>
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
              Authentic royal Bikaneri namkeens, sweets, and roasted diet savories crafted daily
              with quality edible vegetable oils.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/meeravnamkeen' },
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
                <Leaf className="w-4 h-4 text-green-400 shrink-0" /> Quality Ingredients
              </li>
              <li className="flex items-center gap-2 text-sm text-cream-300">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" /> No Added Flavours, Colours or Preservatives
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
          <div id="contact">
            <h4 className="font-semibold text-cream-50 mb-4 text-sm uppercase tracking-wide">Contact & Support</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-cream-300">
                <Phone className="w-4 h-4 text-saffron-400 shrink-0 mt-0.5" />
                <div>
                  <p>{settings?.contactPhone || '+91 98861 87879'}</p>
                  <p className="text-xs text-cream-400">Mon-Sat 11 AM to 5 PM</p>
                </div>
              </li>
              {settings?.contactEmail && (
                <li className="flex items-start gap-2 text-sm text-cream-300">
                  <Mail className="w-4 h-4 text-saffron-400 shrink-0 mt-0.5" />
                  <span>{settings.contactEmail}</span>
                </li>
              )}
              <li className="flex items-start gap-2 text-sm text-cream-300">
                <MapPin className="w-4 h-4 text-saffron-400 shrink-0 mt-0.5" />
                <span>{settings?.contactAddress || 'Sudhama Nagar, Bangalore, Karnataka - 560027 (INDIA)'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-10 pt-6 border-t border-charcoal-700">
          <button onClick={() => onNavigate('terms')} className="text-xs text-cream-400 hover:text-saffron-400 transition-colors">
            Terms & Conditions
          </button>
          <button onClick={() => onNavigate('privacy')} className="text-xs text-cream-400 hover:text-saffron-400 transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => onNavigate('refund')} className="text-xs text-cream-400 hover:text-saffron-400 transition-colors">
            Refund & Cancellation
          </button>
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
