import { ArrowRight } from 'lucide-react';
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

  const handleClick = (catId: string) => {
    onCategorySelect(catId);
    onNavigate('products');
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

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className="group text-left rounded-2xl overflow-hidden bg-white shadow-md card-hover"
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
    </section>
  );
}
