// ============================================
// TechNomads Delivery System - Admin Dashboard
// Main JavaScript
// ============================================

// Global State
const AppState = {
    sidebarCollapsed: false,
    currentPage: 'dashboard',
    notifications: [],
    orders: [],
    drivers: [],
    customers: [],
    zones: []
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initNotifications();
    loadDashboardData();
    initCharts();
    initLiveMap();
});

// ============================================
// SIDEBAR
// ============================================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');

    if (toggle) {
        toggle.addEventListener('click', () => {
            AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
            sidebar.classList.toggle('collapsed');

            // Update icon direction
            const icon = toggle.querySelector('i');
            if (AppState.sidebarCollapsed) {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-left');
            } else {
                icon.classList.remove('fa-chevron-left');
                icon.classList.add('fa-chevron-right');
            }

            // Save preference
            localStorage.setItem('sidebarCollapsed', AppState.sidebarCollapsed);
        });
    }

    // Restore preference
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') {
        sidebar.classList.add('collapsed');
        AppState.sidebarCollapsed = true;
    }
}

// ============================================
// NOTIFICATIONS
// ============================================
function initNotifications() {
    // Simulate real-time notifications
    setInterval(() => {
        checkNewNotifications();
    }, 30000); // Every 30 seconds
}

function checkNewNotifications() {
    // In production, this would fetch from API
    const mockNotifications = [
        { id: 1, type: 'order', message: 'طلب جديد #1234', time: 'منذ 2 دقيقة' },
        { id: 2, type: 'driver', message: 'السائق أحمد غادر للتوصيل', time: 'منذ 5 دقائق' },
        { id: 3, type: 'alert', message: 'تأخر في توصيل الطلب #1230', time: 'منذ 10 دقائق' }
    ];

    AppState.notifications = mockNotifications;
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badges = document.querySelectorAll('.header-btn .badge');
    badges.forEach(badge => {
        if (AppState.notifications.length > 0) {
            badge.textContent = AppState.notifications.length;
            badge.style.display = 'flex';
        }
    });
}

// ============================================
// DASHBOARD DATA
// ============================================
function loadDashboardData() {
    // Mock data - in production, fetch from API
    const mockOrders = [
        { id: '#1234', customer: 'محمد عبدالله', zone: 'صنعاء', driver: 'أحمد علي', status: 'processing', amount: 15000, time: 'منذ 10 دقائق' },
        { id: '#1233', customer: 'فاطمة أحمد', zone: 'عدن', driver: 'خالد سعيد', status: 'pending', amount: 8500, time: 'منذ 25 دقيقة' },
        { id: '#1232', customer: 'عبدالرحمن صالح', zone: 'تعز', driver: 'علي محمود', status: 'delivered', amount: 22000, time: 'منذ ساعة' },
        { id: '#1231', customer: 'سارة محمد', zone: 'الحديدة', driver: 'يوسف أحمد', status: 'processing', amount: 12000, time: 'منذ ساعتين' },
        { id: '#1230', customer: 'خالد عمر', zone: 'إب', driver: 'غير معين', status: 'pending', amount: 18000, time: 'منذ 3 ساعات' },
        { id: '#1229', customer: 'نورة سالم', zone: 'صنعاء', driver: 'أحمد علي', status: 'delivered', amount: 9500, time: 'منذ 4 ساعات' },
        { id: '#1228', customer: 'يوسف عبدالله', zone: 'عدن', driver: 'خالد سعيد', status: 'cancelled', amount: 7000, time: 'منذ 5 ساعات' },
    ];

    AppState.orders = mockOrders;
    renderOrdersTable(mockOrders);
    renderTopDrivers();
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>${order.zone}</td>
            <td>${order.driver}</td>
            <td><span class="status ${order.status}">${getStatusText(order.status)}</span></td>
            <td><strong>${order.amount.toLocaleString()} ر.ي</strong></td>
            <td style="color: var(--gray-light);">${order.time}</td>
            <td>
                <button class="btn btn-icon" style="color: var(--primary);" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-icon" style="color: var(--info);" onclick="editOrder('${order.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getStatusText(status) {
    const statuses = {
        'pending': 'قيد الانتظار',
        'processing': 'قيد التنفيذ',
        'delivered': 'تم التوصيل',
        'cancelled': 'ملغي'
    };
    return statuses[status] || status;
}

function renderTopDrivers() {
    const container = document.getElementById('topDrivers');
    if (!container) return;

    const drivers = [
        { name: 'أحمد علي', orders: 156, rating: 4.9, avatar: 'أ' },
        { name: 'خالد سعيد', orders: 142, rating: 4.8, avatar: 'خ' },
        { name: 'علي محمود', orders: 128, rating: 4.7, avatar: 'ع' },
        { name: 'يوسف أحمد', orders: 115, rating: 4.6, avatar: 'ي' },
        { name: 'محمد فارس', orders: 98, rating: 4.5, avatar: 'م' }
    ];

    container.innerHTML = drivers.map((driver, index) => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; ${index < drivers.length - 1 ? 'border-bottom: 1px solid var(--border);' : ''}">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                ${driver.avatar}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700;">${driver.name}</div>
                <div style="font-size: 12px; color: var(--gray);">${driver.orders} طلب</div>
            </div>
            <div style="text-align: left;">
                <div style="color: var(--warning); font-size: 14px;">
                    <i class="fas fa-star"></i> ${driver.rating}
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// CHARTS
// ============================================
function initCharts() {
    const chartContainer = document.getElementById('ordersChart');
    if (!chartContainer) return;

    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    const data = [45, 62, 38, 75, 55, 89, 42];
    const max = Math.max(...data);

    chartContainer.innerHTML = days.map((day, i) => {
        const height = (data[i] / max) * 100;
        const isHighest = data[i] === max;
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1;">
                <div style="font-size: 12px; font-weight: 700; color: ${isHighest ? 'var(--primary)' : 'var(--gray)'};">${data[i]}</div>
                <div style="width: 40px; background: ${isHighest ? 'var(--primary)' : 'var(--primary-light)'}; border-radius: 6px 6px 0 0; height: ${height * 2}px; transition: height 0.5s ease; opacity: ${isHighest ? 1 : 0.6};"></div>
                <div style="font-size: 11px; color: var(--gray);">${day}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// LIVE MAP
// ============================================
function initLiveMap() {
    const mapContainer = document.getElementById('liveMap');
    if (!mapContainer) return;

    // Simulate map with CSS
    setTimeout(() => {
        mapContainer.innerHTML = `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); position: relative; overflow: hidden;">
                <!-- Map Grid -->
                <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>

                <!-- Driver Markers -->
                <div class="driver-marker" style="position: absolute; top: 30%; left: 25%; transform: translate(-50%, -50%);">
                    <div style="width: 40px; height: 40px; background: var(--primary); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(99,102,241,0.4); animation: pulse 2s infinite;">
                        <i class="fas fa-motorcycle" style="color: white; transform: rotate(45deg); font-size: 16px;"></i>
                    </div>
                    <div style="position: absolute; top: 45px; left: 50%; transform: translateX(-50%); background: var(--dark); color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; white-space: nowrap;">أحمد علي</div>
                </div>

                <div class="driver-marker" style="position: absolute; top: 50%; left: 60%; transform: translate(-50%, -50%);">
                    <div style="width: 40px; height: 40px; background: var(--secondary); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">
                        <i class="fas fa-motorcycle" style="color: white; transform: rotate(45deg); font-size: 16px;"></i>
                    </div>
                    <div style="position: absolute; top: 45px; left: 50%; transform: translateX(-50%); background: var(--dark); color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; white-space: nowrap;">خالد سعيد</div>
                </div>

                <div class="driver-marker" style="position: absolute; top: 70%; left: 40%; transform: translate(-50%, -50%);">
                    <div style="width: 40px; height: 40px; background: var(--warning); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(245,158,11,0.4);">
                        <i class="fas fa-motorcycle" style="color: white; transform: rotate(45deg); font-size: 16px;"></i>
                    </div>
                    <div style="position: absolute; top: 45px; left: 50%; transform: translateX(-50%); background: var(--dark); color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; white-space: nowrap;">علي محمود</div>
                </div>

                <!-- Destination markers -->
                <div style="position: absolute; top: 35%; left: 70%;">
                    <div style="width: 20px; height: 20px; background: var(--danger); border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(239,68,68,0.4);"></div>
                </div>
                <div style="position: absolute; top: 60%; left: 30%;">
                    <div style="width: 20px; height: 20px; background: var(--danger); border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(239,68,68,0.4);"></div>
                </div>

                <!-- Map Legend -->
                <div style="position: absolute; bottom: 15px; right: 15px; background: white; padding: 12px; border-radius: 8px; box-shadow: var(--shadow); font-size: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <div style="width: 12px; height: 12px; background: var(--primary); border-radius: 50%;"></div>
                        <span>سائق نشط</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; background: var(--danger); border-radius: 50%;"></div>
                        <span>وجهة التوصيل</span>
                    </div>
                </div>
            </div>
        `;
    }, 1500);
}

// ============================================
// MODAL
// ============================================
function openNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) modal.classList.add('active');
}

function closeNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) modal.classList.remove('active');
}

function submitNewOrder() {
    const form = document.getElementById('newOrderForm');
    if (form && form.checkValidity()) {
        // Simulate API call
        showToast('تم إنشاء الطلب بنجاح!', 'success');
        closeNewOrderModal();
        form.reset();

        // Refresh data
        setTimeout(() => loadDashboardData(), 500);
    } else {
        form.reportValidity();
    }
}

// ============================================
// ORDER ACTIONS
// ============================================
function viewOrder(orderId) {
    showToast(`عرض تفاصيل الطلب ${orderId}`, 'info');
}

function editOrder(orderId) {
    showToast(`تعديل الطلب ${orderId}`, 'info');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${type === 'success' ? 'var(--secondary)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white;
        padding: 15px 30px;
        border-radius: var(--radius-sm);
        font-weight: 700;
        z-index: 9999;
        box-shadow: var(--shadow-lg);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
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
// REAL-TIME UPDATES (Simulated)
// ============================================
setInterval(() => {
    // Simulate live order count updates
    const totalOrders = document.getElementById('totalOrders');
    if (totalOrders) {
        const current = parseInt(totalOrders.textContent.replace(',', ''));
        if (Math.random() > 0.7) {
            totalOrders.textContent = (current + 1).toLocaleString();
        }
    }
}, 10000);

// Export for other modules
window.AppState = AppState;
window.showToast = showToast;
window.openNewOrderModal = openNewOrderModal;
window.closeNewOrderModal = closeNewOrderModal;
window.submitNewOrder = submitNewOrder;
window.viewOrder = viewOrder;
window.editOrder = editOrder;
// ============================================
// GLOBAL FUNCTIONS
// ============================================

// Close modals on overlay click
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Close modals on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
});

// ============================================
// TOAST SYSTEM
// ============================================
let toastTimeout = null;

function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existing = document.querySelector('.custom-toast');
    if (existing) {
        existing.remove();
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
        color: white;
        padding: 15px 30px;
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
    `;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    document.body.appendChild(toast);

    // Show
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Hide
    toastTimeout = setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

// ============================================
// FORMATTING HELPERS
// ============================================
function formatCurrency(amount) {
    return Number(amount).toLocaleString('ar-SA') + ' ر.ي';
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusColor(status) {
    const colors = {
        pending: 'warning',
        processing: 'info',
        delivered: 'success',
        cancelled: 'danger',
        active: 'success',
        offline: 'danger',
        on_break: 'warning',
        available: 'success',
        busy: 'warning'
    };
    return colors[status] || 'gray';
}

function getStatusText(status) {
    const texts = {
        pending: 'قيد الانتظار',
        processing: 'قيد التنفيذ',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
        active: 'نشط',
        offline: 'غير متاح',
        on_break: 'في استراحة',
        available: 'متاح',
        busy: 'مشغول'
    };
    return texts[status] || status;
}

// ============================================
// CONFIRM DIALOG
// ============================================
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getStatusColor = getStatusColor;
window.getStatusText = getStatusText;
window.confirmAction = confirmAction;