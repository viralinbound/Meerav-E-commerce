/** Row <-> app-shape mappers shared by the storefront and tests. */

export function dbProductToApp(row) {
  const photos = row.photos && row.photos.length ? row.photos : (row.image ? [row.image] : []);
  const videos = row.videos && row.videos.length ? row.videos : (row.video ? [row.video] : []);
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    tag: row.tag,
    rating: Number(row.rating) || 0,
    reviewsCount: row.reviews_count || 0,
    spiceLevel: row.spice_level,
    dietary: row.dietary || [],
    photos,
    videos,
    image: photos[0] || row.image,
    video: videos[0] || row.video || undefined,
    sampleImage: row.sample_image || undefined,
    description: row.description,
    ingredients: row.ingredients,
    nutrition: row.nutrition || {},
    inStock: row.in_stock,
    variants: row.variants || []
  };
}

export function appProductToDb(p) {
  const photos = p.photos && p.photos.length ? p.photos : (p.image ? [p.image] : []);
  const videos = p.videos && p.videos.length ? p.videos : (p.video ? [p.video] : []);
  return {
    id: p.id,
    category: p.category,
    name: p.name,
    tag: p.tag,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    spice_level: p.spiceLevel,
    dietary: p.dietary || [],
    photos,
    videos,
    image: photos[0] || null,
    video: videos[0] || null,
    sample_image: p.sampleImage || null,
    description: p.description,
    ingredients: p.ingredients,
    nutrition: p.nutrition || {},
    in_stock: p.inStock,
    variants: p.variants || []
  };
}

export function dbCategoryToApp(row) {
  return { id: row.id, name: row.name, icon: row.icon, description: row.description, image: row.image || row.image_url || null };
}

export function appCategoryToDb(c) {
  return { id: c.id, name: c.name, icon: c.icon || 'fas fa-cookie', description: c.description || '', image_url: c.image || c.imageUrl || null };
}

export function dbCustomerToApp(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    pincode: row.pincode,
    lat: row.lat,
    lng: row.lng,
    avatar: row.avatar,
    wishlist: row.wishlist || [],
    savedAddresses: row.saved_addresses || []
  };
}

export function appCustomerToDb(c) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    pincode: c.pincode,
    lat: c.lat,
    lng: c.lng,
    avatar: c.avatar || null,
    wishlist: c.wishlist || [],
    saved_addresses: c.savedAddresses || []
  };
}

export function dbOrderToApp(row) {
  return {
    id: row.id,
    orderSeq: row.order_seq != null ? Number(row.order_seq) : null,
    customer: row.customer,
    items: row.items || [],
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    date: row.order_date,
    trackingNumber: row.tracking_number,
    driver: row.driver || {},
    notifications: row.notifications || {}
  };
}

export function appOrderToDb(o) {
  return {
    id: o.id,
    customer: o.customer,
    items: o.items || [],
    total_amount: o.totalAmount,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    order_status: o.orderStatus,
    order_date: o.date,
    tracking_number: o.trackingNumber,
    driver: o.driver || {},
    notifications: o.notifications || {}
  };
}

export function dbNotifToApp(row) {
  return {
    id: row.id,
    type: row.type,
    recipient: row.recipient,
    template: row.template,
    time: row.notif_time,
    status: row.status,
    statusColor: row.status_color
  };
}

export function dbSettingsToApp(row) {
  return {
    siteName: row.site_name,
    tagline: row.tagline,
    logoUrl: row.logo_url,
    faviconUrl: row.favicon_url,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    accentColor: row.accent_color,
    accentLightColor: row.accent_light_color,
    backgroundType: row.background_type,
    backgroundColor: row.background_color,
    backgroundGradient: row.background_gradient,
    backgroundImageUrl: row.background_image_url,
    backgroundPatternOverlay: row.background_pattern_overlay,
    backgroundPattern: row.background_pattern,
    backgroundPatternImageUrl: row.background_pattern_image_url,
    adminPanelColor: row.admin_panel_color,
    adminPanelType: row.admin_panel_type,
    adminPanelGradient: row.admin_panel_gradient,
    textColor: row.text_color,
    headingColor: row.heading_color,
    fontFamily: row.font_family,
    headingFontFamily: row.heading_font_family,
    baseFontSize: row.base_font_size,
    borderRadius: row.border_radius || 'rounded-2xl',
    currencySymbol: row.currency_symbol || '₹',
    currencyCode: row.currency_code || 'INR',
    heroVideoUrl: row.hero_video_url,
    heroImageUrl: row.hero_image_url,
    heroCtaText: row.hero_cta_text || 'Order Online Now',
    heroCtaLink: row.hero_cta_link || 'category.html',
    heroSecondaryCtaText: row.hero_secondary_cta_text || 'Explore Categories',
    shippingFlatFee: Number(row.shipping_flat_fee) || 50,
    freeShippingThreshold: Number(row.free_shipping_threshold) || 499,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    ogImageUrl: row.og_image_url,
    announcementText: row.announcement_text,
    whatsappNumber: row.whatsapp_number,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    contactAddress: row.contact_address,
    footerText: row.footer_text,
    instagramUrl: row.instagram_url,
    facebookUrl: row.facebook_url,
    chatbotEnabled: row.chatbot_enabled !== false,
    chatbotName: row.chatbot_name || 'Meerav AI Sommelier',
    chatbotSubtitle: row.chatbot_subtitle || 'Order Assistant & Personalization',
    chatbotAvatarIcon: row.chatbot_avatar_icon || 'fa-robot',
    chatbotColor: row.chatbot_color || '#E59819',
    chatbotGreeting: row.chatbot_greeting || '',
    chatbotQuickPrompts: row.chatbot_quick_prompts && row.chatbot_quick_prompts.length ? row.chatbot_quick_prompts : null,
    orderIdPrefix: row.order_id_prefix || 'MEERAV-',
    orderIdStartNumber: row.order_id_start_number != null ? Number(row.order_id_start_number) : 1001,
    orderIdPadDigits: row.order_id_pad_digits != null ? Number(row.order_id_pad_digits) : 0,
    paymentUpiEnabled: row.payment_upi_enabled,
    paymentUpiId: row.payment_upi_id,
    paymentCodEnabled: row.payment_cod_enabled,
    paymentCardEnabled: row.payment_card_enabled,
    paymentNetbankingEnabled: row.payment_netbanking_enabled,
    paymentRazorpayEnabled: row.payment_razorpay_enabled,
    paymentRazorpayKeyId: row.payment_razorpay_key_id,
    paymentStripeEnabled: row.payment_stripe_enabled,
    paymentStripePublishableKey: row.payment_stripe_publishable_key
  };
}

export function appSettingsToDb(s) {
  return {
    id: 'default',
    site_name: s.siteName,
    tagline: s.tagline,
    logo_url: s.logoUrl || null,
    favicon_url: s.faviconUrl || null,
    primary_color: s.primaryColor,
    secondary_color: s.secondaryColor,
    accent_color: s.accentColor,
    accent_light_color: s.accentLightColor,
    background_type: s.backgroundType,
    background_color: s.backgroundColor,
    background_gradient: s.backgroundGradient || [],
    background_image_url: s.backgroundImageUrl || null,
    background_pattern_overlay: s.backgroundPatternOverlay,
    background_pattern: s.backgroundPattern || 'none',
    background_pattern_image_url: s.backgroundPatternImageUrl || null,
    admin_panel_color: s.adminPanelColor,
    admin_panel_type: s.adminPanelType || 'solid',
    admin_panel_gradient: s.adminPanelGradient || [],
    text_color: s.textColor,
    heading_color: s.headingColor,
    font_family: s.fontFamily,
    heading_font_family: s.headingFontFamily,
    base_font_size: s.baseFontSize,
    border_radius: s.borderRadius || 'rounded-2xl',
    currency_symbol: s.currencySymbol || '₹',
    currency_code: s.currencyCode || 'INR',
    hero_video_url: s.heroVideoUrl || null,
    hero_image_url: s.heroImageUrl || null,
    hero_cta_text: s.heroCtaText || 'Order Online Now',
    hero_cta_link: s.heroCtaLink || 'category.html',
    hero_secondary_cta_text: s.heroSecondaryCtaText || 'Explore Categories',
    shipping_flat_fee: s.shippingFlatFee !== undefined ? s.shippingFlatFee : 50,
    free_shipping_threshold: s.freeShippingThreshold !== undefined ? s.freeShippingThreshold : 499,
    meta_title: s.metaTitle || null,
    meta_description: s.metaDescription || null,
    meta_keywords: s.metaKeywords || null,
    og_image_url: s.ogImageUrl || null,
    announcement_text: s.announcementText,
    whatsapp_number: s.whatsappNumber,
    contact_email: s.contactEmail,
    contact_phone: s.contactPhone,
    contact_address: s.contactAddress,
    footer_text: s.footerText,
    instagram_url: s.instagramUrl || null,
    facebook_url: s.facebookUrl || null,
    chatbot_enabled: s.chatbotEnabled !== false,
    chatbot_name: s.chatbotName || null,
    chatbot_subtitle: s.chatbotSubtitle || null,
    chatbot_avatar_icon: s.chatbotAvatarIcon || 'fa-robot',
    chatbot_color: s.chatbotColor || null,
    chatbot_greeting: s.chatbotGreeting || null,
    chatbot_quick_prompts: s.chatbotQuickPrompts || [],
    order_id_prefix: s.orderIdPrefix || 'MEERAV-',
    order_id_start_number: s.orderIdStartNumber != null ? Number(s.orderIdStartNumber) : 1001,
    order_id_pad_digits: s.orderIdPadDigits != null ? Number(s.orderIdPadDigits) : 0,
    payment_upi_enabled: s.paymentUpiEnabled,
    payment_upi_id: s.paymentUpiId,
    payment_cod_enabled: s.paymentCodEnabled,
    payment_card_enabled: s.paymentCardEnabled,
    payment_netbanking_enabled: s.paymentNetbankingEnabled,
    payment_razorpay_enabled: s.paymentRazorpayEnabled,
    payment_razorpay_key_id: s.paymentRazorpayKeyId || null,
    payment_stripe_enabled: s.paymentStripeEnabled,
    payment_stripe_publishable_key: s.paymentStripePublishableKey || null
  };
}

export function dbCouponToApp(row) {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountVal: Number(row.discount_val) || 0,
    minOrderAmount: Number(row.min_order_amount) || 0,
    isActive: Boolean(row.is_active),
    description: row.description || ''
  };
}

export function appCouponToDb(c) {
  return {
    id: c.id,
    code: (c.code || '').trim().toUpperCase(),
    discount_type: c.discountType || 'percentage',
    discount_val: Number(c.discountVal) || 0,
    min_order_amount: Number(c.minOrderAmount) || 0,
    is_active: c.isActive !== false,
    description: c.description || null
  };
}

export function dbTestimonialToApp(row) {
  return {
    id: row.id,
    customerId: row.customer_id || null,
    name: row.name,
    city: row.city || '',
    rating: Number(row.rating) || 5,
    reviewText: row.review_text,
    avatar: row.avatar || null,
    sortOrder: Number(row.sort_order) || 0,
    isVisible: row.is_visible !== false
  };
}

export function appTestimonialToDb(t) {
  return {
    id: t.id,
    customer_id: t.customerId || null,
    name: t.name,
    city: t.city || null,
    rating: Number(t.rating) || 5,
    review_text: t.reviewText,
    avatar: t.avatar || null,
    sort_order: Number(t.sortOrder) || 0,
    is_visible: t.isVisible !== false
  };
}

export function dbFaqToApp(row) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || 'general',
    sortOrder: Number(row.sort_order) || 0,
    isVisible: row.is_visible !== false
  };
}

export function appFaqToDb(f) {
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category || 'general',
    sort_order: Number(f.sortOrder) || 0,
    is_visible: f.isVisible !== false
  };
}

export function dbTrustBadgeToApp(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    sortOrder: Number(row.sort_order) || 1,
    isVisible: row.is_visible !== false
  };
}

export function appTrustBadgeToDb(b) {
  return {
    id: b.id,
    title: b.title,
    description: b.description,
    image: b.image,
    sort_order: Number(b.sortOrder) || 1,
    is_visible: b.isVisible !== false
  };
}

export function dbBroadcastStoryToApp(row) {
  return {
    id: row.id,
    title: row.title,
    tag: row.tag || '4K Reel',
    mediaType: row.media_type || 'video',
    mediaUrl: row.media_url,
    posterUrl: row.poster_url || '',
    productId: row.product_id || 'p1',
    price: Number(row.price) || 99,
    originalPrice: Number(row.original_price) || 120,
    sortOrder: Number(row.sort_order) || 1,
    isVisible: row.is_visible !== false
  };
}

export function appBroadcastStoryToDb(s) {
  return {
    id: s.id,
    title: s.title,
    tag: s.tag || '4K Reel',
    media_type: s.mediaType || 'video',
    media_url: s.mediaUrl,
    poster_url: s.posterUrl || null,
    product_id: s.productId || 'p1',
    price: Number(s.price) || 99,
    original_price: Number(s.originalPrice) || 120,
    sort_order: Number(s.sortOrder) || 1,
    is_visible: s.isVisible !== false
  };
}
