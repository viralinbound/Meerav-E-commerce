/**
 * MEERAV NAMKEENS - SUPABASE BACKEND LAYER
 * Single source of truth for the database. Every page loads this after the
 * Supabase JS CDN script and js/env-config.js (which supplies the URL/key —
 * see scripts/generate-env.js) and before data.js/store.js/admin.js/etc.
 *
 * Exposes `MiraDB` with read/write helpers (mapped to the same camelCase
 * shape the existing UI code already expects) plus realtime subscriptions
 * so the storefront and admin portal stay in sync live, across tabs/devices.
 */

const SUPABASE_URL = window.__ENV__ && window.__ENV__.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Supabase config. js/env-config.js did not load (or is empty) before js/supabase-client.js. ' +
    'Run `npm run build` after creating .env from .env.example, or set SUPABASE_URL / SUPABASE_ANON_KEY ' +
    'as Environment Variables in your Vercel project settings.'
  );
}

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * A second, fully isolated client for the admin portal (distinct
 * localStorage session key) so a customer signed in on the storefront and
 * an admin signed in on admin.html never share/clobber each other's
 * session in the same browser.
 */
const adminSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storageKey: 'sb-meerav-admin-auth' }
});

/* ---------------------------------------------------------------------- */
/* Row <-> App-shape mappers                                              */
/* ---------------------------------------------------------------------- */

function dbProductToApp(row) {
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
    // Unlimited galleries — photos[0]/videos[0] double as the "cover" used
    // everywhere the old single image/video fields used to be read.
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

function appProductToDb(p) {
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

function dbCategoryToApp(row) {
  return { id: row.id, name: row.name, icon: row.icon, description: row.description };
}

function dbCustomerToApp(row) {
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

function appCustomerToDb(c) {
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

function dbOrderToApp(row) {
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

function appOrderToDb(o) {
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

function dbNotifToApp(row) {
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

/* ---------------------------------------------------------------------- */
/* Reads                                                                  */
/* ---------------------------------------------------------------------- */

async function fetchCategories() {
  const { data, error } = await supabaseClient.from('categories').select('*').order('sort_order');
  if (error) { console.error('fetchCategories', error); return []; }
  return data.map(dbCategoryToApp);
}

async function fetchProducts() {
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at');
  if (error) { console.error('fetchProducts', error); return []; }
  return data.map(dbProductToApp);
}

async function fetchOrders() {
  const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchOrders', error); return []; }
  return data.map(dbOrderToApp);
}

// customers/notifications are only selectable by their owner or an admin
// (see RLS) — admin.js always passes adminSupabaseClient here.
async function fetchCustomers(client = supabaseClient) {
  const { data, error } = await client.from('customers').select('*').order('created_at', { ascending: false });
  if (error) { console.error('fetchCustomers', error); return []; }
  return data.map(dbCustomerToApp);
}

async function fetchNotifications(client = supabaseClient) {
  const { data, error } = await client.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) { console.error('fetchNotifications', error); return []; }
  return data.map(dbNotifToApp);
}

/* ---------------------------------------------------------------------- */
/* Writes                                                                 */
/* ---------------------------------------------------------------------- */

// Product/category writes and order-status updates now require an
// authenticated admin (see RLS) — admin.js always passes adminSupabaseClient.
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

async function dbInsertNotification(notif, client = supabaseClient) {
  const { error } = await client.from('notifications').insert({
    id: notif.id, type: notif.type, recipient: notif.recipient, template: notif.template,
    notif_time: notif.time, status: notif.status, status_color: notif.statusColor
  });
  if (error) console.error('dbInsertNotification', error);
  return !error;
}

/* ---------------------------------------------------------------------- */
/* Storage — product/category images & videos live in the "meerav-media"  */
/* public bucket instead of base64 blobs, so any device/tab sees the same */
/* uploaded file via a stable public URL the moment it's saved.           */
/* ---------------------------------------------------------------------- */

const MEDIA_BUCKET = 'meerav-media';

/**
 * Uploads a File to Supabase Storage under `folder/` and returns its public
 * URL (or null on failure). `folder` is e.g. "products", "categories",
 * "avatars" — keeps the bucket organized.
 */
async function uploadMedia(file, folder) {
  if (!file) return null;
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabaseClient.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined
  });
  if (error) { console.error('uploadMedia', error); return null; }

  const { data } = supabaseClient.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/* ---------------------------------------------------------------------- */
/* Customer Auth (real Supabase Auth — email + password)                  */
/* ---------------------------------------------------------------------- */

/**
 * Creates a real account (Supabase Auth) plus a matching row in
 * `customers` keyed by the new auth user's id. If the project has email
 * confirmation ON, `session` comes back null — the caller should tell the
 * user to confirm their email before signing in. If it's OFF (or already
 * auto-confirmed), a session comes back immediately and the caller is
 * already logged in.
 */
async function signUpCustomer({ email, password, name, phone, address, pincode }) {
  const { data, error } = await supabaseClient.auth.signUp({
    email, password, options: { data: { name, phone } }
  });
  if (error) return { error };

  const profile = {
    id: data.user.id, name, phone, email, address, pincode,
    avatar: null, wishlist: [], savedAddresses: []
  };
  await dbUpsertCustomer(profile);

  return { user: data.user, session: data.session, needsConfirmation: !data.session, profile };
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

function onAuthChange(callback) {
  return supabaseClient.auth.onAuthStateChange(callback);
}

/* ---------------------------------------------------------------------- */
/* Admin Auth & Account Management                                        */
/* Real Supabase Auth accounts, gated by the `admins` table (RLS-checked   */
/* via the is_admin() function) — not a shared client-side password.      */
/* Registering/removing admins goes through the "admin-manage" Edge       */
/* Function so the service_role key never reaches the browser.            */
/* ---------------------------------------------------------------------- */

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

/**
 * Fires once with the INITIAL_SESSION event as soon as the admin client has
 * finished reading (and, if needed, refreshing) whatever session is in
 * storage — the reliable way to check "is anyone already logged in?" on
 * page load. A plain one-shot getSession() call can race ahead of that
 * hydration on a fresh page load and wrongly report "no session".
 */
function onAdminAuthChange(callback) {
  return adminSupabaseClient.auth.onAuthStateChange(callback);
}

/** Returns the current admin's own row from `admins`, or null if signed out / not an admin. */
async function getCurrentAdminProfile() {
  const { data: userData } = await adminSupabaseClient.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await adminSupabaseClient.from('admins').select('*').eq('id', userData.user.id).maybeSingle();
  if (error) { console.error('getCurrentAdminProfile', error); return null; }
  return data || null;
}

async function fetchAdmins() {
  const { data, error } = await adminSupabaseClient.from('admins').select('*').order('created_at');
  if (error) { console.error('fetchAdmins', error); return []; }
  return data;
}

/** Edge Function errors arrive as a Response on error.context — pull the real {error} message out of its JSON body. */
async function readFunctionError(error) {
  try {
    const body = await error.context.json();
    return body?.error || error.message;
  } catch {
    return error.message;
  }
}

/**
 * Creates a brand-new sub-admin (root only). The server generates a
 * one-time temporary password and returns it in the response — show it to
 * root once so they can hand it to the new admin. That admin is forced to
 * set their own password on first login (must_change_password).
 */
async function registerAdmin({ email, name }) {
  const { data, error } = await adminSupabaseClient.functions.invoke('admin-manage', {
    body: { action: 'register', email, name }
  });
  if (error) return { error: { message: await readFunctionError(error) } };
  return data;
}

/** Root only — issues a fresh temporary password for an existing admin (e.g. "forgot password") and forces a change on next login. */
async function resetAdminPassword(adminId) {
  const { data, error } = await adminSupabaseClient.functions.invoke('admin-manage', {
    body: { action: 'reset_password', adminId }
  });
  if (error) return { error: { message: await readFunctionError(error) } };
  return data;
}

/** Self-service — any signed-in admin sets their own new password (used for the forced first-login / post-reset flow). */
async function changeOwnPassword(newPassword) {
  const { data, error } = await adminSupabaseClient.functions.invoke('admin-manage', {
    body: { action: 'change_password', newPassword }
  });
  if (error) return { error: { message: await readFunctionError(error) } };
  return data;
}

/** Root only — locks out (or restores) a sub-admin's login without deleting their account/history. */
async function banAdmin(adminId) {
  const { data, error } = await adminSupabaseClient.functions.invoke('admin-manage', {
    body: { action: 'ban', adminId }
  });
  if (error) return { error: { message: await readFunctionError(error) } };
  return data;
}

async function unbanAdmin(adminId) {
  const { data, error } = await adminSupabaseClient.functions.invoke('admin-manage', {
    body: { action: 'unban', adminId }
  });
  if (error) return { error: { message: await readFunctionError(error) } };
  return data;
}

/** Root only — sends a warning message to a sub-admin; they see it on their own dashboard until acknowledged. */
async function warnAdmin(adminId, message) {
  const { data, error } = await adminSupabaseClient.functions.invoke('admin-manage', {
    body: { action: 'warn', adminId, message }
  });
  if (error) return { error: { message: await readFunctionError(error) } };
  return data;
}

/** Deletes an admin's real auth account (cascades to remove their `admins` row). Root admin cannot be removed. */
async function removeAdmin(adminId) {
  const { data, error } = await adminSupabaseClient.functions.invoke('admin-manage', {
    body: { action: 'remove', adminId }
  });
  if (error) return { error: { message: await readFunctionError(error) } };
  return data;
}

async function fetchMyWarnings() {
  const { data: userData } = await adminSupabaseClient.auth.getUser();
  if (!userData.user) return [];
  const { data, error } = await adminSupabaseClient.from('admin_warnings')
    .select('*').eq('admin_id', userData.user.id).eq('acknowledged', false).order('created_at', { ascending: false });
  if (error) { console.error('fetchMyWarnings', error); return []; }
  return data;
}

async function fetchWarningsForAdmin(adminId) {
  const { data, error } = await adminSupabaseClient.from('admin_warnings')
    .select('*').eq('admin_id', adminId).order('created_at', { ascending: false });
  if (error) { console.error('fetchWarningsForAdmin', error); return []; }
  return data;
}

async function acknowledgeWarning(warningId) {
  const { error } = await adminSupabaseClient.from('admin_warnings').update({ acknowledged: true }).eq('id', warningId);
  if (error) console.error('acknowledgeWarning', error);
  return !error;
}

/* ---------------------------------------------------------------------- */
/* Admin Activity Log — every catalog/order/notification change a signed- */
/* in admin makes is written here. Only the root admin can read it (RLS), */
/* giving them full visibility into what sub-admins are doing so they can */
/* revoke access if needed.                                               */
/* ---------------------------------------------------------------------- */

async function logAdminActivity(admin, action, target, details = {}) {
  if (!admin) return false;
  const { error } = await adminSupabaseClient.from('admin_activity_log').insert({
    admin_id: admin.id, admin_name: admin.name, admin_role: admin.role,
    action, target, details
  });
  if (error) console.error('logAdminActivity', error);
  return !error;
}

/** Root admin only — RLS blocks this for anyone else and returns an empty list. */
async function fetchActivityLog(limit = 200) {
  const { data, error } = await adminSupabaseClient
    .from('admin_activity_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) { console.error('fetchActivityLog', error); return []; }
  return data;
}

async function fetchActivityForAdmin(adminId, limit = 100) {
  const { data, error } = await adminSupabaseClient
    .from('admin_activity_log').select('*').eq('admin_id', adminId).order('created_at', { ascending: false }).limit(limit);
  if (error) { console.error('fetchActivityForAdmin', error); return []; }
  return data;
}

/** Root only — flags a log entry as reverted, after the caller has actually applied the undo. */
async function markActivityUndone(entryId) {
  const { error } = await adminSupabaseClient.from('admin_activity_log').update({ undone: true }).eq('id', entryId);
  if (error) console.error('markActivityUndone', error);
  return !error;
}

/* ---------------------------------------------------------------------- */
/* Realtime subscriptions                                                 */
/* ---------------------------------------------------------------------- */

function subscribeTable(table, onChange) {
  return supabaseClient
    .channel(`realtime:${table}:${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    .subscribe();
}

const MiraDB = {
  fetchCategories, fetchProducts, fetchOrders, fetchCustomers, fetchNotifications,
  dbUpsertProduct, dbDeleteProduct,
  dbUpsertCategory, dbDeleteCategory,
  dbInsertOrder, dbUpdateOrderStatus,
  dbUpsertCustomer,
  dbInsertNotification,
  subscribeTable,
  uploadMedia,
  signUpCustomer, signInCustomer, signOutCustomer, getCurrentSession, getOrCreateCustomerProfile, onAuthChange,
  adminClient: adminSupabaseClient,
  signInAdmin, signOutAdmin, getAdminSession, getCurrentAdminProfile, onAdminAuthChange,
  fetchAdmins, registerAdmin, removeAdmin,
  resetAdminPassword, changeOwnPassword, banAdmin, unbanAdmin, warnAdmin,
  fetchMyWarnings, fetchWarningsForAdmin, acknowledgeWarning,
  logAdminActivity, fetchActivityLog, fetchActivityForAdmin, markActivityUndone,
  mappers: { dbProductToApp, dbCategoryToApp, dbCustomerToApp, dbOrderToApp, dbNotifToApp }
};
