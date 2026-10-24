/* =========================================================
   pages/team.js — Team details (team.html?id=t1)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  function render(root) {
    var d = C.State.data;
    var urlParams = new URLSearchParams(window.location.search);
    var teamId = urlParams.get('id');
    var team = C.Teams.get(teamId);
    if (!team) {
      root.innerHTML = '<a class="back-link" href="teams.html">' + UI.icon('back') + t('teams') + '</a><div class="card">' +
        UI.Render.empty('alert', I18n.lang === 'ar' ? 'الفريق غير موجود' : 'Team not found', teamId ? ('id: ' + teamId) : '') + '</div>';
      return;
    }
    var row = E.Standings.rowFor(d, team.id) || E.Standings.emptyRow(team);
    var sum = E.Stats.teamSummary(d, team.id);
    var squad = C.Teams.squad(team.id);
    var scorers = E.Stats.scorers(d).filter(function (s) { return s.teamId === team.id; });
    var assists = E.Stats.assists(d).filter(function (s) { return s.teamId === team.id; });
    var disc = E.Disciplinary.compute(d);
    var goalsMap = {}; scorers.forEach(function (s) { goalsMap[s.playerId] = s.value; });
    var astMap = {}; assists.forEach(function (s) { astMap[s.playerId] = s.value; });
    var suspMap = {}; disc.active.forEach(function (s) { suspMap[s.playerId] = s; });
    var c1 = team.colors.primary;
    var c2 = team.colors.secondary;

    var hero = '<section class="hero team-hero" style="--tc1:' + H.esc(c1) + ';--tc2:' + H.esc(c2) + '">' +
      '<div class="team-hero-body">' + UI.Badges.crest(team, '2xl') +
      '<div class="stack-2 grow" style="min-width:0">' +
      '<div class="row-2 wrap"><span class="badge">' + t('groupLabel') + ' ' + H.esc(team.group) + '</span><span class="badge badge-gold">#' + row.position + ' · ' + row.pts + ' ' + t('points2') + '</span></div>' +
      '<h1>' + H.esc(I18n.name(team)) + '</h1>' +
      '<div>' + UI.Badges.form(row.form) + '</div>' +
      '</div></div>' +
      '<div class="team-hero-facts">' +
      '<div><div class="l">' + t('coach') + '</div><div class="v">' + H.esc(team.coach || '—') + '</div></div>' +
      '<div><div class="l">' + t('stadium') + '</div><div class="v">' + H.esc((I18n.lang === 'en' && team.stadiumEn) ? team.stadiumEn : (team.stadium || '—')) + '</div></div>' +
      '<div><div class="l">' + t('founded') + '</div><div class="v num">' + H.esc(team.founded || '—') + '</div></div>' +
      '</div></section>';

    var tiles = '<section class="section"><div class="grid-3 md-grid-3">' +
      tile('ball', t('played'), sum.played) +
      tile('trophy', t('won'), sum.won, 'gold') +
      tile('percent', t('winRate'), sum.winRate + '%', 'info') +
      tile('target', t('goalsFor'), sum.gf) +
      tile('shield', t('goalsAgainst'), sum.ga, 'danger') +
      tile('glove', t('cleanSheets'), sum.cleanSheets, 'info') +
      '</div></section>';

    var groups = { GK: [], DF: [], MF: [], FW: [] };
    squad.forEach(function (p) { (groups[p.position] || groups.MF).push(p); });
    var squadHTML = '<section class="section">' + UI.Render.sectionHead(t('squad') + ' (' + squad.length + ')') + '<div class="card list">' +
      ['GK', 'DF', 'MF', 'FW'].map(function (pos) {
        if (!groups[pos].length) return '';
        return '<div class="squad-group-title">' + UI.Badges.pos(pos) + t(pos) + ' · ' + groups[pos].length + '</div>' +
          groups[pos].map(function (p) {
            var g = goalsMap[p.id] || 0;
            var a = astMap[p.id] || 0;
            var sp = suspMap[p.id];
            return '<div class="list-item clickable" id="p-' + H.esc(p.id) + '" data-player-card="' + H.esc(p.id) + '" role="button" tabindex="0">' + UI.Badges.avatar(p, '', { number: true }) +
              '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(p)) + '</span>' +
              '<span class="li-sub">' + '<span class="kbd">' + H.esc(p.nationality || '—') + '</span>' + ' · ' + t('age') + ' <span class="num">' + H.age(p.birthdate) + '</span>' +
              (p.status === 'injured' ? ' · <span class="badge badge-warning">' + t('injured') + '</span>' : '') +
              (sp ? ' · <span class="badge badge-danger">' + t('suspended') + '</span>' : '') + '</span></div>' +
              '<div class="li-end">' +
              (g ? '<span class="badge badge-primary">' + UI.icon('ball') + g + '</span>' : '') +
              (a ? '<span class="badge badge-info">' + UI.icon('zap') + a + '</span>' : '') +
              '<span class="num fw-heavy text-muted">#' + H.esc(p.number) + '</span></div></div>';
          }).join('');
      }).join('') + '</div></section>';

    var matches = C.Teams.matches(team.id);
    var matchesHTML = '<section class="section">' + UI.Render.sectionHead(t('teamMatches') + ' (' + matches.length + ')', 'matches.html?team=' + encodeURIComponent(team.id)) +
      (matches.length ? '<div class="card">' + matches.map(function (m) { return UI.Render.matchRow(m, team.id); }).join('') + '</div>' : '<div class="card">' + UI.Render.empty('calendar', t('empty')) + '</div>') +
      '</section>';

    root.innerHTML = '<a class="back-link" href="teams.html">' + UI.icon('back') + t('teams') + '</a>' + hero + tiles + squadHTML + matchesHTML;
    UI.Anim.countAll(root);
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(function () {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.background = 'var(--brand-gold-soft)';
        setTimeout(function () { el.style.transition = 'background 1s'; el.style.background = ''; }, 1600);
      }, 350);
    }
  }

  function tile(ic, label, value, cls) {
    var isNum = typeof value === 'number';
    return '<div class="stat-tile ' + (cls || '') + '"><span class="stat-icon">' + UI.icon(ic) + '</span>' +
      '<span class="stat-value"' + (isNum ? ' data-count="' + value + '"' : '') + '>' + (isNum ? '0' : H.esc(value)) + '</span><span class="stat-label">' + H.esc(label) + '</span></div>';
  }

  global.Pages = global.Pages || {};
  global.Pages.team = {
    init: function (root) { render(root); },
    onData: function (root) { render(root); }
  };
})(window);
