// ============================================
// TechNomads Delivery System - Driver App
// Main JavaScript
// ============================================

// Global State
const DriverAppState = {
    isOnline: true,
    currentOrder: null,
    orderStatus: 'pending',
    availableOrders: [],
    historyOrders: [],
    notifications: [],
    driverInfo: {
        name: 'أحمد علي',
        phone: '+967 770 200 970',
        rating: 4.9,
        orders: 156,
        earnings: 45000,
        avatar: 'أ'
    }
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initDriverApp();
    loadAvailableOrders();
    loadHistoryOrders();
    initRealTimeUpdates();
    initNotifications();
});

// ============================================
// INITIALIZATION
// ============================================
function initDriverApp() {
    // Load saved status
    const savedStatus = localStorage.getItem('driverStatus');
    if (savedStatus === 'offline') {
        setDriverStatus(false);
    }

    // Load current order
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
        DriverAppState.currentOrder = JSON.parse(savedOrder);
        DriverAppState.orderStatus = localStorage.getItem('orderStatus') || 'pending';
        updateOrderUI();
    }

    // Update driver info
    updateDriverInfo();
}

function updateDriverInfo() {
    const info = DriverAppState.driverInfo;
    const avatarEl = document.querySelector('.driver-avatar-large');
    const nameEl = document.querySelector('.driver-info .name');
    const ratingEl = document.querySelector('.driver-rating .rating-value');
    const ordersEl = document.querySelector('.driver-stats .orders-value');

    if (avatarEl) avatarEl.textContent = info.avatar;
    if (nameEl) nameEl.textContent = info.name;
    if (ratingEl) ratingEl.textContent = info.rating;
    if (ordersEl) ordersEl.textContent = info.orders;
}

// ============================================
// STATUS TOGGLE
// ============================================
function toggleStatus() {
    const newStatus = !DriverAppState.isOnline;
    setDriverStatus(newStatus);
}

function setDriverStatus(online) {
    DriverAppState.isOnline = online;
    const toggle = document.getElementById('statusToggle');
    const dot = toggle?.querySelector('.status-dot');
    const text = document.getElementById('statusText');

    if (online) {
        toggle?.classList.remove('offline');
        if (dot) dot.classList.remove('offline');
        if (text) text.textContent = 'متاح';
        showToast('أنت الآن متاح لاستلام الطلبات', 'success');
    } else {
        toggle?.classList.add('offline');
        if (dot) dot.classList.add('offline');
        if (text) text.textContent = 'غير متاح';
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

    overlay?.classList.toggle('active');
    menu?.classList.toggle('active');
}

// ============================================
// NOTIFICATIONS
// ============================================
function initNotifications() {
    setInterval(() => {
        if (Math.random() > 0.8 && DriverAppState.isOnline) {
            showToast('طلب جديد متاح!', 'info');
        }
    }, 30000);
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
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
        gap: 10px;
        max-width: 90%;
        font-family: 'Tajawal', sans-serif;
        text-align: right;
    `;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="font-size: 16px; flex-shrink: 0;"></i> ${message}`;
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

// ============================================
// EXPORT
// ============================================
window.DriverAppState = DriverAppState;
window.toggleStatus = toggleStatus;
window.toggleMenu = toggleMenu;
window.logout = logout;
window.showToast = showToast;