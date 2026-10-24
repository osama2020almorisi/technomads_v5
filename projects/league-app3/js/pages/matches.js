/* =========================================================
   pages/matches.js — Matches (matches.html)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  var state = { tab: 'today', round: 'all', team: null };

  function filterMatches(d) {
    var now = new Date();
    var list = C.Matches.sorted();
    if (state.team) list = list.filter(function (m) { return m.homeTeamId === state.team || m.awayTeamId === state.team; });
    if (state.round !== 'all') list = list.filter(function (m) { return String(m.round) === String(state.round); });
    if (state.tab === 'today') list = list.filter(function (m) { return H.isToday(m.date) || m.status === 'live'; });
    else if (state.tab === 'upcoming') list = list.filter(function (m) { return (m.status === 'scheduled' || m.status === 'postponed') && (new Date(m.date) >= now || !H.isToday(m.date)) && !H.isToday(m.date); });
    else if (state.tab === 'past') list = list.filter(function (m) { return m.status === 'finished'; }).reverse();
    return list;
  }

  function renderList(root) {
    var d = C.State.data;
    var list = filterMatches(d);
    var box = root.querySelector('#matches-list');
    if (!list.length) {
      box.innerHTML = '<div class="card">' + UI.Render.empty('calendar', state.tab === 'today' ? t('noMatchesToday') : t('empty')) + '</div>';
      return;
    }
    var groups = [];
    var map = {};
    list.forEach(function (m) {
      var key = String(m.date).slice(0, 10);
      if (!map[key]) { map[key] = { key: key, date: m.date, items: [] }; groups.push(map[key]); }
      map[key].items.push(m);
    });
    box.innerHTML = groups.map(function (g) {
      var label = H.isToday(g.date) ? t('today') : H.fmtDate(g.date, { weekday: 'long', day: 'numeric', month: 'long' });
      return '<div class="divider-label">' + H.esc(label) + ' · ' + g.items.length + '</div><div class="stack-3 stagger">' +
        g.items.map(function (m) { return UI.Render.matchCard(m, { showVenue: true }); }).join('') + '</div>';
    }).join('');
  }

  function render(root) {
    var d = C.State.data;
    var p = H.param('tab');
    if (p && ['today', 'upcoming', 'past', 'all'].indexOf(p) !== -1) state.tab = p;
    state.team = H.param('team');
    if (state.tab === 'today' && !p) {
      var hasToday = d.matches.some(function (m) { return H.isToday(m.date) || m.status === 'live'; });
      if (!hasToday) state.tab = 'upcoming';
    }
    var rounds = [];
    d.matches.forEach(function (m) { if (rounds.indexOf(m.round) === -1) rounds.push(m.round); });
    rounds.sort(function (a, b) { return a - b; });
    var team = state.team ? C.Teams.get(state.team) : null;
    root.innerHTML =
      '<div class="page-head"><div><h1 class="page-title">' + t('matches') + '</h1><p class="page-sub">' + d.matches.length + ' ' + t('matchesCount') + (team ? ' · ' + H.esc(I18n.name(team)) : '') + '</p></div>' +
      (team ? '<a class="btn btn-secondary btn-sm" href="matches.html">' + UI.icon('x') + t('all') + '</a>' : '') + '</div>' +
      UI.Tabs.render([
        { key: 'today', label: t('today') },
        { key: 'upcoming', label: t('upcoming') },
        { key: 'past', label: t('past') },
        { key: 'all', label: t('all') }
      ], state.tab, 'match-tabs') +
      '<div class="chips mt-3" id="round-chips"><button class="chip ' + (state.round === 'all' ? 'active' : '') + '" data-r="all" type="button">' + t('all') + '</button>' +
      rounds.map(function (r) { return '<button class="chip ' + (String(state.round) === String(r) ? 'active' : '') + '" data-r="' + r + '" type="button">' + t('round') + ' ' + r + '</button>'; }).join('') + '</div>' +
      '<div id="matches-list" class="mt-2"></div>';
    UI.Tabs.bind(root.querySelector('#match-tabs'), function (k) {
      state.tab = k;
      history.replaceState(null, '', 'matches.html?tab=' + k + (state.team ? '&team=' + encodeURIComponent(state.team) : ''));
      renderList(root);
    });
    root.querySelector('#round-chips').addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      state.round = b.getAttribute('data-r');
      root.querySelectorAll('#round-chips .chip').forEach(function (c) { c.classList.toggle('active', c === b); });
      UI.Haptic.tap(8);
      renderList(root);
    });
    renderList(root);
  }

  global.Pages = global.Pages || {};
  global.Pages.matches = {
    init: function (root) {
      render(root);
      setInterval(function () {
        if (C.State.data.matches.some(function (m) { return m.status === 'live'; })) renderList(root);
      }, 30000);
    },
    onData: function (root) { renderList(root); }
  };
})(window);
