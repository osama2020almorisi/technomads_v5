/* =========================================================
   ui.js — Icons + Toast + Modal + Skeletons + Animations +
   FormBuilder + Theme + Search + Haptic + Badges + Tabs + DnD
   ========================================================= */
(function (global) {
  'use strict';

  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  /* ---------------------------------------------------------
     Icons (inline SVG, stroke-based)
     --------------------------------------------------------- */
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7 4.2 3-1.6 5h-5.2l-1.6-5z"/><path d="M12 7V3.2M16.2 10l3.6-1.3M14.6 15l2.3 3.3M9.4 15l-2.3 3.3M7.8 10 4.2 8.7"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    chart: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx="1"/><rect x="12" y="8" width="3" height="10" rx="1"/><rect x="17" y="5" width="3" height="13" rx="1"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6 6 0 0 1 3.5 5.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    whistle: '<circle cx="9" cy="14" r="6"/><path d="M13.5 10 21 6.5V11l-5.2 1.3"/><path d="M5 4l2 3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    pdf: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h1.5a1.5 1.5 0 0 1 0 3H8v-3zm0 3v2M13 13v5h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 7.8-1.2"/>',
    logout: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h12"/>',
    grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6.5-4-10-2 1.5-3 3.5-3 5.5C10.5 9 9.5 8 9 6.5 6.5 9 5 11.5 5 15c0 4.3 3 7 7 7z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    glove: '<path d="M8 21v-4.5L5.5 13a2 2 0 0 1 .3-2.8l.7-.5V5.5a1.5 1.5 0 0 1 3 0V10V4a1.5 1.5 0 0 1 3 0v6V4.5a1.5 1.5 0 0 1 3 0V10V6.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-2.5 5.4V21z"/>',
    card: '<rect x="6" y="3" width="12" height="18" rx="2"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    gavel: '<path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
    flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    filter: '<path d="M3 5h18l-7 8.5V20l-4-2v-4.5z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    crown: '<path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 12H5z"/>',
    vote: '<path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM7 11l4-8a2.5 2.5 0 0 1 2.5 2.5V9h5.6a2 2 0 0 1 2 2.3l-1.3 7.5a2 2 0 0 1-2 1.7H7"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    live: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
    stadium: '<ellipse cx="12" cy="8" rx="9" ry="3.5"/><path d="M3 8v8c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V8M8 11.2V19M16 11.2V19"/>',
    coach: '<circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M12 11v4"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    medal: '<circle cx="12" cy="15" r="6"/><path d="M8.5 10 6 2h4l2 5 2-5h4l-2.5 8"/><path d="M12 12.5v5"/>',
    fine: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8"/><path d="M3 3v5h5"/>',
    sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    backspace: '<path d="M21 5H8l-6 7 6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="m11 9 6 6M17 9l-6 6"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    wifiOff: '<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.1-1.6M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8A15 15 0 0 0 10.7 5M12 20h.01"/>',
    logo: '<path d="M12 2.5 4 5.5v6.2c0 4.7 3.4 8.6 8 9.8 4.6-1.2 8-5.1 8-9.8V5.5z"/><path d="m12 8 2.6 1.9-1 3.1h-3.2l-1-3.1z" fill="currentColor"/><path d="M12 8V5.6M14.6 9.9l2.3-.8M13.6 13l1.4 2M10.4 13 9 15M9.4 9.9l-2.3-.8"/>'
  };

  function icon(name, cls) {
    var path = P[name] || P.info;
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  /* ---------------------------------------------------------
     Haptic
     --------------------------------------------------------- */
  var Haptic = {
    tap: function (ms) {
      if (global.Core && global.Core.Prefs.get('haptics') === false) return;
      if (navigator.vibrate) {
        try { navigator.vibrate(ms || 10); } catch (e) { /* ignore */ }
      }
    },
    success: function () { Haptic.tap([12, 40, 12]); },
    error: function () { Haptic.tap([30, 50, 30]); },
    heavy: function () { Haptic.tap(25); }
  };

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  var Toast = {
    region: function () {
      var r = document.getElementById('toast-region');
      if (!r) {
        r = document.createElement('div');
        r.id = 'toast-region';
        r.className = 'toast-region';
        r.setAttribute('aria-live', 'polite');
        document.body.appendChild(r);
      }
      return r;
    },
    show: function (msg, type, opts) {
      opts = opts || {};
      type = type || 'info';
      var map = { success: 'check', error: 'alert', warning: 'alert', info: 'info' };
      var el = document.createElement('div');
      el.className = 'toast ' + type;
      el.setAttribute('role', type === 'error' ? 'alert' : 'status');
      el.innerHTML = '<span class="t-icon">' + icon(map[type] || 'info') + '</span><span class="t-msg">' + H.esc(msg) + '</span>' +
        (opts.action ? '<button class="t-action" type="button">' + H.esc(opts.action) + '</button>' : '');
      Toast.region().appendChild(el);
      if (type === 'error') Haptic.error();
      else if (type === 'success') Haptic.tap(12);
      var remove = function () {
        if (!el.parentNode) return;
        el.classList.add('leaving');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
      };
      if (opts.action && opts.onAction) {
        el.querySelector('.t-action').addEventListener('click', function () { opts.onAction(); remove(); });
      }
      el.addEventListener('click', function (e) { if (!e.target.closest('.t-action')) remove(); });
      setTimeout(remove, opts.duration || 3200);
      var all = Toast.region().querySelectorAll('.toast:not(.leaving)');
      if (all.length > 3) all[0].remove();
      return el;
    },
    success: function (m, o) { return Toast.show(m, 'success', o); },
    error: function (m, o) { return Toast.show(m, 'error', o); },
    warning: function (m, o) { return Toast.show(m, 'warning', o); },
    info: function (m, o) { return Toast.show(m, 'info', o); }
  };

  /* ---------------------------------------------------------
     Modal + Confirm
     --------------------------------------------------------- */
  var openModals = [];
  var Modal = {
    root: function () {
      var r = document.getElementById('modal-root');
      if (!r) {
        r = document.createElement('div');
        r.id = 'modal-root';
        r.className = 'modal-root';
        document.body.appendChild(r);
      }
      return r;
    },
    open: function (opts) {
      opts = opts || {};
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true" aria-label="' + H.esc(opts.title || '') + '">' +
        '<div class="modal-grip"></div>' +
        (opts.title !== false ? '<div class="modal-head"><h2 class="modal-title">' + H.esc(opts.title || '') + '</h2>' +
          '<button class="icon-btn" type="button" data-close aria-label="' + t('close') + '">' + icon('x') + '</button></div>' : '') +
        '<div class="modal-body"></div>' +
        (opts.footer ? '<div class="modal-foot"></div>' : '') +
        '</div>';
      var body = overlay.querySelector('.modal-body');
      if (typeof opts.content === 'string') body.innerHTML = opts.content;
      else if (opts.content instanceof Node) body.appendChild(opts.content);
      if (opts.footer) {
        var foot = overlay.querySelector('.modal-foot');
        if (typeof opts.footer === 'string') foot.innerHTML = opts.footer;
        else if (opts.footer instanceof Node) foot.appendChild(opts.footer);
      }
      if (opts.wide) overlay.querySelector('.modal').style.maxWidth = '720px';
      Modal.root().appendChild(overlay);
      document.body.style.overflow = 'hidden';
      var api = {
        el: overlay,
        body: body,
        close: function (result) {
          if (!overlay.parentNode) return;
          overlay.classList.add('leaving');
          var i = openModals.indexOf(api);
          if (i !== -1) openModals.splice(i, 1);
          setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (!openModals.length) document.body.style.overflow = '';
          }, 230);
          if (opts.onClose) opts.onClose(result);
        }
      };
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay && opts.dismissible !== false) api.close();
        if (e.target.closest('[data-close]')) api.close();
      });
      openModals.push(api);
      Haptic.tap(8);
      setTimeout(function () {
        var f = overlay.querySelector('[autofocus], .modal-body input:not([type="hidden"]), .modal-body select');
        if (f && opts.autofocus !== false && window.matchMedia('(hover: hover)').matches) f.focus();
      }, 60);
      if (opts.onOpen) opts.onOpen(api);
      return api;
    },
    closeTop: function () {
      if (openModals.length) openModals[openModals.length - 1].close();
    },
    confirm: function (opts) {
      opts = opts || {};
      return new Promise(function (resolve) {
        var footer = document.createElement('div');
        footer.style.display = 'contents';
        footer.innerHTML = '<button type="button" class="btn btn-secondary" data-act="no">' + H.esc(opts.cancelText || t('cancel')) + '</button>' +
          '<button type="button" class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" data-act="yes">' + H.esc(opts.okText || t('confirm')) + '</button>';
        var resolved = false;
        var m = Modal.open({
          title: false,
          content: '<div class="confirm-icon ' + (opts.danger ? 'danger' : 'primary') + '" style="margin-top:20px">' + icon(opts.icon || (opts.danger ? 'alert' : 'info')) + '</div>' +
            '<div class="confirm-title">' + H.esc(opts.title || t('confirm')) + '</div>' +
            '<p class="confirm-text">' + H.esc(opts.message || '') + '</p>' +
            (opts.typeToConfirm ? '<div class="field mt-4"><input class="input text-center" data-confirm-input autocomplete="off" placeholder="' + H.esc(opts.typeToConfirm) + '"></div>' : ''),
          footer: footer,
          onClose: function () { if (!resolved) { resolved = true; resolve(false); } }
        });
        var yes = footer.querySelector('[data-act="yes"]');
        var input = m.el.querySelector('[data-confirm-input]');
        if (input) {
          yes.disabled = true;
          input.addEventListener('input', function () {
            yes.disabled = input.value.trim() !== opts.typeToConfirm;
          });
        }
        footer.querySelector('[data-act="no"]').addEventListener('click', function () { resolved = true; resolve(false); m.close(); });
        yes.addEventListener('click', function () { resolved = true; Haptic.heavy(); resolve(true); m.close(); });
      });
    },
    doubleConfirm: function (opts) {
      return Modal.confirm({
        title: opts.title || t('confirmDelete'), message: opts.message || '', danger: true, okText: t('delete'), icon: 'trash'
      }).then(function (ok) {
        if (!ok) return false;
        return new Promise(function (r) { setTimeout(r, 260); }).then(function () {
          return Modal.confirm({
            title: t('confirmDelete2'), message: opts.secondMessage || '', danger: true, okText: t('delete'),
            icon: 'alert', typeToConfirm: t('typeDelete')
          });
        });
      });
    },
    prompt: function (opts) {
      return new Promise(function (resolve) {
        var footer = document.createElement('div');
        footer.style.display = 'contents';
        footer.innerHTML = '<button type="button" class="btn btn-secondary" data-act="no">' + t('cancel') + '</button><button type="button" class="btn btn-primary" data-act="yes">' + H.esc(opts.okText || t('save')) + '</button>';
        var done = false;
        var m = Modal.open({
          title: opts.title,
          content: '<div class="field"><label class="field-label">' + H.esc(opts.label || '') + '</label><input class="input" data-prompt type="' + (opts.type || 'text') + '" value="' + H.esc(opts.value || '') + '" ' + (opts.inputmode ? 'inputmode="' + opts.inputmode + '"' : '') + '></div>',
          footer: footer,
          onClose: function () { if (!done) { done = true; resolve(null); } }
        });
        var input = m.el.querySelector('[data-prompt]');
        footer.querySelector('[data-act="no"]').addEventListener('click', function () { done = true; resolve(null); m.close(); });
        footer.querySelector('[data-act="yes"]').addEventListener('click', function () { done = true; resolve(input.value); m.close(); });
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { done = true; resolve(input.value); m.close(); } });
      });
    }
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') Modal.closeTop(); });

  /* ---------------------------------------------------------
     Skeletons
     --------------------------------------------------------- */
  var Skeleton = {
    lines: function (n) {
      var out = '';
      for (var i = 0; i < n; i++) {
        out += '<div class="list-item"><div class="skeleton sk-circle"></div><div class="li-main stack-2"><div class="skeleton sk-line w-60"></div><div class="skeleton sk-line w-40"></div></div></div>';
      }
      return '<div class="card">' + out + '</div>';
    },
    cards: function (n, h) {
      var out = '';
      for (var i = 0; i < n; i++) out += '<div class="skeleton sk-card" style="height:' + (h || 120) + 'px"></div>';
      return out;
    },
    hero: function () { return '<div class="skeleton sk-hero"></div>'; },
    page: function () {
      return '<div class="stack-4">' + Skeleton.hero() + '<div class="grid-3">' + Skeleton.cards(3, 86) + '</div>' + Skeleton.lines(4) + '</div>';
    }
  };

  /* ---------------------------------------------------------
     Animations
     --------------------------------------------------------- */
  var Anim = {
    countUp: function (el, to, dur) {
      if (!el) return;
      var from = 0;
      var target = Number(to) || 0;
      var start = null;
      dur = dur || 900;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = target; return; }
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var v = from + (target - from) * eased;
        el.textContent = (target % 1 !== 0) ? v.toFixed(1) : Math.round(v);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    },
    countAll: function (root) {
      (root || document).querySelectorAll('[data-count]').forEach(function (el) {
        Anim.countUp(el, el.getAttribute('data-count'));
      });
    },
    _io: null,
    reveal: function (root) {
      if (!('IntersectionObserver' in window)) return;
      document.documentElement.classList.add('reveal-ready');
      if (!Anim._io) {
        Anim._io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add('revealed');
              Anim._io.unobserve(en.target);
            }
          });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      }
      (root || document).querySelectorAll('[data-reveal]:not(.revealed)').forEach(function (el) { Anim._io.observe(el); });
      setTimeout(function () {
        (root || document).querySelectorAll('[data-reveal]:not(.revealed)').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) el.classList.add('revealed');
        });
      }, 1200);
    },
    bars: function (root) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          (root || document).querySelectorAll('[data-width]').forEach(function (el) {
            el.style.width = el.getAttribute('data-width') + '%';
          });
        });
      });
    },
    ripple: function (e, el) {
      var r = el.getBoundingClientRect();
      var s = document.createElement('span');
      var size = Math.max(r.width, r.height);
      s.className = 'ripple';
      s.style.width = s.style.height = size + 'px';
      s.style.left = (e.clientX - r.left - size / 2) + 'px';
      s.style.top = (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(s);
      setTimeout(function () { s.remove(); }, 620);
    },
    bump: function (el) {
      if (!el) return;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    }
  };

  /* ---------------------------------------------------------
     Theme
     --------------------------------------------------------- */
  var Theme = {
    current: function () {
      var pref = global.Core.Prefs.get('theme');
      if (pref === 'dark' || pref === 'light') return pref;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    apply: function () {
      var th = Theme.current();
      document.documentElement.setAttribute('data-theme', th);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', th === 'dark' ? '#0A0E13' : '#0B6E4F');
      document.querySelectorAll('[data-theme-icon]').forEach(function (el) {
        el.innerHTML = icon(th === 'dark' ? 'sun' : 'moon');
      });
      return th;
    },
    set: function (th) {
      global.Core.Prefs.set('theme', th);
      Theme.apply();
    },
    toggle: function () {
      var next = Theme.current() === 'dark' ? 'light' : 'dark';
      Theme.set(next);
      Haptic.tap(10);
      return next;
    }
  };
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onMq = function () { if (global.Core && global.Core.Prefs.get('theme') === 'auto') Theme.apply(); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
  }

  /* ---------------------------------------------------------
     Search (debounced, diacritic-insensitive)
     --------------------------------------------------------- */
  var Search = {
    normalize: function (s) {
      return String(s || '').toLowerCase()
        .replace(/[\u064B-\u0652\u0640]/g, '')
        .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
        .trim();
    },
    match: function (query, fields) {
      var q = Search.normalize(query);
      if (!q) return true;
      return fields.some(function (f) { return Search.normalize(f).indexOf(q) !== -1; });
    },
    bind: function (input, onChange, wait) {
      var handler = H.debounce(function () { onChange(input.value); }, wait || 220);
      input.addEventListener('input', handler);
      var wrap = input.closest('.input-group');
      if (wrap) {
        var clear = wrap.querySelector('.input-clear');
        if (clear) {
          var sync = function () { clear.style.visibility = input.value ? 'visible' : 'hidden'; };
          input.addEventListener('input', sync);
          sync();
          clear.addEventListener('click', function () { input.value = ''; sync(); onChange(''); input.focus(); });
        }
      }
    },
    box: function (placeholderKey, id) {
      return '<div class="input-group"><span class="input-icon">' + icon('search') + '</span>' +
        '<input class="input" type="search" id="' + (id || 'search') + '" placeholder="' + H.esc(t(placeholderKey || 'search')) + '" autocomplete="off" enterkeyhint="search">' +
        '<button class="icon-btn input-clear" type="button" aria-label="' + t('close') + '" style="width:34px;height:34px;visibility:hidden">' + icon('x') + '</button></div>';
    }
  };

  /* ---------------------------------------------------------
     Badges / Visual atoms
     --------------------------------------------------------- */
  function contrastText(hex) {
    var h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(h.substr(0, 2), 16);
    var g = parseInt(h.substr(2, 2), 16);
    var b = parseInt(h.substr(4, 2), 16);
    var yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#0A0E13' : '#FFFFFF';
  }

  var Badges = {
    contrast: contrastText,
    crest: function (team, size) {
      size = size || '';
      if (!team) return '<span class="crest ' + (size ? 'crest-' + size : '') + '"></span>';
      var cls = 'crest' + (size ? ' crest-' + size : '');
      if (team.logo) {
        return '<span class="' + cls + '"><img src="' + H.esc(team.logo) + '" alt="' + H.esc(team.name) + '" loading="lazy" decoding="async" onerror="this.parentNode.innerHTML=UI.Badges.crestSvg(UI.Badges._find(\'' + H.esc(team.id) + '\'))"></span>';
      }
      return '<span class="' + cls + '" aria-label="' + H.esc(I18n.name(team)) + '">' + Badges.crestSvg(team) + '</span>';
    },
    _find: function (id) { return global.Core.Teams.get(id); },
    crestSvg: function (team) {
      if (!team) return '';
      var c1 = (team.colors && team.colors.primary) || '#0B6E4F';
      var c2 = (team.colors && team.colors.secondary) || '#FFFFFF';
      var txt = contrastText(c1);
      var label = (I18n.short(team) || team.name || '?');
      var ini = /^[A-Z]{2,4}$/.test(team.shortNameEn || '') && I18n.lang === 'en' ? team.shortNameEn.slice(0, 3) : H.initials(team.nameEn || label).slice(0, 2);
      if (I18n.lang === 'ar') ini = String(team.shortName || team.name).replace(/^ال/, '').slice(0, 2);
      var variant = H.hashNum(team.id) % 3;
      var gid = 'g' + team.id.replace(/[^a-z0-9]/gi, '');
      var stripe = '';
      if (variant === 0) stripe = '<path d="M32 4v56" stroke="' + c2 + '" stroke-width="7" opacity="0.9"/>';
      else if (variant === 1) stripe = '<path d="M6 22h52" stroke="' + c2 + '" stroke-width="6" opacity="0.85"/>';
      else stripe = '<path d="M10 8 54 52" stroke="' + c2 + '" stroke-width="7" opacity="0.85"/>';
      return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0.78"/></linearGradient>' +
        '<clipPath id="c' + gid + '"><path d="M32 3 7 11v19c0 15.5 10.6 26.7 25 31 14.4-4.3 25-15.5 25-31V11z"/></clipPath></defs>' +
        '<path d="M32 3 7 11v19c0 15.5 10.6 26.7 25 31 14.4-4.3 25-15.5 25-31V11z" fill="url(#' + gid + ')"/>' +
        '<g clip-path="url(#c' + gid + ')">' + stripe + '</g>' +
        '<path d="M32 3 7 11v19c0 15.5 10.6 26.7 25 31 14.4-4.3 25-15.5 25-31V11z" fill="none" stroke="' + c2 + '" stroke-width="2.4" opacity="0.95"/>' +
        '<circle cx="32" cy="33" r="13" fill="' + c1 + '" stroke="' + c2 + '" stroke-width="2"/>' +
        '<text x="32" y="38.5" text-anchor="middle" font-family="Cairo, Tajawal, sans-serif" font-weight="900" font-size="' + (ini.length > 2 ? 10 : 14) + '" fill="' + txt + '">' + H.esc(ini) + '</text></svg>';
    },
    avatar: function (player, size, opts) {
      opts = opts || {};
      var name = player ? I18n.name(player) : '?';
      var team = player ? global.Core.Teams.get(player.teamId) : null;
      var bg = team && team.colors ? team.colors.primary : H.hashColor(name);
      var fg = team && team.colors ? contrastText(team.colors.primary) : '#fff';
      var ini = H.initials(name);
      var img = player && player.photo ? '<img src="' + H.esc(player.photo) + '" alt="" loading="lazy" decoding="async" onload="this.classList.add(\'loaded\')" onerror="this.remove()">' : '';
      return '<span class="avatar ' + (size ? 'avatar-' + size : '') + '" style="--avatar-bg:' + bg + ';color:' + fg + '">' + H.esc(ini) + img +
        (opts.number && player ? '<span class="num-tag">' + H.esc(player.number) + '</span>' : '') + '</span>';
    },
    pos: function (pos) {
      return '<span class="pos-badge pos-' + H.esc(pos) + '">' + H.esc(t(pos + 's')) + '</span>';
    },
    form: function (form, small) {
      var out = '';
      var arr = (form || []).slice(-5);
      var labels = I18n.lang === 'ar' ? { W: 'ف', D: 'ت', L: 'خ' } : { W: 'W', D: 'D', L: 'L' };
      for (var i = 0; i < 5 - arr.length; i++) out += '<span class="form-dot blank' + (small ? ' sm' : '') + '"></span>';
      arr.forEach(function (f) {
        out += '<span class="form-dot ' + f.r + (small ? ' sm' : '') + '" title="' + f.r + '">' + (small ? '' : labels[f.r]) + '</span>';
      });
      return '<span class="form-dots">' + out + '</span>';
    },
    status: function (m) {
      if (m.status === 'live') {
        var min = global.Core.liveMinute(m);
        return '<span class="badge badge-live">' + (min === 'HT' ? t('ht') : (t('live') + ' ' + min + "'")) + '</span>';
      }
      if (m.status === 'finished') return '<span class="badge">' + t('finished') + '</span>';
      if (m.status === 'postponed') return '<span class="badge badge-warning">' + t('postponed') + '</span>';
      return '<span class="badge badge-primary">' + t('scheduled') + '</span>';
    },
    rating: function (v) {
      var cls = v >= 8.5 ? 'top' : v >= 7 ? '' : v >= 6 ? 'mid' : 'low';
      return '<span class="rating-pill ' + cls + '">' + Number(v).toFixed(1) + '</span>';
    },
    cardIcon: function (type) {
      var c = type === 'yellow' ? 'yellow' : type === 'secondYellow' ? 'second' : 'red';
      return '<span class="card-icon ' + c + '"></span>';
    },
    zoneColor: function (zone) {
      if (zone === 'champions') return 'var(--zone-champions)';
      if (zone === 'europa') return 'var(--zone-europa)';
      if (zone === 'relegation') return 'var(--zone-relegation)';
      return 'transparent';
    },
    eventIcon: function (type) {
      if (type === 'goal' || type === 'penalty') return '<span class="tl-ic" style="color:var(--brand-primary)">' + icon('ball') + '</span>';
      if (type === 'owngoal') return '<span class="tl-ic" style="color:var(--danger)">' + icon('ball') + '</span>';
      if (type === 'yellow') return '<span class="tl-ic">' + '<span class="card-icon yellow"></span>' + '</span>';
      if (type === 'red') return '<span class="tl-ic">' + '<span class="card-icon red"></span>' + '</span>';
      if (type === 'sub') return '<span class="tl-ic" style="color:var(--info)">' + icon('swap') + '</span>';
      return '<span class="tl-ic">' + icon('info') + '</span>';
    }
  };

  /* ---------------------------------------------------------
     Match card / row renderers (shared across pages)
     --------------------------------------------------------- */
  var Render = {
    matchCard: function (m, opts) {
      opts = opts || {};
      var C = global.Core;
      var h = C.Teams.get(m.homeTeamId);
      var a = C.Teams.get(m.awayTeamId);
      var played = m.status === 'finished' || m.status === 'live';
      var hw = played && m.score.home > m.score.away;
      var aw = played && m.score.away > m.score.home;
      var center;
      if (played) {
        center = '<div class="match-score num"><span>' + m.score.home + '</span><span class="sep">-</span><span>' + m.score.away + '</span></div>';
      } else {
        center = '<div class="match-time num">' + H.fmtTime(m.date) + '</div>';
      }
      var statusLine = m.status === 'live' ? '<span class="match-status live">' + (C.liveMinute(m) === 'HT' ? t('ht') : C.liveMinute(m) + "'") + '</span>' :
        m.status === 'finished' ? '<span class="match-status">' + t('ft') + '</span>' :
        '<span class="match-status">' + H.fmtDate(m.date, { day: 'numeric', month: 'short' }) + '</span>';
      return '<a class="match-card ' + (m.status === 'live' ? 'is-live ' : '') + (opts.compact ? 'match-card-compact' : '') + '" href="match-live.html?id=' + encodeURIComponent(m.id) + '">' +
        '<div class="match-meta"><span class="row-1 truncate">' + icon('calendar') + '<span class="truncate">' + t('round') + ' ' + m.round + ' · ' + H.esc(H.fmtDate(m.date)) + '</span></span>' + Badges.status(m) + '</div>' +
        '<div class="match-body">' +
        '<div class="match-team ' + (hw ? 'winner' : aw ? 'loser' : '') + '">' + Badges.crest(h, 'lg') + '<span class="match-team-name">' + H.esc(I18n.short(h)) + '</span></div>' +
        '<div class="match-center">' + center + statusLine + '</div>' +
        '<div class="match-team ' + (aw ? 'winner' : hw ? 'loser' : '') + '">' + Badges.crest(a, 'lg') + '<span class="match-team-name">' + H.esc(I18n.short(a)) + '</span></div>' +
        '</div>' +
        (opts.showVenue ? '<div class="match-meta" style="margin:12px 0 0;justify-content:center"><span class="row-1 truncate">' + icon('pin') + '<span class="truncate">' + H.esc(m.stadium || '—') + '</span></span></div>' : '') +
        '</a>';
    },
    matchRow: function (m, perspectiveTeamId) {
      var C = global.Core;
      var h = C.Teams.get(m.homeTeamId);
      var a = C.Teams.get(m.awayTeamId);
      var played = m.status === 'finished' || m.status === 'live';
      var mid = played ? (m.score.home + ' - ' + m.score.away) : H.fmtTime(m.date);
      var tag = '';
      if (perspectiveTeamId && m.status === 'finished') {
        var isHome = m.homeTeamId === perspectiveTeamId;
        var f = isHome ? m.score.home : m.score.away;
        var ag = isHome ? m.score.away : m.score.home;
        var r = f > ag ? 'W' : f < ag ? 'L' : 'D';
        var lab = I18n.lang === 'ar' ? { W: 'ف', D: 'ت', L: 'خ' }[r] : r;
        tag = '<span class="result-tag ' + r + '">' + lab + '</span>';
      }
      return '<a class="match-row" href="match-live.html?id=' + encodeURIComponent(m.id) + '">' +
        '<span class="side">' + Badges.crest(h, 'sm') + '<span class="truncate">' + H.esc(I18n.short(h)) + '</span></span>' +
        '<span class="stack-1" style="align-items:center"><span class="row-1">' + tag + '<span class="mid ' + (m.status === 'live' ? 'live' : '') + '">' + mid + '</span></span><span class="text-xs text-muted nowrap">' + H.esc(H.fmtDate(m.date, { day: 'numeric', month: 'short' })) + '</span></span>' +
        '<span class="side away">' + Badges.crest(a, 'sm') + '<span class="truncate">' + H.esc(I18n.short(a)) + '</span></span>' +
        '</a>';
    },
    empty: function (iconName, title, sub) {
      return '<div class="empty"><div class="empty-icon">' + icon(iconName || 'info') + '</div><div class="empty-title">' + H.esc(title || t('empty')) + '</div>' + (sub ? '<p class="text-sm">' + H.esc(sub) + '</p>' : '') + '</div>';
    },
    sectionHead: function (title, link, linkText) {
      return '<div class="section-head"><h2 class="section-title">' + H.esc(title) + '</h2>' +
        (link ? '<a class="section-link" href="' + link + '">' + H.esc(linkText || t('viewAll')) + icon('chevron', 'chev') + '</a>' : '') + '</div>';
    }
  };

  /* ---------------------------------------------------------
     Tabs (segmented with sliding indicator)
     --------------------------------------------------------- */
  var Tabs = {
    render: function (items, active, id) {
      var out = '<div class="tabs" role="tablist" id="' + (id || 'tabs') + '"><span class="tab-indicator"></span>';
      items.forEach(function (it) {
        out += '<button class="tab ' + (it.key === active ? 'active' : '') + '" role="tab" type="button" data-tab="' + it.key + '" aria-selected="' + (it.key === active) + '">' +
          (it.icon ? icon(it.icon) : '') + '<span>' + H.esc(it.label) + '</span></button>';
      });
      return out + '</div>';
    },
    bind: function (container, onChange) {
      var ind = container.querySelector('.tab-indicator');
      function move() {
        var act = container.querySelector('.tab.active');
        if (!act || !ind) return;
        ind.style.width = act.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + (act.offsetLeft - 4) + 'px)';
        ind.style.left = '4px';
        ind.style.right = 'auto';
      }
      container.addEventListener('click', function (e) {
        var b = e.target.closest('.tab');
        if (!b) return;
        container.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
        b.classList.add('active');
        b.setAttribute('aria-selected', 'true');
        move();
        Haptic.tap(8);
        if (b.scrollIntoView && container.classList.contains('tabs-scroll')) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        onChange(b.getAttribute('data-tab'));
      });
      window.addEventListener('resize', move);
      requestAnimationFrame(move);
      setTimeout(move, 300);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(move);
      return { move: move };
    }
  };

  /* ---------------------------------------------------------
     FormBuilder
     --------------------------------------------------------- */
  var FormBuilder = {
    /* schema: [{ name, label, type: text|number|select|color|date|datetime|textarea|switch|file, required, options:[{value,label}], span, hint, min, max, placeholder }] */
    build: function (schema, values, opts) {
      opts = opts || {};
      values = values || {};
      var form = document.createElement('form');
      form.className = 'form-grid';
      form.noValidate = true;
      schema.forEach(function (f) {
        var v = FormBuilder._get(values, f.name);
        if (v === undefined || v === null) v = f.default !== undefined ? f.default : '';
        var wrap = document.createElement('div');
        wrap.className = 'field' + (f.span === 2 || f.type === 'textarea' ? ' span-2' : '');
        var id = 'f_' + f.name.replace(/\./g, '_') + '_' + Math.random().toString(36).slice(2, 6);
        var label = '<label class="field-label" for="' + id + '">' + H.esc(f.label) + (f.required ? '<span class="req">*</span>' : '') + '</label>';
        var input = '';
        var common = 'id="' + id + '" name="' + f.name + '" ' + (f.required ? 'required ' : '') + (f.placeholder ? 'placeholder="' + H.esc(f.placeholder) + '" ' : '');
        switch (f.type) {
          case 'select':
            input = '<select class="select" ' + common + '>' + (f.options || []).map(function (o) {
              return '<option value="' + H.esc(o.value) + '"' + (String(o.value) === String(v) ? ' selected' : '') + '>' + H.esc(o.label) + '</option>';
            }).join('') + '</select>';
            break;
          case 'textarea':
            input = '<textarea class="textarea" ' + common + '>' + H.esc(v) + '</textarea>';
            break;
          case 'number':
            input = '<input class="input num" type="number" inputmode="numeric" ' + common + (f.min !== undefined ? 'min="' + f.min + '" ' : '') + (f.max !== undefined ? 'max="' + f.max + '" ' : '') + (f.step ? 'step="' + f.step + '" ' : '') + 'value="' + H.esc(v) + '">';
            break;
          case 'color':
            input = '<input class="input" type="color" ' + common + 'value="' + H.esc(v || '#0B6E4F') + '">';
            break;
          case 'date':
            input = '<input class="input" type="date" ' + common + 'value="' + H.esc(v ? String(v).slice(0, 10) : '') + '">';
            break;
          case 'datetime':
            input = '<input class="input" type="datetime-local" ' + common + 'value="' + H.esc(H.toLocalInput(v)) + '">';
            break;
          case 'switch':
            input = '<label class="row-3"><span class="switch"><input type="checkbox" ' + common + (v ? 'checked' : '') + '><span class="track"></span><span class="thumb"></span></span><span class="text-sm text-muted">' + H.esc(f.hint || '') + '</span></label>';
            break;
          case 'file':
            input = '<input class="input" type="file" accept="' + (f.accept || 'image/*') + '" ' + common.replace('required ', '') + ' style="padding:10px">' +
              '<input type="hidden" name="' + f.name + '__current" value="' + H.esc(v) + '">';
            break;
          default:
            input = '<input class="input" type="' + (f.type || 'text') + '" ' + common + 'value="' + H.esc(v) + '">';
        }
        wrap.innerHTML = label + input + (f.hint && f.type !== 'switch' ? '<span class="field-hint">' + H.esc(f.hint) + '</span>' : '') + '<span class="field-error hidden"></span>';
        form.appendChild(wrap);
      });
      if (opts.submitText) {
        var actions = document.createElement('div');
        actions.className = 'form-actions span-2';
        actions.innerHTML = (opts.cancel ? '<button type="button" class="btn btn-secondary" data-close>' + t('cancel') + '</button>' : '') +
          '<button type="submit" class="btn btn-primary">' + icon('check') + H.esc(opts.submitText) + '</button>';
        form.appendChild(actions);
      }
      form._schema = schema;
      return form;
    },
    _get: function (obj, path) {
      return path.split('.').reduce(function (o, k) { return o === undefined || o === null ? undefined : o[k]; }, obj);
    },
    _set: function (obj, path, val) {
      var keys = path.split('.');
      var o = obj;
      for (var i = 0; i < keys.length - 1; i++) {
        if (!o[keys[i]] || typeof o[keys[i]] !== 'object') o[keys[i]] = {};
        o = o[keys[i]];
      }
      o[keys[keys.length - 1]] = val;
    },
    values: function (form) {
      var out = {};
      var promises = [];
      form._schema.forEach(function (f) {
        var el = form.elements[f.name];
        if (!el) return;
        var v;
        if (f.type === 'switch') v = el.checked;
        else if (f.type === 'number') v = el.value === '' ? null : Number(el.value);
        else if (f.type === 'datetime') v = el.value ? el.value + ':00' : '';
        else if (f.type === 'file') {
          var cur = form.elements[f.name + '__current'] ? form.elements[f.name + '__current'].value : '';
          FormBuilder._set(out, f.name, cur);
          if (el.files && el.files[0]) {
            promises.push(H.readFileAsDataURL(el.files[0]).then(function (data) { FormBuilder._set(out, f.name, data); }));
          }
          return;
        } else v = el.value.trim();
        FormBuilder._set(out, f.name, v);
      });
      return Promise.all(promises).then(function () { return out; });
    },
    validate: function (form, extra) {
      var ok = true;
      form.querySelectorAll('.field-error').forEach(function (e) { e.classList.add('hidden'); e.textContent = ''; });
      form.querySelectorAll('.invalid').forEach(function (e) { e.classList.remove('invalid'); });
      form._schema.forEach(function (f) {
        var el = form.elements[f.name];
        if (!el || f.type === 'switch' || f.type === 'file') return;
        var msg = '';
        if (f.required && !String(el.value).trim()) msg = t('fillRequired');
        else if (f.type === 'number' && el.value !== '') {
          var n = Number(el.value);
          if (f.min !== undefined && n < f.min) msg = '≥ ' + f.min;
          if (f.max !== undefined && n > f.max) msg = '≤ ' + f.max;
        }
        if (!msg && f.validate) msg = f.validate(el.value, form) || '';
        if (msg) {
          ok = false;
          el.classList.add('invalid');
          var er = el.closest('.field').querySelector('.field-error');
          er.textContent = msg;
          er.classList.remove('hidden');
        }
      });
      if (ok && extra) {
        var e = extra(form);
        if (e) { ok = false; Toast.error(e); }
      }
      if (!ok) {
        Haptic.error();
        form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      }
      return ok;
    },
    modal: function (opts) {
      return new Promise(function (resolve) {
        var form = FormBuilder.build(opts.schema, opts.values, { submitText: opts.submitText || t('save'), cancel: true });
        var done = false;
        var m = Modal.open({
          title: opts.title, content: form, wide: opts.wide,
          onClose: function () { if (!done) { done = true; resolve(null); } }
        });
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          if (!FormBuilder.validate(form, opts.validate)) return;
          FormBuilder.values(form).then(function (vals) {
            done = true;
            resolve(vals);
            m.close();
          });
        });
      });
    }
  };

  /* ---------------------------------------------------------
     Drag & Drop sortable list (pointer events: mouse + touch)
     --------------------------------------------------------- */
  var DnD = {
    sortable: function (list, onChange) {
      var dragging = null;
      var startY = 0;
      var placeholderIndex = -1;
      list.addEventListener('pointerdown', function (e) {
        var item = e.target.closest('.dnd-item');
        if (!item || item.classList.contains('locked')) return;
        if (e.target.closest('button, input, select')) return;
        e.preventDefault();
        dragging = item;
        startY = e.clientY;
        item.classList.add('dragging');
        item.setPointerCapture(e.pointerId);
        Haptic.tap(15);
      });
      list.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dy = e.clientY - startY;
        dragging.style.transform = 'translateY(' + dy + 'px) scale(1.03)';
        var items = Array.prototype.slice.call(list.querySelectorAll('.dnd-item'));
        items.forEach(function (it) { it.classList.remove('drop-target'); });
        var target = items.find(function (it) {
          if (it === dragging || it.classList.contains('locked')) return false;
          var r = it.getBoundingClientRect();
          return e.clientY > r.top && e.clientY < r.bottom;
        });
        if (target) {
          target.classList.add('drop-target');
          placeholderIndex = items.indexOf(target);
        }
      });
      function end() {
        if (!dragging) return;
        var items = Array.prototype.slice.call(list.querySelectorAll('.dnd-item'));
        items.forEach(function (it) { it.classList.remove('drop-target'); });
        var from = items.indexOf(dragging);
        dragging.classList.remove('dragging');
        dragging.style.transform = '';
        if (placeholderIndex !== -1 && placeholderIndex !== from) {
          var target = items[placeholderIndex];
          if (placeholderIndex > from) target.after(dragging);
          else target.before(dragging);
          Haptic.tap(10);
          var order = Array.prototype.slice.call(list.querySelectorAll('.dnd-item')).map(function (it) { return it.getAttribute('data-key'); });
          if (onChange) onChange(order);
        }
        dragging = null;
        placeholderIndex = -1;
      }
      list.addEventListener('pointerup', end);
      list.addEventListener('pointercancel', end);
      list.addEventListener('keydown', function (e) {
        var item = e.target.closest('.dnd-item');
        if (!item || item.classList.contains('locked')) return;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          var sib = e.key === 'ArrowUp' ? item.previousElementSibling : item.nextElementSibling;
          if (!sib || sib.classList.contains('locked')) return;
          if (e.key === 'ArrowUp') sib.before(item); else sib.after(item);
          item.focus();
          var order = Array.prototype.slice.call(list.querySelectorAll('.dnd-item')).map(function (it) { return it.getAttribute('data-key'); });
          if (onChange) onChange(order);
        }
      });
    }
  };

  /* =========================================================
     FX — 3D & creative effects (pure JS / Canvas / CSS 3D)
     ========================================================= */
  var FX = (function () {
    var L = function (ar, en) { return I18n.lang === 'ar' ? ar : en; };
    function reduced() {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    function finePointer() {
      return !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    }

    /* ---------- 3D tilt with glare (delegated) ---------- */
    var TILT_SEL = '.team-card, .match-card, .leader-card, .podium-item, .stat-tile, .quick-card, .fx-tilt, .p3d-step';
    var tiltActive = null;
    function tiltMove(el, e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      var max = el.classList.contains('leader-card') || el.classList.contains('fx-tilt-soft') ? 6 : 10;
      var rx = (0.5 - y) * max;
      var ry = (x - 0.5) * max;
      el.style.transition = 'transform 80ms linear';
      el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(6px)';
      var g = el.querySelector(':scope > .fx-glare');
      if (!g) {
        g = document.createElement('span');
        g.className = 'fx-glare';
        g.setAttribute('aria-hidden', 'true');
        el.appendChild(g);
      }
      g.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      g.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      g.style.opacity = '1';
    }
    function tiltReset(el) {
      if (!el) return;
      el.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = '';
      var g = el.querySelector(':scope > .fx-glare');
      if (g) g.style.opacity = '0';
    }
    function initTilt() {
      if (reduced() || !finePointer()) return;
      document.addEventListener('pointermove', function (e) {
        var el = e.target.closest ? e.target.closest(TILT_SEL) : null;
        if (el && el.closest('.modal, .print-only, .dnd-list')) el = null;
        if (tiltActive && tiltActive !== el) { tiltReset(tiltActive); tiltActive = null; }
        if (!el) return;
        tiltActive = el;
        tiltMove(el, e);
      }, { passive: true });
      document.addEventListener('pointerleave', function () { tiltReset(tiltActive); tiltActive = null; });
    }

    /* ---------- 3D football (truncated icosahedron rendered on canvas) ---------- */
    var GEO = null;
    function v3(x, y, z) { return { x: x, y: y, z: z }; }
    function norm(a) { var l = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) || 1; return v3(a.x / l, a.y / l, a.z / l); }
    function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
    function cross(a, b) { return v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }
    function slerp(a, b, t) { return norm(v3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t)); }
    function buildGeometry() {
      if (GEO) return GEO;
      var p = (1 + Math.sqrt(5)) / 2;
      var raw = [[0, 1, p], [0, -1, p], [0, 1, -p], [0, -1, -p], [1, p, 0], [-1, p, 0], [1, -p, 0], [-1, -p, 0], [p, 0, 1], [-p, 0, 1], [p, 0, -1], [-p, 0, -1]]
        .map(function (a) { return v3(a[0], a[1], a[2]); });
      var nb = raw.map(function () { return []; });
      for (var i = 0; i < raw.length; i++) {
        for (var j = 0; j < raw.length; j++) {
          if (i === j) continue;
          var dx = raw[i].x - raw[j].x, dy = raw[i].y - raw[j].y, dz = raw[i].z - raw[j].z;
          if (dx * dx + dy * dy + dz * dz < 4.1) nb[i].push(j);
        }
      }
      var point = {};
      raw.forEach(function (a, i) {
        nb[i].forEach(function (j) {
          var b = raw[j];
          point[i + '-' + j] = norm(v3(a.x * 2 / 3 + b.x / 3, a.y * 2 / 3 + b.y / 3, a.z * 2 / 3 + b.z / 3));
        });
      });
      var pentagons = raw.map(function (a, i) {
        var c = norm(a);
        var ref = Math.abs(c.x) < 0.9 ? v3(1, 0, 0) : v3(0, 1, 0);
        var u = norm(cross(c, ref));
        var w = cross(c, u);
        var corners = nb[i].map(function (j) { return point[i + '-' + j]; });
        corners.sort(function (q1, q2) { return Math.atan2(dot(q1, w), dot(q1, u)) - Math.atan2(dot(q2, w), dot(q2, u)); });
        return { c: c, corners: corners };
      });
      var edges = [];
      pentagons.forEach(function (pg) {
        for (var k = 0; k < 5; k++) edges.push([pg.corners[k], pg.corners[(k + 1) % 5]]);
      });
      raw.forEach(function (a, i) {
        nb[i].forEach(function (j) { if (i < j) edges.push([point[i + '-' + j], point[j + '-' + i]]); });
      });
      GEO = { pentagons: pentagons, edges: edges };
      return GEO;
    }

    function Ball(canvas, opts) {
      opts = opts || {};
      var ctx = canvas.getContext('2d');
      var geo = buildGeometry();
      var yaw = opts.yaw || 0.6, pitch = opts.pitch || -0.35, vy = opts.speed === undefined ? 0.012 : opts.speed, vx = 0.002;
      var dragging = false, lastX = 0, lastY = 0, raf = null, visible = true, size = 0, dpr = 1;
      var light = norm(v3(-0.45, 0.6, 0.75));
      var bounce = opts.bounce !== false;
      var t0 = performance.now();
      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        var r = canvas.getBoundingClientRect();
        size = Math.max(40, Math.min(r.width, r.height || r.width));
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr * (opts.shadow === false ? 1 : 1.18));
      }
      function rot(p) {
        var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
        var x = p.x * cy + p.z * sy, z = -p.x * sy + p.z * cy;
        var y = p.y * cp - z * sp; z = p.y * sp + z * cp;
        return v3(x, y, z);
      }
      function draw(now) {
        var W = canvas.width, Hh = canvas.height;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, W, Hh);
        var R = (size * dpr) * 0.44;
        var hop = bounce && !reduced() ? Math.abs(Math.sin((now - t0) / 520)) * R * 0.12 : 0;
        var cx = W / 2, cyy = (size * dpr) / 2 - hop;
        if (opts.shadow !== false) {
          var sh = ctx.createRadialGradient(cx, size * dpr * 1.04, 0, cx, size * dpr * 1.04, R * 1.1);
          sh.addColorStop(0, 'rgba(0,0,0,' + (0.38 - hop / R * 0.9).toFixed(3) + ')');
          sh.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sh;
          ctx.save();
          ctx.translate(cx, size * dpr * 1.04);
          ctx.scale(1 - hop / R * 0.8, 0.22);
          ctx.beginPath(); ctx.arc(0, 0, R * 1.1, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cyy, R, 0, Math.PI * 2); ctx.clip();
        var base = ctx.createRadialGradient(cx - R * 0.35, cyy - R * 0.4, R * 0.1, cx, cyy, R * 1.05);
        base.addColorStop(0, '#FFFFFF'); base.addColorStop(0.55, '#E6EBEF'); base.addColorStop(1, '#9AA5AE');
        ctx.fillStyle = base;
        ctx.fillRect(cx - R, cyy - R, R * 2, R * 2);
        function proj(q) {
          var x = q.x, y = q.y;
          if (q.z < 0) { var l = Math.sqrt(x * x + y * y) || 1; x /= l; y /= l; }
          return [cx + x * R, cyy - y * R];
        }
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(70,80,90,0.32)';
        ctx.lineWidth = Math.max(1, R * 0.012);
        geo.edges.forEach(function (e) {
          var a = rot(e[0]), b = rot(e[1]);
          if (a.z < 0.02 && b.z < 0.02) return;
          ctx.beginPath();
          for (var s = 0; s <= 6; s++) {
            var q = slerp(a, b, s / 6);
            var pp = proj(q);
            if (s === 0) ctx.moveTo(pp[0], pp[1]); else ctx.lineTo(pp[0], pp[1]);
          }
          ctx.stroke();
        });
        geo.pentagons.forEach(function (pg) {
          var c = rot(pg.c);
          if (c.z < -0.32) return;
          var corners = pg.corners.map(rot);
          var shade = Math.max(0, dot(c, light));
          var g = Math.round(14 + shade * 46);
          ctx.fillStyle = opts.gold
            ? 'rgb(' + Math.round(150 + shade * 80) + ',' + Math.round(115 + shade * 70) + ',' + Math.round(30 + shade * 30) + ')'
            : 'rgb(' + g + ',' + (g + 4) + ',' + (g + 10) + ')';
          ctx.beginPath();
          for (var k = 0; k < 5; k++) {
            var a = corners[k], b = corners[(k + 1) % 5];
            for (var s = 0; s < 4; s++) {
              var pp = proj(slerp(a, b, s / 4));
              if (k === 0 && s === 0) ctx.moveTo(pp[0], pp[1]); else ctx.lineTo(pp[0], pp[1]);
            }
          }
          ctx.closePath();
          ctx.fill();
        });
        var rim = ctx.createRadialGradient(cx, cyy, R * 0.55, cx, cyy, R);
        rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(1, 'rgba(0,20,30,0.42)');
        ctx.fillStyle = rim; ctx.fillRect(cx - R, cyy - R, R * 2, R * 2);
        var spec = ctx.createRadialGradient(cx - R * 0.38, cyy - R * 0.45, 0, cx - R * 0.38, cyy - R * 0.45, R * 0.6);
        spec.addColorStop(0, 'rgba(255,255,255,0.85)'); spec.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = spec; ctx.fillRect(cx - R, cyy - R, R * 2, R * 2);
        ctx.restore();
      }
      function loop(now) {
        if (!dragging) {
          yaw += vy; pitch += vx;
          vy += ((opts.speed === undefined ? 0.012 : opts.speed) - vy) * 0.02;
          vx *= 0.96;
          pitch = Math.max(-1.2, Math.min(1.2, pitch));
        }
        draw(now);
        raf = visible ? requestAnimationFrame(loop) : null;
      }
      function start() { if (!raf && !reduced()) raf = requestAnimationFrame(loop); }
      function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
      resize();
      draw(performance.now());
      if (!reduced()) start();
      window.addEventListener('resize', function () { resize(); draw(performance.now()); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) start(); else stop();
        }).observe(canvas);
      }
      if (opts.interactive !== false) {
        canvas.style.touchAction = 'none';
        canvas.style.cursor = 'grab';
        canvas.addEventListener('pointerdown', function (e) {
          dragging = true; lastX = e.clientX; lastY = e.clientY;
          canvas.setPointerCapture(e.pointerId);
          canvas.style.cursor = 'grabbing';
          start();
        });
        canvas.addEventListener('pointermove', function (e) {
          if (!dragging) return;
          var dx = e.clientX - lastX, dy = e.clientY - lastY;
          lastX = e.clientX; lastY = e.clientY;
          vy = dx * 0.012; vx = -dy * 0.012;
          yaw += vy; pitch += vx;
          if (reduced()) draw(performance.now());
        });
        var up = function () { dragging = false; canvas.style.cursor = 'grab'; };
        canvas.addEventListener('pointerup', up);
        canvas.addEventListener('pointercancel', up);
        canvas.addEventListener('dblclick', function () { vy = 0.45; Haptic.tap(12); });
      }
      return { start: start, stop: stop, kick: function () { vy = 0.5; vx = 0.05; start(); } };
    }

    function mountBalls(root) {
      (root || document).querySelectorAll('canvas[data-ball]:not([data-ball-ready])').forEach(function (c) {
        c.setAttribute('data-ball-ready', '1');
        c._ball = Ball(c, { gold: c.getAttribute('data-ball') === 'gold', shadow: c.getAttribute('data-shadow') !== 'false', speed: Number(c.getAttribute('data-speed') || 0.012) });
      });
    }

    /* ---------- Celebration burst (canvas confetti) ---------- */
    function burst(opts) {
      if (reduced()) return;
      opts = opts || {};
      var cv = document.createElement('canvas');
      cv.className = 'fx-burst';
      cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      var ctx = cv.getContext('2d');
      var colors = opts.colors || ['#D4AF37', '#F3DE8A', '#0B6E4F', '#06D6A0', '#FFFFFF'];
      var ox = (opts.x === undefined ? innerWidth / 2 : opts.x) * dpr;
      var oy = (opts.y === undefined ? innerHeight * 0.3 : opts.y) * dpr;
      var parts = [];
      for (var i = 0; i < 140; i++) {
        var a = Math.random() * Math.PI * 2, sp = (4 + Math.random() * 9) * dpr;
        parts.push({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6 * dpr, w: (5 + Math.random() * 7) * dpr, h: (3 + Math.random() * 5) * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[i % colors.length], life: 1 });
      }
      var start = performance.now();
      (function frame(now) {
        var el = now - start;
        ctx.clearRect(0, 0, cv.width, cv.height);
        parts.forEach(function (p) {
          p.vy += 0.32 * dpr; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
          p.life = Math.max(0, 1 - el / 2200);
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.scale(1, Math.abs(Math.cos(p.r * 1.7)) + 0.15);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        if (el < 2300) requestAnimationFrame(frame); else cv.remove();
      })(start);
    }

    /* ---------- 3D flip (score digits etc.) ---------- */
    function flip(el) {
      if (!el) return;
      el.classList.remove('flip-3d');
      void el.offsetWidth;
      el.classList.add('flip-3d');
    }

    /* ---------- Player profile + 3D flip card ---------- */
    function profile(pid) {
      var C = global.Core, E = global.Engines;
      var d = C.State.data;
      var p = C.Players.get(pid);
      var out = { player: p, apps: 0, goals: 0, assists: 0, yellow: 0, red: 0, motm: 0, avg: 0, sum: 0, cleanSheets: 0 };
      if (!p) return out;
      d.matches.forEach(function (m) {
        if (m.status !== 'finished' && m.status !== 'live') return;
        var apps = E.Stats.appearances(m);
        if (apps[pid]) {
          out.apps++;
          out.sum += E.Ratings.get(d, m, pid).value;
          if (m.status === 'finished') {
            var mm = E.Ratings.motm(d, m);
            if (mm && mm.playerId === pid) out.motm++;
            if (p.position === 'GK') {
              var side = apps[pid];
              if ((side === 'home' ? m.score.away : m.score.home) === 0) out.cleanSheets++;
            }
          }
        }
        (m.events || []).forEach(function (e) {
          if ((e.type === 'goal' || e.type === 'penalty') && e.playerId === pid) out.goals++;
          if (e.assistId === pid) out.assists++;
          if (e.type === 'yellow' && e.playerId === pid) out.yellow++;
          if (e.type === 'red' && e.playerId === pid) out.red++;
        });
      });
      out.avg = out.apps ? H.round1(out.sum / out.apps) : 0;
      return out;
    }

    function overall(pr) {
      var base = pr.avg ? 40 + pr.avg * 5 : 60;
      var bonus = pr.goals * 2 + pr.assists * 1.5 + pr.motm * 2 + pr.cleanSheets * 1.5 - pr.red * 2;
      return Math.max(45, Math.min(99, Math.round(base + bonus)));
    }

    function playerCard(pid) {
      var C = global.Core;
      var pr = profile(pid);
      var p = pr.player;
      if (!p) return;
      var team = C.Teams.get(p.teamId);
      var c1 = team && team.colors ? team.colors.primary : '#0B6E4F';
      var c2 = team && team.colors ? team.colors.secondary : '#D4AF37';
      var ovr = overall(pr);
      var tier = ovr >= 85 ? 'tier-gold' : ovr >= 72 ? 'tier-silver' : 'tier-bronze';
      var stats = p.position === 'GK'
        ? [[L('مباريات', 'APP'), pr.apps], [L('نظيفة', 'CS'), pr.cleanSheets], [L('تقييم', 'AVG'), pr.avg || '—'], [L('أفضل', 'MOTM'), pr.motm], [L('صفراء', 'YC'), pr.yellow], [L('حمراء', 'RC'), pr.red]]
        : [[L('أهداف', 'GLS'), pr.goals], [L('صناعة', 'AST'), pr.assists], [L('مباريات', 'APP'), pr.apps], [L('تقييم', 'AVG'), pr.avg || '—'], [L('أفضل', 'MOTM'), pr.motm], [L('بطاقات', 'CRD'), pr.yellow + pr.red]];
      var age = p.birthdate ? H.age(p.birthdate) : '—';
      var html = '<div class="pcard-scene" id="pcard-scene">' +
        '<div class="pcard ' + tier + '" id="pcard" tabindex="0" role="button" aria-label="' + L('اقلب البطاقة', 'Flip card') + '" style="--pc1:' + H.esc(c1) + ';--pc2:' + H.esc(c2) + '">' +
        '<div class="pcard-face pcard-front">' +
        '<div class="pcard-shine"></div>' +
        '<div class="pcard-top"><div class="pcard-ovr"><span class="num">' + ovr + '</span><span>' + H.esc(I18n.lang === 'ar' ? t(p.position) : p.position) + '</span></div>' +
        '<div class="pcard-crest">' + Badges.crest(team, 'sm') + '</div></div>' +
        '<div class="pcard-avatar">' + Badges.avatar(p, '2xl') + '<span class="pcard-number num">' + H.esc(p.number) + '</span></div>' +
        '<div class="pcard-name">' + H.esc(I18n.name(p)) + '</div>' +
        '<div class="pcard-stats">' + stats.map(function (s) { return '<div><span class="v num">' + s[1] + '</span><span class="l">' + s[0] + '</span></div>'; }).join('') + '</div>' +
        '<div class="pcard-hint">' + icon('refresh') + L('اضغط للقلب', 'Tap to flip') + '</div>' +
        '</div>' +
        '<div class="pcard-face pcard-back">' +
        '<div class="pcard-back-head">' + Badges.crest(team, 'lg') + '<div><div class="fw-heavy">' + H.esc(team ? I18n.name(team) : '') + '</div><div class="text-xs" style="opacity:.75">' + H.esc(t(p.position)) + ' · #' + H.esc(p.number) + '</div></div></div>' +
        '<dl class="pcard-info">' +
        '<div><dt>' + t('age') + '</dt><dd class="num">' + age + '</dd></div>' +
        '<div><dt>' + t('nationality') + '</dt><dd>' + H.esc(p.nationality || '—') + '</dd></div>' +
        '<div><dt>' + t('status') + '</dt><dd>' + H.esc(t(p.status || 'active')) + '</dd></div>' +
        '<div><dt>' + t('apps') + '</dt><dd class="num">' + pr.apps + '</dd></div>' +
        '<div><dt>' + t('goals') + '</dt><dd class="num">' + pr.goals + '</dd></div>' +
        '<div><dt>' + t('assist') + '</dt><dd class="num">' + pr.assists + '</dd></div>' +
        '<div><dt>' + t('yellowCards') + '</dt><dd class="num">' + pr.yellow + '</dd></div>' +
        '<div><dt>' + t('redCards') + '</dt><dd class="num">' + pr.red + '</dd></div>' +
        '<div><dt>' + t('motm') + '</dt><dd class="num">' + pr.motm + '</dd></div>' +
        '<div><dt>' + L('متوسط التقييم', 'Avg rating') + '</dt><dd class="num">' + (pr.avg || '—') + '</dd></div>' +
        '</dl></div>' +
        '</div></div>' +
        '<div class="row-2 center mt-4"><a class="btn btn-secondary btn-sm" href="team.html?id=' + encodeURIComponent(p.teamId) + '#p-' + encodeURIComponent(p.id) + '">' + icon('users') + t('team') + '</a>' +
        '<button class="btn btn-primary btn-sm" type="button" id="pcard-flip">' + icon('refresh') + L('قلب البطاقة', 'Flip') + '</button></div>';
      var m = Modal.open({ title: L('بطاقة اللاعب', 'Player card'), content: html });
      var card = m.body.querySelector('#pcard');
      var scene = m.body.querySelector('#pcard-scene');
      var flipped = false, rx = 0, ry = 0;
      function apply(anim) {
        card.style.transition = anim ? 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 90ms linear';
        card.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ((flipped ? 180 : 0) + ry).toFixed(2) + 'deg)';
      }
      function toggle() { flipped = !flipped; rx = 0; ry = 0; apply(true); Haptic.tap(12); }
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      m.body.querySelector('#pcard-flip').addEventListener('click', toggle);
      if (!reduced()) {
        scene.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse') return;
          var r = scene.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          rx = (0.5 - y) * 18; ry = (x - 0.5) * 22 * (flipped ? -1 : 1);
          card.style.setProperty('--sx', (x * 100) + '%');
          card.style.setProperty('--sy', (y * 100) + '%');
          apply(false);
        });
        scene.addEventListener('pointerleave', function () { rx = 0; ry = 0; apply(true); });
        card.classList.add('pcard-intro');
        card.addEventListener('animationend', function () { card.classList.remove('pcard-intro'); }, { once: true });
      }
      Anim.countAll(m.body);
    }

    function initPlayerCards() {
      document.addEventListener('click', function (e) {
        var el = e.target.closest ? e.target.closest('[data-player-card]') : null;
        if (!el) return;
        if (e.target.closest('button:not([data-player-card]), select, input')) return;
        e.preventDefault();
        playerCard(el.getAttribute('data-player-card'));
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var el = e.target.closest ? e.target.closest('[role="button"][data-player-card]') : null;
        if (!el || el !== e.target) return;
        e.preventDefault();
        playerCard(el.getAttribute('data-player-card'));
      });
    }

    /* ---------- 3D podium (top 3 teams) ---------- */
    function podium3d(rows) {
      var top = rows.slice(0, 3);
      if (top.length < 3) return '';
      var order = [top[1], top[0], top[2]];
      return '<div class="p3d" aria-label="' + L('منصة المتصدرين', 'Top three') + '">' + order.map(function (r, i) {
        var rank = i === 1 ? 1 : i === 0 ? 2 : 3;
        var tc = r.team && r.team.colors ? r.team.colors.primary : '#0B6E4F';
        return '<a class="p3d-col p3d-' + rank + '" href="team.html?id=' + encodeURIComponent(r.teamId) + '" style="--tc:' + H.esc(tc) + '">' +
          '<div class="p3d-crest">' + Badges.crest(r.team, rank === 1 ? 'xl' : 'lg') + (rank === 1 ? '<span class="p3d-crown">' + icon('crown') + '</span>' : '') + '</div>' +
          '<div class="p3d-name">' + H.esc(I18n.short(r.team)) + '</div>' +
          '<div class="p3d-step"><div class="p3d-top"></div><div class="p3d-front"><span class="p3d-rank">' + rank + '</span><span class="p3d-pts num">' + r.pts + ' <small>' + t('pts') + '</small></span></div></div>' +
          '</a>';
      }).join('') + '</div>';
    }

    function init() {
      initTilt();
      initPlayerCards();
      mountBalls(document);
      if ('MutationObserver' in window) {
        var pending = false;
        new MutationObserver(function () {
          if (pending) return;
          pending = true;
          requestAnimationFrame(function () { pending = false; mountBalls(document); });
        }).observe(document.body, { childList: true, subtree: true });
      }
    }

    return { init: init, reduced: reduced, Ball: Ball, mountBalls: mountBalls, burst: burst, flip: flip, profile: profile, overall: overall, playerCard: playerCard, podium3d: podium3d };
  })();

  global.UI = {
    icon: icon,
    Icons: P,
    Haptic: Haptic,
    Toast: Toast,
    Modal: Modal,
    Skeleton: Skeleton,
    Anim: Anim,
    Theme: Theme,
    Search: Search,
    Badges: Badges,
    Render: Render,
    Tabs: Tabs,
    FormBuilder: FormBuilder,
    DnD: DnD,
    FX: FX
  };
})(window);
