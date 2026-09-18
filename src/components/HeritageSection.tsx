import { ArrowRight } from 'lucide-react';

interface HeritageSectionProps {
  onShopNow: () => void;
}

export function HeritageSection({ onShopNow }: HeritageSectionProps) {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/31339268/pexels-photo-31339268.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600"
          alt="Junagarh Fort, Bikaner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-900/55 via-maroon-800/35 to-transparent" />
      </div>

      <div className="relative container-max section-padding">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-saffron-500/30 backdrop-blur-sm text-saffron-200 text-sm font-medium rounded-full mb-6 border border-saffron-400/30 text-shadow-lg">
            Heritage of Bikaner
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-cream-50 mb-6 leading-tight text-shadow-lg">
            Heritage of Bikaner, in every batch.
          </h2>
          <p className="text-lg text-cream-100 leading-relaxed mb-4 text-shadow-lg">
            Four decades, one kitchen, no shortcuts. The same desert land that gives us our spices
            and salt has been our home for generations.
          </p>
          <p className="text-cream-200 leading-relaxed mb-8 text-shadow-lg">
            From the sun-baked streets of Bikaner to your doorstep — every packet carries the warmth
            of our kitchen and the pride of our craft. We don't just make snacks. We preserve a way
            of life that is slowly disappearing.
          </p>
          <button
            onClick={onShopNow}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-cream-50 text-maroon-800 font-semibold rounded-full hover:bg-saffron-400 hover:text-white transition-all duration-300 hover:shadow-2xl active:scale-95"
          >
            Explore Our Snacks
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
