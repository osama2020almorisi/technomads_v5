// ============================================
// TechNomads Delivery System - API Constants
// ============================================

module.exports = {
    // Order Statuses
    ORDER_STATUS: {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        PICKUP: 'pickup',
        DELIVERING: 'delivering',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled'
    },

    // Driver Statuses
    DRIVER_STATUS: {
        OFFLINE: 'offline',
        AVAILABLE: 'available',
        BUSY: 'busy',
        ON_BREAK: 'on_break'
    },

    // Order Types
    ORDER_TYPES: {
        FAST: 'fast',
        NORMAL: 'normal',
        FROZEN: 'frozen',
        FOOD: 'food'
    },

    // Roles
    ROLES: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin',
        DRIVER: 'driver',
        CUSTOMER: 'customer'
    },

    // Payment Methods
    PAYMENT_METHODS: {
        CASH: 'cash',
        CARD: 'card',
        WALLET: 'wallet'
    },

    // Notification Types
    NOTIFICATION_TYPES: {
        ORDER: 'order',
        DRIVER: 'driver',
        PAYMENT: 'payment',
        SYSTEM: 'system',
        PROMOTION: 'promotion'
    },

    // Pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    // File Upload
    UPLOAD: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_MIME_TYPES: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf'
        ]
    },

    // Cache
    CACHE: {
        TTL: 3600, // 1 hour
        MAX_SIZE: 100
    },

    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100
    }
};