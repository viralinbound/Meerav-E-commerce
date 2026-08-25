/**
 * MEERAV - LIVE SITE THEME & DYNAMIC BRAND TRANSFORMATION ENGINE
 * Loaded on every page right after supabase-client.js. Fetches the single
 * `site_settings` row and applies branding (logo/favicon/name/SEO), theme
 * (colors/font/border-radius), commercials (currency, shipping), and storefront
 * copy (announcement bar, WhatsApp, UPI, footer, text blocks) at runtime.
 */

const DEFAULT_SITE_SETTINGS = {
  siteName: 'MEERAV Namkeens & Sweets',
  tagline: 'From the Heart of Bikaner',
  logoUrl: 'assets/images/meerav_logo.png',
  faviconUrl: 'assets/images/meerav_logo.png',
  primaryColor: '#4A0713',
  secondaryColor: '#32040C',
  accentColor: '#E59819',
  accentLightColor: '#FBBF24',
  backgroundType: 'solid',
  backgroundColor: '#FFF9ED',
  backgroundGradient: ['#FFF9ED', '#FDF1D0', '#E59819'],
  backgroundImageUrl: '',
  backgroundPatternOverlay: false,
  backgroundPattern: 'none',
  backgroundPatternImageUrl: '',
  adminPanelColor: '#1F0307',
  adminPanelType: 'solid',
  adminPanelGradient: ['#32040C', '#1F0307', '#030712'],
  textColor: '#1F1517',
  headingColor: '#32040C',
  fontFamily: 'Outfit',
  headingFontFamily: 'Outfit',
  baseFontSize: '16px',
  borderRadius: 'rounded-2xl',
  currencySymbol: '₹',
  currencyCode: 'INR',
  heroVideoUrl: 'assets/videos/meerav_brand_film.mp4',
  heroImageUrl: 'assets/images/commercial_scene_1.jpg',
  heroCtaText: 'Order Online Now',
  heroCtaLink: 'category.html',
  heroSecondaryCtaText: 'Explore Categories',
  shippingFlatFee: 50,
  freeShippingThreshold: 499,
  metaTitle: 'MEERAV - Authentic Bikaneri Namkeens & Sweets',
  metaDescription: 'Handcrafted authentic Bikaneri namkeens, sweets and royal delicacies prepared in 100% pure oil.',
  metaKeywords: 'namkeen, bikaneri bhujia, sweets, snacks, pure oil',
  ogImageUrl: '',
  announcementText: 'Prepared in Pure & Clean Oil • Use coupon MEERAV10 for 10% Off!',
  whatsappNumber: '+919876543210',
  contactEmail: 'hello@meeravnamkeens.com',
  contactPhone: '+91 98765 43210',
  contactAddress: 'Bikaner, Rajasthan, India',
  footerText: '© 2026 All Rights Reserved.',
  instagramUrl: '',
  facebookUrl: '',
  chatbotEnabled: true,
  chatbotName: 'Meerav AI Sommelier',
  chatbotSubtitle: 'Order Assistant & Personalization',
  chatbotAvatarIcon: 'fa-robot',
  chatbotColor: '#E59819',
  chatbotGreeting: '',
  chatbotQuickPrompts: [
    { label: 'Order Spicy', prompt: 'Help me order spicy snacks for today' },
    { label: 'Diet & Roasted', prompt: 'Show me roasted diet snacks with zero palm oil' },
    { label: 'Gift Boxes', prompt: 'I want gift boxes and sweets for celebration' },
    { label: 'Track Van', prompt: 'Where is my order delivery van right now?' }
  ],
  paymentUpiEnabled: true,
  paymentUpiId: 'meeravnamkeens@upi',
  paymentCodEnabled: true,
  paymentCardEnabled: true,
  paymentNetbankingEnabled: true,
  paymentRazorpayEnabled: false,
  paymentRazorpayKeyId: '',
  paymentStripeEnabled: false,
  paymentStripePublishableKey: ''
};

window.SITE_SETTINGS = { ...DEFAULT_SITE_SETTINGS };

/**
 * Global Price Formatter — uses the client's configured currency symbol
 * everywhere across the storefront, cart, checkout, and admin portal.
 */
window.formatPrice = function(amount, symbol) {
  const sym = symbol !== undefined ? symbol : ((window.SITE_SETTINGS && window.SITE_SETTINGS.currencySymbol) || '₹');
  const num = Number(amount) || 0;
  const formatted = (num % 1 === 0) ? num.toLocaleString() : num.toFixed(2);
  return `${sym}${formatted}`;
};

const GOOGLE_FONT_STACKS = {
  'Outfit': "'Outfit', sans-serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
  'Poppins': "'Poppins', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  'Inter': "'Inter', sans-serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Merriweather': "'Merriweather', serif",
  'Lora': "'Lora', serif",
  'Roboto': "'Roboto', sans-serif",
  'Nunito': "'Nunito', sans-serif",
  'Raleway': "'Raleway', sans-serif",
  'Work Sans': "'Work Sans', sans-serif",
  'DM Sans': "'DM Sans', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'Cormorant Garamond': "'Cormorant Garamond', serif",
  'Cinzel': "'Cinzel', serif",
  'Bebas Neue': "'Bebas Neue', sans-serif",
  'Josefin Sans': "'Josefin Sans', sans-serif",
  'Cinzel Decorative': "'Cinzel Decorative', serif"
};

function digitsOnly(str) {
  return (str || '').replace(/\D/g, '');
}

/**
 * Curated 1-Click Brand Transformation Kits
 * Instantly re-themes the entire website (colors, fonts, borders, identity, copy) with 1 click.
 */
const THEME_PRESETS = [
  {
    key: 'royal-heritage',
    name: 'Royal Heritage',
    category: 'Ethnic Snacks & Sweets',
    swatches: ['#4A0713', '#E59819', '#FFF9ED'],
    values: {
      siteName: 'MEERAV Namkeens & Sweets',
      tagline: 'From the Heart of Bikaner',
      announcementText: 'Prepared in Pure & Clean Oil • Use coupon MEERAV10 for 10% Off!',
      heroCtaText: 'Order Fresh Namkeen',
      heroSecondaryCtaText: 'Explore Categories',
      heroCtaLink: 'category.html',
      primaryColor: '#4A0713', secondaryColor: '#32040C', accentColor: '#E59819', accentLightColor: '#FBBF24',
      headingColor: '#32040C', textColor: '#1F1517', backgroundType: 'solid', backgroundColor: '#FFF9ED',
      backgroundGradient: ['#FFF9ED', '#FDF1D0', '#E59819'], backgroundPattern: 'dots',
      fontFamily: 'Plus Jakarta Sans', headingFontFamily: 'Outfit', borderRadius: 'rounded-2xl', adminPanelColor: '#1F0307',
      metaTitle: 'MEERAV - Authentic Bikaneri Namkeens & Sweets',
      metaDescription: 'Handcrafted authentic Bikaneri namkeens, sweets and royal delicacies prepared in 100% pure oil.'
    },
    contentOverrides: [
      { key: 'hero.badge', value: '100% Pure Oil & Authentic Bikaneri Spices' },
      { key: 'hero.title', value: 'Royal Taste of Authentic Bikaner' },
      { key: 'hero.subtitle', value: 'Handcrafted namkeens, golden bhujia, crispy mathri and royal sweets prepared fresh in pure oil.' },
      { key: 'story.title', value: 'Four Decades of Royal Bikaneri Craftsmanship' },
      { key: 'story.body', value: 'Born in the royal alleys of Bikaner, our recipes have been preserved across generations. We never use palm oil or artificial preservatives.' },
      { key: 'reviews.title', value: 'Loved by Over 50,000+ Snack Connoisseurs' },
      { key: 'faq.title', value: 'Frequently Asked Questions' },
      { key: 'footer.bio', value: 'Authentic royal Bikaneri namkeens, bhujia and sweets crafted in pure oil with heritage recipes.' }
    ]
  },
  {
    key: 'midnight-luxury',
    name: 'Midnight Luxury',
    category: 'Gourmet Chocolates & Delicacies',
    swatches: ['#0A0A0A', '#D4AF37', '#1A1A1A'],
    values: {
      siteName: 'AURELIA Gourmet Delicacies',
      tagline: 'Handcrafted Single-Origin Luxury Confectionery',
      announcementText: 'Complimentary Luxury Velvet Gift Packaging on All Orders • Code: LUXE20',
      heroCtaText: 'Explore Luxury Reserve',
      heroSecondaryCtaText: 'View Tasting Menu',
      heroCtaLink: 'category.html',
      primaryColor: '#0A0A0A', secondaryColor: '#000000', accentColor: '#D4AF37', accentLightColor: '#F5D580',
      headingColor: '#D4AF37', textColor: '#E5E5E5', backgroundType: 'solid', backgroundColor: '#141414',
      backgroundGradient: ['#141414', '#0A0A0A', '#D4AF37'], backgroundPattern: 'none',
      fontFamily: 'Josefin Sans', headingFontFamily: 'Cinzel', borderRadius: 'rounded-lg', adminPanelColor: '#000000',
      metaTitle: 'AURELIA - Haute Confectionery & Luxury Treats',
      metaDescription: 'Artisanal single-origin cocoa truffles, gold-dusted pralines, and gourmet confections.'
    },
    contentOverrides: [
      { key: 'hero.badge', value: 'Handcrafted by Master Confectioners' },
      { key: 'hero.title', value: 'The Pinnacle of Luxury Confectionery' },
      { key: 'hero.subtitle', value: 'Artisanal single-origin cocoa truffles, velvety pralines, and gold-dusted treats crafted for true connoisseurs.' },
      { key: 'story.title', value: 'The Art of Haute Gastronomy' },
      { key: 'story.body', value: 'Every creation is an exquisite masterpiece, pairing centuries-old European confection techniques with ultra-rare, sustainably sourced ingredients.' },
      { key: 'reviews.title', value: 'Acclaimed by Michelin-Trained Palates' },
      { key: 'faq.title', value: 'Connoisseur Inquiries & Rare Reserving' },
      { key: 'footer.bio', value: 'Pinnacle luxury confections and bespoke reserve gifts crafted with uncompromised artistry.' }
    ]
  },
  {
    key: 'forest-organic',
    name: 'Forest Organic',
    category: 'Ayurveda, Teas & Superfoods',
    swatches: ['#14532D', '#65A30D', '#F7FEE7'],
    values: {
      siteName: 'VEDA Pure Organics',
      tagline: 'Rooted in Nature • 100% Certified Organic Superfoods',
      announcementText: 'Harvested from Wild Organic Valley Farms • Zero Chemicals Guaranteed',
      heroCtaText: 'Shop Organic Harvest',
      heroSecondaryCtaText: 'Our Farm Origins',
      heroCtaLink: 'category.html',
      primaryColor: '#14532D', secondaryColor: '#052E16', accentColor: '#65A30D', accentLightColor: '#A3E635',
      headingColor: '#14532D', textColor: '#1C1917', backgroundType: 'solid', backgroundColor: '#F7FEE7',
      backgroundGradient: ['#F7FEE7', '#ECFCCB', '#65A30D'], backgroundPattern: 'grid',
      fontFamily: 'Nunito', headingFontFamily: 'Josefin Sans', borderRadius: 'rounded-3xl', adminPanelColor: '#031A0E',
      metaTitle: 'VEDA Organics - Certified Organic Nutrition & Superfoods',
      metaDescription: 'Raw, non-GMO, cold-pressed superfoods and organic snacks sourced directly from sustainable farms.'
    },
    contentOverrides: [
      { key: 'hero.badge', value: '100% Certified Organic & Non-GMO' },
      { key: 'hero.title', value: 'Pure Nourishment from Nature’s Superfoods' },
      { key: 'hero.subtitle', value: 'Ethically harvested roasted seeds, stone-ground superfoods, and ancient wellness snacks.' },
      { key: 'story.title', value: 'From Pristine Valleys to Your Table' },
      { key: 'story.body', value: 'We partner directly with sustainable regenerative farms to bring you living nutrients without industrial processing.' },
      { key: 'reviews.title', value: 'Loved by 30,000+ Health & Wellness Enthusiasts' },
      { key: 'faq.title', value: 'Organic Certifications & Purity Questions' },
      { key: 'footer.bio', value: 'Empowering pure, clean living through sustainably harvested organic nutrition and ancient superfoods.' }
    ]
  },
  {
    key: 'ocean-breeze',
    name: 'Ocean Breeze',
    category: 'Beverages & Coastal Delights',
    swatches: ['#0C4A6E', '#0EA5E9', '#F0F9FF'],
    values: {
      siteName: 'PACIFICA Coastal Treats',
      tagline: 'Sun-Kissed Flavors & Crisp Sea Salt',
      announcementText: 'Fresh Wave of Delights • Free Express Shipping on Orders Above ₹499',
      heroCtaText: 'Taste the Coast',
      heroSecondaryCtaText: 'View All Flavors',
      heroCtaLink: 'category.html',
      primaryColor: '#0C4A6E', secondaryColor: '#082F49', accentColor: '#0EA5E9', accentLightColor: '#7DD3FC',
      headingColor: '#0C4A6E', textColor: '#1E293B', backgroundType: 'gradient', backgroundColor: '#F0F9FF',
      backgroundGradient: ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC'], backgroundPattern: 'waves',
      fontFamily: 'Inter', headingFontFamily: 'Space Grotesk', borderRadius: 'rounded-2xl', adminPanelColor: '#031B2E',
      metaTitle: 'PACIFICA - Handcrafted Coastal Treats & Sea Salt Snacks',
      metaDescription: 'Crispy artisanal kettle snacks seasoned with pure mineral sea salt and coastal botanicals.'
    },
    contentOverrides: [
      { key: 'hero.badge', value: 'Mineral Sea Salt & Coastal Herbs' },
      { key: 'hero.title', value: 'Crisp Coastal Crunch in Every Bite' },
      { key: 'hero.subtitle', value: 'Kettle-cooked crisps seasoned with pure sea salt, sun-ripened citrus zest, and refreshing coastal spices.' },
      { key: 'story.title', value: 'Inspired by Pacific Shores & Sunlit Waves' },
      { key: 'story.body', value: 'Born along breezy coastal shores, our artisanal snacks bring the vibrant spirit and refreshing zest of the seaside to every bag.' },
      { key: 'reviews.title', value: 'Rated 4.9 Stars Across Coastal Foodies' },
      { key: 'faq.title', value: 'Frequently Asked Questions' },
      { key: 'footer.bio', value: 'Handcrafted seaside snacks infused with sun-kissed coastal zest and clean ingredients.' }
    ]
  },
  {
    key: 'pastel-bakery',
    name: 'Pastel Bakery',
    category: 'Artisan Cafe & Confectionery',
    swatches: ['#BE185D', '#F472B6', '#FDF2F8'],
    values: {
      siteName: 'MAISON DE PATISSERIE',
      tagline: 'Freshly Baked Parisian Bliss Every Morning',
      announcementText: 'Fresh Warm Batch Out of the Oven! Order Sweet Treats Directly Home.',
      heroCtaText: 'Order Fresh Bakes',
      heroSecondaryCtaText: 'Our Bakery Menu',
      heroCtaLink: 'category.html',
      primaryColor: '#BE185D', secondaryColor: '#831843', accentColor: '#F472B6', accentLightColor: '#FBCFE8',
      headingColor: '#831843', textColor: '#44403C', backgroundType: 'gradient', backgroundColor: '#FDF2F8',
      backgroundGradient: ['#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4'], backgroundPattern: 'dots',
      fontFamily: 'Poppins', headingFontFamily: 'Cormorant Garamond', borderRadius: 'rounded-3xl', adminPanelColor: '#3B0A20',
      metaTitle: 'Maison de Patisserie - French Macarons & Artisanal Bakery',
      metaDescription: 'Authentic French macarons, buttery croissants, and handcrafted dessert boxes delivered fresh.'
    },
    contentOverrides: [
      { key: 'hero.badge', value: '100% Pure Normandy Butter & Belgian Cocoa' },
      { key: 'hero.title', value: 'Whimsical Cakes & Golden Pastries' },
      { key: 'hero.subtitle', value: 'Delicate French macarons, flaky pastries, and dreamy gourmet dessert boxes crafted with love.' },
      { key: 'story.title', value: 'A Parisian Dream in Every Bake' },
      { key: 'story.body', value: 'From our flour-dusted boutique bakery, we hand-roll every pastry following time-honored French baking techniques.' },
      { key: 'reviews.title', value: 'Sweet Praises from Dessert Lovers' },
      { key: 'faq.title', value: 'Bakery Shelf Life & Freshness FAQs' },
      { key: 'footer.bio', value: 'Artisanal French pastries, macarons and celebratory confection boxes baked fresh daily.' }
    ]
  },
  {
    key: 'minimalist-urban',
    name: 'Minimalist Urban',
    category: 'Specialty Coffee & Modern Lifestyle',
    swatches: ['#18181B', '#EA580C', '#FAFAFA'],
    values: {
      siteName: 'MONOLITH Lifestyle & Coffee',
      tagline: 'Precision Engineered for Daily Peak Focus',
      announcementText: 'Single-Origin Micro-Lots & Functional Energy Snacks In Stock.',
      heroCtaText: 'Shop Precision Fuel',
      heroSecondaryCtaText: 'View Batch Roasts',
      heroCtaLink: 'category.html',
      primaryColor: '#18181B', secondaryColor: '#09090B', accentColor: '#EA580C', accentLightColor: '#FB923C',
      headingColor: '#18181B', textColor: '#3F3F46', backgroundType: 'solid', backgroundColor: '#FAFAFA',
      backgroundGradient: ['#FAFAFA', '#F4F4F5', '#E4E4E7'], backgroundPattern: 'none',
      fontFamily: 'Work Sans', headingFontFamily: 'Bebas Neue', borderRadius: 'rounded-none', adminPanelColor: '#09090B',
      metaTitle: 'MONOLITH - Precision Roasts & Functional Nutrition',
      metaDescription: 'Direct-trade specialty coffee and high-performance clean energy bites.'
    },
    contentOverrides: [
      { key: 'hero.badge', value: '100% Direct-Trade & Zero Fillers' },
      { key: 'hero.title', value: 'Precision Craft. Unrivaled Performance.' },
      { key: 'hero.subtitle', value: 'Micro-lot single-origin beans and clean energy bites engineered for modern creators.' },
      { key: 'story.title', value: 'Engineered for the Modern Minimalist' },
      { key: 'story.body', value: 'Stripped of all unnecessary noise. We obsess over batch consistency, micro-roasting science, and clean nutrition.' },
      { key: 'reviews.title', value: 'Endorsed by Top Creators & Athletes' },
      { key: 'faq.title', value: 'Roast Profiles & Shipping FAQs' },
      { key: 'footer.bio', value: 'Architecturally clean specialty roasts and functional performance fuel for modern creators.' }
    ]
  },
  {
    key: 'sunset-artisanal',
    name: 'Sunset Artisanal',
    category: 'Spices, Pickles & Gourmet Foods',
    swatches: ['#991B1B', '#F97316', '#FFFBEB'],
    values: {
      siteName: 'AVADH Heritage Spices & Achar',
      tagline: 'Slow Sun-Cured in Clay Pots with Pure Mustard Oil',
      announcementText: 'Grandmother’s 100-Year-Old Clay Pot Sun-Cured Recipes • 100% Natural',
      heroCtaText: 'Shop Clay-Pot Achars',
      heroSecondaryCtaText: 'Our Sun-Curing Process',
      heroCtaLink: 'category.html',
      primaryColor: '#991B1B', secondaryColor: '#7F1D1D', accentColor: '#F97316', accentLightColor: '#FDBA74',
      headingColor: '#7F1D1D', textColor: '#292524', backgroundType: 'solid', backgroundColor: '#FFFBEB',
      backgroundGradient: ['#FFFBEB', '#FEF3C7', '#FDE68A'], backgroundPattern: 'stripes',
      fontFamily: 'Playfair Display', headingFontFamily: 'Outfit', borderRadius: 'rounded-2xl', adminPanelColor: '#2C0B0E',
      metaTitle: 'AVADH - Heritage Spices & Sun-Cured Pickles',
      metaDescription: 'Authentic clay-pot fermented achars, stone-ground whole spices and traditional condiments.'
    },
    contentOverrides: [
      { key: 'hero.badge', value: '90-Day Naturally Sun-Cured in Clay Pots' },
      { key: 'hero.title', value: 'Timeless Flavors of Clay-Pot Spices' },
      { key: 'hero.subtitle', value: 'Authentic sun-cured achars, stone-ground masalas, and hand-pounded condiments made without preservatives.' },
      { key: 'story.title', value: 'The Lost Art of Slow Sun-Curing' },
      { key: 'story.body', value: 'Every jar is matured under the open sun for 90 days inside natural earthenware jars with cold-pressed mustard oil.' },
      { key: 'reviews.title', value: 'Trusted by Generations of Families' },
      { key: 'faq.title', value: 'Sun-Curing & Natural Preservation FAQs' },
      { key: 'footer.bio', value: 'Traditional earthenware fermented achars, artisanal condiments and stone-ground spices.' }
    ]
  }
];
window.THEME_PRESETS = THEME_PRESETS;

function hexToRgba(hex, opacityPercent) {
  const clean = (hex || '000000').replace('#', '');
  const r = parseInt(clean.substring(0, 2) || '00', 16);
  const g = parseInt(clean.substring(2, 4) || '00', 16);
  const b = parseInt(clean.substring(4, 6) || '00', 16);
  return `rgba(${r},${g},${b},${Number(opacityPercent) / 100})`;
}

function darkenHex(hex, factor) {
  const clean = (hex || '000000').replace('#', '');
  const r = Math.round(parseInt(clean.substring(0, 2) || '00', 16) * factor);
  const g = Math.round(parseInt(clean.substring(2, 4) || '00', 16) * factor);
  const b = Math.round(parseInt(clean.substring(4, 6) || '00', 16) * factor);
  return `rgb(${r},${g},${b})`;
}

function cssPropFor(prefix) {
  const map = {
    bg: 'background-color', text: 'color', border: 'border-color', ring: '--tw-ring-color',
    decoration: 'text-decoration-color', divide: 'border-color', outline: 'outline-color',
    shadow: '--tw-shadow-color', fill: 'fill', stroke: 'stroke', accent: 'accent-color', caret: 'caret-color',
    from: '--tw-gradient-from', to: '--tw-gradient-to', via: '--tw-gradient-via'
  };
  return map[prefix] || 'color';
}

function applyBrandColors(s) {
  const swatches = [
    { from: '4A0713', to: s.primaryColor },
    { from: '32040C', to: s.secondaryColor },
    { from: 'E59819', to: s.accentColor },
    { from: 'FBBF24', to: s.accentLightColor },
    { from: 'FFF9ED', to: s.backgroundColor },
    { from: '1F1517', to: s.textColor },
    { from: '1F0307', to: s.adminPanelColor }
  ];

  const prefixes = ['bg', 'text', 'border', 'ring', 'from', 'to', 'via', 'decoration', 'divide', 'outline', 'shadow', 'fill', 'stroke', 'accent', 'caret'];
  const stateVariants = ['', 'hover:', 'focus:', 'active:', 'group-hover:', 'sm:', 'md:', 'lg:'];
  let css = '';

  swatches.forEach(({ from, to }) => {
    if (!to || to.toUpperCase() === `#${from}`) return;
    prefixes.forEach(prefix => {
      stateVariants.forEach(state => {
        const escapedState = state.replace(':', '\\:');
        css += `.${escapedState}${prefix}-\\[\\#${from}\\]{${cssPropFor(prefix)}:${to} !important;}\n`;
      });
    });
    ['10', '20', '30', '40', '50', '60', '70', '80', '90'].forEach(op => {
      css += `.bg-\\[\\#${from}\\]\\/${op}{background-color:${hexToRgba(to, op)} !important;}\n`;
      css += `.border-\\[\\#${from}\\]\\/${op}{border-color:${hexToRgba(to, op)} !important;}\n`;
      css += `.text-\\[\\#${from}\\]\\/${op}{color:${hexToRgba(to, op)} !important;}\n`;
    });
  });

  swatches.forEach(({ from, to }) => {
    if (!to || to.toUpperCase() === `#${from}`) return;
    css += `.from-\\[\\#${from}\\]{--tw-gradient-from:${to} var(--tw-gradient-from-position) !important;}\n`;
    css += `.to-\\[\\#${from}\\]{--tw-gradient-to:${to} var(--tw-gradient-to-position) !important;}\n`;
  });

  const adminGradientStops = (s.adminPanelType === 'gradient' && Array.isArray(s.adminPanelGradient) && s.adminPanelGradient.length >= 2)
    ? s.adminPanelGradient.filter(Boolean).join(', ')
    : `${s.adminPanelColor}, ${darkenHex(s.adminPanelColor, 0.65)}`;
  css += `.admin-sidebar{background:linear-gradient(180deg, ${adminGradientStops}) !important;}\n`;
  css += `.admin-nav-item.active{background:linear-gradient(135deg, ${s.primaryColor} 0%, ${s.secondaryColor} 100%) !important;}\n`;
  css += `.from-\\[\\#32040C\\].via-\\[\\#1F0307\\].to-gray-950{background-image:linear-gradient(to bottom right, ${adminGradientStops}) !important;}\n`;
  css += `.bg-gradient-to-r.from-\\[\\#32040C\\].via-\\[\\#1F0307\\].to-gray-950{background-image:linear-gradient(to right, ${adminGradientStops}) !important;}\n`;

  // Root design tokens
  css += `:root{
    --brand-primary:${s.primaryColor};
    --brand-secondary:${s.secondaryColor};
    --brand-accent:${s.accentColor};
    --brand-accent-light:${s.accentLightColor};
    --brand-bg:${s.backgroundColor};
    --brand-text:${s.textColor};
    --brand-heading:${s.headingColor};
    --meerav-maroon:${s.primaryColor};
    --meerav-maroon-dark:${s.secondaryColor};
    --meerav-maroon-light:${s.primaryColor};
    --meerav-gold:${s.accentColor};
    --meerav-gold-light:${s.accentLightColor};
    --meerav-cream:${s.backgroundColor};
    --meerav-cream-dark:${s.backgroundColor};
    --meerav-text-dark:${s.textColor};
  }\n`;
  css += `body{color:${s.textColor} !important;}\n`;

  let styleTag = document.getElementById('dynamic-brand-theme');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-brand-theme';
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = css;
}

function applyFont(s) {
  const bodyFamily = s.fontFamily || 'Outfit';
  const headingFamily = s.headingFontFamily || bodyFamily;

  const linkId = 'dynamic-google-font';
  let link = document.getElementById(linkId);
  const families = [...new Set([bodyFamily, headingFamily])]
    .map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800;900`)
    .join('&');
  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;

  const bodyStack = GOOGLE_FONT_STACKS[bodyFamily] || `'${bodyFamily}', sans-serif`;
  const headingStack = GOOGLE_FONT_STACKS[headingFamily] || `'${headingFamily}', sans-serif`;

  let styleTag = document.getElementById('dynamic-font-override');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-font-override';
    document.head.appendChild(styleTag);
  }

  let radiusCss = '';
  if (s.borderRadius === 'rounded-none') {
    radiusCss = `.rounded-2xl, .rounded-3xl, .rounded-xl { border-radius: 0px !important; }`;
  } else if (s.borderRadius === 'rounded-lg') {
    radiusCss = `.rounded-2xl, .rounded-3xl { border-radius: 8px !important; }`;
  } else if (s.borderRadius === 'rounded-3xl') {
    radiusCss = `.rounded-2xl { border-radius: 24px !important; }`;
  }

  styleTag.textContent = `
    html{font-size:${s.baseFontSize || '16px'};}
    body{font-family:${bodyStack};}
    h1,h2,h3,h4,h5,h6,.brand-font{font-family:${headingStack} !important;color:${s.headingColor};}
    ${radiusCss}
  `;
}

function applyBackground(s) {
  let bg = s.backgroundColor;

  if (s.backgroundType === 'gradient' && Array.isArray(s.backgroundGradient) && s.backgroundGradient.length >= 2) {
    bg = `linear-gradient(135deg, ${s.backgroundGradient.join(', ')})`;
  } else if (s.backgroundType === 'image' && s.backgroundImageUrl) {
    bg = `url('${s.backgroundImageUrl}') center/cover fixed no-repeat, ${s.backgroundColor}`;
  }

  let styleTag = document.getElementById('dynamic-background');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-background';
    document.head.appendChild(styleTag);
  }

  let css = `body{background:${bg} !important;background-color:${s.backgroundColor} !important;}\n`;
  const patternCss = buildPatternCss(s.backgroundPattern, s.primaryColor, s.accentColor, s.backgroundPatternImageUrl);
  if (patternCss) {
    css += `body::before{content:'';position:fixed;inset:0;pointer-events:none;${patternCss}}\n`;
  }

  styleTag.textContent = css;
}

function buildPatternCss(pattern, primaryColor, accentColor, patternImageUrl) {
  switch (pattern) {
    case 'dots':
      return `background-image:radial-gradient(${accentColor} 0.75px, transparent 0.75px), radial-gradient(${primaryColor} 0.75px, transparent 0.75px);background-size:30px 30px;background-position:0 0, 15px 15px;opacity:0.12;`;
    case 'grid':
      return `background-image:linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px);background-size:32px 32px;opacity:0.08;`;
    case 'stripes':
      return `background-image:repeating-linear-gradient(45deg, ${accentColor}, ${accentColor} 2px, transparent 2px, transparent 18px);opacity:0.08;`;
    case 'waves':
      return `background-image:radial-gradient(circle at 50% 0, transparent 24%, ${accentColor} 25%, ${accentColor} 26%, transparent 27%, transparent 74%, ${primaryColor} 75%, ${primaryColor} 76%, transparent 77%, transparent);background-size:56px 100px;opacity:0.07;`;
    case 'custom-image':
      if (!patternImageUrl) return '';
      return `background-image:url('${patternImageUrl}');background-repeat:repeat;background-size:120px;opacity:0.15;`;
    default:
      return '';
  }
}

function applyBranding(s) {
  // Logo
  document.querySelectorAll('img[src*="meerav_logo"]').forEach(img => {
    if (s.logoUrl) img.src = s.logoUrl;
  });

  // Favicon
  let favicon = document.getElementById('site-favicon');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.id = 'site-favicon';
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  favicon.href = s.faviconUrl || s.logoUrl || 'assets/images/meerav_logo.png';

  // Meta Title
  const titleText = s.metaTitle || s.siteName || 'MEERAV Authentic Bikaneri Namkeens';
  if (document.title.includes(' - ')) {
    document.title = document.title.replace(/^[^-]+-/, `${s.siteName || 'MEERAV'} -`);
  } else {
    document.title = titleText;
  }

  // Meta Description & Keywords
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc && s.metaDescription) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  if (metaDesc && s.metaDescription) metaDesc.content = s.metaDescription;

  // Announcement Bar
  const announcementEl = document.getElementById('announcement-bar-text');
  if (announcementEl && s.announcementText) announcementEl.innerHTML = s.announcementText;

  // WhatsApp link & phone
  const whatsappNumEl = document.getElementById('whatsapp-header-number');
  const whatsappLinkEl = document.getElementById('whatsapp-header-link');
  if (s.whatsappNumber) {
    const digits = digitsOnly(s.whatsappNumber);
    if (whatsappLinkEl) whatsappLinkEl.href = `https://wa.me/${digits}`;
    if (whatsappNumEl) whatsappNumEl.textContent = `Order on WhatsApp: ${s.whatsappNumber}`;
  }

  // UPI display
  const upiDisplayEl = document.getElementById('upi-id-display');
  if (upiDisplayEl && s.paymentUpiId) upiDisplayEl.textContent = `UPI: ${s.paymentUpiId}`;

  // Footer Name & Copyright
  const footerNameEl = document.getElementById('footer-brand-name');
  if (footerNameEl && s.siteName) footerNameEl.textContent = s.siteName;

  const footerCopyEl = document.getElementById('footer-copyright');
  if (footerCopyEl && s.footerText) footerCopyEl.textContent = s.footerText;

  // Hero Media Switcher (Video vs Image)
  const heroVideoEl = document.getElementById('hero-brand-video');
  const heroImgEl = document.getElementById('hero-brand-image');
  if (heroVideoEl && s.heroVideoUrl) {
    const source = heroVideoEl.querySelector('source');
    if (source && source.src !== s.heroVideoUrl) {
      source.src = s.heroVideoUrl;
      heroVideoEl.load();
    }
  }
  if (heroImgEl && s.heroImageUrl) {
    heroImgEl.src = s.heroImageUrl;
  }

  // Payment Tabs Toggle
  const tabMap = { upi: s.paymentUpiEnabled, card: s.paymentCardEnabled, netbanking: s.paymentNetbankingEnabled, cod: s.paymentCodEnabled };
  Object.entries(tabMap).forEach(([key, enabled]) => {
    const btn = document.getElementById(`payment-btn-${key}`);
    if (btn) btn.classList.toggle('hidden', !enabled);
  });
}

function applySiteTheme(settings) {
  const s = { ...DEFAULT_SITE_SETTINGS, ...settings };
  window.SITE_SETTINGS = s;
  try { localStorage.setItem('mira_site_settings', JSON.stringify(s)); } catch(e) {}
  applyBrandColors(s);
  applyBackground(s);
  applyFont(s);
  applyBranding(s);
}

function applyPageContent(map) {
  window.SITE_PAGE_CONTENT = map;
  try { localStorage.setItem('mira_page_content', JSON.stringify(map)); } catch(e) {}
  document.querySelectorAll('[data-ck]').forEach(el => {
    const key = el.getAttribute('data-ck');
    if (map[key] !== undefined && map[key] !== null) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = map[key];
      } else if (el.tagName === 'IMG') {
        el.src = map[key];
      } else if (el.tagName === 'I' && (map[key].startsWith('fa') || map[key].includes('fa-'))) {
        el.className = `${map[key]} ${el.className.replace(/fa[sbrl]?\s+fa-[a-z0-9-]+/gi, '')}`.trim();
      } else {
        el.innerHTML = map[key];
      }
    }
  });
}

window.SITE_PAGE_CONTENT = {};

// Synchronous 0ms first-paint hydration from cache
try {
  const cachedSettings = localStorage.getItem('mira_site_settings');
  if (cachedSettings) {
    window.SITE_SETTINGS = { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(cachedSettings) };
    applySiteTheme(window.SITE_SETTINGS);
  }
  const cachedContent = localStorage.getItem('mira_page_content');
  if (cachedContent) {
    window.SITE_PAGE_CONTENT = JSON.parse(cachedContent);
    applyPageContent(window.SITE_PAGE_CONTENT);
  }
} catch(e) {}

// Cross-tab real-time sync (instant update across all open tabs when theme changes)
window.addEventListener('storage', (e) => {
  if (e.key === 'mira_site_settings' && e.newValue) {
    try {
      const s = JSON.parse(e.newValue);
      window.SITE_SETTINGS = { ...DEFAULT_SITE_SETTINGS, ...s };
      applySiteTheme(window.SITE_SETTINGS);
      if (typeof renderStoreProducts === 'function') renderStoreProducts();
      if (typeof renderStoreCart === 'function') renderStoreCart();
    } catch(err) {}
  }
  if (e.key === 'mira_page_content' && e.newValue) {
    try {
      const c = JSON.parse(e.newValue);
      window.SITE_PAGE_CONTENT = c;
      applyPageContent(c);
    } catch(err) {}
  }
});

async function initSiteTheme() {
  if (typeof MiraDB === 'undefined') return;

  try {
    const settings = await MiraDB.fetchSiteSettings();
    if (settings) {
      window.SITE_SETTINGS = { ...DEFAULT_SITE_SETTINGS, ...settings };
      applySiteTheme(window.SITE_SETTINGS);
    }
  } catch (e) {
    console.warn('Site settings fetch note:', e.message);
  }

  try {
    const content = await MiraDB.fetchPageContent();
    if (content && content.map && Object.keys(content.map).length) {
      window.SITE_PAGE_CONTENT = content.map;
      applyPageContent(content.map);
    }
  } catch (e) {
    console.warn('Page content fetch note:', e.message);
  }

  // Realtime Subscriptions
  MiraDB.subscribeTable('site_settings', async () => {
    const updated = await MiraDB.fetchSiteSettings();
    if (updated) {
      window.SITE_SETTINGS = { ...DEFAULT_SITE_SETTINGS, ...updated };
      applySiteTheme(window.SITE_SETTINGS);
      if (typeof renderStoreProducts === 'function') renderStoreProducts();
      if (typeof renderStoreCart === 'function') renderStoreCart();
    }
  });

  MiraDB.subscribeTable('page_content', async () => {
    const updatedContent = await MiraDB.fetchPageContent();
    if (updatedContent && updatedContent.map) {
      window.SITE_PAGE_CONTENT = updatedContent.map;
      applyPageContent(updatedContent.map);
    }
  });
}

// Auto-run on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteTheme);
} else {
  initSiteTheme();
}
