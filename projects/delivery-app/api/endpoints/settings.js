// ============================================
// TechNomads Delivery System - Settings API
// ============================================

// Default settings
const defaultSettings = {
    appName: 'TechNomads',
    defaultLanguage: 'ar',
    defaultCurrency: 'YER',
    timezone: 'Asia/Aden',
    appDescription: 'نظام TechNomads للتوصيل - منصة متكاملة لإدارة طلبات التوصيل في اليمن',
    minOrderAmount: 500,
    maxDistance: 20,
    driverWaitTime: 10,
    taxRate: 5,
    serviceFee: 10,
    defaultPaymentMethod: 'cash',
    walletLimit: 10000,
    sessionTimeout: 24,
    loginAttempts: 5,
    twoFactorAuth: true,
    themeMode: 'light',
    primaryColor: '#6366f1',
    notifyOrderNew: true,
    notifyOrderUpdate: true,
    notifyDriverStatus: true,
    notifyPromotions: true,
    notifySystem: true,
    notifyEmail: false
};

// Current settings (could be stored in database)
let currentSettings = { ...defaultSettings };

// ============================================
// SETTINGS FUNCTIONS
// ============================================

function getSettings() {
    return { ...currentSettings };
}

function getSetting(key) {
    return currentSettings[key] !== undefined ? currentSettings[key] : null;
}

function updateSettings(data) {
    Object.assign(currentSettings, data);
    return { ...currentSettings };
}

function updateSetting(key, value) {
    if (currentSettings[key] !== undefined) {
        currentSettings[key] = value;
        return { ...currentSettings };
    }
    return null;
}

function resetSettings() {
    currentSettings = { ...defaultSettings };
    return { ...currentSettings };
}

function getPublicSettings() {
    // Return only settings that should be public
    const publicKeys = [
        'appName',
        'defaultCurrency',
        'minOrderAmount',
        'maxDistance',
        'taxRate',
        'serviceFee',
        'defaultPaymentMethod'
    ];

    const result = {};
    publicKeys.forEach(key => {
        result[key] = currentSettings[key];
    });

    return result;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    defaultSettings,
    currentSettings,
    getSettings,
    getSetting,
    updateSettings,
    updateSetting,
    resetSettings,
    getPublicSettings
};