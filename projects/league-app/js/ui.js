/* ============================================================
   UI.JS — مكونات الواجهة
   Toast | Modal | Skeletons | Animations | FormBuilder | Theme
   Search | Haptic | PullToRefresh | Badges | BottomNav
   ============================================================ */

(function (window) {
  'use strict';

  /* ============================================================
     TOAST NOTIFICATIONS
     ============================================================ */

  const Toast = {
    DEFAULT_DURATION: 3200,

    show(message, type = 'success', duration = this.DEFAULT_DURATION) {
      const region = document.getElementById('toastRegion');
      if (!region) return null;

      const toast = document.createElement('div');
      toast.className = `toast glass-toast ${type}`;
      toast.setAttribute('role', 'status');

      const dot = document.createElement('span');
      dot.className = 'toast-dot';

      const text = document.createElement('span');
      text.textContent = message;

      const close = document.createElement('button');
      close.type = 'button';
      close.setAttribute('aria-label', 'إغلاق');
      close.textContent = '×';
      close.onclick = () => this.dismiss(toast);

      toast.append(dot, text, close);
      region.appendChild(toast);

      this.haptic(type === 'error' ? 20 : 10);

      if (duration > 0) {
        setTimeout(() => this.dismiss(toast), duration);
      }

      return toast;
    },

    dismiss(toast) {
      if (!toast || !toast.parentNode) return;
      toast.style.animation = 'toastSlideOut 0.25s var(--ease-out) both';
      setTimeout(() => toast.remove(), 250);
    },

    success(msg, dur) {
      return this.show(msg, 'success', dur);
    },

    error(msg, dur) {
      return this.show(msg, 'error', dur || 4500);
    },

    warning(msg, dur) {
      return this.show(msg, 'warning', dur || 4000);
    },

    info(msg, dur) {
      return this.show(msg, 'info', dur);
    },

    clearAll() {
      const region = document.getElementById('toastRegion');
      if (region) region.innerHTML = '';
    },

    haptic(intensity = 10) {
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate(intensity);
        }
      } catch (e) {
        /* silent */
      }
    }
  };

  /* ============================================================
     MODAL
     ============================================================ */

  const Modal = {
    activeModal: null,

    open(title, content, options = {}) {
      const root = document.getElementById('modalRoot');
      if (!root) return null;

      const {
        confirmText = '',
        cancelText = 'إلغاء',
        danger = false,
        onConfirm = null,
        onCancel = null,
        closeOnBackdrop = true,
        bottomSheet = true
      } = options;

      root.innerHTML = '';

      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';

      const modal = document.createElement('section');
      modal.className = `modal glass-modal ${bottomSheet ? 'modal-bottom-sheet' : ''}`;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', title);

      if (bottomSheet) {
        const handle = document.createElement('div');
        handle.className = 'modal-handle';
        handle.setAttribute('aria-hidden', 'true');
        modal.appendChild(handle);
      }

      const head = document.createElement('div');
      head.className = 'modal-head';

      const heading = document.createElement('h2');
      heading.textContent = title;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.setAttribute('aria-label', 'إغلاق');
      closeBtn.type = 'button';
      closeBtn.textContent = '×';

      head.append(heading, closeBtn);
      modal.appendChild(head);

      const contentWrap = document.createElement('div');
      contentWrap.className = 'modal-content';

      if (typeof content === 'string') {
        contentWrap.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        contentWrap.appendChild(content);
      } else if (content instanceof DocumentFragment) {
        contentWrap.appendChild(content);
      }
      modal.appendChild(contentWrap);

      if (confirmText) {
        const actions = document.createElement('div');
        actions.className = 'button-row';
        actions.style.marginTop = 'var(--space-4)';

        if (cancelText) {
          const cancelBtn = document.createElement('button');
          cancelBtn.className = 'btn btn-secondary';
          cancelBtn.type = 'button';
          cancelBtn.textContent = cancelText;
          cancelBtn.onclick = () => {
            if (onCancel) onCancel();
            this.close();
          };
          actions.appendChild(cancelBtn);
        }

        const confirmBtn = document.createElement('button');
        confirmBtn.className = `btn btn-block ${danger ? 'btn-danger' : 'btn-primary'}`;
        confirmBtn.type = 'button';
        confirmBtn.textContent = confirmText;
        confirmBtn.onclick = () => {
          if (onConfirm) onConfirm();
          this.close();
        };
        actions.appendChild(confirmBtn);

        modal.appendChild(actions);
      }

      backdrop.appendChild(modal);
      root.appendChild(backdrop);

      this.activeModal = modal;

      const close = () => this.close();

      closeBtn.onclick = () => {
        if (onCancel) onCancel();
        close();
      };

      if (closeOnBackdrop) {
        backdrop.addEventListener('click', e => {
          if (e.target === backdrop) {
            if (onCancel) onCancel();
            close();
          }
        });
      }

      const escHandler = e => {
        if (e.key === 'Escape') {
          if (onCancel) onCancel();
          close();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      Toast.haptic(10);

      return { close, modal, backdrop };
    },

    close() {
      const root = document.getElementById('modalRoot');
      if (root) root.innerHTML = '';
      this.activeModal = null;
    },

    confirm(title, message, options = {}) {
      return new Promise(resolve => {
        this.open(
          title,
          `<p>${Helpers.escape(message)}</p>`,
          {
            ...options,
            confirmText: options.confirmText || 'تأكيد',
            cancelText: options.cancelText || 'إلغاء',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          }
        );
      });
    },

    alert(title, message) {
      return new Promise(resolve => {
        this.open(
          title,
          `<p>${Helpers.escape(message)}</p>`,
          {
            confirmText: 'حسناً',
            onConfirm: () => resolve(true)
          }
        );
      });
    },

    prompt(title, message, defaultValue = '', options = {}) {
      return new Promise(resolve => {
        const content = document.createElement('div');
        content.innerHTML = `
          <p>${Helpers.escape(message)}</p>
          <div class="field" style="margin-top:var(--space-3)">
            <input
              id="modalPromptInput"
              class="input-control"
              type="${options.type || 'text'}"
              value="${Helpers.escape(defaultValue)}"
              autocomplete="off"
            >
          </div>
        `;

        this.open(title, content, {
          confirmText: 'حفظ',
          cancelText: 'إلغاء',
          onConfirm: () => {
            const input = document.getElementById('modalPromptInput');
            resolve(input ? input.value : null);
          },
          onCancel: () => resolve(null)
        });

        setTimeout(() => {
          const input = document.getElementById('modalPromptInput');
          if (input) input.focus();
        }, 100);
      });
    }
  };

  /* ============================================================
     SKELETONS
     ============================================================ */

  const Skeletons = {
    line(width = '100%') {
      return `<div class="skeleton skeleton-line" style="width:${width}"></div>`;
    },

    circle(size = 44) {
      return `<div class="skeleton skeleton-circle" style="width:${size}px;height:${size}px"></div>`;
    },

    card() {
      return `<div class="skeleton" style="height:120px;border-radius:var(--radius-xl)"></div>`;
    },

    matchCard() {
      return `<div class="skeleton" style="height:100px;border-radius:var(--radius-xl);margin-bottom:var(--space-2)"></div>`;
    },

    list(count = 3) {
      return Array.from({ length: count }, () =>
        `<div class="skeleton" style="height:60px;border-radius:var(--radius-lg);margin-bottom:var(--space-2)"></div>`
      ).join('');
    },

    table(rows = 5) {
      return `
        <div class="card" style="padding:var(--space-4)">
          ${Array.from({ length: rows }, () =>
            `<div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3)">
              <div class="skeleton skeleton-line" style="width:32px;height:32px;border-radius:var(--radius-sm)"></div>
              <div class="skeleton skeleton-line" style="flex:1;height:14px"></div>
              <div class="skeleton skeleton-line" style="width:40px;height:14px"></div>
            </div>`
          ).join('')}
        </div>
      `;
    },

    stats() {
      return `
        <div class="stat-grid">
          ${Array.from({ length: 6 }, () =>
            `<div class="skeleton" style="height:70px;border-radius:var(--radius-lg)"></div>`
          ).join('')}
        </div>
      `;
    }
  };

  /* ============================================================
     ANIMATIONS
     ============================================================ */

  const Animations = {
    enter(el, animation = 'page-enter') {
      if (!el) return;
      el.classList.remove(animation);
      void el.offsetWidth;
      el.classList.add(animation);
    },

    stagger(container, delay = 50) {
      if (!container) return;
      const children = [...container.children];
      children.forEach((child, i) => {
        child.style.animation = `fadeInUp 0.4s var(--ease-out) ${i * delay}ms both`;
      });
    },

    countUp(element, target, duration = 1000, suffix = '') {
      if (!element) return;
      const start = performance.now();
      const initial = 0;

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(initial + (target - initial) * eased);
        element.textContent = value + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    },

    confetti(duration = 3000) {
      const colors = ['#0b6e4f', '#d4af37', '#e63946', '#4385f5', '#f4a261'];
      const pieces = 60;
      const container = document.body;

      for (let i = 0; i < pieces; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.insetInlineStart = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;

        container.appendChild(piece);

        setTimeout(() => piece.remove(), duration);
      }
    },

    haptic(intensity = 10) {
      try {
        if ('vibrate' in navigator) navigator.vibrate(intensity);
      } catch (e) {
        /* silent */
      }
    }
  };

  /* ============================================================
     FORM BUILDER
     ============================================================ */

  const FormBuilder = {
    build(fields, values = {}) {
      const form = document.createElement('form');
      form.className = 'admin-form';

      for (const field of fields) {
        const wrapper = document.createElement('div');
        wrapper.className = 'field' + (field.full ? ' full' : '');

        const label = document.createElement('label');
        label.setAttribute('for', `field-${field.name}`);
        label.textContent = field.label;
        wrapper.appendChild(label);

        const value = values[field.name] ?? field.value ?? '';
        let input;

        switch (field.type) {
          case 'select':
            input = document.createElement('select');
            input.className = 'select-control';
            for (const opt of field.options || []) {
              const option = document.createElement('option');
              option.value = opt.value;
              option.textContent = opt.label;
              if (String(opt.value) === String(value)) option.selected = true;
              input.appendChild(option);
            }
            break;

          case 'textarea':
            input = document.createElement('textarea');
            input.className = 'textarea-control';
            input.rows = field.rows || 3;
            input.value = value;
            break;

          case 'image':
            input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            break;

          default:
            input = document.createElement('input');
            input.type = field.type || 'text';
            input.className = 'input-control';
            input.value = value;
            if (field.min !== undefined) input.min = field.min;
            if (field.max !== undefined) input.max = field.max;
            if (field.step !== undefined) input.step = field.step;
            if (field.placeholder) input.placeholder = field.placeholder;
        }

        input.id = `field-${field.name}`;
        input.name = field.name;
        if (field.required) input.required = true;

        wrapper.appendChild(input);

        if (field.hint) {
          const hint = document.createElement('small');
          hint.className = 'field-hint';
          hint.textContent = field.hint;
          wrapper.appendChild(hint);
        }

        form.appendChild(wrapper);
      }

      return form;
    },

    getValues(form) {
      const values = {};
      const formData = new FormData(form);
      for (const [key, value] of formData.entries()) {
        values[key] = value;
      }
      return values;
    },

    validate(form) {
      return form.checkValidity();
    },

    onSubmit(form, callback) {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!this.validate(form)) {
          Toast.error('يرجى ملء جميع الحقول المطلوبة.');
          return;
        }
        const values = this.getValues(form);
        await callback(values);
      });
    },

    reset(form) {
      form.reset();
    }
  };

  /* ============================================================
     THEME MANAGER
     ============================================================ */

  const ThemeManager = {
    get() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },

    set(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      if (window.Core?.Storage) {
        Core.Storage.set(Core.Storage.KEYS.THEME, theme);
      }
      this.updateMetaThemeColor(theme);
      this.updateIcon(theme);
    },

    toggle() {
      const current = this.get();
      const next = current === 'dark' ? 'light' : 'dark';
      this.set(next);
      Toast.haptic(10);
      Toast.info(next === 'dark' ? 'تم تفعيل الوضع الداكن' : 'تم تفعيل الوضع الفاتح', 1800);
      return next;
    },

    updateMetaThemeColor(theme) {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', theme === 'dark' ? '#0A0E13' : '#0B6E4F');
      }
    },

    updateIcon(theme) {
      const btn = document.getElementById('themeToggle');
      if (!btn) return;
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'
      );
    },

    getLanguage() {
      return document.documentElement.lang || 'ar';
    },

    setLanguage(lang) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      if (window.Core?.Storage) {
        Core.Storage.set(Core.Storage.KEYS.LANG, lang);
      }
    },

    toggleLanguage() {
      const next = this.getLanguage() === 'ar' ? 'en' : 'ar';
      this.setLanguage(next);
      return next;
    }
  };

  /* ============================================================
     SEARCH UTILS
     ============================================================ */

  const SearchUtils = {
    debounce(fn, delay = 250) {
      return Helpers.debounce(fn, delay);
    },

    filter(items, query, fields) {
      if (!query) return items;
      const q = String(query).toLocaleLowerCase().trim();
      if (!q) return items;

      return items.filter(item =>
        fields.some(field => {
          const value = this.getNested(item, field);
          return String(value || '').toLocaleLowerCase().includes(q);
        })
      );
    },

    getNested(obj, path) {
      return path.split('.').reduce((acc, key) => acc?.[key], obj);
    },

    highlight(text, query) {
      if (!query) return Helpers.escape(text);
      const escaped = Helpers.escape(text);
      const q = Helpers.escape(query);
      const regex = new RegExp(`(${q})`, 'gi');
      return escaped.replace(regex, '<mark>$1</mark>');
    }
  };

  /* ============================================================
     HAPTIC FEEDBACK
     ============================================================ */

  const Haptic = {
    supported() {
      return 'vibrate' in navigator;
    },

    tap() {
      this.vibrate(10);
    },

    success() {
      this.vibrate([10, 50, 10]);
    },

    error() {
      this.vibrate([20, 100, 20]);
    },

    warning() {
      this.vibrate([15, 80, 15]);
    },

    vibrate(pattern) {
      try {
        if (this.supported()) navigator.vibrate(pattern);
      } catch (e) {
        /* silent */
      }
    }
  };

  /* ============================================================
     PULL TO REFRESH
     ============================================================ */

  const PullToRefresh = {
    init(element, callback) {
      if (!element) return;

      let startY = 0;
      let pulling = false;
      let indicator = null;
      const threshold = 90;

      element.addEventListener('touchstart', e => {
        if (element.scrollTop > 0) return;
        startY = e.touches[0].clientY;
        pulling = true;
      }, { passive: true });

      element.addEventListener('touchmove', e => {
        if (!pulling) return;
        const delta = e.touches[0].clientY - startY;
        if (delta > 0 && element.scrollTop === 0) {
          const progress = Math.min(delta / threshold, 1);

          if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'ptr-indicator';
            indicator.innerHTML = `
              <div class="ptr-spinner" style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--gradient-primary);
                box-shadow: var(--shadow-glow-green);
                display: grid;
                place-items: center;
                color: white;
                font-size: 20px;
                transition: transform 0.2s;
              ">⚽</div>
            `;
            indicator.style.cssText = `
              position: fixed;
              top: 90px;
              inset-inline-start: 50%;
              transform: translateX(-50%) translateY(-80px);
              z-index: 100;
              transition: transform 0.25s var(--ease-out);
              pointer-events: none;
            `;
            document.body.appendChild(indicator);
          }

          indicator.style.transform = `translateX(-50%) translateY(${-80 + progress * 100}px) rotate(${progress * 360}deg)`;
          indicator.querySelector('.ptr-spinner').style.transform = `rotate(${progress * 360}deg)`;
        }
      }, { passive: true });

      element.addEventListener('touchend', async () => {
        if (!pulling) return;
        pulling = false;

        if (indicator) {
          const progress = indicator.querySelector('.ptr-spinner').style.transform;
          const rotation = parseFloat(progress.match(/-?[\d.]+/)?.[0] || 0);

          if (rotation > 200) {
            indicator.style.transform = 'translateX(-50%) translateY(20px)';
            indicator.querySelector('.ptr-spinner').style.animation = 'spin 0.8s linear infinite';

            try {
              await callback();
            } catch (e) {
              Toast.error('فشل التحديث');
            }

            setTimeout(() => {
              if (indicator) {
                indicator.remove();
                indicator = null;
              }
            }, 400);
          } else {
            indicator.style.transform = 'translateX(-50%) translateY(-80px)';
            setTimeout(() => {
              if (indicator) {
                indicator.remove();
                indicator = null;
              }
            }, 300);
          }
        }
      }, { passive: true });
    }
  };

  /* ============================================================
     BADGE HELPERS
     ============================================================ */

  const Badges = {
    team(team, large = false) {
      if (!team) return '';
      const color = team.colors?.primary || '#0b6e4f';
      const initials = Helpers.initials(team.shortName || team.name);
      const classes = `team-badge ${large ? 'large' : ''}`;
      return `<span class="${classes}" style="--team-color:${Helpers.escape(color)}">${Helpers.escape(initials)}</span>`;
    },

    avatar(name, photo = null) {
      if (photo) {
        return `<span class="avatar"><img src="${Helpers.escape(photo)}" alt="" loading="lazy" onerror="this.parentElement.textContent='${Helpers.escape(Helpers.initials(name))}'"></span>`;
      }
      return `<span class="avatar">${Helpers.escape(Helpers.initials(name))}</span>`;
    },

    status(status) {
      const labels = {
        finished: 'انتهت',
        upcoming: 'قادمة',
        live: 'مباشرة',
        postponed: 'مؤجلة'
      };
      return `<span class="status-pill status-${Helpers.escape(status)}">${labels[status] || status}</span>`;
    },

    pill(text, variant = 'green') {
      return `<span class="pill pill-${Helpers.escape(variant)}">${Helpers.escape(text)}</span>`;
    },

    rank(number) {
      return `<span class="rank-number">${number}</span>`;
    }
  };

  /* ============================================================
     BOTTOM NAV CONTROLLER
     ============================================================ */

  const BottomNav = {
    update(page) {
      const items = [...document.querySelectorAll('.nav-item')];
      const index = items.findIndex(x => x.dataset.page === page);

      items.forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
      });

      const indicator = document.getElementById('navIndicator');
      if (indicator && index >= 0) {
        const isRTL = document.documentElement.dir === 'rtl';
        const itemWidth = 100 / items.length;
        const offset = index * itemWidth;

        indicator.style.width = `${itemWidth}%`;

        if (isRTL) {
          indicator.style.transform = `translateX(-${offset * 100}%)`;
        } else {
          indicator.style.transform = `translateX(${offset * 100}%)`;
        }
      }
    }
  };

  /* ============================================================
     EXPORT
     ============================================================ */

  window.UI = {
    toast: Toast.show.bind(Toast),
    Toast,
    Modal,
    Skeletons,
    Animations,
    FormBuilder,
    ThemeManager,
    Theme: ThemeManager,
    SearchUtils,
    Haptic,
    PullToRefresh,
    Badges,
    BottomNav,

    escape: Helpers.escape,
    element: (html) => {
      const t = document.createElement('template');
      t.innerHTML = html.trim();
      return t.content;
    },
    initials: Helpers.initials,
    badge: Badges.team,
    status: Badges.status,
    haptic: Haptic.tap,
    applyTheme: ThemeManager.set.bind(ThemeManager),
    applyLanguage: ThemeManager.setLanguage.bind(ThemeManager),
    updateNav: BottomNav.update.bind(BottomNav),
    skeletons: Skeletons.list.bind(Skeletons),
    debounce: Helpers.debounce
  };

  window.Toast = Toast;
  window.Modal = Modal;

})(window);