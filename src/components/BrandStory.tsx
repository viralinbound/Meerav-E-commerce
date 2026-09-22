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
                  <h3 className="font-semibold text-charcoal-800 text-sm">Fried in Small Batches</h3>
                  <p className="text-xs text-charcoal-500">Never a mega-batch — so every handful tastes like the last</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800 text-sm">No Palm Oil, Ever</h3>
                  <p className="text-xs text-charcoal-500">Just pure groundnut oil, the way our grandparents used it</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-maroon-100 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-maroon-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800 text-sm">Nothing Artificial</h3>
                  <p className="text-xs text-charcoal-500">No preservatives — just real ingredients you can name</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-mustard-100 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-mustard-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800 text-sm">Packed the Same Day</h3>
                  <p className="text-xs text-charcoal-500">Fried today, boxed today, on its way to you today</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/sections/our-tradition-banner.webp"
                alt="Bikaner lives in every bite — traditional bhujia frying setup"
                className="w-full h-[500px] object-cover object-top"
              />
            </div>
            <div className="bg-cream-50 rounded-2xl shadow-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-royal-gradient rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-cream-50" />
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-maroon-800">Still Made the Old Way</p>
                  <p className="text-xs text-charcoal-500">Same recipe, same care, nothing cut short</p>
                </div>
              </div>
              <p className="text-sm text-charcoal-600">
                No fancy machinery, no fancy talk — just Bikaner's way of doing things right.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
