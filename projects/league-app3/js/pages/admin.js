/* =========================================================
   pages/admin.js — Admin panel (admin.html)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };
  var ar = function () { return I18n.lang === 'ar'; };

  var TABS = ['dashboard', 'teams', 'players', 'matches', 'live', 'rules', 'audit', 'ratings'];
  var state = {
    tab: 'dashboard',
    teamQ: '', playerQ: '', playerTeam: 'all', matchRound: 'all',
    liveMatch: null, evType: 'goal', evSide: 'home',
    auditFilter: 'all', rateMatch: null, towRound: null
  };

  function guard(fn) {
    return function () {
      try { return fn.apply(this, arguments); } catch (e) { UI.Toast.error(e.message); return null; }
    };
  }

  /* ---------------------------------------------------------
     Gate
     --------------------------------------------------------- */
  function gateHTML() {
    return '<div class="gate anim-fade-up"><div class="gate-icon">' + UI.icon('shield') + '</div>' +
      '<h1 class="page-title" style="font-size:1.6rem">' + t('admin_pin_title') + '</h1>' +
      '<p class="text-muted mt-2">' + (ar() ? 'أنت في وضع المشاهد. أدخل رمز PIN للحصول على صلاحيات الإدارة الكاملة.' : 'You are in viewer mode. Enter your PIN for full admin permissions.') + '</p>' +
      '<button class="btn btn-primary btn-lg btn-block mt-6" id="gate-login" type="button">' + UI.icon('unlock') + t('login') + '</button>' +
      '<p class="text-xs text-faint mt-3">' + t('pinHint') + '</p></div>';
  }

  /* ---------------------------------------------------------
     Dashboard
     --------------------------------------------------------- */
  function dashboardHTML() {
    var d = C.State.data;
    var tot = E.Stats.leagueTotals(d);
    var disc = E.Disciplinary.compute(d);
    var conflicts = E.Scheduler.detectConflicts(d);
    var live = d.matches.filter(function (m) { return m.status === 'live'; });
    var tiles = [
      ['users', t('teams'), tot.teams, ''], ['user', t('players'), tot.players, 'info'],
      ['calendar', t('matches'), tot.matches, ''], ['check', t('finished'), tot.played, 'gold'],
      ['ball', t('goals'), tot.goals, ''], ['live', t('live'), tot.live, 'danger'],
      ['lock', t('suspended'), disc.active.length, 'danger'], ['history', t('auditLog'), d.auditLog.length, 'info']
    ];
    var html = '<div class="grid-2 md-grid-4">' + tiles.map(function (x) {
      return '<div class="stat-tile ' + x[3] + '"><span class="stat-icon">' + UI.icon(x[0]) + '</span><span class="stat-value" data-count="' + x[2] + '">0</span><span class="stat-label">' + H.esc(x[1]) + '</span></div>';
    }).join('') + '</div>';
    if (live.length) {
      html += '<section class="section">' + UI.Render.sectionHead(t('liveNow')) + '<div class="stack-3">' + live.map(function (m) {
        return '<div class="live-scoreboard"><span class="row-2" style="min-width:0">' + UI.Badges.crest(C.Teams.get(m.homeTeamId), 'sm') + '<span class="fw-heavy truncate">' + H.esc(C.teamShort(m.homeTeamId)) + '</span></span>' +
          '<span class="stack-1" style="align-items:center"><span class="s">' + m.score.home + ' - ' + m.score.away + '</span><span class="text-xs num" style="color:var(--brand-gold-300)">' + C.liveMinute(m) + "'</span></span>" +
          '<span class="row-2" style="min-width:0;flex-direction:row-reverse">' + UI.Badges.crest(C.Teams.get(m.awayTeamId), 'sm') + '<span class="fw-heavy truncate">' + H.esc(C.teamShort(m.awayTeamId)) + '</span></span></div>' +
          '<button class="btn btn-secondary btn-sm btn-block" style="margin-top:-6px" type="button" data-golive="' + m.id + '">' + UI.icon('zap') + t('liveEntry') + '</button>';
      }).join('') + '</div></section>';
    }
    html += '<section class="section">' + UI.Render.sectionHead(t('conflicts')) + '<div class="card card-pad">' +
      (conflicts.length ? '<div class="alert alert-warning">' + UI.icon('alert') + '<div><strong>' + conflicts.length + ' ' + t('conflicts') + '</strong><ul>' +
        conflicts.slice(0, 8).map(function (c) { return '<li>' + H.esc(c.message) + ' (' + c.matchIds.join(', ') + ')</li>'; }).join('') + '</ul></div></div>' :
        '<div class="alert alert-success">' + UI.icon('check') + '<div>' + t('noConflicts') + '</div></div>') + '</div></section>';
    html += '<section class="section">' + UI.Render.sectionHead(t('quickActions')) + '<div class="grid-2">' +
      '<button class="btn btn-secondary" type="button" data-goto="teams">' + UI.icon('plus') + t('manageTeams') + '</button>' +
      '<button class="btn btn-secondary" type="button" data-goto="matches">' + UI.icon('calendar') + t('manageMatches') + '</button>' +
      '<button class="btn btn-secondary" type="button" data-goto="live">' + UI.icon('zap') + t('liveEntry') + '</button>' +
      '<button class="btn btn-secondary" type="button" data-goto="rules">' + UI.icon('settings') + t('leagueSettings') + '</button>' +
      '</div></section>';
    html += '<section class="section">' + UI.Render.sectionHead(t('auditLog')) + '<div class="card">' + auditItems(d.auditLog.slice(0, 5)) + '</div></section>';
    return html;
  }

  /* ---------------------------------------------------------
     Teams CRUD
     --------------------------------------------------------- */
  function teamSchema() {
    return [
      { name: 'name', label: t('name'), required: true },
      { name: 'nameEn', label: t('nameEn') },
      { name: 'shortName', label: t('shortName'), required: true },
      { name: 'shortNameEn', label: t('shortName') + ' (EN)' },
      { name: 'group', label: t('group'), required: true, default: 'A' },
      { name: 'founded', label: t('founded'), type: 'number', min: 1800, max: 2100 },
      { name: 'stadium', label: t('stadium'), required: true },
      { name: 'city', label: I18n.lang === 'ar' ? 'المدينة' : 'City' },
      { name: 'coach', label: t('coach'), span: 2 },
      { name: 'colors.primary', label: t('primaryColor'), type: 'color', default: '#0B6E4F' },
      { name: 'colors.secondary', label: t('secondaryColor'), type: 'color', default: '#FFFFFF' },
      { name: 'logo', label: t('logo'), type: 'file', accept: 'image/*', span: 2, hint: ar() ? 'اختياري — يُحفظ كـ Base64' : 'Optional — stored as Base64' }
    ];
  }

  function teamsHTML() {
    var d = C.State.data;
    var list = d.teams.filter(function (tm) { return UI.Search.match(state.teamQ, [tm.name, tm.nameEn, tm.shortName, tm.city, tm.coach]); });
    return '<div class="admin-toolbar">' + UI.Search.box('searchTeams', 'adm-team-q') +
      '<button class="btn btn-primary btn-icon" id="add-team" type="button" aria-label="' + t('add') + '">' + UI.icon('plus') + '</button></div>' +
      '<div class="card list" id="adm-team-list">' + (list.length ? list.map(function (tm) {
        return '<div class="list-item">' + UI.Badges.crest(tm) + '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(tm)) + '</span>' +
          '<span class="li-sub">' + t('groupLabel') + ' ' + H.esc(tm.group) + ' · ' + C.Teams.squad(tm.id).length + ' ' + t('playersCount') + ' · ' + H.esc(tm.stadium || '') + '</span></div>' +
          '<div class="admin-row-actions"><button class="btn btn-ghost btn-icon btn-sm" data-edit-team="' + tm.id + '" type="button" aria-label="' + t('edit') + '">' + UI.icon('edit') + '</button>' +
          '<button class="btn btn-ghost btn-icon btn-sm" data-del-team="' + tm.id + '" type="button" aria-label="' + t('delete') + '" style="color:var(--danger)">' + UI.icon('trash') + '</button></div></div>';
      }).join('') : UI.Render.empty('users', t('empty'))) + '</div>';
  }

  function editTeam(id, root) {
    var tm = id ? C.Teams.get(id) : null;
    UI.FormBuilder.modal({ title: tm ? t('edit') + ' · ' + tm.name : t('add') + ' ' + t('team'), schema: teamSchema(), values: tm || {} }).then(guard(function (vals) {
      if (!vals) return;
      vals.founded = vals.founded || null;
      if (tm) C.Teams.update(id, vals);
      else C.Teams.create(vals);
      UI.Toast.success(t('saved'));
      renderTab(root);
    }));
  }

  /* ---------------------------------------------------------
     Players CRUD
     --------------------------------------------------------- */
  function playerSchema(current) {
    var d = C.State.data;
    return [
      { name: 'name', label: t('name'), required: true },
      { name: 'nameEn', label: t('nameEn') },
      { name: 'teamId', label: t('team'), type: 'select', required: true, options: d.teams.map(function (tm) { return { value: tm.id, label: I18n.name(tm) }; }) },
      { name: 'number', label: t('number'), type: 'number', required: true, min: 1, max: 99, validate: function (v, form) {
        var teamId = form.elements.teamId.value;
        var clash = d.players.find(function (p) { return p.teamId === teamId && Number(p.number) === Number(v) && (!current || p.id !== current.id); });
        return clash ? (ar() ? 'الرقم مستخدم من ' : 'Number used by ') + clash.name : '';
      } },
      { name: 'position', label: t('position'), type: 'select', required: true, options: ['GK', 'DF', 'MF', 'FW'].map(function (p) { return { value: p, label: t(p) }; }) },
      { name: 'status', label: t('status'), type: 'select', options: [{ value: 'active', label: t('active') }, { value: 'injured', label: t('injured') }, { value: 'inactive', label: ar() ? 'غير نشط' : 'Inactive' }] },
      { name: 'birthdate', label: t('birthdate'), type: 'date' },
      { name: 'nationality', label: t('nationality'), default: 'YE', placeholder: 'YE' },
      { name: 'photo', label: t('photo'), type: 'file', accept: 'image/*', span: 2 }
    ];
  }

  function playersHTML() {
    var d = C.State.data;
    var list = d.players.filter(function (p) {
      if (state.playerTeam !== 'all' && p.teamId !== state.playerTeam) return false;
      return UI.Search.match(state.playerQ, [p.name, p.nameEn, String(p.number)]);
    });
    var shown = list.slice(0, 120);
    return '<div class="admin-toolbar">' + UI.Search.box('searchPlayers', 'adm-player-q') +
      '<button class="btn btn-primary btn-icon" id="add-player" type="button" aria-label="' + t('add') + '">' + UI.icon('plus') + '</button></div>' +
      '<select class="select mb-3" id="adm-player-team"><option value="all">' + t('all') + ' (' + d.players.length + ')</option>' +
      d.teams.map(function (tm) { return '<option value="' + tm.id + '"' + (state.playerTeam === tm.id ? ' selected' : '') + '>' + H.esc(I18n.name(tm)) + '</option>'; }).join('') + '</select>' +
      '<div class="card list">' + (shown.length ? shown.map(function (p) {
        return '<div class="list-item">' + UI.Badges.avatar(p, '', { number: true }) + '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(p)) + '</span>' +
          '<span class="li-sub">' + UI.Badges.pos(p.position) + H.esc(C.teamShort(p.teamId)) + (p.status !== 'active' ? ' · <span class="badge badge-warning">' + t(p.status) + '</span>' : '') + '</span></div>' +
          '<div class="admin-row-actions"><button class="btn btn-ghost btn-icon btn-sm" data-edit-player="' + p.id + '" type="button" aria-label="' + t('edit') + '">' + UI.icon('edit') + '</button>' +
          '<button class="btn btn-ghost btn-icon btn-sm" data-del-player="' + p.id + '" type="button" aria-label="' + t('delete') + '" style="color:var(--danger)">' + UI.icon('trash') + '</button></div></div>';
      }).join('') : UI.Render.empty('user', t('empty'))) + '</div>' +
      (list.length > shown.length ? '<p class="text-xs text-muted text-center mt-2">' + shown.length + ' / ' + list.length + ' — ' + (ar() ? 'استخدم البحث أو الفلتر' : 'use search or filter') + '</p>' : '');
  }

  function editPlayer(id, root) {
    var p = id ? C.Players.get(id) : null;
    var defaults = p || { teamId: state.playerTeam !== 'all' ? state.playerTeam : (C.State.data.teams[0] || {}).id, position: 'MF', status: 'active', nationality: 'YE' };
    UI.FormBuilder.modal({ title: p ? t('edit') + ' · ' + p.name : t('add') + ' ' + t('player'), schema: playerSchema(p), values: defaults }).then(guard(function (vals) {
      if (!vals) return;
      if (p) C.Players.update(id, vals);
      else C.Players.create(vals);
      UI.Toast.success(t('saved'));
      renderTab(root);
    }));
  }

  /* ---------------------------------------------------------
     Matches CRUD
     --------------------------------------------------------- */
  function matchSchema() {
    var d = C.State.data;
    var teamOpts = d.teams.map(function (tm) { return { value: tm.id, label: I18n.name(tm) }; });
    var stadiums = d.teams.map(function (tm) { return tm.stadium; }).filter(Boolean);
    return [
      { name: 'round', label: t('round2'), type: 'number', required: true, min: 1, max: 99, default: 1 },
      { name: 'status', label: t('status'), type: 'select', options: ['scheduled', 'live', 'finished', 'postponed'].map(function (s) { return { value: s, label: s === 'finished' ? (ar() ? 'انتهت' : 'Finished') : s === 'live' ? (ar() ? 'مباشر' : 'Live') : t(s) }; }) },
      { name: 'homeTeamId', label: t('homeTeam'), type: 'select', required: true, options: teamOpts },
      { name: 'awayTeamId', label: t('awayTeam'), type: 'select', required: true, options: teamOpts },
      { name: 'date', label: t('kickoff'), type: 'datetime', required: true, span: 2 },
      { name: 'stadium', label: t('stadium'), placeholder: stadiums[0] || '' },
      { name: 'referee', label: t('referee') },
      { name: 'score.home', label: t('homeScore'), type: 'number', min: 0, max: 99, default: 0 },
      { name: 'score.away', label: t('awayScore'), type: 'number', min: 0, max: 99, default: 0 }
    ];
  }

  function matchesHTML() {
    var d = C.State.data;
    var rounds = [];
    d.matches.forEach(function (m) { if (rounds.indexOf(m.round) === -1) rounds.push(m.round); });
    rounds.sort(function (a, b) { return a - b; });
    var list = C.Matches.sorted().filter(function (m) { return state.matchRound === 'all' || String(m.round) === String(state.matchRound); });
    var conflicts = E.Scheduler.detectConflicts(d);
    var conflictIds = {};
    conflicts.forEach(function (c) { c.matchIds.forEach(function (id) { conflictIds[id] = c.message; }); });
    return '<div class="admin-toolbar"><select class="select" id="adm-match-round"><option value="all">' + t('all') + ' · ' + t('round') + '</option>' +
      rounds.map(function (r) { return '<option value="' + r + '"' + (String(state.matchRound) === String(r) ? ' selected' : '') + '>' + t('round') + ' ' + r + '</option>'; }).join('') + '</select>' +
      '<button class="btn btn-primary btn-icon" id="add-match" type="button" aria-label="' + t('add') + '">' + UI.icon('plus') + '</button></div>' +
      (conflicts.length ? '<div class="alert alert-warning mb-3">' + UI.icon('alert') + '<div>' + conflicts.length + ' ' + t('conflicts') + '</div></div>' : '') +
      '<div class="card list">' + (list.length ? list.map(function (m) {
        return '<div class="list-item"><div class="li-main"><span class="li-title row-2">' + UI.Badges.crest(C.Teams.get(m.homeTeamId), 'xs') + H.esc(C.teamShort(m.homeTeamId)) +
          ' <span class="num">' + ((m.status === 'finished' || m.status === 'live') ? m.score.home + ' - ' + m.score.away : t('vs')) + '</span> ' + H.esc(C.teamShort(m.awayTeamId)) + UI.Badges.crest(C.Teams.get(m.awayTeamId), 'xs') + '</span>' +
          '<span class="li-sub">' + UI.Badges.status(m) + t('round') + ' ' + m.round + ' · ' + H.esc(H.fmtDateTime(m.date)) + (conflictIds[m.id] ? ' · <span class="text-danger">' + UI.icon('alert').replace('<svg', '<svg style="width:12px;height:12px;display:inline"') + '</span>' : '') + '</span></div>' +
          '<div class="admin-row-actions"><button class="btn btn-ghost btn-icon btn-sm" data-live-match="' + m.id + '" type="button" aria-label="' + t('liveEntry') + '">' + UI.icon('zap') + '</button>' +
          '<button class="btn btn-ghost btn-icon btn-sm" data-edit-match="' + m.id + '" type="button" aria-label="' + t('edit') + '">' + UI.icon('edit') + '</button>' +
          '<button class="btn btn-ghost btn-icon btn-sm" data-del-match="' + m.id + '" type="button" aria-label="' + t('delete') + '" style="color:var(--danger)">' + UI.icon('trash') + '</button></div></div>';
      }).join('') : UI.Render.empty('calendar', t('empty'))) + '</div>';
  }

  function editMatch(id, root) {
    var m = id ? C.Matches.get(id) : null;
    var d = C.State.data;
    var defaults = m || { round: 1, status: 'scheduled', homeTeamId: (d.teams[0] || {}).id, awayTeamId: (d.teams[1] || {}).id, date: H.localISO(new Date(Date.now() + 86400000)), score: { home: 0, away: 0 } };
    UI.FormBuilder.modal({
      title: m ? t('edit') + ' · ' + t('round') + ' ' + m.round : t('add') + ' ' + t('matches'),
      schema: matchSchema(), values: defaults,
      validate: function (form) { return form.elements.homeTeamId.value === form.elements.awayTeamId.value ? t('sameTeams') : ''; }
    }).then(guard(function (vals) {
      if (!vals) return;
      vals.score = { home: Number(vals.score.home) || 0, away: Number(vals.score.away) || 0 };
      if (!vals.stadium) { var ht = C.Teams.get(vals.homeTeamId); vals.stadium = ht ? ht.stadium : ''; }
      if (m) C.Matches.update(id, vals);
      else { vals.events = []; vals.lineups = null; vals.stats = null; C.Matches.create(vals); }
      var conf = E.Scheduler.detectConflicts(C.State.data).filter(function (c) { return c.matchIds.indexOf(m ? id : C.State.data.matches[C.State.data.matches.length - 1].id) !== -1; });
      if (conf.length) UI.Toast.warning(conf[0].message);
      else UI.Toast.success(t('saved'));
      renderTab(root);
    }));
  }

  /* ---------------------------------------------------------
     Live event entry
     --------------------------------------------------------- */
  var EV_TYPES = [
    { key: 'goal', icon: 'ball' }, { key: 'penalty', icon: 'target' }, { key: 'owngoal', icon: 'ball' },
    { key: 'yellow', icon: 'card' }, { key: 'red', icon: 'card' }, { key: 'sub', icon: 'swap' }
  ];

  function liveCandidates() {
    var d = C.State.data;
    return C.Matches.sorted().filter(function (m) { return m.status === 'live' || H.isToday(m.date) || m.status === 'scheduled'; })
      .sort(function (a, b) {
        var o = { live: 0, scheduled: 1, finished: 2, postponed: 3 };
        return (o[a.status] - o[b.status]) || (new Date(a.date) - new Date(b.date));
      }).concat(d.matches.filter(function (m) { return m.status === 'finished'; }).reverse());
  }

  function liveHTML() {
    var cands = liveCandidates();
    var seen = {};
    cands = cands.filter(function (m) { if (seen[m.id]) return false; seen[m.id] = true; return true; });
    if (!state.liveMatch || !C.Matches.get(state.liveMatch)) state.liveMatch = cands.length ? cands[0].id : null;
    var m = state.liveMatch ? C.Matches.get(state.liveMatch) : null;
    var html = '<div class="field mb-3"><label class="field-label">' + t('selectMatch') + '</label><select class="select" id="live-select">' +
      cands.map(function (x) {
        return '<option value="' + x.id + '"' + (x.id === state.liveMatch ? ' selected' : '') + '>' + (x.status === 'live' ? '● ' : '') + t('round') + ' ' + x.round + ' · ' + H.esc(C.teamShort(x.homeTeamId)) + ' ' + t('vs') + ' ' + H.esc(C.teamShort(x.awayTeamId)) + ' · ' + H.esc(H.fmtDate(x.date, { day: 'numeric', month: 'short' })) + '</option>';
      }).join('') + '</select></div>';
    if (!m) return html + '<div class="card">' + UI.Render.empty('calendar', t('empty')) + '</div>';
    var h = C.Teams.get(m.homeTeamId);
    var a = C.Teams.get(m.awayTeamId);
    var minute = C.liveMinute(m);
    if (minute === 'HT' || minute === null) minute = m.status === 'finished' ? 90 : (m.minute || 1);
    html += '<div class="live-scoreboard"><span class="row-2" style="min-width:0">' + UI.Badges.crest(h, 'sm') + '<span class="fw-heavy truncate">' + H.esc(I18n.short(h)) + '</span></span>' +
      '<span class="stack-1" style="align-items:center"><span class="s">' + m.score.home + ' - ' + m.score.away + '</span>' + UI.Badges.status(m) + '</span>' +
      '<span class="row-2" style="min-width:0;flex-direction:row-reverse">' + UI.Badges.crest(a, 'sm') + '<span class="fw-heavy truncate">' + H.esc(I18n.short(a)) + '</span></span></div>';
    html += '<div class="grid-3 mt-3">' +
      '<button class="btn ' + (m.status === 'live' ? 'btn-secondary' : 'btn-primary') + ' btn-sm" id="live-start" type="button"' + (m.status === 'live' ? ' disabled' : '') + '>' + UI.icon('play') + t('startMatch') + '</button>' +
      '<button class="btn btn-secondary btn-sm" id="live-minute" type="button"' + (m.status !== 'live' ? ' disabled' : '') + '>' + UI.icon('clock') + t('minute') + '</button>' +
      '<button class="btn btn-danger-soft btn-sm" id="live-end" type="button"' + (m.status === 'finished' ? ' disabled' : '') + '>' + UI.icon('stop') + t('endMatch') + '</button></div>';
    html += '<section class="section"><div class="card card-pad"><h3 class="card-title mb-3">' + t('addEvent') + '</h3>' +
      '<div class="event-type-grid" id="ev-types">' + EV_TYPES.map(function (x) {
        var ic = x.key === 'yellow' ? '<span class="card-icon yellow" style="width:14px;height:20px"></span>' : x.key === 'red' ? '<span class="card-icon red" style="width:14px;height:20px"></span>' : UI.icon(x.icon);
        return '<button class="event-type-btn ' + (state.evType === x.key ? 'active' : '') + '" data-ev="' + x.key + '" type="button"' + (x.key === 'owngoal' ? ' style="color:var(--danger)"' : '') + '>' + ic + '<span>' + t(x.key) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="field mt-4"><label class="field-label">' + (state.evType === 'owngoal' ? (ar() ? 'الفريق المستفيد' : 'Benefiting team') : t('team')) + '</label><div class="side-toggle" id="ev-side">' +
      '<button type="button" data-side="home" class="' + (state.evSide === 'home' ? 'active' : '') + '">' + UI.Badges.crest(h, 'xs') + '<span class="truncate">' + H.esc(I18n.short(h)) + '</span></button>' +
      '<button type="button" data-side="away" class="' + (state.evSide === 'away' ? 'active' : '') + '">' + UI.Badges.crest(a, 'xs') + '<span class="truncate">' + H.esc(I18n.short(a)) + '</span></button></div></div>' +
      '<div class="form-grid mt-3" id="ev-fields">' + eventFields(m, minute) + '</div>' +
      '<div id="ev-warn"></div>' +
      '<button class="btn btn-primary btn-block btn-lg mt-4" id="ev-add" type="button">' + UI.icon('plus') + t('addEvent') + '</button></div></section>';
    html += '<section class="section">' + UI.Render.sectionHead(t('events') + ' (' + m.events.length + ')', 'match-live.html?id=' + encodeURIComponent(m.id), t('openLive')) + '<div class="card list">' +
      (m.events.length ? m.events.slice().reverse().map(function (e) {
        var sub = e.type === 'sub' ? '↓ ' + C.playerName(e.playerOutId) : e.assistId ? t('assist') + ': ' + C.playerName(e.assistId) : (e.auto ? t('secondYellow') + ' · ' + t('auto') : '');
        return '<div class="list-item">' + UI.Badges.eventIcon(e.type) + '<div class="li-main"><span class="li-title text-sm">' + H.esc(C.playerName(e.playerId)) + '</span><span class="li-sub">' + t(e.type) + ' · ' + H.esc(C.teamShort(e.teamId)) + (sub ? ' · ' + H.esc(sub) : '') + '</span></div>' +
          '<span class="num fw-heavy">' + e.minute + "'</span>" +
          '<button class="btn btn-ghost btn-icon btn-sm" data-del-ev="' + e.id + '" type="button" aria-label="' + t('delete') + '" style="color:var(--danger)">' + UI.icon('trash') + '</button></div>';
      }).join('') : UI.Render.empty('clock', t('noEvents'))) + '</div></section>';
    return html;
  }

  function sidePlayers(m, side) {
    var teamId = side === 'home' ? m.homeTeamId : m.awayTeamId;
    var squad = C.Teams.squad(teamId);
    var lineup = m.lineups && m.lineups[side];
    if (lineup) {
      var ids = lineup.starters.concat(lineup.bench || []);
      var inLineup = squad.filter(function (p) { return ids.indexOf(p.id) !== -1; });
      var others = squad.filter(function (p) { return ids.indexOf(p.id) === -1; });
      return inLineup.concat(others);
    }
    return squad;
  }

  function playerOptions(list, selected, allowNone) {
    return (allowNone ? '<option value="">— ' + t('none') + ' —</option>' : '') + list.map(function (p) {
      return '<option value="' + p.id + '"' + (p.id === selected ? ' selected' : '') + '>#' + p.number + ' ' + H.esc(I18n.name(p)) + ' (' + t(p.position + 's') + ')</option>';
    }).join('');
  }

  function eventFields(m, minute) {
    var type = state.evType;
    var side = state.evSide;
    var other = side === 'home' ? 'away' : 'home';
    var players = type === 'owngoal' ? sidePlayers(m, other) : sidePlayers(m, side);
    var html = '<div class="field"><label class="field-label">' + t('minute') + '<span class="req">*</span></label><input class="input num" type="number" inputmode="numeric" id="ev-minute" min="1" max="130" value="' + minute + '"></div>';
    html += '<div class="field"><label class="field-label">' + (type === 'sub' ? (ar() ? 'اللاعب الداخل' : 'Player in') : t('player')) + '<span class="req">*</span></label><select class="select" id="ev-player">' + playerOptions(players) + '</select></div>';
    if (type === 'goal') html += '<div class="field span-2"><label class="field-label">' + t('assist') + '</label><select class="select" id="ev-assist">' + playerOptions(players, null, true) + '</select></div>';
    if (type === 'sub') html += '<div class="field span-2"><label class="field-label">' + (ar() ? 'اللاعب الخارج' : 'Player out') + '<span class="req">*</span></label><select class="select" id="ev-out">' + playerOptions(players) + '</select></div>';
    return html;
  }

  function checkSuspension(root, m) {
    var sel = root.querySelector('#ev-player');
    var warn = root.querySelector('#ev-warn');
    if (!sel || !warn) return;
    var susp = E.Disciplinary.isSuspended(C.State.data, sel.value, m.id);
    warn.innerHTML = susp ? '<div class="alert alert-danger mt-3">' + UI.icon('alert') + '<div>' + (ar() ? 'تنبيه: هذا اللاعب موقوف عن هذه المباراة' : 'Warning: this player is suspended for this match') + '</div></div>' : '';
  }

  function bindLive(root) {
    var m = state.liveMatch ? C.Matches.get(state.liveMatch) : null;
    var sel = root.querySelector('#live-select');
    if (sel) sel.addEventListener('change', function () { state.liveMatch = sel.value; renderTab(root); });
    if (!m) return;
    var start = root.querySelector('#live-start');
    if (start) start.addEventListener('click', guard(function () {
      C.Matches.setStatus(m.id, 'live', m.status === 'finished' ? 90 : 1);
      UI.Toast.success(t('startMatch'));
      renderTab(root);
    }));
    var minBtn = root.querySelector('#live-minute');
    if (minBtn) minBtn.addEventListener('click', function () {
      var cur = C.liveMinute(m);
      UI.Modal.prompt({ title: t('minute'), label: t('minute'), type: 'number', inputmode: 'numeric', value: cur === 'HT' ? 45 : cur }).then(guard(function (v) {
        if (v === null) return;
        var n = H.clamp(Number(v) || 1, 1, 130);
        C.Matches.update(m.id, { minute: n, minuteSetAt: new Date().toISOString() });
        renderTab(root);
      }));
    });
    var end = root.querySelector('#live-end');
    if (end) end.addEventListener('click', function () {
      UI.Modal.confirm({ title: t('endMatch'), message: C.teamShort(m.homeTeamId) + ' ' + m.score.home + ' - ' + m.score.away + ' ' + C.teamShort(m.awayTeamId), okText: t('endMatch'), icon: 'flag' }).then(guard(function (ok) {
        if (!ok) return;
        C.Matches.setStatus(m.id, 'finished');
        UI.Toast.success(t('matchOver'));
        renderTab(root);
      }));
    });
    root.querySelector('#ev-types').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ev]');
      if (!b) return;
      state.evType = b.getAttribute('data-ev');
      UI.Haptic.tap(8);
      renderTab(root);
    });
    root.querySelector('#ev-side').addEventListener('click', function (e) {
      var b = e.target.closest('[data-side]');
      if (!b) return;
      state.evSide = b.getAttribute('data-side');
      UI.Haptic.tap(8);
      renderTab(root);
    });
    var ps = root.querySelector('#ev-player');
    if (ps) { ps.addEventListener('change', function () { checkSuspension(root, m); }); checkSuspension(root, m); }
    root.querySelector('#ev-add').addEventListener('click', guard(function () {
      var minute = Number(root.querySelector('#ev-minute').value);
      var playerId = root.querySelector('#ev-player').value;
      if (!minute || minute < 1 || !playerId) { UI.Toast.error(t('fillRequired')); return; }
      var teamId = state.evSide === 'home' ? m.homeTeamId : m.awayTeamId;
      var ev = { type: state.evType, minute: minute, teamId: teamId, playerId: playerId };
      if (state.evType === 'goal') {
        var as = root.querySelector('#ev-assist').value;
        if (as && as === playerId) { UI.Toast.error(ar() ? 'لا يمكن أن يصنع اللاعب هدفه' : 'A player cannot assist himself'); return; }
        ev.assistId = as || null;
      }
      if (state.evType === 'sub') {
        var out = root.querySelector('#ev-out').value;
        if (!out || out === playerId) { UI.Toast.error(ar() ? 'اختر لاعباً خارجاً مختلفاً' : 'Choose a different player out'); return; }
        ev.playerOutId = out;
        if (m.lineups && m.lineups[state.evSide]) {
          var l = m.lineups[state.evSide];
          if (l.bench && l.bench.indexOf(playerId) === -1 && l.starters.indexOf(playerId) === -1) l.bench.push(playerId);
        }
      }
      var res = C.Matches.addEvent(m.id, ev);
      if (res && res.autoRed) UI.Toast.warning(ar() ? 'إنذار ثانٍ — تم احتساب بطاقة حمراء تلقائياً' : 'Second yellow — red card added automatically');
      else UI.Toast.success(t(state.evType) + ' · ' + minute + "'");
      UI.Haptic.success();
      renderTab(root);
    }));
    root.querySelectorAll('[data-del-ev]').forEach(function (b) {
      b.addEventListener('click', function () {
        UI.Modal.confirm({ title: t('delete'), message: t('confirmDelete'), danger: true, okText: t('delete') }).then(guard(function (ok) {
          if (!ok) return;
          C.Matches.removeEvent(m.id, b.getAttribute('data-del-ev'));
          UI.Toast.success(t('deleted'));
          renderTab(root);
        }));
      });
    });
  }

  /* ---------------------------------------------------------
     League rules (settings + DnD tiebreakers + deductions + scheduler)
     --------------------------------------------------------- */
  var ALL_CRITERIA = ['points', 'h2h', 'h2hDiff', 'h2hGoals', 'diff', 'goals', 'wins', 'fairplay', 'draw'];

  function rulesHTML() {
    var d = C.State.data;
    var s = d.league.settings;
    var active = s.tiebreakers.slice();
    var inactive = ALL_CRITERIA.filter(function (c) { return active.indexOf(c) === -1; });
    var html = '<section class="section"><div class="card card-pad"><h3 class="card-title mb-4">' + (ar() ? 'بيانات البطولة' : 'League info') + '</h3><div id="league-form"></div></div></section>';
    html += '<section class="section"><div class="card card-pad"><h3 class="card-title mb-4">' + t('leagueSettings') + '</h3><div id="rules-form"></div></div></section>';
    html += '<section class="section"><div class="card card-pad"><div class="row between mb-2"><h3 class="card-title">' + t('tiebreakers') + '</h3><button class="btn btn-ghost btn-sm" id="tb-reset" type="button">' + UI.icon('reset') + t('resetDefaults') + '</button></div>' +
      '<p class="text-xs text-muted mb-3">' + UI.icon('grip').replace('<svg', '<svg style="width:14px;height:14px;display:inline;vertical-align:-2px"') + ' ' + t('dragToReorder') + ' · ' + (ar() ? 'المفتاح لتفعيل/تعطيل المعيار' : 'toggle to enable/disable') + '</p>' +
      '<div class="dnd-list" id="tb-list">' + active.concat(inactive).map(function (c) {
        var on = active.indexOf(c) !== -1;
        var locked = c === 'points';
        return '<div class="dnd-item' + (locked ? ' locked' : '') + '" data-key="' + c + '" tabindex="0" style="' + (on ? '' : 'opacity:.55') + '">' +
          '<span class="handle">' + UI.icon(locked ? 'lock' : 'grip') + '</span><span class="idx">' + (on ? active.indexOf(c) + 1 : '–') + '</span>' +
          '<span class="grow fw-bold">' + t(c) + '</span>' +
          (locked ? '' : '<span class="switch"><input type="checkbox" data-tb-toggle="' + c + '" ' + (on ? 'checked' : '') + '><span class="track"></span><span class="thumb"></span></span>') + '</div>';
      }).join('') + '</div></div></section>';
    html += '<section class="section"><div class="card"><div class="card-head"><h3 class="card-title">' + t('pointsDeduction') + '</h3><button class="btn btn-primary btn-sm" id="add-ded" type="button">' + UI.icon('plus') + t('add') + '</button></div>' +
      '<div class="list">' + (s.pointsDeduction.length ? s.pointsDeduction.map(function (x) {
        var tm = C.Teams.get(x.teamId);
        return '<div class="list-item">' + UI.Badges.crest(tm, 'sm') + '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(tm)) + '</span><span class="li-sub">' + H.esc(x.reason) + ' · ' + H.esc(H.fmtDate(x.date)) + '</span></div>' +
          '<span class="badge badge-danger num">\u200E−' + x.amount + '</span><button class="btn btn-ghost btn-icon btn-sm" data-del-ded="' + x.id + '" type="button" aria-label="' + t('delete') + '" style="color:var(--danger)">' + UI.icon('trash') + '</button></div>';
      }).join('') : UI.Render.empty('minus', t('none'))) + '</div></div></section>';
    html += '<section class="section"><div class="card card-pad"><h3 class="card-title mb-2">' + t('generateSchedule') + '</h3>' +
      '<p class="text-xs text-muted mb-4">Round Robin · ' + (ar() ? 'طريقة الدائرة مع توزيع الملاعب وكشف التعارضات' : 'circle method with stadium distribution and conflict detection') + '</p><div id="sched-form"></div><div id="sched-preview" class="mt-3"></div></div></section>';
    return html;
  }

  function bindRules(root) {
    var d = C.State.data;
    var s = d.league.settings;
    var leagueForm = UI.FormBuilder.build([
      { name: 'name', label: t('name'), required: true },
      { name: 'nameEn', label: t('nameEn') },
      { name: 'season', label: t('season'), required: true },
      { name: 'country', label: t('countries') },
      { name: 'logo', label: t('logo'), type: 'file', accept: 'image/*', span: 2 }
    ], d.league, { submitText: t('save') });
    root.querySelector('#league-form').appendChild(leagueForm);
    leagueForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!UI.FormBuilder.validate(leagueForm)) return;
      UI.FormBuilder.values(leagueForm).then(guard(function (v) {
        C.League.update(v);
        UI.Toast.success(t('saved'));
      }));
    });
    var rulesForm = UI.FormBuilder.build([
      { name: 'winPoints', label: t('winPoints'), type: 'number', required: true, min: 0, max: 10 },
      { name: 'drawPoints', label: t('drawPoints'), type: 'number', required: true, min: 0, max: 10 },
      { name: 'lossPoints', label: t('lossPoints'), type: 'number', required: true, min: -5, max: 10 },
      { name: 'yellowForSuspension', label: t('yellowForSuspension'), type: 'number', required: true, min: 1, max: 20 },
      { name: 'redCardBan', label: t('redCardBan'), type: 'number', required: true, min: 1, max: 20 },
      { name: 'resetCardsAfterRounds', label: t('resetCardsAfterRounds'), type: 'number', min: 0, max: 99, hint: ar() ? '0 = بدون تصفير' : '0 = never' },
      { name: 'qualificationSpots.champions', label: t('champions'), type: 'number', min: 0, max: 20 },
      { name: 'qualificationSpots.europa', label: t('europa'), type: 'number', min: 0, max: 20 },
      { name: 'qualificationSpots.relegation', label: t('relegation'), type: 'number', min: 0, max: 20, span: 2 }
    ], s, { submitText: t('save') });
    root.querySelector('#rules-form').appendChild(rulesForm);
    rulesForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!UI.FormBuilder.validate(rulesForm)) return;
      UI.FormBuilder.values(rulesForm).then(guard(function (v) {
        v.resetCardsAfterRounds = v.resetCardsAfterRounds || 0;
        v.qualificationSpots = Object.assign({}, s.qualificationSpots, v.qualificationSpots);
        C.League.updateSettings(v);
        UI.Toast.success(t('saved') + ' · ' + t('recalculated'));
      }));
    });

    var list = root.querySelector('#tb-list');
    function saveOrder() {
      var keys = Array.prototype.slice.call(list.querySelectorAll('.dnd-item')).map(function (it) { return it.getAttribute('data-key'); });
      var enabled = keys.filter(function (k) {
        if (k === 'points') return true;
        var cb = list.querySelector('[data-tb-toggle="' + k + '"]');
        return cb && cb.checked;
      });
      enabled = ['points'].concat(enabled.filter(function (k) { return k !== 'points'; }));
      guard(function () { C.League.updateSettings({ tiebreakers: enabled }); })();
      list.querySelectorAll('.dnd-item').forEach(function (it) {
        var k = it.getAttribute('data-key');
        var on = enabled.indexOf(k) !== -1;
        it.style.opacity = on ? '' : '.55';
        it.querySelector('.idx').textContent = on ? (enabled.indexOf(k) + 1) : '–';
      });
      UI.Toast.success(t('saved') + ' · ' + t('recalculated'));
    }
    UI.DnD.sortable(list, saveOrder);
    list.addEventListener('change', function (e) { if (e.target.matches('[data-tb-toggle]')) saveOrder(); });
    root.querySelector('#tb-reset').addEventListener('click', guard(function () {
      C.League.updateSettings({ tiebreakers: C.DEFAULT_SETTINGS.tiebreakers.slice() });
      UI.Toast.success(t('resetDefaults'));
      renderTab(root);
    }));
    root.querySelector('#add-ded').addEventListener('click', function () {
      UI.FormBuilder.modal({
        title: t('pointsDeduction'),
        schema: [
          { name: 'teamId', label: t('team'), type: 'select', required: true, span: 2, options: d.teams.map(function (tm) { return { value: tm.id, label: I18n.name(tm) }; }) },
          { name: 'amount', label: t('amount'), type: 'number', required: true, min: 1, max: 100, default: 3 },
          { name: 'date', label: t('date'), type: 'datetime', required: true, default: H.localISO(new Date()) },
          { name: 'reason', label: t('reason'), type: 'textarea', required: true }
        ]
      }).then(guard(function (v) {
        if (!v) return;
        C.League.addDeduction(v);
        UI.Toast.success(t('deductionApplied'));
        renderTab(root);
      }));
    });
    root.querySelectorAll('[data-del-ded]').forEach(function (b) {
      b.addEventListener('click', function () {
        UI.Modal.confirm({ title: t('delete'), message: t('confirmDelete'), danger: true, okText: t('delete') }).then(guard(function (ok) {
          if (!ok) return;
          C.League.removeDeduction(b.getAttribute('data-del-ded'));
          UI.Toast.success(t('deleted'));
          renderTab(root);
        }));
      });
    });

    var schedForm = UI.FormBuilder.build([
      { name: 'startDate', label: t('startDate'), type: 'datetime', required: true, default: H.localISO(new Date(Date.now() + 7 * 86400000)) },
      { name: 'intervalDays', label: t('intervalDays'), type: 'number', required: true, min: 1, max: 30, default: 7 },
      { name: 'doubleRound', label: t('doubleRound'), type: 'switch', default: true, hint: ar() ? 'ذهاب وإياب' : 'Home and away legs' },
      { name: 'replace', label: t('replaceMatches'), type: 'switch', default: false, hint: ar() ? 'يحذف جميع المباريات الحالية' : 'Deletes all current matches' }
    ], {}, { submitText: t('generate') });
    root.querySelector('#sched-form').appendChild(schedForm);
    schedForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!UI.FormBuilder.validate(schedForm)) return;
      UI.FormBuilder.values(schedForm).then(function (v) {
        var gen = E.Scheduler.generate(C.State.data, v);
        var all = v.replace ? gen : C.State.data.matches.concat(gen);
        var conf = E.Scheduler.detectConflicts(C.State.data, all);
        var rounds = gen.reduce(function (mx, m) { return Math.max(mx, m.round); }, 0);
        var prev = root.querySelector('#sched-preview');
        prev.innerHTML = '<div class="alert ' + (conf.length ? 'alert-warning' : 'alert-success') + '">' + UI.icon(conf.length ? 'alert' : 'check') + '<div><strong>' + gen.length + ' ' + t('matchesCount') + ' · ' + rounds + ' ' + t('round') + '</strong><br>' +
          (conf.length ? conf.length + ' ' + t('conflicts') + ': ' + H.esc(conf[0].message) : t('noConflicts')) + '</div></div>' +
          '<button class="btn btn-gold btn-block mt-3" id="sched-apply" type="button">' + UI.icon('check') + t('apply') + '</button>';
        prev.querySelector('#sched-apply').addEventListener('click', function () {
          var go = v.replace ? UI.Modal.doubleConfirm({ title: t('replaceMatches'), message: C.State.data.matches.length + ' ' + t('matchesCount') }) : Promise.resolve(true);
          go.then(guard(function (ok) {
            if (!ok) return;
            C.Permissions.require();
            if (v.replace) {
              C.State.data.matches = [];
            } else {
              var maxR = C.State.data.matches.reduce(function (mx, m) { return Math.max(mx, m.round); }, 0);
              gen.forEach(function (m) { m.round += maxR; });
            }
            C.State.data.matches = C.State.data.matches.concat(gen);
            C.Audit.log('create', 'matches', 'schedule', t('generated') + ' · ' + gen.length);
            C.State.persist();
            UI.Toast.success(t('generated'));
            renderTab(root);
          }));
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Audit log
     --------------------------------------------------------- */
  var AUDIT_ICON = { create: 'plus', update: 'edit', remove: 'trash', login: 'unlock', logout: 'logout' };

  function auditItems(list) {
    if (!list.length) return UI.Render.empty('history', t('empty'));
    return list.map(function (a) {
      var diff = a.diff && Object.keys(a.diff).length ? Object.keys(a.diff).slice(0, 6).map(function (k) {
        var f = a.diff[k].from; var to = a.diff[k].to;
        var fs = f === undefined ? '∅' : (typeof f === 'object' ? JSON.stringify(f) : String(f));
        var ts = to === undefined ? '∅' : (typeof to === 'object' ? JSON.stringify(to) : String(to));
        if (fs.length > 60) fs = fs.slice(0, 57) + '…';
        if (ts.length > 60) ts = ts.slice(0, 57) + '…';
        return k + ': ' + fs + ' → ' + ts;
      }).join('\n') : '';
      return '<div class="audit-item"><span class="audit-dot ' + H.esc(a.action) + '">' + UI.icon(AUDIT_ICON[a.action] || 'info') + '</span>' +
        '<div class="grow" style="min-width:0"><div class="row between"><span class="fw-bold text-sm truncate">' + H.esc(a.summary || a.entity) + '</span><span class="text-xs text-faint nowrap">' + H.esc(H.relTime(a.at)) + '</span></div>' +
        '<div class="text-xs text-muted">' + t(a.action === 'remove' ? 'remove' : a.action) + ' · ' + H.esc(a.entity) + ' · ' + H.esc(a.entityId || '') + ' · ' + H.esc(a.user) + '</div>' +
        (diff ? '<div class="audit-diff">' + H.esc(diff) + '</div>' : '') + '</div></div>';
    }).join('');
  }

  function auditHTML() {
    var d = C.State.data;
    var list = d.auditLog.filter(function (a) { return state.auditFilter === 'all' || a.action === state.auditFilter; });
    return '<div class="chips mb-3" id="audit-chips">' + ['all', 'create', 'update', 'remove', 'login'].map(function (k) {
      return '<button class="chip ' + (state.auditFilter === k ? 'active' : '') + '" data-a="' + k + '" type="button">' + t(k === 'all' ? 'all' : k) + '</button>';
    }).join('') + '</div>' +
      '<div class="grid-2 mb-3"><button class="btn btn-secondary btn-sm" id="audit-export" type="button">' + UI.icon('download') + t('exportAudit') + '</button>' +
      '<button class="btn btn-danger-soft btn-sm" id="audit-clear" type="button">' + UI.icon('trash') + t('clearAudit') + '</button></div>' +
      '<div class="card">' + auditItems(list.slice(0, 200)) + '</div>';
  }

  /* ---------------------------------------------------------
     Ratings (manual ratings + Team of the Week + Player of season)
     --------------------------------------------------------- */
  function ratingsHTML() {
    var d = C.State.data;
    var fin = d.matches.filter(function (m) { return m.status === 'finished'; }).sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    if (!state.rateMatch && fin.length) state.rateMatch = fin[0].id;
    var lastRound = E.Ratings.lastCompletedRound(d);
    if (!state.towRound) state.towRound = lastRound;
    var rounds = [];
    fin.forEach(function (m) { if (rounds.indexOf(m.round) === -1) rounds.push(m.round); });
    rounds.sort(function (a, b) { return a - b; });
    var tow = E.Ratings.teamOfWeek(d, Number(state.towRound));
    var season = E.Ratings.season(d, 2).slice(0, 10);
    var html = '<section class="section"><div class="card card-pad"><div class="row between mb-3"><h3 class="card-title row-2">' + UI.icon('star') + t('teamOfWeek') + '</h3>' +
      '<select class="select" id="tow-round" style="width:auto;height:38px">' + rounds.map(function (r) { return '<option value="' + r + '"' + (Number(state.towRound) === r ? ' selected' : '') + '>' + t('round') + ' ' + r + '</option>'; }).join('') + '</select></div>' +
      towPitch(tow) + '</div></section>';
    html += '<section class="section">' + UI.Render.sectionHead(t('playerOfSeason')) + '<div class="card list">' +
      (season.length ? season.map(function (s, i) {
        return '<div class="list-item ' + (i === 0 ? 'stat-row-gold' : '') + '"><span class="li-rank">' + (i + 1) + '</span>' + UI.Badges.avatar(s.player) +
          '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(s.player)) + '</span><span class="li-sub">' + H.esc(C.teamShort(s.teamId)) + ' · ' + s.apps + ' ' + t('apps') + ' · ' + s.motm + ' ' + t('motmShort') + '</span></div>' + UI.Badges.rating(s.avg) + '</div>';
      }).join('') : UI.Render.empty('award', t('empty'))) + '</div></section>';
    var m = state.rateMatch ? C.Matches.get(state.rateMatch) : null;
    html += '<section class="section"><div class="card"><div class="card-head"><h3 class="card-title">' + t('rateMatch') + '</h3></div><div class="card-body">' +
      '<select class="select" id="rate-match">' + fin.map(function (x) { return '<option value="' + x.id + '"' + (x.id === state.rateMatch ? ' selected' : '') + '>' + t('round') + ' ' + x.round + ' · ' + H.esc(C.teamShort(x.homeTeamId)) + ' ' + x.score.home + ' - ' + x.score.away + ' ' + H.esc(C.teamShort(x.awayTeamId)) + '</option>'; }).join('') + '</select></div>' +
      (m ? '<div id="rate-list">' + E.Ratings.matchRatings(d, m).map(function (r) {
        return '<div class="rate-row">' + UI.Badges.avatar(r.player, 'sm') + '<div class="stack" style="min-width:0;width:34%"><span class="text-sm fw-bold truncate">' + H.esc(I18n.name(r.player)) + '</span><span class="text-xs text-muted">' + H.esc(C.teamShort(r.player.teamId)) + (r.manual ? ' · ' + t('manual') : ' · ' + t('auto')) + '</span></div>' +
          '<input type="range" min="1" max="10" step="0.1" value="' + r.rating + '" data-rate="' + r.playerId + '" aria-label="' + t('rating') + '"><span class="rate-val">' + UI.Badges.rating(r.rating) + '</span></div>';
      }).join('') + '</div><div class="card-body mt-3"><button class="btn btn-primary btn-block" id="rate-save" type="button">' + UI.icon('check') + t('save') + '</button></div>' : UI.Render.empty('star', t('empty'))) +
      '</div></section>';
    return html;
  }

  function towPitch(tow) {
    var Y = { GK: 89, DF: 69, MF: 46, FW: 21 };
    var dots = '';
    ['GK', 'DF', 'MF', 'FW'].forEach(function (pos) {
      var arr = tow.lines[pos];
      arr.forEach(function (r, i) {
        var x = ((i + 1) / (arr.length + 1)) * 100;
        if (I18n.lang === 'ar') x = 100 - x;
        var tm = C.Teams.get(r.player.teamId);
        var rc = r.rating >= 8.5 ? 'top' : r.rating >= 7 ? '' : r.rating >= 6 ? 'mid' : 'low';
        dots += '<div class="pitch-player" style="left:' + x + '%;top:' + Y[pos] + '%"><span class="pitch-rating ' + rc + '">' + r.rating.toFixed(1) + '</span>' +
          '<span class="pitch-shirt" style="background:' + tm.colors.primary + ';color:' + UI.Badges.contrast(tm.colors.primary) + '">' + r.player.number + '</span>' +
          '<span class="pitch-name">' + H.esc(String(I18n.name(r.player)).split(' ').slice(-1)[0]) + '</span></div>';
      });
    });
    if (!dots) return UI.Render.empty('star', t('empty'));
    return '<div class="pitch tow-pitch"><svg class="pitch-lines" viewBox="0 0 68 100" preserveAspectRatio="none" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="0.5"><rect x="2" y="2" width="64" height="96" rx="1"/><path d="M2 50h64"/><circle cx="34" cy="50" r="9"/><rect x="14" y="82" width="40" height="16"/><rect x="24" y="92" width="20" height="6"/><rect x="14" y="2" width="40" height="16"/></svg>' + dots + '</div>';
  }

  function bindRatings(root) {
    var tr = root.querySelector('#tow-round');
    if (tr) tr.addEventListener('change', function () { state.towRound = Number(tr.value); renderTab(root); });
    var rm = root.querySelector('#rate-match');
    if (rm) rm.addEventListener('change', function () { state.rateMatch = rm.value; renderTab(root); });
    root.querySelectorAll('[data-rate]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        inp.parentNode.querySelector('.rate-val').innerHTML = UI.Badges.rating(Number(inp.value));
      });
    });
    var save = root.querySelector('#rate-save');
    if (save) save.addEventListener('click', guard(function () {
      root.querySelectorAll('[data-rate]').forEach(function (inp) {
        C.Ratings.set(state.rateMatch, inp.getAttribute('data-rate'), Number(inp.value));
      });
      C.Ratings.commit(state.rateMatch);
      UI.Toast.success(t('ratingsSaved'));
      renderTab(root);
    }));
  }

  /* ---------------------------------------------------------
     Tab rendering & binding
     --------------------------------------------------------- */
  function renderTab(root) {
    var box = root.querySelector('#admin-body');
    if (!box) return;
    var html = '';
    switch (state.tab) {
      case 'teams': html = teamsHTML(); break;
      case 'players': html = playersHTML(); break;
      case 'matches': html = matchesHTML(); break;
      case 'live': html = liveHTML(); break;
      case 'rules': html = rulesHTML(); break;
      case 'audit': html = auditHTML(); break;
      case 'ratings': html = ratingsHTML(); break;
      default: html = dashboardHTML();
    }
    box.innerHTML = '<div class="anim-fade-up">' + html + '</div>';
    UI.Anim.countAll(box);
    bindTab(root);
  }

  function bindTab(root) {
    var box = root.querySelector('#admin-body');
    box.querySelectorAll('[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () { switchTab(root, b.getAttribute('data-goto')); });
    });
    box.querySelectorAll('[data-golive]').forEach(function (b) {
      b.addEventListener('click', function () { state.liveMatch = b.getAttribute('data-golive'); switchTab(root, 'live'); });
    });
    if (state.tab === 'teams') {
      var tq = box.querySelector('#adm-team-q');
      tq.value = state.teamQ;
      UI.Search.bind(tq, function (q) { state.teamQ = q; renderTab(root); setTimeout(function () { var x = root.querySelector('#adm-team-q'); if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 0); }, 300);
      box.querySelector('#add-team').addEventListener('click', function () { editTeam(null, root); });
      box.querySelectorAll('[data-edit-team]').forEach(function (b) { b.addEventListener('click', function () { editTeam(b.getAttribute('data-edit-team'), root); }); });
      box.querySelectorAll('[data-del-team]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-del-team');
          var tm = C.Teams.get(id);
          UI.Modal.doubleConfirm({ message: tm.name, secondMessage: ar() ? 'سيتم حذف لاعبي الفريق ومبارياته أيضاً' : 'The team players and matches will also be deleted' }).then(guard(function (ok) {
            if (!ok) return;
            C.Teams.remove(id);
            UI.Toast.success(t('deleted'));
            renderTab(root);
          }));
        });
      });
    }
    if (state.tab === 'players') {
      var pq = box.querySelector('#adm-player-q');
      pq.value = state.playerQ;
      UI.Search.bind(pq, function (q) { state.playerQ = q; renderTab(root); setTimeout(function () { var x = root.querySelector('#adm-player-q'); if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 0); }, 300);
      box.querySelector('#adm-player-team').addEventListener('change', function (e) { state.playerTeam = e.target.value; renderTab(root); });
      box.querySelector('#add-player').addEventListener('click', function () { editPlayer(null, root); });
      box.querySelectorAll('[data-edit-player]').forEach(function (b) { b.addEventListener('click', function () { editPlayer(b.getAttribute('data-edit-player'), root); }); });
      box.querySelectorAll('[data-del-player]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-del-player');
          UI.Modal.doubleConfirm({ message: C.playerName(id) }).then(guard(function (ok) {
            if (!ok) return;
            C.Players.remove(id);
            UI.Toast.success(t('deleted'));
            renderTab(root);
          }));
        });
      });
    }
    if (state.tab === 'matches') {
      box.querySelector('#adm-match-round').addEventListener('change', function (e) { state.matchRound = e.target.value; renderTab(root); });
      box.querySelector('#add-match').addEventListener('click', function () { editMatch(null, root); });
      box.querySelectorAll('[data-edit-match]').forEach(function (b) { b.addEventListener('click', function () { editMatch(b.getAttribute('data-edit-match'), root); }); });
      box.querySelectorAll('[data-live-match]').forEach(function (b) { b.addEventListener('click', function () { state.liveMatch = b.getAttribute('data-live-match'); switchTab(root, 'live'); }); });
      box.querySelectorAll('[data-del-match]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-del-match');
          var m = C.Matches.get(id);
          UI.Modal.doubleConfirm({ message: C.teamShort(m.homeTeamId) + ' ' + t('vs') + ' ' + C.teamShort(m.awayTeamId) }).then(guard(function (ok) {
            if (!ok) return;
            C.Matches.remove(id);
            UI.Toast.success(t('deleted'));
            renderTab(root);
          }));
        });
      });
    }
    if (state.tab === 'live') bindLive(root);
    if (state.tab === 'rules') bindRules(root);
    if (state.tab === 'ratings') bindRatings(root);
    if (state.tab === 'audit') {
      box.querySelector('#audit-chips').addEventListener('click', function (e) {
        var b = e.target.closest('.chip');
        if (!b) return;
        state.auditFilter = b.getAttribute('data-a');
        renderTab(root);
      });
      box.querySelector('#audit-export').addEventListener('click', function () {
        var rows = [['at', 'user', 'action', 'entity', 'entityId', 'summary']].concat(C.State.data.auditLog.map(function (a) { return [a.at, a.user, a.action, a.entity, a.entityId, a.summary]; }));
        C.Exporter.csv(rows, 'audit-log-' + H.localISO(new Date()).slice(0, 10) + '.csv');
        UI.Toast.success(t('exportDone'));
      });
      box.querySelector('#audit-clear').addEventListener('click', function () {
        UI.Modal.doubleConfirm({ title: t('clearAudit'), message: C.State.data.auditLog.length + ' ' + (ar() ? 'سجل' : 'entries') }).then(guard(function (ok) {
          if (!ok) return;
          C.Audit.clear();
          UI.Toast.success(t('deleted'));
          renderTab(root);
        }));
      });
    }
  }

  function switchTab(root, key) {
    state.tab = key;
    history.replaceState(null, '', 'admin.html?tab=' + key);
    var tabs = root.querySelector('#admin-tabs');
    tabs.querySelectorAll('.tab').forEach(function (b) {
      var on = b.getAttribute('data-tab') === key;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
      if (on && b.scrollIntoView) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    });
    if (root._tabsApi) root._tabsApi.move();
    renderTab(root);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render(root) {
    if (!C.Permissions.isAdmin()) {
      root.innerHTML = gateHTML();
      root.querySelector('#gate-login').addEventListener('click', function () {
        global.Shared.pinDialog().then(function (ok) {
          if (ok) { global.Shared.renderHeader(); render(root); }
        });
      });
      return;
    }
    var p = H.param('tab');
    if (p && TABS.indexOf(p) !== -1) state.tab = p;
    var labels = { dashboard: t('dashboard'), teams: t('manageTeams'), players: t('managePlayers'), matches: t('manageMatches'), live: t('liveEntry'), rules: t('leagueSettings'), audit: t('auditLog'), ratings: t('ratings') };
    var icons = { dashboard: 'grid', teams: 'users', players: 'user', matches: 'calendar', live: 'zap', rules: 'settings', audit: 'history', ratings: 'star' };
    root.innerHTML = '<div class="page-head"><div><h1 class="page-title">' + t('admin') + '</h1><p class="page-sub row-2"><span class="badge badge-gold">' + UI.icon('unlock') + t('adminMode') + '</span></p></div>' +
      '<button class="btn btn-secondary btn-sm" id="admin-logout" type="button">' + UI.icon('logout') + t('logout') + '</button></div>' +
      '<div class="admin-tabs glass"><div class="tabs tabs-scroll" id="admin-tabs" role="tablist"><span class="tab-indicator"></span>' +
      TABS.map(function (k) { return '<button class="tab ' + (state.tab === k ? 'active' : '') + '" data-tab="' + k + '" role="tab" type="button">' + UI.icon(icons[k]) + '<span>' + H.esc(labels[k]) + '</span></button>'; }).join('') +
      '</div></div><div id="admin-body" class="mt-3"></div>';
    root._tabsApi = UI.Tabs.bind(root.querySelector('#admin-tabs'), function (k) {
      state.tab = k;
      history.replaceState(null, '', 'admin.html?tab=' + k);
      renderTab(root);
    });
    root.querySelector('#admin-logout').addEventListener('click', function () {
      C.Permissions.logout();
      UI.Toast.info(t('viewerMode'));
      global.Shared.renderHeader();
      render(root);
    });
    renderTab(root);
    setTimeout(function () {
      var act = root.querySelector('#admin-tabs .tab.active');
      if (act && act.scrollIntoView) act.scrollIntoView({ inline: 'center', block: 'nearest' });
    }, 100);
  }

  global.Pages = global.Pages || {};
  global.Pages.admin = {
    init: function (root) { render(root); },
    onData: function () { /* admin re-renders explicitly after each action */ }
  };
})(window);
