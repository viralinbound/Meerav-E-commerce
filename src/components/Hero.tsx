import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { heroBanners } from '@/data/products';

interface HeroProps {
  onShopNow: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % heroBanners.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + heroBanners.length) % heroBanners.length), []);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section id="home-hero" className="relative h-screen min-h-[600px] overflow-hidden">
      {heroBanners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero-pattern" />
          {/* Extra darkening only behind the text column, so the rest of the
              photo stays bright and clearly visible while copy stays legible. */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/5 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-max section-padding w-full">
              <div className="max-w-2xl">
                <span className="inline-block px-4 py-1.5 bg-saffron-500/90 text-white text-sm font-medium rounded-full mb-6 animate-slide-up text-shadow-lg">
                  Authentic Bikaneri Taste Since 1984
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream-50 leading-tight mb-6 text-shadow-lg animate-slide-up">
                  {banner.title}
                </h2>
                <p className="text-lg text-cream-100 mb-8 max-w-xl leading-relaxed animate-slide-up text-shadow-lg">
                  {banner.subtitle}
                </p>
                <button
                  onClick={onShopNow}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-saffron-500 text-white font-semibold rounded-full hover:bg-saffron-600 transition-all duration-300 hover:shadow-2xl active:scale-95 animate-slide-up"
                >
                  {banner.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-charcoal-900/40 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-charcoal-900/60 transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-charcoal-900/40 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-charcoal-900/60 transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current ? 'w-8 bg-saffron-400' : 'w-2 bg-cream-50/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
