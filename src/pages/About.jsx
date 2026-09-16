import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { heroBanners } from "../data/realPhotos";
import { KitchenStories } from "../components/Sections";

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

const TEAM = [
  { name: "Meera Devi", role: "Founder & Head of Recipes", initials: "MD" },
  { name: "Vikram Rathore", role: "Operations & Sourcing", initials: "VR" },
  { name: "Anjali Bhati", role: "Quality & Packaging", initials: "AB" },
];

export default function About() {
  const { trustBadges } = useCatalog();

  return (
    <>
      {/* Hero */}
      <section
        className="relative h-[60vh] min-h-[420px] flex items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanners[0]})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-900/90 via-maroon-800/70 to-transparent" />
        <div className="relative container-max section-padding">
          <span className="inline-block px-4 py-1.5 bg-saffron-500/90 text-white text-sm font-medium rounded-full mb-6">
            बीकानेर के दिल से हमारी कहानी
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-cream-50 mb-4 text-shadow-lg">
            Our Story
          </h1>
          <p className="text-lg text-cream-100 max-w-xl">
            Four decades of honest Bikaneri snacking, one family recipe at a time.
          </p>
        </div>
      </section>

      {/* Founder story */}
      <section className="py-20 bg-cream-50">
        <div className="container-max section-padding grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src="/images/products/meerav_1.jpg" alt="Meerav heritage" className="w-full h-[460px] object-cover" />
          </div>
          <div>
            <span className="inline-block px-4 py-1.5 bg-maroon-100 text-maroon-700 text-sm font-medium rounded-full mb-4">
              Rooted in Rajasthan
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-charcoal-900 mb-6 leading-tight">
              From a Bikaner Kitchen to Your Home
            </h2>
            <p className="text-charcoal-600 leading-relaxed mb-4">
              Meerav was born in the walled lanes of Bikaner, where the art of namkeen-making has
              been passed down through generations. Our founders grew up watching their
              grandmothers hand-roll papad and perfect the spice blends that still define our
              snacks today.
            </p>
            <p className="text-charcoal-500 leading-relaxed mb-8">
              What started as small batches shared with neighbours during festivals slowly grew
              into Meerav — a brand dedicated to bringing authentic Rajasthani flavours to every
              home in India, without ever cutting corners on quality. Over 40 years later, we
              still prepare every batch fresh, in pure oil, with zero palm oil and zero chemical
              preservatives.
            </p>
            <blockquote className="border-l-4 border-saffron-500 pl-5 py-1 text-charcoal-700 italic">
              "अगर स्वाद असली नहीं, तो नाम मीरव नहीं।"
              <span className="block not-italic text-sm text-charcoal-400 mt-1">
                — If the taste isn't real, it isn't Meerav.
              </span>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-royal-gradient py-12">
        <div className="container-max section-padding grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["40+", "Years Heritage"],
            ["75+", "Delicacies"],
            ["50K+", "Happy Foodies"],
            ["100%", "Pure Oil"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-serif text-3xl md:text-4xl font-bold text-cream-50">{value}</p>
              <p className="text-cream-200 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-saffron-100 text-saffron-700 text-sm font-medium rounded-full mb-4">
              Our Journey
            </span>
            <h2 className="font-serif text-4xl font-bold text-charcoal-900">Four Decades, One Recipe Box</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-10 relative before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-cream-300">
            {MILESTONES.map((m) => (
              <div key={m.year} className="relative pl-12">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-maroon-700 flex items-center justify-center ring-4 ring-cream-50">
                  <span className="w-2.5 h-2.5 rounded-full bg-saffron-400" />
                </div>
                <span className="inline-block px-3 py-1 bg-maroon-700 text-cream-50 text-xs font-bold rounded-full mb-2">
                  {m.year}
                </span>
                <p className="text-saffron-600 text-sm font-medium mb-1">{m.hindi}</p>
                <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">{m.title}</h3>
                <p className="text-charcoal-500 leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges / Our Promise */}
      {trustBadges.length > 0 && (
        <section className="py-20 bg-cream-50">
          <div className="container-max section-padding">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-maroon-100 text-maroon-700 text-sm font-medium rounded-full mb-4">
                Our Promise
              </span>
              <h2 className="font-serif text-4xl font-bold text-charcoal-900">Why Choose Meerav</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustBadges.map((f) => (
                <div key={f.id} className="bg-white rounded-2xl p-6 text-center shadow-sm card-hover">
                  <img src={f.image} alt="" className="w-14 h-14 mx-auto mb-4 object-contain" />
                  <h4 className="font-semibold text-charcoal-800 mb-1">{f.title}</h4>
                  <p className="text-sm text-charcoal-500">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Kitchen Stories */}
      <KitchenStories />

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-saffron-100 text-saffron-700 text-sm font-medium rounded-full mb-4">
              Meet the Team
            </span>
            <h2 className="font-serif text-4xl font-bold text-charcoal-900">The People Behind Meerav</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {TEAM.map((m) => (
              <div key={m.name} className="bg-cream-50 rounded-2xl p-6 text-center shadow-sm card-hover">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-royal-gradient flex items-center justify-center">
                  <span className="font-serif text-cream-50 font-bold">{m.initials}</span>
                </div>
                <h4 className="font-semibold text-charcoal-800">{m.name}</h4>
                <p className="text-sm text-charcoal-500 mt-1">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-maroon-800 text-center">
        <div className="container-max section-padding">
          <span className="inline-block px-4 py-1.5 bg-saffron-500/30 backdrop-blur-sm text-saffron-200 text-sm font-medium rounded-full mb-4 border border-saffron-400/30">
            आइए स्वाद लें
          </span>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-cream-50 mb-4">
            Taste the Meerav Story Yourself
          </h2>
          <p className="text-cream-200 mb-8">Every pack we ship carries four decades of Bikaneri tradition.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-saffron-500 text-white font-semibold rounded-full hover:bg-saffron-600 transition-all duration-300 hover:shadow-2xl active:scale-95"
          >
            Shop Our Delicacies
          </Link>
        </div>
      </section>
    </>
  );
}
