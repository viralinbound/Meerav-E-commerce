import { ArrowRight } from 'lucide-react';
import { useSiteImage } from '@/lib/useCatalog';

interface HeritageSectionProps {
  onShopNow: () => void;
}

export function HeritageSection({ onShopNow }: HeritageSectionProps) {
  const HERITAGE_IMAGE = useSiteImage('heritage-banner');
  return (
    <section className="relative overflow-hidden bg-royal-gradient w-full aspect-[16/9]">
      {/* Same treatment and same size as the hero banners: shown in full via
          object-contain (never cropped) on a blurred cover copy that fills
          the box at any screen size, with the section's own aspect-[16/9]
          matching Hero's exactly so both banners read as the same size. */}
      <img
        src={HERITAGE_IMAGE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
      />
      <img
        src={HERITAGE_IMAGE}
        alt="Heritage of Bikaner, in every batch"
        className="relative w-full h-full object-contain"
      />

      {/* Pinned as a percentage of the section's own locked aspect-ratio box
          (same technique as Hero's buttonX/buttonY) so it always sits right
          at the image's bottom edge, regardless of letterboxing at any
          screen width — a fixed negative margin can't track that reliably. */}
      <div
        className="absolute z-10"
        style={{
          left: '50%',
          // Base position tuned to sit below the paragraph text without
          // getting clipped by the section's bottom edge on tablet/desktop,
          // plus the same breakpoint offset as Hero's button.
          top: 'calc(80% + clamp(-0.2rem, 5vw - 2.3rem, 1.4rem))',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <button
          onClick={onShopNow}
          style={{
            padding: 'clamp(0.25rem, 1.4vw, 1rem) clamp(0.6rem, 3vw, 2rem)',
            fontSize: 'clamp(0.6rem, 1.8vw, 1.125rem)',
            gap: 'clamp(0.18rem, 0.7vw, 0.5rem)',
          }}
          className="group inline-flex items-center bg-cream-50 text-maroon-800 font-semibold rounded-full hover:bg-saffron-400 hover:text-white transition-all duration-300 active:scale-95 whitespace-nowrap"
        >
          Explore Our Snacks
          <ArrowRight className="w-[1.1em] h-[1.1em] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
