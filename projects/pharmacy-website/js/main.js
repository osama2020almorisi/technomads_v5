/* ============================================
   Pharmacy Management System - Main JavaScript
   نظام إدارة الصيدلية المتكامل (نسخة كاملة نهائية)
   ============================================ */

// ========== DATA STORAGE ==========
const Storage = {
    get(key) {
        const data = localStorage.getItem('pharmacy_' + key);
        return data ? JSON.parse(data) : null;
    },
    set(key, value) {
        localStorage.setItem('pharmacy_' + key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem('pharmacy_' + key);
    }
};

// ========== INITIAL DATA ==========
function initData() {
    if (!Storage.get('initialized')) {
        // Categories
        Storage.set('categories', [
            { id: 1, name: 'مضاد حيوي', description: 'مضادات حيوية لعلاج العدوى البكتيرية' },
            { id: 2, name: 'مسكن', description: 'مسكنات الألم' },
            { id: 3, name: 'فيتامين', description: 'فيتامينات ومكملات غذائية' },
            { id: 4, name: 'مضاد للحساسية', description: 'مضادات الهيستامين' },
            { id: 5, name: 'مضاد للالتهاب', description: 'مضادات الالتهاب غير الستيرويدية' },
            { id: 6, name: 'مضاد للحموضة', description: 'مضادات الحموضة والقرحة' },
            { id: 7, name: 'مهدئ', description: 'مهدئات ومنومات' },
            { id: 8, name: 'أخرى', description: 'أدوية أخرى' }
        ]);

        // Suppliers
        Storage.set('suppliers', [
            { id: 1, name: 'شركة الأدوية الوطنية', phone: '770000001', email: 'info@nationalpharma.com', address: 'صنعاء', contactPerson: 'أحمد علي', notes: '' },
            { id: 2, name: 'مستودع الأدوية الحديث', phone: '770000002', email: 'modern@pharma.com', address: 'عدن', contactPerson: 'خالد سعيد', notes: '' },
            { id: 3, name: 'شركة الصيدلة العربية', phone: '770000003', email: 'arab@pharma.com', address: 'تعز', contactPerson: 'محمد عبدالله', notes: '' }
        ]);

        // Customers
        Storage.set('customers', [
            { id: 1, name: 'أحمد محمد', phone: '771111111', email: 'ahmed@test.com', address: 'صنعاء' },
            { id: 2, name: 'فاطمة علي', phone: '772222222', email: 'fatima@test.com', address: 'صنعاء' },
            { id: 3, name: 'عبدالله سالم', phone: '773333333', email: 'abdullah@test.com', address: 'عدن' }
        ]);

        // Medicines
        Storage.set('medicines', [
            { id: 1, name: 'أموكسيسيلين', tradeName: 'أموكسيل', activeSubstance: 'Amoxicillin', categoryId: 1, manufacturer: 'شركة الأدوية الوطنية', supplierId: 1, purchasePrice: 1500, sellingPrice: 2000, quantity: 100, productionDate: '2024-01-01', expiryDate: '2026-01-01', location: 'رف A1', barcode: '1234567890', image: '', description: 'مضاد حيوي واسع المجال', needPrescription: true, taxRate: 5, lowStockAlert: 20, createdAt: new Date().toISOString() },
            { id: 2, name: 'باراسيتامول', tradeName: 'بانادول', activeSubstance: 'Paracetamol', categoryId: 2, manufacturer: 'شركة الأدوية الوطنية', supplierId: 1, purchasePrice: 300, sellingPrice: 500, quantity: 200, productionDate: '2024-02-01', expiryDate: '2026-02-01', location: 'رف A2', barcode: '1234567891', image: '', description: 'مسكن للألم وخافض للحرارة', needPrescription: false, taxRate: 5, lowStockAlert: 50, createdAt: new Date().toISOString() },
            { id: 3, name: 'فيتامين سي', tradeName: 'سيتروفان', activeSubstance: 'Vitamin C', categoryId: 3, manufacturer: 'مستودع الأدوية الحديث', supplierId: 2, purchasePrice: 800, sellingPrice: 1200, quantity: 80, productionDate: '2024-03-01', expiryDate: '2025-12-01', location: 'رف B1', barcode: '1234567892', image: '', description: 'مكمل غذائي', needPrescription: false, taxRate: 5, lowStockAlert: 30, createdAt: new Date().toISOString() },
            { id: 4, name: 'لوراتادين', tradeName: 'كلاريتين', activeSubstance: 'Loratadine', categoryId: 4, manufacturer: 'شركة الصيدلة العربية', supplierId: 3, purchasePrice: 1200, sellingPrice: 1800, quantity: 60, productionDate: '2024-01-15', expiryDate: '2025-10-15', location: 'رف B2', barcode: '1234567893', image: '', description: 'مضاد للحساسية', needPrescription: false, taxRate: 5, lowStockAlert: 20, createdAt: new Date().toISOString() },
            { id: 5, name: 'إيبوبروفين', tradeName: 'بروفين', activeSubstance: 'Ibuprofen', categoryId: 5, manufacturer: 'شركة الأدوية الوطنية', supplierId: 1, purchasePrice: 600, sellingPrice: 900, quantity: 150, productionDate: '2024-04-01', expiryDate: '2026-04-01', location: 'رف A3', barcode: '1234567894', image: '', description: 'مضاد للالتهاب ومسكن', needPrescription: false, taxRate: 5, lowStockAlert: 40, createdAt: new Date().toISOString() }
        ]);

        // Sales
        Storage.set('sales', [
            { id: 1, invoiceNumber: 'INV-001', customerId: 1, totalAmount: 3500, discount: 0, tax: 175, grandTotal: 3675, paymentMethod: 'نقدي', paymentStatus: 'مدفوع', notes: '', createdBy: 'صيدلي', createdAt: new Date().toISOString() },
            { id: 2, invoiceNumber: 'INV-002', customerId: 2, totalAmount: 2000, discount: 100, tax: 95, grandTotal: 1995, paymentMethod: 'بطاقة', paymentStatus: 'مدفوع', notes: '', createdBy: 'صيدلي', createdAt: new Date().toISOString() }
        ]);

        // Sale Items
        Storage.set('saleItems', [
            { id: 1, saleId: 1, medicineId: 1, quantity: 1, price: 2000, total: 2000 },
            { id: 2, saleId: 1, medicineId: 2, quantity: 3, price: 500, total: 1500 },
            { id: 3, saleId: 2, medicineId: 1, quantity: 1, price: 2000, total: 2000 }
        ]);

        // Purchases
        Storage.set('purchases', [
            { id: 1, invoiceNumber: 'PUR-001', supplierId: 1, totalAmount: 50000, paidAmount: 50000, remainingAmount: 0, notes: '', createdBy: 'مدير', createdAt: new Date().toISOString() }
        ]);

        // Purchase Items
        Storage.set('purchaseItems', [
            { id: 1, purchaseId: 1, medicineId: 1, quantity: 50, purchasePrice: 1500, total: 75000 }
        ]);

        // Users
        Storage.set('users', [
            { id: 1, name: 'المدير', email: 'admin@pharmacy.com', password: 'admin123', role: 'owner', avatar: '', createdAt: new Date().toISOString() },
            { id: 2, name: 'الصيدلي', email: 'pharmacist@pharmacy.com', password: 'pharma123', role: 'pharmacist', avatar: '', createdAt: new Date().toISOString() },
            { id: 3, name: 'أمين المخزن', email: 'stock@pharmacy.com', password: 'stock123', role: 'stock', avatar: '', createdAt: new Date().toISOString() }
        ]);

        // Settings
        Storage.set('settings', {
            pharmacyName: 'صيدلية TechNomads',
            pharmacyAddress: 'صنعاء، اليمن',
            pharmacyPhone: '770200970',
            pharmacyEmail: 'pharmacy@technomads.com',
            taxRate: 5,
            currency: 'ريال يمني',
            lowStockThreshold: 20,
            expiryAlertDays: 30,
            receiptHeader: 'صيدلية TechNomads',
            receiptFooter: 'شكراً لزيارتكم'
        });

        Storage.set('initialized', true);
        Storage.set('currentUser', null);
        Storage.set('nextIds', { medicine: 6, sale: 3, purchase: 2, customer: 4, supplier: 4, category: 9, user: 4, saleItem: 4, purchaseItem: 2 });
    }
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'success', title = '') {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    const titles = { success: 'نجاح', error: 'خطأ', warning: 'تحذير', info: 'معلومة' };

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${icons[type]} notification-icon"></i>
        <div class="notification-content">
            <div class="notification-title">${title || titles[type]}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    notification.querySelector('.notification-close').onclick = () => notification.remove();
    container.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

// ========== AUTHENTICATION ==========
function login(email, password) {
    const users = Storage.get('users') || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        Storage.set('currentUser', userWithoutPassword);
        return { success: true, user: userWithoutPassword };
    }
    return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
}

function logout() {
    Storage.set('currentUser', null);
    window.location.href = 'login.html';
}

function getCurrentUser() {
    return Storage.get('currentUser');
}

function checkAuth() {
    const user = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (!user && currentPage !== 'login.html') {
        window.location.href = 'login.html';
        return false;
    }
    if (user && currentPage === 'login.html') {
        window.location.href = 'index.html';
        return false;
    }
    return user;
}

function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    const permissions = {
        owner: ['all'],
        pharmacist: ['sales', 'customers'],
        stock: ['medicines', 'purchases', 'suppliers']
    };
    const userPerms = permissions[user.role] || [];
    return userPerms.includes('all') || userPerms.includes(permission);
}

function getRoleName(role) {
    const roles = { owner: 'صاحب الصيدلية', pharmacist: 'صيدلي', stock: 'أمين المخزن' };
    return roles[role] || role;
}

// ========== ID GENERATOR ==========
function getNextId(type) {
    const nextIds = Storage.get('nextIds') || {};
    const id = nextIds[type] || 1;
    nextIds[type] = id + 1;
    Storage.set('nextIds', nextIds);
    return id;
}

function generateId(type) {
    return getNextId(type);
}

// ========== INVOICE NUMBER GENERATOR ==========
function generateInvoiceNumber(type = 'sale') {
    const prefix = type === 'sale' ? 'INV' : 'PUR';
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}${month}${day}-${random}`;
}

function generateBarcode() {
    const prefix = 'MED';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// ========== DATE HELPERS ==========
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ar-SA');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('ar-SA', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatNumber(num) {
    return num.toLocaleString('ar-SA');
}

function formatCurrency(amount) {
    const settings = Storage.get('settings') || {};
    return `${formatNumber(amount)} ${settings.currency || 'ريال'}`;
}

function daysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isExpired(expiryDate) {
    return daysUntilExpiry(expiryDate) <= 0;
}

function isNearExpiry(expiryDate, alertDays = 30) {
    const days = daysUntilExpiry(expiryDate);
    return days > 0 && days <= alertDays;
}

function isValidDates(productionDate, expiryDate) {
    if (!productionDate || !expiryDate) return true;
    return new Date(productionDate) <= new Date(expiryDate);
}

// ========== CRUD OPERATIONS ==========
function getAllMedicines() { return Storage.get('medicines') || []; }
function getMedicineById(id) { return getAllMedicines().find(m => m.id === id); }
function addMedicine(medicine) { const medicines = getAllMedicines(); medicine.id = getNextId('medicine'); medicines.push(medicine); Storage.set('medicines', medicines); return medicine; }
function updateMedicine(id, updatedData) { const medicines = getAllMedicines(); const index = medicines.findIndex(m => m.id === id); if (index !== -1) { medicines[index] = { ...medicines[index], ...updatedData }; Storage.set('medicines', medicines); return true; } return false; }
function deleteMedicine(id) { let medicines = getAllMedicines(); medicines = medicines.filter(m => m.id !== id); Storage.set('medicines', medicines); return true; }

function getAllSales() { return Storage.get('sales') || []; }
function getSaleById(id) { return getAllSales().find(s => s.id === id); }
function getSaleItems(saleId) { const saleItems = Storage.get('saleItems') || []; return saleItems.filter(item => item.saleId === saleId); }

function getAllCustomers() { return Storage.get('customers') || []; }
function getCustomerById(id) { return getAllCustomers().find(c => c.id === id); }
function addCustomer(customer) { const customers = getAllCustomers(); customer.id = getNextId('customer'); customers.push(customer); Storage.set('customers', customers); return customer; }
function updateCustomer(id, updatedData) { const customers = getAllCustomers(); const index = customers.findIndex(c => c.id === id); if (index !== -1) { customers[index] = { ...customers[index], ...updatedData }; Storage.set('customers', customers); return true; } return false; }
function deleteCustomer(id) { let customers = getAllCustomers(); customers = customers.filter(c => c.id !== id); Storage.set('customers', customers); return true; }

function getAllSuppliers() { return Storage.get('suppliers') || []; }
function getSupplierById(id) { return getAllSuppliers().find(s => s.id === id); }
function addSupplier(supplier) { const suppliers = getAllSuppliers(); supplier.id = getNextId('supplier'); suppliers.push(supplier); Storage.set('suppliers', suppliers); return supplier; }
function updateSupplier(id, updatedData) { const suppliers = getAllSuppliers(); const index = suppliers.findIndex(s => s.id === id); if (index !== -1) { suppliers[index] = { ...suppliers[index], ...updatedData }; Storage.set('suppliers', suppliers); return true; } return false; }
function deleteSupplier(id) { let suppliers = getAllSuppliers(); suppliers = suppliers.filter(s => s.id !== id); Storage.set('suppliers', suppliers); return true; }

function getAllCategories() { return Storage.get('categories') || []; }
function getCategoryById(id) { return getAllCategories().find(c => c.id === id); }

function getAllUsers() { return Storage.get('users') || []; }
function getUserById(id) { return getAllUsers().find(u => u.id === id); }
function addUser(user) { const users = getAllUsers(); user.id = getNextId('user'); users.push(user); Storage.set('users', users); return user; }
function updateUser(id, updatedData) { const users = getAllUsers(); const index = users.findIndex(u => u.id === id); if (index !== -1) { users[index] = { ...users[index], ...updatedData }; Storage.set('users', users); return true; } return false; }
function deleteUser(id) { let users = getAllUsers(); users = users.filter(u => u.id !== id); Storage.set('users', users); return true; }

function getAllPurchases() { return Storage.get('purchases') || []; }
function getPurchaseById(id) { return getAllPurchases().find(p => p.id === id); }
function getPurchaseItems(purchaseId) { const purchaseItems = Storage.get('purchaseItems') || []; return purchaseItems.filter(item => item.purchaseId === purchaseId); }

function getSettings() { return Storage.get('settings') || {}; }
function updateSettings(settings) { const current = getSettings(); const newSettings = { ...current, ...settings }; Storage.set('settings', newSettings); return newSettings; }

// ========== CONFIRM DIALOG ==========
function confirmDialog(message, callback) {
    let modal = document.querySelector('#customConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customConfirmModal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fas fa-question-circle"></i> تأكيد</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body" id="confirmMessage"><p style="font-size: 1rem; text-align: center;"></p></div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="btn btn-secondary" id="cancelConfirmBtn">إلغاء</button>
                    <button class="btn btn-danger" id="confirmYesBtn">تأكيد</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.querySelector('#confirmMessage p').textContent = message;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    const confirmBtn = modal.querySelector('#confirmYesBtn');
    const cancelBtn = modal.querySelector('#cancelConfirmBtn');
    const closeBtn = modal.querySelector('.modal-close');

    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newConfirmBtn.onclick = () => { closeModal(); if (callback) callback(); };
    newCancelBtn.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}

// ========== EXPORT TO CSV ==========
function exportToCSV(data, filename) {
    if (!data || data.length === 0) { showNotification('لا توجد بيانات للتصدير', 'warning'); return; }
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.csv') ? filename : filename + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification('تم التصدير بنجاح', 'success');
}

// ========== PRINT ==========
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) { showNotification('عنصر الطباعة غير موجود', 'error'); return; }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>طباعة</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
        <style>body{font-family:'Tajawal',sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{padding:8px;border:1px solid #ddd;text-align:right;}</style>
        </head><body>${element.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ========== BACKUP & RESTORE ==========
function backupData() {
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('pharmacy_'));
    const backup = {};
    allKeys.forEach(key => { backup[key] = localStorage.getItem(key); });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const now = new Date();
    const filename = `pharmacy_backup_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}-${now.getMinutes().toString().padStart(2,'0')}.json`;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification('تم إنشاء النسخة الاحتياطية', 'success');
}

function restoreData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            let count = 0;
            Object.keys(backup).forEach(key => {
                if (key.startsWith('pharmacy_')) {
                    localStorage.setItem(key, backup[key]);
                    count++;
                }
            });
            showNotification(`تم استعادة ${count} عنصر. سيتم تحديث الصفحة...`, 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) { showNotification('الملف غير صالح', 'error'); }
    };
    reader.readAsText(file);
}

// ========== CHANGE PASSWORD ==========
function changePassword(oldPassword, newPassword, confirmPassword) {
    const currentUser = getCurrentUser();
    if (!currentUser) { showNotification('يجب تسجيل الدخول أولاً', 'error'); return false; }
    const users = getAllUsers();
    const user = users.find(u => u.id === currentUser.id);
    if (!user || user.password !== oldPassword) { showNotification('كلمة المرور الحالية غير صحيحة', 'error'); return false; }
    if (newPassword !== confirmPassword) { showNotification('كلمة المرور الجديدة غير متطابقة', 'error'); return false; }
    if (newPassword.length < 6) { showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error'); return false; }
    user.password = newPassword;
    Storage.set('users', users);
    showNotification('تم تغيير كلمة المرور بنجاح', 'success');
    return true;
}

// ========== PROFIT LOSS REPORT ==========
function getProfitLossReport(startDate, endDate) {
    const sales = getAllSales();
    const saleItems = Storage.get('saleItems') || [];
    const medicines = getAllMedicines();
    let filteredSales = sales;
    if (startDate || endDate) {
        filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return (!startDate || saleDate >= new Date(startDate)) && (!endDate || saleDate <= new Date(endDate));
        });
    }
    let totalRevenue = 0, totalCost = 0;
    filteredSales.forEach(sale => {
        totalRevenue += sale.grandTotal;
        const items = saleItems.filter(si => si.saleId === sale.id);
        items.forEach(item => {
            const medicine = medicines.find(m => m.id === item.medicineId);
            if (medicine) totalCost += medicine.purchasePrice * item.quantity;
        });
    });
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    return { totalRevenue, totalCost, totalProfit, profitMargin: profitMargin.toFixed(2), salesCount: filteredSales.length };
}

// ========== HEADER & USER MENU FUNCTIONS ==========
function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) userMenu.classList.toggle('active');
}

function updateHeaderUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userNameEl = document.getElementById('headerUserName');
        const userAvatarEl = document.getElementById('headerUserAvatar');
        if (userNameEl) userNameEl.textContent = user.name;
        if (userAvatarEl) userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
    }
}

function updateNotificationBadge(count) {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        if (count > 0) themeBtn.classList.add('has-notification');
        else themeBtn.classList.remove('has-notification');
    }
}

function checkNotifications() {
    const medicines = getAllMedicines();
    const lowStock = medicines.filter(m => m.quantity <= m.lowStockAlert).length;
    const expired = medicines.filter(m => isExpired(m.expiryDate)).length;
    updateNotificationBadge(lowStock + expired);
}

// ========== SIDEBAR & THEME ==========
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    let mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (!mobileToggle && window.innerWidth <= 992) {
        const btn = document.createElement('button');
        btn.className = 'mobile-menu-toggle';
        btn.innerHTML = '<i class="fas fa-bars"></i>';
        btn.onclick = () => sidebar.classList.toggle('active');
        document.body.appendChild(btn);
        mobileToggle = btn;
    }
    
    if (toggle) toggle.onclick = () => sidebar.classList.toggle('collapsed');
    if (mobileToggle) mobileToggle.onclick = () => sidebar.classList.toggle('active');
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !e.target.closest('.mobile-menu-toggle')) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    document.addEventListener('click', function(e) {
        const userMenu = document.getElementById('userMenu');
        if (userMenu && !userMenu.contains(e.target)) userMenu.classList.remove('active');
    });
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });
}

function initTheme() {
    if (localStorage.getItem('pharmacy_theme') === 'dark') document.body.classList.add('dark-mode');
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('pharmacy_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
}

function updateUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const userAvatarEl = document.querySelector('.user-avatar');
        if (userNameEl) userNameEl.textContent = user.name;
        if (userRoleEl) userRoleEl.textContent = getRoleName(user.role);
        if (userAvatarEl) userAvatarEl.innerHTML = user.name.charAt(0);
    }
    updateHeaderUserInfo();
}

// ========== MODAL ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}
function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
    });
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    initData();
    initSidebar();
    initTheme();
    initModals();
    updateUserInfo();
    checkNotifications();
    if (!window.location.href.includes('login.html')) checkAuth();
    else Storage.set('currentUser', null);
});