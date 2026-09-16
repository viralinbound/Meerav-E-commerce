import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
        title: (
          <>
            We still fry it the way <em>Nani did</em>.
          </>
        ),
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
        title: (
          <>
            {off}% OFF on <em>{bestSeller.name}</em>
          </>
        ),
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
          title: <>{c.name}</>,
          tagline: c.description,
          ctaLabel: `Explore ${c.name}`,
          ctaTo: `/category/${c.id}`,
        });
      });
    return base.map((s, i) => ({ ...s, image: heroBanners[i % heroBanners.length] }));
  }, [categories, bestSellers, discountPercent]);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return <section className="hero-carousel hero-carousel-loading" />;
  }

  const activeIndex = index % slides.length;

  function go(delta) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  return (
    <section className="hero-carousel">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`hero-slide ${i === activeIndex ? "active" : ""}`}
          style={{ backgroundImage: `url(${s.image})` }}
        />
      ))}
      <div className="hero-scrim" />

      <button className="hero-arrow hero-arrow-left" onClick={() => go(-1)}>
        Prev
      </button>
      <button className="hero-arrow hero-arrow-right" onClick={() => go(1)}>
        Next
      </button>

      <div className="hero-carousel-inner">
        <div className="hero-ribbon">{slides[activeIndex].eyebrow}</div>
        <h1 key={slides[activeIndex].id} className="hero-headline">
          {slides[activeIndex].title}
        </h1>
        <p className="hero-tagline">{slides[activeIndex].tagline}</p>
        <div className="hero-actions">
          <Link to={slides[activeIndex].ctaTo} className="btn btn-gold btn-lg">
            {slides[activeIndex].ctaLabel}
          </Link>
          <Link to="/about" className="btn btn-outline btn-lg">
            Our Story
          </Link>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={i === activeIndex ? "active" : ""}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <svg className="wave-divider" viewBox="0 0 1200 90" preserveAspectRatio="none">
        <path d="M0,40 C200,90 400,0 600,30 C800,60 1000,10 1200,45 L1200,90 L0,90 Z" fill="var(--cream)" />
      </svg>
    </section>
  );
}
