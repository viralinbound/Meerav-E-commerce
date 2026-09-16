import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle, Send } from "lucide-react";
import { useCatalog } from "../context/CatalogContext";
import { brand } from "../data/staticContent";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const { categories } = useCatalog();
  const shopCategories = categories.filter((c) => c.id !== "all");
  const waNumber = brand.phone.replace(/\D/g, "");

  return (
    <footer className="bg-charcoal-900 text-cream-100">
      <div className="container-max section-padding">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-9 border-b border-white/10">
          <div>
            <h4 className="font-serif text-lg font-bold text-cream-50 mb-1">Get Offers &amp; Fresh-Batch Alerts</h4>
            <p className="text-sm text-charcoal-300">Drop your email for exclusive discounts and new launch updates.</p>
          </div>
          <form
            className="flex gap-2 max-w-md w-full"
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
              e.target.reset();
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-cream-50 placeholder:text-charcoal-300 focus:outline-none focus:border-saffron-400 text-sm"
            />
            <button type="submit" className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-medium rounded-full flex items-center gap-1.5 text-sm transition-colors">
              <Send className="w-4 h-4" />
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/meerav_logo.png" alt={brand.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h4 className="font-serif text-xl font-bold text-cream-50">{brand.name}</h4>
                <p className="text-[10px] text-charcoal-400 tracking-widest uppercase">Bikaneri Namkeens</p>
              </div>
            </div>
            <p className="text-sm text-charcoal-300 mb-4">
              Authentic royal Bikaneri namkeens, sweets, and roasted diet savouries crafted daily in pure groundnut oil with zero palm oil.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full hover:bg-saffron-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full hover:bg-saffron-500 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/${waNumber}`} aria-label="WhatsApp" className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full hover:bg-saffron-500 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base font-bold text-cream-50 mb-4">Snack Collections</h4>
            <div className="flex flex-col gap-2.5 text-sm text-charcoal-300">
              {shopCategories.map((c) => (
                <Link key={c.id} to={`/category/${c.id}`} className="hover:text-saffron-400 transition-colors">
                  {c.name}
                </Link>
              ))}
              <Link to="/about" className="hover:text-saffron-400 transition-colors">About Us</Link>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base font-bold text-cream-50 mb-4">Policies</h4>
            <div className="flex flex-col gap-2.5 text-sm text-charcoal-300">
              <a href="#" className="hover:text-saffron-400 transition-colors">Cancellation / Refund</a>
              <a href="#" className="hover:text-saffron-400 transition-colors">Terms &amp; Conditions</a>
              <a href="#" className="hover:text-saffron-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-saffron-400 transition-colors">Shipping Policy</a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base font-bold text-cream-50 mb-4">Contact &amp; Support</h4>
            <div className="flex flex-col gap-2.5 text-sm text-charcoal-300">
              <a href={`https://wa.me/${waNumber}`} className="hover:text-saffron-400 transition-colors">WhatsApp Quick Order</a>
              <span>{brand.address}</span>
              <span>{brand.phone}</span>
              <span>{brand.email}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pb-6">
          {["100% VEG", "ZERO PALM OIL", "FSSAI CERTIFIED"].map((cert) => (
            <span key={cert} className="px-3 py-1 border border-saffron-400/40 text-saffron-300 text-[11px] font-bold tracking-wide rounded-full">
              {cert}
            </span>
          ))}
        </div>

        <div className="text-center text-xs text-charcoal-400 pb-6">
          © {new Date().getFullYear()} {brand.name} Namkeens &amp; Sweets. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
