/* =========================================================
   shared.js — Header + BottomNav + FAB + Navigation +
   Theme + Check Updates + Splash + Global Search + PWA
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var H = global.Helpers;
  var I18n = global.I18n;
  var UI = global.UI;
  var t = function (k) { return I18n.t(k); };

  var NAV_MAP = {
    home: 'home', teams: 'home', team: 'home',
    matches: 'matches', 'match-live': 'matches',
    standings: 'standings',
    stats: 'stats', discipline: 'stats',
    admin: 'admin',
    settings: 'settings'
  };

  var Shared = {
    page: null,

    init: function () {
      Shared.page = document.body.getAttribute('data-page') || 'home';
      I18n.apply();
      UI.Theme.apply();
      Shared.renderHeader();
      Shared.initNav();
      Shared.initFab();
      Shared.initTopbarScroll();
      Shared.initTransitions();
      Shared.initNetwork();
      Shared.registerSW();
      Shared.splash();
      C.State.subscribe(function () { Shared.renderHeader(); });
    },

    /* ---------- Header ---------- */
    renderHeader: function () {
      var league = C.State.data ? C.State.data.league : null;
      var title = document.getElementById('topbar-title');
      var sub = document.getElementById('topbar-sub');
      var logo = document.getElementById('topbar-logo');
      var role = document.getElementById('role-pill');
      if (title) title.textContent = league ? I18n.name(league) : t('appName');
      if (sub) sub.textContent = league ? (t('season') + ' ' + (league.season || '')) : '';
      if (logo) {
        if (league && league.logo) logo.innerHTML = '<img src="' + H.esc(league.logo) + '" alt="" onerror="this.parentNode.innerHTML=UI.icon(\'logo\')">';
        else logo.innerHTML = UI.icon('logo');
      }
      if (role) {
        var admin = C.Permissions.isAdmin();
        role.classList.toggle('hidden', !admin);
        role.textContent = t('admin');
      }
      document.title = (document.body.getAttribute('data-title') ? t(document.body.getAttribute('data-title')) + ' · ' : '') + (league ? I18n.name(league) : t('appName'));
    },

    initTopbarScroll: function () {
      var bar = document.getElementById('topbar');
      if (!bar) return;
      var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 6); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      var themeBtn = document.getElementById('btn-theme');
      if (themeBtn) themeBtn.addEventListener('click', function () {
        var th = UI.Theme.toggle();
        UI.Toast.info(th === 'dark' ? t('darkMode') : (I18n.lang === 'ar' ? 'الوضع الفاتح' : 'Light mode'));
      });
      var upBtn = document.getElementById('btn-updates');
      if (upBtn) upBtn.addEventListener('click', function () { Shared.checkUpdates(upBtn); });
      var searchBtn = document.getElementById('btn-search');
      if (searchBtn) searchBtn.addEventListener('click', Shared.openSearch);
    },

    /* ---------- Bottom Nav ---------- */
    initNav: function () {
      var key = NAV_MAP[Shared.page] || 'home';
      document.querySelectorAll('.bottom-nav .nav-item').forEach(function (a) {
        var active = a.getAttribute('data-nav') === key;
        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
        a.addEventListener('click', function () { UI.Haptic.tap(10); });
      });
    },

    /* ---------- FAB ---------- */
    initFab: function () {
      var fab = document.getElementById('fab');
      var menu = document.getElementById('fab-menu');
      var back = document.getElementById('fab-backdrop');
      if (!fab || !menu || !back) return;
      function build() {
        var items = [];
        var live = C.State.data ? C.State.data.matches.filter(function (m) { return m.status === 'live'; }) : [];
        items.push({ icon: 'search', label: t('search').replace('...', ''), action: function () { Shared.openSearch(); } });
        if (live.length) items.push({ icon: 'live', label: t('liveNow') + ' (' + live.length + ')', href: 'match-live.html?id=' + encodeURIComponent(live[0].id) });
        items.push({ icon: 'users', label: t('teams'), href: 'teams.html' });
        items.push({ icon: 'gavel', label: t('discipline'), href: 'discipline.html' });
        if (C.Permissions.isAdmin()) items.push({ icon: 'zap', label: t('liveEntry'), href: 'admin.html?tab=live' });
        else items.push({ icon: 'lock', label: t('adminMode'), href: 'admin.html' });
        menu.innerHTML = items.map(function (it, i) {
          return it.href
            ? '<a class="fab-action glass-strong glass" href="' + it.href + '">' + UI.icon(it.icon) + '<span>' + H.esc(it.label) + '</span></a>'
            : '<button class="fab-action glass-strong glass" type="button" data-i="' + i + '">' + UI.icon(it.icon) + '<span>' + H.esc(it.label) + '</span></button>';
        }).join('');
        menu.querySelectorAll('button[data-i]').forEach(function (b) {
          b.addEventListener('click', function () { close(); items[Number(b.getAttribute('data-i'))].action(); });
        });
      }
      function open() {
        build();
        fab.classList.add('open'); menu.classList.add('open'); back.classList.add('open');
        fab.setAttribute('aria-expanded', 'true');
        UI.Haptic.tap(12);
      }
      function close() {
        fab.classList.remove('open'); menu.classList.remove('open'); back.classList.remove('open');
        fab.setAttribute('aria-expanded', 'false');
      }
      fab.addEventListener('click', function () { if (fab.classList.contains('open')) close(); else open(); });
      back.addEventListener('click', close);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      Shared.closeFab = close;
    },

    /* ---------- Global search ---------- */
    openSearch: function () {
      var wrap = document.createElement('div');
      wrap.innerHTML = UI.Search.box('search', 'global-search') + '<div id="gs-results" class="mt-4"></div>';
      var m = UI.Modal.open({ title: t('search').replace('...', ''), content: wrap });
      var input = wrap.querySelector('#global-search');
      var res = wrap.querySelector('#gs-results');
      function render(q) {
        if (!q || q.trim().length < 1) {
          res.innerHTML = UI.Render.empty('search', I18n.lang === 'ar' ? 'ابحث عن فريق أو لاعب أو ملعب' : 'Search a team, player or stadium');
          return;
        }
        var d = C.State.data;
        var teams = d.teams.filter(function (tm) { return UI.Search.match(q, [tm.name, tm.nameEn, tm.shortName, tm.city, tm.stadium, tm.coach]); }).slice(0, 6);
        var players = d.players.filter(function (p) { return UI.Search.match(q, [p.name, p.nameEn, String(p.number)]); }).slice(0, 12);
        var html = '';
        if (teams.length) {
          html += '<div class="divider-label">' + t('teams') + '</div><div class="card list">' + teams.map(function (tm) {
            return '<a class="list-item" href="team.html?id=' + encodeURIComponent(tm.id) + '">' + UI.Badges.crest(tm, 'sm') +
              '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(tm)) + '</span><span class="li-sub">' + UI.icon('stadium') + H.esc(tm.stadium || '') + '</span></div>' + UI.icon('chevron', 'chev') + '</a>';
          }).join('') + '</div>';
        }
        if (players.length) {
          html += '<div class="divider-label">' + t('players') + '</div><div class="card list">' + players.map(function (p) {
            var tm = C.Teams.get(p.teamId);
            return '<a class="list-item" href="team.html?id=' + encodeURIComponent(p.teamId) + '#p-' + encodeURIComponent(p.id) + '">' + UI.Badges.avatar(p, 'sm') +
              '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(p)) + '</span><span class="li-sub">' + UI.Badges.pos(p.position) + ' #' + H.esc(p.number) + ' · ' + H.esc(I18n.short(tm)) + '</span></div>' + UI.icon('chevron', 'chev') + '</a>';
          }).join('') + '</div>';
        }
        res.innerHTML = html || UI.Render.empty('search', t('empty'));
      }
      UI.Search.bind(input, render, 180);
      render('');
      setTimeout(function () { input.focus(); }, 80);
      return m;
    },

    /* ---------- Page transitions (MPA) ---------- */
    initTransitions: function () {
      document.body.classList.add('page-enter');
      setTimeout(function () { document.body.classList.remove('page-enter'); }, 500);
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
        if (/^(https?:|mailto:|tel:|blob:|data:)/i.test(href)) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if ('startViewTransition' in document && CSS.supports && CSS.supports('view-transition-name: none')) {
          /* Native cross-document view transitions handle it */
        }
        e.preventDefault();
        Shared.go(href);
      });
      window.addEventListener('pageshow', function (e) {
        if (e.persisted) document.body.classList.remove('page-leave');
      });
    },
    go: function (href) {
      if (Shared.closeFab) Shared.closeFab();
      document.body.classList.add('page-leave');
      setTimeout(function () { window.location.href = href; }, 170);
    },

    /* ---------- Splash ---------- */
    splash: function () {
      var seen = false;
      try { seen = sessionStorage.getItem('league.splash') === '1'; } catch (e) { seen = true; }
      if (seen) return;
      try { sessionStorage.setItem('league.splash', '1'); } catch (e) { /* ignore */ }
      var league = C.State.data ? C.State.data.league : null;
      var el = document.createElement('div');
      el.className = 'splash';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="splash-logo">' + (league && league.logo ? '<img src="' + H.esc(league.logo) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:30px">' : UI.icon('logo')) + '</div>' +
        '<div class="splash-title">' + H.esc(league ? I18n.name(league) : t('appName')) + '</div>' +
        '<div class="splash-sub">' + H.esc(t('season') + ' ' + (league ? league.season : '')) + '</div>' +
        '<div class="splash-bar"><span></span></div>';
      document.body.appendChild(el);
      setTimeout(function () {
        el.classList.add('hide');
        setTimeout(function () { el.remove(); }, 600);
      }, 1400);
    },

    /* ---------- Network ---------- */
    initNetwork: function () {
      window.addEventListener('offline', function () { UI.Toast.warning(t('offline')); });
      window.addEventListener('online', function () { UI.Toast.success(t('online')); });
    },

    /* ---------- Service worker ---------- */
    swReg: null,
    registerSW: function () {
      if (!('serviceWorker' in navigator)) return;
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        Shared.swReg = reg;
        reg.addEventListener('updatefound', function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function () {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              UI.Toast.info(I18n.lang === 'ar' ? 'يتوفر إصدار جديد من التطبيق' : 'A new app version is available', {
                action: t('reload'), duration: 8000,
                onAction: function () { nw.postMessage({ type: 'SKIP_WAITING' }); }
              });
            }
          });
        });
      }).catch(function () { /* ignore */ });
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    },

    /* ---------- Check updates ---------- */
    checkUpdates: function (btn) {
      if (btn) btn.classList.add('spinning');
      var swCheck = Shared.swReg ? Shared.swReg.update().catch(function () { return null; }) : Promise.resolve(null);
      var dataCheck = fetch('data/sample-league.json?ts=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .then(function (json) {
          var stamp = String(json.version || 1) + '|' + (json.updatedAt || '');
          var known = C.Prefs.get('remoteStamp');
          if (!known) {
            C.Prefs.set('remoteStamp', stamp);
            return false;
          }
          if (known !== stamp) return { json: json, stamp: stamp };
          return false;
        })
        .catch(function () { return null; });
      Promise.all([swCheck, dataCheck]).then(function (res) {
        setTimeout(function () { if (btn) btn.classList.remove('spinning'); }, 400);
        var upd = res[1];
        if (upd && upd.json) {
          UI.Toast.info(t('updateAvailable'), {
            action: t('apply'), duration: 9000,
            onAction: function () {
              var v = C.Validator.validate(upd.json);
              if (!v.valid) { UI.Toast.error(v.errors[0]); return; }
              C.State.replace(C.Sample.rebase(upd.json));
              C.Prefs.set('remoteStamp', upd.stamp);
              UI.Toast.success(t('imported'));
              setTimeout(function () { window.location.reload(); }, 600);
            }
          });
        } else if (upd === null && !navigator.onLine) {
          UI.Toast.warning(t('offline'));
        } else {
          UI.Toast.success(t('upToDate') + ' · v' + C.VERSION);
        }
      });
    },

    /* ---------- PIN dialog (used by admin page and anywhere) ---------- */
    pinDialog: function () {
      return new Promise(function (resolve) {
        var wrap = document.createElement('div');
        var pin = '';
        wrap.innerHTML = '<div class="text-center"><div class="gate-icon" style="width:60px;height:60px;border-radius:18px">' + UI.icon('lock') + '</div>' +
          '<p class="text-sm text-muted">' + t('enterPin') + '</p></div>' +
          '<div class="pin-dots" id="pin-dots">' + [0, 1, 2, 3].map(function () { return '<span class="pin-dot"></span>'; }).join('') + '</div>' +
          '<div class="pin-pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button class="pin-key" type="button" data-k="' + n + '">' + n + '</button>'; }).join('') +
          '<button class="pin-key" type="button" data-k="clear" aria-label="clear">' + UI.icon('x') + '</button><button class="pin-key" type="button" data-k="0">0</button><button class="pin-key" type="button" data-k="back" aria-label="back">' + UI.icon('backspace') + '</button></div>' +
          '<p class="text-xs text-faint text-center mt-4">' + t('pinHint') + '</p>';
        var ok = false;
        var m = UI.Modal.open({ title: t('admin_pin_title'), content: wrap, onClose: function () { if (!ok) resolve(false); } });
        var dots = wrap.querySelector('#pin-dots');
        var expected = String(C.Prefs.get('pin') || '1234');
        function paint() {
          var need = Math.max(4, expected.length);
          if (dots.children.length !== need) dots.innerHTML = Array(need + 1).join('<span class="pin-dot"></span>');
          Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('filled', i < pin.length); });
        }
        function press(k) {
          UI.Haptic.tap(8);
          if (k === 'back') pin = pin.slice(0, -1);
          else if (k === 'clear') pin = '';
          else if (pin.length < 8) pin += k;
          paint();
          if (pin.length >= expected.length) {
            if (C.Permissions.login(pin)) {
              ok = true;
              UI.Haptic.success();
              UI.Toast.success(t('adminMode'));
              m.close();
              resolve(true);
            } else if (pin.length >= expected.length) {
              dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
              UI.Haptic.error();
              UI.Toast.error(t('wrongPin'));
              pin = '';
              setTimeout(paint, 200);
            }
          }
        }
        wrap.querySelectorAll('.pin-key').forEach(function (b) {
          b.addEventListener('click', function () { press(b.getAttribute('data-k')); });
        });
        var keyHandler = function (e) {
          if (!wrap.isConnected) { document.removeEventListener('keydown', keyHandler); return; }
          if (/^\d$/.test(e.key)) press(e.key);
          else if (e.key === 'Backspace') press('back');
        };
        document.addEventListener('keydown', keyHandler);
        paint();
      });
    },

    requireAdmin: function () {
      if (C.Permissions.isAdmin()) return Promise.resolve(true);
      return Shared.pinDialog();
    }
  };

  global.Shared = Shared;
})(window);
