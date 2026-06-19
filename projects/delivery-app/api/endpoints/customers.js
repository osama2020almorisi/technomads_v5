// ============================================
// TechNomads Delivery System - Customers API
// ============================================

// Mock database
let customers = [];
let customerIdCounter = 1;

// ============================================
// CUSTOMER CRUD
// ============================================

function getCustomers(filters = {}) {
    let result = [...customers];

    if (filters.zone) {
        result = result.filter(c => c.zone === filters.zone);
    }

    if (filters.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.phone.includes(search) ||
            c.email.toLowerCase().includes(search)
        );
    }

    return result;
}

function getCustomerById(id) {
    return customers.find(c => c.id === id) || null;
}

function getCustomerByPhone(phone) {
    return customers.find(c => c.phone === phone) || null;
}

function createCustomer(data) {
    const customer = {
        id: `C${String(++customerIdCounter).padStart(3, '0')}`,
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        zone: data.zone,
        address: data.address || '',
        orders: 0,
        totalSpent: 0,
        rating: 0,
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    customers.push(customer);
    return customer;
}

function updateCustomer(id, data) {
    const customer = getCustomerById(id);
    if (!customer) return null;

    Object.assign(customer, data);
    customer.updatedAt = new Date().toISOString();

    return customer;
}

function deleteCustomer(id) {
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return false;

    customers.splice(index, 1);
    return true;
}

function getCustomerStats() {
    const total = customers.length;
    const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

    return {
        total,
        totalOrders,
        totalSpent,
        avgOrders: total > 0 ? Math.round((totalOrders / total) * 10) / 10 : 0,
        avgSpent: total > 0 ? Math.round(totalSpent / total) : 0
    };
}

// ============================================
// SEED DATA
// ============================================
function seedCustomers() {
    const sampleCustomers = [
        {
            id: 'C001',
            name: 'محمد عبدالله',
            phone: '+967 770 200 970',
            email: 'mohammed@email.com',
            zone: 'صنعاء',
            address: 'شارع تعز، صنعاء',
            orders: 45,
            totalSpent: 675000,
            rating: 4.9,
            joinedAt: new Date(Date.now() - 180 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'C002',
            name: 'فاطمة أحمد',
            phone: '+967 771 300 971',
            email: 'fatima@email.com',
            zone: 'عدن',
            address: 'حي كريتر، عدن',
            orders: 32,
            totalSpent: 480000,
            rating: 4.8,
            joinedAt: new Date(Date.now() - 150 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'C003',
            name: 'عبدالرحمن صالح',
            phone: '+967 772 400 972',
            email: 'abdulrahman@email.com',
            zone: 'تعز',
            address: 'حي العصيفير، تعز',
            orders: 28,
            totalSpent: 420000,
            rating: 4.7,
            joinedAt: new Date(Date.now() - 120 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'C004',
            name: 'سارة محمد',
            phone: '+967 773 500 973',
            email: 'sara@email.com',
            zone: 'الحديدة',
            address: 'حي الميناء، الحديدة',
            orders: 22,
            totalSpent: 330000,
            rating: 4.6,
            joinedAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'C005',
            name: 'خالد عمر',
            phone: '+967 774 600 974',
            email: 'khalid@email.com',
            zone: 'إب',
            address: 'حي القاهرة، إب',
            orders: 18,
            totalSpent: 270000,
            rating: 4.5,
            joinedAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    customers = sampleCustomers;
    customerIdCounter = 5;
}

// Seed data on module load
seedCustomers();

// ============================================
// EXPORTS
// ============================================
module.exports = {
    customers,
    getCustomers,
    getCustomerById,
    getCustomerByPhone,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    seedCustomers
};