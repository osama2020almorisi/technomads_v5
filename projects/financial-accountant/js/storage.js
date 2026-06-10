// localStorage management functions

// Initialize default data structure if not exists
function initializeStorage() {
    console.log('جاري تهيئة التخزين...');
    
    // تحقق إذا كان التخزين قد تم تهيئته already
    const isInitialized = localStorage.getItem('financial_app_initialized');
    
    if (!isInitialized) {
        console.log('التهيئة الأولى للتخزين...');
        
        if (!localStorage.getItem('financial_app_users')) {
            localStorage.setItem('financial_app_users', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('financial_app_customers')) {
            localStorage.setItem('financial_app_customers', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('financial_app_products')) {
            localStorage.setItem('financial_app_products', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('financial_app_invoices')) {
            localStorage.setItem('financial_app_invoices', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('financial_app_expenses')) {
            localStorage.setItem('financial_app_expenses', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('financial_app_settings')) {
            localStorage.setItem('financial_app_settings', JSON.stringify({
                currency: 'ريال',
                tax_rate: 15,
                company_name: 'شركتي',
                company_logo: ''
            }));
        }
        
        // وضع علامة أن التهيئة تمت
        localStorage.setItem('financial_app_initialized', 'true');
        console.log('تم تهيئة التخزين بنجاح');
    } else {
        console.log('التخزين already initialized');
    }
}

// User management functions
function getUsers() {
    return JSON.parse(localStorage.getItem('financial_app_users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('financial_app_users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('financial_app_current_user')) || null;
}

function setCurrentUser(user) {
    localStorage.setItem('financial_app_current_user', JSON.stringify(user));
}

function logoutUser() {
    localStorage.removeItem('financial_app_current_user');
}

// Data management functions
function getData(key) {
    try {
        const itemName = `financial_app_${key}`;
        const data = localStorage.getItem(itemName);
        
        if (!data) {
            console.warn(`البيانات لـ ${itemName} غير موجودة`);
            return [];
        }
        
        const parsedData = JSON.parse(data);
        console.log(`جلب ${parsedData.length} عناصر من ${itemName}`);
        return parsedData;
        
    } catch (error) {
        console.error(`خطأ في تحميل البيانات لـ ${key}:`, error);
        return [];
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(`financial_app_${key}`, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`خطأ في حفظ البيانات لـ ${key}:`, error);
        showAlert('error', `خطأ في حفظ البيانات لـ ${key}`);
        return false;
    }
}

function getNextId(key) {
    const data = getData(key);
    if (data.length === 0) return 1;
    return Math.max(...data.map(item => item.id)) + 1;
}

// Settings management
function getSettings() {
    return JSON.parse(localStorage.getItem('financial_app_settings')) || {};
}

function saveSettings(settings) {
    localStorage.setItem('financial_app_settings', JSON.stringify(settings));
}

// دالة استعادة البيانات من النسخ الاحتياطي
function restoreData(backupData) {
    try {
        for (const [key, value] of Object.entries(backupData)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
        showAlert('success', 'تم استعادة البيانات بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في استعادة البيانات:', error);
        showAlert('error', 'فشل في استعادة البيانات');
        return false;
    }
}

// دالة نسخ احتياطي للبيانات
function backupData() {
    const backup = {};
    const keys = [
        'financial_app_users',
        'financial_app_customers', 
        'financial_app_products',
        'financial_app_invoices',
        'financial_app_expenses',
        'financial_app_settings'
    ];
    
    keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            backup[key] = JSON.parse(data);
        }
    });
    
    return backup;
}

// دالة التحقق من البيانات الحالية
function checkCurrentData() {
    console.log('=== التحقق من البيانات الحالية ===');
    const keys = [
        'financial_app_users',
        'financial_app_customers',
        'financial_app_products', 
        'financial_app_invoices',
        'financial_app_expenses'
    ];
    
    keys.forEach(key => {
        const data = localStorage.getItem(key);
        console.log(`${key}:`, data ? JSON.parse(data).length : 'غير موجود');
    });
}

// إضافة دالة للتحقق من البيانات
function debugStorage() {
    console.log('=== فحص التخزين ===');
    console.log('المستخدمون:', getUsers());
    console.log('العملاء:', getData('customers'));
    console.log('المنتجات:', getData('products'));
    console.log('الفواتير:', getData('invoices'));
    console.log('المصروفات:', getData('expenses'));
}

function getCompanySettings() {
    const settings = getSettings();
    return {
        name: settings.company_name || 'شركتي',
        address: settings.company_address || '',
        phone: settings.company_phone || '',
        taxNumber: settings.company_tax_number || '',
        logo: settings.company_logo || ''
    };
}

function updateCompanySettings(settings) {
    const currentSettings = getSettings();
    const updatedSettings = {
        ...currentSettings,
        ...settings
    };
    saveSettings(updatedSettings);
}

// Initialize storage when this script is loaded
initializeStorage();