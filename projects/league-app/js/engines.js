/* ============================================================
   ENGINES.JS — محركات المنطق الرياضي
   Standings | Tiebreaker | Disciplinary | Stats | Ratings | Scheduler
   ============================================================ */

(function (window) {
  'use strict';

  /* ============================================================
     STANDINGS ENGINE — جدول الترتيب
     ============================================================ */

  const StandingsEngine = {
    compute(data) {
      const cfg = data.league?.settings || {};
      const winPts = Number(cfg.winPoints ?? 3);
      const drawPts = Number(cfg.drawPoints ?? 1);
      const lossPts = Number(cfg.lossPoints ?? 0);

      const rows = data.teams.map(team => ({
        teamId: team.id,
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        diff: 0,
        points: 0,
        fairplay: 0,
        deduction: 0,
        form: []
      }));

      const byId = new Map(rows.map(r => [r.teamId, r]));

      const finished = data.matches.filter(m =>
        m.status === 'finished' && m.score &&
        Number.isFinite(+m.score.home) && Number.isFinite(+m.score.away)
      );

      for (const m of finished) {
        const home = byId.get(m.homeTeamId);
        const away = byId.get(m.awayTeamId);
        if (!home || !away) continue;

        const hg = +m.score.home;
        const ag = +m.score.away;

        home.played++;
        away.played++;
        home.goalsFor += hg;
        home.goalsAgainst += ag;
        away.goalsFor += ag;
        away.goalsAgainst += hg;

        if (hg > ag) {
          home.wins++;
          home.points += winPts;
          away.losses++;
          away.points += lossPts;
          home.form.push('W');
          away.form.push('L');
        } else if (hg < ag) {
          away.wins++;
          away.points += winPts;
          home.losses++;
          home.points += lossPts;
          away.form.push('W');
          home.form.push('L');
        } else {
          home.draws++;
          away.draws++;
          home.points += drawPts;
          away.points += drawPts;
          home.form.push('D');
          away.form.push('D');
        }

        for (const ev of m.events || []) {
          const row = byId.get(ev.teamId);
          if (!row) continue;
          if (ev.type === 'yellow') row.fairplay += 1;
          if (ev.type === 'red') row.fairplay += 3;
        }
      }

      for (const d of cfg.pointsDeduction || []) {
        const row = byId.get(d.teamId);
        if (row) {
          const amount = Number(d.points) || 0;
          row.deduction += amount;
          row.points -= amount;
        }
      }

      for (const r of rows) {
        r.diff = r.goalsFor - r.goalsAgainst;
        r.form = r.form.slice(-5);
      }

      return TiebreakerEngine.sort(rows, data);
    },

    getTeamPosition(teamId, data) {
      const table = this.compute(data);
      return table.findIndex(r => r.teamId === teamId) + 1;
    }
  };

  /* ============================================================
     TIEBREAKER ENGINE — كسر التعادل
     ============================================================ */

  const TiebreakerEngine = {
    sort(rows, data) {
      const cfg = data.league?.settings || {};
      const rules = cfg.tiebreakers || [
        'points', 'h2h', 'h2hDiff', 'h2hGoals',
        'diff', 'goals', 'wins', 'fairplay'
      ];

      rows.sort((a, b) => b.points - a.points);

      const sorted = [];
      let i = 0;

      while (i < rows.length) {
        let j = i + 1;
        while (j < rows.length && rows[j].points === rows[i].points) {
          j++;
        }

        const group = rows.slice(i, j);

        if (group.length === 1) {
          sorted.push(group[0]);
        } else {
          const resolved = this.applyCriteria(group, data, rules);
          sorted.push(...resolved);
        }

        i = j;
      }

      return sorted;
    },

    applyCriteria(group, data, rules) {
      let remaining = [...group];

      for (const rule of rules) {
        if (rule === 'points') continue;
        if (remaining.length <= 1) break;

        remaining = this.applySingleCriterion(remaining, data, rule);
      }

      return remaining;
    },

    applySingleCriterion(rows, data, rule) {
      const groups = new Map();

      for (const row of rows) {
        const value = this.getValue(row, data, rule);
        const key = String(value);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
      }

      const sortedKeys = [...groups.keys()].sort((a, b) => {
        const na = Number(a);
        const nb = Number(b);
        if (Number.isFinite(na) && Number.isFinite(nb)) return nb - na;
        return b.localeCompare(a, 'ar');
      });

      const result = [];
      for (const key of sortedKeys) {
        const sub = groups.get(key);
        if (sub.length === 1) {
          result.push(sub[0]);
        } else {
          result.push(...sub);
        }
      }

      return result;
    },

    getValue(row, data, rule) {
      switch (rule) {
        case 'h2h':
          return this.miniTable([row.teamId], data).get(row.teamId)?.points || 0;
        case 'h2hDiff':
          return this.miniTable([row.teamId], data).get(row.teamId)?.diff || 0;
        case 'h2hGoals':
          return this.miniTable([row.teamId], data).get(row.teamId)?.goalsFor || 0;
        case 'diff':
          return row.diff;
        case 'goals':
          return row.goalsFor;
        case 'wins':
          return row.wins;
        case 'fairplay':
          return -row.fairplay;
        case 'losses':
          return -row.losses;
        case 'draw':
          return 0;
        default:
          return 0;
      }
    },

    miniTable(teamIds, data) {
      const ids = new Set(teamIds);
      const map = new Map();

      for (const id of teamIds) {
        map.set(id, {
          points: 0,
          played: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          diff: 0,
          wins: 0
        });
      }

      const cfg = data.league?.settings || {};
      const winPts = Number(cfg.winPoints ?? 3);
      const drawPts = Number(cfg.drawPoints ?? 1);

      const relevant = data.matches.filter(m =>
        m.status === 'finished' &&
        m.score &&
        ids.has(m.homeTeamId) &&
        ids.has(m.awayTeamId)
      );

      for (const m of relevant) {
        const home = map.get(m.homeTeamId);
        const away = map.get(m.awayTeamId);
        if (!home || !away) continue;

        const hg = +m.score.home;
        const ag = +m.score.away;

        home.played++;
        away.played++;
        home.goalsFor += hg;
        home.goalsAgainst += ag;
        away.goalsFor += ag;
        away.goalsAgainst += hg;

        if (hg > ag) {
          home.wins++;
          home.points += winPts;
        } else if (hg < ag) {
          away.wins++;
          away.points += winPts;
        } else {
          home.points += drawPts;
          away.points += drawPts;
        }
      }

      for (const row of map.values()) {
        row.diff = row.goalsFor - row.goalsAgainst;
      }

      return map;
    },

    explain(teamId, data) {
      const table = StandingsEngine.compute(data);
      const row = table.find(r => r.teamId === teamId);
      if (!row) return [];

      const tied = table.filter(r => r.points === row.points);
      const mini = this.miniTable(tied.map(r => r.teamId), data).get(teamId) || {};

      return [
        { label: 'النقاط', value: row.points },
        { label: 'المواجهات المباشرة — نقاط', value: mini.points || 0 },
        { label: 'المواجهات المباشرة — فارق', value: mini.diff || 0 },
        { label: 'المواجهات المباشرة — أهداف', value: mini.goalsFor || 0 },
        { label: 'فارق الأهداف العام', value: row.diff },
        { label: 'الأهداف المسجلة', value: row.goalsFor },
        { label: 'عدد الانتصارات', value: row.wins },
        { label: 'اللعب النظيف (الأقل أفضل)', value: row.fairplay },
        { label: 'الترتيب الحالي', value: table.findIndex(r => r.teamId === teamId) + 1 }
      ];
    }
  };

  /* ============================================================
     DISCIPLINARY ENGINE — العقوبات
     ============================================================ */

  const DisciplinaryEngine = {
    process(data) {
      const yellowByPlayer = new Map();
      const redByPlayer = new Map();

      const cfg = data.league?.settings || {};
      const threshold = Number(cfg.yellowForSuspension) || 3;
      const resetAfter = Number(cfg.resetCardsAfterRounds) || 0;

      const finished = data.matches
        .filter(m => m.status === 'finished')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      for (const m of finished) {
        const matchYellows = new Map();

        for (const ev of m.events || []) {
          if (!ev.playerId) continue;

          if (ev.type === 'yellow') {
            yellowByPlayer.set(
              ev.playerId,
              (yellowByPlayer.get(ev.playerId) || 0) + 1
            );
            matchYellows.set(
              ev.playerId,
              (matchYellows.get(ev.playerId) || 0) + 1
            );
          }

          if (ev.type === 'red') {
            redByPlayer.set(
              ev.playerId,
              (redByPlayer.get(ev.playerId) || 0) + 1
            );
          }
        }

        for (const [playerId, count] of matchYellows.entries()) {
          if (count >= 2) {
            redByPlayer.set(
              playerId,
              (redByPlayer.get(playerId) || 0) + 1
            );
          }
        }
      }

      const manual = new Map();
      for (const d of data.discipline || []) {
        manual.set(
          d.playerId,
          (manual.get(d.playerId) || 0) + (Number(d.matchesSuspended) || 0)
        );
      }

      const suspensions = [];

      for (const player of data.players) {
        const yellows = yellowByPlayer.get(player.id) || 0;
        const reds = redByPlayer.get(player.id) || 0;
        const manualCount = manual.get(player.id) || 0;

        let autoSuspension = 0;
        if (threshold > 0) {
          autoSuspension = Math.floor(yellows / threshold);
        }

        const redSuspension = reds;
        const total = autoSuspension + redSuspension + manualCount;

        if (total > 0) {
          suspensions.push({
            player,
            playerId: player.id,
            yellows,
            reds,
            autoSuspension,
            redSuspension,
            manualSuspension: manualCount,
            suspended: total
          });
        }
      }

      suspensions.sort((a, b) => b.suspended - a.suspended);

      return {
        yellowCards: [...yellowByPlayer.values()].reduce((s, n) => s + n, 0),
        redCards: [...redByPlayer.values()].reduce((s, n) => s + n, 0),
        suspensions,
        manual: data.discipline || [],
        threshold,
        resetAfter,
        lastRound: Math.max(0, ...data.matches.map(m => +m.round || 0))
      };
    },

    playerCards(playerId, data) {
      const cards = [];

      for (const m of data.matches) {
        for (const ev of m.events || []) {
          if (ev.playerId === playerId &&
              (ev.type === 'yellow' || ev.type === 'red')) {
            cards.push({
              type: ev.type,
              minute: ev.minute,
              matchId: m.id,
              match: m,
              round: m.round,
              date: m.date
            });
          }
        }
      }

      return cards.sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    suspendedPlayers(data) {
      const result = this.process(data);
      return result.suspensions.filter(s => s.suspended > 0);
    },

    isSuspended(playerId, data) {
      const suspended = this.suspendedPlayers(data);
      return suspended.some(s => s.playerId === playerId);
    }
  };

  /* ============================================================
     STATS ENGINE — الإحصائيات
     ============================================================ */

  const StatsEngine = {
    compute(data) {
      const players = new Map();

      for (const p of data.players) {
        players.set(p.id, {
          player: p,
          goals: 0,
          assists: 0,
          yellows: 0,
          reds: 0,
          cleanSheets: 0,
          appearances: 0,
          minutes: 0
        });
      }

      const finished = data.matches.filter(m => m.status === 'finished');

      for (const m of finished) {
        const appeared = new Set();

        for (const ev of m.events || []) {
          const p = players.get(ev.playerId);
          if (!p) continue;

          appeared.add(ev.playerId);

          switch (ev.type) {
            case 'goal':
              p.goals++;
              break;
            case 'assist':
              p.assists++;
              break;
            case 'yellow':
              p.yellows++;
              break;
            case 'red':
              p.reds++;
              break;
          }

          if (Number.isFinite(+ev.minute)) {
            p.minutes += +ev.minute;
          }
        }

        for (const id of appeared) {
          const p = players.get(id);
          if (p) p.appearances++;
        }

        if (m.score) {
          if (+m.score.away === 0) {
            for (const p of data.players) {
              if (p.teamId === m.homeTeamId && ['GK', 'DF'].includes(p.position)) {
                const row = players.get(p.id);
                if (row) row.cleanSheets++;
              }
            }
          }
          if (+m.score.home === 0) {
            for (const p of data.players) {
              if (p.teamId === m.awayTeamId && ['GK', 'DF'].includes(p.position)) {
                const row = players.get(p.id);
                if (row) row.cleanSheets++;
              }
            }
          }
        }
      }

      const all = [...players.values()];

      return {
        all,
        scorers: all
          .slice()
          .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.player.name.localeCompare(b.player.name, 'ar')),
        assists: all
          .slice()
          .sort((a, b) => b.assists - a.assists || b.goals - a.goals),
        keepers: all
          .filter(x => x.player.position === 'GK' || x.cleanSheets > 0)
          .sort((a, b) => b.cleanSheets - a.cleanSheets),
        fairplay: all
          .slice()
          .sort((a, b) => (a.yellows + a.reds * 3) - (b.yellows + b.reds * 3)),
        cards: all
          .slice()
          .filter(x => x.yellows > 0 || x.reds > 0)
          .sort((a, b) => (b.yellows + b.reds) - (a.yellows + a.reds))
      };
    },

    topScorers(data, limit = 10) {
      return this.compute(data).scorers.slice(0, limit);
    },

    topAssists(data, limit = 10) {
      return this.compute(data).assists.slice(0, limit);
    },

    topKeepers(data, limit = 10) {
      return this.compute(data).keepers.slice(0, limit);
    },

    fairPlayTable(data, limit = 10) {
      return this.compute(data).fairplay.slice(0, limit);
    }
  };

  /* ============================================================
     RATINGS ENGINE — التقييمات
     ============================================================ */

  const RatingsEngine = {
    add(playerId, matchId, score, voter = 'admin') {
      if (!Core.State.data.ratings) Core.State.data.ratings = [];

      const rating = {
        id: Helpers.randomId('rating'),
        playerId,
        matchId,
        score: Number(score),
        voter,
        type: voter === 'fan' ? 'fan' : 'coach',
        timestamp: new Date().toISOString()
      };

      Core.State.data.ratings.push(rating);
      Core.CRUD.commit('add-rating', 'ratings', rating.id, null, rating);
      return rating;
    },

    getPlayerAverage(playerId) {
      const ratings = (Core.State.data.ratings || [])
        .filter(r => r.playerId === playerId);

      if (!ratings.length) return 0;

      const sum = ratings.reduce((s, r) => s + Number(r.score || 0), 0);
      return sum / ratings.length;
    },

    getMatchRatings(matchId) {
      return (Core.State.data.ratings || [])
        .filter(r => r.matchId === matchId);
    },

    topRated(limit = 10) {
      const players = Core.State.data.players;

      const rated = players
        .map(player => ({
          player,
          avg: this.getPlayerAverage(player.id),
          count: this.countPlayerRatings(player.id)
        }))
        .filter(x => x.count > 0)
        .sort((a, b) => b.avg - a.avg || b.count - a.count);

      return rated.slice(0, limit);
    },

    countPlayerRatings(playerId) {
      return (Core.State.data.ratings || [])
        .filter(r => r.playerId === playerId).length;
    },

    teamOfTheWeek(round) {
      const matches = Core.State.data.matches.filter(
        m => m.status === 'finished' && m.round === round
      );

      const matchIds = matches.map(m => m.id);
      const ratings = (Core.State.data.ratings || [])
        .filter(r => matchIds.includes(r.matchId));

      const byPosition = { GK: [], DF: [], MF: [], FW: [] };

      for (const r of ratings) {
        const player = Core.State.data.players.find(p => p.id === r.playerId);
        if (!player || !byPosition[player.position]) continue;

        byPosition[player.position].push({
          player,
          score: Number(r.score)
        });
      }

      const team = [];
      const picks = { GK: 1, DF: 4, MF: 3, FW: 3 };

      for (const [pos, count] of Object.entries(picks)) {
        const sorted = byPosition[pos].sort((a, b) => b.score - a.score);
        team.push(...sorted.slice(0, count));
      }

      return team;
    },

    bestPlayerOfSeason() {
      return this.topRated(1)[0] || null;
    },

    fanVote(matchId, playerId) {
      if (!Core.State.data.fanVotes) Core.State.data.fanVotes = [];

      let vote = Core.State.data.fanVotes.find(
        v => v.matchId === matchId && v.playerId === playerId
      );

      if (vote) {
        vote.count = (vote.count || 0) + 1;
      } else {
        vote = { matchId, playerId, count: 1 };
        Core.State.data.fanVotes.push(vote);
      }

      Core.CRUD.commit('fan-vote', 'fanVotes', `${matchId}|${playerId}`, null, vote);
      return vote;
    },

    getFanVotes(matchId) {
      const votes = (Core.State.data.fanVotes || [])
        .filter(v => v.matchId === matchId);

      return votes.sort((a, b) => b.count - a.count);
    }
  };

  /* ============================================================
     SCHEDULER ENGINE — الجدولة
     ============================================================ */

  const SchedulerEngine = {
    generate(teams, options = {}) {
      const list = teams.slice();
      if (list.length < 2) return [];

      const circle = list.slice();
      if (circle.length % 2 === 1) {
        circle.push({ id: 'BYE', name: 'راحة' });
      }

      const n = circle.length;
      const rounds = [];

      for (let r = 0; r < n - 1; r++) {
        const games = [];

        for (let i = 0; i < n / 2; i++) {
          let home = circle[i];
          let away = circle[n - 1 - i];

          if (home.id === 'BYE' || away.id === 'BYE') continue;

          if ((r + i) % 2) {
            [home, away] = [away, home];
          }

          games.push({
            round: r + 1,
            homeTeamId: home.id,
            awayTeamId: away.id
          });
        }

        rounds.push(games);

        circle.splice(1, 0, circle.pop());
      }

      if (options.doubleRound) {
        const second = rounds.map((games, i) =>
          games.map(g => ({
            round: i + rounds.length + 1,
            homeTeamId: g.awayTeamId,
            awayTeamId: g.homeTeamId
          }))
        );
        rounds.push(...second);
      }

      return rounds;
    },

    detectConflicts(matches) {
      const issues = [];

      for (let i = 0; i < matches.length; i++) {
        for (let j = i + 1; j < matches.length; j++) {
          const a = matches[i];
          const b = matches[j];

          if (!a.date || !b.date) continue;

          const timeA = new Date(a.date).getTime();
          const timeB = new Date(b.date).getTime();

          if (Math.abs(timeA - timeB) < 3600000) {
            if ([a.homeTeamId, a.awayTeamId].some(
              x => x === b.homeTeamId || x === b.awayTeamId
            )) {
              issues.push({
                type: 'team',
                severity: 'high',
                matches: [a.id, b.id],
                message: 'فريق في مباراتين متزامنتين'
              });
            }

            if (a.stadium && a.stadium === b.stadium) {
              issues.push({
                type: 'stadium',
                severity: 'medium',
                matches: [a.id, b.id],
                message: 'ملعب محجوز لمباراتين متزامنتين'
              });
            }
          }
        }
      }

      return issues;
    },

    assignStadiums(matches, teams) {
      const teamMap = new Map(teams.map(t => [t.id, t]));

      return matches.map(m => {
        const home = teamMap.get(m.homeTeamId);
        return {
          ...m,
          stadium: m.stadium || home?.stadium || 'ملعب غير محدد'
        };
      });
    },

    balanceHomeAway(matches) {
      const count = new Map();

      for (const m of matches) {
        count.set(m.homeTeamId, (count.get(m.homeTeamId) || 0) + 1);
        count.set(m.awayTeamId, (count.get(m.awayTeamId) || 0) + 1);
      }

      const imbalances = [...count.entries()].map(([teamId, homeCount]) => ({
        teamId,
        homeCount,
        awayCount: count.get(teamId) - homeCount
      }));

      return imbalances;
    }
  };

  /* ============================================================
     EXPORT
     ============================================================ */

  window.StandingsEngine = StandingsEngine;
  window.TiebreakerEngine = TiebreakerEngine;
  window.DisciplinaryEngine = DisciplinaryEngine;
  window.StatsEngine = StatsEngine;
  window.RatingsEngine = RatingsEngine;
  window.SchedulerEngine = SchedulerEngine;

  window.Engines = {
    standings: (data) => StandingsEngine.compute(data),
    teamStats: (teamId, data) => {
      const table = StandingsEngine.compute(data);
      return table.find(r => r.teamId === teamId) || {
        played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, diff: 0, points: 0, form: []
      };
    },
    miniTable: (ids, data) => TiebreakerEngine.miniTable(ids, data),
    tiebreakExplanation: (teamId, data) => TiebreakerEngine.explain(teamId, data),
    discipline: (data) => DisciplinaryEngine.process(data),
    stats: (data) => StatsEngine.compute(data),
    schedule: (teams, opts) => SchedulerEngine.generate(teams, opts),
    detectConflicts: (matches) => SchedulerEngine.detectConflicts(matches),
    ratings: RatingsEngine,
    scheduler: SchedulerEngine,
    statsEngine: StatsEngine
  };

})(window);