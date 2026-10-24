/* =========================================================
   shared.js — Header + BottomNav + FAB + Navigation +
   Theme + Check Updates + Splash + Global Search + PWA
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var H = global.Helpers;
  var I18n = global.I18n;
  var UI = global.UI;
  var t = function (k) { return I18n.t(k); };

  var NAV_MAP = {
    home: 'home', teams: 'home', team: 'home',
    matches: 'matches', 'match-live': 'matches',
    standings: 'standings',
    stats: 'stats', discipline: 'stats',
    admin: 'admin',
    settings: 'settings'
  };

  /* =========================================================
     MatchExport — professional match & round exports
     PNG share cards (Canvas) · PDF reports · Text · CSV · JSON · ICS
     ========================================================= */
  var SHIELD = 'M32 3 7 11v19c0 15.5 10.6 26.7 25 31 14.4-4.3 25-15.5 25-31V11z';
  var MatchExport = (function () {
    var Badges = UI.Badges, icon = UI.icon, Modal = UI.Modal, Haptic = UI.Haptic, Toast = UI.Toast;
    var L = function (ar, en) { return I18n.lang === 'ar' ? ar : en; };
    var E = function () { return global.Engines; };
    var FONT_AR = "'Cairo', 'Tajawal', system-ui, sans-serif";
    var FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

    var THEMES = {
      emerald: { name: L('زمردي', 'Emerald'), bg: ['#0F8F66', '#0B6E4F', '#04281D'], text: '#FFFFFF', sub: 'rgba(255,255,255,0.72)', accent: '#D4AF37', accent2: '#F3DE8A', panel: 'rgba(0,0,0,0.22)', line: 'rgba(255,255,255,0.10)' },
      night: { name: L('ليلي', 'Night'), bg: ['#1B2633', '#0F161F', '#05080C'], text: '#FFFFFF', sub: 'rgba(255,255,255,0.65)', accent: '#06D6A0', accent2: '#D4AF37', panel: 'rgba(255,255,255,0.06)', line: 'rgba(255,255,255,0.07)' },
      gold: { name: L('ذهبي', 'Gold'), bg: ['#F7E7A6', '#D4AF37', '#8A6A14'], text: '#1E1704', sub: 'rgba(30,23,4,0.68)', accent: '#0B6E4F', accent2: '#0A0E13', panel: 'rgba(255,255,255,0.28)', line: 'rgba(30,23,4,0.08)' }
    };
    var FORMATS = {
      post: { w: 1080, h: 1350, name: L('منشور 4:5', 'Post 4:5') },
      story: { w: 1080, h: 1920, name: L('ستوري 9:16', 'Story 9:16') },
      square: { w: 1080, h: 1080, name: L('مربع 1:1', 'Square 1:1') }
    };

    function fontsReady() {
      if (!document.fonts || !document.fonts.load) return Promise.resolve();
      var sample = 'دوري النخبة Elite 0123456789';
      return Promise.all([
        document.fonts.load('900 40px Cairo', sample), document.fonts.load('700 40px Cairo', sample),
        document.fonts.load('800 40px "JetBrains Mono"', '0123456789:-\''), document.fonts.load('700 30px Tajawal', sample)
      ]).catch(function () { return null; });
    }

    function loadImage(src) {
      return new Promise(function (res) {
        if (!src) { res(null); return; }
        var img = new Image();
        img.onload = function () { res(img); };
        img.onerror = function () { res(null); };
        img.src = src;
      });
    }

    function crestInitials(team) {
      if (I18n.lang === 'ar') return String(team.shortName || team.name).replace(/^ال/, '').slice(0, 2);
      return /^[A-Z]{2,4}$/.test(team.shortNameEn || '') ? team.shortNameEn.slice(0, 3) : H.initials(team.nameEn || team.name).slice(0, 2);
    }

    function drawCrest(ctx, team, cx, cy, size, img) {
      if (!team) return;
      var c1 = (team.colors && team.colors.primary) || '#0B6E4F';
      var c2 = (team.colors && team.colors.secondary) || '#FFFFFF';
      var s = size / 64;
      ctx.save();
      ctx.translate(cx - size / 2, cy - size / 2);
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = size * 0.18;
      ctx.shadowOffsetY = size * 0.08;
      if (img) {
        ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.save(); ctx.clip();
        var r = Math.min(size / img.width, size / img.height);
        ctx.drawImage(img, (size - img.width * r) / 2, (size - img.height * r) / 2, img.width * r, img.height * r);
        ctx.restore();
        ctx.restore();
        return;
      }
      ctx.scale(s, s);
      var path = new Path2D(SHIELD);
      var g = ctx.createLinearGradient(0, 0, 64, 64);
      g.addColorStop(0, c1); g.addColorStop(1, shade(c1, -0.28));
      ctx.fillStyle = g;
      ctx.fill(path);
      ctx.shadowColor = 'transparent';
      ctx.save();
      ctx.clip(path);
      var v = H.hashNum(team.id) % 3;
      ctx.strokeStyle = c2; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      if (v === 0) { ctx.lineWidth = 7; ctx.moveTo(32, 4); ctx.lineTo(32, 60); }
      else if (v === 1) { ctx.lineWidth = 6; ctx.moveTo(6, 22); ctx.lineTo(58, 22); }
      else { ctx.lineWidth = 7; ctx.moveTo(10, 8); ctx.lineTo(54, 52); }
      ctx.stroke();
      ctx.globalAlpha = 1;
      var hl = ctx.createLinearGradient(0, 0, 0, 40);
      hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hl; ctx.fillRect(0, 0, 64, 34);
      ctx.restore();
      ctx.lineWidth = 2.4; ctx.strokeStyle = c2; ctx.stroke(path);
      ctx.beginPath(); ctx.arc(32, 33, 13, 0, Math.PI * 2); ctx.fillStyle = c1; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = c2; ctx.stroke();
      var ini = crestInitials(team);
      ctx.fillStyle = contrastHex(c1);
      ctx.font = '900 ' + (ini.length > 2 ? 10 : 13) + 'px ' + FONT_AR;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.direction = I18n.lang === 'ar' ? 'rtl' : 'ltr';
      ctx.fillText(ini, 32, 34);
      ctx.restore();
    }

    function shade(hex, amt) {
      var h = String(hex).replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var n = parseInt(h, 16);
      var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      var f = function (c) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))); };
      return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
    }
    function contrastHex(hex) {
      var h = String(hex).replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var n = parseInt(h, 16);
      var y = (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
      return y > 150 ? '#0A0E13' : '#FFFFFF';
    }

    function fitText(ctx, text, maxW, weight, size, family) {
      var s = size;
      ctx.font = weight + ' ' + s + 'px ' + family;
      while (ctx.measureText(text).width > maxW && s > 14) { s -= 2; ctx.font = weight + ' ' + s + 'px ' + family; }
      if (ctx.measureText(text).width > maxW) {
        var tt = text;
        while (tt.length > 2 && ctx.measureText(tt + '…').width > maxW) tt = tt.slice(0, -1);
        return tt + '…';
      }
      return text;
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function background(ctx, W, Hh, th) {
      var g = ctx.createLinearGradient(0, 0, W * 0.4, Hh);
      g.addColorStop(0, th.bg[0]); g.addColorStop(0.5, th.bg[1]); g.addColorStop(1, th.bg[2]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
      ctx.save();
      ctx.strokeStyle = th.line; ctx.lineWidth = 2;
      for (var x = -Hh; x < W; x += 46) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + Hh, Hh); ctx.stroke(); }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.5;
      var glow = ctx.createRadialGradient(W * 0.85, Hh * 0.05, 0, W * 0.85, Hh * 0.05, W * 0.75);
      glow.addColorStop(0, 'rgba(255,255,255,0.28)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, Hh);
      var glow2 = ctx.createRadialGradient(W * 0.1, Hh * 0.95, 0, W * 0.1, Hh * 0.95, W * 0.6);
      glow2.addColorStop(0, hexA(th.accent, 0.45)); glow2.addColorStop(1, hexA(th.accent, 0));
      ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, Hh);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = th.line; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(W / 2, Hh * 0.36, W * 0.36, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, Hh * 0.36); ctx.lineTo(W, Hh * 0.36); ctx.stroke();
      ctx.restore();
    }
    function hexA(hex, a) {
      var h = String(hex).replace('#', '');
      var n = parseInt(h, 16);
      return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    function score3d(ctx, text, x, y, size, th) {
      ctx.save();
      ctx.font = '800 ' + size + 'px ' + FONT_MONO;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.direction = 'ltr';
      var depth = Math.round(size * 0.06);
      for (var i = depth; i > 0; i--) {
        ctx.fillStyle = i === depth ? 'rgba(0,0,0,0.35)' : shade(th.accent, -0.55 + (depth - i) * 0.02);
        ctx.fillText(text, x + i * 0.6, y + i);
      }
      var g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
      g.addColorStop(0, th.text === '#FFFFFF' ? '#FFFFFF' : '#2A2106');
      g.addColorStop(1, th.text === '#FFFFFF' ? th.accent2 : '#5A4510');
      ctx.fillStyle = g;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function pill(ctx, text, cx, cy, th, opts) {
      opts = opts || {};
      ctx.save();
      ctx.font = '800 ' + (opts.size || 30) + 'px ' + FONT_AR;
      ctx.direction = I18n.lang === 'ar' ? 'rtl' : 'ltr';
      var w = ctx.measureText(text).width + (opts.pad || 48);
      var h = (opts.size || 30) * 1.8;
      roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
      ctx.fillStyle = opts.bg || th.panel; ctx.fill();
      if (opts.stroke) { ctx.strokeStyle = opts.stroke; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.fillStyle = opts.color || th.text;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, cx, cy + 2);
      ctx.restore();
      return w;
    }

    function statusText(m) {
      var C = global.Core;
      if (m.status === 'live') { var mm = C.liveMinute(m); return t('live') + ' · ' + (mm === 'HT' ? t('ht') : mm + "'"); }
      if (m.status === 'finished') return t('fulltime');
      if (m.status === 'postponed') return t('postponed');
      return H.fmtDate(m.date, { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + H.fmtTime(m.date);
    }

    function goalsOf(m, teamId) {
      return (m.events || []).filter(function (e) { return (e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal') && e.teamId === teamId; })
        .sort(function (a, b) { return a.minute - b.minute; });
    }

    function drawBall(ctx, x, y, r) {
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.lineWidth = Math.max(1.5, r * 0.12); ctx.strokeStyle = '#0A0E13'; ctx.stroke();
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        var px = x + Math.cos(a) * r * 0.42, py = y + Math.sin(a) * r * 0.42;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fillStyle = '#0A0E13'; ctx.fill();
      ctx.restore();
    }
    function drawCardIcon(ctx, x, y, h, color) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(0.12);
      roundRect(ctx, -h * 0.36, -h / 2, h * 0.72, h, h * 0.12);
      ctx.fillStyle = color; ctx.fill();
      ctx.restore();
    }
    function drawSubIcon(ctx, x, y, r) {
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#1E2B38'; ctx.fill();
      ctx.fillStyle = '#06D6A0';
      ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.05); ctx.lineTo(x - r * 0.2, y - r * 0.55); ctx.lineTo(x + r * 0.1, y - r * 0.05); ctx.fill();
      ctx.fillStyle = '#E63946';
      ctx.beginPath(); ctx.moveTo(x - r * 0.1, y + r * 0.05); ctx.lineTo(x + r * 0.2, y + r * 0.55); ctx.lineTo(x + r * 0.5, y + r * 0.05); ctx.fill();
      ctx.restore();
    }

    /* ---------- Match share card ---------- */
    function matchCard(matchId, opts) {
      opts = opts || {};
      var C = global.Core;
      var d = C.State.data;
      var m = C.Matches.get(matchId);
      if (!m) return Promise.reject(new Error('match'));
      var th = THEMES[opts.theme || 'emerald'];
      var fm = FORMATS[opts.format || 'post'];
      var h = C.Teams.get(m.homeTeamId), a = C.Teams.get(m.awayTeamId);
      return Promise.all([fontsReady(), loadImage(h && h.logo), loadImage(a && a.logo), loadImage(d.league.logo)]).then(function (imgs) {
        var W = fm.w, Hh = fm.h;
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = Hh;
        var ctx = cv.getContext('2d');
        var rtl = I18n.lang === 'ar';
        ctx.direction = rtl ? 'rtl' : 'ltr';
        background(ctx, W, Hh, th);
        var tall = Hh >= 1800, square = Hh <= 1100;
        var y = tall ? 150 : 90;

        // Header
        ctx.save();
        ctx.fillStyle = th.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 46px ' + FONT_AR;
        ctx.fillText(fitText(ctx, I18n.name(d.league), W - 160, '900', 46, FONT_AR), W / 2, y);
        ctx.fillStyle = th.sub; ctx.font = '700 28px ' + FONT_AR;
        ctx.fillText(t('season') + ' ' + (d.league.season || '') + '  ·  ' + t('round') + ' ' + m.round, W / 2, y + 52);
        ctx.restore();
        y += 120;
        var live = m.status === 'live';
        pill(ctx, statusText(m), W / 2, y, th, { bg: live ? '#E63946' : th.panel, color: live ? '#fff' : th.text, size: 28 });
        y += tall ? 120 : 90;

        // Teams + score
        var crestSize = square ? 170 : 200;
        var colX = rtl ? [W * 0.82, W * 0.18] : [W * 0.18, W * 0.82];
        var cy = y + crestSize / 2;
        drawCrest(ctx, h, colX[0], cy, crestSize, imgs[1]);
        drawCrest(ctx, a, colX[1], cy, crestSize, imgs[2]);
        ctx.save();
        ctx.fillStyle = th.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        [h, a].forEach(function (tm, i) {
          var nm = fitText(ctx, I18n.name(tm), W * 0.32, '900', 40, FONT_AR);
          ctx.font = ctx.font;
          ctx.fillText(nm, colX[i], cy + crestSize / 2 + 50);
        });
        ctx.restore();
        var played = m.status === 'finished' || m.status === 'live';
        var scoreTxt = played ? (rtl ? m.score.away + ' - ' + m.score.home : m.score.home + ' - ' + m.score.away) : H.fmtTime(m.date);
        score3d(ctx, scoreTxt, W / 2, cy - 10, played ? (square ? 120 : 132) : 96, th);
        if (played && m.events.some(function (e) { return e.minute <= 45; })) {
          ctx.save();
          ctx.fillStyle = th.sub; ctx.font = '700 26px ' + FONT_AR; ctx.textAlign = 'center';
          var hs = halfScore(m);
          ctx.fillText(t('ht') + ' (' + (rtl ? hs.away + ' - ' + hs.home : hs.home + ' - ' + hs.away) + ')', W / 2, cy + 100);
          ctx.restore();
        }
        y = cy + crestSize / 2 + 110;

        // Scorers
        if (played) {
          var gH = goalsOf(m, m.homeTeamId), gA = goalsOf(m, m.awayTeamId);
          var maxLines = square ? 3 : tall ? 7 : 4;
          var rows = Math.min(maxLines, Math.max(gH.length, gA.length));
          if (rows) {
            ctx.save();
            ctx.font = '700 30px ' + FONT_AR; ctx.textBaseline = 'middle';
            [gH, gA].forEach(function (list, i) {
              list.slice(0, maxLines).forEach(function (e, k) {
                var yy = y + k * 46;
                var label = C.playerName(e.playerId) + '  ' + e.minute + "'" + (e.type === 'penalty' ? ' (' + t('penShort') + ')' : e.type === 'owngoal' ? ' (' + t('ownGoalShort') + ')' : '');
                ctx.fillStyle = th.text; ctx.textAlign = 'center';
                ctx.fillText(fitText(ctx, label, W * 0.32, '700', 30, FONT_AR), colX[i], yy);
              });
              if (list.length > maxLines) {
                ctx.fillStyle = th.sub; ctx.fillText('+' + (list.length - maxLines), colX[i], y + maxLines * 46);
              }
            });
            ctx.restore();
            drawBall(ctx, W / 2, y + 2, 16);
            y += rows * 46 + (tall ? 60 : 30);
          }
        }

        // Timeline strip
        if (played && (m.events || []).length && !square) {
          var x0 = 180, x1 = W - 180, ty = y + 70;
          ctx.save();
          roundRect(ctx, 50, y, W - 100, 140, 28); ctx.fillStyle = th.panel; ctx.fill();
          ctx.strokeStyle = hexA(th.text === '#FFFFFF' ? '#FFFFFF' : '#1E1704', 0.35); ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x1, ty); ctx.stroke();
          var maxMin = Math.max(90, (m.events || []).reduce(function (mx, e) { return Math.max(mx, e.minute); }, 0));
          var xAt = function (min) { var f = min / maxMin; return rtl ? x1 - f * (x1 - x0) : x0 + f * (x1 - x0); };
          ctx.fillStyle = th.sub; ctx.font = '700 20px ' + FONT_MONO; ctx.textAlign = 'center'; ctx.direction = 'ltr';
          [0, 45, 90].forEach(function (mn) {
            var xx = xAt(mn);
            ctx.beginPath(); ctx.moveTo(xx, ty - 10); ctx.lineTo(xx, ty + 10); ctx.stroke();
            ctx.fillText(String(mn), xx, ty + 56);
          });
          (m.events || []).forEach(function (e) {
            var xx = xAt(e.minute);
            var up = e.teamId === m.homeTeamId;
            var yy = ty + (up ? -32 : 32);
            if (e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal') drawBall(ctx, xx, yy, 15);
            else if (e.type === 'yellow') drawCardIcon(ctx, xx, yy, 26, '#F4C430');
            else if (e.type === 'red') drawCardIcon(ctx, xx, yy, 26, '#E63946');
            else if (e.type === 'sub') drawSubIcon(ctx, xx, yy, 12);
          });
          ctx.restore();
          ctx.save();
          ctx.font = '800 20px ' + FONT_AR; ctx.fillStyle = th.sub; ctx.direction = rtl ? 'rtl' : 'ltr';
          ctx.textAlign = rtl ? 'right' : 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(fitText(ctx, I18n.short(h), 100, '800', 22, FONT_AR), rtl ? W - 76 : 76, ty - 32);
          ctx.fillText(fitText(ctx, I18n.short(a), 100, '800', 22, FONT_AR), rtl ? W - 76 : 76, ty + 32);
          ctx.restore();
          y += 140 + (tall ? 60 : 36);
        }

        // Stats
        if (played && m.stats && !square) {
          var keys = tall ? ['possession', 'shots', 'shotsOnTarget', 'corners', 'fouls', 'offsides'] : ['possession', 'shots', 'shotsOnTarget', 'corners'];
          keys = keys.filter(function (k) { return m.stats[k]; });
          var avail = Hh - y - 250;
          var rowH = tall ? 92 : 66;
          keys = keys.slice(0, Math.max(0, Math.floor(avail / rowH)));
          if (keys.length && rowH >= 44) {
            var c1 = th.accent, c2 = hexA(th.text === '#FFFFFF' ? '#FFFFFF' : '#1E1704', 0.85);
            keys.forEach(function (k, i) {
              var yy = y + i * rowH;
              var hv = Number(m.stats[k].home) || 0, av = Number(m.stats[k].away) || 0, tot = hv + av || 1;
              var suffix = k === 'possession' ? '%' : '';
              ctx.save();
              ctx.textBaseline = 'middle';
              ctx.fillStyle = th.text; ctx.font = '800 30px ' + FONT_MONO; ctx.direction = 'ltr';
              ctx.textAlign = rtl ? 'right' : 'left'; ctx.fillText(hv + suffix, rtl ? W - 70 : 70, yy);
              ctx.textAlign = rtl ? 'left' : 'right'; ctx.fillText(av + suffix, rtl ? 70 : W - 70, yy);
              ctx.font = '700 26px ' + FONT_AR; ctx.textAlign = 'center'; ctx.fillStyle = th.sub; ctx.direction = rtl ? 'rtl' : 'ltr';
              ctx.fillText(t(k), W / 2, yy);
              var by = yy + 26, bw = (W - 180) / 2;
              roundRect(ctx, 70, by, W - 140, 12, 6); ctx.fillStyle = hexA(th.text === '#FFFFFF' ? '#FFFFFF' : '#1E1704', 0.14); ctx.fill();
              var hw = (hv / tot) * (W - 140), aw = (av / tot) * (W - 140);
              ctx.fillStyle = c1;
              if (rtl) { roundRect(ctx, W - 70 - hw, by, hw, 12, 6); ctx.fill(); ctx.fillStyle = c2; roundRect(ctx, 70, by, aw, 12, 6); ctx.fill(); }
              else { roundRect(ctx, 70, by, hw, 12, 6); ctx.fill(); ctx.fillStyle = c2; roundRect(ctx, W - 70 - aw, by, aw, 12, 6); ctx.fill(); }
              void bw;
              ctx.restore();
            });
            y += keys.length * rowH + 20;
          }
        }

        // MOTM
        var motm = played ? E().Ratings.motm(d, m) : null;
        if (motm && y + 20 < Hh - 190) {
          pill(ctx, t('motm') + ':  ' + I18n.name(motm.player) + '  ·  ' + motm.rating.toFixed(1), W / 2, Hh - 190, th, { bg: hexA(th.accent, 0.92), color: contrastHex(th.accent), size: 28 });
        }

        // Footer
        ctx.save();
        ctx.fillStyle = th.sub; ctx.font = '700 24px ' + FONT_AR; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var foot = [m.stadium, m.referee ? t('referee') + ': ' + m.referee : null, H.fmtDate(m.date, { day: 'numeric', month: 'short', year: 'numeric' })].filter(Boolean).join('  ·  ');
        ctx.fillText(fitText(ctx, foot, W - 120, '700', 24, FONT_AR), W / 2, Hh - 105);
        ctx.fillStyle = th.accent; ctx.font = '900 26px ' + FONT_AR;
        ctx.fillText(I18n.name(d.league) + '  ·  ' + L('تطبيق إدارة الدوري', 'League Manager'), W / 2, Hh - 60);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = th.accent; ctx.fillRect(0, Hh - 14, W, 14);
        ctx.fillStyle = th.accent2; ctx.fillRect(0, Hh - 14, W * 0.35, 14);
        ctx.restore();
        return cv;
      });
    }

    function halfScore(m) {
      var s = { home: 0, away: 0 };
      (m.events || []).forEach(function (e) {
        if (e.minute > 45) return;
        if (e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal') s[e.teamId === m.homeTeamId ? 'home' : 'away']++;
      });
      return s;
    }

    /* ---------- Round results card ---------- */
    function roundCard(round, opts) {
      opts = opts || {};
      var C = global.Core;
      var d = C.State.data;
      var th = THEMES[opts.theme || 'emerald'];
      var list = C.Matches.sorted().filter(function (m) { return Number(m.round) === Number(round); });
      var teamIds = [];
      list.forEach(function (m) { teamIds.push(m.homeTeamId, m.awayTeamId); });
      return Promise.all([fontsReady()].concat(teamIds.map(function (id) { var tm = C.Teams.get(id); return loadImage(tm && tm.logo); }))).then(function (res) {
        var imgs = res.slice(1);
        var W = 1080, rowH = 150, Hh = Math.max(1350, 330 + list.length * (rowH + 18) + 170);
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = Hh;
        var ctx = cv.getContext('2d');
        var rtl = I18n.lang === 'ar';
        ctx.direction = rtl ? 'rtl' : 'ltr';
        background(ctx, W, Hh, th);
        ctx.save();
        ctx.fillStyle = th.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 50px ' + FONT_AR;
        ctx.fillText(I18n.name(d.league), W / 2, 100);
        ctx.restore();
        pill(ctx, t('round') + ' ' + round + '  ·  ' + t('season') + ' ' + (d.league.season || ''), W / 2, 185, th, { bg: hexA(th.accent, 0.92), color: contrastHex(th.accent), size: 30 });
        var y = 280;
        list.forEach(function (m, i) {
          var h = C.Teams.get(m.homeTeamId), a = C.Teams.get(m.awayTeamId);
          ctx.save();
          roundRect(ctx, 50, y, W - 100, rowH, 30);
          ctx.fillStyle = th.panel; ctx.fill();
          ctx.restore();
          var mid = y + rowH / 2;
          var xs = rtl ? [W - 130, 130] : [130, W - 130];
          drawCrest(ctx, h, xs[0], mid, 86, imgs[i * 2]);
          drawCrest(ctx, a, xs[1], mid, 86, imgs[i * 2 + 1]);
          ctx.save();
          ctx.fillStyle = th.text; ctx.textBaseline = 'middle';
          ctx.textAlign = rtl ? 'right' : 'left';
          ctx.fillText(fitText(ctx, I18n.short(h), 270, '800', 34, FONT_AR), rtl ? W - 195 : 195, mid);
          ctx.textAlign = rtl ? 'left' : 'right';
          ctx.fillText(fitText(ctx, I18n.short(a), 270, '800', 34, FONT_AR), rtl ? 195 : W - 195, mid);
          ctx.restore();
          var played = m.status === 'finished' || m.status === 'live';
          var txt = played ? (rtl ? m.score.away + ' - ' + m.score.home : m.score.home + ' - ' + m.score.away) : H.fmtTime(m.date);
          ctx.save();
          roundRect(ctx, W / 2 - 110, mid - 44, 220, 88, 22);
          ctx.fillStyle = m.status === 'live' ? '#E63946' : 'rgba(0,0,0,0.28)'; ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '800 ' + (played ? 52 : 40) + 'px ' + FONT_MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
          ctx.fillText(txt, W / 2, mid + 2);
          ctx.restore();
          ctx.save();
          ctx.fillStyle = th.sub; ctx.font = '700 20px ' + FONT_AR; ctx.textAlign = 'center';
          ctx.fillText(m.status === 'finished' ? t('fulltime') : m.status === 'live' ? t('live') + ' ' + C.liveMinute(m) + "'" : H.fmtDate(m.date, { weekday: 'short', day: 'numeric', month: 'short' }), W / 2, mid + 62);
          ctx.restore();
          y += rowH + 18;
        });
        ctx.save();
        ctx.fillStyle = th.accent; ctx.font = '900 26px ' + FONT_AR; ctx.textAlign = 'center';
        ctx.fillText(I18n.name(d.league) + '  ·  ' + L('تطبيق إدارة الدوري', 'League Manager'), W / 2, Hh - 60);
        ctx.fillRect(0, Hh - 14, W, 14);
        ctx.restore();
        return cv;
      });
    }

    /* ---------- Files ---------- */
    function slug(m) {
      var C = global.Core;
      return ('R' + m.round + '-' + (C.Teams.get(m.homeTeamId) || {}).shortNameEn + '-vs-' + (C.Teams.get(m.awayTeamId) || {}).shortNameEn).replace(/[^A-Za-z0-9\-]/g, '');
    }
    function canvasBlob(cv) {
      return new Promise(function (res) { cv.toBlob(function (b) { res(b); }, 'image/png'); });
    }
    function shareOrDownload(blob, filename, title) {
      var file = null;
      try { file = new File([blob], filename, { type: blob.type }); } catch (e) { file = null; }
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        return navigator.share({ files: [file], title: title }).catch(function () { return null; });
      }
      H.download(filename, blob, blob.type);
      return Promise.resolve();
    }

    function eventLabel(e) {
      if (e.type === 'red' && e.auto) return t('secondYellow');
      return t(e.type);
    }

    function textSummary(matchId) {
      var C = global.Core;
      var d = C.State.data;
      var m = C.Matches.get(matchId);
      var h = C.Teams.get(m.homeTeamId), a = C.Teams.get(m.awayTeamId);
      var lines = [];
      lines.push(I18n.name(d.league) + ' — ' + t('round') + ' ' + m.round);
      lines.push('');
      var played = m.status === 'finished' || m.status === 'live';
      lines.push(I18n.name(h) + '  ' + (played ? m.score.home + ' - ' + m.score.away : t('vs')) + '  ' + I18n.name(a));
      lines.push(statusText(m) + (m.stadium ? ' · ' + m.stadium : ''));
      var goals = (m.events || []).filter(function (e) { return e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal'; }).sort(function (x, y) { return x.minute - y.minute; });
      if (goals.length) {
        lines.push('');
        lines.push(L('الأهداف:', 'Goals:'));
        goals.forEach(function (e) {
          lines.push('• ' + e.minute + "' " + C.playerName(e.playerId) + ' (' + C.teamShort(e.teamId) + ')' + (e.type === 'penalty' ? ' — ' + t('penalty') : e.type === 'owngoal' ? ' — ' + t('owngoal') : '') + (e.assistId ? ' — ' + t('assist') + ': ' + C.playerName(e.assistId) : ''));
        });
      }
      var cards = (m.events || []).filter(function (e) { return e.type === 'yellow' || e.type === 'red'; }).sort(function (x, y) { return x.minute - y.minute; });
      if (cards.length) {
        lines.push('');
        lines.push(L('البطاقات:', 'Cards:'));
        cards.forEach(function (e) { lines.push('• ' + e.minute + "' " + C.playerName(e.playerId) + ' (' + C.teamShort(e.teamId) + ') — ' + eventLabel(e)); });
      }
      if (played && m.stats) {
        lines.push('');
        lines.push(L('الإحصائيات:', 'Stats:'));
        ['possession', 'shots', 'shotsOnTarget', 'corners'].forEach(function (k) {
          if (m.stats[k]) lines.push('• ' + t(k) + ': ' + m.stats[k].home + (k === 'possession' ? '%' : '') + ' - ' + m.stats[k].away + (k === 'possession' ? '%' : ''));
        });
      }
      var motm = played ? E().Ratings.motm(d, m) : null;
      if (motm) { lines.push(''); lines.push(t('motm') + ': ' + I18n.name(motm.player) + ' (' + motm.rating.toFixed(1) + ')'); }
      if (m.referee) lines.push(t('referee') + ': ' + m.referee);
      return lines.join('\n');
    }

    function copyText(txt) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
      return new Promise(function (res, rej) {
        var ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy') ? res() : rej(new Error('copy')); } catch (e) { rej(e); }
        ta.remove();
      });
    }

    function eventsCsv(matches) {
      var C = global.Core;
      var rows = [[L('المباراة', 'Match'), L('الجولة', 'Round'), L('التاريخ', 'Date'), L('الدقيقة', 'Minute'), L('الفريق', 'Team'), L('الحدث', 'Event'), L('اللاعب', 'Player'), L('صانع/خارج', 'Assist/Out'), L('ملاحظة', 'Note')]];
      matches.forEach(function (m) {
        var label = C.teamName(m.homeTeamId) + ' ' + m.score.home + '-' + m.score.away + ' ' + C.teamName(m.awayTeamId);
        (m.events || []).slice().sort(function (x, y) { return x.minute - y.minute; }).forEach(function (e) {
          rows.push([label, m.round, H.fmtDate(m.date), e.minute, C.teamName(e.teamId), eventLabel(e), C.playerName(e.playerId), e.assistId ? C.playerName(e.assistId) : e.playerOutId ? C.playerName(e.playerOutId) : '', e.auto ? t('auto') : '']);
        });
      });
      return rows;
    }

    function fixturesCsv(matches) {
      var C = global.Core;
      var rows = [[L('الجولة', 'Round'), L('التاريخ', 'Date'), L('الوقت', 'Time'), L('المضيف', 'Home'), L('النتيجة', 'Score'), L('الضيف', 'Away'), L('الحالة', 'Status'), L('الملعب', 'Stadium'), L('الحكم', 'Referee')]];
      matches.forEach(function (m) {
        var played = m.status === 'finished' || m.status === 'live';
        rows.push([m.round, H.localISO(new Date(m.date)).slice(0, 10), H.fmtTime(m.date), C.teamName(m.homeTeamId), played ? m.score.home + '-' + m.score.away : '', C.teamName(m.awayTeamId), m.status, m.stadium || '', m.referee || '']);
      });
      return rows;
    }

    function matchJson(matchId) {
      var C = global.Core;
      var d = C.State.data;
      var m = H.clone(C.Matches.get(matchId));
      var pn = function (id) { var p = C.Players.get(id); return p ? { id: p.id, name: p.name, nameEn: p.nameEn, number: p.number, position: p.position } : null; };
      return {
        exportedAt: new Date().toISOString(),
        league: { name: d.league.name, nameEn: d.league.nameEn, season: d.league.season },
        match: m,
        homeTeam: C.Teams.get(m.homeTeamId), awayTeam: C.Teams.get(m.awayTeamId),
        events: (m.events || []).map(function (e) { return Object.assign({}, e, { player: pn(e.playerId), assist: e.assistId ? pn(e.assistId) : null, playerOut: e.playerOutId ? pn(e.playerOutId) : null, label: eventLabel(e) }); }),
        ratings: (m.status === 'finished' || m.status === 'live') ? E().Ratings.matchRatings(d, m).map(function (r) { return { player: pn(r.playerId), side: r.side, rating: r.rating, manual: r.manual }; }) : [],
        motm: (function () { var x = E().Ratings.motm(d, m); return x ? { player: pn(x.playerId), rating: x.rating } : null; })()
      };
    }

    function icsDate(dt) {
      var d = new Date(dt);
      return d.getUTCFullYear() + H.pad(d.getUTCMonth() + 1) + H.pad(d.getUTCDate()) + 'T' + H.pad(d.getUTCHours()) + H.pad(d.getUTCMinutes()) + '00Z';
    }
    function icsEsc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
    function ics(matches) {
      var C = global.Core;
      var d = C.State.data;
      var out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Elite League//League Manager//AR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + icsEsc(I18n.name(d.league))];
      matches.forEach(function (m) {
        var start = new Date(m.date);
        var end = new Date(start.getTime() + 2 * 3600000);
        out.push('BEGIN:VEVENT');
        out.push('UID:' + m.id + '-' + H.hashNum(d.league.name + m.id) + '@league-app');
        out.push('DTSTAMP:' + icsDate(new Date()));
        out.push('DTSTART:' + icsDate(start));
        out.push('DTEND:' + icsDate(end));
        out.push('SUMMARY:' + icsEsc(C.teamName(m.homeTeamId) + ' ' + t('vs') + ' ' + C.teamName(m.awayTeamId)));
        out.push('LOCATION:' + icsEsc(m.stadium || ''));
        out.push('DESCRIPTION:' + icsEsc(I18n.name(d.league) + ' - ' + t('round') + ' ' + m.round + (m.referee ? ' - ' + t('referee') + ': ' + m.referee : '')));
        out.push('BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(C.teamShort(m.homeTeamId) + ' - ' + C.teamShort(m.awayTeamId)), 'END:VALARM');
        out.push('END:VEVENT');
      });
      out.push('END:VCALENDAR');
      return out.join('\r\n');
    }

    /* ---------- PDF match report (print sheet) ---------- */
    function uniqSvg(svg) {
      return String(svg).replace(/id="([^"]+)"/g, 'id="pm-$1"').replace(/url\(#([^)]+)\)/g, 'url(#pm-$1)');
    }

    function reportHTML(matchId) {
      var C = global.Core;
      var d = C.State.data;
      var m = C.Matches.get(matchId);
      var h = C.Teams.get(m.homeTeamId), a = C.Teams.get(m.awayTeamId);
      var played = m.status === 'finished' || m.status === 'live';
      var evs = (m.events || []).slice().sort(function (x, y) { return x.minute - y.minute; });
      var ratings = played ? E().Ratings.matchRatings(d, m) : [];
      var rMap = {}; ratings.forEach(function (r) { rMap[r.playerId] = r.rating; });
      var motm = played ? E().Ratings.motm(d, m) : null;
      var html = '<div class="pm">';
      html += '<div class="pm-head"><div class="pm-league">' + H.esc(I18n.name(d.league)) + ' · ' + t('season') + ' ' + H.esc(d.league.season) + ' · ' + t('round') + ' ' + m.round + '</div>' +
        '<div class="pm-score"><div class="pm-team">' + uniqSvg(Badges.crestSvg(h)) + '<strong>' + H.esc(I18n.name(h)) + '</strong></div>' +
        '<div class="pm-res"><span class="pm-num">' + (played ? m.score.home + ' - ' + m.score.away : H.fmtTime(m.date)) + '</span><span class="pm-status">' + H.esc(statusText(m)) + '</span>' +
        (played ? '<span class="pm-ht">' + t('ht') + ': ' + halfScore(m).home + ' - ' + halfScore(m).away + '</span>' : '') + '</div>' +
        '<div class="pm-team">' + uniqSvg(Badges.crestSvg(a)) + '<strong>' + H.esc(I18n.name(a)) + '</strong></div></div>' +
        '<div class="pm-meta">' + [H.fmtDateTime(m.date), m.stadium ? t('stadium') + ': ' + m.stadium : '', m.referee ? t('referee') + ': ' + m.referee : ''].filter(Boolean).map(H.esc).join(' · ') + '</div></div>';
      if (motm) html += '<div class="pm-motm">' + t('motm') + ': <strong>' + H.esc(I18n.name(motm.player)) + '</strong> (' + H.esc(C.teamName(motm.player.teamId)) + ') — ' + motm.rating.toFixed(1) + '</div>';
      html += '<h2>' + t('timeline') + '</h2>';
      html += evs.length ? '<table><thead><tr><th>' + t('minute') + '</th><th>' + t('team') + '</th><th>' + L('الحدث', 'Event') + '</th><th>' + t('player') + '</th><th>' + L('تفاصيل', 'Details') + '</th></tr></thead><tbody>' +
        evs.map(function (e) {
          var det = e.assistId ? t('assist') + ': ' + C.playerName(e.assistId) : e.playerOutId ? L('خروج', 'Off') + ': ' + C.playerName(e.playerOutId) : e.auto ? t('auto') : '';
          return '<tr class="ev-' + e.type + '"><td><b>' + e.minute + "'</b></td><td class=\"l\">" + H.esc(C.teamName(e.teamId)) + '</td><td>' + H.esc(eventLabel(e)) + '</td><td class="l">' + H.esc(C.playerName(e.playerId)) + '</td><td class="l">' + H.esc(det) + '</td></tr>';
        }).join('') + '</tbody></table>' : '<p class="pm-empty">' + t('noEvents') + '</p>';
      if (played && m.stats) {
        html += '<h2>' + t('matchStats') + '</h2><table class="pm-stats"><thead><tr><th><span class="pm-key" style="background:#0B6E4F"></span>' + H.esc(I18n.short(h)) + '</th><th></th><th><span class="pm-key" style="background:#D4AF37"></span>' + H.esc(I18n.short(a)) + '</th></tr></thead><tbody>' +
          ['possession', 'shots', 'shotsOnTarget', 'corners', 'fouls', 'offsides'].filter(function (k) { return m.stats[k]; }).map(function (k) {
            var hv = Number(m.stats[k].home) || 0, av = Number(m.stats[k].away) || 0, tot = hv + av || 1;
            var sfx = k === 'possession' ? '%' : '';
            return '<tr><td><b>' + hv + sfx + '</b></td><td><div class="pm-stat-l">' + t(k) + '</div><div class="pm-bar"><span style="width:' + (hv / tot * 100).toFixed(1) + '%;background:#0B6E4F"></span><span style="width:' + (av / tot * 100).toFixed(1) + '%;background:#D4AF37"></span></div></td><td><b>' + av + sfx + '</b></td></tr>';
          }).join('') + '</tbody></table>';
      }
      if (m.lineups) {
        html += '<h2>' + t('lineups') + '</h2><div class="pm-lineups">' + ['home', 'away'].map(function (side) {
          var l = m.lineups[side];
          var tm = side === 'home' ? h : a;
          if (!l) return '<div></div>';
          var row = function (id) {
            var p = C.Players.get(id);
            if (!p) return '';
            return '<tr><td>' + H.esc(p.number) + '</td><td class="l">' + H.esc(I18n.name(p)) + '</td><td>' + H.esc(p.position) + '</td><td>' + (rMap[id] ? rMap[id].toFixed(1) : '—') + '</td></tr>';
          };
          return '<div><h3>' + H.esc(I18n.name(tm)) + ' · ' + H.esc(l.formation || '') + '</h3><table><thead><tr><th>#</th><th>' + t('player') + '</th><th>' + t('position') + '</th><th>' + t('rating') + '</th></tr></thead><tbody>' +
            l.starters.map(row).join('') + '<tr class="pm-sep"><td colspan="4">' + t('bench') + '</td></tr>' + (l.bench || []).map(row).join('') + '</tbody></table>' +
            (tm.coach ? '<p class="pm-coach">' + t('coach') + ': ' + H.esc(tm.coach) + '</p>' : '') + '</div>';
        }).join('') + '</div>';
      }
      var fans = E().Ratings.fanCounts(d, m.id);
      if (fans.length) {
        var tv = fans.reduce(function (s, f) { return s + f.votes; }, 0);
        html += '<h2>' + t('fanVote') + '</h2><table><tbody>' + fans.slice(0, 5).map(function (f) { return '<tr><td class="l">' + H.esc(C.playerName(f.playerId)) + '</td><td>' + f.votes + '</td><td>' + Math.round(f.votes / tv * 100) + '%</td></tr>'; }).join('') + '</tbody></table>';
      }
      html += '<div class="pm-foot">' + H.esc(I18n.name(d.league)) + ' · ' + L('تقرير مباراة رسمي', 'Official match report') + ' · ' + H.esc(H.fmtDateTime(new Date().toISOString())) + '</div></div>';
      return html;
    }

    function roundReportHTML(round) {
      var C = global.Core;
      var d = C.State.data;
      var list = C.Matches.sorted().filter(function (m) { return Number(m.round) === Number(round); });
      return '<div class="pm"><div class="pm-head"><div class="pm-league">' + H.esc(I18n.name(d.league)) + ' · ' + t('season') + ' ' + H.esc(d.league.season) + '</div><h1 style="margin:6pt 0 0">' + t('round') + ' ' + round + '</h1></div>' +
        '<table><thead><tr><th>' + t('date') + '</th><th>' + t('homeTeam') + '</th><th>' + t('score') + '</th><th>' + t('awayTeam') + '</th><th>' + t('stadium') + '</th><th>' + t('referee') + '</th></tr></thead><tbody>' +
        list.map(function (m) {
          var played = m.status === 'finished' || m.status === 'live';
          return '<tr><td>' + H.esc(H.fmtDateTime(m.date)) + '</td><td class="l">' + H.esc(C.teamName(m.homeTeamId)) + '</td><td><b>' + (played ? m.score.home + ' - ' + m.score.away : t('vs')) + '</b></td><td class="l">' + H.esc(C.teamName(m.awayTeamId)) + '</td><td class="l">' + H.esc(m.stadium || '') + '</td><td class="l">' + H.esc(m.referee || '') + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<h2>' + L('الأهداف', 'Goals') + '</h2><table><tbody>' + list.map(function (m) {
          return goalsOf(m, m.homeTeamId).concat(goalsOf(m, m.awayTeamId)).sort(function (x, y) { return x.minute - y.minute; }).map(function (e) {
            return '<tr><td>' + e.minute + "'</td><td class=\"l\">" + H.esc(C.playerName(e.playerId)) + '</td><td class="l">' + H.esc(C.teamName(e.teamId)) + '</td><td class="l">' + H.esc(C.teamShort(m.homeTeamId) + ' - ' + C.teamShort(m.awayTeamId)) + '</td></tr>';
          }).join('');
        }).join('') + '</tbody></table>' +
        '<div class="pm-foot">' + H.esc(I18n.name(d.league)) + ' · ' + H.esc(H.fmtDateTime(new Date().toISOString())) + '</div></div>';
    }

    /* ---------- UI: image studio ---------- */
    function imageStudio(kind, id) {
      var state = { theme: 'emerald', format: 'post' };
      var C = global.Core;
      var m = kind === 'match' ? C.Matches.get(id) : null;
      var html = '<div class="studio">' +
        '<div class="studio-preview" id="studio-preview"><div class="skeleton" style="width:100%;aspect-ratio:4/5;border-radius:18px"></div></div>' +
        '<div class="studio-controls">' +
        (kind === 'match' ? '<div class="field"><label class="field-label">' + L('المقاس', 'Format') + '</label><div class="segmented" id="studio-format">' +
          Object.keys(FORMATS).map(function (k) { return '<button type="button" data-v="' + k + '" class="' + (k === state.format ? 'active' : '') + '">' + FORMATS[k].name + '</button>'; }).join('') + '</div></div>' : '') +
        '<div class="field"><label class="field-label">' + L('الطابع', 'Theme') + '</label><div class="studio-themes" id="studio-theme">' +
        Object.keys(THEMES).map(function (k) { var th = THEMES[k]; return '<button type="button" data-v="' + k + '" class="studio-theme ' + (k === state.theme ? 'active' : '') + '" style="background:linear-gradient(135deg,' + th.bg[0] + ',' + th.bg[2] + ');color:' + th.text + '">' + th.name + '</button>'; }).join('') + '</div></div>' +
        '</div></div>';
      var footer = document.createElement('div');
      footer.style.display = 'contents';
      footer.innerHTML = '<button class="btn btn-secondary" type="button" id="studio-share">' + icon('upload') + L('مشاركة', 'Share') + '</button><button class="btn btn-primary" type="button" id="studio-dl">' + icon('download') + L('تنزيل PNG', 'Download PNG') + '</button>';
      var modal = Modal.open({ title: kind === 'match' ? L('بطاقة المباراة', 'Match card') : L('بطاقة الجولة', 'Round card'), content: html, footer: footer, wide: true });
      var current = null;
      function render() {
        var prev = modal.body.querySelector('#studio-preview');
        prev.classList.add('loading');
        var p = kind === 'match' ? matchCard(id, state) : roundCard(id, state);
        p.then(function (cv) {
          current = cv;
          cv.className = 'studio-canvas';
          prev.innerHTML = '';
          prev.appendChild(cv);
          prev.classList.remove('loading');
        }).catch(function (e) { prev.innerHTML = '<div class="alert alert-danger">' + H.esc(e.message) + '</div>'; });
      }
      function bindSeg(sel, key) {
        var el = modal.body.querySelector(sel);
        if (!el) return;
        el.addEventListener('click', function (e) {
          var b = e.target.closest('button');
          if (!b) return;
          state[key] = b.getAttribute('data-v');
          el.querySelectorAll('button').forEach(function (x) { x.classList.toggle('active', x === b); });
          Haptic.tap(8);
          render();
        });
      }
      bindSeg('#studio-format', 'format');
      bindSeg('#studio-theme', 'theme');
      var fname = function () { return (kind === 'match' ? slug(m) + '-' + state.format : 'round-' + id) + '.png'; };
      footer.querySelector('#studio-dl').addEventListener('click', function () {
        if (!current) return;
        canvasBlob(current).then(function (b) { H.download(fname(), b, 'image/png'); Toast.success(L('تم تنزيل الصورة', 'Image downloaded')); global.Core.Audit.log('create', 'export', kind === 'match' ? id : 'round-' + id, 'PNG'); });
      });
      footer.querySelector('#studio-share').addEventListener('click', function () {
        if (!current) return;
        canvasBlob(current).then(function (b) { return shareOrDownload(b, fname(), I18n.name(global.Core.State.data.league)); });
      });
      render();
    }

    function printReport(html) {
      global.Shared.printSheet(html, 'print-match');
    }

    /* ---------- UI: export menus ---------- */
    function option(key, ic, title, sub) {
      return '<button type="button" class="export-opt" data-x="' + key + '"><span class="export-ic">' + icon(ic) + '</span><span class="export-txt"><span class="export-title">' + title + '</span><span class="export-sub">' + sub + '</span></span>' + icon('chevron') + '</button>';
    }

    function openMatch(matchId) {
      var C = global.Core;
      var m = C.Matches.get(matchId);
      if (!m) return;
      var html = '<div class="export-head">' + Badges.crest(C.Teams.get(m.homeTeamId), 'sm') + '<strong>' + H.esc(C.teamShort(m.homeTeamId)) + ' ' + ((m.status === 'finished' || m.status === 'live') ? m.score.home + ' - ' + m.score.away : t('vs')) + ' ' + H.esc(C.teamShort(m.awayTeamId)) + '</strong>' + Badges.crest(C.Teams.get(m.awayTeamId), 'sm') + '</div>' +
        '<div class="export-grid">' +
        option('image', 'sparkles', L('بطاقة صورة احترافية', 'Pro image card'), L('PNG للمشاركة · منشور / ستوري / مربع · 3 طوابع', 'PNG for social · post / story / square · 3 themes')) +
        option('pdf', 'pdf', L('تقرير المباراة PDF', 'Match report PDF'), L('الأحداث، الإحصائيات، التشكيلات، التقييمات', 'Events, stats, lineups, ratings')) +
        option('text', 'file', L('ملخص نصي', 'Text summary'), L('نسخ أو مشاركة عبر واتساب وتيليجرام', 'Copy or share via messaging apps')) +
        option('csv', 'list', L('أحداث المباراة CSV', 'Match events CSV'), L('جدول يفتح في Excel', 'Spreadsheet-ready table')) +
        option('json', 'database', L('بيانات JSON كاملة', 'Full JSON data'), L('المباراة مع أسماء اللاعبين والتقييمات', 'Match with player names and ratings')) +
        option('ics', 'calendar', L('إضافة للتقويم', 'Add to calendar'), L('ملف ICS مع تذكير قبل ساعة', 'ICS file with 1h reminder')) +
        '</div>';
      var modal = Modal.open({ title: L('تصدير المباراة', 'Export match'), content: html });
      modal.body.querySelector('.export-grid').addEventListener('click', function (e) {
        var b = e.target.closest('[data-x]');
        if (!b) return;
        var k = b.getAttribute('data-x');
        Haptic.tap(10);
        if (k === 'image') { modal.close(); setTimeout(function () { imageStudio('match', matchId); }, 220); return; }
        if (k === 'pdf') { modal.close(); printReport(reportHTML(matchId)); C.Audit.log('create', 'export', matchId, 'PDF'); return; }
        if (k === 'text') {
          var txt = textSummary(matchId);
          modal.close();
          setTimeout(function () { textDialog(txt); }, 220);
          return;
        }
        if (k === 'csv') { C.Exporter.csv(eventsCsv([m]), slug(m) + '-events.csv'); Toast.success(t('exportDone')); return; }
        if (k === 'json') { H.download(slug(m) + '.json', JSON.stringify(matchJson(matchId), null, 2), 'application/json'); Toast.success(t('exportDone')); return; }
        if (k === 'ics') { H.download(slug(m) + '.ics', ics([m]), 'text/calendar;charset=utf-8'); Toast.success(t('exportDone')); }
      });
    }

    function textDialog(txt) {
      var footer = document.createElement('div');
      footer.style.display = 'contents';
      footer.innerHTML = (navigator.share ? '<button class="btn btn-secondary" type="button" id="tx-share">' + icon('upload') + L('مشاركة', 'Share') + '</button>' : '') +
        '<button class="btn btn-primary" type="button" id="tx-copy">' + icon('check') + L('نسخ النص', 'Copy text') + '</button>';
      var md = Modal.open({ title: L('ملخص المباراة', 'Match summary'), content: '<textarea class="textarea export-text" id="tx-area" rows="14" dir="auto">' + H.esc(txt) + '</textarea>', footer: footer });
      footer.querySelector('#tx-copy').addEventListener('click', function () {
        copyText(md.body.querySelector('#tx-area').value).then(function () { Toast.success(L('تم النسخ', 'Copied')); Haptic.success(); }).catch(function () { Toast.error(L('تعذّر النسخ', 'Copy failed')); });
      });
      var sh = footer.querySelector('#tx-share');
      if (sh) sh.addEventListener('click', function () { navigator.share({ text: md.body.querySelector('#tx-area').value }).catch(function () { return null; }); });
    }

    function openRound(round, matches) {
      var C = global.Core;
      var all = matches || C.Matches.sorted();
      var inRound = C.Matches.sorted().filter(function (m) { return String(m.round) === String(round); });
      var upcoming = all.filter(function (m) { return m.status === 'scheduled'; });
      var html = '<div class="export-grid">' +
        (round !== 'all' ? option('rimage', 'sparkles', L('بطاقة نتائج الجولة', 'Round results card'), L('صورة PNG لكل مباريات الجولة ', 'PNG with all round matches ') + round) : '') +
        (round !== 'all' ? option('rpdf', 'pdf', L('تقرير الجولة PDF', 'Round report PDF'), L('المباريات والأهداف', 'Fixtures and goals')) : '') +
        option('fcsv', 'list', L('جدول المباريات CSV', 'Fixtures CSV'), all.length + ' ' + t('matchesCount')) +
        option('ecsv', 'history', L('كل الأحداث CSV', 'All events CSV'), L('أهداف وبطاقات وتبديلات', 'Goals, cards and subs')) +
        option('ics', 'calendar', L('المباريات القادمة للتقويم', 'Upcoming to calendar'), upcoming.length + ' ' + t('matchesCount') + ' · ICS') +
        '</div>';
      var modal = Modal.open({ title: L('تصدير المباريات', 'Export matches'), content: html });
      modal.body.querySelector('.export-grid').addEventListener('click', function (e) {
        var b = e.target.closest('[data-x]');
        if (!b) return;
        var k = b.getAttribute('data-x');
        Haptic.tap(10);
        var stamp = H.localISO(new Date()).slice(0, 10);
        if (k === 'rimage') { modal.close(); setTimeout(function () { imageStudio('round', round); }, 220); return; }
        if (k === 'rpdf') { modal.close(); printReport(roundReportHTML(round)); return; }
        if (k === 'fcsv') { C.Exporter.csv(fixturesCsv(round !== 'all' ? inRound : all), 'fixtures-' + (round !== 'all' ? 'R' + round + '-' : '') + stamp + '.csv'); Toast.success(t('exportDone')); return; }
        if (k === 'ecsv') { C.Exporter.csv(eventsCsv((round !== 'all' ? inRound : all).filter(function (m) { return (m.events || []).length; })), 'events-' + stamp + '.csv'); Toast.success(t('exportDone')); return; }
        if (k === 'ics') {
          if (!upcoming.length) { Toast.info(t('empty')); return; }
          H.download('upcoming-matches-' + stamp + '.ics', ics(upcoming), 'text/calendar;charset=utf-8');
          Toast.success(t('exportDone'));
        }
      });
    }

    return {
      openMatch: openMatch, openRound: openRound, imageStudio: imageStudio,
      matchCard: matchCard, roundCard: roundCard, textSummary: textSummary,
      reportHTML: reportHTML, roundReportHTML: roundReportHTML, ics: ics, eventsCsv: eventsCsv, fixturesCsv: fixturesCsv, matchJson: matchJson,
      drawCrest: drawCrest, THEMES: THEMES, FORMATS: FORMATS
    };
  })();

  var Shared = {
    page: null,

    init: function () {
      Shared.page = document.body.getAttribute('data-page') || 'home';
      I18n.apply();
      UI.Theme.apply();
      Shared.renderHeader();
      Shared.initNav();
      Shared.initFab();
      Shared.initTopbarScroll();
      Shared.initTransitions();
      Shared.initNetwork();
      Shared.registerSW();
      Shared.splash();
      if (UI.FX) UI.FX.init();
      C.State.subscribe(function () { Shared.renderHeader(); });
    },

    /* ---------- Header ---------- */
    renderHeader: function () {
      var league = C.State.data ? C.State.data.league : null;
      var title = document.getElementById('topbar-title');
      var sub = document.getElementById('topbar-sub');
      var logo = document.getElementById('topbar-logo');
      var role = document.getElementById('role-pill');
      if (title) title.textContent = league ? I18n.name(league) : t('appName');
      if (sub) sub.textContent = league ? (t('season') + ' ' + (league.season || '')) : '';
      if (logo) {
        if (league && league.logo) logo.innerHTML = '<img src="' + H.esc(league.logo) + '" alt="" onerror="this.parentNode.innerHTML=UI.icon(\'logo\')">';
        else logo.innerHTML = UI.icon('logo');
      }
      if (role) {
        var admin = C.Permissions.isAdmin();
        role.classList.toggle('hidden', !admin);
        role.textContent = t('admin');
      }
      document.title = (document.body.getAttribute('data-title') ? t(document.body.getAttribute('data-title')) + ' · ' : '') + (league ? I18n.name(league) : t('appName'));
    },

    initTopbarScroll: function () {
      var bar = document.getElementById('topbar');
      if (!bar) return;
      var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 6); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      var themeBtn = document.getElementById('btn-theme');
      if (themeBtn) themeBtn.addEventListener('click', function () {
        var th = UI.Theme.toggle();
        UI.Toast.info(th === 'dark' ? t('darkMode') : (I18n.lang === 'ar' ? 'الوضع الفاتح' : 'Light mode'));
      });
      var upBtn = document.getElementById('btn-updates');
      if (upBtn) upBtn.addEventListener('click', function () { Shared.checkUpdates(upBtn); });
      var searchBtn = document.getElementById('btn-search');
      if (searchBtn) searchBtn.addEventListener('click', Shared.openSearch);
    },

    /* ---------- Bottom Nav ---------- */
    initNav: function () {
      var key = NAV_MAP[Shared.page] || 'home';
      document.querySelectorAll('.bottom-nav .nav-item').forEach(function (a) {
        var active = a.getAttribute('data-nav') === key;
        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
        a.addEventListener('click', function () { UI.Haptic.tap(10); });
      });
    },

    /* ---------- FAB ---------- */
    initFab: function () {
      var fab = document.getElementById('fab');
      var menu = document.getElementById('fab-menu');
      var back = document.getElementById('fab-backdrop');
      if (!fab || !menu || !back) return;
      function build() {
        var items = [];
        var live = C.State.data ? C.State.data.matches.filter(function (m) { return m.status === 'live'; }) : [];
        items.push({ icon: 'search', label: t('search').replace('...', ''), action: function () { Shared.openSearch(); } });
        if (live.length) items.push({ icon: 'live', label: t('liveNow') + ' (' + live.length + ')', href: 'match-live.html?id=' + encodeURIComponent(live[0].id) });
        items.push({ icon: 'users', label: t('teams'), href: 'teams.html' });
        items.push({ icon: 'gavel', label: t('discipline'), href: 'discipline.html' });
        if (C.Permissions.isAdmin()) items.push({ icon: 'zap', label: t('liveEntry'), href: 'admin.html?tab=live' });
        else items.push({ icon: 'lock', label: t('adminMode'), href: 'admin.html' });
        menu.innerHTML = items.map(function (it, i) {
          return it.href
            ? '<a class="fab-action glass-strong glass" href="' + it.href + '">' + UI.icon(it.icon) + '<span>' + H.esc(it.label) + '</span></a>'
            : '<button class="fab-action glass-strong glass" type="button" data-i="' + i + '">' + UI.icon(it.icon) + '<span>' + H.esc(it.label) + '</span></button>';
        }).join('');
        menu.querySelectorAll('button[data-i]').forEach(function (b) {
          b.addEventListener('click', function () { close(); items[Number(b.getAttribute('data-i'))].action(); });
        });
      }
      function open() {
        build();
        fab.classList.add('open'); menu.classList.add('open'); back.classList.add('open');
        fab.setAttribute('aria-expanded', 'true');
        UI.Haptic.tap(12);
      }
      function close() {
        fab.classList.remove('open'); menu.classList.remove('open'); back.classList.remove('open');
        fab.setAttribute('aria-expanded', 'false');
      }
      fab.addEventListener('click', function () { if (fab.classList.contains('open')) close(); else open(); });
      back.addEventListener('click', close);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      Shared.closeFab = close;
    },

    /* ---------- Global search ---------- */
    openSearch: function () {
      var wrap = document.createElement('div');
      wrap.innerHTML = UI.Search.box('search', 'global-search') + '<div id="gs-results" class="mt-4"></div>';
      var m = UI.Modal.open({ title: t('search').replace('...', ''), content: wrap });
      var input = wrap.querySelector('#global-search');
      var res = wrap.querySelector('#gs-results');
      function render(q) {
        if (!q || q.trim().length < 1) {
          res.innerHTML = UI.Render.empty('search', I18n.lang === 'ar' ? 'ابحث عن فريق أو لاعب أو ملعب' : 'Search a team, player or stadium');
          return;
        }
        var d = C.State.data;
        var teams = d.teams.filter(function (tm) { return UI.Search.match(q, [tm.name, tm.nameEn, tm.shortName, tm.city, tm.stadium, tm.coach]); }).slice(0, 6);
        var players = d.players.filter(function (p) { return UI.Search.match(q, [p.name, p.nameEn, String(p.number)]); }).slice(0, 12);
        var html = '';
        if (teams.length) {
          html += '<div class="divider-label">' + t('teams') + '</div><div class="card list">' + teams.map(function (tm) {
            return '<a class="list-item" href="team.html?id=' + encodeURIComponent(tm.id) + '">' + UI.Badges.crest(tm, 'sm') +
              '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(tm)) + '</span><span class="li-sub">' + UI.icon('stadium') + H.esc(tm.stadium || '') + '</span></div>' + UI.icon('chevron', 'chev') + '</a>';
          }).join('') + '</div>';
        }
        if (players.length) {
          html += '<div class="divider-label">' + t('players') + '</div><div class="card list">' + players.map(function (p) {
            var tm = C.Teams.get(p.teamId);
            return '<a class="list-item" href="team.html?id=' + encodeURIComponent(p.teamId) + '#p-' + encodeURIComponent(p.id) + '">' + UI.Badges.avatar(p, 'sm') +
              '<div class="li-main"><span class="li-title">' + H.esc(I18n.name(p)) + '</span><span class="li-sub">' + UI.Badges.pos(p.position) + ' #' + H.esc(p.number) + ' · ' + H.esc(I18n.short(tm)) + '</span></div>' + UI.icon('chevron', 'chev') + '</a>';
          }).join('') + '</div>';
        }
        res.innerHTML = html || UI.Render.empty('search', t('empty'));
      }
      UI.Search.bind(input, render, 180);
      render('');
      setTimeout(function () { input.focus(); }, 80);
      return m;
    },

    /* ---------- Page transitions (MPA) ---------- */
    initTransitions: function () {
      document.body.classList.add('page-enter');
      setTimeout(function () { document.body.classList.remove('page-enter'); }, 500);
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
        if (/^(https?:|mailto:|tel:|blob:|data:)/i.test(href)) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if ('startViewTransition' in document && CSS.supports && CSS.supports('view-transition-name: none')) {
          /* Native cross-document view transitions handle it */
        }
        e.preventDefault();
        Shared.go(href);
      });
      window.addEventListener('pageshow', function (e) {
        if (e.persisted) document.body.classList.remove('page-leave');
      });
    },
    go: function (href) {
      if (Shared.closeFab) Shared.closeFab();
      document.body.classList.add('page-leave');
      setTimeout(function () { window.location.href = href; }, 170);
    },

    /* ---------- Splash ---------- */
    splash: function () {
      var seen = false;
      try { seen = sessionStorage.getItem('league.splash') === '1'; } catch (e) { seen = true; }
      if (seen) return;
      try { sessionStorage.setItem('league.splash', '1'); } catch (e) { /* ignore */ }
      var league = C.State.data ? C.State.data.league : null;
      var el = document.createElement('div');
      el.className = 'splash';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<canvas class="splash-ball" data-ball data-speed="0.05" aria-hidden="true"></canvas><div class="splash-logo">' + (league && league.logo ? '<img src="' + H.esc(league.logo) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:30px">' : UI.icon('logo')) + '</div>' +
        '<div class="splash-title">' + H.esc(league ? I18n.name(league) : t('appName')) + '</div>' +
        '<div class="splash-sub">' + H.esc(t('season') + ' ' + (league ? league.season : '')) + '</div>' +
        '<div class="splash-bar"><span></span></div>';
      document.body.appendChild(el);
      setTimeout(function () {
        el.classList.add('hide');
        setTimeout(function () { el.remove(); }, 600);
      }, 1400);
    },

    /* ---------- Network ---------- */
    initNetwork: function () {
      window.addEventListener('offline', function () { UI.Toast.warning(t('offline')); });
      window.addEventListener('online', function () { UI.Toast.success(t('online')); });
    },

    /* ---------- Service worker ---------- */
    swReg: null,
    registerSW: function () {
      if (!('serviceWorker' in navigator)) return;
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        Shared.swReg = reg;
        reg.addEventListener('updatefound', function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function () {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              UI.Toast.info(I18n.lang === 'ar' ? 'يتوفر إصدار جديد من التطبيق' : 'A new app version is available', {
                action: t('reload'), duration: 8000,
                onAction: function () { nw.postMessage({ type: 'SKIP_WAITING' }); }
              });
            }
          });
        });
      }).catch(function () { /* ignore */ });
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    },

    /* ---------- Check updates ---------- */
    checkUpdates: function (btn) {
      if (btn) btn.classList.add('spinning');
      var swCheck = Shared.swReg ? Shared.swReg.update().catch(function () { return null; }) : Promise.resolve(null);
      var dataCheck = fetch('data/sample-league.json?ts=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .then(function (json) {
          var stamp = String(json.version || 1) + '|' + (json.updatedAt || '');
          var known = C.Prefs.get('remoteStamp');
          if (!known) {
            C.Prefs.set('remoteStamp', stamp);
            return false;
          }
          if (known !== stamp) return { json: json, stamp: stamp };
          return false;
        })
        .catch(function () { return null; });
      Promise.all([swCheck, dataCheck]).then(function (res) {
        setTimeout(function () { if (btn) btn.classList.remove('spinning'); }, 400);
        var upd = res[1];
        if (upd && upd.json) {
          UI.Toast.info(t('updateAvailable'), {
            action: t('apply'), duration: 9000,
            onAction: function () {
              var v = C.Validator.validate(upd.json);
              if (!v.valid) { UI.Toast.error(v.errors[0]); return; }
              C.State.replace(C.Sample.rebase(upd.json));
              C.Prefs.set('remoteStamp', upd.stamp);
              UI.Toast.success(t('imported'));
              setTimeout(function () { window.location.reload(); }, 600);
            }
          });
        } else if (upd === null && !navigator.onLine) {
          UI.Toast.warning(t('offline'));
        } else {
          UI.Toast.success(t('upToDate') + ' · v' + C.VERSION);
        }
      });
    },

    /* ---------- PIN dialog (used by admin page and anywhere) ---------- */
    pinDialog: function () {
      return new Promise(function (resolve) {
        var wrap = document.createElement('div');
        var pin = '';
        wrap.innerHTML = '<div class="text-center"><div class="gate-icon" style="width:60px;height:60px;border-radius:18px">' + UI.icon('lock') + '</div>' +
          '<p class="text-sm text-muted">' + t('enterPin') + '</p></div>' +
          '<div class="pin-dots" id="pin-dots">' + [0, 1, 2, 3].map(function () { return '<span class="pin-dot"></span>'; }).join('') + '</div>' +
          '<div class="pin-pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button class="pin-key" type="button" data-k="' + n + '">' + n + '</button>'; }).join('') +
          '<button class="pin-key" type="button" data-k="clear" aria-label="clear">' + UI.icon('x') + '</button><button class="pin-key" type="button" data-k="0">0</button><button class="pin-key" type="button" data-k="back" aria-label="back">' + UI.icon('backspace') + '</button></div>' +
          '<p class="text-xs text-faint text-center mt-4">' + t('pinHint') + '</p>';
        var ok = false;
        var m = UI.Modal.open({ title: t('admin_pin_title'), content: wrap, onClose: function () { if (!ok) resolve(false); } });
        var dots = wrap.querySelector('#pin-dots');
        var expected = String(C.Prefs.get('pin') || '1234');
        function paint() {
          var need = Math.max(4, expected.length);
          if (dots.children.length !== need) dots.innerHTML = Array(need + 1).join('<span class="pin-dot"></span>');
          Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('filled', i < pin.length); });
        }
        function press(k) {
          UI.Haptic.tap(8);
          if (k === 'back') pin = pin.slice(0, -1);
          else if (k === 'clear') pin = '';
          else if (pin.length < 8) pin += k;
          paint();
          if (pin.length >= expected.length) {
            if (C.Permissions.login(pin)) {
              ok = true;
              UI.Haptic.success();
              UI.Toast.success(t('adminMode'));
              m.close();
              resolve(true);
            } else if (pin.length >= expected.length) {
              dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
              UI.Haptic.error();
              UI.Toast.error(t('wrongPin'));
              pin = '';
              setTimeout(paint, 200);
            }
          }
        }
        wrap.querySelectorAll('.pin-key').forEach(function (b) {
          b.addEventListener('click', function () { press(b.getAttribute('data-k')); });
        });
        var keyHandler = function (e) {
          if (!wrap.isConnected) { document.removeEventListener('keydown', keyHandler); return; }
          if (/^\d$/.test(e.key)) press(e.key);
          else if (e.key === 'Backspace') press('back');
        };
        document.addEventListener('keydown', keyHandler);
        paint();
      });
    },

    requireAdmin: function () {
      if (C.Permissions.isAdmin()) return Promise.resolve(true);
      return Shared.pinDialog();
    },

    /* ---------- Print sheet (PDF export through the print dialog) ---------- */
    printSheet: function (html, cls) {
      var old = document.getElementById('print-sheet');
      if (old) old.remove();
      var sheet = document.createElement('div');
      sheet.id = 'print-sheet';
      sheet.className = 'print-only print-report ' + (cls || '');
      sheet.setAttribute('dir', document.documentElement.getAttribute('dir') || 'rtl');
      sheet.innerHTML = html;
      document.body.appendChild(sheet);
      document.body.classList.add('printing-sheet');
      var cleanup = function () {
        document.body.classList.remove('printing-sheet');
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      UI.Toast.info(I18n.lang === 'ar' ? 'اختر "حفظ كـ PDF" من نافذة الطباعة' : 'Choose "Save as PDF" in the print dialog');
      setTimeout(function () { window.print(); setTimeout(cleanup, 1500); }, 400);
    },

    MatchExport: MatchExport
  };

  global.Shared = Shared;
  global.MatchExport = MatchExport;
})(window);
