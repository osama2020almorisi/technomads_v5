// ============================================
// TechNomads Delivery System - Admin Dashboard
// Dashboard Specific JavaScript
// ============================================

// Dashboard State
const DashboardState = {
    stats: {
        totalOrders: 1247,
        deliveredOrders: 1089,
        pendingOrders: 24,
        totalRevenue: 45230,
        activeDrivers: 12,
        totalCustomers: 345,
        completionRate: 87,
        avgDeliveryTime: 28
    },
    recentActivities: [],
    chartData: {
        days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        orders: [45, 62, 38, 75, 55, 89, 42],
        revenue: [1200, 1800, 950, 2100, 1500, 2600, 1300]
    }
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initDashboardCharts();
    loadRecentActivities();
    initQuickStats();
    updateStatsCounters();
});

// ============================================
// CHARTS
// ============================================
function initDashboardCharts() {
    const ordersChart = document.getElementById('ordersChart');
    const revenueChart = document.getElementById('revenueChart');

    if (ordersChart) {
        renderChart(ordersChart, DashboardState.chartData.days, DashboardState.chartData.orders, 'primary');
    }

    if (revenueChart) {
        renderChart(revenueChart, DashboardState.chartData.days, DashboardState.chartData.revenue, 'success');
    }
}

function renderChart(container, labels, data, color = 'primary') {
    const max = Math.max(...data);

    container.innerHTML = labels.map((label, i) => {
        const height = (data[i] / max) * 100;
        const isHighest = data[i] === max;
        const barClass = isHighest ? color : `${color}-light`;

        return `
            <div class="chart-bar-wrapper">
                <div class="chart-value">${data[i]}</div>
                <div class="chart-bar ${barClass}" style="height: ${Math.max(height * 1.8, 20)}px;"></div>
                <div class="chart-label">${label}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// QUICK STATS
// ============================================
function initQuickStats() {
    const stats = [
        { id: 'activeDrivers', value: DashboardState.stats.activeDrivers, label: 'سائق نشط', icon: 'fa-motorcycle', color: 'primary' },
        { id: 'totalCustomers', value: DashboardState.stats.totalCustomers, label: 'عميل', icon: 'fa-users', color: 'info' },
        { id: 'completionRate', value: `${DashboardState.stats.completionRate}%`, label: 'نسبة الإنجاز', icon: 'fa-percent', color: 'success' },
        { id: 'avgDeliveryTime', value: `${DashboardState.stats.avgDeliveryTime} د`, label: 'متوسط التوصيل', icon: 'fa-clock', color: 'warning' }
    ];

    const container = document.getElementById('quickStatsContainer');
    if (!container) return;

    container.innerHTML = stats.map(stat => `
        <div class="quick-stat-card">
            <div class="quick-stat-info">
                <span class="quick-stat-label">${stat.label}</span>
                <span class="quick-stat-value">${stat.value}</span>
            </div>
            <div class="quick-stat-icon ${stat.color}" style="background: rgba(99, 102, 241, 0.1); color: var(--${stat.color});">
                <i class="fas ${stat.icon}"></i>
            </div>
        </div>
    `).join('');
}

// ============================================
// STATS COUNTERS
// ============================================
function updateStatsCounters() {
    const counters = {
        'totalOrders': DashboardState.stats.totalOrders,
        'deliveredOrders': DashboardState.stats.deliveredOrders,
        'pendingOrders': DashboardState.stats.pendingOrders,
        'totalRevenue': `$${DashboardState.stats.totalRevenue.toLocaleString()}`
    };

    Object.entries(counters).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    });
}

// ============================================
// ACTIVITY FEED
// ============================================
function loadRecentActivities() {
    const activities = [
        { id: 1, type: 'order', icon: 'fa-box', color: 'primary', text: 'طلب جديد <strong>#1234</strong> من محمد عبدالله', time: 'منذ 2 دقيقة' },
        { id: 2, type: 'driver', icon: 'fa-motorcycle', color: 'success', text: 'السائق <strong>أحمد علي</strong> بدأ التوصيل', time: 'منذ 5 دقائق' },
        { id: 3, type: 'payment', icon: 'fa-money-bill-wave', color: 'warning', text: 'دفعة جديدة بقيمة <strong>15,000 ر.ي</strong>', time: 'منذ 12 دقيقة' },
        { id: 4, type: 'order', icon: 'fa-box', color: 'danger', text: 'تم إلغاء الطلب <strong>#1230</strong>', time: 'منذ 25 دقيقة' },
        { id: 5, type: 'driver', icon: 'fa-user-plus', color: 'info', text: 'سائق جديد <strong>محمد فارس</strong> انضم', time: 'منذ ساعة' },
        { id: 6, type: 'order', icon: 'fa-check-circle', color: 'success', text: 'تم توصيل الطلب <strong>#1229</strong>', time: 'منذ ساعتين' }
    ];

    DashboardState.recentActivities = activities;
    renderActivities();
}

function renderActivities() {
    const container = document.getElementById('activityFeed');
    if (!container) return;

    container.innerHTML = DashboardState.recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: rgba(var(--${activity.color}-rgb, 99, 102, 241), 0.1); color: var(--${activity.color});">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// DATA REFRESH
// ============================================
function refreshDashboard() {
    showToast('جاري تحديث البيانات...', 'info');

    setTimeout(() => {
        // Simulate data refresh
        DashboardState.stats.totalOrders += Math.floor(Math.random() * 5);
        DashboardState.stats.deliveredOrders += Math.floor(Math.random() * 3);
        DashboardState.stats.totalRevenue += Math.floor(Math.random() * 500);

        updateStatsCounters();
        loadRecentActivities();
        initDashboardCharts();

        showToast('تم تحديث البيانات بنجاح', 'success');
    }, 1500);
}

// ============================================
// EXPORT
// ============================================
window.DashboardState = DashboardState;
window.refreshDashboard = refreshDashboard;