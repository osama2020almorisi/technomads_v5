/**
 * المحاسب المالي Pro - UI Manager
 * Notifications, Modals, Loading, Confirmations
 */

class UIManager {
  constructor() {
    this.toastContainer = null;
    this.modalOverlay = null;
    this.loadingOverlay = null;
    this.init();
  }

  init() {
    // Create toast container
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }

  // ===== Notifications / Toasts =====
  notify(type, title, message = '', duration = 4000) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${icons[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    this.toastContainer.appendChild(toast);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  }

  success(title, message) { return this.notify('success', title, message); }
  error(title, message) { return this.notify('error', title, message); }
  warning(title, message) { return this.notify('warning', title, message); }
  info(title, message) { return this.notify('info', title, message); }

  // ===== Modals =====
  modal = {
    show: (options) => {
      const { title, body, size = 'md', onConfirm, onCancel, confirmText = 'تأكيد', cancelText = 'إلغاء', showCancel = true } = options;

      const sizes = { sm: 'modal-sm', md: '', lg: 'modal-lg', xl: 'modal-xl' };

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay show';
      overlay.id = 'activeModal';
      overlay.innerHTML = `
        <div class="modal ${sizes[size] || ''}" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" onclick="UI.modal.close()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            ${body}
          </div>
          <div class="modal-footer">
            ${showCancel ? `<button class="btn btn-secondary" onclick="UI.modal.close(${onCancel ? 'true' : 'false'})">${cancelText}</button>` : ''}
            ${onConfirm ? `<button class="btn btn-primary" id="modalConfirmBtn">${confirmText}</button>` : ''}
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      // Setup confirm button
      if (onConfirm) {
        const confirmBtn = overlay.querySelector('#modalConfirmBtn');
        if (confirmBtn) {
          confirmBtn.addEventListener('click', () => {
            onConfirm();
            this.modal.close();
          });
        }
      }

      // Close on backdrop click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.modal.close(onCancel ? true : false);
        }
      });

      // Close on Escape
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          this.modal.close(onCancel ? true : false);
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    },

    close: (triggerCancel = false) => {
      const modal = document.getElementById('activeModal');
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
          document.body.style.overflow = '';
        }, 200);
      }
    }
  };

  // ===== Confirm Dialog =====
  confirm(message, onConfirm, onCancel) {
    this.modal.show({
      title: 'تأكيد',
      body: `<p style="color: var(--gray-600); line-height: 1.6;">${message}</p>`,
      size: 'sm',
      onConfirm,
      onCancel,
      confirmText: 'تأكيد',
      cancelText: 'إلغاء'
    });
  }

  // ===== Loading =====
  loading = {
    show: (text = 'جاري التحميل...') => {
      if (this.loadingOverlay) return;

      this.loadingOverlay = document.createElement('div');
      this.loadingOverlay.className = 'loading-overlay';
      this.loadingOverlay.innerHTML = `
        <div class="spinner"></div>
        <p class="loading-text">${text}</p>
      `;
      document.body.appendChild(this.loadingOverlay);
      document.body.style.overflow = 'hidden';
    },

    hide: () => {
      if (this.loadingOverlay) {
        this.loadingOverlay.remove();
        this.loadingOverlay = null;
        document.body.style.overflow = '';
      }
    }
  };

  // ===== Form Validation =====
  validateForm(formElement, rules = {}) {
    let isValid = true;
    const errors = {};

    // Clear previous errors
    formElement.querySelectorAll('.form-error').forEach(el => {
      el.classList.remove('visible');
      el.textContent = '';
    });
    formElement.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      el.classList.remove('error');
    });

    // Validate each field
    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const field = formElement.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      const value = field.value.trim();
      const errorEl = formElement.querySelector(`[data-error="${fieldName}"]`);

      for (const rule of fieldRules) {
        let error = null;

        if (rule.required && !value) {
          error = rule.message || 'هذا الحقل مطلوب';
        } else if (value) {
          if (rule.minLength && value.length < rule.minLength) {
            error = `الحد الأدنى ${rule.minLength} أحرف`;
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            error = `الحد الأقصى ${rule.maxLength} حرف`;
          }
          if (rule.min && Number(value) < rule.min) {
            error = `الحد الأدنى ${rule.min}`;
          }
          if (rule.max && Number(value) > rule.max) {
            error = `الحد الأقصى ${rule.max}`;
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            error = rule.message || 'صيغة غير صحيحة';
          }
          if (rule.email && !Utils.isValidEmail(value)) {
            error = 'البريد الإلكتروني غير صحيح';
          }
          if (rule.phone && !Utils.isValidPhone(value)) {
            error = 'رقم الهاتف غير صحيح';
          }
          if (rule.match) {
            const matchField = formElement.querySelector(`[name="${rule.match}"]`);
            if (matchField && value !== matchField.value) {
              error = rule.message || 'القيمتان غير متطابقتين';
            }
          }
        }

        if (error) {
          isValid = false;
          errors[fieldName] = error;
          field.classList.add('error');
          if (errorEl) {
            errorEl.textContent = error;
            errorEl.classList.add('visible');
          }
          break;
        }
      }
    });

    return { isValid, errors };
  }

  // ===== Skeleton Loading =====
  skeleton(count = 3, type = 'card') {
    let html = '';
    for (let i = 0; i < count; i++) {
      if (type === 'card') {
        html += `
          <div class="card" style="padding: 24px;">
            <div style="display: flex; gap: 16px; align-items: center;">
              <div class="skeleton" style="width: 48px; height: 48px; border-radius: 12px;"></div>
              <div style="flex: 1;">
                <div class="skeleton" style="width: 60%; height: 16px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 40%; height: 12px;"></div>
              </div>
            </div>
          </div>
        `;
      } else if (type === 'table') {
        html += `
          <tr>
            <td><div class="skeleton" style="height: 16px;"></div></td>
            <td><div class="skeleton" style="height: 16px;"></div></td>
            <td><div class="skeleton" style="height: 16px;"></div></td>
            <td><div class="skeleton" style="height: 16px;"></div></td>
          </tr>
        `;
      } else if (type === 'text') {
        html += `<div class="skeleton" style="height: 16px; margin-bottom: 8px; width: ${70 + Math.random() * 30}%;"></div>`;
      }
    }
    return html;
  }
}

// Initialize
window.UI = new UIManager();
