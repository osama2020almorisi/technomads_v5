// Reports management functions

// Load financial reports
function loadFinancialReports() {
    const invoices = getData('invoices');
    const expenses = getData('expenses');
    
    // حساب الإيرادات
    const totalRevenue = invoices.reduce((total, invoice) => {
        return total + (invoice.totalAmount || 0);
    }, 0);
    
    // حساب المصروفات
    const totalExpenses = expenses.reduce((total, expense) => {
        return total + (expense.amount || 0);
    }, 0);
    
    // حساب صافي الربح
    const netProfit = totalRevenue - totalExpenses;
    
    // تحديث الإحصائيات
    updateReportCard('totalRevenue', totalRevenue, 'إجمالي الإيرادات');
    updateReportCard('totalExpenses', totalExpenses, 'إجمالي المصروفات');
    updateReportCard('netProfit', netProfit, 'صافي الربح');
    updateReportCard('profitMargin', totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0, 'هامش الربح (%)');
    
    // تحميل الرسوم البيانية
    loadFinancialCharts();
    loadRecentTransactions();
}

// Load sales reports
function loadSalesReports() {
    const invoices = getData('invoices');
    const customers = getData('customers');
    const products = getData('products');
    
    // إحصائيات المبيعات
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === 'paid').length;
    const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
    
    // تحديث الإحصائيات
    updateReportCard('totalInvoices', totalInvoices, 'إجمالي الفواتير');
    updateReportCard('paidInvoices', paidInvoices, 'الفواتير المدفوعة');
    updateReportCard('pendingInvoices', pendingInvoices, 'الفواتير pending');
    updateReportCard('collectionRate', totalInvoices > 0 ? (paidInvoices / totalInvoices * 100) : 0, 'معدل التحصيل (%)');
    
    // تحميل الرسوم البيانية
    loadSalesCharts();
    loadTopCustomers();
    loadTopProducts();
}

// Load tax reports
function loadTaxReports() {
    const invoices = getData('invoices');
    
    // حساب الضرائب
    const totalTax = invoices.reduce((total, invoice) => {
        return total + (invoice.taxAmount || 0);
    }, 0);
    
    const taxableRevenue = invoices.reduce((total, invoice) => {
        return total + (invoice.subtotal || 0);
    }, 0);
    
    // تحديث الإحصائيات
    updateReportCard('totalTax', totalTax, 'إجمالي الضرائب');
    updateReportCard('taxableRevenue', taxableRevenue, 'الإيرادات الخاضعة للضريبة');
    updateReportCard('averageTaxRate', taxableRevenue > 0 ? (totalTax / taxableRevenue * 100) : 0, 'متوسط نسبة الضريبة (%)');
    
    // تحميل تفاصيل الضرائب
    loadTaxDetails();
}

// Update report card
function updateReportCard(elementId, value, label) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (typeof value === 'number') {
        if (label.includes('%')) {
            element.innerHTML = `<h3>${value.toFixed(2)}%</h3><p>${label}</p>`;
        } else if (label.includes('ريال') || label.includes('مبلغ')) {
            element.innerHTML = `<h3>${formatCurrency(value)}</h3><p>${label}</p>`;
        } else {
            element.innerHTML = `<h3>${value}</h3><p>${label}</p>`;
        }
    } else {
        element.innerHTML = `<h3>${value}</h3><p>${label}</p>`;
    }
}

// Load financial charts
function loadFinancialCharts() {
    const invoices = getData('invoices');
    const expenses = getData('expenses');
    
    // تجميع البيانات حسب الشهر
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // تهيئة الأشهر
    for (let month = 1; month <= 12; month++) {
        const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
        monthlyData[monthKey] = {
            revenue: 0,
            expenses: 0,
            profit: 0
        };
    }
    
    // تجميع الإيرادات
    invoices.forEach(invoice => {
        if (invoice.invoiceDate) {
            const date = new Date(invoice.invoiceDate);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].revenue += invoice.totalAmount || 0;
                monthlyData[monthKey].profit += invoice.totalAmount || 0;
            }
        }
    });
    
    // تجميع المصروفات
    expenses.forEach(expense => {
        if (expense.date) {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].expenses += expense.amount || 0;
                monthlyData[monthKey].profit -= expense.amount || 0;
            }
        }
    });
    
    // إعداد البيانات للرسم البياني
    const labels = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    });
    
    const revenueData = Object.values(monthlyData).map(data => data.revenue);
    const expensesData = Object.values(monthlyData).map(data => data.expenses);
    const profitData = Object.values(monthlyData).map(data => data.profit);
    
    // رسم图表 الإيرادات والمصروفات
    renderFinancialChart('revenueExpensesChart', labels, revenueData, expensesData);
    
    // رسم图表 الأرباح
    renderProfitChart('profitChart', labels, profitData);
}

// Render financial chart
function renderFinancialChart(canvasId, labels, revenueData, expensesData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'الإيرادات',
                    data: revenueData,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'المصروفات',
                    data: expensesData,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
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

// Render profit chart
function renderProfitChart(canvasId, labels, profitData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'صافي الربح',
                data: profitData,
                backgroundColor: 'rgba(23, 162, 184, 0.2)',
                borderColor: 'rgba(23, 162, 184, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `صافي الربح: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
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

// Load sales charts
function loadSalesCharts() {
    const invoices = getData('invoices');
    const customers = getData('customers');
    const products = getData('products');
    
    // رسم图表 حالة الفواتير
    renderInvoiceStatusChart(invoices);
    
    // رسم图表 المبيعات حسب العملاء
    renderSalesByCustomerChart(invoices, customers);
    
    // رسم图表 المبيعات حسب المنتجات
    renderSalesByProductChart(invoices, products);
}

// Render invoice status chart
function renderInvoiceStatusChart(invoices) {
    const ctx = document.getElementById('invoiceStatusChart');
    if (!ctx) return;
    
    const statusCount = {
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'pending').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        cancelled: invoices.filter(i => i.status === 'cancelled').length
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['مدفوعة', ' pending', 'متأخرة', 'ملغاة'],
            datasets: [{
                data: [statusCount.paid, statusCount.pending, statusCount.overdue, statusCount.cancelled],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(108, 117, 125, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true
                }
            }
        }
    });
}

// Render sales by customer chart
function renderSalesByCustomerChart(invoices, customers) {
    const ctx = document.getElementById('salesByCustomerChart');
    if (!ctx) return;
    
    const customerSales = {};
    
    invoices.forEach(invoice => {
        if (invoice.customerName && invoice.totalAmount) {
            customerSales[invoice.customerName] = (customerSales[invoice.customerName] || 0) + invoice.totalAmount;
        }
    });
    
    const sortedCustomers = Object.entries(customerSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedCustomers.map(item => item[0]),
            datasets: [{
                label: 'المبيعات',
                data: sortedCustomers.map(item => item[1]),
                backgroundColor: 'rgba(51, 102, 204, 0.7)',
                borderColor: 'rgba(51, 102, 204, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `المبيعات: ${formatCurrency(context.raw)}`;
                        }
                    }
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

// Render sales by product chart
function renderSalesByProductChart(invoices, products) {
    const ctx = document.getElementById('salesByProductChart');
    if (!ctx) return;
    
    const productSales = {};
    
    invoices.forEach(invoice => {
        if (invoice.items) {
            invoice.items.forEach(item => {
                const productName = item.productName || item.description;
                if (productName) {
                    productSales[productName] = (productSales[productName] || 0) + (item.total || 0);
                }
            });
        }
    });
    
    const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedProducts.map(item => item[0]),
            datasets: [{
                label: 'المبيعات',
                data: sortedProducts.map(item => item[1]),
                backgroundColor: 'rgba(111, 66, 193, 0.7)',
                borderColor: 'rgba(111, 66, 193, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `المبيعات: ${formatCurrency(context.raw)}`;
                        }
                    }
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

// Load recent transactions
function loadRecentTransactions() {
    const invoices = getData('invoices');
    const expenses = getData('expenses');
    
    const transactions = [];
    
    // إضافة الفواتير
    invoices.forEach(invoice => {
        transactions.push({
            type: 'إيراد',
            description: `فاتورة ${invoice.invoiceNumber}`,
            amount: invoice.totalAmount || 0,
            date: invoice.invoiceDate,
            className: 'text-success'
        });
    });
    
    // إضافة المصروفات
    expenses.forEach(expense => {
        transactions.push({
            type: 'مصروف',
            description: expense.description,
            amount: -(expense.amount || 0),
            date: expense.date,
            className: 'text-danger'
        });
    });
    
    // ترتيب حسب التاريخ
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // عرض آخر 10 معاملات
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    container.innerHTML = '';
    
    transactions.slice(0, 10).forEach(transaction => {
        const row = document.createElement('div');
        row.className = 'transaction-item';
        row.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-desc">${transaction.description}</div>
                <div class="transaction-type">${transaction.type}</div>
            </div>
            <div class="transaction-amount ${transaction.className}">
                ${formatCurrency(transaction.amount)}
            </div>
            <div class="transaction-date">
                ${formatDate(transaction.date)}
            </div>
        `;
        container.appendChild(row);
    });
}

// Load top customers
function loadTopCustomers() {
    const invoices = getData('invoices');
    const customers = getData('customers');
    
    const customerSales = {};
    
    invoices.forEach(invoice => {
        if (invoice.customerName && invoice.totalAmount) {
            customerSales[invoice.customerName] = (customerSales[invoice.customerName] || 0) + invoice.totalAmount;
        }
    });
    
    const topCustomers = Object.entries(customerSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const container = document.getElementById('topCustomers');
    if (!container) return;
    
    container.innerHTML = '';
    
    topCustomers.forEach(([customerName, amount], index) => {
        const row = document.createElement('div');
        row.className = 'top-item';
        row.innerHTML = `
            <div class="top-rank">${index + 1}</div>
            <div class="top-info">
                <div class="top-name">${customerName}</div>
                <div class="top-amount">${formatCurrency(amount)}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

// Load top products
function loadTopProducts() {
    const invoices = getData('invoices');
    
    const productSales = {};
    
    invoices.forEach(invoice => {
        if (invoice.items) {
            invoice.items.forEach(item => {
                const productName = item.productName || item.description;
                if (productName) {
                    productSales[productName] = (productSales[productName] || 0) + (item.total || 0);
                }
            });
        }
    });
    
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const container = document.getElementById('topProducts');
    if (!container) return;
    
    container.innerHTML = '';
    
    topProducts.forEach(([productName, amount], index) => {
        const row = document.createElement('div');
        row.className = 'top-item';
        row.innerHTML = `
            <div class="top-rank">${index + 1}</div>
            <div class="top-info">
                <div class="top-name">${productName}</div>
                <div class="top-amount">${formatCurrency(amount)}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

// Load tax details
function loadTaxDetails() {
    const invoices = getData('invoices');
    
    const taxDetails = invoices.map(invoice => ({
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.invoiceDate,
        taxableAmount: invoice.subtotal || 0,
        taxAmount: invoice.taxAmount || 0,
        taxRate: invoice.taxRate || 0
    }));
    
    const container = document.getElementById('taxDetails');
    if (!container) return;
    
    container.innerHTML = '';
    
    taxDetails.forEach(detail => {
        const row = document.createElement('div');
        row.className = 'tax-item';
        row.innerHTML = `
            <div class="tax-info">
                <div class="tax-invoice">${detail.invoiceNumber}</div>
                <div class="tax-date">${formatDate(detail.date)}</div>
            </div>
            <div class="tax-amounts">
                <div>${formatCurrency(detail.taxableAmount)}</div>
                <div>${detail.taxRate}%</div>
                <div class="text-success">${formatCurrency(detail.taxAmount)}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

// Export reports to PDF
function exportReportToPDF(reportType) {
    showAlert('info', 'جاري تحضير التقرير للتحميل...');
    
    // محاكاة عملية التصدير
    setTimeout(() => {
        const fileName = `تقرير_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
        showAlert('success', `تم تحضير التقرير: ${fileName}`);
        
        // في التطبيق الحقيقي، هنا سيتم استخدام مكتبة مثل jsPDF
        console.log(`تصدير تقرير ${reportType} كملف PDF`);
    }, 2000);
}

// Export reports to Excel
function exportReportToExcel(reportType) {
    showAlert('info', 'جاري تحضير التقرير للتحميل...');
    
    // محاكاة عملية التصدير
    setTimeout(() => {
        const fileName = `تقرير_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
        showAlert('success', `تم تحضير التقرير: ${fileName}`);
        
        // في التطبيق الحقيقي، هنا سيتم استخدام مكتبة مثل SheetJS
        console.log(`تصدير تقرير ${reportType} كملف Excel`);
    }, 2000);
}

// Initialize date filters
function initDateFilters() {
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    if (dateFrom && dateTo) {
        // تعيين التاريخ الافتراضي (الشهر الحالي)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        dateFrom.value = firstDay.toISOString().split('T')[0];
        dateTo.value = lastDay.toISOString().split('T')[0];
        
        // إضافة event listeners للتحديث
        dateFrom.addEventListener('change', updateReports);
        dateTo.addEventListener('change', updateReports);
    }
}

// Update reports based on date filter
function updateReports() {
    const reportType = document.querySelector('.report-section.active')?.id;
    
    if (reportType === 'financial-reports') {
        loadFinancialReports();
    } else if (reportType === 'sales-reports') {
        loadSalesReports();
    } else if (reportType === 'tax-reports') {
        loadTaxReports();
    }
}

// Switch between report tabs
function switchReportTab(tabId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.report-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إظهار القسم المحدد
    document.getElementById(tabId).classList.add('active');
    
    // تحميل التقرير المناسب
    if (tabId === 'financial-reports') {
        loadFinancialReports();
    } else if (tabId === 'sales-reports') {
        loadSalesReports();
    } else if (tabId === 'tax-reports') {
        loadTaxReports();
    }
}