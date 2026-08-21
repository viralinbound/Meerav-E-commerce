/**
 * MEERAV NAMKEENS - DEDICATED PRODUCT DETAIL PAGE CONTROLLER
 * Handles URL Parameters, Live Variant Switching, Express Buy Now, Tab Switching & Related Snacks
 */

const pdpState = {
  currentProduct: null,
  selectedVariantIdx: 0,
  quantity: 1
};

document.addEventListener('DOMContentLoaded', () => {
  initProductDetailPage();
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

  // Pouch Visual Frame
  document.getElementById('pdp-pack-image').src = p.image;
  document.getElementById('pdp-pack-image').alt = p.name;

  // Spice Profile & Rating
  document.getElementById('pdp-spice-profile').textContent = p.spiceLevel;
  document.getElementById('pdp-rating').textContent = p.rating;
  document.getElementById('pdp-reviews-count').textContent = `(${p.reviewsCount} Verified Bikaneri Foodie Reviews)`;

  // Pricing & Discounts
  document.getElementById('pdp-price').textContent = `₹${selectedVar.price * pdpState.quantity}`;
  document.getElementById('pdp-orig-price').textContent = `₹${selectedVar.originalPrice * pdpState.quantity}`;
  document.getElementById('pdp-discount-badge').textContent = `${discount}% OFF`;
  document.getElementById('pdp-qty-display').textContent = pdpState.quantity;

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

function selectPDPVariant(idx) {
  pdpState.selectedVariantIdx = idx;
  const selectedVar = pdpState.currentProduct.variants[idx];

  // Visual Image Animation Feedback
  const img = document.getElementById('pdp-pack-image');
  if (img) {
    img.style.transform = 'scale(1.08)';
    setTimeout(() => { img.style.transform = 'scale(1)'; }, 280);
  }

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

function buyNowCurrentProduct() {
  addCurrentProductToCart();
  closeCartDrawer();
  openCheckoutModal();
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
    const discount = Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100);

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
