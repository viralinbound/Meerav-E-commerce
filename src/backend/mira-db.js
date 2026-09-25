/**
 * MEERAV backend API — injectable Supabase clients so the same helpers
 * run in the browser and in Vitest against a mock database.
 */
import {
  dbProductToApp, appProductToDb,
  dbCategoryToApp,
  dbCustomerToApp, appCustomerToDb,
  dbOrderToApp, appOrderToDb,
  dbNotifToApp,
  dbSettingsToApp, appSettingsToDb,
  dbCouponToApp, appCouponToDb,
  dbTestimonialToApp, appTestimonialToDb,
  dbSiteImageToApp, appSiteImageToDb,
  dbFaqToApp, appFaqToDb,
  dbTrustBadgeToApp, appTrustBadgeToDb,
  dbBroadcastStoryToApp, appBroadcastStoryToDb,
  dbHeroBannerToApp, appHeroBannerToDb,
  dbHeritageContentToApp, appHeritageContentToDb
} from './mappers.js';

export const MEDIA_BUCKET = 'meerav-media';

async function readFunctionError(error) {
  try {
    const body = await error.context.json();
    return body?.error || error.message;
  } catch {
    return error.message;
  }
}

export function createMiraDB({ supabaseClient, adminSupabaseClient, mediaBucket = MEDIA_BUCKET }) {
  async function fetchCategories() {
    let { data, error } = await supabaseClient.from('categories').select('*').order('sort_order');
    if (error) {
      const fallback = await supabaseClient.from('categories').select('*').order('created_at');
      data = fallback.data;
      error = fallback.error;
    }
    if (error) { console.error('fetchCategories', error); return []; }
    return (data || []).map(dbCategoryToApp);
  }

  async function fetchProducts() {
    // sort_order drives the admin-controlled display order once the column
    // exists (see supabase/add_product_sort_order.sql); nulls last so any
    // newly-added product without an assigned position falls to the end
    // instead of jumping to the front. Falls back to created_at if that
    // migration hasn't been run yet, so the storefront never breaks.
    let { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (error) {
      ({ data, error } = await supabaseClient.from('products').select('*').order('created_at'));
    }
    if (error) { console.error('fetchProducts', error); return []; }
    return (data || []).map(dbProductToApp);
  }

  async function getNextProductSerial(client = supabaseClient) {
    const { data, error } = await client.from('products').select('id');
    if (error) { console.error('getNextProductSerial', error); return 1234; }
    const numericIds = (data || [])
      .map((r) => r.id)
      .filter((id) => /^\d+$/.test(id))
      .map(Number);
    if (numericIds.length === 0) return 1234;
    return Math.max(...numericIds) + 1;
  }

  async function reorderProducts(orderedIds, client = supabaseClient) {
    const updates = orderedIds.map((id, idx) => ({ id, sort_order: idx + 1 }));
    for (const u of updates) {
      const { error } = await client.from('products').update({ sort_order: u.sort_order }).eq('id', u.id);
      if (error) { console.error('reorderProducts', error); return false; }
    }
    return true;
  }

  async function fetchOrders(client = supabaseClient) {
    const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchOrders', error); return []; }
    return (data || []).map(dbOrderToApp);
  }

  // Storefront "Your Orders" -- relies on the "customers read own orders" RLS
  // policy (customer->>'id' = auth.uid()) so this only ever returns the
  // signed-in customer's own orders, never anyone else's.
  async function fetchMyOrders(customerId) {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('customer->>id', customerId)
      .order('created_at', { ascending: false });
    if (error) { console.error('fetchMyOrders', error); return []; }
    return (data || []).map(dbOrderToApp);
  }

  async function fetchCustomers(client = supabaseClient) {
    const { data, error } = await client.from('customers').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchCustomers', error); return []; }
    return (data || []).map(dbCustomerToApp);
  }

  async function fetchNotifications(client = supabaseClient) {
    const { data, error } = await client.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) { console.error('fetchNotifications', error); return []; }
    return (data || []).map(dbNotifToApp);
  }

  async function dbUpsertProduct(product, client = supabaseClient) {
    const { error } = await client.from('products').upsert(appProductToDb(product));
    if (error) console.error('dbUpsertProduct', error);
    return !error;
  }

  async function dbDeleteProduct(productId, client = supabaseClient) {
    const { error } = await client.from('products').delete().eq('id', productId);
    if (error) console.error('dbDeleteProduct', error);
    return !error;
  }

  async function dbUpsertCategory(category, client = supabaseClient) {
    const { error } = await client.from('categories').upsert({
      id: category.id, name: category.name, icon: category.icon, image: category.image || null, description: category.description
    });
    if (error) console.error('dbUpsertCategory', error);
    return !error;
  }

  async function dbDeleteCategory(categoryId, client = supabaseClient) {
    const { error } = await client.from('categories').delete().eq('id', categoryId);
    if (error) console.error('dbDeleteCategory', error);
    return !error;
  }

  async function dbInsertOrder(order) {
    const { error } = await supabaseClient.from('orders').insert(appOrderToDb(order));
    if (error) console.error('dbInsertOrder', error);
    return !error;
  }

  // Asks the payu-initiate Edge Function to build a real PayU hosted-checkout
  // payload for an already-inserted pending order. The actual merchant
  // key/salt never touch the browser -- they live only as Edge Function
  // secrets on Supabase's server.
  async function initiatePayuPayment(orderId) {
    try {
      const { data, error } = await supabaseClient.functions.invoke('payu-initiate', { body: { orderId } });
      if (error) return { error: { message: await readFunctionError(error) } };
      return data;
    } catch (e) {
      console.error('initiatePayuPayment', e);
      return { error: { message: 'Online payment is not available right now. Please choose Cash on Delivery.' } };
    }
  }

  // Fires the order-confirmation email for a COD order right after it's
  // placed. Best-effort -- if this fails, the order itself is already
  // placed and unaffected, so callers just fire this and move on.
  async function sendOrderConfirmationEmail(orderId) {
    try {
      const { error } = await supabaseClient.functions.invoke('send-order-email', { body: { orderId } });
      if (error) console.warn('sendOrderConfirmationEmail', error);
    } catch (e) {
      console.warn('sendOrderConfirmationEmail', e);
    }
  }

  // Saves a real newsletter signup (previously the footer form just showed
  // a fake "check your inbox" message and stored nothing) and sends the
  // thank-you email server-side.
  async function subscribeToNewsletter(email) {
    try {
      const { error } = await supabaseClient.functions.invoke('send-subscribe-email', { body: { email } });
      if (error) return { error: await readFunctionError(error) };
      return { ok: true };
    } catch (e) {
      console.error('subscribeToNewsletter', e);
      return { error: 'Could not subscribe right now. Please try again.' };
    }
  }

  // Admin-only: total active (non-unsubscribed) newsletter subscriber count.
  async function fetchSubscriberCount(client = supabaseClient) {
    const { count, error } = await client
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('unsubscribed', false);
    if (error) { console.warn('fetchSubscriberCount', error); return 0; }
    return count || 0;
  }

  // Admin-only: sends an offer/announcement email to every subscriber.
  // The Edge Function itself re-checks the caller is really an admin
  // (never trust a client-side gate alone), using the admin session's own
  // access token.
  async function sendBroadcastEmail(subject, message, client = supabaseClient) {
    try {
      const { data: { session } } = await client.auth.getSession();
      const { data, error } = await client.functions.invoke('send-broadcast-email', {
        body: { subject, message },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      if (error) return { error: await readFunctionError(error) };
      return data;
    } catch (e) {
      console.error('sendBroadcastEmail', e);
      return { error: 'Could not send the broadcast right now.' };
    }
  }

  // Bumps each ordered product's real units_sold counter right after checkout,
  // so "Best Seller" on the storefront can be calculated from actual sales
  // instead of a manually-set tag. Best-effort -- a failure here shouldn't
  // block the order that already succeeded.
  async function incrementUnitsSold(items) {
    for (const item of items || []) {
      if (!item?.productId || !item?.quantity) continue;
      const { error } = await supabaseClient.rpc('increment_units_sold', {
        p_product_id: item.productId,
        p_qty: item.quantity,
      });
      if (error) console.warn('incrementUnitsSold', error);
    }
  }

  // Checks the CURRENT live stock (not the possibly-stale cart/catalog data)
  // for each cart line right before an order is placed. Stock can change
  // between adding to cart and checking out -- another customer buying the
  // same item, or an admin adjusting it -- so this is the real gate, not
  // just the clamp applied when the item was first added.
  async function checkVariantStock(items) {
    const problems = [];
    const productIds = [...new Set((items || []).map((i) => i.productId).filter(Boolean))];
    if (productIds.length === 0) return problems;

    const { data, error } = await supabaseClient.from('products').select('id, name, variants').in('id', productIds);
    if (error) { console.warn('checkVariantStock', error); return problems; }

    const byId = new Map((data || []).map((p) => [p.id, p]));
    for (const item of items || []) {
      const product = byId.get(item.productId);
      const variant = product?.variants?.find((v) => v.weight === item.weight);
      const available = variant?.stock;
      if (available != null && item.quantity > available) {
        problems.push({
          name: product?.name || item.name || item.productId,
          weight: item.weight,
          requested: item.quantity,
          available,
        });
      }
    }
    return problems;
  }

  // Reduces each ordered variant's stock (only variants an admin has
  // actually given a stock number -- others are unlimited and untouched).
  // Called once an order is genuinely confirmed: immediately for COD, or
  // from payu-callback once an online payment clears.
  async function decrementVariantStock(items) {
    for (const item of items || []) {
      if (!item?.productId || !item?.quantity || !item?.weight) continue;
      const { error } = await supabaseClient.rpc('decrement_variant_stock', {
        p_product_id: item.productId,
        p_weight: item.weight,
        p_qty: item.quantity,
      });
      if (error) console.warn('decrementVariantStock', error);
    }
  }

  // Reverses decrementVariantStock -- called when an order that actually
  // deducted stock (stock_deducted = true) gets cancelled, so those units
  // go back on the shelf for other customers to buy.
  async function restoreVariantStock(items) {
    for (const item of items || []) {
      if (!item?.productId || !item?.quantity || !item?.weight) continue;
      const { error } = await supabaseClient.rpc('restore_variant_stock', {
        p_product_id: item.productId,
        p_weight: item.weight,
        p_qty: item.quantity,
      });
      if (error) console.warn('restoreVariantStock', error);
    }
  }

  // Records that an order's stock has actually been deducted, so a later
  // cancellation knows there's real stock to give back -- and won't
  // double-restore if the order is cancelled more than once. Goes through a
  // SECURITY DEFINER RPC (not a direct table update) because RLS only lets
  // admins UPDATE orders -- a customer's own COD checkout call would
  // otherwise be silently blocked and this flag would never actually be set.
  async function setOrderStockDeducted(orderId, deducted) {
    const { error } = await supabaseClient.rpc('mark_order_stock_deducted', {
      p_order_id: orderId,
      p_deducted: deducted,
    });
    if (error) console.warn('setOrderStockDeducted', error);
    return !error;
  }

  // The branded, sequential order number (e.g. "MEERAV-1001") depends on
  // order_seq, which Postgres only assigns once the insert actually commits —
  // so it's fetched right after a successful checkout insert, not predicted client-side.
  async function fetchOrderSeq(orderId) {
    const { data, error } = await supabaseClient.from('orders').select('order_seq').eq('id', orderId).maybeSingle();
    if (error || !data) { console.warn('fetchOrderSeq', error); return null; }
    return data.order_seq != null ? Number(data.order_seq) : null;
  }

  async function dbUpdateOrderStatus(orderId, newStatus, client = supabaseClient) {
    const { error } = await client.from('orders').update({ order_status: newStatus }).eq('id', orderId);
    if (error) console.error('dbUpdateOrderStatus', error);
    return !error;
  }

  async function dbUpsertCustomer(customer) {
    let payload = appCustomerToDb(customer);
    let { error } = await supabaseClient.from('customers').upsert(payload);
    if (error && error.code === '42703') {
      // city/state columns don't exist yet (add_customer_city_state.sql not
      // run) -- retry without them so everything else still saves.
      const { city, state, ...fallback } = payload;
      payload = fallback;
      ({ error } = await supabaseClient.from('customers').upsert(payload));
    }
    if (error) console.error('dbUpsertCustomer', error);
    return !error;
  }

  async function fetchChatHistory(customerId) {
    if (!customerId) return [];
    try {
      const { data, error } = await supabaseClient.from('chatbot_history').select('messages').eq('customer_id', customerId).maybeSingle();
      if (error) { console.warn('fetchChatHistory', error); return []; }
      return (data && Array.isArray(data.messages)) ? data.messages : [];
    } catch (e) {
      console.warn('fetchChatHistory note:', e);
      return [];
    }
  }

  async function saveChatHistory(customerId, messages) {
    if (!customerId) return false;
    const { error } = await supabaseClient.from('chatbot_history').upsert({
      customer_id: customerId,
      messages,
      updated_at: new Date().toISOString()
    }, { onConflict: 'customer_id' });
    if (error) console.error('saveChatHistory', error);
    return !error;
  }

  async function deleteChatHistory(customerId) {
    if (!customerId) return true;
    const { error } = await supabaseClient.from('chatbot_history').delete().eq('customer_id', customerId);
    if (error) console.error('deleteChatHistory', error);
    return !error;
  }

  async function fetchSiteSettings() {
    try {
      const { data, error } = await supabaseClient.from('site_settings').select('*').eq('id', 'default').maybeSingle();
      if (!error && data) {
        const appObj = dbSettingsToApp(data);
        try { localStorage.setItem('mira_site_settings', JSON.stringify(appObj)); } catch(e) {}
        return appObj;
      }
    } catch (e) {
      console.warn('fetchSiteSettings Supabase note:', e);
    }
    try {
      const cached = localStorage.getItem('mira_site_settings');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return null;
  }

  async function dbUpsertSiteSettings(settings, client = supabaseClient) {
    const { error } = await client.from('site_settings').upsert(appSettingsToDb(settings));
    if (error) { console.error('dbUpsertSiteSettings', error); return false; }
    // Cache only after a real, confirmed write — never let a rejected/failed
    // save look identical to a successful one to whoever's watching the UI.
    try { localStorage.setItem('mira_site_settings', JSON.stringify(settings)); } catch (e) {}
    return true;
  }

  async function fetchPageContent() {
    try {
      const { data, error } = await supabaseClient.from('page_content').select('*').order('sort_order');
      if (!error && data && data.length) {
        const map = {};
        data.forEach(row => { map[row.key] = row.value; });
        try {
          localStorage.setItem('mira_page_content', JSON.stringify(map));
          localStorage.setItem('mira_page_content_rows', JSON.stringify(data));
        } catch(e) {}
        return { map, rows: data };
      }
    } catch (e) {
      console.warn('fetchPageContent Supabase note:', e);
    }
    try {
      const cachedMap = localStorage.getItem('mira_page_content');
      const cachedRows = localStorage.getItem('mira_page_content_rows');
      if (cachedMap) {
        return { map: JSON.parse(cachedMap), rows: cachedRows ? JSON.parse(cachedRows) : [] };
      }
    } catch(e) {}
    return { map: {}, rows: [] };
  }

  async function dbUpsertPageContent(entries, client = supabaseClient) {
    const rows = entries.map(e => ({ key: e.key, value: e.value, label: e.label, page: e.page, sort_order: e.sortOrder }));
    const { error } = await client.from('page_content').upsert(rows, { onConflict: 'key' });
    if (error) { console.error('dbUpsertPageContent', error); return false; }
    try {
      const map = {};
      entries.forEach(e => { map[e.key] = e.value; });
      localStorage.setItem('mira_page_content', JSON.stringify(map));
      localStorage.setItem('mira_page_content_rows', JSON.stringify(entries));
    } catch (e) {}
    return true;
  }

  // ---------------------------------------------------------------------
  // DESIGN EDITOR — published (cloud) layout patches. The editor itself
  // works purely off localStorage until an admin clicks "Publish Live";
  // this is what makes that click actually reach every visitor.
  async function fetchPageDesignPatches(pageKey, client = supabaseClient) {
    const { data, error } = await client.from('page_design_patches').select('patches').eq('page_key', pageKey).maybeSingle();
    if (error) { console.warn('fetchPageDesignPatches', error); return null; }
    return data ? data.patches : null;
  }

  async function dbUpsertPageDesignPatches(pageKey, patches, adminUserId, client = supabaseClient) {
    const { error } = await client.from('page_design_patches').upsert({
      page_key: pageKey, patches, updated_at: new Date().toISOString(), updated_by: adminUserId || null
    });
    if (error) { console.error('dbUpsertPageDesignPatches', error); return false; }
    return true;
  }

  async function fetchCoupons(client = supabaseClient) {
    try {
      const { data, error } = await client.from('coupons').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length) {
        const list = data.map(dbCouponToApp);
        try { localStorage.setItem('mira_coupons', JSON.stringify(list)); } catch(e) {}
        return list;
      }
    } catch(e) {}
    try {
      const cached = localStorage.getItem('mira_coupons');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  }

  async function dbUpsertCoupon(coupon, client = supabaseClient) {
    const { error } = await client.from('coupons').upsert(appCouponToDb(coupon));
    if (error) { console.error('dbUpsertCoupon', error); return false; }
    try {
      const list = await fetchCoupons(client);
      const idx = list.findIndex(c => c.id === coupon.id);
      if (idx !== -1) list[idx] = coupon; else list.unshift(coupon);
      localStorage.setItem('mira_coupons', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function dbDeleteCoupon(couponId, client = supabaseClient) {
    const { error } = await client.from('coupons').delete().eq('id', couponId);
    if (error) { console.error('dbDeleteCoupon', error); return false; }
    try {
      const list = (await fetchCoupons(client)).filter(c => c.id !== couponId);
      localStorage.setItem('mira_coupons', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function fetchHeroBanners(client = supabaseClient) {
    // No localStorage fallback here (unlike testimonials/faqs below) --
    // if the table doesn't exist yet (migration not run), the storefront
    // falls back to the hardcoded heroBanners in data/products.ts instead,
    // so an empty/error result here is meaningful, not something to mask.
    const { data, error } = await client.from('hero_banners').select('*').order('sort_order', { ascending: true });
    if (error) { console.error('fetchHeroBanners', error); return []; }
    return (data || []).map(dbHeroBannerToApp);
  }

  async function dbUpsertHeroBanner(banner, client = supabaseClient) {
    let payload = appHeroBannerToDb(banner);
    let { error } = await client.from('hero_banners').upsert(payload);
    if (error && error.code === '42703') {
      // title_size/subtitle_size/title_color/button_size/button_bg_color/
      // button_text_color columns don't exist yet (add_hero_banner_style.sql
      // not run) -- retry without them so everything else still saves.
      const { title_size, subtitle_size, title_color, button_size, button_bg_color, button_text_color, ...fallback } = payload;
      payload = fallback;
      ({ error } = await client.from('hero_banners').upsert(payload));
    }
    if (error && error.code === '42703') {
      // button_x/button_y columns don't exist yet (add_hero_banner_button_position.sql
      // not run) -- retry without them so everything else still saves.
      const { button_x, button_y, ...fallback } = payload;
      ({ error } = await client.from('hero_banners').upsert(fallback));
    }
    if (error) { console.error('dbUpsertHeroBanner', error); return false; }
    return true;
  }

  async function dbDeleteHeroBanner(bannerId, client = supabaseClient) {
    const { error } = await client.from('hero_banners').delete().eq('id', bannerId);
    if (error) { console.error('dbDeleteHeroBanner', error); return false; }
    return true;
  }

  async function fetchHeritageContent(client = supabaseClient) {
    try {
      const { data, error } = await client.from('heritage_content').select('*').eq('id', 'heritage').maybeSingle();
      if (!error && data) {
        const value = dbHeritageContentToApp(data);
        try { localStorage.setItem('mira_heritage_content', JSON.stringify(value)); } catch(e) {}
        return value;
      }
    } catch(e) {}
    try {
      const cached = localStorage.getItem('mira_heritage_content');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return null;
  }

  async function dbUpsertHeritageContent(content, client = supabaseClient) {
    const payload = appHeritageContentToDb({ ...content, id: 'heritage' });
    const { error } = await client.from('heritage_content').upsert(payload);
    if (error) { console.error('dbUpsertHeritageContent', error); return false; }
    try { localStorage.setItem('mira_heritage_content', JSON.stringify({ ...content, id: 'heritage' })); } catch(e) {}
    return true;
  }

  async function reorderHeroBanners(orderedIds, client = supabaseClient) {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await client.from('hero_banners').update({ sort_order: i + 1 }).eq('id', orderedIds[i]);
      if (error) { console.error('reorderHeroBanners', error); return false; }
    }
    return true;
  }

  async function fetchTestimonials(client = supabaseClient) {
    try {
      const { data, error } = await client.from('testimonials').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length) {
        const list = data.map(dbTestimonialToApp);
        try { localStorage.setItem('mira_testimonials', JSON.stringify(list)); } catch(e) {}
        return list;
      }
    } catch(e) {}
    try {
      const cached = localStorage.getItem('mira_testimonials');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  }

  async function dbUpsertTestimonial(testimonial, client = supabaseClient) {
    const { error } = await client.from('testimonials').upsert(appTestimonialToDb(testimonial));
    if (error) { console.error('dbUpsertTestimonial', error); return false; }
    try {
      const list = await fetchTestimonials(client);
      const idx = list.findIndex(t => t.id === testimonial.id);
      if (idx !== -1) list[idx] = testimonial; else list.push(testimonial);
      localStorage.setItem('mira_testimonials', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function dbDeleteTestimonial(testimonialId, client = supabaseClient) {
    const { error } = await client.from('testimonials').delete().eq('id', testimonialId);
    if (error) { console.error('dbDeleteTestimonial', error); return false; }
    try {
      const list = (await fetchTestimonials(client)).filter(t => t.id !== testimonialId);
      localStorage.setItem('mira_testimonials', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function fetchSiteImages(client = supabaseClient) {
    try {
      const { data, error } = await client.from('site_images').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length) {
        const list = data.map(dbSiteImageToApp);
        try { localStorage.setItem('mira_site_images', JSON.stringify(list)); } catch(e) {}
        return list;
      }
    } catch(e) {}
    try {
      const cached = localStorage.getItem('mira_site_images');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  }

  async function dbUpsertSiteImage(siteImage, client = supabaseClient) {
    const { error } = await client.from('site_images').upsert(appSiteImageToDb(siteImage));
    if (error) { console.error('dbUpsertSiteImage', error); return false; }
    try {
      const list = await fetchSiteImages(client);
      const idx = list.findIndex(s => s.id === siteImage.id);
      if (idx !== -1) list[idx] = siteImage; else list.push(siteImage);
      localStorage.setItem('mira_site_images', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function fetchFaqs(client = supabaseClient) {
    try {
      const { data, error } = await client.from('faqs').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length) {
        const list = data.map(dbFaqToApp);
        try { localStorage.setItem('mira_faqs', JSON.stringify(list)); } catch(e) {}
        return list;
      }
    } catch(e) {}
    try {
      const cached = localStorage.getItem('mira_faqs');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  }

  async function dbUpsertFaq(faq, client = supabaseClient) {
    const { error } = await client.from('faqs').upsert(appFaqToDb(faq));
    if (error) { console.error('dbUpsertFaq', error); return false; }
    try {
      const list = await fetchFaqs(client);
      const idx = list.findIndex(f => f.id === faq.id);
      if (idx !== -1) list[idx] = faq; else list.push(faq);
      localStorage.setItem('mira_faqs', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function dbDeleteFaq(faqId, client = supabaseClient) {
    const { error } = await client.from('faqs').delete().eq('id', faqId);
    if (error) { console.error('dbDeleteFaq', error); return false; }
    try {
      const list = (await fetchFaqs(client)).filter(f => f.id !== faqId);
      localStorage.setItem('mira_faqs', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function fetchTrustBadges(client = supabaseClient) {
    try {
      const { data, error } = await client.from('trust_badges').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length) {
        const list = data.map(dbTrustBadgeToApp);
        try { localStorage.setItem('mira_trust_badges_db', JSON.stringify(list)); } catch(e) {}
        return list;
      }
    } catch(e) {}
    try {
      const cached = localStorage.getItem('mira_trust_badges_db');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  }

  async function dbUpsertTrustBadge(badge, client = supabaseClient) {
    const { error } = await client.from('trust_badges').upsert(appTrustBadgeToDb(badge));
    if (error) { console.error('dbUpsertTrustBadge', error); return false; }
    try {
      const list = await fetchTrustBadges(client);
      const idx = list.findIndex(b => b.id === badge.id);
      if (idx !== -1) list[idx] = badge; else list.push(badge);
      localStorage.setItem('mira_trust_badges_db', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function dbDeleteTrustBadge(badgeId, client = supabaseClient) {
    const { error } = await client.from('trust_badges').delete().eq('id', badgeId);
    if (error) { console.error('dbDeleteTrustBadge', error); return false; }
    try {
      const list = (await fetchTrustBadges(client)).filter(b => b.id !== badgeId);
      localStorage.setItem('mira_trust_badges_db', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function fetchBroadcastStories(client = supabaseClient) {
    try {
      const { data, error } = await client.from('broadcast_stories').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length) {
        const list = data.map(dbBroadcastStoryToApp);
        try { localStorage.setItem('mira_broadcast_stories_db', JSON.stringify(list)); } catch(e) {}
        return list;
      }
    } catch(e) {}
    try {
      const cached = localStorage.getItem('mira_broadcast_stories_db');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  }

  async function dbUpsertStory(story, client = supabaseClient) {
    const { error } = await client.from('broadcast_stories').upsert(appBroadcastStoryToDb(story));
    if (error) { console.error('dbUpsertStory', error); return false; }
    try {
      const list = await fetchBroadcastStories(client);
      const idx = list.findIndex(s => s.id === story.id);
      if (idx !== -1) list[idx] = story; else list.push(story);
      localStorage.setItem('mira_broadcast_stories_db', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function dbDeleteStory(storyId, client = supabaseClient) {
    const { error } = await client.from('broadcast_stories').delete().eq('id', storyId);
    if (error) { console.error('dbDeleteStory', error); return false; }
    try {
      const list = (await fetchBroadcastStories(client)).filter(s => s.id !== storyId);
      localStorage.setItem('mira_broadcast_stories_db', JSON.stringify(list));
    } catch(e) {}
    return true;
  }

  async function dbInsertNotification(notif, client = supabaseClient) {
    const { error } = await client.from('notifications').insert({
      id: notif.id, type: notif.type, recipient: notif.recipient, template: notif.template,
      notif_time: notif.time, status: notif.status, status_color: notif.statusColor
    });
    if (error) console.error('dbInsertNotification', error);
    return !error;
  }

  async function uploadMedia(file, folder, client = supabaseClient) {
    if (!file) return null;
    const ext = (file.name && file.name.split('.').pop()) || 'bin';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await client.storage.from(mediaBucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    });
    if (error) { console.error('uploadMedia', error); return null; }

    const { data } = client.storage.from(mediaBucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Deletes a previously-uploaded file given its public URL — used when an
   * admin replaces an image (logo, category photo, product photo) so the
   * old file doesn't sit around in Storage forever. Silently no-ops for
   * URLs that aren't actually hosted in our bucket (e.g. the bundled
   * assets/images/*.jpg defaults), since those aren't ours to delete.
   */
  async function deleteMedia(url, client = supabaseClient) {
    if (!url) return true;
    const marker = `/storage/v1/object/public/${mediaBucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return true;
    const path = url.slice(idx + marker.length);
    const { error } = await client.storage.from(mediaBucket).remove([path]);
    if (error) { console.error('deleteMedia', error); return false; }
    return true;
  }

  // Checks whether a signed-in storefront user is also an admin/host, using
  // the public is_admin() RPC (already granted to anon/authenticated for RLS
  // purposes) -- lets the header show a "Go to Admin Dashboard" link only to
  // real admin/host accounts, never to regular customers.
  async function checkIsAdmin(userId) {
    if (!userId) return false;
    const { data, error } = await supabaseClient.rpc('is_admin', { uid: userId });
    if (error) { console.warn('checkIsAdmin', error); return false; }
    return !!data;
  }

  async function signUpCustomer({ email, password, name, phone, address, city, state, pincode }) {
    const { data, error } = await supabaseClient.auth.signUp({
      email, password, options: { data: { name, phone } }
    });
    if (error) return { error };

    const profile = {
      id: data.user.id, name, phone, email, address, city, state, pincode,
      avatar: null, wishlist: [], savedAddresses: []
    };
    // With "Confirm email" enabled, signUp() returns no session yet, so RLS
    // rightly blocks this insert (auth.uid() is null) — getOrCreateCustomerProfile
    // saves it once the user confirms and actually signs in.
    if (data.session) {
      const saved = await dbUpsertCustomer(profile);
      if (!saved) return { error: { message: 'Could not save customer profile' } };
    }

    return { user: data.user, session: data.session, needsConfirmation: !data.session, profile };
  }

  async function getOrCreateCustomerProfile(user) {
    const { data, error } = await supabaseClient.from('customers').select('*').eq('id', user.id).maybeSingle();
    if (data) return dbCustomerToApp(data);
    if (error) console.error('getOrCreateCustomerProfile', error);

    const fallback = {
      id: user.id,
      name: user.user_metadata?.name || user.email.split('@')[0],
      phone: user.user_metadata?.phone || '',
      email: user.email,
      address: '', pincode: '', avatar: null, wishlist: [], savedAddresses: []
    };
    await dbUpsertCustomer(fallback);
    return fallback;
  }

  async function signInCustomer(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { error };
    const profile = await getOrCreateCustomerProfile(data.user);
    return { user: data.user, session: data.session, profile };
  }

  async function signOutCustomer() {
    await supabaseClient.auth.signOut();
  }

  async function resendConfirmationEmail(email) {
    const { error } = await supabaseClient.auth.resend({ type: 'signup', email });
    return { error };
  }

  async function sendPasswordReset(email) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error };
  }

  async function updatePassword(newPassword) {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    return { error };
  }

  async function getCurrentSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
  }

  function onAuthChange(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }

  async function getCurrentAdminProfile() {
    const { data: userData } = await adminSupabaseClient.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await adminSupabaseClient.from('admins').select('*').eq('id', userData.user.id).maybeSingle();
    if (error) { console.error('getCurrentAdminProfile', error); return null; }
    return data || null;
  }

  async function signInAdmin(email, password) {
    const { data, error } = await adminSupabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { error };

    const profile = await getCurrentAdminProfile();
    if (!profile) {
      await adminSupabaseClient.auth.signOut();
      return { error: { message: 'This account is not registered as an admin.' } };
    }
    if (profile.banned) {
      await adminSupabaseClient.auth.signOut();
      return { error: { message: 'This admin account has been banned. Contact the root admin.' } };
    }
    return { user: data.user, session: data.session, profile };
  }

  async function signOutAdmin() {
    await adminSupabaseClient.auth.signOut();
  }

  // The storefront customer session and the admin panel session are kept
  // in separate browser storage on purpose (so a leaked customer session
  // alone can never reach the admin panel) -- but when the signed-in
  // customer account IS a real admin/host, copying its already-verified
  // tokens into the admin client's own session means they land on
  // /admin.html already signed in, instead of typing the same password a
  // second time for an account they just proved they own.
  async function syncAdminSession(session) {
    if (!session?.access_token || !session?.refresh_token) return;
    try {
      await adminSupabaseClient.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } catch (e) {
      console.warn('syncAdminSession', e);
    }
  }

  async function getAdminSession() {
    const { data } = await adminSupabaseClient.auth.getSession();
    return data.session;
  }

  function onAdminAuthChange(callback) {
    return adminSupabaseClient.auth.onAuthStateChange(callback);
  }

  async function fetchAdmins() {
    const { data, error } = await adminSupabaseClient.from('admins').select('*').order('created_at');
    if (error) { console.error('fetchAdmins', error); return []; }
    return data || [];
  }

  // Root-only (enforced by RLS, not just the UI): sets exactly which admin
  // pages a sub-admin can see. An empty array means full access.
  async function updateAdminPermissions(adminId, permissions) {
    const { error } = await adminSupabaseClient.from('admins').update({ permissions }).eq('id', adminId);
    if (error) { console.error('updateAdminPermissions', error); return { error }; }
    return { ok: true };
  }

  // Root-only (same RLS policy as updateAdminPermissions): corrects any
  // admin's display name, including its own.
  async function updateAdminName(adminId, name) {
    const { error } = await adminSupabaseClient.from('admins').update({ name }).eq('id', adminId);
    if (error) { console.error('updateAdminName', error); return { error }; }
    return { ok: true };
  }

  // Any signed-in admin (host or sub-admin) can rename themselves, no host
  // approval needed -- goes through a SECURITY DEFINER function that only
  // ever touches the caller's own row, so it can't be used to change role,
  // permissions, or anyone else's name.
  async function updateOwnName(name) {
    const { error } = await adminSupabaseClient.rpc('update_own_admin_name', { new_name: name });
    if (error) { console.error('updateOwnName', error); return { error }; }
    return { ok: true };
  }

  async function invokeAdminManage(body) {
    const { data, error } = await adminSupabaseClient.functions.invoke('admin-manage', { body });
    if (error) return { error: { message: await readFunctionError(error) } };
    return data;
  }

  async function registerAdmin({ email, name }) {
    return invokeAdminManage({ action: 'register', email, name });
  }

  async function resetAdminPassword(adminId) {
    return invokeAdminManage({ action: 'reset_password', adminId });
  }

  async function changeOwnPassword(newPassword) {
    return invokeAdminManage({ action: 'change_password', newPassword });
  }

  async function banAdmin(adminId) {
    return invokeAdminManage({ action: 'ban', adminId });
  }

  async function unbanAdmin(adminId) {
    return invokeAdminManage({ action: 'unban', adminId });
  }

  async function warnAdmin(adminId, message) {
    return invokeAdminManage({ action: 'warn', adminId, message });
  }

  async function removeAdmin(adminId) {
    return invokeAdminManage({ action: 'remove', adminId });
  }

  async function fetchMyWarnings() {
    const { data: userData } = await adminSupabaseClient.auth.getUser();
    if (!userData.user) return [];
    const { data, error } = await adminSupabaseClient.from('admin_warnings')
      .select('*').eq('admin_id', userData.user.id).eq('acknowledged', false).order('created_at', { ascending: false });
    if (error) { console.error('fetchMyWarnings', error); return []; }
    return data || [];
  }

  async function fetchWarningsForAdmin(adminId) {
    const { data, error } = await adminSupabaseClient.from('admin_warnings')
      .select('*').eq('admin_id', adminId).order('created_at', { ascending: false });
    if (error) { console.error('fetchWarningsForAdmin', error); return []; }
    return data || [];
  }

  async function acknowledgeWarning(warningId) {
    const { error } = await adminSupabaseClient.from('admin_warnings').update({ acknowledged: true }).eq('id', warningId);
    if (error) console.error('acknowledgeWarning', error);
    return !error;
  }

  async function logAdminActivity(admin, action, target, details = {}) {
    if (!admin) return false;
    const { error } = await adminSupabaseClient.from('admin_activity_log').insert({
      admin_id: admin.id, admin_name: admin.name, admin_role: admin.role,
      action, target, details
    });
    if (error) console.error('logAdminActivity', error);
    return !error;
  }

  async function fetchActivityLog(limit = 200) {
    const { data, error } = await adminSupabaseClient
      .from('admin_activity_log').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) { console.error('fetchActivityLog', error); return []; }
    return data || [];
  }

  async function fetchActivityForAdmin(adminId, limit = 100) {
    const { data, error } = await adminSupabaseClient
      .from('admin_activity_log').select('*').eq('admin_id', adminId).order('created_at', { ascending: false }).limit(limit);
    if (error) { console.error('fetchActivityForAdmin', error); return []; }
    return data || [];
  }

  async function markActivityUndone(entryId) {
    const { error } = await adminSupabaseClient.from('admin_activity_log').update({ undone: true }).eq('id', entryId);
    if (error) console.error('markActivityUndone', error);
    return !error;
  }

  function subscribeTable(table, onChange) {
    return supabaseClient
      .channel(`realtime:${table}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
      .subscribe();
  }

  return {
    fetchCategories, fetchProducts, reorderProducts, getNextProductSerial, fetchOrders, fetchMyOrders, fetchCustomers, fetchNotifications, incrementUnitsSold, decrementVariantStock, restoreVariantStock, setOrderStockDeducted, checkVariantStock, checkIsAdmin, initiatePayuPayment, sendOrderConfirmationEmail,
    subscribeToNewsletter, fetchSubscriberCount, sendBroadcastEmail,
    dbUpsertProduct, dbDeleteProduct,
    dbUpsertCategory, dbDeleteCategory,
    dbInsertOrder, dbUpdateOrderStatus, fetchOrderSeq,
    dbUpsertCustomer,
    fetchChatHistory, saveChatHistory, deleteChatHistory,
    dbInsertNotification,
    fetchSiteSettings, dbUpsertSiteSettings,
    fetchPageContent, dbUpsertPageContent,
    fetchPageDesignPatches, dbUpsertPageDesignPatches,
    fetchCoupons, dbUpsertCoupon, dbDeleteCoupon,
    fetchHeroBanners, dbUpsertHeroBanner, dbDeleteHeroBanner, reorderHeroBanners,
    fetchHeritageContent, dbUpsertHeritageContent,
    fetchTestimonials, dbUpsertTestimonial, dbDeleteTestimonial,
    fetchSiteImages, dbUpsertSiteImage,
    fetchFaqs, dbUpsertFaq, dbDeleteFaq,
    fetchTrustBadges, dbUpsertTrustBadge, dbDeleteTrustBadge,
    fetchBroadcastStories, dbUpsertStory, dbDeleteStory,
    subscribeTable,
    uploadMedia, deleteMedia,
    signUpCustomer, signInCustomer, signOutCustomer, getCurrentSession, getOrCreateCustomerProfile, onAuthChange, resendConfirmationEmail,
    sendPasswordReset, updatePassword,
    adminClient: adminSupabaseClient,
    signInAdmin, signOutAdmin, getAdminSession, getCurrentAdminProfile, onAdminAuthChange, syncAdminSession,
    fetchAdmins, registerAdmin, removeAdmin, updateAdminPermissions, updateAdminName, updateOwnName,
    resetAdminPassword, changeOwnPassword, banAdmin, unbanAdmin, warnAdmin,
    fetchMyWarnings, fetchWarningsForAdmin, acknowledgeWarning,
    logAdminActivity, fetchActivityLog, fetchActivityForAdmin, markActivityUndone,
    mappers: { dbProductToApp, dbCategoryToApp, dbCustomerToApp, dbOrderToApp, dbNotifToApp, dbSettingsToApp, dbCouponToApp, dbTestimonialToApp, dbFaqToApp }
  };
}
