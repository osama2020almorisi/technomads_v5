/* ============================================================
   PAGES/MATCH-LIVE.JS — المباراة الحية + تشكيلة الملعب
   ============================================================ */

window.LeaguePages = window.LeaguePages || {};

window.LeaguePages["match-live"] = (d) => {
  const id = new URLSearchParams(location.search).get('id');
  const m = LeagueCore.byId(d.matches, id);
  const root = document.getElementById('match-detail');

  if (!m) {
    root.innerHTML = `
      <div class="empty">
        المباراة غير موجودة.
        <br><a href="matches.html" class="text-link">→ العودة للمباريات</a>
      </div>
    `;
    return;
  }

  const h = LeagueCore.byId(d.teams, m.homeTeamId);
  const a = LeagueCore.byId(d.teams, m.awayTeamId);
  const finished = m.status === 'finished';
  const isLive = m.status === 'live';
  const showScore = finished || isLive;

  const events = m.events || [];
  const homeGoals = events.filter(e => e.type === 'goal' && e.teamId === m.homeTeamId).length;
  const awayGoals = events.filter(e => e.type === 'goal' && e.teamId === m.awayTeamId).length;
  const homeCards = events.filter(e => (e.type === 'yellow' || e.type === 'red') && e.teamId === m.homeTeamId).length;
  const awayCards = events.filter(e => (e.type === 'yellow' || e.type === 'red') && e.teamId === m.awayTeamId).length;

  const stats = m.stats || {
    possessionHome: 50,
    shotsHome: homeGoals * 3,
    shotsAway: awayGoals * 3,
    cornersHome: homeCards,
    cornersAway: awayCards
  };

  // التشكيلة الأساسية (أول 11 لاعب من كل فريق)
  const homeSquad = d.players.filter(p => p.teamId === h.id).slice(0, 11);
  const awaySquad = d.players.filter(p => p.teamId === a.id).slice(0, 11);

  // ترتيب اللاعبين حسب المركز
  const order = { GK: 1, DF: 2, MF: 3, FW: 4 };
  const sortByPosition = (list) => list.slice().sort((x, y) => (order[x.position] || 9) - (order[y.position] || 9));

  const homeSorted = sortByPosition(homeSquad);
  const awaySorted = sortByPosition(awaySquad);

  // تشكيل افتراضي 4-3-3 (عند الحاجة)
  const getFormation = (list) => {
    const result = [];
    const gk = list.filter(p => p.position === 'GK').slice(0, 1);
    const df = list.filter(p => p.position === 'DF').slice(0, 4);
    const mf = list.filter(p => p.position === 'MF').slice(0, 3);
    const fw = list.filter(p => p.position === 'FW').slice(0, 3);
    return [...gk, ...df, ...mf, ...fw];
  };

  const homeLineup = getFormation(homeSorted);
  const awayLineup = getFormation(awaySorted);

  root.innerHTML = `
    <div class="hero">
      <div class="eyebrow">
        الجولة ${m.round || '—'} · ${LeagueUI.esc(m.stadium || '')}
      </div>
      <div class="match-teams" style="margin: 25px 0">
        <div class="match-team">
          ${LeagueUI.teamCrest(h)}
          <span>${LeagueUI.esc(h.name)}</span>
        </div>
        <div class="score" style="font-size: 2rem">
          ${showScore ? `${m.score?.home ?? 0} : ${m.score?.away ?? 0}` : 'VS'}
        </div>
        <div class="match-team">
          ${LeagueUI.teamCrest(a)}
          <span>${LeagueUI.esc(a.name)}</span>
        </div>
      </div>
      <p style="text-align: center">
        ${new Date(m.date).toLocaleString('ar')} ·
        ${finished ? 'انتهت المباراة' : isLive ? '⚽ مباشر الآن' : 'لم تبدأ بعد'}
      </p>
    </div>

    <!-- تشكيلة الفريق المضيف -->
    <section class="section">
      <h2>تشكيلة ${LeagueUI.esc(h.name)}</h2>
      <div class="pitch-header">
        <div class="pitch-header-left">
          ${LeagueUI.teamCrest(h)}
          <div>
            <b>${LeagueUI.esc(h.name)}</b>
            <small>${homeLineup.length} لاعب أساسي</small>
          </div>
        </div>
        <div class="pitch-header-formation">4-3-3</div>
      </div>

      <div class="pitch-container">
        <div class="pitch-lines">
          <div class="pitch-center-circle"></div>
          <div class="pitch-center-dot"></div>
          <div class="pitch-penalty-top"></div>
          <div class="pitch-penalty-bottom"></div>
          <div class="pitch-goal-top"></div>
          <div class="pitch-goal-bottom"></div>
          <div class="pitch-spot-top"></div>
          <div class="pitch-spot-bottom"></div>
          <div class="pitch-corner tl"></div>
          <div class="pitch-corner tr"></div>
          <div class="pitch-corner bl"></div>
          <div class="pitch-corner br"></div>
        </div>
        <div class="pitch-players pitch-formation formation-4-3-3">
          ${homeLineup.map((p, i) => `
            <div class="pitch-player ${(p.position || 'mf').toLowerCase()}" style="animation-delay: ${i * 0.05}s">
              <div class="pitch-player-circle">${p.number ?? '—'}</div>
              <div class="pitch-player-name">${LeagueUI.esc(p.name.split(' ').slice(-1)[0] || p.name)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- تشكيلة الفريق الضيف -->
    <section class="section">
      <h2>تشكيلة ${LeagueUI.esc(a.name)}</h2>
      <div class="pitch-header">
        <div class="pitch-header-left">
          ${LeagueUI.teamCrest(a)}
          <div>
            <b>${LeagueUI.esc(a.name)}</b>
            <small>${awayLineup.length} لاعب أساسي</small>
          </div>
        </div>
        <div class="pitch-header-formation">4-3-3</div>
      </div>

      <div class="pitch-container">
        <div class="pitch-lines">
          <div class="pitch-center-circle"></div>
          <div class="pitch-center-dot"></div>
          <div class="pitch-penalty-top"></div>
          <div class="pitch-penalty-bottom"></div>
          <div class="pitch-goal-top"></div>
          <div class="pitch-goal-bottom"></div>
          <div class="pitch-spot-top"></div>
          <div class="pitch-spot-bottom"></div>
          <div class="pitch-corner tl"></div>
          <div class="pitch-corner tr"></div>
          <div class="pitch-corner bl"></div>
          <div class="pitch-corner br"></div>
        </div>
        <div class="pitch-players pitch-formation formation-4-3-3">
          ${awayLineup.map((p, i) => `
            <div class="pitch-player ${(p.position || 'mf').toLowerCase()}" style="animation-delay: ${i * 0.05}s">
              <div class="pitch-player-circle">${p.number ?? '—'}</div>
              <div class="pitch-player-name">${LeagueUI.esc(p.name.split(' ').slice(-1)[0] || p.name)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- أحداث المباراة -->
    <section class="section">
      <h2>أحداث المباراة (${events.length})</h2>
      <div class="panel timeline">
        ${events.length
          ? events.map(e => `
              <div class="timeline-item ${e.type === 'goal' ? 'goal' : e.type === 'yellow' ? 'yellow' : e.type === 'red' ? 'red' : ''}">
                <b>${e.minute || 0}' · ${LeagueUI.esc(e.label || e.type)}</b>
                <small>
                  ${LeagueUI.esc(LeagueCore.teamName(e.teamId))}
                  ${e.playerId ? ' · ' + LeagueUI.esc(LeagueCore.playerName(e.playerId)) : ''}
                </small>
              </div>
            `).join('')
          : '<div class="muted" style="text-align:center;padding:16px">لا توجد أحداث مسجلة بعد</div>'
        }
      </div>
    </section>

    <!-- إحصائيات المباراة -->
    <section class="section">
      <h2>إحصائيات المباراة</h2>
      <div class="panel">
        ${[
          ['الاستحواذ', stats.possessionHome || 50, 100 - (stats.possessionHome || 50)],
          ['التسديدات', stats.shotsHome || 0, stats.shotsAway || 0],
          ['الركنيات', stats.cornersHome || 0, stats.cornersAway || 0]
        ].map(([label, homeVal, awayVal]) => {
          const total = (homeVal + awayVal) || 1;
          const pct = Math.min(100, (homeVal / total) * 100);
          const suffix = label === 'الاستحواذ' ? '%' : '';
          return `
            <div class="bar-row">
              <span>${homeVal}${suffix}</span>
              <div class="bar">
                <span style="width: ${pct}%"></span>
              </div>
              <span>${awayVal}${suffix}</span>
            </div>
            <div class="bar-label">${label}</div>
          `;
        }).join('')}
      </div>
    </section>

    <!-- قائمة البدلاء -->
    <section class="section">
      <h2>قائمة البدلاء</h2>
      <div class="bench-list">
        ${d.players
          .filter(p => (p.teamId === h.id || p.teamId === a.id) && !homeLineup.concat(awayLineup).some(x => x.id === p.id))
          .slice(0, 8)
          .map(p => `
            <div class="bench-player">
              <div class="pitch-player-circle ${(p.position || 'mf').toLowerCase()}">${p.number ?? '—'}</div>
              <div class="bench-player-info">
                <b>${LeagueUI.esc(p.name)}</b>
                <small>${LeagueUI.esc(LeagueCore.teamName(p.teamId))}</small>
              </div>
            </div>
          `).join('') || '<div class="muted" style="padding: 20px; text-align: center">لا يوجد بدلاء مسجلون</div>'
        }
      </div>
    </section>
  `;
};