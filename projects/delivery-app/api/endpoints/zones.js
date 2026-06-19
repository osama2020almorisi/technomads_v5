// ============================================
// TechNomads Delivery System - Zones API
// ============================================

// Mock database
let zones = [];
let zoneIdCounter = 1;

// ============================================
// ZONE CRUD
// ============================================

function getZones(filters = {}) {
    let result = [...zones];

    if (filters.active !== undefined) {
        result = result.filter(z => z.active === (filters.active === 'true'));
    }

    return result;
}

function getZoneById(id) {
    return zones.find(z => z.id === id) || null;
}

function createZone(data) {
    const zone = {
        id: `Z${String(++zoneIdCounter).padStart(3, '0')}`,
        name: data.name,
        description: data.description || '',
        price: data.price || 2500,
        time: data.time || '30-45 دقيقة',
        active: data.active !== undefined ? data.active : true,
        deliveries: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    zones.push(zone);
    return zone;
}

function updateZone(id, data) {
    const zone = getZoneById(id);
    if (!zone) return null;

    Object.assign(zone, data);
    zone.updatedAt = new Date().toISOString();

    return zone;
}

function deleteZone(id) {
    const index = zones.findIndex(z => z.id === id);
    if (index === -1) return false;

    zones.splice(index, 1);
    return true;
}

function getZoneStats() {
    const total = zones.length;
    const active = zones.filter(z => z.active).length;
    const totalDeliveries = zones.reduce((sum, z) => sum + z.deliveries, 0);
    const avgPrice = zones.length > 0
        ? zones.reduce((sum, z) => sum + z.price, 0) / zones.length
        : 0;

    return {
        total,
        active,
        inactive: total - active,
        totalDeliveries,
        avgPrice: Math.round(avgPrice)
    };
}

// ============================================
// PRICING RULES
// ============================================

const pricingRules = {
    basePrice: 2500,
    fastDelivery: 3500,
    frozenDelivery: 4000,
    foodDelivery: 2000,
    taxRate: 0.05, // 5%
    serviceFee: 0.10, // 10%
    minOrderAmount: 500,
    maxDistance: 20 // km
};

function getPricingRules() {
    return { ...pricingRules };
}

function updatePricingRules(data) {
    Object.assign(pricingRules, data);
    return { ...pricingRules };
}

// ============================================
// SEED DATA
// ============================================
function seedZones() {
    const sampleZones = [
        {
            id: 'Z001',
            name: 'صنعاء',
            description: 'المركز الرئيسي، يشمل جميع أحياء العاصمة',
            price: 2500,
            time: '30-45 دقيقة',
            active: true,
            deliveries: 450,
            createdAt: new Date(Date.now() - 180 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'Z002',
            name: 'عدن',
            description: 'يشمل كريتر، الشيخ عثمان، والمعلا',
            price: 3000,
            time: '35-50 دقيقة',
            active: true,
            deliveries: 320,
            createdAt: new Date(Date.now() - 150 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'Z003',
            name: 'تعز',
            description: 'يشمل جميع أحياء مدينة تعز',
            price: 2800,
            time: '30-45 دقيقة',
            active: true,
            deliveries: 280,
            createdAt: new Date(Date.now() - 120 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'Z004',
            name: 'الحديدة',
            description: 'يشمل الميناء وجميع الأحياء',
            price: 2600,
            time: '30-45 دقيقة',
            active: true,
            deliveries: 150,
            createdAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'Z005',
            name: 'إب',
            description: 'يشمل مدينة إب والمناطق المحيطة',
            price: 2400,
            time: '35-50 دقيقة',
            active: true,
            deliveries: 120,
            createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    zones = sampleZones;
    zoneIdCounter = 5;
}

// Seed data on module load
seedZones();

// ============================================
// EXPORTS
// ============================================
module.exports = {
    zones,
    getZones,
    getZoneById,
    createZone,
    updateZone,
    deleteZone,
    getZoneStats,
    getPricingRules,
    updatePricingRules,
    seedZones
};