import { Flame, Leaf, ShieldCheck, Truck } from 'lucide-react';

export function BrandStory() {
  return (
    <section className="py-20 bg-cream-50">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-maroon-100 text-maroon-700 text-sm font-medium rounded-full mb-6">
              Our Tradition
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6 leading-tight">
              Rooted in tradition. Made for today.
            </h2>
            <p className="text-lg text-charcoal-600 leading-relaxed mb-6">
              No shortcuts, no palm oil, no factory-style production — just moth flour, pure
              groundnut oil and desert rock salt, prepared in small batches and packed fresh.
            </p>
            <p className="text-charcoal-500 leading-relaxed mb-8">
              Our snacks are inspired by the traditional flavours and techniques of Rajasthan — the
              kind of simple, honest preparation that lets good ingredients speak for themselves. We
              stay close to these methods because we believe authentic taste doesn't need to be
              reinvented.
            </p>
            <p className="text-charcoal-500 leading-relaxed mb-8 -mt-4">
              From carefully preparing the dough to frying each batch to the right texture, every
              step is rooted in the traditional way of making Rajasthani snacks. The result is a
              taste that feels familiar, authentic, and close to the flavours people have loved for
              generations.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-saffron-100 rounded-lg flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6 text-saffron-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800 text-sm">Small Batch Fried</h3>
                  <p className="text-xs text-charcoal-500">Prepared in small batches for consistent taste</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800 text-sm">Zero Palm Oil</h3>
                  <p className="text-xs text-charcoal-500">Pure groundnut oil only</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-maroon-100 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-maroon-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800 text-sm">No Preservatives</h3>
                  <p className="text-xs text-charcoal-500">Simple, natural ingredients</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-mustard-100 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-mustard-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800 text-sm">Same-Day Pack</h3>
                  <p className="text-xs text-charcoal-500">Packed fresh and ready to ship</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/37330104/pexels-photo-37330104.jpeg?auto=compress&cs=tinysrgb&h=800&w=600"
                alt="Traditional Bikaneri kitchen"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-cream-50 rounded-2xl shadow-xl p-6 max-w-xs hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-royal-gradient rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-cream-50" />
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-maroon-800">True to Tradition</p>
                  <p className="text-xs text-charcoal-500">Traditional techniques, authentic ingredients</p>
                </div>
              </div>
              <p className="text-sm text-charcoal-600">
                Taste that stays close to its roots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
