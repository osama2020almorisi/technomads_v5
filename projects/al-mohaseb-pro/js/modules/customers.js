/**
 * المحاسب المالي Pro - Customers Module
 */

class CustomersModule {
  initList() {
    App.setPageHeader('العملاء', 'إدارة سجل العملاء');
    this.loadCustomersList();
    this.setupListFilters();
  }

  loadCustomersList(filters = {}) {
    let customers = Storage.getAll('customers');

    if (filters.search) {
      customers = Storage.search('customers', filters.search, ['name', 'email', 'phone', 'taxNumber']);
    }
    if (filters.status) {
      customers = customers.filter(c => c.status === filters.status);
    }

    customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const container = document.getElementById('customersTable');
    if (!container) return;

    if (customers.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-users"></i></div>
          <h4 class="empty-state-title">لا يوجد عملاء</h4>
          <p class="empty-state-desc">أضف عملائك لبدء العمل</p>
          <a href="create.html" class="btn btn-primary"><i class="fas fa-plus"></i> إضافة عميل</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>العميل</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>الرصيد</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(c => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: ${Utils.stringToColor(c.name)}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${Utils.getInitials(c.name)}</div>
                    <div>
                      <div style="font-weight: 500; color: var(--gray-900);">${c.name}</div>
                      ${c.taxNumber ? `<div style="font-size: 12px; color: var(--gray-400);">الرقم الضريبي: ${c.taxNumber}</div>` : ''}
                    </div>
                  </div>
                </td>
                <td>${c.email || '-'}</td>
                <td>${c.phone ? Utils.formatPhone(c.phone) : '-'}</td>
                <td><strong style="color: ${c.balance > 0 ? 'var(--danger-600)' : 'var(--gray-900)'};">${Utils.formatCurrency(c.balance)}</strong></td>
                <td><span class="badge ${c.status === 'active' ? 'badge-success' : 'badge-gray'}">${c.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="table-action-btn edit" onclick="window.location.href='edit.html?id=${c.id}'" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="table-action-btn delete" onclick="CustomersModule.deleteCustomer('${c.id}')" title="حذف"><i class="fas fa-trash-alt"></i></button>
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
    const searchInput = document.getElementById('customerSearch');
    searchInput?.addEventListener('input', Utils.debounce(() => {
      this.loadCustomersList({ search: searchInput.value });
    }, 300));
  }

  deleteCustomer(id) {
    UI.confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع بياناته.', () => {
      Storage.delete('customers', id);
      UI.success('تم حذف العميل بنجاح');
      this.loadCustomersList();
    });
  }

  initCreate() {
    App.setPageHeader('إضافة عميل جديد');
    this.setupForm();
  }

  initEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) { UI.error('معرف العميل غير صحيح'); return; }

    const customer = Storage.getById('customers', id);
    if (!customer) { UI.error('العميل غير موجود'); return; }

    App.setPageHeader(`تعديل ${customer.name}`);
    this.setupForm(customer);
  }

  setupForm(customer = null) {
    const form = document.getElementById('customerForm');
    if (!form) return;

    if (customer) {
      Object.keys(customer).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = customer[key] || '';
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const validation = UI.validateForm(form, {
        name: [{ required: true, message: 'اسم العميل مطلوب' }],
        email: [{ email: true }],
        phone: [{ phone: true }]
      });

      if (!validation.isValid) {
        UI.error('يرجى تصحيح الأخطاء');
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.balance = parseFloat(data.balance) || 0;
      data.status = data.status || 'active';

      if (customer) {
        Storage.update('customers', customer.id, data);
        UI.success('تم تحديث بيانات العميل');
      } else {
        Storage.create('customers', data);
        UI.success('تم إضافة العميل بنجاح');
      }

      setTimeout(() => window.location.href = 'list.html', 1200);
    });
  }
}

window.CustomersModule = new CustomersModule();
