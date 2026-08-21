/**
 * MEERAV NAMKEENS - SUPABASE CLOUD CLIENT & DATA MANAGER
 * Real-time Cloud Sync for Categories, 75 Products, Orders & Media Storage
 */

const MeeravSupabase = {
  client: null,
  isOnline: false,

  init() {
    try {
      if (typeof window !== 'undefined' && window.supabase && typeof SUPABASE_CONFIG !== 'undefined') {
        this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        this.isOnline = true;
        console.log('✅ Connected to Supabase Cloud:', SUPABASE_CONFIG.url);
      } else {
        console.warn('⚠️ Supabase JS SDK not loaded, using offline fallback dataset.');
      }
    } catch (err) {
      console.warn('⚠️ Supabase initialization note:', err.message);
      this.isOnline = false;
    }
  },

  // 1. Fetch Categories
  async getCategories() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('categories')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          localStorage.setItem('mira_categories_db', JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase categories fetch error, using local fallback:', e.message);
      }
    }
    return JSON.parse(localStorage.getItem('mira_categories_db')) || MIRA_DATA.categories;
  },

  // 2. Fetch Products (With Category & Search Filtering)
  async getProducts(category = 'all', searchQuery = '') {
    if (this.client) {
      try {
        let query = this.client
          .from('products')
          .select('*')
          .eq('in_stock', true);

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data, error } = await query.order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          // Normalize column names
          const normalized = data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            tag: p.tag,
            rating: Number(p.rating),
            reviewsCount: p.reviews_count,
            spiceLevel: p.spice_level,
            dietary: p.dietary || [],
            image: p.image,
            video: p.video,
            sampleImage: p.sample_image,
            description: p.description,
            ingredients: p.ingredients,
            nutrition: p.nutrition || {},
            variants: p.variants || [],
            inStock: p.in_stock
          }));

          localStorage.setItem('mira_products_db', JSON.stringify(normalized));
          return normalized;
        }
      } catch (e) {
        console.warn('Supabase products fetch error, using local catalog:', e.message);
      }
    }

    const localProds = JSON.parse(localStorage.getItem('mira_products_db')) || MIRA_DATA.products;
    return localProds;
  },

  // 3. Fetch Single Product by ID
  async getProductById(productId) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            category: data.category,
            tag: data.tag,
            rating: Number(data.rating),
            reviewsCount: data.reviews_count,
            spiceLevel: data.spice_level,
            dietary: data.dietary || [],
            image: data.image,
            video: data.video,
            sampleImage: data.sample_image,
            description: data.description,
            ingredients: data.ingredients,
            nutrition: data.nutrition || {},
            variants: data.variants || [],
            inStock: data.in_stock
          };
        }
      } catch (e) {
        console.warn('Supabase product single fetch fallback:', e.message);
      }
    }

    const all = JSON.parse(localStorage.getItem('mira_products_db')) || MIRA_DATA.products;
    return all.find(p => p.id === productId) || all[0];
  },

  // 4. Save Customer Order to Cloud
  async createOrder(orderData) {
    const orderPayload = {
      id: orderData.id,
      customer: orderData.customer,
      items: orderData.items,
      total_amount: orderData.totalAmount,
      discount_amount: orderData.discountAmount || 0,
      shipping_charge: orderData.shippingCharge || 0,
      payment_method: orderData.paymentMethod,
      payment_status: orderData.paymentStatus || 'Completed',
      order_status: orderData.orderStatus || 'Order Placed'
    };

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('orders')
          .insert([orderPayload]);

        if (!error) {
          console.log('✅ Order synced to Supabase Cloud:', orderData.id);
        }
      } catch (e) {
        console.warn('Cloud order sync note:', e.message);
      }
    }

    return orderData;
  },

  // 5. Save/Update Customer Profile
  async upsertCustomer(customerData) {
    if (this.client) {
      try {
        const { error } = await this.client
          .from('customers')
          .upsert([{
            id: customerData.id,
            name: customerData.name,
            phone: customerData.phone,
            email: customerData.email,
            address: customerData.address,
            pincode: customerData.pincode,
            avatar: customerData.avatar
          }]);

        if (!error) {
          console.log('✅ Customer profile saved to Supabase');
        }
      } catch (e) {
        console.warn('Customer upsert fallback:', e.message);
      }
    }
  },

  // 6. Systematic Media Upload (Categories/Products/Photos/Videos)
  // product-media/categories/{categoryId}/products/{productId}/{photos|videos}/{filename}
  async uploadMedia(file, categoryId, productId, type = 'photos') {
    if (!this.client) throw new Error('Supabase client not initialized');

    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `categories/${categoryId}/products/${productId}/${type}/${cleanFileName}`;

    const bucketName = (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.storageBucket) || 'meerav-media';

    const { data, error } = await this.client.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = this.client.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    return {
      storagePath,
      publicUrl: publicUrlData.publicUrl
    };
  }
};

// Global Async Bridge Functions for Storefront & Admin
async function fetchCategories() {
  return await MeeravSupabase.getCategories();
}

async function fetchProducts(category = 'all', searchQuery = '') {
  return await MeeravSupabase.getProducts(category, searchQuery);
}

async function fetchOrders() {
  if (MeeravSupabase.client) {
    try {
      const { data, error } = await MeeravSupabase.client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Orders fetch note:', e.message);
    }
  }
  return JSON.parse(localStorage.getItem('mira_orders_db')) || [];
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
  MeeravSupabase.init();
});
