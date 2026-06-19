// ============================================
// TechNomads Delivery System - Shared Utilities
// ============================================

const Utils = {
    // ============================================
    // FORMATTING
    // ============================================
    formatCurrency(amount, currency = 'YER') {
        const symbols = { 'YER': 'ر.ي', 'USD': '$', 'SAR': 'ر.س', 'EGP': 'ج.م' };
        const symbol = symbols[currency] || currency;
        return `${Number(amount).toLocaleString('ar-SA')} ${symbol}`;
    },

    formatDate(date, format = 'full') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '--/--/----';

        const options = {
            full: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            date: { year: 'numeric', month: 'numeric', day: 'numeric' }
        };

        return d.toLocaleDateString('ar-SA', options[format] || options.full);
    },

    timeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const seconds = Math.floor((now - past) / 1000);

        if (seconds < 0) return 'في المستقبل';
        if (seconds < 60) return 'الآن';

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${this.getTimeUnit(unit, interval)}`;
            }
        }
        return 'الآن';
    },

    getTimeUnit(unit, count) {
        const units = {
            year: count === 1 ? 'سنة' : 'سنوات',
            month: count === 1 ? 'شهر' : 'أشهر',
            week: count === 1 ? 'أسبوع' : 'أسابيع',
            day: count === 1 ? 'يوم' : 'أيام',
            hour: count === 1 ? 'ساعة' : 'ساعات',
            minute: count === 1 ? 'دقيقة' : 'دقائق'
        };
        return units[unit] || unit;
    },

    // ============================================
    // GENERATORS
    // ============================================
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 6);
        return `${prefix}${timestamp}${random}`.toUpperCase();
    },

    generateOrderNumber() {
        return `#${Math.floor(1000 + Math.random() * 9000)}`;
    },

    generateTrackingCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // ============================================
    // VALIDATION
    // ============================================
    validators: {
        email(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        phone(phone) {
            // Supports: +967XXXXXXXXX, 0XXXXXXXXX, 7XXXXXXXX
            return /^(\+967|0)?[0-9]{9,10}$/.test(phone.replace(/\s/g, ''));
        },

        required(value) {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },

        minLength(value, min) {
            return value && value.toString().length >= min;
        },

        maxLength(value, max) {
            return value && value.toString().length <= max;
        },

        isNumber(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        isPositive(value) {
            return this.isNumber(value) && parseFloat(value) > 0;
        },

        url(value) {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }
    },

    // ============================================
    // GEO
    // ============================================
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    toRad(value) {
        return value * Math.PI / 180;
    },

    // ============================================
    // STRING
    // ============================================
    truncate(str, length = 50, suffix = '...') {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-');
    },

    // ============================================
    // DEBOUNCE & THROTTLE
    // ============================================
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ============================================
    // STORAGE
    // ============================================
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },

        remove(key) {
            localStorage.removeItem(key);
        },

        clear() {
            localStorage.clear();
        }
    },

    // ============================================
    // COOKIES
    // ============================================
    cookies: {
        set(name, value, days = 7) {
            const expires = new Date();
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
            document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
        },

        get(name) {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        },

        remove(name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
    },

    // ============================================
    // COLOR
    // ============================================
    getStatusColor(status) {
        const colors = {
            pending: 'warning',
            accepted: 'info',
            pickup: 'primary',
            delivering: 'primary',
            delivered: 'success',
            cancelled: 'danger',
            completed: 'success',
            active: 'success',
            offline: 'danger',
            on_break: 'warning'
        };
        return colors[status] || 'gray';
    },

    getStatusLabel(status) {
        const labels = {
            pending: 'قيد الانتظار',
            accepted: 'تم القبول',
            pickup: 'في الاستلام',
            delivering: 'في الطريق',
            delivered: 'تم التوصيل',
            cancelled: 'ملغي',
            completed: 'مكتمل',
            active: 'نشط',
            offline: 'غير متاح',
            on_break: 'في استراحة'
        };
        return labels[status] || status;
    },

    // ============================================
    // ARRAY HELPERS
    // ============================================
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) result[groupKey] = [];
            result[groupKey].push(item);
            return result;
        }, {});
    },

    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (typeof aVal === 'string') {
                return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return order === 'asc' ? aVal - bVal : bVal - aVal;
        });
    },

    // ============================================
    // DOM
    // ============================================
    getElement(id) {
        return document.getElementById(id);
    },

    query(selector) {
        return document.querySelector(selector);
    },

    queryAll(selector) {
        return document.querySelectorAll(selector);
    },

    createElement(tag, className = '', content = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (content) el.innerHTML = content;
        return el;
    },

    // ============================================
    // MISC
    // ============================================
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    isEmpty(obj) {
        if (!obj) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return !obj;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

// Export
window.Utils = Utils;