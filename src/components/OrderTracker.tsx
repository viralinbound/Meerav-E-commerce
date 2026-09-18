import { useState, useEffect } from 'react';
import { MapPin, Truck, Package, Check, Clock, Navigation, Phone, X } from 'lucide-react';

interface OrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTracker({ isOpen, onClose }: OrderTrackerProps) {
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    if (isOpen) {
      setProgress(25);
      const interval = setInterval(() => {
        setProgress((p) => (p >= 85 ? 85 : p + 1));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stages = [
    { icon: Check, label: 'Order Placed', detail: 'Sep 16, 9:30 AM', completed: progress >= 25 },
    { icon: Package, label: 'Packed Fresh', detail: 'Sep 16, 11:15 AM', completed: progress >= 50 },
    { icon: Truck, label: 'Out for Delivery', detail: 'Sep 17, 8:00 AM', completed: progress >= 75 },
    { icon: MapPin, label: 'Delivered', detail: 'Estimated: Sep 18', completed: progress >= 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-cream-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            <h2 className="font-serif text-xl font-bold">Real-Time Delivery Tracker</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 hover:bg-maroon-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Info */}
          <div className="bg-cream-100 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-charcoal-500">Order Number</span>
              <span className="font-serif text-lg font-bold text-maroon-800">#MEERAV-8801</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <MapPin className="w-4 h-4 text-saffron-600" />
              <span>Flat 402, Sea Breeze Apts, Bandra West, Mumbai 400050</span>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative h-48 bg-gradient-to-br from-green-100 via-cream-200 to-saffron-100 rounded-xl overflow-hidden mb-6 border-2 border-cream-300">
            {/* Route Line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
              <path
                d="M 50 150 Q 150 80 200 100 T 350 50"
                fill="none"
                stroke="#c74600"
                strokeWidth="3"
                strokeDasharray="8 4"
                opacity="0.5"
              />
            </svg>
            {/* Start Point */}
            <div className="absolute bottom-12 left-8">
              <div className="w-8 h-8 bg-maroon-700 rounded-full flex items-center justify-center shadow-lg">
                <Package className="w-4 h-4 text-cream-50" />
              </div>
              <p className="text-xs text-charcoal-600 font-medium mt-1">Bikaner</p>
            </div>
            {/* Moving Van */}
            <div
              className="absolute transition-all duration-500"
              style={{
                left: `${progress * 3}px`,
                top: `${150 - progress * 1.2}px`,
              }}
            >
              <div className="w-10 h-10 bg-saffron-500 rounded-full flex items-center justify-center shadow-lg animate-float">
                <Truck className="w-5 h-5 text-white" />
              </div>
            </div>
            {/* Destination */}
            <div className="absolute top-8 right-8">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-charcoal-600 font-medium mt-1">Mumbai</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-charcoal-500 mb-2">
              <span>In Transit</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-saffron-400 to-saffron-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stages */}
          <div className="space-y-4">
            {stages.map((stage, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    stage.completed
                      ? 'bg-green-600 text-white'
                      : 'bg-cream-200 text-charcoal-400'
                  }`}
                >
                  <stage.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${stage.completed ? 'text-charcoal-800' : 'text-charcoal-400'}`}>
                    {stage.label}
                  </h4>
                  <p className="text-xs text-charcoal-400">{stage.detail}</p>
                </div>
                {stage.completed && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {!stage.completed && idx === stages.findIndex((s) => !s.completed) && (
                  <Clock className="w-5 h-5 text-saffron-500 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Contact Rider */}
          <button className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 bg-cream-100 text-charcoal-700 rounded-xl hover:bg-cream-200 transition-colors text-sm font-medium">
            <Phone className="w-4 h-4" />
            Contact Delivery Rider
          </button>
        </div>
      </div>
    </div>
  );
}
