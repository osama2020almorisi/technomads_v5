/**
 * المحاسب المالي Pro - Settings Module
 */

class SettingsModule {
  initCompany() {
    App.setPageHeader('إعدادات الشركة', 'بيانات الشركة والشعار والضرائب');
    this.loadCompanyForm();
  }

  initUsers() {
    App.setPageHeader('إدارة المستخدمين', 'المستخدمين والصلاحيات');
    this.loadUsersList();
  }

  initBackup() {
    App.setPageHeader('النسخ الاحتياطي', 'نسخ واستعادة البيانات');
    this.loadBackupPage();
  }

  initProfile() {
    App.setPageHeader('الملف الشخصي', 'بيانات حسابك الشخصية');
    this.loadProfileForm();
  }

  loadCompanyForm() {
    const settings = Storage.getSettings();
    const company = settings?.company || {};
    const invoice = settings?.invoice || {};

    const container = document.getElementById('settingsForm');
    if (!container) return;

    container.innerHTML = `
      <form id="companyForm">
        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header">
            <h3 class="card-header-title">بيانات الشركة</h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">اسم الشركة <span class="required">*</span></label>
                <input type="text" class="form-input" name="company.name" value="${company.name || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">الرقم الضريبي</label>
                <input type="text" class="form-input" name="company.taxNumber" value="${company.taxNumber || ''}" placeholder="300xxxxxxxxxxxxx">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">العنوان</label>
              <input type="text" class="form-input" name="company.address" value="${company.address || ''}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">الهاتف</label>
                <input type="tel" class="form-input" name="company.phone" value="${company.phone || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" class="form-input" name="company.email" value="${company.email || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">الشعار</label>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div id="logoPreview" style="width: 80px; height: 80px; border-radius: var(--radius-lg); border: 2px dashed var(--gray-300); display: flex; align-items: center; justify-content: center; overflow: hidden; background: var(--gray-50);">
                  ${company.logo ? `<img src="${company.logo}" style="width: 100%; height: 100%; object-fit: contain;">` : '<i class="fas fa-image" style="color: var(--gray-400); font-size: 24px;"></i>'}
                </div>
                <div>
                  <input type="file" id="logoInput" accept="image/*" style="display: none;" onchange="SettingsModule.handleLogoUpload(this)">
                  <button type="button" class="btn btn-secondary" onclick="document.getElementById('logoInput').click()">
                    <i class="fas fa-upload"></i> اختيار صورة
                  </button>
                  ${company.logo ? `<button type="button" class="btn btn-ghost" onclick="SettingsModule.removeLogo()" style="margin-top: 8px;"><i class="fas fa-trash"></i> حذف الشعار</button>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header">
            <h3 class="card-header-title">إعدادات الفواتير</h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">بادئة رقم الفاتورة</label>
                <input type="text" class="form-input" name="invoice.prefix" value="${invoice.prefix || 'INV'}">
              </div>
              <div class="form-group">
                <label class="form-label">نسبة الضريبة (%)</label>
                <input type="number" class="form-input" name="invoice.taxRate" value="${invoice.taxRate || 15}" min="0" max="100" step="0.01">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">اسم الضريبة</label>
              <input type="text" class="form-input" name="invoice.taxName" value="${invoice.taxName || 'ضريبة القيمة المضافة'}">
            </div>
            <div class="form-group">
              <label class="form-label">الشروط والأحكام الافتراضية</label>
              <textarea class="form-textarea" name="invoice.terms" rows="3">${invoice.terms || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">ملاحظات افتراضية</label>
              <textarea class="form-textarea" name="invoice.notes" rows="3">${invoice.notes || ''}</textarea>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header">
            <h3 class="card-header-title">الإعدادات العامة</h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">العملة</label>
                <select class="form-select" name="company.currency">
                  <option value="SAR" ${company.currency === 'SAR' ? 'selected' : ''}>ريال سعودي (SAR)</option>
                  <option value="USD" ${company.currency === 'USD' ? 'selected' : ''}>دولار أمريكي (USD)</option>
                  <option value="AED" ${company.currency === 'AED' ? 'selected' : ''}>درهم إماراتي (AED)</option>
                  <option value="KWD" ${company.currency === 'KWD' ? 'selected' : ''}>دينار كويتي (KWD)</option>
                  <option value="QAR" ${company.currency === 'QAR' ? 'selected' : ''}>ريال قطري (QAR)</option>
                  <option value="BHD" ${company.currency === 'BHD' ? 'selected' : ''}>دينار بحريني (BHD)</option>
                  <option value="OMR" ${company.currency === 'OMR' ? 'selected' : ''}>ريال عماني (OMR)</option>
                  <option value="EGP" ${company.currency === 'EGP' ? 'selected' : ''}>جنيه مصري (EGP)</option>
                  <option value="JOD" ${company.currency === 'JOD' ? 'selected' : ''}>دينار أردني (JOD)</option>
                  <option value="YER" ${company.currency === 'YER' ? 'selected' : ''}>ريال يمني (YER)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">رمز العملة</label>
                <input type="text" class="form-input" name="company.currencySymbol" value="${company.currencySymbol || 'ر.س'}">
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button type="submit" class="btn btn-primary btn-lg">
            <i class="fas fa-save"></i> حفظ الإعدادات
          </button>
          <button type="button" class="btn btn-secondary btn-lg" onclick="window.location.reload()">
            <i class="fas fa-undo"></i> إلغاء
          </button>
        </div>
      </form>
    `;

    // Setup form submission
    const form = document.getElementById('companyForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCompanySettings(form);
    });
  }

  async handleLogoUpload(input) {
    const file = input.files[0];
    if (!file) return;

    try {
      const dataUrl = await Utils.readFileAsDataURL(file);
      Storage.updateSettings('company.logo', dataUrl);

      const preview = document.getElementById('logoPreview');
      if (preview) {
        preview.innerHTML = `<img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
      }
      UI.success('تم رفع الشعار بنجاح');
    } catch (err) {
      UI.error('فشل في رفع الشعار');
    }
  }

  removeLogo() {
    Storage.updateSettings('company.logo', '');
    const preview = document.getElementById('logoPreview');
    if (preview) {
      preview.innerHTML = '<i class="fas fa-image" style="color: var(--gray-400); font-size: 24px;"></i>';
    }
    UI.success('تم حذف الشعار');
  }

  saveCompanySettings(form) {
    const formData = new FormData(form);

    formData.forEach((value, key) => {
      Storage.updateSettings(key, value);
    });

    UI.success('تم حفظ الإعدادات بنجاح');
  }

  loadUsersList() {
    const users = Storage.getAll('users');
    const container = document.getElementById('usersTable');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h3>المستخدمون (${users.length})</h3>
        <button class="btn btn-primary" onclick="SettingsModule.showAddUserModal()">
          <i class="fas fa-plus"></i> إضافة مستخدم
        </button>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>البريد</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: ${Utils.stringToColor(u.name)}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${Utils.getInitials(u.name)}</div>
                    <span style="font-weight: 500;">${u.name}</span>
                  </div>
                </td>
                <td>${u.email || '-'}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-gray'}">${u.role === 'admin' ? 'مدير' : 'مستخدم'}</span></td>
                <td><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-gray'}">${u.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="table-action-btn edit" onclick="SettingsModule.editUser('${u.id}')"><i class="fas fa-edit"></i></button>
                    <button class="table-action-btn delete" onclick="SettingsModule.deleteUser('${u.id}')"><i class="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  showAddUserModal() {
    UI.modal.show({
      title: 'إضافة مستخدم جديد',
      body: `
        <form id="addUserForm">
          <div class="form-group">
            <label class="form-label">الاسم <span class="required">*</span></label>
            <input type="text" class="form-input" name="name" required>
          </div>
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني</label>
            <input type="email" class="form-input" name="email">
          </div>
          <div class="form-group">
            <label class="form-label">الهاتف</label>
            <input type="tel" class="form-input" name="phone">
          </div>
          <div class="form-group">
            <label class="form-label">الدور</label>
            <select class="form-select" name="role">
              <option value="user">مستخدم</option>
              <option value="admin">مدير</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.status = 'active';
        Storage.create('users', data);
        UI.success('تم إضافة المستخدم');
        this.loadUsersList();
      }
    });
  }

  deleteUser(id) {
    UI.confirm('هل أنت متأكد من حذف هذا المستخدم؟', () => {
      Storage.delete('users', id);
      UI.success('تم الحذف بنجاح');
      this.loadUsersList();
    });
  }

  loadBackupPage() {
    const info = Storage.getStorageInfo();
    const container = document.getElementById('backupContent');
    if (!container) return;

    container.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-header-title">نسخ احتياطي</h3>
          </div>
          <div class="card-body">
            <p style="color: var(--gray-600); margin-bottom: 16px;">قم بتنزيل نسخة احتياطية من جميع بياناتك.</p>
            <div style="background: var(--gray-50); padding: 16px; border-radius: var(--radius-lg); margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 14px; color: var(--gray-600);">المساحة المستخدمة</span>
                <span style="font-weight: 600;">${info.formatted}</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                <div style="width: ${info.percentage}%; height: 100%; background: var(--primary-500); border-radius: 4px; transition: width 0.3s;"></div>
              </div>
            </div>
            <button class="btn btn-primary" onclick="SettingsModule.downloadBackup()">
              <i class="fas fa-download"></i> تحميل نسخة احتياطية
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-header-title">استعادة البيانات</h3>
          </div>
          <div class="card-body">
            <p style="color: var(--gray-600); margin-bottom: 16px;">استعد بياناتك من نسخة احتياطية سابقة.</p>
            <div style="border: 2px dashed var(--gray-300); border-radius: var(--radius-xl); padding: 32px; text-align: center; margin-bottom: 16px;">
              <i class="fas fa-cloud-upload-alt" style="font-size: 32px; color: var(--gray-400); margin-bottom: 12px; display: block;"></i>
              <p style="color: var(--gray-500); margin-bottom: 12px;">اسحب الملف هنا أو انقر للاختيار</p>
              <input type="file" id="restoreFile" accept=".json" style="display: none;" onchange="SettingsModule.handleRestore(this)">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('restoreFile').click()">
                <i class="fas fa-folder-open"></i> اختيار ملف
              </button>
            </div>
            <div style="background: var(--danger-50); border: 1px solid var(--danger-200); border-radius: var(--radius-lg); padding: 12px 16px;">
              <p style="color: var(--danger-700); font-size: 14px; margin: 0;">
                <i class="fas fa-exclamation-triangle"></i>
                تحذير: ستستبدل البيانات الحالية بالبيانات الموجودة في الملف.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h3 class="card-header-title">إعادة تعيين البيانات</h3>
        </div>
        <div class="card-body">
          <p style="color: var(--gray-600); margin-bottom: 16px;">احذف جميع البيانات وابدأ من جديد. لا يمكن التراجع عن هذا الإجراء.</p>
          <button class="btn btn-danger" onclick="SettingsModule.resetAllData()">
            <i class="fas fa-trash-alt"></i> حذف جميع البيانات
          </button>
        </div>
      </div>
    `;
  }

  downloadBackup() {
    UI.loading.show('جاري إنشاء النسخة الاحتياطية...');
    setTimeout(() => {
      Storage.downloadBackup();
      UI.loading.hide();
      UI.success('تم تحميل النسخة الاحتياطية');
    }, 1000);
  }

  async handleRestore(input) {
    const file = input.files[0];
    if (!file) return;

    UI.confirm('هل أنت متأكد؟ ستستبدل جميع البيانات الحالية.', async () => {
      try {
        UI.loading.show('جاري استعادة البيانات...');
        const content = await Utils.readFileAsText(file);
        const success = Storage.restoreBackup(content);
        UI.loading.hide();

        if (success) {
          UI.success('تم استعادة البيانات بنجاح');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          UI.error('فشل في استعادة البيانات. الملف غير صالح.');
        }
      } catch (err) {
        UI.loading.hide();
        UI.error('فشل في قراءة الملف');
      }
    });
  }

  resetAllData() {
    UI.confirm('هل أنت متأكد تماماً؟ سيتم حذف جميع البيانات بشكل نهائي!', () => {
      Storage.clearAll();
      UI.success('تم حذف جميع البيانات');
      setTimeout(() => window.location.href = '../../index.html', 1500);
    });
  }

  loadProfileForm() {
    const user = Storage.getCurrentUser();
    if (!user) return;

    const container = document.getElementById('profileForm');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="max-width: 600px;">
        <div class="card-header">
          <h3 class="card-header-title">البيانات الشخصية</h3>
        </div>
        <div class="card-body">
          <form id="userProfileForm">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: ${Utils.stringToColor(user.name)}; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; margin-bottom: 12px;">
                ${Utils.getInitials(user.name)}
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">الاسم</label>
              <input type="text" class="form-input" name="name" value="${user.name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input type="email" class="form-input" name="email" value="${user.email || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">الهاتف</label>
              <input type="tel" class="form-input" name="phone" value="${user.phone || ''}">
            </div>
            <div style="border-top: 1px solid var(--gray-200); margin: 24px 0; padding-top: 24px;">
              <h4 style="margin-bottom: 16px;">تغيير كلمة المرور</h4>
              <div class="form-group">
                <label class="form-label">كلمة المرور الحالية</label>
                <input type="password" class="form-input" name="currentPassword">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">كلمة المرور الجديدة</label>
                  <input type="password" class="form-input" name="newPassword">
                </div>
                <div class="form-group">
                  <label class="form-label">تأكيد كلمة المرور</label>
                  <input type="password" class="form-input" name="confirmPassword">
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg">
              <i class="fas fa-save"></i> حفظ التغييرات
            </button>
          </form>
        </div>
      </div>
    `;

    const form = document.getElementById('userProfileForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Update user
      const currentUser = Storage.getCurrentUser();
      if (currentUser) {
        const updated = { ...currentUser, ...data };
        delete updated.currentPassword;
        delete updated.newPassword;
        delete updated.confirmPassword;

        Storage.setCurrentUser(updated);

        // Update in users list
        const users = Storage.getAll('users');
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx] = updated;
          Storage.set('users', users);
        }

        UI.success('تم تحديث الملف الشخصي');
        App.updateUserInfo();
      }
    });
  }
}

window.SettingsModule = new SettingsModule();
