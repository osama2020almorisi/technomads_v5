// Main application functions

// Check authentication on page load
function checkAuth() {
    if (!isLoggedIn() && !window.location.pathname.includes('auth/') && 
        window.location.pathname !== '/index.html' && 
        window.location.pathname !== '/') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Format currency
function formatCurrency(amount) {
    if (amount === undefined || amount === null) {
        return '0.00 ريال';
    }
    
    const num = parseFloat(amount);
    if (isNaN(num)) {
        return '0.00 ريال';
    }
    
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA').format(date);
}

// Generate random color for avatars
function getRandomColor() {
    const colors = [
        '#3366cc', '#dc3545', '#28a745', '#ffc107', 
        '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Get user initials for avatar
function getUserInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize tooltips
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip';
            tooltipEl.textContent = tooltipText;
            document.body.appendChild(tooltipEl);
            
            const rect = this.getBoundingClientRect();
            tooltipEl.style.top = (rect.top - tooltipEl.offsetHeight - 5) + 'px';
            tooltipEl.style.left = (rect.left + (rect.width - tooltipEl.offsetWidth) / 2) + 'px';
        });
        
        tooltip.addEventListener('mouseleave', function() {
            const tooltipEl = document.querySelector('.tooltip');
            if (tooltipEl) {
                tooltipEl.remove();
            }
        });
    });
}

// Add tooltip styles
const tooltipStyles = document.createElement('style');
tooltipStyles.textContent = `
    .tooltip {
        position: fixed;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
    }
`;
document.head.appendChild(tooltipStyles);

// إغلاق القائمة الجانبية عند النقر خارجها
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('mainSidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    if (window.innerWidth < 768 && 
        sidebar.classList.contains('show') && 
        !sidebar.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('show');
    }
});

// إدارة القوائم المنسدلة
function initDropdowns() {
    document.addEventListener('click', function(e) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) menu.classList.remove('show');
            }
        });
        
        if (e.target.classList.contains('dropdown-toggle')) {
            const menu = e.target.closest('.dropdown').querySelector('.dropdown-menu');
            if (menu) menu.classList.toggle('show');
        }
    });
}

// دالة تحميل آمنة مع إعادة محاولة
function safeLoad(loadFunction, maxAttempts = 3, delay = 200) {
    let attempts = 0;
    
    function tryLoad() {
        attempts++;
        try {
            loadFunction();
        } catch (error) {
            console.error(`محاولة ${attempts} فشلت:`, error);
            if (attempts < maxAttempts) {
                setTimeout(tryLoad, delay * attempts);
            }
        }
    }
    
    tryLoad();
}

// تهيئة التطبيق عند تحميل أي صفحة
function initializeApp() {
    console.log('تهيئة التطبيق...');
    
    // تهيئة التخزين (بدون مسح البيانات الموجودة)
    initializeStorage();
    
    // التحقق من المصادقة
    if (!checkAuth()) {
        return false;
    }
    
    // تحميل بيانات المستخدم
    loadUserData();
    
    // تهيئة القوائم المنسدلة
    initDropdowns();
    
    // تهيئة التلميحات
    initTooltips();
    
    // تحميل البيانات بناءً على الصفحة الحالية
    setTimeout(() => {
        const path = window.location.pathname;
        
        if (path.includes('dashboard.html')) {
            safeLoad(() => {
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
                if (typeof initCharts === 'function') {
                    initCharts();
                }
                if (typeof loadRecentInvoices === 'function') {
                    loadRecentInvoices();
                }
                if (typeof loadRecentActivity === 'function') {
                    loadRecentActivity();
                }
            });
        }
        else if (path.includes('customers/list.html')) {
            safeLoad(() => {
                if (typeof loadCustomers === 'function') {
                    loadCustomers();
                }
                if (typeof initCustomersSearch === 'function') {
                    initCustomersSearch();
                }
            });
        }
        else if (path.includes('products/list.html')) {
            safeLoad(() => {
                if (typeof loadProducts === 'function') {
                    loadProducts();
                }
                if (typeof initProductsSearch === 'function') {
                    initProductsSearch();
                }
            });
        }
        else if (path.includes('invoices/list.html')) {
            safeLoad(() => {
                if (typeof loadInvoices === 'function') {
                    loadInvoices();
                }
                if (typeof initInvoicesSearch === 'function') {
                    initInvoicesSearch();
                }
            });
        }
        else if (path.includes('expenses/list.html')) {
            safeLoad(() => {
                if (typeof loadExpenses === 'function') {
                    loadExpenses();
                }
                if (typeof initExpensesSearch === 'function') {
                    initExpensesSearch();
                }
            });
        }
    }, 100);
    
    return true;
}

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (initializeApp()) {
        console.log('تم تهيئة التطبيق بنجاح');
    }
});

// إعادة تحميل تلقائي للبيانات
function autoReloadData() {
    // إعادة تحميل بعد إضافة بيانات جديدة
    if (window.location.pathname.includes('list.html')) {
        setTimeout(() => {
            if (window.location.pathname.includes('customers')) {
                if (typeof loadCustomers === 'function') loadCustomers();
            } else if (window.location.pathname.includes('products')) {
                if (typeof loadProducts === 'function') loadProducts();
            } else if (window.location.pathname.includes('invoices')) {
                if (typeof loadInvoices === 'function') loadInvoices();
            } else if (window.location.pathname.includes('expenses')) {
                if (typeof loadExpenses === 'function') loadExpenses();
            }
        }, 100);
    }
}