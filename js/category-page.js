/**
 * MEERAV NAMKEENS - DEDICATED CATEGORY & PRODUCTS PAGE CONTROLLER
 * Handles URL ?cat= parameter, Category Switch Tabs, Dietary Filters, Search & Product Rendering
 */

const categoryPageState = {
  // null = nothing picked yet — only the category cards show, no products.
  selectedCategory: null,
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
  const rawCat = urlParams.get('cat');
  // A direct link to a specific category (e.g. the homepage's "Festive
  // Hampers" shortcut) already counts as picking one — go straight to its
  // products. Arriving with no ?cat= (or ?cat=all, which no longer has a
  // card) leaves nothing picked, so only the category cards show.
  categoryPageState.selectedCategory = (rawCat && rawCat !== 'all') ? normalizeCategoryId(rawCat) : null;

  // 1. Instant Synchronous Load from MIRA_DATA / LocalStorage (0 ms delay)
  categoryPageState.categories = [...MIRA_DATA.categories];
  categoryPageState.products = JSON.parse(localStorage.getItem('mira_products_db')) || [...MIRA_DATA.products];

  // Keep storeState in sync
  if (typeof storeState !== 'undefined') {
    storeState.categories = categoryPageState.categories;
    storeState.products = categoryPageState.products;
    categoryPageState.products.forEach(p => {
      if (storeState.selectedVariants[p.id] === undefined) storeState.selectedVariants[p.id] = 0;
    });
  }

  renderCategoryHeader();
  renderCategoryPickerCards();
  renderCategoryDietaryFilters();
  renderCategoryProducts();

  // 2. Asynchronous Cloud Sync from Supabase — this is the real source of
  // truth (a newly admin-added category/product only exists here); the
  // static MIRA_DATA above is only an instant-paint placeholder until this lands.
  try {
    const [cloudCats, cloudProds] = await Promise.all([
      fetchCategories(),
      fetchProducts()
    ]);

    if (cloudCats && cloudCats.length > 0) categoryPageState.categories = cloudCats;
    if (cloudProds && cloudProds.length > 0) categoryPageState.products = cloudProds;

    if (typeof storeState !== 'undefined') {
      storeState.categories = categoryPageState.categories;
      storeState.products = categoryPageState.products;
    }

    renderCategoryHeader();
    renderCategoryPickerCards();
    renderCategoryProducts();
  } catch (err) {
    console.warn('Category cloud sync fallback to local data:', err.message);
  }

  // 3. Stay live — reflect admin catalog changes without a reload.
  setupCategoryPageRealtime();
}

function setupCategoryPageRealtime() {
  MiraDB.subscribeTable('categories', async () => {
    categoryPageState.categories = await fetchCategories();
    if (typeof storeState !== 'undefined') storeState.categories = categoryPageState.categories;
    renderCategoryHeader();
    renderCategoryPickerCards();
  });

  MiraDB.subscribeTable('products', (payload) => {
    if (payload.eventType === 'DELETE') {
      categoryPageState.products = categoryPageState.products.filter(p => p.id !== payload.old.id);
    } else {
      const updated = MiraDB.mappers.dbProductToApp(payload.new);
      const idx = categoryPageState.products.findIndex(p => p.id === updated.id);
      if (idx === -1) categoryPageState.products.unshift(updated); else categoryPageState.products[idx] = updated;
    }
    if (typeof storeState !== 'undefined') storeState.products = categoryPageState.products;
    renderCategoryPickerCards();
    renderCategoryProducts();
  });
}

function renderCategoryHeader() {
  const titleEl = document.getElementById('current-category-title');
  const descEl = document.getElementById('current-category-desc');
  const breadcrumbEl = document.getElementById('current-category-breadcrumb');

  if (categoryPageState.selectedCategory === null) {
    if (titleEl) titleEl.textContent = 'Choose a Category';
    if (descEl) descEl.textContent = 'Pick one of our authentic Bikaneri categories below to see its handcrafted snacks.';
    if (breadcrumbEl) breadcrumbEl.textContent = 'Categories';
    document.title = 'Bikaneri Namkeens & Snacks - MEERAV';
    return;
  }

  if (categoryPageState.selectedCategory === 'wishlist') {
    if (titleEl) titleEl.textContent = 'Your Wishlist';
    if (descEl) descEl.textContent = 'Snacks you have saved for later — add them to your cart whenever you are ready.';
    if (breadcrumbEl) breadcrumbEl.textContent = 'Wishlist';
    document.title = 'Your Wishlist - MEERAV';
    return;
  }

  const normCat = normalizeCategoryId(categoryPageState.selectedCategory);
  const cat = categoryPageState.categories.find(c => c.id === normCat || c.id === categoryPageState.selectedCategory);

  if (!cat) {
    if (titleEl) titleEl.textContent = 'All Authentic Bikaneri Delicacies';
    if (descEl) descEl.textContent = 'Explore our complete heritage collection of crispy Bhujia, Sev, Mathri, and Royal Gift Hampers.';
    if (breadcrumbEl) breadcrumbEl.textContent = 'All Categories';
    document.title = 'All Bikaneri Namkeens & Snacks - MEERAV';
  } else {
    if (titleEl) titleEl.textContent = cat.name;
    if (descEl) descEl.textContent = cat.description || 'Authentic Bikaneri recipe prepared in 100% pure & clean cold-pressed oil with zero palm oil.';
    if (breadcrumbEl) breadcrumbEl.textContent = cat.name;
    document.title = `${cat.name} - MEERAV Bikaneri Namkeens`;

    if (typeof meeravApplySeo === 'function') {
      meeravApplySeo({
        title: `${cat.name} - MEERAV Bikaneri Namkeens`,
        description: cat.description || `Shop authentic Bikaneri ${cat.name} from MEERAV — handcrafted in pure groundnut oil with zero palm oil.`,
        image: cat.image
      });
      meeravAddBreadcrumbSchema([
        { name: 'Home', path: 'index' },
        { name: 'Categories', path: 'category' },
        { name: cat.name, path: `category?cat=${cat.id}` }
      ]);
    }
  }
}

// Real showcase photo + fallback, matching the homepage's category cards
// exactly — the only way to switch categories on this page (no pill tabs).
const CATEGORY_PICKER_DEFAULTS = {
  'bhujia-sev': { image: 'assets/images/cinematic_bhujia.jpg', icon: 'fas fa-fire' },
  'mixture-farsan': { image: 'assets/images/cinematic_mixture.jpg', icon: 'fas fa-bowl-rice' },
  'mathri': { image: 'assets/images/cinematic_papad.jpg', icon: 'fas fa-sun' },
  'papad-mathri': { image: 'assets/images/cinematic_papad.jpg', icon: 'fas fa-sun' },
  'roasted-diet': { image: 'assets/images/cinematic_moong_dal.jpg', icon: 'fas fa-seedling' },
  'healthy-roasted': { image: 'assets/images/cinematic_moong_dal.jpg', icon: 'fas fa-seedling' },
  'sweets-combos': { image: 'assets/images/commercial_scene_4.jpg', icon: 'fas fa-gift' }
};

function renderCategoryPickerCards() {
  const container = document.getElementById('category-picker-cards-grid');
  if (!container) return;

  const validCategories = categoryPageState.categories.filter(c => c.id !== 'all');
  const currentNorm = normalizeCategoryId(categoryPageState.selectedCategory);

  const cardHtml = (id, image, name, count, isActive) => `
    <button type="button" onclick="selectCategory('${id}')"
      class="p-4 sm:p-6 bg-white rounded-3xl border-2 hover:shadow-2xl transition-all cursor-pointer text-center group transform hover:-translate-y-2 active:scale-98 ${
        isActive ? 'border-[#E59819] shadow-xl' : 'border-amber-200/80 hover:border-[#E59819]'
      }">
      <div class="w-18 h-18 sm:w-22 sm:h-22 mx-auto mb-3 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#520914] shadow-lg group-hover:scale-110 transition-all duration-500 border-2 border-[#E59819]/40">
        <img src="${image}" alt="${name}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500" />
      </div>
      <h4 class="font-black text-xs sm:text-sm text-gray-900 group-hover:text-[#4A0713] mb-1 leading-snug">${name}</h4>
      <span class="text-[10px] sm:text-[11px] text-amber-800 font-extrabold block mb-2">${count} Varieties</span>
      <span class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-[#4A0713] group-hover:underline">
        Explore &rarr;
      </span>
    </button>
  `;

  const cards = [
    ...validCategories.map(cat => {
      const normId = normalizeCategoryId(cat.id);
      const count = categoryPageState.products.filter(p => p.category === normId || p.category === cat.id).length;
      const isActive = currentNorm === normId || currentNorm === cat.id;
      const fallback = CATEGORY_PICKER_DEFAULTS[cat.id] || { image: 'assets/images/cinematic_bhujia.jpg' };
      const image = cat.image || fallback.image;
      return cardHtml(cat.id, image, cat.name, count, isActive);
    })
  ];

  container.innerHTML = cards.join('');
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
      ${tag === 'all' ? 'All Dietary Tags' : tag}
    </button>
  `).join('');
}

function selectCategory(catId) {
  categoryPageState.selectedCategory = normalizeCategoryId(catId);

  // Update URL state without page reload
  const newUrl = `category?cat=${categoryPageState.selectedCategory}`;
  window.history.pushState({ path: newUrl }, '', newUrl);

  renderCategoryHeader();
  renderCategoryPickerCards();
  renderCategoryProducts();
}

/** Takes the user back from a category's product list to the plain category picker. */
function clearCategorySelection() {
  categoryPageState.selectedCategory = null;
  window.history.pushState({ path: 'category' }, '', 'category');
  renderCategoryHeader();
  renderCategoryPickerCards();
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
  const dietaryContainer = document.getElementById('category-dietary-container');
  const pickerSection = document.getElementById('category-picker-section');
  const backRow = document.getElementById('category-back-row');

  if (!grid) return;

  const isPicked = categoryPageState.selectedCategory !== null;
  if (pickerSection) pickerSection.classList.toggle('hidden', isPicked);
  if (backRow) backRow.classList.toggle('hidden', !isPicked);
  if (backRow) backRow.classList.toggle('flex', isPicked);

  if (!isPicked) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.add('hidden');
    if (dietaryContainer) dietaryContainer.classList.add('hidden');
    if (countBadge) countBadge.textContent = '';
    return;
  }
  if (dietaryContainer) dietaryContainer.classList.remove('hidden');

  // Filter products by category, dietary, and search query
  let filtered = categoryPageState.products;
  const currentNorm = normalizeCategoryId(categoryPageState.selectedCategory);
  const isWishlistView = categoryPageState.selectedCategory === 'wishlist';

  if (isWishlistView) {
    const wishlistIds = (typeof storeState !== 'undefined' && storeState.wishlist) || [];
    filtered = filtered.filter(p => wishlistIds.includes(p.id));
  } else {
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
    if (emptyState) {
      emptyState.classList.remove('hidden');
      const icon = document.getElementById('category-empty-icon');
      const title = document.getElementById('category-empty-title');
      const desc = document.getElementById('category-empty-desc');
      const cta = document.getElementById('category-empty-cta');
      if (isWishlistView) {
        if (icon) icon.className = 'far fa-heart text-2xl';
        if (title) title.textContent = 'Your Wishlist is Empty';
        if (desc) desc.textContent = 'Tap the heart icon on any snack to save it here for later.';
        if (cta) { cta.textContent = 'Browse All Products'; cta.setAttribute('onclick', "selectCategory('all')"); }
      } else if (categoryPageState.searchQuery) {
        if (icon) icon.className = 'fas fa-magnifying-glass text-2xl';
        if (title) title.textContent = 'No Snacks Match Your Search';
        if (desc) desc.textContent = 'Try a different keyword, or clear the search to see everything.';
        if (cta) { cta.textContent = 'Clear Search'; cta.setAttribute('onclick', "handleCategorySearch(''); document.getElementById('category-page-search') && (document.getElementById('category-page-search').value='');"); }
      } else {
        if (icon) icon.className = 'fas fa-magnifying-glass text-2xl';
        if (title) title.textContent = 'No Bikaneri Snacks Found Matching Your Filter';
        if (desc) desc.textContent = 'Try choosing a different category or clearing your search term.';
        if (cta) { cta.textContent = 'View All Signature Snacks'; cta.setAttribute('onclick', "selectCategory('all')"); }
      }
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const selectedVariantsMap = (typeof storeState !== 'undefined' && storeState.selectedVariants) || {};
  const wishlist = (typeof storeState !== 'undefined' && storeState.wishlist) || [];

  grid.innerHTML = filtered.map(p => meeravProductCard(p)).join('');
}

function setCategoryProductVariant(productId, variantIdx) {
  if (typeof storeState !== 'undefined') {
    storeState.selectedVariants[productId] = variantIdx;
  }
  renderCategoryProducts();
}
