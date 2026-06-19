// ============================================
// TechNomads Delivery System - Constants
// ============================================

const CONSTANTS = {
    // ============================================
    // API
    // ============================================
    API: {
        BASE_URL: 'https://api.technomads.ye/v1',
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

    // ============================================
    // ORDER STATUSES
    // ============================================
    ORDER_STATUS: {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        PICKUP: 'pickup',
        DELIVERING: 'delivering',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled'
    },

    ORDER_STATUS_LABELS: {
        pending: 'قيد الانتظار',
        accepted: 'تم القبول',
        pickup: 'في الاستلام',
        delivering: 'في الطريق',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي'
    },

    ORDER_STATUS_COLORS: {
        pending: 'warning',
        accepted: 'info',
        pickup: 'primary',
        delivering: 'primary',
        delivered: 'success',
        cancelled: 'danger'
    },

    // ============================================
    // DRIVER STATUSES
    // ============================================
    DRIVER_STATUS: {
        OFFLINE: 'offline',
        AVAILABLE: 'available',
        BUSY: 'busy',
        ON_BREAK: 'on_break'
    },

    DRIVER_STATUS_LABELS: {
        offline: 'غير متاح',
        available: 'متاح',
        busy: 'مشغول',
        on_break: 'في استراحة'
    },

    DRIVER_STATUS_COLORS: {
        offline: 'danger',
        available: 'success',
        busy: 'warning',
        on_break: 'warning'
    },

    // ============================================
    // ORDER TYPES
    // ============================================
    ORDER_TYPES: {
        FAST: {
            id: 'fast',
            name: 'توصيل سريع',
            nameEn: 'Fast Delivery',
            basePrice: 3500,
            time: '15-30 دقيقة',
            icon: 'fa-bolt',
            color: 'primary'
        },
        NORMAL: {
            id: 'normal',
            name: 'توصيل عادي',
            nameEn: 'Normal Delivery',
            basePrice: 2500,
            time: '30-60 دقيقة',
            icon: 'fa-box',
            color: 'secondary'
        },
        FROZEN: {
            id: 'frozen',
            name: 'مجمدات',
            nameEn: 'Frozen Items',
            basePrice: 4000,
            time: '20-40 دقيقة',
            icon: 'fa-snowflake',
            color: 'info'
        },
        FOOD: {
            id: 'food',
            name: 'مطاعم',
            nameEn: 'Restaurants',
            basePrice: 2000,
            time: '20-45 دقيقة',
            icon: 'fa-utensils',
            color: 'warning'
        }
    },

    // ============================================
    // CITIES
    // ============================================
    CITIES: [
        { id: 'sanaa', name: 'صنعاء', nameEn: 'Sana\'a', lat: 15.3694, lng: 44.1910, active: true },
        { id: 'aden', name: 'عدن', nameEn: 'Aden', lat: 12.7855, lng: 45.0187, active: true },
        { id: 'taiz', name: 'تعز', nameEn: 'Taiz', lat: 13.5776, lng: 44.0176, active: true },
        { id: 'hodeidah', name: 'الحديدة', nameEn: 'Hodeidah', lat: 14.7979, lng: 42.9540, active: true },
        { id: 'ibb', name: 'إب', nameEn: 'Ibb', lat: 13.9667, lng: 44.1833, active: true },
        { id: 'mukalla', name: 'المكلا', nameEn: 'Mukalla', lat: 14.5424, lng: 49.1280, active: false },
        { id: 'seiyun', name: 'سيئون', nameEn: 'Seiyun', lat: 15.9667, lng: 48.7833, active: false }
    ],

    // ============================================
    // PAYMENT METHODS
    // ============================================
    PAYMENT_METHODS: {
        CASH: { id: 'cash', name: 'نقداً', nameEn: 'Cash', icon: 'fa-money-bill-wave' },
        CARD: { id: 'card', name: 'بطاقة ائتمان', nameEn: 'Credit Card', icon: 'fa-credit-card' },
        WALLET: { id: 'wallet', name: 'محفظة إلكترونية', nameEn: 'Wallet', icon: 'fa-wallet' }
    },

    // ============================================
    // NOTIFICATION TYPES
    // ============================================
    NOTIFICATION_TYPES: {
        ORDER_UPDATE: 'order_update',
        DRIVER_ARRIVED: 'driver_arrived',
        DRIVER_ASSIGNED: 'driver_assigned',
        ORDER_ACCEPTED: 'order_accepted',
        ORDER_COMPLETED: 'order_completed',
        PROMOTION: 'promotion',
        SYSTEM: 'system',
        ALERT: 'alert'
    },

    NOTIFICATION_ICONS: {
        order_update: 'fa-box',
        driver_arrived: 'fa-motorcycle',
        driver_assigned: 'fa-user-check',
        order_accepted: 'fa-check-circle',
        order_completed: 'fa-flag-checkered',
        promotion: 'fa-gift',
        system: 'fa-cog',
        alert: 'fa-exclamation-triangle'
    },

    // ============================================
    // ROLES
    // ============================================
    ROLES: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin',
        DRIVER: 'driver',
        CUSTOMER: 'customer'
    },

    ROLE_LABELS: {
        super_admin: 'مدير عام',
        admin: 'مسؤول',
        driver: 'سائق',
        customer: 'عميل'
    },

    // ============================================
    // SETTINGS
    // ============================================
    SETTINGS: {
        DEFAULT_LANGUAGE: 'ar',
        SUPPORTED_LANGUAGES: ['ar', 'en'],
        MAP_DEFAULT_ZOOM: 14,
        ORDER_TIMEOUT: 300000, // 5 minutes
        DRIVER_SEARCH_RADIUS: 5000, // 5km
        MAX_ORDER_DISTANCE: 20000, // 20km
        MIN_ORDER_AMOUNT: 500,
        TAX_RATE: 0.05, // 5%
        SERVICE_FEE: 0.10 // 10%
    },

    // ============================================
    // STORAGE KEYS
    // ============================================
    STORAGE_KEYS: {
        TOKEN: 'auth_token',
        USER: 'auth_user',
        LANGUAGE: 'app_language',
        THEME: 'app_theme',
        REMEMBER_ME: 'remember_me',
        SIDEBAR_COLLAPSED: 'sidebar_collapsed',
        CURRENT_ORDER: 'current_order',
        ORDER_STATUS: 'order_status',
        DRIVER_STATUS: 'driver_status',
        LOCATION: 'user_location'
    },

    // ============================================
    // REGEX PATTERNS
    // ============================================
    PATTERNS: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^(\+967|0)?[0-9]{9,10}$/,
        PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        ORDER_NUMBER: /^#\d{4}$/,
        TRACKING_CODE: /^[A-Z0-9]{8}$/
    },

    // ============================================
    // ROUTES
    // ============================================
    ROUTES: {
        ADMIN: {
            LOGIN: '/pages/login.html',
            DASHBOARD: '/pages/dashboard.html',
            ORDERS: '/pages/orders.html',
            DRIVERS: '/pages/drivers.html',
            CUSTOMERS: '/pages/customers.html',
            ZONES: '/pages/zones.html',
            REPORTS: '/pages/reports.html',
            SETTINGS: '/pages/settings.html'
        },
        DRIVER: {
            LOGIN: '/pages/login.html',
            DASHBOARD: '/pages/dashboard.html'
        },
        CUSTOMER: {
            LOGIN: '/pages/login.html',
            HOME: '/pages/home.html'
        }
    }
};

// Export
window.CONSTANTS = CONSTANTS;