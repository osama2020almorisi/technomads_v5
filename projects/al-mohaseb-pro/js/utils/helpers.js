/**
 * المحاسب المالي Pro - Utilities
 * Helper functions, formatters, validators
 */

const Utils = {
  // ===== Formatters =====
  formatCurrency(amount, currency = 'SAR') {
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0;
    }
    const settings = Storage.getSettings();
    const symbol = settings?.company?.currencySymbol || 'ر.س';

    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' ' + symbol;
  },

  formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('ar-SA').format(num);
  },

  formatDate(dateString, format = 'short') {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    if (format === 'short') {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
    if (format === 'long') {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }).format(date);
    }
    if (format === 'datetime') {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    return date.toLocaleDateString('ar-SA');
  },

  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHour < 24) return `منذ ${diffHour} ساعة`;
    if (diffDay < 7) return `منذ ${diffDay} يوم`;
    if (diffWeek < 4) return `منذ ${diffWeek} أسبوع`;
    if (diffMonth < 12) return `منذ ${diffMonth} شهر`;
    return `منذ ${diffYear} سنة`;
  },

  formatPhone(phone) {
    if (!phone) return '-';
    // Saudi format
    if (phone.startsWith('05') && phone.length === 10) {
      return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return phone;
  },

  // ===== Validators =====
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPhone(phone) {
    return /^[\+]?[0-9]{8,15}$/.test(phone.replace(/\s/g, ''));
  },

  isValidTaxNumber(tax) {
    return /^3[0-9]{14}$/.test(tax);
  },

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // ===== Generators =====
  generateInvoiceNumber(prefix = 'INV', start = 1) {
    const invoices = Storage.getAll('invoices');
    const maxNum = invoices.reduce((max, inv) => {
      const num = parseInt(inv.invoiceNumber?.replace(prefix + '-', '') || 0);
      return Math.max(max, num);
    }, start - 1);
    return `${prefix}-${String(maxNum + 1).padStart(4, '0')}`;
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // ===== Text Helpers =====
  truncate(text, length = 50) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  },

  // ===== Color Helpers =====
  getRandomColor() {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
      '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
      '#ef4444', '#f97316', '#22c55e', '#10b981',
      '#06b6d4', '#0ea5e9', '#3b82f6'
    ];
    return colors[Math.abs(hash) % colors.length];
  },

  // ===== Date Helpers =====
  getToday() {
    return new Date().toISOString().split('T')[0];
  },

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  },

  getMonthName(monthIndex) {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[monthIndex] || '';
  },

  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },

  // ===== Array/Object Helpers =====
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(item);
      return result;
    }, {});
  },

  sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
      let valA = this.getNestedValue(a, key);
      let valB = this.getNestedValue(b, key);

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  },

  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // ===== Export Helpers =====
  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadCSV(headers, rows, filename) {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ===== QR Code Helper =====
  generateQRData(invoice) {
    const settings = Storage.getSettings();
    const company = settings?.company || {};

    // ZATCA compliant QR data
    const data = [
      company.name || '',
      company.taxNumber || '',
      invoice.issueDate || '',
      invoice.totalAmount?.toString() || '0',
      invoice.taxAmount?.toString() || '0'
    ].join('|');

    return btoa(unescape(encodeURIComponent(data)));
  },

  // ===== Print Helper =====
  printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>طباعة</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; color: #1f2937; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  },

  // ===== Copy to Clipboard =====
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  },

  // ===== File Helpers =====
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
};

window.Utils = Utils;
