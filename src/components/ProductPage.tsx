import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, Flame, Leaf, ShieldCheck, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';

interface ProductPageProps {
  product: Product;
  onBack: () => void;
}

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export function ProductPage({ product, onBack }: ProductPageProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [variantIndex, setVariantIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    setQuantity(1);
    setVariantIndex(0);
    setMediaIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [product.id]);

  const variants = product.variants?.length ? product.variants : [{ weight: product.weight, price: product.price }];
  const selectedVariant = variants[variantIndex] || variants[0];
  const selected: Product = { ...product, price: selectedVariant.price, weight: selectedVariant.weight };

  // Every real photo the admin uploaded — packaging front, the back-of-pack
  // nutrition label, and lifestyle shots — shown in full, so the buyer sees
  // exactly what's printed on the pack before buying it. Display order for
  // every product's 4 photos: [4, 1, 3, 2].
  const rawPhotos = product.photos?.length ? product.photos : [product.image];
  const orderedPhotos =
    rawPhotos.length === 4 ? [rawPhotos[3], rawPhotos[0], rawPhotos[2], rawPhotos[1]] : rawPhotos;
  const media: MediaItem[] = [
    ...orderedPhotos.map((url) => ({ type: 'image' as const, url })),
    ...(product.videos || []).map((url) => ({ type: 'video' as const, url })),
  ];
  const currentMedia = media[mediaIndex] || media[0];
  const prevMedia = () => setMediaIndex((i) => (i - 1 + media.length) % media.length);
  const nextMedia = () => setMediaIndex((i) => (i + 1) % media.length);

  const handleAdd = () => {
    addToCart(selected, quantity);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-cream-200 bg-cream-50">
        <div className="container-max section-padding py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-600 hover:text-maroon-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="container-max section-padding py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Full Media Gallery */}
          <div className="flex flex-col">
            <div className="relative aspect-square overflow-hidden bg-cream-100 rounded-2xl">
              {currentMedia?.type === 'video' ? (
                <video src={currentMedia.url} controls className="w-full h-full object-contain bg-charcoal-900" />
              ) : (
                <img src={currentMedia?.url} alt={product.name} className="w-full h-full object-contain p-6" />
              )}

              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.isBestseller && (
                  <span className="px-3 py-1 bg-saffron-500 text-white text-xs font-bold rounded-full shadow-sm">
                    BESTSELLER
                  </span>
                )}
                {product.isNew && (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-sm">
                    NEW
                  </span>
                )}
              </div>

              {media.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    aria-label="Previous media"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 text-charcoal-700 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMedia}
                    aria-label="Next media"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 text-charcoal-700 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {media.length > 1 && (
              <div className="flex gap-3 overflow-x-auto p-1 pt-4 no-scrollbar">
                {media.map((m, idx) => (
                  <button
                    key={m.url + idx}
                    onClick={() => setMediaIndex(idx)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      idx === mediaIndex ? 'border-maroon-700' : 'border-cream-300'
                    }`}
                  >
                    {m.type === 'video' ? (
                      <div className="w-full h-full bg-charcoal-800 flex items-center justify-center">
                        <Play className="w-5 h-5 text-cream-50" />
                      </div>
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-saffron-400 text-saffron-400" />
                <span className="text-sm font-semibold text-charcoal-700">{product.rating}</span>
              </div>
              <span className="text-sm text-charcoal-400">({product.reviews} reviews)</span>
              {product.spiceLevel === 'hot' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  <Flame className="w-3 h-3" /> Spicy
                </span>
              )}
              {product.spiceLevel === 'medium' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-saffron-100 text-saffron-700 text-xs font-medium rounded-full">
                  <Flame className="w-3 h-3" /> Medium
                </span>
              )}
              {product.spiceLevel === 'mild' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <Leaf className="w-3 h-3" /> Mild
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-charcoal-900 mb-3">{product.name}</h1>
            <p className="text-charcoal-600 leading-relaxed mb-6">{product.description}</p>

            {/* Pack Size / Variant Selector */}
            {variants.length > 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-charcoal-800 mb-2">Pack Size</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, idx) => (
                    <button
                      key={v.weight}
                      onClick={() => setVariantIndex(idx)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        idx === variantIndex
                          ? 'border-maroon-700 bg-maroon-700 text-cream-50'
                          : 'border-cream-300 bg-white text-charcoal-700 hover:border-maroon-300'
                      }`}
                    >
                      {v.weight}
                      <span className={`block text-xs ${idx === variantIndex ? 'text-cream-200' : 'text-charcoal-400'}`}>
                        Rs {v.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {variants.length === 1 && <p className="text-sm text-charcoal-500 mb-6 -mt-4">{selectedVariant.weight}</p>}

            {/* Ingredients */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-charcoal-800 mb-2">Pure Ingredients</h3>
              <p className="text-sm text-charcoal-500 leading-relaxed">{product.ingredients}</p>
            </div>

            {/* Nutrition */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-charcoal-800 mb-3">Nutrition (per 100g)</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Calories', value: product.nutrition.calories, unit: 'kcal' },
                  { label: 'Protein', value: product.nutrition.protein, unit: 'g' },
                  { label: 'Carbs', value: product.nutrition.carbs, unit: 'g' },
                  { label: 'Fat', value: product.nutrition.fat, unit: 'g' },
                ].map((n) => (
                  <div key={n.label} className="text-center p-2 bg-cream-100 rounded-lg">
                    <p className="font-serif text-lg font-bold text-maroon-700">
                      {n.value}
                      <span className="text-xs font-normal text-charcoal-400">{n.unit}</span>
                    </p>
                    <p className="text-xs text-charcoal-500">{n.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price + Quantity + Add */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-3xl font-bold text-maroon-800">Rs {selectedVariant.price * quantity}</span>
              <div className="flex items-center gap-3 bg-cream-100 rounded-full p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-charcoal-700 hover:bg-maroon-700 hover:text-cream-50 transition-colors shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-charcoal-800 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-charcoal-700 hover:bg-maroon-700 hover:text-cream-50 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-saffron-500 text-white font-semibold rounded-xl hover:bg-saffron-600 transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart - Rs {selectedVariant.price * quantity}
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-cream-200">
              <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
                <ShieldCheck className="w-4 h-4 text-green-600" /> No Preservatives
              </div>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
                <Leaf className="w-4 h-4 text-green-600" /> Pure Groundnut Oil
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
