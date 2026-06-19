// ============================================
// TechNomads Delivery System - Driver App
// Main JavaScript
// ============================================

// Global State
const DriverState = {
    isOnline: true,
    currentOrder: null,
    orderStatus: 'pending', // pending, pickup, delivering, delivered
    availableOrders: [],
    historyOrders: [],
    notifications: []
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initDriverApp();
    loadAvailableOrders();
    loadHistoryOrders();
    initRealTimeUpdates();
});

// ============================================
// INITIALIZATION
// ============================================
function initDriverApp() {
    // Check saved status
    const savedStatus = localStorage.getItem('driverStatus');
    if (savedStatus === 'offline') {
        setDriverStatus(false);
    }

    // Initialize current order from localStorage
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
        DriverState.currentOrder = JSON.parse(savedOrder);
        DriverState.orderStatus = localStorage.getItem('orderStatus') || 'pending';
        updateOrderUI();
    } else {
        document.getElementById('currentOrderCard').style.display = 'none';
    }
}

// ============================================
// STATUS TOGGLE
// ============================================
function toggleStatus() {
    const newStatus = !DriverState.isOnline;
    setDriverStatus(newStatus);
}

function setDriverStatus(online) {
    DriverState.isOnline = online;
    const toggle = document.getElementById('statusToggle');
    const dot = toggle.querySelector('.status-dot');
    const text = document.getElementById('statusText');

    if (online) {
        toggle.classList.remove('offline');
        dot.classList.remove('offline');
        text.textContent = 'متاح';
        showToast('أنت الآن متاح لاستلام الطلبات', 'success');
    } else {
        toggle.classList.add('offline');
        dot.classList.add('offline');
        text.textContent = 'غير متاح';
        showToast('أنت الآن غير متاح', 'info');
    }

    localStorage.setItem('driverStatus', online ? 'online' : 'offline');
}

// ============================================
// SIDE MENU
// ============================================
function toggleMenu() {
    const overlay = document.getElementById('sideMenuOverlay');
    const menu = document.getElementById('sideMenu');

    overlay.classList.toggle('active');
    menu.classList.toggle('active');
}

// ============================================
// ORDERS
// ============================================
function loadAvailableOrders() {
    const orders = [
        { id: '#1235', pickup: 'شارع الستين', dropoff: 'حي الحصبة', amount: 12000, distance: '1.8 كم', time: '10 دقائق' },
        { id: '#1236', pickup: 'جولة المصباحي', dropoff: 'حي الصافية', amount: 18000, distance: '3.2 كم', time: '20 دقيقة' },
        { id: '#1237', pickup: 'شارع تعز', dropoff: 'حي الزبيري', amount: 9500, distance: '1.2 كم', time: '8 دقائق' }
    ];

    DriverState.availableOrders = orders;
    renderAvailableOrders();
}

function renderAvailableOrders() {
    const container = document.getElementById('availableOrdersList');
    if (!container) return;

    if (DriverState.availableOrders.length === 0 || DriverState.currentOrder) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--gray);">
                <i class="fas fa-box-open" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                <p>لا توجد طلبات متاحة حالياً</p>
            </div>
        `;
        return;
    }

    container.innerHTML = DriverState.availableOrders.map(order => `
        <div class="order-item" onclick="showAcceptModal('${order.id}')">
            <div class="order-item-header">
                <span class="order-item-id">${order.id}</span>
                <span class="order-item-status pending">جديد</span>
            </div>
            <div class="order-item-route">
                <i class="fas fa-map-marker-alt"></i>
                <span>${order.pickup}</span>
                <i class="fas fa-arrow-left" style="font-size: 10px;"></i>
                <span>${order.dropoff}</span>
            </div>
            <div class="order-item-footer">
                <span class="order-item-amount">${order.amount.toLocaleString()} ر.ي</span>
                <span class="order-item-time">
                    <i class="fas fa-road" style="margin-left: 4px;"></i>${order.distance}
                </span>
            </div>
        </div>
    `).join('');

    document.getElementById('availableCount').textContent = DriverState.availableOrders.length;
}

function loadHistoryOrders() {
    const orders = [
        { id: '#1232', pickup: 'شارع تعز', dropoff: 'حي الصافية', amount: 22000, status: 'delivered', time: 'منذ ساعة' },
        { id: '#1229', pickup: 'جولة المصباحي', dropoff: 'حي الحصبة', amount: 9500, status: 'delivered', time: 'منذ 4 ساعات' },
        { id: '#1228', pickup: 'شارع الستين', dropoff: 'حي الزبيري', amount: 7000, status: 'cancelled', time: 'منذ 5 ساعات' }
    ];

    DriverState.historyOrders = orders;
    renderHistoryOrders();
}

function renderHistoryOrders() {
    const container = document.getElementById('historyOrdersList');
    if (!container) return;

    container.innerHTML = DriverState.historyOrders.map(order => `
        <div class="order-item">
            <div class="order-item-header">
                <span class="order-item-id">${order.id}</span>
                <span class="order-item-status ${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-item-route">
                <i class="fas fa-map-marker-alt"></i>
                <span>${order.pickup}</span>
                <i class="fas fa-arrow-left" style="font-size: 10px;"></i>
                <span>${order.dropoff}</span>
            </div>
            <div class="order-item-footer">
                <span class="order-item-amount">${order.amount.toLocaleString()} ر.ي</span>
                <span class="order-item-time">${order.time}</span>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const texts = { 'delivered': 'تم التوصيل', 'cancelled': 'ملغي', 'pending': 'جديد' };
    return texts[status] || status;
}

// ============================================
// ORDER ACCEPT MODAL
// ============================================
function showAcceptModal(orderId) {
    const order = DriverState.availableOrders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('modalPickup').textContent = order.pickup;
    document.getElementById('modalDropoff').textContent = order.dropoff;
    document.getElementById('modalAmount').textContent = order.amount.toLocaleString() + ' ر.ي';
    document.getElementById('modalDistance').textContent = order.distance;
    document.getElementById('modalTime').textContent = order.time;

    DriverState.selectedOrder = order;
    document.getElementById('acceptOrderModal').classList.add('active');
}

function closeAcceptModal() {
    document.getElementById('acceptOrderModal').classList.remove('active');
    DriverState.selectedOrder = null;
}

function acceptOrder() {
    if (!DriverState.selectedOrder) return;

    // Set as current order
    DriverState.currentOrder = {
        ...DriverState.selectedOrder,
        customer: 'محمد عبدالله',
        phone: '+967 770 200 970',
        pickupAddress: 'شارع تعز، جوار البنك المركزي',
        dropoffAddress: 'حي الصافية، خلف جامع النور'
    };

    DriverState.orderStatus = 'pending';

    // Remove from available
    DriverState.availableOrders = DriverState.availableOrders.filter(
        o => o.id !== DriverState.selectedOrder.id
    );

    // Save to localStorage
    localStorage.setItem('currentOrder', JSON.stringify(DriverState.currentOrder));
    localStorage.setItem('orderStatus', 'pending');

    closeAcceptModal();
    updateOrderUI();
    renderAvailableOrders();

    showToast('تم قبول الطلب بنجاح!', 'success');
}

// ============================================
// CURRENT ORDER ACTIONS
// ============================================
function updateOrderUI() {
    const card = document.getElementById('currentOrderCard');
    if (!card) return;

    if (!DriverState.currentOrder) {
        card.style.display = 'none';
        return;
    }

    card.style.display = 'block';

    const actionBtn = document.getElementById('actionBtn');
    const actionBtnText = document.getElementById('actionBtnText');

    switch(DriverState.orderStatus) {
        case 'pending':
            actionBtnText.textContent = 'بدء التوصيل';
            actionBtn.className = 'btn-action primary';
            break;
        case 'pickup':
            actionBtnText.textContent = 'تم الاستلام';
            actionBtn.className = 'btn-action success';
            break;
        case 'delivering':
            actionBtnText.textContent = 'تم التوصيل';
            actionBtn.className = 'btn-action success';
            break;
    }
}

function updateOrderStatus() {
    const statuses = ['pending', 'pickup', 'delivering', 'delivered'];
    const currentIndex = statuses.indexOf(DriverState.orderStatus);

    if (currentIndex < statuses.length - 1) {
        DriverState.orderStatus = statuses[currentIndex + 1];
        localStorage.setItem('orderStatus', DriverState.orderStatus);

        if (DriverState.orderStatus === 'delivered') {
            // Complete order
            DriverState.historyOrders.unshift({
                ...DriverState.currentOrder,
                status: 'delivered',
                time: 'الآن'
            });

            // Clear current order
            DriverState.currentOrder = null;
            localStorage.removeItem('currentOrder');
            localStorage.removeItem('orderStatus');

            showToast('تم إتمام الطلب بنجاح! +15,000 ر.ي', 'success');

            // Update stats
            const completedEl = document.getElementById('completedOrders');
            completedEl.textContent = parseInt(completedEl.textContent) + 1;

            const earningsEl = document.getElementById('todayEarnings');
            earningsEl.textContent = (parseInt(earningsEl.textContent.replace(/,/g, '')) + 15000).toLocaleString();
        } else {
            const messages = {
                'pickup': 'بدأت في الاستلام',
                'delivering': 'في طريقك للتوصيل'
            };
            showToast(messages[DriverState.orderStatus], 'info');
        }

        updateOrderUI();
        renderHistoryOrders();
    }
}

function callCustomer() {
    if (DriverState.currentOrder && DriverState.currentOrder.phone) {
        window.location.href = `tel:${DriverState.currentOrder.phone}`;
    } else {
        showToast('جاري الاتصال بالعميل...', 'info');
    }
}

function navigateToOrder() {
    showToast('جاري فتح الخريطة...', 'info');
    // In production: window.open(`https://maps.google.com/?q=${lat},${lng}`);
}

// ============================================
// REAL-TIME UPDATES
// ============================================
function initRealTimeUpdates() {
    // Simulate incoming orders
    setInterval(() => {
        if (DriverState.isOnline && !DriverState.currentOrder && Math.random() > 0.8) {
            const newOrder = {
                id: `#${1238 + DriverState.availableOrders.length}`,
                pickup: ['شارع الستين', 'جولة المصباحي', 'حي الصافية'][Math.floor(Math.random() * 3)],
                dropoff: ['حي الحصبة', 'حي الزبيري', 'شارع تعز'][Math.floor(Math.random() * 3)],
                amount: Math.floor(Math.random() * 15000) + 5000,
                distance: (Math.random() * 4 + 0.5).toFixed(1) + ' كم',
                time: Math.floor(Math.random() * 20 + 5) + ' دقيقة'
            };

            DriverState.availableOrders.push(newOrder);
            renderAvailableOrders();

            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('طلب توصيل جديد!', {
                    body: `من ${newOrder.pickup} إلى ${newOrder.dropoff} - ${newOrder.amount.toLocaleString()} ر.ي`,
                    icon: '/images/logo.png'
                });
            }

            showToast('طلب جديد متاح!', 'info');
        }
    }, 15000); // Check every 15 seconds

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${type === 'success' ? 'var(--secondary)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white;
        padding: 14px 24px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 90%;
    `;

    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        localStorage.clear();
        showToast('تم تسجيل الخروج بنجاح', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Export
window.DriverState = DriverState;
window.toggleStatus = toggleStatus;
window.toggleMenu = toggleMenu;
window.showAcceptModal = showAcceptModal;
window.closeAcceptModal = closeAcceptModal;
window.acceptOrder = acceptOrder;
window.updateOrderStatus = updateOrderStatus;
window.callCustomer = callCustomer;
window.navigateToOrder = navigateToOrder;
window.logout = logout;
window.showToast = showToast;
