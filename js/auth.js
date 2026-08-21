/**
 * MIRA NAMKEENS - SEPARATED AUTHENTICATION & CUSTOMER PROFILE/ORDER HISTORY
 * Dedicated Customer Authentication, Saved Profile, Addresses & Order History
 */

const authState = {
  customer: JSON.parse(localStorage.getItem('mira_customer_session')) || null,
  isAdminAuthenticated: sessionStorage.getItem('mira_admin_session') === 'true'
};

// Global Toast Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

  toast.className = `toast flex items-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-semibold ${bgColor} shadow-lg`;
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;

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

  if (authState.customer) {
    // Get customer's orders from storage or state
    const allOrders = JSON.parse(localStorage.getItem('mira_orders_db')) || (typeof storeState !== 'undefined' ? storeState.orders : MIRA_DATA.initialOrders);
    const customerOrders = allOrders.filter(o => 
      (o.customer && o.customer.name && o.customer.name.toLowerCase() === authState.customer.name.toLowerCase()) ||
      (o.customer && o.customer.phone && o.customer.phone.includes(authState.customer.phone.replace(/\D/g, '').slice(-10)))
    );

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Customer Profile Card -->
        <div class="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-2xl border border-amber-200">
          <div class="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-md">
            ${authState.customer.name.charAt(0)}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-black text-gray-900 truncate">${authState.customer.name}</h3>
            <p class="text-xs text-gray-500 truncate">${authState.customer.phone} &bull; ${authState.customer.email || 'customer@mira.com'}</p>
          </div>
          <button onclick="logoutCustomer()" title="Logout" class="p-2 text-gray-400 hover:text-red-600 transition">
            <i class="fas fa-sign-out-alt text-sm"></i>
          </button>
        </div>

        <!-- Saved Address Box -->
        <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
          <div class="font-bold text-gray-800 flex items-center gap-1.5">
            <i class="fas fa-location-dot text-amber-600"></i> Saved Delivery Address:
          </div>
          <p class="text-gray-600 text-[11px] leading-relaxed">${authState.customer.address} (PIN: ${authState.customer.pincode})</p>
        </div>

        <!-- Customer Order History -->
        <div class="space-y-2 pt-2 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <h4 class="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fas fa-clock-rotate-left text-amber-600"></i> My Order History (${customerOrders.length})
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
                      <i class="fas fa-map-location-dot text-[#E59819]"></i> Track Map
                    </button>
                    <button onclick="closeCustomerAuthModal(); openOrderHelpBot('${order.id}');" class="px-2 py-1 bg-[#4A0713] text-[#FBBF24] font-black rounded-lg hover:bg-[#32040C] transition text-[10px] flex items-center gap-1 shadow-2xs border border-[#E59819]" title="Ask Order Help Bot">
                      <i class="fas fa-robot text-[#E59819]"></i> Help Bot
                    </button>
                  </div>
                </div>
              </div>
            `).join('') : `
              <div class="py-6 text-center text-gray-400 text-xs">
                <i class="fas fa-box-open text-2xl mb-1 text-gray-300 block"></i>
                No previous orders yet. Add your favorite crispy namkeens to cart!
              </div>
            `}
          </div>
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
  } else {
    // Show Login / Registration Form
    container.innerHTML = `
      <div class="space-y-4">
        <div class="text-center">
          <h3 class="text-xl font-black text-amber-950">Customer Account</h3>
          <p class="text-xs text-gray-500 mt-1">Sign in to view your past orders, live delivery tracking & saved addresses</p>
        </div>

        <!-- Fast Demo Account Callout -->
        <div class="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center">
          <span class="text-[11px] text-amber-900 font-bold block mb-1.5">⚡ Fast 1-Click Demo Account:</span>
          <button type="button" onclick="loginDemoCustomer()" class="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition">
            Sign In as "Pooja Sharma" (With Order History)
          </button>
        </div>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-gray-200"></div>
          <span class="flex-shrink mx-3 text-[11px] text-gray-400 font-medium">Or enter your details</span>
          <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <form onsubmit="handleCustomerLogin(event)" class="space-y-3 text-xs">
          <div>
            <label class="block text-gray-600 font-semibold mb-1">Full Name</label>
            <input type="text" id="cust-login-name" required placeholder="e.g. Rajesh Kothari" 
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-gray-600 font-semibold mb-1">WhatsApp / Phone Number</label>
            <input type="tel" id="cust-login-phone" required placeholder="+91 98765 00000" 
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-gray-600 font-semibold mb-1">Delivery Address</label>
            <input type="text" id="cust-login-address" required placeholder="Flat/House, Society, City" 
              class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-gray-600 font-semibold mb-1">Pincode</label>
              <input type="text" id="cust-login-pincode" required placeholder="e.g. 400050" 
                class="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-gray-600 font-semibold mb-1">OTP Simulation</label>
              <input type="text" value="Auto-Verified ✓" readonly 
                class="w-full px-3 py-2 bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 rounded-xl text-center" />
            </div>
          </div>

          <button type="submit" class="w-full py-3 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-md transition">
            Sign In & Save Profile <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </form>
      </div>
    `;
  }
  updateCustomerHeaderBadge();
}

function loginDemoCustomer() {
  const demo = MIRA_DATA.mockUsers[0];
  authState.customer = demo;
  localStorage.setItem('mira_customer_session', JSON.stringify(demo));
  showToast(`Welcome back, ${demo.name}! 👋`, 'success');
  renderCustomerAuthUI();
  updateCustomerHeaderBadge();
  fillCheckoutFormIfLoggedIn();
}

function handleCustomerLogin(e) {
  e.preventDefault();
  const name = document.getElementById('cust-login-name').value.trim();
  const phone = document.getElementById('cust-login-phone').value.trim();
  const address = document.getElementById('cust-login-address').value.trim();
  const pincode = document.getElementById('cust-login-pincode').value.trim();

  const user = {
    id: `usr-${Date.now()}`,
    name,
    phone,
    email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
    address,
    pincode,
    lat: 19.0760 + (Math.random() - 0.5) * 0.05,
    lng: 72.8777 + (Math.random() - 0.5) * 0.05
  };

  authState.customer = user;
  localStorage.setItem('mira_customer_session', JSON.stringify(user));
  showToast(`Welcome to Mira Namkeens, ${name}! 🎉`, 'success');
  renderCustomerAuthUI();
  updateCustomerHeaderBadge();
  fillCheckoutFormIfLoggedIn();
  setTimeout(closeCustomerAuthModal, 400);
}

function logoutCustomer() {
  authState.customer = null;
  localStorage.removeItem('mira_customer_session');
  showToast('Logged out of customer account', 'info');
  renderCustomerAuthUI();
  updateCustomerHeaderBadge();
}

function updateCustomerHeaderBadge() {
  const btn = document.getElementById('header-customer-btn');
  if (!btn) return;

  if (authState.customer) {
    btn.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center shadow-xs">
          ${authState.customer.name.charAt(0)}
        </div>
        <span class="hidden sm:inline font-bold text-xs text-amber-900 truncate max-w-[100px]">${authState.customer.name.split(' ')[0]}</span>
      </div>
    `;
  } else {
    btn.innerHTML = `
      <div class="flex items-center gap-1.5 text-gray-700">
        <i class="far fa-user text-sm"></i>
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
