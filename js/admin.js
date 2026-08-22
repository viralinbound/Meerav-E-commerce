/**
 * MEERAV NAMKEENS - DEDICATED MULTI-PAGE ADMIN OPERATIONS CONTROLLER
 * Full Product & Category CRUD (Add, Edit, Delete, File Image Upload, Price/Discount Changer)
 * Customer CRM & Live Dispatch Automations
 */

const adminState = {
  isAuthenticated: false,
  currentAdmin: null, // { id, name, email, role } — set once signed in as a real admin
  currentPage: 'overview',
  orders: [],
  products: [],
  categories: [],
  customers: [],
  notifications: [],
  admins: [],
  myWarnings: [],
  viewingAdminId: null, // set while the per-admin detail modal is open
  editingProductId: null,
  editingCategoryId: null,
  uploadedProductImageUrl: null,
  uploadedProductVideoUrl: null,
  removeExistingVideo: false,
  uploadedCategoryImageUrl: null,
  orderFilter: 'all',
  customerSearchQuery: '',
  productSearchQuery: ''
};

/**
 * Recomputes each customer's live orders-count / lifetime-spend from the
 * current orders table, matched by phone number (matches the same rule
 * auth.js uses to link an order to a customer).
 */
function recomputeCustomerStats() {
  adminState.customers.forEach(c => {
    const digits = (c.phone || '').replace(/\D/g, '').slice(-10);
    const matched = adminState.orders.filter(o =>
      o.customer && ((o.customer.name || '').toLowerCase() === c.name.toLowerCase() ||
        (digits && (o.customer.phone || '').replace(/\D/g, '').includes(digits)))
    );
    c.ordersCount = matched.length;
    c.totalSpent = matched.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  });
}

async function loadAdminData() {
  const adminClient = MiraDB.adminClient;
  const [categories, products, orders, customers, notifications] = await Promise.all([
    fetchCategories(), fetchProducts(), fetchOrders(), fetchCustomers(adminClient), fetchNotifications(adminClient)
  ]);
  adminState.categories = categories.length ? categories : [...MIRA_DATA.categories];
  adminState.products = products.length ? products : [...MIRA_DATA.products];
  adminState.orders = orders;
  adminState.customers = customers.length ? customers : [...MIRA_DATA.customers];
  adminState.notifications = notifications;
  recomputeCustomerStats();
}

/**
 * Real auto-login: if this browser already has a valid admin session
 * (Supabase Auth, isolated from the customer session), skip the login form.
 *
 * Waits for the INITIAL_SESSION event rather than calling getSession() once
 * on DOMContentLoaded — a one-shot check can race ahead of the client's own
 * async session hydration on a fresh page load and wrongly report "signed
 * out" even though a valid session is sitting right there in storage.
 */
let adminAuthBootstrapped = false;

MiraDB.onAdminAuthChange(async (event, session) => {
  if (event === 'INITIAL_SESSION') {
    if (session) {
      const profile = await MiraDB.getCurrentAdminProfile();
      if (profile && !profile.banned) {
        await enterAdminDashboard(profile);
      } else {
        await MiraDB.signOutAdmin();
      }
    }
    adminAuthBootstrapped = true;
    checkAdminAuth();
  } else if (event === 'SIGNED_OUT' && adminAuthBootstrapped) {
    adminState.isAuthenticated = false;
    adminState.currentAdmin = null;
    checkAdminAuth();
  }
});

/** Shared by auto-login and the login form: hydrate state, then route to either the forced password-change screen or the real dashboard. */
async function enterAdminDashboard(profile) {
  adminState.isAuthenticated = true;
  adminState.currentAdmin = profile;
  await loadAdminData();
  setupAdminRealtime();
  adminState.myWarnings = await MiraDB.fetchMyWarnings();
}

/**
 * REAL-TIME SYNC — dashboard reflects new storefront orders, stock/price
 * edits from other admin sessions, and notification events live.
 */
function setupAdminRealtime() {
  MiraDB.subscribeTable('orders', (payload) => {
    if (payload.eventType === 'DELETE') {
      adminState.orders = adminState.orders.filter(o => o.id !== payload.old.id);
    } else {
      const updated = MiraDB.mappers.dbOrderToApp(payload.new);
      const idx = adminState.orders.findIndex(o => o.id === updated.id);
      if (idx === -1) {
        adminState.orders.unshift(updated);
        if (payload.eventType === 'INSERT') showToast(`New order received: #${updated.id} 🛎️`, 'success');
      } else {
        adminState.orders[idx] = updated;
      }
    }
    recomputeCustomerStats();
    if (adminState.currentPage === 'overview') { renderAdminKPIs(); renderOverviewRecentOrders(); }
    if (adminState.currentPage === 'orders') renderAdminOrders();
    if (adminState.currentPage === 'customers') renderAdminCustomers();
  });

  MiraDB.subscribeTable('products', (payload) => {
    if (payload.eventType === 'DELETE') {
      adminState.products = adminState.products.filter(p => p.id !== payload.old.id);
    } else {
      const updated = MiraDB.mappers.dbProductToApp(payload.new);
      const idx = adminState.products.findIndex(p => p.id === updated.id);
      if (idx === -1) adminState.products.unshift(updated); else adminState.products[idx] = updated;
    }
    if (adminState.currentPage === 'catalog') renderAdminProducts();
    if (adminState.currentPage === 'overview') renderAdminKPIs();
  });

  MiraDB.subscribeTable('categories', async () => {
    adminState.categories = await fetchCategories();
    populateCategoryDropdowns();
    if (adminState.currentPage === 'categories') renderAdminCategories();
    if (adminState.currentPage === 'overview') renderAdminKPIs();
  });

  MiraDB.subscribeTable('notifications', (payload) => {
    if (payload.eventType === 'INSERT') {
      adminState.notifications.unshift(MiraDB.mappers.dbNotifToApp(payload.new));
      if (adminState.currentPage === 'notifications') renderAdminNotificationLogs();
    }
  });

  // Root sees sub-admin activity live (RLS hides this entirely for non-root sessions).
  MiraDB.subscribeTable('admin_activity_log', () => {
    if (adminState.currentPage === 'admins') renderAdminAccounts();
  });
}

/**
 * 1. AUTHENTICATION & LOGIN GATE
 */
function checkAdminAuth() {
  const loginGate = document.getElementById('admin-login-gate');
  const dashboard = document.getElementById('admin-dashboard-container');
  const forcedPwScreen = document.getElementById('admin-force-password-gate');

  if (adminState.isAuthenticated && adminState.currentAdmin?.must_change_password) {
    if (loginGate) loginGate.classList.add('hidden');
    if (dashboard) dashboard.classList.add('hidden');
    if (forcedPwScreen) forcedPwScreen.classList.remove('hidden');
    return;
  }
  if (forcedPwScreen) forcedPwScreen.classList.add('hidden');

  if (adminState.isAuthenticated) {
    if (loginGate) loginGate.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    populateCategoryDropdowns();
    renderAdminIdentityBadge();
    renderWarningBanner();
    showAdminPage(adminState.currentPage || 'overview');
  } else {
    if (loginGate) loginGate.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
  }
}

function renderWarningBanner() {
  const container = document.getElementById('admin-warning-banner');
  if (!container) return;

  if (!adminState.myWarnings.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = adminState.myWarnings.map(w => `
    <div class="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3 mb-3">
      <i class="fas fa-triangle-exclamation text-red-500 text-lg mt-0.5"></i>
      <div class="flex-1 text-xs">
        <div class="font-black text-red-800 mb-0.5">Warning from ${w.issued_by_name}</div>
        <p class="text-red-700">${w.message}</p>
        <p class="text-[10px] text-red-400 mt-1">${new Date(w.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>
      <button onclick="acknowledgeMyWarning('${w.id}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-lg transition shrink-0">
        Acknowledge
      </button>
    </div>
  `).join('');
}

async function acknowledgeMyWarning(warningId) {
  await MiraDB.acknowledgeWarning(warningId);
  adminState.myWarnings = adminState.myWarnings.filter(w => w.id !== warningId);
  renderWarningBanner();
}

function renderAdminIdentityBadge() {
  const badge = document.getElementById('admin-identity-badge');
  if (!badge || !adminState.currentAdmin) return;
  const a = adminState.currentAdmin;
  badge.innerHTML = `
    <div class="font-bold text-white truncate">${a.name}</div>
    <div class="truncate">${a.email} &bull; <span class="text-[#FBBF24] font-bold uppercase">${a.role}</span></div>
  `;

  // Admin account management (register/remove/activity log) is root-only.
  const isRoot = a.role === 'root';
  document.getElementById('admin-nav-admins-btn')?.classList.toggle('hidden', !isRoot);
  document.getElementById('admin-mobile-admins-btn')?.classList.toggle('hidden', !isRoot);
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('admin-login-email').value.trim();
  const password = document.getElementById('admin-login-password').value;
  const errorBox = document.getElementById('admin-login-error');
  if (errorBox) errorBox.classList.add('hidden');

  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Authorizing...'; }

  const result = await MiraDB.signInAdmin(email, password);

  if (result.error) {
    if (errorBox) { errorBox.textContent = result.error.message || 'Invalid credentials'; errorBox.classList.remove('hidden'); }
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<span>Authorize & Enter Portal</span> <i class="fas fa-arrow-right text-xs"></i>'; }
    return;
  }

  showToast(`Welcome, ${result.profile.name}! Admin Operations Portal Unlocked 🛡️`, 'success');
  await enterAdminDashboard(result.profile);
  checkAdminAuth();
}

/** First login with a temp password, or after root resets one — the admin must set their own password before the dashboard unlocks. */
async function handleForcePasswordChange(event) {
  event.preventDefault();
  const newPassword = document.getElementById('force-pw-new').value;
  const confirmPassword = document.getElementById('force-pw-confirm').value;
  const errorBox = document.getElementById('force-pw-error');
  if (errorBox) errorBox.classList.add('hidden');

  if (newPassword !== confirmPassword) {
    if (errorBox) { errorBox.textContent = 'Passwords do not match'; errorBox.classList.remove('hidden'); }
    return;
  }

  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Updating...'; }

  const result = await MiraDB.changeOwnPassword(newPassword);

  if (result.error) {
    if (errorBox) { errorBox.textContent = result.error.message || 'Could not update password'; errorBox.classList.remove('hidden'); }
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Set New Password & Continue'; }
    return;
  }

  adminState.currentAdmin.must_change_password = false;
  showToast('Password updated! Welcome to the portal. 🔐', 'success');
  checkAdminAuth();
}

async function logoutAdmin() {
  await MiraDB.signOutAdmin();
  adminState.isAuthenticated = false;
  adminState.currentAdmin = null;
  showToast('Logged out of Admin Portal', 'info');
  checkAdminAuth();
}

/**
 * 2. MULTI-PAGE ROUTER CONTROLLER
 */
function showAdminPage(pageId) {
  if (pageId === 'admins' && adminState.currentAdmin?.role !== 'root') {
    showToast('Only the root admin can manage admin accounts', 'error');
    pageId = 'overview';
  }
  adminState.currentPage = pageId;

  // Update Sidebar Navigation active states
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    const target = item.getAttribute('data-page');
    if (target === pageId) {
      item.classList.add('active', 'bg-[#E59819]', 'text-[#32040C]');
      item.classList.remove('text-gray-400');
    } else {
      item.classList.remove('active', 'bg-[#E59819]', 'text-[#32040C]');
      item.classList.add('text-gray-400');
    }
  });

  // Hide all views, show selected
  document.querySelectorAll('.admin-page-view').forEach(section => {
    section.classList.add('hidden');
  });

  const activeSection = document.getElementById(`view-${pageId}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.classList.add('animate-fade-in');
  }

  // Render specific page contents
  if (pageId === 'overview') {
    renderAdminKPIs();
    renderOverviewRecentOrders();
  } else if (pageId === 'orders') {
    renderAdminOrders();
  } else if (pageId === 'catalog') {
    renderAdminProducts();
  } else if (pageId === 'categories') {
    renderAdminCategories();
  } else if (pageId === 'customers') {
    renderAdminCustomers();
  } else if (pageId === 'notifications') {
    renderAdminNotificationLogs();
  } else if (pageId === 'admins') {
    renderAdminAccounts();
  }
}

/**
 * 3. OVERVIEW & KPI METRICS
 */
function renderAdminKPIs() {
  const totalRevenue = adminState.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const revenueEl = document.getElementById('admin-kpi-revenue');
  const ordersEl = document.getElementById('admin-kpi-orders');
  const prodsEl = document.getElementById('admin-kpi-products');
  const catsEl = document.getElementById('admin-kpi-categories');

  if (revenueEl) revenueEl.textContent = `₹${totalRevenue.toLocaleString()}`;
  if (ordersEl) ordersEl.textContent = adminState.orders.length;
  if (prodsEl) prodsEl.textContent = adminState.products.length;
  if (catsEl) catsEl.textContent = adminState.categories.filter(c => c.id !== 'all').length;
}

function renderOverviewRecentOrders() {
  const tbody = document.getElementById('overview-recent-orders-table');
  if (!tbody) return;

  const recent = adminState.orders.slice(0, 5);
  tbody.innerHTML = recent.map(order => `
    <tr class="hover:bg-amber-50/40 transition">
      <td class="font-black text-[#4A0713] text-xs">#${order.id}</td>
      <td class="text-xs font-bold text-gray-900">${order.customer.name}</td>
      <td class="font-black text-emerald-800 text-xs">₹${order.totalAmount}</td>
      <td>
        <span class="px-2.5 py-0.5 text-[10px] font-black rounded-full ${
          order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
          order.orderStatus === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
        }">${order.orderStatus}</span>
      </td>
      <td class="text-xs text-gray-400">${order.date}</td>
    </tr>
  `).join('');
}

/**
 * 4. ORDERS & DISPATCH MANAGEMENT
 */
function filterAdminOrders(status) {
  adminState.orderFilter = status;
  renderAdminOrders();
}

function renderAdminOrders() {
  const tbody = document.getElementById('admin-orders-table');
  if (!tbody) return;

  let filtered = adminState.orders;
  if (adminState.orderFilter !== 'all') {
    filtered = adminState.orders.filter(o => o.orderStatus.toLowerCase() === adminState.orderFilter.toLowerCase());
  }

  tbody.innerHTML = filtered.map(order => `
    <tr class="hover:bg-amber-50/40 transition">
      <td class="font-black text-[#4A0713] text-xs">#${order.id}</td>
      <td>
        <div class="font-black text-xs text-gray-900">${order.customer.name}</div>
        <div class="text-[11px] text-gray-500 font-medium">${order.customer.phone}</div>
        <div class="text-[10px] text-gray-400 line-clamp-1">${order.customer.address}</div>
      </td>
      <td>
        <div class="text-xs text-gray-700 font-semibold line-clamp-1">${order.items ? order.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Signature Namkeens'}</div>
        <div class="text-[10px] text-gray-400 mt-0.5">${order.date} &bull; ${order.paymentMethod}</div>
      </td>
      <td class="font-black text-[#4A0713] text-xs">₹${order.totalAmount}</td>
      <td>
        <select onchange="updateOrderStatus('${order.id}', this.value)" class="text-xs font-black py-1 px-2.5 rounded-xl border cursor-pointer ${
          order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
          order.orderStatus === 'Dispatched' ? 'bg-blue-50 text-blue-800 border-blue-300' :
          order.orderStatus === 'Processing' ? 'bg-amber-50 text-amber-800 border-amber-300' :
          'bg-gray-50 text-gray-700 border-gray-300'
        }">
          <option value="Pending" ${order.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Processing" ${order.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Dispatched" ${order.orderStatus === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
          <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td>
        <div class="flex items-center gap-1.5">
          <button onclick="previewWhatsAppNotification('${order.id}')" title="WhatsApp Alert" class="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs transition">
            <i class="fab fa-whatsapp"></i>
          </button>
          <button onclick="previewEmailNotification('${order.id}')" title="Email Invoice" class="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs transition">
            <i class="fas fa-envelope"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(orderId, newStatus) {
  const order = adminState.orders.find(o => o.id === orderId);
  if (!order) return;

  const previousStatus = order.orderStatus;
  order.orderStatus = newStatus;

  const notif = {
    id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
    type: 'WhatsApp',
    recipient: `${order.customer.phone} (${order.customer.name})`,
    template: `Status Changed to ${newStatus} #${order.id}`,
    time: 'Just now',
    status: 'Delivered & Read',
    statusColor: 'green'
  };
  adminState.notifications.unshift(notif);

  await Promise.all([
    MiraDB.dbUpdateOrderStatus(order.id, newStatus, MiraDB.adminClient),
    MiraDB.dbInsertNotification(notif, MiraDB.adminClient)
  ]);
  MiraDB.logAdminActivity(adminState.currentAdmin, 'order.status_update', `#${order.id}`, { orderId: order.id, from: previousStatus, to: newStatus });

  renderAdminOrders();
  renderAdminNotificationLogs();
  showToast(`Order #${order.id} status updated to "${newStatus}". WhatsApp alert dispatched! 🚀`, 'success');
}

/**
 * 5. PRODUCT CATALOG MANAGEMENT & IMAGE UPLOAD CRUD
 */
function searchAdminProducts(query) {
  adminState.productSearchQuery = query.toLowerCase().trim();
  renderAdminProducts();
}

function renderAdminProducts() {
  const tbody = document.getElementById('admin-products-table');
  if (!tbody) return;

  let filtered = adminState.products;
  if (adminState.productSearchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(adminState.productSearchQuery) ||
      p.category.toLowerCase().includes(adminState.productSearchQuery) ||
      (p.tag && p.tag.toLowerCase().includes(adminState.productSearchQuery))
    );
  }

  tbody.innerHTML = filtered.map(p => {
    const v = p.variants[0];
    const discount = Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100);

    return `
      <tr class="hover:bg-amber-50/40 transition">
        <td>
          <div class="flex items-center gap-3">
            <img src="${p.image}" class="w-12 h-12 rounded-xl object-contain bg-amber-50 p-1 border border-amber-200" />
            <div>
              <div class="font-black text-xs text-gray-900">${p.name}</div>
              <div class="text-[10px] text-gray-400 capitalize">${p.category} &bull; <span class="text-amber-700 font-bold">${p.tag}</span></div>
            </div>
          </div>
        </td>
        <td>
          <div class="text-xs font-bold text-gray-800">
            ₹${v.price} <span class="text-[10px] text-gray-400 line-through">₹${v.originalPrice}</span>
            <span class="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded ml-1">${discount}% OFF</span>
          </div>
          <div class="text-[10px] text-gray-400">${p.variants.length} Variants (${p.variants.map(varItem => varItem.weight).join(', ')})</div>
        </td>
        <td>
          <button onclick="toggleProductStock('${p.id}')" class="px-2.5 py-1 text-[10px] font-black rounded-full transition ${
            p.inStock ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
          }">
            <i class="fas ${p.inStock ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1"></i>
            ${p.inStock ? 'In Stock' : 'Out of Stock'}
          </button>
        </td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="openEditProductModal('${p.id}')" title="Edit Product & Upload Image" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1">
              <i class="fas fa-pen-to-square text-[10px]"></i> Edit / Image
            </button>
            <button onclick="deleteProduct('${p.id}')" title="Delete Product" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs transition">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleProductImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const status = document.getElementById('prod-img-upload-status');
  if (status) status.textContent = 'Uploading...';

  // Instant local preview while the real upload runs in the background
  const preview = document.getElementById('prod-img-preview');
  const localUrl = URL.createObjectURL(file);
  if (preview) { preview.src = localUrl; preview.classList.remove('hidden'); }

  const publicUrl = await MiraDB.uploadMedia(file, 'products');
  if (!publicUrl) {
    if (status) status.textContent = 'Upload failed';
    showToast('Image upload failed — please try again', 'error');
    return;
  }

  adminState.uploadedProductImageUrl = publicUrl;
  if (status) status.textContent = 'Uploaded ✓';
  showToast('Product Image Uploaded to Storage! 📸', 'success');
}

async function handleProductVideoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const status = document.getElementById('prod-video-upload-status');
  const preview = document.getElementById('prod-video-preview');
  const clearBtn = document.getElementById('prod-video-clear-btn');
  if (status) status.textContent = 'Uploading...';

  const localUrl = URL.createObjectURL(file);
  if (preview) { preview.src = localUrl; preview.classList.remove('hidden'); preview.play().catch(() => {}); }

  const publicUrl = await MiraDB.uploadMedia(file, 'products');
  if (!publicUrl) {
    if (status) status.textContent = 'Upload failed';
    showToast('Video upload failed — please try again', 'error');
    return;
  }

  adminState.uploadedProductVideoUrl = publicUrl;
  if (status) status.textContent = 'Uploaded ✓';
  if (clearBtn) clearBtn.classList.remove('hidden');
  showToast('Product Video Uploaded to Storage! 🎬', 'success');
}

function clearProductVideo() {
  adminState.uploadedProductVideoUrl = null;
  adminState.removeExistingVideo = true;
  const preview = document.getElementById('prod-video-preview');
  const clearBtn = document.getElementById('prod-video-clear-btn');
  const status = document.getElementById('prod-video-upload-status');
  if (preview) { preview.pause(); preview.src = ''; preview.classList.add('hidden'); }
  if (clearBtn) clearBtn.classList.add('hidden');
  if (status) status.textContent = 'Removed';
}

function openAddProductModal() {
  adminState.editingProductId = null;
  adminState.uploadedProductImageUrl = null;
  adminState.uploadedProductVideoUrl = null;
  adminState.removeExistingVideo = false;
  populateCategoryDropdowns();

  document.getElementById('product-modal-title').textContent = 'Add New Bikaneri Product & Upload Packaging';
  document.getElementById('prod-form-id').value = '';
  document.getElementById('prod-form-name').value = '';
  document.getElementById('prod-form-tag').value = 'Signature Bikaneri';
  document.getElementById('prod-form-spice').value = 'Medium (🌶️🌶️)';
  document.getElementById('prod-form-desc').value = '';
  document.getElementById('prod-form-image').value = 'assets/images/pack_bikaneri_bhujia.svg';

  const preview = document.getElementById('prod-img-preview');
  if (preview) {
    preview.src = 'assets/images/pack_bikaneri_bhujia.svg';
    preview.classList.remove('hidden');
  }
  const imgStatus = document.getElementById('prod-img-upload-status');
  if (imgStatus) imgStatus.textContent = '';

  const videoPreview = document.getElementById('prod-video-preview');
  if (videoPreview) { videoPreview.pause(); videoPreview.src = ''; videoPreview.classList.add('hidden'); }
  const videoClearBtn = document.getElementById('prod-video-clear-btn');
  if (videoClearBtn) videoClearBtn.classList.add('hidden');
  const videoStatus = document.getElementById('prod-video-upload-status');
  if (videoStatus) videoStatus.textContent = '';

  document.getElementById('prod-form-p200').value = 99;
  document.getElementById('prod-form-orig200').value = 120;
  document.getElementById('prod-form-p500').value = 229;
  document.getElementById('prod-form-orig500').value = 260;
  document.getElementById('prod-form-p1kg').value = 429;
  document.getElementById('prod-form-orig1kg').value = 480;

  document.getElementById('product-form-modal').classList.remove('hidden');
}

function openEditProductModal(productId) {
  const p = adminState.products.find(item => item.id === productId);
  if (!p) return;

  adminState.editingProductId = productId;
  adminState.uploadedProductImageUrl = null;
  adminState.uploadedProductVideoUrl = null;
  adminState.removeExistingVideo = false;
  populateCategoryDropdowns();

  document.getElementById('product-modal-title').textContent = `Edit Product: ${p.name}`;
  document.getElementById('prod-form-id').value = p.id;
  document.getElementById('prod-form-name').value = p.name;
  document.getElementById('prod-form-tag').value = p.tag || 'Bikaner Special';
  document.getElementById('prod-form-category').value = p.category;
  document.getElementById('prod-form-spice').value = p.spiceLevel;
  document.getElementById('prod-form-desc').value = p.description;

  const preview = document.getElementById('prod-img-preview');
  if (preview) {
    preview.src = p.image;
    preview.classList.remove('hidden');
  }
  const imgStatus = document.getElementById('prod-img-upload-status');
  if (imgStatus) imgStatus.textContent = '';

  const videoPreview = document.getElementById('prod-video-preview');
  const videoClearBtn = document.getElementById('prod-video-clear-btn');
  const videoStatus = document.getElementById('prod-video-upload-status');
  if (p.video) {
    if (videoPreview) { videoPreview.src = p.video; videoPreview.classList.remove('hidden'); }
    if (videoClearBtn) videoClearBtn.classList.remove('hidden');
  } else {
    if (videoPreview) { videoPreview.pause(); videoPreview.src = ''; videoPreview.classList.add('hidden'); }
    if (videoClearBtn) videoClearBtn.classList.add('hidden');
  }
  if (videoStatus) videoStatus.textContent = '';

  document.getElementById('prod-form-p200').value = p.variants[0]?.price || 99;
  document.getElementById('prod-form-orig200').value = p.variants[0]?.originalPrice || 120;
  document.getElementById('prod-form-p500').value = p.variants[1]?.price || 229;
  document.getElementById('prod-form-orig500').value = p.variants[1]?.originalPrice || 260;
  document.getElementById('prod-form-p1kg').value = p.variants[2]?.price || 429;
  document.getElementById('prod-form-orig1kg').value = p.variants[2]?.originalPrice || 480;

  document.getElementById('product-form-modal').classList.remove('hidden');
}

function closeProductFormModal() {
  document.getElementById('product-form-modal').classList.add('hidden');
}

async function saveProductForm(event) {
  event.preventDefault();

  const id = document.getElementById('prod-form-id').value.trim() || `p-${Date.now()}`;
  const name = document.getElementById('prod-form-name').value.trim();
  const tag = document.getElementById('prod-form-tag').value.trim();
  const category = document.getElementById('prod-form-category').value;
  const spiceLevel = document.getElementById('prod-form-spice').value;
  const description = document.getElementById('prod-form-desc').value.trim();
  
  // Use the Storage-uploaded file if one was uploaded, otherwise the selected pouch preset
  const image = adminState.uploadedProductImageUrl || document.getElementById('prod-form-image').value.trim() || 'assets/images/pack_bikaneri_bhujia.svg';

  const existingProduct = adminState.products.find(item => item.id === id);
  let video = existingProduct ? existingProduct.video : undefined;
  if (adminState.uploadedProductVideoUrl) video = adminState.uploadedProductVideoUrl;
  if (adminState.removeExistingVideo) video = undefined;

  const p200 = Number(document.getElementById('prod-form-p200').value) || 99;
  const orig200 = Number(document.getElementById('prod-form-orig200').value) || p200;
  const p500 = Number(document.getElementById('prod-form-p500').value) || (p200 * 2.3);
  const orig500 = Number(document.getElementById('prod-form-orig500').value) || p500;
  const p1kg = Number(document.getElementById('prod-form-p1kg').value) || (p200 * 4.2);
  const orig1kg = Number(document.getElementById('prod-form-orig1kg').value) || p1kg;

  const variants = [
    { weight: "200 g", price: p200, originalPrice: orig200 },
    { weight: "500 g", price: p500, originalPrice: orig500 },
    { weight: "1 kg", price: p1kg, originalPrice: orig1kg }
  ];

  const existingIndex = adminState.products.findIndex(item => item.id === id);
  let savedProduct;

  const beforeProduct = existingIndex !== -1 ? { ...adminState.products[existingIndex] } : null;

  if (existingIndex !== -1) {
    savedProduct = {
      ...adminState.products[existingIndex],
      name,
      tag,
      category,
      spiceLevel,
      description,
      image,
      video,
      variants
    };
    adminState.products[existingIndex] = savedProduct;
    showToast(`Updated product: ${name} with new packaging image & pricing! 🎉`, 'success');
  } else {
    savedProduct = {
      id,
      name,
      tag,
      category,
      rating: 5.0,
      reviewsCount: 1,
      spiceLevel,
      dietary: ["100% Veg", "Pure & Clean Oil"],
      image,
      video,
      description,
      ingredients: "Traditional ingredients, pure cold-pressed oil, authentic desert spices.",
      nutrition: { energy: "520 kcal", fat: "30g", carbs: "48g", protein: "12g" },
      inStock: true,
      variants
    };
    adminState.products.unshift(savedProduct);
    showToast(`Added new product: ${name} with uploaded pouch packaging! 🍿`, 'success');
  }

  await MiraDB.dbUpsertProduct(savedProduct, MiraDB.adminClient);
  MiraDB.logAdminActivity(adminState.currentAdmin, existingIndex !== -1 ? 'product.update' : 'product.create', name, { productId: savedProduct.id, before: beforeProduct });
  renderAdminProducts();
  renderAdminKPIs();
  closeProductFormModal();
}

async function deleteProduct(productId) {
  const p = adminState.products.find(item => item.id === productId);
  if (!p) return;

  if (confirm(`Are you sure you want to delete "${p.name}" from catalog?`)) {
    adminState.products = adminState.products.filter(item => item.id !== productId);
    await MiraDB.dbDeleteProduct(productId, MiraDB.adminClient);
    MiraDB.logAdminActivity(adminState.currentAdmin, 'product.delete', p.name, { productId, before: p });
    renderAdminProducts();
    renderAdminKPIs();
    showToast(`Deleted ${p.name} from catalog`, 'info');
  }
}

async function toggleProductStock(productId) {
  const p = adminState.products.find(item => item.id === productId);
  if (p) {
    const previousInStock = p.inStock;
    p.inStock = !p.inStock;
    await MiraDB.dbUpsertProduct(p, MiraDB.adminClient);
    MiraDB.logAdminActivity(adminState.currentAdmin, 'product.toggle_stock', p.name, { productId, from: previousInStock, to: p.inStock });
    renderAdminProducts();
    showToast(`Stock availability updated for ${p.name}`, 'info');
  }
}

/**
 * 6. CATEGORY CRUD & CATEGORY IMAGE UPLOADS
 */
function renderAdminCategories() {
  const tbody = document.getElementById('admin-categories-table');
  if (!tbody) return;

  const validCats = adminState.categories.filter(c => c.id !== 'all');

  tbody.innerHTML = validCats.map(cat => {
    const count = adminState.products.filter(p => p.category === cat.id).length;

    return `
      <tr class="hover:bg-amber-50/40 transition">
        <td>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4A0713] to-[#670E1E] text-[#FBBF24] flex items-center justify-center text-lg shadow-sm">
              <i class="${cat.icon || 'fas fa-cookie'}"></i>
            </div>
            <div>
              <div class="font-black text-xs text-gray-900">${cat.name}</div>
              <div class="text-[10px] text-gray-400 font-mono">slug: ${cat.id}</div>
            </div>
          </div>
        </td>
        <td class="text-xs text-gray-600 font-medium">${cat.description || 'Authentic Bikaneri traditional category'}</td>
        <td>
          <span class="px-2.5 py-0.5 bg-amber-100 text-[#4A0713] text-xs font-black rounded-full border border-amber-200">
            ${count} Products
          </span>
        </td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="openEditCategoryModal('${cat.id}')" title="Edit Category" class="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition">
              <i class="fas fa-pen text-[10px]"></i> Edit
            </button>
            <button onclick="deleteCategory('${cat.id}')" title="Delete Category" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs transition">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function populateCategoryDropdowns() {
  const select = document.getElementById('prod-form-category');
  if (!select) return;

  const validCats = adminState.categories.filter(c => c.id !== 'all');
  select.innerHTML = validCats.map(c => `
    <option value="${c.id}">${c.name}</option>
  `).join('');
}

function openAddCategoryModal() {
  adminState.editingCategoryId = null;
  adminState.uploadedCategoryImageUrl = null;

  document.getElementById('cat-modal-title').textContent = 'Add New Snack Category';
  document.getElementById('cat-form-id').value = '';
  document.getElementById('cat-form-name').value = '';
  document.getElementById('cat-form-icon').value = 'fas fa-cookie';
  document.getElementById('cat-form-desc').value = '';

  document.getElementById('category-form-modal').classList.remove('hidden');
}

function openEditCategoryModal(catId) {
  const cat = adminState.categories.find(c => c.id === catId);
  if (!cat) return;

  adminState.editingCategoryId = catId;
  document.getElementById('cat-modal-title').textContent = `Edit Category: ${cat.name}`;
  document.getElementById('cat-form-id').value = cat.id;
  document.getElementById('cat-form-name').value = cat.name;
  document.getElementById('cat-form-icon').value = cat.icon || 'fas fa-cookie';
  document.getElementById('cat-form-desc').value = cat.description || '';

  document.getElementById('category-form-modal').classList.remove('hidden');
}

function closeCategoryFormModal() {
  document.getElementById('category-form-modal').classList.add('hidden');
}

async function saveCategoryForm(event) {
  event.preventDefault();

  const name = document.getElementById('cat-form-name').value.trim();
  const rawId = document.getElementById('cat-form-id').value.trim();
  const id = rawId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const icon = document.getElementById('cat-form-icon').value.trim() || 'fas fa-cookie';
  const description = document.getElementById('cat-form-desc').value.trim();

  const existingIdx = adminState.categories.findIndex(c => c.id === id);
  const beforeCategory = existingIdx !== -1 ? { ...adminState.categories[existingIdx] } : null;
  const savedCategory = { id, name, icon, description };

  if (existingIdx !== -1) {
    adminState.categories[existingIdx] = { ...adminState.categories[existingIdx], ...savedCategory };
    showToast(`Updated category: ${name}! 📁`, 'success');
  } else {
    adminState.categories.push(savedCategory);
    showToast(`Added new category: ${name}! 📁`, 'success');
  }

  await MiraDB.dbUpsertCategory(savedCategory, MiraDB.adminClient);
  MiraDB.logAdminActivity(adminState.currentAdmin, existingIdx !== -1 ? 'category.update' : 'category.create', name, { categoryId: id, before: beforeCategory });
  populateCategoryDropdowns();
  renderAdminCategories();
  renderAdminKPIs();
  closeCategoryFormModal();
}

async function deleteCategory(catId) {
  const cat = adminState.categories.find(c => c.id === catId);
  if (!cat) return;

  if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
    adminState.categories = adminState.categories.filter(c => c.id !== catId);
    await MiraDB.dbDeleteCategory(catId, MiraDB.adminClient);
    MiraDB.logAdminActivity(adminState.currentAdmin, 'category.delete', cat.name, { categoryId: catId, before: cat });
    populateCategoryDropdowns();
    renderAdminCategories();
    renderAdminKPIs();
    showToast(`Deleted category: ${cat.name}`, 'info');
  }
}

/**
 * 7. CUSTOMER CRM (Search, View Profile & Lifetime Spend)
 */
function searchCustomers(query) {
  adminState.customerSearchQuery = query.toLowerCase().trim();
  renderAdminCustomers();
}

function renderAdminCustomers() {
  const tbody = document.getElementById('admin-customers-table');
  if (!tbody) return;

  let filtered = adminState.customers;
  if (adminState.customerSearchQuery) {
    filtered = adminState.customers.filter(c => 
      c.name.toLowerCase().includes(adminState.customerSearchQuery) ||
      c.phone.includes(adminState.customerSearchQuery) ||
      (c.email && c.email.toLowerCase().includes(adminState.customerSearchQuery))
    );
  }

  tbody.innerHTML = filtered.map(c => `
    <tr class="hover:bg-amber-50/40 transition">
      <td>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#4A0713] text-[#FBBF24] flex items-center justify-center font-black text-xs shadow-xs">
            ${c.name.charAt(0)}
          </div>
          <div>
            <div class="font-black text-xs text-gray-900">${c.name}</div>
            <div class="text-[10px] text-gray-400">${c.email || 'customer@mira.com'}</div>
          </div>
        </div>
      </td>
      <td class="text-xs font-bold text-gray-700">${c.phone}</td>
      <td>
        <span class="px-2.5 py-0.5 bg-amber-100 text-[#4A0713] text-xs font-black rounded-full border border-amber-200">
          ${c.ordersCount} Orders
        </span>
      </td>
      <td class="text-xs font-black text-emerald-700">₹${c.totalSpent.toLocaleString()}</td>
      <td class="text-right">
        <div class="flex items-center justify-end gap-1.5">
          <a href="https://wa.me/${c.phone.replace(/\D/g, '')}" target="_blank" title="Chat on WhatsApp" class="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs transition border border-emerald-300">
            <i class="fab fa-whatsapp"></i>
          </a>
          <button onclick="viewCustomerDetails('${c.id}')" class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition">
            View History
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function viewCustomerDetails(customerId) {
  const c = adminState.customers.find(item => item.id === customerId) || adminState.customers[0];
  if (!c) return;

  const orders = adminState.orders.filter(o => o.customer && o.customer.name.toLowerCase() === c.name.toLowerCase());

  alert(`Customer CRM Profile:\n\nName: ${c.name}\nPhone: ${c.phone}\nEmail: ${c.email || 'N/A'}\nTotal Orders: ${c.ordersCount}\nLifetime Spend: ₹${c.totalSpent}\nRecent Order ID: #${orders[0]?.id || 'N/A'}`);
}

/**
 * 8. NOTIFICATION HUB & BROADCAST
 */
function renderAdminNotificationLogs() {
  const tbody = document.getElementById('notification-logs-table');
  if (!tbody) return;

  tbody.innerHTML = adminState.notifications.map(n => `
    <tr class="hover:bg-amber-50/40 transition">
      <td>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
          n.type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }">
          <i class="${n.type === 'WhatsApp' ? 'fab fa-whatsapp' : 'fas fa-envelope'}"></i>
          ${n.type}
        </span>
      </td>
      <td class="text-xs font-semibold text-gray-800">${n.recipient}</td>
      <td class="text-xs text-gray-600">${n.template}</td>
      <td class="text-xs text-gray-400">${n.time}</td>
      <td>
        <span class="inline-flex items-center gap-1 text-[11px] font-bold ${
          n.statusColor === 'green' ? 'text-emerald-600' : 'text-blue-600'
        }">
          <i class="fas fa-check-double text-[10px]"></i>
          ${n.status}
        </span>
      </td>
    </tr>
  `).join('');
}

async function triggerCustomNotification(event) {
  event.preventDefault();
  const type = document.getElementById('custom-notif-type').value;
  const target = document.getElementById('custom-notif-target').value.trim();
  const msg = document.getElementById('custom-notif-msg').value.trim();

  if (!target || !msg) {
    showToast('Please fill in target recipient and message', 'error');
    return;
  }

  const notif = {
    id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
    type,
    recipient: target,
    template: msg.substring(0, 30) + '...',
    time: 'Just now',
    status: 'Delivered & Read',
    statusColor: type === 'WhatsApp' ? 'green' : 'blue'
  };
  adminState.notifications.unshift(notif);

  await MiraDB.dbInsertNotification(notif, MiraDB.adminClient);
  MiraDB.logAdminActivity(adminState.currentAdmin, 'notification.broadcast', target, { type });
  renderAdminNotificationLogs();
  showToast(`Test ${type} alert sent successfully to ${target}! 🚀`, 'success');
  document.getElementById('custom-notif-msg').value = '';
}

/**
 * 9. ADMIN ACCOUNTS (register / reset password / ban / warn / remove —
 * backed by real Supabase Auth via the "admin-manage" Edge Function; see
 * js/supabase-client.js) plus the per-admin activity drill-down with undo.
 */
async function renderAdminAccounts() {
  const tbody = document.getElementById('admin-accounts-table');
  if (!tbody) return;

  const [admins, activityLog] = await Promise.all([MiraDB.fetchAdmins(), MiraDB.fetchActivityLog()]);
  adminState.admins = admins;
  const meId = adminState.currentAdmin?.id;

  const logTbody = document.getElementById('admin-activity-log-table');
  if (logTbody) {
    logTbody.innerHTML = activityLog.length ? activityLog.map(entry => `
      <tr class="hover:bg-amber-50/40 transition">
        <td class="text-xs font-bold text-gray-900">${entry.admin_name} <span class="text-[10px] text-gray-400 uppercase">(${entry.admin_role})</span></td>
        <td class="text-xs text-gray-700 font-mono">${entry.action}${entry.undone ? ' <span class="text-[9px] text-gray-400 font-sans">(undone)</span>' : ''}</td>
        <td class="text-xs text-gray-600">${entry.target || '—'}</td>
        <td class="text-xs text-gray-400">${new Date(entry.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
      </tr>
    `).join('') : `
      <tr><td colspan="4" class="text-xs text-gray-400 text-center py-6">No admin activity recorded yet.</td></tr>
    `;
  }

  tbody.innerHTML = adminState.admins.map(a => `
    <tr class="hover:bg-amber-50/40 transition">
      <td>
        <button onclick="openAdminDetailModal('${a.id}')" class="font-black text-xs text-gray-900 hover:text-[#4A0713] hover:underline transition">
          ${a.name}${a.id === meId ? ' <span class="text-[10px] text-amber-600 font-bold">(you)</span>' : ''}
        </button>
        ${a.banned ? '<span class="ml-1.5 px-1.5 py-0.2 text-[9px] font-black rounded bg-red-100 text-red-700">BANNED</span>' : ''}
      </td>
      <td class="text-xs text-gray-600">${a.email}</td>
      <td>
        <span class="px-2.5 py-0.5 text-[10px] font-black rounded-full ${a.role === 'root' ? 'bg-[#4A0713] text-[#FBBF24]' : 'bg-amber-100 text-amber-800'}">
          ${a.role.toUpperCase()}
        </span>
      </td>
      <td class="text-xs text-gray-400">${new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
      <td class="text-right">
        ${a.role === 'root' || a.id === meId ? `
          <span class="text-[10px] text-gray-300 font-bold">—</span>
        ` : `
          <button onclick="openAdminDetailModal('${a.id}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition">
            <i class="fas fa-eye mr-1"></i> View
          </button>
        `}
      </td>
    </tr>
  `).join('');
}

function openAddAdminModal() {
  document.getElementById('admin-form-name').value = '';
  document.getElementById('admin-form-email').value = '';
  document.getElementById('admin-form-modal').classList.remove('hidden');
}

function closeAdminFormModal() {
  document.getElementById('admin-form-modal').classList.add('hidden');
}

async function saveAdminForm(event) {
  event.preventDefault();
  const name = document.getElementById('admin-form-name').value.trim();
  const email = document.getElementById('admin-form-email').value.trim();

  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating...'; }

  const result = await MiraDB.registerAdmin({ email, name });

  if (result.error) {
    showToast(result.error.message || 'Could not create admin account', 'error');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Admin Account'; }
    return;
  }

  closeAdminFormModal();
  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Admin Account'; }
  renderAdminAccounts();
  showTempPasswordModal(name, email, result.tempPassword, `Admin account created for ${name}! Share this one-time password with them — they'll be asked to set their own on first login.`);
}

/**
 * A one-time temporary password (new admin, or a reset) is only ever
 * returned once by the server — this modal is the single place root sees
 * and copies it before it's gone.
 */
function showTempPasswordModal(name, email, tempPassword, message) {
  document.getElementById('temp-pw-message').textContent = message;
  document.getElementById('temp-pw-name-email').textContent = `${name} · ${email}`;
  document.getElementById('temp-pw-value').textContent = tempPassword;
  document.getElementById('temp-password-modal').classList.remove('hidden');
}

function closeTempPasswordModal() {
  document.getElementById('temp-password-modal').classList.add('hidden');
}

function copyTempPassword() {
  const pw = document.getElementById('temp-pw-value').textContent;
  navigator.clipboard?.writeText(pw).then(() => showToast('Password copied to clipboard 📋', 'success'));
}

async function removeAdminAccount(adminId, name) {
  if (!confirm(`Remove admin access for "${name}"? This permanently deletes their login.`)) return;

  const result = await MiraDB.removeAdmin(adminId);
  if (result.error) {
    showToast(result.error.message || 'Could not remove admin', 'error');
    return;
  }

  showToast(`Removed admin access for ${name}`, 'info');
  closeAdminDetailModal();
  renderAdminAccounts();
}

async function resetAdminPasswordAccount(adminId, name, email) {
  if (!confirm(`Issue a new temporary password for "${name}"? Their current password stops working immediately.`)) return;

  const result = await MiraDB.resetAdminPassword(adminId);
  if (result.error) {
    showToast(result.error.message || 'Could not reset password', 'error');
    return;
  }

  showTempPasswordModal(name, email, result.tempPassword, `New temporary password for ${name}. They'll be asked to set their own on next login.`);
}

async function toggleBanAdminAccount(adminId, name, currentlyBanned) {
  const verb = currentlyBanned ? 'unban' : 'ban';
  if (!confirm(`${currentlyBanned ? 'Restore' : 'Ban'} "${name}"? ${currentlyBanned ? 'They will be able to log in again.' : 'They will be locked out immediately, but their account and history stay on record.'}`)) return;

  const result = currentlyBanned ? await MiraDB.unbanAdmin(adminId) : await MiraDB.banAdmin(adminId);
  if (result.error) {
    showToast(result.error.message || `Could not ${verb} admin`, 'error');
    return;
  }

  showToast(`${name} has been ${currentlyBanned ? 'restored' : 'banned'}.`, currentlyBanned ? 'success' : 'info');
  await renderAdminAccounts();
  if (adminState.viewingAdminId === adminId) openAdminDetailModal(adminId);
}

/* ---------------------------------------------------------------------- */
/* Per-Admin Detail Modal — what a sub-admin has done, warnings, and the  */
/* controls (reset password / ban / warn / remove) root uses to act on it.*/
/* ---------------------------------------------------------------------- */

async function openAdminDetailModal(adminId) {
  const a = adminState.admins.find(x => x.id === adminId);
  if (!a) return;
  adminState.viewingAdminId = adminId;

  document.getElementById('admin-detail-name').textContent = a.name;
  document.getElementById('admin-detail-meta').textContent = `${a.email} · joined ${new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  document.getElementById('admin-detail-badge').innerHTML = `
    <span class="px-2.5 py-0.5 text-[10px] font-black rounded-full ${a.role === 'root' ? 'bg-[#4A0713] text-[#FBBF24]' : 'bg-amber-100 text-amber-800'}">${a.role.toUpperCase()}</span>
    ${a.banned ? '<span class="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-red-100 text-red-700">BANNED</span>' : ''}
  `;

  const actionsBox = document.getElementById('admin-detail-actions');
  if (a.role === 'root') {
    actionsBox.innerHTML = `<p class="text-xs text-gray-400">The root admin manages itself.</p>`;
  } else {
    actionsBox.innerHTML = `
      <button onclick="resetAdminPasswordAccount('${a.id}', '${a.name.replace(/'/g, "\\'")}', '${a.email}')" class="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition">
        <i class="fas fa-key mr-1"></i> Reset Password
      </button>
      <button onclick="toggleBanAdminAccount('${a.id}', '${a.name.replace(/'/g, "\\'")}', ${a.banned})" class="px-3 py-2 ${a.banned ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'} border rounded-xl text-xs font-bold transition">
        <i class="fas ${a.banned ? 'fa-circle-check' : 'fa-ban'} mr-1"></i> ${a.banned ? 'Unban' : 'Ban'}
      </button>
      <button onclick="removeAdminAccount('${a.id}', '${a.name.replace(/'/g, "\\'")}')" class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition">
        <i class="fas fa-user-xmark mr-1"></i> Remove
      </button>
    `;
  }

  document.getElementById('admin-detail-modal').classList.remove('hidden');
  await Promise.all([renderAdminDetailActivity(adminId), renderAdminDetailWarnings(adminId)]);
}

function closeAdminDetailModal() {
  document.getElementById('admin-detail-modal').classList.add('hidden');
  adminState.viewingAdminId = null;
}

const UNDOABLE_ACTIONS = new Set(['product.update', 'product.create', 'product.delete', 'product.toggle_stock', 'category.update', 'category.create', 'category.delete', 'order.status_update']);

async function renderAdminDetailActivity(adminId) {
  const container = document.getElementById('admin-detail-activity');
  if (!container) return;

  const entries = await MiraDB.fetchActivityForAdmin(adminId);
  adminState._detailActivityCache = entries;

  container.innerHTML = entries.length ? entries.map(entry => `
    <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <div class="text-xs font-bold text-gray-900 font-mono">${entry.action}${entry.undone ? ' <span class="text-[10px] text-gray-400 font-sans">(undone)</span>' : ''}</div>
        <div class="text-[11px] text-gray-600 truncate">${entry.target || '—'}</div>
        <div class="text-[10px] text-gray-400">${new Date(entry.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
      </div>
      ${UNDOABLE_ACTIONS.has(entry.action) && !entry.undone ? `
        <button onclick="undoActivity('${entry.id}')" class="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-[#4A0713] border border-amber-300 rounded-lg text-[11px] font-black transition shrink-0">
          <i class="fas fa-rotate-left mr-1"></i> Undo
        </button>
      ` : ''}
    </div>
  `).join('') : `<p class="text-xs text-gray-400 text-center py-6">No activity from this admin yet.</p>`;
}

async function undoActivity(entryId) {
  const entry = (adminState._detailActivityCache || []).find(e => e.id === entryId);
  if (!entry) return;
  if (!confirm(`Undo this "${entry.action}" change?`)) return;

  const d = entry.details || {};
  try {
    switch (entry.action) {
      case 'product.update':
      case 'product.delete':
        if (!d.before) throw new Error('No prior state recorded to restore');
        await MiraDB.dbUpsertProduct(d.before, MiraDB.adminClient);
        break;
      case 'product.create':
        await MiraDB.dbDeleteProduct(d.productId, MiraDB.adminClient);
        break;
      case 'product.toggle_stock': {
        const prod = adminState.products.find(p => p.id === d.productId);
        if (!prod) throw new Error('Product no longer exists');
        prod.inStock = d.from;
        await MiraDB.dbUpsertProduct(prod, MiraDB.adminClient);
        break;
      }
      case 'category.update':
      case 'category.delete':
        if (!d.before) throw new Error('No prior state recorded to restore');
        await MiraDB.dbUpsertCategory(d.before, MiraDB.adminClient);
        break;
      case 'category.create':
        await MiraDB.dbDeleteCategory(d.categoryId, MiraDB.adminClient);
        break;
      case 'order.status_update':
        await MiraDB.dbUpdateOrderStatus(d.orderId, d.from, MiraDB.adminClient);
        break;
      default:
        throw new Error('This action type cannot be undone');
    }

    await MiraDB.markActivityUndone(entryId);
    MiraDB.logAdminActivity(adminState.currentAdmin, 'admin.undo', entry.target, { undidEntryId: entryId, originalAction: entry.action });
    showToast('Change reverted ↩️', 'success');
    await renderAdminDetailActivity(entry.admin_id);
    renderAdminProducts();
    renderAdminCategories();
    renderAdminOrders();
    renderAdminKPIs();
  } catch (e) {
    showToast(e.message || 'Could not undo this change', 'error');
  }
}

async function renderAdminDetailWarnings(adminId) {
  const container = document.getElementById('admin-detail-warnings');
  if (!container) return;

  const warnings = await MiraDB.fetchWarningsForAdmin(adminId);
  container.innerHTML = warnings.length ? warnings.map(w => `
    <div class="p-2.5 bg-white rounded-lg border ${w.acknowledged ? 'border-gray-200' : 'border-red-300'} text-xs">
      <div class="flex items-center justify-between mb-0.5">
        <span class="font-bold text-gray-800">From ${w.issued_by_name}</span>
        <span class="text-[10px] font-black ${w.acknowledged ? 'text-emerald-600' : 'text-red-600'}">${w.acknowledged ? 'Acknowledged' : 'Unread'}</span>
      </div>
      <p class="text-gray-600">${w.message}</p>
      <p class="text-[10px] text-gray-400 mt-0.5">${new Date(w.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
    </div>
  `).join('') : `<p class="text-xs text-gray-400 text-center py-4">No warnings sent.</p>`;
}

async function sendWarningToAdmin(event) {
  event.preventDefault();
  const adminId = adminState.viewingAdminId;
  if (!adminId) return;

  const input = document.getElementById('admin-warning-message');
  const message = input.value.trim();
  if (!message) return;

  const result = await MiraDB.warnAdmin(adminId, message);
  if (result.error) {
    showToast(result.error.message || 'Could not send warning', 'error');
    return;
  }

  input.value = '';
  showToast('Warning sent', 'success');
  renderAdminDetailWarnings(adminId);
}

/**
 * 10. MODAL PREVIEWS
 */
function previewWhatsAppNotification(orderId) {
  const order = adminState.orders.find(o => o.id === orderId) || adminState.orders[0];
  if (!order) return;

  const itemsList = order.items ? order.items.map(i => `• ${i.name} x${i.qty} (₹${i.price * i.qty})`).join('\n') : 'Assorted Namkeens';
  const messageBody = `*Namaste ${order.customer.name}!* 🙏\n\nThank you for ordering with *MEERAV Namkeens*! 🍿✨\n\n📦 *Order ID:* #${order.id}\n💰 *Amount:* ₹${order.totalAmount} (${order.paymentStatus})\n📍 *Delivery Address:* ${order.customer.address}\n\n*Items Ordered:*\n${itemsList}\n\n🚚 *Status:* ${order.orderStatus}\n📦 *Tracking:* ${order.trackingNumber}\n\nYour fresh batch is packed in airtight zipper packs. For queries, reply to this chat!`;

  document.getElementById('wa-preview-name').textContent = order.customer.name;
  document.getElementById('wa-preview-body').innerHTML = messageBody.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  document.getElementById('wa-preview-time').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  document.getElementById('whatsapp-preview-modal').classList.remove('hidden');
}

function closeWhatsAppPreviewModal() {
  document.getElementById('whatsapp-preview-modal').classList.add('hidden');
}

function previewEmailNotification(orderId) {
  const order = adminState.orders.find(o => o.id === orderId) || adminState.orders[0];
  if (!order) return;

  document.getElementById('email-preview-subject').textContent = `Order Confirmation #${order.id} - MEERAV Namkeens`;
  document.getElementById('email-preview-to').textContent = `${order.customer.name} <${order.customer.email}>`;
  document.getElementById('email-preview-order-id').textContent = order.id;
  document.getElementById('email-preview-date').textContent = order.date;
  document.getElementById('email-preview-customer-name').textContent = order.customer.name;
  document.getElementById('email-preview-address').textContent = order.customer.address;
  document.getElementById('email-preview-tracking').textContent = order.trackingNumber;
  document.getElementById('email-preview-total').textContent = `₹${order.totalAmount}`;
  
  const itemsContainer = document.getElementById('email-preview-items');
  if (itemsContainer && order.items) {
    itemsContainer.innerHTML = order.items.map(i => `
      <tr class="border-b border-gray-100 text-xs">
        <td class="py-2 text-gray-800 font-medium">${i.name}</td>
        <td class="py-2 text-center text-gray-600">${i.qty}</td>
        <td class="py-2 text-right text-gray-900 font-bold">₹${i.price * i.qty}</td>
      </tr>
    `).join('');
  }

  document.getElementById('email-preview-modal').classList.remove('hidden');
}

function closeEmailPreviewModal() {
  document.getElementById('email-preview-modal').classList.add('hidden');
}

/**
 * 11. TOAST HELPER
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-700' : type === 'error' ? 'bg-red-700' : 'bg-[#32040C]';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

  toast.className = `toast flex items-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-semibold ${bgColor} border border-[#E59819]/40 shadow-xl`;
  toast.innerHTML = `<i class="fas ${icon} text-[#FBBF24]"></i><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
