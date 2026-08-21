/**
 * MEERAV NAMKEENS - DEDICATED MULTI-PAGE ADMIN OPERATIONS CONTROLLER
 * Full Product & Category CRUD (Add, Edit, Delete, File Image Upload, Price/Discount Changer)
 * Customer CRM & Live Dispatch Automations
 */

const adminState = {
  isAuthenticated: sessionStorage.getItem('mira_admin_session') === 'true',
  currentPage: 'overview',
  orders: JSON.parse(localStorage.getItem('mira_orders_db')) || [...MIRA_DATA.initialOrders],
  products: JSON.parse(localStorage.getItem('mira_products_db')) || [...MIRA_DATA.products],
  categories: JSON.parse(localStorage.getItem('mira_categories_db')) || [...MIRA_DATA.categories],
  customers: JSON.parse(localStorage.getItem('mira_customers_db')) || [...MIRA_DATA.customers],
  notifications: JSON.parse(localStorage.getItem('mira_notifs_db')) || [...MIRA_DATA.notificationLogs],
  editingProductId: null,
  editingCategoryId: null,
  uploadedProductImageBase64: null,
  uploadedCategoryImageBase64: null,
  orderFilter: 'all',
  customerSearchQuery: '',
  productSearchQuery: ''
};

function saveAdminState() {
  localStorage.setItem('mira_orders_db', JSON.stringify(adminState.orders));
  localStorage.setItem('mira_products_db', JSON.stringify(adminState.products));
  localStorage.setItem('mira_categories_db', JSON.stringify(adminState.categories));
  localStorage.setItem('mira_customers_db', JSON.stringify(adminState.customers));
  localStorage.setItem('mira_notifs_db', JSON.stringify(adminState.notifications));
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
});

/**
 * 1. AUTHENTICATION & LOGIN GATE
 */
function checkAdminAuth() {
  const loginGate = document.getElementById('admin-login-gate');
  const dashboard = document.getElementById('admin-dashboard-container');

  if (adminState.isAuthenticated) {
    if (loginGate) loginGate.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    populateCategoryDropdowns();
    showAdminPage(adminState.currentPage || 'overview');
  } else {
    if (loginGate) loginGate.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const input = document.getElementById('admin-login-input').value.trim();

  if (input === MIRA_DATA.adminCredentials.password || input === MIRA_DATA.adminCredentials.pin || input === MIRA_DATA.adminCredentials.email) {
    adminState.isAuthenticated = true;
    sessionStorage.setItem('mira_admin_session', 'true');
    showToast('Admin Operations Portal Unlocked 🛡️', 'success');
    checkAdminAuth();
  } else {
    showToast('Invalid Admin Credentials (Hint: "admin" or "1234")', 'error');
  }
}

function logoutAdmin() {
  adminState.isAuthenticated = false;
  sessionStorage.removeItem('mira_admin_session');
  showToast('Logged out of Admin Portal', 'info');
  checkAdminAuth();
}

/**
 * 2. MULTI-PAGE ROUTER CONTROLLER
 */
function showAdminPage(pageId) {
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

function updateOrderStatus(orderId, newStatus) {
  const order = adminState.orders.find(o => o.id === orderId);
  if (!order) return;

  order.orderStatus = newStatus;
  
  adminState.notifications.unshift({
    id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
    type: 'WhatsApp',
    recipient: `${order.customer.phone} (${order.customer.name})`,
    template: `Status Changed to ${newStatus} #${order.id}`,
    time: 'Just now',
    status: 'Delivered & Read',
    statusColor: 'green'
  });

  saveAdminState();
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

function handleProductImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    adminState.uploadedProductImageBase64 = e.target.result;
    const preview = document.getElementById('prod-img-preview');
    if (preview) {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    }
    showToast('Product Image File Uploaded Successfully! 📸', 'success');
  };
  reader.readAsDataURL(file);
}

function openAddProductModal() {
  adminState.editingProductId = null;
  adminState.uploadedProductImageBase64 = null;
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
  adminState.uploadedProductImageBase64 = null;
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

function saveProductForm(event) {
  event.preventDefault();

  const id = document.getElementById('prod-form-id').value.trim() || `p-${Date.now()}`;
  const name = document.getElementById('prod-form-name').value.trim();
  const tag = document.getElementById('prod-form-tag').value.trim();
  const category = document.getElementById('prod-form-category').value;
  const spiceLevel = document.getElementById('prod-form-spice').value;
  const description = document.getElementById('prod-form-desc').value.trim();
  
  // Use uploaded base64 if uploaded, otherwise use selected pouch preset
  const image = adminState.uploadedProductImageBase64 || document.getElementById('prod-form-image').value.trim() || 'assets/images/pack_bikaneri_bhujia.svg';

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

  if (existingIndex !== -1) {
    adminState.products[existingIndex] = {
      ...adminState.products[existingIndex],
      name,
      tag,
      category,
      spiceLevel,
      description,
      image,
      variants
    };
    showToast(`Updated product: ${name} with new packaging image & pricing! 🎉`, 'success');
  } else {
    const newProd = {
      id,
      name,
      tag,
      category,
      rating: 5.0,
      reviewsCount: 1,
      spiceLevel,
      dietary: ["100% Veg", "Pure & Clean Oil"],
      image,
      description,
      ingredients: "Traditional ingredients, pure cold-pressed oil, authentic desert spices.",
      nutrition: { energy: "520 kcal", fat: "30g", carbs: "48g", protein: "12g" },
      inStock: true,
      variants
    };
    adminState.products.unshift(newProd);
    showToast(`Added new product: ${name} with uploaded pouch packaging! 🍿`, 'success');
  }

  saveAdminState();
  renderAdminProducts();
  renderAdminKPIs();
  closeProductFormModal();
}

function deleteProduct(productId) {
  const p = adminState.products.find(item => item.id === productId);
  if (!p) return;

  if (confirm(`Are you sure you want to delete "${p.name}" from catalog?`)) {
    adminState.products = adminState.products.filter(item => item.id !== productId);
    saveAdminState();
    renderAdminProducts();
    renderAdminKPIs();
    showToast(`Deleted ${p.name} from catalog`, 'info');
  }
}

function toggleProductStock(productId) {
  const p = adminState.products.find(item => item.id === productId);
  if (p) {
    p.inStock = !p.inStock;
    saveAdminState();
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
  adminState.uploadedCategoryImageBase64 = null;

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

function saveCategoryForm(event) {
  event.preventDefault();

  const name = document.getElementById('cat-form-name').value.trim();
  const rawId = document.getElementById('cat-form-id').value.trim();
  const id = rawId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const icon = document.getElementById('cat-form-icon').value.trim() || 'fas fa-cookie';
  const description = document.getElementById('cat-form-desc').value.trim();

  const existingIdx = adminState.categories.findIndex(c => c.id === id);

  if (existingIdx !== -1) {
    adminState.categories[existingIdx] = {
      ...adminState.categories[existingIdx],
      name,
      icon,
      description
    };
    showToast(`Updated category: ${name}! 📁`, 'success');
  } else {
    adminState.categories.push({
      id,
      name,
      icon,
      description
    });
    showToast(`Added new category: ${name}! 📁`, 'success');
  }

  saveAdminState();
  populateCategoryDropdowns();
  renderAdminCategories();
  renderAdminKPIs();
  closeCategoryFormModal();
}

function deleteCategory(catId) {
  const cat = adminState.categories.find(c => c.id === catId);
  if (!cat) return;

  if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
    adminState.categories = adminState.categories.filter(c => c.id !== catId);
    saveAdminState();
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

function triggerCustomNotification(event) {
  event.preventDefault();
  const type = document.getElementById('custom-notif-type').value;
  const target = document.getElementById('custom-notif-target').value.trim();
  const msg = document.getElementById('custom-notif-msg').value.trim();

  if (!target || !msg) {
    showToast('Please fill in target recipient and message', 'error');
    return;
  }

  adminState.notifications.unshift({
    id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
    type,
    recipient: target,
    template: msg.substring(0, 30) + '...',
    time: 'Just now',
    status: 'Delivered & Read',
    statusColor: type === 'WhatsApp' ? 'green' : 'blue'
  });

  saveAdminState();
  renderAdminNotificationLogs();
  showToast(`Test ${type} alert sent successfully to ${target}! 🚀`, 'success');
  document.getElementById('custom-notif-msg').value = '';
}

/**
 * 9. MODAL PREVIEWS
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
 * 10. TOAST HELPER
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
