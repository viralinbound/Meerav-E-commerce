import { X, Plus, Minus, Trash2, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  onCheckout: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, isOpen, closeDrawer, updateQuantity, removeFromCart, subtotal, deliveryCharge, total, itemCount } = useCart();

  const FREE_DELIVERY_THRESHOLD = 500;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 animate-fade-in"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-cream-50 z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cream-200 bg-maroon-800 text-cream-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-serif text-xl font-bold">Your Cart</h2>
            {itemCount > 0 && (
              <span className="px-2 py-0.5 bg-saffron-500 text-white text-xs font-bold rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="w-9 h-9 hover:bg-maroon-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress */}
        {items.length > 0 && (
          <div className="p-4 bg-cream-100 border-b border-cream-200">
            {remaining > 0 ? (
              <p className="text-sm text-charcoal-600 mb-2">
                Add <span className="font-bold text-maroon-700">Rs {remaining}</span> more for{' '}
                <span className="font-semibold text-green-700">FREE delivery</span>
              </p>
            ) : (
              <p className="text-sm text-green-700 font-medium mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> You've unlocked FREE delivery!
              </p>
            )}
            <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-saffron-400 to-saffron-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 bg-cream-200 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-charcoal-400" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-charcoal-700 mb-2">
                Your cart is empty
              </h3>
              <p className="text-charcoal-500 text-sm mb-6">
                Looks like you haven't added any snacks yet. Explore our authentic Bikaneri collection!
              </p>
              <button
                onClick={closeDrawer}
                className="btn-primary"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 bg-white rounded-xl p-3 shadow-sm animate-fade-in"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-contain bg-cream-100 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-charcoal-800 leading-snug mb-1 line-clamp-2">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-charcoal-400 mb-2">{item.product.weight}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-maroon-800">
                        Rs {item.product.price * item.quantity}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-cream-100 rounded-full p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-charcoal-700 hover:bg-maroon-700 hover:text-cream-50 transition-colors shadow-sm"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-semibold text-sm text-charcoal-800 w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-charcoal-700 hover:bg-maroon-700 hover:text-cream-50 transition-colors shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-7 h-7 text-charcoal-400 hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-200 p-5 bg-white space-y-3">
            <div className="flex justify-between text-sm text-charcoal-600">
              <span>Subtotal</span>
              <span className="font-medium">Rs {subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-charcoal-600">
              <span>Delivery</span>
              {deliveryCharge === 0 ? (
                <span className="font-medium text-green-700">FREE</span>
              ) : (
                <span className="font-medium">Rs {deliveryCharge}</span>
              )}
            </div>
            <div className="flex justify-between text-lg font-bold text-charcoal-900 pt-2 border-t border-cream-200">
              <span>Total</span>
              <span className="font-serif text-maroon-800">Rs {total}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-saffron-500 text-white font-semibold rounded-xl hover:bg-saffron-600 transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
