/**
 * MEERAV NAMKEENS - CUSTOMER STOREFRONT CONTROLLER
 * High Performance, Royal Bikaneri Packaging Theme with Cart, Leaflet GPS, Payments & Order History
 */

const storeState = {
  selectedCategory: 'all',
  selectedDietary: 'all',
  searchQuery: '',
  cart: [],
  wishlist: [],
  selectedVariants: {},
  appliedCoupon: null,
  categories: [],
  products: [],
  orders: [],
  coupons: [],
  testimonials: [],
  faqs: [],
  activeTrackingOrder: null,
  pendingCheckoutData: null,
  activeProductDetail: null
};

// Global Toast Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-700' : type === 'error' ? 'bg-red-700' : 'bg-gray-900';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

  toast.className = `toast flex items-center gap-2.5 px-4 py-3 rounded-2xl text-white text-xs font-bold ${bgColor} shadow-xl border border-white/20`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Initialize on Load (instant local render + background cloud sync)
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Instant local render (0 ms delay)
  storeState.categories = JSON.parse(localStorage.getItem('mira_categories_db')) || [...MIRA_DATA.categories];
  storeState.products = JSON.parse(localStorage.getItem('mira_products_db')) || [...MIRA_DATA.products];
  storeState.orders = JSON.parse(localStorage.getItem('mira_orders_db')) || [];
  storeState.coupons = MIRA_DATA.coupons || [];
  storeState.testimonials = MIRA_DATA.testimonials || [];
  storeState.faqs = MIRA_DATA.faqs || [];

  initProductVariants();
  renderCinematicVideoReels();
  renderHomeCategoryCards();
  renderStoreCategories();
  renderStoreDietaryFilters();
  renderStoreProducts();
  renderStoreCart();
  renderStoreTestimonials();
  renderStoreFaqs();
  updateStoreBadgeCounts();
  updateCustomerHeaderBadge();
  setupStoreSearch();

  const savedOrderId = localStorage.getItem('mira_last_order_id');
  if (savedOrderId) {
    const found = storeState.orders.find(o => o.id === savedOrderId);
    if (found) storeState.activeTrackingOrder = found;
  }

  // 2. Asynchronous Cloud Sync from Supabase
  try {
    const [categories, products, orders, coupons, testimonials, faqs] = await Promise.all([
      typeof fetchCategories === 'function' ? fetchCategories() : Promise.resolve([]),
      typeof fetchProducts === 'function' ? fetchProducts() : Promise.resolve([]),
      typeof fetchOrders === 'function' ? fetchOrders() : Promise.resolve([]),
      typeof fetchCoupons === 'function' ? fetchCoupons() : Promise.resolve([]),
      typeof fetchTestimonials === 'function' ? fetchTestimonials() : Promise.resolve([]),
      typeof fetchFaqs === 'function' ? fetchFaqs() : Promise.resolve([])
    ]);

    if (categories && categories.length > 0) storeState.categories = categories;
    if (products && products.length > 0) storeState.products = products;
    if (orders) storeState.orders = orders;
    if (coupons && coupons.length > 0) storeState.coupons = coupons;
    if (testimonials && testimonials.length > 0) storeState.testimonials = testimonials;
    if (faqs && faqs.length > 0) storeState.faqs = faqs;

    initProductVariants();
    renderHomeCategoryCards();
    renderStoreCategories();
    renderStoreProducts();
    renderStoreTestimonials();
    renderStoreFaqs();
  } catch (err) {
    console.warn('Storefront cloud sync fallback:', err.message);
  }

  // 3. Stay live — reflect admin catalog/order changes without a reload.
  setupStoreRealtime();
});

/**
 * REAL-TIME SYNC — storefront reflects admin changes (stock, price, new
 * orders being dispatched) live, without a page reload.
 */
function setupStoreRealtime() {
  MiraDB.subscribeTable('products', (payload) => {
    if (payload.eventType === 'DELETE') {
      storeState.products = storeState.products.filter(p => p.id !== payload.old.id);
    } else {
      const updated = MiraDB.mappers.dbProductToApp(payload.new);
      const idx = storeState.products.findIndex(p => p.id === updated.id);
      if (idx === -1) storeState.products.unshift(updated); else storeState.products[idx] = updated;
      if (storeState.selectedVariants[updated.id] === undefined) storeState.selectedVariants[updated.id] = 0;
    }
    renderStoreProducts();
    renderHomeCategoryCards();
    renderCinematicVideoReels();
    if (storeState.activeProductDetail) renderProductDetailModal(storeState.activeProductDetail);
  });

  MiraDB.subscribeTable('categories', async () => {
    storeState.categories = await fetchCategories();
    renderStoreCategories();
    renderHomeCategoryCards();
  });

  MiraDB.subscribeTable('orders', (payload) => {
    if (payload.eventType === 'DELETE') {
      storeState.orders = storeState.orders.filter(o => o.id !== payload.old.id);
      return;
    }
    const updated = MiraDB.mappers.dbOrderToApp(payload.new);
    const idx = storeState.orders.findIndex(o => o.id === updated.id);
    if (idx === -1) storeState.orders.unshift(updated); else storeState.orders[idx] = updated;

    if (storeState.activeTrackingOrder && storeState.activeTrackingOrder.id === updated.id) {
      storeState.activeTrackingOrder = updated;
      const trackingView = document.getElementById('live-tracking-view');
      if (trackingView && !trackingView.classList.contains('hidden')) {
        openOrderTrackingView(updated.id);
        showToast(`Order #${updated.id} status: ${updated.orderStatus}`, 'success');
      }
    }
  });

  MiraDB.subscribeTable('testimonials', async () => {
    storeState.testimonials = await fetchTestimonials();
    renderStoreTestimonials();
  });

  MiraDB.subscribeTable('faqs', async () => {
    storeState.faqs = await fetchFaqs();
    renderStoreFaqs();
  });

  MiraDB.subscribeTable('coupons', async () => {
    storeState.coupons = await fetchCoupons();
  });
}

/**
 * Dynamic Home Category Cards with Live Product Counter Calculation
 */
function renderHomeCategoryCards() {
  const container = document.getElementById('home-category-showcase');
  const bannerCount = document.getElementById('home-total-products-count');
  const bannerBtn = document.getElementById('home-total-products-btn');

  const categories = storeState.categories.length ? storeState.categories : MIRA_DATA.categories;
  const products = storeState.products.length ? storeState.products : [...MIRA_DATA.products];

  if (bannerCount) bannerCount.textContent = `Want to explore all ${products.length} authentic varieties?`;
  if (bannerBtn) bannerBtn.textContent = `Explore All ${products.length} Products`;

  if (!container) return;

  const validCats = categories.filter(c => c.id !== 'all');

  // Exact Category Images & Icons
  const categoryDefaults = {
    'bhujia-sev': { image: 'assets/images/cinematic_bhujia.jpg', icon: 'fas fa-fire', name: 'Bhujia & Sev' },
    'mixture-farsan': { image: 'assets/images/cinematic_mixture.jpg', icon: 'fas fa-bowl-rice', name: 'Namkeen & Mixtures' },
    'mathri': { image: 'assets/images/cinematic_papad.jpg', icon: 'fas fa-sun', name: 'Papad & Mathri' },
    'papad-mathri': { image: 'assets/images/cinematic_papad.jpg', icon: 'fas fa-sun', name: 'Papad & Mathri' },
    'roasted-diet': { image: 'assets/images/cinematic_moong_dal.jpg', icon: 'fas fa-seedling', name: 'Roasted Diet Snacks' },
    'healthy-roasted': { image: 'assets/images/cinematic_moong_dal.jpg', icon: 'fas fa-seedling', name: 'Roasted Diet Snacks' },
    'sweets-combos': { image: 'assets/images/commercial_scene_4.jpg', icon: 'fas fa-gift', name: 'Sweets & Hampers' }
  };

  container.innerHTML = validCats.map(cat => {
    const count = products.filter(p => p.category === cat.id).length;
    const catStyle = categoryDefaults[cat.id] || { image: cat.image || 'assets/images/cinematic_bhujia.jpg', icon: cat.icon || 'fas fa-cookie-bite', name: cat.name };
    const displayImg = cat.image || catStyle.image || 'assets/images/cinematic_bhujia.jpg';

    return `
      <a href="category?cat=${cat.id}" 
        class="p-4 sm:p-6 bg-white rounded-3xl border-2 border-amber-200/80 hover:border-[#E59819] hover:shadow-2xl transition-all cursor-pointer text-center group transform hover:-translate-y-2 block active:scale-98">
        
        <!-- Real Food Showcase Image with Royal Gold Border & Hover Zoom -->
        <div class="w-18 h-18 sm:w-22 sm:h-22 mx-auto mb-3 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#520914] text-[#FBBF24] flex items-center justify-center text-2xl sm:text-3xl shadow-xl group-hover:scale-110 transition-all duration-500 border-2 border-[#E59819]/50 relative">
          <img src="${displayImg}" alt="${cat.name}" class="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500" />
        </div>

        <h4 class="font-black text-xs sm:text-sm text-gray-900 group-hover:text-[#4A0713] mb-1 leading-snug">${cat.name || catStyle.name}</h4>
        <span class="text-[10px] sm:text-[11px] text-amber-800 font-extrabold block mb-2">${count} Varieties</span>
        
        <span class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-[#4A0713] group-hover:underline">
          Explore &rarr;
        </span>
      </a>
    `;
  }).join('');
}

/**
 * Auto-Scrolling Cinematic Video Reels Bar (Watch & Shop Stories)
 */
let reelsAutoScrollTimer = null;

function renderCinematicVideoReels() {
  const track = document.getElementById('reels-scroll-track');
  if (!track) return;

  const products = storeState.products.length ? storeState.products : [...MIRA_DATA.products];
  const videoProducts = products.filter(p => p.video);

  if (videoProducts.length === 0) return;

  // Duplicate list to create seamless infinite auto-scroll illusion
  const displayItems = [...videoProducts, ...videoProducts];

  track.innerHTML = displayItems.map((p, idx) => {
    const v = p.variants[0];
    const discount = Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100);

    return `
      <div class="reels-card relative flex flex-col justify-between group cursor-pointer" 
        onmouseenter="const vid=this.querySelector('video'); if(vid){vid.play().catch(()=>{});}" 
        onmouseleave="const vid=this.querySelector('video'); if(vid){vid.pause();}">
        
        <!-- Video Preview Container (3:4 ratio) -->
        <div class="relative w-full aspect-[3/4] overflow-hidden bg-black">
          <video src="${p.video}" muted loop playsinline preload="metadata" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
          </video>

          <!-- Top Pill Overlays -->
          <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <span class="px-2 py-0.5 bg-[#4A0713]/90 text-[#FBBF24] border border-[#E59819]/50 text-[9px] font-black rounded-full backdrop-blur-md shadow-xs">
              ${p.tag}
            </span>
            <div class="px-2 py-0.5 bg-red-600/90 text-white text-[9px] font-black rounded-full flex items-center gap-1 backdrop-blur-md animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>4K REEL</span>
            </div>
          </div>

          <!-- Click to Watch Fullscreen -->
          <a href="product?id=${p.id}" class="absolute inset-0 z-0"></a>

          <!-- Floating Sound/Play Indicator -->
          <div class="absolute bottom-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/70 text-[#FBBF24] flex items-center justify-center text-[10px] backdrop-blur-md border border-[#E59819]/40">
            
          </div>
        </div>

        <!-- Card Footer (Title, Price & 1-Tap Add) -->
        <div class="p-3.5 bg-[#1F0307] border-t border-[#E59819]/40 flex flex-col justify-between flex-1">
          <div>
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1 text-amber-400 text-[10px] font-extrabold">
                
                <span>${p.rating}</span>
              </div>
              <span class="text-[9px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                ${discount}% OFF
              </span>
            </div>

            <a href="product?id=${p.id}" class="font-black text-white text-xs hover:text-[#FBBF24] line-clamp-1 block mb-1">
              ${p.name}
            </a>
          </div>

          <div class="pt-2 border-t border-white/10 flex items-center justify-between gap-2 mt-2">
            <div>
              <span class="text-sm font-black text-[#FBBF24]">${formatPrice(v.price)}</span>
              <span class="text-[10px] text-gray-400 line-through ml-1">${formatPrice(v.originalPrice)}</span>
            </div>
            
            <button onclick="addToCart('${p.id}', 0); showToast('Added to cart!', 'success');" 
              class="px-3 py-1.5 bg-[#E59819] hover:bg-amber-500 text-[#32040C] text-[11px] font-black rounded-xl transition shadow-md flex items-center gap-1">
               Add
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');

  // Start smooth auto-scrolling
  startReelsAutoScroll(track);
}

function startReelsAutoScroll(track) {
  if (reelsAutoScrollTimer) clearInterval(reelsAutoScrollTimer);

  let isPaused = false;
  track.addEventListener('mouseenter', () => { isPaused = true; });
  track.addEventListener('mouseleave', () => { isPaused = false; });
  track.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
  track.addEventListener('touchend', () => { isPaused = false; }, { passive: true });

  reelsAutoScrollTimer = setInterval(() => {
    if (!isPaused && track) {
      track.scrollLeft += 1.5;
      if (track.scrollLeft >= track.scrollWidth / 2) {
        track.scrollLeft = 0;
      }
    }
  }, 35);
}

function scrollReelsLeft() {
  const track = document.getElementById('reels-scroll-track');
  if (track) track.scrollBy({ left: -280, behavior: 'smooth' });
}

function scrollReelsRight() {
  const track = document.getElementById('reels-scroll-track');
  if (track) track.scrollBy({ left: 280, behavior: 'smooth' });
}

/**
 * 1. PRODUCT VARIANTS
 */
function initProductVariants() {
  storeState.products.forEach(p => {
    storeState.selectedVariants[p.id] = 0;
  });
}

function setProductVariant(productId, variantIdx) {
  storeState.selectedVariants[productId] = variantIdx;
  renderStoreProducts();
  
  if (storeState.activeProductDetail && storeState.activeProductDetail.id === productId) {
    renderProductDetailModal(storeState.activeProductDetail);
  }

  const p = storeState.products.find(item => item.id === productId);
  if (p) {
    const v = p.variants[variantIdx];
    showToast(`Selected ${p.name} (${v.weight}) - ₹${v.price}`, 'info');
  }
}

/**
 * 2. CATEGORIES & DIETARY FILTERING
 */
function renderStoreCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  const cats = [{ id: 'all', name: 'All Delicacies', image: 'assets/images/cinematic_bhujia.jpg', icon: 'fas fa-border-all' }, ...storeState.categories];
  container.innerHTML = cats.map(cat => {
    const isSel = storeState.selectedCategory === cat.id;
    const imgUrl = cat.image || (MIRA_DATA.categories.find(c => c.id === cat.id)?.image) || 'assets/images/cinematic_bhujia.jpg';

    return `
      <button onclick="filterCategory('${cat.id}')"
        class="flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
          isSel 
            ? 'bg-[#4A0713] text-[#FBBF24] shadow-lg border border-[#E59819] transform scale-105' 
            : 'bg-white text-gray-800 hover:bg-amber-50/80 border border-amber-200/80'
        }">
        <img src="${imgUrl}" alt="" class="w-5 h-5 rounded-full object-cover border border-amber-400/60" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');" />
        
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');
}

function renderStoreDietaryFilters() {
  const container = document.getElementById('dietary-container');
  if (!container) return;

  const filters = ['all', ...MIRA_DATA.dietaryTags];
  container.innerHTML = filters.map(tag => `
    <button onclick="filterDietary('${tag}')" 
      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
        storeState.selectedDietary === tag 
          ? 'bg-[#4A0713] text-white shadow-sm' 
          : 'bg-amber-100/50 text-[#4A0713] hover:bg-amber-100 border border-amber-300/60'
      }">
      ${tag === 'all' ? '✨ All Varieties' : tag}
    </button>
  `).join('');
}

function filterCategory(catId) {
  storeState.selectedCategory = catId;
  renderStoreCategories();
  renderStoreProducts();
}

function filterDietary(tag) {
  storeState.selectedDietary = tag;
  renderStoreDietaryFilters();
  renderStoreProducts();
}

function setupStoreSearch() {
  const searchInput = document.getElementById('store-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      storeState.searchQuery = e.target.value.toLowerCase().trim();
      renderStoreProducts();
    });
  }
}

/**
 * 3. PRODUCT CARDS WITH MEERAV PACKAGING PRESENTATION
 */
function renderStoreProducts() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  let filtered = storeState.products.filter(p => {
    const matchCat = storeState.selectedCategory === 'all' || p.category === storeState.selectedCategory;
    const matchDiet = storeState.selectedDietary === 'all' || p.dietary.some(d => d.toLowerCase().includes(storeState.selectedDietary.toLowerCase()));
    const matchSearch = !storeState.searchQuery || 
      p.name.toLowerCase().includes(storeState.searchQuery) ||
      p.description.toLowerCase().includes(storeState.searchQuery) ||
      p.dietary.some(d => d.toLowerCase().includes(storeState.searchQuery));
    return matchCat && matchDiet && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-20 h-20 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center text-[#4A0713] text-3xl">
          
        </div>
        <h3 class="text-xl font-bold text-gray-800">No Bikaneri Namkeens Found</h3>
        <p class="text-gray-500 text-xs mt-1">Try resetting filters to explore our complete collection.</p>
        <button onclick="filterCategory('all'); filterDietary('all');" class="mt-4 px-5 py-2.5 bg-[#4A0713] text-[#FBBF24] rounded-xl text-xs font-bold hover:bg-[#32040C] shadow-md transition">
          View All Namkeens
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const selectedIdx = storeState.selectedVariants[p.id] || 0;
    const selectedVar = p.variants[selectedIdx] || p.variants[0];
    const discount = Math.round(((selectedVar.originalPrice - selectedVar.price) / selectedVar.originalPrice) * 100);

    return `
      <div class="product-card overflow-hidden flex flex-col justify-between relative group">
        <!-- Packaging Visual Frame with Video Hover Preview -->
        <a href="product?id=${p.id}" class="product-pack-frame cursor-pointer block relative"
          onmouseenter="const v=this.querySelector('video'); if(v){v.currentTime=0; v.play().catch(()=>{});}"
          onmouseleave="const v=this.querySelector('video'); if(v){v.pause();}">
          
          <img src="${p.image}" alt="${p.name}" class="group-hover:scale-108 transition-transform duration-500" />
          
          ${p.video ? `
            <video class="card-video-preview" src="${p.video}" muted loop playsinline preload="none"></video>
            <div class="absolute bottom-3 right-3 z-20 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-full text-[#FBBF24] text-[10px] font-black flex items-center gap-1 border border-[#E59819]/50 shadow-md">
              
              <span>4K REEL</span>
            </div>
          ` : ''}

          <!-- Top Left Badges -->
          <div class="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#4A0713]/90 backdrop-blur-md text-[#FBBF24] border border-[#E59819]/60 shadow-md">
              ${p.tag}
            </span>
            <span class="px-2 py-1 rounded-full text-[10px] font-black bg-[#E59819] text-[#32040C] shadow-md">
              ${selectedVar.weight}
            </span>
          </div>

          <!-- Top Right Actions -->
          <div class="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <div class="veg-indicator bg-white/95 backdrop-blur-md shadow-md" title="100% Pure Vegetarian">
              <div class="veg-indicator-dot"></div>
            </div>

            <button onclick="event.preventDefault(); event.stopPropagation(); toggleWishlist('${p.id}');" 
              class="w-8 h-8 rounded-full bg-black/60 hover:bg-white text-white hover:text-red-600 backdrop-blur-md flex items-center justify-center shadow-md transition border border-white/20">
              
            </button>
          </div>

          <!-- Bottom Quality Banner -->
          <div class="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-[10px] text-[#FBBF24] font-bold bg-[#32040C]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#E59819]/40 shadow-md">
            <span> Pure Oil</span>
            <span class="text-emerald-400 font-black ml-1"> 100% Fresh</span>
          </div>
        </a>

        <!-- Product Card Content -->
        <div class="p-5 flex-1 flex flex-col justify-between bg-white">
          <div>
            <!-- Rating & Reviews -->
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-1 text-amber-600 text-xs font-extrabold">
                
                <span>${p.rating}</span>
                <span class="text-gray-400 font-medium text-[11px]">(${p.reviewsCount})</span>
              </div>
              <span class="text-[10px] font-extrabold text-[#78350F] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Bikaneri Recipe
              </span>
            </div>

            <!-- Product Title & Description -->
            <a href="product?id=${p.id}" class="font-black text-gray-900 text-base leading-snug mb-1 line-clamp-1 hover:text-[#4A0713] transition block">
              ${p.name}
            </a>
            <p class="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed font-medium">
              ${p.description}
            </p>

            <!-- Weight Variant Selector -->
            <div class="mb-3.5">
              <span class="text-[10px] font-extrabold text-gray-400 block mb-1.5 uppercase tracking-wider">Pack Weight:</span>
              <div class="flex flex-wrap gap-1.5">
                ${p.variants.map((v, idx) => `
                  <button onclick="setProductVariant('${p.id}', ${idx})" 
                    class="px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      idx === selectedIdx 
                        ? 'bg-[#4A0713] text-[#FBBF24] shadow-sm border border-[#E59819]' 
                        : 'bg-amber-50/80 text-gray-700 hover:bg-amber-100 border border-amber-200'
                    }">
                    ${v.weight}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Price & Actions -->
          <div class="pt-3 border-t border-amber-100">
            <div class="flex items-baseline justify-between mb-3">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-black text-[#4A0713]">${formatPrice(selectedVar.price)}</span>
                <span class="text-xs text-gray-400 line-through">${formatPrice(selectedVar.originalPrice)}</span>
                <span class="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">${discount}% OFF</span>
              </div>
              <a href="product?id=${p.id}" class="text-[11px] font-black text-[#4A0713] hover:underline flex items-center gap-0.5">
                <span>View Details</span> 
              </a>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <button onclick="addToCart('${p.id}', ${selectedIdx})" 
                class="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-[#4A0713] rounded-xl text-xs font-black transition border border-amber-300 flex items-center justify-center gap-1.5">
                
                <span>Add to Cart</span>
              </button>
              
              <button onclick="quickBuy('${p.id}', ${selectedIdx})" 
                class="w-full py-2.5 px-3 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] rounded-xl text-xs font-black transition border border-[#E59819] shadow-md flex items-center justify-center gap-1.5">
                
                <span>Express Buy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openProductDetailModal(productId) {
  const product = storeState.products.find(p => p.id === productId);
  if (!product) return;

  storeState.activeProductDetail = product;
  renderProductDetailModal(product);
  document.getElementById('product-detail-modal').classList.remove('hidden');
}

function closeProductDetailModal() {
  document.getElementById('product-detail-modal').classList.add('hidden');
  storeState.activeProductDetail = null;
}

function renderProductDetailModal(p) {
  const selectedIdx = storeState.selectedVariants[p.id] || 0;
  const selectedVar = p.variants[selectedIdx] || p.variants[0];

  document.getElementById('pdetail-image').src = p.image;
  document.getElementById('pdetail-tag').textContent = p.tag;
  document.getElementById('pdetail-name').textContent = p.name;
  document.getElementById('pdetail-rating').textContent = `${p.rating} (${p.reviewsCount} customer reviews)`;
  document.getElementById('pdetail-spice').textContent = p.spiceLevel;
  document.getElementById('pdetail-desc').textContent = p.description;
  document.getElementById('pdetail-ingredients').textContent = p.ingredients;
  document.getElementById('pdetail-price').textContent = formatPrice(selectedVar.price);
  document.getElementById('pdetail-original-price').textContent = formatPrice(selectedVar.originalPrice);

  document.getElementById('pdetail-energy').textContent = p.nutrition.energy;
  document.getElementById('pdetail-protein').textContent = p.nutrition.protein;
  document.getElementById('pdetail-fat').textContent = p.nutrition.fat;
  document.getElementById('pdetail-carbs').textContent = p.nutrition.carbs;

  const variantsContainer = document.getElementById('pdetail-variants');
  variantsContainer.innerHTML = p.variants.map((v, idx) => `
    <button onclick="setProductVariant('${p.id}', ${idx})" 
      class="px-4 py-2 rounded-xl text-xs font-black border transition ${
        idx === selectedIdx ? 'bg-[#4A0713] text-[#FBBF24] border-[#E59819] shadow-sm' : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-amber-50'
      }">
      ${v.weight} - ${formatPrice(v.price)}
    </button>
  `).join('');

  const btnCart = document.getElementById('pdetail-add-cart-btn');
  if (btnCart) {
    btnCart.onclick = () => {
      addToCart(p.id, selectedIdx);
      closeProductDetailModal();
    };
  }
}

/**
 * 4. CART & PROMO CODE CONTROLLER
 */
function addToCart(productId, variantIndex = 0) {
  const product = storeState.products.find(p => p.id === productId);
  if (!product) return;

  const variant = product.variants[variantIndex] || product.variants[0];
  const cartItemId = `${productId}-${variant.weight}`;

  const existingItem = storeState.cart.find(item => item.id === cartItemId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    storeState.cart.push({
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
  renderStoreCart();
  updateStoreBadgeCounts();
  openCartDrawer();
}

function quickBuy(productId, variantIndex = 0) {
  addToCart(productId, variantIndex);
  openCheckoutModal();
}

function updateCartQty(cartItemId, change) {
  const item = storeState.cart.find(i => i.id === cartItemId);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    storeState.cart = storeState.cart.filter(i => i.id !== cartItemId);
    showToast('Item removed from cart', 'info');
  }
  renderStoreCart();
  updateStoreBadgeCounts();
}

function removeFromCart(cartItemId) {
  storeState.cart = storeState.cart.filter(i => i.id !== cartItemId);
  renderStoreCart();
  updateStoreBadgeCounts();
  showToast('Item removed from cart', 'info');
}

function applyCoupon() {
  const input = document.getElementById('coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  if (!code) return;

  const found = (storeState.coupons || []).find(c => c.code === code && c.isActive);
  const subtotal = storeState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (found) {
    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      showToast(`Minimum order amount for ${code} is ${formatPrice(found.minOrderAmount)}`, 'error');
      return;
    }
    storeState.appliedCoupon = {
      code: found.code,
      discountPercent: found.discountType === 'percentage' ? found.discountVal : null,
      discountFlat: found.discountType === 'flat' ? found.discountVal : null
    };
    showToast(`Coupon ${code} applied! Saved discount 🎉`, 'success');
  } else if (code === 'MIRA10' || code === 'MEERAV10') {
    storeState.appliedCoupon = { code, discountPercent: 10 };
    showToast(`Coupon ${code} applied! 10% Discount saved 🎉`, 'success');
  } else if (code === 'FREESHIP') {
    storeState.appliedCoupon = { code: 'FREESHIP', freeShipping: true };
    showToast('Free shipping coupon applied! 🚚', 'success');
  } else {
    showToast('Invalid coupon code. Try "MEERAV10" or check active store promotions.', 'error');
    return;
  }
  renderStoreCart();
}

function calculateCartTotals() {
  const subtotal = storeState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const freeThreshold = (window.SITE_SETTINGS && window.SITE_SETTINGS.freeShippingThreshold) || 499;
  const flatFee = (window.SITE_SETTINGS && window.SITE_SETTINGS.shippingFlatFee) || 50;

  let discount = 0;
  let shipping = (subtotal >= freeThreshold || subtotal === 0) ? 0 : flatFee;

  if (storeState.appliedCoupon) {
    if (storeState.appliedCoupon.discountPercent) {
      discount = Math.round(subtotal * (storeState.appliedCoupon.discountPercent / 100));
    } else if (storeState.appliedCoupon.discountFlat) {
      discount = Math.min(subtotal, storeState.appliedCoupon.discountFlat);
    }
    if (storeState.appliedCoupon.freeShipping) {
      shipping = 0;
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + shipping);
  return { subtotal, discount, shipping, grandTotal, freeThreshold, flatFee };
}

function renderStoreCart() {
  const container = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  if (!container || !summaryContainer) return;

  if (storeState.cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-gray-500">
        <div class="w-16 h-16 mx-auto mb-3 bg-amber-50 rounded-full flex items-center justify-center text-[#4A0713] text-2xl">
          
        </div>
        <p class="font-black text-gray-800 text-base">Your Cart is Empty</p>
        <p class="text-xs text-gray-400 mt-1">Discover handcrafted authentic delicacies & savory treats!</p>
        <button onclick="closeCartDrawer()" class="mt-4 px-5 py-2.5 bg-[#4A0713] text-[#FBBF24] text-xs font-bold rounded-xl hover:bg-[#32040C] shadow-md">
          Start Shopping
        </button>
      </div>
    `;
    summaryContainer.classList.add('hidden');
    return;
  }

  summaryContainer.classList.remove('hidden');

  const { subtotal, discount, shipping, grandTotal, freeThreshold } = calculateCartTotals();
  const remainingForFree = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  // Free shipping banner / progress
  let shippingBannerHtml = '';
  if (remainingForFree > 0) {
    shippingBannerHtml = `
      <div class="mb-3 p-2.5 bg-amber-100/70 border border-amber-200 rounded-xl text-xs">
        <div class="flex justify-between items-center font-bold text-[#4A0713] mb-1">
          <span>🚚 Add <strong>${formatPrice(remainingForFree)}</strong> more for <strong>FREE Delivery!</strong></span>
          <span>${progressPercent}%</span>
        </div>
        <div class="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
          <div class="h-full bg-[#E59819] rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `;
  } else {
    shippingBannerHtml = `
      <div class="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-black flex items-center gap-2">
        
        <span>🎉 You have unlocked <strong>FREE Shipping!</strong></span>
      </div>
    `;
  }

  container.innerHTML = shippingBannerHtml + storeState.cart.map(item => `
    <div class="flex items-center gap-3 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70">
      <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-amber-200/60" />
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-xs text-gray-900 truncate">${item.name}</h4>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="text-[11px] font-black text-[#4A0713] bg-amber-100 px-2 py-0.2 rounded-md">${item.weight}</span>
          <span class="text-xs font-bold text-gray-900">${formatPrice(item.price)}</span>
        </div>
        
        <div class="flex items-center gap-2 mt-2">
          <div class="flex items-center border border-amber-200 bg-white rounded-lg overflow-hidden">
            <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-amber-100">
              
            </button>
            <span class="w-7 text-center text-xs font-black text-gray-800">${item.qty}</span>
            <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-amber-100">
              
            </button>
          </div>
          <span class="text-xs font-black text-[#4A0713] ml-auto">${formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
      <button onclick="removeFromCart('${item.id}')" class="text-gray-400 hover:text-red-500 p-1.5 transition">
        
      </button>
    </div>
  `).join('');

  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('cart-discount').textContent = discount > 0 ? `-${formatPrice(discount)}` : formatPrice(0);
  document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('cart-grandtotal').textContent = formatPrice(grandTotal);
}

/**
 * 4B. DYNAMIC TESTIMONIALS & REVIEWS RENDERER
 */
function renderStoreTestimonials() {
  const container = document.getElementById('home-testimonials-container');
  if (!container) return;

  const items = storeState.testimonials && storeState.testimonials.length
    ? storeState.testimonials.filter(t => t.isVisible !== false)
    : (MIRA_DATA.testimonials || []);

  if (!items.length) {
    container.innerHTML = `<p class="col-span-3 text-center text-gray-400 text-xs">Customer reviews loading...</p>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const stars = Array(Math.round(item.rating || 5)).fill('').join('');
    return `
      <div class="p-6 bg-white rounded-3xl border border-amber-200/80 shadow-md flex flex-col justify-between space-y-4 hover:-translate-y-1 transition duration-300">
        <div class="space-y-3">
          <div class="flex items-center gap-1 text-xs">${stars}</div>
          <p class="text-xs text-gray-700 leading-relaxed font-medium italic">"${item.reviewText}"</p>
        </div>
        <div class="flex items-center gap-3 pt-3 border-t border-amber-100">
          <img src="${item.avatar || 'assets/images/default_avatar.jpg'}" alt="${item.name}" class="w-10 h-10 rounded-full object-cover border border-amber-300" />
          <div>
            <h4 class="font-black text-xs text-gray-900">${item.name}</h4>
            <span class="text-[10px] text-gray-500 font-bold">${item.city || 'Verified Buyer'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 4C. DYNAMIC FAQ ACCORDION RENDERER
 */
function renderStoreFaqs() {
  const container = document.getElementById('home-faqs-container');
  if (!container) return;

  const items = storeState.faqs && storeState.faqs.length
    ? storeState.faqs.filter(f => f.isVisible !== false)
    : (MIRA_DATA.faqs || []);

  if (!items.length) {
    container.innerHTML = `<p class="text-center text-gray-400 text-xs">FAQs loading...</p>`;
    return;
  }

  container.innerHTML = items.map((item, idx) => `
    <div class="bg-white rounded-2xl border border-amber-200/80 shadow-xs overflow-hidden">
      <button onclick="toggleStoreFaq(${idx})" class="w-full p-4 text-left flex items-center justify-between gap-3 font-black text-xs sm:text-sm text-gray-900 hover:text-[#4A0713] transition">
        <span>${item.question}</span>
        
      </button>
      <div id="faq-content-${idx}" class="hidden px-4 pb-4 text-xs text-gray-600 leading-relaxed font-medium border-t border-amber-50 pt-3">
        ${item.answer}
      </div>
    </div>
  `).join('');
}

function toggleStoreFaq(idx) {
  const content = document.getElementById(`faq-content-${idx}`);
  const icon = document.getElementById(`faq-icon-${idx}`);
  if (!content) return;
  const isHidden = content.classList.contains('hidden');
  content.classList.toggle('hidden', !isHidden);
  if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
}

function updateStoreBadgeCounts() {
  const totalCount = storeState.cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-badge-count').forEach(badge => {
    badge.textContent = totalCount;
    badge.classList.toggle('hidden', totalCount === 0);
  });

  const wishlistCount = storeState.wishlist.length;
  document.querySelectorAll('.wishlist-badge-count').forEach(badge => {
    badge.textContent = wishlistCount;
    badge.classList.toggle('hidden', wishlistCount === 0);
  });
}

function toggleWishlist(productId) {
  const index = storeState.wishlist.indexOf(productId);
  if (index === -1) {
    storeState.wishlist.push(productId);
    showToast('Saved to your favorites! ❤️', 'success');
  } else {
    storeState.wishlist.splice(index, 1);
    showToast('Removed from favorites', 'info');
  }
  updateStoreBadgeCounts();
  renderStoreProducts();
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
 * 5. MULTI-STEP CHECKOUT & LEAFLET MAP PICKER
 */
function openCheckoutModal() {
  if (storeState.cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  closeCartDrawer();
  const { grandTotal } = calculateCartTotals();
  document.getElementById('checkout-grand-total').textContent = `₹${grandTotal}`;
  document.getElementById('checkout-items-count').textContent = `${storeState.cart.reduce((s, i) => s + i.qty, 0)} Items`;
  document.getElementById('checkout-modal').classList.remove('hidden');

  fillCheckoutFormIfLoggedIn();

  setTimeout(() => {
    initAddressPickerMap();
  }, 250);
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

  storeState.pendingCheckoutData = {
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
 * 6. PAYMENT GATEWAY SIMULATION
 */
function openPaymentGatewayModal(amount) {
  const modal = document.getElementById('payment-gateway-modal');
  if (!modal) return;

  document.getElementById('payment-amount-display').textContent = `₹${amount}`;
  modal.classList.remove('hidden');

  const s = window.SITE_SETTINGS || {};
  const defaultTab = s.paymentUpiEnabled !== false ? 'upi'
    : s.paymentCardEnabled !== false ? 'card'
    : s.paymentNetbankingEnabled !== false ? 'netbanking'
    : 'cod';
  selectPaymentTab(defaultTab);
}

function closePaymentGatewayModal() {
  document.getElementById('payment-gateway-modal').classList.add('hidden');
}

function selectPaymentTab(tabName) {
  document.querySelectorAll('.payment-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.payment-tab-btn').forEach(btn => {
    btn.classList.remove('bg-[#4A0713]', 'text-[#FBBF24]');
    btn.classList.add('bg-gray-100', 'text-gray-700');
  });

  const activeContent = document.getElementById(`payment-tab-${tabName}`);
  const activeBtn = document.getElementById(`payment-btn-${tabName}`);

  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.add('bg-[#4A0713]', 'text-[#FBBF24]');
    activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
  }
}

async function completeOrderWithPayment(paymentMethod) {
  if (!storeState.pendingCheckoutData) {
    showToast('Checkout session expired', 'error');
    return;
  }

  const data = storeState.pendingCheckoutData;
  const newOrderId = `MEERAV-${Math.floor(1000 + Math.random() * 9000)}`;
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
    items: storeState.cart.map(item => ({
      name: `${item.name} (${item.weight})`,
      qty: item.qty,
      price: item.price
    })),
    totalAmount: data.grandTotal,
    paymentMethod,
    paymentStatus: paymentMethod.includes('COD') ? 'Unpaid (COD)' : 'Paid',
    orderStatus: 'Dispatched',
    date: orderDate,
    trackingNumber,
    driver: {
      name: "Ramesh Bishnoi",
      phone: "+91 98700 11223",
      vehicle: "Meerav Express Van (RJ-07-EA-4921)",
      lat: MIRA_DATA.warehouseLocation.lat,
      lng: MIRA_DATA.warehouseLocation.lng,
      etaMinutes: 18
    },
    notifications: {
      whatsappSent: data.optWhatsApp,
      emailSent: data.optEmail
    }
  };

  storeState.orders.unshift(newOrder);
  await MiraDB.dbInsertOrder(newOrder);
  localStorage.setItem('mira_last_order_id', newOrderId);

  // Auto-link customer session if not logged in
  if (!authState.customer) {
    const autoUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      pincode: data.pincode,
      lat: data.lat,
      lng: data.lng
    };
    authState.customer = autoUser;
    updateCustomerHeaderBadge();
    MiraDB.dbUpsertCustomer(autoUser);
  }

  MiraDB.dbInsertNotification({
    id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
    type: 'WhatsApp',
    recipient: `${newOrder.customer.phone} (${newOrder.customer.name})`,
    template: `New Order Placed #${newOrder.id}`,
    time: 'Just now',
    status: 'Delivered & Read',
    statusColor: 'green'
  });

  storeState.cart = [];
  storeState.appliedCoupon = null;
  storeState.activeTrackingOrder = newOrder;

  renderStoreCart();
  updateStoreBadgeCounts();

  closePaymentGatewayModal();
  showToast('Payment Verified! Order Dispatched from Bikaner Hub 🎉', 'success');

  openOrderTrackingView(newOrderId);
}

/**
 * 7. LIVE TRACKING VIEW
 */
function openOrderTrackingView(orderId) {
  const order = storeState.orders.find(o => o.id === orderId) || storeState.orders[0];
  if (!order) {
    showToast('No orders found to track', 'info');
    return;
  }

  storeState.activeTrackingOrder = order;

  document.getElementById('storefront-main-content').classList.add('hidden');
  document.getElementById('live-tracking-view').classList.remove('hidden');

  document.getElementById('track-order-id').textContent = `#${order.id}`;
  document.getElementById('track-order-amount').textContent = `₹${order.totalAmount}`;
  document.getElementById('track-customer-name').textContent = order.customer.name;
  document.getElementById('track-customer-address').textContent = order.customer.address;
  document.getElementById('track-courier-awb').textContent = order.trackingNumber;

  initLiveOrderTrackingMap(order);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function returnToStorefront() {
  document.getElementById('storefront-main-content').classList.remove('hidden');
  document.getElementById('live-tracking-view').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 8. NOTIFICATION MODAL PREVIEWS
 */
function previewWhatsAppNotification(orderId) {
  const order = storeState.orders.find(o => o.id === orderId) || storeState.orders[0];
  if (!order) return;

  const itemsList = order.items.map(i => `• ${i.name} x${i.qty} (₹${i.price * i.qty})`).join('\n');
  const messageBody = `*Namaste ${order.customer.name}!* 🙏\n\nThank you for choosing *MEERAV Namkeens* (An Authentic Bikaneri Taste)! 🍿✨\n\n📦 *Order ID:* #${order.id}\n💰 *Amount:* ₹${order.totalAmount} (${order.paymentStatus})\n📍 *Delivery Address:* ${order.customer.address}\n\n*Items Ordered:*\n${itemsList}\n\n🚚 *Status:* ${order.orderStatus}\n🗺️ *Live GPS Tracking:* https://meerav.com/track/${order.id}\n\nPrepared fresh in pure & clean oil with authentic royal recipes.`;

  document.getElementById('wa-preview-name').textContent = order.customer.name;
  document.getElementById('wa-preview-body').innerHTML = messageBody.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  document.getElementById('wa-preview-time').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  document.getElementById('whatsapp-preview-modal').classList.remove('hidden');
}

function closeWhatsAppPreviewModal() {
  document.getElementById('whatsapp-preview-modal').classList.add('hidden');
}

function previewEmailNotification(orderId) {
  const order = storeState.orders.find(o => o.id === orderId) || storeState.orders[0];
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

/**
 * 7. CINEMATIC BRAND FILM MODAL & PLAYBACK CONTROLLER
 */
function openBrandFilmModal() {
  const modal = document.getElementById('brand-film-modal');
  const video = document.getElementById('modal-brand-video');
  if (modal) modal.classList.remove('hidden');
  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }
}

function closeBrandFilmModal() {
  const modal = document.getElementById('brand-film-modal');
  const video = document.getElementById('modal-brand-video');
  if (video) video.pause();
  if (modal) modal.classList.add('hidden');
}

function toggleVideoMute() {
  const video = document.getElementById('hero-cinematic-video');
  const btn = document.getElementById('video-mute-btn');
  if (!video || !btn) return;
  
  video.muted = !video.muted;
  if (video.muted) {
    btn.innerHTML = '';
    btn.classList.remove('bg-[#E59819]', 'text-[#32040C]');
    btn.classList.add('bg-black/70', 'text-[#FBBF24]');
  } else {
    btn.innerHTML = '';
    btn.classList.remove('bg-black/70', 'text-[#FBBF24]');
    btn.classList.add('bg-[#E59819]', 'text-[#32040C]');
  }
}
