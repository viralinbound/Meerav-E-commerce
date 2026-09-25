export interface ProductVariant {
  weight: string;
  price: number;
  originalPrice?: number;
  stock?: number;
}

// A product is out of stock only when EVERY variant has been given a real
// stock number and it's all used up -- a product where no variant tracks
// stock (the default) is never considered out of stock, and a product with
// even one variant still in stock (or untracked) stays purchasable.
export function isProductOutOfStock(product: Pick<Product, 'variants'>): boolean {
  const variants = product.variants?.length ? product.variants : [];
  if (variants.length === 0) return false;
  return variants.every((v) => v.stock != null && v.stock <= 0);
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  weight: string;
  stock?: number;
  variants: ProductVariant[];
  image: string;
  photos: string[];
  videos: string[];
  description: string;
  ingredients: string;
  nutrition: { protein: string; carbs: string; fat: string; calories: string };
  spiceLevel: 'mild' | 'medium' | 'hot';
  isBestseller?: boolean;
  isNew?: boolean;
  rating: number;
  reviews: number;
  unitsSold?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string | null;
}

export const categories: Category[] = [
  { id: 'bhujia', name: 'Bhujia', description: 'Authentic Bikaneri bhujia fried in pure groundnut oil', icon: 'Flame' },
  { id: 'namkeen', name: 'Namkeen', description: 'Traditional savoury blends and mixtures', icon: 'Cookie' },
  { id: 'sweets', name: 'Sweets', description: 'Handcrafted Indian mithai made fresh daily', icon: 'Candy' },
  { id: 'papad', name: 'Papad', description: 'Crispy sun-dried papads in classic flavours', icon: 'Disc' },
  { id: 'diet', name: 'Diet Snacks', description: 'Roasted, low-oil savouries for guilt-free snacking', icon: 'Leaf' },
  { id: 'gifts', name: 'Gift Boxes', description: 'Curated assortments for festivals and celebrations', icon: 'Gift' },
];

export const products: Product[] = [
  {
    id: 'p001',
    name: 'Meerav Authentic Aloo Bhujia',
    category: 'bhujia',
    price: 180,
    weight: '500g',
    image: '/images/products/meerav_3.jpg',
    description: 'The crown jewel of Bikaner — crispy, spiced potato bhujia fried in small batches every morning using pure groundnut oil and desert rock salt. A recipe unchanged for four decades.',
    ingredients: 'Potato, moth flour, groundnut oil, salt, red chilli, black pepper, clove, cardamom, asafoetida',
    nutrition: { protein: '8g', carbs: '42g', fat: '18g', calories: '380' },
    spiceLevel: 'medium',
    isBestseller: true,
    rating: 4.8,
    reviews: 1240,
  },
  {
    id: 'p002',
    name: 'Royal Bikaneri Bhujia',
    category: 'bhujia',
    price: 320,
    weight: '1kg',
    image: '/images/products/meerav_3.jpg',
    description: 'Our signature bhujia made from moth flour, groundnut oil, and a secret blend of 14 spices. Fried fresh each dawn and packed the same day for that unmistakable Bikaneri crunch.',
    ingredients: 'Moth flour, groundnut oil, salt, red chilli, coriander, cumin, clove, cardamom, asafoetida, turmeric',
    nutrition: { protein: '10g', carbs: '38g', fat: '20g', calories: '400' },
    spiceLevel: 'medium',
    isBestseller: true,
    rating: 4.9,
    reviews: 2156,
  },
  {
    id: 'p003',
    name: 'Masala Moong Dal',
    category: 'namkeen',
    price: 150,
    weight: '400g',
    image: '/images/products/meerav_5.jpg',
    description: 'Split yellow moong dal roasted to golden perfection and tossed with salted spices. Light, crunchy, and deeply satisfying — the ideal evening snack with chai.',
    ingredients: 'Moong dal, groundnut oil, salt, black salt, chilli powder, asafoetida',
    nutrition: { protein: '22g', carbs: '48g', fat: '12g', calories: '360' },
    spiceLevel: 'mild',
    isBestseller: true,
    rating: 4.7,
    reviews: 892,
  },
  {
    id: 'p004',
    name: 'Crunchy Masala Peanuts',
    category: 'namkeen',
    price: 130,
    weight: '300g',
    image: '/images/products/meerav_8.jpg',
    description: 'Whole peanuts coated in a spiced gram flour batter and fried until shatteringly crisp. Each handful delivers a burst of crunch and flavour.',
    ingredients: 'Peanuts, gram flour, groundnut oil, salt, red chilli, garlic powder, asafoetida',
    nutrition: { protein: '18g', carbs: '30g', fat: '28g', calories: '450' },
    spiceLevel: 'hot',
    isBestseller: true,
    rating: 4.6,
    reviews: 654,
  },
  {
    id: 'p005',
    name: 'Gulab Jamun (1.25kg Tin)',
    category: 'sweets',
    price: 450,
    weight: '1.25kg',
    image: 'https://images.pexels.com/photos/11887844/pexels-photo-11887844.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Soft, golden dumplings soaked in fragrant rose-cardamom syrup. Made with khoya and fried in pure ghee. Packed in a premium tin for gifting.',
    ingredients: 'Khoya, maida, ghee, sugar, rose water, cardamom, saffron',
    nutrition: { protein: '6g', carbs: '52g', fat: '22g', calories: '420' },
    spiceLevel: 'mild',
    isBestseller: true,
    rating: 4.9,
    reviews: 1567,
  },
  {
    id: 'p006',
    name: 'Rasgulla (1.25kg Tin)',
    category: 'sweets',
    price: 420,
    weight: '1.25kg',
    image: 'https://images.pexels.com/photos/8887011/pexels-photo-8887011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Spongy cottage cheese balls in light sugar syrup. Pillowy soft, delicately sweet, and made fresh from chenna every single morning.',
    ingredients: 'Chenna, sugar, cardamom, water',
    nutrition: { protein: '8g', carbs: '48g', fat: '10g', calories: '320' },
    spiceLevel: 'mild',
    isBestseller: true,
    rating: 4.8,
    reviews: 1103,
  },
  {
    id: 'p007',
    name: 'Baat Cheet Papad',
    category: 'papad',
    price: 200,
    weight: '1kg',
    image: '/images/products/meerav_1.jpg',
    description: 'Sun-dried urad dal papad seasoned with black pepper, cumin, and asafoetida. Roast or fry for the perfect crispy accompaniment to any meal.',
    ingredients: 'Urad dal flour, salt, black pepper, cumin, asafoetida, groundnut oil',
    nutrition: { protein: '14g', carbs: '52g', fat: '6g', calories: '320' },
    spiceLevel: 'medium',
    rating: 4.5,
    reviews: 432,
  },
  {
    id: 'p008',
    name: 'Achari Masala Matthi',
    category: 'namkeen',
    price: 160,
    weight: '400g',
    image: '/images/products/meerav_6.jpg',
    description: 'Flaky, savoury biscuits infused with pickle-style spices. The tang of mango pickle and the crunch of fried mathri in every bite.',
    ingredients: 'Maida, groundnut oil, salt, mango pickle masala, fennel, nigella seeds, turmeric',
    nutrition: { protein: '6g', carbs: '48g', fat: '20g', calories: '380' },
    spiceLevel: 'medium',
    isNew: true,
    rating: 4.6,
    reviews: 287,
  },
  {
    id: 'p009',
    name: 'Roasted Diet Chana',
    category: 'diet',
    price: 120,
    weight: '350g',
    image: 'https://images.pexels.com/photos/37060182/pexels-photo-37060182.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Whole roasted chickpeas seasoned with chaat masala. High protein, low oil, zero guilt. Roasted, never fried — the perfect evening companion.',
    ingredients: 'Chickpeas, salt, chaat masala, black salt, amchur, cumin',
    nutrition: { protein: '20g', carbs: '54g', fat: '6g', calories: '340' },
    spiceLevel: 'mild',
    isNew: true,
    rating: 4.7,
    reviews: 521,
  },
  {
    id: 'p010',
    name: 'Soya Chips',
    category: 'namkeen',
    price: 90,
    weight: '200g',
    image: '/images/products/meerav_4.jpg',
    description: 'Crispy soya flour chips lightly seasoned with salt and spices. A protein-rich alternative to potato chips that doesn\'t compromise on crunch.',
    ingredients: 'Soya flour, groundnut oil, salt, red chilli, asafoetida',
    nutrition: { protein: '16g', carbs: '40g', fat: '14g', calories: '350' },
    spiceLevel: 'mild',
    rating: 4.4,
    reviews: 198,
  },
  {
    id: 'p011',
    name: 'Crispstix Soup Sticks',
    category: 'namkeen',
    price: 110,
    weight: '250g',
    image: '/images/products/meerav_7.jpg',
    description: 'Slender, crispy sticks perfect for dipping in soup or chai. Lightly salted with a satisfying snap that keeps you reaching for more.',
    ingredients: 'Wheat flour, groundnut oil, salt, cumin, asafoetida',
    nutrition: { protein: '8g', carbs: '58g', fat: '12g', calories: '360' },
    spiceLevel: 'mild',
    rating: 4.3,
    reviews: 156,
  },
  {
    id: 'p012',
    name: 'Pretzo Premium',
    category: 'namkeen',
    price: 130,
    weight: '300g',
    image: '/images/products/meerav_7.jpg',
    description: 'Indian-style pretzel knots with a zesty chaat twist. Baked to a golden crunch and dusted with our signature spice blend.',
    ingredients: 'Wheat flour, groundnut oil, salt, chaat masala, black salt, amchur',
    nutrition: { protein: '8g', carbs: '56g', fat: '10g', calories: '340' },
    spiceLevel: 'medium',
    isNew: true,
    rating: 4.5,
    reviews: 203,
  },
  {
    id: 'p013',
    name: 'Royal Treat Gift Box',
    category: 'gifts',
    price: 899,
    weight: '1.5kg assorted',
    image: 'https://images.pexels.com/photos/28769884/pexels-photo-28769884.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'A premium assortment of our finest bhujia, namkeen, and sweets in an elegant gift box. Perfect for Diwali, weddings, and corporate gifting.',
    ingredients: 'Assorted bhujia, namkeen, gulab jamun, rasgulla — see individual product labels',
    nutrition: { protein: 'varies', carbs: 'varies', fat: 'varies', calories: 'varies' },
    spiceLevel: 'mild',
    isBestseller: true,
    rating: 4.9,
    reviews: 789,
  },
  {
    id: 'p014',
    name: 'Festive Mithai Box',
    category: 'gifts',
    price: 1299,
    weight: '2kg assorted',
    image: 'https://images.pexels.com/photos/8887061/pexels-photo-8887061.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Our grandest gift box featuring gulab jamun, rasgulla, sohan papdi, and besan laddoo arranged on a brass-style platter. Wrapped in heritage packaging.',
    ingredients: 'Gulab jamun, rasgulla, sohan papdi, besan laddoo — see individual product labels',
    nutrition: { protein: 'varies', carbs: 'varies', fat: 'varies', calories: 'varies' },
    spiceLevel: 'mild',
    rating: 4.8,
    reviews: 456,
  },
  {
    id: 'p015',
    name: 'Crusty Nuts',
    category: 'namkeen',
    price: 180,
    weight: '200g',
    image: '/images/products/meerav_2.jpg',
    description: 'A premium mix of roasted cashews, almonds, and peanuts coated in a fiery spice blend. The kind of snack that disappears at every party.',
    ingredients: 'Cashews, almonds, peanuts, groundnut oil, salt, red chilli, garlic powder, curry leaves',
    nutrition: { protein: '16g', carbs: '24g', fat: '32g', calories: '460' },
    spiceLevel: 'hot',
    isBestseller: true,
    rating: 4.7,
    reviews: 678,
  },
  {
    id: 'p016',
    name: 'Coated Peanuts Korean Cheese',
    category: 'namkeen',
    price: 150,
    weight: '250g',
    image: '/images/products/meerav_8.jpg',
    description: 'A bold fusion creation — peanuts coated in a crunchy Korean cheese-flavoured shell. Sweet, salty, umami, and utterly addictive.',
    ingredients: 'Peanuts, wheat flour, groundnut oil, cheese powder, salt, sugar, chilli powder, garlic',
    nutrition: { protein: '14g', carbs: '36g', fat: '22g', calories: '400' },
    spiceLevel: 'medium',
    isNew: true,
    rating: 4.6,
    reviews: 345,
  },
];

export const testimonials = [
  {
    id: 't1',
    name: 'Ananya Sharma',
    city: 'Mumbai',
    rating: 5,
    text: 'The Aloo Bhujia tastes exactly like what my grandmother used to bring from Bikaner. Fresh, crispy, and you can tell it\'s made in pure groundnut oil. Never going back to store brands.',
    avatar: 'https://images.pexels.com/photos/4307903/pexels-photo-4307903.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  },
  {
    id: 't2',
    name: 'Rajesh Kumar',
    city: 'Delhi',
    rating: 5,
    text: 'Ordered the Royal Treat Gift Box for Diwali and it was a hit. The packaging is gorgeous and the quality of snacks is unmatched. My family has been ordering from Meerav for over a year now.',
    avatar: 'https://images.pexels.com/photos/4307912/pexels-photo-4307912.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  },
  {
    id: 't3',
    name: 'Priya Iyer',
    city: 'Bengaluru',
    rating: 5,
    text: 'The gulab jamun tin arrived in perfect condition — soft, warm-coloured, and soaked in just the right amount of syrup. Tastes like it was made the same day. Free delivery was the cherry on top.',
    avatar: 'https://images.pexels.com/photos/5920737/pexels-photo-5920737.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  },
  {
    id: 't4',
    name: 'Vikram Singh',
    city: 'Jaipur',
    rating: 4,
    text: 'Being from Rajasthan, I\'m picky about my bhujia. Meerav passes the test — the spice blend is authentic and the crunch is real. The diet chana is also excellent for evening snacking.',
    avatar: 'https://images.pexels.com/photos/21575653/pexels-photo-21575653.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  },
];

export const faqs = [
  {
    question: 'Are your snacks fried in pure groundnut oil?',
    answer: 'Yes, every single batch of Meerav namkeen and bhujia is fried in pure, filtered groundnut oil. We never use palm oil, vegetable oil, or any cheap substitutes. This is the traditional Bikaneri method and it\'s what gives our snacks their authentic taste and aroma.',
  },
  {
    question: 'How fresh are the products when they arrive?',
    answer: 'All our bhujia and namkeen are fried in small batches every morning and packed the same day. Sweets are made fresh daily. Products are shipped within 24-48 hours of being made, so you receive snacks that are at peak freshness.',
  },
  {
    question: 'What are the delivery charges?',
    answer: 'We offer free delivery across India on all orders, with no minimum order value.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 3-5 business days for metro cities and 5-7 business days for other locations. You can track your order in real time using the delivery tracker on our website once your order is dispatched.',
  },
  {
    question: 'Do you use any preservatives or artificial colours?',
    answer: 'No. We use zero preservatives, zero artificial colours, and zero artificial flavours. All our products are made with natural ingredients and traditional spice blends. The shelf life comes from the purity of the oil and the dry-roasting method.',
  },
  {
    question: 'Can I send Meerav products as a gift?',
    answer: 'Absolutely! We offer curated gift boxes perfect for Diwali, weddings, corporate events, and any celebration. Each gift box comes in premium heritage packaging. You can also add a personalised note at checkout.',
  },
  {
    question: 'What is your return and refund policy?',
    answer: 'If you receive a damaged or stale product, please contact us within 48 hours of delivery with a photo. We will send a replacement or issue a full refund. Due to the food nature of our products, we do not accept returns for taste preferences.',
  },
  {
    question: 'How should I store the snacks after opening?',
    answer: 'Once opened, transfer the contents to an airtight container and store in a cool, dry place. Our products stay fresh for up to 15 days after opening when stored properly. For best taste, consume within 7 days of opening.',
  },
];

export const kitchenStories = [
  {
    id: 'k1',
    title: 'How We Fry 200kg of Bhujia Every Morning',
    description: 'Watch our master fryer hand-stir bhujia in a traditional kadhai at 4 AM — the exact same method used for 40 years.',
    image: 'https://images.pexels.com/photos/27515043/pexels-photo-27515043.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    duration: '3:42',
  },
  {
    id: 'k2',
    title: 'The Secret Spice Blend of Bikaner',
    description: '14 spices, one ratio, passed down three generations. See how our masala master blends each batch by hand.',
    image: 'https://images.pexels.com/photos/30296301/pexels-photo-30296301.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    duration: '5:18',
  },
  {
    id: 'k3',
    title: 'Making Gulab Jamun the Old Way',
    description: 'From khoya to syrup — the complete journey of our best-selling gulab jamun, made fresh every dawn.',
    image: 'https://images.pexels.com/photos/8887065/pexels-photo-8887065.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    duration: '4:05',
  },
];

export const heroBanners = [
  {
    id: 'h2',
    title: '',
    subtitle: '',
    cta: 'Shop Now',
    image: 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/hero/royal-treat-banner.webp',
  },
  {
    id: 'h1',
    title: '',
    subtitle: '',
    cta: 'Shop Now',
    image: 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/hero/nani-fry-banner.webp',
  },
  {
    id: 'h3',
    title: '',
    subtitle: '',
    cta: 'Shop Now',
    image: 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/hero/crunch-banner.webp',
  },
];
