// Dashboard functionality

// Load user data for header
function loadUserData() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.fullName;
    }
    
    // Create user avatar
    const userAvatarElement = document.getElementById('userAvatar');
    if (userAvatarElement) {
        const initials = getUserInitials(user.fullName);
        const randomColor = getRandomColor();
        
        userAvatarElement.innerHTML = initials;
        userAvatarElement.style.backgroundColor = randomColor;
    }
}

// Load dashboard statistics
function loadDashboardData() {
    const invoices = getData('invoices');
    const customers = getData('customers');
    const products = getData('products');
    const expenses = getData('expenses');
    
    // Calculate total sales
    const totalSales = invoices.reduce((total, invoice) => {
        return total + (invoice.totalAmount || 0);
    }, 0);
    
    // Update statistics cards
    updateStatCard(0, invoices.length, 'إجمالي الفواتير');
    updateStatCard(1, customers.length, 'عدد العملاء');
    updateStatCard(2, products.length, 'المنتجات/الخدمات');
    updateStatCard(3, totalSales, 'إجمالي المبيعات');
}

// Update individual stat card
function updateStatCard(index, value, label) {
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards[index]) {
        const numberElement = statCards[index].querySelector('h3');
        
        if (numberElement) {
            if (typeof value === 'number') {
                if (label.includes('%')) {
                    numberElement.textContent = value.toFixed(2) + '%';
                } else if (label.includes('ريال') || label.includes('مبلغ')) {
                    numberElement.textContent = formatCurrency(value);
                } else {
                    numberElement.textContent = value;
                }
            } else {
                numberElement.textContent = value;
            }
        }
    }
    
    // أيضا تحديث العناصر الجديدة
    const totalInvoices = getData('invoices').length;
    const totalCustomers = getData('customers').length;
    const totalProducts = getData('products').length;
    const totalSales = getData('invoices').reduce((total, invoice) => total + (parseFloat(invoice.totalAmount) || 0), 0);
    
    document.getElementById('totalInvoicesCount').textContent = totalInvoices;
    document.getElementById('totalCustomersCount').textContent = totalCustomers;
    document.getElementById('totalProductsCount').textContent = totalProducts;
    document.getElementById('totalSalesAmount').textContent = formatCurrency(totalSales);
    
    // عرض رسالة البيانات الفارغة إذا لزم الأمر
    const emptyMessage = document.getElementById('emptyDataMessage');
    if (totalInvoices === 0 && totalCustomers === 0 && totalProducts === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
    }
}

// Initialize charts
function initCharts() {
    const revenueCtx = document.getElementById('revenueChart');
    if (!revenueCtx) return;
    
    // سيتم تحديث هذه البيانات من واقع بيانات المستخدم
    const data = getChartData();
    
    new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'الإيرادات',
                    data: data.revenue,
                    borderColor: '#3366cc',
                    backgroundColor: 'rgba(51, 102, 204, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'المصروفات',
                    data: data.expenses,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Get chart data based on user's actual data
function getChartData() {
    const invoices = getData('invoices');
    const expenses = getData('expenses');
    
    // بيانات افتراضية مؤقتة - سيتم استبدالها ببيانات حقيقية
    // عندما يكون لدى المستخدم بيانات كافية
    if (invoices.length === 0 && expenses.length === 0) {
        return {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            revenue: [0, 0, 0, 0, 0, 0],
            expenses: [0, 0, 0, 0, 0, 0]
        };
    }
    
    // هنا سيتم إضافة المنطق لحساب البيانات الفعلية من فواتير ومصروفات المستخدم
    // بناءً على الفترة الزمنية المحددة
    return {
        labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
        revenue: [1500, 2200, 1800, 2500],
        expenses: [800, 1200, 900, 1100]
    };
}

// Update charts when period changes
function updateCharts() {
    // سيتم تحديث الرسوم البيانية بناءً على الفترة المحددة
    const period = document.getElementById('chartPeriod').value;
    initCharts(); // إعادة تهيئة الرسوم البيانية بالبيانات الجديدة
}

// Load recent invoices
function loadRecentInvoices() {
    const invoices = getData('invoices');
    const recentContainer = document.getElementById('recentInvoices');
    
    if (!recentContainer) return;
    
    // Clear existing content
    recentContainer.innerHTML = '';
    
    if (invoices.length === 0) {
        recentContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-invoice"></i>
                <p>لا توجد فواتير بعد</p>
                <a href="invoices/create.html" class="btn btn-primary">إنشاء فاتورة أولى</a>
            </div>
        `;
        return;
    }
    
    // Sort invoices by date (newest first)
    const sortedInvoices = invoices.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 5); // Latest 5 invoices
    
    sortedInvoices.forEach(invoice => {
        const invoiceElement = document.createElement('div');
        invoiceElement.className = 'recent-item';
        invoiceElement.innerHTML = `
            <div class="recent-item-info">
                <div class="recent-item-icon">
                    <i class="fas fa-file-invoice"></i>
                </div>
                <div class="recent-item-details">
                    <h4>فاتورة #${invoice.invoiceNumber}</h4>
                    <p>${invoice.customerName || 'عميل'}</p>
                </div>
            </div>
            <div class="recent-item-amount">
                ${formatCurrency(invoice.totalAmount || 0)}
            </div>
        `;
        recentContainer.appendChild(invoiceElement);
    });
}

// Load recent activity
function loadRecentActivity() {
    // جمع النشاطات من مختلف المصادر
    const activities = [];
    const invoices = getData('invoices');
    const customers = getData('customers');
    const expenses = getData('expenses');
    
    // إضافة نشاطات الفواتير
    invoices.forEach(invoice => {
        activities.push({
            type: 'invoice',
            action: invoice.status === 'paid' ? 'دفع' : 'إنشاء',
            message: `تم ${invoice.status === 'paid' ? 'دفع' : 'إنشاء'} فاتورة #${invoice.invoiceNumber}`,
            time: invoice.updatedAt || invoice.createdAt,
            icon: 'fa-file-invoice'
        });
    });
    
    // إضافة نشاطات العملاء
    customers.forEach(customer => {
        activities.push({
            type: 'customer',
            action: 'إضافة',
            message: `تم إضافة عميل جديد: ${customer.name}`,
            time: customer.createdAt,
            icon: 'fa-user-plus'
        });
    });
    
    // إضافة نشاطات المصروفات
    expenses.forEach(expense => {
        activities.push({
            type: 'expense',
            action: 'إضافة',
            message: `تم تسجيل مصروف: ${expense.description}`,
            time: expense.createdAt,
            icon: 'fa-money-bill-wave'
        });
    });
    
    // عرض النشاطات
    const activityContainer = document.getElementById('activityList');
    if (!activityContainer) return;
    
    // Clear existing content
    activityContainer.innerHTML = '';
    
    if (activities.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>لا توجد نشاطات مسجلة بعد</p>
            </div>
        `;
        return;
    }
    
    // Sort activities by time (newest first)
    const sortedActivities = activities.sort((a, b) => 
        new Date(b.time) - new Date(a.time)
    ).slice(0, 10); // Latest 10 activities
    
    sortedActivities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <div class="activity-time">${formatDate(activity.time)}</div>
            </div>
        `;
        activityContainer.appendChild(activityElement);
    });
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    sidebar.classList.toggle('show');
}

// Quick add functionality
function quickAdd(type) {
    switch(type) {
        case 'invoice':
            window.location.href = 'invoices/create.html';
            break;
        case 'customer':
            window.location.href = 'customers/create.html';
            break;
        case 'product':
            window.location.href = 'products/create.html';
            break;
        case 'expense':
            window.location.href = 'expenses/create.html';
            break;
    }
}

// Logout function
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        logoutUser();
        window.location.href = 'index.html';
    }
}

// Initialize dropdown menus
document.addEventListener('click', function(e) {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.querySelector('.dropdown-menu').classList.remove('show');
        }
    });
    
    if (e.target.classList.contains('dropdown-toggle')) {
        const menu = e.target.parentElement.querySelector('.dropdown-menu');
        menu.classList.toggle('show');
    }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('mainSidebar');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (sidebar.classList.contains('show') && 
            !sidebar.contains(e.target) && 
            !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    }
});



function debugStorage() {
    console.clear();
    console.log('=== وضع التصحيح ===');
    
    const invoices = getData('invoices');
    const customers = getData('customers');
    const products = getData('products');
    
    console.log('الفواتير:', invoices);
    console.log('العملاء:', customers);
    console.log('المنتجات:', products);
    console.log('الإعدادات:', getSettings());
    
    showAlert('info', 'تم فحص التخزين. راجع console للتفاصيل.');
    
    // إعادة تحميل Dashboard
    loadDashboardData();
}

// فحص شامل للبيانات
function checkCurrentData() {
    console.clear();
    console.log('=== فحص شامل للبيانات ===');
    
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
            const parsedData = JSON.parse(data);
            console.log(`${key}: ${parsedData.length} عناصر`);
            console.log('العناصر:', parsedData);
        } else {
            console.log(`${key}: غير موجود`);
        }
        console.log('---');
    });
    
    showAlert('info', 'تم فحص البيانات. راجع console للتفاصيل.');
}