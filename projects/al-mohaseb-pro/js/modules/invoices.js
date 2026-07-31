/**
 * المحاسب المالي Pro - Invoices Module
 * Complete invoice management with print, PDF, QR code
 */

class InvoicesModule {
  constructor() {
    this.currentInvoice = null;
    this.invoiceItems = [];
  }

  // ===== List Page =====
  initList() {
    App.setPageHeader('الفواتير', 'إدارة وعرض جميع الفواتير');
    this.loadInvoicesList();
    this.setupListFilters();
  }

  loadInvoicesList(filters = {}) {
    let invoices = Storage.getAll('invoices');

    // Apply filters
    if (filters.status) {
      invoices = invoices.filter(inv => inv.status === filters.status);
    }
    if (filters.search) {
      invoices = Storage.search('invoices', filters.search, ['invoiceNumber', 'customerName']);
    }
    if (filters.dateFrom) {
      invoices = invoices.filter(inv => inv.issueDate >= filters.dateFrom);
    }
    if (filters.dateTo) {
      invoices = invoices.filter(inv => inv.issueDate <= filters.dateTo);
    }

    // Sort by date desc
    invoices.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

    const container = document.getElementById('invoicesTable');
    if (!container) return;

    if (invoices.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-file-invoice"></i></div>
          <h4 class="empty-state-title">لا توجد فواتير</h4>
          <p class="empty-state-desc">ابدأ بإنشاء فاتورتك الأولى</p>
          <a href="create.html" class="btn btn-primary"><i class="fas fa-plus"></i> إنشاء فاتورة</a>
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
              <th>التاريخ</th>
              <th>الاستحقاق</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(inv => `
              <tr>
                <td><strong style="color: var(--primary-600);">${inv.invoiceNumber}</strong></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: ${Utils.stringToColor(inv.customerName)}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${Utils.getInitials(inv.customerName)}</div>
                    <span>${inv.customerName}</span>
                  </div>
                </td>
                <td>${Utils.formatDate(inv.issueDate)}</td>
                <td>${Utils.formatDate(inv.dueDate)}</td>
                <td><strong>${Utils.formatCurrency(inv.totalAmount)}</strong></td>
                <td><span class="status-badge ${inv.status}">${this.getStatusLabel(inv.status)}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="table-action-btn view" onclick="event.stopPropagation(); window.location.href='view.html?id=${inv.id}'" title="عرض">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action-btn edit" onclick="event.stopPropagation(); window.location.href='edit.html?id=${inv.id}'" title="تعديل">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="table-action-btn delete" onclick="event.stopPropagation(); InvoicesModule.deleteInvoice('${inv.id}')" title="حذف">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="pagination" id="invoicesPagination"></div>
    `;

    this.renderPagination(invoices.length);
  }

  setupListFilters() {
    const searchInput = document.getElementById('invoiceSearch');
    const statusFilter = document.getElementById('statusFilter');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');

    const applyFilters = Utils.debounce(() => {
      this.loadInvoicesList({
        search: searchInput?.value,
        status: statusFilter?.value,
        dateFrom: dateFrom?.value,
        dateTo: dateTo?.value
      });
    }, 300);

    searchInput?.addEventListener('input', applyFilters);
    statusFilter?.addEventListener('change', applyFilters);
    dateFrom?.addEventListener('change', applyFilters);
    dateTo?.addEventListener('change', applyFilters);
  }

  renderPagination(total) {
    // Simple pagination placeholder
    const container = document.getElementById('invoicesPagination');
    if (!container || total <= 10) return;

    container.innerHTML = `
      <button class="pagination-btn" disabled><i class="fas fa-chevron-right"></i></button>
      <button class="pagination-btn active">1</button>
      <button class="pagination-btn">2</button>
      <button class="pagination-btn">3</button>
      <button class="pagination-btn"><i class="fas fa-chevron-left"></i></button>
    `;
  }

  deleteInvoice(id) {
    UI.confirm('هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.', () => {
      Storage.delete('invoices', id);
      UI.success('تم حذف الفاتورة بنجاح');
      this.loadInvoicesList();
      App.updateBadges();
    });
  }

  // ===== Create Page =====
  initCreate() {
    App.setPageHeader('إنشاء فاتورة جديدة', 'أنشئ فاتورة جديدة للعميل');
    this.invoiceItems = [];
    this.setupCreateForm();
    this.loadCustomersSelect();
    this.loadProductsSelect();
    this.updateTotals();
  }

  setupCreateForm() {
    const form = document.getElementById('invoiceForm');
    if (!form) return;

    // Set default dates
    const issueDate = form.querySelector('[name="issueDate"]');
    const dueDate = form.querySelector('[name="dueDate"]');
    if (issueDate) issueDate.value = Utils.getToday();
    if (dueDate) dueDate.value = Utils.addDays(Utils.getToday(), 30);

    // Generate invoice number
    const invNumber = form.querySelector('[name="invoiceNumber"]');
    if (invNumber) {
      const settings = Storage.getSettings();
      invNumber.value = Utils.generateInvoiceNumber(settings?.invoice?.prefix || 'INV');
    }

    // Customer selection change
    const customerSelect = form.querySelector('[name="customerId"]');
    customerSelect?.addEventListener('change', (e) => {
      this.onCustomerChange(e.target.value);
    });

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveInvoice(form);
    });
  }

  loadCustomersSelect() {
    const select = document.getElementById('customerSelect');
    if (!select) return;

    const customers = Storage.getAll('customers');
    select.innerHTML = `
      <option value="">اختر العميل...</option>
      ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
    `;
  }

  loadProductsSelect() {
    const select = document.getElementById('productSelect');
    if (!select) return;

    const products = Storage.getAll('products');
    select.innerHTML = `
      <option value="">اختر منتج/خدمة...</option>
      ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-name="${p.name}" data-desc="${p.description || ''}">${p.name} - ${Utils.formatCurrency(p.price)}</option>`).join('')}
    `;

    select.addEventListener('change', (e) => {
      const option = e.target.selectedOptions[0];
      if (option.value) {
        this.addInvoiceItem({
          productId: option.value,
          name: option.dataset.name,
          description: option.dataset.desc,
          price: parseFloat(option.dataset.price) || 0,
          quantity: 1,
          discount: 0
        });
        e.target.value = '';
      }
    });
  }

  onCustomerChange(customerId) {
    const customer = Storage.getById('customers', customerId);
    if (!customer) return;

    const fields = ['customerName', 'customerEmail', 'customerPhone', 'customerAddress', 'customerTaxNumber'];
    const form = document.getElementById('invoiceForm');

    fields.forEach(field => {
      const input = form?.querySelector(`[name="${field}"]`);
      if (input) {
        const value = customer[field.replace('customer', '').toLowerCase()] || 
                     customer[field.replace('customer', '')] || '';
        input.value = value;
      }
    });
  }

  addInvoiceItem(item) {
    this.invoiceItems.push({
      ...item,
      id: Utils.generateId(),
      tax: 0,
      total: item.price * item.quantity
    });
    this.renderInvoiceItems();
    this.updateTotals();
  }

  removeInvoiceItem(itemId) {
    this.invoiceItems = this.invoiceItems.filter(item => item.id !== itemId);
    this.renderInvoiceItems();
    this.updateTotals();
  }

  updateInvoiceItem(itemId, field, value) {
    const item = this.invoiceItems.find(i => i.id === itemId);
    if (!item) return;

    item[field] = field === 'name' || field === 'description' ? value : parseFloat(value) || 0;

    // Recalculate
    const subtotal = item.price * item.quantity;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;

    const settings = Storage.getSettings();
    const taxRate = settings?.invoice?.taxRate || 15;
    item.tax = afterDiscount * (taxRate / 100);
    item.total = afterDiscount + item.tax;

    this.renderInvoiceItems();
    this.updateTotals();
  }

  renderInvoiceItems() {
    const container = document.getElementById('invoiceItemsList');
    if (!container) return;

    if (this.invoiceItems.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--gray-400);">
          <i class="fas fa-shopping-cart" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
          <p>أضف منتجات أو خدمات للفاتورة</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.invoiceItems.map((item, index) => `
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 40px; gap: 12px; align-items: center; padding: 16px; background: var(--gray-50); border-radius: var(--radius-lg); margin-bottom: 8px;">
        <div>
          <input type="text" class="form-input" value="${item.name}" onchange="InvoicesModule.updateInvoiceItem('${item.id}', 'name', this.value)" style="font-weight: 500;">
          <input type="text" class="form-input" value="${item.description || ''}" onchange="InvoicesModule.updateInvoiceItem('${item.id}', 'description', this.value)" style="margin-top: 4px; font-size: 12px; color: var(--gray-500);">
        </div>
        <input type="number" class="form-input" value="${item.quantity}" min="1" onchange="InvoicesModule.updateInvoiceItem('${item.id}', 'quantity', this.value)">
        <input type="number" class="form-input" value="${item.price}" min="0" step="0.01" onchange="InvoicesModule.updateInvoiceItem('${item.id}', 'price', this.value)">
        <input type="number" class="form-input" value="${item.discount}" min="0" max="100" onchange="InvoicesModule.updateInvoiceItem('${item.id}', 'discount', this.value)">
        <div style="text-align: center; font-size: 14px; color: var(--gray-600);">${Utils.formatCurrency(item.tax)}</div>
        <div style="text-align: center; font-weight: 600; color: var(--gray-900);">${Utils.formatCurrency(item.total)}</div>
        <button type="button" class="table-action-btn delete" onclick="InvoicesModule.removeInvoiceItem('${item.id}')" style="width: 32px; height: 32px;">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `).join('');
  }

  updateTotals() {
    const subtotal = this.invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = this.invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity * (item.discount / 100)), 0);
    const totalTax = this.invoiceItems.reduce((sum, item) => sum + item.tax, 0);
    const total = this.invoiceItems.reduce((sum, item) => sum + item.total, 0);

    const updateField = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = Utils.formatCurrency(value);
    };

    updateField('subtotalAmount', subtotal);
    updateField('discountAmount', totalDiscount);
    updateField('taxAmount', totalTax);
    updateField('totalAmount', total);
  }

  saveInvoice(form) {
    const validation = UI.validateForm(form, {
      customerId: [{ required: true, message: 'يرجى اختيار العميل' }],
      invoiceNumber: [{ required: true, message: 'رقم الفاتورة مطلوب' }],
      issueDate: [{ required: true }],
      dueDate: [{ required: true }]
    });

    if (!validation.isValid) {
      UI.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    if (this.invoiceItems.length === 0) {
      UI.error('يرجى إضافة منتج واحد على الأقل');
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const invoice = {
      invoiceNumber: data.invoiceNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone || '',
      customerAddress: data.customerAddress || '',
      customerTaxNumber: data.customerTaxNumber || '',
      items: this.invoiceItems,
      subtotal: parseFloat(document.getElementById('subtotalAmount')?.textContent?.replace(/[^0-9.]/g, '') || 0),
      discount: parseFloat(document.getElementById('discountAmount')?.textContent?.replace(/[^0-9.]/g, '') || 0),
      taxAmount: parseFloat(document.getElementById('taxAmount')?.textContent?.replace(/[^0-9.]/g, '') || 0),
      totalAmount: parseFloat(document.getElementById('totalAmount')?.textContent?.replace(/[^0-9.]/g, '') || 0),
      status: 'pending',
      paymentMethod: '',
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      paidDate: '',
      notes: data.notes || '',
      terms: data.terms || ''
    };

    Storage.create('invoices', invoice);
    UI.success('تم إنشاء الفاتورة بنجاح', `رقم الفاتورة: ${invoice.invoiceNumber}`);

    setTimeout(() => {
      window.location.href = 'list.html';
    }, 1500);
  }

  // ===== View Page =====
  initView() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
      UI.error('رقم الفاتورة غير صحيح');
      return;
    }

    this.currentInvoice = Storage.getById('invoices', id);
    if (!this.currentInvoice) {
      UI.error('الفاتورة غير موجودة');
      return;
    }

    App.setPageHeader(`فاتورة ${this.currentInvoice.invoiceNumber}`, 'عرض تفاصيل الفاتورة');
    this.renderInvoiceView();
  }

  renderInvoiceView() {
    const inv = this.currentInvoice;
    const settings = Storage.getSettings();
    const company = settings?.company || {};

    const container = document.getElementById('invoiceView');
    if (!container) return;

    const qrData = Utils.generateQRData(inv);
    const isPaid = inv.status === 'paid';
    const isOverdue = inv.status === 'overdue' || (inv.status === 'pending' && new Date(inv.dueDate) < new Date());

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;" class="no-print">
        <div>
          <div style="display: flex; gap: 8px; margin-bottom: 16px;">
            <span class="status-badge ${inv.status}">${this.getStatusLabel(inv.status)}</span>
            ${isOverdue ? '<span class="status-badge overdue">متأخرة</span>' : ''}
          </div>
          <h2 style="font-size: 24px; margin-bottom: 4px;">${inv.invoiceNumber}</h2>
          <p style="color: var(--gray-500); font-size: 14px;">تاريخ الإصدار: ${Utils.formatDate(inv.issueDate)}</p>
        </div>
        <div style="display: flex; gap: 8px;">
          ${!isPaid ? `
            <button class="btn btn-success" onclick="InvoicesModule.markAsPaid()">
              <i class="fas fa-check"></i> تسجيل كمدفوعة
            </button>
          ` : ''}
          <button class="btn btn-secondary" onclick="InvoicesModule.printInvoice()">
            <i class="fas fa-print"></i> طباعة
          </button>
          <a href="edit.html?id=${inv.id}" class="btn btn-outline-primary">
            <i class="fas fa-edit"></i> تعديل
          </a>
        </div>
      </div>

      <div id="printArea" style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--gray-200); padding: 48px; max-width: 800px; margin: 0 auto;">
        <!-- Invoice Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid var(--gray-100); padding-bottom: 24px;">
          <div>
            <h1 style="font-size: 28px; color: var(--primary-700); margin-bottom: 8px;">${company.name || 'شركتي'}</h1>
            <p style="color: var(--gray-500); font-size: 14px; line-height: 1.8;">
              ${company.address || ''}<br>
              ${company.phone ? `الهاتف: ${company.phone}<br>` : ''}
              ${company.email ? `البريد: ${company.email}<br>` : ''}
              ${company.taxNumber ? `الرقم الضريبي: ${company.taxNumber}` : ''}
            </p>
          </div>
          <div style="text-align: left;">
            <h2 style="font-size: 20px; color: var(--gray-400); letter-spacing: 2px;">فاتورة ضريبية</h2>
            <p style="font-size: 24px; font-weight: bold; color: var(--primary-600); margin-top: 8px;">${inv.invoiceNumber}</p>
          </div>
        </div>

        <!-- Bill To -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <h4 style="font-size: 12px; text-transform: uppercase; color: var(--gray-400); letter-spacing: 1px; margin-bottom: 8px;">فاتورة إلى</h4>
            <h3 style="font-size: 18px; margin-bottom: 8px;">${inv.customerName}</h3>
            <p style="color: var(--gray-500); font-size: 14px; line-height: 1.8;">
              ${inv.customerAddress || ''}<br>
              ${inv.customerPhone ? `الهاتف: ${inv.customerPhone}<br>` : ''}
              ${inv.customerEmail ? `البريد: ${inv.customerEmail}<br>` : ''}
              ${inv.customerTaxNumber ? `الرقم الضريبي: ${inv.customerTaxNumber}` : ''}
            </p>
          </div>
          <div style="text-align: left;">
            <div style="margin-bottom: 12px;">
              <span style="color: var(--gray-400); font-size: 12px;">تاريخ الإصدار</span>
              <p style="font-weight: 600;">${Utils.formatDate(inv.issueDate)}</p>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="color: var(--gray-400); font-size: 12px;">تاريخ الاستحقاق</span>
              <p style="font-weight: 600;">${Utils.formatDate(inv.dueDate)}</p>
            </div>
            ${inv.paidDate ? `
              <div>
                <span style="color: var(--gray-400); font-size: 12px;">تاريخ الدفع</span>
                <p style="font-weight: 600; color: var(--success-600);">${Utils.formatDate(inv.paidDate)}</p>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background: var(--gray-50); border-bottom: 2px solid var(--gray-200);">
              <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: var(--gray-500); text-transform: uppercase;">الوصف</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: var(--gray-500); text-transform: uppercase;">الكمية</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: var(--gray-500); text-transform: uppercase;">السعر</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: var(--gray-500); text-transform: uppercase;">الخصم</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: var(--gray-500); text-transform: uppercase;">الضريبة</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: var(--gray-500); text-transform: uppercase;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map(item => `
              <tr style="border-bottom: 1px solid var(--gray-100);">
                <td style="padding: 16px;">
                  <strong style="display: block; margin-bottom: 4px;">${item.name}</strong>
                  <span style="color: var(--gray-500); font-size: 13px;">${item.description || ''}</span>
                </td>
                <td style="padding: 16px; text-align: center;">${item.quantity}</td>
                <td style="padding: 16px; text-align: center;">${Utils.formatCurrency(item.price)}</td>
                <td style="padding: 16px; text-align: center;">${item.discount > 0 ? item.discount + '%' : '-'}</td>
                <td style="padding: 16px; text-align: center;">${Utils.formatCurrency(item.tax)}</td>
                <td style="padding: 16px; text-align: left; font-weight: 600;">${Utils.formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-100);">
              <span style="color: var(--gray-500);">المجموع الفرعي</span>
              <span style="font-weight: 500;">${Utils.formatCurrency(inv.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-100);">
              <span style="color: var(--gray-500);">الخصم</span>
              <span style="font-weight: 500;">${Utils.formatCurrency(inv.discount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-100);">
              <span style="color: var(--gray-500);">الضريبة (${settings?.invoice?.taxRate || 15}%)</span>
              <span style="font-weight: 500;">${Utils.formatCurrency(inv.taxAmount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 16px 0; margin-top: 8px; border-top: 2px solid var(--gray-200);">
              <span style="font-size: 18px; font-weight: bold;">الإجمالي</span>
              <span style="font-size: 18px; font-weight: bold; color: var(--primary-700);">${Utils.formatCurrency(inv.totalAmount)}</span>
            </div>
          </div>
        </div>

        <!-- QR Code & Notes -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid var(--gray-100); padding-top: 24px;">
          <div style="flex: 1;">
            ${inv.notes ? `
              <div style="margin-bottom: 16px;">
                <h4 style="font-size: 12px; color: var(--gray-400); margin-bottom: 8px;">ملاحظات</h4>
                <p style="color: var(--gray-600); font-size: 14px;">${inv.notes}</p>
              </div>
            ` : ''}
            ${inv.terms ? `
              <div>
                <h4 style="font-size: 12px; color: var(--gray-400); margin-bottom: 8px;">الشروط والأحكام</h4>
                <p style="color: var(--gray-600); font-size: 14px;">${inv.terms}</p>
              </div>
            ` : ''}
          </div>
          <div style="text-align: center; margin-right: 24px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}" alt="QR Code" style="width: 120px; height: 120px;">
            <p style="font-size: 11px; color: var(--gray-400); margin-top: 8px;">امسح للتحقق</p>
          </div>
        </div>

        ${isPaid ? `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); border: 4px solid var(--success-500); color: var(--success-500); padding: 16px 48px; font-size: 32px; font-weight: bold; border-radius: 8px; opacity: 0.3; pointer-events: none;">
            مدفوعة
          </div>
        ` : ''}
      </div>
    `;
  }

  markAsPaid() {
    if (!this.currentInvoice) return;

    const paymentMethod = prompt('طريقة الدفع:
1. تحويل بنكي
2. نقدي
3. بطاقة ائتمان
4. أخرى');
    if (!paymentMethod) return;

    const methods = {
      '1': 'bank_transfer',
      '2': 'cash',
      '3': 'credit_card',
      '4': 'other'
    };

    Storage.update('invoices', this.currentInvoice.id, {
      status: 'paid',
      paymentMethod: methods[paymentMethod] || 'other',
      paidDate: Utils.getToday()
    });

    UI.success('تم تسجيل الفاتورة كمدفوعة');
    this.currentInvoice = Storage.getById('invoices', this.currentInvoice.id);
    this.renderInvoiceView();
    App.updateBadges();
  }

  printInvoice() {
    Utils.printElement('printArea');
  }

  // ===== Edit Page =====
  initEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
      UI.error('رقم الفاتورة غير صحيح');
      return;
    }

    this.currentInvoice = Storage.getById('invoices', id);
    if (!this.currentInvoice) {
      UI.error('الفاتورة غير موجودة');
      return;
    }

    App.setPageHeader(`تعديل فاتورة ${this.currentInvoice.invoiceNumber}`);
    this.invoiceItems = [...(this.currentInvoice.items || [])];

    this.loadCustomersSelect();
    this.loadProductsSelect();
    this.populateEditForm();
    this.renderInvoiceItems();
    this.updateTotals();
    this.setupCreateForm();
  }

  populateEditForm() {
    const inv = this.currentInvoice;
    const form = document.getElementById('invoiceForm');
    if (!form) return;

    const fields = ['invoiceNumber', 'customerId', 'customerName', 'customerEmail', 
                    'customerPhone', 'customerAddress', 'customerTaxNumber', 
                    'issueDate', 'dueDate', 'notes', 'terms'];

    fields.forEach(field => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input && inv[field] !== undefined) {
        input.value = inv[field];
      }
    });
  }

  // ===== Helpers =====
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

window.InvoicesModule = new InvoicesModule();
