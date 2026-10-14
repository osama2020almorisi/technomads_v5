/* ============================================================
   APP.JS — المنسق الرئيسي
   Bootstrap | Router | Bottom Nav | Events | FAB | Actions | SW
   ============================================================ */

(function (window) {
  'use strict';

  const App = {
    initialized: false,
    routes: {},

    /* ============================================================
       BOOTSTRAP
       ============================================================ */
    async bootstrap() {
      if (this.initialized) return;
      this.initialized = true;

      try {
        await Core.init();

        const theme = Core.Storage.get(Core.Storage.KEYS.THEME) || 'light';
        UI.ThemeManager.set(theme);

        const lang = Core.Storage.get(Core.Storage.KEYS.LANG) || 'ar';
        UI.ThemeManager.setLanguage(lang);

        this.updateHeader();

        this.registerRoutes();

        this.wireNavigation();
        this.wireGlobalClicks();
        this.wireKeyboard();
        this.wirePullToRefresh();
        this.wireNetworkStatus();

        this.navigate('home');

        this.registerServiceWorker();

        setTimeout(() => this.hideSplash(), 600);

        setTimeout(() => {
          UI.Toast.info(
            `مرحباً · ${Core.State.data.teams.length} فريق · ${Core.State.data.matches.length} مباراة`,
            3500
          );
        }, 1200);

      } catch (error) {
        console.error('[App] Bootstrap error:', error);
        UI.Toast.error('حدث خطأ أثناء تحميل التطبيق.');
        setTimeout(() => this.hideSplash(), 400);
      }
    },

    /* ============================================================
       SPLASH
       ============================================================ */
    hideSplash() {
      const splash = document.getElementById('splash');
      const app = document.getElementById('app');
      if (splash) splash.classList.add('hidden');
      if (app) app.hidden = false;
    },

    /* ============================================================
       HEADER
       ============================================================ */
    updateHeader() {
      const data = Core.State.data;
      if (!data) return;

      const nameEl = document.getElementById('leagueName');
      const seasonEl = document.getElementById('leagueSeason');

      if (nameEl) nameEl.textContent = data.league?.name || 'مدير الدوري';
      if (seasonEl) {
        seasonEl.textContent = `الموسم ${data.league?.season || '—'}`;
      }

      this.updateStatusDot();
    },

    updateStatusDot() {
      const dot = document.getElementById('updateDot');
      if (!dot || !Core.State.data) return;

      const updatedAt = Core.State.data.updatedAt;
      if (!updatedAt) {
        dot.className = 'status-dot error';
        return;
      }

      const ageInDays = (Date.now() - new Date(updatedAt).getTime()) / 86400000;

      dot.classList.remove('old', 'error');
      if (ageInDays > 30) {
        dot.classList.add('old');
      }
    },

    /* ============================================================
       ROUTES
       ============================================================ */
    registerRoutes() {
      this.routes = {
        home: () => Pages.render('home'),
        teams: () => Pages.render('teams'),
        team: (params) => Pages.render('team', params),
        matches: () => Pages.render('matches'),
        live: (params) => Pages.render('live', params),
        standings: () => Pages.render('standings'),
        stats: () => Pages.render('stats'),
        discipline: () => Pages.render('discipline'),
        settings: () => Pages.render('settings'),
        admin: () => Admin.open()
      };
    },

    navigate(page, params = {}) {
      const route = this.routes[page];
      if (!route) {
        console.warn(`[App] Unknown route: ${page}`);
        return;
      }

      Core.State.set('currentPage', page);

      UI.Haptic.tap();

      route(params);
    },

    /* ============================================================
       NAVIGATION
       ============================================================ */
    wireNavigation() {
      const nav = document.getElementById('bottomNav');
      if (nav) {
        nav.addEventListener('click', e => {
          const item = e.target.closest('.nav-item');
          if (!item) return;

          const page = item.dataset.page;
          if (page === 'admin') {
            Admin.open();
          } else {
            this.navigate(page);
          }
        });
      }

      document.addEventListener('league:route', e => {
        const { page, params } = e.detail || {};
        if (page && this.routes[page]) {
          if (Core.State.get('currentPage') !== page) {
            this.navigate(page, params);
          }
        }
      });

      document.addEventListener('league:data-changed', () => {
        this.updateHeader();
        const current = Core.State.get('currentPage') || 'home';
        this.navigate(current);
      });
    },

    /* ============================================================
       GLOBAL CLICK HANDLER
       ============================================================ */
    wireGlobalClicks() {
      document.addEventListener('click', e => {
        // 1. data-go → Navigate
        const goBtn = e.target.closest('[data-go]');
        if (goBtn) {
          e.preventDefault();
          const page = goBtn.dataset.go;
          const extra = {};

          if (goBtn.dataset.tab) {
            extra.matchTab = goBtn.dataset.tab;
            Core.State.set('matchTab', goBtn.dataset.tab);
          }
          if (goBtn.dataset.team) {
            extra.teamId = goBtn.dataset.team;
            Core.State.set('teamId', goBtn.dataset.team);
          }
          if (goBtn.dataset.match) {
            extra.matchId = goBtn.dataset.match;
            Core.State.set('matchId', goBtn.dataset.match);
          }

          this.navigate(page, extra);
          return;
        }

        // 2. data-team → Team detail
        const teamCard = e.target.closest('[data-team]');
        if (teamCard) {
          const teamId = teamCard.dataset.team;
          Core.State.set('teamId', teamId);
          this.navigate('team', { teamId });
          return;
        }

        // 3. data-match → Match live
        const matchCard = e.target.closest('[data-match]');
        if (matchCard) {
          const matchId = matchCard.dataset.match;
          Core.State.set('matchId', matchId);
          this.navigate('live', { matchId });
          return;
        }

        // 4. data-tiebreak → Show tiebreaker explanation
        const tieBreak = e.target.closest('[data-tiebreak]');
        if (tieBreak) {
          this.showTiebreak(tieBreak.dataset.tiebreak);
          return;
        }

        // 5. data-action → Handle action
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn && !actionBtn.dataset.adminAction) {
          e.preventDefault();
          this.handleAction(actionBtn.dataset.action, actionBtn);
          return;
        }
      });
    },

    /* ============================================================
       HANDLE ACTIONS
       ============================================================ */
    handleAction(action, button) {
      switch (action) {
        case 'import':
          this.openImportDialog();
          break;

        case 'export-json':
          Core.Exporter.exportBackup();
          UI.Toast.success('تم تجهيز النسخة الاحتياطية.');
          break;

        case 'export-pdf':
          Core.Audit.log('export', 'pdf', 'print');
          setTimeout(() => window.print(), 100);
          break;

        case 'check-updates':
          this.checkUpdates();
          break;

        case 'audit':
          Admin.render('audit');
          break;

        case 'clear-data':
          this.confirmClearData();
          break;

        case 'toggle-admin':
          this.toggleAdminMode(button);
          break;

        case 'add-event':
          Admin.addEvent('goal');
          break;

        case 'theme-toggle':
          UI.ThemeManager.toggle();
          break;
      }
    },

    /* ============================================================
       ADMIN MODE TOGGLE
       ============================================================ */
    toggleAdminMode() {
      if (Core.Permissions.isAdmin()) {
        Core.Permissions.logout();
        UI.Toast.info('تم إيقاف وضع الإدارة.');
        UI.Haptic.tap();
        Pages.render('settings');
      } else {
        Admin.showLogin();
      }
    },

    /* ============================================================
       IMPORT DIALOG
       ============================================================ */
    openImportDialog() {
      const input = document.getElementById('importInput');
      if (input) input.click();
    },

    async handleImportFile(file) {
      if (!file) return;

      try {
        UI.Toast.info('جاري استيراد الملف...', 1500);

        const newData = await Core.Importer.fromFile(file);
        Core.State.data = newData;
        Core.persist();

        Core.Audit.log('import', 'data', file.name, null, {
          teams: newData.teams.length,
          players: newData.players.length,
          matches: newData.matches.length
        });

        this.updateHeader();

        const current = Core.State.get('currentPage') || 'home';
        this.navigate(current);

        UI.Toast.success(
          `تم استيراد ${newData.teams.length} فريق · ${newData.players.length} لاعب · ${newData.matches.length} مباراة`
        );
        UI.Haptic.success();

      } catch (error) {
        console.error('[Import] Error:', error);
        UI.Toast.error(error.message || 'فشل استيراد الملف.');
        UI.Haptic.error();

        UI.Modal.alert('فشل الاستيراد', error.message || 'الملف غير صالح.');
      }
    },

    /* ============================================================
       CHECK UPDATES
       ============================================================ */
    checkUpdates() {
      const updatedAt = Core.State.data?.updatedAt;

      if (!updatedAt) {
        UI.Toast.warning('لا يوجد تاريخ تحديث للبيانات.');
        return;
      }

      const ageInDays = Math.floor(
        (Date.now() - new Date(updatedAt).getTime()) / 86400000
      );

      if (ageInDays > 30) {
        UI.Toast.warning(`البيانات قديمة (آخر تحديث منذ ${ageInDays} يوم).`, 4000);
      } else if (ageInDays > 7) {
        UI.Toast.info(`آخر تحديث للبيانات منذ ${ageInDays} يوم.`);
      } else {
        UI.Toast.success(`البيانات محدّثة · آخر تحديث منذ ${Helpers.timeAgo(updatedAt)}.`);
      }

      this.updateStatusDot();
      UI.Haptic.tap();
    },

    /* ============================================================
       CLEAR DATA CONFIRMATION
       ============================================================ */
    confirmClearData() {
      UI.Modal.confirm(
        'إعادة ضبط البيانات',
        'سيتم حذف كل البيانات الحالية وسجل التعديلات، ثم استعادة بيانات العينة. لا يمكن التراجع عن هذا الإجراء.',
        {
          danger: true,
          confirmText: 'نعم، إعادة الضبط'
        }
      ).then(confirmed => {
        if (!confirmed) return;

        Core.clear();
        this.updateHeader();
        this.navigate('home');

        UI.Toast.success('تمت إعادة ضبط البيانات.');
        UI.Haptic.success();
      });
    },

    /* ============================================================
       TIEBREAK EXPLANATION
       ============================================================ */
    showTiebreak(teamId) {
      const team = Core.team(teamId);
      if (!team) return;

      const table = Engines.standings(Core.State.data);
      const position = table.findIndex(r => r.teamId === teamId) + 1;
      const explanation = Engines.tiebreakExplanation(teamId, Core.State.data);

      const content = document.createElement('div');
      content.innerHTML = `
        <p style="margin-bottom:var(--space-4);color:var(--text-secondary);font-size:var(--text-sm)">
          المركز الحالي: <b style="color:var(--color-primary-500)">${position}</b>
          <br>
          يتم تطبيق معايير الدوري على <b>الفرق المتعادلة بالنقاط فقط</b>.
        </p>
        <div class="player-list">
          ${explanation.map((item, i) => `
            <div class="card player-row" style="padding:var(--space-3)">
              <span class="rank-number">${i + 1}</span>
              <div class="player-details">
                <strong style="font-size:var(--text-sm)">${UI.escape(item.label)}</strong>
              </div>
              <span style="font-family:var(--font-mono);font-weight:var(--font-black);color:var(--color-primary-500)">
                ${UI.escape(String(item.value))}
              </span>
            </div>
          `).join('')}
        </div>
      `;

      UI.Modal.open(`معايير ترتيب ${team.name}`, content, {
        bottomSheet: false
      });
    },

    /* ============================================================
       KEYBOARD SHORTCUTS
       ============================================================ */
    wireKeyboard() {
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
          e.preventDefault();
          this.openImportDialog();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
          e.preventDefault();
          Core.Exporter.exportBackup();
        }

        if (!e.ctrlKey && !e.metaKey && !e.altKey && e.target === document.body) {
          const keys = ['home', 'matches', 'standings', 'stats', 'admin', 'settings'];
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 6) {
            const page = keys[num - 1];
            if (page) this.navigate(page);
          }
        }
      });
    },

    /* ============================================================
       PULL TO REFRESH
       ============================================================ */
    wirePullToRefresh() {
      const main = document.getElementById('mainContent');
      if (!main) return;

      UI.PullToRefresh.init(main, async () => {
        UI.Toast.info('جاري التحديث...', 1200);
        await Core.Sync.pull();
        this.updateHeader();
        const current = Core.State.get('currentPage') || 'home';
        this.navigate(current);
        UI.Toast.success('تم التحديث');
      });
    },

    /* ============================================================
       NETWORK STATUS
       ============================================================ */
    wireNetworkStatus() {
      Core.Lifecycle.on('online', () => {
        UI.Toast.success('تم استعادة الاتصال');
      });

      Core.Lifecycle.on('offline', () => {
        UI.Toast.warning('أنت غير متصل — الوضع المحلي مفعّل');
      });
    },

    /* ============================================================
       FILE INPUT
       ============================================================ */
    wireFileInput() {
      const input = document.getElementById('importInput');
      if (!input) return;

      input.addEventListener('change', async e => {
        const file = e.target.files?.[0];
        if (file) {
          await this.handleImportFile(file);
        }
        input.value = '';
      });

      document.addEventListener('dragover', e => {
        const dropZone = e.target.closest('#dropZone');
        if (dropZone) {
          e.preventDefault();
          dropZone.classList.add('dragover');
        }
      });

      document.addEventListener('dragleave', e => {
        const dropZone = e.target.closest('#dropZone');
        if (dropZone) {
          dropZone.classList.remove('dragover');
        }
      });

      document.addEventListener('drop', async e => {
        const dropZone = e.target.closest('#dropZone');
        if (!dropZone) return;

        e.preventDefault();
        dropZone.classList.remove('dragover');

        const file = e.dataTransfer?.files?.[0];
        if (file) {
          await this.handleImportFile(file);
        }
      });
    },

    /* ============================================================
       FAB
       ============================================================ */
    wireFAB() {
      const fab = document.getElementById('fabImport');
      if (!fab) return;

      fab.addEventListener('click', () => {
        UI.Haptic.tap();

        const current = Core.State.get('currentPage') || 'home';

        const actions = {
          home: [
            { label: 'استيراد JSON', icon: '📥', action: () => this.openImportDialog() },
            { label: 'تصدير نسخة', icon: '💾', action: () => Core.Exporter.exportBackup() },
            { label: 'لوحة الإدارة', icon: '🛡️', action: () => Admin.open() }
          ],
          matches: [
            { label: 'مباراة جديدة', icon: '➕', action: () => Admin.matchForm() },
            { label: 'تسجيل نتيجة', icon: '📝', action: () => Admin.quickScore() }
          ],
          standings: [
            { label: 'تصدير PDF', icon: '📄', action: () => Core.Exporter.exportPDF() }
          ],
          default: [
            { label: 'استيراد JSON', icon: '📥', action: () => this.openImportDialog() }
          ]
        };

        const items = actions[current] || actions.default;

        if (items.length === 1) {
          items[0].action();
          return;
        }

        this.showFABMenu(items);
      });
    },

    showFABMenu(items) {
      const menu = document.createElement('div');
      menu.className = 'fab-menu open';

      menu.innerHTML = items.map((item, i) => `
        <button
          class="fab-menu-item"
          type="button"
          data-fab-index="${i}"
        >
          <span>${item.icon}</span>
          <span>${UI.escape(item.label)}</span>
        </button>
      `).join('');

      document.body.appendChild(menu);

      menu.querySelectorAll('[data-fab-index]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.fabIndex);
          const item = items[idx];
          if (item) item.action();
          menu.remove();
        });
      });

      const closeMenu = e => {
        if (!menu.contains(e.target) && !e.target.closest('#fabImport')) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      };

      setTimeout(() => {
        document.addEventListener('click', closeMenu);
      }, 50);
    },

    /* ============================================================
       SERVICE WORKER
       ============================================================ */
    registerServiceWorker() {
      if (!('serviceWorker' in navigator)) return;

      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        return;
      }

      navigator.serviceWorker
        .register('sw.js')
        .then(reg => {
          console.log('[SW] Registered:', reg.scope);
        })
        .catch(err => {
          console.warn('[SW] Registration failed:', err);
        });
    },

    /* ============================================================
       BEFORE UNLOAD
       ============================================================ */
    wireUnload() {
      window.addEventListener('beforeunload', () => {
        Core.Sync.flush();
      });
    },

    /* ============================================================
       INIT — Full Bootstrap
       ============================================================ */
    async init() {
      this.wireFileInput();
      this.wireFAB();
      this.wireUnload();

      await this.bootstrap();
    }

  };

  /* ============================================================
     AUTO-START
     ============================================================ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

  /* ============================================================
     EXPORT
     ============================================================ */

  window.App = App;

  window.LeagueApp = {
    start: () => App.init(),
    navigate: (page) => App.navigate(page)
  };

})(window);