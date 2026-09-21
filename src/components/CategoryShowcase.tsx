import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '@/lib/useCatalog';

interface CategoryShowcaseProps {
  onCategorySelect: (catId: string) => void;
  onNavigate: (section: string) => void;
}

// Category ids -> the real branded photo shot for that snack type (see
// scripts/ that seeded these into Supabase). Falls back to the Bhujia shot
// for any category we don't have a dedicated photo for yet.
const CATEGORY_IMAGES: Record<string, string> = {
  'bhujia-sev': 'assets/images/cinematic_bhujia.jpg',
  mathri: 'assets/images/cinematic_papad.jpg',
  'mixture-farsan': 'assets/images/cinematic_mixture.jpg',
  'roasted-diet': 'assets/images/cinematic_masala_peanuts.jpg',
  'sweets-combos': 'assets/images/cinematic_mixture.jpg',
};

export function CategoryShowcase({ onCategorySelect, onNavigate }: CategoryShowcaseProps) {
  const { categories } = useCatalog();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const handleClick = (catId: string) => {
    onCategorySelect(catId);
    onNavigate('products');
  };

  // Right-to-left reading order for the card row, matching the "Explore" ribbon.
  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section id="home-categories" className="py-20 bg-cream-50">
      <div className="container-max section-padding">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-saffron-100 text-saffron-700 text-sm font-medium rounded-full mb-4">
            Explore
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            From crispy bhujia to royal sweets — every Bikaneri favourite, sorted the way you shop
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white text-maroon-700 rounded-full shadow-lg hover:bg-maroon-700 hover:text-cream-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white text-maroon-700 rounded-full shadow-lg hover:bg-maroon-700 hover:text-cream-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            id="home-categories-track"
            ref={scrollerRef}
            dir="rtl"
            className="flex overflow-x-auto gap-4 md:gap-6 pb-4 snap-x snap-mandatory no-scrollbar"
          >
            {[...categories].reverse().map((cat) => (
              <button
                key={cat.id}
                dir="ltr"
                onClick={() => handleClick(cat.id)}
                className="group text-left rounded-2xl overflow-hidden bg-white shadow-md card-hover flex-none snap-start w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/5)]"
              >
                <div className="relative aspect-square overflow-hidden bg-cream-100">
                  <img
                    src={`/${CATEGORY_IMAGES[cat.id] || CATEGORY_IMAGES['bhujia-sev']}`}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <h3 className="font-serif text-sm md:text-lg font-bold text-cream-50 leading-tight text-shadow-lg">
                      {cat.name}
                    </h3>
                    <div className="hidden md:flex items-center gap-1 text-saffron-300 text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
