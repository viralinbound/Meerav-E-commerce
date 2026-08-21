/**
 * MIRA NAMKEENS - MASTER APPLICATION CONTROLLER
 * Full E-Commerce Lifecycle: Catalog, Cart, Check-in/Checkout, Payment Gateway, Live Maps, Admin & Notifications
 */

const state = {
  activeView: 'storefront', // 'storefront' | 'admin' | 'notifications' | 'tracking'
  selectedCategory: 'all',
  selectedDietary: 'all',
  searchQuery: '',
  cart: [],
  wishlist: [],
  selectedVariants: {},
  appliedCoupon: null,
  orders: [...MIRA_DATA.initialOrders],
  products: [...MIRA_DATA.products],
  customers: [...MIRA_DATA.customers],
  notifications: [...MIRA_DATA.notificationLogs],
  activeTrackingOrder: MIRA_DATA.initialOrders[0],
  pendingCheckoutData: null,
  activeProductDetail: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initDefaultVariants();
  renderCategories();
  renderDietaryFilters();
  renderProducts();
  renderCart();
  renderAdminOrders();
  renderAdminProducts();
  renderAdminCustomers();
  renderNotificationLogs();
  updateBadgeCounts();
  setupEventListeners();
  updateCustomerHeaderBadge();
  updateView('storefront');
});

/**
 * 1. INITIALIZATION & VARIANTS
 */
function initDefaultVariants() {
  state.products.forEach(p => {
    state.selectedVariants[p.id] = 0;
  });
}

function setProductVariant(productId, variantIndex, shouldRerender = true) {
  state.selectedVariants[productId] = variantIndex;
  if (shouldRerender) {
    renderProducts();
    if (state.activeProductDetail && state.activeProductDetail.id === productId) {
      renderProductDetailModal(state.activeProductDetail);
    }
  }
}

/**
 * 2. NAVIGATION & VIEW SWITCHING
 */
function updateView(viewName) {
  state.activeView = viewName;

  document.getElementById('storefront-view').classList.toggle('hidden', viewName !== 'storefront');
  document.getElementById('admin-view').classList.toggle('hidden', viewName !== 'admin');
  document.getElementById('notifications-view').classList.toggle('hidden', viewName !== 'notifications');
  document.getElementById('live-tracking-view').classList.toggle('hidden', viewName !== 'tracking');

  // Update Nav Buttons
  document.querySelectorAll('[data-nav-target]').forEach(btn => {
    const target = btn.getAttribute('data-nav-target');
    if (target === viewName) {
      btn.classList.add('bg-amber-600', 'text-white', 'shadow-md');
      btn.classList.remove('text-gray-700', 'hover:bg-amber-50');
    } else {
      btn.classList.remove('bg-amber-600', 'text-white', 'shadow-md');
      btn.classList.add('text-gray-700', 'hover:bg-amber-50');
    }
  });

  if (viewName === 'tracking' && state.activeTrackingOrder) {
    initLiveOrderTrackingMap(state.activeTrackingOrder);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 3. STOREFRONT RENDERING & PRODUCT DETAILS
 */
function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  container.innerHTML = MIRA_DATA.categories.map(cat => `
    <button onclick="filterCategory('${cat.id}')" 
      class="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
        state.selectedCategory === cat.id 
          ? 'bg-amber-600 text-white shadow-md transform scale-105' 
          : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-200'
      }">
      <i class="${cat.icon} text-amber-500"></i>
      <span>${cat.name}</span>
    </button>
  `).join('');
}

function renderDietaryFilters() {
  const container = document.getElementById('dietary-container');
  if (!container) return;

  const filters = ['all', ...MIRA_DATA.dietaryTags];
  container.innerHTML = filters.map(tag => `
    <button onclick="filterDietary('${tag}')" 
      class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
        state.selectedDietary === tag 
          ? 'bg-amber-950 text-white shadow-sm' 
          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
      }">
      ${tag === 'all' ? '✨ All Diets' : tag}
    </button>
  `).join('');
}

function filterCategory(catId) {
  state.selectedCategory = catId;
  renderCategories();
  renderProducts();
}

function filterDietary(tag) {
  state.selectedDietary = tag;
  renderDietaryFilters();
  renderProducts();
}

function handleSearch(query) {
  state.searchQuery = query.toLowerCase().trim();
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  let filtered = state.products.filter(p => {
    const matchCat = state.selectedCategory === 'all' || p.category === state.selectedCategory;
    const matchDiet = state.selectedDietary === 'all' || p.dietary.some(d => d.toLowerCase().includes(state.selectedDietary.toLowerCase()));
    const matchSearch = !state.searchQuery || 
      p.name.toLowerCase().includes(state.searchQuery) ||
      p.description.toLowerCase().includes(state.searchQuery) ||
      p.dietary.some(d => d.toLowerCase().includes(state.searchQuery));
    return matchCat && matchDiet && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-20 h-20 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-3xl">
          <i class="fas fa-cookie-bite"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-800">No Namkeens Found</h3>
        <p class="text-gray-500 text-sm mt-1">Try clearing your search query or selecting a different filter.</p>
        <button onclick="filterCategory('all'); filterDietary('all');" class="mt-4 px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition">
          Reset Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const selectedIdx = state.selectedVariants[p.id] || 0;
    const selectedVar = p.variants[selectedIdx] || p.variants[0];
    const discount = Math.round(((selectedVar.originalPrice - selectedVar.price) / selectedVar.originalPrice) * 100);

    return `
      <div class="product-card bg-white rounded-2xl overflow-hidden flex flex-col justify-between relative group">
        <!-- Image & Badges -->
        <div class="relative h-48 sm:h-52 overflow-hidden bg-amber-50 cursor-pointer" onclick="openProductDetailModal('${p.id}')">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${
            p.tag === 'Best Seller' ? 'badge-bestseller' : p.tag === 'Diet Friendly' ? 'badge-healthy' : 'badge-spicy'
          } shadow-sm">
            ${p.tag}
          </span>

          <button onclick="event.stopPropagation(); toggleWishlist('${p.id}');" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 transition">
            <i class="${state.wishlist.includes(p.id) ? 'fas fa-heart text-red-500' : 'far fa-heart'} text-sm"></i>
          </button>

          <div class="absolute bottom-2.5 left-3 flex flex-wrap gap-1">
            ${p.dietary.map(d => `<span class="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-amber-200 text-[10px] rounded-md font-medium">${d}</span>`).join('')}
          </div>
        </div>

        <!-- Product Details -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <i class="fas fa-star text-xs"></i>
                <span>${p.rating}</span>
                <span class="text-gray-400 font-normal">(${p.reviewsCount})</span>
              </div>
              <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <i class="fas fa-check-circle text-[10px]"></i> In Stock
              </span>
            </div>

            <h3 class="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-1 group-hover:text-amber-700 transition cursor-pointer" onclick="openProductDetailModal('${p.id}')">
              ${p.name}
            </h3>
            <p class="text-xs text-gray-500 line-clamp-2 mb-3">
              ${p.description}
            </p>

            <!-- Weight Variant Selector -->
            <div class="mb-3">
              <span class="text-[11px] font-semibold text-gray-500 block mb-1.5 uppercase tracking-wider">Select Pack Size:</span>
              <div class="flex flex-wrap gap-1.5">
                ${p.variants.map((v, idx) => `
                  <button onclick="setProductVariant('${p.id}', ${idx})" 
                    class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      idx === selectedIdx 
                        ? 'bg-amber-600 text-white shadow-sm border border-amber-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }">
                    ${v.weight}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Price & Actions -->
          <div class="pt-3 border-t border-gray-100">
            <div class="flex items-baseline gap-2 mb-2.5">
              <span class="text-xl font-extrabold text-amber-900">₹${selectedVar.price}</span>
              <span class="text-xs text-gray-400 line-through">₹${selectedVar.originalPrice}</span>
              <span class="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">${discount}% OFF</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="quickWhatsAppOrder('${p.id}', ${selectedIdx})" 
                class="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300 text-xs font-bold transition">
                <i class="fab fa-whatsapp text-sm"></i>
                <span>WhatsApp</span>
              </button>

              <button onclick="addToCart('${p.id}', ${selectedIdx})" 
                class="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm hover:shadow-md">
                <i class="fas fa-shopping-bag text-xs"></i>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openProductDetailModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.activeProductDetail = product;
  renderProductDetailModal(product);
  document.getElementById('product-detail-modal').classList.remove('hidden');
}

function closeProductDetailModal() {
  document.getElementById('product-detail-modal').classList.add('hidden');
  state.activeProductDetail = null;
}

function renderProductDetailModal(p) {
  const selectedIdx = state.selectedVariants[p.id] || 0;
  const selectedVar = p.variants[selectedIdx] || p.variants[0];

  document.getElementById('pdetail-image').src = p.image;
  document.getElementById('pdetail-tag').textContent = p.tag;
  document.getElementById('pdetail-name').textContent = p.name;
  document.getElementById('pdetail-rating').textContent = `${p.rating} (${p.reviewsCount} customer reviews)`;
  document.getElementById('pdetail-spice').textContent = p.spiceLevel;
  document.getElementById('pdetail-desc').textContent = p.description;
  document.getElementById('pdetail-ingredients').textContent = p.ingredients;
  document.getElementById('pdetail-price').textContent = `₹${selectedVar.price}`;
  document.getElementById('pdetail-original-price').textContent = `₹${selectedVar.originalPrice}`;

  // Nutrition
  document.getElementById('pdetail-energy').textContent = p.nutrition.energy;
  document.getElementById('pdetail-protein').textContent = p.nutrition.protein;
  document.getElementById('pdetail-fat').textContent = p.nutrition.fat;
  document.getElementById('pdetail-carbs').textContent = p.nutrition.carbs;

  // Variants list
  const variantsContainer = document.getElementById('pdetail-variants');
  variantsContainer.innerHTML = p.variants.map((v, idx) => `
    <button onclick="setProductVariant('${p.id}', ${idx})" 
      class="px-3 py-2 rounded-xl text-xs font-bold border transition ${
        idx === selectedIdx ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-amber-50'
      }">
      ${v.weight} - ₹${v.price}
    </button>
  `).join('');

  // Action Buttons
  const btnCart = document.getElementById('pdetail-add-cart-btn');
  btnCart.onclick = () => {
    addToCart(p.id, selectedIdx);
    closeProductDetailModal();
  };

  const btnWA = document.getElementById('pdetail-wa-btn');
  btnWA.onclick = () => quickWhatsAppOrder(p.id, selectedIdx);
}

/**
 * 4. CART & PROMO CODE ENGINE
 */
function addToCart(productId, variantIndex = 0) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const variant = product.variants[variantIndex] || product.variants[0];
  const cartItemId = `${productId}-${variant.weight}`;

  const existingItem = state.cart.find(item => item.id === cartItemId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    state.cart.push({
      id: cartItemId,
      productId: product.id,
      name: product.name,
      image: product.image,
      weight: variant.weight,
      price: variant.price,
      originalPrice: variant.originalPrice,
      qty: 1
    });
  }

  showToast(`Added ${product.name} (${variant.weight}) to Cart!`, 'success');
  renderCart();
  updateBadgeCounts();
  openCartDrawer();
}

function updateCartQty(cartItemId, change) {
  const item = state.cart.find(i => i.id === cartItemId);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== cartItemId);
    showToast('Item removed from cart', 'info');
  }
  renderCart();
  updateBadgeCounts();
}

function removeFromCart(cartItemId) {
  state.cart = state.cart.filter(i => i.id !== cartItemId);
  renderCart();
  updateBadgeCounts();
  showToast('Item removed from cart', 'info');
}

function applyCoupon() {
  const input = document.getElementById('coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'MIRA10') {
    state.appliedCoupon = { code: 'MIRA10', discountPercent: 10 };
    showToast('Coupon MIRA10 applied! 10% Discount saved 🎉', 'success');
  } else if (code === 'FREESHIP') {
    state.appliedCoupon = { code: 'FREESHIP', freeShipping: true };
    showToast('Free shipping coupon applied! 🚚', 'success');
  } else {
    showToast('Invalid coupon code. Try "MIRA10" or "FREESHIP"', 'error');
    return;
  }
  renderCart();
}

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discount = 0;
  let shipping = subtotal > 499 || subtotal === 0 ? 0 : 50;

  if (state.appliedCoupon) {
    if (state.appliedCoupon.discountPercent) {
      discount = Math.round(subtotal * (state.appliedCoupon.discountPercent / 100));
    }
    if (state.appliedCoupon.freeShipping) {
      shipping = 0;
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + shipping);
  return { subtotal, discount, shipping, grandTotal };
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  if (!container || !summaryContainer) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-gray-500">
        <div class="w-16 h-16 mx-auto mb-3 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-2xl">
          <i class="fas fa-shopping-basket"></i>
        </div>
        <p class="font-bold text-gray-800 text-base">Your Cart is Empty</p>
        <p class="text-xs text-gray-400 mt-1">Discover fresh crispy Namkeens and add them to cart!</p>
        <button onclick="closeCartDrawer()" class="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700">
          Start Shopping
        </button>
      </div>
    `;
    summaryContainer.classList.add('hidden');
    return;
  }

  summaryContainer.classList.remove('hidden');

  container.innerHTML = state.cart.map(item => `
    <div class="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
      <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover bg-white" />
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-xs text-gray-800 truncate">${item.name}</h4>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="text-[11px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">${item.weight}</span>
          <span class="text-xs font-bold text-gray-900">₹${item.price}</span>
        </div>
        
        <div class="flex items-center gap-2 mt-2">
          <div class="flex items-center border border-amber-200 bg-white rounded-md overflow-hidden">
            <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-amber-100">
              <i class="fas fa-minus text-[9px]"></i>
            </button>
            <span class="w-7 text-center text-xs font-bold text-gray-800">${item.qty}</span>
            <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-amber-100">
              <i class="fas fa-plus text-[9px]"></i>
            </button>
          </div>
          <span class="text-xs font-extrabold text-amber-900 ml-auto">₹${item.price * item.qty}</span>
        </div>
      </div>
      <button onclick="removeFromCart('${item.id}')" class="text-gray-400 hover:text-red-500 p-1">
        <i class="fas fa-trash-alt text-xs"></i>
      </button>
    </div>
  `).join('');

  const { subtotal, discount, shipping, grandTotal } = calculateCartTotals();
  document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
  document.getElementById('cart-discount').textContent = discount > 0 ? `-₹${discount}` : `₹0`;
  document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
  document.getElementById('cart-grandtotal').textContent = `₹${grandTotal}`;
}

function updateBadgeCounts() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-badge-count').forEach(badge => {
    badge.textContent = totalCount;
    badge.classList.toggle('hidden', totalCount === 0);
  });

  const wishlistCount = state.wishlist.length;
  document.querySelectorAll('.wishlist-badge-count').forEach(badge => {
    badge.textContent = wishlistCount;
    badge.classList.toggle('hidden', wishlistCount === 0);
  });
}

function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  if (index === -1) {
    state.wishlist.push(productId);
    showToast('Saved to your wishlist! ❤️', 'success');
  } else {
    state.wishlist.splice(index, 1);
    showToast('Removed from wishlist', 'info');
  }
  updateBadgeCounts();
  renderProducts();
}

function openCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('translate-x-full');
  document.getElementById('cart-overlay').classList.remove('hidden');
}

function closeCartDrawer() {
  document.getElementById('cart-drawer').classList.add('translate-x-full');
  document.getElementById('cart-overlay').classList.add('hidden');
}

/**
 * 5. MULTI-STEP CHECKOUT & ADDRESS LOCATION MAP
 */
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  closeCartDrawer();
  const { grandTotal } = calculateCartTotals();
  document.getElementById('checkout-grand-total').textContent = `₹${grandTotal}`;
  document.getElementById('checkout-items-count').textContent = `${state.cart.reduce((s, i) => s + i.qty, 0)} Items`;
  document.getElementById('checkout-modal').classList.remove('hidden');

  fillCheckoutFormIfLoggedIn();

  // Initialize embedded Leaflet Address Picker Map
  setTimeout(() => {
    initAddressPickerMap();
  }, 200);
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function proceedToPaymentGateway(event) {
  event.preventDefault();

  const name = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const email = document.getElementById('checkout-email').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const pincode = document.getElementById('checkout-pincode').value.trim();
  const optWhatsApp = document.getElementById('opt-whatsapp')?.checked ?? true;
  const optEmail = document.getElementById('opt-email')?.checked ?? true;

  if (!name || !phone || !address || !pincode) {
    showToast('Please fill in all required address fields', 'error');
    return;
  }

  const { grandTotal } = calculateCartTotals();

  // Save pending checkout payload
  state.pendingCheckoutData = {
    name,
    phone,
    email: email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
    address,
    pincode,
    lat: addressMarker ? addressMarker.getLatLng().lat : 19.0596,
    lng: addressMarker ? addressMarker.getLatLng().lng : 72.8295,
    optWhatsApp,
    optEmail,
    grandTotal
  };

  closeCheckoutModal();
  openPaymentGatewayModal(grandTotal);
}

/**
 * 6. INTERACTIVE PAYMENT GATEWAY SIMULATION
 */
function openPaymentGatewayModal(amount) {
  const modal = document.getElementById('payment-gateway-modal');
  if (!modal) return;

  document.getElementById('payment-amount-display').textContent = `₹${amount}`;
  modal.classList.remove('hidden');
  selectPaymentTab('upi');
}

function closePaymentGatewayModal() {
  document.getElementById('payment-gateway-modal').classList.add('hidden');
}

function selectPaymentTab(tabName) {
  document.querySelectorAll('.payment-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.payment-tab-btn').forEach(btn => {
    btn.classList.remove('bg-amber-600', 'text-white');
    btn.classList.add('bg-gray-100', 'text-gray-700');
  });

  const activeContent = document.getElementById(`payment-tab-${tabName}`);
  const activeBtn = document.getElementById(`payment-btn-${tabName}`);

  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.add('bg-amber-600', 'text-white');
    activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
  }
}

function completeOrderWithPayment(paymentMethod) {
  if (!state.pendingCheckoutData) {
    showToast('Checkout session expired', 'error');
    return;
  }

  const data = state.pendingCheckoutData;
  const newOrderId = `MIRA-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const trackingNumber = `DTDC-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const newOrder = {
    id: newOrderId,
    customer: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      city: `Pincode: ${data.pincode}`,
      address: data.address,
      pincode: data.pincode,
      lat: data.lat,
      lng: data.lng
    },
    items: state.cart.map(item => ({
      name: `${item.name} (${item.weight})`,
      qty: item.qty,
      price: item.price
    })),
    totalAmount: data.grandTotal,
    paymentMethod,
    paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Unpaid (COD)' : 'Paid',
    orderStatus: 'Dispatched',
    date: orderDate,
    trackingNumber,
    driver: {
      name: "Suresh Patil",
      phone: "+91 98700 11223",
      vehicle: "Electric Delivery Van (MH-02-EE-4921)",
      lat: MIRA_DATA.warehouseLocation.lat,
      lng: MIRA_DATA.warehouseLocation.lng,
      etaMinutes: 18
    },
    notifications: {
      whatsappSent: data.optWhatsApp,
      emailSent: data.optEmail
    }
  };

  state.orders.unshift(newOrder);

  if (data.optWhatsApp) {
    state.notifications.unshift({
      id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
      type: 'WhatsApp',
      recipient: `${data.phone} (${data.name})`,
      template: `Order Confirmed #${newOrderId} + Live Map Link`,
      time: 'Just now',
      status: 'Delivered & Read',
      statusColor: 'green'
    });
  }

  if (data.optEmail) {
    state.notifications.unshift({
      id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
      type: 'Email',
      recipient: data.email,
      template: `Invoice & Live GPS Tracking #${newOrderId}`,
      time: 'Just now',
      status: 'Delivered',
      statusColor: 'blue'
    });
  }

  // Clear Cart
  state.cart = [];
  state.appliedCoupon = null;
  state.activeTrackingOrder = newOrder;

  renderCart();
  updateBadgeCounts();
  renderAdminOrders();
  renderAdminCustomers();
  renderNotificationLogs();

  closePaymentGatewayModal();
  showToast('Payment Successful! Order Confirmed 🎉', 'success');

  // Switch to Live Tracking View
  updateView('tracking');
}

/**
 * 7. LIVE TRACKING VIEW CONTROLLERS
 */
function openOrderTrackingView(orderId) {
  const order = state.orders.find(o => o.id === orderId) || state.orders[0];
  if (!order) return;

  state.activeTrackingOrder = order;
  document.getElementById('track-order-id').textContent = `#${order.id}`;
  document.getElementById('track-order-amount').textContent = `₹${order.totalAmount}`;
  document.getElementById('track-customer-name').textContent = order.customer.name;
  document.getElementById('track-customer-address').textContent = order.customer.address;
  document.getElementById('track-courier-awb').textContent = order.trackingNumber;

  updateView('tracking');
}

/**
 * 8. NOTIFICATIONS SIMULATION & MODALS
 */
function previewWhatsAppNotification(orderId) {
  const order = state.orders.find(o => o.id === orderId) || state.orders[0];
  if (!order) return;

  const itemsList = order.items.map(i => `• ${i.name} x${i.qty} (₹${i.price * i.qty})`).join('\n');
  const messageBody = `*Namaste ${order.customer.name}!* 🙏\n\nThank you for ordering with *Mira Namkeens*! 🍿✨\n\n📦 *Order ID:* #${order.id}\n💰 *Amount:* ₹${order.totalAmount} (${order.paymentStatus})\n📍 *Delivery Address:* ${order.customer.address}\n\n*Items Ordered:*\n${itemsList}\n\n🚚 *Status:* ${order.orderStatus}\n📦 *Live GPS Tracking:* https://miranamkeens.com/track/${order.id}\n\nYour fresh batch is prepared with 100% pure spices & care. For queries, reply to this message anytime!`;

  document.getElementById('wa-preview-name').textContent = order.customer.name;
  document.getElementById('wa-preview-phone').textContent = order.customer.phone;
  document.getElementById('wa-preview-body').innerHTML = messageBody.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  document.getElementById('wa-preview-time').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  document.getElementById('whatsapp-preview-modal').classList.remove('hidden');
}

function closeWhatsAppPreviewModal() {
  document.getElementById('whatsapp-preview-modal').classList.add('hidden');
}

function previewEmailNotification(orderId) {
  const order = state.orders.find(o => o.id === orderId) || state.orders[0];
  if (!order) return;

  document.getElementById('email-preview-subject').textContent = `Order Confirmation #${order.id} - Mira Namkeens`;
  document.getElementById('email-preview-to').textContent = `${order.customer.name} <${order.customer.email}>`;
  document.getElementById('email-preview-order-id').textContent = order.id;
  document.getElementById('email-preview-date').textContent = order.date;
  document.getElementById('email-preview-customer-name').textContent = order.customer.name;
  document.getElementById('email-preview-address').textContent = order.customer.address;
  document.getElementById('email-preview-tracking').textContent = order.trackingNumber;
  document.getElementById('email-preview-total').textContent = `₹${order.totalAmount}`;
  
  const itemsContainer = document.getElementById('email-preview-items');
  itemsContainer.innerHTML = order.items.map(i => `
    <tr class="border-b border-gray-100 text-xs">
      <td class="py-2 text-gray-800 font-medium">${i.name}</td>
      <td class="py-2 text-center text-gray-600">${i.qty}</td>
      <td class="py-2 text-right text-gray-900 font-bold">₹${i.price * i.qty}</td>
    </tr>
  `).join('');

  document.getElementById('email-preview-modal').classList.remove('hidden');
}

function closeEmailPreviewModal() {
  document.getElementById('email-preview-modal').classList.add('hidden');
}

function quickWhatsAppOrder(productId, variantIndex) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const variant = product.variants[variantIndex] || product.variants[0];
  const message = `Hello Mira Namkeens! 👋 I would like to quickly order:\n- *${product.name}* (${variant.weight})\n- Price: ₹${variant.price}\n\nPlease share delivery details and UPI payment link.`;
  
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/919876543210?text=${encoded}`, '_blank');
}

/**
 * 9. ADMIN DASHBOARD ACTIONS
 */
function renderAdminOrders() {
  const tbody = document.getElementById('admin-orders-table');
  if (!tbody) return;

  tbody.innerHTML = state.orders.map(order => `
    <tr class="border-b border-gray-100 hover:bg-amber-50/40 transition">
      <td class="py-3.5 px-4 font-bold text-amber-950 text-xs">#${order.id}</td>
      <td class="py-3.5 px-4">
        <div class="font-bold text-xs text-gray-900">${order.customer.name}</div>
        <div class="text-[11px] text-gray-500">${order.customer.phone}</div>
      </td>
      <td class="py-3.5 px-4">
        <div class="text-xs text-gray-700 line-clamp-1">${order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}</div>
        <div class="text-[11px] text-gray-400">${order.date}</div>
      </td>
      <td class="py-3.5 px-4 font-extrabold text-xs text-amber-900">₹${order.totalAmount}</td>
      <td class="py-3.5 px-4">
        <select onchange="updateOrderStatus('${order.id}', this.value)" class="text-xs font-bold py-1 px-2.5 rounded-lg border cursor-pointer ${
          order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
          order.orderStatus === 'Dispatched' ? 'bg-blue-50 text-blue-700 border-blue-300' :
          order.orderStatus === 'Processing' ? 'bg-amber-50 text-amber-700 border-amber-300' :
          'bg-gray-50 text-gray-700 border-gray-300'
        }">
          <option value="Pending" ${order.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Processing" ${order.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Dispatched" ${order.orderStatus === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
          <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td class="py-3.5 px-4">
        <div class="flex items-center gap-1.5">
          <button onclick="openOrderTrackingView('${order.id}')" title="View Live Map" class="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs transition">
            <i class="fas fa-map-location-dot"></i>
          </button>
          <button onclick="previewWhatsAppNotification('${order.id}')" title="Send WhatsApp Update" class="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs transition">
            <i class="fab fa-whatsapp"></i>
          </button>
          <button onclick="previewEmailNotification('${order.id}')" title="Send Email Invoice" class="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs transition">
            <i class="fas fa-envelope"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const totalRevenue = state.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  document.getElementById('admin-kpi-revenue').textContent = `₹${totalRevenue.toLocaleString()}`;
  document.getElementById('admin-kpi-orders').textContent = state.orders.length;
}

function updateOrderStatus(orderId, newStatus) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  order.orderStatus = newStatus;
  
  state.notifications.unshift({
    id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
    type: 'WhatsApp',
    recipient: `${order.customer.phone} (${order.customer.name})`,
    template: `Status Changed to ${newStatus} #${order.id}`,
    time: 'Just now',
    status: 'Delivered & Read',
    statusColor: 'green'
  });

  renderAdminOrders();
  renderNotificationLogs();
  showToast(`Order #${order.id} status updated to "${newStatus}". WhatsApp alert dispatched! 🚀`, 'success');
}

function renderAdminProducts() {
  const tbody = document.getElementById('admin-products-table');
  if (!tbody) return;

  tbody.innerHTML = state.products.map(p => `
    <tr class="border-b border-gray-100 hover:bg-amber-50/40 transition">
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover bg-amber-100" />
          <div>
            <div class="font-bold text-xs text-gray-900">${p.name}</div>
            <div class="text-[10px] text-gray-400 capitalize">${p.category}</div>
          </div>
        </div>
      </td>
      <td class="py-3 px-4 text-xs font-semibold text-gray-700">${p.variants.map(v => `${v.weight}: ₹${v.price}`).join(', ')}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
          ${p.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="toggleProductStock('${p.id}')" class="text-xs font-bold text-amber-700 hover:text-amber-900 underline">
          ${p.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
        </button>
      </td>
    </tr>
  `).join('');

  document.getElementById('admin-kpi-products').textContent = state.products.length;
}

function toggleProductStock(productId) {
  const p = state.products.find(item => item.id === productId);
  if (p) {
    p.inStock = !p.inStock;
    renderAdminProducts();
    renderProducts();
    showToast(`Stock updated for ${p.name}`, 'info');
  }
}

function renderAdminCustomers() {
  const tbody = document.getElementById('admin-customers-table');
  if (!tbody) return;

  tbody.innerHTML = state.customers.map(c => `
    <tr class="border-b border-gray-100 hover:bg-amber-50/40 transition">
      <td class="py-3 px-4 font-bold text-xs text-gray-900">${c.name}</td>
      <td class="py-3 px-4 text-xs text-gray-600">${c.phone}</td>
      <td class="py-3 px-4 text-xs text-gray-600">${c.location}</td>
      <td class="py-3 px-4 text-xs font-bold text-amber-900">${c.ordersCount} Orders</td>
      <td class="py-3 px-4 text-xs font-extrabold text-emerald-700">₹${c.totalSpent.toLocaleString()}</td>
    </tr>
  `).join('');
}

function renderNotificationLogs() {
  const tbody = document.getElementById('notification-logs-table');
  if (!tbody) return;

  tbody.innerHTML = state.notifications.map(n => `
    <tr class="border-b border-gray-100 hover:bg-amber-50/40 transition">
      <td class="py-3 px-4">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
          n.type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }">
          <i class="${n.type === 'WhatsApp' ? 'fab fa-whatsapp' : 'fas fa-envelope'}"></i>
          ${n.type}
        </span>
      </td>
      <td class="py-3 px-4 text-xs font-semibold text-gray-800">${n.recipient}</td>
      <td class="py-3 px-4 text-xs text-gray-600">${n.template}</td>
      <td class="py-3 px-4 text-xs text-gray-400">${n.time}</td>
      <td class="py-3 px-4">
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

  state.notifications.unshift({
    id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
    type,
    recipient: target,
    template: msg.substring(0, 30) + '...',
    time: 'Just now',
    status: 'Delivered & Read',
    statusColor: type === 'WhatsApp' ? 'green' : 'blue'
  });

  renderNotificationLogs();
  showToast(`Test ${type} alert sent successfully to ${target}! 🚀`, 'success');
  document.getElementById('custom-notif-msg').value = '';
}

/**
 * 10. TOAST NOTIFICATIONS & LISTENERS
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

  toast.className = `toast flex items-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-semibold ${bgColor}`;
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setupEventListeners() {
  const searchInput = document.getElementById('store-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  }
}
