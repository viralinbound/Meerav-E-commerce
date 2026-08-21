/**
 * MEERAV NAMKEENS - SMART AI CHATBOT & ORDER RESOLUTION BOT
 * 1. Product Sommelier (Craving, Taste, Spice, Occasion recommendations with 1-click cart add)
 * 2. Order Support Specialist (Live GPS driver ETA, address changer, cancellation, invoice generator, executive escalation)
 */

const chatbotState = {
  isOpen: false,
  activeOrderId: null,
  messages: [
    {
      sender: 'bot',
      text: 'Namaste! 🙏 Welcome to **MEERAV Namkeens**. I am your personal **Bikaneri Snack Sommelier & Order Assistant**! 🍿✨\n\nTell me what you are craving or ask me for help with any order (e.g. *"Spicy tea-time snack"*, *"Diet snack without oil"*, *"Where is my order?"*).',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: []
    }
  ]
};

function initChatbot() {
  renderChatbotWidget();
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
 * DEDICATED ORDER RESOLUTION CONTROLLER (Triggered from Order History)
 */
function openOrderHelpBot(orderId) {
  const allOrders = (typeof storeState !== 'undefined' && storeState.orders) || [];
  const order = allOrders.find(o => o.id === orderId) || allOrders[0];
  if (!order) return;

  chatbotState.activeOrderId = order.id;
  toggleChatbot(true);

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const itemsText = order.items ? order.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Signature Namkeens';

  // Push specialized Order Support message
  chatbotState.messages.push({
    sender: 'bot',
    text: `🤖 **Order Help Specialist for #${order.id}**\n\nNamaste **${order.customer.name}**! I have loaded your order details:\n• **Status:** ${order.orderStatus} 🚚\n• **Amount:** ₹${order.totalAmount} (${order.paymentStatus})\n• **Items:** ${itemsText}\n• **Delivery Address:** ${order.customer.address}\n\nHow can I help you with this order? Select an option below or type your question:`,
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
      
      <!-- Notification Prompt Pill -->
      <div id="chatbot-peek-bubble" class="mb-2 px-3.5 py-2 bg-[#4A0713] text-[#FBBF24] text-xs font-extrabold rounded-2xl shadow-xl border border-[#E59819] flex items-center gap-2 animate-bounce cursor-pointer" onclick="toggleChatbot()">
        <span>🍿 Snack & Order Help Bot</span>
        <i class="fas fa-sparkles text-[#FBBF24]"></i>
      </div>

      <button onclick="toggleChatbot()" 
        class="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#4A0713] via-[#670E1E] to-[#E59819] text-[#FBBF24] shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform duration-300 border-2 border-[#FBBF24]/80">
        <i class="fas fa-robot"></i>
        <span id="chatbot-unread-dot" class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      <!-- Chatbot Popup Window Frame -->
      <div id="meerav-chatbot-window" 
        class="hidden fixed bottom-24 sm:bottom-24 right-4 sm:right-6 w-[92vw] sm:w-96 max-w-sm h-[530px] max-h-[84vh] bg-white rounded-3xl shadow-2xl border-2 border-[#E59819]/60 flex flex-col overflow-hidden transition-all duration-300 z-50">
        
        <!-- Header -->
        <div class="p-3.5 bg-gradient-to-r from-[#4A0713] to-[#32040C] text-white flex items-center justify-between border-b border-[#E59819]">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-100 p-0.5 flex items-center justify-center">
              <img src="assets/images/meerav_logo.png" alt="Logo" class="w-full h-full object-contain" />
            </div>
            <div>
              <div class="font-black text-xs text-[#FBBF24] flex items-center gap-1">
                <span>Meerav AI Assistant</span>
                <i class="fas fa-circle-check text-emerald-400 text-[10px]"></i>
              </div>
              <span class="text-[10px] text-amber-200/80">Snack Taste & Order Support</span>
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

        <!-- Dynamic Quick Action Pills -->
        <div id="chatbot-quick-pills" class="p-2 bg-amber-50/80 border-b border-amber-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-bold text-[#4A0713]">
          <button onclick="sendQuickPrompt('Where is my order delivery van right now?')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">🚚 Track Order Van</button>
          <button onclick="sendQuickPrompt('I want to change my delivery address or phone number')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">📍 Change Address</button>
          <button onclick="sendQuickPrompt('Download my tax invoice receipt')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">🧾 Get Invoice</button>
          <button onclick="sendQuickPrompt('I want to cancel or modify this order')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">❌ Cancel Order</button>
          <button onclick="sendQuickPrompt('Speak with customer executive')" class="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full shrink-0 shadow-2xs">💬 Live Agent</button>
        </div>

        <!-- Chat Messages Container -->
        <div id="chatbot-messages-container" class="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FFFDF8] text-xs">
          <!-- Populated by renderChatMessages() -->
        </div>

        <!-- Input Bar -->
        <form onsubmit="handleChatbotSubmit(event)" class="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2">
          <input type="text" id="chatbot-user-input" placeholder="Type an issue or describe your craving..." 
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

  container.innerHTML = chatbotState.messages.map(msg => `
    <div class="flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1">
      <div class="max-w-[88%] p-3 rounded-2xl ${
        msg.sender === 'user' 
          ? 'bg-[#4A0713] text-[#FBBF24] rounded-br-none shadow-sm' 
          : 'bg-white text-gray-800 border border-amber-200/80 rounded-bl-none shadow-sm'
      } text-xs leading-relaxed">
        ${msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
      </div>

      <!-- Action Buttons for Order Issues -->
      ${msg.isOrderHelp ? `
        <div class="grid grid-cols-2 gap-1.5 w-full mt-1.5">
          <button onclick="sendQuickPrompt('Where is my delivery van right now?')" class="p-2 bg-amber-50 hover:bg-amber-100 text-[#4A0713] border border-amber-200 rounded-xl text-[11px] font-bold text-left flex items-center gap-1.5 shadow-2xs">
            <i class="fas fa-truck-fast text-[#E59819]"></i> <span>Live Van GPS</span>
          </button>
          <button onclick="sendQuickPrompt('Download my tax invoice receipt')" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-[11px] font-bold text-left flex items-center gap-1.5 shadow-2xs">
            <i class="fas fa-receipt text-blue-600"></i> <span>View Invoice</span>
          </button>
          <button onclick="sendQuickPrompt('I want to change my delivery address or phone number')" class="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-[11px] font-bold text-left flex items-center gap-1.5 shadow-2xs">
            <i class="fas fa-pen text-emerald-600"></i> <span>Edit Address</span>
          </button>
          <button onclick="sendQuickPrompt('I want to cancel or modify this order')" class="p-2 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 rounded-xl text-[11px] font-bold text-left flex items-center gap-1.5 shadow-2xs">
            <i class="fas fa-ban text-red-600"></i> <span>Cancel Order</span>
          </button>
        </div>
      ` : ''}

      <!-- Snack Recommendations (if any) -->
      ${msg.recommendations && msg.recommendations.length > 0 ? `
        <div class="w-full space-y-2 mt-2 pt-1">
          ${msg.recommendations.map(p => {
            const v = p.variants[0];
            return `
              <div class="p-2.5 bg-white rounded-xl border border-[#E59819]/50 shadow-sm flex items-center gap-2.5">
                <a href="product.html?id=${p.id}" class="shrink-0 block">
                  <img src="${p.image}" alt="${p.name}" class="w-12 h-12 object-contain bg-amber-50/50 p-1 rounded-lg border hover:scale-105 transition-transform" />
                </a>
                <div class="flex-1 min-w-0">
                  <a href="product.html?id=${p.id}" class="font-black text-xs text-[#4A0713] truncate block hover:underline">${p.name}</a>
                  <div class="text-[10px] text-gray-500 font-semibold">${v.weight} &bull; <span class="text-[#4A0713] font-black">₹${v.price}</span></div>
                  <div class="text-[10px] text-amber-700 font-bold">${p.spiceLevel}</div>
                </div>
                <button onclick="addToCart('${p.id}', 0); showToast('Added to Cart from Chatbot! 🎉', 'success');" 
                  class="px-2.5 py-1.5 bg-[#4A0713] hover:bg-[#32040C] text-[#FBBF24] rounded-lg text-[11px] font-black shrink-0 shadow-xs flex items-center gap-1 border border-[#E59819]">
                  <i class="fas fa-plus text-[9px]"></i> Add
                </button>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <span class="text-[9px] text-gray-400 px-1">${msg.time}</span>
    </div>
  `).join('');

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

function handleChatbotSubmit(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('chatbot-user-input');
  if (!input) return;

  const userQuery = input.value.trim();
  if (!userQuery) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Add User Message
  chatbotState.messages.push({
    sender: 'user',
    text: userQuery,
    time: timeStr,
    recommendations: []
  });

  input.value = '';
  renderChatMessages();

  // Generate Smart Bot Resolution
  setTimeout(() => {
    const { botResponse, matchedProducts } = analyzeQueryAndRecommend(userQuery);
    chatbotState.messages.push({
      sender: 'bot',
      text: botResponse,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: matchedProducts
    });
    renderChatMessages();
  }, 450);
}

function analyzeQueryAndRecommend(query) {
  const q = query.toLowerCase();
  const allOrders = (typeof storeState !== 'undefined' && storeState.orders) || [];
  const currentOrder = allOrders.find(o => o.id === chatbotState.activeOrderId) || allOrders[0];
  const allProducts = (typeof storeState !== 'undefined' && storeState.products) || MIRA_DATA.products;

  let matched = [];
  let responseText = "";

  // 1. ORDER SPECIFIC INTENTS
  if (q.includes('where') || q.includes('track') || q.includes('van') || q.includes('driver') || q.includes('eta') || q.includes('delivery')) {
    if (currentOrder) {
      responseText = `🚚 **Live Tracking for Order #${currentOrder.id}**:\n\n• **Status:** ${currentOrder.orderStatus}\n• **Courier AWB:** ${currentOrder.trackingNumber}\n• **Driver:** ${currentOrder.driver?.name || 'Ramesh Bishnoi'} (${currentOrder.driver?.vehicle || 'Electric Van'})\n• **Estimated Arrival:** ~18 mins en route to your address.\n\nClick **"Track Map"** in your order history to view the moving GPS van on OpenStreetMap!`;
    } else {
      responseText = `Your orders are dispatched directly from our Central Bikaner Kitchen Hub via DTDC Express. You can track any order live on the map!`;
    }
  } else if (q.includes('address') || q.includes('change') || q.includes('phone') || q.includes('location') || q.includes('wrong')) {
    responseText = `📍 **Delivery Address Update**:\n\nI have logged your request to update address/contact details for **Order #${currentOrder?.id || 'MEERAV-8801'}**. Our Bikaner dispatch team will prioritize the updated drop instructions!`;
    showToast('Address update note dispatched to kitchen! 📝', 'success');
  } else if (q.includes('cancel') || q.includes('modify') || q.includes('return') || q.includes('refund')) {
    if (currentOrder && currentOrder.orderStatus === 'Delivered') {
      responseText = `Your order **#${currentOrder.id}** has already been delivered fresh. If you noticed any packaging issues, our support team will instantly process a replacement fresh batch!`;
    } else {
      responseText = `❌ **Cancellation / Modification**:\n\nIf your order is in *Processing* state, we can modify or cancel it. Please confirm if you would like us to cancel **Order #${currentOrder?.id || 'MEERAV-8801'}** for an instant UPI refund.`;
    }
  } else if (q.includes('invoice') || q.includes('bill') || q.includes('receipt') || q.includes('gst')) {
    responseText = `🧾 **Tax Invoice Generated!**\n\nI have generated the official tax invoice for **Order #${currentOrder?.id || 'MEERAV-8801'}**. Click below to inspect your printable receipt.`;
    if (currentOrder && typeof previewEmailNotification === 'function') {
      setTimeout(() => previewEmailNotification(currentOrder.id), 800);
    }
  } else if (q.includes('agent') || q.includes('support') || q.includes('speak') || q.includes('human') || q.includes('call') || q.includes('help')) {
    responseText = `📞 **Customer Support Helpline**:\n\n• **Toll-Free:** 1800-200-MEERAV\n• **Email:** support@meeravnamkeens.com\n• **Office:** Royal Dispatch Hub, Bikaner, Rajasthan\n\nOur customer care executives are available Monday to Saturday (9:00 AM – 8:00 PM).`;
  }
  // 2. PRODUCT RECOMMENDATION INTENTS
  else if (q.includes('spicy') || q.includes('hot') || q.includes('ratlami') || q.includes('clove') || q.includes('teekha')) {
    matched = allProducts.filter(p => p.id === 'p3' || p.category === 'bhujia-sev');
    responseText = "🌶️ For that fiery authentic punch, I highly recommend our **Royal Ratlami Laung Sev** (infused with cloves) and **Authentic Aloo Bhujia**! Both are fried in pure oil with zero palm oil.";
  } else if (q.includes('diet') || q.includes('healthy') || q.includes('zero oil') || q.includes('makhana') || q.includes('roasted') || q.includes('gluten')) {
    matched = allProducts.filter(p => p.category === 'roasted-diet');
    responseText = "🥗 For a healthy, guilt-free crunch, try our **Roasted Himalayan Pink Salt Makhana** slow-roasted in pure desi cow ghee and Himalayan rock salt!";
  } else if (q.includes('tea') || q.includes('chai') || q.includes('mathri') || q.includes('evening') || q.includes('nimki')) {
    matched = allProducts.filter(p => p.category === 'mathri' || p.id === 'p7' || p.id === 'p5');
    responseText = "☕ Nothing pairs better with cutting chai than our flaky **Kasuri Methi Mathri** and **Khatta Meetha Mixture**! Perfectly crispy and handcrafted.";
  } else if (q.includes('gift') || q.includes('box') || q.includes('hamper') || q.includes('festival') || q.includes('diwali') || q.includes('celebration')) {
    matched = allProducts.filter(p => p.category === 'sweets-combos' || p.id === 'p8' || p.id === 'p4');
    responseText = "🎁 Our **Grand Celebration Bikaneri Gift Box** contains an assortment of 6 signature namkeens and whole roasted cashews in a royal keepsake box!";
  } else if (q.includes('sweet') || q.includes('tangy') || q.includes('khatta') || q.includes('mango') || q.includes('farsan')) {
    matched = allProducts.filter(p => p.id === 'p5' || p.category === 'mixture-farsan');
    responseText = "🍋 You will love our **Khatta Meetha Special Mixture**! A royal blend of crispy sev, boondi, roasted peanuts, and tangy dry mango seasoning.";
  } else {
    matched = allProducts.slice(0, 3);
    responseText = `I am here to help! Tell me if you need help with your current order or if you'd like to discover more crispy Bikaneri delicacies! 🍿`;
  }

  return {
    botResponse: responseText,
    matchedProducts: matched.slice(0, 3)
  };
}

function resetChatbot() {
  chatbotState.activeOrderId = null;
  chatbotState.messages = [
    {
      sender: 'bot',
      text: 'Chat history cleared! Tell me what taste or order support you need today! 🍿',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: []
    }
  ];
  renderChatMessages();
}

document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});
