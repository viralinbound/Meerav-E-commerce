/**
 * MIRA NAMKEENS - SEPARATED AUTHENTICATION & CUSTOMER PROFILE/ORDER HISTORY
 * Dedicated Customer Authentication, Saved Profile, Addresses & Order History
 */

const authState = {
  customer: null,
  authView: 'signup', // 'signup' | 'signin' — first-time visitors land on Sign Up
  isAdminAuthenticated: sessionStorage.getItem('mira_admin_session') === 'true'
};

/**
 * Real auto-login: Supabase Auth persists the session in the browser, so on
 * every page load we just ask it "is anyone still signed in?" — if yes, the
 * customer is logged back in instantly with no form to fill out.
 */
(async function initCustomerAuth() {
  if (typeof MiraDB === 'undefined') return;

  const session = await MiraDB.getCurrentSession();
  if (session) {
    authState.customer = await MiraDB.getOrCreateCustomerProfile(session.user);
    updateCustomerHeaderBadge();
    fillCheckoutFormIfLoggedIn();
  }

  MiraDB.onAuthChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      authState.customer = await MiraDB.getOrCreateCustomerProfile(session.user);
      updateCustomerHeaderBadge();
    } else if (event === 'SIGNED_OUT') {
      authState.customer = null;
      updateCustomerHeaderBadge();
    }
  });
})();

// Global Toast Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

  toast.className = `toast flex items-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-semibold ${bgColor} shadow-lg`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Customer Auth Controllers
function openCustomerAuthModal() {
  const modal = document.getElementById('customer-auth-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderCustomerAuthUI();
}

function closeCustomerAuthModal() {
  const modal = document.getElementById('customer-auth-modal');
  if (modal) modal.classList.add('hidden');
}

function renderCustomerAuthUI() {
  const container = document.getElementById('customer-auth-content');
  if (!container) return;

  const defaultAvatar = 'assets/images/default_avatar.jpg';

  if (authState.customer) {
    const avatarSrc = authState.customer.avatar || defaultAvatar;

    // Get customer's orders from live app state
    const allOrders = (typeof storeState !== 'undefined' && storeState.orders) || [];
    const customerOrders = allOrders.filter(o => 
      (o.customer && o.customer.name && o.customer.name.toLowerCase() === authState.customer.name.toLowerCase()) ||
      (o.customer && o.customer.phone && o.customer.phone.includes(authState.customer.phone.replace(/\D/g, '').slice(-10)))
    );

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Customer Profile Card with Avatar & Upload -->
        <div class="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-2xl border border-amber-200">
          <div class="relative group">
            <img src="${avatarSrc}" alt="${authState.customer.name}" 
              class="w-14 h-14 rounded-2xl object-cover border-2 border-[#E59819] shadow-md" />
            <label class="absolute -bottom-1 -right-1 w-6 h-6 bg-[#4A0713] text-[#FBBF24] hover:bg-[#32040C] rounded-full flex items-center justify-center cursor-pointer shadow-md border border-white text-[10px]" title="Change Photo">
              
              <input type="file" accept="image/*" onchange="handleUserAvatarUpload(event)" class="hidden" />
            </label>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-black text-gray-900 truncate">${authState.customer.name}</h3>
            <p class="text-xs text-gray-500 truncate">${authState.customer.phone} &bull; ${authState.customer.email || 'customer@meerav.com'}</p>
            <label class="inline-flex items-center gap-1 text-[10px] font-black text-[#4A0713] hover:underline cursor-pointer mt-0.5">
Upload New Photo
              <input type="file" accept="image/*" onchange="handleUserAvatarUpload(event)" class="hidden" />
            </label>
          </div>
          <button onclick="logoutCustomer()" title="Logout" class="p-2 text-gray-400 hover:text-red-600 transition">
            
          </button>
        </div>

        <!-- Saved Address Box -->
        <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
          <div class="font-bold text-gray-800 flex items-center gap-1.5">
Saved Delivery Address:
          </div>
          <p class="text-gray-600 text-[11px] leading-relaxed">${authState.customer.address} (PIN: ${authState.customer.pincode})</p>
        </div>

        <!-- AI Taste Profile & Personalization Memory Box -->
        <div class="p-3.5 bg-gradient-to-r from-[#4A0713]/5 via-amber-50 to-amber-100/40 rounded-2xl border border-[#E59819]/50 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <div class="font-black text-[#4A0713] flex items-center gap-1.5 text-xs">
               AI Taste Profile & Preferences
            </div>
            <button onclick="closeCustomerAuthModal(); toggleChatbot(true);" class="text-[10px] font-black text-[#4A0713] hover:underline flex items-center gap-0.5">
              <span>Ask Sommelier</span> &rarr;
            </button>
          </div>

          <div class="flex flex-wrap gap-1.5 text-[10px]">
            <span class="px-2 py-0.5 bg-[#4A0713] text-[#FBBF24] rounded-lg font-black border border-[#E59819]">
 ${getUserPersonalization().preferredSpice || 'Classic Bikaneri'}
            </span>
            ${getUserPersonalization().favoriteCategories.map(cat => `
              <span class="px-2 py-0.5 bg-white text-gray-800 rounded-lg font-bold border border-amber-200 shadow-2xs">
 ${cat.replace('-', ' & ')}
              </span>
            `).join('')}
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-lg font-bold">
 ${getUserPersonalization().chatOrderCount || 0} Chat Orders
            </span>
          </div>
        </div>

        <!-- Customer Order History -->
        <div class="space-y-2 pt-2 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <h4 class="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              ⏱ My Order History (${customerOrders.length})
            </h4>
            <span class="text-[10px] text-gray-400 font-medium">Real-time status</span>
          </div>

          <div class="max-h-56 overflow-y-auto space-y-2 pr-1">
            ${customerOrders.length > 0 ? customerOrders.map(order => `
              <div class="p-3 bg-white rounded-xl border border-gray-200/80 shadow-xs space-y-1.5 text-xs hover:border-amber-300 transition">
                <div class="flex items-center justify-between">
                  <span class="font-black text-amber-950 text-xs">#${order.id}</span>
                  <span class="px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                    order.orderStatus === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }">${order.orderStatus}</span>
                </div>

                <div class="text-[11px] text-gray-600 line-clamp-1">
                  ${order.items ? order.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Assorted Namkeens'}
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-gray-100 text-[11px]">
                  <span class="font-black text-gray-900">₹${order.totalAmount} &bull; ${order.paymentMethod}</span>
                  <div class="flex items-center gap-1.5">
                    <button onclick="closeCustomerAuthModal(); openOrderTrackingView('${order.id}');" class="px-2 py-1 bg-amber-50 text-amber-900 font-bold rounded-lg hover:bg-amber-100 transition text-[10px] flex items-center gap-1 border border-amber-200">
Track Map
                    </button>
                    <button onclick="closeCustomerAuthModal(); openOrderHelpBot('${order.id}');" class="px-2 py-1 bg-[#4A0713] text-[#FBBF24] font-black rounded-lg hover:bg-[#32040C] transition text-[10px] flex items-center gap-1 shadow-2xs border border-[#E59819]" title="Ask Order Help Bot">
                       Help Bot
                    </button>
                  </div>
                </div>
              </div>
            `).join('') : `
              <div class="py-6 text-center text-gray-400 text-xs">

                No previous orders yet. Add your favorite crispy namkeens to cart!
              </div>
            `}
          </div>
        </div>

        <!-- Write a Review — always uses this account's real name & photo, never editable here -->
        <div class="space-y-2 pt-2 border-t border-gray-100">
          <h4 class="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
${authState.myReviewId ? 'Your Review' : 'Write a Review'}
          </h4>
          <form onsubmit="submitCustomerReview(event)" class="p-3 bg-white rounded-xl border border-gray-200/80 space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <img src="${avatarSrc}" class="w-7 h-7 rounded-full object-cover border border-amber-300" />
              <span class="font-bold text-gray-800">${authState.customer.name}</span>
            </div>
            <div id="review-star-picker" class="flex items-center gap-1 text-lg text-amber-400">
              ${[1,2,3,4,5].map(n => ``).join('')}
            </div>
            <input type="hidden" id="review-rating-input" value="5" />
            <textarea id="review-text-input" rows="2" required placeholder="Tell other customers what you thought..."
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"></textarea>
            <button type="submit" class="w-full py-2 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5">
Submit Review
            </button>
          </form>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 border-t border-gray-100 flex gap-2">
          <button onclick="logoutCustomer()" class="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition">
            Logout
          </button>
          <button onclick="closeCustomerAuthModal()" class="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold shadow-md transition">
            Continue Shopping
          </button>
        </div>
      </div>
    `;
    renderExistingCustomerReview();
  } else {
    const isSignup = authState.authView !== 'signin';

    container.innerHTML = `
      <div class="space-y-4">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-[#E59819] shadow-md bg-amber-100 relative group">
            <img id="login-preview-avatar" src="${defaultAvatar}" alt="Human Profile" class="w-full h-full object-cover" />
            <label class="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex flex-col items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition cursor-pointer">
               Photo
              <input type="file" accept="image/*" onchange="handlePreviewAvatar(event)" class="hidden" />
            </label>
          </div>
          <h3 class="text-xl font-black text-amber-950">Customer Account</h3>
          <p class="text-xs text-gray-500 mt-0.5">Create an account once — you'll stay signed in automatically next time</p>
        </div>

        <!-- Sign Up / Sign In Tabs -->
        <div class="grid grid-cols-2 gap-1.5 p-1 bg-amber-50 rounded-2xl border border-amber-200">
          <button type="button" onclick="switchCustomerAuthView('signup')" class="py-2 rounded-xl text-xs font-black transition ${isSignup ? 'bg-[#4A0713] text-[#FBBF24] shadow-sm' : 'text-amber-900 hover:bg-amber-100'}">
            Create Account
          </button>
          <button type="button" onclick="switchCustomerAuthView('signin')" class="py-2 rounded-xl text-xs font-black transition ${!isSignup ? 'bg-[#4A0713] text-[#FBBF24] shadow-sm' : 'text-amber-900 hover:bg-amber-100'}">
            Sign In
          </button>
        </div>

        ${isSignup ? `
        <form onsubmit="handleCustomerSignUp(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-gray-600 font-semibold mb-1">Full Name</label>
            <input type="text" id="cust-signup-name" required placeholder="e.g. Rajesh Kothari"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-gray-600 font-semibold mb-1">Email Address</label>
            <input type="email" id="cust-signup-email" required placeholder="you@example.com"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-gray-600 font-semibold mb-1">Password</label>
            <input type="password" id="cust-signup-password" required minlength="6" placeholder="Minimum 6 characters"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-gray-600 font-semibold mb-1">WhatsApp / Phone Number</label>
            <input type="tel" id="cust-signup-phone" required placeholder="+91 98765 00000"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-gray-600 font-semibold mb-1">Delivery Address</label>
            <input type="text" id="cust-signup-address" required placeholder="Flat/House, Society, City"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-gray-600 font-semibold mb-1">Pincode</label>
              <input type="text" id="cust-signup-pincode" required placeholder="e.g. 400050"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-gray-600 font-semibold mb-1">Photo Upload</label>
              <label class="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-300 rounded-xl text-center block cursor-pointer truncate">
                 <span id="photo-upload-label">Choose Photo</span>
                <input type="file" id="cust-login-photo" accept="image/*" onchange="handlePreviewAvatar(event)" class="hidden" />
              </label>
            </div>
          </div>
          <button type="submit" class="w-full py-3 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] font-black text-xs rounded-xl shadow-md transition border border-[#E59819]">
            Create Account & Sign In →
          </button>
        </form>
        ` : `
        <form onsubmit="handleCustomerSignIn(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-gray-600 font-semibold mb-1">Email Address</label>
            <input type="email" id="cust-signin-email" required placeholder="you@example.com"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-gray-600 font-semibold mb-1">Password</label>
            <input type="password" id="cust-signin-password" required placeholder="Your password"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <button type="submit" class="w-full py-3 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] font-black text-xs rounded-xl shadow-md transition border border-[#E59819]">
            Sign In →
          </button>
          <p class="text-center text-[11px] text-gray-400">New here? <button type="button" onclick="switchCustomerAuthView('signup')" class="text-[#4A0713] font-bold hover:underline">Create an account</button></p>
        </form>
        `}
      </div>
    `;
  }
  updateCustomerHeaderBadge();
}

function switchCustomerAuthView(view) {
  authState.authView = view;
  renderCustomerAuthUI();
}

/**
 * REAL CUSTOMER REVIEWS — name & photo always come from the signed-in
 * account (never a free-text field), so what shows on the homepage is
 * always a genuine reviewer, not something an admin typed in. Admins can
 * only hide or delete a review, never author one.
 */
function renderExistingCustomerReview() {
  if (!authState.customer) return;
  const existing = ((typeof storeState !== 'undefined' && storeState.testimonials) || [])
    .find(t => t.customerId === authState.customer.id);
  authState.myReviewId = existing ? existing.id : null;
  if (existing) {
    setReviewStarRating(Math.round(existing.rating) || 5);
    const textEl = document.getElementById('review-text-input');
    if (textEl) textEl.value = existing.reviewText || '';
  }
}

function setReviewStarRating(n) {
  const input = document.getElementById('review-rating-input');
  if (input) input.value = n;
  document.querySelectorAll('#review-star-picker i').forEach(star => {
    const val = Number(star.dataset.star);
    star.classList.toggle('fas', val <= n);
    star.classList.toggle('far', val > n);
  });
}

async function submitCustomerReview(event) {
  event.preventDefault();
  if (!authState.customer) return;

  const reviewText = document.getElementById('review-text-input').value.trim();
  const rating = Number(document.getElementById('review-rating-input').value) || 5;
  if (!reviewText) return;

  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = ' Submitting...'; }

  const testimonial = {
    id: authState.myReviewId || `t-${authState.customer.id}`,
    customerId: authState.customer.id,
    name: authState.customer.name,
    avatar: authState.customer.avatar || null,
    city: (authState.customer.address || '').split(',').pop().trim() || 'India',
    rating,
    reviewText,
    isVisible: true,
    sortOrder: 0
  };

  const ok = await MiraDB.dbUpsertTestimonial(testimonial);

  if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Submit Review'; }

  if (ok) {
    authState.myReviewId = testimonial.id;
    showToast('Thank you! Your review is now live.', 'success');
  } else {
    showToast('Could not save your review — please try again.', 'error');
  }
}

let tempAvatarData = null; // public Storage URL of the avatar picked before the account exists yet

async function handlePreviewAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Instant local preview while the real upload runs in the background
  const preview = document.getElementById('login-preview-avatar');
  if (preview) preview.src = URL.createObjectURL(file);
  const label = document.getElementById('photo-upload-label');
  if (label) label.textContent = 'Uploading...';

  const publicUrl = await MiraDB.uploadMedia(file, 'avatars');
  if (!publicUrl) {
    showToast('Photo upload failed — please try again', 'error');
    if (label) label.textContent = 'Choose Photo';
    return;
  }

  tempAvatarData = publicUrl;
  if (label) label.textContent = 'Photo Added';
  showToast('Photo uploaded! Click Sign In to save.', 'success');
}

async function handleUserAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file || !authState.customer) return;

  const publicUrl = await MiraDB.uploadMedia(file, 'avatars');
  if (!publicUrl) {
    showToast('Photo upload failed — please try again', 'error');
    return;
  }

  authState.customer.avatar = publicUrl;
  showToast('Profile photo updated & saved permanently!', 'success');
  renderCustomerAuthUI();
  updateCustomerHeaderBadge();
  MiraDB.dbUpsertCustomer(authState.customer);
}

async function handleCustomerSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('cust-signup-name').value.trim();
  const email = document.getElementById('cust-signup-email').value.trim();
  const password = document.getElementById('cust-signup-password').value;
  const phone = document.getElementById('cust-signup-phone').value.trim();
  const address = document.getElementById('cust-signup-address').value.trim();
  const pincode = document.getElementById('cust-signup-pincode').value.trim();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating account...'; }

  const result = await MiraDB.signUpCustomer({ email, password, name, phone, address, pincode });

  if (result.error) {
    showToast(result.error.message || 'Could not create account', 'error');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Create Account & Sign In →'; }
    return;
  }

  if (tempAvatarData) {
    result.profile.avatar = tempAvatarData;
    await MiraDB.dbUpsertCustomer(result.profile);
  }

  if (result.needsConfirmation) {
    showToast('Account created! Check your email to confirm, then sign in.', 'success');
    authState.authView = 'signin';
    renderCustomerAuthUI();
    return;
  }

  // Session came back immediately — customer is auto-logged-in right now.
  authState.customer = result.profile;
  showToast(`Welcome to MEERAV Namkeens, ${name}! You're signed in.`, 'success');
  renderCustomerAuthUI();
  updateCustomerHeaderBadge();
  fillCheckoutFormIfLoggedIn();
  setTimeout(closeCustomerAuthModal, 400);
}

async function handleCustomerSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('cust-signin-email').value.trim();
  const password = document.getElementById('cust-signin-password').value;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in...'; }

  const result = await MiraDB.signInCustomer(email, password);

  if (result.error) {
    showToast(result.error.message || 'Invalid email or password', 'error');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Sign In →'; }
    return;
  }

  authState.customer = result.profile;
  showToast(`Welcome back, ${result.profile.name}!`, 'success');
  renderCustomerAuthUI();
  updateCustomerHeaderBadge();
  fillCheckoutFormIfLoggedIn();
  setTimeout(closeCustomerAuthModal, 400);
}

async function logoutCustomer() {
  await MiraDB.signOutCustomer();
  authState.customer = null;
  authState.authView = 'signin';
  tempAvatarData = null;
  showToast('Logged out of customer account', 'info');
  renderCustomerAuthUI();
  updateCustomerHeaderBadge();
}

function updateCustomerHeaderBadge() {
  const btn = document.getElementById('header-customer-btn');
  if (!btn) return;

  const defaultAvatar = 'assets/images/default_avatar.jpg';

  if (authState.customer) {
    const avatarSrc = authState.customer.avatar || defaultAvatar;
    btn.innerHTML = `
      <div class="flex items-center gap-2">
        <img src="${avatarSrc}" alt="User Avatar" class="w-8 h-8 rounded-full object-cover border-2 border-[#E59819] shadow-sm" />
        <span class="hidden sm:inline font-black text-xs text-[#4A0713] truncate max-w-[100px]">${authState.customer.name.split(' ')[0]}</span>
      </div>
    `;
  } else {
    btn.innerHTML = `
      <div class="flex items-center gap-2 text-gray-700">
        <img src="${defaultAvatar}" alt="Guest Avatar" class="w-7 h-7 rounded-full object-cover border border-amber-300 opacity-80" />
        <span class="hidden sm:inline font-bold text-xs">Sign In</span>
      </div>
    `;
  }
}

function fillCheckoutFormIfLoggedIn() {
  if (!authState.customer) return;
  const nameInput = document.getElementById('checkout-name');
  const phoneInput = document.getElementById('checkout-phone');
  const emailInput = document.getElementById('checkout-email');
  const addressInput = document.getElementById('checkout-address');
  const pincodeInput = document.getElementById('checkout-pincode');

  if (nameInput && !nameInput.value) nameInput.value = authState.customer.name;
  if (phoneInput && !phoneInput.value) phoneInput.value = authState.customer.phone;
  if (emailInput && !emailInput.value) emailInput.value = authState.customer.email || '';
  if (addressInput && !addressInput.value) addressInput.value = authState.customer.address;
  if (pincodeInput && !pincodeInput.value) pincodeInput.value = authState.customer.pincode;
}
