import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { heroBanners } from "../data/realPhotos";

const MILESTONES = [
  {
    year: "1983",
    hindi: "शुरुआत",
    title: "A Kitchen in the Walled City",
    text: "Meera Devi begins hand-rolling papad and roasting bhujia in a small home kitchen in Bikaner, using recipes passed down from her own mother.",
  },
  {
    year: "1996",
    hindi: "विस्तार",
    title: "The First Storefront",
    text: "Neighbours become customers. Meerav opens its first shopfront in Rani Bazar, still using the same stone-ground spice blends and pure groundnut oil.",
  },
  {
    year: "2008",
    hindi: "आधुनिकरण",
    title: "A Modern Kitchen, the Same Hands",
    text: "We move to a larger production kitchen with nitrogen-flushed packaging and stricter quality checks — but every batch is still tasted and approved by hand.",
  },
  {
    year: "2026",
    hindi: "आज",
    title: "Pan-India, Still Bikaneri at Heart",
    text: "Meerav now ships fresh across India, with 75+ delicacies and over 50,000 happy foodies — never compromising on pure oil, real ingredients, or Bikaneri tradition.",
  },
];

export default function About() {
  const { trustBadges } = useCatalog();

  return (
    <>
      <section className="about-hero" style={{ backgroundImage: `url(${heroBanners[0]})` }}>
        <div className="about-hero-scrim" />
        <div className="container about-hero-inner">
          <span className="hindi-accent hindi-accent-light">बीकानेर के दिल से हमारी कहानी</span>
          <h1>Our Story</h1>
          <p>Four decades of honest Bikaneri snacking, one family recipe at a time.</p>
        </div>
      </section>

      <div className="container section">
        <div className="story-grid about-founder-grid">
          <div className="story-visual">
            <img src="/images/products/meerav_1.jpg" alt="Meerav heritage" />
          </div>
          <div className="story-text">
            <span className="hindi-accent">राजस्थान की जड़ों से</span>
            <div className="section-eyebrow">Rooted in Rajasthan</div>
            <h2>From a Bikaner Kitchen to Your Home</h2>
            <p>
              Meerav was born in the walled lanes of Bikaner, where the art of
              namkeen-making has been passed down through generations. Our
              founders grew up watching their grandmothers hand-roll papad and
              perfect the spice blends that still define our snacks today.
            </p>
            <p>
              What started as small batches shared with neighbours during
              festivals slowly grew into Meerav — a brand dedicated to
              bringing authentic Rajasthani flavours to every home in India,
              without ever cutting corners on quality. Over 40 years later, we
              still prepare every batch fresh, in pure oil, with zero palm oil
              and zero chemical preservatives.
            </p>
            <blockquote className="about-pull-quote">
              "अगर स्वाद असली नहीं, तो नाम मीरव नहीं।"
              <span>— If the taste isn't real, it isn't Meerav.</span>
            </blockquote>
          </div>
        </div>
      </div>

      <div className="about-stats-band">
        <div className="container">
          <div className="stat-row about-stat-row">
            <div className="stat"><strong>40+</strong><span>Years Heritage</span></div>
            <div className="stat"><strong>75+</strong><span>Delicacies</span></div>
            <div className="stat"><strong>50K+</strong><span>Happy Foodies</span></div>
            <div className="stat"><strong>100%</strong><span>Pure Oil</span></div>
          </div>
        </div>
      </div>


      <div className="container section">
        <div className="section-head">
          <span className="hindi-accent" style={{ textAlign: "center" }}>हमारी यात्रा</span>
          <div className="section-eyebrow">Our Journey</div>
          <h2>Four Decades, One Recipe Box</h2>
        </div>
        <div className="timeline">
          {MILESTONES.map((m, i) => (
            <div className="timeline-item" key={m.year}>
              <div className="timeline-marker" />
              <div className="timeline-content">
                <span className="timeline-year">{m.year}</span>
                <span className="hindi-accent">{m.hindi}</span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section story-section">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">Our Promise</div>
            <h2>Why Choose Meerav</h2>
          </div>
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
      </div>


      <div className="container section">
        <div className="section-head">
          <div className="section-eyebrow">Meet the Team</div>
          <h2>The People Behind Meerav</h2>
        </div>
        <div className="testimonial-grid">
          {[
            { name: "Meera Devi", role: "Founder & Head of Recipes", initials: "MD" },
            { name: "Vikram Rathore", role: "Operations & Sourcing", initials: "VR" },
            { name: "Anjali Bhati", role: "Quality & Packaging", initials: "AB" },
          ].map((m) => (
            <div className="testimonial-card" key={m.name}>
              <div className="team-initials">{m.initials}</div>
              <div className="testimonial-name">{m.name}</div>
              <p style={{ fontStyle: "normal", marginTop: 4 }}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="cta-band">
        <span className="hindi-accent hindi-accent-light">आइए स्वाद लें</span>
        <h2>Taste the Meerav Story Yourself</h2>
        <p>Every pack we ship carries four decades of Bikaneri tradition.</p>
        <Link to="/shop" className="btn btn-gold">
          Shop Our Delicacies
        </Link>
      </section>
    </>
  );
}
