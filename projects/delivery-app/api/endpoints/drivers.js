// ============================================
// TechNomads Delivery System - Drivers API
// ============================================

// Mock database
let drivers = [];
let driverIdCounter = 1;

// ============================================
// DRIVER CRUD
// ============================================

function getDrivers(filters = {}) {
    let result = [...drivers];

    if (filters.status) {
        result = result.filter(d => d.status === filters.status);
    }

    if (filters.zone) {
        result = result.filter(d => d.zone === filters.zone);
    }

    return result;
}

function getDriverById(id) {
    return drivers.find(d => d.id === id) || null;
}

function createDriver(data) {
    const driver = {
        id: `D${String(++driverIdCounter).padStart(3, '0')}`,
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        zone: data.zone,
        status: data.status || 'available',
        vehicle: data.vehicle || '',
        plate: data.plate || '',
        rating: 0,
        orders: 0,
        earnings: 0,
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    drivers.push(driver);
    return driver;
}

function updateDriver(id, data) {
    const driver = getDriverById(id);
    if (!driver) return null;

    Object.assign(driver, data);
    driver.updatedAt = new Date().toISOString();

    return driver;
}

function updateDriverStatus(id, status) {
    const driver = getDriverById(id);
    if (!driver) return null;

    driver.status = status;
    driver.updatedAt = new Date().toISOString();

    return driver;
}

function deleteDriver(id) {
    const index = drivers.findIndex(d => d.id === id);
    if (index === -1) return false;

    drivers.splice(index, 1);
    return true;
}

function getDriverStats() {
    const total = drivers.length;
    const available = drivers.filter(d => d.status === 'available').length;
    const busy = drivers.filter(d => d.status === 'busy').length;
    const offline = drivers.filter(d => d.status === 'offline').length;

    const avgRating = drivers.length > 0
        ? drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length
        : 0;

    return {
        total,
        available,
        busy,
        offline,
        avgRating: Math.round(avgRating * 10) / 10,
        totalEarnings: drivers.reduce((sum, d) => sum + d.earnings, 0)
    };
}

// ============================================
// SEED DATA
// ============================================
function seedDrivers() {
    const sampleDrivers = [
        {
            id: 'D001',
            name: 'أحمد علي',
            phone: '+967 770 200 970',
            email: 'ahmed@technomads.ye',
            zone: 'صنعاء',
            status: 'busy',
            vehicle: 'تويوتا هايلوكس',
            plate: '1234 أ ب ج',
            rating: 4.9,
            orders: 156,
            earnings: 45000,
            joinedAt: new Date(Date.now() - 180 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'D002',
            name: 'خالد سعيد',
            phone: '+967 771 300 971',
            email: 'khalid@technomads.ye',
            zone: 'عدن',
            status: 'available',
            vehicle: 'هيونداي أكسنت',
            plate: '5678 د هـ و',
            rating: 4.8,
            orders: 142,
            earnings: 38000,
            joinedAt: new Date(Date.now() - 150 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'D003',
            name: 'علي محمود',
            phone: '+967 772 400 972',
            email: 'ali@technomads.ye',
            zone: 'تعز',
            status: 'offline',
            vehicle: 'دراجة نارية',
            plate: '9012 ي ك ل',
            rating: 4.7,
            orders: 128,
            earnings: 32000,
            joinedAt: new Date(Date.now() - 120 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'D004',
            name: 'يوسف أحمد',
            phone: '+967 773 500 973',
            email: 'yusuf@technomads.ye',
            zone: 'الحديدة',
            status: 'busy',
            vehicle: 'شيفروليه سبارك',
            plate: '3456 م ن س',
            rating: 4.6,
            orders: 115,
            earnings: 28000,
            joinedAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'D005',
            name: 'محمد فارس',
            phone: '+967 774 600 974',
            email: 'mohammed@technomads.ye',
            zone: 'صنعاء',
            status: 'available',
            vehicle: 'دراجة نارية',
            plate: '7890 ع ف ص',
            rating: 4.5,
            orders: 98,
            earnings: 22000,
            joinedAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    drivers = sampleDrivers;
    driverIdCounter = 5;
}

// Seed data on module load
seedDrivers();

// ============================================
// EXPORTS
// ============================================
module.exports = {
    drivers,
    getDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    updateDriverStatus,
    deleteDriver,
    getDriverStats,
    seedDrivers
};