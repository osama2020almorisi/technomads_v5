/* =========================================================
   pages/home.js — Home (index.html)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  function heroHTML(d) {
    var league = d.league;
    var totals = E.Stats.leagueTotals(d);
    var maxRound = d.matches.reduce(function (mx, m) { return Math.max(mx, m.round); }, 0);
    var curRound = d.matches.filter(function (m) { return m.status !== 'scheduled'; }).reduce(function (mx, m) { return Math.max(mx, m.round); }, 0) || 1;
    var pct = totals.matches ? Math.round(totals.played / totals.matches * 100) : 0;
    return '<section class="hero home-hero" data-reveal>' +
      '<canvas class="hero-ball" data-ball aria-label="' + (I18n.lang === 'ar' ? 'كرة ثلاثية الأبعاد — اسحبها لتدويرها' : '3D ball — drag to spin') + '"></canvas>' +
      '<div class="home-hero-top">' +
      '<div class="home-hero-logo anim-float">' + (league.logo ? '<img src="' + H.esc(league.logo) + '" alt="" onerror="this.parentNode.innerHTML=UI.icon(\'logo\')">' : UI.icon('logo')) + '</div>' +
      '<div class="stack-2 grow">' +
      '<div class="row-2 wrap"><span class="badge badge-gold">' + UI.icon('trophy') + t('season') + ' ' + H.esc(league.season || '') + '</span>' +
      (totals.live ? '<span class="badge badge-live">' + totals.live + ' ' + t('live') + '</span>' : '') + '</div>' +
      '<h1>' + H.esc(I18n.name(league)) + '</h1>' +
      '<p class="text-sm">' + t('round') + ' ' + curRound + ' / ' + maxRound + ' · ' + totals.goals + ' ' + t('goalsCount') + ' · ' + totals.avgGoals + ' ' + t('perMatch') + '</p>' +
      '</div></div>' +
      '<div class="home-hero-stats">' +
      '<div class="hero-stat"><div class="v" data-count="' + totals.teams + '">0</div><div class="l">' + t('teams') + '</div></div>' +
      '<div class="hero-stat"><div class="v" data-count="' + totals.matches + '">0</div><div class="l">' + t('matches') + '</div></div>' +
      '<div class="hero-stat"><div class="v" data-count="' + totals.players + '">0</div><div class="l">' + t('players') + '</div></div>' +
      '</div>' +
      '<div class="hero-progress"><div class="hero-progress-label"><span>' + (I18n.lang === 'ar' ? 'تقدّم الموسم' : 'Season progress') + '</span><span class="num">' + pct + '%</span></div>' +
      '<div class="bar"><span data-width="' + pct + '" style="width:0"></span></div></div>' +
      '</section>';
  }

  function todayHTML(d) {
    var today = d.matches.filter(function (m) { return H.isToday(m.date) || m.status === 'live'; })
      .sort(function (a, b) {
        var order = { live: 0, scheduled: 1, finished: 2, postponed: 3 };
        return (order[a.status] - order[b.status]) || (new Date(a.date) - new Date(b.date));
      });
    var html = '<section class="section" data-reveal>' + UI.Render.sectionHead(t('todayMatches'), 'matches.html?tab=today');
    if (!today.length) {
      var next = C.Matches.sorted().find(function (m) { return m.status === 'scheduled' && new Date(m.date) > new Date(); });
      html += '<div class="card">' + UI.Render.empty('calendar', t('noMatchesToday'), next ? (t('nextMatch') + ': ' + C.teamShort(next.homeTeamId) + ' ' + t('vs') + ' ' + C.teamShort(next.awayTeamId) + ' · ' + H.fmtDateTime(next.date)) : '') + '</div>';
    } else {
      html += '<div class="h-scroll stagger">' + today.map(function (m) { return UI.Render.matchCard(m, { compact: true }); }).join('') + '</div>';
    }
    return html + '</section>';
  }

  function leaderHTML(d) {
    var table = E.Standings.compute(d);
    var L = table[0];
    if (!L) return '';
    var second = table[1];
    var gap = second ? L.pts - second.pts : 0;
    var scorers = E.Stats.scorers(d);
    var top = scorers[0];
    return '<section class="section" data-reveal>' + UI.Render.sectionHead(t('leader'), 'standings.html') +
      '<a class="leader-card" href="team.html?id=' + encodeURIComponent(L.teamId) + '" style="display:block">' +
      '<div class="leader-body">' + UI.Badges.crest(L.team, 'xl') +
      '<div class="stack-1 grow" style="min-width:0">' +
      '<span class="row-2 text-sm fw-heavy">' + UI.icon('crown') + t('leader') + '</span>' +
      '<h3 style="font-size:1.4rem;font-weight:900" class="truncate">' + H.esc(I18n.name(L.team)) + '</h3>' +
      '<span class="text-sm text-muted fw-bold">' + (gap > 0 ? ('+' + gap + ' ' + t('points2') + ' ' + (I18n.lang === 'ar' ? 'عن الوصيف' : 'clear')) : (I18n.lang === 'ar' ? 'متساوٍ بالنقاط مع الوصيف' : 'Level on points')) + '</span>' +
      '</div>' +
      '<div class="text-center"><div class="num" style="font-size:2.4rem;font-weight:800;line-height:1">' + L.pts + '</div><div class="text-xs fw-heavy text-muted">' + t('points') + '</div></div>' +
      '</div>' +
      '<div class="leader-stats">' +
      '<div><div class="v num">' + L.played + '</div><div class="l">' + t('played') + '</div></div>' +
      '<div><div class="v num">' + L.won + '</div><div class="l">' + t('won') + '</div></div>' +
      '<div><div class="v num">' + H.signed(L.gd) + '</div><div class="l">' + t('gd') + '</div></div>' +
      '<div><div class="v">' + UI.Badges.form(L.form, true) + '</div><div class="l">' + t('form') + '</div></div>' +
      '</div></a>' +
      (top ? '<a class="card list-item mt-3" href="stats.html" style="border-radius:var(--r-lg)">' + UI.Badges.avatar(top.player, 'lg') +
        '<div class="li-main"><span class="li-sub">' + UI.icon('flame') + t('topScorer') + '</span><span class="li-title">' + H.esc(I18n.name(top.player)) + '</span><span class="li-sub">' + H.esc(C.teamName(top.teamId)) + '</span></div>' +
        '<div class="li-end"><span class="li-value text-primary">' + top.value + '</span>' + UI.icon('chevron', 'chev') + '</div></a>' : '') +
      '</section>';
  }

  function resultsHTML(d) {
    var res = d.matches.filter(function (m) { return m.status === 'finished'; })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 3);
    var html = '<section class="section" data-reveal>' + UI.Render.sectionHead(t('latestResults'), 'matches.html?tab=past');
    if (!res.length) html += '<div class="card">' + UI.Render.empty('ball', t('empty')) + '</div>';
    else html += '<div class="stack-3 stagger">' + res.map(function (m) { return UI.Render.matchCard(m, { showVenue: true }); }).join('') + '</div>';
    return html + '</section>';
  }

  function quickHTML() {
    var items = [
      { href: 'teams.html', icon: 'users', label: t('teams') },
      { href: 'standings.html', icon: 'trophy', label: t('standings') },
      { href: 'discipline.html', icon: 'gavel', label: t('discipline') },
      { href: 'stats.html?tab=keepers', icon: 'glove', label: t('keepers') }
    ];
    return '<section class="section" data-reveal>' + UI.Render.sectionHead(t('quickAccess')) +
      '<div class="quick-grid">' + items.map(function (it) {
        return '<a class="quick-item" href="' + it.href + '"><span class="qi-icon">' + UI.icon(it.icon) + '</span><span>' + H.esc(it.label) + '</span></a>';
      }).join('') + '</div></section>';
  }

  function render(root) {
    var d = C.State.data;
    root.innerHTML = heroHTML(d) + todayHTML(d) + leaderHTML(d) + resultsHTML(d) + quickHTML();
    UI.Anim.countAll(root);
    UI.Anim.bars(root);
    UI.Anim.reveal(root);
  }

  global.Pages = global.Pages || {};
  global.Pages.home = {
    init: function (root) {
      render(root);
      setInterval(function () {
        if (C.State.data.matches.some(function (m) { return m.status === 'live'; })) render(root);
      }, 60000);
    },
    onData: function (root) { render(root); }
  };
})(window);
