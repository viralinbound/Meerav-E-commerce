/**
 * MEERAV NAMKEENS - SUPABASE CLOUD CONFIGURATION
 * Centralized API Keys, Database Endpoints & Storage Buckets
 */

const SUPABASE_CONFIG = {
  url: "https://rudiggwblncwkjmqqemd.supabase.co",
  anonKey: "sb_publishable_-ksMHdEpOjDa5Z9hDdodNg__yz6HisF",
  storageBucket: "meerav-media",
  storageUrl: "https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media",
  tables: {
    categories: "categories",
    products: "products",
    orders: "orders",
    customers: "customers"
  },
  // Systematic Folder Hierarchy Convention:
  // product-media/categories/{category_id}/products/{product_id}/photos/{filename}
  // product-media/categories/{category_id}/products/{product_id}/videos/{filename}
  folderPath: (categoryId, productId, type = 'photos', filename = '') => {
    return `categories/${categoryId}/products/${productId}/${type}/${filename}`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}
