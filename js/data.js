/**
 * MEERAV NAMKEENS & SWEETS - OFFICIAL PRODUCT CATALOG & DATABASE
 * Authentic Bikaneri Taste • From the Heart of Bikaner
 * 75 Signature Delicacies (15 Products in Each of the 5 Categories)
 */

const MIRA_DATA = {
  brand: {
    name: "MEERAV",
    tagline: "An Authentic Bikaneri Taste",
    subtagline: "From the Heart of Bikaner",
    logo: "assets/images/meerav_logo.png",
    phone: "+91 98765 43210",
    email: "orders@meeravnamkeens.com",
    address: "Bikaner Royal Kitchens & Dispatch Hub, Bikaner, Rajasthan"
  },

  warehouseLocation: {
    lat: 28.0229,
    lng: 73.3119,
    name: "Meerav Royal Central Kitchen Hub, Bikaner"
  },

  categories: [
    { id: "all", name: "All Delicacies", icon: "fas fa-border-all", image: "assets/images/cinematic_bhujia.jpg", description: "Complete Bikaner royal heritage snack collection" },
    { id: "bhujia-sev", name: "Bhujia & Sev", icon: "fas fa-fire", image: "assets/images/cinematic_bhujia.jpg", description: "Thin, crispy golden sev & authentic Bikaneri bhujia prepared in pure oil" },
    { id: "mixture-farsan", name: "Namkeen & Mixtures", icon: "fas fa-bowl-rice", image: "assets/images/cinematic_mixture.jpg", description: "Rich royal medleys with cashews, raisins, boondi & crunchy namkeens" },
    { id: "mathri", name: "Papad & Mathri", icon: "fas fa-sun", image: "assets/images/cinematic_papad.jpg", description: "Flaky handmade mathri, sun-dried papad, and authentic Rajasthani crisps" },
    { id: "roasted-diet", name: "Roasted Diet Snacks", icon: "fas fa-seedling", image: "assets/images/cinematic_moong_dal.jpg", description: "Slow-roasted superfoods, crispy moong dal, and diet makhana with zero palm oil" },
    { id: "sweets-combos", name: "Sweets & Hampers", icon: "fas fa-gift", image: "assets/images/commercial_scene_4.jpg", description: "Traditional Bikaneri sweets, festive combo boxes, and luxury gift hampers" }
  ],

  dietaryTags: ["No Onion-Garlic", "Jain Friendly", "Roasted", "Gluten-Free", "100% Pure Oil", "Pure Desi Ghee"],

  coupons: [
    { id: "c1", code: "MEERAV10", discountType: "percentage", discountVal: 10, minOrderAmount: 299, isActive: true, description: "10% Off on orders above ₹299" },
    { id: "c2", code: "FESTIVE15", discountType: "percentage", discountVal: 15, minOrderAmount: 699, isActive: true, description: "15% Off on orders above ₹699" },
    { id: "c3", code: "ROYAL50", discountType: "flat", discountVal: 50, minOrderAmount: 499, isActive: true, description: "Flat ₹50 Off on orders above ₹499" }
  ],

  testimonials: [
    { id: "t1", name: "Pooja Sharma", city: "Mumbai, Maharashtra", rating: 5, reviewText: "The Moth Bhujia is unbelievable! Reminded me instantly of our family trip to Bikaner. Clean, crisp, non-greasy taste.", avatar: "assets/images/drive_1.jpg", sortOrder: 1, isVisible: true },
    { id: "t2", name: "Vikramaditya Rathore", city: "Jaipur, Rajasthan", rating: 5, reviewText: "Finally a brand that uses 100% pure groundnut oil without sneaky palm oil. The Kasuri Methi Mathri with morning chai is pure bliss!", avatar: "assets/images/drive_2.jpg", sortOrder: 2, isVisible: true },
    { id: "t3", name: "Ananya Deshmukh", city: "Bengaluru, Karnataka", rating: 5, reviewText: "Super fast courier delivery and the nitrogen packaging kept the sev absolutely fresh for weeks. 10/10 recommend!", avatar: "assets/images/drive_3.jpg", sortOrder: 3, isVisible: true }
  ],

  faqs: [
    { id: "f1", question: "Do you use any Palm Oil or chemical preservatives?", answer: "Never. All our namkeens and savories are prepared exclusively in 100% pure cold-pressed groundnut and clean vegetable oils with zero palm oil and no artificial preservatives.", category: "quality", sortOrder: 1, isVisible: true },
    { id: "f2", question: "How long does the crunch stay fresh in airtight packaging?", answer: "Our multi-layer food-grade packaging is flushed with food-grade nitrogen, guaranteeing factory-fresh crispiness and authentic aroma for 6+ months from manufacturing.", category: "quality", sortOrder: 2, isVisible: true },
    { id: "f3", question: "What are the delivery charges and shipping times?", answer: "We offer FREE Shipping on all orders above our threshold! Standard shipping takes 2-4 business days across metro cities with live WhatsApp courier tracking.", category: "shipping", sortOrder: 3, isVisible: true },
    { id: "f4", question: "Are these snacks 100% Vegetarian & Jain-friendly?", answer: "Yes! All our delicacies are 100% Pure Vegetarian. Many signature items like our Hing Sev, Moong Dal, and Roasted Makhana are also Jain-friendly with zero onion and garlic.", category: "dietary", sortOrder: 4, isVisible: true }
  ],

  mockUsers: [
    {
      id: "usr-1",
      name: "Pooja Sharma",
      phone: "+91 98201 44521",
      email: "pooja.sharma@example.com",
      address: "Flat 402, Sea Breeze Apts, Bandra West, Mumbai, MH",
      pincode: "400050",
      lat: 19.0596,
      lng: 72.8295,
      wishlist: ["p1", "p2"],
      savedAddresses: [
        { label: "Home", address: "Flat 402, Sea Breeze Apts, Bandra West, Mumbai", pincode: "400050", lat: 19.0596, lng: 72.8295 }
      ]
    }
  ],

  products: [
    /* ========================================================================= */
    /* CATEGORY 1: BIKANERI BHUJIA & SEV (15 Products)                           */
    /* ========================================================================= */
    {
      id: "p1",
      name: "Meerav Authentic Aloo Bhujia",
      category: "bhujia-sev",
      tag: "Best Seller",
      rating: 5.0,
      reviewsCount: 684,
      spiceLevel: "Mild-Tangy Mint",
      dietary: ["100% Veg", "Pure & Clean Oil", "No Palm Oil"],
      image: "assets/images/cinematic_bhujia.jpg",
      video: "assets/videos/clip_bhujia.mp4",
      description: "Crafted with authentic potato flakes, tepary moth bean flour, and refreshing fresh mint seasoning. Prepared daily in pure & clean oil.",
      ingredients: "Potato Flakes, Moth Bean Flour, Gram Flour, Pure Groundnut Oil, Mint Powder, Desert Rock Salt, Dry Mango Extract.",
      nutrition: { energy: "530 kcal", fat: "32g", carbs: "50g", protein: "10g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 99, originalPrice: 120 },
        { weight: "500 g", price: 229, originalPrice: 260 },
        { weight: "1 kg", price: 429, originalPrice: 480 }
      ]
    },
    {
      id: "p2",
      name: "Meerav Royal Bikaneri Papad & Moth Bhujia",
      category: "bhujia-sev",
      tag: "Heritage GI Tag",
      rating: 5.0,
      reviewsCount: 512,
      spiceLevel: "Classic Bikaneri",
      dietary: ["100% Veg", "GI Tagged", "Pure Oil"],
      image: "assets/images/cinematic_papad.jpg",
      video: "assets/videos/clip_papad.mp4",
      description: "The crown jewel of Bikaner made with 100% authentic ground Moth dal, black pepper, and desert cardamom. Extra crispy and light.",
      ingredients: "Moth Dal Flour, Besan, Pure Groundnut Oil, Black Pepper, Desert Spices, Cardamom, Sendha Namak.",
      nutrition: { energy: "550 kcal", fat: "35g", carbs: "44g", protein: "15g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 110, originalPrice: 130 },
        { weight: "500 g", price: 249, originalPrice: 280 },
        { weight: "1 kg", price: 469, originalPrice: 520 }
      ]
    },
    {
      id: "p3",
      name: "Meerav Royal Ratlami Laung Sev",
      category: "bhujia-sev",
      tag: "Clove Infused",
      rating: 4.9,
      reviewsCount: 420,
      spiceLevel: "Medium-Hot",
      dietary: ["100% Veg", "Jain Friendly", "Pure Oil"],
      image: "assets/images/pack_ratlami_sev.svg",
      description: "Thick, spicy gram flour sev tempered with aromatic cloves (laung) and Malwa spices. Perfectly fiery and crunchy.",
      ingredients: "Besan, Pure Groundnut Oil, Clove (Laung), Black Pepper, Asafoetida (Hing), Red Chili, Rock Salt.",
      nutrition: { energy: "540 kcal", fat: "34g", carbs: "42g", protein: "14g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 129, originalPrice: 149 },
        { weight: "500 g", price: 289, originalPrice: 329 },
        { weight: "1 kg", price: 549, originalPrice: 619 }
      ]
    },
    {
      id: "p9",
      name: "Meerav Royal Bikaneri Hing Sev",
      category: "bhujia-sev",
      tag: "Hing Aroma",
      rating: 4.9,
      reviewsCount: 275,
      spiceLevel: "Medium-Spicy",
      dietary: ["100% Veg", "Jain Friendly", "Pure Groundnut Oil"],
      image: "assets/images/pack_hing_sev.svg",
      description: "Thin, crispy golden sev infused with pure roasted Hing (asafoetida), black pepper, and authentic Rajasthani spices.",
      ingredients: "Besan (Gram Flour), Pure Groundnut Oil, Roasted Hing (Asafoetida), Ajwain, Black Pepper, Rock Salt.",
      nutrition: { energy: "530 kcal", fat: "32g", carbs: "44g", protein: "13g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 119, originalPrice: 139 },
        { weight: "500 g", price: 269, originalPrice: 299 },
        { weight: "1 kg", price: 519, originalPrice: 579 }
      ]
    },
    {
      id: "p12",
      name: "Meerav Salted Crispy Moong Dal",
      category: "bhujia-sev",
      tag: "Classic Crunch",
      rating: 4.9,
      reviewsCount: 460,
      spiceLevel: "Salted Mild",
      dietary: ["100% Veg", "Gluten-Free", "Pure Oil"],
      image: "assets/images/cinematic_moong_dal.jpg",
      video: "assets/videos/clip_moong_dal.mp4",
      description: "Carefully selected split yellow green gram fried in clean peanut oil and lightly dusted with Sendha Namak (rock salt).",
      ingredients: "Moong Dal (Yellow Gram), Pure Peanut Oil, Sendha Namak (Rock Salt).",
      nutrition: { energy: "490 kcal", fat: "24g", carbs: "48g", protein: "20g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 89, originalPrice: 110 },
        { weight: "500 g", price: 199, originalPrice: 230 },
        { weight: "1 kg", price: 379, originalPrice: 429 }
      ]
    },
    {
      id: "p15",
      name: "Meerav Bikaneri Garlic Lasun Sev",
      category: "bhujia-sev",
      tag: "Spicy Garlic",
      rating: 4.8,
      reviewsCount: 340,
      spiceLevel: "Hot Garlic",
      dietary: ["100% Veg", "Fresh Garlic", "Pure Oil"],
      image: "assets/images/pack_ratlami_sev.svg",
      description: "Crispy thick gram flour sev infused with roasted Rajasthani garlic paste and Kashmiri red chili.",
      ingredients: "Gram Flour, Fresh Garlic Paste, Mustard Oil Hint, Red Chili, Ajwain, Sea Salt.",
      nutrition: { energy: "535 kcal", fat: "33g", carbs: "43g", protein: "13g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 109, originalPrice: 129 },
        { weight: "500 g", price: 239, originalPrice: 270 },
        { weight: "1 kg", price: 449, originalPrice: 499 }
      ]
    },
    {
      id: "p16",
      name: "Meerav Shahi Urad Dal Bhujia",
      category: "bhujia-sev",
      tag: "Protein Rich",
      rating: 4.9,
      reviewsCount: 290,
      spiceLevel: "Medium",
      dietary: ["100% Veg", "Urad Flour", "Pure Groundnut Oil"],
      image: "assets/images/pack_bikaneri_bhujia.svg",
      description: "Delicate and airy bhujia kneaded from washed white Urad lentils and flavored with crushed mace and nutmeg.",
      ingredients: "Urad Dal Flour, Moth Flour, Groundnut Oil, Mace, Nutmeg, Rock Salt.",
      nutrition: { energy: "525 kcal", fat: "31g", carbs: "45g", protein: "17g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 119, originalPrice: 139 },
        { weight: "500 g", price: 259, originalPrice: 290 },
        { weight: "1 kg", price: 489, originalPrice: 539 }
      ]
    },
    {
      id: "p17",
      name: "Meerav Bikaneri Nylon Zero Sev",
      category: "bhujia-sev",
      tag: "Chaat Special",
      rating: 4.9,
      reviewsCount: 380,
      spiceLevel: "Mild",
      dietary: ["100% Veg", "Zero Thickness", "Chaat Topper"],
      image: "assets/images/pack_hing_sev.svg",
      description: "Ultra-fine, melt-in-mouth golden sev specially crafted for garnishing Bhelpuri, Sev Puri, and Rajasthani poha.",
      ingredients: "Finest Besan, Refined Groundnut Oil, Turmeric, Sendha Namak.",
      nutrition: { energy: "510 kcal", fat: "29g", carbs: "51g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 85, originalPrice: 105 },
        { weight: "500 g", price: 189, originalPrice: 220 },
        { weight: "1 kg", price: 359, originalPrice: 400 }
      ]
    },
    {
      id: "p18",
      name: "Meerav Palak Pudina Green Sev",
      category: "bhujia-sev",
      tag: "Herbal Mint",
      rating: 4.7,
      reviewsCount: 210,
      spiceLevel: "Tangy Mint",
      dietary: ["100% Veg", "Natural Spinach", "Pure Oil"],
      image: "assets/images/pack_ratlami_sev.svg",
      description: "Vibrant emerald sev made with fresh spinach puree, crushed garden mint, and roasted cumin seeds.",
      ingredients: "Gram Flour, Fresh Spinach Puree, Mint Leaf Extract, Cumin, Amchur, Pure Oil.",
      nutrition: { energy: "495 kcal", fat: "27g", carbs: "51g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 115, originalPrice: 135 },
        { weight: "500 g", price: 249, originalPrice: 280 },
        { weight: "1 kg", price: 469, originalPrice: 519 }
      ]
    },
    {
      id: "p46",
      name: "Meerav Bhavnagri Gathiya Sev",
      category: "bhujia-sev",
      tag: "Puffy Soft Sev",
      rating: 4.8,
      reviewsCount: 320,
      spiceLevel: "Mild Ajwain",
      dietary: ["100% Veg", "Soft Crunch", "Pure Groundnut Oil"],
      image: "assets/images/pack_bikaneri_bhujia.svg",
      description: "Thick and fluffy yellow gathiya extruded with traditional brass moulds and spiced with cracked ajwain.",
      ingredients: "Pure Besan, Cold Pressed Groundnut Oil, Ajwain, Black Salt, Papdi Khar.",
      nutrition: { energy: "515 kcal", fat: "30g", carbs: "46g", protein: "13g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 95, originalPrice: 115 },
        { weight: "500 g", price: 215, originalPrice: 245 },
        { weight: "1 kg", price: 399, originalPrice: 450 }
      ]
    },
    {
      id: "p47",
      name: "Meerav Jodhpuri Mirchi Bhujia",
      category: "bhujia-sev",
      tag: "Mathania Chili",
      rating: 5.0,
      reviewsCount: 450,
      spiceLevel: "Extra Hot",
      dietary: ["100% Veg", "Rajasthani Chili", "Pure Oil"],
      image: "assets/images/pack_ratlami_sev.svg",
      description: "Fiery Bikaneri bhujia spiced with authentic stone-ground Mathania sun-dried red chilies.",
      ingredients: "Moth Flour, Besan, Mathania Red Chili, Groundnut Oil, Desert Spices, Rock Salt.",
      nutrition: { energy: "545 kcal", fat: "34g", carbs: "43g", protein: "14g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 125, originalPrice: 145 },
        { weight: "500 g", price: 279, originalPrice: 310 },
        { weight: "1 kg", price: 529, originalPrice: 589 }
      ]
    },
    {
      id: "p48",
      name: "Meerav Malwi Jeera Roasted Sev",
      category: "bhujia-sev",
      tag: "Roasted Cumin",
      rating: 4.8,
      reviewsCount: 260,
      spiceLevel: "Earthy Cumin",
      dietary: ["100% Veg", "Jain Friendly", "Pure Oil"],
      image: "assets/images/pack_hing_sev.svg",
      description: "Medium-thick besan sev tempered with dry-roasted cumin seeds, black pepper, and rock salt.",
      ingredients: "Gram Flour, Roasted Cumin (Jeera), Pure Oil, Black Pepper, Himalayan Salt.",
      nutrition: { energy: "520 kcal", fat: "31g", carbs: "45g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 105, originalPrice: 125 },
        { weight: "500 g", price: 229, originalPrice: 260 },
        { weight: "1 kg", price: 439, originalPrice: 489 }
      ]
    },
    {
      id: "p49",
      name: "Meerav Bikaneri Spiced Chana Dal",
      category: "bhujia-sev",
      tag: "Nutty Crunch",
      rating: 4.9,
      reviewsCount: 390,
      spiceLevel: "Tangy Spiced",
      dietary: ["100% Veg", "High Protein", "Pure Oil"],
      image: "assets/images/pack_moong_dal.svg",
      description: "Split Bengal gram pulses fried golden crisp and dusted with tangy amchur and red chili powder.",
      ingredients: "Chana Dal (Bengal Gram), Pure Groundnut Oil, Dry Mango Powder, Red Chili, Sea Salt.",
      nutrition: { energy: "495 kcal", fat: "22g", carbs: "50g", protein: "21g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 89, originalPrice: 110 },
        { weight: "500 g", price: 199, originalPrice: 230 },
        { weight: "1 kg", price: 379, originalPrice: 429 }
      ]
    },
    {
      id: "p50",
      name: "Meerav Tamatar Tangy Sev",
      category: "bhujia-sev",
      tag: "Sun-Dried Tomato",
      rating: 4.7,
      reviewsCount: 230,
      spiceLevel: "Sweet & Tangy",
      dietary: ["100% Veg", "Real Tomato Extract", "Pure Oil"],
      image: "assets/images/meerav_aloo_bhujia_pack.png",
      description: "Crispy fine sev infused with real sun-dried tomato powder, roasted cumin, and sweet paprika.",
      ingredients: "Besan, Tomato Powder, Pure Oil, Paprika, Sugar Powder, Rock Salt.",
      nutrition: { energy: "510 kcal", fat: "29g", carbs: "49g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 105, originalPrice: 125 },
        { weight: "500 g", price: 229, originalPrice: 260 },
        { weight: "1 kg", price: 439, originalPrice: 489 }
      ]
    },
    {
      id: "p51",
      name: "Meerav Ajwaini Tikha Sev",
      category: "bhujia-sev",
      tag: "Carom Spiced",
      rating: 4.8,
      reviewsCount: 310,
      spiceLevel: "Spicy",
      dietary: ["100% Veg", "Pure Groundnut Oil", "Digestive Ajwain"],
      image: "assets/images/pack_ratlami_sev.svg",
      description: "Extra crunchy golden sev seasoned with crushed wild ajwain seeds and pungent black pepper.",
      ingredients: "Gram Flour, Wild Ajwain, Black Pepper, Pure Oil, Rock Salt.",
      nutrition: { energy: "530 kcal", fat: "32g", carbs: "44g", protein: "13g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 110, originalPrice: 130 },
        { weight: "500 g", price: 239, originalPrice: 270 },
        { weight: "1 kg", price: 449, originalPrice: 499 }
      ]
    },

    /* ========================================================================= */
    /* CATEGORY 2: ROYAL MIXTURES & FARSAN (15 Products)                         */
    /* ========================================================================= */
    {
      id: "p4",
      name: "Meerav Shahi Kaju Dry Fruit Mixture",
      category: "mixture-farsan",
      tag: "Royal Festive",
      rating: 5.0,
      reviewsCount: 380,
      spiceLevel: "Mild Royal",
      dietary: ["100% Veg", "Jain Friendly", "Rich in Cashews"],
      image: "assets/images/cinematic_mixture.jpg",
      video: "assets/videos/clip_mixture.mp4",
      description: "Rich festive mixture generously loaded with whole roasted cashews, California almonds, raisins, and delicate golden sev.",
      ingredients: "Cashews, Almonds, Golden Raisins, Gram Flour Sev, Pure Vegetable Oil, Cardamom Hint, Rock Salt.",
      nutrition: { energy: "610 kcal", fat: "40g", carbs: "44g", protein: "16g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 219, originalPrice: 249 },
        { weight: "500 g", price: 489, originalPrice: 549 },
        { weight: "1 kg", price: 929, originalPrice: 1049 }
      ]
    },
    {
      id: "p5",
      name: "Meerav Khatta Meetha Special Mixture",
      category: "mixture-farsan",
      tag: "Family Favorite",
      rating: 4.8,
      reviewsCount: 295,
      spiceLevel: "Sweet & Tangy",
      dietary: ["100% Veg", "Tangy Mango", "Zero Palm Oil"],
      image: "assets/images/pack_khatta_meetha.svg",
      description: "A delightful sweet and tangy harmony of crispy sev, boondi, roasted peanuts, puffed rice, and dry mango seasonings.",
      ingredients: "Gram Flour, Puffed Rice, Peanuts, Green Peas, Sugar Powder, Dry Mango (Amchur), Curry Leaves, Turmeric.",
      nutrition: { energy: "520 kcal", fat: "30g", carbs: "48g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 99, originalPrice: 119 },
        { weight: "500 g", price: 219, originalPrice: 249 },
        { weight: "1 kg", price: 419, originalPrice: 469 }
      ]
    },
    {
      id: "p13",
      name: "Meerav Shahi Navratan Royal Mixture",
      category: "mixture-farsan",
      tag: "9-Jewel Royal",
      rating: 5.0,
      reviewsCount: 390,
      spiceLevel: "Sweet & Spicy",
      dietary: ["100% Veg", "Royal Dry Fruits", "Zero Palm Oil"],
      image: "assets/images/pack_navratan_mixture.svg",
      description: "Imperial 9-jewel medley of cashews, golden raisins, crispy potato sticks, moth sev, gram pulses, and spicy boondi pearls.",
      ingredients: "Cashews, Raisins, Potato Flakes, Gram Flour, Moth Flour, Peanuts, Pure Oil, Cardamom, Desert Spices.",
      nutrition: { energy: "560 kcal", fat: "35g", carbs: "46g", protein: "14g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 159, originalPrice: 180 },
        { weight: "500 g", price: 349, originalPrice: 390 },
        { weight: "1 kg", price: 659, originalPrice: 740 }
      ]
    },
    {
      id: "p19",
      name: "Meerav Golden Cornflakes Potato Chips & Mixture",
      category: "mixture-farsan",
      tag: "Crispy Crunch",
      rating: 4.8,
      reviewsCount: 260,
      spiceLevel: "Sweet & Savory",
      dietary: ["100% Veg", "Crispy Corn & Potato", "Zero Palm Oil"],
      image: "assets/images/cinematic_chips.jpg",
      video: "assets/videos/clip_chips.mp4",
      description: "Sun-ripened crunchy cornflakes and golden potato chips fried to perfection and tossed with roasted cashew splits, curry leaves, and raisins.",
      ingredients: "Cornflakes, Potato Wafers, Cashews, Peanuts, Raisins, Pure Groundnut Oil, Powdered Sugar, Rock Salt.",
      nutrition: { energy: "515 kcal", fat: "28g", carbs: "56g", protein: "10g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 125, originalPrice: 145 },
        { weight: "500 g", price: 279, originalPrice: 310 },
        { weight: "1 kg", price: 529, originalPrice: 589 }
      ]
    },
    {
      id: "p20",
      name: "Meerav Royal Kashmiri Dalmoth Mixture",
      category: "mixture-farsan",
      tag: "Almond Loaded",
      rating: 4.9,
      reviewsCount: 310,
      spiceLevel: "Mild Cardamom",
      dietary: ["100% Veg", "Kashmiri Spices", "Rich Almonds"],
      image: "assets/images/pack_kaju_mixture.svg",
      description: "Traditional North Indian whole brown lentil dalmoth blended with toasted almond slivers and golden melon seeds.",
      ingredients: "Masoor Dal (Brown Lentils), Almonds, Magaz (Melon Seeds), Gram Flour, Saffron Essence, Pure Oil.",
      nutrition: { energy: "570 kcal", fat: "36g", carbs: "42g", protein: "18g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 179, originalPrice: 199 },
        { weight: "500 g", price: 389, originalPrice: 430 },
        { weight: "1 kg", price: 749, originalPrice: 820 }
      ]
    },
    {
      id: "p21",
      name: "Meerav Bikaneri Panchrattan Mixture",
      category: "mixture-farsan",
      tag: "5-Jewel Blend",
      rating: 4.9,
      reviewsCount: 280,
      spiceLevel: "Savory",
      dietary: ["100% Veg", "Potato Matchsticks", "Pure Oil"],
      image: "assets/images/pack_navratan_mixture.svg",
      description: "Crispy fried potato salli, whole cashews, almonds, raisins, and spicy green peas seasoned with Sendha Namak.",
      ingredients: "Potato Salli, Cashews, Almonds, Kishmish, Green Peas, Sendha Namak, Pure Oil.",
      nutrition: { energy: "545 kcal", fat: "33g", carbs: "50g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 169, originalPrice: 189 },
        { weight: "500 g", price: 369, originalPrice: 410 },
        { weight: "1 kg", price: 699, originalPrice: 770 }
      ]
    },
    {
      id: "p22",
      name: "Meerav All-In-One Imperial Namkeen",
      category: "mixture-farsan",
      tag: "Signature Blend",
      rating: 4.8,
      reviewsCount: 350,
      spiceLevel: "Medium Spicy",
      dietary: ["100% Veg", "Multi-Texture", "Clean Oil"],
      image: "assets/images/cinematic_namkeen.jpg",
      video: "assets/videos/clip_namkeen.mp4",
      description: "The ultimate 12-snack medley combining gathiya, papdi, bhujia, peanuts, boondi, and roasted lentils in one royal pack.",
      ingredients: "Gram Flour, Moth Dal, Peanuts, Lentils, Spices, Pure Oil, Rock Salt.",
      nutrition: { energy: "530 kcal", fat: "31g", carbs: "48g", protein: "13g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 109, originalPrice: 129 },
        { weight: "500 g", price: 239, originalPrice: 270 },
        { weight: "1 kg", price: 449, originalPrice: 499 }
      ]
    },
    {
      id: "p23",
      name: "Meerav Spicy Farali Falahari Mixture",
      category: "mixture-farsan",
      tag: "Vrat & Upwas",
      rating: 5.0,
      reviewsCount: 420,
      spiceLevel: "Tangy Rock Salt",
      dietary: ["100% Veg", "Vrat Friendly", "Sabudana & Potato"],
      image: "assets/images/pack_kaju_mixture.svg",
      description: "Crispy sabudana pearls, potato flakes, and roasted peanuts seasoned with rock salt. Perfect for religious fasting.",
      ingredients: "Tapioca Pearls (Sabudana), Potato Wafers, Peanuts, Rock Salt, Pure Groundnut Oil.",
      nutrition: { energy: "510 kcal", fat: "26g", carbs: "60g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 135, originalPrice: 155 },
        { weight: "500 g", price: 295, originalPrice: 330 },
        { weight: "1 kg", price: 569, originalPrice: 629 }
      ]
    },
    {
      id: "p24",
      name: "Meerav Masala Raita Boondi Pearls",
      category: "mixture-farsan",
      tag: "Raita & Snack",
      rating: 4.8,
      reviewsCount: 230,
      spiceLevel: "Spicy Tangy",
      dietary: ["100% Veg", "Crispy Pearls", "Pure Oil"],
      image: "assets/images/cinematic_raita_boondi.jpg",
      video: "assets/videos/clip_raita_boondi.mp4",
      description: "Golden, crispy gram flour pearls seasoned with crushed curry leaves, black salt, and red chili.",
      ingredients: "Besan (Gram Flour), Pure Oil, Curry Leaves, Black Salt, Red Chili Powder.",
      nutrition: { energy: "525 kcal", fat: "32g", carbs: "47g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 79, originalPrice: 99 },
        { weight: "500 g", price: 175, originalPrice: 205 },
        { weight: "1 kg", price: 329, originalPrice: 379 }
      ]
    },
    {
      id: "p52",
      name: "Meerav Badam Lachha Royal Mixture",
      category: "mixture-farsan",
      tag: "Almond Matchsticks",
      rating: 5.0,
      reviewsCount: 310,
      spiceLevel: "Mild Sweet & Salty",
      dietary: ["100% Veg", "Real Almonds", "Pure Oil"],
      image: "assets/images/pack_kaju_mixture.svg",
      description: "Crispy shredded potato lachha fried to a golden hue and mixed with sliced California almonds and rock salt.",
      ingredients: "Potato Slices (Lachha), California Almonds, Pure Ghee/Oil, Rock Salt, Mild Sugar Powder.",
      nutrition: { energy: "580 kcal", fat: "38g", carbs: "46g", protein: "14g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 189, originalPrice: 215 },
        { weight: "500 g", price: 419, originalPrice: 469 },
        { weight: "1 kg", price: 799, originalPrice: 889 }
      ]
    },
    {
      id: "p53",
      name: "Meerav Kolhapuri Teekha Mixture",
      category: "mixture-farsan",
      tag: "Fiery Crunch",
      rating: 4.8,
      reviewsCount: 370,
      spiceLevel: "Extra Fiery",
      dietary: ["100% Veg", "Red Chili Lavangi", "Pure Oil"],
      image: "assets/images/pack_navratan_mixture.svg",
      description: "Spicy puffed grains, fried lentils, peanuts, and gathiya tossed with fiery Kolhapuri red chili spice paste.",
      ingredients: "Gram Flour, Roasted Peanuts, Lentils, Kolhapuri Red Chili, Cumin, Mustard, Pure Oil.",
      nutrition: { energy: "535 kcal", fat: "33g", carbs: "44g", protein: "13g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 105, originalPrice: 125 },
        { weight: "500 g", price: 229, originalPrice: 260 },
        { weight: "1 kg", price: 439, originalPrice: 489 }
      ]
    },
    {
      id: "p54",
      name: "Meerav Royal Bikaneri Chivda",
      category: "mixture-farsan",
      tag: "Crispy Puffed Rice",
      rating: 4.9,
      reviewsCount: 410,
      spiceLevel: "Mild Mustard",
      dietary: ["100% Veg", "Puffed Rice & Dal", "Pure Oil"],
      image: "assets/images/pack_khatta_meetha.svg",
      description: "Crispy puffed rice (murmura) tossed with golden roasted chana dal, peanuts, mustard seeds, and fresh curry leaves.",
      ingredients: "Puffed Rice (Murmura), Peanuts, Roasted Gram, Turmeric, Green Chili, Pure Oil.",
      nutrition: { energy: "460 kcal", fat: "20g", carbs: "60g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 79, originalPrice: 99 },
        { weight: "500 g", price: 175, originalPrice: 205 },
        { weight: "1 kg", price: 329, originalPrice: 379 }
      ]
    },
    {
      id: "p55",
      name: "Meerav Sweet & Sour Gujarati Farsan",
      category: "mixture-farsan",
      tag: "Amchur Glaze",
      rating: 4.8,
      reviewsCount: 290,
      spiceLevel: "Sweet & Tangy",
      dietary: ["100% Veg", "No Onion-Garlic", "Zero Palm Oil"],
      image: "assets/images/pack_khatta_meetha.svg",
      description: "Mild crunchy mixture with puffed grain flakes, sweet boondi pearls, and roasted peanuts seasoned with raw mango powder.",
      ingredients: "Cornflakes, Besan Boondi, Peanuts, Powdered Cane Sugar, Dry Mango (Amchur), Salt.",
      nutrition: { energy: "515 kcal", fat: "27g", carbs: "55g", protein: "10g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 95, originalPrice: 115 },
        { weight: "500 g", price: 215, originalPrice: 245 },
        { weight: "1 kg", price: 399, originalPrice: 450 }
      ]
    },
    {
      id: "p56",
      name: "Meerav Masala Roasted Peanuts",
      category: "mixture-farsan",
      tag: "Crunchy Peanuts",
      rating: 4.9,
      reviewsCount: 340,
      spiceLevel: "Spiced Masala",
      dietary: ["100% Veg", "High Protein", "Gujarat Peanuts"],
      image: "assets/images/cinematic_masala_peanuts.jpg",
      video: "assets/videos/clip_masala_peanuts.mp4",
      description: "Jumbo Gujarat peanuts roasted crisp in cold-pressed oil and generously coated in spicy chaat masala and rock salt.",
      ingredients: "Gujarat Peanuts, Cold Pressed Oil, Chaat Masala, Sendha Namak.",
      nutrition: { energy: "540 kcal", fat: "35g", carbs: "36g", protein: "22g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 110, originalPrice: 130 },
        { weight: "500 g", price: 239, originalPrice: 270 },
        { weight: "1 kg", price: 449, originalPrice: 499 }
      ]
    },
    {
      id: "p57",
      name: "Meerav Saffron Dry Fruit Royal Medley",
      category: "mixture-farsan",
      tag: "Imperial Saffron",
      rating: 5.0,
      reviewsCount: 480,
      spiceLevel: "Royal Saffron",
      dietary: ["100% Veg", "100% Dry Fruits", "Kashmiri Kesar"],
      image: "assets/images/pack_kaju_mixture.svg",
      description: "Luxury blend of whole Iranian pistachios, roasted cashews, Mamra almonds, raisins, and genuine Kashmiri saffron strands.",
      ingredients: "Cashews, Almonds, Pistachios, Golden Raisins, Pure Kashmiri Kesar, Rock Salt.",
      nutrition: { energy: "630 kcal", fat: "44g", carbs: "40g", protein: "18g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 299, originalPrice: 349 },
        { weight: "500 g", price: 679, originalPrice: 759 },
        { weight: "1 kg", price: 1299, originalPrice: 1450 }
      ]
    },

    /* ========================================================================= */
    /* CATEGORY 3: HANDMADE MATHRI & CRISPS (15 Products)                        */
    /* ========================================================================= */
    {
      id: "p7",
      name: "Meerav Handcrafted Kasuri Methi Mathri",
      category: "mathri",
      tag: "Chai Companion",
      rating: 4.7,
      reviewsCount: 188,
      spiceLevel: "Medium",
      dietary: ["100% Veg", "Handmade", "No Onion-Garlic"],
      image: "assets/images/pack_methi_mathri.svg",
      description: "Flaky, multi-layered crispy diamond bites kneaded with aromatic Kasuri methi and cracked whole black pepper.",
      ingredients: "Wheat Flour, Pure Ghee, Dried Kasuri Methi, Ajwain Seeds, Black Pepper, Rock Salt.",
      nutrition: { energy: "500 kcal", fat: "28g", carbs: "52g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 109, originalPrice: 129 },
        { weight: "500 g", price: 239, originalPrice: 269 },
        { weight: "1 kg", price: 449, originalPrice: 499 }
      ]
    },
    {
      id: "p14",
      name: "Meerav Handcrafted Masala Karela Mathri",
      category: "mathri",
      tag: "Tea-Time Special",
      rating: 4.8,
      reviewsCount: 215,
      spiceLevel: "Ajwain Spiced",
      dietary: ["100% Veg", "Handmade", "Pure Desi Ghee"],
      image: "assets/images/pack_masala_karela.svg",
      description: "Spindle-shaped flaky wheat crackers kneaded with wild ajwain seeds, kasuri methi, and black pepper. Perfect with hot masala chai.",
      ingredients: "Wheat Flour, Pure Desi Cow Ghee, Ajwain (Carom Seeds), Kasuri Methi, Crushed Pepper, Rock Salt.",
      nutrition: { energy: "510 kcal", fat: "29g", carbs: "51g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 119, originalPrice: 139 },
        { weight: "500 g", price: 259, originalPrice: 289 },
        { weight: "1 kg", price: 489, originalPrice: 549 }
      ]
    },
    {
      id: "p25",
      name: "Meerav Bikaneri Namak Para Diamonds",
      category: "mathri",
      tag: "Traditional Crisps",
      rating: 4.9,
      reviewsCount: 310,
      spiceLevel: "Carom Salted",
      dietary: ["100% Veg", "Diamond Cut", "Pure Ghee"],
      image: "assets/images/pack_methi_mathri.svg",
      description: "Classic diamond-cut wheat crisps flavored with whole ajwain seeds and sea salt. Crispy, golden, and non-greasy.",
      ingredients: "Fine Wheat Flour, Pure Cow Ghee, Ajwain Seeds, Sea Salt, Refined Oil.",
      nutrition: { energy: "490 kcal", fat: "25g", carbs: "55g", protein: "8g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 89, originalPrice: 109 },
        { weight: "500 g", price: 199, originalPrice: 230 },
        { weight: "1 kg", price: 379, originalPrice: 429 }
      ]
    },
    {
      id: "p26",
      name: "Meerav Shahi Achari Masala Mathri",
      category: "mathri",
      tag: "Pickle Spiced",
      rating: 4.8,
      reviewsCount: 240,
      spiceLevel: "Spicy Tangy",
      dietary: ["100% Veg", "Mango Pickle Spices", "Handmade"],
      image: "assets/images/pack_masala_karela.svg",
      description: "Crispy round mathris infused with traditional Rajasthani mango pickle spices, fennel seeds, and nigella (kalonji).",
      ingredients: "Wheat Flour, Kalonji (Nigella), Fennel Seeds, Red Mustard, Desi Ghee, Sea Salt.",
      nutrition: { energy: "515 kcal", fat: "30g", carbs: "50g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 125, originalPrice: 145 },
        { weight: "500 g", price: 269, originalPrice: 299 },
        { weight: "1 kg", price: 499, originalPrice: 559 }
      ]
    },
    {
      id: "p27",
      name: "Meerav Besan Papdi Gathiya",
      category: "mathri",
      tag: "Soft & Crisp",
      rating: 5.0,
      reviewsCount: 410,
      spiceLevel: "Mild Ajwain",
      dietary: ["100% Veg", "Melt In Mouth", "Pure Oil"],
      image: "assets/images/pack_methi_mathri.svg",
      description: "Silky, ribbon-shaped Gujarati-Rajasthani besan papdi tempered with hing and carom seeds. Melts on the tongue.",
      ingredients: "Pure Besan (Gram Flour), Groundnut Oil, Ajwain, Papdi Khar, Black Salt.",
      nutrition: { energy: "520 kcal", fat: "31g", carbs: "46g", protein: "14g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 95, originalPrice: 115 },
        { weight: "500 g", price: 215, originalPrice: 245 },
        { weight: "1 kg", price: 399, originalPrice: 450 }
      ]
    },
    {
      id: "p28",
      name: "Meerav Mini Dry Fruit Samosa Bites",
      category: "mathri",
      tag: "Party Favorite",
      rating: 4.9,
      reviewsCount: 360,
      spiceLevel: "Sweet & Spicy",
      dietary: ["100% Veg", "Moong Dal & Cashew Stuffed", "6 Months Fresh"],
      image: "assets/images/pack_masala_karela.svg",
      description: "Bite-sized pyramid samosas stuffed with spiced yellow moong dal, cashew pieces, raisins, and sweet fennel.",
      ingredients: "Wheat Flour, Moong Dal, Cashews, Raisins, Fennel, Cloves, Pure Oil.",
      nutrition: { energy: "540 kcal", fat: "32g", carbs: "51g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 139, originalPrice: 159 },
        { weight: "500 g", price: 299, originalPrice: 340 },
        { weight: "1 kg", price: 569, originalPrice: 630 }
      ]
    },
    {
      id: "p29",
      name: "Meerav Mini Khasta Kachori Crisps",
      category: "mathri",
      tag: "Lentil Stuffed",
      rating: 4.8,
      reviewsCount: 290,
      spiceLevel: "Hot Hing Masala",
      dietary: ["100% Veg", "Urad Dal Stuffed", "Crispy Crust"],
      image: "assets/images/pack_methi_mathri.svg",
      description: "Puffed, flaky golden spheres filled with spicy roasted urad dal, asafoetida, and dry ginger powder.",
      ingredients: "Fine Flour, Urad Dal, Asafoetida, Dry Ginger (Saunth), Desi Ghee, Pure Oil.",
      nutrition: { energy: "535 kcal", fat: "31g", carbs: "52g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 139, originalPrice: 159 },
        { weight: "500 g", price: 299, originalPrice: 340 },
        { weight: "1 kg", price: 569, originalPrice: 630 }
      ]
    },
    {
      id: "p30",
      name: "Meerav Flaky Wheat Farsi Puri",
      category: "mathri",
      tag: "Ghee Layered",
      rating: 4.7,
      reviewsCount: 195,
      spiceLevel: "Black Pepper Salt",
      dietary: ["100% Veg", "Desi Cow Ghee", "Flaky Layers"],
      image: "assets/images/pack_masala_karela.svg",
      description: "Multi-layered flaky circular puris rolled in pure desi cow ghee and studded with cracked black pepper corns.",
      ingredients: "Whole Wheat Flour, Pure Cow Ghee, Coarse Black Pepper, Cumin, Rock Salt.",
      nutrition: { energy: "495 kcal", fat: "27g", carbs: "53g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 115, originalPrice: 135 },
        { weight: "500 g", price: 249, originalPrice: 280 },
        { weight: "1 kg", price: 469, originalPrice: 519 }
      ]
    },
    {
      id: "p31",
      name: "Meerav Kali Mirch Gol Mathri",
      category: "mathri",
      tag: "Black Pepper",
      rating: 4.8,
      reviewsCount: 220,
      spiceLevel: "Cracked Pepper",
      dietary: ["100% Veg", "Malabar Pepper", "Crisp Texture"],
      image: "assets/images/pack_methi_mathri.svg",
      description: "Thick, rustic round mathris topped with coarsely crushed Malabar black peppercorns and sea salt.",
      ingredients: "Wheat Flour, Crushed Black Pepper, Ajwain, Pure Ghee, Rock Salt.",
      nutrition: { energy: "505 kcal", fat: "28g", carbs: "52g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 109, originalPrice: 129 },
        { weight: "500 g", price: 239, originalPrice: 269 },
        { weight: "1 kg", price: 449, originalPrice: 499 }
      ]
    },
    {
      id: "p58",
      name: "Meerav Sweet Shakarpara Diamonds",
      category: "mathri",
      tag: "Sugar Glazed",
      rating: 4.9,
      reviewsCount: 380,
      spiceLevel: "Cardamom Sweet",
      dietary: ["100% Veg", "Crispy Sweet", "Pure Desi Ghee"],
      image: "assets/images/pack_methi_mathri.svg",
      description: "Traditional diamond-shaped crispy wheat bites coated in a crystalline cardamom sugar glaze.",
      ingredients: "Wheat Flour, Pure Cow Ghee, Cardamom (Elaichi), Sugar Coating.",
      nutrition: { energy: "490 kcal", fat: "22g", carbs: "68g", protein: "7g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 95, originalPrice: 115 },
        { weight: "500 g", price: 215, originalPrice: 245 },
        { weight: "1 kg", price: 399, originalPrice: 450 }
      ]
    },
    {
      id: "p59",
      name: "Meerav Handcrafted Suvali Puri",
      category: "mathri",
      tag: "Sesame Crisps",
      rating: 4.8,
      reviewsCount: 210,
      spiceLevel: "Sesame Salted",
      dietary: ["100% Veg", "White Til", "Extra Thin"],
      image: "assets/images/pack_masala_karela.svg",
      description: "Paper-thin crispy circular wheat crisps speckled with white sesame seeds (til) and black pepper.",
      ingredients: "Wheat Flour, White Sesame Seeds, Black Pepper, Pure Ghee, Sea Salt.",
      nutrition: { energy: "485 kcal", fat: "26g", carbs: "54g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 110, originalPrice: 130 },
        { weight: "500 g", price: 239, originalPrice: 270 },
        { weight: "1 kg", price: 449, originalPrice: 499 }
      ]
    },
    {
      id: "p60",
      name: "Meerav Marwari Pyaz Mathri",
      category: "mathri",
      tag: "Onion & Nigella",
      rating: 4.9,
      reviewsCount: 350,
      spiceLevel: "Savory",
      dietary: ["100% Veg", "Dehydrated Onion", "Handmade"],
      image: "assets/images/pack_methi_mathri.svg",
      description: "Flaky circular mathris kneaded with dehydrated sweet Marwari onions, kalonji, and crushed cumin.",
      ingredients: "Wheat Flour, Dehydrated Onion, Kalonji (Nigella), Cumin, Ghee, Rock Salt.",
      nutrition: { energy: "510 kcal", fat: "28g", carbs: "52g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 119, originalPrice: 139 },
        { weight: "500 g", price: 259, originalPrice: 290 },
        { weight: "1 kg", price: 489, originalPrice: 539 }
      ]
    },
    {
      id: "p61",
      name: "Meerav Methi Masala Khari Puff",
      category: "mathri",
      tag: "100-Layer Puff",
      rating: 4.8,
      reviewsCount: 290,
      spiceLevel: "Mild Herb",
      dietary: ["100% Veg", "Airy & Light", "Pure Butter/Ghee"],
      image: "assets/images/pack_masala_karela.svg",
      description: "Ultra-flaky layered puff biscuits seasoned with dried fenugreek leaves and desert rock salt. Ideal chai dip.",
      ingredients: "Refined Wheat Flour, Ghee, Kasuri Methi, Rock Salt.",
      nutrition: { energy: "520 kcal", fat: "30g", carbs: "54g", protein: "8g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 105, originalPrice: 125 },
        { weight: "500 g", price: 229, originalPrice: 260 },
        { weight: "1 kg", price: 429, originalPrice: 479 }
      ]
    },
    {
      id: "p62",
      name: "Meerav Chana Masala Papdi",
      category: "mathri",
      tag: "Chana Dal Base",
      rating: 4.9,
      reviewsCount: 330,
      spiceLevel: "Spicy Tangy",
      dietary: ["100% Veg", "High Fiber", "Pure Oil"],
      image: "assets/images/pack_methi_mathri.svg",
      description: "Crispy flat papdis kneaded with roasted chickpea flour, red chili, and dry pomegranate seeds (anardana).",
      ingredients: "Chickpea Flour, Wheat Flour, Anardana Powder, Red Chili, Pure Oil, Salt.",
      nutrition: { energy: "495 kcal", fat: "26g", carbs: "51g", protein: "13g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 99, originalPrice: 119 },
        { weight: "500 g", price: 219, originalPrice: 249 },
        { weight: "1 kg", price: 419, originalPrice: 469 }
      ]
    },
    {
      id: "p63",
      name: "Meerav Tikona Ajwain Mathri",
      category: "mathri",
      tag: "Tri-Angle Cut",
      rating: 4.8,
      reviewsCount: 240,
      spiceLevel: "Ajwain Clove",
      dietary: ["100% Veg", "Hand Folded", "Pure Desi Ghee"],
      image: "assets/images/pack_masala_karela.svg",
      description: "Hand-folded three-cornered flaky mathris spiked with whole clove studs and carom seeds.",
      ingredients: "Wheat Flour, Whole Clove (Laung), Ajwain, Desi Ghee, Sea Salt.",
      nutrition: { energy: "505 kcal", fat: "28g", carbs: "53g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 115, originalPrice: 135 },
        { weight: "500 g", price: 249, originalPrice: 280 },
        { weight: "1 kg", price: 469, originalPrice: 519 }
      ]
    },

    /* ========================================================================= */
    /* CATEGORY 4: ROASTED DIET & HEALTHY (15 Products)                          */
    /* ========================================================================= */
    {
      id: "p6",
      name: "Meerav Roasted Himalayan Pink Salt Makhana",
      category: "roasted-diet",
      tag: "Diet & Guilt-Free",
      rating: 4.9,
      reviewsCount: 240,
      spiceLevel: "Mild Pink Salt",
      dietary: ["100% Veg", "Gluten-Free", "Roasted", "Jain Friendly"],
      image: "assets/images/pack_makhana.svg",
      description: "Jumbo fox-nuts slow-roasted in pure cow ghee and seasoned with organic Himalayan pink rock salt.",
      ingredients: "Lotus Seeds (Makhana), Pure Desi Cow Ghee, Himalayan Pink Salt, Black Pepper Extract.",
      nutrition: { energy: "380 kcal", fat: "12g", carbs: "58g", protein: "10g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 179, originalPrice: 199 },
        { weight: "500 g", price: 399, originalPrice: 449 },
        { weight: "1 kg", price: 759, originalPrice: 849 }
      ]
    },
    {
      id: "p11",
      name: "Meerav Chana Jor Garam Tangy Crisps",
      category: "roasted-diet",
      tag: "High Protein",
      rating: 4.8,
      reviewsCount: 310,
      spiceLevel: "Tangy Chaat Masala",
      dietary: ["100% Veg", "Roasted", "High Fiber", "Vegan"],
      image: "assets/images/pack_chana_jor.svg",
      description: "Flattened black Bengal gram slow-roasted to a golden crunch and tossed with tangy dry mango powder, rock salt, and green chilies.",
      ingredients: "Bengal Gram (Chana), Cold Pressed Mustard Oil Hint, Dry Mango Powder, Cumin, Black Salt, Red Chili.",
      nutrition: { energy: "410 kcal", fat: "10g", carbs: "55g", protein: "22g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 99, originalPrice: 120 },
        { weight: "500 g", price: 229, originalPrice: 260 },
        { weight: "1 kg", price: 429, originalPrice: 480 }
      ]
    },
    {
      id: "p32",
      name: "Meerav Roasted Peri Peri Makhana",
      category: "roasted-diet",
      tag: "Fiery Crunch",
      rating: 4.9,
      reviewsCount: 290,
      spiceLevel: "Zesty Peri Peri",
      dietary: ["100% Veg", "Gluten-Free", "Low Calorie"],
      image: "assets/images/pack_makhana.svg",
      description: "Jumbo lotus foxnuts tossed with African Bird's Eye chili, garlic powder, and tangy oregano herbs.",
      ingredients: "Foxnuts (Makhana), Desi Ghee, Peri Peri Seasoning, Paprika, Citric Salt.",
      nutrition: { energy: "390 kcal", fat: "13g", carbs: "57g", protein: "10g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 189, originalPrice: 210 },
        { weight: "500 g", price: 419, originalPrice: 469 },
        { weight: "1 kg", price: 799, originalPrice: 889 }
      ]
    },
    {
      id: "p33",
      name: "Meerav Roasted Diet Poha Chivda",
      category: "roasted-diet",
      tag: "Zero Oil Diet",
      rating: 4.8,
      reviewsCount: 340,
      spiceLevel: "Mild Turmeric",
      dietary: ["100% Veg", "Zero Deep Frying", "Roasted"],
      image: "assets/images/pack_chana_jor.svg",
      description: "Paper-thin beaten rice dry-roasted in hot sand and mixed with roasted peanuts, curry leaves, and green chilies.",
      ingredients: "Roasted Flattened Rice (Poha), Roasted Peanuts, Roasted Dal, Mustard Seeds, Curry Leaves, Turmeric.",
      nutrition: { energy: "360 kcal", fat: "8g", carbs: "65g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 89, originalPrice: 109 },
        { weight: "500 g", price: 199, originalPrice: 230 },
        { weight: "1 kg", price: 379, originalPrice: 429 }
      ]
    },
    {
      id: "p34",
      name: "Meerav Ghee-Roasted 5-Grain Mixture",
      category: "roasted-diet",
      tag: "Superfood Medley",
      rating: 5.0,
      reviewsCount: 270,
      spiceLevel: "Savory Herb",
      dietary: ["100% Veg", "Multigrain", "High Protein"],
      image: "assets/images/pack_makhana.svg",
      description: "Roasted wheat, jowar, bajra, ragi, and puffed rice tossed in pure desi cow ghee and pink Himalayan rock salt.",
      ingredients: "Jowar, Bajra, Ragi Puffs, Roasted Wheat, Cow Ghee, Sendha Namak.",
      nutrition: { energy: "375 kcal", fat: "9g", carbs: "62g", protein: "14g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 145, originalPrice: 165 },
        { weight: "500 g", price: 319, originalPrice: 359 },
        { weight: "1 kg", price: 599, originalPrice: 669 }
      ]
    },
    {
      id: "p35",
      name: "Meerav Roasted Salted Soybean Crisps",
      category: "roasted-diet",
      tag: "40% Protein",
      rating: 4.7,
      reviewsCount: 180,
      spiceLevel: "Light Salted",
      dietary: ["100% Veg", "Keto Friendly", "High Protein"],
      image: "assets/images/pack_chana_jor.svg",
      description: "Slow-roasted organic yellow soybeans seasoned with rock salt. Exceptional protein density for gym and fitness enthusiasts.",
      ingredients: "Organic Soybeans, Mustard Oil Hint, Sendha Namak.",
      nutrition: { energy: "420 kcal", fat: "14g", carbs: "30g", protein: "38g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 95, originalPrice: 115 },
        { weight: "500 g", price: 215, originalPrice: 245 },
        { weight: "1 kg", price: 399, originalPrice: 450 }
      ]
    },
    {
      id: "p36",
      name: "Meerav Roasted Pumpkin & Flax Seed Crunch",
      category: "roasted-diet",
      tag: "Omega-3 Rich",
      rating: 4.9,
      reviewsCount: 230,
      spiceLevel: "Chaat Masala",
      dietary: ["100% Veg", "Omega-3", "Raw Roasted"],
      image: "assets/images/pack_makhana.svg",
      description: "Toasted pumpkin seeds, sunflower seeds, flax seeds, and chia seeds spiced with black salt and amchur.",
      ingredients: "Pumpkin Seeds, Flax Seeds, Sunflower Seeds, Chia Seeds, Sendha Namak, Cumin.",
      nutrition: { energy: "510 kcal", fat: "35g", carbs: "22g", protein: "24g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 199, originalPrice: 229 },
        { weight: "500 g", price: 449, originalPrice: 499 },
        { weight: "1 kg", price: 849, originalPrice: 949 }
      ]
    },
    {
      id: "p37",
      name: "Meerav Roasted Mint Quinoa Puffs",
      category: "roasted-diet",
      tag: "Ancient Grain",
      rating: 4.8,
      reviewsCount: 165,
      spiceLevel: "Cool Mint",
      dietary: ["100% Veg", "Gluten-Free", "Low GI"],
      image: "assets/images/pack_chana_jor.svg",
      description: "Puffed royal white quinoa roasted crisp and dusted with Himalayan rock salt and garden mint.",
      ingredients: "White Quinoa, Olive Oil Spray, Dried Mint, Black Salt.",
      nutrition: { energy: "385 kcal", fat: "7g", carbs: "64g", protein: "13g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 185, originalPrice: 210 },
        { weight: "500 g", price: 399, originalPrice: 449 },
        { weight: "1 kg", price: 769, originalPrice: 859 }
      ]
    },
    {
      id: "p38",
      name: "Meerav Roasted Jowar Millet Puffs",
      category: "roasted-diet",
      tag: "Desi Millet",
      rating: 4.9,
      reviewsCount: 280,
      spiceLevel: "Hing Jeera",
      dietary: ["100% Veg", "Millet Power", "Diabetic Friendly"],
      image: "assets/images/pack_makhana.svg",
      description: "Light and airy popped sorghum (jowar) grains roasted with hing, cumin, and sea salt.",
      ingredients: "Popped Jowar (Sorghum), Cold Pressed Oil Spray, Hing, Roasted Cumin, Rock Salt.",
      nutrition: { energy: "350 kcal", fat: "6g", carbs: "68g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 95, originalPrice: 115 },
        { weight: "500 g", price: 215, originalPrice: 245 },
        { weight: "1 kg", price: 399, originalPrice: 450 }
      ]
    },
    {
      id: "p64",
      name: "Meerav Roasted Cheese & Herbs Makhana",
      category: "roasted-diet",
      tag: "Cheddar & Herbs",
      rating: 4.9,
      reviewsCount: 340,
      spiceLevel: "Cheesy Herb",
      dietary: ["100% Veg", "Gluten-Free", "Rich Calcium"],
      image: "assets/images/pack_makhana.svg",
      description: "Ghee-roasted jumbo lotus foxnuts seasoned with organic cheddar cheese powder, oregano, and dried basil.",
      ingredients: "Foxnuts, Desi Ghee, Cheddar Cheese Powder, Oregano, Basil, Salt.",
      nutrition: { energy: "410 kcal", fat: "15g", carbs: "54g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 199, originalPrice: 225 },
        { weight: "500 g", price: 439, originalPrice: 489 },
        { weight: "1 kg", price: 829, originalPrice: 919 }
      ]
    },
    {
      id: "p65",
      name: "Meerav Roasted Moong Jor Tangy Crisps",
      category: "roasted-diet",
      tag: "Flattened Moong",
      rating: 4.8,
      reviewsCount: 220,
      spiceLevel: "Tangy Chaat",
      dietary: ["100% Veg", "High Protein", "Vegan Roasted"],
      image: "assets/images/pack_chana_jor.svg",
      description: "Whole green gram lentils pressed flat and roasted till crackling crisp. Tossed in lemon and black salt.",
      ingredients: "Whole Green Moong, Mustard Oil Hint, Black Salt, Lemon Powder, Red Chili.",
      nutrition: { energy: "395 kcal", fat: "9g", carbs: "56g", protein: "24g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 105, originalPrice: 125 },
        { weight: "500 g", price: 229, originalPrice: 260 },
        { weight: "1 kg", price: 429, originalPrice: 479 }
      ]
    },
    {
      id: "p66",
      name: "Meerav Roasted Bajra Pearl Millet Puffs",
      category: "roasted-diet",
      tag: "Iron Rich Bajra",
      rating: 4.9,
      reviewsCount: 270,
      spiceLevel: "Salt & Cumin",
      dietary: ["100% Veg", "Gluten-Free", "Winter Superfood"],
      image: "assets/images/pack_makhana.svg",
      description: "Popped Rajasthani pearl millet grains dry-roasted with Sendha Namak and crushed cumin seeds.",
      ingredients: "Popped Bajra (Pearl Millet), Mustard Oil Spray, Cumin, Rock Salt.",
      nutrition: { energy: "365 kcal", fat: "8g", carbs: "63g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 95, originalPrice: 115 },
        { weight: "500 g", price: 215, originalPrice: 245 },
        { weight: "1 kg", price: 399, originalPrice: 450 }
      ]
    },
    {
      id: "p67",
      name: "Meerav Roasted Ragi Finger Millet Crisps",
      category: "roasted-diet",
      tag: "Calcium Power",
      rating: 4.8,
      reviewsCount: 190,
      spiceLevel: "Curry Leaf Masala",
      dietary: ["100% Veg", "Ragi Superfood", "Zero Maida"],
      image: "assets/images/pack_chana_jor.svg",
      description: "Roasted finger millet discs spiced with South Indian curry leaves, asafoetida, and sea salt.",
      ingredients: "Ragi Flour (Finger Millet), Rice Flour, Cold Pressed Oil, Curry Leaves, Salt.",
      nutrition: { energy: "370 kcal", fat: "7g", carbs: "66g", protein: "10g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 110, originalPrice: 130 },
        { weight: "500 g", price: 239, originalPrice: 270 },
        { weight: "1 kg", price: 449, originalPrice: 499 }
      ]
    },
    {
      id: "p68",
      name: "Meerav Roasted Masala Wheat Flakes",
      category: "roasted-diet",
      tag: "High Fiber",
      rating: 4.7,
      reviewsCount: 230,
      spiceLevel: "Tangy Mint",
      dietary: ["100% Veg", "Sand Roasted", "Digestive"],
      image: "assets/images/pack_makhana.svg",
      description: "Whole wheat flakes dry-roasted in hot desert sand and seasoned with mint, amchur, and roasted cumin.",
      ingredients: "Whole Wheat Flakes, Mint, Cumin, Amchur, Black Salt.",
      nutrition: { energy: "355 kcal", fat: "6g", carbs: "67g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 89, originalPrice: 109 },
        { weight: "500 g", price: 199, originalPrice: 230 },
        { weight: "1 kg", price: 379, originalPrice: 429 }
      ]
    },
    {
      id: "p69",
      name: "Meerav Roasted Chia & Sesame Power Crunch",
      category: "roasted-diet",
      tag: "Super Seed Mix",
      rating: 5.0,
      reviewsCount: 310,
      spiceLevel: "Light Chaat",
      dietary: ["100% Veg", "Keto Superfood", "Raw Seeds"],
      image: "assets/images/pack_makhana.svg",
      description: "Roasted organic chia seeds, brown sesame, sunflower seeds, and watermelon kernels tossed with Sendha Namak.",
      ingredients: "Chia Seeds, Sesame, Watermelon Seeds, Sunflower Seeds, Rock Salt.",
      nutrition: { energy: "520 kcal", fat: "36g", carbs: "20g", protein: "23g" },
      inStock: true,
      variants: [
        { weight: "200 g", price: 219, originalPrice: 249 },
        { weight: "500 g", price: 489, originalPrice: 549 },
        { weight: "1 kg", price: 929, originalPrice: 1049 }
      ]
    },

    /* ========================================================================= */
    /* CATEGORY 5: FESTIVE GIFT BOXES & ROYAL SWEETS (15 Products)               */
    /* ========================================================================= */
    {
      id: "p8",
      name: "Meerav Grand Celebration Bikaneri Gift Box",
      category: "sweets-combos",
      tag: "Luxury Gift Hamper",
      rating: 5.0,
      reviewsCount: 310,
      spiceLevel: "Assorted Royal Flavors",
      dietary: ["100% Veg", "Gift Packaging", "Assorted 6 Items"],
      image: "assets/images/pack_festive_box.svg",
      description: "Royal packaging featuring Meerav Aloo Bhujia, Bikaneri Bhujia, Ratlami Sev, Kaju Mixture, Methi Mathri & Himalayan Makhana.",
      ingredients: "Assorted Bikaneri Savories, Whole Cashews, Ghee-Roasted Makhana in airtight keepsake gift box.",
      nutrition: { energy: "Varies per snack", fat: "-", carbs: "-", protein: "-" },
      inStock: true,
      variants: [
        { weight: "1.2 kg Box", price: 899, originalPrice: 1099 },
        { weight: "2.5 kg Grand Box", price: 1699, originalPrice: 1999 }
      ]
    },
    {
      id: "p10",
      name: "Meerav Bikaneri Spongy Rasgulla Tin",
      category: "sweets-combos",
      tag: "Royal Sweet Tin",
      rating: 5.0,
      reviewsCount: 520,
      spiceLevel: "Cardamom Sweet",
      dietary: ["100% Veg", "Pure Cow Milk", "No Preservatives"],
      image: "assets/images/pack_bikaneri_rasgulla.svg",
      description: "Legendary melt-in-mouth spongy Rasgullas crafted from fresh cow milk chhena dipped in cardamom and saffron-infused sugar syrup.",
      ingredients: "Fresh Cow Milk Chhena, Sugar, Purified Water, Cardamom (Elaichi), Saffron (Kesar).",
      nutrition: { energy: "260 kcal", fat: "4g", carbs: "52g", protein: "6g" },
      inStock: true,
      variants: [
        { weight: "1 kg Tin", price: 299, originalPrice: 349 },
        { weight: "2 kg Family Pack", price: 569, originalPrice: 669 }
      ]
    },
    {
      id: "p39",
      name: "Meerav Desi Ghee Gulab Jamun Tin",
      category: "sweets-combos",
      tag: "Desi Ghee Fried",
      rating: 5.0,
      reviewsCount: 480,
      spiceLevel: "Rose Cardamom",
      dietary: ["100% Veg", "Pure Desi Ghee", "Fresh Mawa"],
      image: "assets/images/pack_bikaneri_rasgulla.svg",
      description: "Rich khoya mawa dumplings deep-fried in pure desi cow ghee and steeped in fragrant rose and green cardamom syrup.",
      ingredients: "Fresh Mawa (Khoya), Pure Desi Cow Ghee, Sugar Syrup, Rose Water, Elaichi.",
      nutrition: { energy: "340 kcal", fat: "14g", carbs: "48g", protein: "7g" },
      inStock: true,
      variants: [
        { weight: "1 kg Tin", price: 349, originalPrice: 399 },
        { weight: "2 kg Family Pack", price: 659, originalPrice: 749 }
      ]
    },
    {
      id: "p40",
      name: "Meerav Traditional Bikaneri Soan Papdi",
      category: "sweets-combos",
      tag: "Flaky Desi Ghee",
      rating: 4.9,
      reviewsCount: 390,
      spiceLevel: "Pistachio Almond",
      dietary: ["100% Veg", "Pure Desi Ghee", "Flaky Texture"],
      image: "assets/images/pack_festive_box.svg",
      description: "Feather-light, multi-layered flaky cubes of gram flour caramelized in pure desi ghee and topped with crunchy pistachios.",
      ingredients: "Gram Flour, Pure Desi Ghee, Sugar, Almonds, Pistachios, Green Cardamom.",
      nutrition: { energy: "510 kcal", fat: "26g", carbs: "62g", protein: "6g" },
      inStock: true,
      variants: [
        { weight: "500 g Box", price: 249, originalPrice: 289 },
        { weight: "1 kg Gift Pack", price: 479, originalPrice: 549 }
      ]
    },
    {
      id: "p41",
      name: "Meerav Royal Kaju Katli Keepsake Box",
      category: "sweets-combos",
      tag: "Silver Foiled",
      rating: 5.0,
      reviewsCount: 620,
      spiceLevel: "Pure Cashew",
      dietary: ["100% Veg", "100% Goa Cashews", "Silver Vark"],
      image: "assets/images/pack_festive_box.svg",
      description: "Diamond-cut fudge made exclusively with Grade-A whole cashews and pure desi sugar. Embellished with pure vegetarian silver foil.",
      ingredients: "Whole Cashew Nuts (Kaju), Sugar, Purified Water, Pure Silver Foil (Vark).",
      nutrition: { energy: "480 kcal", fat: "22g", carbs: "61g", protein: "10g" },
      inStock: true,
      variants: [
        { weight: "500 g Luxury Box", price: 549, originalPrice: 629 },
        { weight: "1 kg Royal Box", price: 1049, originalPrice: 1199 }
      ]
    },
    {
      id: "p42",
      name: "Meerav Bikaneri Badaam Halwa Luxury Tin",
      category: "sweets-combos",
      tag: "Almond Halwa",
      rating: 5.0,
      reviewsCount: 290,
      spiceLevel: "Saffron Almond",
      dietary: ["100% Veg", "Rich Almond Paste", "Desi Ghee"],
      image: "assets/images/pack_bikaneri_rasgulla.svg",
      description: "Rich dessert crafted from slow-cooked Mamra almond paste, pure desi cow ghee, milk, and saffron.",
      ingredients: "Almonds (Badaam), Pure Cow Ghee, Milk Solids, Saffron (Kesar), Sugar.",
      nutrition: { energy: "540 kcal", fat: "32g", carbs: "48g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "500 g Tin", price: 499, originalPrice: 579 },
        { weight: "1 kg Tin", price: 949, originalPrice: 1099 }
      ]
    },
    {
      id: "p43",
      name: "Meerav Shahi Dry Fruit Sugar-Free Laddu",
      category: "sweets-combos",
      tag: "No Added Sugar",
      rating: 4.9,
      reviewsCount: 340,
      spiceLevel: "Date & Nut",
      dietary: ["100% Veg", "Sugar-Free", "Natural Dates & Nuts"],
      image: "assets/images/pack_festive_box.svg",
      description: "Healthy royal energy balls made with Arabian dates, roasted cashews, almonds, pistachios, and figs. 100% natural sweetness.",
      ingredients: "Dates (Khajoor), Dried Figs (Anjeer), Cashews, Almonds, Pistachios, Cow Ghee.",
      nutrition: { energy: "460 kcal", fat: "24g", carbs: "52g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "500 g Box", price: 599, originalPrice: 699 },
        { weight: "1 kg Gift Pack", price: 1149, originalPrice: 1299 }
      ]
    },
    {
      id: "p44",
      name: "Meerav Traditional Malai Ghewar",
      category: "sweets-combos",
      tag: "Rajasthani Royal",
      rating: 5.0,
      reviewsCount: 410,
      spiceLevel: "Saffron Rabri",
      dietary: ["100% Veg", "Honeycomb Texture", "Desi Ghee"],
      image: "assets/images/pack_festive_box.svg",
      description: "Iconic disc-shaped Rajasthani honeycomb sweet fried in desi ghee, topped with thickened saffron rabri and slivered nuts.",
      ingredients: "Flour, Pure Desi Ghee, Saffron Rabri (Thickened Milk), Pistachios, Cardamom.",
      nutrition: { energy: "490 kcal", fat: "26g", carbs: "58g", protein: "8g" },
      inStock: true,
      variants: [
        { weight: "500 g Disc", price: 399, originalPrice: 459 },
        { weight: "1 kg Dual Box", price: 769, originalPrice: 879 }
      ]
    },
    {
      id: "p45",
      name: "Meerav Royal Rajbhog Saffron Tin",
      category: "sweets-combos",
      tag: "King Sized Sweet",
      rating: 5.0,
      reviewsCount: 380,
      spiceLevel: "Kesar Pistachio",
      dietary: ["100% Veg", "Pure Cow Chhena", "Kashmiri Saffron"],
      image: "assets/images/pack_bikaneri_rasgulla.svg",
      description: "Jumbo saffron-infused cottage cheese dumplings stuffed with pistachio slivers and cardamom, steeped in aromatic sugar syrup.",
      ingredients: "Fresh Cow Milk Chhena, Saffron (Kesar), Pistachio Core, Sugar Syrup, Rose Essence.",
      nutrition: { energy: "280 kcal", fat: "5g", carbs: "54g", protein: "7g" },
      inStock: true,
      variants: [
        { weight: "1 kg Tin", price: 349, originalPrice: 399 },
        { weight: "2 kg Family Pack", price: 659, originalPrice: 749 }
      ]
    },
    {
      id: "p70",
      name: "Meerav Desi Ghee Besan Laddu Box",
      category: "sweets-combos",
      tag: "Cardamom Ghee",
      rating: 4.9,
      reviewsCount: 430,
      spiceLevel: "Nutty Sweet",
      dietary: ["100% Veg", "Slow-Roasted Besan", "Pure Desi Ghee"],
      image: "assets/images/pack_festive_box.svg",
      description: "Golden spheres of coarsely ground gram flour roasted patiently in pure desi cow ghee with cardamom and almond crunch.",
      ingredients: "Gram Flour (Besan), Pure Desi Cow Ghee, Bura Sugar, Green Cardamom, Cashews.",
      nutrition: { energy: "510 kcal", fat: "28g", carbs: "58g", protein: "9g" },
      inStock: true,
      variants: [
        { weight: "500 g Box", price: 329, originalPrice: 379 },
        { weight: "1 kg Box", price: 629, originalPrice: 719 }
      ]
    },
    {
      id: "p71",
      name: "Meerav Royal Motichoor Laddu Box",
      category: "sweets-combos",
      tag: "Fine Ghee Pearls",
      rating: 5.0,
      reviewsCount: 540,
      spiceLevel: "Saffron Rose",
      dietary: ["100% Veg", "Fine Gram Pearls", "Pure Ghee"],
      image: "assets/images/pack_festive_box.svg",
      description: "Melt-in-mouth royal laddus fashioned from micro gram flour boondi pearls drenched in saffron sugar syrup.",
      ingredients: "Besan, Pure Desi Ghee, Saffron, Rose Water, Magaz (Melon Seeds), Sugar.",
      nutrition: { energy: "495 kcal", fat: "24g", carbs: "62g", protein: "7g" },
      inStock: true,
      variants: [
        { weight: "500 g Box", price: 349, originalPrice: 399 },
        { weight: "1 kg Box", price: 669, originalPrice: 759 }
      ]
    },
    {
      id: "p72",
      name: "Meerav Bikaneri Pista Kesar Sandesh",
      category: "sweets-combos",
      tag: "Fresh Chhena Fudge",
      rating: 4.8,
      reviewsCount: 310,
      spiceLevel: "Cardamom Saffron",
      dietary: ["100% Veg", "Fresh Cow Milk", "No Chemicals"],
      image: "assets/images/pack_bikaneri_rasgulla.svg",
      description: "Delicate Bengali-Rajasthani fudge created from kneaded fresh chhena, pistachio paste, and Kashmiri saffron.",
      ingredients: "Fresh Cow Milk Chhena, Saffron (Kesar), Pistachios, Sugar, Cardamom.",
      nutrition: { energy: "320 kcal", fat: "11g", carbs: "46g", protein: "10g" },
      inStock: true,
      variants: [
        { weight: "500 g Box", price: 389, originalPrice: 449 },
        { weight: "1 kg Box", price: 749, originalPrice: 849 }
      ]
    },
    {
      id: "p73",
      name: "Meerav Royal Dodha Barfi Luxury Box",
      category: "sweets-combos",
      tag: "Caramel Milk Fudge",
      rating: 4.9,
      reviewsCount: 360,
      spiceLevel: "Caramel Nutty",
      dietary: ["100% Veg", "Slow Caramelized Milk", "Rich Nuts"],
      image: "assets/images/pack_festive_box.svg",
      description: "Dense, chewy caramelized milk fudge studded with sprouted wheat and loaded with toasted cashews and almonds.",
      ingredients: "Condensed Whole Milk, Sprouted Wheat Flour, Cashews, Almonds, Pure Ghee, Sugar.",
      nutrition: { energy: "480 kcal", fat: "22g", carbs: "56g", protein: "11g" },
      inStock: true,
      variants: [
        { weight: "500 g Box", price: 419, originalPrice: 479 },
        { weight: "1 kg Box", price: 799, originalPrice: 899 }
      ]
    },
    {
      id: "p74",
      name: "Meerav Moong Dal Halwa Keepsake Tin",
      category: "sweets-combos",
      tag: "Royal Moong Halwa",
      rating: 5.0,
      reviewsCount: 460,
      spiceLevel: "Cardamom Desi Ghee",
      dietary: ["100% Veg", "Desi Ghee Roasted", "Ready To Eat"],
      image: "assets/images/pack_bikaneri_rasgulla.svg",
      description: "Legendary winter delicacy made by slow-roasting soaked moong dal paste in generous pure desi ghee and mawa.",
      ingredients: "Moong Dal Paste, Pure Desi Cow Ghee, Mawa, Sugar, Almonds, Saffron.",
      nutrition: { energy: "560 kcal", fat: "34g", carbs: "52g", protein: "12g" },
      inStock: true,
      variants: [
        { weight: "500 g Tin", price: 449, originalPrice: 519 },
        { weight: "1 kg Tin", price: 859, originalPrice: 989 }
      ]
    },
    {
      id: "p75",
      name: "Meerav Royal Imperial 4-Tin Hamper",
      category: "sweets-combos",
      tag: "Velvet Gift Box",
      rating: 5.0,
      reviewsCount: 520,
      spiceLevel: "Assorted Royal Sweets & Savories",
      dietary: ["100% Veg", "Luxury Velvet Box", "4 Keepsake Tins"],
      image: "assets/images/pack_festive_box.svg",
      description: "Imperial gift hamper with Rasgulla Tin (1kg), Gulab Jamun Tin (1kg), Kaju Mixture (500g), and Aloo Bhujia (500g).",
      ingredients: "Assorted Bikaneri Sweets and Savories packed in royal velvet gift casing.",
      nutrition: { energy: "Varies per sweet", fat: "-", carbs: "-", protein: "-" },
      inStock: true,
      variants: [
        { weight: "3 kg Grand Hamper", price: 2199, originalPrice: 2599 },
        { weight: "5 kg Imperial Hamper", price: 3499, originalPrice: 3999 }
      ]
    }
  ],

  initialOrders: [
    {
      id: "MEERAV-8801",
      date: "21 Aug 2026, 11:30 AM",
      customer: {
        name: "Pooja Sharma",
        phone: "+91 98201 44521",
        email: "pooja.sharma@example.com",
        address: "Flat 402, Sea Breeze Apts, Bandra West, Mumbai, MH",
        pincode: "400050"
      },
      items: [
        { id: "p1-200g", name: "Meerav Authentic Aloo Bhujia", weight: "200 g", price: 99, qty: 2 },
        { id: "p2-500g", name: "Meerav Royal Bikaneri Moth Bhujia", weight: "500 g", price: 249, qty: 1 }
      ],
      totalAmount: 467,
      paymentMethod: "UPI (Auto-Verified)",
      paymentStatus: "Paid",
      orderStatus: "Dispatched",
      trackingNumber: "DTDC-88492019",
      driver: {
        name: "Ramesh Bishnoi",
        phone: "+91 98765 12345",
        vehicle: "Electric Van (RJ-07-EA-4921)",
        lat: 19.0620,
        lng: 72.8350,
        etaMins: 18
      }
    },
    {
      id: "MEERAV-8799",
      date: "20 Aug 2026, 04:15 PM",
      customer: {
        name: "Vikram Rathore",
        phone: "+91 94140 88219",
        email: "vikram.rathore@example.com",
        address: "12, Sadul Colony, Bikaner, Rajasthan",
        pincode: "334001"
      },
      items: [
        { id: "p4-500g", name: "Meerav Shahi Kaju Dry Fruit Mixture", weight: "500 g", price: 489, qty: 1 },
        { id: "p8-1.2kg", name: "Grand Celebration Bikaneri Gift Box", weight: "1.2 kg Box", price: 899, qty: 1 }
      ],
      totalAmount: 1388,
      paymentMethod: "Credit Card",
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      trackingNumber: "BLUEDART-9921048",
      driver: {
        name: "Suresh Meena",
        phone: "+91 98290 55432",
        vehicle: "Delivery Van (RJ-07-G-1102)",
        lat: 28.0250,
        lng: 73.3150,
        etaMins: 0
      }
    }
  ],

  customers: [
    {
      id: "c1",
      name: "Pooja Sharma",
      phone: "+91 98201 44521",
      email: "pooja.sharma@example.com",
      address: "Flat 402, Sea Breeze Apts, Bandra West, Mumbai, MH",
      ordersCount: 4,
      totalSpent: 2840
    },
    {
      id: "c2",
      name: "Vikram Rathore",
      phone: "+91 94140 88219",
      email: "vikram.rathore@example.com",
      address: "12, Sadul Colony, Bikaner, Rajasthan",
      ordersCount: 7,
      totalSpent: 6420
    },
    {
      id: "c3",
      name: "Amit Singhal",
      phone: "+91 98110 33412",
      email: "amit.singhal@delhifood.com",
      address: "B-44, Greater Kailash 1, New Delhi",
      ordersCount: 3,
      totalSpent: 2190
    },
    {
      id: "c4",
      name: "Sneha Patel",
      phone: "+91 98980 12345",
      email: "sneha.patel@ahmedabad.com",
      address: "301, Shivalik Apts, Satellite, Ahmedabad",
      ordersCount: 5,
      totalSpent: 3950
    }
  ],

  notificationLogs: [
    {
      id: "NOTIF-101",
      type: "WhatsApp",
      recipient: "+91 98201 44521 (Pooja Sharma)",
      template: "Order Dispatched #MEERAV-8801",
      time: "21 Aug, 11:32 AM",
      status: "Delivered & Read",
      statusColor: "green"
    },
    {
      id: "NOTIF-102",
      type: "Email",
      recipient: "vikram.rathore@example.com",
      template: "Invoice Receipt #MEERAV-8799",
      time: "20 Aug, 04:16 PM",
      status: "Delivered",
      statusColor: "blue"
    }
  ]
};
