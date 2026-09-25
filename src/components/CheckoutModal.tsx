import { useState, useEffect } from 'react';
import { X, Check, CreditCard, Banknote, MapPin, LocateFixed, User, Phone, Mail, ArrowRight, ArrowLeft, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MiraDB } from '@/lib/supabase.js';
import type { Customer } from '@/context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (orderNumber: string) => void;
  customer: Customer | null;
}

type Step = 'contact' | 'address' | 'payment' | 'success';
type PaymentMethod = 'online' | 'cod';

// Builds a hidden form and submits it so the browser POSTs straight to
// PayU's hosted payment page with the signed fields -- this is how PayU's
// classic integration expects the redirect to happen, not a GET/fetch.
function redirectToPayu(action: string, params: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  for (const [key, value] of Object.entries(params)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

const COD_CHARGE = 30;
const COD_FREE_THRESHOLD = 500;

export function CheckoutModal({ isOpen, onClose, onOrderComplete, customer }: CheckoutModalProps) {
  const { items, subtotal, deliveryCharge, total: cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>('contact');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const codCharge = paymentMethod === 'cod' && subtotal < COD_FREE_THRESHOLD ? COD_CHARGE : 0;
  const total = cartTotal + codCharge;
  const [orderNumber, setOrderNumber] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
  });

  useEffect(() => {
    if (customer && isOpen) {
      setForm((f) => ({
        ...f,
        name: f.name || customer.name || '',
        phone: f.phone || customer.phone || '',
        email: f.email || customer.email || '',
        address: f.address || customer.address || '',
        pincode: f.pincode || customer.pincode || '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (step === 'success') {
      setStep('contact');
      setForm({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
    }
    onClose();
  };

  const handleNext = async () => {
    if (step === 'contact') setStep('address');
    else if (step === 'address') setStep('payment');
    else if (step === 'payment') {
      if (!customer) {
        setPlaceError('Please sign in to place your order.');
        return;
      }
      setPlacing(true);
      setPlaceError('');

      // Stock may have changed since these items were added to cart (another
      // customer bought the last units, or an admin adjusted it) -- this is
      // the real gate against the live database, not just the clamp applied
      // when the item was first added.
      const stockProblems = await MiraDB.checkVariantStock(
        items.map((i) => ({ productId: i.product.id, weight: i.product.weight, quantity: i.quantity, name: i.product.name }))
      );
      if (stockProblems.length > 0) {
        setPlacing(false);
        setPlaceError(
          `Not enough stock — ` +
          stockProblems.map((p) => `${p.name} (${p.weight}): only ${p.available} left, you have ${p.requested} in cart`).join('; ') +
          `. Please adjust your cart and try again.`
        );
        return;
      }

      const orderId = `order_${customer.id.slice(0, 8)}_${Date.now()}`;
      const ok = await MiraDB.dbInsertOrder({
        id: orderId,
        customer: {
          id: customer.id,
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
        },
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          weight: i.product.weight,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image,
        })),
        totalAmount: total,
        paymentMethod,
        // Real online payments start "pending" and only ever flip to "paid"
        // once PayU's server-to-server callback verifies it -- never here.
        paymentStatus: 'pending',
        // COD is confirmed the moment it's placed, so it goes straight to
        // kitchen/dispatch processing; an online order stays Pending until
        // payu-callback confirms payment, then flips to Processing itself.
        orderStatus: paymentMethod === 'cod' ? 'Processing' : 'Pending',
        date: new Date().toISOString(),
      });

      if (!ok) {
        setPlacing(false);
        setPlaceError('Could not place your order. Please try again.');
        return;
      }

      if (paymentMethod === 'cod') {
        setPlacing(false);
        // COD is confirmed at order time, so the sale counts immediately;
        // online payments only count once payu-callback confirms it paid.
        MiraDB.incrementUnitsSold(items.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
        MiraDB.decrementVariantStock(items.map((i) => ({ productId: i.product.id, weight: i.product.weight, quantity: i.quantity })));
        MiraDB.setOrderStockDeducted(orderId, true);
        MiraDB.sendOrderConfirmationEmail(orderId);
        const seq = await MiraDB.fetchOrderSeq(orderId);
        const num = seq ? `MEERAV-${seq}` : orderId.toUpperCase();
        setOrderNumber(num);
        setStep('success');
        onOrderComplete(num);
        clearCart();
        return;
      }

      const payu = await MiraDB.initiatePayuPayment(orderId);
      if (payu?.error) {
        setPlacing(false);
        setPlaceError(payu.error.message || 'Could not start online payment. Please try again or choose Cash on Delivery.');
        return;
      }
      clearCart();
      redirectToPayu(payu.action, payu.params);
      // Browser navigates away to PayU here -- no further UI update needed.
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Location isn’t supported on this device/browser. Please enter your address manually.');
      return;
    }
    setLocating(true);
    setLocateError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { Accept: 'application/json' } }
          );
          if (!res.ok) throw new Error('Lookup failed');
          const data = await res.json();
          const a = data.address || {};
          const streetParts = [a.house_number, a.road || a.pedestrian].filter(Boolean).join(' ');
          const areaParts = [a.suburb || a.neighbourhood, a.city_district].filter(Boolean).join(', ');
          const detectedAddress = [streetParts, areaParts].filter(Boolean).join(', ') || data.display_name || '';
          const detectedCity = a.city || a.town || a.village || a.county || '';
          const detectedPincode = a.postcode || '';
          setForm((f) => ({
            ...f,
            address: detectedAddress || f.address,
            city: detectedCity || f.city,
            pincode: detectedPincode || f.pincode,
          }));
        } catch {
          setLocateError('Could not determine your address from your location. Please enter it manually.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Please enter your address manually.'
            : 'Could not get your location. Please enter your address manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleBack = () => {
    if (step === 'address') setStep('contact');
    else if (step === 'payment') setStep('address');
  };

  const canProceed = () => {
    if (step === 'contact') return form.name && form.phone && form.phone.length >= 10;
    if (step === 'address') return form.address && form.city && form.pincode.length >= 6;
    return true;
  };

  const steps: { id: Step; label: string }[] = [
    { id: 'contact', label: 'Contact' },
    { id: 'address', label: 'Address' },
    { id: 'payment', label: 'Payment' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-cream-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-serif text-xl font-bold">
            {step === 'success' ? 'Order Confirmed!' : 'Secure Checkout'}
          </h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 hover:bg-maroon-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'success' ? (
          /* Success Screen */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-2">
              Thank you for your order!
            </h3>
            <p className="text-charcoal-500 mb-6">
              Your order has been placed successfully. You'll receive a confirmation SMS shortly.
            </p>
            <div className="bg-cream-100 rounded-xl p-4 mb-6 inline-block">
              <p className="text-sm text-charcoal-500">Order Number</p>
              <p className="font-serif text-2xl font-bold text-maroon-800">{orderNumber}</p>
            </div>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <div className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg text-left">
                <Truck className="w-5 h-5 text-saffron-600 shrink-0" />
                <p className="text-sm text-charcoal-600">
                  Estimated delivery: <span className="font-medium">3-5 business days</span>
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg text-left">
                <MapPin className="w-5 h-5 text-maroon-600 shrink-0" />
                <p className="text-sm text-charcoal-600">
                  Track your order in real-time using the delivery tracker on our website.
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="btn-primary mt-6">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 py-6 bg-cream-100">
              {steps.map((s, idx) => {
                const isActive = step === s.id;
                const isPast = steps.findIndex((x) => x.id === step) > idx;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-maroon-700 text-cream-50'
                          : isPast
                          ? 'bg-green-100 text-green-700'
                          : 'bg-cream-200 text-charcoal-400'
                      }`}
                    >
                      {isPast ? <Check className="w-4 h-4" /> : <span className="w-5 h-5 flex items-center justify-center">{idx + 1}</span>}
                      {s.label}
                    </div>
                    {idx < steps.length - 1 && <div className={`w-8 h-0.5 ${isPast ? 'bg-green-400' : 'bg-cream-300'}`} />}
                  </div>
                );
              })}
            </div>

            <div className="p-6">
              {/* Step: Contact */}
              {step === 'contact' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-4">Contact Information</h3>
                  <div>
                    <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-4 h-4" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-4 h-4" /> Email (optional)
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Step: Address */}
              {step === 'address' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-4">Delivery Address</h3>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-saffron-300 bg-saffron-50 text-saffron-800 font-medium rounded-lg hover:bg-saffron-100 transition-colors disabled:opacity-60"
                  >
                    <LocateFixed className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
                    {locating ? 'Detecting your location…' : 'Use My Current Location'}
                  </button>
                  {locateError && <p className="text-sm text-red-600">{locateError}</p>}
                  <p className="text-xs text-charcoal-400 -mt-2">Or enter your address manually below.</p>

                  <div>
                    <label className="text-sm font-medium text-charcoal-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> Full Address
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="House no, street, area, landmark..."
                      rows={3}
                      className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">City</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">Pincode</label>
                      <input
                        type="text"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                        placeholder="400001"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:border-saffron-400 focus:ring-1 focus:ring-saffron-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Payment */}
              {step === 'payment' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-4">Payment Method</h3>

                  {/* Online Payment (PayU) */}
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'online'
                        ? 'border-maroon-700 bg-maroon-50'
                        : 'border-cream-300 bg-white hover:border-cream-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === 'online' ? 'bg-maroon-700' : 'bg-cream-200'}`}>
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'online' ? 'text-cream-50' : 'text-charcoal-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-charcoal-800 text-sm">Pay Online</h4>
                      <p className="text-xs text-charcoal-500">Card, UPI, or Netbanking — secured by PayU</p>
                    </div>
                    {paymentMethod === 'online' && <Check className="w-5 h-5 text-maroon-700" />}
                  </button>

                  {/* COD Option */}
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'cod'
                        ? 'border-maroon-700 bg-maroon-50'
                        : 'border-cream-300 bg-white hover:border-cream-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-maroon-700' : 'bg-cream-200'}`}>
                      <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-cream-50' : 'text-charcoal-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-charcoal-800 text-sm">Cash on Delivery</h4>
                      <p className="text-xs text-charcoal-500">Pay in cash or scan rider's QR on arrival</p>
                    </div>
                    {paymentMethod === 'cod' && <Check className="w-5 h-5 text-maroon-700" />}
                  </button>

                  {/* Order Summary */}
                  <div className="bg-cream-100 rounded-xl p-4 mt-6">
                    <h4 className="font-semibold text-charcoal-800 text-sm mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.lineId} className="flex justify-between text-sm text-charcoal-600">
                          <span className="truncate pr-2">{item.product.name} x{item.quantity}</span>
                          <span className="shrink-0">Rs {item.product.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm text-charcoal-600 pt-2 border-t border-cream-300">
                        <span>Subtotal</span>
                        <span>Rs {subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-charcoal-600">
                        <span>Delivery</span>
                        {deliveryCharge === 0 ? <span className="text-green-700">FREE</span> : <span>Rs {deliveryCharge}</span>}
                      </div>
                      {paymentMethod === 'cod' && (
                        <div className="flex justify-between text-sm text-charcoal-600">
                          <span>COD Charge</span>
                          {codCharge === 0 ? (
                            <span className="text-green-700">FREE (order ≥ Rs {COD_FREE_THRESHOLD})</span>
                          ) : (
                            <span>Rs {codCharge}</span>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-charcoal-900 pt-2 border-t border-cream-300">
                        <span>Total</span>
                        <span className="font-serif text-lg text-maroon-800">Rs {total}</span>
                      </div>
                      <p className="text-xs text-charcoal-400 text-right">Price inclusive of GST</p>
                    </div>
                  </div>
                </div>
              )}

              {placeError && <p className="text-sm text-red-600 mt-4">{placeError}</p>}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-cream-200">
                {step !== 'contact' ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2.5 text-charcoal-600 hover:text-maroon-700 transition-colors text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || placing}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 active:scale-95 ${
                    canProceed() && !placing
                      ? 'bg-saffron-500 text-white hover:bg-saffron-600 hover:shadow-lg'
                      : 'bg-cream-200 text-charcoal-400 cursor-not-allowed'
                  }`}
                >
                  {placing
                    ? paymentMethod === 'online' ? 'Redirecting to PayU…' : 'Placing Order…'
                    : step === 'payment'
                    ? paymentMethod === 'online' ? 'Proceed to Pay' : 'Place Order'
                    : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
