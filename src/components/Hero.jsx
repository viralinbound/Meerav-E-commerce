import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useCatalog } from "../context/CatalogContext";
import { heroBanners } from "../data/realPhotos";

export default function Hero() {
  const { categories, bestSellers, discountPercent, loading } = useCatalog();
  const [index, setIndex] = useState(0);

  const slides = useMemo(() => {
    const bestSeller = bestSellers(1)[0];
    const base = [
      {
        id: "brand",
        eyebrow: "Handcrafted Since 1983 • From the Heart of Bikaner",
        title: "We still fry it the way Nani did.",
        tagline: "Real potatoes, real spices, real ghee — no shortcuts, ever.",
        ctaLabel: "Order Today",
        ctaTo: "/shop",
      },
    ];
    if (bestSeller) {
      const off = discountPercent(bestSeller.variants[0]);
      base.push({
        id: "offer",
        eyebrow: "New Batch, Fresh Today",
        title: `${off}% OFF on ${bestSeller.name}`,
        tagline: "Grab today's best-selling crunch before the offer ends.",
        ctaLabel: "Shop This Deal",
        ctaTo: `/product/${bestSeller.id}`,
      });
    }
    categories
      .filter((c) => c.id !== "all")
      .forEach((c) => {
        base.push({
          id: c.id,
          eyebrow: "The Royal Treat",
          title: c.name,
          tagline: c.description,
          ctaLabel: `Explore ${c.name}`,
          ctaTo: `/category/${c.id}`,
        });
      });
    return base.map((s, i) => ({ ...s, image: heroBanners[i % heroBanners.length] }));
  }, [categories, bestSellers, discountPercent]);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return <section className="relative h-[70vh] min-h-[500px] bg-maroon-800" />;
  }

  const activeIndex = index % slides.length;

  function go(delta) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-max section-padding w-full">
              <div className="max-w-2xl">
                <span className="inline-block px-4 py-1.5 bg-saffron-500/90 text-white text-sm font-medium rounded-full mb-6">
                  {s.eyebrow}
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream-50 leading-tight mb-6 text-shadow-lg">
                  {s.title}
                </h2>
                <p className="text-lg text-cream-100 mb-8 max-w-xl leading-relaxed">{s.tagline}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={s.ctaTo}
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-saffron-500 text-white font-semibold rounded-full hover:bg-saffron-600 transition-all duration-300 hover:shadow-2xl active:scale-95"
                  >
                    {s.ctaLabel}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-cream-50 text-cream-50 font-semibold rounded-full hover:bg-cream-50 hover:text-maroon-800 transition-all duration-300"
                  >
                    Our Story
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={() => go(-1)}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-cream-50/30 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-cream-50/50 transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => go(1)}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-cream-50/30 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-cream-50/50 transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-8 bg-saffron-400" : "w-2 bg-cream-50/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
