import { ArrowRight } from 'lucide-react';

interface HeritageSectionProps {
  onShopNow: () => void;
}

const HERITAGE_IMAGE =
  'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/sections/heritage-section-banner.webp';

export function HeritageSection({ onShopNow }: HeritageSectionProps) {
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

      <div
        className="relative flex justify-center"
        style={{ paddingBottom: 'clamp(0.9rem, 4vw, 3rem)', marginTop: 'clamp(-2.2rem, -9vw, -5rem)' }}
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
          Explore Our Snacks
          <ArrowRight className="w-[1.1em] h-[1.1em] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
