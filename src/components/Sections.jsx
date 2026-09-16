import { Star, Quote, Play, Instagram, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";

const INSTAGRAM_IMAGES = [
  "/images/products/meerav_1.jpg",
  "/images/products/meerav_2.jpg",
  "/images/products/meerav_3.jpg",
  "/images/products/meerav_4.jpg",
  "/images/products/meerav_5.jpg",
  "/images/products/meerav_6.jpg",
];

export function Testimonials() {
  const { testimonials } = useCatalog();
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-cream-50 to-cream-100">
      <div className="container-max section-padding">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-maroon-100 text-maroon-700 text-sm font-medium rounded-full mb-4">
            Customer Love
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Loved Across India &amp; Beyond
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Verified foodies share their love for authentic Bikaneri crunch
          </p>
        </div>

        <div id="home-testimonials-grid" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-md card-hover relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-cream-300" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < t.rating ? "fill-saffron-400 text-saffron-400" : "text-cream-300"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed mb-4 line-clamp-4">"{t.reviewText}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-cream-200">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-sm text-charcoal-800">{t.name}</h4>
                  <p className="text-xs text-charcoal-400">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KitchenStories() {
  const { broadcastStories } = useCatalog();
  if (broadcastStories.length === 0) return null;

  return (
    <section className="py-20 bg-cream-50">
      <div className="container-max section-padding">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-saffron-100 text-saffron-700 text-sm font-medium rounded-full mb-4">
            Kitchen Stories
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Watch Authentic Kitchen Stories
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Tap any story or video card to watch preparation reels &amp; shop directly from the kitchen
          </p>
        </div>

        <div id="home-kitchenstories-grid" className="grid md:grid-cols-3 gap-6">
          {broadcastStories.map((story) => (
            <Link
              to={`/product/${story.productId}`}
              key={story.id}
              className="group cursor-pointer rounded-2xl overflow-hidden shadow-md card-hover relative block"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={story.posterUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/30 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-cream-50/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-saffron-500 group-hover:scale-110 transition-all duration-300">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                </div>

                <div className="absolute top-3 right-3 px-2 py-1 bg-charcoal-900/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  {story.tag}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-serif text-lg font-bold text-cream-50 mb-1 leading-tight">{story.title}</h3>
                  <p className="text-sm text-cream-200">
                    ₹{story.price} <span className="line-through text-cream-400">₹{story.originalPrice}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstagramFeed() {
  return (
    <section className="py-20 bg-gradient-to-b from-cream-100 to-cream-50">
      <div className="container-max section-padding">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-maroon-100 text-maroon-700 text-sm font-medium rounded-full mb-4">
            @meerav.bikaner
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Follow Us on Instagram
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Behind-the-scenes from our kitchen, fresh batch alerts, and customer love
          </p>
        </div>

        <div id="home-instagram-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {INSTAGRAM_IMAGES.map((img, idx) => (
            <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
              <img
                src={img}
                alt={`Instagram post ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-maroon-900/0 group-hover:bg-maroon-900/40 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="w-6 h-6 text-cream-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="#" className="inline-flex items-center gap-2 text-maroon-700 font-medium text-sm hover:underline">
            <Instagram className="w-5 h-5" />
            Follow @meerav.bikaner
          </a>
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const { faqs } = useCatalog();
  const [openIndex, setOpenIndex] = useState(0);
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-20 bg-cream-50">
      <div className="container-max section-padding">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-saffron-100 text-saffron-700 text-sm font-medium rounded-full mb-4">
            Questions &amp; Answers
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Everything you need to know about our fresh snacks, shipping &amp; purity
          </p>
        </div>

        <div id="home-faq-list" className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-cream-200">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-100 transition-colors"
              >
                <h3 className="font-semibold text-charcoal-800 text-sm md:text-base pr-4">{faq.question}</h3>
                <div className="shrink-0 w-8 h-8 bg-cream-100 rounded-full flex items-center justify-center">
                  {openIndex === idx ? (
                    <Minus className="w-4 h-4 text-maroon-700" />
                  ) : (
                    <Plus className="w-4 h-4 text-maroon-700" />
                  )}
                </div>
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 animate-fade-in">
                  <p className="text-sm text-charcoal-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
