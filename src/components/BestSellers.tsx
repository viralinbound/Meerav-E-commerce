import { useRef } from 'react';
import { Star, Plus, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCatalog } from '@/lib/useCatalog';
import { useCart } from '@/context/CartContext';

interface BestSellersProps {
  onProductClick: (product: Product) => void;
}

export function BestSellers({ onProductClick }: BestSellersProps) {
  const { addToCart } = useCart();
  const { products } = useCatalog();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section id="bestsellers" className="pt-8 pb-16 lg:pt-12 lg:pb-24 bg-cream-50">
      <div className="container-max section-padding">
        <div className="text-center mb-6 lg:mb-10">
          <span className="inline-block px-4 py-1.5 bg-saffron-100 text-saffron-700 text-sm font-medium rounded-full mb-4">
            Full Range
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">Our Collection</h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Every namkeen and sweet we make, all in one place — pick your favourites and build your own box
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
            id="home-allproducts-track"
            ref={scrollerRef}
            className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory no-scrollbar"
          >
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md card-hover flex-none snap-start w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] border border-cream-200"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {product.isBestseller && (
                      <span className="px-2 py-1 bg-saffron-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                        TOP PICK
                      </span>
                    )}
                    {product.isNew && (
                      <span className="px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded-full shadow-sm">
                        NEW
                      </span>
                    )}
                  </div>
                  {/* Spice Level */}
                  {product.spiceLevel === 'hot' && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-1 bg-red-600/90 text-white text-[10px] font-bold rounded-full">
                      <Flame className="w-3 h-3" />
                      SPICY
                    </div>
                  )}
                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-maroon-700 text-cream-50 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-maroon-800 active:scale-90"
                    aria-label="Add to cart"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 md:p-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3.5 h-3.5 fill-saffron-400 text-saffron-400" />
                    <span className="text-xs font-medium text-charcoal-700">{product.rating}</span>
                    <span className="text-xs text-charcoal-400">({product.reviews})</span>
                  </div>
                  <h3 className="font-medium text-charcoal-800 text-sm md:text-base leading-snug mb-1 line-clamp-2 group-hover:text-maroon-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-charcoal-400 mb-2">{product.weight}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg md:text-xl font-bold text-maroon-800">
                      Rs {product.price}
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="md:hidden p-1.5 bg-saffron-500 text-white rounded-lg active:scale-90"
                      aria-label="Add to cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
