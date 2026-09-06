/**
 * المحاسب المالي Pro - App Core
 * Fixed with correct base path and dropdown
 */

class AppCore {
  constructor() {
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
    this.renderLayout();
    this.initUI();
    this.loadPageModule();
  }

  // ===== GET BASE URL =====
  getBaseUrl() {
    const currentUrl = window.location.href;
    
    // البحث عن 'al-mohaseb-pro' في الرابط
    const match = currentUrl.match(/^(.*?)(al-mohaseb-pro\/)/i);
    if (match) {
      return match[1] + match[2];
    }
    
    // محاولة من المسار
    const path = window.location.pathname;
    const pathMatch = path.match(/^(.*?)(al-mohaseb-pro\/)/i);
    if (pathMatch) {
      return pathMatch[1] + pathMatch[2];
    }
    
    // حل احتياطي
    const parts = path.split('/').filter(p => p.length > 0);
    if (parts.includes('pages')) {
      const index = parts.indexOf('pages');
      const baseParts = parts.slice(0, index + 1);
      return '/' + baseParts.join('/') + '/';
    }
    
    if (path.endsWith('/') || path.endsWith('index.html')) {
      return '/';
    }
    
    return '../';
  }

  // ===== GET PATH =====
  getPath(page) {
    const base = this.getBaseUrl();
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const cleanPage = page.replace(/^\.\//, '').replace(/^\.\.\//, '');
    return cleanBase + cleanPage;
  }

  // ===== AUTH =====
  checkAuth() {
    const path = window.location.pathname;
    const isAuthPage = path.includes('/auth/') || 
                       path.endsWith('index.html') || 
                       path === '/' || 
                       path.endsWith('/');

    if (!Storage.isAuthenticated() && !isAuthPage) {
      window.location.href = this.getPath('index.html');
      return false;
    }
    if (Storage.isAuthenticated() && isAuthPage) {
      window.location.href = this.getPath('pages/dashboard.html');
      return false;
    }
    return true;
  }

  // ===== LAYOUT =====
  renderLayout() {
    if (window.location.pathname.includes('/auth/') || 
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/') {
      return;
    }

    if (document.getElementById('appSidebar')) {
      this.updateUserInfo();
      this.markActiveNav();
      return;
    }

    const layoutHTML = this.getLayoutHTML();
    document.body.insertAdjacentHTML('afterbegin', layoutHTML);
    this.movePageContent();
    this.updateUserInfo();
    this.markActiveNav();
  }

  movePageContent() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    const layoutElements = ['appSidebar', 'sidebarOverlay', 'appHeader', 'mainContent'];
    const childrenToMove = [];

    document.body.childNodes.forEach(child => {
      if (child.nodeType === 1) {
        const id = child.id;
        if (!layoutElements.includes(id) && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
          childrenToMove.push(child);
        }
      }
    });

    childrenToMove.forEach(child => {
      if (!mainContent.contains(child)) {
        if (child.tagName === 'SCRIPT') {
          const newScript = document.createElement('script');
          Array.from(child.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = child.textContent;
          mainContent.appendChild(newScript);
          child.remove();
        } else {
          mainContent.appendChild(child);
        }
      }
    });

    let contentArea = mainContent.querySelector('.content-area');
    if (!contentArea) {
      contentArea = document.createElement('div');
      contentArea.className = 'content-area';
      contentArea.id = 'mainContentArea';
      
      const children = Array.from(mainContent.children);
      children.forEach(child => {
        if (child !== contentArea && !child.matches('.content-area')) {
          contentArea.appendChild(child);
        }
      });
      
      const spacer = mainContent.querySelector('div[style*="height: var(--header-height)"]');
      if (spacer) spacer.remove();
      
      mainContent.appendChild(contentArea);
    }
  }

  getLayoutHTML() {
    const user = Storage.getCurrentUser();
    const getPath = (page) => this.getPath(page);

    return `
      <aside class="app-sidebar" id="appSidebar">
        <div class="sidebar-brand">
          <div class="brand-logo"><i class="fas fa-calculator"></i></div>
          <span class="brand-text">المحاسب المالي</span>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">القائمة الرئيسية</div>
            <a href="${getPath('pages/dashboard.html')}" class="nav-item" data-page="dashboard">
              <i class="fas fa-chart-pie"></i>
              <span class="nav-label">لوحة التحكم</span>
            </a>
            <a href="${getPath('pages/invoices/list.html')}" class="nav-item" data-page="invoices">
              <i class="fas fa-file-invoice-dollar"></i>
              <span class="nav-label">الفواتير</span>
              <span class="nav-badge" id="invoiceBadge">0</span>
            </a>
            <a href="${getPath('pages/customers/list.html')}" class="nav-item" data-page="customers">
              <i class="fas fa-users"></i>
              <span class="nav-label">العملاء</span>
            </a>
            <a href="${getPath('pages/products/list.html')}" class="nav-item" data-page="products">
              <i class="fas fa-boxes"></i>
              <span class="nav-label">المنتجات</span>
            </a>
            <a href="${getPath('pages/expenses/list.html')}" class="nav-item" data-page="expenses">
              <i class="fas fa-wallet"></i>
              <span class="nav-label">المصروفات</span>
            </a>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">التقارير</div>
            <a href="${getPath('pages/reports/financial.html')}" class="nav-item" data-page="reports-financial">
              <i class="fas fa-chart-line"></i>
              <span class="nav-label">الأرباح والخسائر</span>
            </a>
            <a href="${getPath('pages/reports/sales.html')}" class="nav-item" data-page="reports-sales">
              <i class="fas fa-chart-bar"></i>
              <span class="nav-label">المبيعات</span>
            </a>
            <a href="${getPath('pages/reports/expenses.html')}" class="nav-item" data-page="reports-expenses">
              <i class="fas fa-chart-area"></i>
              <span class="nav-label">المصروفات</span>
            </a>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">الإعدادات</div>
            <a href="${getPath('pages/settings/company.html')}" class="nav-item" data-page="settings-company">
              <i class="fas fa-building"></i>
              <span class="nav-label">الشركة</span>
            </a>
            <a href="${getPath('pages/settings/users.html')}" class="nav-item" data-page="settings-users">
              <i class="fas fa-user-shield"></i>
              <span class="nav-label">المستخدمون</span>
            </a>
            <a href="${getPath('pages/settings/backup.html')}" class="nav-item" data-page="settings-backup">
              <i class="fas fa-database"></i>
              <span class="nav-label">النسخ الاحتياطي</span>
            </a>
            <a href="${getPath('pages/settings/profile.html')}" class="nav-item" data-page="settings-profile">
              <i class="fas fa-user-cog"></i>
              <span class="nav-label">الملف الشخصي</span>
            </a>
          </div>
        </nav>
        <div class="sidebar-footer">
          <button class="sidebar-toggle-btn" onclick="App.toggleSidebar()">
            <i class="fas fa-chevron-right"></i>
            <span>طي القائمة</span>
          </button>
        </div>
      </aside>
      
      <div class="sidebar-overlay" id="sidebarOverlay" onclick="App.toggleSidebar()"></div>

      <header class="app-header" id="appHeader">
        <div class="header-left">
          <button class="header-action-btn d-md-none" onclick="App.toggleSidebar()" aria-label="القائمة">
            <i class="fas fa-bars"></i>
          </button>
          <div id="pageHeaderContent">
            <h1 class="header-title" id="pageTitle">لوحة التحكم</h1>
          </div>
        </div>
        <div class="header-right">
          <button class="header-action-btn" id="themeToggle" onclick="App.toggleTheme()" aria-label="تبديل الوضع">
            <i class="fas fa-moon" id="themeIcon"></i>
          </button>
          <button class="header-action-btn" onclick="App.showNotifications()" aria-label="الإشعارات">
            <i class="fas fa-bell"></i>
            <span class="badge" id="notifBadge">0</span>
          </button>
          
          <!-- ===== USER MENU WITH DROPDOWN - FIXED ===== -->
          <div class="user-menu-wrapper">
            <div class="user-menu" onclick="App.toggleUserDropdown(event)">
              <div class="user-avatar" id="headerAvatar">م</div>
              <div class="user-info">
                <span class="user-name" id="headerUserName">${user?.name || 'مستخدم'}</span>
                <span class="user-role">${user?.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
              </div>
              <i class="fas fa-chevron-down" id="dropdownChevron" style="color: var(--gray-400); font-size: 12px; transition: transform 0.3s ease;"></i>
            </div>
            
            <!-- Dropdown Menu -->
            <div class="dropdown-menu" id="userDropdown">
              <a href="${getPath('pages/settings/profile.html')}" class="dropdown-item">
                <i class="fas fa-user"></i> الملف الشخصي
              </a>
              <a href="${getPath('pages/settings/company.html')}" class="dropdown-item">
                <i class="fas fa-building"></i> إعدادات الشركة
              </a>
              <div class="dropdown-divider"></div>
              <button onclick="App.logout()" class="dropdown-item danger">
                <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
              </button>
            </div>
          </div>
          <!-- ===== END USER MENU ===== -->
          
        </div>
      </header>

      <div class="main-content" id="mainContent">
        <!-- Page content will be moved here -->
      </div>
    `;
  }

  // ===== UI =====
  updateUserInfo() {
    const user = Storage.getCurrentUser();
    if (!user) return;
    const avatar = document.getElementById('headerAvatar');
    const name = document.getElementById('headerUserName');
    if (avatar) avatar.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (name) name.textContent = user.name;
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
      'settings/profile': 'settings-profile'
    };
    
    let activePage = '';
    for (const [key, value] of Object.entries(pageMap)) {
      if (path.includes(key)) { 
        activePage = value; 
        break; 
      }
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === activePage) {
        item.classList.add('active');
      }
    });
    
    const titleMap = {
      'dashboard': 'لوحة التحكم',
      'invoices': 'الفواتير',
      'customers': 'العملاء',
      'products': 'المنتجات',
      'expenses': 'المصروفات',
      'reports-financial': 'الأرباح والخسائر',
      'reports-sales': 'المبيعات',
      'reports-expenses': 'المصروفات',
      'settings-company': 'إعدادات الشركة',
      'settings-users': 'المستخدمون',
      'settings-backup': 'النسخ الاحتياطي',
      'settings-profile': 'الملف الشخصي'
    };
    
    const titleEl = document.getElementById('pageTitle');
    if (titleEl && titleMap[activePage]) {
      titleEl.textContent = titleMap[activePage];
    }
  }

  initUI() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('userDropdown');
      const userMenu = document.querySelector('.user-menu');
      const wrapper = document.querySelector('.user-menu-wrapper');
      
      if (dropdown && wrapper) {
        if (!wrapper.contains(e.target)) {
          dropdown.classList.remove('show');
          dropdown.style.display = 'none';
          const chevron = document.getElementById('dropdownChevron');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
      }
    });
    
    this.updateBadges();
    this.initTheme();
    this.setupMobile();
  }

  setupMobile() {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        const sidebar = document.getElementById('appSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
      }
    });
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
    if (icon) {
      icon.className = document.documentElement.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  updateBadges() {
    const invoices = Storage.getAll('invoices');
    const pendingCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
    const badge = document.getElementById('invoiceBadge');
    if (badge) {
      badge.textContent = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
    }
  }

  // ===== DROPDOWN TOGGLE =====
  toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    const chevron = document.getElementById('dropdownChevron');
    
    if (!dropdown) return;
    
    const isOpen = dropdown.style.display === 'block' || dropdown.classList.contains('show');
    
    if (isOpen) {
      dropdown.style.display = 'none';
      dropdown.classList.remove('show');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    } else {
      dropdown.style.display = 'block';
      dropdown.classList.add('show');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
  }

  // ===== MODULE LOADER =====
  loadPageModule() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '');
    
    setTimeout(() => {
      const moduleMap = {
        'dashboard': () => window.DashboardModule?.init(),
        'list': () => {
          if (path.includes('invoices')) window.InvoicesModule?.initList();
          else if (path.includes('customers')) window.CustomersModule?.initList();
          else if (path.includes('products')) window.ProductsModule?.initList();
          else if (path.includes('expenses')) window.ExpensesModule?.initList();
        },
        'create': () => {
          if (path.includes('invoices')) window.InvoicesModule?.initCreate();
          else if (path.includes('customers')) window.CustomersModule?.initCreate();
          else if (path.includes('products')) window.ProductsModule?.initCreate();
          else if (path.includes('expenses')) window.ExpensesModule?.initCreate();
        },
        'edit': () => {
          if (path.includes('invoices')) window.InvoicesModule?.initEdit();
          else if (path.includes('customers')) window.CustomersModule?.initEdit();
          else if (path.includes('products')) window.ProductsModule?.initEdit();
          else if (path.includes('expenses')) window.ExpensesModule?.initEdit();
        },
        'view': () => {
          if (path.includes('invoices')) window.InvoicesModule?.initView();
        },
        'financial': () => window.ReportsModule?.initFinancial(),
        'sales': () => window.ReportsModule?.initSales(),
        'expenses': () => window.ReportsModule?.initExpenses(),
        'company': () => window.SettingsModule?.initCompany(),
        'users': () => window.SettingsModule?.initUsers(),
        'backup': () => window.SettingsModule?.initBackup(),
        'profile': () => window.SettingsModule?.initProfile()
      };
      
      if (moduleMap[pageName]) {
        moduleMap[pageName]();
      }
    }, 200);
  }

  // ===== ACTIONS =====
  toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
      sidebar.classList.toggle('show');
      if (overlay) overlay.classList.toggle('show');
    }
  }

  logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      Storage.logout();
      window.location.href = this.getPath('index.html');
    }
  }

  showNotifications() {
    const activities = Storage.getRecentActivities(10);
    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    
    if (activities.length === 0) {
      html += `
        <div class="empty-state" style="padding: 24px;">
          <p style="color: var(--gray-500); font-size: 14px;">لا توجد إشعارات جديدة</p>
        </div>
      `;
    } else {
      const icons = { create: 'fa-plus-circle', update: 'fa-edit', delete: 'fa-trash-alt' };
      activities.forEach(act => {
        html += `
          <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: var(--radius-lg); background: var(--gray-50);">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: var(--primary-50); color: var(--primary-600); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <i class="fas ${icons[act.action] || 'fa-info'}"></i>
            </div>
            <div style="flex: 1;">
              <p style="font-size: 14px; color: var(--gray-800); margin: 0;">${act.title}</p>
              <p style="font-size: 12px; color: var(--gray-400); margin-top: 4px;">
                ${Utils.formatRelativeTime(act.timestamp)} · ${act.user}
              </p>
            </div>
          </div>
        `;
      });
    }
    html += '</div>';
    
    UI.modal.show({ 
      title: 'الإشعارات', 
      body: html, 
      size: 'md' 
    });
  }

  setPageHeader(title, subtitle = '') {
    const container = document.getElementById('pageHeaderContent');
    const titleEl = document.getElementById('pageTitle');
    
    if (titleEl) {
      titleEl.textContent = title;
    }
    
    if (container && subtitle) {
      const subEl = container.querySelector('.header-subtitle');
      if (subEl) {
        subEl.textContent = subtitle;
      } else {
        container.innerHTML = `
          <h1 class="header-title" id="pageTitle">${title}</h1>
          <p class="header-subtitle" style="font-size: 12px; color: var(--gray-500); margin: 0;">${subtitle}</p>
        `;
      }
    }
  }
}

// Initialize App
window.App = new AppCore();