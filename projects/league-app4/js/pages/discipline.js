/* =========================================================
   pages/discipline.js — Discipline (discipline.html)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  var state = { tab: 'suspended', team: 'all' };

  var KIND_LABEL = { accumulation: 'accumulation', secondYellow: 'secondYellow', directRed: 'directRed', manual: 'manual' };
  var DEC_ICON = { ban: 'gavel', fine: 'fine', cancel: 'check', reset: 'reset' };

  function typeLabel(type) {
    if (type === 'ban') return t('ban');
    if (type === 'fine') return t('fine');
    if (type === 'cancel') return t('cancelBan');
    if (type === 'reset') return I18n.lang === 'ar' ? 'تصفير الإنذارات' : 'Reset cards';
    return type;
  }

  function teamFilter(list) {
    if (state.team === 'all') return list;
    return list.filter(function (x) { return x.teamId === state.team; });
  }

  function cardsHTML(r) {
    var list = teamFilter(r.cards);
    if (!list.length) return '<div class="card">' + UI.Render.empty('card', t('empty')) + '</div>';
    var byMatch = H.groupBy(list, function (c) { return c.matchId; });
    var order = [];
    list.forEach(function (c) { if (order.indexOf(c.matchId) === -1) order.push(c.matchId); });
    return order.map(function (mid) {
      var m = C.Matches.get(mid);
      if (!m) return '';
      return '<div class="divider-label">' + t('round') + ' ' + m.round + ' · ' + H.esc(C.teamShort(m.homeTeamId)) + ' ' + m.score.home + ' - ' + m.score.away + ' ' + H.esc(C.teamShort(m.awayTeamId)) + '</div>' +
        '<div class="card list">' + byMatch[mid].map(function (c) {
          var p = C.Players.get(c.playerId);
          return '<a class="list-item" href="match-live.html?id=' + encodeURIComponent(mid) + '">' + UI.Badges.cardIcon(c.type) + UI.Badges.avatar(p, 'sm') +
            '<div class="li-main"><span class="li-title text-sm">' + H.esc(I18n.name(p)) + '</span><span class="li-sub">' + H.esc(C.teamShort(c.teamId)) + ' · ' + (c.type === 'secondYellow' ? t('secondYellow') : t(c.type)) + (c.auto ? ' · ' + t('auto') : '') + '</span></div>' +
            '<span class="num fw-heavy text-muted">' + c.minute + "'</span></a>";
        }).join('') + '</div>';
    }).join('');
  }

  function suspendedHTML(r) {
    var d = C.State.data;
    var list = teamFilter(r.suspensions).slice().sort(function (a, b) {
      return (b.active - a.active) || (new Date(b.startDate) - new Date(a.startDate));
    });
    var risk = teamFilter(E.Disciplinary.atRisk(d, r));
    var html = '';
    if (!list.length) html += '<div class="card">' + UI.Render.empty('shield', I18n.lang === 'ar' ? 'لا يوجد لاعبون موقوفون' : 'No suspended players') + '</div>';
    else {
      html += '<div class="card">' + list.map(function (s) {
        var p = C.Players.get(s.playerId);
        var next = s.nextMatchId ? C.Matches.get(s.nextMatchId) : null;
        var status = s.cancelled ? '<span class="badge badge-success">' + t('cancelBan') + '</span>' :
          s.voided ? '<span class="badge badge-info">' + t('voided') + '</span>' :
          s.active ? '<span class="badge badge-danger">' + t('remaining') + ' ' + s.remaining + '</span>' :
          '<span class="badge">' + t('served') + '</span>';
        var reason = s.kind === 'manual' ? (I18n.lang === 'en' && s.reasonEn ? s.reasonEn : s.reason) : t(KIND_LABEL[s.kind]);
        return '<div class="susp-card" style="' + (s.active ? '' : 'opacity:.62') + '">' + UI.Badges.avatar(p) +
          '<div class="li-main grow stack-1" style="min-width:0"><span class="fw-heavy truncate">' + H.esc(I18n.name(p)) + '</span>' +
          '<span class="text-xs text-muted truncate">' + H.esc(C.teamShort(s.teamId)) + ' · ' + H.esc(reason) + ' · ' + s.matches + ' ' + t('matchesBan') + '</span>' +
          (next && s.active ? '<span class="text-xs fw-bold text-danger truncate">' + t('nextMatch') + ': ' + H.esc(C.teamShort(next.homeTeamId)) + ' ' + t('vs') + ' ' + H.esc(C.teamShort(next.awayTeamId)) + ' · ' + H.esc(H.fmtDate(next.date)) + '</span>' : '') +
          '</div><div class="stack-1" style="align-items:flex-end">' + status + '<span class="text-xs text-muted num">' + s.served + '/' + s.matches + '</span></div></div>';
      }).join('') + '</div>';
    }
    if (risk.length) {
      html += '<section class="section">' + UI.Render.sectionHead(I18n.lang === 'ar' ? 'مهددون بالإيقاف' : 'One booking away') + '<div class="card list">' +
        risk.map(function (x) {
          var p = C.Players.get(x.playerId);
          return '<div class="list-item">' + UI.Badges.avatar(p, 'sm') + '<div class="li-main"><span class="li-title text-sm">' + H.esc(I18n.name(p)) + '</span><span class="li-sub">' + H.esc(C.teamShort(p.teamId)) + '</span></div>' +
            '<span class="row-1">' + Array(r.counters[x.playerId] + 1).join(UI.Badges.cardIcon('yellow')) + '</span></div>';
        }).join('') + '</div></section>';
    }
    return html;
  }

  function decisionsHTML() {
    var d = C.State.data;
    var admin = C.Permissions.isAdmin();
    var list = teamFilter(d.discipline.map(function (x) {
      var p = C.Players.get(x.playerId);
      return Object.assign({}, x, { teamId: x.teamId || (p ? p.teamId : null) });
    })).sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    var html = admin ? '<button class="btn btn-primary btn-block mb-3" id="add-decision" type="button">' + UI.icon('plus') + t('addDecision') + '</button>' :
      '<div class="alert alert-info mb-3">' + UI.icon('lock') + '<div>' + (I18n.lang === 'ar' ? 'لإضافة قرار، سجّل الدخول من لوحة الإدارة' : 'Log in from the admin panel to add decisions') + '</div></div>';
    if (!list.length) return html + '<div class="card">' + UI.Render.empty('gavel', t('empty')) + '</div>';
    return html + '<div class="card">' + list.map(function (x) {
      var p = C.Players.get(x.playerId);
      var extra = x.type === 'ban' ? (x.matches + ' ' + t('matchesBan')) : x.type === 'fine' ? ('<span class="num">' + (x.amount || 0) + '</span>') : '';
      return '<div class="decision-card"><span class="decision-type ' + x.type + '">' + UI.icon(DEC_ICON[x.type] || 'gavel') + '</span>' +
        '<div class="grow stack-1" style="min-width:0"><div class="row between"><span class="fw-heavy truncate">' + H.esc(I18n.name(p)) + '</span><span class="badge">' + typeLabel(x.type) + (extra ? ' · ' + extra : '') + '</span></div>' +
        '<span class="text-sm text-muted">' + H.esc(I18n.lang === 'en' && x.reasonEn ? x.reasonEn : (x.reason || '')) + '</span>' +
        '<span class="text-xs text-faint">' + H.esc(C.teamShort(x.teamId)) + ' · ' + H.esc(H.fmtDateTime(x.date)) + '</span></div>' +
        (admin ? '<button class="icon-btn" data-del="' + H.esc(x.id) + '" type="button" aria-label="' + t('delete') + '" style="color:var(--danger)">' + UI.icon('trash') + '</button>' : '') + '</div>';
    }).join('') + '</div>';
  }

  function openDecisionForm(root) {
    var d = C.State.data;
    var players = d.players.slice().sort(function (a, b) { return (a.teamId + a.number) > (b.teamId + b.number) ? 1 : -1; });
    UI.FormBuilder.modal({
      title: t('addDecision'),
      schema: [
        { name: 'playerId', label: t('player'), type: 'select', required: true, span: 2, options: players.map(function (p) { return { value: p.id, label: C.teamShort(p.teamId) + ' · #' + p.number + ' ' + I18n.name(p) }; }) },
        { name: 'type', label: t('type'), type: 'select', required: true, options: [
          { value: 'ban', label: t('ban') }, { value: 'fine', label: t('fine') }, { value: 'cancel', label: t('cancelBan') }, { value: 'reset', label: typeLabel('reset') }
        ] },
        { name: 'date', label: t('date'), type: 'datetime', required: true, default: H.localISO(new Date()) },
        { name: 'matches', label: t('matchesBan'), type: 'number', min: 0, max: 50, default: 1 },
        { name: 'amount', label: t('amount') + ' (' + t('fine') + ')', type: 'number', min: 0, default: 0 },
        { name: 'reason', label: t('reason'), type: 'textarea', required: true }
      ]
    }).then(function (vals) {
      if (!vals) return;
      var p = C.Players.get(vals.playerId);
      vals.teamId = p ? p.teamId : null;
      vals.createdBy = 'admin';
      try {
        C.Decisions.create(vals);
        UI.Toast.success(t('saved'));
        renderBody(root);
      } catch (e) { UI.Toast.error(e.message); }
    });
  }

  function summaryHTML(r) {
    var y = r.cards.filter(function (c) { return c.type === 'yellow'; }).length;
    var rd = r.cards.filter(function (c) { return c.type !== 'yellow'; }).length;
    return '<div class="grid-2 md-grid-4 mb-4">' +
      '<div class="stat-tile gold"><span class="stat-icon"><span class="card-icon yellow"></span></span><span class="stat-value" data-count="' + y + '">0</span><span class="stat-label">' + t('yellowCards') + '</span></div>' +
      '<div class="stat-tile danger"><span class="stat-icon"><span class="card-icon red"></span></span><span class="stat-value" data-count="' + rd + '">0</span><span class="stat-label">' + t('redCards') + '</span></div>' +
      '<div class="stat-tile"><span class="stat-icon">' + UI.icon('lock') + '</span><span class="stat-value" data-count="' + r.active.length + '">0</span><span class="stat-label">' + t('suspended') + '</span></div>' +
      '<div class="stat-tile info"><span class="stat-icon">' + UI.icon('gavel') + '</span><span class="stat-value" data-count="' + C.State.data.discipline.length + '">0</span><span class="stat-label">' + t('decisions') + '</span></div>' +
      '</div>';
  }

  function renderBody(root) {
    var r = E.Disciplinary.compute(C.State.data);
    var body = root.querySelector('#disc-body');
    var html = state.tab === 'cards' ? cardsHTML(r) : state.tab === 'suspended' ? suspendedHTML(r) : decisionsHTML();
    body.innerHTML = '<div class="anim-fade-up">' + html + '</div>';
    var add = body.querySelector('#add-decision');
    if (add) add.addEventListener('click', function () { openDecisionForm(root); });
    body.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        UI.Modal.doubleConfirm({ message: typeLabel('ban') }).then(function (ok) {
          if (!ok) return;
          try { C.Decisions.remove(b.getAttribute('data-del')); UI.Toast.success(t('deleted')); renderBody(root); } catch (e) { UI.Toast.error(e.message); }
        });
      });
    });
    var sum = root.querySelector('#disc-summary');
    if (sum) { sum.innerHTML = summaryHTML(r); UI.Anim.countAll(sum); }
  }

  function render(root) {
    var d = C.State.data;
    var s = d.league.settings;
    root.innerHTML = '<div class="page-head"><div><h1 class="page-title">' + t('discipline') + '</h1><p class="page-sub">' +
      t('yellowForSuspension') + ': <span class="num">' + s.yellowForSuspension + '</span> · ' + t('redCardBan') + ': <span class="num">' + s.redCardBan + '</span>' +
      (s.resetCardsAfterRounds ? ' · ' + t('resetCardsAfterRounds') + ' <span class="num">' + s.resetCardsAfterRounds + '</span>' : '') + '</p></div></div>' +
      '<div id="disc-summary"></div>' +
      UI.Tabs.render([
        { key: 'suspended', label: t('suspended') },
        { key: 'cards', label: t('recordedCards') },
        { key: 'decisions', label: t('decisions') }
      ], state.tab, 'disc-tabs') +
      '<div class="mt-3"><select class="select" id="disc-team"><option value="all">' + t('all') + ' · ' + t('teams') + '</option>' +
      d.teams.map(function (tm) { return '<option value="' + H.esc(tm.id) + '">' + H.esc(I18n.name(tm)) + '</option>'; }).join('') + '</select></div>' +
      '<div id="disc-body" class="mt-4"></div>';
    UI.Tabs.bind(root.querySelector('#disc-tabs'), function (k) { state.tab = k; renderBody(root); });
    var sel = root.querySelector('#disc-team');
    sel.value = state.team;
    sel.addEventListener('change', function () { state.team = sel.value; renderBody(root); });
    renderBody(root);
  }

  global.Pages = global.Pages || {};
  global.Pages.discipline = {
    init: function (root) { render(root); },
    onData: function (root) { renderBody(root); }
  };
})(window);
