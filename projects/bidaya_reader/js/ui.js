/* ============================================================
   ui.js — عناصر الواجهة (v2 — مُصلح)
   الإصلاحات:
   - applyFont: لم يعد يتعارض بين font-size و font-family
   - theme-color ديناميكي
   - Toast: تراكم + إغلاق تلقائي محسّن
   - Sidebar: دعم كلا المعرفين
   ============================================================ */
const UI = (() => {

  // ═══ Toast ═══
  const MAX_TOASTS = 4;

  function toast(msg, type = 'info', duration = 2600) {
    let c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      c.className = 'toast-container';
      document.body.appendChild(c);
    }

    // احذف الأقدم إذا تجاوزنا الحد
    while (c.children.length >= MAX_TOASTS) {
      c.firstElementChild?.remove();
    }

    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.textContent = msg;
    c.appendChild(t);

    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-30px)';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  // ═══ Theme ═══
  function applyTheme() {
    const pref = Store.get('theme');
    const dark = pref === 'dark' ||
      (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';

    // ✅ theme-color ديناميكي
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = dark ? '#0f172a' : '#ffffff';
  }

  /**
   * ✅ إصلاح: استخدام بادئات مميزة لكل نوع
   *   font-size-* / font-family-* / paper-*
   */
  function applyFont() {
    const fs = Store.get('fontSize');
    const ff = Store.get('fontFamily');
    const paper = Store.get('paper');

    const body = document.body;

    // ─── حجم الخط: استبدل الكلاس بأمان ───
    ['small', 'medium', 'large', 'xlarge'].forEach(x => {
      body.classList.remove('font-size-' + x);
    });
    body.classList.add('font-size-' + fs);

    // ─── نوع الخط ───
    ['naskh', 'amiri', 'cairo'].forEach(x => {
      body.classList.remove('font-family-' + x);
    });
    body.classList.add('font-family-' + ff);

    // ─── الورق ───
    ['white', 'cream', 'dark'].forEach(x => {
      body.classList.remove('paper-' + x);
    });
    body.classList.add('paper-' + paper);
  }

  function applyAll() {
    applyTheme();
    applyFont();
  }

  // ═══ Sidebar ═══
  function _sidebar() {
    return document.getElementById('sidebar') ||
           document.getElementById('tocSidebar');
  }
  function _overlay() {
    return document.getElementById('sidebarOverlay');
  }

  function openSidebar() {
    const s = _sidebar();
    const o = _overlay();
    if (s) s.classList.add('open');
    if (o) { o.classList.add('show'); o.setAttribute('aria-hidden', 'false'); }
    document.body.classList.add('sidebar-open');
  }

  function closeSidebar() {
    const s = _sidebar();
    const o = _overlay();
    if (s) s.classList.remove('open');
    if (o) { o.classList.remove('show'); o.setAttribute('aria-hidden', 'true'); }
    document.body.classList.remove('sidebar-open');
  }

  function toggleSidebar() {
    const s = _sidebar();
    if (s && s.classList.contains('open')) closeSidebar();
    else openSidebar();
  }

  // ═══ Search Modal ═══
  function openSearch() {
    document.getElementById('searchModal')?.classList.add('open');
    setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
  }

  function closeSearch() {
    document.getElementById('searchModal')?.classList.remove('open');
  }

  // ═══ Format date ═══
  function formatDate(iso) {
    try {
      const d = new Date(iso);
      const diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 60) return 'الآن';
      if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
      if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
      if (diff < 604800) return `قبل ${Math.floor(diff / 86400)} يوم`;
      return d.toLocaleDateString('ar-EG');
    } catch (_) { return ''; }
  }

  // ═══ Escape HTML ═══
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ═══ استمع لتغيير نظام الألوان ═══
  if (typeof matchMedia !== 'undefined') {
    try {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (Store.get('theme') === 'system') applyTheme();
      });
    } catch (_) {}
  }

  return {
    toast, applyTheme, applyFont, applyAll,
    openSidebar, closeSidebar, toggleSidebar,
    openSearch, closeSearch,
    formatDate, esc,
  };
})();