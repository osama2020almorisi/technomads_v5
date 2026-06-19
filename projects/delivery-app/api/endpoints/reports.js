// ============================================
// TechNomads Delivery System - Reports API
// ============================================

const ordersAPI = require('./orders');
const driversAPI = require('./drivers');
const customersAPI = require('./customers');
const zonesAPI = require('./zones');

// ============================================
// REPORT FUNCTIONS
// ============================================

function getOrdersReport(filters = {}) {
    const orders = ordersAPI.getOrders(filters);
    const total = orders.length;
    const completed = orders.filter(o => o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'accepted').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const revenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.amount || 0), 0);

    // Group by day
    const dailyData = {};
    orders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (!dailyData[date]) {
            dailyData[date] = { count: 0, revenue: 0 };
        }
        dailyData[date].count++;
        if (order.status === 'delivered') {
            dailyData[date].revenue += (order.amount || 0);
        }
    });

    const chartData = {
        labels: Object.keys(dailyData),
        values: Object.values(dailyData).map(d => d.count)
    };

    return {
        total,
        completed,
        pending,
        cancelled,
        revenue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        chart: chartData,
        orders
    };
}

function getDriversReport(filters = {}) {
    const drivers = driversAPI.getDrivers(filters);
    const total = drivers.length;
    const active = drivers.filter(d => d.status === 'active' || d.status === 'available').length;
    const offline = drivers.filter(d => d.status === 'offline').length;
    const onBreak = drivers.filter(d => d.status === 'on_break').length;

    const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
    const avgRating = total > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / total) : 0;

    // Top drivers by orders
    const topDrivers = [...drivers]
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5)
        .map(d => ({
            name: d.name,
            orders: d.orders,
            rating: d.rating,
            earnings: d.earnings
        }));

    return {
        total,
        active,
        offline,
        onBreak,
        totalEarnings,
        avgRating: Math.round(avgRating * 10) / 10,
        topDrivers,
        drivers
    };
}

function getRevenueReport(filters = {}) {
    const orders = ordersAPI.getOrders(filters);
    const delivered = orders.filter(o => o.status === 'delivered');

    const totalRevenue = delivered.reduce((sum, o) => sum + (o.amount || 0), 0);
    const taxRevenue = totalRevenue * 0.05;
    const serviceRevenue = totalRevenue * 0.10;
    const netRevenue = totalRevenue - taxRevenue - serviceRevenue;

    // Monthly revenue
    const monthlyData = {};
    delivered.forEach(order => {
        const month = new Date(order.createdAt).toISOString().slice(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = 0;
        }
        monthlyData[month] += (order.amount || 0);
    });

    const chartData = {
        labels: Object.keys(monthlyData),
        values: Object.values(monthlyData)
    };

    return {
        totalRevenue,
        taxRevenue,
        serviceRevenue,
        netRevenue,
        orderCount: delivered.length,
        averageOrderValue: delivered.length > 0 ? Math.round(totalRevenue / delivered.length) : 0,
        chart: chartData,
        orders: delivered
    };
}

function getZonesReport(filters = {}) {
    const zones = zonesAPI.getZones(filters);
    const total = zones.length;
    const active = zones.filter(z => z.active).length;

    const totalDeliveries = zones.reduce((sum, z) => sum + z.deliveries, 0);
    const avgPrice = total > 0 ? (zones.reduce((sum, z) => sum + z.price, 0) / total) : 0;

    // Zone performance
    const zonePerformance = zones.map(z => ({
        name: z.name,
        deliveries: z.deliveries,
        price: z.price,
        revenue: z.deliveries * z.price,
        active: z.active
    }));

    return {
        total,
        active,
        inactive: total - active,
        totalDeliveries,
        avgPrice: Math.round(avgPrice),
        zonePerformance
    };
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
function exportReport(type, format = 'pdf', filters = {}) {
    let data;
    switch (type) {
        case 'orders':
            data = getOrdersReport(filters);
            break;
        case 'drivers':
            data = getDriversReport(filters);
            break;
        case 'revenue':
            data = getRevenueReport(filters);
            break;
        case 'zones':
            data = getZonesReport(filters);
            break;
        default:
            return null;
    }

    // In production: generate PDF/Excel file
    return {
        success: true,
        type,
        format,
        data,
        generatedAt: new Date().toISOString()
    };
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    getOrdersReport,
    getDriversReport,
    getRevenueReport,
    getZonesReport,
    exportReport
};