import { useState, useEffect } from 'react';
import { X, Star, Plus, Minus, ShoppingCart, Flame, Leaf, ShieldCheck } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-cream-50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-cream-50/90 backdrop-blur-sm rounded-full flex items-center justify-center text-charcoal-600 hover:bg-maroon-700 hover:text-cream-50 transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden bg-cream-100">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
          </div>

          {/* Details */}
          <div className="p-6 md:p-8">
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

            <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-2">{product.name}</h2>
            <p className="text-sm text-charcoal-500 mb-4">{product.weight}</p>
            <p className="text-charcoal-600 leading-relaxed mb-6">{product.description}</p>

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
              <span className="font-serif text-3xl font-bold text-maroon-800">Rs {product.price * quantity}</span>
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
              Add to Cart - Rs {product.price * quantity}
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
