import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCatalog } from '@/lib/useCatalog';

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)($|\?)/i;
function isVideoUrl(url: string) {
  return VIDEO_EXTENSIONS.test(url);
}

interface HeroProps {
  onShopNow: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  const { heroBanners } = useCatalog();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % heroBanners.length), [heroBanners.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + heroBanners.length) % heroBanners.length), [heroBanners.length]);

  useEffect(() => {
    if (current >= heroBanners.length) setCurrent(0);
  }, [heroBanners.length, current]);

  useEffect(() => {
    if (heroBanners.length < 2) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next, heroBanners.length]);

  if (heroBanners.length === 0) return null;

  const activeBanner = heroBanners[current] || heroBanners[0];
  const buttonX = activeBanner.buttonX ?? 50;
  // Clamped so a banner saved with a very low button position (dragged close
  // to the edge in Admin > Hero Banners) can never sit on top of the dots.
  const buttonY = Math.min(activeBanner.buttonY ?? 82, 86);

  return (
    <section
      id="home-hero"
      className="relative overflow-hidden bg-royal-gradient w-full aspect-[16/9]"
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
              banner artwork itself is never cropped, at any screen size.
              Same treatment for a video banner, just swapping the tag. */}
          {isVideoUrl(banner.image) ? (
            <>
              <video
                src={banner.image}
                aria-hidden="true"
                muted
                autoPlay
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
              />
              <video
                src={banner.image}
                muted
                autoPlay
                loop
                playsInline
                className="relative w-full h-full object-contain"
              />
            </>
          ) : (
            <>
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
            </>
          )}
          {/* Title/subtitle overlay — only for banners whose artwork doesn't
              already carry baked-in copy (banner.title === ''). */}
          {banner.title && (
            <>
              <div className="absolute inset-0 bg-hero-pattern" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/5 to-transparent" />
              <div className="absolute inset-0 hidden sm:flex sm:items-center">
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
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Shop Now — positioned per-banner via buttonX/buttonY (percentages,
          set by dragging it in Admin > Hero Banners), so it always reads as
          part of the banner artwork instead of a fixed generic spot. */}
      <div
        className="absolute z-10"
        style={{
          left: `${buttonX}%`,
          // Raises the button on narrow phones and nudges it down on wide
          // desktops relative to its saved (tablet-tuned) position, so the
          // gap above the dots reads the same at every screen width instead
          // of just scaling the raw percentage with the aspect-locked box.
          top: `calc(${buttonY}% + clamp(-1.8rem, 5vw - 3rem, 1.2rem))`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <button
          onClick={onShopNow}
          style={{
            padding: 'clamp(0.4rem, 2.5vw, 1rem) clamp(0.9rem, 5vw, 2rem)',
            fontSize: 'clamp(0.75rem, 2.8vw, 1.125rem)',
            gap: 'clamp(0.3rem, 1.2vw, 0.5rem)',
          }}
          className="group inline-flex items-center bg-cream-50 text-maroon-800 font-semibold rounded-full hover:bg-saffron-400 hover:text-white transition-all duration-300 active:scale-95 whitespace-nowrap"
        >
          {activeBanner.cta}
          <ArrowRight className="w-[1.1em] h-[1.1em] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

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
  );
}
