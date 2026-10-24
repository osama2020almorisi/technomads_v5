/* =========================================================
   pages/settings.js — Settings (settings.html)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  var deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstall = e;
    var b = document.getElementById('install-row');
    if (b) b.classList.remove('hidden');
  });

  function row(iconName, cls, title, sub, end, id) {
    return '<div class="setting-row"' + (id ? ' id="' + id + '"' : '') + '><span class="setting-icon ' + (cls || '') + '">' + UI.icon(iconName) + '</span>' +
      '<div class="setting-main"><div class="setting-title">' + H.esc(title) + '</div>' + (sub ? '<div class="setting-sub">' + sub + '</div>' : '') + '</div>' + (end || '') + '</div>';
  }

  function sw(id, checked) {
    return '<span class="switch"><input type="checkbox" id="' + id + '" ' + (checked ? 'checked' : '') + '><span class="track"></span><span class="thumb"></span></span>';
  }

  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(2) + ' MB';
  }

  function render(root) {
    var d = C.State.data;
    var theme = C.Prefs.get('theme');
    var admin = C.Permissions.isAdmin();
    root.innerHTML =
      '<div class="page-head"><div><h1 class="page-title">' + t('settings') + '</h1><p class="page-sub">' + H.esc(I18n.name(d.league)) + ' · v' + C.VERSION + '</p></div></div>' +

      '<section class="section">' + UI.Render.sectionHead(t('appearance')) + '<div class="card">' +
      row('moon', '', t('darkMode'), I18n.lang === 'ar' ? 'تلقائي حسب النظام أو يدوي' : 'Follow system or set manually',
        '<div class="segmented" id="theme-seg"><button type="button" data-v="auto" class="' + (theme === 'auto' ? 'active' : '') + '">' + (I18n.lang === 'ar' ? 'تلقائي' : 'Auto') + '</button>' +
        '<button type="button" data-v="light" class="' + (theme === 'light' ? 'active' : '') + '">' + UI.icon('sun').replace('<svg', '<svg style="width:16px;height:16px"') + '</button>' +
        '<button type="button" data-v="dark" class="' + (theme === 'dark' ? 'active' : '') + '">' + UI.icon('moon').replace('<svg', '<svg style="width:16px;height:16px"') + '</button></div>') +
      row('globe', 'info', t('language'), I18n.lang === 'ar' ? 'العربية (RTL) / English (LTR)' : 'Arabic (RTL) / English (LTR)',
        '<div class="segmented" id="lang-seg"><button type="button" data-v="ar" class="' + (I18n.lang === 'ar' ? 'active' : '') + '">عربي</button><button type="button" data-v="en" class="' + (I18n.lang === 'en' ? 'active' : '') + '">EN</button></div>') +
      row('phone', 'gold', I18n.lang === 'ar' ? 'الاهتزاز عند اللمس' : 'Haptic feedback', I18n.lang === 'ar' ? 'اهتزاز خفيف 10ms عند النقر' : 'Light 10ms vibration on tap', sw('haptics-sw', C.Prefs.get('haptics') !== false)) +
      '</div></section>' +

      '<section class="section">' + UI.Render.sectionHead(t('data')) +
      '<div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="' + t('importJson') + '">' + UI.icon('upload') +
      '<div class="dropzone-title">' + t('importJson') + '</div><div class="text-sm">' + t('dropHere') + '</div>' +
      '<input type="file" id="file-input" accept="application/json,.json" class="hidden"></div>' +
      '<div class="card mt-3">' +
      row('download', '', t('exportJson'), I18n.lang === 'ar' ? 'ملف JSON كامل لكل البيانات' : 'Full JSON file of all data', '<button class="btn btn-secondary btn-sm" id="btn-export" type="button">' + UI.icon('download') + '</button>') +
      row('pdf', 'danger', t('exportPdf'), I18n.lang === 'ar' ? 'تقرير الترتيب والإحصائيات للطباعة أو الحفظ PDF' : 'Standings & stats report — print or save as PDF', '<button class="btn btn-secondary btn-sm" id="btn-pdf" type="button">' + UI.icon('print') + '</button>') +
      row('database', 'info', t('loadSample'), I18n.lang === 'ar' ? '12 فريقاً · 240 لاعباً · 30 مباراة' : '12 teams · 240 players · 30 matches', '<button class="btn btn-secondary btn-sm" id="btn-sample" type="button">' + UI.icon('refresh') + '</button>') +
      row('trash', 'danger', t('clearData'), I18n.lang === 'ar' ? 'مسح التخزين المحلي (LocalStorage + IndexedDB)' : 'Wipe local storage (LocalStorage + IndexedDB)', '<button class="btn btn-danger-soft btn-sm" id="btn-clear" type="button">' + UI.icon('trash') + '</button>') +
      '</div></section>' +

      '<section class="section">' + UI.Render.sectionHead(t('security')) + '<div class="card">' +
      row(admin ? 'unlock' : 'lock', 'gold', admin ? t('adminMode') : t('viewerMode'), admin ? (I18n.lang === 'ar' ? 'لديك كل الصلاحيات' : 'You have full permissions') : (I18n.lang === 'ar' ? 'عرض فقط' : 'Read only'),
        admin ? '<button class="btn btn-secondary btn-sm" id="btn-logout" type="button">' + UI.icon('logout') + t('logout') + '</button>' : '<button class="btn btn-primary btn-sm" id="btn-login" type="button">' + UI.icon('unlock') + t('login') + '</button>') +
      (admin ? row('hash', '', t('changePin'), I18n.lang === 'ar' ? '4 إلى 8 أرقام' : '4 to 8 digits', '<button class="btn btn-secondary btn-sm" id="btn-pin" type="button">' + UI.icon('edit') + '</button>') : '') +
      '</div></section>' +

      '<section class="section">' + UI.Render.sectionHead(t('about')) + '<div class="card">' +
      row('info', '', t('version'), 'v' + C.VERSION + ' · MPA · Vanilla JS', '<span class="badge badge-primary">PWA</span>') +
      row('history', 'info', t('lastUpdated'), H.esc(H.fmtDateTime(d.updatedAt)), '') +
      row('database', 'gold', t('storage'), fmtBytes(C.Storage.usage()) + ' · LocalStorage + IndexedDB', '') +
      row('wifiOff', '', t('offlineReady'), ('serviceWorker' in navigator) && (location.protocol === 'https:' || location.hostname === 'localhost') ? (navigator.serviceWorker.controller ? (I18n.lang === 'ar' ? 'مفعّل' : 'Active') : (I18n.lang === 'ar' ? 'جارٍ التفعيل' : 'Activating')) : (I18n.lang === 'ar' ? 'يتطلب تشغيل التطبيق عبر خادم (http/https)' : 'Requires serving over http(s)'), '') +
      '<div class="setting-row' + (deferredInstall ? '' : ' hidden') + '" id="install-row"><span class="setting-icon">' + UI.icon('download') + '</span><div class="setting-main"><div class="setting-title">' + t('installApp') + '</div></div><button class="btn btn-primary btn-sm" id="btn-install" type="button">' + t('install') + '</button></div>' +
      '</div></section>' +

      '<div class="print-only print-report" id="print-report"></div>';

    bind(root);
  }

  function bind(root) {
    root.querySelector('#theme-seg').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      UI.Theme.set(b.getAttribute('data-v'));
      root.querySelectorAll('#theme-seg button').forEach(function (x) { x.classList.toggle('active', x === b); });
      UI.Haptic.tap(10);
    });
    root.querySelector('#lang-seg').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var v = b.getAttribute('data-v');
      if (v === I18n.lang) return;
      C.Prefs.set('lang', v);
      UI.Haptic.tap(10);
      window.location.reload();
    });
    root.querySelector('#haptics-sw').addEventListener('change', function (e) {
      C.Prefs.set('haptics', e.target.checked);
      if (e.target.checked) UI.Haptic.tap(20);
    });

    var dz = root.querySelector('#dropzone');
    var fi = root.querySelector('#file-input');
    dz.addEventListener('click', function () { fi.click(); });
    dz.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fi.click(); } });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f);
    });
    fi.addEventListener('change', function () { if (fi.files[0]) handleFile(fi.files[0]); fi.value = ''; });

    root.querySelector('#btn-export').addEventListener('click', function () {
      C.Exporter.json();
      UI.Toast.success(t('exportDone'));
    });
    root.querySelector('#btn-pdf').addEventListener('click', function () { exportPdf(root); });
    root.querySelector('#btn-sample').addEventListener('click', function () {
      UI.Modal.confirm({ title: t('loadSample'), message: I18n.lang === 'ar' ? 'سيتم استبدال البيانات الحالية بالبيانات التجريبية' : 'Current data will be replaced with sample data', okText: t('apply') }).then(function (ok) {
        if (!ok) return;
        C.State.loadSample().then(function () {
          UI.Toast.success(t('imported'));
          setTimeout(function () { window.location.reload(); }, 500);
        });
      });
    });
    root.querySelector('#btn-clear').addEventListener('click', function () {
      UI.Modal.doubleConfirm({ title: t('clearData'), message: t('confirmClear') }).then(function (ok) {
        if (!ok) return;
        C.Storage.remove(C.STORAGE_KEY);
        C.Storage.idbClear().then(function () {
          try { sessionStorage.clear(); } catch (e) { /* ignore */ }
          UI.Toast.success(t('deleted'));
          setTimeout(function () { window.location.href = 'index.html'; }, 600);
        });
      });
    });
    var login = root.querySelector('#btn-login');
    if (login) login.addEventListener('click', function () {
      global.Shared.pinDialog().then(function (ok) { if (ok) render(root); });
    });
    var logout = root.querySelector('#btn-logout');
    if (logout) logout.addEventListener('click', function () {
      C.Permissions.logout();
      UI.Toast.info(t('viewerMode'));
      global.Shared.renderHeader();
      render(root);
    });
    var pinBtn = root.querySelector('#btn-pin');
    if (pinBtn) pinBtn.addEventListener('click', function () {
      UI.Modal.prompt({ title: t('changePin'), label: t('newPin'), type: 'password', inputmode: 'numeric' }).then(function (v) {
        if (v === null) return;
        if (C.Permissions.changePin(v)) UI.Toast.success(t('pinChanged'));
        else UI.Toast.error(t('pinInvalid'));
      });
    });
    var inst = root.querySelector('#btn-install');
    if (inst) inst.addEventListener('click', function () {
      if (!deferredInstall) return;
      deferredInstall.prompt();
      deferredInstall.userChoice.then(function () {
        deferredInstall = null;
        root.querySelector('#install-row').classList.add('hidden');
      });
    });
  }

  function handleFile(file) {
    C.Importer.fromFile(file).then(function (res) {
      var html = '';
      if (!res.ok) {
        html = '<div class="alert alert-danger">' + UI.icon('alert') + '<div><strong>' + t('invalidJson') + '</strong><ul>' +
          res.errors.slice(0, 30).map(function (e) { return '<li>' + H.esc(e) + '</li>'; }).join('') +
          (res.errors.length > 30 ? '<li>… +' + (res.errors.length - 30) + '</li>' : '') + '</ul></div></div>';
        if (res.warnings.length) html += warningsBlock(res.warnings);
        UI.Modal.open({ title: t('importJson'), content: html });
        UI.Haptic.error();
        return;
      }
      var dd = res.data;
      html = '<div class="alert alert-success">' + UI.icon('check') + '<div><strong>' + H.esc(dd.league.name) + '</strong> · ' + H.esc(dd.league.season || '') + '<br>' +
        dd.teams.length + ' ' + t('teamsCount') + ' · ' + dd.players.length + ' ' + t('playersCount') + ' · ' + dd.matches.length + ' ' + t('matchesCount') + '</div></div>' +
        (res.warnings.length ? warningsBlock(res.warnings) : '') +
        '<p class="text-sm text-muted mt-3">' + (I18n.lang === 'ar' ? 'سيتم استبدال البيانات الحالية. تُحفظ نسخة من البيانات السابقة في IndexedDB.' : 'Current data will be replaced. A snapshot of the previous data is kept in IndexedDB.') + '</p>';
      var footer = document.createElement('div');
      footer.style.display = 'contents';
      footer.innerHTML = '<button class="btn btn-secondary" type="button" data-close>' + t('cancel') + '</button><button class="btn btn-primary" type="button" id="do-import">' + UI.icon('upload') + t('apply') + '</button>';
      var m = UI.Modal.open({ title: t('importJson'), content: html, footer: footer });
      footer.querySelector('[data-close]').addEventListener('click', function () { m.close(); });
      footer.querySelector('#do-import').addEventListener('click', function () {
        C.Importer.apply(C.Sample.rebase(dd));
        m.close();
        UI.Toast.success(t('imported'));
        setTimeout(function () { window.location.reload(); }, 600);
      });
    });
  }

  function warningsBlock(w) {
    return '<div class="alert alert-warning mt-3">' + UI.icon('alert') + '<div><strong>' + (I18n.lang === 'ar' ? 'تحذيرات' : 'Warnings') + ' (' + w.length + ')</strong><ul>' +
      w.slice(0, 15).map(function (e) { return '<li>' + H.esc(e) + '</li>'; }).join('') + '</ul></div></div>';
  }

  function exportPdf(root) {
    var d = C.State.data;
    var table = E.Standings.compute(d);
    var scorers = E.Stats.scorers(d).slice(0, 15);
    var assists = E.Stats.assists(d).slice(0, 10);
    var keepers = E.Stats.keepers(d).slice(0, 8);
    var disc = E.Disciplinary.compute(d);
    var results = d.matches.filter(function (m) { return m.status === 'finished'; }).sort(function (a, b) { return a.round - b.round || new Date(a.date) - new Date(b.date); });
    var html = '<h1>' + H.esc(I18n.name(d.league)) + '</h1><div class="meta">' + t('season') + ' ' + H.esc(d.league.season) + ' · ' + H.esc(H.fmtDateTime(new Date().toISOString())) + '</div>';
    html += '<h2>' + t('standings') + '</h2><table><thead><tr><th>#</th><th>' + t('team') + '</th><th>' + t('played') + '</th><th>' + t('won') + '</th><th>' + t('drawn') + '</th><th>' + t('lost') + '</th><th>' + t('gf') + '</th><th>' + t('ga') + '</th><th>' + t('gd') + '</th><th>' + t('pts') + '</th></tr></thead><tbody>' +
      table.map(function (r) { return '<tr><td>' + r.position + '</td><td class="l">' + H.esc(I18n.name(r.team)) + (r.deduction ? ' (−' + r.deduction + ')' : '') + '</td><td>' + r.played + '</td><td>' + r.won + '</td><td>' + r.drawn + '</td><td>' + r.lost + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td><td>' + H.signed(r.gd) + '</td><td><b>' + r.pts + '</b></td></tr>'; }).join('') + '</tbody></table>';
    html += '<h2>' + t('scorers') + '</h2><table><thead><tr><th>#</th><th>' + t('player') + '</th><th>' + t('team') + '</th><th>' + t('goals') + '</th></tr></thead><tbody>' +
      scorers.map(function (s, i) { return '<tr><td>' + (i + 1) + '</td><td class="l">' + H.esc(I18n.name(s.player)) + '</td><td class="l">' + H.esc(C.teamName(s.teamId)) + '</td><td><b>' + s.value + '</b></td></tr>'; }).join('') + '</tbody></table>';
    html += '<h2>' + t('assists') + '</h2><table><thead><tr><th>#</th><th>' + t('player') + '</th><th>' + t('team') + '</th><th>' + t('assist') + '</th></tr></thead><tbody>' +
      assists.map(function (s, i) { return '<tr><td>' + (i + 1) + '</td><td class="l">' + H.esc(I18n.name(s.player)) + '</td><td class="l">' + H.esc(C.teamName(s.teamId)) + '</td><td><b>' + s.value + '</b></td></tr>'; }).join('') + '</tbody></table>';
    html += '<h2>' + t('keepers') + '</h2><table><thead><tr><th>#</th><th>' + t('player') + '</th><th>' + t('team') + '</th><th>' + t('cleanSheets') + '</th><th>' + t('apps') + '</th></tr></thead><tbody>' +
      keepers.map(function (s, i) { return '<tr><td>' + (i + 1) + '</td><td class="l">' + H.esc(I18n.name(s.player)) + '</td><td class="l">' + H.esc(C.teamName(s.teamId)) + '</td><td><b>' + s.value + '</b></td><td>' + s.apps + '</td></tr>'; }).join('') + '</tbody></table>';
    html += '<h2>' + t('suspended') + '</h2><table><thead><tr><th>' + t('player') + '</th><th>' + t('team') + '</th><th>' + t('reason') + '</th><th>' + t('remaining') + '</th></tr></thead><tbody>' +
      (disc.active.length ? disc.active.map(function (s) { return '<tr><td class="l">' + H.esc(C.playerName(s.playerId)) + '</td><td class="l">' + H.esc(C.teamName(s.teamId)) + '</td><td>' + H.esc(s.kind === 'manual' ? s.reason : t(s.kind)) + '</td><td>' + s.remaining + '</td></tr>'; }).join('') : '<tr><td colspan="4">' + t('none') + '</td></tr>') + '</tbody></table>';
    html += '<h2>' + t('latestResults') + '</h2><table><thead><tr><th>' + t('round') + '</th><th>' + t('date') + '</th><th>' + t('home2') + '</th><th>' + t('score') + '</th><th>' + t('away') + '</th></tr></thead><tbody>' +
      results.map(function (m) { return '<tr><td>' + m.round + '</td><td>' + H.esc(H.fmtDate(m.date, { day: 'numeric', month: 'short' })) + '</td><td class="l">' + H.esc(C.teamName(m.homeTeamId)) + '</td><td><b>' + m.score.home + ' - ' + m.score.away + '</b></td><td class="l">' + H.esc(C.teamName(m.awayTeamId)) + '</td></tr>'; }).join('') + '</tbody></table>';
    root.querySelector('#print-report').innerHTML = html;
    C.Audit.log('create', 'export', 'pdf', 'PDF report');
    UI.Toast.info(I18n.lang === 'ar' ? 'اختر "حفظ كـ PDF" من نافذة الطباعة' : 'Choose "Save as PDF" in the print dialog');
    document.body.classList.add('printing-report');
    var cleanup = function () {
      document.body.classList.remove('printing-report');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(function () { window.print(); setTimeout(cleanup, 1000); }, 350);
  }

  global.Pages = global.Pages || {};
  global.Pages.settings = {
    init: function (root) { render(root); },
    onData: function () { /* settings page renders on demand */ }
  };
})(window);
