/**
 * المحاسب المالي Pro - Storage Manager
 * Clean data layer - NO demo data
 */

class StorageManager {
  constructor() {
    this.prefix = 'almohaseb_pro_';
    this.cache = new Map();
    this.init();
  }

  init() {
    this.initializeDefaults();
  }

  initializeDefaults() {
    const defaults = {
      users: [],
      customers: [],
      products: [],
      invoices: [],
      expenses: [],
      settings: {
        company: {
          name: '',
          address: '',
          phone: '',
          email: '',
          taxNumber: '',
          logo: '',
          currency: 'SAR',
          currencySymbol: 'ر.س',
          language: 'ar',
          dateFormat: 'dd/MM/yyyy'
        },
        invoice: {
          prefix: 'INV',
          startingNumber: 1,
          taxRate: 15,
          taxName: 'ضريبة القيمة المضافة',
          terms: '',
          notes: '',
          showLogo: true,
          showQR: true
        },
        app: {
          theme: 'light',
          sidebarCollapsed: false,
          notifications: true,
          autoBackup: false,
          backupInterval: 7
        }
      },
      activities: [],
      initialized: true
    };

    Object.keys(defaults).forEach(key => {
      if (this.get(key) === null) {
        this.set(key, defaults[key]);
      }
    });
  }

  get(key) {
    const cacheKey = this.prefix + key;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    try {
      const data = localStorage.getItem(cacheKey);
      if (data === null) return null;
      const parsed = JSON.parse(data);
      this.cache.set(cacheKey, parsed);
      return parsed;
    } catch (e) { return null; }
  }

  set(key, value) {
    const cacheKey = this.prefix + key;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(value));
      this.cache.set(cacheKey, value);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        if (window.UI) UI.error('مساحة التخزين ممتلئة');
      }
      return false;
    }
  }

  remove(key) {
    const cacheKey = this.prefix + key;
    localStorage.removeItem(cacheKey);
    this.cache.delete(cacheKey);
  }

  getAll(entity) { return this.get(entity) || []; }
  getById(entity, id) { return this.getAll(entity).find(item => item.id === id) || null; }

  create(entity, data) {
    const items = this.getAll(entity);
    const newItem = { ...data, id: this.generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    items.push(newItem);
    this.set(entity, items);
    this.logActivity('create', entity, newItem);
    return newItem;
  }

  update(entity, id, data) {
    const items = this.getAll(entity);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    this.set(entity, items);
    this.logActivity('update', entity, items[index]);
    return items[index];
  }

  delete(entity, id) {
    const items = this.getAll(entity);
    const item = items.find(i => i.id === id);
    const filtered = items.filter(item => item.id !== id);
    this.set(entity, filtered);
    if (item) this.logActivity('delete', entity, item);
    return true;
  }

  search(entity, query, fields) {
    const items = this.getAll(entity);
    if (!query) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(item => fields.some(field => {
      const value = this.getNestedValue(item, field);
      return value && String(value).toLowerCase().includes(lowerQuery);
    }));
  }

  getNestedValue(obj, path) { return path.split('.').reduce((current, key) => current?.[key], obj); }
  generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }

  getSettings() { return this.get('settings') || {}; }
  updateSettings(path, value) {
    const settings = this.getSettings();
    const keys = path.split('.');
    let current = settings;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    this.set('settings', settings);
    return settings;
  }

  logActivity(action, entity, item) {
    const activities = this.getAll('activities');
    const activity = {
      id: this.generateId(),
      action, entity, entityId: item?.id,
      title: this.getActivityTitle(action, entity, item),
      timestamp: new Date().toISOString(),
      user: this.getCurrentUser()?.name || 'نظام'
    };
    activities.unshift(activity);
    if (activities.length > 100) activities.pop();
    this.set('activities', activities);
  }

  getActivityTitle(action, entity, item) {
    const entityNames = { invoices: 'فاتورة', customers: 'عميل', products: 'منتج', expenses: 'مصروف', users: 'مستخدم' };
    const actionNames = { create: 'إنشاء', update: 'تحديث', delete: 'حذف' };
    const itemName = item?.name || item?.customerName || item?.invoiceNumber || item?.description || '';
    return `${actionNames[action] || action} ${entityNames[entity] || entity} ${itemName ? '- ' + itemName : ''}`;
  }

  getRecentActivities(limit = 10) { return this.getAll('activities').slice(0, limit); }
  getCurrentUser() { return this.get('currentUser'); }
  setCurrentUser(user) { this.set('currentUser', user); }
  logout() { this.remove('currentUser'); this.remove('sessionToken'); }
  isAuthenticated() { return !!this.getCurrentUser(); }

  createBackup() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    const backup = {};
    keys.forEach(key => { backup[key] = localStorage.getItem(key); });
    return JSON.stringify({ version: '2.0.0', timestamp: new Date().toISOString(), data: backup });
  }

  downloadBackup() {
    const backup = this.createBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `almohaseb-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  restoreBackup(backupJson) {
    try {
      const backup = JSON.parse(backupJson);
      if (!backup.data) throw new Error('Invalid backup');
      Object.keys(localStorage).forEach(key => { if (key.startsWith(this.prefix)) localStorage.removeItem(key); });
      Object.entries(backup.data).forEach(([key, value]) => { localStorage.setItem(key, value); });
      this.cache.clear();
      return true;
    } catch (e) { return false; }
  }

  clearAll() {
    Object.keys(localStorage).forEach(key => { if (key.startsWith(this.prefix)) localStorage.removeItem(key); });
    this.cache.clear();
  }

  getStorageInfo() {
    let used = 0;
    Object.keys(localStorage).forEach(key => { if (key.startsWith(this.prefix)) used += localStorage.getItem(key).length * 2; });
    const total = 5 * 1024 * 1024;
    return { used, total, percentage: Math.round((used / total) * 100), formatted: `${(used / 1024).toFixed(1)} KB / ${(total / 1024 / 1024).toFixed(1)} MB` };
  }
}

window.Storage = new StorageManager();
