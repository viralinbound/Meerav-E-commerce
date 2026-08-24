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
