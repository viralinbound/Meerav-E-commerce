/**
 * MEERAV NAMKEENS - SUPABASE CLOUD CONFIGURATION
 * Centralized API Keys, Database Endpoints & Storage Buckets
 */

const _sb_e = "c2JfcHVibGlzaGFibGVfLWtzTUhkRXBPakRhNVp5aERkb2ROZ19feXo2SGlzRg==";

const SUPABASE_CONFIG = {
  url: (typeof window !== 'undefined' && window.__SUPABASE_URL) || "https://rudiggwblncwkjmqqemd.supabase.co",
  anonKey: (typeof window !== 'undefined' && (window.__SUPABASE_KEY || localStorage.getItem('mira_sb_key'))) || (typeof atob === 'function' ? atob(_sb_e) : ""),
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
