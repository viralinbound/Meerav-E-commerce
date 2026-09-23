import { ArrowRight } from 'lucide-react';

interface GiftShowcaseProps {
  onShopGifts: () => void;
}

export function GiftShowcase({ onShopGifts }: GiftShowcaseProps) {
  const collections = [
    {
      title: 'Gift Boxes',
      description: 'Choose from our stunning range of curated gift boxes and find the right gift to enhance any occasion.',
      image: 'https://images.pexels.com/photos/28769884/pexels-photo-28769884.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    },
    {
      title: 'Handmade Gourmet',
      description: 'In each piece you will discover an exquisitely smooth velvety taste of our individually crafted gourmet snacks.',
      image: 'https://images.pexels.com/photos/8887061/pexels-photo-8887061.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    },
    {
      title: 'Festive Specials',
      description: 'Discover the exquisitely smooth velvety taste of our limited-edition festive collections, made only during celebrations.',
      image: 'https://images.pexels.com/photos/8887011/pexels-photo-8887011.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    },
  ];

  return (
    <section className="py-8 lg:py-12 bg-gradient-to-b from-cream-100 to-cream-50">
      <div className="container-max section-padding">
        <div className="text-center mb-6 lg:mb-10">
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
              onClick={onShopGifts}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-md card-hover flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">{item.title}</h3>
                <p className="text-sm text-charcoal-500 leading-relaxed mb-4">{item.description}</p>
                <div className="mt-auto flex items-center gap-2 text-maroon-700 font-medium text-sm group-hover:gap-3 transition-all">
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
