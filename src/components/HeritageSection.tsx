import { ArrowRight } from 'lucide-react';
import { useSiteImage, useCatalog } from '@/lib/useCatalog';
import { TITLE_SIZE_CLASSES, SUBTITLE_SIZE_CLASSES, BUTTON_SIZE_STYLE } from '@/lib/bannerStyle';

interface HeritageSectionProps {
  onShopNow: () => void;
}

export function HeritageSection({ onShopNow }: HeritageSectionProps) {
  const HERITAGE_IMAGE = useSiteImage('heritage-banner');
  const { heritageContent } = useCatalog();
  const buttonStyle = BUTTON_SIZE_STYLE[heritageContent.buttonSize || 'md'];

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

      {/* Optional title/subtitle overlay — editable in Admin > Heritage
          Banner. Empty by default so nothing shows until the admin types
          something (the photo may already carry its own baked-in text). */}
      {heritageContent.title && (
        <div className="absolute inset-0 hidden sm:flex sm:items-center">
          <div className="container-max section-padding w-full">
            <div className="max-w-2xl">
              <h2
                className={`font-serif font-bold leading-tight mb-4 text-shadow-lg ${TITLE_SIZE_CLASSES[heritageContent.titleSize || 'md']}`}
                style={{ color: heritageContent.titleColor || '#7a2026' }}
              >
                {heritageContent.title}
              </h2>
              {heritageContent.subtitle && (
                <p className={`text-charcoal-700 max-w-xl leading-relaxed ${SUBTITLE_SIZE_CLASSES[heritageContent.subtitleSize || 'md']}`}>
                  {heritageContent.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
            padding: buttonStyle.padding,
            fontSize: buttonStyle.fontSize,
            gap: buttonStyle.gap,
            backgroundColor: heritageContent.buttonBgColor || '#fdf9f0',
            color: heritageContent.buttonTextColor || '#7a2026',
          }}
          className="group inline-flex items-center font-semibold rounded-full hover:brightness-95 transition-all duration-300 active:scale-95 whitespace-nowrap"
        >
          {heritageContent.cta || 'Explore Our Snacks'}
          <ArrowRight className="w-[1.1em] h-[1.1em] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
