import { ArrowRight } from 'lucide-react';

interface HeritageSectionProps {
  onShopNow: () => void;
}

const HERITAGE_IMAGE =
  'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/sections/heritage-section-banner.webp';

export function HeritageSection({ onShopNow }: HeritageSectionProps) {
  return (
    <section className="relative overflow-hidden bg-royal-gradient">
      {/* The artwork already has the heading, copy, and branding baked in,
          so — same treatment as the hero banners — it's shown in full via
          object-contain (never cropped) on top of a blurred cover copy that
          fills the box at any screen size, instead of duplicating the text
          as a separate overlay. */}
      <img
        src={HERITAGE_IMAGE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
      />
      <img
        src={HERITAGE_IMAGE}
        alt="Heritage of Bikaner, in every batch"
        className="relative w-full h-auto max-h-[85vh] mx-auto block"
      />

      <div className="relative flex justify-center pb-10 sm:pb-12 -mt-16 sm:-mt-20">
        <button
          onClick={onShopNow}
          className="group inline-flex items-center gap-2 px-8 py-4 bg-cream-50 text-maroon-800 font-semibold rounded-full hover:bg-saffron-400 hover:text-white transition-all duration-300 hover:shadow-2xl active:scale-95 shadow-xl"
        >
          Explore Our Snacks
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
