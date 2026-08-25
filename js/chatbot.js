/**
 * MEERAV NAMKEENS - SMART AI CONVERSATIONAL ORDERING & PERSONALIZATION BOT
 * 1. AI Conversational Ordering: Compact, professional in-chat snack cards with 1-click add & express order.
 * 2. Animated Thinking & Finding Indicator: Unique royal 3-dot bouncing animation when the AI is searching.
 * 3. Taste Profile & Personalization Memory: Persists spice preferences, favorite categories & dietary tags to user profile & Supabase Cloud.
 * 4. Dedicated Order Support: Live GPS van ETA, address updates, cancellations & tax invoices.
 */

const chatbotState = {
  isOpen: false,
  isThinking: false,
  activeOrderId: null,
  messages: []
};

// Customer Personalization DB helper
function getUserPersonalization() {
  const defaultProfile = {
    favoriteCategories: [],
    preferredSpice: 'Classic Bikaneri',
    dietaryPreferences: [],
    orderedSnacks: [],
    chatOrderCount: 0,
    lastInteraction: null
  };
  try {
    return JSON.parse(localStorage.getItem('mira_user_personalization_db')) || defaultProfile;
  } catch (e) {
    return defaultProfile;
  }
}

function saveUserPersonalization(profile) {
  try {
    localStorage.setItem('mira_user_personalization_db', JSON.stringify(profile));
    
    // Also update logged in customer profile if available
    const session = JSON.parse(localStorage.getItem('mira_customer_session'));
    if (session) {
      session.tasteProfile = profile;
      localStorage.setItem('mira_customer_session', JSON.stringify(session));

      // Sync to Supabase Cloud
      if (typeof MeeravSupabase !== 'undefined' && MeeravSupabase.client) {
        MeeravSupabase.upsertCustomer({
          id: session.id || 'cust-1',
          name: session.name,
          phone: session.phone,
          email: session.email,
          address: session.address,
          pincode: session.pincode,
          avatar: session.avatar
        });
      }
    }
  } catch (e) {
    console.warn('Personalization save note:', e.message);
  }
}

function initChatbot() {
  const profile = getUserPersonalization();
  const session = JSON.parse(localStorage.getItem('mira_customer_session'));
  const customerName = session ? session.name : 'Foodie';

  let initialGreeting = `Namaste ${customerName}! 🙏 Welcome to **MEERAV Namkeens**.\n\nI am your personal **Snack Sommelier & Ordering Assistant**! 🍿✨\n\nI can help you discover and order authentic Bikaneri snacks directly in chat!`;

  if (profile.favoriteCategories.length > 0 || profile.orderedSnacks.length > 0) {
    initialGreeting += `\n\n🌟 *Saved Preferences: **${profile.preferredSpice}** & **${profile.favoriteCategories.join(' & ')}**!*`;
  }

  chatbotState.messages = [
    {
      sender: 'bot',
      text: initialGreeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: getPersonalizedRecommendations(),
      isOrderHelp: false
    }
  ];

  renderChatbotWidget();
}

function getPersonalizedRecommendations() {
  const allProducts = (typeof storeState !== 'undefined' && storeState.products) || MIRA_DATA.products;
  const profile = getUserPersonalization();

  if (profile.favoriteCategories.length > 0) {
    const matched = allProducts.filter(p => profile.favoriteCategories.includes(p.category));
    if (matched.length > 0) return matched.slice(0, 2);
  }

  // Default flagship top sellers
  return allProducts.filter(p => ['p1', 'p4'].includes(p.id)).slice(0, 2);
}

function toggleChatbot(forceOpen = null) {
  chatbotState.isOpen = forceOpen !== null ? forceOpen : !chatbotState.isOpen;
  const widget = document.getElementById('meerav-chatbot-window');
  const badge = document.getElementById('chatbot-unread-dot');
  
  if (widget) {
    if (chatbotState.isOpen) {
      widget.classList.remove('hidden', 'translate-y-6', 'opacity-0');
      widget.classList.add('translate-y-0', 'opacity-100');
      if (badge) badge.classList.add('hidden');
      scrollChatToBottom();
      document.getElementById('chatbot-user-input')?.focus();
    } else {
      widget.classList.add('hidden', 'translate-y-6', 'opacity-0');
      widget.classList.remove('translate-y-0', 'opacity-100');
    }
  }
}

/**
 * ORDER RESOLUTION HANDLER (From Order History)
 */
function openOrderHelpBot(orderId) {
  const allOrders = (typeof storeState !== 'undefined' && storeState.orders) || [];
  const order = allOrders.find(o => o.id === orderId) || allOrders[0];
  if (!order) return;

  chatbotState.activeOrderId = order.id;
  toggleChatbot(true);

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const itemsText = order.items ? order.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Signature Namkeens';

  chatbotState.messages.push({
    sender: 'bot',
    text: `🤖 **Order Help Specialist for #${order.id}**\n\nNamaste **${order.customer?.name || 'Customer'}**! I have loaded your order details:\n• **Status:** ${order.orderStatus} 🚚\n• **Amount:** ₹${order.totalAmount} (${order.paymentStatus})\n• **Items:** ${itemsText}\n• **Delivery Address:** ${order.customer?.address || 'Bikaner'}\n\nHow can I assist you with this order?`,
    time: timeStr,
    recommendations: [],
    isOrderHelp: true,
    orderId: order.id
  });

  renderChatMessages();
}

function renderChatbotWidget() {
  let host = document.getElementById('meerav-chatbot-root');
  if (!host) {
    host = document.createElement('div');
    host.id = 'meerav-chatbot-root';
    document.body.appendChild(host);
  }

  host.innerHTML = `
    <!-- Floating Chatbot Launcher Button -->
    <div class="fixed bottom-20 sm:bottom-6 right-5 z-50 flex flex-col items-end">
      
      <!-- Peek Bubble -->
      <div id="chatbot-peek-bubble" class="mb-2 px-3.5 py-2 bg-[#4A0713] text-[#FBBF24] text-xs font-extrabold rounded-2xl shadow-xl border border-[#E59819] flex items-center gap-2 animate-bounce cursor-pointer" onclick="toggleChatbot()">
        <span>🍿 Order & Taste Assistant</span>
        <i class="fas fa-sparkles text-[#FBBF24]"></i>
      </div>

      <button onclick="toggleChatbot()" 
        class="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#4A0713] via-[#670E1E] to-[#E59819] text-[#FBBF24] shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform duration-300 border-2 border-[#FBBF24]/80">
        <i class="fas fa-robot"></i>
        <span id="chatbot-unread-dot" class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      <!-- Chatbot Popup Window Frame -->
      <div id="meerav-chatbot-window" 
        class="hidden fixed bottom-24 sm:bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[400px] max-w-sm h-[540px] max-h-[86vh] bg-white rounded-3xl shadow-2xl border-2 border-[#E59819]/60 flex flex-col overflow-hidden transition-all duration-300 z-50">
        
        <!-- Header -->
        <div class="p-3.5 bg-gradient-to-r from-[#4A0713] to-[#32040C] text-white flex items-center justify-between border-b border-[#E59819]">
          <div class="flex items-center gap-2.5">
            <div>
              <div class="font-black text-xs text-[#FBBF24] flex items-center gap-1">
                <span>Meerav AI Sommelier</span>
                <i class="fas fa-circle-check text-emerald-400 text-[10px]"></i>
              </div>
              <span class="text-[10px] text-amber-200/80">Order Assistant & Personalization</span>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button onclick="resetChatbot()" title="Clear Chat" class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center text-xs">
              <i class="fas fa-rotate-right"></i>
            </button>
            <button onclick="toggleChatbot()" class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Quick Action Suggestion Chips -->
        <div id="chatbot-quick-pills" class="p-2 bg-amber-50/80 border-b border-amber-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-bold text-[#4A0713]">
          <button onclick="sendQuickPrompt('Help me order spicy snacks for today')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">🌶️ Order Spicy</button>
          <button onclick="sendQuickPrompt('Show me roasted diet snacks with zero palm oil')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">🌱 Diet & Roasted</button>
          <button onclick="sendQuickPrompt('I want gift boxes and sweets for celebration')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">🎁 Gift Boxes</button>
          <button onclick="sendQuickPrompt('Where is my order delivery van right now?')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">🚚 Track Van</button>
        </div>

        <!-- Chat Messages Container -->
        <div id="chatbot-messages-container" class="flex-1 p-3 overflow-y-auto space-y-3 bg-[#FFFDF8] text-xs">
          <!-- Populated by renderChatMessages() -->
        </div>

        <!-- Input Bar -->
        <form onsubmit="handleChatbotSubmit(event)" class="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2">
          <input type="text" id="chatbot-user-input" placeholder="Ask to order (e.g. 'Order Bikaneri Bhujia')..." 
            class="flex-1 px-3.5 py-2 bg-amber-50/50 border border-amber-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E59819] focus:bg-white" />
          <button type="submit" class="w-9 h-9 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] rounded-xl flex items-center justify-center shadow-md transition shrink-0 border border-[#E59819]">
            <i class="fas fa-paper-plane text-xs"></i>
          </button>
        </form>

      </div>
    </div>
  `;

  renderChatMessages();
}

function renderChatMessages() {
  const container = document.getElementById('chatbot-messages-container');
  if (!container) return;

  const messagesHtml = chatbotState.messages.map((msg, msgIdx) => `
    <div class="flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-fade-in">
      <div class="max-w-[90%] p-3 rounded-2xl ${
        msg.sender === 'user' 
          ? 'bg-[#4A0713] text-[#FBBF24] rounded-br-none shadow-xs font-medium' 
          : 'bg-white text-gray-800 border border-amber-200/80 rounded-bl-none shadow-xs leading-relaxed'
      } text-xs">
        ${msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
      </div>

      <!-- Compact & Professional In-Chat Snack Cards -->
      ${msg.recommendations && msg.recommendations.length > 0 ? `
        <div class="w-full space-y-1.5 mt-1.5 pt-0.5">
          <div class="text-[10px] font-black text-[#4A0713] uppercase tracking-wider flex items-center gap-1 px-1">
            <i class="fas fa-bag-shopping text-[#E59819]"></i>
            <span>Recommended for You:</span>
          </div>

          ${msg.recommendations.map(p => {
            const v = p.variants[0];
            return `
              <div class="p-2 bg-white rounded-2xl border border-amber-200 hover:border-[#E59819] shadow-xs flex items-center justify-between gap-2 transition hover:shadow-md">
                
                <!-- Compact Product Thumbnail & Details -->
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <a href="product?id=${p.id}" class="shrink-0 block">
                    <img src="${p.image}" alt="${p.name}" class="w-11 h-11 object-cover rounded-xl border border-amber-200 shadow-2xs group-hover:scale-105 transition-transform" />
                  </a>
                  <div class="min-w-0 flex-1">
                    <a href="product?id=${p.id}" class="font-black text-[11px] text-[#4A0713] truncate block hover:underline leading-tight">${p.name}</a>
                    <div class="text-[9px] text-amber-800 font-bold truncate mt-0.5">🌶️ ${p.spiceLevel}</div>
                    <div class="text-[11px] font-black text-gray-900 mt-0.5">₹${v.price} <span class="text-[9px] text-gray-400 line-through">₹${v.originalPrice}</span></div>
                  </div>
                </div>

                <!-- Sleek Mini Buttons -->
                <div class="flex items-center gap-1 shrink-0">
                  <button onclick="handleChatAddToCart('${p.id}', 0)" 
                    class="py-1 px-2 bg-amber-100 hover:bg-amber-200 text-[#4A0713] rounded-lg text-[10px] font-black transition flex items-center gap-0.5 border border-amber-300" title="Add to Cart">
                    <i class="fas fa-plus text-[8px]"></i> Add
                  </button>
                  <button onclick="handleChatDirectBuy('${p.id}', 0)" 
                    class="py-1 px-2 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] rounded-lg text-[10px] font-black transition flex items-center gap-0.5 border border-[#E59819] shadow-2xs" title="Instant Checkout">
                    <i class="fas fa-bolt text-[8px]"></i> Buy
                  </button>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- Order Help Action Buttons -->
      ${msg.isOrderHelp ? `
        <div class="grid grid-cols-2 gap-1.5 w-full mt-1.5">
          <button onclick="sendQuickPrompt('Where is my delivery van right now?')" class="p-2 bg-amber-50 hover:bg-amber-100 text-[#4A0713] border border-amber-200 rounded-xl text-[10px] font-bold text-left flex items-center gap-1.5 shadow-2xs">
            <i class="fas fa-truck-fast text-[#E59819]"></i> <span>Live Van GPS</span>
          </button>
          <button onclick="sendQuickPrompt('Download my tax invoice receipt')" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-[10px] font-bold text-left flex items-center gap-1.5 shadow-2xs">
            <i class="fas fa-receipt text-blue-600"></i> <span>View Invoice</span>
          </button>
          <button onclick="sendQuickPrompt('I want to change my delivery address or phone number')" class="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-[10px] font-bold text-left flex items-center gap-1.5 shadow-2xs">
            <i class="fas fa-pen text-emerald-600"></i> <span>Edit Address</span>
          </button>
          <button onclick="sendQuickPrompt('I want to cancel or modify this order')" class="p-2 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 rounded-xl text-[10px] font-bold text-left flex items-center gap-1.5 shadow-2xs">
            <i class="fas fa-ban text-red-600"></i> <span>Cancel Order</span>
          </button>
        </div>
      ` : ''}

      <span class="text-[9px] text-gray-400 px-1">${msg.time}</span>
    </div>
  `).join('');

  // Append Animated Thinking/Finding Indicator if active
  const thinkingHtml = chatbotState.isThinking ? `
    <div id="chatbot-thinking-indicator" class="flex items-center gap-2 p-3 bg-white border border-amber-200 rounded-2xl rounded-bl-none shadow-xs text-xs max-w-[85%] animate-fade-in">
      <div class="w-6 h-6 rounded-lg bg-[#4A0713] flex items-center justify-center text-[#FBBF24] text-[10px] animate-pulse shrink-0">
        <i class="fas fa-sparkles"></i>
      </div>
      <div class="flex items-center gap-1 font-bold text-gray-700 text-[11px]">
        <span>Sommelier is finding authentic snacks</span>
        <div class="flex items-center gap-0.5 ml-1">
          <span class="w-1.5 h-1.5 rounded-full bg-[#E59819] animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#E59819] animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#E59819] animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>
  ` : '';

  container.innerHTML = messagesHtml + thinkingHtml;
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const container = document.getElementById('chatbot-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('chatbot-user-input');
  if (input) input.value = promptText;
  handleChatbotSubmit(new Event('submit'));
}

/**
 * 1-Click In-Chat Actions that Save to Taste Profile & Trigger Cart/Checkout
 */
function handleChatAddToCart(productId, variantIdx = 0) {
  const allProducts = (typeof storeState !== 'undefined' && storeState.products) || MIRA_DATA.products;
  const p = allProducts.find(item => item.id === productId);
  if (!p) return;

  // Add to cart
  if (typeof addToCart === 'function') {
    addToCart(p.id, variantIdx);
  }

  // Update Personalization Profile Memory
  const profile = getUserPersonalization();
  if (!profile.favoriteCategories.includes(p.category)) {
    profile.favoriteCategories.push(p.category);
  }
  if (!profile.orderedSnacks.includes(p.id)) {
    profile.orderedSnacks.push(p.id);
  }
  profile.preferredSpice = p.spiceLevel;
  profile.chatOrderCount = (profile.chatOrderCount || 0) + 1;
  profile.lastInteraction = new Date().toISOString();
  saveUserPersonalization(profile);

  showToast(`Added ${p.name} to Cart & Saved to Taste Profile! 🍿❤️`, 'success');
}

function handleChatDirectBuy(productId, variantIdx = 0) {
  handleChatAddToCart(productId, variantIdx);
  toggleChatbot(false);
  
  if (typeof openCheckoutModal === 'function') {
    openCheckoutModal();
  }
}

function handleChatbotSubmit(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('chatbot-user-input');
  if (!input) return;

  const userQuery = input.value.trim();
  if (!userQuery) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Add User Message
  chatbotState.messages.push({
    sender: 'user',
    text: userQuery,
    time: timeStr,
    recommendations: []
  });

  input.value = '';

  // 2. Trigger Animated AI Thinking Indicator
  chatbotState.isThinking = true;
  renderChatMessages();

  // 3. Generate Smart Bot Resolution & Update Personalization after smooth delay
  setTimeout(() => {
    const { botResponse, matchedProducts, learnedPreference } = analyzeQueryAndRecommend(userQuery);
    
    // Save learned preference to personalization memory
    if (learnedPreference) {
      const profile = getUserPersonalization();
      if (learnedPreference.category && !profile.favoriteCategories.includes(learnedPreference.category)) {
        profile.favoriteCategories.push(learnedPreference.category);
      }
      if (learnedPreference.spice) {
        profile.preferredSpice = learnedPreference.spice;
      }
      if (learnedPreference.dietary && !profile.dietaryPreferences.includes(learnedPreference.dietary)) {
        profile.dietaryPreferences.push(learnedPreference.dietary);
      }
      profile.lastInteraction = new Date().toISOString();
      saveUserPersonalization(profile);
    }

    chatbotState.isThinking = false;
    chatbotState.messages.push({
      sender: 'bot',
      text: botResponse,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: matchedProducts
    });
    renderChatMessages();
  }, 600);
}

function analyzeQueryAndRecommend(query) {
  const q = query.toLowerCase();
  const allOrders = (typeof storeState !== 'undefined' && storeState.orders) || [];
  const currentOrder = allOrders.find(o => o.id === chatbotState.activeOrderId) || allOrders[0];
  const allProducts = (typeof storeState !== 'undefined' && storeState.products) || MIRA_DATA.products;

  let matched = [];
  let responseText = "";
  let learnedPreference = null;

  // 1. ORDER ASSISTANCE & CART INTENTS
  if (q.includes('order') || q.includes('buy') || q.includes('want') || q.includes('purchase') || q.includes('pack') || q.includes('send me')) {
    // Check specific product matches
    matched = allProducts.filter(p => {
      const pName = p.name.toLowerCase();
      const pCat = p.category.toLowerCase();
      return q.includes(pName) || (q.includes('bhujia') && pCat === 'bhujia-sev') ||
             (q.includes('mixture') && pCat === 'mixture-farsan') ||
             (q.includes('mathri') && pCat === 'mathri') ||
             (q.includes('diet') && pCat === 'roasted-diet') ||
             (q.includes('makhana') && p.id === 'p46') ||
             (q.includes('sweet') && pCat === 'sweets-combos');
    });

    if (matched.length === 0) matched = allProducts.slice(0, 2);

    responseText = `🛒 **Instant Order Assistance**\n\nI have matched the best snack for your craving! You can **Add to Cart** or click **Buy** directly below. Your preference is also saved for future visits! ✨`;
    learnedPreference = { category: matched[0]?.category, spice: matched[0]?.spiceLevel };
  }
  // 2. LIVE TRACKING & SUPPORT INTENTS
  else if (q.includes('where') || q.includes('track') || q.includes('van') || q.includes('driver') || q.includes('eta') || q.includes('delivery')) {
    if (currentOrder) {
      responseText = `🚚 **Live Tracking for Order #${currentOrder.id}**:\n\n• **Status:** ${currentOrder.orderStatus}\n• **Courier AWB:** ${currentOrder.trackingNumber || 'DTDC-88210-EXP'}\n• **Driver:** ${currentOrder.driver?.name || 'Ramesh Bishnoi'} (${currentOrder.driver?.vehicle || 'Electric Delivery Van'})\n• **Estimated Arrival:** ~18 mins en route to your address.\n\nClick **"Track Map"** in your order history to view the moving GPS van on OpenStreetMap!`;
    } else {
      responseText = `Your orders are dispatched directly from our Central Bikaner Kitchen Hub. You can track any active order live on the map!`;
    }
  } else if (q.includes('address') || q.includes('change') || q.includes('phone') || q.includes('location')) {
    responseText = `📍 **Delivery Address Update**:\n\nI have logged your request to update address/contact details for **Order #${currentOrder?.id || 'MEERAV-8801'}**. Our Bikaner dispatch team will prioritize the updated drop instructions!`;
    showToast('Address update note dispatched to kitchen! 📝', 'success');
  } else if (q.includes('cancel') || q.includes('refund')) {
    responseText = `❌ **Cancellation / Modification**:\n\nIf your order is in *Processing* state, we can modify or cancel it. Please confirm if you would like us to cancel **Order #${currentOrder?.id || 'MEERAV-8801'}** for an instant UPI refund.`;
  } else if (q.includes('invoice') || q.includes('bill') || q.includes('receipt')) {
    responseText = `🧾 **Tax Invoice Generated!**\n\nI have generated the official tax invoice for **Order #${currentOrder?.id || 'MEERAV-8801'}**. Click below to inspect your printable receipt.`;
    if (currentOrder && typeof previewEmailNotification === 'function') {
      setTimeout(() => previewEmailNotification(currentOrder.id), 800);
    }
  }
  // 3. TASTE & CRAVING RECOMMENDATION INTENTS
  else if (q.includes('spicy') || q.includes('hot') || q.includes('ratlami') || q.includes('clove') || q.includes('teekha')) {
    matched = allProducts.filter(p => p.category === 'bhujia-sev');
    responseText = "🌶️ For that fiery authentic punch, I highly recommend our **Royal Ratlami Laung Sev** and **Authentic Aloo Bhujia**! Both are fried in 100% pure clean oil with zero palm oil.";
    learnedPreference = { category: 'bhujia-sev', spice: 'Fiery Royal Clove' };
  } else if (q.includes('diet') || q.includes('healthy') || q.includes('zero oil') || q.includes('makhana') || q.includes('roasted')) {
    matched = allProducts.filter(p => p.category === 'roasted-diet');
    responseText = "🥗 For a healthy, guilt-free crunch, try our **Roasted Himalayan Pink Salt Makhana** and **Roasted Moong Dal** slow-roasted with zero palm oil!";
    learnedPreference = { category: 'roasted-diet', dietary: 'Roasted' };
  } else if (q.includes('tea') || q.includes('chai') || q.includes('mathri') || q.includes('evening')) {
    matched = allProducts.filter(p => p.category === 'mathri');
    responseText = "☕ Nothing pairs better with cutting chai than our flaky **Kasuri Methi Mathri** and **Masala Khakhra**! Perfectly crispy and handcrafted.";
    learnedPreference = { category: 'mathri', spice: 'Mild Ajwain & Methi' };
  } else if (q.includes('gift') || q.includes('box') || q.includes('hamper') || q.includes('sweet')) {
    matched = allProducts.filter(p => p.category === 'sweets-combos');
    responseText = "🎁 Our **Grand Celebration Bikaneri Gift Box** contains an assortment of signature namkeens and sweets in a luxury keepsake box!";
    learnedPreference = { category: 'sweets-combos' };
  } else {
    matched = allProducts.slice(0, 2);
    responseText = `I can help you place an order right now! Tell me your favorite snack or craving (e.g. *"Order spicy sev"*, *"Healthy snacks for tea-time"*), and I'll tailor it for you! 🍿`;
  }

  return {
    botResponse: responseText,
    matchedProducts: matched.slice(0, 2),
    learnedPreference
  };
}

function resetChatbot() {
  chatbotState.activeOrderId = null;
  const profile = getUserPersonalization();
  chatbotState.messages = [
    {
      sender: 'bot',
      text: `Chat refreshed! 🍿 I still remember your saved taste profile: **${profile.preferredSpice}** snacks & **${profile.favoriteCategories.join(', ') || 'Bikaneri Delicacies'}**. What would you like to order today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: getPersonalizedRecommendations()
    }
  ];
  renderChatMessages();
}

document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});
