/**
 * MEERAV NAMKEENS - DEDICATED PRODUCT DETAIL PAGE CONTROLLER
 * Full Media Carousel (Right/Left Scroll, Touch Swipe, Dedicated 4K Product Video / Sample Photo, Fullscreen Lightbox & Mobile Sticky Bar)
 */

const pdpState = {
  currentProduct: null,
  selectedVariantIdx: 0,
  quantity: 1,
  currentSlide: 0,
  media: [], // [{type:'image'|'video', url}] — the product's full photo/video gallery, built fresh per product
  totalSlides: 1,
  isMuted: false
};

/** Combines a product's photos[]/videos[] galleries into one ordered slide list (photos first, cover photo leads). */
function buildPDPMediaList(p) {
  const photos = (p.photos && p.photos.length ? p.photos : (p.image ? [p.image] : []));
  const videos = (p.videos && p.videos.length ? p.videos : (p.video ? [p.video] : []));
  const media = [
    ...photos.map(url => ({ type: 'image', url })),
    ...videos.map(url => ({ type: 'video', url }))
  ];
  return media.length ? media : [{ type: 'image', url: p.image || 'assets/images/pack_bikaneri_bhujia.svg' }];
}

document.addEventListener('DOMContentLoaded', () => {
  initProductDetailPage();
  setupTouchGestures();
  setupKeyboardNavigation();
});

async function initProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'p1';

  let allProducts = await fetchProducts();
  if (!allProducts.length) allProducts = MIRA_DATA.products;
  const product = allProducts.find(p => p.id === productId) || allProducts[0];

  if (!product) {
    window.location.href = 'index';
    return;
  }

  if (typeof storeState !== 'undefined') {
    storeState.products = allProducts;
    allProducts.forEach(p => {
      if (storeState.selectedVariants[p.id] === undefined) storeState.selectedVariants[p.id] = 0;
    });
  }

  pdpState.currentProduct = product;
  pdpState.selectedVariantIdx = 0;
  pdpState.quantity = 1;
  pdpState.currentSlide = 0;

  document.title = `${product.name} - MEERAV Authentic Bikaneri Namkeens`;

  renderPDPDetails();
  renderPDPRelatedProducts(allProducts);

  MiraDB.subscribeTable('products', (payload) => {
    if (payload.eventType === 'DELETE' || payload.new.id !== productId) return;
    pdpState.currentProduct = MiraDB.mappers.dbProductToApp(payload.new);
    renderPDPDetails();
  });
}

function renderPDPDetails() {
  const p = pdpState.currentProduct;
  const selectedVar = p.variants[pdpState.selectedVariantIdx] || p.variants[0];
  const discount = Math.round(((selectedVar.originalPrice - selectedVar.price) / selectedVar.originalPrice) * 100);

  // Breadcrumbs & Title
  const breadcrumbCatEl = document.getElementById('breadcrumb-category');
  breadcrumbCatEl.textContent = p.category.replace('-', ' & ');
  breadcrumbCatEl.href = `category?cat=${p.category}`;
  document.getElementById('breadcrumb-product-name').textContent = p.name;

  const viewAllEl = document.getElementById('pdp-related-view-all');
  if (viewAllEl) viewAllEl.href = `category?cat=${p.category}`;
  document.getElementById('pdp-title').textContent = p.name;
  document.getElementById('pdp-description').textContent = p.description;
  document.getElementById('pdp-tag-badge').textContent = p.tag;
  document.getElementById('pdp-active-weight-pill').textContent = selectedVar.weight;

  // Media Gallery — rebuild the slider fresh for this product's full photo/video set
  pdpState.media = buildPDPMediaList(p);
  pdpState.totalSlides = pdpState.media.length;
  renderPDPMediaSlider();
  setPDPSlide(0);

  // Spice Profile & Rating
  document.getElementById('pdp-spice-profile').textContent = p.spiceLevel;
  document.getElementById('pdp-rating').textContent = p.rating;
  document.getElementById('pdp-reviews-count').textContent = `(${p.reviewsCount} Verified Bikaneri Foodie Reviews)`;

  // Pricing & Discounts
  const currentTotal = selectedVar.price * pdpState.quantity;
  const originalTotal = selectedVar.originalPrice * pdpState.quantity;
  document.getElementById('pdp-price').textContent = formatPrice(currentTotal);
  document.getElementById('pdp-orig-price').textContent = formatPrice(originalTotal);
  document.getElementById('pdp-discount-badge').textContent = `${discount}% OFF`;
  document.getElementById('pdp-qty-display').textContent = pdpState.quantity;

  // Mobile Sticky Bar Sync
  const mobilePrice = document.getElementById('mobile-sticky-price');
  const mobileWeight = document.getElementById('mobile-sticky-weight');
  if (mobilePrice) mobilePrice.textContent = formatPrice(currentTotal);
  if (mobileWeight) mobileWeight.textContent = `${selectedVar.weight} • 100% Fresh`;

  // Variant Pills
  const variantsContainer = document.getElementById('pdp-variants-container');
  variantsContainer.innerHTML = p.variants.map((v, idx) => `
    <button onclick="selectPDPVariant(${idx})" 
      class="p-3 rounded-2xl text-xs font-black border-2 transition text-center ${
        idx === pdpState.selectedVariantIdx 
          ? 'bg-[#4A0713] text-[#FBBF24] border-[#E59819] shadow-md transform scale-102' 
          : 'bg-white text-gray-800 border-amber-200 hover:bg-amber-50'
      }">
      <span class="block text-sm mb-0.5">${v.weight}</span>
      <span class="text-[11px] ${idx === pdpState.selectedVariantIdx ? 'text-amber-200' : 'text-[#4A0713]'} font-black">${formatPrice(v.price)}</span>
    </button>
  `).join('');

  // Tab Contents
  document.getElementById('pdp-ingredients-text').textContent = p.ingredients;
  document.getElementById('pdp-energy').textContent = p.nutrition.energy;
  document.getElementById('pdp-protein').textContent = p.nutrition.protein;
  document.getElementById('pdp-fat').textContent = p.nutrition.fat;
  document.getElementById('pdp-carbs').textContent = p.nutrition.carbs;
}

/**
 * MEDIA SLIDER CONTROLLERS (Right/Left Scroll) — dynamic gallery, any number of photos/videos
 */
function renderPDPMediaSlider() {
  const wrapper = document.getElementById('pdp-slides-wrapper');
  const thumbsRow = document.getElementById('pdp-thumbnails-row');
  if (!wrapper || !thumbsRow) return;

  wrapper.innerHTML = pdpState.media.map((m, idx) => m.type === 'video' ? `
    <div class="w-full h-full shrink-0 relative flex items-center justify-center bg-black">
      <video id="pdp-slide-video-${idx}" src="${m.url}" loop muted playsinline class="w-full h-full object-cover"></video>
      <div class="absolute bottom-12 right-4 z-20 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-[#FBBF24] text-xs font-black flex items-center gap-1.5 border border-[#E59819]">
        <i class="fas fa-play text-[10px] text-red-500 animate-pulse"></i>
        <span>4K TASTE FILM</span>
      </div>
    </div>
  ` : `
    <div class="w-full h-full shrink-0 relative flex items-center justify-center bg-[#1F0307]">
      <img src="${m.url}" alt="Product Photo" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
    </div>
  `).join('');

  thumbsRow.innerHTML = pdpState.media.map((m, idx) => `
    <button onclick="setPDPSlide(${idx})" id="pdp-thumb-${idx}"
      class="w-16 h-16 rounded-2xl border-2 overflow-hidden shrink-0 shadow-md transition transform active:scale-95 bg-black relative flex items-center justify-center">
      <img src="${m.type === 'video' ? m.url : m.url}" alt="Thumbnail" class="w-full h-full object-cover" ${m.type === 'video' ? 'style="opacity:.85"' : ''} />
      ${m.type === 'video' ? '<div class="absolute inset-0 bg-black/30 flex items-center justify-center"><i class="fas fa-play text-[#FBBF24] text-xs"></i></div>' : ''}
    </button>
  `).join('');
}

function setPDPSlide(slideIndex) {
  pdpState.currentSlide = slideIndex;
  const wrapper = document.getElementById('pdp-slides-wrapper');
  if (wrapper) {
    wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
  }

  const media = pdpState.media[slideIndex];

  // Update slide counter
  const counter = document.getElementById('pdp-slide-counter');
  if (counter && media) {
    counter.textContent = `${media.type === 'video' ? '4K Video' : 'Photo'} (${slideIndex + 1} of ${pdpState.totalSlides})`;
  }

  // Update thumbnail active states
  pdpState.media.forEach((m, idx) => {
    const thumb = document.getElementById(`pdp-thumb-${idx}`);
    if (!thumb) return;
    thumb.className = `w-16 h-16 rounded-2xl border-2 overflow-hidden shrink-0 shadow-md transition transform active:scale-95 bg-black relative flex items-center justify-center ${
      idx === slideIndex ? 'border-[#E59819] ring-2 ring-[#E59819]/50 opacity-100' : 'border-amber-300/60 opacity-60'
    }`;
  });

  // Play the active slide's video (if any), pause all others
  pdpState.media.forEach((m, idx) => {
    if (m.type !== 'video') return;
    const vid = document.getElementById(`pdp-slide-video-${idx}`);
    if (!vid) return;
    if (idx === slideIndex) vid.play().catch(() => {});
    else vid.pause();
  });
}

function nextPDPSlide() {
  const nextIdx = (pdpState.currentSlide + 1) % pdpState.totalSlides;
  setPDPSlide(nextIdx);
}

function prevPDPSlide() {
  const prevIdx = (pdpState.currentSlide - 1 + pdpState.totalSlides) % pdpState.totalSlides;
  setPDPSlide(prevIdx);
}

function handleMainMediaClick() {
  openFullscreenMedia();
}

/**
 * FULLSCREEN LIGHTBOX VIEWER
 */
function openFullscreenMedia() {
  const modal = document.getElementById('pdp-fullscreen-modal');
  if (!modal) return;

  const p = pdpState.currentProduct;
  document.getElementById('fs-modal-title').textContent = p.name;
  document.getElementById('fs-modal-subtitle').textContent = `Heritage Recipe • ${p.spiceLevel}`;

  modal.classList.remove('hidden');
  syncFullscreenMedia();
}

function closeFullscreenMedia() {
  const modal = document.getElementById('pdp-fullscreen-modal');
  if (modal) modal.classList.add('hidden');

  const fsVideo = document.getElementById('fs-display-video');
  if (fsVideo) fsVideo.pause();
}

function syncFullscreenMedia() {
  const media = pdpState.media[pdpState.currentSlide];
  const fsImg = document.getElementById('fs-display-image');
  const fsVideo = document.getElementById('fs-display-video');
  const muteBtn = document.getElementById('fs-mute-btn');
  if (!media) return;

  if (media.type === 'video') {
    if (fsImg) fsImg.classList.add('hidden');
    if (fsVideo) {
      fsVideo.src = media.url;
      fsVideo.classList.remove('hidden');
      fsVideo.muted = pdpState.isMuted;
      fsVideo.play().catch(() => {});
    }
    if (muteBtn) muteBtn.classList.remove('hidden');
  } else {
    if (fsVideo) {
      fsVideo.pause();
      fsVideo.classList.add('hidden');
    }
    if (fsImg) {
      fsImg.src = media.url;
      fsImg.classList.remove('hidden');
    }
    if (muteBtn) muteBtn.classList.add('hidden');
  }
}

function toggleFSMute() {
  const fsVideo = document.getElementById('fs-display-video');
  const muteIcon = document.getElementById('fs-mute-icon');
  if (!fsVideo) return;

  pdpState.isMuted = !pdpState.isMuted;
  fsVideo.muted = pdpState.isMuted;

  if (muteIcon) {
    muteIcon.className = pdpState.isMuted ? 'fas fa-volume-mute text-red-400' : 'fas fa-volume-up text-amber-300';
  }
}

/**
 * TOUCH SWIPE GESTURES FOR MOBILE
 */
let touchStartX = 0;
let touchEndX = 0;

function setupTouchGestures() {
  const sliderBox = document.getElementById('pdp-slider-box');
  if (!sliderBox) return;

  sliderBox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderBox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
  }, { passive: true });
}

function handleGesture() {
  const threshold = 40; // minimum swipe distance
  if (touchEndX < touchStartX - threshold) {
    nextPDPSlide();
  }
  if (touchEndX > touchStartX + threshold) {
    prevPDPSlide();
  }
}

function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextPDPSlide();
      const fsModal = document.getElementById('pdp-fullscreen-modal');
      if (fsModal && !fsModal.classList.contains('hidden')) syncFullscreenMedia();
    } else if (e.key === 'ArrowLeft') {
      prevPDPSlide();
      const fsModal = document.getElementById('pdp-fullscreen-modal');
      if (fsModal && !fsModal.classList.contains('hidden')) syncFullscreenMedia();
    } else if (e.key === 'Escape') {
      closeFullscreenMedia();
    }
  });
}

function selectPDPVariant(idx) {
  pdpState.selectedVariantIdx = idx;
  const selectedVar = pdpState.currentProduct.variants[idx];

  renderPDPDetails();
  showToast(`Selected pack size: ${selectedVar.weight} (₹${selectedVar.price})`, 'info');
}

function changePDPQty(delta) {
  pdpState.quantity = Math.max(1, pdpState.quantity + delta);
  renderPDPDetails();
}

function addCurrentProductToCart() {
  const p = pdpState.currentProduct;
  const variant = p.variants[pdpState.selectedVariantIdx] || p.variants[0];
  const cartItemId = `${p.id}-${variant.weight}`;

  const existingItem = storeState.cart.find(item => item.id === cartItemId);
  if (existingItem) {
    existingItem.qty += pdpState.quantity;
  } else {
    storeState.cart.push({
      id: cartItemId,
      productId: p.id,
      name: p.name,
      image: p.image,
      weight: variant.weight,
      price: variant.price,
      originalPrice: variant.originalPrice,
      qty: pdpState.quantity
    });
  }

  showToast(`Added ${pdpState.quantity}x ${p.name} (${variant.weight}) to Cart!`, 'success');
  renderStoreCart();
  updateStoreBadgeCounts();
  openCartDrawer();
}

function addCurrentPDPToCart() {
  addCurrentProductToCart();
}

function quickBuyCurrentPDP() {
  addCurrentProductToCart();
  closeCartDrawer();
  openCheckoutModal();
}

function buyNowCurrentProduct() {
  quickBuyCurrentPDP();
}

function switchPDPTab(tabName) {
  document.querySelectorAll('.pdp-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.pdp-tab-btn').forEach(btn => {
    btn.classList.remove('bg-[#4A0713]', 'text-[#FBBF24]', 'border-[#E59819]');
    btn.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
  });

  const targetContent = document.getElementById(`tab-content-${tabName}`);
  const targetBtn = document.getElementById(`tab-btn-${tabName}`);

  if (targetContent) targetContent.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('bg-[#4A0713]', 'text-[#FBBF24]', 'border-[#E59819]');
    targetBtn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
  }
}

function togglePDPWishlist() {
  const p = pdpState.currentProduct;
  if (!p) return;

  const icon = document.getElementById('pdp-wishlist-icon');
  const index = storeState.wishlist.indexOf(p.id);

  if (index === -1) {
    storeState.wishlist.push(p.id);
    if (icon) icon.className = 'fas fa-heart text-red-600 text-sm';
    showToast('Saved to your favorites!', 'success');
  } else {
    storeState.wishlist.splice(index, 1);
    if (icon) icon.className = 'far fa-heart text-sm';
    showToast('Removed from favorites', 'info');
  }
  updateStoreBadgeCounts();
}

function renderPDPRelatedProducts(allProducts) {
  const container = document.getElementById('pdp-related-grid');
  if (!container) return;

  // Same category as the product being viewed, pulled live from the DB-backed product list.
  let related = allProducts.filter(item => item.id !== pdpState.currentProduct.id && item.category === pdpState.currentProduct.category);
  if (related.length < 4) {
    // Not enough in this category — top up with other products rather than showing a sparse row.
    const fillers = allProducts.filter(item => item.id !== pdpState.currentProduct.id && item.category !== pdpState.currentProduct.category);
    related = related.concat(fillers.slice(0, 4 - related.length));
  }
  related = related.slice(0, 4);

  container.innerHTML = related.map(p => {
    const v = p.variants[0];

    return `
      <div class="product-card overflow-hidden flex flex-col justify-between relative group">
        <a href="product?id=${p.id}" class="product-pack-frame cursor-pointer block">
          <img src="${p.image}" alt="${p.name}" class="group-hover:scale-108 transition-transform duration-500" />
          <div class="absolute top-3 left-3 flex items-center gap-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#4A0713] text-[#FBBF24] border border-[#E59819]">
              ${p.tag}
            </span>
          </div>
          <div class="absolute top-3 right-3">
            <div class="veg-indicator bg-white shadow-sm"><div class="veg-indicator-dot"></div></div>
          </div>
        </a>

        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <a href="product?id=${p.id}" class="font-black text-gray-900 text-sm hover:text-[#4A0713] transition line-clamp-1 block mb-1">
              ${p.name}
            </a>
            <div class="text-[11px] text-gray-500 line-clamp-1 mb-2 font-medium">${p.description}</div>
          </div>

          <div class="pt-2 border-t border-amber-100 flex items-center justify-between">
            <div>
              <span class="text-base font-black text-[#4A0713]">₹${v.price}</span>
              <span class="text-[10px] text-gray-400 line-through ml-1">₹${v.originalPrice}</span>
            </div>
            <a href="product?id=${p.id}" class="px-3 py-1.5 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] rounded-xl text-xs font-black transition border border-[#E59819]">
              View Details &rarr;
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
