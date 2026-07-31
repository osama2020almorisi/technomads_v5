/**
 * المحاسب المالي Pro - Dashboard Module
 */

class DashboardModule {
  constructor() {
    this.charts = {};
  }

  init() {
    this.loadStats();
    this.loadCharts();
    this.loadRecentInvoices();
    this.loadRecentActivity();
    this.loadTopCustomers();
    this.loadExpenseBreakdown();
  }

  loadStats() {
    const invoices = Storage.getAll('invoices');
    const customers = Storage.getAll('customers');
    const products = Storage.getAll('products');
    const expenses = Storage.getAll('expenses');

    const totalSales = invoices.reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const netProfit = totalSales - totalExpenses;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

    const stats = [
      { 
        label: 'إجمالي المبيعات', 
        value: totalSales, 
        icon: 'fa-chart-line', 
        type: 'success',
        change: '+12.5%',
        changeType: 'up'
      },
      { 
        label: 'إجمالي المصروفات', 
        value: totalExpenses, 
        icon: 'fa-wallet', 
        type: 'danger',
        change: '+5.2%',
        changeType: 'down'
      },
      { 
        label: 'صافي الربح', 
        value: netProfit, 
        icon: 'fa-coins', 
        type: 'info',
        change: netProfit >= 0 ? '+8.3%' : '-3.1%',
        changeType: netProfit >= 0 ? 'up' : 'down'
      },
      { 
        label: 'الفواتير المعلقة', 
        value: pendingInvoices, 
        icon: 'fa-file-invoice', 
        type: 'warning',
        change: `${paidInvoices} مدفوعة`,
        changeType: 'up'
      }
    ];

    const container = document.getElementById('statsGrid');
    if (!container) return;

    container.innerHTML = stats.map(stat => `
      <div class="stat-card ${stat.type} animate-fade-in-up">
        <div class="stat-icon">
          <i class="fas ${stat.icon}"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">${stat.label}</div>
          <div class="stat-value">${stat.value < 100 && stat.value % 1 === 0 ? stat.value : Utils.formatCurrency(stat.value)}</div>
          <div class="stat-change ${stat.changeType}">
            <i class="fas fa-arrow-${stat.changeType === 'up' ? 'up' : 'down'}"></i>
            ${stat.change}
          </div>
        </div>
      </div>
    `).join('');
  }

  loadCharts() {
    this.loadRevenueChart();
    this.loadStatusChart();
  }

  loadRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const invoices = Storage.getAll('invoices');
    const expenses = Storage.getAll('expenses');

    // Group by month
    const months = [];
    const revenueData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = Utils.getMonthName(d.getMonth());
      months.push(monthName);

      const monthRevenue = invoices
        .filter(inv => inv.issueDate?.startsWith(monthKey) && inv.status === 'paid')
        .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);

      const monthExpenses = expenses
        .filter(exp => exp.date?.startsWith(monthKey))
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      revenueData.push(monthRevenue);
      expenseData.push(monthExpenses);
    }

    if (this.charts.revenue) this.charts.revenue.destroy();

    this.charts.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'الإيرادات',
            data: revenueData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: 'المصروفات',
            data: expenseData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            rtl: true,
            labels: { font: { family: 'Tajawal' }, usePointStyle: true }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => Utils.formatCurrency(value),
              font: { family: 'Tajawal', size: 11 }
            }
          },
          x: {
            ticks: { font: { family: 'Tajawal', size: 11 } }
          }
        }
      }
    });
  }

  loadStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;

    const invoices = Storage.getAll('invoices');
    const statusCounts = {
      paid: invoices.filter(i => i.status === 'paid').length,
      pending: invoices.filter(i => i.status === 'pending').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      draft: invoices.filter(i => i.status === 'draft').length
    };

    if (this.charts.status) this.charts.status.destroy();

    this.charts.status = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['مدفوعة', 'معلقة', 'متأخرة', 'مسودة'],
        datasets: [{
          data: [statusCounts.paid, statusCounts.pending, statusCounts.overdue, statusCounts.draft],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#9ca3af'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            rtl: true,
            labels: { font: { family: 'Tajawal' }, usePointStyle: true, padding: 20 }
          }
        },
        cutout: '70%'
      }
    });
  }

  loadRecentInvoices() {
    const container = document.getElementById('recentInvoices');
    if (!container) return;

    const invoices = Storage.getAll('invoices')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (invoices.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 32px;">
          <div class="empty-state-icon" style="width: 64px; height: 64px; font-size: 24px;">
            <i class="fas fa-file-invoice"></i>
          </div>
          <h4 class="empty-state-title">لا توجد فواتير</h4>
          <p class="empty-state-desc">ابدأ بإنشاء فاتورتك الأولى</p>
          <a href="invoices/create.html" class="btn btn-primary">
            <i class="fas fa-plus"></i> إنشاء فاتورة
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>رقم الفاتورة</th>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(inv => `
              <tr style="cursor: pointer;" onclick="window.location.href='invoices/view.html?id=${inv.id}'">
                <td><strong>${inv.invoiceNumber}</strong></td>
                <td>${inv.customerName}</td>
                <td>${Utils.formatCurrency(inv.totalAmount)}</td>
                <td><span class="status-badge ${inv.status}">${this.getStatusLabel(inv.status)}</span></td>
                <td>${Utils.formatDate(inv.issueDate)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    const activities = Storage.getRecentActivities(8);

    if (activities.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <p style="color: var(--gray-500); font-size: 14px;">لا توجد نشاطات حديثة</p>
        </div>
      `;
      return;
    }

    const icons = {
      create: 'fa-plus-circle text-success',
      update: 'fa-edit text-primary',
      delete: 'fa-trash-alt text-danger'
    };

    container.innerHTML = activities.map(act => `
      <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--gray-100);">
        <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--gray-100); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <i class="fas ${icons[act.action] || 'fa-info'}"></i>
        </div>
        <div style="flex: 1;">
          <p style="font-size: 14px; color: var(--gray-800); margin: 0;">${act.title}</p>
          <p style="font-size: 12px; color: var(--gray-400); margin-top: 4px;">
            ${Utils.formatRelativeTime(act.timestamp)} · ${act.user}
          </p>
        </div>
      </div>
    `).join('');
  }

  loadTopCustomers() {
    const container = document.getElementById('topCustomers');
    if (!container) return;

    const invoices = Storage.getAll('invoices');
    const customerTotals = {};

    invoices.forEach(inv => {
      if (!customerTotals[inv.customerId]) {
        customerTotals[inv.customerId] = { name: inv.customerName, total: 0, count: 0 };
      }
      customerTotals[inv.customerId].total += parseFloat(inv.totalAmount) || 0;
      customerTotals[inv.customerId].count++;
    });

    const topCustomers = Object.values(customerTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    if (topCustomers.length === 0) {
      container.innerHTML = `<p style="color: var(--gray-500); text-align: center; padding: 24px;">لا توجد بيانات</p>`;
      return;
    }

    const maxTotal = Math.max(...topCustomers.map(c => c.total));

    container.innerHTML = topCustomers.map((cust, index) => `
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; ${index < topCustomers.length - 1 ? 'border-bottom: 1px solid var(--gray-100);' : ''}">
        <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: ${Utils.stringToColor(cust.name)}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">
          ${Utils.getInitials(cust.name)}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 14px; font-weight: 500; color: var(--gray-800);">${cust.name}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--gray-900);">${Utils.formatCurrency(cust.total)}</span>
          </div>
          <div style="width: 100%; height: 6px; background: var(--gray-100); border-radius: var(--radius-full); overflow: hidden;">
            <div style="width: ${(cust.total / maxTotal * 100).toFixed(1)}%; height: 100%; background: ${Utils.stringToColor(cust.name)}; border-radius: var(--radius-full); transition: width 0.5s ease;"></div>
          </div>
          <p style="font-size: 12px; color: var(--gray-400); margin-top: 4px;">${cust.count} فاتورة</p>
        </div>
      </div>
    `).join('');
  }

  loadExpenseBreakdown() {
    const container = document.getElementById('expenseBreakdown');
    if (!container) return;

    const expenses = Storage.getAll('expenses');
    const categoryTotals = {};

    expenses.forEach(exp => {
      const cat = exp.category || 'غير مصنف';
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += parseFloat(exp.amount) || 0;
    });

    const categories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    if (categories.length === 0) {
      container.innerHTML = `<p style="color: var(--gray-500); text-align: center; padding: 24px;">لا توجد مصروفات</p>`;
      return;
    }

    const total = categories.reduce((sum, [, amount]) => sum + amount, 0);
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

    container.innerHTML = categories.map(([cat, amount], index) => `
      <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0;">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${colors[index % colors.length]}; flex-shrink: 0;"></div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; color: var(--gray-700);">${cat}</span>
            <span style="font-size: 14px; font-weight: 600; color: var(--gray-900);">${Utils.formatCurrency(amount)}</span>
          </div>
          <div style="font-size: 12px; color: var(--gray-400); margin-top: 2px;">${((amount / total) * 100).toFixed(1)}%</div>
        </div>
      </div>
    `).join('');
  }

  getStatusLabel(status) {
    const labels = {
      paid: 'مدفوعة',
      pending: 'معلقة',
      overdue: 'متأخرة',
      draft: 'مسودة'
    };
    return labels[status] || status;
  }
}

window.DashboardModule = new DashboardModule();
