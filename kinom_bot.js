/* =============================================
   KINOM — Chatbot & Site JavaScript
   Pure vanilla JS, no dependencies
============================================= */

// ---- Scroll: navbar shadow + animate-slide-up ----
(function () {
    const navbar = document.getElementById('navbar');
    const slideEls = document.querySelectorAll('.animate-slide-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    slideEls.forEach(el => observer.observe(el));

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
})();

// ---- Mobile nav hamburger ----
(function () {
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
    });
})();

// ---- Contact form (simple) ----
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#1a9e6a';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = 'Send Message';
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
        }, 3000);
    });
})();

// =============================================
//  CHATBOT
// =============================================
(function () {
    const fab         = document.getElementById('chatFab');
    const chatWindow  = document.getElementById('chatWindow');
    const chatClose   = document.getElementById('chatClose');
    const chatForm    = document.getElementById('chatForm');
    const chatInput   = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatMsgList = document.getElementById('chatMsgList');
    const chatEmpty   = document.getElementById('chatEmpty');
    const chatMessages= document.getElementById('chatMessages');
    const fabBadge    = document.getElementById('fabBadge');
    const fabIconChat = document.getElementById('fabIconChat');
    const fabIconClose= document.getElementById('fabIconClose');

    let isOpen    = false;
    let isTyping  = false;
    let hasOpened = false;

    // ---- Responses knowledge base (Banknote / Paper Currency Marketplace) ----
    const kb = {
        greeting:   "Hello! 👋 Welcome to Kinom — the marketplace for rare and collectible paper currency!\n\nHow can I assist you today?",
        account:    "Creating a Kinom account is easy:\n\n1. Click 'Sign Up' in the top navigation\n2. Enter your name, email & password\n3. Verify your email address\n4. Complete your collector profile\n\nOnce set up, you can browse, buy, and list banknotes right away!",
        buy:        "Buying rare banknotes on Kinom:\n\n1. Log in to your account\n2. Go to Dashboard → Browse Notes\n3. Filter by country, denomination, year, or unique symbols\n4. Click 'Add to Cart' on any note you like\n5. Review your cart and complete checkout\n\nAll notes are authenticity-verified before listing. 🛡️",
        sell:       "Listing your banknotes for sale:\n\n1. Log in and go to Dashboard → My Listings\n2. Click 'Add New Note'\n3. Upload high-resolution photos (front & back)\n4. Enter denomination, country, year, condition grade, and any unique serial/symbol details\n5. Set your asking price\n\nOur team reviews listings to maintain quality. 🚀",
        serial:     "Unique serial numbers and symbols are a major factor in a note's collectible value!\n\nExamples of high-value note types:\n• Fancy serials (111111, 123456, palindromes)\n• Star replacement notes ★\n• Error prints (misaligned, double print)\n• Commemorative or limited-series notes\n• Low serial numbers (000001 etc.)\n\nMention these in your listing for better visibility!",
        condition:  "Banknote condition is graded as follows:\n\n• UNC (Uncirculated) — Pristine, no wear\n• AU (About Uncirculated) — Barely circulated\n• EF/XF (Extremely Fine) — Light handling marks\n• VF (Very Fine) — Light folds, still crisp\n• F (Fine) — Moderate circulation\n• G (Good) — Heavy circulation, intact\n\nHigher grades significantly increase value!",
        orders:     "To track your orders:\n\n1. Log in to your account\n2. Go to Dashboard → Orders\n3. View purchase & sale history with live shipping status\n\nYou'll receive email updates at every stage — from payment to delivery.",
        cart:       "Managing your cart:\n\n1. Go to Dashboard → Cart\n2. Review your selected notes\n3. Adjust quantities or remove items\n4. Click 'Proceed to Checkout'\n\nYour cart is saved automatically so you won't lose your selections!",
        insights:   "Insights gives you market intelligence:\n\n📊 Historical sale prices for any note category\n📈 Demand trends by country & denomination\n💰 Your portfolio value over time\n🔍 Top-performing listings\n\nAccess it at Dashboard → Insights.",
        support:    "Need help? We're here for you:\n\n💬 Use this chat for instant answers\n📧 Email us: support@kinom.io\n🌐 Help centre: www.kinom.io/help\n\nOur support team is available Monday–Saturday, 9 AM – 6 PM.",
        security:   "Your safety is our priority:\n\n🔒 End-to-end encrypted transactions\n🔑 Two-factor authentication (2FA)\n🛡️ Authenticity verification on all listings\n✅ Verified seller badges\n📦 Tracked & insured shipping options\n\nShop and sell with complete confidence.",
        pricing:    "Kinom is free to join!\n\n• Buyers: No platform fees\n• Sellers: 3% transaction fee per sale\n• Premium sellers: ₹499/month — unlimited listings + priority placement\n\nAll fees are clearly shown before you confirm any listing or purchase.",
        navigation: "Quick guide to Kinom:\n\n🌐 Public pages: Home, About, Features, Contact\n🔐 Dashboard (after login):\n  • Browse Notes — discover the catalogue\n  • My Listings — manage what you're selling\n  • Cart — review and checkout\n  • Orders — track purchases & sales\n  • Insights — analytics\n  • Messages — chat with buyers/sellers",
        default:    "I'm Kinom's assistant! 😊 I can help you with:\n\n• Creating an account\n• Buying or listing rare banknotes\n• Understanding note conditions & grading\n• Fancy serials and unique symbols\n• Order tracking and shipping\n• Pricing and fees\n\nJust ask away!"
    };

    // ---- Match user message to a response ----
    function getResponse(msg) {
        const m = msg.toLowerCase().trim();
        if (m.match(/\b(hello|hi|hey|howdy|greetings|good morning|good afternoon)\b/)) return kb.greeting;
        if (m.match(/\b(account|sign ?up|register|create|join)\b/)) return kb.account;
        if (m.match(/\b(buy|purchase|shop|add to cart|checkout)\b/)) return kb.buy;
        if (m.match(/\b(sell|list|listing|seller|product)\b/)) return kb.sell;
        if (m.match(/\b(order|track|status|delivery|shipment)\b/)) return kb.orders;
        if (m.match(/\b(cart|basket|bag)\b/)) return kb.cart;
        if (m.match(/\b(insight|analytic|report|stat|chart|revenue)\b/)) return kb.insights;
        if (m.match(/\b(support|help|contact|email|reach)\b/)) return kb.support;
        if (m.match(/\b(secur|safe|encrypt|fraud|2fa|trust)\b/)) return kb.security;
        if (m.match(/\b(price|fee|cost|free|premium|subscription)\b/)) return kb.pricing;
        if (m.match(/\b(navigate|dashboard|where|menu|page|section)\b/)) return kb.navigation;
        return kb.default;
    }

    // ---- Open / Close ----
    function openChat() {
        isOpen = true;
        hasOpened = true;
        chatWindow.classList.add('open');
        chatWindow.setAttribute('aria-hidden', 'false');
        fabIconChat.style.display  = 'none';
        fabIconClose.style.display = '';
        fabBadge.classList.add('hidden');
        chatInput.focus();
    }

    function closeChat() {
        isOpen = false;
        chatWindow.classList.remove('open');
        chatWindow.setAttribute('aria-hidden', 'true');
        fabIconChat.style.display  = '';
        fabIconClose.style.display = 'none';
    }

    fab.addEventListener('click', () => isOpen ? closeChat() : openChat());
    chatClose.addEventListener('click', closeChat);

    // ---- Render message ----
    function renderMessage(text, type) {
        // Hide empty state
        if (chatEmpty.style.display !== 'none') {
            chatEmpty.style.display = 'none';
        }

        const row    = document.createElement('div');
        row.className = `msg-row ${type}`;

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.textContent = text;

        row.appendChild(bubble);
        chatMsgList.appendChild(row);
        scrollBottom();
    }

    // ---- Typing indicator ----
    function showTyping() {
        const row = document.createElement('div');
        row.className = 'typing-row';
        row.id = 'typingRow';

        const bubble = document.createElement('div');
        bubble.className = 'typing-bubble';
        [1,2,3].forEach(() => {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            bubble.appendChild(dot);
        });

        row.appendChild(bubble);
        chatMsgList.appendChild(row);
        scrollBottom();
    }

    function hideTyping() {
        const row = document.getElementById('typingRow');
        if (row) row.remove();
    }

    // ---- Scroll to bottom ----
    function scrollBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ---- Send message ----
    function sendMessage(text) {
        const msg = (text || chatInput.value).trim();
        if (!msg || isTyping) return;

        chatInput.value = '';
        chatSendBtn.disabled = true;
        renderMessage(msg, 'user');

        isTyping = true;
        showTyping();

        const delay = 900 + Math.floor(Math.random() * 600);
        setTimeout(() => {
            hideTyping();
            isTyping = false;
            chatSendBtn.disabled = false;
            renderMessage(getResponse(msg), 'bot');
        }, delay);
    }

    // ---- Starter buttons ----
    window.sendStarter = function (btn) {
        sendMessage(btn.textContent);
    };

    // ---- Form submit ----
    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        sendMessage();
    });

    // ---- Input state ----
    chatInput.addEventListener('input', () => {
        chatSendBtn.disabled = !chatInput.value.trim() || isTyping;
    });
    chatSendBtn.disabled = true;

    // ---- Close on outside click ----
    document.addEventListener('click', (e) => {
        if (isOpen && !chatWindow.contains(e.target) && !fab.contains(e.target)) {
            closeChat();
        }
    });

    // ---- Escape key ----
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isOpen) closeChat();
    });

})();
