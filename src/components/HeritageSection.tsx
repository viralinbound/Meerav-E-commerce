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

      <div className="relative flex justify-center pb-6 sm:pb-10 md:pb-12 -mt-8 sm:-mt-16 md:-mt-20">
        <button
          onClick={onShopNow}
          className="group inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base md:px-8 md:py-4 md:text-lg bg-cream-50 text-maroon-800 font-semibold rounded-full hover:bg-saffron-400 hover:text-white transition-all duration-300 active:scale-95 whitespace-nowrap"
        >
          Explore Our Snacks
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
