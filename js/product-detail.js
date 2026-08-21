/**
 * MEERAV NAMKEENS - DEDICATED PRODUCT DETAIL PAGE CONTROLLER
 * Full Media Carousel (Right/Left Scroll, Touch Swipe, Dedicated 4K Product Video, Fullscreen Lightbox & Mobile Sticky Bar)
 */

const pdpState = {
  currentProduct: null,
  selectedVariantIdx: 0,
  quantity: 1,
  currentSlide: 0,
  totalSlides: 2,
  isMuted: false
};

document.addEventListener('DOMContentLoaded', () => {
  initProductDetailPage();
  setupTouchGestures();
  setupKeyboardNavigation();
});

function initProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'p1';

  const allProducts = JSON.parse(localStorage.getItem('mira_products_db')) || MIRA_DATA.products;
  const product = allProducts.find(p => p.id === productId) || allProducts[0];

  if (!product) {
    window.location.href = 'index.html';
    return;
  }

  pdpState.currentProduct = product;
  pdpState.selectedVariantIdx = 0;
  pdpState.quantity = 1;
  pdpState.currentSlide = 0;

  document.title = `${product.name} - MEERAV Authentic Bikaneri Namkeens`;

  renderPDPDetails();
  renderPDPRelatedProducts(allProducts);
}

function renderPDPDetails() {
  const p = pdpState.currentProduct;
  const selectedVar = p.variants[pdpState.selectedVariantIdx] || p.variants[0];
  const discount = Math.round(((selectedVar.originalPrice - selectedVar.price) / selectedVar.originalPrice) * 100);

  // Breadcrumbs & Title
  document.getElementById('breadcrumb-category').textContent = p.category.replace('-', ' & ');
  document.getElementById('breadcrumb-product-name').textContent = p.name;
  document.getElementById('pdp-title').textContent = p.name;
  document.getElementById('pdp-description').textContent = p.description;
  document.getElementById('pdp-tag-badge').textContent = p.tag;
  document.getElementById('pdp-active-weight-pill').textContent = selectedVar.weight;

  // Media Slider Assets
  const packImg = document.getElementById('pdp-pack-image');
  if (packImg) packImg.src = p.image;

  const thumbImg0 = document.getElementById('pdp-thumb-img-0');
  if (thumbImg0) thumbImg0.src = p.image;

  const thumbImg1 = document.getElementById('pdp-thumb-img-1');
  if (thumbImg1) thumbImg1.src = p.image;

  const videoElem = document.getElementById('pdp-slide-video');
  if (videoElem) {
    const videoSrc = p.video || 'assets/videos/meerav_brand_film.mp4';
    videoElem.src = videoSrc;
    videoElem.load();
    videoElem.play().catch(() => {});
  }

  // Reset to first slide
  setPDPSlide(0);

  // Spice Profile & Rating
  document.getElementById('pdp-spice-profile').textContent = p.spiceLevel;
  document.getElementById('pdp-rating').textContent = p.rating;
  document.getElementById('pdp-reviews-count').textContent = `(${p.reviewsCount} Verified Bikaneri Foodie Reviews)`;

  // Pricing & Discounts
  const currentTotal = selectedVar.price * pdpState.quantity;
  const originalTotal = selectedVar.originalPrice * pdpState.quantity;
  document.getElementById('pdp-price').textContent = `₹${currentTotal}`;
  document.getElementById('pdp-orig-price').textContent = `₹${originalTotal}`;
  document.getElementById('pdp-discount-badge').textContent = `${discount}% OFF`;
  document.getElementById('pdp-qty-display').textContent = pdpState.quantity;

  // Mobile Sticky Bar Sync
  const mobilePrice = document.getElementById('mobile-sticky-price');
  const mobileWeight = document.getElementById('mobile-sticky-weight');
  if (mobilePrice) mobilePrice.textContent = `₹${currentTotal}`;
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
      <span class="text-[11px] ${idx === pdpState.selectedVariantIdx ? 'text-amber-200' : 'text-[#4A0713]'} font-black">₹${v.price}</span>
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
 * MEDIA SLIDER CONTROLLERS (Right/Left Scroll)
 */
function setPDPSlide(slideIndex) {
  pdpState.currentSlide = slideIndex;
  const wrapper = document.getElementById('pdp-slides-wrapper');
  if (wrapper) {
    wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
  }

  // Update slide counter
  const counter = document.getElementById('pdp-slide-counter');
  if (counter) {
    counter.textContent = slideIndex === 0 ? 'Photo (1 of 2)' : '4K Video (2 of 2)';
  }

  // Update thumbnail active states
  const thumb0 = document.getElementById('pdp-thumb-0');
  const thumb1 = document.getElementById('pdp-thumb-1');
  if (thumb0 && thumb1) {
    if (slideIndex === 0) {
      thumb0.className = 'w-16 h-16 rounded-2xl border-2 border-[#E59819] overflow-hidden shrink-0 shadow-md transition transform active:scale-95 bg-[#1F0307] ring-2 ring-[#E59819]/50';
      thumb1.className = 'w-16 h-16 rounded-2xl border-2 border-amber-300/60 opacity-60 overflow-hidden shrink-0 shadow-md transition transform active:scale-95 bg-black relative flex items-center justify-center';
    } else {
      thumb1.className = 'w-16 h-16 rounded-2xl border-2 border-[#E59819] opacity-100 overflow-hidden shrink-0 shadow-md transition transform active:scale-95 bg-black relative flex items-center justify-center ring-2 ring-[#E59819]/50';
      thumb0.className = 'w-16 h-16 rounded-2xl border-2 border-amber-300/60 opacity-60 overflow-hidden shrink-0 shadow-md transition transform active:scale-95 bg-[#1F0307]';
    }
  }

  // Video playback handling
  const slideVideo = document.getElementById('pdp-slide-video');
  if (slideVideo) {
    if (slideIndex === 1) {
      slideVideo.play().catch(() => {});
    }
  }
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
  const p = pdpState.currentProduct;
  const fsImg = document.getElementById('fs-display-image');
  const fsVideo = document.getElementById('fs-display-video');
  const muteBtn = document.getElementById('fs-mute-btn');

  if (pdpState.currentSlide === 0) {
    // Show Photo
    if (fsVideo) {
      fsVideo.pause();
      fsVideo.classList.add('hidden');
    }
    if (fsImg) {
      fsImg.src = p.image;
      fsImg.classList.remove('hidden');
    }
    if (muteBtn) muteBtn.classList.add('hidden');
  } else {
    // Show Video
    if (fsImg) fsImg.classList.add('hidden');
    if (fsVideo) {
      fsVideo.src = p.video || 'assets/videos/meerav_brand_film.mp4';
      fsVideo.classList.remove('hidden');
      fsVideo.muted = pdpState.isMuted;
      fsVideo.play().catch(() => {});
    }
    if (muteBtn) muteBtn.classList.remove('hidden');
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
    // Swiped Left -> Next Slide
    nextPDPSlide();
  }
  if (touchEndX > touchStartX + threshold) {
    // Swiped Right -> Prev Slide
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

  showToast(`Added ${pdpState.quantity}x ${p.name} (${variant.weight}) to Cart! 🍿`, 'success');
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
    showToast('Saved to your favorites! ❤️', 'success');
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

  const related = allProducts.filter(item => item.id !== pdpState.currentProduct.id).slice(0, 4);

  container.innerHTML = related.map(p => {
    const v = p.variants[0];

    return `
      <div class="product-card overflow-hidden flex flex-col justify-between relative group">
        <a href="product.html?id=${p.id}" class="product-pack-frame cursor-pointer block">
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
            <a href="product.html?id=${p.id}" class="font-black text-gray-900 text-sm hover:text-[#4A0713] transition line-clamp-1 block mb-1">
              ${p.name}
            </a>
            <div class="text-[11px] text-gray-500 line-clamp-1 mb-2 font-medium">${p.description}</div>
          </div>

          <div class="pt-2 border-t border-amber-100 flex items-center justify-between">
            <div>
              <span class="text-base font-black text-[#4A0713]">₹${v.price}</span>
              <span class="text-[10px] text-gray-400 line-through ml-1">₹${v.originalPrice}</span>
            </div>
            <a href="product.html?id=${p.id}" class="px-3 py-1.5 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] rounded-xl text-xs font-black transition border border-[#E59819]">
              View Details &rarr;
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
