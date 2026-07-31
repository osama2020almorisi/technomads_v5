/**
 * المحاسب المالي Pro - Expenses Module
 */

class ExpensesModule {
  initList() {
    App.setPageHeader('المصروفات', 'تتبع وإدارة المصروفات');
    this.loadExpensesList();
    this.setupListFilters();
  }

  loadExpensesList(filters = {}) {
    let expenses = Storage.getAll('expenses');

    if (filters.search) {
      expenses = Storage.search('expenses', filters.search, ['description', 'category', 'receiptNumber']);
    }
    if (filters.category) {
      expenses = expenses.filter(e => e.category === filters.category);
    }
    if (filters.dateFrom) {
      expenses = expenses.filter(e => e.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      expenses = expenses.filter(e => e.date <= filters.dateTo);
    }

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('expensesTable');
    if (!container) return;

    if (expenses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-wallet"></i></div>
          <h4 class="empty-state-title">لا توجد مصروفات</h4>
          <p class="empty-state-desc">سجل مصروفاتك للتحكم في التكاليف</p>
          <a href="create.html" class="btn btn-primary"><i class="fas fa-plus"></i> تسجيل مصروف</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>الوصف</th>
              <th>الفئة</th>
              <th>المبلغ</th>
              <th>التاريخ</th>
              <th>طريقة الدفع</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr>
                <td>
                  <div style="font-weight: 500;">${e.description}</div>
                  ${e.notes ? `<div style="font-size: 12px; color: var(--gray-400);">${Utils.truncate(e.notes, 50)}</div>` : ''}
                </td>
                <td><span class="badge badge-gray">${e.category}</span></td>
                <td><strong style="color: var(--danger-600);">${Utils.formatCurrency(e.amount)}</strong></td>
                <td>${Utils.formatDate(e.date)}</td>
                <td>${this.getPaymentMethodLabel(e.paymentMethod)}</td>
                <td>
                  <div class="table-actions">
                    <button class="table-action-btn edit" onclick="window.location.href='edit.html?id=${e.id}'"><i class="fas fa-edit"></i></button>
                    <button class="table-action-btn delete" onclick="ExpensesModule.deleteExpense('${e.id}')"><i class="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  setupListFilters() {
    const searchInput = document.getElementById('expenseSearch');
    const categoryFilter = document.getElementById('categoryFilter');

    const apply = Utils.debounce(() => {
      this.loadExpensesList({
        search: searchInput?.value,
        category: categoryFilter?.value
      });
    }, 300);

    searchInput?.addEventListener('input', apply);
    categoryFilter?.addEventListener('change', apply);
  }

  deleteExpense(id) {
    UI.confirm('هل أنت متأكد من حذف هذا المصروف؟', () => {
      Storage.delete('expenses', id);
      UI.success('تم الحذف بنجاح');
      this.loadExpensesList();
    });
  }

  initCreate() {
    App.setPageHeader('تسجيل مصروف جديد');
    this.setupForm();
  }

  initEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) { UI.error('معرف غير صحيح'); return; }

    const expense = Storage.getById('expenses', id);
    if (!expense) { UI.error('المصروف غير موجود'); return; }

    App.setPageHeader(`تعديل مصروف`);
    this.setupForm(expense);
  }

  setupForm(expense = null) {
    const form = document.getElementById('expenseForm');
    if (!form) return;

    if (expense) {
      Object.keys(expense).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = expense[key] || '';
      });
    } else {
      const dateInput = form.querySelector('[name="date"]');
      if (dateInput) dateInput.value = Utils.getToday();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const validation = UI.validateForm(form, {
        description: [{ required: true }],
        amount: [{ required: true, min: 0 }],
        date: [{ required: true }]
      });

      if (!validation.isValid) { UI.error('يرجى تصحيح الأخطاء'); return; }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.amount = parseFloat(data.amount) || 0;

      if (expense) {
        Storage.update('expenses', expense.id, data);
        UI.success('تم التحديث بنجاح');
      } else {
        Storage.create('expenses', data);
        UI.success('تم التسجيل بنجاح');
      }

      setTimeout(() => window.location.href = 'list.html', 1200);
    });
  }

  getPaymentMethodLabel(method) {
    const labels = {
      cash: 'نقدي',
      bank_transfer: 'تحويل بنكي',
      credit_card: 'بطاقة ائتمان',
      check: 'شيك',
      other: 'أخرى'
    };
    return labels[method] || method;
  }
}

window.ExpensesModule = new ExpensesModule();
