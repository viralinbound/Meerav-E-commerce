import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HeritageSection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero/hero_roasted_trio.jpg"
          alt="Heritage of Bikaner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-900/90 via-maroon-800/80 to-saffron-700/60" />
      </div>

      <div className="relative container-max section-padding">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-saffron-500/30 backdrop-blur-sm text-saffron-200 text-sm font-medium rounded-full mb-6 border border-saffron-400/30">
            Heritage of Bikaner
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-cream-50 mb-6 leading-tight">
            Heritage of Bikaner, in every batch.
          </h2>
          <p className="text-lg text-cream-100 leading-relaxed mb-4">
            Four decades, one kitchen, no shortcuts. The same desert land that gives us our spices
            and salt has been our home for generations.
          </p>
          <p className="text-cream-200 leading-relaxed mb-8">
            From the sun-baked streets of Bikaner to your doorstep — every packet carries the warmth
            of our kitchen and the pride of our craft. We don't just make snacks. We preserve a way
            of life that is slowly disappearing.
          </p>
          <button
            onClick={() => navigate("/shop")}
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
