/* =========================================================
   pages/match-live.js — Match centre (match-live.html?id=m1)
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var E = global.Engines;
  var UI = global.UI;
  var H = global.Helpers;
  var I18n = global.I18n;
  var t = function (k) { return I18n.t(k); };

  var state = { tab: 'timeline', side: 'home', lastScore: null, matchId: null };

  var PITCH_SVG = '<svg class="pitch-lines" viewBox="0 0 68 100" preserveAspectRatio="none" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="0.5">' +
    '<rect x="2" y="2" width="64" height="96" rx="1"/><path d="M2 50h64"/><circle cx="34" cy="50" r="9"/><circle cx="34" cy="50" r="0.7" fill="rgba(255,255,255,0.7)"/>' +
    '<rect x="14" y="2" width="40" height="16"/><rect x="24" y="2" width="20" height="6"/><path d="M27 18a8 8 0 0 0 14 0"/>' +
    '<rect x="14" y="82" width="40" height="16"/><rect x="24" y="92" width="20" height="6"/><path d="M27 82a8 8 0 0 1 14 0"/></svg>';

  function sideOf(m, teamId) { return teamId === m.homeTeamId ? 'home' : 'away'; }

  function clockText(m) {
    if (m.status === 'live') {
      var min = C.liveMinute(m);
      return min === 'HT' ? t('ht') : (min + "'");
    }
    if (m.status === 'finished') return t('ft');
    if (m.status === 'postponed') return t('postponed');
    var diff = new Date(m.date) - new Date();
    if (diff > 0) {
      var dd = Math.floor(diff / 86400000);
      var hh = Math.floor((diff % 86400000) / 3600000);
      var mm = Math.floor((diff % 3600000) / 60000);
      return (dd ? dd + (I18n.lang === 'ar' ? 'ي ' : 'd ') : '') + H.pad(hh) + ':' + H.pad(mm);
    }
    return t('comingSoon');
  }

  function scorersList(m, side) {
    var teamId = side === 'home' ? m.homeTeamId : m.awayTeamId;
    return m.events.filter(function (e) { return (e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal') && e.teamId === teamId; })
      .map(function (e) {
        var suffix = e.type === 'penalty' ? ' (' + t('penShort') + ')' : e.type === 'owngoal' ? ' (' + t('ownGoalShort') + ')' : '';
        return '<div>' + H.esc(C.playerName(e.playerId)) + ' <span class="num">' + e.minute + "'</span>" + suffix + '</div>';
      }).join('');
  }

  function heroHTML(m) {
    var h = C.Teams.get(m.homeTeamId);
    var a = C.Teams.get(m.awayTeamId);
    var played = m.status === 'live' || m.status === 'finished';
    var center = played
      ? '<div class="live-score"><span id="sc-h">' + m.score.home + '</span><span class="sep">-</span><span id="sc-a">' + m.score.away + '</span></div>'
      : '<div class="live-score" style="font-size:2.2rem">' + H.fmtTime(m.date) + '</div>';
    return '<section class="hero live-hero">' +
      '<div class="live-hero-meta">' + UI.Badges.status(m) +
      '<span class="badge">' + t('round') + ' ' + m.round + '</span>' +
      '<span class="badge">' + UI.icon('calendar') + H.esc(H.fmtDate(m.date, { weekday: 'short', day: 'numeric', month: 'short' })) + '</span></div>' +
      '<div class="live-score-grid">' +
      '<a class="live-team" href="team.html?id=' + encodeURIComponent(h.id) + '">' + UI.Badges.crest(h, 'xl') + '<span class="live-team-name">' + H.esc(I18n.name(h)) + '</span></a>' +
      '<div class="stack-1" style="align-items:center">' + center + '<div class="live-clock" id="live-clock">' + clockText(m) + '</div></div>' +
      '<a class="live-team" href="team.html?id=' + encodeURIComponent(a.id) + '">' + UI.Badges.crest(a, 'xl') + '<span class="live-team-name">' + H.esc(I18n.name(a)) + '</span></a>' +
      '</div>' +
      (played ? '<div class="live-scorers"><div>' + scorersList(m, 'home') + '</div><div>' + scorersList(m, 'away') + '</div></div>' : '') +
      '<div class="row-3 center wrap mt-4 text-xs" style="color:rgba(255,255,255,.75);gap:14px">' +
      '<span class="row-1">' + UI.icon('stadium').replace('<svg', '<svg style="width:14px;height:14px"') + H.esc(m.stadium || '—') + '</span>' +
      '<span class="row-1">' + UI.icon('whistle').replace('<svg', '<svg style="width:14px;height:14px"') + H.esc(m.referee || '—') + '</span></div>' +
      '</section>';
  }

  function timelineHTML(m) {
    if (!m.events.length) {
      return '<div class="card">' + UI.Render.empty('clock', m.status === 'scheduled' ? t('comingSoon') : t('noEvents')) + '</div>';
    }
    var evs = m.events.slice().sort(function (a, b) { return a.minute - b.minute; });
    var html = '<div class="card card-pad"><div class="timeline">';
    html += '<div class="tl-divider"><span>' + t('ko') + '</span></div>';
    var htShown = false;
    evs.forEach(function (e) {
      if (!htShown && e.minute > 45) {
        html += '<div class="tl-divider"><span>' + t('ht') + ' · ' + halfScore(m, 45) + '</span></div>';
        htShown = true;
      }
      var side = sideOf(m, e.teamId);
      var isGoal = e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal';
      var name = C.playerName(e.playerId);
      var sub = t(e.type);
      if (e.type === 'goal' && e.assistId) sub = t('assist') + ': ' + C.playerName(e.assistId);
      if (e.type === 'sub') sub = '↓ ' + C.playerName(e.playerOutId);
      if (e.type === 'red' && e.auto) sub = t('secondYellow');
      html += '<div class="tl-item ' + side + (isGoal ? ' is-goal' : '') + '">' +
        '<span class="tl-min">' + e.minute + "'</span>" +
        '<div class="tl-content">' + UI.Badges.eventIcon(e.type) +
        '<div class="tl-text"><span class="tl-name">' + (e.type === 'sub' ? '↑ ' : '') + H.esc(name) + '</span><span class="tl-sub">' + H.esc(sub) + '</span></div></div></div>';
    });
    if (m.status === 'finished') html += '<div class="tl-divider"><span>' + t('ft') + ' · ' + m.score.home + ' - ' + m.score.away + '</span></div>';
    else if (m.status === 'live') html += '<div class="tl-divider"><span style="color:var(--danger)">' + t('live') + ' · ' + clockText(m) + '</span></div>';
    return html + '</div></div>';
  }

  function halfScore(m, upto) {
    var s = { home: 0, away: 0 };
    m.events.forEach(function (e) {
      if (e.minute > upto) return;
      if (e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal') s[sideOf(m, e.teamId)]++;
    });
    return s.home + ' - ' + s.away;
  }

  function lineupsHTML(m, disc) {
    var d = C.State.data;
    if (!m.lineups) {
      m.lineups = {
        home: C.Sample.pickLineup(d, m.homeTeamId, H.seededRandom(H.hashNum(m.id + 'h'))),
        away: C.Sample.pickLineup(d, m.awayTeamId, H.seededRandom(H.hashNum(m.id + 'a')))
      };
    }
    var side = state.side;
    var lineup = m.lineups[side];
    var teamId = side === 'home' ? m.homeTeamId : m.awayTeamId;
    var team = C.Teams.get(teamId);
    var played = m.status === 'finished' || m.status === 'live';
    var players = lineup.starters.map(function (id) { return C.Players.get(id); }).filter(Boolean);
    var lines = { GK: [], DF: [], MF: [], FW: [] };
    players.forEach(function (p) { (lines[p.position] || lines.MF).push(p); });
    var Y = { GK: 89, DF: 70, MF: 47, FW: 22 };
    var shirtBg = team.colors.primary;
    var shirtFg = UI.Badges.contrast(team.colors.primary);
    var dots = '';
    var delay = 0;
    ['GK', 'DF', 'MF', 'FW'].forEach(function (pos) {
      var arr = lines[pos];
      arr.forEach(function (p, i) {
        var x = ((i + 1) / (arr.length + 1)) * 100;
        if (I18n.lang === 'ar') x = 100 - x;
        var rating = played ? E.Ratings.get(d, m, p.id).value : null;
        var evs = m.events.filter(function (e) { return e.playerId === p.id || e.assistId === p.id || e.playerOutId === p.id; });
        var flags = '';
        evs.forEach(function (e) {
          if ((e.type === 'goal' || e.type === 'penalty') && e.playerId === p.id) flags += '<span style="display:inline-grid;place-items:center;width:14px;height:14px;border-radius:50%;background:#fff;color:#0A0E13">' + UI.icon('ball').replace('<svg', '<svg style="width:12px;height:12px"') + '</span>';
          if (e.type === 'yellow' && e.playerId === p.id) flags += '<span class="card-icon yellow" style="width:8px;height:11px"></span>';
          if (e.type === 'red' && e.playerId === p.id) flags += '<span class="card-icon red" style="width:8px;height:11px"></span>';
          if (e.type === 'sub' && e.playerOutId === p.id) flags += '<span style="display:inline-grid;place-items:center;width:14px;height:14px;border-radius:50%;background:var(--danger);color:#fff">' + UI.icon('swap').replace('<svg', '<svg style="width:10px;height:10px"') + '</span>';
        });
        var rc = rating === null ? '' : rating >= 8.5 ? 'top' : rating >= 7 ? '' : rating >= 6 ? 'mid' : 'low';
        dots += '<div class="pitch-player" style="left:' + x + '%;top:' + Y[pos] + '%;animation-delay:' + (delay * 40) + 'ms">' +
          (rating !== null ? '<span class="pitch-rating ' + rc + '">' + rating.toFixed(1) + '</span>' : '') +
          (flags ? '<span class="pitch-flag row-1" style="gap:2px">' + flags + '</span>' : '') +
          '<span class="pitch-shirt" style="background:' + (pos === 'GK' ? (team.colors.secondary) : shirtBg) + ';color:' + (pos === 'GK' ? UI.Badges.contrast(team.colors.secondary) : shirtFg) + '">' + H.esc(p.number) + '</span>' +
          '<span class="pitch-name">' + H.esc(String(I18n.name(p)).split(' ').slice(-1)[0]) + '</span></div>';
        delay++;
      });
    });
    var bench = (lineup.bench || []).map(function (id) { return C.Players.get(id); }).filter(Boolean);
    var absent = E.Disciplinary.suspendedForMatch(d, m.id, disc).filter(function (s) { return s.teamId === teamId; });
    var h = C.Teams.get(m.homeTeamId);
    var a = C.Teams.get(m.awayTeamId);
    return '<div class="lineup-switch"><div class="segmented" id="side-switch">' +
      '<button type="button" data-side="home" class="' + (side === 'home' ? 'active' : '') + '">' + H.esc(I18n.short(h)) + '</button>' +
      '<button type="button" data-side="away" class="' + (side === 'away' ? 'active' : '') + '">' + H.esc(I18n.short(a)) + '</button></div></div>' +
      '<div class="row-2 center mb-3"><span class="badge badge-primary">' + t('formation') + ' ' + H.esc(lineup.formation || '4-3-3') + '</span><span class="badge">' + t('coach') + ': ' + H.esc(team.coach || '—') + '</span></div>' +
      '<div class="pitch">' + PITCH_SVG + dots + '</div>' +
      (absent.length ? '<div class="alert alert-danger mt-4">' + UI.icon('alert') + '<div><strong>' + t('suspended') + ':</strong> ' +
        absent.map(function (s) { return H.esc(C.playerName(s.playerId)); }).join('، ') + '</div></div>' : '') +
      '<div class="section">' + UI.Render.sectionHead(t('bench') + ' (' + bench.length + ')') + '<div class="card bench-list">' +
      bench.map(function (p) {
        var cameOn = m.events.find(function (e) { return e.type === 'sub' && e.playerId === p.id; });
        return '<div class="list-item" style="min-height:54px">' + UI.Badges.avatar(p, 'sm') + '<div class="li-main"><span class="li-title text-sm">' + H.esc(I18n.name(p)) + '</span><span class="li-sub">' + UI.Badges.pos(p.position) + ' #' + p.number + (cameOn ? ' · <span class="text-success num">↑' + cameOn.minute + "'</span>" : '') + '</span></div></div>';
      }).join('') + '</div></div>';
  }

  function statsHTML(m) {
    var h = C.Teams.get(m.homeTeamId);
    var a = C.Teams.get(m.awayTeamId);
    if (m.status === 'scheduled' || m.status === 'postponed') return h2hHTML(m);
    var s = m.stats || {};
    var cards = E.Stats.matchDerivedStats({ events: m.events, homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId });
    var rows = [
      ['possession', s.possession, '%'],
      ['shots', s.shots, ''],
      ['shotsOnTarget', s.shotsOnTarget, ''],
      ['corners', s.corners, ''],
      ['fouls', s.fouls, ''],
      ['offsides', s.offsides, ''],
      ['yellowCards', cards.yellowCards, ''],
      ['redCards', cards.redCards, '']
    ].filter(function (r) { return r[1]; });
    var c1 = h.colors.primary;
    var c2 = a.colors.primary;
    if (c1.toLowerCase() === c2.toLowerCase()) c2 = a.colors.secondary;
    return '<div class="card card-pad"><div class="row between mb-4"><span class="row-2">' + UI.Badges.crest(h, 'sm') + '<span class="fw-heavy">' + H.esc(I18n.short(h)) + '</span></span>' +
      '<span class="row-2"><span class="fw-heavy">' + H.esc(I18n.short(a)) + '</span>' + UI.Badges.crest(a, 'sm') + '</span></div>' +
      '<div class="stack-4">' + rows.map(function (r) {
        var hv = Number(r[1].home) || 0;
        var av = Number(r[1].away) || 0;
        var total = hv + av || 1;
        var hp = Math.round(hv / total * 100);
        var ap = Math.round(av / total * 100);
        return '<div class="stat-compare"><div class="stat-compare-head"><span class="v' + (hv > av ? ' text-primary' : '') + '">' + hv + r[2] + '</span><span class="lbl">' + t(r[0]) + '</span><span class="v text-end' + (av > hv ? ' text-primary' : '') + '">' + av + r[2] + '</span></div>' +
          '<div class="stat-compare-bars"><div class="half home"><span data-width="' + hp + '" style="background:' + H.esc(c1) + '"></span></div><div class="half"><span data-width="' + ap + '" style="background:' + H.esc(c2) + '"></span></div></div></div>';
      }).join('') + '</div></div>';
  }

  function h2hHTML(m) {
    var d = C.State.data;
    var prev = d.matches.filter(function (x) {
      return x.id !== m.id && x.status === 'finished' &&
        ((x.homeTeamId === m.homeTeamId && x.awayTeamId === m.awayTeamId) || (x.homeTeamId === m.awayTeamId && x.awayTeamId === m.homeTeamId));
    });
    var hr = E.Standings.rowFor(d, m.homeTeamId);
    var ar = E.Standings.rowFor(d, m.awayTeamId);
    var h = C.Teams.get(m.homeTeamId);
    var a = C.Teams.get(m.awayTeamId);
    function line(label, hv, av) {
      return '<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--divider)"><span class="num fw-heavy">' + hv + '</span><span class="text-sm text-muted fw-bold">' + label + '</span><span class="num fw-heavy">' + av + '</span></div>';
    }
    return '<div class="card card-pad"><div class="row between mb-3"><span class="row-2">' + UI.Badges.crest(h, 'sm') + '<span class="fw-heavy">' + H.esc(I18n.short(h)) + '</span></span><span class="row-2"><span class="fw-heavy">' + H.esc(I18n.short(a)) + '</span>' + UI.Badges.crest(a, 'sm') + '</span></div>' +
      line(t('pos'), hr ? hr.position : '—', ar ? ar.position : '—') +
      line(t('points'), hr ? hr.pts : 0, ar ? ar.pts : 0) +
      line(t('goalsFor'), hr ? hr.gf : 0, ar ? ar.gf : 0) +
      line(t('goalsAgainst'), hr ? hr.ga : 0, ar ? ar.ga : 0) +
      '<div class="row between mt-3"><span>' + UI.Badges.form(hr ? hr.form : []) + '</span><span class="text-xs text-muted fw-bold">' + t('form') + '</span><span>' + UI.Badges.form(ar ? ar.form : []) + '</span></div></div>' +
      '<div class="section">' + UI.Render.sectionHead(t('h2h')) + '<div class="card">' +
      (prev.length ? prev.map(function (x) { return UI.Render.matchRow(x); }).join('') : UI.Render.empty('history', t('empty'))) + '</div></div>';
  }

  function ratingsHTML(m) {
    var d = C.State.data;
    if (m.status !== 'finished' && m.status !== 'live') return '<div class="card">' + UI.Render.empty('star', t('comingSoon')) + '</div>';
    var list = E.Ratings.matchRatings(d, m);
    var motm = list[0];
    var fan = E.Ratings.fanCounts(d, m.id);
    var totalVotes = fan.reduce(function (s, f) { return s + f.votes; }, 0);
    var fanMap = {}; fan.forEach(function (f) { fanMap[f.playerId] = f.votes; });
    var my = C.Ratings.myVote(m.id);
    var options = list.slice(0, 8);
    var html = '';
    if (motm) {
      html += '<div class="leader-card mb-4"><div class="leader-body">' + UI.Badges.avatar(motm.player, 'xl') +
        '<div class="stack-1 grow" style="min-width:0"><span class="row-2 text-sm fw-heavy">' + UI.icon('award') + t('motm') + '</span>' +
        '<h3 class="truncate" style="font-size:1.25rem;font-weight:900">' + H.esc(I18n.name(motm.player)) + '</h3>' +
        '<span class="text-sm text-muted fw-bold">' + H.esc(C.teamName(motm.player.teamId)) + '</span></div>' +
        '<div class="num" style="font-size:2.2rem;font-weight:800">' + motm.rating.toFixed(1) + '</div></div></div>';
    }
    html += '<div class="card card-pad mb-4"><div class="row between mb-3"><h3 class="card-title row-2">' + UI.icon('vote') + t('fanVote') + '</h3><span class="badge">' + totalVotes + ' ' + t('votes') + '</span></div>' +
      '<div class="vote-grid" id="vote-grid">' + options.map(function (r) {
        var v = fanMap[r.playerId] || 0;
        var pct = totalVotes ? Math.round(v / totalVotes * 100) : 0;
        return '<button type="button" class="vote-option ' + (my === r.playerId ? 'selected' : '') + '" data-pid="' + r.playerId + '"' + (my ? ' disabled style="opacity:1;cursor:default"' : '') + '>' +
          (my ? '<span class="vote-fill" style="width:0" data-width="' + pct + '"></span>' : '') +
          UI.Badges.avatar(r.player, 'sm') + '<span class="stack grow" style="min-width:0"><span class="text-sm fw-heavy truncate">' + H.esc(I18n.name(r.player)) + '</span><span class="text-xs text-muted truncate">' + H.esc(C.teamShort(r.player.teamId)) + '</span></span>' +
          (my ? '<span class="num fw-heavy text-sm">' + pct + '%</span>' : '') + '</button>';
      }).join('') + '</div></div>';
    ['home', 'away'].forEach(function (side) {
      var teamId = side === 'home' ? m.homeTeamId : m.awayTeamId;
      var arr = list.filter(function (r) { return r.side === side; });
      html += '<div class="section">' + UI.Render.sectionHead(C.teamName(teamId)) + '<div class="card list">' +
        arr.map(function (r) {
          return '<div class="list-item">' + UI.Badges.avatar(r.player, 'sm') + '<div class="li-main"><span class="li-title text-sm">' + H.esc(I18n.name(r.player)) + '</span><span class="li-sub">' + UI.Badges.pos(r.player.position) + ' #' + r.player.number + (r.manual ? ' · ' + t('manual') : '') + '</span></div>' + UI.Badges.rating(r.rating) + '</div>';
        }).join('') + '</div></div>';
    });
    return html;
  }

  function bodyHTML(m) {
    var disc = E.Disciplinary.compute(C.State.data);
    if (state.tab === 'timeline') return timelineHTML(m);
    if (state.tab === 'lineups') return lineupsHTML(m, disc);
    if (state.tab === 'stats') return statsHTML(m);
    return ratingsHTML(m);
  }

  function bindBody(root, m) {
    var body = root.querySelector('#ml-body');
    var sw = body.querySelector('#side-switch');
    if (sw) sw.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      state.side = b.getAttribute('data-side');
      UI.Haptic.tap(8);
      renderBody(root);
    });
    var vg = body.querySelector('#vote-grid');
    if (vg) vg.addEventListener('click', function (e) {
      var b = e.target.closest('.vote-option');
      if (!b || b.disabled) return;
      if (C.Ratings.vote(m.id, b.getAttribute('data-pid'))) {
        UI.Haptic.success();
        UI.Toast.success(t('voted'));
        renderBody(root);
      }
    });
    UI.Anim.bars(body);
  }

  function renderBody(root) {
    var m = C.Matches.get(state.matchId);
    if (!m) return;
    var body = root.querySelector('#ml-body');
    body.innerHTML = '<div class="anim-fade-up">' + bodyHTML(m) + '</div>';
    bindBody(root, m);
  }

  function render(root) {
    var urlParams = new URLSearchParams(window.location.search);
    var matchId = urlParams.get('id');
    state.matchId = matchId;
    var m = C.Matches.get(matchId);
    if (!m) {
      var live = C.State.data.matches.find(function (x) { return x.status === 'live'; });
      root.innerHTML = '<a class="back-link" href="matches.html">' + UI.icon('back') + t('matches') + '</a><div class="card">' +
        UI.Render.empty('alert', I18n.lang === 'ar' ? 'المباراة غير موجودة' : 'Match not found', matchId ? 'id: ' + matchId : '') +
        (live ? '<div class="text-center" style="padding-bottom:24px"><a class="btn btn-primary" href="match-live.html?id=' + live.id + '">' + UI.icon('live') + t('liveNow') + '</a></div>' : '') + '</div>';
      return;
    }
    if (H.param('tab')) state.tab = H.param('tab');
    if (m.status === 'scheduled' && state.tab === 'timeline' && !H.param('tab')) state.tab = 'stats';
    var tabs = [
      { key: 'timeline', label: t('timeline') },
      { key: 'lineups', label: t('lineups') },
      { key: 'stats', label: m.status === 'scheduled' ? t('h2h') : t('stats') },
      { key: 'ratings', label: t('ratings') }
    ];
    root.innerHTML = '<a class="back-link" href="matches.html">' + UI.icon('back') + t('matches') + '</a>' +
      '<div id="ml-hero">' + heroHTML(m) + '</div>' +
      '<div class="mt-4">' + UI.Tabs.render(tabs, state.tab, 'ml-tabs') + '</div>' +
      '<div id="ml-body" class="mt-4"></div>';
    UI.Tabs.bind(root.querySelector('#ml-tabs'), function (k) { state.tab = k; renderBody(root); });
    renderBody(root);
    state.lastScore = m.score.home + '-' + m.score.away;
  }

  function refresh(root) {
    var m = C.Matches.get(state.matchId);
    if (!m) return;
    var newScore = m.score.home + '-' + m.score.away;
    var hero = root.querySelector('#ml-hero');
    if (hero) hero.innerHTML = heroHTML(m);
    if (state.lastScore && newScore !== state.lastScore) {
      var prev = state.lastScore.split('-');
      if (Number(prev[0]) !== m.score.home) UI.Anim.bump(root.querySelector('#sc-h'));
      if (Number(prev[1]) !== m.score.away) UI.Anim.bump(root.querySelector('#sc-a'));
      UI.Haptic.success();
      UI.Toast.success(t('goal') + '! ' + C.teamShort(m.homeTeamId) + ' ' + newScore.replace('-', ' - ') + ' ' + C.teamShort(m.awayTeamId));
    }
    state.lastScore = newScore;
    renderBody(root);
  }

  global.Pages = global.Pages || {};
  global.Pages['match-live'] = {
    init: function (root) {
      render(root);
      setInterval(function () {
        var m = C.Matches.get(state.matchId);
        if (!m) return;
        var clock = root.querySelector('#live-clock');
        if (clock) clock.textContent = clockText(m);
      }, 15000);
    },
    onData: function (root) { refresh(root); }
  };
})(window);
