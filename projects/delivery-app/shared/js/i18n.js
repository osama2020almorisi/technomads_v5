// ============================================
// TechNomads Delivery System - i18n
// Multi-language support (Arabic/English)
// ============================================

const i18n = {
    currentLang: localStorage.getItem('appLanguage') || 'ar',

    // ============================================
    // TRANSLATIONS
    // ============================================
    translations: {
        ar: {
            // General
            appName: 'TechNomads',
            welcome: 'أهلاً بك!',
            loading: 'جاري التحميل...',
            error: 'حدث خطأ',
            success: 'تم بنجاح',
            cancel: 'إلغاء',
            confirm: 'تأكيد',
            save: 'حفظ',
            delete: 'حذف',
            edit: 'تعديل',
            close: 'إغلاق',
            search: 'بحث',
            filter: 'تصفية',
            viewAll: 'عرض الكل',
            noData: 'لا توجد بيانات',
            retry: 'إعادة المحاولة',
            done: 'تم',
            back: 'رجوع',
            next: 'التالي',
            submit: 'إرسال',
            send: 'إرسال',
            receive: 'استلام',
            yes: 'نعم',
            no: 'لا',

            // Navigation
            home: 'الرئيسية',
            dashboard: 'لوحة التحكم',
            orders: 'الطلبات',
            drivers: 'السائقين',
            customers: 'العملاء',
            zones: 'المناطق',
            reports: 'التقارير',
            settings: 'الإعدادات',
            profile: 'الملف الشخصي',
            notifications: 'الإشعارات',
            wallet: 'المحفظة',
            support: 'الدعم',
            history: 'السجل',
            analytics: 'التحليلات',

            // Auth
            login: 'تسجيل الدخول',
            register: 'إنشاء حساب',
            logout: 'تسجيل الخروج',
            email: 'البريد الإلكتروني',
            password: 'كلمة المرور',
            phone: 'رقم الهاتف',
            name: 'الاسم',
            fullName: 'الاسم الكامل',
            forgotPassword: 'نسيت كلمة المرور؟',
            rememberMe: 'تذكرني',
            confirmPassword: 'تأكيد كلمة المرور',
            alreadyHaveAccount: 'لديك حساب بالفعل؟',
            dontHaveAccount: 'ليس لديك حساب؟',

            // Orders
            newOrder: 'طلب جديد',
            orderDetails: 'تفاصيل الطلب',
            orderStatus: 'حالة الطلب',
            orderNumber: 'رقم الطلب',
            pickupAddress: 'عنوان الاستلام',
            dropoffAddress: 'عنوان التوصيل',
            orderType: 'نوع الطلب',
            deliveryFee: 'رسوم التوصيل',
            total: 'الإجمالي',
            notes: 'ملاحظات',
            orderTime: 'وقت الطلب',
            estimatedTime: 'الوقت المتوقع',
            distance: 'المسافة',
            amount: 'المبلغ',
            paymentMethod: 'طريقة الدفع',

            // Order Statuses
            status_pending: 'قيد الانتظار',
            status_accepted: 'تم القبول',
            status_pickup: 'في الاستلام',
            status_delivering: 'في الطريق',
            status_delivered: 'تم التوصيل',
            status_cancelled: 'ملغي',
            status_completed: 'مكتمل',

            // Driver
            driver: 'السائق',
            driverName: 'اسم السائق',
            driverRating: 'تقييم السائق',
            driverPhone: 'هاتف السائق',
            driverLocation: 'موقع السائق',
            availableDrivers: 'السائقين المتاحين',
            activeDrivers: 'سائق نشط',
            totalDrivers: 'إجمالي السائقين',
            driverStatus: 'حالة السائق',
            driverEarnings: 'أرباح السائق',
            driverOrders: 'طلبات السائق',
            driverVehicle: 'المركبة',
            driverLicense: 'رخصة القيادة',

            // Customer
            customer: 'العميل',
            customerName: 'اسم العميل',
            customerPhone: 'هاتف العميل',
            totalCustomers: 'إجمالي العملاء',
            newCustomers: 'عملاء جدد',
            customerOrders: 'طلبات العميل',
            customerAddress: 'عنوان العميل',

            // Zones
            zone: 'المنطقة',
            zoneName: 'اسم المنطقة',
            zonePrice: 'سعر المنطقة',
            deliveryTime: 'وقت التوصيل',
            basePrice: 'السعر الأساسي',
            extraFee: 'رسوم إضافية',
            minOrder: 'الحد الأدنى للطلب',

            // Reports
            report: 'تقرير',
            dailyReport: 'تقرير يومي',
            weeklyReport: 'تقرير أسبوعي',
            monthlyReport: 'تقرير شهري',
            yearlyReport: 'تقرير سنوي',
            exportReport: 'تصدير التقرير',
            revenueReport: 'تقرير الإيرادات',
            ordersReport: 'تقرير الطلبات',
            driversReport: 'تقرير السائقين',
            zonesReport: 'تقرير المناطق',

            // Stats
            totalOrders: 'إجمالي الطلبات',
            completedOrders: 'الطلبات المكتملة',
            pendingOrders: 'الطلبات المعلقة',
            revenue: 'الإيرادات',
            todayStats: 'إحصائيات اليوم',
            weeklyStats: 'إحصائيات الأسبوع',
            monthlyStats: 'إحصائيات الشهر',
            completionRate: 'نسبة الإنجاز',
            avgDeliveryTime: 'متوسط وقت التوصيل',

            // Tracking
            trackOrder: 'تتبع الطلب',
            liveTracking: 'تتبع مباشر',
            estimatedTime: 'الوقت المتوقع',
            driverOnWay: 'السائق في الطريق',
            driverArrived: 'وصل السائق',
            orderReceived: 'تم استلام الطلب',
            orderInProgress: 'الطلب قيد التنفيذ',

            // Payment
            payment: 'الدفع',
            paymentMethod: 'طريقة الدفع',
            cash: 'نقداً',
            card: 'بطاقة ائتمان',
            wallet: 'محفظة إلكترونية',
            payNow: 'ادفع الآن',
            paid: 'مدفوع',
            unpaid: 'غير مدفوع',

            // Messages
            orderCreated: 'تم إنشاء الطلب بنجاح',
            orderAccepted: 'تم قبول الطلب',
            orderPickedUp: 'تم استلام الطلب',
            orderDelivered: 'تم توصيل الطلب بنجاح',
            driverArrived: 'وصل السائق إلى نقطة الاستلام',
            orderCancelled: 'تم إلغاء الطلب',
            orderUpdated: 'تم تحديث الطلب',
            driverAssigned: 'تم تعيين السائق',

            // Errors
            networkError: 'خطأ في الاتصال بالشبكة',
            serverError: 'خطأ في الخادم',
            locationError: 'تعذر تحديد الموقع',
            invalidInput: 'مدخل غير صالح',
            sessionExpired: 'انتهت الجلسة',
            permissionDenied: 'غير مصرح به',
            notFound: 'غير موجود',
            tryAgain: 'يرجى المحاولة مرة أخرى',

            // Misc
            km: 'كم',
            min: 'دقيقة',
            hour: 'ساعة',
            day: 'يوم',
            month: 'شهر',
            year: 'سنة',
            sar: 'ر.ي',
            points: 'نقطة',
            rating: 'تقييم',
            reviews: 'تقييمات',
            share: 'مشاركة',
            copy: 'نسخ',
            copied: 'تم النسخ',
            download: 'تحميل',
            upload: 'رفع',

            // Time
            today: 'اليوم',
            yesterday: 'أمس',
            tomorrow: 'غداً',
            now: 'الآن',
            soon: 'قريباً',
            later: 'لاحقاً',

            // Week Days
            saturday: 'السبت',
            sunday: 'الأحد',
            monday: 'الاثنين',
            tuesday: 'الثلاثاء',
            wednesday: 'الأربعاء',
            thursday: 'الخميس',
            friday: 'الجمعة',

            // Months
            january: 'يناير',
            february: 'فبراير',
            march: 'مارس',
            april: 'أبريل',
            may: 'مايو',
            june: 'يونيو',
            july: 'يوليو',
            august: 'أغسطس',
            september: 'سبتمبر',
            october: 'أكتوبر',
            november: 'نوفمبر',
            december: 'ديسمبر'
        },

        en: {
            // General
            appName: 'TechNomads',
            welcome: 'Welcome!',
            loading: 'Loading...',
            error: 'Error occurred',
            success: 'Success',
            cancel: 'Cancel',
            confirm: 'Confirm',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            close: 'Close',
            search: 'Search',
            filter: 'Filter',
            viewAll: 'View All',
            noData: 'No data available',
            retry: 'Retry',
            done: 'Done',
            back: 'Back',
            next: 'Next',
            submit: 'Submit',
            send: 'Send',
            receive: 'Receive',
            yes: 'Yes',
            no: 'No',

            // Navigation
            home: 'Home',
            dashboard: 'Dashboard',
            orders: 'Orders',
            drivers: 'Drivers',
            customers: 'Customers',
            zones: 'Zones',
            reports: 'Reports',
            settings: 'Settings',
            profile: 'Profile',
            notifications: 'Notifications',
            wallet: 'Wallet',
            support: 'Support',
            history: 'History',
            analytics: 'Analytics',

            // Auth
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            email: 'Email',
            password: 'Password',
            phone: 'Phone Number',
            name: 'Name',
            fullName: 'Full Name',
            forgotPassword: 'Forgot Password?',
            rememberMe: 'Remember Me',
            confirmPassword: 'Confirm Password',
            alreadyHaveAccount: 'Already have an account?',
            dontHaveAccount: "Don't have an account?",

            // Orders
            newOrder: 'New Order',
            orderDetails: 'Order Details',
            orderStatus: 'Order Status',
            orderNumber: 'Order #',
            pickupAddress: 'Pickup Address',
            dropoffAddress: 'Dropoff Address',
            orderType: 'Order Type',
            deliveryFee: 'Delivery Fee',
            total: 'Total',
            notes: 'Notes',
            orderTime: 'Order Time',
            estimatedTime: 'Estimated Time',
            distance: 'Distance',
            amount: 'Amount',
            paymentMethod: 'Payment Method',

            // Order Statuses
            status_pending: 'Pending',
            status_accepted: 'Accepted',
            status_pickup: 'Picking Up',
            status_delivering: 'On The Way',
            status_delivered: 'Delivered',
            status_cancelled: 'Cancelled',
            status_completed: 'Completed',

            // Driver
            driver: 'Driver',
            driverName: 'Driver Name',
            driverRating: 'Driver Rating',
            driverPhone: 'Driver Phone',
            driverLocation: 'Driver Location',
            availableDrivers: 'Available Drivers',
            activeDrivers: 'Active Drivers',
            totalDrivers: 'Total Drivers',
            driverStatus: 'Driver Status',
            driverEarnings: 'Driver Earnings',
            driverOrders: 'Driver Orders',
            driverVehicle: 'Vehicle',
            driverLicense: 'Driver License',

            // Customer
            customer: 'Customer',
            customerName: 'Customer Name',
            customerPhone: 'Customer Phone',
            totalCustomers: 'Total Customers',
            newCustomers: 'New Customers',
            customerOrders: 'Customer Orders',
            customerAddress: 'Customer Address',

            // Zones
            zone: 'Zone',
            zoneName: 'Zone Name',
            zonePrice: 'Zone Price',
            deliveryTime: 'Delivery Time',
            basePrice: 'Base Price',
            extraFee: 'Extra Fee',
            minOrder: 'Minimum Order',

            // Reports
            report: 'Report',
            dailyReport: 'Daily Report',
            weeklyReport: 'Weekly Report',
            monthlyReport: 'Monthly Report',
            yearlyReport: 'Yearly Report',
            exportReport: 'Export Report',
            revenueReport: 'Revenue Report',
            ordersReport: 'Orders Report',
            driversReport: 'Drivers Report',
            zonesReport: 'Zones Report',

            // Stats
            totalOrders: 'Total Orders',
            completedOrders: 'Completed Orders',
            pendingOrders: 'Pending Orders',
            revenue: 'Revenue',
            todayStats: "Today's Stats",
            weeklyStats: "Weekly Stats",
            monthlyStats: "Monthly Stats",
            completionRate: 'Completion Rate',
            avgDeliveryTime: 'Avg Delivery Time',

            // Tracking
            trackOrder: 'Track Order',
            liveTracking: 'Live Tracking',
            estimatedTime: 'Estimated Time',
            driverOnWay: 'Driver On The Way',
            driverArrived: 'Driver Arrived',
            orderReceived: 'Order Received',
            orderInProgress: 'Order In Progress',

            // Payment
            payment: 'Payment',
            paymentMethod: 'Payment Method',
            cash: 'Cash',
            card: 'Credit Card',
            wallet: 'Wallet',
            payNow: 'Pay Now',
            paid: 'Paid',
            unpaid: 'Unpaid',

            // Messages
            orderCreated: 'Order created successfully',
            orderAccepted: 'Order accepted',
            orderPickedUp: 'Order picked up',
            orderDelivered: 'Order delivered successfully',
            driverArrived: 'Driver arrived at pickup location',
            orderCancelled: 'Order cancelled',
            orderUpdated: 'Order updated',
            driverAssigned: 'Driver assigned',

            // Errors
            networkError: 'Network error',
            serverError: 'Server error',
            locationError: 'Could not get location',
            invalidInput: 'Invalid input',
            sessionExpired: 'Session expired',
            permissionDenied: 'Permission denied',
            notFound: 'Not found',
            tryAgain: 'Please try again',

            // Misc
            km: 'km',
            min: 'min',
            hour: 'hour',
            day: 'day',
            month: 'month',
            year: 'year',
            sar: 'YER',
            points: 'points',
            rating: 'Rating',
            reviews: 'Reviews',
            share: 'Share',
            copy: 'Copy',
            copied: 'Copied!',
            download: 'Download',
            upload: 'Upload',

            // Time
            today: 'Today',
            yesterday: 'Yesterday',
            tomorrow: 'Tomorrow',
            now: 'Now',
            soon: 'Soon',
            later: 'Later',

            // Week Days
            saturday: 'Saturday',
            sunday: 'Sunday',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',

            // Months
            january: 'January',
            february: 'February',
            march: 'March',
            april: 'April',
            may: 'May',
            june: 'June',
            july: 'July',
            august: 'August',
            september: 'September',
            october: 'October',
            november: 'November',
            december: 'December'
        }
    },

    // ============================================
    // METHODS
    // ============================================

    // Get translation
    t(key, lang = null) {
        const language = lang || this.currentLang;
        const translation = this.translations[language];
        if (!translation) return key;

        // Support nested keys (e.g., 'status.pending')
        const keys = key.split('.');
        let result = translation;
        for (const k of keys) {
            if (result && typeof result === 'object' && result[k] !== undefined) {
                result = result[k];
            } else {
                return key;
            }
        }
        return result || key;
    },

    // Set language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('appLanguage', lang);

            // Update HTML attributes
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

            // Dispatch event for language change
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));

            return true;
        }
        return false;
    },

    // Get current language
    getLanguage() {
        return this.currentLang;
    },

    // Check if RTL
    isRTL() {
        return this.currentLang === 'ar';
    },

    // Get available languages
    getAvailableLanguages() {
        return Object.keys(this.translations);
    },

    // Translate HTML content
    translateElement(element) {
        if (!element) return;

        // Translate text content
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    if (node.parentElement && node.parentElement.dataset.i18n) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            }
        );

        let node;
        while (node = walker.nextNode()) {
            const key = node.parentElement.dataset.i18n;
            const translation = this.t(key);
            if (translation !== key) {
                node.textContent = translation;
            }
        }

        // Translate attributes
        const attrElements = element.querySelectorAll('[data-i18n-attr]');
        attrElements.forEach(el => {
            const attrConfig = el.dataset.i18nAttr;
            try {
                const config = JSON.parse(attrConfig);
                Object.entries(config).forEach(([attr, key]) => {
                    const translation = this.t(key);
                    if (translation !== key) {
                        el.setAttribute(attr, translation);
                    }
                });
            } catch (e) {
                console.warn('Invalid i18n-attr config:', attrConfig);
            }
        });
    },

    // Translate entire page
    translatePage() {
        this.translateElement(document.body);
    }
};

// ============================================
// AUTO-INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language
    const lang = i18n.getLanguage();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Translate page
    i18n.translatePage();
});

// ============================================
// SHORTCUT
// ============================================
const t = (key) => i18n.t(key);

// Export
window.i18n = i18n;
window.t = t;