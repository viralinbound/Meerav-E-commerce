import { useNavigate } from "react-router-dom";
import { Gift, Sparkles, Crown, ArrowRight } from "lucide-react";
import { useCatalog } from "../context/CatalogContext";

const collections = [
  {
    icon: Gift,
    title: "Gift Boxes",
    description: "Choose from our stunning range of curated gift boxes and find the right gift to enhance any occasion.",
    image: "/images/products/meerav_6.jpg",
    color: "from-maroon-600 to-maroon-800",
    category: "gifts",
  },
  {
    icon: Crown,
    title: "Handmade Gourmet",
    description: "In each piece you will discover an exquisitely smooth velvety taste of our individually crafted gourmet snacks.",
    image: "/images/products/meerav_7.jpg",
    color: "from-saffron-500 to-saffron-700",
    category: "sweets",
  },
  {
    icon: Sparkles,
    title: "Festive Specials",
    description: "Discover the exquisitely smooth velvety taste of our limited-edition festive collections, made only during celebrations.",
    image: "/images/products/meerav_2.jpg",
    color: "from-mustard-500 to-mustard-700",
    category: "namkeen",
  },
];

export default function GiftShowcase() {
  const navigate = useNavigate();
  const { categories } = useCatalog();

  function goToCollection(preferredCategory) {
    const exists = categories.some((c) => c.id === preferredCategory);
    navigate(exists ? `/category/${preferredCategory}` : "/shop");
  }

  return (
    <section className="py-20 bg-gradient-to-b from-cream-100 to-cream-50">
      <div className="container-max section-padding">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-maroon-100 text-maroon-700 text-sm font-medium rounded-full mb-4">
            Desi Nuske
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
            Curated Collections
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Thoughtfully crafted assortments for every celebration, mood, and craving
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {collections.map((item) => (
            <div
              key={item.title}
              onClick={() => goToCollection(item.category)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-md card-hover"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-60 group-hover:opacity-40 transition-opacity duration-500`} />
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-cream-50/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-maroon-700" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">{item.title}</h3>
                <p className="text-sm text-charcoal-500 leading-relaxed mb-4">{item.description}</p>
                <div className="flex items-center gap-2 text-maroon-700 font-medium text-sm group-hover:gap-3 transition-all">
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
