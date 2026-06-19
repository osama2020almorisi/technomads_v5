// ============================================
// TechNomads Delivery System - Orders API
// ============================================

// Mock database
let orders = [];
let orderIdCounter = 1000;

// ============================================
// ORDER CRUD
// ============================================

/**
 * Get all orders with optional filters
 */
function getOrders(filters = {}) {
    let result = [...orders];

    if (filters.status) {
        result = result.filter(o => o.status === filters.status);
    }

    if (filters.zone) {
        result = result.filter(o => o.zone === filters.zone);
    }

    if (filters.driverId) {
        result = result.filter(o => o.driverId === filters.driverId);
    }

    if (filters.customerId) {
        result = result.filter(o => o.customerId === filters.customerId);
    }

    if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        result = result.filter(o => new Date(o.createdAt) >= from);
    }

    if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        result = result.filter(o => new Date(o.createdAt) <= to);
    }

    // Sort by createdAt descending
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
}

/**
 * Get order by ID
 */
function getOrderById(id) {
    return orders.find(o => o.id === id) || null;
}

/**
 * Create new order
 */
function createOrder(data) {
    const order = {
        id: `#${String(++orderIdCounter).padStart(4, '0')}`,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        zone: data.zone,
        type: data.type || 'normal',
        amount: data.amount || 0,
        status: 'pending',
        driverId: null,
        driverName: null,
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    orders.push(order);
    return order;
}

/**
 * Update order
 */
function updateOrder(id, data) {
    const order = getOrderById(id);
    if (!order) return null;

    Object.assign(order, data);
    order.updatedAt = new Date().toISOString();

    return order;
}

/**
 * Update order status
 */
function updateOrderStatus(id, status) {
    const order = getOrderById(id);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();

    return order;
}

/**
 * Assign driver to order
 */
function assignDriver(orderId, driverId, driverName) {
    const order = getOrderById(orderId);
    if (!order) return null;

    order.driverId = driverId;
    order.driverName = driverName;
    order.status = 'accepted';
    order.updatedAt = new Date().toISOString();

    return order;
}

/**
 * Delete order
 */
function deleteOrder(id) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return false;

    orders.splice(index, 1);
    return true;
}

/**
 * Get order statistics
 */
function getOrderStats() {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const accepted = orders.filter(o => o.status === 'accepted').length;
    const delivering = orders.filter(o => o.status === 'delivering').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;

    const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.amount || 0), 0);

    return {
        total,
        pending,
        accepted,
        delivering,
        delivered,
        cancelled,
        totalRevenue,
        completionRate: total > 0 ? Math.round((delivered / total) * 100) : 0
    };
}

// ============================================
// SEED DATA (for demo)
// ============================================
function seedOrders() {
    const sampleOrders = [
        {
            id: '#1234',
            customerName: 'محمد عبدالله',
            customerPhone: '+967 770 200 970',
            pickupAddress: 'شارع تعز، صنعاء',
            dropoffAddress: 'حي الصافية، صنعاء',
            zone: 'صنعاء',
            type: 'fast',
            amount: 15000,
            status: 'delivering',
            driverId: 'D001',
            driverName: 'أحمد علي',
            notes: 'اتصل عند الوصول',
            createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
            id: '#1233',
            customerName: 'فاطمة أحمد',
            customerPhone: '+967 771 300 971',
            pickupAddress: 'جولة المصباحي، عدن',
            dropoffAddress: 'حي كريتر، عدن',
            zone: 'عدن',
            type: 'normal',
            amount: 8500,
            status: 'pending',
            driverId: null,
            driverName: null,
            notes: '',
            createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 25 * 60000).toISOString()
        },
        {
            id: '#1232',
            customerName: 'عبدالرحمن صالح',
            customerPhone: '+967 772 400 972',
            pickupAddress: 'شارع الثلاثين، تعز',
            dropoffAddress: 'حي العصيفير، تعز',
            zone: 'تعز',
            type: 'fast',
            amount: 22000,
            status: 'delivered',
            driverId: 'D003',
            driverName: 'علي محمود',
            notes: 'الباب الأمامي',
            createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 10 * 60000).toISOString()
        },
        {
            id: '#1231',
            customerName: 'سارة محمد',
            customerPhone: '+967 773 500 973',
            pickupAddress: 'شارع الجيش، الحديدة',
            dropoffAddress: 'حي الميناء، الحديدة',
            zone: 'الحديدة',
            type: 'frozen',
            amount: 12000,
            status: 'accepted',
            driverId: 'D004',
            driverName: 'يوسف أحمد',
            notes: 'مواد مجمدة',
            createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 100 * 60000).toISOString()
        }
    ];

    orders = sampleOrders;
    orderIdCounter = 1234;
}

// Seed data on module load
seedOrders();

// ============================================
// EXPORTS
// ============================================
module.exports = {
    orders,
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    assignDriver,
    deleteOrder,
    getOrderStats,
    seedOrders
};