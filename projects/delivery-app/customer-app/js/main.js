// ============================================
// TechNomads - Customer App
// Customer Module
// ============================================

const Customer = {
    // State
    currentUser: null,
    isLoggedIn: false,
    activeOrders: [],
    historyOrders: [],
    notifications: [],

    // ============================================
    // INIT
    // ============================================
    init() {
        this.loadUserData();
        this.loadOrders();
        this.loadNotifications();
        this.setupEventListeners();
    },

    // ============================================
    // LOAD USER DATA
    // ============================================
    loadUserData() {
        const userStr = localStorage.getItem('customerUser');
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
                this.isLoggedIn = true;
            } catch (e) {
                this.currentUser = null;
                this.isLoggedIn = false;
            }
        } else {
            // Check if logged in via simple flag
            this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (this.isLoggedIn) {
                this.currentUser = {
                    name: localStorage.getItem('userName') || 'مستخدم',
                    phone: localStorage.getItem('userPhone') || '+967 770 200 970'
                };
            }
        }
        this.updateUI();
    },

    // ============================================
    // LOAD ORDERS
    // ============================================
    loadOrders() {
        // Load active orders from localStorage
        const activeStr = localStorage.getItem('activeOrders');
        if (activeStr) {
            try {
                this.activeOrders = JSON.parse(activeStr);
            } catch (e) {
                this.activeOrders = [];
            }
        } else {
            // Mock active orders
            this.activeOrders = [
                {
                    id: '#1234',
                    status: 'delivering',
                    pickup: 'شارع تعز، جوار البنك المركزي',
                    dropoff: 'حي الصافية، خلف جامع النور',
                    amount: 15000,
                    time: 'منذ 5 دقائق',
                    driver: 'أحمد علي'
                }
            ];
            localStorage.setItem('activeOrders', JSON.stringify(this.activeOrders));
        }

        // Load history orders
        const historyStr = localStorage.getItem('historyOrders');
        if (historyStr) {
            try {
                this.historyOrders = JSON.parse(historyStr);
            } catch (e) {
                this.historyOrders = [];
            }
        } else {
            // Mock history orders
            this.historyOrders = [
                { id: '#1232', status: 'delivered', pickup: 'شارع تعز', dropoff: 'حي الصافية', amount: 22000, time: 'أمس', driver: 'أحمد علي' },
                { id: '#1229', status: 'delivered', pickup: 'جولة المصباحي', dropoff: 'حي الحصبة', amount: 9500, time: 'منذ 3 أيام', driver: 'سامي حسن' },
                { id: '#1225', status: 'cancelled', pickup: 'شارع الستين', dropoff: 'حي الزبيري', amount: 15000, time: 'منذ أسبوع', driver: '-' }
            ];
            localStorage.setItem('historyOrders', JSON.stringify(this.historyOrders));
        }
    },

    // ============================================
    // LOAD NOTIFICATIONS
    // ============================================
    loadNotifications() {
        const notifStr = localStorage.getItem('customerNotifications');
        if (notifStr) {
            try {
                this.notifications = JSON.parse(notifStr);
            } catch (e) {
                this.notifications = [];
            }
        } else {
            this.notifications = [
                { id: 1, title: 'طلب جديد', message: 'تم قبول طلبك #1234 من السائق أحمد علي', read: false, time: 'منذ 5 دقائق' },
                { id: 2, title: 'عرض خاص', message: 'خصم 20% على أول طلب لك! استخدم كود WELCOME20', read: false, time: 'منذ ساعة' }
            ];
            localStorage.setItem('customerNotifications', JSON.stringify(this.notifications));
        }
        this.updateNotificationBadge();
    },

    // ============================================
    // UPDATE UI
    // ============================================
    updateUI() {
        // Update user name in sidebar
        const nameEl = document.getElementById('sideMenuName');
        if (nameEl && this.currentUser) {
            nameEl.textContent = this.currentUser.name || 'مستخدم';
        }

        // Update user phone in sidebar
        const phoneEl = document.getElementById('sideMenuPhone');
        if (phoneEl && this.currentUser) {
            phoneEl.textContent = this.currentUser.phone || '+967 770 200 970';
        }

        // Update avatar
        const avatarEl = document.querySelector('.user-avatar-large img');
        if (avatarEl && this.currentUser) {
            const name = this.currentUser.name || 'مستخدم';
            avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
        }
    },

    // ============================================
    // UPDATE NOTIFICATION BADGE
    // ============================================
    updateNotificationBadge() {
        const unread = this.notifications.filter(n => !n.read).length;
        const badges = document.querySelectorAll('.notification-badge, .nav-badge');
        badges.forEach(badge => {
            if (badge.classList.contains('nav-badge')) {
                // Only update if it's the orders badge
                if (badge.closest('.nav-item')?.getAttribute('onclick')?.includes('orders')) {
                    badge.textContent = this.activeOrders.length || 0;
                    badge.style.display = this.activeOrders.length > 0 ? 'flex' : 'none';
                }
            } else {
                badge.textContent = unread;
                badge.style.display = unread > 0 ? 'flex' : 'none';
            }
        });
    },

    // ============================================
    // CREATE ORDER
    // ============================================
    createOrder(data) {
        const orderId = '#' + Math.floor(1000 + Math.random() * 9000);
        const newOrder = {
            id: orderId,
            status: 'pending',
            pickup: data.pickup,
            dropoff: data.dropoff,
            amount: data.amount || 2500,
            type: data.type || 'normal',
            time: 'الآن',
            driver: 'جاري البحث عن سائق...',
            createdAt: new Date().toISOString()
        };

        this.activeOrders.unshift(newOrder);
        localStorage.setItem('activeOrders', JSON.stringify(this.activeOrders));

        // Add notification
        this.addNotification({
            title: 'طلب جديد',
            message: `تم إنشاء الطلب ${orderId} بنجاح، جاري البحث عن سائق`,
            read: false,
            time: 'الآن'
        });

        this.updateNotificationBadge();
        return newOrder;
    },

    // ============================================
    // UPDATE ORDER STATUS
    // ============================================
    updateOrderStatus(orderId, status) {
        const order = this.activeOrders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            localStorage.setItem('activeOrders', JSON.stringify(this.activeOrders));

            // If completed, move to history
            if (status === 'delivered' || status === 'cancelled') {
                this.activeOrders = this.activeOrders.filter(o => o.id !== orderId);
                this.historyOrders.unshift(order);
                localStorage.setItem('activeOrders', JSON.stringify(this.activeOrders));
                localStorage.setItem('historyOrders', JSON.stringify(this.historyOrders));
            }

            this.updateNotificationBadge();
            return true;
        }
        return false;
    },

    // ============================================
    // ADD NOTIFICATION
    // ============================================
    addNotification(notification) {
        notification.id = Date.now();
        this.notifications.unshift(notification);
        localStorage.setItem('customerNotifications', JSON.stringify(this.notifications));
        this.updateNotificationBadge();
        this.showToast(notification.message, 'info');
    },

    // ============================================
    // MARK NOTIFICATION AS READ
    // ============================================
    markNotificationAsRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            localStorage.setItem('customerNotifications', JSON.stringify(this.notifications));
            this.updateNotificationBadge();
        }
    },

    // ============================================
    // MARK ALL NOTIFICATIONS AS READ
    // ============================================
    markAllNotificationsAsRead() {
        this.notifications.forEach(n => n.read = true);
        localStorage.setItem('customerNotifications', JSON.stringify(this.notifications));
        this.updateNotificationBadge();
        showToast('تم تحديد جميع الإشعارات كمقروءة', 'success');
    },

    // ============================================
    // GET ACTIVE ORDER
    // ============================================
    getActiveOrder() {
        return this.activeOrders.length > 0 ? this.activeOrders[0] : null;
    },

    // ============================================
    // GET ORDER BY ID
    // ============================================
    getOrderById(orderId) {
        let order = this.activeOrders.find(o => o.id === orderId);
        if (!order) {
            order = this.historyOrders.find(o => o.id === orderId);
        }
        return order;
    },

    // ============================================
    // SETUP EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        // Handle new order form submission
        const orderForm = document.getElementById('newOrderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const pickup = document.getElementById('pickupAddress')?.value;
                const dropoff = document.getElementById('dropoffAddress')?.value;
                if (pickup && dropoff) {
                    this.createOrder({ pickup, dropoff });
                    orderForm.reset();
                }
            });
        }
    },

    // ============================================
    // TOAST (wrapper)
    // ============================================
    showToast(message, type = 'info') {
        showToast(message, type);
    }
};

// ============================================
// EXPOSE GLOBALLY
// ============================================
window.Customer = Customer;

// ============================================
// AUTO-INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    Customer.init();
});