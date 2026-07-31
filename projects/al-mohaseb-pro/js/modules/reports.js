/**
 * المحاسب المالي Pro - Reports Module
 * Financial reports: P&L, Balance Sheet, Cash Flow, etc.
 */

class ReportsModule {
  initFinancial() {
    App.setPageHeader('تقرير الأرباح والخسائر', 'نظرة شاملة على الأداء المالي');
    this.loadProfitLossReport();
  }

  initSales() {
    App.setPageHeader('تقرير المبيعات', 'تحليل المبيعات والإيرادات');
    this.loadSalesReport();
  }

  initExpenses() {
    App.setPageHeader('تقرير المصروفات', 'تحليل المصروفات والتكاليف');
    this.loadExpensesReport();
  }

  loadProfitLossReport() {
    const invoices = Storage.getAll('invoices');
    const expenses = Storage.getAll('expenses');
    const products = Storage.getAll('products');

    // Calculate totals
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const cogs = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => {
        return sum + (inv.items || []).reduce((itemSum, item) => {
          const product = products.find(p => p.id === item.productId);
          return itemSum + ((product?.cost || 0) * (item.quantity || 0));
        }, 0);
      }, 0);

    const grossProfit = totalRevenue - cogs;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(1) : 0;

    const container = document.getElementById('financialReport');
    if (!container) return;

    container.innerHTML = `
      <div class="grid-4" style="margin-bottom: 32px;">
        <div class="stat-card success">
          <div class="stat-icon"><i class="fas fa-arrow-up"></i></div>
          <div class="stat-content">
            <div class="stat-label">إجمالي الإيرادات</div>
            <div class="stat-value">${Utils.formatCurrency(totalRevenue)}</div>
          </div>
        </div>
        <div class="stat-card danger">
          <div class="stat-icon"><i class="fas fa-arrow-down"></i></div>
          <div class="stat-content">
            <div class="stat-label">إجمالي المصروفات</div>
            <div class="stat-value">${Utils.formatCurrency(totalExpenses)}</div>
          </div>
        </div>
        <div class="stat-card info">
          <div class="stat-icon"><i class="fas fa-coins"></i></div>
          <div class="stat-content">
            <div class="stat-label">صافي الربح</div>
            <div class="stat-value">${Utils.formatCurrency(netProfit)}</div>
          </div>
        </div>
        <div class="stat-card warning">
          <div class="stat-icon"><i class="fas fa-percentage"></i></div>
          <div class="stat-content">
            <div class="stat-label">هامش الربح</div>
            <div class="stat-value">${profitMargin}%</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-header-title">ملخص الدخل</h3>
          </div>
          <div class="card-body">
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--gray-100);">
              <span>المبيعات</span>
              <strong>${Utils.formatCurrency(totalRevenue)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--gray-100);">
              <span>تكلفة البضاعة المباعة</span>
              <strong style="color: var(--danger-600);">-${Utils.formatCurrency(cogs)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 16px 0; margin-top: 8px; border-top: 2px solid var(--gray-200); font-size: 18px; font-weight: bold;">
              <span>إجمالي الربح</span>
              <span style="color: ${grossProfit >= 0 ? 'var(--success-600)' : 'var(--danger-600)'};">${Utils.formatCurrency(grossProfit)}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-header-title">المصروفات حسب الفئة</h3>
          </div>
          <div class="card-body">
            ${this.renderExpenseBreakdown(expenses)}
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h3 class="card-header-title">الأداء الشهري</h3>
        </div>
        <div class="card-body">
          <canvas id="monthlyChart" height="300"></canvas>
        </div>
      </div>
    `;

    this.renderMonthlyChart(invoices, expenses);
  }

  renderExpenseBreakdown(expenses) {
    const categoryTotals = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'غير مصنف';
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += parseFloat(exp.amount) || 0;
    });

    const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const total = categories.reduce((sum, [, amount]) => sum + amount, 0);

    if (categories.length === 0) {
      return '<p style="color: var(--gray-500); text-align: center;">لا توجد مصروفات</p>';
    }

    return categories.map(([cat, amount]) => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--gray-100);">
        <span style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${Utils.stringToColor(cat)};"></span>
          ${cat}
        </span>
        <div style="text-align: left;">
          <strong>${Utils.formatCurrency(amount)}</strong>
          <span style="font-size: 12px; color: var(--gray-400); margin-right: 8px;">${((amount / total) * 100).toFixed(1)}%</span>
        </div>
      </div>
    `).join('');
  }

  renderMonthlyChart(invoices, expenses) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    const months = [];
    const revenueData = [];
    const expenseData = [];
    const profitData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(Utils.getMonthName(d.getMonth()));

      const monthRevenue = invoices
        .filter(inv => inv.issueDate?.startsWith(monthKey) && inv.status === 'paid')
        .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);

      const monthExpenses = expenses
        .filter(exp => exp.date?.startsWith(monthKey))
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      revenueData.push(monthRevenue);
      expenseData.push(monthExpenses);
      profitData.push(monthRevenue - monthExpenses);
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'الإيرادات',
            data: revenueData,
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'المصروفات',
            data: expenseData,
            backgroundColor: '#ef4444',
            borderRadius: 6
          },
          {
            label: 'صافي الربح',
            data: profitData,
            backgroundColor: '#6366f1',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', rtl: true, labels: { font: { family: 'Tajawal' } } }
        },
        scales: {
          y: {
            ticks: { callback: value => Utils.formatCurrency(value), font: { family: 'Tajawal' } }
          },
          x: { ticks: { font: { family: 'Tajawal' } } }
        }
      }
    });
  }

  loadSalesReport() {
    const invoices = Storage.getAll('invoices');
    const customers = Storage.getAll('customers');

    // Sales by status
    const statusCounts = {
      paid: invoices.filter(i => i.status === 'paid').length,
      pending: invoices.filter(i => i.status === 'pending').length,
      overdue: invoices.filter(i => i.status === 'overdue').length
    };

    const totalPaid = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (parseFloat(i.totalAmount) || 0), 0);

    const totalPending = invoices
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + (parseFloat(i.totalAmount) || 0), 0);

    const totalOverdue = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + (parseFloat(i.totalAmount) || 0), 0);

    const container = document.getElementById('salesReport');
    if (!container) return;

    container.innerHTML = `
      <div class="grid-3" style="margin-bottom: 32px;">
        <div class="stat-card success">
          <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
          <div class="stat-content">
            <div class="stat-label">المدفوع</div>
            <div class="stat-value">${Utils.formatCurrency(totalPaid)}</div>
            <div class="stat-change up"><i class="fas fa-arrow-up"></i> ${statusCounts.paid} فاتورة</div>
          </div>
        </div>
        <div class="stat-card warning">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-content">
            <div class="stat-label">المعلق</div>
            <div class="stat-value">${Utils.formatCurrency(totalPending)}</div>
            <div class="stat-change up"><i class="fas fa-arrow-up"></i> ${statusCounts.pending} فاتورة</div>
          </div>
        </div>
        <div class="stat-card danger">
          <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-content">
            <div class="stat-label">المتأخر</div>
            <div class="stat-value">${Utils.formatCurrency(totalOverdue)}</div>
            <div class="stat-change down"><i class="fas fa-arrow-down"></i> ${statusCounts.overdue} فاتورة</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-header-title">المبيعات الشهرية</h3></div>
          <div class="card-body"><canvas id="salesMonthlyChart" height="250"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-header-title">أفضل العملاء</h3></div>
          <div class="card-body">${this.renderTopCustomersReport(invoices, customers)}</div>
        </div>
      </div>
    `;

    this.renderSalesMonthlyChart(invoices);
  }

  renderSalesMonthlyChart(invoices) {
    const ctx = document.getElementById('salesMonthlyChart');
    if (!ctx) return;

    const months = [];
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(Utils.getMonthName(d.getMonth()));

      const monthTotal = invoices
        .filter(inv => inv.issueDate?.startsWith(monthKey))
        .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
      data.push(monthTotal);
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'المبيعات',
          data: data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { callback: value => Utils.formatCurrency(value), font: { family: 'Tajawal' } } },
          x: { ticks: { font: { family: 'Tajawal' } } }
        }
      }
    });
  }

  renderTopCustomersReport(invoices, customers) {
    const customerTotals = {};
    invoices.forEach(inv => {
      if (!customerTotals[inv.customerId]) {
        customerTotals[inv.customerId] = { name: inv.customerName, total: 0, count: 0 };
      }
      customerTotals[inv.customerId].total += parseFloat(inv.totalAmount) || 0;
      customerTotals[inv.customerId].count++;
    });

    const topCustomers = Object.values(customerTotals).sort((a, b) => b.total - a.total).slice(0, 5);
    const maxTotal = Math.max(...topCustomers.map(c => c.total), 1);

    return topCustomers.map(c => `
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--gray-100);">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: ${Utils.stringToColor(c.name)}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${Utils.getInitials(c.name)}</div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 500;">${c.name}</span>
            <span style="font-weight: 600;">${Utils.formatCurrency(c.total)}</span>
          </div>
          <div style="width: 100%; height: 6px; background: var(--gray-100); border-radius: 3px; overflow: hidden;">
            <div style="width: ${(c.total / maxTotal * 100).toFixed(1)}%; height: 100%; background: ${Utils.stringToColor(c.name)}; border-radius: 3px;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  loadExpensesReport() {
    const expenses = Storage.getAll('expenses');
    const total = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const container = document.getElementById('expensesReport');
    if (!container) return;

    container.innerHTML = `
      <div class="grid-2" style="margin-bottom: 32px;">
        <div class="stat-card danger">
          <div class="stat-icon"><i class="fas fa-wallet"></i></div>
          <div class="stat-content">
            <div class="stat-label">إجمالي المصروفات</div>
            <div class="stat-value">${Utils.formatCurrency(total)}</div>
          </div>
        </div>
        <div class="stat-card info">
          <div class="stat-icon"><i class="fas fa-receipt"></i></div>
          <div class="stat-content">
            <div class="stat-label">عدد المصروفات</div>
            <div class="stat-value">${expenses.length}</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3 class="card-header-title">المصروفات حسب الفئة</h3></div>
          <div class="card-body"><canvas id="expenseCategoryChart" height="250"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-header-title">المصروفات الشهرية</h3></div>
          <div class="card-body"><canvas id="expenseMonthlyChart" height="250"></canvas></div>
        </div>
      </div>
    `;

    this.renderExpenseCharts(expenses);
  }

  renderExpenseCharts(expenses) {
    // Category chart
    const categoryCtx = document.getElementById('expenseCategoryChart');
    if (categoryCtx) {
      const categoryTotals = {};
      expenses.forEach(exp => {
        const cat = exp.category || 'غير مصنف';
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += parseFloat(exp.amount) || 0;
      });

      new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryTotals),
          datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', rtl: true, labels: { font: { family: 'Tajawal' } } }
          },
          cutout: '65%'
        }
      });
    }

    // Monthly chart
    const monthlyCtx = document.getElementById('expenseMonthlyChart');
    if (monthlyCtx) {
      const months = [];
      const data = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months.push(Utils.getMonthName(d.getMonth()));

        const monthTotal = expenses
          .filter(exp => exp.date?.startsWith(monthKey))
          .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        data.push(monthTotal);
      }

      new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'المصروفات',
            data: data,
            backgroundColor: '#ef4444',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { callback: value => Utils.formatCurrency(value), font: { family: 'Tajawal' } } },
            x: { ticks: { font: { family: 'Tajawal' } } }
          }
        }
      });
    }
  }
}

window.ReportsModule = new ReportsModule();
