/* =========================================================
   pages/standings.js — Standings (standings.html)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  var state = { group: 'all', live: false };

  function tableHTML(rows) {
    var head = '<thead><tr>' +
      '<th class="sticky-col" style="text-align:start">' + t('team') + '</th>' +
      '<th>' + t('played') + '</th><th>' + t('won') + '</th><th>' + t('drawn') + '</th><th>' + t('lost') + '</th>' +
      '<th>' + t('gf') + '</th><th>' + t('ga') + '</th><th>' + t('gd') + '</th><th>' + t('pts') + '</th>' +
      '<th>' + t('form') + '</th><th title="' + t('fairplay') + '">FP</th></tr></thead>';
    var body = '<tbody>' + rows.map(function (r, i) {
      var pos = state.group === 'all' ? r.position : i + 1;
      return '<tr class="clickable zone-' + (state.group === 'all' ? r.zone : '') + '" data-team="' + H.esc(r.teamId) + '" tabindex="0">' +
        '<td class="sticky-col team-cell"><div class="team-cell-inner"><span class="pos">' + pos + '</span>' + UI.Badges.crest(r.team, 'sm') +
        '<span class="stack" style="min-width:0"><span class="tname truncate">' + H.esc(I18n.short(r.team)) + '</span>' +
        (r.decidedBy ? '<span class="text-xs text-muted" style="font-family:var(--font-body)">' + t('decidedBy') + ': ' + t(r.decidedBy) + '</span>' : '') + '</span>' +
        (r.live ? '<span class="live-dot" title="' + t('live') + '"></span>' : '') + '</div></td>' +
        '<td>' + r.played + '</td><td>' + r.won + '</td><td>' + r.drawn + '</td><td>' + r.lost + '</td>' +
        '<td>' + r.gf + '</td><td>' + r.ga + '</td><td>' + H.signed(r.gd) + '</td>' +
        '<td class="col-pts">' + r.pts + (r.deduction ? ' <span class="ded">\u200E−' + r.deduction + '</span>' : '') + '</td>' +
        '<td>' + UI.Badges.form(r.form, true) + '</td>' +
        '<td class="text-muted">' + H.signed(r.fairplay) + '</td></tr>';
    }).join('') + '</tbody>';
    return '<div class="table-wrap" id="table-wrap"><table class="data-table standings-table">' + head + body + '</table></div>';
  }

  function legendHTML(d) {
    var q = d.league.settings.qualificationSpots;
    return '<div class="legend mt-4">' +
      '<span><i style="background:var(--zone-champions)"></i>' + t('champions') + ' (1-' + q.champions + ')</span>' +
      '<span><i style="background:var(--zone-europa)"></i>' + t('europa') + ' (' + (q.champions + 1) + '-' + (q.champions + q.europa) + ')</span>' +
      '<span><i style="background:var(--zone-relegation)"></i>' + t('relegation') + ' (' + q.relegation + ')</span>' +
      '<span>' + UI.icon('info').replace('<svg', '<svg style="width:14px;height:14px"') + t('tapForDetails') + '</span></div>';
  }

  function deductionsHTML(d) {
    var list = d.league.settings.pointsDeduction || [];
    if (!list.length) return '';
    return '<section class="section">' + UI.Render.sectionHead(t('pointsDeduction')) + '<div class="card list">' +
      list.map(function (x) {
        var tm = C.Teams.get(x.teamId);
        return '<div class="list-item">' + UI.Badges.crest(tm, 'sm') + '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(tm)) + '</span><span class="li-sub">' + H.esc(I18n.lang === 'en' && x.reasonEn ? x.reasonEn : x.reason) + ' · ' + H.esc(H.fmtDate(x.date)) + '</span></div><span class="badge badge-danger num">\u200E−' + x.amount + '</span></div>';
      }).join('') + '</div></section>';
  }

  function criteriaHTML(d) {
    var crit = d.league.settings.tiebreakers;
    return '<section class="section">' + UI.Render.sectionHead(t('tiebreakers')) + '<div class="card card-pad"><div class="row-2 wrap">' +
      crit.map(function (c, i) { return '<span class="badge ' + (i === 0 ? 'badge-primary' : '') + '"><span class="num">' + (i + 1) + '</span> ' + t(c) + '</span>'; }).join('') +
      '</div></div></section>';
  }

  function openTiebreak(teamId) {
    var d = C.State.data;
    var ex = E.Tiebreaker.explain(d, teamId);
    if (!ex) return;
    var team = C.Teams.get(teamId);
    var html = '<div class="row-3 mb-4">' + UI.Badges.crest(team, 'lg') + '<div class="stack-1"><strong class="text-lg">' + H.esc(I18n.name(team)) + '</strong><span class="text-sm text-muted">#' + ex.row.position + ' · ' + ex.row.pts + ' ' + t('points2') + '</span></div></div>';
    if (ex.tied.length < 2) {
      html += '<div class="alert alert-info">' + UI.icon('info') + '<div>' + t('notTied') + '</div></div>';
    } else {
      html += '<div class="divider-label">' + t('tiedTeams') + ' (' + ex.tied.length + ')</div><div class="row-2 wrap mb-3">' +
        ex.tied.map(function (r) { return '<span class="badge ' + (r.teamId === teamId ? 'badge-gold' : '') + '">' + H.esc(I18n.short(r.team)) + '</span>'; }).join('') + '</div>';
      html += '<div class="stack-2">' + ex.steps.map(function (s, i) {
        return '<div class="tb-step"><div class="tb-step-head"><span class="n">' + (i + 1) + '</span>' + t(s.criterion) + '</div><div class="tb-vals">' +
          s.teams.map(function (x) {
            var tm = C.Teams.get(x.teamId);
            var val = (s.criterion === 'diff' || s.criterion === 'h2hDiff') ? H.signed(x.value) : x.value;
            if (s.criterion === 'draw') val = '#' + (x.value % 100);
            return '<span class="tb-val">' + UI.Badges.crest(tm, 'xs') + H.esc(I18n.short(tm)) + ' <span class="num">' + val + '</span></span>';
          }).join('') + '</div></div>';
      }).join('') + '</div>';
      html += '<div class="divider-label">' + t('standingsAfter') + '</div><div class="card list">' +
        ex.order.map(function (r, i) {
          return '<div class="list-item" style="min-height:48px"><span class="li-rank">' + (i + 1) + '</span>' + UI.Badges.crest(r.team, 'sm') + '<div class="li-main"><span class="li-title text-sm">' + H.esc(I18n.name(r.team)) + '</span></div>' +
            (r.decidedBy ? '<span class="badge badge-primary">' + t(r.decidedBy) + '</span>' : '') + '</div>';
        }).join('') + '</div>';
      if (ex.mini) {
        var mrows = Object.keys(ex.mini).map(function (k) { return ex.mini[k]; }).sort(function (a, b) { return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf; });
        html += '<div class="divider-label">' + t('miniTable') + '</div><div class="table-wrap" style="max-height:none"><table class="data-table"><thead><tr><th class="text-start">' + t('team') + '</th><th>' + t('played') + '</th><th>' + t('gf') + '</th><th>' + t('ga') + '</th><th>' + t('gd') + '</th><th>' + t('pts') + '</th></tr></thead><tbody>' +
          mrows.map(function (r) {
            var tm = C.Teams.get(r.teamId);
            return '<tr><td class="text-start" style="font-family:var(--font-body)"><span class="row-2">' + UI.Badges.crest(tm, 'xs') + H.esc(I18n.short(tm)) + '</span></td><td>' + r.played + '</td><td>' + r.gf + '</td><td>' + r.ga + '</td><td>' + H.signed(r.gd) + '</td><td class="col-pts">' + r.pts + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }
    }
    html += '<a class="btn btn-secondary btn-block mt-4" href="team.html?id=' + encodeURIComponent(teamId) + '">' + UI.icon('users') + t('team') + '</a>';
    UI.Modal.open({ title: t('tiebreak'), content: html });
  }

  function renderTable(root) {
    var d = C.State.data;
    var rows = E.Standings.compute(d, { includeLive: state.live });
    if (state.group !== 'all') rows = rows.filter(function (r) { return r.team.group === state.group; });
    var box = root.querySelector('#table-box');
    box.innerHTML = rows.length ? tableHTML(rows) : '<div class="card">' + UI.Render.empty('trophy', t('empty')) + '</div>';
    var wrap = box.querySelector('#table-wrap');
    if (wrap) {
      wrap.addEventListener('click', function (e) {
        var tr = e.target.closest('tr[data-team]');
        if (tr) { UI.Haptic.tap(10); openTiebreak(tr.getAttribute('data-team')); }
      });
      wrap.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var tr = e.target.closest('tr[data-team]');
          if (tr) openTiebreak(tr.getAttribute('data-team'));
        }
      });
    }
  }

  function render(root) {
    var d = C.State.data;
    var groups = [];
    d.teams.forEach(function (tm) { if (groups.indexOf(tm.group) === -1) groups.push(tm.group); });
    groups.sort();
    var hasLive = d.matches.some(function (m) { return m.status === 'live'; });
    root.innerHTML =
      '<div class="page-head"><div><h1 class="page-title">' + t('standings') + '</h1><p class="page-sub">' + t('season') + ' ' + H.esc(d.league.season) + '</p></div>' +
      (hasLive ? '<label class="row-2 text-sm fw-bold"><span class="switch"><input type="checkbox" id="live-toggle" ' + (state.live ? 'checked' : '') + '><span class="track"></span><span class="thumb"></span></span>' + t('live') + '</label>' : '') + '</div>' +
      '<div class="chips mb-3" id="grp-chips"><button class="chip ' + (state.group === 'all' ? 'active' : '') + '" data-g="all" type="button">' + t('overall') + '</button>' +
      (groups.length > 1 ? groups.map(function (g) { return '<button class="chip ' + (state.group === g ? 'active' : '') + '" data-g="' + H.esc(g) + '" type="button">' + t('groupLabel') + ' ' + H.esc(g) + '</button>'; }).join('') : '') + '</div>' +
      '<div id="table-box"></div>' + legendHTML(d) + deductionsHTML(d) + criteriaHTML(d);
    root.querySelector('#grp-chips').addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      state.group = b.getAttribute('data-g');
      root.querySelectorAll('#grp-chips .chip').forEach(function (c) { c.classList.toggle('active', c === b); });
      UI.Haptic.tap(8);
      renderTable(root);
    });
    var lt = root.querySelector('#live-toggle');
    if (lt) lt.addEventListener('change', function () { state.live = lt.checked; renderTable(root); });
    renderTable(root);
  }

  global.Pages = global.Pages || {};
  global.Pages.standings = {
    init: function (root) { render(root); },
    onData: function (root) { renderTable(root); }
  };
})(window);
