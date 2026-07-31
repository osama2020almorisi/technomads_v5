/**
 * المحاسب المالي Pro - App Core
 * Main application controller
 */

class AppCore {
  constructor() {
    this.currentPage = '';
    this.modules = new Map();
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bootstrap());
    } else {
      this.bootstrap();
    }
  }

  async bootstrap() {
    if (window.Storage) await Storage.init();
    this.checkAuth();
    
    // Only render layout and load modules for authenticated pages
    if (!this.isAuthPage()) {
      this.renderLayout();
      this.initUI();
      this.loadPageModule();
    }
  }

  isAuthPage() {
    const path = window.location.pathname;
    return path.includes('/auth/') || path.endsWith('index.html') || path === '/' || path === '';
  }

  checkAuth() {
    const isAuthPage = this.isAuthPage();

    if (!Storage.isAuthenticated() && !isAuthPage) {
      window.location.href = '../index.html';
      return false;
    }
    if (Storage.isAuthenticated() && isAuthPage) {
      window.location.href = '../pages/dashboard.html';
      return false;
    }
    return true;
  }

  renderLayout() {
    if (this.isAuthPage()) return;

    const layoutHTML = this.getLayoutHTML();
    document.body.insertAdjacentHTML('afterbegin', layoutHTML);
    this.updateUserInfo();
    this.markActiveNav();
  }

  getPathPrefix() {
    const path = window.location.pathname;
    // If we're in a subfolder, go up accordingly
    if (path.includes('/pages/')) {
      const depth = (path.match(/\//g) || []).length - 2; // pages/sub/file.html = 2 levels
      return '../'.repeat(Math.max(1, depth));
    }
    return '';
  }

  getLayoutHTML() {
    const user = Storage.getCurrentUser();
    const settings = Storage.getSettings();
    const company = settings?.company || {};
    const prefix = this.getPathPrefix();

    return `
      <aside class="app-sidebar" id="appSidebar">
        <div class="sidebar-brand">
          <div class="brand-logo"><i class="fas fa-calculator"></i></div>
          <span class="brand-text">المحاسب المالي</span>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">القائمة الرئيسية</div>
            <a href="${prefix}pages/dashboard.html" class="nav-item" data-page="dashboard"><i class="fas fa-chart-pie"></i><span class="nav-label">لوحة التحكم</span></a>
            <a href="${prefix}pages/invoices/list.html" class="nav-item" data-page="invoices"><i class="fas fa-file-invoice-dollar"></i><span class="nav-label">الفواتير</span><span class="nav-badge" id="invoiceBadge">0</span></a>
            <a href="${prefix}pages/customers/list.html" class="nav-item" data-page="customers"><i class="fas fa-users"></i><span class="nav-label">العملاء</span></a>
            <a href="${prefix}pages/products/list.html" class="nav-item" data-page="products"><i class="fas fa-boxes"></i><span class="nav-label">المنتجات</span></a>
            <a href="${prefix}pages/expenses/list.html" class="nav-item" data-page="expenses"><i class="fas fa-wallet"></i><span class="nav-label">المصروفات</span></a>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">التقارير</div>
            <a href="${prefix}pages/reports/financial.html" class="nav-item" data-page="reports-financial"><i class="fas fa-chart-line"></i><span class="nav-label">الأرباح والخسائر</span></a>
            <a href="${prefix}pages/reports/sales.html" class="nav-item" data-page="reports-sales"><i class="fas fa-chart-bar"></i><span class="nav-label">المبيعات</span></a>
            <a href="${prefix}pages/reports/expenses.html" class="nav-item" data-page="reports-expenses"><i class="fas fa-chart-area"></i><span class="nav-label">المصروفات</span></a>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">الإعدادات</div>
            <a href="${prefix}pages/settings/company.html" class="nav-item" data-page="settings-company"><i class="fas fa-building"></i><span class="nav-label">الشركة</span></a>
            <a href="${prefix}pages/settings/users.html" class="nav-item" data-page="settings-users"><i class="fas fa-user-shield"></i><span class="nav-label">المستخدمون</span></a>
            <a href="${prefix}pages/settings/backup.html" class="nav-item" data-page="settings-backup"><i class="fas fa-database"></i><span class="nav-label">النسخ الاحتياطي</span></a>
          </div>
        </nav>
        <div class="sidebar-footer">
          <button class="sidebar-toggle-btn" onclick="App.toggleSidebar()">
            <i class="fas fa-chevron-right"></i><span>طي القائمة</span>
          </button>
        </div>
      </aside>
      <div class="sidebar-overlay" id="sidebarOverlay" onclick="App.toggleSidebar()"></div>

      <header class="app-header" id="appHeader">
        <div class="header-left">
          <button class="header-action-btn d-md-none" onclick="App.toggleSidebar()" aria-label="القائمة">
            <i class="fas fa-bars"></i>
          </button>
          <div id="pageHeaderContent" style="display: flex; flex-direction: column; gap: 2px;"></div>
        </div>
        <div class="header-right">
          <button class="header-action-btn" id="themeToggle" onclick="App.toggleTheme()" aria-label="تبديل الوضع">
            <i class="fas fa-moon" id="themeIcon"></i>
          </button>
          <button class="header-action-btn" onclick="App.showNotifications()" aria-label="الإشعارات">
            <i class="fas fa-bell"></i>
            <span class="badge" id="notifBadge">0</span>
          </button>
          <div class="user-menu" onclick="App.toggleUserDropdown(event)">
            <div class="user-avatar" id="headerAvatar">م</div>
            <div class="user-info">
              <span class="user-name" id="headerUserName">${user?.name || 'مستخدم'}</span>
              <span class="user-role">${user?.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
            </div>
            <i class="fas fa-chevron-down" style="color: var(--gray-400); font-size: 12px;"></i>
            <div class="dropdown-menu" id="userDropdown" style="position: absolute; top: 100%; left: 0; margin-top: 8px; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); border: 1px solid var(--gray-200); min-width: 200px; padding: 8px 0; display: none; z-index: var(--z-dropdown);">
              <a href="${prefix}pages/settings/profile.html" class="dropdown-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: var(--gray-700); text-decoration: none; font-size: var(--font-size-sm); transition: background var(--transition-fast);"><i class="fas fa-user" style="width: 20px; text-align: center; color: var(--gray-400);"></i>الملف الشخصي</a>
              <a href="${prefix}pages/settings/company.html" class="dropdown-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: var(--gray-700); text-decoration: none; font-size: var(--font-size-sm); transition: background var(--transition-fast);"><i class="fas fa-building" style="width: 20px; text-align: center; color: var(--gray-400);"></i>إعدادات الشركة</a>
              <div style="border-top: 1px solid var(--gray-100); margin: 8px 0;"></div>
              <button onclick="App.logout()" class="dropdown-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: var(--danger-600); background: none; border: none; width: 100%; text-align: right; font-family: var(--font-family); font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);"><i class="fas fa-sign-out-alt" style="width: 20px; text-align: center;"></i>تسجيل الخروج</button>
            </div>
          </div>
        </div>
      </header>

      <div class="main-content">
        <div style="height: var(--header-height);"></div>
        <main class="content-area" id="mainContent"></main>
      </div>
    `;
  }

  updateUserInfo() {
    const user = Storage.getCurrentUser();
    if (!user) return;
    const avatar = document.getElementById('headerAvatar');
    const name = document.getElementById('headerUserName');
    if (avatar) { avatar.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase(); }
    if (name) { name.textContent = user.name; }
  }

  markActiveNav() {
    const path = window.location.pathname;
    const pageMap = {
      'dashboard': 'dashboard',
      'invoices': 'invoices',
      'customers': 'customers',
      'products': 'products',
      'expenses': 'expenses',
      'reports/financial': 'reports-financial',
      'reports/sales': 'reports-sales',
      'reports/expenses': 'reports-expenses',
      'settings/company': 'settings-company',
      'settings/users': 'settings-users',
      'settings/backup': 'settings-backup',
      'settings/profile': 'settings-company'
    };
    let activePage = '';
    for (const [key, value] of Object.entries(pageMap)) {
      if (path.includes(key)) { activePage = value; break; }
    }
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === activePage) item.classList.add('active');
    });
  }

  initUI() {
    document.addEventListener('click', (e) => {
      const dropdowns = document.querySelectorAll('.dropdown-menu');
      dropdowns.forEach(d => {
        if (!d.contains(e.target) && !e.target.closest('.user-menu')) d.style.display = 'none';
      });
    });
    this.updateBadges();
    this.initTheme();
  }

  initTheme() {
    const saved = localStorage.getItem('almohaseb_theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
    this.updateThemeIcon();
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('almohaseb_theme', isDark ? 'dark' : 'light');
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    const isDark = document.documentElement.classList.contains('dark');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }

  updateBadges() {
    const invoices = Storage.getAll('invoices');
    const pendingCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
    const badge = document.getElementById('invoiceBadge');
    if (badge) { badge.textContent = pendingCount; badge.style.display = pendingCount > 0 ? 'flex' : 'none'; }
  }

  loadPageModule() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '');
    const moduleMap = {
      'dashboard': () => window.DashboardModule?.init(),
      'list': () => {
        if (path.includes('invoices')) window.InvoicesModule?.initList();
        if (path.includes('customers')) window.CustomersModule?.initList();
        if (path.includes('products')) window.ProductsModule?.initList();
        if (path.includes('expenses')) window.ExpensesModule?.initList();
      },
      'create': () => {
        if (path.includes('invoices')) window.InvoicesModule?.initCreate();
        if (path.includes('customers')) window.CustomersModule?.initCreate();
        if (path.includes('products')) window.ProductsModule?.initCreate();
        if (path.includes('expenses')) window.ExpensesModule?.initCreate();
      },
      'edit': () => {
        if (path.includes('invoices')) window.InvoicesModule?.initEdit();
        if (path.includes('customers')) window.CustomersModule?.initEdit();
        if (path.includes('products')) window.ProductsModule?.initEdit();
        if (path.includes('expenses')) window.ExpensesModule?.initEdit();
      },
      'view': () => { if (path.includes('invoices')) window.InvoicesModule?.initView(); },
      'financial': () => window.ReportsModule?.initFinancial(),
      'sales': () => window.ReportsModule?.initSales(),
      'expenses': () => window.ReportsModule?.initExpenses(),
      'company': () => window.SettingsModule?.initCompany(),
      'users': () => window.SettingsModule?.initUsers(),
      'backup': () => window.SettingsModule?.initBackup(),
      'profile': () => window.SettingsModule?.initProfile()
    };
    if (moduleMap[pageName]) setTimeout(() => moduleMap[pageName](), 100);
  }

  toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) { sidebar.classList.toggle('show'); if (overlay) overlay.classList.toggle('show'); }
  }

  toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }

  logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      Storage.logout();
      window.location.href = '../index.html';
    }
  }

  handleGlobalSearch(event) {
    if (event.key === 'Enter') {
      const query = event.target.value.trim();
      if (query) {
        const results = {
          invoices: Storage.search('invoices', query, ['invoiceNumber', 'customerName']),
          customers: Storage.search('customers', query, ['name', 'email', 'phone']),
          products: Storage.search('products', query, ['name', 'description'])
        };
        this.showSearchResults(results, query);
      }
    }
  }

  showSearchResults(results, query) {
    const prefix = this.getPathPrefix();
    let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';
    const sections = [
      { key: 'invoices', title: 'الفواتير', icon: 'fa-file-invoice-dollar', link: `${prefix}pages/invoices/view.html?id=` },
      { key: 'customers', title: 'العملاء', icon: 'fa-users', link: `${prefix}pages/customers/list.html` },
      { key: 'products', title: 'المنتجات', icon: 'fa-boxes', link: `${prefix}pages/products/list.html` }
    ];
    let hasResults = false;
    sections.forEach(section => {
      const items = results[section.key];
      if (items.length > 0) {
        hasResults = true;
        html += `<div><h4 style="font-size: 14px; color: var(--gray-500); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><i class="fas ${section.icon}"></i> ${section.title}</h4><div style="display: flex; flex-direction: column; gap: 4px;">`;
        items.slice(0, 5).forEach(item => {
          const name = item.invoiceNumber || item.name || item.description || 'غير معروف';
          const link = section.key === 'invoices' ? section.link + item.id : section.link;
          html += `<a href="${link}" style="padding: 10px 12px; border-radius: var(--radius-md); background: var(--gray-50); color: var(--gray-700); text-decoration: none; font-size: 14px; transition: background var(--transition-fast); display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='var(--primary-50)'" onmouseout="this.style.background='var(--gray-50)'"><i class="fas fa-arrow-left" style="color: var(--primary-500); font-size: 12px;"></i>${name}</a>`;
        });
        html += '</div></div>';
      }
    });
    html += '</div>';
    if (!hasResults) html = `<div class="empty-state" style="padding: 32px;"><div class="empty-state-icon" style="width: 64px; height: 64px; font-size: 24px;"><i class="fas fa-search"></i></div><h4 class="empty-state-title">لا توجد نتائج</h4><p class="empty-state-desc">لم يتم العثور على نتائج لـ "${query}"</p></div>`;
    UI.modal.show({ title: `نتائج البحث: "${query}"`, body: html, size: 'md' });
  }

  showNotifications() {
    const activities = Storage.getRecentActivities(10);
    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    if (activities.length === 0) html += `<div class="empty-state" style="padding: 24px;"><p style="color: var(--gray-500); font-size: 14px;">لا توجد إشعارات جديدة</p></div>`;
    else {
      const icons = { create: 'fa-plus-circle', update: 'fa-edit', delete: 'fa-trash-alt' };
      activities.forEach(act => {
        const time = Utils.formatRelativeTime(act.timestamp);
        html += `<div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: var(--radius-lg); background: var(--gray-50);"><div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: var(--primary-50); color: var(--primary-600); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fas ${icons[act.action] || 'fa-info'}"></i></div><div style="flex: 1;"><p style="font-size: 14px; color: var(--gray-800); margin: 0;">${act.title}</p><p style="font-size: 12px; color: var(--gray-400); margin-top: 4px;">${time} · ${act.user}</p></div></div>`;
      });
    }
    html += '</div>';
    UI.modal.show({ title: 'الإشعارات', body: html, size: 'md' });
  }

  setPageHeader(title, subtitle = '') {
    const container = document.getElementById('pageHeaderContent');
    if (container) container.innerHTML = `<h1 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--gray-900); margin: 0; line-height: 1.3;">${title}</h1>${subtitle ? `<p style="font-size: 12px; color: var(--gray-500); margin: 0;">${subtitle}</p>` : ''}`;
  }
}

window.App = new AppCore();