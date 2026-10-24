/* =========================================================
   engines.js — Standings + Tiebreaker + Disciplinary +
   Stats + Ratings + Scheduler
   ========================================================= */
(function (global) {
  'use strict';

  var H = global.Helpers;

  var GOAL_TYPES = ['goal', 'penalty', 'owngoal'];
  var H2H_CRITERIA = ['h2h', 'h2hDiff', 'h2hGoals'];

  function countedMatches(data, opts) {
    opts = opts || {};
    return data.matches.filter(function (m) {
      if (m.status === 'finished') return opts.upToRound ? m.round <= opts.upToRound : true;
      if (m.status === 'live' && opts.includeLive) return true;
      return false;
    });
  }

  function cardPenalty(events, teamId) {
    var fp = 0;
    var perPlayer = {};
    (events || []).forEach(function (e) {
      if (e.teamId !== teamId) return;
      if (e.type !== 'yellow' && e.type !== 'red') return;
      if (!perPlayer[e.playerId]) perPlayer[e.playerId] = { y: 0, r: 0, auto: false };
      if (e.type === 'yellow') perPlayer[e.playerId].y++;
      if (e.type === 'red') {
        perPlayer[e.playerId].r++;
        if (e.auto) perPlayer[e.playerId].auto = true;
      }
    });
    Object.keys(perPlayer).forEach(function (pid) {
      var c = perPlayer[pid];
      if (c.r > 0 && (c.auto || c.y >= 2)) fp -= 3;
      else if (c.r > 0 && c.y === 1) fp -= 5;
      else if (c.r > 0) fp -= 4;
      else if (c.y >= 2) fp -= 3;
      else if (c.y === 1) fp -= 1;
    });
    return fp;
  }

  /* ---------------------------------------------------------
     Standings Engine
     --------------------------------------------------------- */
  var Standings = {
    emptyRow: function (team) {
      return {
        teamId: team.id, team: team, group: team.group,
        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0,
        pts: 0, rawPts: 0, deduction: 0, fairplay: 0, form: [], live: false,
        yellow: 0, red: 0, cleanSheets: 0, homeW: 0, awayW: 0
      };
    },
    compute: function (data, opts) {
      opts = opts || {};
      var s = data.league.settings;
      var teams = data.teams.filter(function (t) { return !opts.group || t.group === opts.group; });
      var rows = {};
      teams.forEach(function (t) { rows[t.id] = Standings.emptyRow(t); });
      var matches = countedMatches(data, opts).slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      matches.forEach(function (m) {
        var h = rows[m.homeTeamId];
        var a = rows[m.awayTeamId];
        if (!h || !a) return;
        var sh = Number(m.score.home) || 0;
        var sa = Number(m.score.away) || 0;
        h.played++; a.played++;
        h.gf += sh; h.ga += sa; a.gf += sa; a.ga += sh;
        if (m.status === 'live') { h.live = true; a.live = true; }
        if (sa === 0) h.cleanSheets++;
        if (sh === 0) a.cleanSheets++;
        if (sh > sa) {
          h.won++; a.lost++; h.rawPts += s.winPoints; a.rawPts += s.lossPoints;
          h.form.push({ r: 'W', matchId: m.id }); a.form.push({ r: 'L', matchId: m.id }); h.homeW++;
        } else if (sh < sa) {
          a.won++; h.lost++; a.rawPts += s.winPoints; h.rawPts += s.lossPoints;
          h.form.push({ r: 'L', matchId: m.id }); a.form.push({ r: 'W', matchId: m.id }); a.awayW++;
        } else {
          h.drawn++; a.drawn++; h.rawPts += s.drawPoints; a.rawPts += s.drawPoints;
          h.form.push({ r: 'D', matchId: m.id }); a.form.push({ r: 'D', matchId: m.id });
        }
        h.fairplay += cardPenalty(m.events, m.homeTeamId);
        a.fairplay += cardPenalty(m.events, m.awayTeamId);
        (m.events || []).forEach(function (e) {
          var row = rows[e.teamId];
          if (!row) return;
          if (e.type === 'yellow') row.yellow++;
          if (e.type === 'red') row.red++;
        });
      });
      (s.pointsDeduction || []).forEach(function (d) {
        if (rows[d.teamId]) rows[d.teamId].deduction += Number(d.amount) || 0;
      });
      var list = Object.keys(rows).map(function (k) {
        var r = rows[k];
        r.gd = r.gf - r.ga;
        r.pts = r.rawPts - r.deduction;
        r.form = r.form.slice(-5);
        return r;
      });
      var ordered = Tiebreaker.sort(list, matches, s.tiebreakers, data);
      ordered.forEach(function (r, i) {
        r.position = i + 1;
        r.zone = Standings.zone(i + 1, ordered.length, s.qualificationSpots);
      });
      return ordered;
    },
    zone: function (pos, total, spots) {
      spots = spots || { champions: 4, europa: 2, relegation: 3 };
      if (pos <= spots.champions) return 'champions';
      if (pos <= spots.champions + spots.europa) return 'europa';
      if (pos > total - spots.relegation) return 'relegation';
      return '';
    },
    leader: function (data) {
      var t = Standings.compute(data);
      return t[0] || null;
    },
    rowFor: function (data, teamId) {
      var t = Standings.compute(data);
      return t.find(function (r) { return r.teamId === teamId; }) || null;
    }
  };

  /* ---------------------------------------------------------
     Tiebreaker Engine
     --------------------------------------------------------- */
  var Tiebreaker = {
    miniTable: function (teamIds, matches, settings) {
      var set = {};
      teamIds.forEach(function (id) { set[id] = { teamId: id, pts: 0, gf: 0, ga: 0, gd: 0, played: 0, won: 0, awayGoals: 0 }; });
      matches.forEach(function (m) {
        if (!set[m.homeTeamId] || !set[m.awayTeamId]) return;
        var h = set[m.homeTeamId];
        var a = set[m.awayTeamId];
        var sh = Number(m.score.home) || 0;
        var sa = Number(m.score.away) || 0;
        h.played++; a.played++;
        h.gf += sh; h.ga += sa; a.gf += sa; a.ga += sh; a.awayGoals += sa;
        if (sh > sa) { h.pts += settings.winPoints; a.pts += settings.lossPoints; h.won++; }
        else if (sh < sa) { a.pts += settings.winPoints; h.pts += settings.lossPoints; a.won++; }
        else { h.pts += settings.drawPoints; a.pts += settings.drawPoints; }
      });
      Object.keys(set).forEach(function (k) { set[k].gd = set[k].gf - set[k].ga; });
      return set;
    },
    value: function (criterion, row, mini, seed) {
      switch (criterion) {
        case 'points': return row.pts;
        case 'h2h': return mini[row.teamId] ? mini[row.teamId].pts : 0;
        case 'h2hDiff': return mini[row.teamId] ? mini[row.teamId].gd : 0;
        case 'h2hGoals': return mini[row.teamId] ? mini[row.teamId].gf : 0;
        case 'diff': return row.gd;
        case 'goals': return row.gf;
        case 'wins': return row.won;
        case 'fairplay': return row.fairplay;
        case 'draw': return H.hashNum(row.teamId + '|' + seed) % 100000;
        default: return 0;
      }
    },
    sort: function (rows, matches, criteria, data, trace) {
      criteria = (criteria && criteria.length) ? criteria.slice() : ['points', 'diff', 'goals'];
      if (criteria[0] !== 'points') criteria.unshift('points');
      if (criteria.indexOf('draw') === -1) criteria.push('draw');
      var settings = data.league.settings;
      var seed = data.league.season || 'season';
      var firstH2h = -1;
      criteria.forEach(function (c, i) { if (firstH2h === -1 && H2H_CRITERIA.indexOf(c) !== -1) firstH2h = i; });
      rows.forEach(function (r) { r.decidedBy = null; r.tiedWith = []; });

      function sortGroup(group, ci, depth) {
        if (group.length <= 1) return group;
        if (ci >= criteria.length || depth > 30) {
          return group.slice().sort(function (a, b) { return String(a.team.name).localeCompare(String(b.team.name)); });
        }
        var c = criteria[ci];
        var mini = null;
        if (H2H_CRITERIA.indexOf(c) !== -1) {
          mini = Tiebreaker.miniTable(group.map(function (r) { return r.teamId; }), matches, settings);
        }
        var vals = group.map(function (r) { return { row: r, v: Tiebreaker.value(c, r, mini || {}, seed) }; });
        if (ci > 0) {
          group.forEach(function (r) {
            r.tiedWith = group.filter(function (x) { return x !== r; }).map(function (x) { return x.teamId; });
          });
        }
        if (trace && ci > 0) {
          trace.push({
            criterion: c,
            teams: vals.map(function (x) { return { teamId: x.row.teamId, value: x.v }; }),
            mini: mini
          });
        }
        var buckets = {};
        var keys = [];
        vals.forEach(function (x) {
          var k = String(x.v);
          if (!buckets[k]) { buckets[k] = []; keys.push(x.v); }
          buckets[k].push(x.row);
        });
        if (keys.length === 1) return sortGroup(group, ci + 1, depth + 1);
        keys.sort(function (a, b) { return b - a; });
        var out = [];
        keys.forEach(function (k) {
          var bucket = buckets[String(k)];
          if (bucket.length === 1) {
            if (ci > 0) bucket[0].decidedBy = c;
            out.push(bucket[0]);
          } else {
            var next = ci + 1;
            if (H2H_CRITERIA.indexOf(c) !== -1 && bucket.length < group.length && firstH2h !== -1) next = firstH2h;
            out = out.concat(sortGroup(bucket, next, depth + 1));
          }
        });
        return out;
      }
      return sortGroup(rows.slice(), 0, 0);
    },
    explain: function (data, teamId) {
      var table = Standings.compute(data);
      var row = table.find(function (r) { return r.teamId === teamId; });
      if (!row) return null;
      var tied = table.filter(function (r) { return r.pts === row.pts; });
      if (tied.length < 2) return { row: row, tied: [row], steps: [], order: [row], mini: null };
      var matches = countedMatches(data, {});
      var trace = [];
      var clones = tied.map(function (r) { return Object.assign({}, r); });
      var order = Tiebreaker.sort(clones, matches, data.league.settings.tiebreakers, data, trace);
      var mini = Tiebreaker.miniTable(tied.map(function (r) { return r.teamId; }), matches, data.league.settings);
      return { row: row, tied: tied, steps: trace, order: order, mini: mini };
    }
  };

  /* ---------------------------------------------------------
     Disciplinary Engine
     --------------------------------------------------------- */
  var Disciplinary = {
    compute: function (data) {
      var s = data.league.settings;
      var threshold = Number(s.yellowForSuspension) || 3;
      var resetAfter = Number(s.resetCardsAfterRounds) || 0;
      var redBan = Number(s.redCardBan) || 1;
      var maxRound = data.matches.reduce(function (mx, m) { return Math.max(mx, m.round); }, 0);
      var played = data.matches.filter(function (m) { return m.status === 'finished' || m.status === 'live'; })
        .slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      var timeline = [];
      played.forEach(function (m) { timeline.push({ kind: 'match', date: m.date, match: m }); });
      (data.discipline || []).forEach(function (d) { timeline.push({ kind: 'decision', date: d.date, decision: d }); });
      timeline.sort(function (a, b) {
        var diff = new Date(a.date) - new Date(b.date);
        if (diff !== 0) return diff;
        return a.kind === 'match' ? -1 : 1;
      });

      var counters = {};
      var totals = {};
      var cards = [];
      var suspensions = [];
      var resetDone = false;

      function total(pid, teamId) {
        if (!totals[pid]) totals[pid] = { playerId: pid, teamId: teamId, yellow: 0, red: 0, secondYellow: 0, suspensions: 0, current: 0 };
        return totals[pid];
      }

      timeline.forEach(function (item) {
        if (item.kind === 'decision') {
          var d = item.decision;
          if (d.type === 'ban') {
            suspensions.push({
              id: 's_' + d.id, playerId: d.playerId, teamId: d.teamId, kind: 'manual', matches: Number(d.matches) || 1,
              startDate: d.date, sourceMatchId: null, decisionId: d.id, reason: d.reason, reasonEn: d.reasonEn, voided: false
            });
          } else if (d.type === 'cancel') {
            suspensions.forEach(function (sp) {
              if (sp.playerId === d.playerId && !sp.cancelled && new Date(sp.startDate) <= new Date(d.date)) {
                sp.cancelled = true;
                sp.cancelledBy = d.id;
              }
            });
          } else if (d.type === 'reset') {
            counters[d.playerId] = 0;
          }
          return;
        }
        var m = item.match;
        if (resetAfter > 0 && !resetDone && m.round > resetAfter) {
          counters = {};
          resetDone = true;
        }
        var per = {};
        (m.events || []).forEach(function (e) {
          if (e.type !== 'yellow' && e.type !== 'red') return;
          if (!per[e.playerId]) per[e.playerId] = { teamId: e.teamId, y: [], r: [] };
          if (e.type === 'yellow') per[e.playerId].y.push(e);
          else per[e.playerId].r.push(e);
        });
        Object.keys(per).forEach(function (pid) {
          var c = per[pid];
          var t = total(pid, c.teamId);
          var sentOffByTwoYellows = c.y.length >= 2 || c.r.some(function (r) { return r.auto; });
          if (sentOffByTwoYellows) {
            t.yellow += c.y.length;
            t.secondYellow++;
            t.red++;
            c.y.forEach(function (e) { cards.push({ matchId: m.id, round: m.round, playerId: pid, teamId: c.teamId, type: 'yellow', minute: e.minute, date: m.date }); });
            cards.push({ matchId: m.id, round: m.round, playerId: pid, teamId: c.teamId, type: 'secondYellow', minute: (c.r[0] || c.y[c.y.length - 1]).minute, date: m.date, auto: true });
            suspensions.push({ id: 's_' + m.id + '_' + pid, playerId: pid, teamId: c.teamId, kind: 'secondYellow', matches: 1, startDate: m.date, sourceMatchId: m.id, voided: false });
            return;
          }
          if (c.r.length) {
            t.red++;
            if (c.y.length) {
              t.yellow += c.y.length;
              c.y.forEach(function (e) { cards.push({ matchId: m.id, round: m.round, playerId: pid, teamId: c.teamId, type: 'yellow', minute: e.minute, date: m.date }); });
            }
            cards.push({ matchId: m.id, round: m.round, playerId: pid, teamId: c.teamId, type: 'red', minute: c.r[0].minute, date: m.date });
            suspensions.push({ id: 's_' + m.id + '_' + pid, playerId: pid, teamId: c.teamId, kind: 'directRed', matches: redBan, startDate: m.date, sourceMatchId: m.id, voided: false });
            return;
          }
          c.y.forEach(function (e) {
            t.yellow++;
            cards.push({ matchId: m.id, round: m.round, playerId: pid, teamId: c.teamId, type: 'yellow', minute: e.minute, date: m.date });
          });
          counters[pid] = (counters[pid] || 0) + c.y.length;
          if (counters[pid] >= threshold) {
            counters[pid] -= threshold;
            var isResetRound = resetAfter > 0 && m.round === resetAfter;
            var isLastRound = m.round >= maxRound;
            suspensions.push({
              id: 's_' + m.id + '_' + pid + '_acc', playerId: pid, teamId: c.teamId, kind: 'accumulation', matches: 1,
              startDate: m.date, sourceMatchId: m.id, voided: isResetRound || (isLastRound && resetAfter > 0)
            });
            if (isResetRound) counters[pid] = 0;
          }
        });
      });

      Object.keys(totals).forEach(function (pid) { totals[pid].current = counters[pid] || 0; });

      var teamMatches = {};
      data.matches.forEach(function (m) {
        [m.homeTeamId, m.awayTeamId].forEach(function (tid) {
          if (!teamMatches[tid]) teamMatches[tid] = [];
          teamMatches[tid].push(m);
        });
      });
      Object.keys(teamMatches).forEach(function (tid) {
        teamMatches[tid].sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      });

      suspensions.forEach(function (sp) {
        var player = data.players.find(function (p) { return p.id === sp.playerId; });
        var teamId = player ? player.teamId : sp.teamId;
        sp.teamId = teamId;
        var list = (teamMatches[teamId] || []).filter(function (m) {
          if (sp.sourceMatchId && m.id === sp.sourceMatchId) return false;
          return new Date(m.date) > new Date(sp.startDate);
        });
        sp.affected = list.slice(0, sp.matches).map(function (m) { return m.id; });
        sp.served = list.slice(0, sp.matches).filter(function (m) { return m.status === 'finished'; }).length;
        sp.remaining = sp.voided || sp.cancelled ? 0 : Math.max(0, sp.matches - sp.served);
        var next = list.slice(0, sp.matches).find(function (m) { return m.status !== 'finished'; });
        sp.nextMatchId = next ? next.id : null;
        sp.active = !sp.voided && !sp.cancelled && sp.remaining > 0;
        if (totals[sp.playerId]) totals[sp.playerId].suspensions++;
      });

      return {
        cards: cards.sort(function (a, b) { return new Date(b.date) - new Date(a.date) || b.minute - a.minute; }),
        suspensions: suspensions,
        active: suspensions.filter(function (sp) { return sp.active; }),
        totals: Object.keys(totals).map(function (k) { return totals[k]; }),
        counters: counters,
        threshold: threshold
      };
    },
    isSuspended: function (data, playerId, matchId) {
      var r = Disciplinary.compute(data);
      return r.suspensions.some(function (sp) {
        return sp.playerId === playerId && !sp.voided && !sp.cancelled && sp.affected.indexOf(matchId) !== -1;
      });
    },
    suspendedForMatch: function (data, matchId, computed) {
      var r = computed || Disciplinary.compute(data);
      return r.suspensions.filter(function (sp) {
        return !sp.voided && !sp.cancelled && sp.affected.indexOf(matchId) !== -1;
      });
    },
    atRisk: function (data, computed) {
      var r = computed || Disciplinary.compute(data);
      return r.totals.filter(function (t) { return (r.counters[t.playerId] || 0) === r.threshold - 1; });
    }
  };

  /* ---------------------------------------------------------
     Stats Engine
     --------------------------------------------------------- */
  var Stats = {
    finished: function (data) {
      return data.matches.filter(function (m) { return m.status === 'finished' || m.status === 'live'; });
    },
    appearances: function (m) {
      var out = {};
      if (!m.lineups) return out;
      ['home', 'away'].forEach(function (side) {
        var l = m.lineups[side];
        if (!l) return;
        l.starters.forEach(function (id) { out[id] = side; });
      });
      (m.events || []).forEach(function (e) {
        if (e.type === 'sub' && e.playerId) out[e.playerId] = e.teamId === m.homeTeamId ? 'home' : 'away';
      });
      return out;
    },
    scorers: function (data) {
      var map = {};
      Stats.finished(data).forEach(function (m) {
        (m.events || []).forEach(function (e) {
          if (e.type !== 'goal' && e.type !== 'penalty') return;
          if (!map[e.playerId]) map[e.playerId] = { playerId: e.playerId, value: 0, penalties: 0 };
          map[e.playerId].value++;
          if (e.type === 'penalty') map[e.playerId].penalties++;
        });
      });
      return Stats._withApps(data, map);
    },
    assists: function (data) {
      var map = {};
      Stats.finished(data).forEach(function (m) {
        (m.events || []).forEach(function (e) {
          if (!e.assistId || (e.type !== 'goal' && e.type !== 'penalty')) return;
          if (!map[e.assistId]) map[e.assistId] = { playerId: e.assistId, value: 0 };
          map[e.assistId].value++;
        });
      });
      return Stats._withApps(data, map);
    },
    keepers: function (data) {
      var map = {};
      data.matches.filter(function (m) { return m.status === 'finished'; }).forEach(function (m) {
        if (!m.lineups) return;
        ['home', 'away'].forEach(function (side) {
          var l = m.lineups[side];
          if (!l) return;
          var gk = l.starters.find(function (id) {
            var p = data.players.find(function (x) { return x.id === id; });
            return p && p.position === 'GK';
          });
          if (!gk) return;
          var conceded = side === 'home' ? m.score.away : m.score.home;
          if (!map[gk]) map[gk] = { playerId: gk, value: 0, conceded: 0, apps: 0 };
          map[gk].apps++;
          map[gk].conceded += conceded;
          if (conceded === 0) map[gk].value++;
        });
      });
      return Object.keys(map).map(function (k) {
        var r = map[k];
        var p = data.players.find(function (x) { return x.id === r.playerId; });
        r.player = p; r.teamId = p ? p.teamId : null;
        r.gaPerMatch = r.apps ? H.round1(r.conceded / r.apps) : 0;
        return r;
      }).filter(function (r) { return r.player; })
        .sort(function (a, b) { return b.value - a.value || a.gaPerMatch - b.gaPerMatch || b.apps - a.apps; });
    },
    cards: function (data) {
      var r = Disciplinary.compute(data);
      return r.totals.map(function (t) {
        var p = data.players.find(function (x) { return x.id === t.playerId; });
        return Object.assign({}, t, { player: p, value: t.yellow + t.red * 3 });
      }).filter(function (t) { return t.player; })
        .sort(function (a, b) { return b.red - a.red || b.yellow - a.yellow; });
    },
    fairplay: function (data) {
      return Standings.compute(data).slice().sort(function (a, b) {
        return b.fairplay - a.fairplay || a.red - b.red || a.yellow - b.yellow;
      });
    },
    _withApps: function (data, map) {
      var apps = {};
      Stats.finished(data).forEach(function (m) {
        var a = Stats.appearances(m);
        Object.keys(a).forEach(function (pid) { apps[pid] = (apps[pid] || 0) + 1; });
      });
      return Object.keys(map).map(function (k) {
        var r = map[k];
        var p = data.players.find(function (x) { return x.id === r.playerId; });
        r.player = p; r.teamId = p ? p.teamId : null; r.apps = apps[r.playerId] || 0;
        return r;
      }).filter(function (r) { return r.player; })
        .sort(function (a, b) { return b.value - a.value || a.apps - b.apps; });
    },
    teamSummary: function (data, teamId) {
      var ms = data.matches.filter(function (m) {
        return (m.homeTeamId === teamId || m.awayTeamId === teamId) && m.status === 'finished';
      });
      var out = { played: ms.length, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, cleanSheets: 0, biggestWin: null };
      ms.forEach(function (m) {
        var home = m.homeTeamId === teamId;
        var f = home ? m.score.home : m.score.away;
        var a = home ? m.score.away : m.score.home;
        out.gf += f; out.ga += a;
        if (a === 0) out.cleanSheets++;
        if (f > a) {
          out.won++;
          if (!out.biggestWin || (f - a) > out.biggestWin.diff) out.biggestWin = { diff: f - a, matchId: m.id, f: f, a: a };
        } else if (f < a) out.lost++;
        else out.drawn++;
      });
      out.winRate = out.played ? Math.round(out.won / out.played * 100) : 0;
      return out;
    },
    leagueTotals: function (data) {
      var fin = data.matches.filter(function (m) { return m.status === 'finished'; });
      var goals = fin.reduce(function (s, m) { return s + m.score.home + m.score.away; }, 0);
      return {
        teams: data.teams.length,
        players: data.players.length,
        matches: data.matches.length,
        played: fin.length,
        goals: goals,
        avgGoals: fin.length ? H.round1(goals / fin.length) : 0,
        live: data.matches.filter(function (m) { return m.status === 'live'; }).length
      };
    },
    matchDerivedStats: function (m) {
      if (m.stats) return m.stats;
      var y = { home: 0, away: 0 };
      var r = { home: 0, away: 0 };
      (m.events || []).forEach(function (e) {
        var side = e.teamId === m.homeTeamId ? 'home' : 'away';
        if (e.type === 'yellow') y[side]++;
        if (e.type === 'red') r[side]++;
      });
      return { yellowCards: y, redCards: r };
    }
  };

  /* ---------------------------------------------------------
     Ratings Engine
     --------------------------------------------------------- */
  var Ratings = {
    auto: function (data, m, playerId) {
      var p = data.players.find(function (x) { return x.id === playerId; });
      if (!p) return 6;
      var side = p.teamId === m.homeTeamId ? 'home' : 'away';
      var r = 6.2;
      var forG = side === 'home' ? m.score.home : m.score.away;
      var agG = side === 'home' ? m.score.away : m.score.home;
      if (forG > agG) r += 0.5;
      else if (forG < agG) r -= 0.4;
      (m.events || []).forEach(function (e) {
        if (e.playerId === playerId) {
          if (e.type === 'goal') r += (p.position === 'DF' ? 1.4 : 1.1);
          if (e.type === 'penalty') r += 0.8;
          if (e.type === 'owngoal') r -= 1.0;
          if (e.type === 'yellow') r -= 0.3;
          if (e.type === 'red') r -= 1.5;
        }
        if (e.assistId === playerId) r += 0.7;
      });
      if (agG === 0 && (p.position === 'GK' || p.position === 'DF')) r += (p.position === 'GK' ? 0.9 : 0.5);
      if (p.position === 'GK') r -= Math.max(0, agG - 1) * 0.3;
      r += ((H.hashNum(m.id + playerId) % 9) - 4) / 10;
      return H.clamp(H.round1(r), 1, 10);
    },
    get: function (data, m, playerId) {
      var manual = data.ratings.find(function (x) { return x.matchId === m.id && x.playerId === playerId; });
      if (manual) return { value: manual.rating, manual: true };
      return { value: Ratings.auto(data, m, playerId), manual: false };
    },
    matchRatings: function (data, m) {
      var apps = Stats.appearances(m);
      return Object.keys(apps).map(function (pid) {
        var g = Ratings.get(data, m, pid);
        var p = data.players.find(function (x) { return x.id === pid; });
        return { playerId: pid, player: p, side: apps[pid], rating: g.value, manual: g.manual };
      }).filter(function (r) { return r.player; }).sort(function (a, b) { return b.rating - a.rating; });
    },
    motm: function (data, m) {
      if (m.status !== 'finished' && m.status !== 'live') return null;
      var list = Ratings.matchRatings(data, m);
      return list[0] || null;
    },
    fanCounts: function (data, matchId) {
      var counts = {};
      data.fanVotes.filter(function (v) { return v.matchId === matchId; }).forEach(function (v) {
        counts[v.playerId] = (counts[v.playerId] || 0) + 1;
      });
      return Object.keys(counts).map(function (pid) { return { playerId: pid, votes: counts[pid] }; })
        .sort(function (a, b) { return b.votes - a.votes; });
    },
    teamOfWeek: function (data, round) {
      var ms = data.matches.filter(function (m) { return m.round === round && m.status === 'finished'; });
      var all = [];
      ms.forEach(function (m) { all = all.concat(Ratings.matchRatings(data, m).map(function (r) { r.matchId = m.id; return r; })); });
      var need = { GK: 1, DF: 4, MF: 3, FW: 3 };
      var out = { GK: [], DF: [], MF: [], FW: [] };
      all.sort(function (a, b) { return b.rating - a.rating; });
      all.forEach(function (r) {
        var pos = r.player.position;
        if (out[pos] && out[pos].length < need[pos]) out[pos].push(r);
      });
      return { round: round, formation: '4-3-3', lines: out, count: ms.length };
    },
    lastCompletedRound: function (data) {
      var rounds = {};
      data.matches.forEach(function (m) {
        if (!rounds[m.round]) rounds[m.round] = { total: 0, done: 0 };
        rounds[m.round].total++;
        if (m.status === 'finished') rounds[m.round].done++;
      });
      var best = 0;
      Object.keys(rounds).forEach(function (r) {
        if (rounds[r].done === rounds[r].total && Number(r) > best) best = Number(r);
      });
      if (!best) {
        Object.keys(rounds).forEach(function (r) { if (rounds[r].done > 0 && Number(r) > best) best = Number(r); });
      }
      return best;
    },
    season: function (data, minApps) {
      minApps = minApps || 2;
      var acc = {};
      data.matches.filter(function (m) { return m.status === 'finished'; }).forEach(function (m) {
        Ratings.matchRatings(data, m).forEach(function (r) {
          if (!acc[r.playerId]) acc[r.playerId] = { playerId: r.playerId, player: r.player, sum: 0, apps: 0, motm: 0 };
          acc[r.playerId].sum += r.rating;
          acc[r.playerId].apps++;
        });
        var mm = Ratings.motm(data, m);
        if (mm && acc[mm.playerId]) acc[mm.playerId].motm++;
      });
      return Object.keys(acc).map(function (k) {
        var a = acc[k];
        a.avg = H.round1(a.sum / a.apps);
        a.teamId = a.player.teamId;
        return a;
      }).filter(function (a) { return a.apps >= minApps; })
        .sort(function (a, b) { return b.avg - a.avg || b.motm - a.motm || b.apps - a.apps; });
    }
  };

  /* ---------------------------------------------------------
     Scheduler Engine
     --------------------------------------------------------- */
  var Scheduler = {
    roundRobinPairs: function (teamIds) {
      var ids = teamIds.slice();
      if (ids.length % 2 === 1) ids.push(null);
      var n = ids.length;
      var rounds = [];
      var fixed = ids[0];
      var rot = ids.slice(1);
      for (var r = 0; r < n - 1; r++) {
        var current = [fixed].concat(rot);
        var pairs = [];
        for (var i = 0; i < n / 2; i++) {
          var a = current[i];
          var b = current[n - 1 - i];
          if (a === null || b === null) continue;
          if (i === 0) pairs.push(r % 2 === 0 ? [a, b] : [b, a]);
          else pairs.push((r + i) % 2 === 0 ? [a, b] : [b, a]);
        }
        rounds.push(pairs);
        rot.unshift(rot.pop());
      }
      return rounds;
    },
    generate: function (data, opts) {
      opts = opts || {};
      var ids = data.teams.map(function (t) { return t.id; });
      var rounds = Scheduler.roundRobinPairs(ids);
      if (opts.doubleRound) {
        var second = rounds.map(function (rd) { return rd.map(function (p) { return [p[1], p[0]]; }); });
        rounds = rounds.concat(second);
      }
      var start = opts.startDate ? new Date(opts.startDate) : new Date();
      var interval = Number(opts.intervalDays) || 7;
      var slots = opts.times || ['15:00', '17:30', '20:00'];
      var refs = (data.matches.map(function (m) { return m.referee; }).filter(Boolean));
      var uniqueRefs = refs.filter(function (r, i) { return refs.indexOf(r) === i; });
      if (!uniqueRefs.length) uniqueRefs = ['—'];
      var out = [];
      var counter = 1;
      rounds.forEach(function (pairs, ri) {
        pairs.forEach(function (pair, pi) {
          var d = new Date(start.getTime() + ri * interval * 86400000);
          var slot = slots[pi % slots.length].split(':');
          d.setHours(Number(slot[0]), Number(slot[1]), 0, 0);
          var home = data.teams.find(function (t) { return t.id === pair[0]; });
          out.push({
            id: 'g' + Date.now().toString(36) + '_' + (counter++),
            round: ri + 1, homeTeamId: pair[0], awayTeamId: pair[1],
            date: H.localISO(d), stadium: home ? home.stadium : '',
            referee: uniqueRefs[(ri + pi) % uniqueRefs.length], status: 'scheduled',
            score: { home: 0, away: 0 }, events: [], lineups: null, stats: null
          });
        });
      });
      Scheduler.distributeStadiums(data, out);
      return out;
    },
    distributeStadiums: function (data, matches) {
      var pool = data.teams.map(function (t) { return t.stadium; }).filter(Boolean);
      pool = pool.filter(function (s, i) { return pool.indexOf(s) === i; });
      matches.forEach(function (m, i) {
        var clash = matches.some(function (o, j) {
          return j < i && o.stadium === m.stadium && Math.abs(new Date(o.date) - new Date(m.date)) < 3 * 3600000;
        });
        if (clash) {
          var alt = pool.find(function (st) {
            return !matches.some(function (o, j) {
              return j < i && o.stadium === st && Math.abs(new Date(o.date) - new Date(m.date)) < 3 * 3600000;
            });
          });
          if (alt) m.stadium = alt;
        }
      });
      return matches;
    },
    detectConflicts: function (data, matches) {
      matches = matches || data.matches;
      var conflicts = [];
      var ar = global.I18n.lang === 'ar';
      for (var i = 0; i < matches.length; i++) {
        var a = matches[i];
        if (a.homeTeamId === a.awayTeamId) {
          conflicts.push({ type: 'self', matchIds: [a.id], message: ar ? 'فريق يواجه نفسه' : 'Team plays itself' });
        }
        for (var j = i + 1; j < matches.length; j++) {
          var b = matches[j];
          var sameDay = H.sameDay(a.date, b.date);
          var teamsA = [a.homeTeamId, a.awayTeamId];
          var shared = [b.homeTeamId, b.awayTeamId].filter(function (t) { return teamsA.indexOf(t) !== -1; });
          if (shared.length && sameDay) {
            conflicts.push({ type: 'team', matchIds: [a.id, b.id], teamId: shared[0], message: (ar ? 'الفريق يلعب مباراتين في نفس اليوم: ' : 'Team plays twice on the same day: ') + global.Core.teamName(shared[0]) });
          }
          if (a.stadium && a.stadium === b.stadium && Math.abs(new Date(a.date) - new Date(b.date)) < 3 * 3600000) {
            conflicts.push({ type: 'stadium', matchIds: [a.id, b.id], message: (ar ? 'تعارض في الملعب: ' : 'Stadium double-booked: ') + a.stadium });
          }
          if (a.referee && a.referee === b.referee && a.referee !== '—' && Math.abs(new Date(a.date) - new Date(b.date)) < 3 * 3600000) {
            conflicts.push({ type: 'referee', matchIds: [a.id, b.id], message: (ar ? 'الحكم مكلّف بمباراتين متزامنتين: ' : 'Referee assigned to overlapping matches: ') + a.referee });
          }
        }
      }
      return conflicts;
    }
  };

  global.Engines = {
    Standings: Standings,
    Tiebreaker: Tiebreaker,
    Disciplinary: Disciplinary,
    Stats: Stats,
    Ratings: Ratings,
    Scheduler: Scheduler,
    GOAL_TYPES: GOAL_TYPES
  };
})(window);
