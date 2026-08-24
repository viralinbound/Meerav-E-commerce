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
  return { id: row.id, name: row.name, icon: row.icon, description: row.description };
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
    announcementText: row.announcement_text,
    whatsappNumber: row.whatsapp_number,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    contactAddress: row.contact_address,
    footerText: row.footer_text,
    instagramUrl: row.instagram_url,
    facebookUrl: row.facebook_url,
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
    announcement_text: s.announcementText,
    whatsapp_number: s.whatsappNumber,
    contact_email: s.contactEmail,
    contact_phone: s.contactPhone,
    contact_address: s.contactAddress,
    footer_text: s.footerText,
    instagram_url: s.instagramUrl || null,
    facebook_url: s.facebookUrl || null,
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
