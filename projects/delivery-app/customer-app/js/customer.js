// ============================================
// TechNomads Delivery System - Customer App
// Main JavaScript
// ============================================

// Global State
const CustomerState = {
    currentLocation: 'صنعاء',
    activeOrders: [],
    recentOrders: [],
    selectedOrderType: 'fast',
    notifications: []
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initCustomerApp();
    loadRecentOrders();
    initOrderTypes();
    initRealTimeTracking();
});

// ============================================
// INITIALIZATION
// ============================================
function initCustomerApp() {
    // Load saved location
    const savedLocation = localStorage.getItem('customerLocation');
    if (savedLocation) {
        CustomerState.currentLocation = savedLocation;
        document.getElementById('currentLocation').textContent = savedLocation;
    }

    // Initialize bottom nav
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.classList.contains('nav-item-center')) return;
            e.preventDefault();
            document.querySelectorAll('.bottom-nav .nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
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
// LOCATION
// ============================================
function showLocationModal() {
    document.getElementById('locationModal').classList.add('active');
}

function closeLocationModal() {
    document.getElementById('locationModal').classList.remove('active');
}

function selectCity(city) {
    CustomerState.currentLocation = city;
    document.getElementById('currentLocation').textContent = city;
    localStorage.setItem('customerLocation', city);

    // Update active state
    document.querySelectorAll('.city-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('span').textContent === city) {
            item.classList.add('active');
        }
    });

    closeLocationModal();
    showToast(`تم تغيير الموقع إلى ${city}`, 'success');
}

function getCurrentLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                showToast('تم تحديد موقعك الحالي', 'success');
                // In production: reverse geocode to get address
            },
            (error) => {
                showToast('تعذر تحديد الموقع', 'error');
            }
        );
    } else {
        showToast('المتصفح لا يدعم تحديد الموقع', 'error');
    }
}

// ============================================
// NEW ORDER
// ============================================
function newOrder(type) {
    CustomerState.selectedOrderType = type;
    document.getElementById('newOrderModal').classList.add('active');

    // Update order type selection
    document.querySelectorAll('.order-type').forEach(t => {
        t.classList.toggle('active', t.dataset.type === type);
    });
}

function closeNewOrderModal() {
    document.getElementById('newOrderModal').classList.remove('active');
}

function initOrderTypes() {
    document.querySelectorAll('.order-type').forEach(type => {
        type.addEventListener('click', function() {
            document.querySelectorAll('.order-type').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            CustomerState.selectedOrderType = this.dataset.type;
            updatePriceEstimate();
        });
    });
}

function updatePriceEstimate() {
    const fees = {
        'fast': { delivery: 3500, tax: 350 },
        'normal': { delivery: 2500, tax: 250 },
        'frozen': { delivery: 4000, tax: 400 }
    };

    const fee = fees[CustomerState.selectedOrderType] || fees['normal'];
    document.getElementById('deliveryFee').textContent = fee.delivery.toLocaleString() + ' ر.ي';
    document.getElementById('taxFee').textContent = fee.tax.toLocaleString() + ' ر.ي';
    document.getElementById('totalFee').textContent = (fee.delivery + fee.tax).toLocaleString() + ' ر.ي';
}

function submitOrder() {
    const pickup = document.getElementById('pickupAddress').value;
    const dropoff = document.getElementById('dropoffAddress').value;

    if (!pickup || !dropoff) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }

    // Simulate order creation
    const orderId = '#' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
        id: orderId,
        pickup: pickup,
        dropoff: dropoff,
        type: CustomerState.selectedOrderType,
        status: 'pending',
        amount: parseInt(document.getElementById('totalFee').textContent.replace(/[^0-9]/g, '')),
        time: 'الآن'
    };

    CustomerState.activeOrders.push(newOrder);

    closeNewOrderModal();
    showToast(`تم إنشاء الطلب ${orderId} بنجاح!`, 'success');

    // Reset form
    document.getElementById('newOrderForm').reset();

    // Show tracking after delay
    setTimeout(() => {
        showToast('تم قبول طلبك من السائق أحمد علي', 'info');
        updateActiveOrderUI();
    }, 3000);
}

// ============================================
// ACTIVE ORDER TRACKING
// ============================================
function updateActiveOrderUI() {
    const container = document.getElementById('activeOrdersContainer');
    if (!container) return;

    // In production, this would show actual tracking
    // For demo, we keep the static tracking card
}

function initRealTimeTracking() {
    // Simulate progress updates
    let progress = 60;
    const progressBar = document.querySelector('.progress-fill');
    const steps = document.querySelectorAll('.step');

    setInterval(() => {
        if (progress < 100) {
            progress += Math.random() * 5;
            if (progress > 100) progress = 100;

            if (progressBar) {
                progressBar.style.width = progress + '%';
            }

            // Update steps
            if (progress > 30 && steps[1]) {
                steps[1].classList.add('completed');
            }
            if (progress >= 100 && steps[2]) {
                steps[2].classList.add('completed');
                document.querySelector('.tracking-status').textContent = 'تم التوصيل';
            }
        }
    }, 5000);
}

function callDriver() {
    window.location.href = 'tel:+967770200970';
}

function messageDriver() {
    showToast('فتح المحادثة مع السائق...', 'info');
    // In production: open chat modal
}

// ============================================
// RECENT ORDERS
// ============================================
function loadRecentOrders() {
    const orders = [
        { id: '#1232', pickup: 'شارع تعز', dropoff: 'حي الصافية', amount: 22000, status: 'delivered', time: 'أمس' },
        { id: '#1229', pickup: 'جولة المصباحي', dropoff: 'حي الحصبة', amount: 9500, status: 'delivered', time: 'منذ 3 أيام' },
        { id: '#1225', pickup: 'شارع الستين', dropoff: 'حي الزبيري', amount: 15000, status: 'cancelled', time: 'منذ أسبوع' }
    ];

    CustomerState.recentOrders = orders;
    renderRecentOrders();
}

function renderRecentOrders() {
    const container = document.getElementById('recentOrdersList');
    if (!container) return;

    container.innerHTML = CustomerState.recentOrders.map(order => `
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
    const texts = { 'delivered': 'تم التوصيل', 'cancelled': 'ملغي', 'pending': 'قيد الانتظار' };
    return texts[status] || status;
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotifications() {
    showToast('لديك 2 إشعارات جديدة', 'info');
    // In production: show notifications panel
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
window.CustomerState = CustomerState;
window.toggleMenu = toggleMenu;
window.showLocationModal = showLocationModal;
window.closeLocationModal = closeLocationModal;
window.selectCity = selectCity;
window.getCurrentLocation = getCurrentLocation;
window.newOrder = newOrder;
window.closeNewOrderModal = closeNewOrderModal;
window.submitOrder = submitOrder;
window.callDriver = callDriver;
window.messageDriver = messageDriver;
window.showNotifications = showNotifications;
window.logout = logout;
window.showToast = showToast;
