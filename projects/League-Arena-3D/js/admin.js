/* ============================================================
   ADMIN.JS — لوحة التحكم الإدارية
   Dashboard | Teams | Players | Matches | Live | Settings | Audit | Ratings
   ============================================================ */

(function (window) {
  'use strict';

  const Admin = {
    currentTab: 'dashboard',
    searchQuery: '',
    bulkSelection: new Set(),

    /* ============================================================
       OPEN — نقطة الدخول
       ============================================================ */
    open() {
      if (!Core.Permissions.isAdmin()) {
        this.showLogin();
        return;
      }
      this.render('dashboard');
    },

    /* ============================================================
       LOGIN
       ============================================================ */
    showLogin() {
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="admin-note">
          الوضع الحالي: <b>عرض فقط</b>. أدخل رمز الإدارة لتفعيل التعديل.
          <br>الرمز الافتراضي لأول تشغيل: <b>1234</b>.
        </div>
        <div class="field" style="margin-top:var(--space-4)">
          <label for="adminPin">رمز PIN</label>
          <input
            id="adminPin"
            class="input-control admin-pin"
            type="password"
            inputmode="numeric"
            maxlength="12"
            autocomplete="current-password"
            placeholder="••••"
          >
        </div>
      `;

      UI.Modal.open('الدخول إلى لوحة الإدارة', content, {
        confirmText: 'تفعيل الإدارة',
        onConfirm: () => {
          const val = document.getElementById('adminPin')?.value || '';
          if (Core.Permissions.login(val)) {
            UI.Toast.success('تم تفعيل وضع الإدارة.');
            UI.Haptic.success();
            this.render('dashboard');
          } else {
            UI.Toast.error('رمز الإدارة غير صحيح.');
            UI.Haptic.error();
          }
        }
      });

      setTimeout(() => {
        document.getElementById('adminPin')?.focus();
      }, 150);
    },

    /* ============================================================
       RENDER — البنية العامة
       ============================================================ */
    render(tab = this.currentTab) {
      this.currentTab = tab;

      const host = document.getElementById('pageHost');
      if (!host) return;

      host.querySelectorAll('[data-screen]').forEach(s => {
        s.hidden = true;
        s.innerHTML = '';
      });

      const screen = host.querySelector('[data-screen="admin"]');
      if (!screen) return;

      screen.hidden = false;
      screen.innerHTML = '';

      const data = Core.State.data;
      const isAdmin = Core.Permissions.isAdmin();

      const totalEvents = data.matches.reduce(
        (n, m) => n + (m.events?.length || 0), 0
      );

      const shell = document.createElement('div');
      shell.className = 'admin-shell';

      shell.innerHTML = `
        <section class="admin-hero">
          <span class="admin-tag">LEAGUE CONTROL CENTER</span>
          <h1>لوحة الإدارة</h1>
          <p>
            إدارة بيانات البطولة محلياً ·
            ${isAdmin ? 'صلاحية المدير مفعّلة' : 'وضع العرض فقط'}
          </p>
        </section>

        <div class="admin-stats">
          <div class="admin-stat">
            <strong>${data.teams.length}</strong>
            <span>الفرق</span>
          </div>
          <div class="admin-stat">
            <strong>${data.players.length}</strong>
            <span>اللاعبون</span>
          </div>
          <div class="admin-stat">
            <strong>${data.matches.length}</strong>
            <span>المباريات</span>
          </div>
          <div class="admin-stat">
            <strong>${totalEvents}</strong>
            <span>الأحداث</span>
          </div>
        </div>

        <div class="admin-tabs">
          ${[
            ['dashboard', 'نظرة عامة'],
            ['teams', 'الفرق'],
            ['players', 'اللاعبون'],
            ['matches', 'المباريات'],
            ['live', 'الأحداث الحية'],
            ['settings', 'قواعد البطولة'],
            ['ratings', 'التقييمات'],
            ['audit', 'سجل التعديلات']
          ].map(([key, label]) => `
            <button
              type="button"
              data-admin-tab="${key}"
              class="${this.currentTab === key ? 'active' : ''}"
            >
              ${label}
            </button>
          `).join('')}
        </div>

        <div id="adminContent"></div>
      `;

      screen.appendChild(shell);

      shell.querySelectorAll('[data-admin-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          UI.Haptic.tap();
          this.render(btn.dataset.adminTab);
        });
      });

      this.renderTab();

      UI.Animations.enter(screen);
      UI.BottomNav.update('admin');

      const main = document.getElementById('mainContent');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderTab() {
      const el = document.getElementById('adminContent');
      if (!el) return;

      const isAdmin = Core.Permissions.isAdmin();
      const renderer = {
        dashboard: this.tabDashboard,
        teams: this.tabTeams,
        players: this.tabPlayers,
        matches: this.tabMatches,
        live: this.tabLive,
        settings: this.tabSettings,
        audit: this.tabAudit,
        ratings: this.tabRatings
      }[this.currentTab];

      el.innerHTML = '';
      if (renderer) {
        renderer.call(this, el, isAdmin);
      }
    },

    /* ============================================================
       DASHBOARD TAB
       ============================================================ */
    tabDashboard(el, isAdmin) {
      const data = Core.State.data;
      const audit = Core.Audit.getRecent(5);

      el.innerHTML = `
        <div class="admin-section">
          <div class="admin-section-header">
            <h2>إجراءات سريعة</h2>
            <span class="admin-subtle">اختصارات</span>
          </div>
          <div class="admin-toolbar">
            <button class="admin-primary" data-admin-action="add-team" ${!isAdmin ? 'disabled' : ''}>
              ＋ فريق جديد
            </button>
            <button class="admin-secondary" data-admin-action="add-player" ${!isAdmin ? 'disabled' : ''}>
              ＋ لاعب جديد
            </button>
            <button class="admin-secondary" data-admin-action="add-match" ${!isAdmin ? 'disabled' : ''}>
              ＋ مباراة جديدة
            </button>
            <button class="admin-secondary" data-admin-action="quick-score" ${!isAdmin ? 'disabled' : ''}>
              تسجيل نتيجة
            </button>
          </div>
        </div>

        <div class="admin-section">
          <div class="admin-section-header">
            <h2>صحة البيانات</h2>
            <button class="admin-secondary" data-admin-action="validate">فحص</button>
          </div>
          <div class="admin-note">${this.healthReport()}</div>
        </div>

        <div class="admin-section">
          <div class="admin-section-header">
            <h2>آخر التعديلات</h2>
            <button class="admin-secondary" data-admin-tab="audit">عرض الكل</button>
          </div>
          <div class="admin-list">
            ${audit.length
              ? audit.map(a => `
                  <div class="admin-row">
                    <div class="admin-row-main">
                      <strong>${UI.escape(a.action || 'تعديل')}</strong>
                      <small>
                        ${UI.escape(a.entity || '')} ·
                        ${UI.escape(a.entityId || '')} ·
                        ${Helpers.timeAgo(a.timestamp)}
                      </small>
                    </div>
                  </div>
                `).join('')
              : '<div class="admin-empty">لا توجد تعديلات مسجلة.</div>'
            }
          </div>
        </div>

        <div class="admin-section">
          <div class="admin-section-header">
            <h2>ملخص البطولة</h2>
          </div>
          <div class="admin-list">
            <div class="admin-row">
              <div class="admin-row-main">
                <strong>${UI.escape(data.league.name)}</strong>
                <small>الموسم ${UI.escape(data.league.season || '—')}</small>
              </div>
            </div>
            <div class="admin-row">
              <div class="admin-row-main">
                <strong>نظام النقاط</strong>
                <small>
                  فوز: ${data.league.settings?.winPoints ?? 3} ·
                  تعادل: ${data.league.settings?.drawPoints ?? 1} ·
                  خسارة: ${data.league.settings?.lossPoints ?? 0}
                </small>
              </div>
            </div>
            <div class="admin-row">
              <div class="admin-row-main">
                <strong>حد الإنذار</strong>
                <small>${data.league.settings?.yellowForSuspension ?? 3} بطاقات صفراء = إيقاف</small>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    healthReport() {
      const data = Core.State.data;
      const issues = [];

      if (!data.teams.length) issues.push('لا توجد فرق مسجلة.');
      if (data.teams.length < 2) issues.push('يلزم فريقان على الأقل لإنشاء مباريات.');

      const teamIds = new Set(data.teams.map(t => t.id));

      data.players.forEach(p => {
        if (!teamIds.has(p.teamId)) {
          issues.push(`لاعب بدون فريق صحيح: ${p.name}`);
        }
      });

      data.matches.forEach(m => {
        if (m.homeTeamId === m.awayTeamId) {
          issues.push(`مباراة بفريق واحد: ${m.id}`);
        }
        if (!teamIds.has(m.homeTeamId) || !teamIds.has(m.awayTeamId)) {
          issues.push(`مباراة بفريق غير موجود: ${m.id}`);
        }
      });

      if (!issues.length) {
        return '✓ لم تُكتشف تعارضات أساسية في البيانات.';
      }

      return '⚠ ' + issues.slice(0, 6).map(UI.escape).join(' · ');
    },

    /* ============================================================
       TEAMS TAB
       ============================================================ */
    tabTeams(el, isAdmin) {
      const data = Core.State.data;

      el.innerHTML = `
        <div class="admin-toolbar">
          <input
            class="admin-search"
            id="teamAdminSearch"
            type="search"
            placeholder="ابحث عن فريق..."
            autocomplete="off"
          >
          <button class="admin-primary" data-admin-action="add-team" ${!isAdmin ? 'disabled' : ''}>
            ＋ إضافة فريق
          </button>
          <button class="admin-secondary" data-admin-action="bulk-delete-teams" ${!isAdmin ? 'disabled' : ''}>
            حذف المحدد
          </button>
        </div>

        <div class="admin-list" id="teamsAdminList">
          ${data.teams.length
            ? data.teams.map(t => `
                <div class="admin-row" data-search="${UI.escape((t.name + ' ' + (t.shortName || '') + ' ' + (t.coach || '')).toLowerCase())}">
                  <input
                    class="admin-check"
                    type="checkbox"
                    data-bulk-id="${UI.escape(t.id)}"
                    data-bulk-entity="teams"
                    ${!isAdmin ? 'disabled' : ''}
                  >
                  ${UI.badge(t)}
                  <div class="admin-row-main">
                    <strong>${UI.escape(t.name)}</strong>
                    <small>
                      ${UI.escape(t.shortName || '')} ·
                      المجموعة ${UI.escape(t.group || 'A')} ·
                      ${UI.escape(t.stadium || 'ملعب غير محدد')}
                    </small>
                  </div>
                  <div class="admin-actions">
                    <button data-admin-action="view-team" data-id="${UI.escape(t.id)}">عرض</button>
                    <button data-admin-action="edit-team" data-id="${UI.escape(t.id)}" ${!isAdmin ? 'disabled' : ''}>
                      تعديل
                    </button>
                    <button class="danger" data-admin-action="delete-team" data-id="${UI.escape(t.id)}" ${!isAdmin ? 'disabled' : ''}>
                      حذف
                    </button>
                  </div>
                </div>
              `).join('')
            : '<div class="admin-empty">لا توجد فرق مسجلة.</div>'
          }
        </div>
      `;

      setTimeout(() => {
        const search = document.getElementById('teamAdminSearch');
        if (search) {
          search.addEventListener('input', UI.debounce(e => {
            const q = e.target.value.toLowerCase().trim();
            el.querySelectorAll('.admin-row[data-search]').forEach(row => {
              row.hidden = q && !row.dataset.search.includes(q);
            });
          }, 180));
        }
      }, 0);
    },

    teamForm(team = {}) {
      const isEdit = !!team.id;

      const form = document.createElement('div');
      form.innerHTML = `
        <div class="admin-form">
          <div class="field full">
            <label>اسم الفريق *</label>
            <input type="text" name="name" required value="${UI.escape(team.name || '')}">
          </div>
          <div class="two-col">
            <div class="field">
              <label>الاسم المختصر</label>
              <input type="text" name="shortName" value="${UI.escape(team.shortName || '')}">
            </div>
            <div class="field">
              <label>المجموعة</label>
              <input type="text" name="group" value="${UI.escape(team.group || 'A')}">
            </div>
          </div>
          <div class="two-col">
            <div class="field">
              <label>سنة التأسيس</label>
              <input type="number" name="founded" min="1800" max="2100" value="${team.founded || ''}">
            </div>
            <div class="field">
              <label>المدرب</label>
              <input type="text" name="coach" value="${UI.escape(team.coach || '')}">
            </div>
          </div>
          <div class="field full">
            <label>الملعب</label>
            <input type="text" name="stadium" value="${UI.escape(team.stadium || '')}">
          </div>
          <div class="two-col">
            <div class="field">
              <label>اللون الأساسي</label>
              <input type="color" name="colorPrimary" value="${team.colors?.primary || '#0b6e4f'}">
            </div>
            <div class="field">
              <label>اللون الثانوي</label>
              <input type="color" name="colorSecondary" value="${team.colors?.secondary || '#d4af37'}">
            </div>
          </div>
          <div class="field full">
            <label>الشعار (رابط أو Data URL)</label>
            <input type="text" name="logo" value="${UI.escape(team.logo || '')}" placeholder="https://... أو data:image/...">
          </div>
        </div>
      `;

      UI.Modal.open(isEdit ? 'تعديل فريق' : 'إضافة فريق جديد', form, {
        confirmText: isEdit ? 'حفظ التعديلات' : 'إنشاء الفريق',
        onConfirm: () => {
          const values = this.readFormValues(form);
          if (!values.name) {
            UI.Toast.error('اسم الفريق مطلوب.');
            return;
          }

          const payload = {
            name: values.name,
            shortName: values.shortName || values.name,
            group: values.group || 'A',
            founded: values.founded ? Number(values.founded) : null,
            coach: values.coach || '',
            stadium: values.stadium || '',
            logo: values.logo || '',
            colors: {
              primary: values.colorPrimary || '#0b6e4f',
              secondary: values.colorSecondary || '#d4af37'
            }
          };

          if (isEdit) {
            Core.CRUD.update('teams', team.id, payload);
            UI.Toast.success('تم حفظ التعديلات.');
          } else {
            payload.id = Core.CRUD.generateId('team');
            Core.CRUD.create('teams', payload);
            UI.Toast.success('تم إضافة الفريق.');
          }

          UI.Haptic.success();
          this.renderTab();
        }
      });
    },

    /* ============================================================
       PLAYERS TAB
       ============================================================ */
    tabPlayers(el, isAdmin) {
      const data = Core.State.data;

      if (!data.teams.length) {
        el.innerHTML = '<div class="admin-empty">أضف فرقاً أولاً لتتمكن من إضافة لاعبين.</div>';
        return;
      }

      el.innerHTML = `
        <div class="admin-toolbar">
          <input
            class="admin-search"
            id="playerAdminSearch"
            type="search"
            placeholder="ابحث عن لاعب..."
            autocomplete="off"
          >
          <select id="playerTeamFilter" class="select-control" style="max-width:200px">
            <option value="">كل الفرق</option>
            ${data.teams.map(t => `
              <option value="${UI.escape(t.id)}">${UI.escape(t.name)}</option>
            `).join('')}
          </select>
          <button class="admin-primary" data-admin-action="add-player" ${!isAdmin ? 'disabled' : ''}>
            ＋ إضافة لاعب
          </button>
          <button class="admin-secondary" data-admin-action="bulk-delete-players" ${!isAdmin ? 'disabled' : ''}>
            حذف المحدد
          </button>
        </div>

        <div class="admin-list" id="playersAdminList">
          ${data.players.length
            ? data.players.map(p => {
                const team = Core.team(p.teamId) || {};
                return `
                  <div class="admin-row" data-player-id="${UI.escape(p.id)}" data-team="${UI.escape(p.teamId)}" data-search="${UI.escape((p.name + ' ' + (team.name || '')).toLowerCase())}">
                    <input
                      class="admin-check"
                      type="checkbox"
                      data-bulk-id="${UI.escape(p.id)}"
                      data-bulk-entity="players"
                      ${!isAdmin ? 'disabled' : ''}
                    >
                    ${UI.Badges.avatar(p.name, p.photo)}
                    <div class="admin-row-main">
                      <strong>${UI.escape(p.name)} <span class="admin-subtle">#${p.number ?? '—'}</span></strong>
                      <small>
                        ${UI.escape(team.name || 'بدون فريق')} ·
                        ${UI.escape(p.position || '—')} ·
                        ${UI.escape(p.status || 'نشط')}
                      </small>
                    </div>
                    <div class="admin-actions">
                      <button data-admin-action="edit-player" data-id="${UI.escape(p.id)}" ${!isAdmin ? 'disabled' : ''}>
                        تعديل
                      </button>
                      <button class="danger" data-admin-action="delete-player" data-id="${UI.escape(p.id)}" ${!isAdmin ? 'disabled' : ''}>
                        حذف
                      </button>
                    </div>
                  </div>
                `;
              }).join('')
            : '<div class="admin-empty">لا يوجد لاعبون.</div>'
          }
        </div>
      `;

      setTimeout(() => {
        const search = document.getElementById('playerAdminSearch');
        const teamFilter = document.getElementById('playerTeamFilter');

        const applyFilter = () => {
          const q = (search?.value || '').toLowerCase().trim();
          const teamId = teamFilter?.value || '';
          el.querySelectorAll('.admin-row[data-player-id]').forEach(row => {
            const matchesSearch = !q || row.dataset.search.includes(q);
            const matchesTeam = !teamId || row.dataset.team === teamId;
            row.hidden = !(matchesSearch && matchesTeam);
          });
        };

        search?.addEventListener('input', UI.debounce(applyFilter, 180));
        teamFilter?.addEventListener('change', applyFilter);
      }, 0);
    },

    playerForm(player = {}) {
      const isEdit = !!player.id;
      const data = Core.State.data;

      if (!data.teams.length) {
        UI.Toast.error('أضف فريقاً أولاً.');
        return;
      }

      const form = document.createElement('div');
      form.innerHTML = `
        <div class="admin-form">
          <div class="field full">
            <label>اسم اللاعب *</label>
            <input type="text" name="name" required value="${UI.escape(player.name || '')}">
          </div>
          <div class="two-col">
            <div class="field">
              <label>رقم القميص</label>
              <input type="number" name="number" min="0" max="999" value="${player.number ?? ''}">
            </div>
            <div class="field">
              <label>المركز</label>
              <select name="position">
                ${[['GK', 'حارس مرمى'], ['DF', 'دفاع'], ['MF', 'وسط'], ['FW', 'هجوم']].map(([v, l]) => `
                  <option value="${v}" ${player.position === v ? 'selected' : ''}>${l}</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="two-col">
            <div class="field">
              <label>الفريق *</label>
              <select name="teamId" required>
                ${data.teams.map(t => `
                  <option value="${UI.escape(t.id)}" ${player.teamId === t.id ? 'selected' : ''}>
                    ${UI.escape(t.name)}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="field">
              <label>الجنسية</label>
              <input type="text" name="nationality" value="${UI.escape(player.nationality || 'YE')}">
            </div>
          </div>
          <div class="two-col">
            <div class="field">
              <label>تاريخ الميلاد</label>
              <input type="date" name="birthdate" value="${player.birthdate || ''}">
            </div>
            <div class="field">
              <label>الحالة</label>
              <select name="status">
                ${['active', 'injured', 'suspended'].map(s => {
                  const label = { active: 'نشط', injured: 'مصاب', suspended: 'موقوف' }[s];
                  return `<option value="${s}" ${player.status === s ? 'selected' : ''}>${label}</option>`;
                }).join('')}
              </select>
            </div>
          </div>
          <div class="field full">
            <label>الصورة (رابط)</label>
            <input type="text" name="photo" value="${UI.escape(player.photo || '')}">
          </div>
        </div>
      `;

      UI.Modal.open(isEdit ? 'تعديل لاعب' : 'إضافة لاعب جديد', form, {
        confirmText: isEdit ? 'حفظ التعديلات' : 'إنشاء اللاعب',
        onConfirm: () => {
          const values = this.readFormValues(form);
          if (!values.name || !values.teamId) {
            UI.Toast.error('الاسم والفريق مطلوبان.');
            return;
          }

          const payload = {
            name: values.name,
            number: values.number ? Number(values.number) : null,
            position: values.position || 'MF',
            teamId: values.teamId,
            nationality: values.nationality || '',
            birthdate: values.birthdate || null,
            status: values.status || 'active',
            photo: values.photo || ''
          };

          if (isEdit) {
            Core.CRUD.update('players', player.id, payload);
            UI.Toast.success('تم حفظ التعديلات.');
          } else {
            payload.id = Core.CRUD.generateId('player');
            Core.CRUD.create('players', payload);
            UI.Toast.success('تم إضافة اللاعب.');
          }

          UI.Haptic.success();
          this.renderTab();
        }
      });
    },

    /* ============================================================
       MATCHES TAB
       ============================================================ */
    tabMatches(el, isAdmin) {
      const data = Core.State.data;

      if (data.teams.length < 2) {
        el.innerHTML = '<div class="admin-empty">يلزم فريقان على الأقل لإنشاء مباريات.</div>';
        return;
      }

      el.innerHTML = `
        <div class="admin-toolbar">
          <select id="matchStatusFilter" class="select-control" style="max-width:180px">
            <option value="">كل الحالات</option>
            <option value="upcoming">قادمة</option>
            <option value="live">مباشرة</option>
            <option value="finished">منتهية</option>
          </select>
          <button class="admin-primary" data-admin-action="add-match" ${!isAdmin ? 'disabled' : ''}>
            ＋ إنشاء مباراة
          </button>
          <button class="admin-secondary" data-admin-action="quick-score" ${!isAdmin ? 'disabled' : ''}>
            تسجيل نتيجة
          </button>
          <button class="admin-secondary" data-admin-action="schedule" ${!isAdmin ? 'disabled' : ''}>
            توليد جدول
          </button>
        </div>

        <div class="admin-list" id="matchesAdminList">
          ${data.matches.length
            ? data.matches
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(m => {
                  const home = Core.team(m.homeTeamId) || {};
                  const away = Core.team(m.awayTeamId) || {};
                  const score = m.status === 'upcoming'
                    ? '—'
                    : `${m.score?.home ?? 0} : ${m.score?.away ?? 0}`;

                  return `
                    <div class="admin-row" data-status="${UI.escape(m.status)}">
                      <div class="admin-row-main">
                        <strong>
                          ${UI.escape(home.name || '?')}
                          <span style="color:var(--color-primary-500);font-family:var(--font-mono)">${score}</span>
                          ${UI.escape(away.name || '?')}
                        </strong>
                        <small>
                          الجولة ${m.round || '—'} ·
                          ${Helpers.formatDate(m.date)} ·
                          ${UI.escape(m.stadium || '')} ·
                          ${UI.escape(m.status)}
                        </small>
                      </div>
                      <div class="admin-actions">
                        <button data-admin-action="match-live" data-id="${UI.escape(m.id)}">الأحداث</button>
                        <button data-admin-action="edit-match" data-id="${UI.escape(m.id)}" ${!isAdmin ? 'disabled' : ''}>
                          تعديل
                        </button>
                        <button class="danger" data-admin-action="delete-match" data-id="${UI.escape(m.id)}" ${!isAdmin ? 'disabled' : ''}>
                          حذف
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')
            : '<div class="admin-empty">لا توجد مباريات.</div>'
          }
        </div>
      `;

      setTimeout(() => {
        const filter = document.getElementById('matchStatusFilter');
        filter?.addEventListener('change', () => {
          const status = filter.value;
          el.querySelectorAll('.admin-row[data-status]').forEach(row => {
            row.hidden = status && row.dataset.status !== status;
          });
        });
      }, 0);
    },

    matchForm(match = {}) {
      const isEdit = !!match.id;
      const data = Core.State.data;

      if (data.teams.length < 2) {
        UI.Toast.error('يلزم فريقان على الأقل.');
        return;
      }

      const defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16);

      const form = document.createElement('div');
      form.innerHTML = `
        <div class="admin-form">
          <div class="field full">
            <label>الجولة</label>
            <input type="number" name="round" min="1" max="100" value="${match.round || 1}">
          </div>
          <div class="two-col">
            <div class="field">
              <label>الفريق المضيف *</label>
              <select name="homeTeamId" required>
                ${data.teams.map(t => `
                  <option value="${UI.escape(t.id)}" ${match.homeTeamId === t.id ? 'selected' : ''}>
                    ${UI.escape(t.name)}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="field">
              <label>الفريق الضيف *</label>
              <select name="awayTeamId" required>
                ${data.teams.map(t => `
                  <option value="${UI.escape(t.id)}" ${match.awayTeamId === t.id ? 'selected' : ''}>
                    ${UI.escape(t.name)}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="field full">
            <label>التاريخ والوقت *</label>
            <input type="datetime-local" name="date" required value="${(match.date || defaultDate).slice(0, 16)}">
          </div>
          <div class="two-col">
            <div class="field">
              <label>الملعب</label>
              <input type="text" name="stadium" value="${UI.escape(match.stadium || '')}">
            </div>
            <div class="field">
              <label>الحكم</label>
              <input type="text" name="referee" value="${UI.escape(match.referee || '')}">
            </div>
          </div>
          <div class="field full">
            <label>الحالة</label>
            <select name="status">
              ${[
                ['upcoming', 'قادمة'],
                ['live', 'مباشرة'],
                ['finished', 'منتهية'],
                ['postponed', 'مؤجلة']
              ].map(([v, l]) => `
                <option value="${v}" ${match.status === v ? 'selected' : ''}>${l}</option>
              `).join('')}
            </select>
          </div>
          <div class="two-col">
            <div class="field">
              <label>نتيجة المضيف</label>
              <input type="number" name="homeScore" min="0" value="${match.score?.home ?? 0}">
            </div>
            <div class="field">
              <label>نتيجة الضيف</label>
              <input type="number" name="awayScore" min="0" value="${match.score?.away ?? 0}">
            </div>
          </div>
        </div>
      `;

      UI.Modal.open(isEdit ? 'تعديل مباراة' : 'إنشاء مباراة جديدة', form, {
        confirmText: isEdit ? 'حفظ التعديلات' : 'إنشاء المباراة',
        onConfirm: () => {
          const values = this.readFormValues(form);

          if (values.homeTeamId === values.awayTeamId) {
            UI.Toast.error('لا يمكن أن يلعب الفريق ضد نفسه.');
            return;
          }

          if (!values.date) {
            UI.Toast.error('التاريخ مطلوب.');
            return;
          }

          const payload = {
            round: Number(values.round) || 1,
            homeTeamId: values.homeTeamId,
            awayTeamId: values.awayTeamId,
            date: new Date(values.date).toISOString(),
            stadium: values.stadium || '',
            referee: values.referee || '',
            status: values.status || 'upcoming',
            score: {
              home: Number(values.homeScore) || 0,
              away: Number(values.awayScore) || 0
            },
            events: match.events || [],
            ratings: match.ratings || {}
          };

          if (isEdit) {
            Core.CRUD.update('matches', match.id, payload);
            UI.Toast.success('تم حفظ التعديلات.');
          } else {
            payload.id = Core.CRUD.generateId('match');
            Core.CRUD.create('matches', payload);
            UI.Toast.success('تم إنشاء المباراة.');
          }

          UI.Haptic.success();
          this.renderTab();
        }
      });
    },

    /* ============================================================
       LIVE EVENTS TAB
       ============================================================ */
    tabLive(el, isAdmin) {
      const data = Core.State.data;
      const activeMatches = data.matches.filter(m => m.status !== 'finished');

      if (!activeMatches.length) {
        el.innerHTML = '<div class="admin-empty">لا توجد مباريات نشطة أو قادمة.</div>';
        return;
      }

      const currentId = Core.State.get('liveMatchId') || activeMatches[0].id;
      Core.State.set('liveMatchId', currentId);
      const match = data.matches.find(m => m.id === currentId) || activeMatches[0];

      const home = Core.team(match.homeTeamId) || {};
      const away = Core.team(match.awayTeamId) || {};

      el.innerHTML = `
        <div class="admin-note">
          اختر المباراة، ثم سجّل الأحداث. يمكنك تراجع آخر حدث.
          ${isAdmin ? '' : ' — <b>وضع العرض فقط</b>.'}
        </div>

        <div class="admin-toolbar">
          <select id="liveMatchSelect" class="select-control" style="max-width:100%">
            ${activeMatches.map(m => {
              const h = Core.team(m.homeTeamId)?.name || '?';
              const a = Core.team(m.awayTeamId)?.name || '?';
              return `
                <option value="${UI.escape(m.id)}" ${m.id === currentId ? 'selected' : ''}>
                  ${UI.escape(h)} — ${UI.escape(a)} (${m.status})
                </option>
              `;
            }).join('')}
          </select>
        </div>

        <div class="card" style="padding:var(--space-4);text-align:center">
          <div style="display:flex;justify-content:space-around;align-items:center;gap:var(--space-3)">
            <div>
              ${UI.badge(home, true)}
              <div style="font-size:var(--text-sm);font-weight:var(--font-bold);margin-top:var(--space-2)">
                ${UI.escape(home.name || '')}
              </div>
            </div>
            <div>
              <div style="font-family:var(--font-mono);font-size:var(--text-4xl);font-weight:var(--font-black);color:var(--color-primary-500)">
                ${match.score?.home ?? 0}
                <span style="color:var(--text-tertiary)">:</span>
                ${match.score?.away ?? 0}
              </div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:var(--space-1)">
                ${UI.escape(match.status)}
              </div>
            </div>
            <div>
              ${UI.badge(away, true)}
              <div style="font-size:var(--text-sm);font-weight:var(--font-bold);margin-top:var(--space-2)">
                ${UI.escape(away.name || '')}
              </div>
            </div>
          </div>
        </div>

        <div class="event-actions">
          <button class="event-action goal" data-admin-action="event-goal" ${!isAdmin ? 'disabled' : ''}>
            <span class="icon">⚽</span>
            <span>هدف</span>
          </button>
          <button class="event-action yellow" data-admin-action="event-yellow" ${!isAdmin ? 'disabled' : ''}>
            <span class="icon">🟨</span>
            <span>صفراء</span>
          </button>
          <button class="event-action red" data-admin-action="event-red" ${!isAdmin ? 'disabled' : ''}>
            <span class="icon">🟥</span>
            <span>حمراء</span>
          </button>
          <button class="event-action sub" data-admin-action="event-sub" ${!isAdmin ? 'disabled' : ''}>
            <span class="icon">🔁</span>
            <span>تبديل</span>
          </button>
        </div>

        <div class="admin-toolbar">
          <button class="admin-secondary" data-admin-action="start-match" ${!isAdmin ? 'disabled' : ''}>
            ▶ بدء المباراة
          </button>
          <button class="admin-primary" data-admin-action="finish-match" ${!isAdmin ? 'disabled' : ''}>
            ✓ إنهاء المباراة
          </button>
        </div>

        <div class="admin-section-header">
          <h2>الأحداث المسجلة (${(match.events || []).length})</h2>
        </div>
        <div class="admin-list" id="liveEventsList">
          ${this.renderEventsList(match)}
        </div>
      `;

      setTimeout(() => {
        const select = document.getElementById('liveMatchSelect');
        select?.addEventListener('change', e => {
          Core.State.set('liveMatchId', e.target.value);
          this.renderTab();
        });
      }, 0);
    },

    renderEventsList(match) {
      const events = (match.events || []).slice().sort((a, b) => b.minute - a.minute);

      if (!events.length) {
        return '<div class="admin-empty">لا توجد أحداث بعد.</div>';
      }

      const typeMap = {
        goal: '⚽ هدف',
        yellow: '🟨 بطاقة صفراء',
        red: '🟥 بطاقة حمراء',
        substitution: '🔁 تبديل',
        assist: '🅰️ صناعة هدف'
      };

      return events.map((ev) => {
        const player = Core.player(ev.playerId);
        const team = Core.team(ev.teamId);
        const realIndex = match.events.indexOf(ev);

        return `
          <div class="admin-row">
            <div class="admin-row-main">
              <strong>${typeMap[ev.type] || ev.type} · ${ev.minute}'</strong>
              <small>${UI.escape(player?.name || '—')} · ${UI.escape(team?.name || '')}</small>
            </div>
            <button class="admin-mini-btn danger" data-admin-action="undo-event" data-index="${realIndex}">
              تراجع
            </button>
          </div>
        `;
      }).join('');
    },

    /* ============================================================
       SETTINGS TAB
       ============================================================ */
    tabSettings(el, isAdmin) {
      const data = Core.State.data;
      const s = data.league.settings || {};
      const tiebreakers = s.tiebreakers || [];

      const ruleLabels = {
        points: 'النقاط',
        h2h: 'المواجهات المباشرة',
        h2hDiff: 'فارق المواجهات',
        h2hGoals: 'أهداف المواجهات',
        diff: 'فارق الأهداف',
        goals: 'الأهداف المسجلة',
        wins: 'الانتصارات',
        fairplay: 'اللعب النظيف',
        draw: 'القرعة'
      };

      el.innerHTML = `
        <form id="leagueSettingsForm" class="admin-form">
          <div class="field full">
            <label>اسم البطولة</label>
            <input type="text" name="name" required value="${UI.escape(data.league.name)}">
          </div>
          <div class="two-col">
            <div class="field">
              <label>الموسم</label>
              <input type="text" name="season" value="${UI.escape(data.league.season || '')}">
            </div>
            <div class="field">
              <label>الدولة</label>
              <input type="text" name="country" value="${UI.escape(data.league.country || '')}">
            </div>
          </div>

          <div class="admin-section-header">
            <h2>نظام النقاط</h2>
          </div>
          <div class="two-col">
            <div class="field">
              <label>نقاط الفوز</label>
              <input type="number" name="winPoints" min="0" max="10" value="${s.winPoints ?? 3}">
            </div>
            <div class="field">
              <label>نقاط التعادل</label>
              <input type="number" name="drawPoints" min="0" max="10" value="${s.drawPoints ?? 1}">
            </div>
          </div>
          <div class="field">
            <label>نقاط الخسارة</label>
            <input type="number" name="lossPoints" min="0" max="10" value="${s.lossPoints ?? 0}">
          </div>

          <div class="admin-section-header">
            <h2>الانضباط</h2>
          </div>
          <div class="two-col">
            <div class="field">
              <label>إنذار للإيقاف</label>
              <input type="number" name="yellowForSuspension" min="1" max="20" value="${s.yellowForSuspension ?? 3}">
            </div>
            <div class="field">
              <label>تصفير البطاقات بعد (جولات)</label>
              <input type="number" name="resetCardsAfterRounds" min="0" max="50" value="${s.resetCardsAfterRounds ?? 0}">
            </div>
          </div>

          <div class="admin-section-header">
            <h2>مراكز التأهل والهبوط</h2>
          </div>
          <div class="two-col">
            <div class="field">
              <label>مقاعد التأهل القاري</label>
              <input type="number" name="champions" min="0" max="20" value="${s.qualificationSpots?.champions ?? 4}">
            </div>
            <div class="field">
              <label>مقاعد الهبوط</label>
              <input type="number" name="relegation" min="0" max="20" value="${s.qualificationSpots?.relegation ?? 3}">
            </div>
          </div>

          <div class="field full">
            <label>ترتيب معايير كسر التعادل (اسحب لإعادة الترتيب)</label>
            <div class="admin-rules" id="tiebreakersList">
              ${tiebreakers.map((r, i) => `
                <div class="admin-rule" draggable="true" data-rule="${UI.escape(r)}">
                  <span class="grip">☰</span>
                  <b>${i + 1}.</b>
                  <span>${ruleLabels[r] || UI.escape(r)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="field full">
            <label>خصومات النقاط (teamId:points:reason — سطر لكل فريق)</label>
            <textarea name="deductions" rows="3">${(s.pointsDeduction || []).map(d => `${d.teamId}:${d.points}:${d.reason || ''}`).join('\n')}</textarea>
          </div>

          <div class="button-row" style="margin-top:var(--space-4)">
            <button type="submit" class="admin-primary" ${!isAdmin ? 'disabled' : ''}>
              حفظ قواعد البطولة
            </button>
            <button type="button" class="admin-secondary" data-admin-action="change-pin" ${!isAdmin ? 'disabled' : ''}>
              تغيير رمز PIN
            </button>
          </div>
        </form>
      `;

      setTimeout(() => {
        this.setupDragDrop(el);
        this.bindSettingsForm(el);
      }, 0);
    },

    setupDragDrop(el) {
      const list = el.querySelector('#tiebreakersList');
      if (!list) return;

      let dragged = null;

      list.querySelectorAll('[draggable]').forEach(item => {
        item.addEventListener('dragstart', () => {
          dragged = item;
          item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          dragged = null;
          [...list.children].forEach((child, i) => {
            const b = child.querySelector('b');
            if (b) b.textContent = `${i + 1}.`;
          });
        });

        item.addEventListener('dragover', e => {
          e.preventDefault();
          if (!dragged || dragged === item) return;
          const rect = item.getBoundingClientRect();
          const after = e.clientY > rect.top + rect.height / 2;
          list.insertBefore(dragged, after ? item.nextSibling : item);
        });
      });
    },

    bindSettingsForm(el) {
      const form = el.querySelector('#leagueSettingsForm');
      if (!form) return;

      form.addEventListener('submit', e => {
        e.preventDefault();
        if (!Core.Permissions.isAdmin()) {
          UI.Toast.warning('هذه العملية تتطلب صلاحية الإدارة.');
          return;
        }

        const values = this.readFormValues(form);
        const data = Core.State.data;

        data.league.name = values.name.trim();
        data.league.season = values.season.trim();
        data.league.country = values.country.trim();

        data.league.settings.winPoints = Number(values.winPoints) || 0;
        data.league.settings.drawPoints = Number(values.drawPoints) || 0;
        data.league.settings.lossPoints = Number(values.lossPoints) || 0;
        data.league.settings.yellowForSuspension = Number(values.yellowForSuspension) || 3;
        data.league.settings.resetCardsAfterRounds = Number(values.resetCardsAfterRounds) || 0;

        data.league.settings.qualificationSpots = {
          champions: Number(values.champions) || 4,
          europa: data.league.settings.qualificationSpots?.europa || 2,
          relegation: Number(values.relegation) || 3
        };

        const rules = [...el.querySelectorAll('#tiebreakersList [data-rule]')];
        data.league.settings.tiebreakers = rules.map(r => r.dataset.rule);

        const deductions = (values.deductions || '')
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => {
            const [teamId, points, ...reason] = line.split(':');
            return { teamId, points: Number(points) || 0, reason: reason.join(':') };
          });
        data.league.settings.pointsDeduction = deductions;

        Core.CRUD.commit('update', 'league', 'settings');
        UI.Toast.success('تم حفظ قواعد البطولة.');
        UI.Haptic.success();
        this.renderTab();
      });
    },

    /* ============================================================
       AUDIT TAB
       ============================================================ */
    tabAudit(el, isAdmin) {
      const entries = Core.Audit.getAll();

      el.innerHTML = `
        <div class="admin-toolbar">
          <input
            class="admin-search"
            id="auditSearch"
            type="search"
            placeholder="فلترة السجل..."
            autocomplete="off"
          >
          <button class="admin-secondary" data-admin-action="export-audit">تصدير CSV</button>
          ${isAdmin ? '<button class="admin-secondary danger" data-admin-action="clear-audit">مسح السجل</button>' : ''}
        </div>

        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>الإجراء</th>
                <th>الكيان</th>
                <th>المعرّف</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              ${entries.length
                ? entries.slice(0, 100).map(e => `
                    <tr>
                      <td>${UI.escape(e.action || '')}</td>
                      <td>${UI.escape(e.entity || '')}</td>
                      <td style="font-family:var(--font-mono);font-size:var(--text-xs)">
                        ${UI.escape(e.entityId || '')}
                      </td>
                      <td>${Helpers.timeAgo(e.timestamp)}</td>
                    </tr>
                  `).join('')
                : '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary)">لا توجد تعديلات.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      `;

      setTimeout(() => {
        const search = document.getElementById('auditSearch');
        search?.addEventListener('input', UI.debounce(e => {
          const q = e.target.value.toLowerCase();
          el.querySelectorAll('.admin-table tbody tr').forEach(row => {
            row.hidden = q && !row.innerText.toLowerCase().includes(q);
          });
        }, 180));
      }, 0);
    },

    /* ============================================================
       RATINGS TAB
       ============================================================ */
    tabRatings(el, isAdmin) {
      const topRated = RatingsEngine.topRated(10);

      el.innerHTML = `
        <div class="admin-note">
          تقييم اللاعبين من 1 إلى 10. يُحسب المتوسط تلقائياً.
          أفضل اللاعبين يظهرون في "فريق الجولة".
        </div>

        <div class="admin-toolbar">
          <button class="admin-primary" data-admin-action="add-rating" ${!isAdmin ? 'disabled' : ''}>
            ＋ تقييم لاعب
          </button>
          <button class="admin-secondary" data-admin-action="fan-vote" ${!isAdmin ? 'disabled' : ''}>
            تصويت جمهور
          </button>
        </div>

        <div class="admin-section-header">
          <h2>أفضل اللاعبين تقييماً</h2>
        </div>
        <div class="admin-list">
          ${topRated.length
            ? topRated.map((x, i) => `
                <div class="admin-row">
                  <b style="font-family:var(--font-mono);color:var(--color-primary-500);font-size:var(--text-lg)">
                    ${i + 1}
                  </b>
                  ${UI.Badges.avatar(x.player.name, x.player.photo)}
                  <div class="admin-row-main">
                    <strong>${UI.escape(x.player.name)}</strong>
                    <small>${UI.escape(Core.team(x.player.teamId)?.name || '')} · ${x.count} تقييم</small>
                  </div>
                  <b style="font-family:var(--font-mono);font-size:var(--text-lg)">
                    ${x.avg.toFixed(1)}
                  </b>
                </div>
              `).join('')
            : '<div class="admin-empty">لا توجد تقييمات مسجلة.</div>'
          }
        </div>
      `;
    },

    ratingForm() {
      const data = Core.State.data;

      if (!data.players.length || !data.matches.length) {
        UI.Toast.error('تحتاج لاعبين ومباريات أولاً.');
        return;
      }

      const form = document.createElement('div');
      form.innerHTML = `
        <div class="admin-form">
          <div class="field full">
            <label>اللاعب</label>
            <select name="playerId">
              ${data.players.map(p => `
                <option value="${UI.escape(p.id)}">
                  ${UI.escape(p.name)} — ${UI.escape(Core.team(p.teamId)?.name || '')}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="field full">
            <label>المباراة</label>
            <select name="matchId">
              ${data.matches
                .filter(m => m.status === 'finished')
                .map(m => `
                  <option value="${UI.escape(m.id)}">
                    ${UI.escape(Core.team(m.homeTeamId)?.name || '')} —
                    ${UI.escape(Core.team(m.awayTeamId)?.name || '')}
                    (${m.round})
                  </option>
                `).join('')}
            </select>
          </div>
          <div class="field">
            <label>التقييم (1-10)</label>
            <input type="number" name="score" min="1" max="10" step="0.1" value="8">
          </div>
          <div class="field">
            <label>الناخب</label>
            <input type="text" name="voter" value="المدرب">
          </div>
        </div>
      `;

      UI.Modal.open('تقييم لاعب', form, {
        confirmText: 'حفظ التقييم',
        onConfirm: () => {
          const v = this.readFormValues(form);
          const score = Number(v.score);

          if (score < 1 || score > 10) {
            UI.Toast.error('التقييم يجب أن يكون بين 1 و10.');
            return;
          }

          RatingsEngine.add(v.playerId, v.matchId, score, v.voter || 'admin');
          UI.Toast.success('تم حفظ التقييم.');
          UI.Haptic.success();
          this.renderTab();
        }
      });
    },

    fanVoteForm() {
      const data = Core.State.data;

      if (!data.players.length || !data.matches.length) {
        UI.Toast.error('تحتاج لاعبين ومباريات أولاً.');
        return;
      }

      const form = document.createElement('div');
      form.innerHTML = `
        <div class="admin-form">
          <div class="field full">
            <label>المباراة</label>
            <select name="matchId">
              ${data.matches.map(m => `
                <option value="${UI.escape(m.id)}">
                  ${UI.escape(Core.team(m.homeTeamId)?.name || '')} —
                  ${UI.escape(Core.team(m.awayTeamId)?.name || '')}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="field full">
            <label>رجل المباراة</label>
            <select name="playerId">
              ${data.players.map(p => `
                <option value="${UI.escape(p.id)}">${UI.escape(p.name)}</option>
              `).join('')}
            </select>
          </div>
        </div>
      `;

      UI.Modal.open('تصويت الجمهور', form, {
        confirmText: 'تسجيل الصوت',
        onConfirm: () => {
          const v = this.readFormValues(form);
          RatingsEngine.fanVote(v.matchId, v.playerId);
          UI.Toast.success('تم تسجيل الصوت.');
          UI.Haptic.success();
        }
      });
    },

    /* ============================================================
       QUICK SCORE
       ============================================================ */
    quickScore() {
      const data = Core.State.data;
      const upcoming = data.matches.filter(m => m.status !== 'finished');

      if (!upcoming.length) {
        UI.Toast.info('لا توجد مباريات لتسجيل نتيجتها.');
        return;
      }

      const form = document.createElement('div');
      form.innerHTML = `
        <div class="admin-form">
          <div class="field full">
            <label>المباراة</label>
            <select name="matchId">
              ${upcoming.map(m => `
                <option value="${UI.escape(m.id)}">
                  ${UI.escape(Core.team(m.homeTeamId)?.name || '')} —
                  ${UI.escape(Core.team(m.awayTeamId)?.name || '')}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="two-col">
            <div class="field">
              <label>نتيجة المضيف</label>
              <input type="number" name="homeScore" min="0" value="0">
            </div>
            <div class="field">
              <label>نتيجة الضيف</label>
              <input type="number" name="awayScore" min="0" value="0">
            </div>
          </div>
        </div>
      `;

      UI.Modal.open('تسجيل نتيجة نهائية', form, {
        confirmText: 'اعتماد النتيجة',
        onConfirm: () => {
          const v = this.readFormValues(form);
          const match = data.matches.find(m => m.id === v.matchId);
          if (!match) return;

          match.score = {
            home: Number(v.homeScore) || 0,
            away: Number(v.awayScore) || 0
          };
          match.status = 'finished';

          Core.CRUD.commit('update', 'matches', match.id);
          UI.Toast.success('تم اعتماد النتيجة.');
          UI.Haptic.success();
          this.renderTab();
        }
      });
    },

    /* ============================================================
       LIVE EVENT ACTIONS
       ============================================================ */
    addEvent(type) {
      const data = Core.State.data;
      const matchId = Core.State.get('liveMatchId');
      const match = data.matches.find(m => m.id === matchId);

      if (!match) {
        UI.Toast.error('اختر مباراة أولاً.');
        return;
      }

      const players = data.players.filter(
        p => p.teamId === match.homeTeamId || p.teamId === match.awayTeamId
      );

      if (!players.length) {
        UI.Toast.error('لا يوجد لاعبون مسجلون لهذه المباراة.');
        return;
      }

      const typeLabels = {
        goal: 'تسجيل هدف',
        yellow: 'بطاقة صفراء',
        red: 'بطاقة حمراء',
        substitution: 'تبديل'
      };

      const form = document.createElement('div');
      form.innerHTML = `
        <div class="admin-form">
          <div class="field full">
            <label>اللاعب *</label>
            <select name="playerId" required>
              ${players.map(p => `
                <option value="${UI.escape(p.id)}">
                  ${UI.escape(p.name)} — ${UI.escape(Core.team(p.teamId)?.name || '')}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="field">
            <label>الدقيقة</label>
            <input type="number" name="minute" min="0" max="150" value="45">
          </div>
          <div class="field">
            <label>الفريق</label>
            <select name="teamId">
              <option value="${UI.escape(match.homeTeamId)}">
                ${UI.escape(Core.team(match.homeTeamId)?.name || '')}
              </option>
              <option value="${UI.escape(match.awayTeamId)}">
                ${UI.escape(Core.team(match.awayTeamId)?.name || '')}
              </option>
            </select>
          </div>
        </div>
      `;

      UI.Modal.open(typeLabels[type] || 'إضافة حدث', form, {
        confirmText: 'حفظ الحدث',
        onConfirm: () => {
          const v = this.readFormValues(form);

          if (!v.playerId) {
            UI.Toast.error('اختر لاعباً.');
            return;
          }

          match.events = match.events || [];
          match.events.push({
            id: Core.CRUD.generateId('event'),
            type,
            playerId: v.playerId,
            teamId: v.teamId,
            minute: Number(v.minute) || 0
          });

          if (type === 'goal') {
            match.score = match.score || { home: 0, away: 0 };
            if (v.teamId === match.homeTeamId) match.score.home++;
            else match.score.away++;
          }

          if (match.status === 'upcoming') {
            match.status = 'live';
          }

          Core.CRUD.commit('add-event', 'matches', match.id);
          UI.Toast.success('تم تسجيل الحدث.');

          if (type === 'goal') {
            UI.Animations.confetti(2200);
            UI.Haptic.success();
          } else {
            UI.Haptic.tap();
          }

          this.renderTab();
        }
      });
    },

    undoEvent(index) {
      const matchId = Core.State.get('liveMatchId');
      const match = Core.State.data.matches.find(m => m.id === matchId);
      if (!match || !match.events || !match.events[index]) return;

      const ev = match.events[index];

      if (ev.type === 'goal' && match.score) {
        if (ev.teamId === match.homeTeamId) {
          match.score.home = Math.max(0, match.score.home - 1);
        } else {
          match.score.away = Math.max(0, match.score.away - 1);
        }
      }

      match.events.splice(index, 1);
      Core.CRUD.commit('undo-event', 'matches', match.id);
      UI.Toast.info('تم التراجع عن الحدث.');
      this.renderTab();
    },

    changeMatchStatus(status) {
      const matchId = Core.State.get('liveMatchId');
      const match = Core.State.data.matches.find(m => m.id === matchId);
      if (!match) return;

      match.status = status;
      Core.CRUD.commit('update-status', 'matches', match.id);

      if (status === 'finished') {
        UI.Toast.success('تم إنهاء المباراة.');
        UI.Animations.confetti(2500);
        UI.Haptic.success();
      } else {
        UI.Toast.info('المباراة الآن مباشرة.');
      }

      this.renderTab();
    },

    /* ============================================================
       SCHEDULE GENERATION
       ============================================================ */
    generateSchedule() {
      const data = Core.State.data;

      if (data.teams.length < 2) {
        UI.Toast.error('يلزم فريقان على الأقل.');
        return;
      }

      UI.Modal.confirm(
        'توليد جدول المباريات',
        'سيتم إنشاء جدول Round Robin لفريق واحد. هل تريد المتابعة؟'
      ).then(confirmed => {
        if (!confirmed) return;

        const rounds = SchedulerEngine.generate(data.teams, { doubleRound: false });
        const base = new Date();
        let count = 0;

        rounds.forEach((games, i) => {
          games.forEach((g, j) => {
            const date = new Date(base.getTime() + (i * 7 + j) * 86400000);
            date.setHours(18, 0, 0, 0);

            data.matches.push({
              id: Core.CRUD.generateId('match'),
              round: i + 1,
              homeTeamId: g.homeTeamId,
              awayTeamId: g.awayTeamId,
              date: date.toISOString(),
              stadium: Core.team(g.homeTeamId)?.stadium || '',
              referee: '',
              status: 'upcoming',
              score: { home: 0, away: 0 },
              events: [],
              ratings: {}
            });
            count++;
          });
        });

        Core.CRUD.commit('generate-schedule', 'matches', 'bulk');
        UI.Toast.success(`تم إنشاء ${count} مباراة.`);
        UI.Haptic.success();
        this.renderTab();
      });
    },

    /* ============================================================
       CHANGE PIN
       ============================================================ */
    changePin() {
      const form = document.createElement('div');
      form.innerHTML = `
        <div class="admin-form">
          <div class="field">
            <label>رمز PIN الحالي</label>
            <input type="password" name="oldPin" inputmode="numeric" required>
          </div>
          <div class="field">
            <label>رمز PIN الجديد (4 أحرف على الأقل)</label>
            <input type="password" name="newPin" inputmode="numeric" minlength="4" required>
          </div>
        </div>
      `;

      UI.Modal.open('تغيير رمز الإدارة', form, {
        confirmText: 'تغيير الرمز',
        onConfirm: () => {
          const v = this.readFormValues(form);

          if (!Core.Permissions.verifyPin(v.oldPin)) {
            UI.Toast.error('الرمز الحالي غير صحيح.');
            return;
          }

          if (!v.newPin || v.newPin.length < 4) {
            UI.Toast.error('الرمز الجديد يجب أن يكون 4 أحرف على الأقل.');
            return;
          }

          Core.Permissions.setPin(v.newPin);
          UI.Toast.success('تم تغيير الرمز.');
          UI.Haptic.success();
        }
      });
    },

    /* ============================================================
       DELETE CONFIRMATION
       ============================================================ */
    confirmDelete(entityLabel, callback) {
      UI.Modal.confirm(
        'تأكيد الحذف',
        `سيتم حذف ${entityLabel}. لا يمكن التراجع عن هذه العملية.`
      ).then(confirmed => {
        if (confirmed) {
          callback();
          UI.Haptic.warning();
        }
      });
    },

    /* ============================================================
       BULK DELETE
       ============================================================ */
    bulkDelete(entity) {
      if (!Core.Permissions.isAdmin()) {
        UI.Toast.warning('تتطلب صلاحية الإدارة.');
        return;
      }

      const checked = [...document.querySelectorAll(
        `input[data-bulk-entity="${entity}"]:checked`
      )];

      const ids = checked.map(c => c.dataset.bulkId);

      if (!ids.length) {
        UI.Toast.warning('لم يتم تحديد أي عنصر.');
        return;
      }

      UI.Modal.confirm(
        'حذف عناصر متعددة',
        `سيتم حذف ${ids.length} عنصر. لا يمكن التراجع.`
      ).then(confirmed => {
        if (!confirmed) return;

        let count = 0;
        for (const id of ids) {
          if (Core.CRUD.delete(entity, id)) count++;
        }

        UI.Toast.success(`تم حذف ${count} عنصر.`);
        this.renderTab();
      });
    },

    /* ============================================================
       VIEW TEAM
       ============================================================ */
    viewTeam(id) {
      Core.State.set('teamId', id);
      Core.Router.navigate('team', { teamId: id });
      Pages.render('team', { teamId: id });
    },

    /* ============================================================
       VALIDATE DATA
       ============================================================ */
    validateData() {
      const result = Core.Validator.validate(Core.State.data);
      if (result.ok) {
        UI.Toast.success('البيانات سليمة.');
      } else {
        UI.Modal.alert(
          'أخطاء في البيانات',
          result.errors.slice(0, 10).join('\n')
        );
      }
    },

    /* ============================================================
       UTILITY: Read Form Values
       ============================================================ */
    readFormValues(container) {
      const values = {};
      container.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.name) values[el.name] = el.value;
      });
      return values;
    }
  };

  /* ============================================================
     EXPORT
     ============================================================ */
  window.Admin = Admin;

  /* ============================================================
     DELEGATED EVENT HANDLER
     ============================================================ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-admin-action]');
    if (!btn) return;

    const action = btn.dataset.adminAction;
    const id = btn.dataset.id;
    const index = btn.dataset.index;
    const data = Core.State.data;

    if (btn.disabled) return;

    switch (action) {
      case 'add-team':
        Admin.teamForm();
        break;
      case 'edit-team': {
        const team = data.teams.find(t => t.id === id);
        if (team) Admin.teamForm(team);
        break;
      }
      case 'delete-team':
        Admin.confirmDelete('الفريق', () => {
          Core.CRUD.delete('teams', id);
          UI.Toast.success('تم حذف الفريق.');
          Admin.renderTab();
        });
        break;
      case 'view-team':
        Admin.viewTeam(id);
        break;
      case 'bulk-delete-teams':
        Admin.bulkDelete('teams');
        break;

      case 'add-player':
        Admin.playerForm();
        break;
      case 'edit-player': {
        const player = data.players.find(p => p.id === id);
        if (player) Admin.playerForm(player);
        break;
      }
      case 'delete-player':
        Admin.confirmDelete('اللاعب', () => {
          Core.CRUD.delete('players', id);
          UI.Toast.success('تم حذف اللاعب.');
          Admin.renderTab();
        });
        break;
      case 'bulk-delete-players':
        Admin.bulkDelete('players');
        break;

      case 'add-match':
        Admin.matchForm();
        break;
      case 'edit-match': {
        const match = data.matches.find(m => m.id === id);
        if (match) Admin.matchForm(match);
        break;
      }
      case 'delete-match':
        Admin.confirmDelete('المباراة', () => {
          Core.CRUD.delete('matches', id);
          UI.Toast.success('تم حذف المباراة.');
          Admin.renderTab();
        });
        break;
      case 'match-live':
        Core.State.set('liveMatchId', id);
        Admin.render('live');
        break;
      case 'quick-score':
        Admin.quickScore();
        break;
      case 'schedule':
        Admin.generateSchedule();
        break;

      case 'event-goal':
        Admin.addEvent('goal');
        break;
      case 'event-yellow':
        Admin.addEvent('yellow');
        break;
      case 'event-red':
        Admin.addEvent('red');
        break;
      case 'event-sub':
        Admin.addEvent('substitution');
        break;
      case 'start-match':
        Admin.changeMatchStatus('live');
        break;
      case 'finish-match':
        Admin.changeMatchStatus('finished');
        break;
      case 'undo-event':
        Admin.undoEvent(Number(index));
        break;

      case 'change-pin':
        Admin.changePin();
        break;

      case 'add-rating':
        Admin.ratingForm();
        break;
      case 'fan-vote':
        Admin.fanVoteForm();
        break;

      case 'export-audit':
        Core.Exporter.exportAudit();
        break;
      case 'clear-audit':
        UI.Modal.confirm('مسح السجل', 'سيتم حذف كل سجل التعديلات. متابعة؟')
          .then(ok => {
            if (ok) {
              Core.Audit.clear();
              UI.Toast.success('تم مسح السجل.');
              Admin.renderTab();
            }
          });
        break;

      case 'validate':
        Admin.validateData();
        break;
    }
  });

})(window);