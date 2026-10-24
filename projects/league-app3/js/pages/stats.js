/* =========================================================
   pages/stats.js — Statistics (stats.html)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  var state = { tab: 'scorers', q: '' };

  function podium(items, valueFn, subFn) {
    if (!items.length) return '';
    var order = [items[1], items[0], items[2]];
    return '<div class="podium">' + order.map(function (it, i) {
      if (!it) return '<div></div>';
      var rank = i === 1 ? 1 : i === 0 ? 2 : 3;
      return '<a class="podium-item ' + (rank === 1 ? 'first' : '') + '" href="team.html?id=' + encodeURIComponent(it.teamId) + '#p-' + encodeURIComponent(it.playerId) + '">' +
        '<span class="rank">' + rank + '</span>' + UI.Badges.avatar(it.player, rank === 1 ? 'xl' : 'lg') +
        '<span class="pname">' + H.esc(I18n.name(it.player)) + '</span>' +
        '<span class="text-xs text-muted truncate" style="max-width:100%">' + H.esc(C.teamShort(it.teamId)) + '</span>' +
        '<span class="pval">' + valueFn(it) + '</span>' +
        (subFn ? '<span class="text-xs text-muted">' + subFn(it) + '</span>' : '') + '</a>';
    }).join('') + '</div>';
  }

  function playerList(items, start, valueFn, subFn, label) {
    var rest = items.slice(start);
    if (!rest.length) return '';
    return '<div class="card list">' + rest.map(function (it, i) {
      var tm = C.Teams.get(it.teamId);
      return '<a class="list-item" href="team.html?id=' + encodeURIComponent(it.teamId) + '#p-' + encodeURIComponent(it.playerId) + '">' +
        '<span class="li-rank">' + (i + start + 1) + '</span>' + UI.Badges.avatar(it.player) +
        '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(it.player)) + '</span><span class="li-sub">' + UI.Badges.crest(tm, 'xs') + H.esc(I18n.short(tm)) + (subFn ? ' · ' + subFn(it) : '') + '</span></div>' +
        '<div class="li-end"><span class="li-value">' + valueFn(it) + '</span></div></a>';
    }).join('') + '</div>';
  }

  function filtered(items) {
    if (!state.q) return items;
    return items.filter(function (it) {
      var tm = C.Teams.get(it.teamId);
      return UI.Search.match(state.q, [it.player.name, it.player.nameEn, tm ? tm.name : '', tm ? tm.nameEn : '']);
    });
  }

  function scorersHTML(d) {
    var items = filtered(E.Stats.scorers(d));
    if (!items.length) return '<div class="card">' + UI.Render.empty('ball', t('empty')) + '</div>';
    var v = function (it) { return it.value; };
    var s = function (it) { return it.apps + ' ' + t('apps') + (it.penalties ? ' · ' + it.penalties + ' ' + t('penShort') : ''); };
    return (state.q ? '' : podium(items, v, s)) + playerList(items, state.q ? 0 : 3, v, s);
  }

  function assistsHTML(d) {
    var items = filtered(E.Stats.assists(d));
    if (!items.length) return '<div class="card">' + UI.Render.empty('zap', t('empty')) + '</div>';
    var v = function (it) { return it.value; };
    var s = function (it) { return it.apps + ' ' + t('apps'); };
    return (state.q ? '' : podium(items, v, s)) + playerList(items, state.q ? 0 : 3, v, s);
  }

  function keepersHTML(d) {
    var items = filtered(E.Stats.keepers(d));
    if (!items.length) return '<div class="card">' + UI.Render.empty('glove', t('empty')) + '</div>';
    var v = function (it) { return it.value; };
    var s = function (it) { return it.apps + ' ' + t('apps') + ' · ' + it.gaPerMatch + ' ' + t('ga') + '/' + (I18n.lang === 'ar' ? 'م' : 'm'); };
    return (state.q ? '' : podium(items, v, s)) + playerList(items, state.q ? 0 : 3, v, s);
  }

  function fairplayHTML(d) {
    var rows = E.Stats.fairplay(d);
    if (state.q) rows = rows.filter(function (r) { return UI.Search.match(state.q, [r.team.name, r.team.nameEn]); });
    var cards = E.Stats.cards(d).slice(0, 10);
    var html = '<div class="card list">' + rows.map(function (r, i) {
      return '<a class="list-item ' + (i === 0 && !state.q ? 'stat-row-gold' : '') + '" href="team.html?id=' + encodeURIComponent(r.teamId) + '">' +
        '<span class="li-rank">' + (i + 1) + '</span>' + UI.Badges.crest(r.team) +
        '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(r.team)) + (i === 0 && !state.q ? ' ' + UI.icon('award').replace('<svg', '<svg style="width:16px;height:16px;display:inline;color:var(--brand-gold-600)"') : '') + '</span>' +
        '<span class="li-sub"><span class="row-1">' + UI.Badges.cardIcon('yellow') + '<span class="num">' + r.yellow + '</span></span><span class="row-1">' + UI.Badges.cardIcon('red') + '<span class="num">' + r.red + '</span></span></span></div>' +
        '<div class="li-end"><span class="li-value ' + (r.fairplay === 0 ? 'text-success' : '') + '">' + r.fairplay + '</span></div></a>';
    }).join('') + '</div>';
    html += '<p class="text-xs text-muted mt-2">' + (I18n.lang === 'ar' ? 'النقاط: صفراء −1، إنذار ثانٍ −3، طرد مباشر −4، صفراء + طرد مباشر −5' : 'Points: yellow −1, second yellow −3, direct red −4, yellow + direct red −5') + '</p>';
    if (cards.length && !state.q) {
      html += '<section class="section">' + UI.Render.sectionHead(t('mostCards'), 'discipline.html', t('discipline')) + '<div class="card list">' +
        cards.map(function (c, i) {
          return '<div class="list-item"><span class="li-rank">' + (i + 1) + '</span>' + UI.Badges.avatar(c.player, 'sm') +
            '<div class="li-main"><span class="li-title text-sm">' + H.esc(I18n.name(c.player)) + '</span><span class="li-sub">' + H.esc(C.teamShort(c.player.teamId)) + '</span></div>' +
            '<div class="li-end"><span class="row-1">' + UI.Badges.cardIcon('yellow') + '<span class="num fw-heavy">' + c.yellow + '</span></span><span class="row-1">' + UI.Badges.cardIcon('red') + '<span class="num fw-heavy">' + c.red + '</span></span></div></div>';
        }).join('') + '</div></section>';
    }
    return html;
  }

  function overviewHTML(d) {
    var table = E.Standings.compute(d);
    var att = table.slice().sort(function (a, b) { return b.gf - a.gf; })[0];
    var def = table.slice().sort(function (a, b) { return a.ga - b.ga; })[0];
    var tot = E.Stats.leagueTotals(d);
    return '<div class="grid-2 md-grid-4 mb-4">' +
      '<div class="stat-tile"><span class="stat-icon">' + UI.icon('ball') + '</span><span class="stat-value" data-count="' + tot.goals + '">0</span><span class="stat-label">' + t('goals') + '</span></div>' +
      '<div class="stat-tile gold"><span class="stat-icon">' + UI.icon('percent') + '</span><span class="stat-value">' + tot.avgGoals + '</span><span class="stat-label">' + t('goals') + ' ' + t('perMatch') + '</span></div>' +
      (att ? '<div class="stat-tile info"><span class="stat-icon">' + UI.icon('target') + '</span><span class="stat-value row-2">' + UI.Badges.crest(att.team, 'xs') + att.gf + '</span><span class="stat-label truncate">' + t('bestAttack') + ' · ' + H.esc(I18n.short(att.team)) + '</span></div>' : '') +
      (def ? '<div class="stat-tile danger"><span class="stat-icon">' + UI.icon('shield') + '</span><span class="stat-value row-2">' + UI.Badges.crest(def.team, 'xs') + def.ga + '</span><span class="stat-label truncate">' + t('bestDefense') + ' · ' + H.esc(I18n.short(def.team)) + '</span></div>' : '') +
      '</div>';
  }

  function renderBody(root) {
    var d = C.State.data;
    var body = root.querySelector('#stats-body');
    var html = '';
    if (state.tab === 'scorers') html = scorersHTML(d);
    else if (state.tab === 'assists') html = assistsHTML(d);
    else if (state.tab === 'keepers') html = keepersHTML(d);
    else html = fairplayHTML(d);
    body.innerHTML = '<div class="anim-fade-up">' + html + '</div>';
  }

  function render(root) {
    var d = C.State.data;
    var p = H.param('tab');
    if (p && ['scorers', 'assists', 'keepers', 'fairplay'].indexOf(p) !== -1) state.tab = p;
    root.innerHTML = '<div class="page-head"><div><h1 class="page-title">' + t('stats') + '</h1><p class="page-sub">' + t('season') + ' ' + H.esc(d.league.season) + '</p></div>' +
      '<a class="btn btn-secondary btn-sm" href="discipline.html">' + UI.icon('gavel') + t('discipline') + '</a></div>' +
      overviewHTML(d) +
      UI.Tabs.render([
        { key: 'scorers', label: t('scorers') },
        { key: 'assists', label: t('assists') },
        { key: 'keepers', label: t('keepers') },
        { key: 'fairplay', label: t('fairplay') }
      ], state.tab, 'stats-tabs') +
      '<div class="mt-3">' + UI.Search.box('searchPlayers', 'stats-search') + '</div>' +
      '<div id="stats-body" class="mt-4"></div>';
    UI.Anim.countAll(root);
    UI.Tabs.bind(root.querySelector('#stats-tabs'), function (k) {
      state.tab = k;
      history.replaceState(null, '', 'stats.html?tab=' + k);
      renderBody(root);
    });
    var input = root.querySelector('#stats-search');
    input.value = state.q;
    UI.Search.bind(input, function (q) { state.q = q; renderBody(root); }, 220);
    renderBody(root);
  }

  global.Pages = global.Pages || {};
  global.Pages.stats = {
    init: function (root) { render(root); },
    onData: function (root) { renderBody(root); }
  };
})(window);
