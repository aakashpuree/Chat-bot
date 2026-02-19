const { createApp, ref, nextTick, watch, onMounted } = Vue;

createApp({
    setup() {
        const isOpen = ref(false);
        const inputMessage = ref('');
        const messages = ref([]);
        const isTyping = ref(false);
        const messagesContainer = ref(null);

        const conversationStarters = [
            'How do I create an account?',
            'How can I buy products?',
            'Where can I manage my listings?',
            'How do I track my orders?'
        ];

        const knowledgeBase = {
            greeting: "Hello! 👋 How can I assist you today?",
            account: "To create an account on Kinom:\n\n1. Visit the homepage\n2. Click 'Signup' in the navigation\n3. Fill in your details\n4. Verify your email\n\nNeed help with anything else?",
            buy: "To buy digital currency products:\n\n1. Login to your account\n2. Go to Dashboard → Products\n3. Browse and 'Add to Cart'\n4. Review in Carts and complete in Orders.",
            sell: "To sell products on Kinom:\n\n1. Login to your dashboard\n2. Go to Dashboard → Your Products\n3. Click 'Add New Product'\n4. Manage inventory and track sales in Orders.",
            orders: "To track your orders:\n\n1. Login to your dashboard\n2. Go to Dashboard → Orders\n3. View purchase and sale history.",
            cart: "To manage your cart:\n\n1. Go to Dashboard → Carts\n2. Adjust quantities\n3. Proceed to checkout.",
            insights: "The Insights page provides analytics, sales reports, and market trends. Access it at Dashboard → Insights.",
            chat: "Communicate via Dashboard → Chats. You can also use the Contact section on the homepage for support.",
            navigation: "Public: Home (/), Login, Signup.\nDashboard: Products, Carts, Orders, Insights, Your Products, Chats.",
            default: "I'm here to help with Kinom! I can assist with accounts, buying, selling, and tracking orders. What would you like to know?"
        };

        const toggleChat = () => { isOpen.value = !isOpen.value; };

        const scrollToBottom = async () => {
            await nextTick();
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
        };

        const getBotResponse = (userMessage) => {
            const msg = userMessage.toLowerCase();
            if (msg.includes('hello') || msg.includes('hi')) return knowledgeBase.greeting;
            if (msg.includes('account') || msg.includes('signup') || msg.includes('create')) return knowledgeBase.account;
            if (msg.includes('buy') || msg.includes('products')) return knowledgeBase.buy;
            if (msg.includes('sell') || msg.includes('listing')) return knowledgeBase.sell;
            if (msg.includes('order') || msg.includes('track')) return knowledgeBase.orders;
            if (msg.includes('cart')) return knowledgeBase.cart;
            if (msg.includes('insight') || msg.includes('analytics')) return knowledgeBase.insights;
            if (msg.includes('chat') || msg.includes('support')) return knowledgeBase.chat;
            if (msg.includes('navigate') || msg.includes('where')) return knowledgeBase.navigation;
            return knowledgeBase.default;
        };

        const sendMessage = async (text) => {
            const messageText = text || inputMessage.value.trim();
            if (!messageText) return;

            messages.value.push({ type: 'user', text: messageText });
            inputMessage.value = '';
            await scrollToBottom();

            isTyping.value = true;
            await scrollToBottom();

            setTimeout(async () => {
                isTyping.value = false;
                messages.value.push({ type: 'bot', text: getBotResponse(messageText) });
                await scrollToBottom();
            }, 1000 + Math.random() * 500);
        };

        const handleSubmit = () => sendMessage();

        watch(messages, scrollToBottom, { deep: true });

        return {
            isOpen, inputMessage, messages, isTyping, messagesContainer,
            conversationStarters, toggleChat, sendMessage, handleSubmit
        };
    }
}).mount('#app');
