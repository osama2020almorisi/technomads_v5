/**
 * المحاسب المالي Pro - Products Module
 */

class ProductsModule {
  initList() {
    App.setPageHeader('المنتجات والخدمات', 'إدارة كتالوج المنتجات');
    this.loadProductsList();
    this.setupListFilters();
  }

  loadProductsList(filters = {}) {
    let products = Storage.getAll('products');

    if (filters.search) {
      products = Storage.search('products', filters.search, ['name', 'description', 'category']);
    }
    if (filters.type) {
      products = products.filter(p => p.type === filters.type);
    }

    const container = document.getElementById('productsTable');
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-boxes"></i></div>
          <h4 class="empty-state-title">لا توجد منتجات</h4>
          <p class="empty-state-desc">أضف منتجاتك وخدماتك</p>
          <a href="create.html" class="btn btn-primary"><i class="fas fa-plus"></i> إضافة منتج</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>المنتج/الخدمة</th>
              <th>النوع</th>
              <th>الفئة</th>
              <th>السعر</th>
              <th>التكلفة</th>
              <th>الربح</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => {
              const profit = (p.price || 0) - (p.cost || 0);
              const profitMargin = p.price > 0 ? ((profit / p.price) * 100).toFixed(1) : 0;
              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 40px; height: 40px; border-radius: var(--radius-lg); background: ${p.type === 'service' ? 'var(--primary-50)' : 'var(--success-50)'}; color: ${p.type === 'service' ? 'var(--primary-600)' : 'var(--success-600)'}; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                        <i class="fas ${p.type === 'service' ? 'fa-cogs' : 'fa-box'}"></i>
                      </div>
                      <div>
                        <div style="font-weight: 500;">${p.name}</div>
                        <div style="font-size: 12px; color: var(--gray-400);">${Utils.truncate(p.description, 40)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge ${p.type === 'service' ? 'badge-primary' : 'badge-success'}">${p.type === 'service' ? 'خدمة' : 'منتج'}</span></td>
                  <td>${p.category || '-'}</td>
                  <td><strong>${Utils.formatCurrency(p.price)}</strong></td>
                  <td>${Utils.formatCurrency(p.cost || 0)}</td>
                  <td>
                    <div style="color: ${profit >= 0 ? 'var(--success-600)' : 'var(--danger-600)'}; font-weight: 500;">
                      ${Utils.formatCurrency(profit)}
                      <span style="font-size: 11px; color: var(--gray-400);">(${profitMargin}%)</span>
                    </div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="table-action-btn edit" onclick="window.location.href='edit.html?id=${p.id}'"><i class="fas fa-edit"></i></button>
                      <button class="table-action-btn delete" onclick="ProductsModule.deleteProduct('${p.id}')"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  setupListFilters() {
    const searchInput = document.getElementById('productSearch');
    const typeFilter = document.getElementById('typeFilter');

    const apply = Utils.debounce(() => {
      this.loadProductsList({
        search: searchInput?.value,
        type: typeFilter?.value
      });
    }, 300);

    searchInput?.addEventListener('input', apply);
    typeFilter?.addEventListener('change', apply);
  }

  deleteProduct(id) {
    UI.confirm('هل أنت متأكد من حذف هذا المنتج؟', () => {
      Storage.delete('products', id);
      UI.success('تم الحذف بنجاح');
      this.loadProductsList();
    });
  }

  initCreate() {
    App.setPageHeader('إضافة منتج/خدمة جديدة');
    this.setupForm();
  }

  initEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) { UI.error('معرف غير صحيح'); return; }

    const product = Storage.getById('products', id);
    if (!product) { UI.error('المنتج غير موجود'); return; }

    App.setPageHeader(`تعديل ${product.name}`);
    this.setupForm(product);
  }

  setupForm(product = null) {
    const form = document.getElementById('productForm');
    if (!form) return;

    if (product) {
      Object.keys(product).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = product[key] || '';
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const validation = UI.validateForm(form, {
        name: [{ required: true }],
        price: [{ required: true, min: 0 }]
      });

      if (!validation.isValid) { UI.error('يرجى تصحيح الأخطاء'); return; }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.price = parseFloat(data.price) || 0;
      data.cost = parseFloat(data.cost) || 0;
      data.stock = data.stock ? parseInt(data.stock) : null;

      if (product) {
        Storage.update('products', product.id, data);
        UI.success('تم التحديث بنجاح');
      } else {
        Storage.create('products', data);
        UI.success('تم الإضافة بنجاح');
      }

      setTimeout(() => window.location.href = 'list.html', 1200);
    });
  }
}

window.ProductsModule = new ProductsModule();
