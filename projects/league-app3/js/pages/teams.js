/* =========================================================
   pages/teams.js — Teams (teams.html)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  var state = { q: '', group: 'all' };

  function groups(d) {
    var g = {};
    d.teams.forEach(function (tm) { g[tm.group || 'A'] = (g[tm.group || 'A'] || 0) + 1; });
    return Object.keys(g).sort().map(function (k) { return { key: k, count: g[k] }; });
  }

  function cardHTML(row) {
    var tm = row.team;
    return '<a class="card card-interactive team-card" href="team.html?id=' + encodeURIComponent(tm.id) + '" style="--team-color:' + H.esc(tm.colors.primary) + '">' +
      '<span class="badge group-tag">' + t('groupLabel') + ' ' + H.esc(tm.group) + '</span>' +
      UI.Badges.crest(tm, 'xl') +
      '<span class="team-card-name">' + H.esc(I18n.name(tm)) + '</span>' +
      '<span class="team-card-meta">' + UI.icon('pin', '') .replace('<svg', '<svg style="width:12px;height:12px"') + '<span class="truncate">' + H.esc(tm.city || tm.stadium || '') + '</span></span>' +
      '<div class="team-card-pts">' +
      '<div><div class="v num">' + row.position + '</div><div class="l">' + t('pos') + '</div></div>' +
      '<div><div class="v num text-primary">' + row.pts + '</div><div class="l">' + t('points') + '</div></div>' +
      '</div>' +
      UI.Badges.form(row.form) +
      '</a>';
  }

  function renderList(root) {
    var d = C.State.data;
    var table = E.Standings.compute(d);
    var rows = table.filter(function (r) {
      if (state.group !== 'all' && r.team.group !== state.group) return false;
      return UI.Search.match(state.q, [r.team.name, r.team.nameEn, r.team.shortName, r.team.city, r.team.coach, r.team.stadium]);
    }).sort(function (a, b) { return String(I18n.name(a.team)).localeCompare(String(I18n.name(b.team)), I18n.lang); });
    var list = root.querySelector('#teams-grid');
    var count = root.querySelector('#teams-count');
    if (count) count.textContent = rows.length + ' ' + t('teamsCount');
    if (!rows.length) {
      list.className = '';
      list.innerHTML = '<div class="card">' + UI.Render.empty('search', t('empty'), I18n.lang === 'ar' ? 'جرّب كلمة بحث أخرى' : 'Try another search term') + '</div>';
      return;
    }
    list.className = 'grid-2 teams-grid stagger';
    list.innerHTML = rows.map(cardHTML).join('');
  }

  function render(root) {
    var d = C.State.data;
    var gs = groups(d);
    var param = H.param('group');
    if (param && state.group === 'all') state.group = param;
    root.innerHTML =
      '<div class="page-head"><div><h1 class="page-title">' + t('teams') + '</h1><p class="page-sub" id="teams-count"></p></div></div>' +
      '<div class="stack-3 mb-4">' + UI.Search.box('searchTeams', 'teams-search') +
      '<div class="chips" id="group-chips">' +
      '<button class="chip ' + (state.group === 'all' ? 'active' : '') + '" data-g="all" type="button">' + t('all') + '<span class="count">' + d.teams.length + '</span></button>' +
      gs.map(function (g) {
        return '<button class="chip ' + (state.group === g.key ? 'active' : '') + '" data-g="' + H.esc(g.key) + '" type="button">' + t('groupLabel') + ' ' + H.esc(g.key) + '<span class="count">' + g.count + '</span></button>';
      }).join('') + '</div></div>' +
      '<div id="teams-grid"></div>';
    var input = root.querySelector('#teams-search');
    input.value = state.q;
    UI.Search.bind(input, function (q) { state.q = q; renderList(root); }, 200);
    root.querySelector('#group-chips').addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      state.group = b.getAttribute('data-g');
      root.querySelectorAll('#group-chips .chip').forEach(function (c) { c.classList.toggle('active', c === b); });
      UI.Haptic.tap(8);
      renderList(root);
    });
    renderList(root);
  }

  global.Pages = global.Pages || {};
  global.Pages.teams = {
    init: function (root) { render(root); },
    onData: function (root) { renderList(root); }
  };
})(window);
