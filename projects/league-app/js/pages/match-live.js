/* ============================================================
   PAGES/MATCH-LIVE.JS — المباراة الحية
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

  // حساب الإحصائيات من الأحداث
  const events = m.events || [];
  const homeGoals = events.filter(e => e.type === 'goal' && e.teamId === m.homeTeamId).length;
  const awayGoals = events.filter(e => e.type === 'goal' && e.teamId === m.awayTeamId).length;
  const homeCards = events.filter(e => (e.type === 'yellow' || e.type === 'red') && e.teamId === m.homeTeamId).length;
  const awayCards = events.filter(e => (e.type === 'yellow' || e.type === 'red') && e.teamId === m.awayTeamId).length;

  // إحصائيات المباراة (من m.stats أو من الأحداث)
  const stats = m.stats || {
    possessionHome: 50,
    shotsHome: homeGoals * 3,
    shotsAway: awayGoals * 3,
    cornersHome: homeCards,
    cornersAway: awayCards
  };

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

    <section class="section">
      <h2>أحداث المباراة (${events.length})</h2>
      <div class="panel timeline">
        ${events.length
          ? events.map(e => `
              <div class="timeline-item">
                <b>${e.minute || 0}' · ${LeagueUI.esc(e.label || e.type)}</b>
                <small class="muted" style="display: block">
                  ${LeagueUI.esc(LeagueCore.teamName(e.teamId))}
                  ${e.playerId ? ' · ' + LeagueUI.esc(LeagueCore.playerName(e.playerId)) : ''}
                </small>
              </div>
            `).join('')
          : '<div class="muted" style="text-align:center;padding:10px">لا توجد أحداث مسجلة بعد</div>'
        }
      </div>
    </section>

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
            <div class="muted" style="font-size: 0.7rem; text-align: center; margin-top: -8px; margin-bottom: 12px">
              ${label}
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <section class="section">
      <h2>التشكيلة المتاحة</h2>
      <div class="panel">
        <div class="player-row">
          <div class="grow">
            <b>${LeagueUI.esc(h.name)}</b>
            <small>${d.players.filter(p => p.teamId === h.id).length} لاعب مسجل</small>
          </div>
          ${LeagueUI.teamCrest(h)}
        </div>
        <div class="player-row">
          <div class="grow">
            <b>${LeagueUI.esc(a.name)}</b>
            <small>${d.players.filter(p => p.teamId === a.id).length} لاعب مسجل</small>
          </div>
          ${LeagueUI.teamCrest(a)}
        </div>
      </div>
    </section>
  `;
};