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
    <>
    <section
      id="home-hero"
      className="relative overflow-hidden bg-royal-gradient aspect-[16/9] max-h-[85vh]"
    >
      {heroBanners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Blurred cover copy fills every device's full-screen box with no
              empty bars; the crisp copy on top uses object-contain so the
              banner artwork itself is never cropped, at any screen size. */}
          <img
            src={banner.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
          />
          <img
            src={banner.image}
            alt={banner.title || 'Meerav'}
            className="relative w-full h-full object-contain"
          />
          {/* Banners whose artwork already has the title/subtitle baked in
              (banner.title === '') skip the pattern tint, darkening gradient,
              and text overlay entirely — only the CTA button sits on top. */}
          {banner.title && (
            <>
              <div className="absolute inset-0 bg-hero-pattern" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/5 to-transparent" />
            </>
          )}
          {/* Text + CTA overlay — desktop/tablet only. On mobile the artwork
              already carries the copy, and the CTA is a separate overlapping
              button below the image (matching the "Explore Our Snacks"
              placement) so it never floats in dead blurred space. */}
          <div className="absolute inset-0 hidden sm:flex sm:items-center">
            <div className="container-max section-padding w-full">
              <div className="max-w-2xl">
                {banner.title && (
                  <>
                    <span className="inline-block px-4 py-1.5 bg-saffron-500/90 text-white text-sm font-medium rounded-full mb-6 animate-slide-up text-shadow-lg">
                      Authentic Bikaneri Taste Since 1984
                    </span>
                    <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream-50 leading-tight mb-6 text-shadow-lg animate-slide-up">
                      {banner.title}
                    </h2>
                    <p className="text-lg text-cream-100 mb-8 max-w-xl leading-relaxed animate-slide-up text-shadow-lg">
                      {banner.subtitle}
                    </p>
                  </>
                )}
                <button
                  onClick={onShopNow}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-cream-50 text-maroon-800 font-semibold rounded-full hover:bg-saffron-400 hover:text-white transition-all duration-300 hover:shadow-2xl active:scale-95 shadow-xl animate-slide-up"
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
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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

    {/* Mobile-only CTA, placed and styled exactly like "Explore Our Snacks" —
        an overlapping pill centered on the banner's bottom edge, never in
        empty blurred space. */}
    <div className="relative sm:hidden flex justify-center -mt-6 z-10">
      <button
        onClick={onShopNow}
        className="group inline-flex items-center gap-2 px-8 py-4 bg-cream-50 text-maroon-800 font-semibold rounded-full hover:bg-saffron-400 hover:text-white transition-all duration-300 hover:shadow-2xl active:scale-95 shadow-xl"
      >
        {heroBanners[current].cta}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
    </>
  );
}
