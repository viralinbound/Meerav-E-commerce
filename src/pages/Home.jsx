import { Link } from "react-router-dom";
import { useState } from "react";
import Hero from "../components/Hero";
import Spotlight from "../components/Spotlight";
import CategoryShowcase from "../components/CategoryShowcase";
import FlavorPoll from "../components/FlavorPoll";
import InstagramGallery from "../components/InstagramGallery";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import Toast from "../components/Toast";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";
import JaaliDivider from "../components/JaaliDivider";

export default function Home() {
  const { addItem } = useCart();
  const { categories, bestSellers, testimonials, faqs, trustBadges, broadcastStories, loading, error } = useCatalog();
  const [toast, setToast] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  function handleAdd(product, variant, qty = 1) {
    addItem(product, variant, qty);
    setToast(`${product.name} added to cart`);
  }

  if (loading) {
    return <div className="container section" style={{ textAlign: "center" }}>Loading fresh batches from the kitchen…</div>;
  }

  if (error) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        Couldn't load live data from Supabase: {error}
      </div>
    );
  }

  const shopCategories = categories.filter((c) => c.id !== "all");
  const best = bestSellers(8);
  const spotlightProduct = best[0];

  return (
    <>
      <Hero />

      <Spotlight product={spotlightProduct} />

      <section className="tagline-strip">
        <p>
          <span className="tagline-hindi">वही स्वाद, वही अपनापन</span>
          <br />
          Preserving Rajasthani Taste Through Honest Snacking.
          <br />
          <span>For Over 40 Years.</span>
        </p>
      </section>

      {shopCategories.map((c, i) => (
        <CategoryShowcase key={c.id} category={c} index={i} onAdd={handleAdd} />
      ))}

      <JaaliDivider tone="light" />

      <section className="section">
        <div className="container">
          <div className="features-row">
            {trustBadges.map((f) => (
              <div className="feature-card" key={f.id}>
                <img src={f.image} alt="" className="feature-img" />
                <h4>{f.title}</h4>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section story-section">
        <div className="container story-grid">
          <div className="story-visual">
            <img src="/images/products/meerav_1.jpg" alt="Heritage" />
          </div>
          <div className="story-text">
            <div className="section-eyebrow">Preserving Rajasthani Taste, Over 40 Years</div>
            <h2>Heritage of Bikaner in Every Crunch</h2>
            <p>
              Born in the royal desert city of Bikaner, our snacks carry
              forward generations of secret family spice formulations,
              handcrafted by master halwais.
            </p>
            <p>
              We strictly refuse shortcuts: zero palm oil, zero chemical
              preservatives, only pure cold-pressed groundnut oil, pristine
              desert rock salt, and authentic moth flour.
            </p>
            <div className="stat-row">
              <div className="stat"><strong>40+</strong><span>Years Heritage</span></div>
              <div className="stat"><strong>75+</strong><span>Delicacies</span></div>
              <div className="stat"><strong>50K+</strong><span>Happy Foodies</span></div>
              <div className="stat"><strong>100%</strong><span>Pure Oil</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="hindi-accent" style={{ textAlign: "center" }}>सबसे पसंदीदा</span>
            <div className="section-eyebrow">Most Loved</div>
            <h2>Best Sellers</h2>
            <p>The snacks our customers reorder the most.</p>
          </div>
          <div className="product-grid">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link to="/shop" className="btn btn-gold">
              Explore All Products
            </Link>
          </div>
        </div>
      </section>

      <FlavorPoll />

      <section className="section story-section">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">Straight From the Kitchen</div>
            <h2>Kitchen Stories</h2>
            <p>Tap any card to see the snack it comes from.</p>
          </div>
          <div className="story-strip">
            {broadcastStories.map((s) => (
              <Link to={`/product/${s.productId}`} key={s.id} className="story-card">
                <img src={s.posterUrl} alt={s.title} />
                <span className="story-tag">{s.tag}</span>
                <div className="story-card-body">
                  <strong>{s.title}</strong>
                  <span>₹{s.price} <span className="strike">₹{s.originalPrice}</span></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">Verified Customer Feedback</div>
            <h2>Loved Across India &amp; Beyond</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card" key={t.id}>
                <img src={t.avatar} alt={t.name} className="avatar" />
                <StarRating rating={t.rating} />
                <p>"{t.reviewText}"</p>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-city">{t.city}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <JaaliDivider tone="light" />

      <InstagramGallery />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">Got Questions?</div>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, idx) => (
              <div className={`faq-item ${openFaq === idx ? "open" : ""}`} key={f.id}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  {f.question}
                  <span>{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && <div className="faq-answer">{f.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band torn-edge-top">
        <h2>Join the Meerav Family</h2>
        <p>Get 10% off your first order plus early access to festive hampers and new flavours.</p>
        <form
          className="newsletter-form"
          onSubmit={(e) => {
            e.preventDefault();
            setToast("Thanks for subscribing!");
            e.target.reset();
          }}
        >
          <input type="email" placeholder="Enter your email" required />
          <button type="submit" className="btn btn-gold">
            Subscribe
          </button>
        </form>
      </section>

      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </>
  );
}
