import { useState, useEffect } from 'react';
import { MapPin, Package, X, ChevronDown, ChevronUp, Phone, CreditCard } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import type { Customer } from '@/context/AuthContext';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderSeq: number | null;
  customer: { name?: string; phone?: string; address?: string; city?: string; pincode?: string };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  date: string;
}

export function OrderHistory({ isOpen, onClose, customer }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !customer) return;
    let cancelled = false;
    setLoading(true);
    MiraDB.fetchMyOrders(customer.id).then((data: Order[]) => {
      if (!cancelled) {
        // COD confirms at order time, so it always shows; an online payment
        // only becomes a real order once it's actually paid -- a
        // pending/abandoned/failed online attempt should never appear as if
        // it were placed.
        const visible = data.filter((o) => o.paymentMethod === 'cod' || o.paymentStatus === 'paid');
        setOrders(visible);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [isOpen, customer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-cream-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h2 className="font-serif text-xl font-bold">Your Orders</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 hover:bg-maroon-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-charcoal-500 py-10">Loading your orders…</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <Package className="w-10 h-10 text-cream-300 mx-auto mb-3" />
              <p className="text-charcoal-500">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const expanded = expandedId === order.id;
                const orderNumber = order.orderSeq ? `MEERAV-${order.orderSeq}` : order.id.toUpperCase();
                const addressParts = [order.customer?.address, order.customer?.city, order.customer?.pincode].filter(Boolean);
                return (
                  <div key={order.id} className="border border-cream-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedId(expanded ? null : order.id)}
                      className="w-full flex items-center justify-between p-4 bg-cream-100 hover:bg-cream-200 transition-colors text-left"
                    >
                      <div>
                        <p className="font-serif font-bold text-maroon-800">{orderNumber}</p>
                        <p className="text-xs text-charcoal-500">
                          {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}₹{order.totalAmount.toFixed(0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-saffron-100 text-saffron-800">
                          {order.orderStatus}
                        </span>
                        {expanded ? <ChevronUp className="w-4 h-4 text-charcoal-500" /> : <ChevronDown className="w-4 h-4 text-charcoal-500" />}
                      </div>
                    </button>

                    {expanded && (
                      <div className="p-4 space-y-4 bg-cream-50">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-charcoal-800 truncate">{item.name}</p>
                                <p className="text-xs text-charcoal-500">Qty {item.quantity} × ₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {addressParts.length > 0 && (
                          <div className="flex items-start gap-2 text-sm text-charcoal-600 pt-2 border-t border-cream-200">
                            <MapPin className="w-4 h-4 text-saffron-600 shrink-0 mt-0.5" />
                            <span>{addressParts.join(', ')}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm pt-2 border-t border-cream-200">
                          <div className="flex items-center gap-2 text-charcoal-600">
                            <CreditCard className="w-4 h-4 text-saffron-600" />
                            <span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod} · {order.paymentStatus}</span>
                          </div>
                          {order.customer?.phone && (
                            <div className="flex items-center gap-1 text-charcoal-600">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{order.customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
