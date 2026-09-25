import { useState, useMemo } from 'react';
import { Star, Plus, Flame, Search } from 'lucide-react';
import { isProductOutOfStock, type Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/lib/useCatalog';

interface ProductGridProps {
  searchQuery: string;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ searchQuery, onProductClick }: ProductGridProps) {
  const { addToCart } = useCart();
  const { products } = useCatalog();
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const [packSize, setPackSize] = useState('all');

  // Every distinct pack size across all products' actual variants (not just
  // the default one shown on the card), so the filter reflects whatever
  // sizes admins have configured, however many that is.
  const packSizes = useMemo(() => {
    const sizes = new Set<string>();
    for (const p of products) {
      for (const v of p.variants?.length ? p.variants : [{ weight: p.weight }]) {
        if (v.weight) sizes.add(v.weight);
      }
    }
    return Array.from(sizes).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    if (packSize !== 'all') {
      result = result.filter((p) =>
        (p.variants?.length ? p.variants : [{ weight: p.weight }]).some((v) => v.weight === packSize)
      );
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [products, searchQuery, sortBy, packSize]);

  // When a Pack Size filter is active, every card should reflect THAT
  // variant's own price/weight/stock -- not always the product's default
  // first variant -- since that's the size the customer explicitly asked
  // to see and buy.
  const displayVariantFor = (product: Product) => {
    if (packSize === 'all') return null;
    return product.variants?.find((v) => v.weight === packSize) || null;
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const dv = displayVariantFor(product);
    if (dv) {
      addToCart({ ...product, price: dv.price, weight: dv.weight });
      return;
    }
    addToCart(product);
  };

  return (
    <section id="products" className="py-4 lg:py-12 bg-white">
      <div className="container-max section-padding">
        <div className="text-center mb-6 lg:mb-10">
          <span className="inline-block px-4 py-1.5 bg-saffron-100 text-saffron-700 text-sm font-medium rounded-full mb-4">
            Our Collection
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Every Meerav delicacy in one place — pick your favourites
          </p>
        </div>

        {/* Sort + Count Bar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <p className="text-sm text-charcoal-500">
            Showing <span className="font-semibold text-charcoal-800">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {packSizes.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-charcoal-500">Pack Size:</label>
                <select
                  value={packSize}
                  onChange={(e) => setPackSize(e.target.value)}
                  className="px-3 py-2 border border-cream-300 rounded-lg text-sm bg-white focus:outline-none focus:border-saffron-400 cursor-pointer"
                >
                  <option value="all">All Sizes</option>
                  {packSizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="text-sm text-charcoal-500">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-cream-300 rounded-lg text-sm bg-white focus:outline-none focus:border-saffron-400 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-charcoal-400" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-charcoal-700 mb-2">No products found</h3>
            <p className="text-charcoal-500 mb-4">Try a different search term</p>
          </div>
        ) : (
          <div id="home-allproducts-track" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const dv = displayVariantFor(product);
              const displayPrice = dv ? dv.price : product.price;
              const displayWeight = dv ? dv.weight : product.weight;
              // With a Pack Size filter active, "out of stock" reflects just
              // that one variant; otherwise it's the whole-product check
              // (every variant sold out).
              const outOfStock = dv ? dv.stock != null && dv.stock <= 0 : isProductOutOfStock(product);
              return (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md card-hover border border-cream-200"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-700 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-charcoal-900/10">
                      <span className="px-3 py-1.5 bg-charcoal-800 text-white text-xs font-bold rounded-full shadow-sm">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
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
                  {!outOfStock && (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="absolute bottom-3 right-3 w-10 h-10 bg-maroon-700 text-cream-50 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-maroon-800 active:scale-90"
                      aria-label="Add to cart"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
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
                  <p className="text-xs text-charcoal-400 mb-2">{displayWeight}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg md:text-xl font-bold text-maroon-800">
                      Rs {displayPrice}
                    </span>
                    {!outOfStock && (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="md:hidden p-1.5 bg-saffron-500 text-white rounded-lg active:scale-90"
                      aria-label="Add to cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
