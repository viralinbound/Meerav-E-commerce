/**
 * MEERAV NAMKEENS - DEDICATED CATEGORY & PRODUCTS PAGE CONTROLLER
 * Handles URL ?cat= parameter, Category Switch Tabs, Dietary Filters, Search & Product Rendering
 */

const categoryPageState = {
  selectedCategory: 'all',
  selectedDietary: 'all',
  searchQuery: '',
  categories: [],
  products: []
};

function normalizeCategoryId(catId) {
  if (!catId || catId === 'all') return 'all';
  if (catId === 'papad-mathri') return 'mathri';
  if (catId === 'healthy-roasted') return 'roasted-diet';
  return catId;
}

document.addEventListener('DOMContentLoaded', () => {
  initCategoryPage();
});

async function initCategoryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawCat = urlParams.get('cat') || 'all';
  const initialCat = normalizeCategoryId(rawCat);

  categoryPageState.selectedCategory = initialCat;

  const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
  categoryPageState.categories = cats.length ? cats : [...MIRA_DATA.categories];
  categoryPageState.products = prods.length ? prods : [...MIRA_DATA.products];

  // Keep storeState (cart/wishlist controller in store.js) in sync too
  if (typeof storeState !== 'undefined') {
    storeState.categories = categoryPageState.categories;
    storeState.products = categoryPageState.products;
    categoryPageState.products.forEach(p => {
      if (storeState.selectedVariants[p.id] === undefined) storeState.selectedVariants[p.id] = 0;
    });
  }

  renderCategoryHeader();
  renderCategoryTabs();
  renderCategoryDietaryFilters();
  renderCategoryProducts();

  MiraDB.subscribeTable('products', (payload) => {
    if (payload.eventType === 'DELETE') {
      categoryPageState.products = categoryPageState.products.filter(p => p.id !== payload.old.id);
    } else {
      const updated = MiraDB.mappers.dbProductToApp(payload.new);
      const idx = categoryPageState.products.findIndex(p => p.id === updated.id);
      if (idx === -1) categoryPageState.products.unshift(updated); else categoryPageState.products[idx] = updated;
    }
    renderCategoryTabs();
    renderCategoryProducts();
  });
}

function renderCategoryHeader() {
  const normCat = normalizeCategoryId(categoryPageState.selectedCategory);
  const cat = categoryPageState.categories.find(c => c.id === normCat || c.id === categoryPageState.selectedCategory);

  const titleEl = document.getElementById('current-category-title');
  const descEl = document.getElementById('current-category-desc');
  const breadcrumbEl = document.getElementById('current-category-breadcrumb');

  if (normCat === 'all' || !cat) {
    if (titleEl) titleEl.textContent = 'All Authentic Bikaneri Delicacies';
    if (descEl) descEl.textContent = 'Explore our complete heritage collection of crispy Bhujia, Sev, Mathri, and Royal Gift Hampers.';
    if (breadcrumbEl) breadcrumbEl.textContent = 'All Categories';
    document.title = 'All Bikaneri Namkeens & Snacks - MEERAV';
  } else {
    if (titleEl) titleEl.textContent = cat.name;
    if (descEl) descEl.textContent = cat.description || 'Authentic Bikaneri recipe prepared in 100% pure & clean cold-pressed oil with zero palm oil.';
    if (breadcrumbEl) breadcrumbEl.textContent = cat.name;
    document.title = `${cat.name} - MEERAV Bikaneri Namkeens`;
  }
}

function renderCategoryTabs() {
  const container = document.getElementById('category-tabs-container');
  if (!container) return;

  const validCategories = categoryPageState.categories.filter(c => c.id !== 'all');
  const currentNorm = normalizeCategoryId(categoryPageState.selectedCategory);

  const tabsHtml = [
    `
      <button onclick="selectCategory('all')" 
        class="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 ${
          currentNorm === 'all' 
            ? 'bg-[#4A0713] text-[#FBBF24] shadow-md border border-[#E59819] transform scale-102' 
            : 'bg-white text-gray-800 hover:bg-amber-50 border border-amber-200'
        }">
        <i class="fas fa-border-all text-[#E59819]"></i>
        <span>✨ All Delicacies (${categoryPageState.products.length})</span>
      </button>
    `,
    ...validCategories.map(cat => {
      const normId = normalizeCategoryId(cat.id);
      const count = categoryPageState.products.filter(p => p.category === normId || p.category === cat.id).length;
      const isActive = currentNorm === normId || currentNorm === cat.id;

      return `
        <button onclick="selectCategory('${cat.id}')" 
          class="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 ${
            isActive 
              ? 'bg-[#4A0713] text-[#FBBF24] shadow-md border border-[#E59819] transform scale-102' 
              : 'bg-white text-gray-800 hover:bg-amber-50 border border-amber-200'
          }">
          <i class="${cat.icon || 'fas fa-cookie'} text-[#E59819]"></i>
          <span>${cat.name} (${count})</span>
        </button>
      `;
    })
  ].join('');

  container.innerHTML = tabsHtml;
}

function renderCategoryDietaryFilters() {
  const container = document.getElementById('category-dietary-container');
  if (!container) return;

  const filters = ['all', ...(MIRA_DATA.dietaryTags || [])];
  container.innerHTML = filters.map(tag => `
    <button onclick="selectDietaryFilter('${tag}')" 
      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
        categoryPageState.selectedDietary === tag 
          ? 'bg-[#4A0713] text-[#FBBF24] shadow-xs' 
          : 'bg-amber-100/50 text-[#4A0713] hover:bg-amber-100 border border-amber-300/60'
      }">
      ${tag === 'all' ? '🌱 All Dietary Tags' : tag}
    </button>
  `).join('');
}

function selectCategory(catId) {
  categoryPageState.selectedCategory = normalizeCategoryId(catId);
  
  // Update URL state without page reload
  const newUrl = categoryPageState.selectedCategory === 'all' ? 'category.html?cat=all' : `category.html?cat=${categoryPageState.selectedCategory}`;
  window.history.pushState({ path: newUrl }, '', newUrl);

  renderCategoryHeader();
  renderCategoryTabs();
  renderCategoryProducts();
}

function selectDietaryFilter(tag) {
  categoryPageState.selectedDietary = tag;
  renderCategoryDietaryFilters();
  renderCategoryProducts();
}

function handleCategorySearch(query) {
  categoryPageState.searchQuery = query.toLowerCase().trim();
  renderCategoryProducts();
}

function renderCategoryProducts() {
  const grid = document.getElementById('category-products-grid');
  const emptyState = document.getElementById('category-empty-state');
  const countBadge = document.getElementById('category-items-count');

  if (!grid) return;

  // Filter products by category, dietary, and search query
  let filtered = categoryPageState.products;
  const currentNorm = normalizeCategoryId(categoryPageState.selectedCategory);

  if (currentNorm !== 'all') {
    filtered = filtered.filter(p => p.category === currentNorm || p.category === categoryPageState.selectedCategory);
  }

  if (categoryPageState.selectedDietary !== 'all') {
    filtered = filtered.filter(p => p.dietary && p.dietary.includes(categoryPageState.selectedDietary));
  }

  if (categoryPageState.searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(categoryPageState.searchQuery) ||
      p.description.toLowerCase().includes(categoryPageState.searchQuery) ||
      (p.ingredients && p.ingredients.toLowerCase().includes(categoryPageState.searchQuery))
    );
  }

  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} Items`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const selectedVariantsMap = (typeof storeState !== 'undefined' && storeState.selectedVariants) || {};
  const wishlist = (typeof storeState !== 'undefined' && storeState.wishlist) || [];

  grid.innerHTML = filtered.map(p => {
    const selectedIdx = selectedVariantsMap[p.id] || 0;
    const selectedVar = p.variants[selectedIdx] || p.variants[0];
    const discount = Math.round(((selectedVar.originalPrice - selectedVar.price) / selectedVar.originalPrice) * 100);
    const isWishlisted = wishlist.includes(p.id);

    return `
      <div class="product-card overflow-hidden flex flex-col justify-between relative group">
        <!-- Packaging Visual Frame with Video Hover Preview -->
        <a href="product.html?id=${p.id}" class="product-pack-frame cursor-pointer block relative" 
          onmouseenter="const v=this.querySelector('video'); if(v){v.currentTime=0; v.play().catch(()=>{});}"
          onmouseleave="const v=this.querySelector('video'); if(v){v.pause();}">
          
          <img src="${p.image}" alt="${p.name}" class="group-hover:scale-108 transition-transform duration-500" />
          
          ${p.video ? `
            <video class="card-video-preview" src="${p.video}" muted loop playsinline preload="none"></video>
            <div class="absolute bottom-3 right-3 z-20 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-full text-[#FBBF24] text-[10px] font-black flex items-center gap-1 border border-[#E59819]/50 shadow-md">
              <i class="fas fa-play text-[8px] animate-pulse"></i>
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
              <i class="${isWishlisted ? 'fas fa-heart text-red-500' : 'far fa-heart'} text-xs"></i>
            </button>
          </div>

          <!-- Bottom Quality Banner -->
          <div class="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-[10px] text-[#FBBF24] font-bold bg-[#32040C]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#E59819]/40 shadow-md">
            <span><i class="fas fa-droplet text-[#E59819] mr-0.5"></i> Pure Oil</span>
            <span class="text-emerald-400 font-black ml-1"><i class="fas fa-check-circle text-[9px]"></i> 100% Fresh</span>
          </div>
        </a>

        <!-- Product Card Content -->
        <div class="p-5 flex-1 flex flex-col justify-between bg-white">
          <div>
            <!-- Rating & Reviews -->
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-1 text-amber-600 text-xs font-extrabold">
                <i class="fas fa-star text-amber-500 text-xs"></i>
                <span>${p.rating}</span>
                <span class="text-gray-400 font-medium text-[11px]">(${p.reviewsCount})</span>
              </div>
              <span class="text-[10px] font-extrabold text-[#78350F] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Bikaneri Recipe
              </span>
            </div>

            <!-- Product Title & Description -->
            <a href="product.html?id=${p.id}" class="font-black text-gray-900 text-base leading-snug mb-1 line-clamp-1 hover:text-[#4A0713] transition block">
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
                  <button onclick="setCategoryProductVariant('${p.id}', ${idx})" 
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
                <span class="text-2xl font-black text-[#4A0713]">₹${selectedVar.price}</span>
                <span class="text-xs text-gray-400 line-through">₹${selectedVar.originalPrice}</span>
                <span class="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">${discount}% OFF</span>
              </div>
              <a href="product.html?id=${p.id}" class="text-[11px] font-black text-[#4A0713] hover:underline flex items-center gap-0.5">
                <span>View Details</span> <i class="fas fa-arrow-right text-[9px]"></i>
              </a>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <button onclick="addToCart('${p.id}', ${selectedIdx})" 
                class="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-[#4A0713] rounded-xl text-xs font-black transition border border-amber-300 flex items-center justify-center gap-1.5">
                <i class="fas fa-shopping-bag text-xs"></i>
                <span>Add to Cart</span>
              </button>
              
              <button onclick="quickBuy('${p.id}', ${selectedIdx})" 
                class="w-full py-2.5 px-3 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] rounded-xl text-xs font-black transition border border-[#E59819] shadow-md flex items-center justify-center gap-1.5">
                <i class="fas fa-bolt text-xs text-[#E59819]"></i>
                <span>Express Buy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setCategoryProductVariant(productId, variantIdx) {
  if (typeof storeState !== 'undefined') {
    storeState.selectedVariants[productId] = variantIdx;
  }
  renderCategoryProducts();
}
