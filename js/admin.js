/**
 * MEERAV NAMKEENS - DEDICATED MULTI-PAGE ADMIN OPERATIONS CONTROLLER
 * Full Product & Category CRUD (Add, Edit, Delete, File Image Upload, Price/Discount Changer)
 * Customer CRM & Live Dispatch Automations
 */

const adminState = {
  broadcastStories: JSON.parse(localStorage.getItem('mira_broadcast_stories_db')) || [...MIRA_DATA.broadcastStories],
  trustBadges: JSON.parse(localStorage.getItem('mira_trust_badges_db')) || [...MIRA_DATA.trustBadges],
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
  coupons: [],
  testimonials: [],
  faqs: [],
  editingCouponId: null,
  chatbotQuickPromptsDraft: [],
  storyParagraphsDraft: [],
  statsItemsDraft: [],
  editingTestimonialId: null,
  editingFaqId: null,
  siteSettings: null,
  pageContentRows: [],
  pendingLogoUrl: null,
  pendingFaviconUrl: null,
  pendingBgImageUrl: null,
  pendingPatternImageUrl: null,
  selectedBackgroundType: 'solid',
  selectedAdminPanelType: 'solid',
  selectedBackgroundPattern: 'none',
  viewingAdminId: null, // set while the per-admin detail modal is open
  editingProductId: null,
  editingCategoryId: null,
  productGalleryPhotos: [],
  productGalleryVideos: [],
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
  const [categories, products, orders, customers, notifications, coupons, testimonials, faqs, trustBadges, broadcastStories] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchOrders(),
    fetchCustomers(adminClient),
    fetchNotifications(adminClient),
    typeof fetchCoupons === 'function' ? fetchCoupons() : Promise.resolve([]),
    typeof fetchTestimonials === 'function' ? fetchTestimonials() : Promise.resolve([]),
    typeof fetchFaqs === 'function' ? fetchFaqs() : Promise.resolve([]),
    typeof fetchTrustBadges === 'function' ? fetchTrustBadges() : Promise.resolve([]),
    typeof fetchBroadcastStories === 'function' ? fetchBroadcastStories() : Promise.resolve([])
  ]);
  adminState.categories = categories.length ? categories : [...MIRA_DATA.categories];
  adminState.products = products.length ? products : [...MIRA_DATA.products];
  adminState.orders = orders;
  adminState.customers = customers.length ? customers : [...MIRA_DATA.customers];
  adminState.notifications = notifications;
  adminState.coupons = coupons.length ? coupons : [...(MIRA_DATA.coupons || [])];
  adminState.testimonials = testimonials.length ? testimonials : [...(MIRA_DATA.testimonials || [])];
  adminState.faqs = faqs.length ? faqs : [...(MIRA_DATA.faqs || [])];
  adminState.trustBadges = trustBadges.length ? trustBadges : [...(MIRA_DATA.trustBadges || [])];
  adminState.broadcastStories = broadcastStories.length ? broadcastStories : [...(MIRA_DATA.broadcastStories || [])];
  adminState.siteSettings = window.SITE_SETTINGS || (await MiraDB.fetchSiteSettings());
  const fetchedContent = await MiraDB.fetchPageContent();
  
  const defaultPageContentRows = [
    { key: 'hero.badge', value: '100% Pure Oil & Authentic Bikaneri Spices', label: 'Hero Badge Text', page: 'hero', sort_order: 1 },
    { key: 'hero.title', value: 'Royal Taste of Authentic Bikaner', label: 'Hero Main Title', page: 'hero', sort_order: 2 },
    { key: 'hero.subtitle', value: 'Handcrafted namkeens, golden bhujia, crispy mathri and royal sweets prepared fresh in pure oil.', label: 'Hero Subtitle', page: 'hero', sort_order: 3 },
    { key: 'home.showcase.heading', value: 'Select a Category to Explore Snacks', label: 'Category Showcase Heading', page: 'categories', sort_order: 4 },
    { key: 'home.showcase.subheading', value: 'Click any traditional category below to view its handcrafted snacks, live prices & pack sizes', label: 'Category Showcase Subheading', page: 'categories', sort_order: 5 },
    { key: 'home.story.heading', value: 'Heritage of Bikaner in Every Crunch', label: 'Story Main Heading', page: 'story', sort_order: 18 },
    { key: 'home.story.subheading', value: 'Four Decades of Culinary Mastery & Pure Taste', label: 'Story Subheading', page: 'story', sort_order: 19 },
    { key: 'home.story.paragraphs', value: JSON.stringify([
        'Born in the royal desert city of Bikaner, our snacks carry forward generations of secret family spice formulations, handcrafted by master halwais.',
        'We strictly refuse shortcuts: zero palm oil, zero chemical preservatives, only pure cold-pressed groundnut oil, pristine desert rock salt, and authentic Moth flour.'
      ]), label: 'Story Paragraphs (add/remove as needed)', page: 'story', sort_order: 20 },
    { key: 'home.stats.items', value: JSON.stringify([
        { val: '40+', label: 'Years Heritage' },
        { val: '75+', label: 'Delicacies' },
        { val: '50K+', label: 'Happy Foodies' },
        { val: '100%', label: 'Pure Oil' }
      ]), label: 'Milestone Stats (add/remove as needed)', page: 'story', sort_order: 22 },
    { key: 'reviews.title', value: 'Loved by Over 50,000+ Snack Connoisseurs', label: 'Reviews Section Title', page: 'reviews', sort_order: 30 },
    { key: 'faq.title', value: 'Frequently Asked Questions', label: 'FAQ Section Title', page: 'faq', sort_order: 31 },
    { key: 'footer.bio', value: 'Authentic royal Bikaneri namkeens, bhujia and sweets crafted in pure oil with heritage recipes.', label: 'Footer Bio', page: 'footer', sort_order: 32 }
  ];

  const fetchedRows = fetchedContent.rows || [];
  const fetchedKeys = new Set(fetchedRows.map(r => r.key));
  adminState.pageContentRows = [
    ...fetchedRows,
    ...defaultPageContentRows.filter(d => !fetchedKeys.has(d.key))
  ];
  recomputeCustomerStats();
}

/**
 * No auto-login by design: every visit to admin.html (including right after
 * a logout) must go through the login form again, even if a still-valid
 * Supabase session token is sitting in storage. On INITIAL_SESSION, any
 * lingering session is force-signed-out rather than silently entering the
 * dashboard.
 */
let adminAuthBootstrapped = false;

MiraDB.onAdminAuthChange(async (event, session) => {
  if (event === 'INITIAL_SESSION') {
    if (session) {
      await MiraDB.signOutAdmin();
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
        if (payload.eventType === 'INSERT') showToast(`New order received: #${updated.id}`, 'success');
      } else {
        adminState.orders[idx] = updated;
      }
    }
    recomputeCustomerStats();
    if (adminState.currentPage === 'orders') renderAdminOrders();
    if (adminState.currentPage === 'overview') { renderAdminKPIs(); renderOverviewRecentOrders(); }
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

  MiraDB.subscribeTable('coupons', async () => {
    adminState.coupons = await fetchCoupons();
    if (adminState.currentPage === 'settings') renderAdminCoupons();
  });

  MiraDB.subscribeTable('testimonials', async () => {
    adminState.testimonials = await fetchTestimonials();
    if (adminState.currentPage === 'settings') renderAdminTestimonials();
  });

  MiraDB.subscribeTable('faqs', async () => {
    adminState.faqs = await fetchFaqs();
    if (adminState.currentPage === 'settings') renderAdminFaqs();
  });

  MiraDB.subscribeTable('trust_badges', async () => {
    adminState.trustBadges = await fetchTrustBadges();
    if (adminState.currentPage === 'settings' && typeof renderAdminTrustBadges === 'function') renderAdminTrustBadges();
    if (typeof renderStoreTrustBadges === 'function') renderStoreTrustBadges();
  });

  MiraDB.subscribeTable('broadcast_stories', async () => {
    adminState.broadcastStories = await fetchBroadcastStories();
    if (adminState.currentPage === 'settings' && typeof renderAdminStories === 'function') renderAdminStories();
    if (typeof renderCinematicVideoReels === 'function') renderCinematicVideoReels();
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

/** The account that creates every other admin is the store Owner; everyone they create is an Admin. */
function roleDisplayName(role) {
  return role === 'root' ? 'Owner' : 'Admin';
}

function renderAdminIdentityBadge() {
  const badge = document.getElementById('admin-identity-badge');
  if (!badge || !adminState.currentAdmin) return;
  const a = adminState.currentAdmin;
  badge.innerHTML = `
    <div class="font-bold text-white truncate">${a.name}</div>
    <div class="truncate">${a.email} &bull; <span class="text-[#FBBF24] font-bold uppercase">${roleDisplayName(a.role)}</span></div>
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
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<span>Authorize & Enter Portal</span> →'; }
    return;
  }

  showToast(`Welcome, ${result.profile.name}! Admin Operations Portal Unlocked`, 'success');
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
  showToast('Password updated! Welcome to the portal.', 'success');
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
    showToast('Only the Owner account can manage admin accounts', 'error');
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
  } else if (pageId === 'settings') {
    renderSettingsForm();
    renderPageContentForm();
    renderAdminCoupons();
    renderAdminTestimonials();
    renderAdminFaqs();
    renderAdminTrustBadges();
    renderAdminStories();
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

  if (revenueEl) revenueEl.textContent = formatPrice(totalRevenue);
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
      <td class="font-black text-[#4A0713] text-xs">#${formatOrderDisplayId(order)}</td>
      <td class="text-xs font-bold text-gray-900">${order.customer.name}</td>
      <td class="font-black text-emerald-800 text-xs">${formatPrice(order.totalAmount)}</td>
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
      <td class="font-black text-[#4A0713] text-xs">#${formatOrderDisplayId(order)}</td>
      <td>
        <div class="font-black text-xs text-gray-900">${order.customer.name}</div>
        <div class="text-[11px] text-gray-500 font-medium">${order.customer.phone}</div>
        <div class="text-[10px] text-gray-400 line-clamp-1">${order.customer.address}</div>
      </td>
      <td>
        <div class="text-xs text-gray-700 font-semibold line-clamp-1">${order.items ? order.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Signature Namkeens'}</div>
        <div class="text-[10px] text-gray-400 mt-0.5">${order.date} &bull; ${order.paymentMethod}</div>
      </td>
      <td class="font-black text-[#4A0713] text-xs">${formatPrice(order.totalAmount)}</td>
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
        <div class="flex items-center gap-1.5">
          <button onclick="previewWhatsAppNotification('${order.id}')" title="WhatsApp Alert" class="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition">
            💬 WhatsApp
          </button>
          <button onclick="previewEmailNotification('${order.id}')" title="Email Invoice" class="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-bold transition">
            📄 Receipt
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
    template: `Status Changed to ${newStatus} #${formatOrderDisplayId(order)}`,
    time: 'Just now',
    status: 'Delivered & Read',
    statusColor: 'green'
  };
  adminState.notifications.unshift(notif);

  await Promise.all([
    MiraDB.dbUpdateOrderStatus(order.id, newStatus, MiraDB.adminClient),
    MiraDB.dbInsertNotification(notif, MiraDB.adminClient)
  ]);
  MiraDB.logAdminActivity(adminState.currentAdmin, 'order.status_update', `#${formatOrderDisplayId(order)}`, { orderId: order.id, from: previousStatus, to: newStatus });

  renderAdminOrders();
  renderAdminNotificationLogs();
  showToast(`Order #${formatOrderDisplayId(order)} status updated to "${newStatus}". WhatsApp alert dispatched!`, 'success');
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
            ${formatPrice(v.price)} <span class="text-[10px] text-gray-400 line-through">${formatPrice(v.originalPrice)}</span>
            <span class="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded ml-1">${discount}% OFF</span>
          </div>
          <div class="text-[10px] text-gray-400">${p.variants.length} Variants (${p.variants.map(varItem => varItem.weight).join(', ')})</div>
        </td>
        <td>
          <button onclick="toggleProductStock('${p.id}')" class="px-2.5 py-1 text-[10px] font-black rounded-full transition flex items-center gap-1 ${
            p.inStock ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
          }">

            ${p.inStock ? 'In Stock' : 'Out of Stock'}
          </button>
        </td>
        <td>
          <div class="flex items-center justify-end gap-2">
            <button onclick="openEditProductModal('${p.id}')" title="Edit Product & Upload Image" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition whitespace-nowrap"><i class="fas fa-pen"></i> Edit</button>
            <button onclick="deleteProduct('${p.id}')" title="Delete Product" class="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition whitespace-nowrap"><i class="fas fa-trash-can"></i> Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Product media galleries — unlimited photos/videos, each uploaded to
 * Storage individually. adminState.productGalleryPhotos/Videos hold the
 * working list while the Add/Edit Product modal is open; index 0 is the
 * "cover" used everywhere the old single image/video field used to be read.
 */
async function handleProductPhotosUpload(event) {
  const files = [...event.target.files];
  if (!files.length) return;
  event.target.value = '';

  const status = document.getElementById('prod-photos-upload-status');
  let uploaded = 0;

  for (const file of files) {
    if (status) status.textContent = `Uploading ${uploaded + 1} of ${files.length}...`;
    const publicUrl = await MiraDB.uploadMedia(file, 'products');
    if (publicUrl) {
      adminState.productGalleryPhotos.push(publicUrl);
      uploaded++;
      renderProductPhotosGrid();
    }
  }

  if (status) status.textContent = uploaded === files.length ? `Uploaded ${uploaded} photo(s)` : `Uploaded ${uploaded} of ${files.length} — some failed`;
  if (uploaded < files.length) showToast('Some photos failed to upload — please retry those', 'error');
}

async function handleProductVideosUpload(event) {
  const files = [...event.target.files];
  if (!files.length) return;
  event.target.value = '';

  const status = document.getElementById('prod-videos-upload-status');
  let uploaded = 0;

  for (const file of files) {
    if (status) status.textContent = `Uploading ${uploaded + 1} of ${files.length}...`;
    const publicUrl = await MiraDB.uploadMedia(file, 'products');
    if (publicUrl) {
      adminState.productGalleryVideos.push(publicUrl);
      uploaded++;
      renderProductVideosGrid();
    }
  }

  if (status) status.textContent = uploaded === files.length ? `Uploaded ${uploaded} video(s)` : `Uploaded ${uploaded} of ${files.length} — some failed`;
  if (uploaded < files.length) showToast('Some videos failed to upload — please retry those', 'error');
}

function removeProductPhoto(index) {
  adminState.productGalleryPhotos.splice(index, 1);
  renderProductPhotosGrid();
}

function removeProductVideo(index) {
  adminState.productGalleryVideos.splice(index, 1);
  renderProductVideosGrid();
}

function renderProductPhotosGrid() {
  const grid = document.getElementById('prod-photos-grid');
  if (!grid) return;
  grid.innerHTML = adminState.productGalleryPhotos.map((url, idx) => `
    <div class="relative w-16 h-16 rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-[#E59819]' : 'border-amber-200'} bg-white shrink-0">
      <img src="${url}" class="w-full h-full object-contain" />
      ${idx === 0 ? '<span class="absolute bottom-0 left-0 right-0 bg-[#4A0713] text-[#FBBF24] text-[8px] font-black text-center py-0.5">COVER</span>' : ''}
      <button type="button" onclick="removeProductPhoto(${idx})" title="Remove Photo" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-md"></button>
    </div>
  `).join('') || '<p class="text-[11px] text-gray-400">No photos yet — upload at least one.</p>';
}

function renderProductVideosGrid() {
  const grid = document.getElementById('prod-videos-grid');
  if (!grid) return;
  grid.innerHTML = adminState.productGalleryVideos.map((url, idx) => `
    <div class="relative w-20 h-14 rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-[#E59819]' : 'border-amber-200'} bg-black shrink-0">
      <video src="${url}" class="w-full h-full object-cover" muted loop playsinline onmouseenter="this.play()" onmouseleave="this.pause()"></video>
      ${idx === 0 ? '<span class="absolute bottom-0 left-0 right-0 bg-[#4A0713] text-[#FBBF24] text-[8px] font-black text-center py-0.5">MAIN REEL</span>' : ''}
      <button type="button" onclick="removeProductVideo(${idx})" title="Remove Video" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-md"></button>
    </div>
  `).join('') || '<p class="text-[11px] text-gray-400">No videos — optional.</p>';
}

function openAddProductModal() {
  adminState.editingProductId = null;
  adminState.productGalleryPhotos = [];
  adminState.productGalleryVideos = [];
  populateCategoryDropdowns();

  document.getElementById('product-modal-title').textContent = 'Add New Bikaneri Product & Upload Packaging';
  document.getElementById('prod-form-id').value = '';
  document.getElementById('prod-form-name').value = '';
  document.getElementById('prod-form-tag').value = 'Signature Bikaneri';
  document.getElementById('prod-form-spice').value = 'Medium';
  document.getElementById('prod-form-desc').value = '';
  document.getElementById('prod-form-image').value = 'assets/images/pack_bikaneri_bhujia.svg';

  document.getElementById('prod-photos-upload-status').textContent = '';
  document.getElementById('prod-videos-upload-status').textContent = '';
  renderProductPhotosGrid();
  renderProductVideosGrid();

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
  adminState.productGalleryPhotos = [...(p.photos && p.photos.length ? p.photos : (p.image ? [p.image] : []))];
  adminState.productGalleryVideos = [...(p.videos && p.videos.length ? p.videos : (p.video ? [p.video] : []))];
  populateCategoryDropdowns();

  document.getElementById('product-modal-title').textContent = `Edit Product: ${p.name}`;
  document.getElementById('prod-form-id').value = p.id;
  document.getElementById('prod-form-name').value = p.name;
  document.getElementById('prod-form-tag').value = p.tag || 'Bikaner Special';
  document.getElementById('prod-form-category').value = p.category;
  document.getElementById('prod-form-spice').value = p.spiceLevel;
  document.getElementById('prod-form-desc').value = p.description;

  document.getElementById('prod-photos-upload-status').textContent = '';
  document.getElementById('prod-videos-upload-status').textContent = '';
  renderProductPhotosGrid();
  renderProductVideosGrid();

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
  
  // Gallery uploads are the source of truth; fall back to the preset pouch if nothing was uploaded
  const photos = adminState.productGalleryPhotos.length
    ? [...adminState.productGalleryPhotos]
    : [document.getElementById('prod-form-image').value.trim() || 'assets/images/pack_bikaneri_bhujia.svg'];
  const videos = [...adminState.productGalleryVideos];
  const image = photos[0];
  const video = videos[0] || undefined;

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
      photos,
      videos,
      variants
    };
    adminState.products[existingIndex] = savedProduct;
    showToast(`Updated product: ${name} with new packaging image & pricing!`, 'success');
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
      photos,
      videos,
      description,
      ingredients: "Traditional ingredients, pure cold-pressed oil, authentic desert spices.",
      nutrition: { energy: "520 kcal", fat: "30g", carbs: "48g", protein: "12g" },
      inStock: true,
      variants
    };
    adminState.products.unshift(savedProduct);
    showToast(`Added new product: ${name} with uploaded pouch packaging!`, 'success');
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
    const catImg = cat.image || 'assets/images/cinematic_bhujia.jpg';

    return `
      <tr class="hover:bg-amber-50/40 transition">
        <td>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#4A0713] to-[#670E1E] text-[#FBBF24] flex items-center justify-center text-lg shadow-sm border border-amber-300/50">
              <img src="${catImg}" class="w-full h-full object-cover" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');" />
              
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
        <td>
          <div class="flex items-center justify-end gap-2">
            <button onclick="openEditCategoryModal('${cat.id}')" title="Edit Category" class="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition whitespace-nowrap"><i class="fas fa-pen"></i> Edit</button>
            <button onclick="deleteCategory('${cat.id}')" title="Delete Category" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition whitespace-nowrap"><i class="fas fa-trash-can"></i> Delete</button>
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

/** Clears the category image back to the default fallback, deleting the cloud file if it was a real upload. */
function removeCategoryImage() {
  const previousUrl = document.getElementById('cat-form-image').value.trim();
  const defaultImg = 'assets/images/cinematic_bhujia.jpg';
  document.getElementById('cat-form-image').value = defaultImg;
  document.getElementById('cat-form-img-preview').src = defaultImg;
  const status = document.getElementById('cat-form-image-status');
  if (status) status.textContent = 'Removed — click Save to apply';
  MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
}

async function handleCategoryImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('cat-form-image-status');
  const previousUrl = document.getElementById('cat-form-image').value.trim();

  if (status) status.textContent = 'Uploading...';
  const url = await MiraDB.uploadMedia(file, 'categories');
  if (url) {
    document.getElementById('cat-form-image').value = url;
    document.getElementById('cat-form-img-preview').src = url;
    if (status) status.textContent = 'Uploaded';
    // Replace, don't accumulate — delete the old cloud file now that the new one is live.
    // No-ops harmlessly if `previousUrl` is one of the bundled assets/images/*.jpg defaults.
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

function openAddCategoryModal() {
  adminState.editingCategoryId = null;
  adminState.uploadedCategoryImageUrl = null;

  document.getElementById('cat-modal-title').textContent = 'Add New Snack Category';
  document.getElementById('cat-form-id').value = '';
  document.getElementById('cat-form-name').value = '';
  document.getElementById('cat-form-image').value = 'assets/images/cinematic_bhujia.jpg';
  document.getElementById('cat-form-img-preview').src = 'assets/images/cinematic_bhujia.jpg';
  document.getElementById('cat-form-image-status').textContent = '';
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
  const imgUrl = cat.image || 'assets/images/cinematic_bhujia.jpg';
  document.getElementById('cat-form-image').value = imgUrl;
  document.getElementById('cat-form-img-preview').src = imgUrl;
  document.getElementById('cat-form-image-status').textContent = '';
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
  const image = document.getElementById('cat-form-image').value.trim() || 'assets/images/cinematic_bhujia.jpg';
  const icon = document.getElementById('cat-form-icon').value.trim() || 'fas fa-cookie';
  const description = document.getElementById('cat-form-desc').value.trim();

  const existingIdx = adminState.categories.findIndex(c => c.id === id);
  const beforeCategory = existingIdx !== -1 ? { ...adminState.categories[existingIdx] } : null;
  const savedCategory = { id, name, image, icon, description };

  if (existingIdx !== -1) {
    adminState.categories[existingIdx] = { ...adminState.categories[existingIdx], ...savedCategory };
    showToast(`Updated category: ${name}!`, 'success');
  } else {
    adminState.categories.push(savedCategory);
    showToast(`Added new category: ${name}!`, 'success');
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
    MiraDB.deleteMedia(cat.image, MiraDB.adminClient);
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

  tbody.innerHTML = filtered.map(c => {
    const avatar = (!c.avatar || c.avatar.includes('drive_'))
      ? (c.name.includes('Vikram') ? 'assets/images/avatar_vikram.jpg' : c.name.includes('Ananya') ? 'assets/images/avatar_ananya.jpg' : c.name.includes('Singhal') ? 'assets/images/avatar_amit.jpg' : c.name.includes('Sneha') ? 'assets/images/avatar_sneha.jpg' : 'assets/images/avatar_pooja.jpg')
      : c.avatar;

    return `
    <tr class="hover:bg-amber-50/40 transition">
      <td>
        <div class="flex items-center gap-3">
          <img src="${avatar}" alt="${c.name}" class="w-9 h-9 rounded-full object-cover border-2 border-amber-300 shadow-sm shrink-0" />
          <div>
            <div class="font-black text-xs text-gray-900">${c.name}</div>
            <div class="text-[10px] text-gray-400">${c.email || 'customer@meerav.com'}</div>
          </div>
        </div>
      </td>
      <td class="text-xs font-bold text-gray-700">${c.phone}</td>
      <td>
        <span class="px-2.5 py-0.5 bg-amber-100 text-[#4A0713] text-xs font-black rounded-full border border-amber-200">
          ${c.ordersCount} Orders
        </span>
      </td>
      <td class="text-xs font-black text-emerald-700">${formatPrice(c.totalSpent)}</td>
      <td>
        <div class="flex items-center justify-end gap-1.5">
          <a href="https://wa.me/${c.phone.replace(/\D/g, '')}" target="_blank" title="Chat on WhatsApp" class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition border border-emerald-300 flex items-center gap-1 whitespace-nowrap"><i class="fab fa-whatsapp"></i> Chat</a>
          <button onclick="viewCustomerDetails('${c.id}')" class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap"><i class="fas fa-clock-rotate-left"></i> History</button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
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
  showToast(`Test ${type} alert sent successfully to ${target}!`, 'success');
  document.getElementById('custom-notif-msg').value = '';
}

/**
 * 9. STORE SETTINGS — branding, theme, payment gateway. Backed by the
 * single-row `site_settings` table; MiraDB.dbUpsertSiteSettings writes it
 * with the admin client (RLS requires is_admin()), and js/theme.js on every
 * page re-fetches + re-applies it live via a realtime subscription.
 */
function renderSettingsForm() {
  const s = { ...window.SITE_SETTINGS, ...(adminState.siteSettings || {}) };
  adminState.pendingLogoUrl = null;
  adminState.pendingFaviconUrl = null;
  adminState.pendingBgImageUrl = null;
  adminState.pendingPatternImageUrl = null;

  document.getElementById('settings-site-name').value = s.siteName || '';
  document.getElementById('settings-tagline').value = s.tagline || '';
  document.getElementById('settings-logo-preview').src = s.logoUrl || 'assets/images/meerav_logo.png';
  document.getElementById('settings-favicon-preview').src = s.faviconUrl || s.logoUrl || 'assets/images/meerav_logo.png';
  document.getElementById('settings-logo-status').textContent = '';
  document.getElementById('settings-favicon-status').textContent = '';

  // Hero Media & CTAs
  const heroVideoInput = document.getElementById('settings-hero-video-url');
  if (heroVideoInput) heroVideoInput.value = s.heroVideoUrl || '';
  const heroVideoStatus = document.getElementById('settings-hero-video-status');
  if (heroVideoStatus) heroVideoStatus.textContent = 'Upload Hero Video';
  const heroImgInput = document.getElementById('settings-hero-image-url');
  if (heroImgInput) heroImgInput.value = s.heroImageUrl || '';
  const heroImgPreview = document.getElementById('settings-hero-image-preview');
  if (heroImgPreview) heroImgPreview.src = s.heroImageUrl || 'assets/images/commercial_scene_1.jpg';
  const heroImgStatus = document.getElementById('settings-hero-image-status');
  if (heroImgStatus) heroImgStatus.textContent = 'Upload Image';
  const heroCtaInput = document.getElementById('settings-hero-cta-text');
  if (heroCtaInput) heroCtaInput.value = s.heroCtaText || '';
  const heroSecCtaInput = document.getElementById('settings-hero-secondary-cta-text');
  if (heroSecCtaInput) heroSecCtaInput.value = s.heroSecondaryCtaText || '';

  // Brand Theme Colors
  document.getElementById('settings-color-primary').value = s.primaryColor || '#4A0713';
  document.getElementById('settings-color-secondary').value = s.secondaryColor || '#32040C';
  document.getElementById('settings-color-accent').value = s.accentColor || '#E59819';
  document.getElementById('settings-color-accent-light').value = s.accentLightColor || '#FBBF24';
  document.getElementById('settings-color-heading').value = s.headingColor || '#32040C';
  document.getElementById('settings-color-text').value = s.textColor || '#1F1517';
  document.getElementById('settings-color-admin-panel').value = s.adminPanelColor || '#1F0307';
  const adminGradient = (s.adminPanelGradient && s.adminPanelGradient.length ? s.adminPanelGradient : ['#32040C', '#1F0307', '#030712']);
  document.getElementById('settings-admin-gradient-1').value = adminGradient[0] || '#32040C';
  document.getElementById('settings-admin-gradient-2').value = adminGradient[1] || '#1F0307';
  document.getElementById('settings-admin-gradient-3').value = adminGradient[2] || '#030712';
  setAdminPanelType(s.adminPanelType || 'solid');

  // Typography & UI Radius
  populateFontSelects();
  document.getElementById('settings-font-family').value = s.fontFamily || 'Outfit';
  document.getElementById('settings-heading-font-family').value = s.headingFontFamily || s.fontFamily || 'Outfit';
  document.getElementById('settings-base-font-size').value = s.baseFontSize || '16px';
  const radiusSelect = document.getElementById('settings-border-radius');
  if (radiusSelect) radiusSelect.value = s.borderRadius || 'rounded-2xl';

  // Currency & Shipping Rules
  const currSymInput = document.getElementById('settings-currency-symbol');
  if (currSymInput) currSymInput.value = s.currencySymbol || '₹';
  const currCodeInput = document.getElementById('settings-currency-code');
  if (currCodeInput) currCodeInput.value = s.currencyCode || 'INR';
  const freeShipInput = document.getElementById('settings-free-shipping-threshold');
  if (freeShipInput) freeShipInput.value = s.freeShippingThreshold !== undefined ? s.freeShippingThreshold : 499;
  const flatFeeInput = document.getElementById('settings-shipping-flat-fee');
  if (flatFeeInput) flatFeeInput.value = s.shippingFlatFee !== undefined ? s.shippingFlatFee : 50;

  // Background Engine
  document.getElementById('settings-color-background').value = s.backgroundColor || '#FFF9ED';
  const gradient = (s.backgroundGradient && s.backgroundGradient.length ? s.backgroundGradient : ['#FFF9ED', '#FDF1D0', '#E59819']);
  document.getElementById('settings-gradient-1').value = gradient[0] || '#FFF9ED';
  document.getElementById('settings-gradient-2').value = gradient[1] || '#FDF1D0';
  document.getElementById('settings-gradient-3').value = gradient[2] || '#E59819';
  document.getElementById('settings-gradient-4').value = gradient[3] || gradient[2] || '#E59819';
  const bgPreview = document.getElementById('settings-bg-image-preview');
  if (s.backgroundImageUrl) { bgPreview.src = s.backgroundImageUrl; bgPreview.classList.remove('hidden'); } else { bgPreview.classList.add('hidden'); }
  document.getElementById('settings-bg-image-status').textContent = '';

  renderPatternStyleButtons();
  setBackgroundPattern(s.backgroundPattern || 'none');
  setBackgroundType(s.backgroundType || 'solid');
  renderThemePresetsGallery();

  // Payment Gateways
  document.getElementById('settings-upi-id').value = s.paymentUpiId || '';
  document.getElementById('settings-upi-enabled').checked = !!s.paymentUpiEnabled;
  document.getElementById('settings-card-enabled').checked = !!s.paymentCardEnabled;
  document.getElementById('settings-netbanking-enabled').checked = !!s.paymentNetbankingEnabled;
  document.getElementById('settings-cod-enabled').checked = !!s.paymentCodEnabled;
  document.getElementById('settings-razorpay-key').value = s.paymentRazorpayKeyId || '';
  document.getElementById('settings-razorpay-enabled').checked = !!s.paymentRazorpayEnabled;
  document.getElementById('settings-stripe-key').value = s.paymentStripePublishableKey || '';
  document.getElementById('settings-stripe-enabled').checked = !!s.paymentStripeEnabled;

  // SEO Metadata
  const metaTitleInput = document.getElementById('settings-meta-title');
  if (metaTitleInput) metaTitleInput.value = s.metaTitle || '';
  const metaKeywordsInput = document.getElementById('settings-meta-keywords');
  if (metaKeywordsInput) metaKeywordsInput.value = s.metaKeywords || '';
  const metaDescInput = document.getElementById('settings-meta-desc');
  if (metaDescInput) metaDescInput.value = s.metaDescription || '';

  // Contact & Social
  document.getElementById('settings-whatsapp').value = s.whatsappNumber || '';
  document.getElementById('settings-contact-email').value = s.contactEmail || '';
  document.getElementById('settings-contact-phone').value = s.contactPhone || '';
  document.getElementById('settings-contact-address').value = s.contactAddress || '';
  document.getElementById('settings-instagram').value = s.instagramUrl || '';
  document.getElementById('settings-facebook').value = s.facebookUrl || '';

  document.getElementById('settings-announcement').value = s.announcementText || '';
  document.getElementById('settings-footer-text').value = s.footerText || '';

  // Order Number Branding
  document.getElementById('settings-order-id-prefix').value = s.orderIdPrefix || 'MEERAV-';
  document.getElementById('settings-order-id-start').value = s.orderIdStartNumber != null ? s.orderIdStartNumber : 1001;
  document.getElementById('settings-order-id-pad').value = s.orderIdPadDigits != null ? s.orderIdPadDigits : 0;
  updateOrderIdExample();

  // AI Chatbot Customization
  document.getElementById('settings-chatbot-enabled').checked = s.chatbotEnabled !== false;
  document.getElementById('settings-chatbot-name').value = s.chatbotName || 'Meerav AI Sommelier';
  document.getElementById('settings-chatbot-subtitle').value = s.chatbotSubtitle || 'Order Assistant & Personalization';
  document.getElementById('settings-chatbot-avatar-icon').value = s.chatbotAvatarIcon || 'fa-robot';
  document.getElementById('settings-chatbot-color').value = s.chatbotColor || s.accentColor || '#E59819';
  document.getElementById('settings-chatbot-greeting').value = s.chatbotGreeting || '';
  document.getElementById('settings-chatbot-avatar-image').value = s.chatbotAvatarImage || '';
  document.getElementById('settings-chatbot-avatar-status').textContent = 'Upload Custom Avatar';
  const avatarPreviewWrap = document.getElementById('settings-chatbot-avatar-preview-wrap');
  if (s.chatbotAvatarImage) {
    document.getElementById('settings-chatbot-avatar-preview').src = s.chatbotAvatarImage;
    avatarPreviewWrap.classList.remove('hidden');
  } else {
    avatarPreviewWrap.classList.add('hidden');
  }
  adminState.chatbotQuickPromptsDraft = (s.chatbotQuickPrompts && s.chatbotQuickPrompts.length)
    ? s.chatbotQuickPrompts.map(qp => ({ ...qp }))
    : DEFAULT_CHATBOT_QUICK_PROMPTS.map(qp => ({ ...qp }));
  renderChatbotQuickPromptRows();
}

/**
 * Quick prompt buttons are a free-length list (admin can add/remove any
 * number), so they're kept as an in-memory draft array re-rendered on every
 * change, rather than a fixed set of numbered form fields.
 */
function renderChatbotQuickPromptRows() {
  const container = document.getElementById('settings-chatbot-quick-prompts');
  if (!container) return;
  const rows = adminState.chatbotQuickPromptsDraft || [];
  container.innerHTML = rows.map((qp, i) => `
    <div class="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
      <input type="text" data-qp-label="${i}" value="${escapeAttr(qp.label || '')}" placeholder="Button label" class="px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold" oninput="updateChatbotQuickPromptDraft(${i}, 'label', this.value)" />
      <input type="text" data-qp-prompt="${i}" value="${escapeAttr(qp.prompt || '')}" placeholder="Prompt sent to chatbot" class="px-3 py-2 border border-gray-200 rounded-lg text-xs" oninput="updateChatbotQuickPromptDraft(${i}, 'prompt', this.value)" />
      <button type="button" onclick="removeChatbotQuickPromptRow(${i})" title="Remove" class="p-2 text-red-500 hover:bg-red-50 rounded-lg"></button>
    </div>
  `).join('') || `<p class="text-[11px] text-gray-400">No quick prompts yet — click "Add Quick Prompt" above.</p>`;
}

function escapeAttr(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateChatbotQuickPromptDraft(idx, field, value) {
  if (!adminState.chatbotQuickPromptsDraft[idx]) return;
  adminState.chatbotQuickPromptsDraft[idx][field] = value;
}

function addChatbotQuickPromptRow() {
  adminState.chatbotQuickPromptsDraft = adminState.chatbotQuickPromptsDraft || [];
  adminState.chatbotQuickPromptsDraft.push({ label: '', prompt: '' });
  renderChatbotQuickPromptRows();
}

function removeChatbotQuickPromptRow(idx) {
  adminState.chatbotQuickPromptsDraft.splice(idx, 1);
  renderChatbotQuickPromptRows();
}

async function handleChatbotAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('settings-chatbot-avatar-status');
  const previousUrl = document.getElementById('settings-chatbot-avatar-image').value.trim();
  if (status) status.textContent = 'Uploading...';

  const url = await MiraDB.uploadMedia(file, 'branding');
  if (url) {
    document.getElementById('settings-chatbot-avatar-image').value = url;
    document.getElementById('settings-chatbot-avatar-preview').src = url;
    document.getElementById('settings-chatbot-avatar-preview-wrap').classList.remove('hidden');
    if (status) status.textContent = 'Uploaded — click Save to apply';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

function removeChatbotAvatarImage() {
  const previousUrl = document.getElementById('settings-chatbot-avatar-image').value.trim();
  document.getElementById('settings-chatbot-avatar-image').value = '';
  document.getElementById('settings-chatbot-avatar-preview-wrap').classList.add('hidden');
  document.getElementById('settings-chatbot-avatar-status').textContent = 'Upload Custom Avatar';
  if (previousUrl) MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
}

function updateOrderIdExample() {
  const prefix = document.getElementById('settings-order-id-prefix')?.value || 'MEERAV-';
  const start = Number(document.getElementById('settings-order-id-start')?.value) || 1001;
  const pad = Number(document.getElementById('settings-order-id-pad')?.value) || 0;
  const numStr = pad > 0 ? String(start).padStart(pad, '0') : String(start);
  const exampleEl = document.getElementById('settings-order-id-example');
  if (exampleEl) exampleEl.textContent = `${prefix}${numStr}`;
}

const DEFAULT_CHATBOT_QUICK_PROMPTS = [
  { label: 'Order Spicy', prompt: 'Help me order spicy snacks for today' },
  { label: 'Diet & Roasted', prompt: 'Show me roasted diet snacks with zero palm oil' },
  { label: 'Gift Boxes', prompt: 'I want gift boxes and sweets for celebration' },
  { label: 'Track Van', prompt: 'Where is my order delivery van right now?' }
];

/** Font <select>s are populated from theme.js's GOOGLE_FONT_STACKS so the admin list and the live-apply list never drift apart. */
function populateFontSelects() {
  const optionsHtml = Object.keys(GOOGLE_FONT_STACKS).map(name => `<option value="${name}">${name}</option>`).join('');
  document.querySelectorAll('.settings-font-select').forEach(select => { select.innerHTML = optionsHtml; });
}

function setBackgroundType(type) {
  adminState.selectedBackgroundType = type;
  document.querySelectorAll('.bg-type-btn').forEach(btn => {
    const active = btn.dataset.bgTypeBtn === type;
    btn.classList.toggle('bg-[#4A0713]', active);
    btn.classList.toggle('text-[#FBBF24]', active);
    btn.classList.toggle('border-[#E59819]', active);
    btn.classList.toggle('bg-gray-50', !active);
    btn.classList.toggle('text-gray-700', !active);
    btn.classList.toggle('border-gray-200', !active);
  });
  document.getElementById('bg-solid-fields').classList.toggle('hidden', type !== 'solid');
  document.getElementById('bg-gradient-fields').classList.toggle('hidden', type !== 'gradient');
  document.getElementById('bg-image-fields').classList.toggle('hidden', type !== 'image');
}

function setAdminPanelType(type) {
  adminState.selectedAdminPanelType = type;
  document.querySelectorAll('.admin-bg-type-btn').forEach(btn => {
    const active = btn.dataset.adminBgTypeBtn === type;
    btn.classList.toggle('bg-[#4A0713]', active);
    btn.classList.toggle('text-[#FBBF24]', active);
    btn.classList.toggle('border-[#E59819]', active);
    btn.classList.toggle('bg-gray-50', !active);
    btn.classList.toggle('text-gray-700', !active);
    btn.classList.toggle('border-gray-200', !active);
  });
  document.getElementById('admin-bg-solid-fields').classList.toggle('hidden', type !== 'solid');
  document.getElementById('admin-bg-gradient-fields').classList.toggle('hidden', type !== 'gradient');
}

const PATTERN_STYLE_OPTIONS = [
  { value: 'none', label: 'None', icon: 'fa-ban' },
  { value: 'dots', label: 'Dots', icon: 'fa-circle-dot' },
  { value: 'grid', label: 'Grid', icon: 'fa-table-cells' },
  { value: 'stripes', label: 'Stripes', icon: 'fa-bars-staggered' },
  { value: 'waves', label: 'Waves', icon: 'fa-water' },
  { value: 'custom-image', label: 'Custom', icon: 'fa-image' }
];

function renderPatternStyleButtons() {
  const container = document.getElementById('pattern-style-buttons');
  if (!container) return;
  container.innerHTML = PATTERN_STYLE_OPTIONS.map(opt => `
    <button type="button" onclick="setBackgroundPattern('${opt.value}')" data-pattern-btn="${opt.value}"
      class="pattern-style-btn py-2.5 rounded-xl text-[10px] font-bold border transition flex flex-col items-center gap-1">
      
      <span>${opt.label}</span>
    </button>
  `).join('');
}

function setBackgroundPattern(pattern) {
  adminState.selectedBackgroundPattern = pattern;
  document.querySelectorAll('.pattern-style-btn').forEach(btn => {
    const active = btn.dataset.patternBtn === pattern;
    btn.classList.toggle('bg-[#4A0713]', active);
    btn.classList.toggle('text-[#FBBF24]', active);
    btn.classList.toggle('border-[#E59819]', active);
    btn.classList.toggle('bg-gray-50', !active);
    btn.classList.toggle('text-gray-700', !active);
    btn.classList.toggle('border-gray-200', !active);
  });
}

function removeSettingsImage(which) {
  const map = {
    logo: { pendingKey: 'pendingLogoUrl', previewId: 'settings-logo-preview', statusId: 'settings-logo-status', defaultSrc: 'assets/images/meerav_logo.png' },
    favicon: { pendingKey: 'pendingFaviconUrl', previewId: 'settings-favicon-preview', statusId: 'settings-favicon-status', defaultSrc: 'assets/images/meerav_logo.png' },
    'bg-image': { pendingKey: 'pendingBgImageUrl', previewId: 'settings-bg-image-preview', statusId: 'settings-bg-image-status', defaultSrc: '' }
  };
  const cfg = map[which];
  if (!cfg) return;

  adminState[cfg.pendingKey] = '';
  const preview = document.getElementById(cfg.previewId);
  if (cfg.defaultSrc) {
    preview.src = cfg.defaultSrc;
  } else {
    preview.src = '';
    preview.classList.add('hidden');
  }
  const status = document.getElementById(cfg.statusId);
  if (status) status.textContent = 'Removed — click Save to apply';
}

async function handleSettingsBgImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('settings-bg-image-status');
  if (status) status.textContent = 'Uploading...';
  const url = await MiraDB.uploadMedia(file, 'branding');
  if (url) {
    adminState.pendingBgImageUrl = url;
    const preview = document.getElementById('settings-bg-image-preview');
    preview.src = url;
    preview.classList.remove('hidden');
    if (status) status.textContent = 'Uploaded — click Save to apply';
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

async function handleSettingsHeroVideoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('settings-hero-video-status');
  const previousUrl = document.getElementById('settings-hero-video-url').value.trim();
  if (status) status.textContent = 'Uploading...';

  const url = await MiraDB.uploadMedia(file, 'branding');
  if (url) {
    document.getElementById('settings-hero-video-url').value = url;
    if (status) status.textContent = 'Uploaded — click Save to apply';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

async function handleSettingsHeroImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('settings-hero-image-status');
  const previousUrl = document.getElementById('settings-hero-image-url').value.trim();
  if (status) status.textContent = 'Uploading...';

  const url = await MiraDB.uploadMedia(file, 'branding');
  if (url) {
    document.getElementById('settings-hero-image-url').value = url;
    document.getElementById('settings-hero-image-preview').src = url;
    if (status) status.textContent = 'Uploaded — click Save to apply';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

/**
 * MASTER BRAND FILM — slide #1 in the hero carousel (see getHeroSlides() in
 * store.js). Unlike the other hero fields, this modal persists to the cloud
 * immediately on upload since there's no other metadata to fill in first.
 */
function openMasterFilmModal() {
  const s = { ...window.SITE_SETTINGS, ...(adminState.siteSettings || {}) };
  document.getElementById('master-film-image-preview').src = s.heroImageUrl || 'assets/images/commercial_scene_1.jpg';
  document.getElementById('master-film-video-status').textContent = 'Upload Video';
  document.getElementById('master-film-image-status').textContent = 'Upload Image';
  document.getElementById('master-film-modal').classList.remove('hidden');
}

function closeMasterFilmModal() {
  document.getElementById('master-film-modal').classList.add('hidden');
}

async function handleMasterFilmVideoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('master-film-video-status');
  if (status) status.textContent = 'Uploading...';

  const previousUrl = (window.SITE_SETTINGS && window.SITE_SETTINGS.heroVideoUrl) || '';
  const url = await MiraDB.uploadMedia(file, 'branding');
  if (!url) {
    if (status) status.textContent = 'Upload failed — please retry';
    return;
  }
  const ok = await persistSiteSettings({ ...window.SITE_SETTINGS, ...(adminState.siteSettings || {}), heroVideoUrl: url }, 'Master Brand Film Video');
  if (ok) {
    if (status) status.textContent = 'Uploaded';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
    renderAdminStories();
    showToast('Master brand film updated!', 'success');
  } else if (status) {
    status.textContent = 'Save failed — please retry';
  }
}

async function handleMasterFilmImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('master-film-image-status');
  if (status) status.textContent = 'Uploading...';

  const previousUrl = (window.SITE_SETTINGS && window.SITE_SETTINGS.heroImageUrl) || '';
  const url = await MiraDB.uploadMedia(file, 'branding');
  if (!url) {
    if (status) status.textContent = 'Upload failed — please retry';
    return;
  }
  const ok = await persistSiteSettings({ ...window.SITE_SETTINGS, ...(adminState.siteSettings || {}), heroImageUrl: url }, 'Master Brand Film Poster');
  if (ok) {
    document.getElementById('master-film-image-preview').src = url;
    if (status) status.textContent = 'Uploaded';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
    renderAdminStories();
    showToast('Master brand film poster updated!', 'success');
  } else if (status) {
    status.textContent = 'Save failed — please retry';
  }
}

async function handleSettingsLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('settings-logo-status');
  if (status) status.textContent = 'Uploading...';
  const url = await MiraDB.uploadMedia(file, 'branding');
  if (url) {
    adminState.pendingLogoUrl = url;
    document.getElementById('settings-logo-preview').src = url;
    if (status) status.textContent = 'Uploaded — click Save to apply';
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

async function handleSettingsFaviconUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('settings-favicon-status');
  if (status) status.textContent = 'Uploading...';
  const url = await MiraDB.uploadMedia(file, 'branding');
  if (url) {
    adminState.pendingFaviconUrl = url;
    document.getElementById('settings-favicon-preview').src = url;
    if (status) status.textContent = 'Uploaded — click Save to apply';
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

function collectSiteSettingsFromForm() {
  const current = { ...window.SITE_SETTINGS, ...(adminState.siteSettings || {}) };
  return {
    ...current,
    siteName: document.getElementById('settings-site-name').value.trim() || current.siteName,
    tagline: document.getElementById('settings-tagline').value.trim(),
    logoUrl: adminState.pendingLogoUrl !== null ? adminState.pendingLogoUrl : current.logoUrl,
    faviconUrl: adminState.pendingFaviconUrl !== null ? adminState.pendingFaviconUrl : current.faviconUrl,
    heroVideoUrl: document.getElementById('settings-hero-video-url') ? document.getElementById('settings-hero-video-url').value.trim() : current.heroVideoUrl,
    heroImageUrl: document.getElementById('settings-hero-image-url') ? document.getElementById('settings-hero-image-url').value.trim() : current.heroImageUrl,
    heroCtaText: document.getElementById('settings-hero-cta-text') ? document.getElementById('settings-hero-cta-text').value.trim() : current.heroCtaText,
    heroCtaLink: document.getElementById('settings-hero-cta-link') ? document.getElementById('settings-hero-cta-link').value.trim() : current.heroCtaLink,
    heroSecondaryCtaText: document.getElementById('settings-hero-secondary-cta-text') ? document.getElementById('settings-hero-secondary-cta-text').value.trim() : current.heroSecondaryCtaText,
    primaryColor: document.getElementById('settings-color-primary').value,
    secondaryColor: document.getElementById('settings-color-secondary').value,
    accentColor: document.getElementById('settings-color-accent').value,
    accentLightColor: document.getElementById('settings-color-accent-light').value,
    headingColor: document.getElementById('settings-color-heading').value,
    textColor: document.getElementById('settings-color-text').value,
    adminPanelColor: document.getElementById('settings-color-admin-panel').value,
    adminPanelType: adminState.selectedAdminPanelType,
    adminPanelGradient: [
      document.getElementById('settings-admin-gradient-1').value,
      document.getElementById('settings-admin-gradient-2').value,
      document.getElementById('settings-admin-gradient-3').value
    ],
    fontFamily: document.getElementById('settings-font-family').value,
    headingFontFamily: document.getElementById('settings-heading-font-family').value,
    baseFontSize: document.getElementById('settings-base-font-size').value,
    borderRadius: document.getElementById('settings-border-radius') ? document.getElementById('settings-border-radius').value : (current.borderRadius || 'rounded-2xl'),
    currencySymbol: document.getElementById('settings-currency-symbol') ? document.getElementById('settings-currency-symbol').value.trim() : (current.currencySymbol || '₹'),
    currencyCode: document.getElementById('settings-currency-code') ? document.getElementById('settings-currency-code').value.trim().toUpperCase() : (current.currencyCode || 'INR'),
    freeShippingThreshold: document.getElementById('settings-free-shipping-threshold') ? Number(document.getElementById('settings-free-shipping-threshold').value) : (current.freeShippingThreshold || 499),
    shippingFlatFee: document.getElementById('settings-shipping-flat-fee') ? Number(document.getElementById('settings-shipping-flat-fee').value) : (current.shippingFlatFee || 50),
    backgroundType: adminState.selectedBackgroundType,
    backgroundColor: document.getElementById('settings-color-background').value,
    backgroundGradient: [
      document.getElementById('settings-gradient-1').value,
      document.getElementById('settings-gradient-2').value,
      document.getElementById('settings-gradient-3').value,
      document.getElementById('settings-gradient-4').value
    ],
    backgroundImageUrl: adminState.pendingBgImageUrl !== null ? adminState.pendingBgImageUrl : current.backgroundImageUrl,
    backgroundPattern: adminState.selectedBackgroundPattern,
    metaTitle: document.getElementById('settings-meta-title') ? document.getElementById('settings-meta-title').value.trim() : current.metaTitle,
    metaKeywords: document.getElementById('settings-meta-keywords') ? document.getElementById('settings-meta-keywords').value.trim() : current.metaKeywords,
    metaDescription: document.getElementById('settings-meta-desc') ? document.getElementById('settings-meta-desc').value.trim() : current.metaDescription,
    paymentUpiId: document.getElementById('settings-upi-id').value.trim(),
    paymentUpiEnabled: document.getElementById('settings-upi-enabled').checked,
    paymentCardEnabled: document.getElementById('settings-card-enabled').checked,
    paymentNetbankingEnabled: document.getElementById('settings-netbanking-enabled').checked,
    paymentCodEnabled: document.getElementById('settings-cod-enabled').checked,
    paymentRazorpayKeyId: document.getElementById('settings-razorpay-key').value.trim(),
    paymentRazorpayEnabled: document.getElementById('settings-razorpay-enabled').checked,
    paymentStripePublishableKey: document.getElementById('settings-stripe-key').value.trim(),
    paymentStripeEnabled: document.getElementById('settings-stripe-enabled').checked,
    whatsappNumber: document.getElementById('settings-whatsapp').value.trim(),
    contactEmail: document.getElementById('settings-contact-email').value.trim(),
    contactPhone: document.getElementById('settings-contact-phone').value.trim(),
    contactAddress: document.getElementById('settings-contact-address').value.trim(),
    instagramUrl: document.getElementById('settings-instagram').value.trim(),
    facebookUrl: document.getElementById('settings-facebook').value.trim(),
    announcementText: document.getElementById('settings-announcement').value.trim(),
    footerText: document.getElementById('settings-footer-text').value.trim(),
    orderIdPrefix: document.getElementById('settings-order-id-prefix').value.trim() || 'MEERAV-',
    orderIdStartNumber: Number(document.getElementById('settings-order-id-start').value) || 1001,
    orderIdPadDigits: Number(document.getElementById('settings-order-id-pad').value) || 0,
    chatbotEnabled: document.getElementById('settings-chatbot-enabled').checked,
    chatbotName: document.getElementById('settings-chatbot-name').value.trim(),
    chatbotSubtitle: document.getElementById('settings-chatbot-subtitle').value.trim(),
    chatbotAvatarIcon: document.getElementById('settings-chatbot-avatar-icon').value,
    chatbotAvatarImage: document.getElementById('settings-chatbot-avatar-image').value.trim(),
    chatbotColor: document.getElementById('settings-chatbot-color').value,
    chatbotGreeting: document.getElementById('settings-chatbot-greeting').value.trim(),
    chatbotQuickPrompts: (adminState.chatbotQuickPromptsDraft || [])
      .map(qp => ({ label: (qp.label || '').trim(), prompt: (qp.prompt || '').trim() }))
      .filter(qp => qp.label && qp.prompt)
  };
}

/** Shared by the Save button and one-click theme presets: write to Supabase, update local/live state, log it. */
async function persistSiteSettings(updated, activityLabel) {
  const before = { ...(adminState.siteSettings || window.SITE_SETTINGS || {}) };

  const ok = await MiraDB.dbUpsertSiteSettings(updated, MiraDB.adminClient);
  if (!ok) {
    showToast('Could not save — the change did not reach the cloud. Please retry.', 'error');
    return false;
  }

  adminState.siteSettings = updated;
  window.SITE_SETTINGS = updated;
  if (typeof applySiteTheme === 'function') applySiteTheme(updated);
  try { localStorage.setItem('mira_site_settings', JSON.stringify(updated)); } catch(e) {}

  if (adminState.currentAdmin) {
    MiraDB.logAdminActivity(adminState.currentAdmin, 'settings.update', activityLabel || 'Store Settings', { before });
  }
  return true;
}

async function saveSiteSettingsForm(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('settings-save-btn');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = ' Saving...'; }

  const updated = collectSiteSettingsFromForm();
  const ok = await persistSiteSettings(updated, 'Store Settings');

  if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Save All Store Settings'; }
  if (ok) showToast('Store settings saved & applied live across website!', 'success');
}

function renderThemePresetsGallery() {
  const gallery = document.getElementById('theme-presets-gallery');
  if (!gallery || typeof THEME_PRESETS === 'undefined') return;
  gallery.innerHTML = THEME_PRESETS.map(preset => `
    <button type="button" onclick="applyThemePreset('${preset.key}')"
      class="p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-md transition text-left group bg-white">
      <div class="flex gap-1.5 mb-2">
        ${preset.swatches.map(hex => `<span class="w-6 h-6 rounded-lg border border-black/10 shadow-xs" style="background:${hex}"></span>`).join('')}
      </div>
      <div class="text-xs font-black text-gray-900 group-hover:text-purple-600">${preset.name}</div>
      <div class="text-[10px] text-gray-500 mt-0.5">${preset.category || 'Theme Preset'}</div>
    </button>
  `).join('');
}

async function applyThemePreset(presetKey) {
  const preset = THEME_PRESETS.find(p => p.key === presetKey);
  if (!preset) return;

  const current = { ...window.SITE_SETTINGS, ...(adminState.siteSettings || {}) };
  const updated = { ...current, ...preset.values };

  showToast(`Applying "${preset.name}" 1-click theme kit...`, 'info');
  const ok = await persistSiteSettings(updated, `Theme Preset: ${preset.name}`);

  if (ok && preset.contentOverrides && preset.contentOverrides.length) {
    const overrideMap = {};
    preset.contentOverrides.forEach(o => { overrideMap[o.key] = o.value; });

    const newRows = (adminState.pageContentRows || []).map(row => {
      if (overrideMap[row.key] !== undefined) {
        return { ...row, value: overrideMap[row.key] };
      }
      return row;
    });

    const entriesToSave = newRows.map(r => ({
      key: r.key,
      value: r.value,
      label: r.label,
      page: r.page,
      sortOrder: r.sort_order || 1
    }));

    await MiraDB.dbUpsertPageContent(entriesToSave, MiraDB.adminClient);
    adminState.pageContentRows = newRows;
    const map = {};
    entriesToSave.forEach(e => { map[e.key] = e.value; });
    window.SITE_PAGE_CONTENT = map;
    if (typeof applyPageContent === 'function') applyPageContent(map);
  }

  if (ok) {
    renderSettingsForm();
    renderPageContentForm();
    showToast(`"${preset.name}" is now live across the full website!`, 'success');
  }
}

async function resetToOriginalBrandDefaults() {
  if (!confirm('Are you sure you want to restore the website back to the original MEERAV Namkeens brand theme, text, and settings?')) {
    return;
  }

  const defaults = typeof DEFAULT_SITE_SETTINGS !== 'undefined' ? { ...DEFAULT_SITE_SETTINGS } : {
    id: 1,
    siteName: 'MEERAV NAMKEENS & SWEETS',
    tagline: 'From the Heart of Bikaner',
    logoUrl: 'assets/images/meerav_logo.png',
    faviconUrl: 'assets/images/meerav_logo.png',
    primaryColor: '#4A0713',
    secondaryColor: '#32040C',
    accentColor: '#E59819',
    accentLightColor: '#FBBF24',
    headingColor: '#32040C',
    textColor: '#1F1517',
    adminPanelColor: '#1F0307',
    adminPanelType: 'solid',
    adminPanelGradient: ['#32040C', '#1F0307', '#030712'],
    fontFamily: 'Outfit',
    headingFontFamily: 'Outfit',
    baseFontSize: '16px',
    borderRadius: 'rounded-2xl',
    currencySymbol: '₹',
    currencyCode: 'INR',
    freeShippingThreshold: 499,
    shippingFlatFee: 50,
    backgroundType: 'solid',
    backgroundColor: '#FFF9ED',
    backgroundGradient: ['#FFF9ED', '#FDF1D0', '#E59819'],
    backgroundImageUrl: '',
    backgroundPattern: 'none',
    heroVideoUrl: 'assets/videos/meerav_brand_film.mp4',
    heroImageUrl: 'assets/images/commercial_scene_1.jpg',
    heroCtaText: 'Order Online Now',
    heroCtaLink: 'category',
    heroSecondaryCtaText: 'Explore Categories',
    metaTitle: 'MEERAV - Authentic Bikaneri Namkeens & Sweets',
    metaDescription: 'Handcrafted authentic Bikaneri namkeens, sweets and royal delicacies prepared in 100% pure oil.',
    metaKeywords: 'namkeen, bikaneri bhujia, sweets, snacks, pure oil'
  };

  const defaultContent = [
    { key: 'hero.badge', value: '100% Pure Oil & Authentic Bikaneri Spices', label: 'Hero Badge Text', page: 'home', sort_order: 1 },
    { key: 'hero.title', value: 'Royal Taste of Authentic Bikaner', label: 'Hero Main Title', page: 'home', sort_order: 2 },
    { key: 'hero.subtitle', value: 'Handcrafted namkeens, golden bhujia, crispy mathri and royal sweets prepared fresh in pure oil.', label: 'Hero Subtitle', page: 'home', sort_order: 3 },
    { key: 'story.title', value: 'Four Decades of Royal Bikaneri Craftsmanship', label: 'Story Title', page: 'home', sort_order: 4 },
    { key: 'story.body', value: 'Born in the royal alleys of Bikaner, our recipes have been preserved across generations. We never use palm oil or artificial preservatives.', label: 'Story Description', page: 'home', sort_order: 5 },
    { key: 'reviews.title', value: 'Loved by Over 50,000+ Snack Connoisseurs', label: 'Reviews Section Title', page: 'home', sort_order: 6 },
    { key: 'faq.title', value: 'Frequently Asked Questions', label: 'FAQ Section Title', page: 'home', sort_order: 7 },
    { key: 'footer.bio', value: 'Authentic royal Bikaneri namkeens, bhujia and sweets crafted in pure oil with heritage recipes.', label: 'Footer Bio', page: 'home', sort_order: 8 }
  ];

  showToast('Restoring original MEERAV brand defaults...', 'info');
  const ok = await persistSiteSettings(defaults, 'Reset to Default MEERAV Brand');

  if (ok) {
    const entriesToSave = defaultContent.map(r => ({
      key: r.key,
      value: r.value,
      label: r.label,
      page: r.page,
      sortOrder: r.sort_order || 1
    }));
    await MiraDB.dbUpsertPageContent(entriesToSave, MiraDB.adminClient);
    adminState.pageContentRows = defaultContent;
    const map = {};
    entriesToSave.forEach(e => { map[e.key] = e.value; });
    window.SITE_PAGE_CONTENT = map;
    if (typeof applyPageContent === 'function') applyPageContent(map);

    renderSettingsForm();
    renderPageContentForm();
    showToast('Website successfully restored to default MEERAV brand!', 'success');
  }
}

/**
 * 9B. PROMOTIONAL COUPONS CMS CRUD
 */
function renderAdminCoupons() {
  const tbody = document.getElementById('admin-coupons-table-body');
  if (!tbody) return;

  const coupons = adminState.coupons || [];
  if (!coupons.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400 text-xs">No coupons created yet. Click "+ Add Coupon" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = coupons.map(c => `
    <tr class="border-b hover:bg-amber-50/40 transition">
      <td class="p-3 font-black text-[#4A0713] text-xs">${c.code}</td>
      <td class="p-3 text-xs font-bold text-gray-800">${c.discountType === 'percentage' ? `${c.discountVal}% OFF` : `Flat ${formatPrice(c.discountVal)} OFF`}</td>
      <td class="p-3 text-xs text-gray-600">${c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'No Min'}</td>
      <td class="p-3 text-xs text-gray-500 truncate max-w-xs">${c.description || '—'}</td>
      <td class="p-3">
        <button onclick="toggleCouponActive('${c.id}')" title="${c.isActive ? 'Click to deactivate' : 'Click to activate'}" class="px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}">

          ${c.isActive ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td class="p-3 text-right space-x-1">
        <button onclick="openCouponModal('${c.id}')" title="Edit Coupon" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition whitespace-nowrap"><i class="fas fa-pen"></i> Edit</button>
        <button onclick="deleteCoupon('${c.id}')" title="Delete Coupon" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition whitespace-nowrap"><i class="fas fa-trash-can"></i> Delete</button>
      </td>
    </tr>
  `).join('');
}

function openCouponModal(couponId = null) {
  adminState.editingCouponId = couponId;
  const modal = document.getElementById('coupon-modal');
  const title = document.getElementById('coupon-modal-title');
  const idInput = document.getElementById('coupon-form-id');
  const codeInput = document.getElementById('coupon-form-code');
  const typeSelect = document.getElementById('coupon-form-type');
  const valInput = document.getElementById('coupon-form-val');
  const minOrderInput = document.getElementById('coupon-form-min-order');
  const descInput = document.getElementById('coupon-form-desc');
  const activeCheckbox = document.getElementById('coupon-form-active');

  if (couponId) {
    const c = (adminState.coupons || []).find(item => item.id === couponId);
    if (c) {
      title.textContent = `Edit Coupon: ${c.code}`;
      idInput.value = c.id;
      codeInput.value = c.code;
      typeSelect.value = c.discountType;
      valInput.value = c.discountVal;
      minOrderInput.value = c.minOrderAmount || '';
      descInput.value = c.description || '';
      activeCheckbox.checked = !!c.isActive;
    }
  } else {
    title.textContent = 'Create New Coupon';
    idInput.value = '';
    codeInput.value = '';
    typeSelect.value = 'percentage';
    valInput.value = '';
    minOrderInput.value = '';
    descInput.value = '';
    activeCheckbox.checked = true;
  }
  modal.classList.remove('hidden');
}

function closeCouponModal() {
  document.getElementById('coupon-modal').classList.add('hidden');
  adminState.editingCouponId = null;
}

async function saveCouponForm(event) {
  event.preventDefault();
  const id = document.getElementById('coupon-form-id').value || `c-${Date.now()}`;
  const code = document.getElementById('coupon-form-code').value.trim().toUpperCase();
  const discountType = document.getElementById('coupon-form-type').value;
  const discountVal = Number(document.getElementById('coupon-form-val').value) || 0;
  const minOrderAmount = Number(document.getElementById('coupon-form-min-order').value) || 0;
  const description = document.getElementById('coupon-form-desc').value.trim();
  const isActive = document.getElementById('coupon-form-active').checked;

  const couponObj = { id, code, discountType, discountVal, minOrderAmount, description, isActive };

  const ok = await MiraDB.dbUpsertCoupon(couponObj, MiraDB.adminClient);
  if (ok) {
    showToast(`Coupon ${code} saved successfully!`, 'success');
    closeCouponModal();
    adminState.coupons = await fetchCoupons();
    renderAdminCoupons();
  } else {
    showToast('Failed to save coupon — please retry', 'error');
  }
}

async function toggleCouponActive(couponId) {
  const c = (adminState.coupons || []).find(item => item.id === couponId);
  if (!c) return;
  c.isActive = !c.isActive;
  await MiraDB.dbUpsertCoupon(c, MiraDB.adminClient);
  showToast(`Coupon ${c.code} is now ${c.isActive ? 'Active' : 'Inactive'}`, 'info');
  renderAdminCoupons();
}

async function deleteCoupon(couponId) {
  const c = (adminState.coupons || []).find(item => item.id === couponId);
  if (!c) return;
  if (!confirm(`Delete coupon "${c.code}"?`)) return;
  const ok = await MiraDB.dbDeleteCoupon(couponId, MiraDB.adminClient);
  if (ok) {
    showToast(`Coupon ${c.code} deleted`, 'info');
    adminState.coupons = adminState.coupons.filter(item => item.id !== couponId);
    renderAdminCoupons();
  }
}

/**
 * 9C. CUSTOMER TESTIMONIALS & REVIEWS CMS CRUD
 */
function renderAdminTestimonials() {
  const tbody = document.getElementById('admin-testimonials-table-body');
  if (!tbody) return;

  const items = adminState.testimonials || [];
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400 text-xs">No reviews added yet. Click "+ Add Review" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(t => {
    return `
    <tr class="border-b hover:bg-amber-50/40 transition">
      <td class="p-3 flex items-center gap-3">
        <img src="${t.avatar || 'assets/images/avatar_default.jpg'}" alt="${t.name}" class="w-8 h-8 rounded-full object-cover border-2 border-amber-300 shadow-sm shrink-0" />
        <div>
          <span class="font-bold text-xs text-gray-900 block">${t.name}</span>
          <span class="text-[10px] text-gray-400 font-medium">${t.city || 'Verified Customer'}</span>
        </div>
      </td>
      <td class="p-3 text-xs text-gray-600">${t.city || '—'}</td>
      <td class="p-3 text-xs text-amber-500 font-black tracking-wider">${'<i class="fas fa-star"></i>'.repeat(Math.round(t.rating || 5))}</td>
      <td class="p-3 text-xs text-gray-600 truncate max-w-xs">${t.reviewText}</td>
      <td class="p-3">
        <button onclick="toggleTestimonialVisible('${t.id}')" title="${t.isVisible !== false ? 'Click to hide from homepage' : 'Click to show on homepage'}" class="px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${t.isVisible !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}">
          <i class="fas ${t.isVisible !== false ? 'fa-eye' : 'fa-eye-slash'}"></i> ${t.isVisible !== false ? 'Visible' : 'Hidden'}
        </button>
      </td>
      <td class="p-3 text-right space-x-1">
        <button onclick="deleteTestimonial('${t.id}')" title="Delete Review" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition"><i class="fas fa-trash-can"></i> Delete</button>
      </td>
    </tr>
    `;
  }).join('');
}

function openTestimonialModal(id = null) {
  adminState.editingTestimonialId = id;
  const modal = document.getElementById('testimonial-modal');
  const title = document.getElementById('testimonial-modal-title');
  const idInput = document.getElementById('testimonial-form-id');
  const nameInput = document.getElementById('testimonial-form-name');
  const cityInput = document.getElementById('testimonial-form-city');
  const ratingSelect = document.getElementById('testimonial-form-rating');
  const reviewInput = document.getElementById('testimonial-form-review');
  const avatarInput = document.getElementById('testimonial-form-avatar');
  const visibleCheckbox = document.getElementById('testimonial-form-visible');

  if (id) {
    const t = (adminState.testimonials || []).find(item => item.id === id);
    if (t) {
      title.textContent = `Edit Review: ${t.name}`;
      idInput.value = t.id;
      nameInput.value = t.name;
      cityInput.value = t.city || '';
      ratingSelect.value = t.rating || 5;
      reviewInput.value = t.reviewText;
      avatarInput.value = t.avatar || '';
      visibleCheckbox.checked = t.isVisible !== false;
    }
  } else {
    title.textContent = 'Add Review';
    idInput.value = '';
    nameInput.value = '';
    cityInput.value = '';
    ratingSelect.value = 5;
    reviewInput.value = '';
    avatarInput.value = '';
    visibleCheckbox.checked = true;
  }
  modal.classList.remove('hidden');
}

function closeTestimonialModal() {
  document.getElementById('testimonial-modal').classList.add('hidden');
  adminState.editingTestimonialId = null;
}

async function saveTestimonialForm(event) {
  event.preventDefault();
  const id = document.getElementById('testimonial-form-id').value || `t-${Date.now()}`;
  const name = document.getElementById('testimonial-form-name').value.trim();
  const city = document.getElementById('testimonial-form-city').value.trim();
  const rating = Number(document.getElementById('testimonial-form-rating').value) || 5;
  const reviewText = document.getElementById('testimonial-form-review').value.trim();
  const avatar = document.getElementById('testimonial-form-avatar').value.trim();
  const isVisible = document.getElementById('testimonial-form-visible').checked;

  const itemObj = { id, name, city, rating, reviewText, avatar, isVisible, sortOrder: 1 };

  const ok = await MiraDB.dbUpsertTestimonial(itemObj, MiraDB.adminClient);
  if (ok) {
    showToast('Customer review saved!', 'success');
    closeTestimonialModal();
    adminState.testimonials = await fetchTestimonials();
    renderAdminTestimonials();
  } else {
    showToast('Failed to save review — please retry', 'error');
  }
}

async function toggleTestimonialVisible(id) {
  const t = (adminState.testimonials || []).find(item => item.id === id);
  if (!t) return;
  t.isVisible = !t.isVisible;
  await MiraDB.dbUpsertTestimonial(t, MiraDB.adminClient);
  showToast(`Review is now ${t.isVisible ? 'Visible' : 'Hidden'}`, 'info');
  renderAdminTestimonials();
}

async function deleteTestimonial(id) {
  const t = (adminState.testimonials || []).find(item => item.id === id);
  if (!t) return;
  if (!confirm(`Delete review by "${t.name}"?`)) return;
  const ok = await MiraDB.dbDeleteTestimonial(id, MiraDB.adminClient);
  if (ok) {
    showToast('Review deleted', 'info');
    adminState.testimonials = adminState.testimonials.filter(item => item.id !== id);
    renderAdminTestimonials();
  }
}

/**
 * 9D. FREQUENTLY ASKED QUESTIONS (FAQs) CMS CRUD
 */
function renderAdminFaqs() {
  const tbody = document.getElementById('admin-faqs-table-body');
  if (!tbody) return;

  const items = adminState.faqs || [];
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400 text-xs">No FAQs created yet. Click "+ Add FAQ" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(f => `
    <tr class="border-b hover:bg-amber-50/40 transition">
      <td class="p-3 font-bold text-xs text-gray-900 max-w-sm">${f.question}</td>
      <td class="p-3 text-xs text-gray-600 capitalize">${f.category || 'General'}</td>
      <td class="p-3 text-xs text-gray-500 font-mono">${f.sortOrder || 1}</td>
      <td class="p-3">
        <button onclick="toggleFaqVisible('${f.id}')" title="${f.isVisible !== false ? 'Click to hide' : 'Click to show'}" class="px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${f.isVisible !== false ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}">
          <i class="fas ${f.isVisible !== false ? 'fa-eye' : 'fa-eye-slash'}"></i> ${f.isVisible !== false ? 'Visible' : 'Hidden'}
        </button>
      </td>
      <td class="p-3 text-right space-x-1">
        <button onclick="openFaqModal('${f.id}')" title="Edit FAQ" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition whitespace-nowrap"><i class="fas fa-pen"></i> Edit</button>
        <button onclick="deleteFaq('${f.id}')" title="Delete FAQ" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition whitespace-nowrap"><i class="fas fa-trash-can"></i> Delete</button>
      </td>
    </tr>
  `).join('');
}

function openFaqModal(id = null) {
  adminState.editingFaqId = id;
  const modal = document.getElementById('faq-modal');
  const title = document.getElementById('faq-modal-title');
  const idInput = document.getElementById('faq-form-id');
  const questionInput = document.getElementById('faq-form-question');
  const answerInput = document.getElementById('faq-form-answer');
  const categoryInput = document.getElementById('faq-form-category');
  const sortInput = document.getElementById('faq-form-sort');
  const visibleCheckbox = document.getElementById('faq-form-visible');

  if (id) {
    const f = (adminState.faqs || []).find(item => item.id === id);
    if (f) {
      title.textContent = 'Edit FAQ';
      idInput.value = f.id;
      questionInput.value = f.question;
      answerInput.value = f.answer;
      categoryInput.value = f.category || 'quality';
      sortInput.value = f.sortOrder || 1;
      visibleCheckbox.checked = f.isVisible !== false;
    }
  } else {
    title.textContent = 'Add FAQ';
    idInput.value = '';
    questionInput.value = '';
    answerInput.value = '';
    categoryInput.value = 'quality';
    sortInput.value = (adminState.faqs || []).length + 1;
    visibleCheckbox.checked = true;
  }
  modal.classList.remove('hidden');
}

function closeFaqModal() {
  document.getElementById('faq-modal').classList.add('hidden');
  adminState.editingFaqId = null;
}

async function saveFaqForm(event) {
  event.preventDefault();
  const id = document.getElementById('faq-form-id').value || `f-${Date.now()}`;
  const question = document.getElementById('faq-form-question').value.trim();
  const answer = document.getElementById('faq-form-answer').value.trim();
  const category = document.getElementById('faq-form-category').value.trim();
  const sortOrder = Number(document.getElementById('faq-form-sort').value) || 1;
  const isVisible = document.getElementById('faq-form-visible').checked;

  const faqObj = { id, question, answer, category, sortOrder, isVisible };

  const ok = await MiraDB.dbUpsertFaq(faqObj, MiraDB.adminClient);
  if (ok) {
    showToast('FAQ saved successfully!', 'success');
    closeFaqModal();
    adminState.faqs = await fetchFaqs();
    renderAdminFaqs();
  } else {
    showToast('Failed to save FAQ — please retry', 'error');
  }
}

async function toggleFaqVisible(id) {
  const f = (adminState.faqs || []).find(item => item.id === id);
  if (!f) return;
  f.isVisible = !f.isVisible;
  await MiraDB.dbUpsertFaq(f, MiraDB.adminClient);
  showToast(`FAQ is now ${f.isVisible ? 'Visible' : 'Hidden'}`, 'info');
  renderAdminFaqs();
}

async function deleteFaq(id) {
  const f = (adminState.faqs || []).find(item => item.id === id);
  if (!f) return;
  if (!confirm(`Delete FAQ: "${f.question}"?`)) return;
  const ok = await MiraDB.dbDeleteFaq(id, MiraDB.adminClient);
  if (ok) {
    showToast('FAQ deleted', 'info');
    adminState.faqs = adminState.faqs.filter(item => item.id !== id);
    renderAdminFaqs();
  }
}

/**
 * 9E. WEBSITE TEXT CONTENT CMS
 */
function renderPageContentForm() {
  const container = document.getElementById('page-content-fields');
  if (!container) return;

  const rows = adminState.pageContentRows || [];
  if (!rows.length) {
    container.innerHTML = '<p class="text-xs text-gray-400">Loading storefront text items...</p>';
    return;
  }

  const grouped = {};
  rows.forEach(row => {
    const p = row.page || 'General';
    if (!grouped[p]) grouped[p] = [];
    grouped[p].push(row);
  });

  container.innerHTML = Object.entries(grouped).map(([page, pageRows]) => `
    <div class="p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-4">
      <div class="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
        
        <span>${page.toUpperCase()} SECTION TEXT</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${pageRows.map(row => {
          const isImage = row.key.endsWith('.image');
          if (row.key === 'home.story.paragraphs') {
            if (!(adminState.storyParagraphsDraft && adminState.storyParagraphsDraft.length)) {
              try { adminState.storyParagraphsDraft = JSON.parse(row.value || '[]'); } catch (e) { adminState.storyParagraphsDraft = []; }
            }
            return `
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-gray-700 mb-1">${row.label} <code class="text-[10px] text-gray-400 font-normal">(${row.key})</code></label>
                <div id="story-paragraphs-rows" class="space-y-2"></div>
                <button type="button" onclick="addStoryParagraphRow()" class="mt-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5"><i class="fas fa-plus"></i> Add Paragraph</button>
              </div>
            `;
          }
          if (row.key === 'home.stats.items') {
            if (!(adminState.statsItemsDraft && adminState.statsItemsDraft.length)) {
              try { adminState.statsItemsDraft = JSON.parse(row.value || '[]'); } catch (e) { adminState.statsItemsDraft = []; }
            }
            return `
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-gray-700 mb-1">${row.label} <code class="text-[10px] text-gray-400 font-normal">(${row.key})</code></label>
                <div id="stats-items-rows" class="space-y-2"></div>
                <button type="button" onclick="addStatsItemRow()" class="mt-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5"><i class="fas fa-plus"></i> Add Stat</button>
              </div>
            `;
          }
          if (isImage) {
            return `
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">${row.label} <code class="text-[10px] text-gray-400 font-normal">(${row.key})</code></label>
                <div class="flex items-center gap-3">
                  <img src="${row.value || 'assets/images/feature_oil.jpg'}" class="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0" data-content-image-preview="${row.key}" />
                  <label class="flex-1 py-2 px-3 bg-white hover:bg-amber-50 text-amber-900 font-bold border border-gray-200 rounded-xl text-center block cursor-pointer text-[11px]">
                     <span data-content-image-status="${row.key}">Upload Image</span>
                    <input type="file" accept="image/*" onchange="handlePageContentImageUpload(event, '${row.key}')" class="hidden" />
                  </label>
                </div>
                <input type="hidden" data-content-key="${row.key}" value="${escapeAttr(row.value || '')}" />
              </div>
            `;
          }
          return `
          <div class="${row.value && row.value.length > 80 ? 'sm:col-span-2' : ''}">
            <label class="block text-xs font-bold text-gray-700 mb-1">${row.label} <code class="text-[10px] text-gray-400 font-normal">(${row.key})</code></label>
            <textarea data-content-key="${row.key}" rows="${row.value && row.value.length > 80 ? 3 : 1}" class="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400">${row.value || ''}</textarea>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `).join('');

  renderStoryParagraphRows();
  renderStatsItemRows();
}

function renderStoryParagraphRows() {
  const container = document.getElementById('story-paragraphs-rows');
  if (!container) return;
  const rows = adminState.storyParagraphsDraft || [];
  container.innerHTML = rows.map((p, idx) => `
    <div class="flex items-start gap-2">
      <textarea rows="2" placeholder="Paragraph ${idx + 1} text..." class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400" onchange="updateStoryParagraphDraft(${idx}, this.value)">${p || ''}</textarea>
      <button type="button" onclick="removeStoryParagraphRow(${idx})" title="Delete Paragraph" class="mt-1 w-8 h-8 shrink-0 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg"><i class="fas fa-trash-can"></i></button>
    </div>
  `).join('') || '<p class="text-xs text-gray-400">No paragraphs yet — click Add Paragraph.</p>';
}

function updateStoryParagraphDraft(idx, value) {
  if (!adminState.storyParagraphsDraft || adminState.storyParagraphsDraft[idx] === undefined) return;
  adminState.storyParagraphsDraft[idx] = value;
}

function addStoryParagraphRow() {
  adminState.storyParagraphsDraft = adminState.storyParagraphsDraft || [];
  adminState.storyParagraphsDraft.push('');
  renderStoryParagraphRows();
}

function removeStoryParagraphRow(idx) {
  adminState.storyParagraphsDraft.splice(idx, 1);
  renderStoryParagraphRows();
}

function renderStatsItemRows() {
  const container = document.getElementById('stats-items-rows');
  if (!container) return;
  const rows = adminState.statsItemsDraft || [];
  container.innerHTML = rows.map((s, idx) => `
    <div class="flex items-center gap-2">
      <input type="text" value="${escapeAttr(s.val || '')}" placeholder="Value e.g. 40+" class="w-28 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400" onchange="updateStatsItemDraft(${idx}, 'val', this.value)" />
      <input type="text" value="${escapeAttr(s.label || '')}" placeholder="Label e.g. Years Heritage" class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400" onchange="updateStatsItemDraft(${idx}, 'label', this.value)" />
      <button type="button" onclick="removeStatsItemRow(${idx})" title="Delete Stat" class="w-8 h-8 shrink-0 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg"><i class="fas fa-trash-can"></i></button>
    </div>
  `).join('') || '<p class="text-xs text-gray-400">No stats yet — click Add Stat.</p>';
}

function updateStatsItemDraft(idx, field, value) {
  if (!adminState.statsItemsDraft || !adminState.statsItemsDraft[idx]) return;
  adminState.statsItemsDraft[idx][field] = value;
}

function addStatsItemRow() {
  adminState.statsItemsDraft = adminState.statsItemsDraft || [];
  adminState.statsItemsDraft.push({ val: '', label: '' });
  renderStatsItemRows();
}

function removeStatsItemRow(idx) {
  adminState.statsItemsDraft.splice(idx, 1);
  renderStatsItemRows();
}

async function handlePageContentImageUpload(event, key) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.querySelector(`[data-content-image-status="${key}"]`);
  const hiddenInput = document.querySelector(`[data-content-key="${key}"]`);
  const previousUrl = hiddenInput ? hiddenInput.value.trim() : '';
  if (status) status.textContent = 'Uploading...';

  const url = await MiraDB.uploadMedia(file, 'trust-badges');
  if (url) {
    if (hiddenInput) hiddenInput.value = url;
    const preview = document.querySelector(`[data-content-image-preview="${key}"]`);
    if (preview) preview.src = url;
    if (status) status.textContent = 'Uploaded — click Save to apply';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

async function savePageContentForm(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('page-content-save-btn');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = ' Saving...'; }

  const before = adminState.pageContentRows.map(row => ({ key: row.key, value: row.value, label: row.label, page: row.page, sortOrder: row.sort_order }));
  const entries = adminState.pageContentRows.map(row => {
    if (row.key === 'home.story.paragraphs') {
      const cleaned = (adminState.storyParagraphsDraft || []).filter(p => p && p.trim());
      return { key: row.key, value: JSON.stringify(cleaned), label: row.label, page: row.page, sortOrder: row.sort_order };
    }
    if (row.key === 'home.stats.items') {
      const cleaned = (adminState.statsItemsDraft || []).filter(s => s && ((s.val || '').trim() || (s.label || '').trim()));
      return { key: row.key, value: JSON.stringify(cleaned), label: row.label, page: row.page, sortOrder: row.sort_order };
    }
    const el = document.querySelector(`[data-content-key="${row.key}"]`);
    return { key: row.key, value: el ? el.value : row.value, label: row.label, page: row.page, sortOrder: row.sort_order };
  });

  const ok = await MiraDB.dbUpsertPageContent(entries, MiraDB.adminClient);

  if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Save Text Content'; }

  if (!ok) {
    showToast('Could not save text content — please retry', 'error');
    return;
  }

  adminState.pageContentRows = entries.map(e => ({ key: e.key, value: e.value, label: e.label, page: e.page, sort_order: e.sortOrder }));
  const map = {};
  entries.forEach(e => { map[e.key] = e.value; });
  window.SITE_PAGE_CONTENT = map;
  if (typeof applyPageContent === 'function') applyPageContent(map);
  MiraDB.logAdminActivity(adminState.currentAdmin, 'settings.content_update', 'Website Text Content', { before });
  showToast('Text content saved & applied live!', 'success');
}

/**
 * 10. ADMIN ACCOUNTS (register / reset password / ban / warn / remove —
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
          ${roleDisplayName(a.role).toUpperCase()}
        </span>
      </td>
      <td class="text-xs text-gray-400">${new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
      <td class="text-right">
        ${a.role === 'root' || a.id === meId ? `
          <span class="text-[10px] text-gray-300 font-bold">—</span>
        ` : `
          <button onclick="openAdminDetailModal('${a.id}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto whitespace-nowrap">
            <i class="fas fa-eye"></i> View
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
  navigator.clipboard?.writeText(pw).then(() => showToast('Password copied to clipboard', 'success'));
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
    <span class="px-2.5 py-0.5 text-[10px] font-black rounded-full ${a.role === 'root' ? 'bg-[#4A0713] text-[#FBBF24]' : 'bg-amber-100 text-amber-800'}">${roleDisplayName(a.role).toUpperCase()}</span>
    ${a.banned ? '<span class="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-red-100 text-red-700">BANNED</span>' : ''}
  `;

  const actionsBox = document.getElementById('admin-detail-actions');
  if (a.role === 'root') {
    actionsBox.innerHTML = `<p class="text-xs text-gray-400">The Owner account manages itself.</p>`;
  } else {
    actionsBox.innerHTML = `
      <button onclick="resetAdminPasswordAccount('${a.id}', '${a.name.replace(/'/g, "\\'")}', '${a.email}')" class="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition">
         Reset Password
      </button>
      <button onclick="toggleBanAdminAccount('${a.id}', '${a.name.replace(/'/g, "\\'")}', ${a.banned})" class="px-3 py-2 ${a.banned ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'} border rounded-xl text-xs font-bold transition">
         ${a.banned ? 'Unban' : 'Ban'}
      </button>
      <button onclick="removeAdminAccount('${a.id}', '${a.name.replace(/'/g, "\\'")}')" class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition">
         Remove
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

const UNDOABLE_ACTIONS = new Set(['product.update', 'product.create', 'product.delete', 'product.toggle_stock', 'category.update', 'category.create', 'category.delete', 'order.status_update', 'settings.update', 'settings.content_update']);

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
           Undo
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
      case 'settings.update': {
        if (!d.before) throw new Error('No prior state recorded to restore');
        const restoredOk = await MiraDB.dbUpsertSiteSettings(d.before, MiraDB.adminClient);
        if (!restoredOk) throw new Error('Restore was rejected by the server');
        adminState.siteSettings = d.before;
        window.SITE_SETTINGS = d.before;
        if (typeof applySiteTheme === 'function') applySiteTheme(d.before);
        break;
      }
      case 'settings.content_update': {
        if (!d.before) throw new Error('No prior state recorded to restore');
        const restoredOk = await MiraDB.dbUpsertPageContent(d.before, MiraDB.adminClient);
        if (!restoredOk) throw new Error('Restore was rejected by the server');
        adminState.pageContentRows = d.before.map(e => ({ key: e.key, value: e.value, label: e.label, page: e.page, sort_order: e.sortOrder }));
        const restoredMap = {};
        d.before.forEach(e => { restoredMap[e.key] = e.value; });
        window.SITE_PAGE_CONTENT = restoredMap;
        if (typeof applyPageContent === 'function') applyPageContent(restoredMap);
        break;
      }
      default:
        throw new Error('This action type cannot be undone');
    }

    await MiraDB.markActivityUndone(entryId);
    MiraDB.logAdminActivity(adminState.currentAdmin, 'admin.undo', entry.target, { undidEntryId: entryId, originalAction: entry.action });

    // Root undoing a *different* admin's theme/settings change — flag it to
    // them automatically so they know it was reverted and why.
    const isSettingsAction = entry.action === 'settings.update' || entry.action === 'settings.content_update';
    if (isSettingsAction && entry.admin_id && entry.admin_id !== adminState.currentAdmin.id) {
      MiraDB.warnAdmin(entry.admin_id, `Your change "${entry.target}" was undone by ${adminState.currentAdmin.name} — it was reverted as an incorrect theme/settings change.`);
    }

    showToast('Change reverted', 'success');
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
  const messageBody = `*Namaste ${order.customer.name}!*\n\nThank you for ordering with *MEERAV Namkeens*!\n\n*Order ID:* #${formatOrderDisplayId(order)}\n*Amount:* ₹${order.totalAmount} (${order.paymentStatus})\n*Delivery Address:* ${order.customer.address}\n\n*Items Ordered:*\n${itemsList}\n\n*Status:* ${order.orderStatus}\n*Tracking:* ${order.trackingNumber}\n\nYour fresh batch is packed in airtight zipper packs. For queries, reply to this chat!`;

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

  document.getElementById('email-preview-subject').textContent = `Order Confirmation #${formatOrderDisplayId(order)} - MEERAV Namkeens`;
  document.getElementById('email-preview-to').textContent = `${order.customer.name} <${order.customer.email}>`;
  document.getElementById('email-preview-order-id').textContent = formatOrderDisplayId(order);
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
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


/**
 * 9E. TRUST & GUARANTEE FEATURE BADGES CMS CRUD
 */
function renderAdminTrustBadges() {
  const tbody = document.getElementById('admin-trust-badges-table-body');
  if (!tbody) return;

  const items = adminState.trustBadges || [];
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400 text-xs">No feature badges configured. Click "+ Add Feature Badge" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(b => `
    <tr class="border-b hover:bg-amber-50/40 transition">
      <td class="p-3">
        <div class="w-11 h-11 rounded-xl bg-[#E59819] overflow-hidden p-0.5 border border-amber-300 shadow-sm shrink-0">
          <img src="${b.image || 'assets/images/feature_oil.jpg'}" alt="${b.title}" class="w-full h-full object-cover rounded-lg" onerror="this.src='assets/images/feature_oil.jpg'" />
        </div>
      </td>
      <td class="p-3 font-black text-gray-900 text-xs">${b.title}</td>
      <td class="p-3 text-xs text-gray-600 truncate max-w-xs">${b.description}</td>
      <td class="p-3 text-xs font-bold text-gray-700">#${b.sortOrder || 1}</td>
      <td class="p-3">
        <button onclick="toggleTrustBadgeVisible('${b.id}')" title="${b.isVisible !== false ? 'Click to hide' : 'Click to show'}" class="px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${b.isVisible !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}">
<i class="fas ${b.isVisible !== false ? 'fa-eye' : 'fa-eye-slash'}"></i> ${b.isVisible !== false ? 'Visible' : 'Hidden'}
        </button>
      </td>
      <td class="p-3 text-right space-x-1">
        <button onclick="openTrustBadgeModal('${b.id}')" title="Edit Badge" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition whitespace-nowrap"><i class="fas fa-pen"></i> Edit</button>
        <button onclick="deleteTrustBadge('${b.id}')" title="Delete Badge" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition whitespace-nowrap"><i class="fas fa-trash-can"></i> Delete</button>
      </td>
    </tr>
  `).join('');
}

function openTrustBadgeModal(id = null) {
  adminState.editingTrustBadgeId = id;
  const modal = document.getElementById('trust-badge-modal');
  const title = document.getElementById('trust-badge-modal-title');
  const idInput = document.getElementById('trust-badge-form-id');
  const titleInput = document.getElementById('trust-badge-form-title');
  const descInput = document.getElementById('trust-badge-form-desc');
  const imageInput = document.getElementById('trust-badge-form-image');
  const sortInput = document.getElementById('trust-badge-form-sort');
  const visibleCheckbox = document.getElementById('trust-badge-form-visible');

  const previewImg = document.getElementById('trust-badge-form-preview');
  const statusEl = document.getElementById('trust-badge-form-image-status');
  if (statusEl) statusEl.textContent = 'Upload Image';

  if (id) {
    const b = (adminState.trustBadges || []).find(item => item.id === id);
    if (b) {
      title.textContent = `Edit Feature: ${b.title}`;
      idInput.value = b.id;
      titleInput.value = b.title;
      descInput.value = b.description;
      imageInput.value = b.image;
      if (previewImg) previewImg.src = b.image;
      sortInput.value = b.sortOrder || 1;
      visibleCheckbox.checked = b.isVisible !== false;
    }
  } else {
    title.textContent = 'Add Feature Badge';
    idInput.value = '';
    titleInput.value = '';
    descInput.value = '';
    imageInput.value = 'assets/images/feature_oil.jpg';
    if (previewImg) previewImg.src = 'assets/images/feature_oil.jpg';
    sortInput.value = (adminState.trustBadges ? adminState.trustBadges.length + 1 : 1);
    visibleCheckbox.checked = true;
  }
  modal.classList.remove('hidden');
}

async function handleTrustBadgeImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('trust-badge-form-image-status');
  const previousUrl = document.getElementById('trust-badge-form-image').value.trim();
  if (status) status.textContent = 'Uploading...';

  const url = await MiraDB.uploadMedia(file, 'trust-badges');
  if (url) {
    document.getElementById('trust-badge-form-image').value = url;
    document.getElementById('trust-badge-form-preview').src = url;
    if (status) status.textContent = 'Uploaded';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

function closeTrustBadgeModal() {
  document.getElementById('trust-badge-modal').classList.add('hidden');
  adminState.editingTrustBadgeId = null;
}

async function saveTrustBadgeForm(event) {
  event.preventDefault();
  const id = document.getElementById('trust-badge-form-id').value || `tb-${Date.now()}`;
  const title = document.getElementById('trust-badge-form-title').value.trim();
  const description = document.getElementById('trust-badge-form-desc').value.trim();
  const image = document.getElementById('trust-badge-form-image').value.trim() || 'assets/images/feature_oil.jpg';
  const sortOrder = Number(document.getElementById('trust-badge-form-sort').value) || 1;
  const isVisible = document.getElementById('trust-badge-form-visible').checked;

  const badgeObj = { id, title, description, image, sortOrder, isVisible };

  const ok = await MiraDB.dbUpsertTrustBadge(badgeObj, MiraDB.adminClient);
  if (!ok) {
    showToast('Could not save — the change did not reach the cloud. Please retry.', 'error');
    return;
  }

  let badges = adminState.trustBadges || [];
  const idx = badges.findIndex(b => b.id === id);
  if (idx !== -1) badges[idx] = badgeObj; else badges.push(badgeObj);
  badges.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  adminState.trustBadges = badges;

  showToast(`Feature Badge "${title}" saved & live on the storefront!`, 'success');
  closeTrustBadgeModal();
  renderAdminTrustBadges();
}

async function toggleTrustBadgeVisible(id) {
  let badges = adminState.trustBadges || [];
  const b = badges.find(item => item.id === id);
  if (!b) return;
  const updated = { ...b, isVisible: !b.isVisible };

  const ok = await MiraDB.dbUpsertTrustBadge(updated, MiraDB.adminClient);
  if (!ok) {
    showToast('Could not update — the change did not reach the cloud.', 'error');
    return;
  }

  b.isVisible = updated.isVisible;
  showToast(`"${b.title}" is now ${b.isVisible ? 'Visible' : 'Hidden'}`, 'info');
  renderAdminTrustBadges();
}

async function deleteTrustBadge(id) {
  let badges = adminState.trustBadges || [];
  const b = badges.find(item => item.id === id);
  if (!b) return;
  if (!confirm(`Delete feature badge "${b.title}"?`)) return;

  const ok = await MiraDB.dbDeleteTrustBadge(id, MiraDB.adminClient);
  if (!ok) {
    showToast('Could not delete — the change did not reach the cloud.', 'error');
    return;
  }

  adminState.trustBadges = badges.filter(item => item.id !== id);
  showToast(`Feature badge deleted`, 'info');
  renderAdminTrustBadges();
}


/**
 * 9F. BROADCAST STORIES & 4K REELS CMS CRUD
 */
function renderAdminStories() {
  const container = document.getElementById('admin-stories-table-body');
  if (!container) return;

  const s = { ...window.SITE_SETTINGS, ...(adminState.siteSettings || {}) };
  const masterFilmRow = `
    <div class="flex items-center gap-3 p-3 bg-[#4A0713]/5 border-2 border-[#4A0713]/20 rounded-2xl">
      <div class="w-8 h-8 rounded-full bg-[#4A0713] text-[#FBBF24] flex items-center justify-center shrink-0" title="Always plays first"></div>
      <div class="w-14 h-18 rounded-xl bg-black overflow-hidden border border-amber-300 shadow-sm shrink-0 relative flex items-center justify-center">
        <video src="${s.heroVideoUrl || 'assets/videos/meerav_brand_film.mp4'}" poster="${s.heroImageUrl || ''}" muted class="w-full h-full object-cover"></video>
        <span class="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs">▶</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-black text-gray-900 text-xs truncate">Master Brand Film</div>
        <div class="text-[10px] text-gray-500 mt-1">Always plays first, on every page load</div>
      </div>
      <button onclick="openMasterFilmModal()" title="Edit Master Film" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg shrink-0"></button>
    </div>
  `;

  const items = (adminState.broadcastStories || []).slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  container.innerHTML = masterFilmRow + items.map((s, idx) => `
    <div class="flex items-center gap-3 p-3 bg-amber-50/40 border border-amber-100 rounded-2xl hover:border-amber-300 transition">
      <div class="w-8 h-8 rounded-full bg-[#4A0713] text-[#FBBF24] flex items-center justify-center font-black text-xs shrink-0" title="Play order">${idx + 2}</div>
      <div class="w-14 h-18 rounded-xl bg-black overflow-hidden border border-amber-300 shadow-sm shrink-0 relative flex items-center justify-center">
        ${s.mediaType === 'video' ? `
          <video src="${s.mediaUrl}" poster="${s.posterUrl || ''}" muted class="w-full h-full object-cover"></video>
          <span class="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs">▶</span>
        ` : `
          <img src="${s.posterUrl || s.mediaUrl}" alt="${s.title}" class="w-full h-full object-cover" />
        `}
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-black text-gray-900 text-xs truncate">${s.title}</div>
        <div class="text-[10px] text-gray-500 mt-1 flex flex-wrap items-center gap-1.5">
          <span class="px-1.5 py-0.5 rounded-full font-black flex items-center gap-1 ${s.mediaType === 'video' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
            ▶ ${s.mediaType === 'video' ? '4K Video' : 'Photo'}
          </span>
          <span>${s.tag || '—'}</span>
          <span class="text-emerald-700 font-bold">₹${s.price || 99}</span>
        </div>
      </div>
      <button onclick="toggleStoryVisible('${s.id}')" title="${s.isVisible !== false ? 'Click to hide' : 'Click to show'}" class="px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shrink-0 ${s.isVisible !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}">

      </button>
      <div class="flex items-center gap-1 shrink-0">
        <button onclick="openStoryModal('${s.id}')" title="Edit Story" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"></button>
        <button onclick="deleteStory('${s.id}')" title="Delete Story" class="p-1.5 text-red-600 hover:bg-red-50 rounded-full"></button>
      </div>
    </div>
  `).join('');
}

/** Re-sorts by the chosen sort order and rewrites clean 1..N numbers to the cloud — this is what
 *  makes "insert at position 2" push everything after it down, and closes gaps left by a delete. */
async function renumberBroadcastStories() {
  const sorted = [...(adminState.broadcastStories || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const writes = [];
  sorted.forEach((s, idx) => {
    const newOrder = idx + 1;
    if (s.sortOrder !== newOrder) {
      s.sortOrder = newOrder;
      writes.push(MiraDB.dbUpsertStory(s, MiraDB.adminClient));
    }
  });
  if (writes.length) await Promise.all(writes);
  adminState.broadcastStories = sorted;
}

function openStoryModal(id = null) {
  adminState.editingStoryId = id;
  const modal = document.getElementById('story-modal');
  const title = document.getElementById('story-modal-title');
  const idInput = document.getElementById('story-form-id');
  const titleInput = document.getElementById('story-form-title');
  const typeSelect = document.getElementById('story-form-media-type');
  const tagInput = document.getElementById('story-form-tag');
  const mediaInput = document.getElementById('story-form-media-url');
  const posterInput = document.getElementById('story-form-poster-url');
  const productInput = document.getElementById('story-form-product-id');
  const priceInput = document.getElementById('story-form-price');
  const sortInput = document.getElementById('story-form-sort');
  const visibleCheckbox = document.getElementById('story-form-visible');

  const posterPreview = document.getElementById('story-form-poster-preview');
  const mediaStatus = document.getElementById('story-form-media-status');
  const posterStatus = document.getElementById('story-form-poster-status');
  if (mediaStatus) mediaStatus.textContent = 'Upload Video / Photo';
  if (posterStatus) posterStatus.textContent = 'Upload Thumbnail';

  if (id) {
    const s = (adminState.broadcastStories || []).find(item => item.id === id);
    if (s) {
      title.textContent = `Edit Story: ${s.title}`;
      idInput.value = s.id;
      titleInput.value = s.title;
      typeSelect.value = s.mediaType || 'video';
      tagInput.value = s.tag || '';
      mediaInput.value = s.mediaUrl;
      posterInput.value = s.posterUrl || '';
      if (posterPreview) posterPreview.src = s.posterUrl || s.mediaUrl;
      productInput.value = s.productId || 'p1';
      priceInput.value = s.price || 99;
      sortInput.value = s.sortOrder || 1;
      visibleCheckbox.checked = s.isVisible !== false;
    }
  } else {
    title.textContent = 'Add Video / Photo Story';
    idInput.value = '';
    titleInput.value = '';
    typeSelect.value = 'video';
    tagInput.value = '4K Reel';
    mediaInput.value = '';
    posterInput.value = '';
    if (posterPreview) posterPreview.src = 'assets/images/cinematic_bhujia.jpg';
    productInput.value = 'p1';
    priceInput.value = 99;
    sortInput.value = (adminState.broadcastStories ? adminState.broadcastStories.length + 1 : 1);
    visibleCheckbox.checked = true;
  }
  modal.classList.remove('hidden');
}

async function handleStoryMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('story-form-media-status');
  const previousUrl = document.getElementById('story-form-media-url').value.trim();
  if (status) status.textContent = 'Uploading...';

  const url = await MiraDB.uploadMedia(file, 'stories');
  if (url) {
    document.getElementById('story-form-media-url').value = url;
    if (status) status.textContent = 'Uploaded';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

async function handleStoryPosterUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('story-form-poster-status');
  const previousUrl = document.getElementById('story-form-poster-url').value.trim();
  if (status) status.textContent = 'Uploading...';

  const url = await MiraDB.uploadMedia(file, 'stories');
  if (url) {
    document.getElementById('story-form-poster-url').value = url;
    document.getElementById('story-form-poster-preview').src = url;
    if (status) status.textContent = 'Uploaded';
    MiraDB.deleteMedia(previousUrl, MiraDB.adminClient);
  } else if (status) {
    status.textContent = 'Upload failed — please retry';
  }
}

function closeStoryModal() {
  document.getElementById('story-modal').classList.add('hidden');
  adminState.editingStoryId = null;
}

async function saveStoryForm(event) {
  event.preventDefault();
  const id = document.getElementById('story-form-id').value || `story-${Date.now()}`;
  const title = document.getElementById('story-form-title').value.trim();
  const mediaType = document.getElementById('story-form-media-type').value;
  const tag = document.getElementById('story-form-tag').value.trim() || '4K Reel';
  const mediaUrl = document.getElementById('story-form-media-url').value.trim();
  const posterUrl = document.getElementById('story-form-poster-url').value.trim();
  const productId = document.getElementById('story-form-product-id').value.trim() || 'p1';
  const price = Number(document.getElementById('story-form-price').value) || 99;
  const sortOrder = Number(document.getElementById('story-form-sort').value) || 1;
  const isVisible = document.getElementById('story-form-visible').checked;

  const storyObj = { id, title, mediaType, tag, mediaUrl, posterUrl, productId, price, sortOrder, isVisible };

  const ok = await MiraDB.dbUpsertStory(storyObj, MiraDB.adminClient);
  if (!ok) {
    showToast('Could not save — the change did not reach the cloud. Please retry.', 'error');
    return;
  }

  // Drop the old copy of this row, then re-insert it right before whichever
  // existing row now has an equal-or-later sort order — that's what makes
  // choosing "2" push the old #2 (and everything after it) down to #3, #4...
  let stories = (adminState.broadcastStories || []).filter(s => s.id !== id);
  const insertAt = stories.findIndex(s => (s.sortOrder || 0) >= sortOrder);
  if (insertAt === -1) stories.push(storyObj); else stories.splice(insertAt, 0, storyObj);
  adminState.broadcastStories = stories;
  await renumberBroadcastStories();

  showToast(`Story "${title}" saved & live on the storefront!`, 'success');
  closeStoryModal();
  renderAdminStories();
}

async function toggleStoryVisible(id) {
  let stories = adminState.broadcastStories || [];
  const s = stories.find(item => item.id === id);
  if (!s) return;
  const updated = { ...s, isVisible: !s.isVisible };

  const ok = await MiraDB.dbUpsertStory(updated, MiraDB.adminClient);
  if (!ok) {
    showToast('Could not update — the change did not reach the cloud.', 'error');
    return;
  }

  s.isVisible = updated.isVisible;
  showToast(`"${s.title}" is now ${s.isVisible ? 'Visible' : 'Hidden'}`, 'info');
  renderAdminStories();
}

async function deleteStory(id) {
  let stories = adminState.broadcastStories || [];
  const s = stories.find(item => item.id === id);
  if (!s) return;
  if (!confirm(`Delete story "${s.title}"?`)) return;

  const ok = await MiraDB.dbDeleteStory(id, MiraDB.adminClient);
  if (!ok) {
    showToast('Could not delete — the change did not reach the cloud.', 'error');
    return;
  }

  adminState.broadcastStories = stories.filter(item => item.id !== id);
  await renumberBroadcastStories();
  showToast(`Story deleted`, 'info');
  renderAdminStories();
}
