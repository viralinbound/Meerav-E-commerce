// Adapts a live Supabase-backed catalog product (id, tag, rating, reviewsCount,
// variants[]...) into the flat single-price/single-weight shape the
// Meerav2.0-derived homepage UI expects (name, price, weight, isBestseller...).
export function toDisplayProduct(product) {
  const variant = (product.variants && product.variants[0]) || {};
  const tag = (product.tag || "").toLowerCase();
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    price: variant.price ?? 0,
    originalPrice: variant.originalPrice,
    weight: variant.weight || "",
    rating: product.rating || 0,
    reviews: product.reviewsCount || 0,
    isBestseller: tag.includes("best"),
    isNew: tag.includes("new"),
    spiceLevel: product.spiceLevel,
    description: product.description,
    variant,
    raw: product,
  };
}
