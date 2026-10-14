/* ============================================================
   PAGES.JS — شاشات العرض العامة
   Home | Teams | Team Detail | Matches | Live | Standings | Stats | Discipline | Settings
   ============================================================ */

(function (window) {
  'use strict';

  const Pages = {

    /* ============================================================
       RENDER ROUTER
       ============================================================ */
    render(page, params = {}) {
      const host = document.getElementById('pageHost');
      if (!host) return;

      host.querySelectorAll('[data-screen]').forEach(s => {
        s.hidden = true;
        s.innerHTML = '';
      });

      const screen = host.querySelector(`[data-screen="${page}"]`);
      if (!screen) {
        console.warn(`[Pages] Screen not found: ${page}`);
        return;
      }

      const data = Core.State.data;
      const renderer = this.getRenderer(page);

      if (!renderer) return;

      screen.hidden = false;
      screen.innerHTML = '';

      const content = renderer.call(this, data, params);
      if (content) screen.appendChild(content);

      UI.Animations.enter(screen);

      const navPage = ['team', 'live'].includes(page) ? 'matches' : page;
      UI.BottomNav.update(navPage);

      const main = document.getElementById('mainContent');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    },

    getRenderer(page) {
      const map = {
        home: this.home,
        teams: this.teams,
        team: this.teamDetail,
        matches: this.matches,
        live: this.matchLive,
        standings: this.standings,
        stats: this.stats,
        discipline: this.discipline,
        settings: this.settings
      };
      return map[page];
    },

    /* ============================================================
       HELPERS
       ============================================================ */
    heading(title, subtitle = '', eyebrow = '') {
      const div = document.createElement('div');
      div.className = 'page-heading';
      div.innerHTML = `
        <div>
          ${eyebrow ? `<div class="eyebrow">${UI.escape(eyebrow)}</div>` : ''}
          <h1>${UI.escape(title)}</h1>
          ${subtitle ? `<p>${UI.escape(subtitle)}</p>` : ''}
        </div>
      `;
      return div;
    },

    el(html) {
      return UI.element(html);
    },

    /* ============================================================
       HOME SCREEN
       ============================================================ */
    home(data) {
      const box = document.createElement('div');

      const standings = Engines.standings(data);
      const leader = standings[0];

      const today = new Date().toISOString().slice(0, 10);
      const todayMatches = data.matches.filter(m => m.date?.slice(0, 10) === today);

      const recent = data.matches
        .filter(m => m.status === 'finished')
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3);

      const upcoming = data.matches
        .filter(m => m.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

      const stripMatches = todayMatches.length ? todayMatches : upcoming;

      box.appendChild(this.heading(
        'لوحة البطولة',
        `${data.league.name} · موسم ${data.league.season}`,
        'MATCH CENTER'
      ));

      const finishedCount = data.matches.filter(m => m.status === 'finished').length;
      const heroHTML = `
        <section class="hero-card">
          <div class="hero-top">
            <div>
              <span class="gold-pill">✦ البطولة الرسمية</span>
              <h2>${UI.escape(data.league.name)}</h2>
              <p>تابع المنافسة، النتائج، والترتيب من لوحة واحدة.</p>
            </div>
            <span style="font-size:38px;position:relative;z-index:1">🏆</span>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <strong data-count="${data.teams.length}">0</strong>
              <span>فريق مشارك</span>
            </div>
            <div class="hero-stat">
              <strong data-count="${finishedCount}">0</strong>
              <span>مباراة مكتملة</span>
            </div>
            <div class="hero-stat">
              <strong data-count="${data.players.length}">0</strong>
              <span>لاعب مسجل</span>
            </div>
          </div>
        </section>
      `;
      box.appendChild(this.el(heroHTML));

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>مباريات اليوم</h2>
            <button class="text-link" data-go="matches">كل المباريات ←</button>
          </div>
          <div class="matches-strip">
            ${stripMatches.length
              ? stripMatches.slice(0, 5).map(m => this.miniMatchHTML(m, data)).join('')
              : `<div class="card empty-state" style="min-width:100%">
                  <div class="empty-icon">📅</div>
                  <strong>لا توجد مباريات اليوم</strong>
                  <p>ستظهر هنا أقرب المباريات المجدولة.</p>
                </div>`
            }
          </div>
        </section>
      `));

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>المتصدر الحالي</h2>
            <button class="text-link" data-go="standings">عرض الترتيب ←</button>
          </div>
          ${leader
            ? `<div class="leader-card">
                <span class="leader-crown">👑</span>
                ${UI.badge(leader.team)}
                <div class="leader-info">
                  <strong>${UI.escape(leader.team.name)}</strong>
                  <span>${leader.played} مباراة · ${leader.wins} فوز</span>
                </div>
                <div class="leader-points">
                  <strong data-count="${leader.points}">0</strong>
                  <small>نقطة</small>
                </div>
              </div>`
            : `<div class="card empty-state">لا توجد فرق بعد.</div>`
          }
        </section>
      `));

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>آخر النتائج</h2>
            <button class="text-link" data-go="matches" data-tab="past">عرض الكل ←</button>
          </div>
          <div class="last-result-list">
            ${recent.length
              ? recent.map(m => this.resultRowHTML(m, data)).join('')
              : `<div class="card empty-state">لم تسجل نتائج نهائية بعد.</div>`
            }
          </div>
        </section>
      `));

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>الوصول السريع</h2>
          </div>
          <div class="quick-grid">
            <button class="quick-action" data-go="teams">
              <span class="quick-icon">⚽</span>
              <span>الفرق</span>
            </button>
            <button class="quick-action" data-go="stats">
              <span class="quick-icon">🏅</span>
              <span>الهدافون</span>
            </button>
            <button class="quick-action" data-go="discipline">
              <span class="quick-icon">🟨</span>
              <span>الانضباط</span>
            </button>
          </div>
        </section>
      `));

      box.appendChild(this.el(`
        <section class="section">
          <div class="card settings-item">
            <span class="quick-icon">⟳</span>
            <div class="settings-item-copy">
              <strong>حالة البيانات</strong>
              <small>آخر تحديث: ${UI.escape(Helpers.timeAgo(data.updatedAt))}</small>
            </div>
            <button class="btn btn-soft" data-action="check-updates">تحقق</button>
          </div>
        </section>
      `));

      setTimeout(() => {
        box.querySelectorAll('[data-count]').forEach(el => {
          const target = Number(el.dataset.count);
          UI.Animations.countUp(el, target, 900);
        });
      }, 100);

      return box;
    },

    /* ============================================================
       TEAMS SCREEN
       ============================================================ */
    teams(data) {
      const box = document.createElement('div');

      box.appendChild(this.heading(
        'الفرق',
        'استعرض الأندية والإحصائيات حسب المجموعة',
        'CLUB DIRECTORY'
      ));

      const groups = [...new Set(data.teams.map(t => t.group || 'A'))].sort();
      const currentGroup = Core.State.get('group', 'all') || 'all';

      box.appendChild(this.el(`
        <div class="search-row">
          <label class="search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
            <input
              id="teamSearch"
              type="search"
              placeholder="ابحث عن فريق..."
              autocomplete="off"
            >
          </label>
        </div>
        <div class="group-filter" id="groupFilter">
          <button class="group-chip ${currentGroup === 'all' ? 'active' : ''}" data-group="all">كل المجموعات</button>
          ${groups.map(g => `
            <button class="group-chip ${currentGroup === g ? 'active' : ''}" data-group="${UI.escape(g)}">
              المجموعة ${UI.escape(g)}
            </button>
          `).join('')}
        </div>
        <div class="teams-grid" id="teamsGrid"></div>
      `));

      const renderGrid = () => {
        const q = document.getElementById('teamSearch')?.value || '';
        const group = Core.State.get('group', 'all') || 'all';
        const table = Engines.standings(data);

        let filtered = data.teams;
        if (group !== 'all') {
          filtered = filtered.filter(t => (t.group || 'A') === group);
        }
        filtered = UI.SearchUtils.filter(filtered, q, ['name', 'shortName', 'coach', 'stadium']);

        const grid = document.getElementById('teamsGrid');
        if (!grid) return;

        if (!filtered.length) {
          grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">🔍</div>
            <strong>لا توجد نتائج</strong>
            <p>جرّب تعديل البحث أو الفلتر.</p>
          </div>`;
          return;
        }

        grid.innerHTML = filtered.map(t => {
          const row = table.find(r => r.teamId === t.id);
          const position = table.findIndex(r => r.teamId === t.id) + 1;
          const formDots = (row?.form || []).map(f =>
            `<span class="form-dot ${f === 'W' ? 'win' : f === 'L' ? 'loss' : 'draw'}">${f}</span>`
          ).join('');

          return `
            <article class="card card-hover team-card" data-team="${UI.escape(t.id)}">
              <div class="team-card-top">
                ${UI.badge(t)}
                <div class="team-card-title">
                  <strong>${UI.escape(t.name)}</strong>
                  <small>المركز ${position} · ${UI.escape(t.group || 'A')}</small>
                </div>
              </div>
              <div class="team-points">
                ${row?.points ?? 0}
                <small>نقطة</small>
              </div>
              <div class="match-meta">
                <span>${row?.played ?? 0} لعب</span>
                <span class="team-form-strip">${formDots || '—'}</span>
              </div>
            </article>
          `;
        }).join('');
      };

      renderGrid();

      setTimeout(() => {
        const search = document.getElementById('teamSearch');
        if (search) {
          search.addEventListener('input', UI.debounce(renderGrid, 180));
          search.value = Core.State.get('search', '') || '';
        }

        const filter = document.getElementById('groupFilter');
        if (filter) {
          filter.addEventListener('click', e => {
            const chip = e.target.closest('[data-group]');
            if (!chip) return;
            Core.State.set('group', chip.dataset.group);
            filter.querySelectorAll('.group-chip').forEach(c =>
              c.classList.toggle('active', c === chip)
            );
            renderGrid();
          });
        }
      }, 0);

      return box;
    },

    /* ============================================================
       TEAM DETAIL SCREEN
       ============================================================ */
    teamDetail(data, params) {
      const teamId = params.teamId || Core.State.get('teamId');
      const team = data.teams.find(t => t.id === teamId);

      const box = document.createElement('div');

      if (!team) {
        box.innerHTML = `<div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <strong>الفريق غير موجود</strong>
          <p>ربما تم حذف الفريق.</p>
        </div>`;
        return box;
      }

      const stats = Engines.teamStats(team.id, data);
      const table = Engines.standings(data);
      const position = table.findIndex(r => r.teamId === team.id) + 1;

      const players = data.players.filter(p => p.teamId === team.id);
      const matches = data.matches
        .filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      box.appendChild(this.el(`
        <button class="text-link breadcrumb" data-go="teams" style="margin-bottom:var(--space-3)">
          <span>← العودة إلى الفرق</span>
        </button>
      `));

      box.appendChild(this.el(`
        <section class="team-hero" style="--team-color:${UI.escape(team.colors?.primary || '#0b6e4f')}">
          <div class="team-hero-row">
            ${UI.badge(team, true)}
            <div>
              <h1>${UI.escape(team.name)}</h1>
              <p>${UI.escape(team.stadium || 'الملعب غير محدد')} · تأسس ${team.founded || '—'}</p>
              ${team.coach ? `<p>المدرب: ${UI.escape(team.coach)}</p>` : ''}
            </div>
          </div>
        </section>
      `));

      box.appendChild(this.el(`
        <div class="stat-grid">
          <div class="stat-box"><strong>${stats.played}</strong><span>لعب</span></div>
          <div class="stat-box"><strong>${stats.wins}</strong><span>فاز</span></div>
          <div class="stat-box"><strong>${stats.draws}</strong><span>تعادل</span></div>
          <div class="stat-box"><strong>${stats.losses}</strong><span>خسر</span></div>
          <div class="stat-box"><strong>${stats.goalsFor}</strong><span>له</span></div>
          <div class="stat-box"><strong>${stats.goalsAgainst}</strong><span>عليه</span></div>
        </div>
      `));

      const positions = { GK: 'حراس المرمى', DF: 'الدفاع', MF: 'الوسط', FW: 'الهجوم' };
      const grouped = Helpers.groupBy(players, 'position');

      let playersHTML = '';
      for (const [pos, label] of Object.entries(positions)) {
        const list = grouped[pos] || [];
        if (!list.length) continue;

        playersHTML += `
          <div class="position-group">
            <div class="position-group-title">${label} (${list.length})</div>
            <div class="player-list">
              ${list.map(p => `
                <div class="card player-row">
                  ${UI.Badges.avatar(p.name, p.photo)}
                  <div class="player-details">
                    <strong>${UI.escape(p.name)}</strong>
                    <small>${UI.escape(p.nationality || '—')} · ${UI.escape(p.status || 'نشط')}</small>
                  </div>
                  <span class="player-number">#${p.number ?? '—'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>قائمة اللاعبين (${players.length})</h2>
          </div>
          ${playersHTML || '<div class="card empty-state">لا يوجد لاعبون مسجلون.</div>'}
        </section>
      `));

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>مباريات الفريق</h2>
          </div>
          <div class="match-list">
            ${matches.length
              ? matches.map(m => this.miniMatchHTML(m, data)).join('')
              : '<div class="card empty-state">لا توجد مباريات.</div>'
            }
          </div>
        </section>
      `));

      return box;
    },

    /* ============================================================
       MATCHES SCREEN
       ============================================================ */
    matches(data) {
      const box = document.createElement('div');

      box.appendChild(this.heading(
        'المباريات',
        'جدول النتائج والمواجهات القادمة',
        'FIXTURES & RESULTS'
      ));

      const currentTab = Core.State.get('matchTab', 'today') || 'today';

      box.appendChild(this.el(`
        <div class="tabs" id="matchTabs">
          <button class="tab ${currentTab === 'today' ? 'active' : ''}" data-tab="today">اليوم</button>
          <button class="tab ${currentTab === 'upcoming' ? 'active' : ''}" data-tab="upcoming">القادمة</button>
          <button class="tab ${currentTab === 'past' ? 'active' : ''}" data-tab="past">الماضية</button>
          <button class="tab ${currentTab === 'all' ? 'active' : ''}" data-tab="all">الكل</button>
        </div>
        <div id="matchList" class="match-list"></div>
      `));

      const renderList = () => {
        const tab = Core.State.get('matchTab', 'today') || 'today';
        const today = new Date().toISOString().slice(0, 10);

        let arr = data.matches.slice().sort((a, b) => a.date.localeCompare(b.date));

        if (tab === 'today') {
          arr = arr.filter(m => m.date.slice(0, 10) === today);
          if (!arr.length) arr = data.matches.filter(m => m.status === 'live');
        } else if (tab === 'upcoming') {
          arr = arr.filter(m => m.status === 'upcoming' || m.status === 'live');
        } else if (tab === 'past') {
          arr = arr.filter(m => m.status === 'finished').reverse();
        }

        const list = document.getElementById('matchList');
        if (!list) return;

        list.innerHTML = arr.length
          ? arr.map(m => this.matchCardHTML(m, data)).join('')
          : `<div class="card empty-state">
              <div class="empty-icon">📅</div>
              <strong>لا توجد مباريات في هذا القسم</strong>
              <p>غيّر التبويب أو استورد جدول المباريات.</p>
            </div>`;
      };

      renderList();

      setTimeout(() => {
        const tabs = document.getElementById('matchTabs');
        if (tabs) {
          tabs.addEventListener('click', e => {
            const tab = e.target.closest('[data-tab]');
            if (!tab) return;
            Core.State.set('matchTab', tab.dataset.tab);
            tabs.querySelectorAll('.tab').forEach(t =>
              t.classList.toggle('active', t === tab)
            );
            renderList();
            UI.Haptic.tap();
          });
        }
      }, 0);

      return box;
    },

    /* ============================================================
       MATCH LIVE SCREEN
       ============================================================ */
    matchLive(data, params) {
      const matchId = params.matchId || Core.State.get('matchId');
      const match = data.matches.find(m => m.id === matchId);

      const box = document.createElement('div');

      if (!match) {
        box.innerHTML = `<div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <strong>المباراة غير موجودة</strong>
        </div>`;
        return box;
      }

      const home = Core.team(match.homeTeamId) || {};
      const away = Core.team(match.awayTeamId) || {};
      const events = (match.events || []).slice().sort((a, b) => a.minute - b.minute);

      box.appendChild(this.el(`
        <button class="text-link breadcrumb" data-go="matches" style="margin-bottom:var(--space-3)">
          <span>← كل المباريات</span>
        </button>
      `));

      box.appendChild(this.el(`
        <section class="live-hero">
          <div style="margin-bottom:var(--space-3)">
            ${UI.status(match.status)} · الجولة ${match.round || '—'}
          </div>
          <div class="team-versus">
            <div class="team-mini">
              ${UI.badge(home, true)}
              <span>${UI.escape(home.name || '')}</span>
            </div>
            <div class="score">${match.score?.home ?? 0} - ${match.score?.away ?? 0}</div>
            <div class="team-mini">
              ${UI.badge(away, true)}
              <span>${UI.escape(away.name || '')}</span>
            </div>
          </div>
          <div class="live-time">${match.status === 'live' ? '● مباشر الآن' : Helpers.formatDateTime(match.date)}</div>
          ${match.stadium ? `<p style="margin-top:var(--space-2);color:rgba(255,255,255,0.7);font-size:var(--text-xs)">${UI.escape(match.stadium)}</p>` : ''}
        </section>
      `));

      const timelineHTML = events.length
        ? `<div class="timeline">
            ${events.map(ev => {
              const player = Core.player(ev.playerId);
              const team = Core.team(ev.teamId);
              const typeMap = {
                goal: '⚽ هدف',
                yellow: '🟨 بطاقة صفراء',
                red: '🟥 بطاقة حمراء',
                substitution: '🔁 تبديل',
                assist: '🅰️ صناعة هدف'
              };
              return `
                <div class="event-row ${UI.escape(ev.type)}">
                  <div class="event-minute">${ev.minute}'</div>
                  <div class="event-text">
                    ${typeMap[ev.type] || ev.type}
                    <small>${UI.escape(player?.name || 'حدث')} · ${UI.escape(team?.name || '')}</small>
                  </div>
                </div>
              `;
            }).join('')}
          </div>`
        : '<div class="empty-state">لم تُسجّل أحداث لهذه المباراة بعد.</div>';

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>أحداث المباراة</h2>
            <button class="btn btn-soft" data-action="add-event">＋ حدث</button>
          </div>
          <div class="card" style="padding:var(--space-4)">
            ${timelineHTML}
          </div>
        </section>
      `));

      const homePlayers = data.players.filter(p => p.teamId === home.id).slice(0, 11);

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>التشكيلة التكتيكية</h2>
          </div>
          <div class="pitch">
            <div class="pitch-circle"></div>
            <div class="pitch-players">
              ${homePlayers.map(p => `
                <span class="pitch-player">
                  <b>${p.number || '—'}</b>
                  ${UI.escape(Helpers.initials(p.name))}
                </span>
              `).join('')}
            </div>
          </div>
          <p class="field-hint" style="margin-top:var(--space-2)">
            عرض مبسّط للاعبين المسجلين. يمكن تعديل الأحداث من زر «حدث».
          </p>
        </section>
      `));

      const stats = [
        ['الاستحواذ', 54, 46],
        ['التسديدات', 8, 6],
        ['الركنيات', 5, 3],
        ['الأخطاء', 11, 14]
      ];

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>إحصائيات المباراة</h2>
          </div>
          <div class="card" style="padding:var(--space-4)">
            ${stats.map(([label, homeVal, awayVal]) => {
              const total = homeVal + awayVal || 1;
              const homePct = (homeVal / total) * 100;
              const awayPct = (awayVal / total) * 100;
              const suffix = label === 'الاستحواذ' ? '%' : '';
              return `
                <div class="bar-stat">
                  <b>${homeVal}${suffix}</b>
                  <div>
                    <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:5px">
                      <span>${label}</span>
                      <span>${awayVal}${suffix}</span>
                    </div>
                    <div class="bar-track">
                      <span class="bar-fill" style="width:${homePct}%"></span>
                      <span class="bar-fill away" style="width:${awayPct}%"></span>
                    </div>
                  </div>
                  <b>${awayVal}${suffix}</b>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `));

      return box;
    },

    /* ============================================================
       STANDINGS SCREEN
       ============================================================ */
    standings(data) {
      const box = document.createElement('div');

      box.appendChild(this.heading(
        'جدول الترتيب',
        'يتم احتساب النقاط والإحصائيات من المباريات المنتهية',
        'LEAGUE TABLE'
      ));

      const rows = Engines.standings(data);
      const q = data.league.settings?.qualificationSpots || { champions: 4, europa: 2, relegation: 3 };

      box.appendChild(this.el(`
        <div class="legend">
          <span><i></i> تأهل قاري</span>
          <span><i class="orange"></i> ملحق</span>
          <span><i class="red"></i> هبوط</span>
        </div>
        <div class="table-wrap">
          <table class="standings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الفريق</th>
                <th>لعب</th>
                <th>ف</th>
                <th>ت</th>
                <th>خ</th>
                <th>له</th>
                <th>عليه</th>
                <th>+/−</th>
                <th>نقاط</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, i) => {
                const rank = i + 1;
                let cls = '';
                if (rank <= q.champions) cls = 'rank-champions';
                else if (rank <= q.champions + q.europa) cls = 'rank-playoff';
                else if (rank > rows.length - q.relegation) cls = 'rank-relegation';

                return `
                  <tr class="${cls}" data-tiebreak="${UI.escape(r.teamId)}">
                    <td class="rank-cell">${rank}</td>
                    <td>
                      <span class="table-team">
                        ${UI.badge(r.team)}
                        ${UI.escape(r.team.name)}
                      </span>
                    </td>
                    <td>${r.played}</td>
                    <td>${r.wins}</td>
                    <td>${r.draws}</td>
                    <td>${r.losses}</td>
                    <td>${r.goalsFor}</td>
                    <td>${r.goalsAgainst}</td>
                    <td>${r.diff > 0 ? '+' : ''}${r.diff}</td>
                    <td class="points-cell">${r.points}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <p class="field-hint" style="margin-top:var(--space-3)">
          اضغط على أي فريق لعرض تفاصيل الترتيب ومعايير كسر التعادل.
        </p>
      `));

      return box;
    },

    /* ============================================================
       STATS SCREEN
       ============================================================ */
    stats(data) {
      const box = document.createElement('div');

      box.appendChild(this.heading(
        'الإحصائيات',
        'أبرز اللاعبين والأرقام في البطولة',
        'PLAYER STATISTICS'
      ));

      const currentTab = Core.State.get('statsTab', 'scorers') || 'scorers';

      const tabs = [
        { key: 'scorers', label: 'الهدافون' },
        { key: 'assists', label: 'الصنّاع' },
        { key: 'keepers', label: 'الحراس' },
        { key: 'fairplay', label: 'النظيف' }
      ];

      box.appendChild(this.el(`
        <div class="tabs stats-tabs" id="statsTabs">
          ${tabs.map(t => `
            <button class="tab ${currentTab === t.key ? 'active' : ''}" data-stats-tab="${t.key}">
              ${t.label}
            </button>
          `).join('')}
        </div>
        <div id="statsList" class="stats-list"></div>
      `));

      const renderList = () => {
        const tab = Core.State.get('statsTab', 'scorers') || 'scorers';
        const allStats = Engines.stats(data);
        const list = allStats[tab] || [];
        const keyMap = {
          scorers: 'goals',
          assists: 'assists',
          keepers: 'cleanSheets',
          fairplay: 'yellows'
        };
        const key = keyMap[tab];

        const filtered = list.filter(x => x[key] > 0).slice(0, 50);
        const container = document.getElementById('statsList');
        if (!container) return;

        if (!filtered.length) {
          container.innerHTML = `<div class="card empty-state">
            <div class="empty-icon">📊</div>
            <strong>لا توجد إحصائيات مسجلة</strong>
            <p>تُحتسب الأرقام من أحداث المباريات المنتهية.</p>
          </div>`;
          return;
        }

        container.innerHTML = filtered.map((x, i) => `
          <div class="card card-hover player-row ${i === 0 ? 'leader-stat' : ''}">
            ${UI.Badges.rank(i + 1)}
            ${UI.Badges.avatar(x.player.name, x.player.photo)}
            <div class="player-details">
              <strong>${UI.escape(x.player.name)}</strong>
              <small>${UI.escape(Core.team(x.player.teamId)?.name || '—')}</small>
            </div>
            <span class="stat-value">${x[key]}</span>
          </div>
        `).join('');
      };

      renderList();

      setTimeout(() => {
        const tabsEl = document.getElementById('statsTabs');
        if (tabsEl) {
          tabsEl.addEventListener('click', e => {
            const tab = e.target.closest('[data-stats-tab]');
            if (!tab) return;
            Core.State.set('statsTab', tab.dataset.statsTab);
            tabsEl.querySelectorAll('.tab').forEach(t =>
              t.classList.toggle('active', t === tab)
            );
            renderList();
            UI.Haptic.tap();
          });
        }
      }, 0);

      return box;
    },

    /* ============================================================
       DISCIPLINE SCREEN
       ============================================================ */
    discipline(data) {
      const box = document.createElement('div');

      box.appendChild(this.heading(
        'الانضباط',
        'البطاقات والإيقافات وقرارات اللجنة',
        'DISCIPLINARY REPORT'
      ));

      const d = Engines.discipline(data);

      box.appendChild(this.el(`
        <div class="discipline-grid">
          <div class="card">
            <span>بطاقات صفراء</span>
            <strong style="color:var(--color-warning)">${d.yellowCards}</strong>
          </div>
          <div class="card">
            <span>بطاقات حمراء</span>
            <strong style="color:var(--color-danger)">${d.redCards}</strong>
          </div>
          <div class="card">
            <span>لاعبون موقوفون</span>
            <strong>${d.suspensions.length}</strong>
          </div>
          <div class="card">
            <span>حد الإنذار</span>
            <strong>${d.threshold}</strong>
          </div>
        </div>
      `));

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>الإيقافات</h2>
          </div>
          <div class="player-list">
            ${d.suspensions.length
              ? d.suspensions.map(s => `
                  <div class="card player-row warning-card">
                    ${UI.Badges.avatar(s.player.name, s.player.photo)}
                    <div class="player-details">
                      <strong>${UI.escape(s.player.name)}</strong>
                      <small>
                        ${UI.escape(Core.team(s.player.teamId)?.name || '')} ·
                        ${s.yellows} صفراء · ${s.reds} حمراء
                        ${s.manualSuspension ? ` · ${s.manualSuspension} يدوي` : ''}
                      </small>
                    </div>
                    <span class="pill pill-danger">${s.suspended} مباراة</span>
                  </div>
                `).join('')
              : '<div class="card empty-state">لا توجد إيقافات محسوبة حالياً.</div>'
            }
          </div>
        </section>
      `));

      box.appendChild(this.el(`
        <section class="section">
          <div class="section__head">
            <h2>قرارات لجنة الانضباط</h2>
          </div>
          <div class="player-list">
            ${(d.manual || []).length
              ? d.manual.map(m => `
                  <div class="card discipline-card">
                    <div class="discipline-head">
                      <h3>${UI.escape(Core.player(m.playerId)?.name || 'لاعب غير معروف')}</h3>
                      <span class="pill pill-danger">${m.matchesSuspended || 0} مباراة</span>
                    </div>
                    <p>${UI.escape(m.reason || 'قرار إداري')} · ${UI.escape(m.date || '')}</p>
                  </div>
                `).join('')
              : '<div class="card empty-state">لا توجد قرارات يدوية مسجلة.</div>'
            }
          </div>
        </section>
      `));

      return box;
    },

    /* ============================================================
       SETTINGS SCREEN
       ============================================================ */
    settings(data) {
      const box = document.createElement('div');

      box.appendChild(this.heading(
        'الإعدادات',
        'خصص تجربتك وأدر بيانات البطولة بأمان',
        'PREFERENCES'
      ));

      const currentTheme = UI.ThemeManager.get();
      const currentLang = UI.ThemeManager.getLanguage();
      const isAdmin = Core.Permissions.isAdmin();

      box.appendChild(this.el(`
        <div class="settings-list">

          <div class="card settings-item">
            <span class="quick-icon">◐</span>
            <div class="settings-item-copy">
              <strong>الوضع الداكن</strong>
              <small>مظهر مريح للعين في الإضاءة المنخفضة</small>
            </div>
            <button
              id="themeSwitch"
              class="switch ${currentTheme === 'dark' ? 'on' : ''}"
              role="switch"
              aria-checked="${currentTheme === 'dark'}"
              aria-label="تبديل الوضع الداكن"
              type="button"
            ></button>
          </div>

          <div class="card settings-item">
            <span class="quick-icon">🌐</span>
            <div class="settings-item-copy">
              <strong>لغة الواجهة</strong>
              <small>العربية / English</small>
            </div>
            <select id="languageSelect" class="select-control" style="width:auto;padding:var(--space-2) var(--space-6) var(--space-2) var(--space-3)">
              <option value="ar" ${currentLang === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
            </select>
          </div>

          <div class="card settings-item">
            <span class="quick-icon">🛡</span>
            <div class="settings-item-copy">
              <strong>وضع الإدارة</strong>
              <small>${isAdmin ? 'مفعّل — يمكنك التعديل' : 'غير مفعّل — عرض فقط'}</small>
            </div>
            <button
              class="btn ${isAdmin ? 'btn-danger' : 'btn-primary'}"
              data-action="toggle-admin"
            >
              ${isAdmin ? 'إيقاف' : 'تفعيل'}
            </button>
          </div>

          <div class="card import-section">
            <h2>استيراد ملف الدوري</h2>
            <div class="drop-zone" id="dropZone">
              <div style="font-size:28px">⇧</div>
              <strong>اسحب ملف JSON وأفلته هنا</strong>
              <p>أو اختر ملفاً من جهازك. حد أقصى 20MB.</p>
              <button class="btn btn-primary" data-action="import" type="button">
                اختيار ملف JSON
              </button>
            </div>
            <div class="import-actions">
              <button class="btn btn-soft" data-action="export-json" type="button">
                تصدير JSON
              </button>
              <button class="btn btn-soft" data-action="export-pdf" type="button">
                تصدير PDF
              </button>
            </div>
          </div>

          <div class="card settings-item">
            <span class="quick-icon">🧾</span>
            <div class="settings-item-copy">
              <strong>سجل التعديلات</strong>
              <small>${Core.Audit.getAll().length} عملية مسجلة</small>
            </div>
            <button class="btn btn-soft" data-action="audit" type="button">عرض</button>
          </div>

          <div class="card settings-item">
            <span class="quick-icon">🔄</span>
            <div class="settings-item-copy">
              <strong>إعادة ضبط البيانات</strong>
              <small>استعادة بيانات العينة وحذف التعديلات</small>
            </div>
            <button class="btn btn-danger" data-action="clear-data" type="button">مسح</button>
          </div>

          <div class="card settings-item">
            <span class="quick-icon">ℹ</span>
            <div class="settings-item-copy">
              <strong>مدير الدوري</strong>
              <small>الإصدار 2.0.0 · تخزين محلي · PWA</small>
            </div>
          </div>

        </div>
      `));

      return box;
    },

    /* ============================================================
       SHARED HTML BUILDERS
       ============================================================ */
    miniMatchHTML(m, data) {
      const home = Core.team(m.homeTeamId) || {};
      const away = Core.team(m.awayTeamId) || {};
      const isFinished = m.status === 'finished';
      const isLive = m.status === 'live';
      const showScore = isFinished || isLive;

      return `
        <article class="mini-match" data-match="${UI.escape(m.id)}">
          <div class="mini-match-top">
            <span>الجولة ${m.round || '—'}</span>
            ${UI.status(m.status)}
          </div>
          <div class="team-versus">
            <div class="team-mini">
              ${UI.badge(home)}
              <span>${UI.escape(home.shortName || home.name || '')}</span>
            </div>
            <div class="score">
              ${showScore
                ? `${m.score?.home ?? 0} <small>:</small> ${m.score?.away ?? 0}`
                : `<small>${Helpers.formatTime(m.date)}</small>`
              }
            </div>
            <div class="team-mini">
              ${UI.badge(away)}
              <span>${UI.escape(away.shortName || away.name || '')}</span>
            </div>
          </div>
          <div class="match-meta">
            <span>${UI.escape(m.stadium || 'ملعب غير محدد')}</span>
            <span>${Helpers.formatDate(m.date)}</span>
          </div>
        </article>
      `;
    },

    matchCardHTML(m, data) {
      const home = Core.team(m.homeTeamId) || {};
      const away = Core.team(m.awayTeamId) || {};
      const isFinished = m.status === 'finished';
      const isLive = m.status === 'live';
      const showScore = isFinished || isLive;

      return `
        <article class="card card-hover match-card" data-match="${UI.escape(m.id)}">
          <div class="match-card-top">
            <span>الجولة ${m.round || '—'} · ${Helpers.formatDate(m.date)}</span>
            ${UI.status(m.status)}
          </div>
          <div class="team-versus">
            <div class="team-mini">
              ${UI.badge(home)}
              <span>${UI.escape(home.name || '')}</span>
            </div>
            <div class="score">
              ${showScore
                ? `${m.score?.home ?? 0} - ${m.score?.away ?? 0}`
                : `<small>${Helpers.formatTime(m.date)}</small>`
              }
            </div>
            <div class="team-mini">
              ${UI.badge(away)}
              <span>${UI.escape(away.name || '')}</span>
            </div>
          </div>
          <div class="match-card-bottom">
            <span>⌖ ${UI.escape(m.stadium || 'ملعب غير محدد')}</span>
            <span>${m.status === 'live' ? 'اضغط للأحداث' : 'تفاصيل المباراة'} ↗</span>
          </div>
        </article>
      `;
    },

    resultRowHTML(m, data) {
      const home = Core.team(m.homeTeamId) || {};
      const away = Core.team(m.awayTeamId) || {};

      return `
        <div class="card card-hover result-row" data-match="${UI.escape(m.id)}">
          ${UI.badge(home)}
          <span class="team-name">${UI.escape(home.shortName || home.name || '')}</span>
          <span class="score">${m.score?.home ?? 0} - ${m.score?.away ?? 0}</span>
          <span class="team-name" style="text-align:end">${UI.escape(away.shortName || away.name || '')}</span>
          ${UI.badge(away)}
        </div>
      `;
    }

  };

  window.Pages = Pages;

})(window);