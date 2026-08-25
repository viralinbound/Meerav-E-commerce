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
  dbFaqToApp, appFaqToDb
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
    const { data, error } = await supabaseClient.from('products').select('*').order('created_at');
    if (error) { console.error('fetchProducts', error); return []; }
    return (data || []).map(dbProductToApp);
  }

  async function fetchOrders() {
    const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchOrders', error); return []; }
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
      id: category.id, name: category.name, icon: category.icon, description: category.description
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

  async function dbUpdateOrderStatus(orderId, newStatus, client = supabaseClient) {
    const { error } = await client.from('orders').update({ order_status: newStatus }).eq('id', orderId);
    if (error) console.error('dbUpdateOrderStatus', error);
    return !error;
  }

  async function dbUpsertCustomer(customer) {
    const { error } = await supabaseClient.from('customers').upsert(appCustomerToDb(customer));
    if (error) console.error('dbUpsertCustomer', error);
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

  async function dbInsertNotification(notif, client = supabaseClient) {
    const { error } = await client.from('notifications').insert({
      id: notif.id, type: notif.type, recipient: notif.recipient, template: notif.template,
      notif_time: notif.time, status: notif.status, status_color: notif.statusColor
    });
    if (error) console.error('dbInsertNotification', error);
    return !error;
  }

  async function uploadMedia(file, folder) {
    if (!file) return null;
    const ext = (file.name && file.name.split('.').pop()) || 'bin';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabaseClient.storage.from(mediaBucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    });
    if (error) { console.error('uploadMedia', error); return null; }

    const { data } = supabaseClient.storage.from(mediaBucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function signUpCustomer({ email, password, name, phone, address, pincode }) {
    const { data, error } = await supabaseClient.auth.signUp({
      email, password, options: { data: { name, phone } }
    });
    if (error) return { error };

    const profile = {
      id: data.user.id, name, phone, email, address, pincode,
      avatar: null, wishlist: [], savedAddresses: []
    };
    const saved = await dbUpsertCustomer(profile);
    if (!saved) return { error: { message: 'Could not save customer profile' } };

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
    fetchCategories, fetchProducts, fetchOrders, fetchCustomers, fetchNotifications,
    dbUpsertProduct, dbDeleteProduct,
    dbUpsertCategory, dbDeleteCategory,
    dbInsertOrder, dbUpdateOrderStatus,
    dbUpsertCustomer,
    dbInsertNotification,
    fetchSiteSettings, dbUpsertSiteSettings,
    fetchPageContent, dbUpsertPageContent,
    fetchCoupons, dbUpsertCoupon, dbDeleteCoupon,
    fetchTestimonials, dbUpsertTestimonial, dbDeleteTestimonial,
    fetchFaqs, dbUpsertFaq, dbDeleteFaq,
    subscribeTable,
    uploadMedia,
    signUpCustomer, signInCustomer, signOutCustomer, getCurrentSession, getOrCreateCustomerProfile, onAuthChange,
    adminClient: adminSupabaseClient,
    signInAdmin, signOutAdmin, getAdminSession, getCurrentAdminProfile, onAdminAuthChange,
    fetchAdmins, registerAdmin, removeAdmin,
    resetAdminPassword, changeOwnPassword, banAdmin, unbanAdmin, warnAdmin,
    fetchMyWarnings, fetchWarningsForAdmin, acknowledgeWarning,
    logAdminActivity, fetchActivityLog, fetchActivityForAdmin, markActivityUndone,
    mappers: { dbProductToApp, dbCategoryToApp, dbCustomerToApp, dbOrderToApp, dbNotifToApp, dbSettingsToApp, dbCouponToApp, dbTestimonialToApp, dbFaqToApp }
  };
}
