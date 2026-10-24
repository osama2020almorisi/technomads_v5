/* =========================================================
   core.js — Storage + State + CRUD + Audit + Permissions +
   Validator + Importer + Exporter + Helpers + I18n + Sample
   ========================================================= */
(function (global) {
  'use strict';

  var APP_VERSION = '1.0.0';
  var STORAGE_KEY = 'league.data.v1';
  var PREFS_KEY = 'league.prefs.v1';
  var SESSION_KEY = 'league.session.v1';
  var DB_NAME = 'league-app-db';
  var DB_STORE = 'snapshots';

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  var Helpers = {
    uid: function (prefix) {
      return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },
    clone: function (obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    esc: function (str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    param: function (name) {
      var urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    },
    debounce: function (fn, wait) {
      var timer = null;
      return function () {
        var ctx = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, wait || 250);
      };
    },
    throttle: function (fn, wait) {
      var last = 0;
      return function () {
        var now = Date.now();
        if (now - last >= wait) {
          last = now;
          fn.apply(this, arguments);
        }
      };
    },
    initials: function (name) {
      if (!name) return '?';
      var parts = String(name).trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },
    hashColor: function (str) {
      var h = 0;
      var s = String(str || '');
      for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
      var hue = Math.abs(h) % 360;
      return 'hsl(' + hue + ', 55%, 42%)';
    },
    hashNum: function (str) {
      var h = 2166136261;
      var s = String(str || '');
      for (var i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return Math.abs(h);
    },
    pad: function (n) { return n < 10 ? '0' + n : String(n); },
    toLocalInput: function (iso) {
      if (!iso) return '';
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.getFullYear() + '-' + Helpers.pad(d.getMonth() + 1) + '-' + Helpers.pad(d.getDate()) +
        'T' + Helpers.pad(d.getHours()) + ':' + Helpers.pad(d.getMinutes());
    },
    localISO: function (d) {
      return d.getFullYear() + '-' + Helpers.pad(d.getMonth() + 1) + '-' + Helpers.pad(d.getDate()) +
        'T' + Helpers.pad(d.getHours()) + ':' + Helpers.pad(d.getMinutes()) + ':00';
    },
    sameDay: function (a, b) {
      var x = new Date(a);
      var y = new Date(b);
      return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
    },
    isToday: function (iso) { return Helpers.sameDay(iso, new Date()); },
    fmtDate: function (iso, opts) {
      if (!iso) return '—';
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '—';
      var locale = I18n.lang === 'ar' ? 'ar-EG' : 'en-GB';
      return d.toLocaleDateString(locale, opts || { weekday: 'short', day: 'numeric', month: 'short' });
    },
    fmtTime: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '—';
      return Helpers.pad(d.getHours()) + ':' + Helpers.pad(d.getMinutes());
    },
    fmtDateTime: function (iso) {
      return Helpers.fmtDate(iso, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + Helpers.fmtTime(iso);
    },
    relTime: function (iso) {
      var diff = (Date.now() - new Date(iso).getTime()) / 1000;
      var ar = I18n.lang === 'ar';
      if (diff < 60) return ar ? 'الآن' : 'just now';
      if (diff < 3600) return ar ? ('قبل ' + Math.floor(diff / 60) + ' د') : (Math.floor(diff / 60) + 'm ago');
      if (diff < 86400) return ar ? ('قبل ' + Math.floor(diff / 3600) + ' س') : (Math.floor(diff / 3600) + 'h ago');
      return Helpers.fmtDate(iso, { day: 'numeric', month: 'short' });
    },
    age: function (birthdate) {
      if (!birthdate) return '—';
      var b = new Date(birthdate);
      var n = new Date();
      var a = n.getFullYear() - b.getFullYear();
      var m = n.getMonth() - b.getMonth();
      if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
      return a;
    },
    num: function (n) {
      if (n === null || n === undefined || isNaN(n)) return '0';
      return String(n);
    },
    signed: function (n) {
      if (n > 0) return '\u200E+' + n;
      if (n < 0) return '\u200E' + n;
      return String(n);
    },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    round1: function (v) { return Math.round(v * 10) / 10; },
    groupBy: function (arr, fn) {
      var out = {};
      arr.forEach(function (item) {
        var k = fn(item);
        if (!out[k]) out[k] = [];
        out[k].push(item);
      });
      return out;
    },
    download: function (filename, content, mime) {
      var blob = new Blob([content], { type: mime || 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 300);
    },
    readFile: function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsText(file);
      });
    },
    readFileAsDataURL: function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsDataURL(file);
      });
    },
    seededRandom: function (seed) {
      var s = seed >>> 0;
      return function () {
        s = (s + 0x6D2B79F5) >>> 0;
        var t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
  };

  /* ---------------------------------------------------------
     I18n
     --------------------------------------------------------- */
  var DICT = {
    ar: {
      appName: 'دوري النخبة', home: 'الرئيسية', matches: 'المباريات', standings: 'الترتيب', stats: 'الإحصائيات',
      admin: 'الإدارة', settings: 'الإعدادات', teams: 'الفرق', team: 'الفريق', discipline: 'الانضباط',
      players: 'اللاعبون', player: 'اللاعب', season: 'الموسم', round: 'الجولة', today: 'اليوم', upcoming: 'القادمة',
      past: 'الماضية', all: 'الكل', live: 'مباشر', finished: 'انتهت', scheduled: 'مجدولة', postponed: 'مؤجلة',
      todayMatches: 'مباريات اليوم', leader: 'المتصدر', latestResults: 'آخر النتائج', quickAccess: 'الوصول السريع',
      noMatchesToday: 'لا توجد مباريات اليوم', viewAll: 'عرض الكل', points: 'النقاط', pts: 'ن', played: 'لعب',
      won: 'فاز', drawn: 'تعادل', lost: 'خسر', gf: 'له', ga: 'عليه', gd: 'الفارق', form: 'آخر 5', fairplay: 'اللعب النظيف',
      pos: 'المركز', search: 'بحث...', searchTeams: 'ابحث عن فريق...', searchPlayers: 'ابحث عن لاعب...',
      group: 'المجموعة', groupLabel: 'مجموعة', founded: 'التأسيس', stadium: 'الملعب', coach: 'المدرب', referee: 'الحكم',
      squad: 'قائمة اللاعبين', GK: 'حراسة المرمى', DF: 'الدفاع', MF: 'الوسط', FW: 'الهجوم',
      GKs: 'حارس', DFs: 'مدافع', MFs: 'وسط', FWs: 'مهاجم', age: 'العمر', number: 'الرقم', nationality: 'الجنسية',
      teamMatches: 'مباريات الفريق', timeline: 'مجريات المباراة', lineups: 'التشكيلة', matchStats: 'إحصائيات المباراة',
      possession: 'الاستحواذ', shots: 'التسديدات', shotsOnTarget: 'على المرمى', corners: 'الركنيات', fouls: 'الأخطاء',
      offsides: 'التسلل', yellowCards: 'البطاقات الصفراء', redCards: 'البطاقات الحمراء', goal: 'هدف', penalty: 'ركلة جزاء',
      owngoal: 'هدف عكسي', yellow: 'بطاقة صفراء', red: 'بطاقة حمراء', sub: 'تبديل', assist: 'صناعة',
      scorers: 'الهدافون', assists: 'الصنّاع', keepers: 'الحراس', cleanSheets: 'شباك نظيفة', goals: 'الأهداف',
      cards: 'البطاقات', suspended: 'الموقوفون', decisions: 'قرارات اللجنة', recordedCards: 'البطاقات المسجلة',
      darkMode: 'الوضع الداكن', language: 'اللغة', importJson: 'استيراد JSON', exportJson: 'تصدير نسخة احتياطية',
      exportPdf: 'تصدير PDF', clearData: 'مسح البيانات', version: 'الإصدار', appearance: 'المظهر', data: 'البيانات',
      about: 'حول التطبيق', dropHere: 'اسحب ملف JSON هنا أو اضغط للاختيار', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف',
      edit: 'تعديل', add: 'إضافة', confirm: 'تأكيد', close: 'إغلاق', yes: 'نعم', no: 'لا', saved: 'تم الحفظ',
      deleted: 'تم الحذف', error: 'خطأ', success: 'تم بنجاح', loading: 'جارٍ التحميل...', empty: 'لا توجد بيانات',
      viewerMode: 'وضع المشاهد', adminMode: 'وضع المسؤول', enterPin: 'أدخل رمز PIN', wrongPin: 'رمز PIN غير صحيح',
      login: 'دخول', logout: 'خروج', dashboard: 'لوحة القيادة', manageTeams: 'إدارة الفرق', managePlayers: 'إدارة اللاعبين',
      manageMatches: 'إدارة المباريات', liveEntry: 'إدخال مباشر', leagueSettings: 'إعدادات البطولة', auditLog: 'سجل التعديلات',
      ratings: 'التقييمات', checkUpdates: 'التحقق من التحديثات', upToDate: 'التطبيق محدّث', updateAvailable: 'يتوفر تحديث للبيانات',
      tiebreak: 'كسر التعادل', tiebreakers: 'معايير كسر التعادل', h2h: 'المواجهات المباشرة', h2hDiff: 'فارق المواجهات',
      h2hGoals: 'أهداف المواجهات', diff: 'فارق الأهداف', wins: 'عدد الانتصارات', draw: 'القرعة',
      champions: 'دوري الأبطال', europa: 'الدوري الأوروبي', relegation: 'الهبوط', winPoints: 'نقاط الفوز',
      drawPoints: 'نقاط التعادل', lossPoints: 'نقاط الخسارة', yellowForSuspension: 'صفراوات للإيقاف',
      resetCardsAfterRounds: 'تصفير البطاقات بعد الجولة', pointsDeduction: 'خصم النقاط', reason: 'السبب', amount: 'القيمة',
      teamOfWeek: 'فريق الجولة', playerOfSeason: 'أفضل لاعب في الموسم', fanVote: 'تصويت الجمهور', vote: 'صوّت',
      voted: 'تم تسجيل صوتك', rating: 'التقييم', minute: 'الدقيقة', status: 'الحالة', date: 'التاريخ', home2: 'المضيف',
      away: 'الضيف', score: 'النتيجة', events: 'الأحداث', addEvent: 'إضافة حدث', startMatch: 'بدء المباراة',
      endMatch: 'إنهاء المباراة', generateSchedule: 'توليد جدول المباريات', conflicts: 'التعارضات', noConflicts: 'لا توجد تعارضات',
      matchesCount: 'مباراة', teamsCount: 'فريق', playersCount: 'لاعب', goalsCount: 'هدف', vs: 'ضد',
      confirmDelete: 'هل أنت متأكد من الحذف؟', confirmDelete2: 'هذا الإجراء نهائي. اكتب "حذف" للتأكيد',
      typeDelete: 'حذف', confirmClear: 'سيتم مسح جميع البيانات المحلية وإعادة تحميل البيانات التجريبية',
      imported: 'تم استيراد البيانات بنجاح', invalidJson: 'ملف JSON غير صالح', exportDone: 'تم التصدير',
      matchOver: 'انتهت المباراة', ht: 'الشوط الأول', ft: 'نهاية المباراة', ko: 'انطلاق', motm: 'رجل المباراة',
      noEvents: 'لا توجد أحداث بعد', bench: 'البدلاء', formation: 'الخطة', changePin: 'تغيير رمز PIN',
      newPin: 'رمز PIN الجديد', security: 'الأمان', storage: 'التخزين', lastUpdated: 'آخر تحديث', ban: 'إيقاف',
      matchesBan: 'مباريات', fine: 'غرامة', cancelBan: 'إلغاء إيقاف', addDecision: 'قرار جديد', served: 'مُنفَّذ',
      remaining: 'متبقي', voided: 'ملغى (تصفير)', auto: 'تلقائي', manual: 'يدوي', secondYellow: 'إنذار ثانٍ',
      accumulation: 'تراكم إنذارات', directRed: 'طرد مباشر', nextMatch: 'المباراة القادمة', none: 'لا يوجد',
      qualification: 'تأهل', playoff: 'ملحق', apply: 'تطبيق', reset: 'إعادة تعيين', name: 'الاسم', shortName: 'الاسم المختصر',
      nameEn: 'الاسم (إنجليزي)', primaryColor: 'اللون الأساسي', secondaryColor: 'اللون الثانوي', logo: 'الشعار',
      position: 'المركز', birthdate: 'تاريخ الميلاد', photo: 'الصورة', active: 'نشط', injured: 'مصاب', round2: 'رقم الجولة',
      homeTeam: 'الفريق المضيف', awayTeam: 'الفريق الضيف', homeScore: 'أهداف المضيف', awayScore: 'أهداف الضيف',
      kickoff: 'موعد الانطلاق', selectMatch: 'اختر المباراة', type: 'النوع', fillRequired: 'يرجى تعبئة الحقول المطلوبة',
      sameTeams: 'لا يمكن أن يلعب الفريق ضد نفسه', dragToReorder: 'اسحب لإعادة الترتيب', doubleRound: 'ذهاب وإياب',
      startDate: 'تاريخ البداية', intervalDays: 'الفاصل بالأيام', replaceMatches: 'استبدال المباريات الحالية', generate: 'توليد',
      user: 'المستخدم', action: 'الإجراء', entity: 'الكيان', time: 'الوقت', create: 'إنشاء', update: 'تحديث', remove: 'حذف',
      rateMatch: 'تقييم لاعبي المباراة', avgRating: 'متوسط التقييم', apps: 'مباريات', print: 'طباعة', offlineReady: 'جاهز للعمل دون اتصال',
      installApp: 'تثبيت التطبيق', goalsFor: 'أهداف مسجلة', goalsAgainst: 'أهداف مستقبلة', winRate: 'نسبة الفوز',
      openLive: 'مركز المباراة', ownGoalShort: 'ع.ن', penShort: 'ج', topScorer: 'الهداف', bestAttack: 'أقوى هجوم',
      bestDefense: 'أقوى دفاع', mostCards: 'الأكثر إنذارات', points2: 'نقطة', deductionApplied: 'خصم نقاط', reasonRequired: 'السبب مطلوب',
      pin: 'PIN', pinHint: 'الرمز الافتراضي: 1234', permissionDenied: 'هذه العملية تتطلب صلاحية المسؤول',
      fanVotes: 'أصوات الجمهور', votes: 'صوت', standingsAfter: 'الترتيب بعد التعادل', tiedTeams: 'الفرق المتعادلة',
      criterion: 'المعيار', decidedBy: 'حُسم عبر', notTied: 'هذا الفريق غير متعادل بالنقاط مع أي فريق آخر',
      miniTable: 'جدول المواجهات المصغّر', clearAudit: 'مسح السجل', exportAudit: 'تصدير السجل', minutesPlayed: 'دقيقة',
      admin_pin_title: 'دخول لوحة الإدارة', reload: 'إعادة تحميل', install: 'تثبيت', offline: 'أنت غير متصل', online: 'عاد الاتصال',
      sampleData: 'البيانات التجريبية', loadSample: 'تحميل البيانات التجريبية', fileTooLarge: 'الملف كبير جداً',
      countries: 'الدولة', referees: 'الحكام', discipline_rules: 'قواعد الانضباط', redCardBan: 'إيقاف الطرد المباشر',
      cleanSheet: 'شباك نظيفة', saves: 'تصديات', perMatch: 'لكل مباراة', motmShort: 'نجم', minutesShort: 'د',
      liveNow: 'مباشر الآن', fulltime: 'نهاية', comingSoon: 'لم تبدأ', matchCenter: 'مركز المباراة', pinChanged: 'تم تغيير رمز PIN',
      pinInvalid: 'يجب أن يكون الرمز 4 أرقام على الأقل', draws: 'تعادلات', losses: 'هزائم', venue: 'الملعب',
      groupStage: 'دور المجموعات', overall: 'الترتيب العام', legend: 'دليل الألوان', recalculated: 'أعيد الحساب', generated: 'تم توليد المباريات',
      quickActions: 'إجراءات سريعة', resetDefaults: 'استعادة الافتراضي', ratingsSaved: 'تم حفظ التقييمات', bestPlayer: 'الأفضل',
      tapForDetails: 'اضغط للتفاصيل'
    },
    en: {
      appName: 'Elite League', home: 'Home', matches: 'Matches', standings: 'Table', stats: 'Stats',
      admin: 'Admin', settings: 'Settings', teams: 'Teams', team: 'Team', discipline: 'Discipline',
      players: 'Players', player: 'Player', season: 'Season', round: 'Round', today: 'Today', upcoming: 'Upcoming',
      past: 'Past', all: 'All', live: 'LIVE', finished: 'FT', scheduled: 'Scheduled', postponed: 'Postponed',
      todayMatches: "Today's Matches", leader: 'Leader', latestResults: 'Latest Results', quickAccess: 'Quick Access',
      noMatchesToday: 'No matches today', viewAll: 'View all', points: 'Points', pts: 'Pts', played: 'P',
      won: 'W', drawn: 'D', lost: 'L', gf: 'GF', ga: 'GA', gd: 'GD', form: 'Form', fairplay: 'Fair Play',
      pos: 'Pos', search: 'Search...', searchTeams: 'Search teams...', searchPlayers: 'Search players...',
      group: 'Group', groupLabel: 'Group', founded: 'Founded', stadium: 'Stadium', coach: 'Coach', referee: 'Referee',
      squad: 'Squad', GK: 'Goalkeepers', DF: 'Defenders', MF: 'Midfielders', FW: 'Forwards',
      GKs: 'GK', DFs: 'DF', MFs: 'MF', FWs: 'FW', age: 'Age', number: 'No.', nationality: 'Nationality',
      teamMatches: 'Team Matches', timeline: 'Timeline', lineups: 'Lineups', matchStats: 'Match Stats',
      possession: 'Possession', shots: 'Shots', shotsOnTarget: 'On Target', corners: 'Corners', fouls: 'Fouls',
      offsides: 'Offsides', yellowCards: 'Yellow Cards', redCards: 'Red Cards', goal: 'Goal', penalty: 'Penalty',
      owngoal: 'Own Goal', yellow: 'Yellow Card', red: 'Red Card', sub: 'Substitution', assist: 'Assist',
      scorers: 'Scorers', assists: 'Assists', keepers: 'Keepers', cleanSheets: 'Clean Sheets', goals: 'Goals',
      cards: 'Cards', suspended: 'Suspended', decisions: 'Committee Decisions', recordedCards: 'Recorded Cards',
      darkMode: 'Dark Mode', language: 'Language', importJson: 'Import JSON', exportJson: 'Export Backup',
      exportPdf: 'Export PDF', clearData: 'Clear Data', version: 'Version', appearance: 'Appearance', data: 'Data',
      about: 'About', dropHere: 'Drop a JSON file here or tap to choose', save: 'Save', cancel: 'Cancel', delete: 'Delete',
      edit: 'Edit', add: 'Add', confirm: 'Confirm', close: 'Close', yes: 'Yes', no: 'No', saved: 'Saved',
      deleted: 'Deleted', error: 'Error', success: 'Done', loading: 'Loading...', empty: 'No data',
      viewerMode: 'Viewer mode', adminMode: 'Admin mode', enterPin: 'Enter PIN', wrongPin: 'Wrong PIN',
      login: 'Login', logout: 'Logout', dashboard: 'Dashboard', manageTeams: 'Teams', managePlayers: 'Players',
      manageMatches: 'Matches', liveEntry: 'Live Entry', leagueSettings: 'League Rules', auditLog: 'Audit Log',
      ratings: 'Ratings', checkUpdates: 'Check for updates', upToDate: 'You are up to date', updateAvailable: 'A data update is available',
      tiebreak: 'Tiebreaker', tiebreakers: 'Tiebreak criteria', h2h: 'Head-to-head', h2hDiff: 'H2H goal diff',
      h2hGoals: 'H2H goals', diff: 'Goal difference', wins: 'Wins', draw: 'Drawing of lots',
      champions: 'Champions League', europa: 'Europa League', relegation: 'Relegation', winPoints: 'Win points',
      drawPoints: 'Draw points', lossPoints: 'Loss points', yellowForSuspension: 'Yellows for suspension',
      resetCardsAfterRounds: 'Reset cards after round', pointsDeduction: 'Points deduction', reason: 'Reason', amount: 'Amount',
      teamOfWeek: 'Team of the Week', playerOfSeason: 'Player of the Season', fanVote: 'Fan Vote', vote: 'Vote',
      voted: 'Your vote was recorded', rating: 'Rating', minute: 'Minute', status: 'Status', date: 'Date', home2: 'Home',
      away: 'Away', score: 'Score', events: 'Events', addEvent: 'Add event', startMatch: 'Start match',
      endMatch: 'End match', generateSchedule: 'Generate schedule', conflicts: 'Conflicts', noConflicts: 'No conflicts',
      matchesCount: 'matches', teamsCount: 'teams', playersCount: 'players', goalsCount: 'goals', vs: 'vs',
      confirmDelete: 'Are you sure you want to delete?', confirmDelete2: 'This is permanent. Type "DELETE" to confirm',
      typeDelete: 'DELETE', confirmClear: 'All local data will be wiped and the sample data reloaded',
      imported: 'Data imported successfully', invalidJson: 'Invalid JSON file', exportDone: 'Exported',
      matchOver: 'Match over', ht: 'Half-time', ft: 'Full-time', ko: 'Kick-off', motm: 'Man of the Match',
      noEvents: 'No events yet', bench: 'Bench', formation: 'Formation', changePin: 'Change PIN',
      newPin: 'New PIN', security: 'Security', storage: 'Storage', lastUpdated: 'Last updated', ban: 'Ban',
      matchesBan: 'matches', fine: 'Fine', cancelBan: 'Cancel ban', addDecision: 'New decision', served: 'Served',
      remaining: 'Remaining', voided: 'Voided (reset)', auto: 'Auto', manual: 'Manual', secondYellow: 'Second yellow',
      accumulation: 'Accumulation', directRed: 'Direct red', nextMatch: 'Next match', none: 'None',
      qualification: 'Qualification', playoff: 'Play-off', apply: 'Apply', reset: 'Reset', name: 'Name', shortName: 'Short name',
      nameEn: 'Name (English)', primaryColor: 'Primary color', secondaryColor: 'Secondary color', logo: 'Logo',
      position: 'Position', birthdate: 'Birthdate', photo: 'Photo', active: 'Active', injured: 'Injured', round2: 'Round',
      homeTeam: 'Home team', awayTeam: 'Away team', homeScore: 'Home goals', awayScore: 'Away goals',
      kickoff: 'Kick-off', selectMatch: 'Select match', type: 'Type', fillRequired: 'Please fill the required fields',
      sameTeams: 'A team cannot play itself', dragToReorder: 'Drag to reorder', doubleRound: 'Home & away',
      startDate: 'Start date', intervalDays: 'Interval (days)', replaceMatches: 'Replace existing matches', generate: 'Generate',
      user: 'User', action: 'Action', entity: 'Entity', time: 'Time', create: 'Create', update: 'Update', remove: 'Delete',
      rateMatch: 'Rate match players', avgRating: 'Avg rating', apps: 'Apps', print: 'Print', offlineReady: 'Ready to work offline',
      installApp: 'Install app', goalsFor: 'Goals scored', goalsAgainst: 'Goals conceded', winRate: 'Win rate',
      openLive: 'Match centre', ownGoalShort: 'OG', penShort: 'P', topScorer: 'Top scorer', bestAttack: 'Best attack',
      bestDefense: 'Best defense', mostCards: 'Most cards', points2: 'pts', deductionApplied: 'Points deducted', reasonRequired: 'Reason is required',
      pin: 'PIN', pinHint: 'Default PIN: 1234', permissionDenied: 'This action requires admin permission',
      fanVotes: 'Fan votes', votes: 'votes', standingsAfter: 'Order after tiebreak', tiedTeams: 'Tied teams',
      criterion: 'Criterion', decidedBy: 'Decided by', notTied: 'This team is not level on points with any other team',
      miniTable: 'Head-to-head mini table', clearAudit: 'Clear log', exportAudit: 'Export log', minutesPlayed: 'min',
      admin_pin_title: 'Admin login', reload: 'Reload', install: 'Install', offline: 'You are offline', online: 'Back online',
      sampleData: 'Sample data', loadSample: 'Load sample data', fileTooLarge: 'File is too large',
      countries: 'Country', referees: 'Referees', discipline_rules: 'Discipline rules', redCardBan: 'Direct red ban',
      cleanSheet: 'Clean sheet', saves: 'Saves', perMatch: 'per match', motmShort: 'Star', minutesShort: "'",
      liveNow: 'Live now', fulltime: 'FT', comingSoon: 'Not started', matchCenter: 'Match Centre', pinChanged: 'PIN changed',
      pinInvalid: 'PIN must be at least 4 digits', draws: 'Draws', losses: 'Losses', venue: 'Venue',
      groupStage: 'Group stage', overall: 'Overall', legend: 'Legend', recalculated: 'Recalculated', generated: 'Schedule generated',
      quickActions: 'Quick actions', resetDefaults: 'Restore defaults', ratingsSaved: 'Ratings saved', bestPlayer: 'Best',
      tapForDetails: 'Tap for details'
    }
  };

  var I18n = {
    lang: 'ar',
    t: function (key) {
      var d = DICT[I18n.lang] || DICT.ar;
      if (d[key] !== undefined) return d[key];
      if (DICT.ar[key] !== undefined) return DICT.ar[key];
      return key;
    },
    setLang: function (lang) {
      I18n.lang = lang === 'en' ? 'en' : 'ar';
      document.documentElement.lang = I18n.lang;
      document.documentElement.dir = I18n.lang === 'ar' ? 'rtl' : 'ltr';
    },
    apply: function (root) {
      var scope = root || document;
      scope.querySelectorAll('[data-i18n]').forEach(function (el) {
        el.textContent = I18n.t(el.getAttribute('data-i18n'));
      });
      scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        el.setAttribute('placeholder', I18n.t(el.getAttribute('data-i18n-placeholder')));
      });
      scope.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
        el.setAttribute('aria-label', I18n.t(el.getAttribute('data-i18n-aria')));
      });
    },
    name: function (entity) {
      if (!entity) return '—';
      if (I18n.lang === 'en' && entity.nameEn) return entity.nameEn;
      return entity.name;
    },
    short: function (entity) {
      if (!entity) return '—';
      if (I18n.lang === 'en' && entity.shortNameEn) return entity.shortNameEn;
      return entity.shortName || entity.name;
    }
  };

  /* ---------------------------------------------------------
     Storage (LocalStorage + IndexedDB snapshots)
     --------------------------------------------------------- */
  var Storage = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('LocalStorage write failed', e);
        return false;
      }
    },
    remove: function (key) {
      try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    },
    _db: null,
    openDB: function () {
      if (Storage._db) return Promise.resolve(Storage._db);
      return new Promise(function (resolve, reject) {
        if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains(DB_STORE)) {
            db.createObjectStore(DB_STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = function () { Storage._db = req.result; resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    },
    idbPut: function (id, data) {
      return Storage.openDB().then(function (db) {
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(DB_STORE, 'readwrite');
          tx.objectStore(DB_STORE).put({ id: id, data: data, savedAt: new Date().toISOString() });
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { reject(tx.error); };
        });
      }).catch(function () { return false; });
    },
    idbGet: function (id) {
      return Storage.openDB().then(function (db) {
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(DB_STORE, 'readonly');
          var req = tx.objectStore(DB_STORE).get(id);
          req.onsuccess = function () { resolve(req.result ? req.result.data : null); };
          req.onerror = function () { reject(req.error); };
        });
      }).catch(function () { return null; });
    },
    idbClear: function () {
      return Storage.openDB().then(function (db) {
        return new Promise(function (resolve) {
          var tx = db.transaction(DB_STORE, 'readwrite');
          tx.objectStore(DB_STORE).clear();
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
        });
      }).catch(function () { return false; });
    },
    usage: function () {
      var total = 0;
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          total += (localStorage.getItem(k) || '').length + k.length;
        }
      } catch (e) { /* ignore */ }
      return total * 2;
    }
  };

  /* ---------------------------------------------------------
     Preferences
     --------------------------------------------------------- */
  var Prefs = {
    _p: null,
    defaults: { theme: 'auto', lang: 'ar', pin: '1234', haptics: true, splashSeen: false, votes: {} },
    load: function () {
      Prefs._p = Object.assign({}, Prefs.defaults, Storage.get(PREFS_KEY, {}));
      return Prefs._p;
    },
    get: function (key) {
      if (!Prefs._p) Prefs.load();
      return Prefs._p[key];
    },
    set: function (key, value) {
      if (!Prefs._p) Prefs.load();
      Prefs._p[key] = value;
      Storage.set(PREFS_KEY, Prefs._p);
    }
  };

  /* ---------------------------------------------------------
     Default Settings & Sample Data Factory
     --------------------------------------------------------- */
  var DEFAULT_SETTINGS = {
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    yellowForSuspension: 3,
    redCardBan: 2,
    resetCardsAfterRounds: 0,
    tiebreakers: ['points', 'h2h', 'h2hDiff', 'h2hGoals', 'diff', 'goals', 'wins', 'fairplay', 'draw'],
    pointsDeduction: [],
    qualificationSpots: { champions: 4, europa: 2, relegation: 3 }
  };

  var Sample = {
    TEAMS: [
      { name: 'النسور الذهبية', nameEn: 'Golden Eagles', shortName: 'النسور', shortNameEn: 'EAG', city: 'صنعاء', stadium: 'ملعب الثورة', stadiumEn: 'Al-Thawra Stadium', p: '#0B4EA2', s: '#FFFFFF', coach: 'أحمد الحربي', founded: 1957 },
      { name: 'الصقور الحمراء', nameEn: 'Red Falcons', shortName: 'الصقور', shortNameEn: 'FAL', city: 'عدن', stadium: 'ملعب 22 مايو', stadiumEn: '22 May Stadium', p: '#C8102E', s: '#FFD700', coach: 'خالد العمري', founded: 1962 },
      { name: 'الأمواج الزرقاء', nameEn: 'Blue Waves', shortName: 'الأمواج', shortNameEn: 'WAV', city: 'الحديدة', stadium: 'ملعب العلفي', stadiumEn: 'Al-Olofi Stadium', p: '#0077B6', s: '#90E0EF', coach: 'سامي النجار', founded: 1970 },
      { name: 'الفرسان', nameEn: 'Knights FC', shortName: 'الفرسان', shortNameEn: 'KNI', city: 'تعز', stadium: 'ملعب الشهداء', stadiumEn: 'Martyrs Stadium', p: '#1B1B1B', s: '#D4AF37', coach: 'منصور القاضي', founded: 1965 },
      { name: 'الأخضر الملكي', nameEn: 'Royal Greens', shortName: 'الأخضر', shortNameEn: 'ROY', city: 'إب', stadium: 'ملعب الكبسي', stadiumEn: 'Al-Kibsi Stadium', p: '#0B6E4F', s: '#F1FAEE', coach: 'ياسر الشامي', founded: 1975 },
      { name: 'نجوم الشرق', nameEn: 'Eastern Stars', shortName: 'النجوم', shortNameEn: 'STA', city: 'المكلا', stadium: 'ملعب بارادم', stadiumEn: 'Baradem Stadium', p: '#6A0DAD', s: '#F4F4F4', coach: 'فهد باوزير', founded: 1980 },
      { name: 'الشعلة', nameEn: 'Al-Shoula', shortName: 'الشعلة', shortNameEn: 'SHO', city: 'عدن', stadium: 'ملعب الحبيشي', stadiumEn: 'Al-Habishi Stadium', p: '#F77F00', s: '#003049', coach: 'رامي الصبري', founded: 1968 },
      { name: 'الوحدة', nameEn: 'Al-Wahda', shortName: 'الوحدة', shortNameEn: 'WAH', city: 'صنعاء', stadium: 'ملعب الظرافي', stadiumEn: 'Al-Dhorafi Stadium', p: '#2A9D8F', s: '#FFFFFF', coach: 'عادل المقطري', founded: 1990 },
      { name: 'التلال', nameEn: 'Al-Tilal', shortName: 'التلال', shortNameEn: 'TIL', city: 'عدن', stadium: 'ملعب التلال', stadiumEn: 'Al-Tilal Ground', p: '#9B2226', s: '#E9D8A6', coach: 'نبيل الحامد', founded: 1905 },
      { name: 'الأهلي', nameEn: 'Al-Ahli', shortName: 'الأهلي', shortNameEn: 'AHL', city: 'صنعاء', stadium: 'ملعب الأهلي', stadiumEn: 'Al-Ahli Ground', p: '#D62828', s: '#FFFFFF', coach: 'مراد الوصابي', founded: 1952 },
      { name: 'شباب الجبل', nameEn: 'Mountain Youth', shortName: 'الجبل', shortNameEn: 'MTN', city: 'ذمار', stadium: 'ملعب ذمار', stadiumEn: 'Dhamar Stadium', p: '#3A5A40', s: '#DAD7CD', coach: 'وليد الحداد', founded: 1984 },
      { name: 'الهلال الساحلي', nameEn: 'Coastal Hilal', shortName: 'الهلال', shortNameEn: 'HIL', city: 'الحديدة', stadium: 'ملعب الساحل', stadiumEn: 'Coastal Arena', p: '#023E8A', s: '#ADE8F4', coach: 'جمال السقاف', founded: 1971 }
    ],
    FIRST: [['محمد', 'Mohammed'], ['أحمد', 'Ahmed'], ['علي', 'Ali'], ['عمر', 'Omar'], ['خالد', 'Khaled'], ['يوسف', 'Yousef'], ['حسن', 'Hassan'], ['إبراهيم', 'Ibrahim'], ['سالم', 'Salem'], ['عبدالله', 'Abdullah'], ['فيصل', 'Faisal'], ['ماجد', 'Majed'], ['طارق', 'Tareq'], ['زياد', 'Ziad'], ['بلال', 'Bilal'], ['أنس', 'Anas'], ['مازن', 'Mazen'], ['هشام', 'Hisham'], ['وائل', 'Wael'], ['نادر', 'Nader'], ['رائد', 'Raed'], ['سيف', 'Saif'], ['حمزة', 'Hamza'], ['عماد', 'Emad']],
    LAST: [['الحسني', 'Al-Hasani'], ['العبسي', 'Al-Absi'], ['الشرعبي', 'Al-Sharabi'], ['المخلافي', 'Al-Mikhlafi'], ['باسنيد', 'Basnid'], ['الصلوي', 'Al-Salwi'], ['القحطاني', 'Al-Qahtani'], ['السروري', 'Al-Sarouri'], ['الزبيدي', 'Al-Zubaidi'], ['العولقي', 'Al-Awlaqi'], ['الجابري', 'Al-Jaberi'], ['الكثيري', 'Al-Kathiri'], ['اليافعي', 'Al-Yafei'], ['البكري', 'Al-Bakri'], ['الهمداني', 'Al-Hamdani'], ['المطري', 'Al-Matari'], ['الأغبري', 'Al-Aghbari'], ['النعماني', 'Al-Nomani'], ['الردفاني', 'Al-Radfani'], ['السقطري', 'Al-Soqotri']],
    NATS: ['YE', 'YE', 'YE', 'YE', 'YE', 'SA', 'EG', 'OM', 'SD', 'JO', 'MA', 'IQ'],
    REFS: ['عبدالرحمن الكاف', 'هاني البعداني', 'نشوان عبيد', 'محمد العامري', 'صالح الحيدري', 'أكرم الصبيحي'],
    POSITIONS: ['GK', 'GK', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'FW', 'FW'],
    NUMBERS: [1, 22, 2, 3, 4, 5, 15, 23, 26, 6, 8, 10, 14, 16, 18, 7, 9, 11, 17, 19],

    build: function () {
      var rnd = Helpers.seededRandom(20261023);
      var now = new Date();
      var data = {
        version: 1,
        updatedAt: new Date().toISOString(),
        league: {
          name: 'دوري النخبة',
          nameEn: 'Elite League',
          season: '2026/2027',
          logo: '',
          country: 'YE',
          settings: Helpers.clone(DEFAULT_SETTINGS)
        },
        teams: [],
        players: [],
        matches: [],
        discipline: [],
        ratings: [],
        auditLog: [],
        fanVotes: []
      };
      data.league.settings.pointsDeduction = [
        { id: 'pd1', teamId: 't11', amount: 3, reason: 'مخالفة لوائح التسجيل', reasonEn: 'Registration breach', date: Helpers.localISO(new Date(now.getTime() - 9 * 86400000)) }
      ];

      Sample.TEAMS.forEach(function (tm, i) {
        var id = 't' + (i + 1);
        data.teams.push({
          id: id, name: tm.name, nameEn: tm.nameEn, shortName: tm.shortName, shortNameEn: tm.shortNameEn,
          logo: '', founded: tm.founded, stadium: tm.stadium, stadiumEn: tm.stadiumEn, city: tm.city,
          colors: { primary: tm.p, secondary: tm.s }, coach: tm.coach, group: i < 6 ? 'A' : 'B'
        });
        for (var j = 0; j < 20; j++) {
          var fi = Math.floor(rnd() * Sample.FIRST.length);
          var li = Math.floor(rnd() * Sample.LAST.length);
          var year = 1992 + Math.floor(rnd() * 14);
          var month = 1 + Math.floor(rnd() * 12);
          var day = 1 + Math.floor(rnd() * 28);
          data.players.push({
            id: 'p' + (i * 20 + j + 1),
            teamId: id,
            name: Sample.FIRST[fi][0] + ' ' + Sample.LAST[li][0],
            nameEn: Sample.FIRST[fi][1] + ' ' + Sample.LAST[li][1],
            number: Sample.NUMBERS[j],
            position: Sample.POSITIONS[j],
            birthdate: year + '-' + Helpers.pad(month) + '-' + Helpers.pad(day),
            nationality: Sample.NATS[Math.floor(rnd() * Sample.NATS.length)],
            photo: '',
            status: rnd() < 0.05 ? 'injured' : 'active'
          });
        }
      });

      var ids = data.teams.map(function (t) { return t.id; });
      var rounds = Engines.Scheduler.roundRobinPairs(ids);
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var roundOffsets = [-21, -14, -7, 0, 7];
      var times = [[15, 0], [17, 30], [17, 30], [20, 0], [20, 0], [21, 30]];
      var mid = 1;
      for (var r = 0; r < 5; r++) {
        rounds[r].forEach(function (pair, k) {
          var d = new Date(today.getTime() + roundOffsets[r] * 86400000);
          var tm = times[k];
          if (r === 3) {
            var mins = [-200, -50, -20, 90, 180, 300][k];
            d = new Date(now.getTime() + mins * 60000);
            d.setSeconds(0, 0);
          } else {
            d.setHours(tm[0], tm[1], 0, 0);
          }
          var home = data.teams.find(function (t) { return t.id === pair[0]; });
          var m = {
            id: 'm' + mid,
            round: r + 1,
            homeTeamId: pair[0],
            awayTeamId: pair[1],
            date: Helpers.localISO(d),
            stadium: home.stadium,
            referee: Sample.REFS[(mid + r) % Sample.REFS.length],
            status: 'scheduled',
            score: { home: 0, away: 0 },
            events: [],
            lineups: null,
            stats: null
          };
          mid++;
          var state = 'scheduled';
          if (r < 3) state = 'finished';
          if (r === 3) {
            if (k === 0) state = 'finished';
            else if (k === 1 || k === 2) state = 'live';
          }
          Sample.simulate(m, data, rnd, state, now);
          data.matches.push(m);
        });
      }

      data.discipline.push({
        id: 'd1', playerId: 'p47', teamId: 't3', type: 'ban', matches: 1,
        reason: 'سلوك غير رياضي تجاه الحكم', reasonEn: 'Unsporting behaviour toward referee',
        date: Helpers.localISO(new Date(now.getTime() - 6 * 86400000)), createdBy: 'admin'
      });
      data.discipline.push({
        id: 'd2', playerId: 'p130', teamId: 't7', type: 'fine', amount: 500,
        reason: 'تأخر عن موعد المباراة', reasonEn: 'Late arrival to match',
        date: Helpers.localISO(new Date(now.getTime() - 4 * 86400000)), createdBy: 'admin'
      });

      data.auditLog.push({
        id: 'a1', at: new Date(now.getTime() - 3600000).toISOString(), user: 'system',
        action: 'create', entity: 'league', entityId: 'league', summary: 'تهيئة البيانات التجريبية'
      });
      return data;
    },

    pickLineup: function (data, teamId, rnd) {
      var squad = data.players.filter(function (p) { return p.teamId === teamId && p.status === 'active'; });
      var byPos = Helpers.groupBy(squad, function (p) { return p.position; });
      var need = { GK: 1, DF: 4, MF: 3, FW: 3 };
      var starters = [];
      var bench = [];
      ['GK', 'DF', 'MF', 'FW'].forEach(function (pos) {
        var list = (byPos[pos] || []).slice();
        list.sort(function () { return rnd() - 0.5; });
        list.forEach(function (p, i) {
          if (i < need[pos]) starters.push(p.id);
          else bench.push(p.id);
        });
      });
      return { formation: '4-3-3', starters: starters, bench: bench.slice(0, 9) };
    },

    simulate: function (m, data, rnd, state, now) {
      m.lineups = {
        home: Sample.pickLineup(data, m.homeTeamId, rnd),
        away: Sample.pickLineup(data, m.awayTeamId, rnd)
      };
      if (state === 'scheduled') {
        m.status = 'scheduled';
        return;
      }
      var maxMinute = 90;
      if (state === 'live') {
        var elapsed = Math.floor((now.getTime() - new Date(m.date).getTime()) / 60000);
        maxMinute = Helpers.clamp(elapsed > 45 ? elapsed - 15 : elapsed, 1, 90);
        m.minute = maxMinute;
      }
      m.status = state;
      var homeGoals = Math.floor(rnd() * 3.2 + (rnd() < 0.3 ? 1 : 0));
      var awayGoals = Math.floor(rnd() * 2.6);
      homeGoals = Math.round(homeGoals * maxMinute / 90);
      awayGoals = Math.round(awayGoals * maxMinute / 90);
      var events = [];
      function pickFrom(list, filterPos) {
        var pool = list.filter(function (id) {
          var p = data.players.find(function (x) { return x.id === id; });
          return !filterPos || filterPos.indexOf(p.position) !== -1;
        });
        return pool[Math.floor(rnd() * pool.length)];
      }
      function addGoals(count, side) {
        var lineup = m.lineups[side];
        var teamId = side === 'home' ? m.homeTeamId : m.awayTeamId;
        for (var g = 0; g < count; g++) {
          var minute = 1 + Math.floor(rnd() * maxMinute);
          var roll = rnd();
          var scorer = pickFrom(lineup.starters, rnd() < 0.7 ? ['FW', 'MF'] : ['DF', 'MF', 'FW']);
          var type = 'goal';
          if (roll < 0.1) type = 'penalty';
          if (roll > 0.95) {
            var oppSide = side === 'home' ? 'away' : 'home';
            events.push({ id: Helpers.uid('e'), type: 'owngoal', minute: minute, teamId: teamId, playerId: pickFrom(m.lineups[oppSide].starters, ['DF']) });
            continue;
          }
          var assist = null;
          if (type === 'goal' && rnd() < 0.75) {
            assist = pickFrom(lineup.starters.filter(function (id) { return id !== scorer; }), ['MF', 'FW', 'DF']);
          }
          events.push({ id: Helpers.uid('e'), type: type, minute: minute, teamId: teamId, playerId: scorer, assistId: assist });
        }
      }
      addGoals(homeGoals, 'home');
      addGoals(awayGoals, 'away');
      ['home', 'away'].forEach(function (side) {
        var teamId = side === 'home' ? m.homeTeamId : m.awayTeamId;
        var lineup = m.lineups[side];
        var yc = Math.floor(rnd() * 3.5 * maxMinute / 90);
        var booked = {};
        for (var y = 0; y < yc; y++) {
          var pid = pickFrom(lineup.starters, ['DF', 'MF', 'FW']);
          var minute = 5 + Math.floor(rnd() * (maxMinute - 4));
          if (booked[pid]) {
            if (rnd() < 0.6) continue;
            events.push({ id: Helpers.uid('e'), type: 'yellow', minute: Math.max(minute, booked[pid] + 1), teamId: teamId, playerId: pid });
            events.push({ id: Helpers.uid('e'), type: 'red', minute: Math.max(minute, booked[pid] + 1), teamId: teamId, playerId: pid, auto: true });
            continue;
          }
          booked[pid] = minute;
          events.push({ id: Helpers.uid('e'), type: 'yellow', minute: minute, teamId: teamId, playerId: pid });
        }
        if (rnd() < 0.06 * maxMinute / 90) {
          events.push({ id: Helpers.uid('e'), type: 'red', minute: 30 + Math.floor(rnd() * 55), teamId: teamId, playerId: pickFrom(lineup.starters, ['DF', 'MF']) });
        }
        if (maxMinute > 60) {
          for (var s = 0; s < 3; s++) {
            var outId = pickFrom(lineup.starters, ['MF', 'FW', 'DF']);
            var inId = lineup.bench[s + 1];
            if (inId && outId) events.push({ id: Helpers.uid('e'), type: 'sub', minute: 58 + Math.floor(rnd() * (maxMinute - 58)), teamId: teamId, playerId: inId, playerOutId: outId });
          }
        }
      });
      events.sort(function (a, b) { return a.minute - b.minute; });
      m.events = events;
      m.score = Core.computeScore(m);
      var hp = 38 + Math.floor(rnd() * 25);
      m.stats = {
        possession: { home: hp, away: 100 - hp },
        shots: { home: m.score.home * 2 + 4 + Math.floor(rnd() * 8), away: m.score.away * 2 + 3 + Math.floor(rnd() * 7) },
        shotsOnTarget: { home: m.score.home + 1 + Math.floor(rnd() * 4), away: m.score.away + 1 + Math.floor(rnd() * 3) },
        corners: { home: Math.floor(rnd() * 9), away: Math.floor(rnd() * 8) },
        fouls: { home: 6 + Math.floor(rnd() * 10), away: 6 + Math.floor(rnd() * 10) },
        offsides: { home: Math.floor(rnd() * 5), away: Math.floor(rnd() * 5) }
      };
    }
  };

  /* ---------------------------------------------------------
     Validator
     --------------------------------------------------------- */
  var Validator = {
    validate: function (data) {
      var errors = [];
      var warnings = [];
      var ar = I18n.lang === 'ar';
      function err(msgAr, msgEn) { errors.push(ar ? msgAr : msgEn); }
      function warn(msgAr, msgEn) { warnings.push(ar ? msgAr : msgEn); }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        err('الملف لا يحتوي على كائن JSON صالح', 'File does not contain a valid JSON object');
        return { valid: false, errors: errors, warnings: warnings };
      }
      if (typeof data.version !== 'number') warn('حقل version مفقود — سيتم اعتباره 1', 'Missing version — assuming 1');
      if (!data.league || typeof data.league !== 'object') {
        err('حقل league مفقود', 'Missing "league" object');
      } else {
        if (!data.league.name) err('اسم البطولة league.name مطلوب', 'league.name is required');
        if (!data.league.season) warn('الموسم league.season غير محدد', 'league.season is not set');
      }
      ['teams', 'players', 'matches'].forEach(function (k) {
        if (!Array.isArray(data[k])) err('الحقل ' + k + ' يجب أن يكون مصفوفة', '"' + k + '" must be an array');
      });
      if (errors.length) return { valid: false, errors: errors, warnings: warnings };

      var teamIds = {};
      data.teams.forEach(function (t, i) {
        if (!t.id) err('الفريق رقم ' + (i + 1) + ' بدون id', 'Team #' + (i + 1) + ' has no id');
        else if (teamIds[t.id]) err('معرّف فريق مكرر: ' + t.id, 'Duplicate team id: ' + t.id);
        teamIds[t.id] = true;
        if (!t.name) err('الفريق ' + (t.id || i + 1) + ' بدون اسم', 'Team ' + (t.id || i + 1) + ' has no name');
        if (t.colors && t.colors.primary && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t.colors.primary)) {
          warn('لون غير صالح للفريق ' + t.id, 'Invalid color for team ' + t.id);
        }
      });
      var playerIds = {};
      var VALID_POS = ['GK', 'DF', 'MF', 'FW'];
      data.players.forEach(function (p, i) {
        if (!p.id) err('اللاعب رقم ' + (i + 1) + ' بدون id', 'Player #' + (i + 1) + ' has no id');
        else if (playerIds[p.id]) err('معرّف لاعب مكرر: ' + p.id, 'Duplicate player id: ' + p.id);
        playerIds[p.id] = true;
        if (!teamIds[p.teamId]) err('اللاعب ' + (p.id || i + 1) + ' مرتبط بفريق غير موجود: ' + p.teamId, 'Player ' + (p.id || i + 1) + ' references missing team: ' + p.teamId);
        if (p.position && VALID_POS.indexOf(p.position) === -1) warn('مركز غير معروف للاعب ' + p.id + ': ' + p.position, 'Unknown position for ' + p.id + ': ' + p.position);
      });
      var matchIds = {};
      var VALID_STATUS = ['scheduled', 'live', 'finished', 'postponed'];
      var VALID_EVENTS = ['goal', 'penalty', 'owngoal', 'yellow', 'red', 'sub'];
      data.matches.forEach(function (m, i) {
        var label = m.id || ('#' + (i + 1));
        if (!m.id) err('المباراة رقم ' + (i + 1) + ' بدون id', 'Match #' + (i + 1) + ' has no id');
        else if (matchIds[m.id]) err('معرّف مباراة مكرر: ' + m.id, 'Duplicate match id: ' + m.id);
        matchIds[m.id] = true;
        if (!teamIds[m.homeTeamId]) err('المباراة ' + label + ': الفريق المضيف غير موجود', 'Match ' + label + ': home team not found');
        if (!teamIds[m.awayTeamId]) err('المباراة ' + label + ': الفريق الضيف غير موجود', 'Match ' + label + ': away team not found');
        if (m.homeTeamId && m.homeTeamId === m.awayTeamId) err('المباراة ' + label + ': نفس الفريق في الطرفين', 'Match ' + label + ': same team on both sides');
        if (m.date && isNaN(new Date(m.date).getTime())) err('المباراة ' + label + ': تاريخ غير صالح', 'Match ' + label + ': invalid date');
        if (m.status && VALID_STATUS.indexOf(m.status) === -1) err('المباراة ' + label + ': حالة غير معروفة ' + m.status, 'Match ' + label + ': unknown status ' + m.status);
        if (m.status === 'finished' && (!m.score || typeof m.score.home !== 'number' || typeof m.score.away !== 'number')) {
          err('المباراة ' + label + ': منتهية بدون نتيجة رقمية', 'Match ' + label + ': finished without a numeric score');
        }
        (m.events || []).forEach(function (e, j) {
          if (VALID_EVENTS.indexOf(e.type) === -1) warn('المباراة ' + label + ': نوع حدث غير معروف ' + e.type, 'Match ' + label + ': unknown event type ' + e.type);
          if (e.playerId && !playerIds[e.playerId]) warn('المباراة ' + label + ': الحدث ' + (j + 1) + ' يشير للاعب غير موجود', 'Match ' + label + ': event ' + (j + 1) + ' references missing player');
        });
      });
      return { valid: errors.length === 0, errors: errors, warnings: warnings };
    }
  };

  /* ---------------------------------------------------------
     Normalizer (fills defaults on any imported data)
     --------------------------------------------------------- */
  function normalize(data) {
    data.version = data.version || 1;
    data.updatedAt = data.updatedAt || new Date().toISOString();
    data.league = data.league || { name: 'League', season: '' };
    data.league.settings = Object.assign({}, Helpers.clone(DEFAULT_SETTINGS), data.league.settings || {});
    data.league.settings.qualificationSpots = Object.assign({}, DEFAULT_SETTINGS.qualificationSpots, data.league.settings.qualificationSpots || {});
    if (!Array.isArray(data.league.settings.pointsDeduction)) data.league.settings.pointsDeduction = [];
    if (!Array.isArray(data.league.settings.tiebreakers) || !data.league.settings.tiebreakers.length) {
      data.league.settings.tiebreakers = DEFAULT_SETTINGS.tiebreakers.slice();
    }
    if (data.league.settings.tiebreakers[0] !== 'points') {
      data.league.settings.tiebreakers = ['points'].concat(data.league.settings.tiebreakers.filter(function (c) { return c !== 'points'; }));
    }
    ['teams', 'players', 'matches', 'discipline', 'ratings', 'auditLog', 'fanVotes'].forEach(function (k) {
      if (!Array.isArray(data[k])) data[k] = [];
    });
    data.teams.forEach(function (t) {
      t.colors = t.colors || { primary: Helpers.hashColor(t.name), secondary: '#FFFFFF' };
      t.group = t.group || 'A';
      t.shortName = t.shortName || t.name;
    });
    data.players.forEach(function (p) {
      p.status = p.status || 'active';
      p.position = p.position || 'MF';
    });
    data.matches.forEach(function (m) {
      m.status = m.status || 'scheduled';
      m.events = Array.isArray(m.events) ? m.events : [];
      m.score = m.score || { home: 0, away: 0 };
      m.round = Number(m.round) || 1;
    });
    return data;
  }

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  var listeners = [];
  var State = {
    data: null,
    ready: false,
    init: function () {
      var stored = Storage.get(STORAGE_KEY, null);
      if (stored && stored.league) {
        State.data = normalize(stored);
        State.ready = true;
        return Promise.resolve(State.data);
      }
      return Storage.idbGet('latest').then(function (snap) {
        if (snap && snap.league) {
          State.data = normalize(snap);
          Storage.set(STORAGE_KEY, State.data);
          State.ready = true;
          return State.data;
        }
        return State.loadSample();
      });
    },
    loadSample: function () {
      return fetch('data/sample-league.json', { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (json) {
          var v = Validator.validate(json);
          if (!v.valid) throw new Error(v.errors.join('\n'));
          return Sample.rebase(json);
        })
        .catch(function () {
          return Sample.build();
        })
        .then(function (data) {
          State.data = normalize(data);
          State.persist(true);
          State.ready = true;
          return State.data;
        });
    },
    persist: function (silent) {
      State.data.updatedAt = new Date().toISOString();
      Storage.set(STORAGE_KEY, State.data);
      Storage.idbPut('latest', State.data);
      if (!silent) State.emit();
    },
    replace: function (data) {
      State.data = normalize(data);
      State.persist();
    },
    emit: function () {
      listeners.forEach(function (fn) {
        try { fn(State.data); } catch (e) { console.error(e); }
      });
    },
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i !== -1) listeners.splice(i, 1);
      };
    }
  };

  /* Sample date rebasing: shifts static JSON dates so the demo always looks "current" */
  Sample.rebase = function (json) {
    if (!json.meta || !json.meta.anchorDate) return json;
    var anchor = new Date(json.meta.anchorDate).getTime();
    var shift = Date.now() - anchor;
    json.matches.forEach(function (m) {
      if (m.date) {
        var d = new Date(new Date(m.date).getTime() + shift);
        m.date = Helpers.localISO(d);
      }
      if (m.status === 'live' && typeof m.minute === 'number') {
        var el = Math.floor((Date.now() - new Date(m.date).getTime()) / 60000);
        m.minute = Helpers.clamp(el > 45 ? el - 15 : el, 1, 90);
      }
    });
    (json.discipline || []).forEach(function (d) {
      if (d.date) d.date = Helpers.localISO(new Date(new Date(d.date).getTime() + shift));
    });
    ((json.league && json.league.settings && json.league.settings.pointsDeduction) || []).forEach(function (d) {
      if (d.date) d.date = Helpers.localISO(new Date(new Date(d.date).getTime() + shift));
    });
    delete json.meta;
    return json;
  };

  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        State.data = normalize(JSON.parse(e.newValue));
        State.emit();
      } catch (err) { /* ignore */ }
    }
  });

  /* ---------------------------------------------------------
     Permissions
     --------------------------------------------------------- */
  var Permissions = {
    isAdmin: function () {
      var s = Storage.get(SESSION_KEY, null);
      if (!s || !s.admin) return false;
      if (Date.now() - s.at > 12 * 3600 * 1000) {
        Storage.remove(SESSION_KEY);
        return false;
      }
      return true;
    },
    login: function (pin) {
      if (String(pin) === String(Prefs.get('pin'))) {
        Storage.set(SESSION_KEY, { admin: true, at: Date.now() });
        Audit.log('login', 'session', 'admin', I18n.lang === 'ar' ? 'تسجيل دخول المسؤول' : 'Admin login');
        return true;
      }
      return false;
    },
    logout: function () {
      Audit.log('logout', 'session', 'admin', I18n.lang === 'ar' ? 'تسجيل خروج المسؤول' : 'Admin logout');
      Storage.remove(SESSION_KEY);
    },
    require: function () {
      if (!Permissions.isAdmin()) {
        throw new Error(I18n.t('permissionDenied'));
      }
    },
    changePin: function (newPin) {
      if (!/^\d{4,8}$/.test(String(newPin))) return false;
      Prefs.set('pin', String(newPin));
      Audit.log('update', 'security', 'pin', I18n.lang === 'ar' ? 'تغيير رمز PIN' : 'PIN changed');
      return true;
    }
  };

  /* ---------------------------------------------------------
     Audit
     --------------------------------------------------------- */
  var Audit = {
    log: function (action, entity, entityId, summary, diff) {
      if (!State.data) return;
      State.data.auditLog.unshift({
        id: Helpers.uid('a'),
        at: new Date().toISOString(),
        user: Permissions.isAdmin() ? 'admin' : 'viewer',
        action: action,
        entity: entity,
        entityId: entityId,
        summary: summary || '',
        diff: diff || null
      });
      if (State.data.auditLog.length > 1000) State.data.auditLog.length = 1000;
      State.persist(true);
    },
    list: function () { return State.data ? State.data.auditLog : []; },
    clear: function () {
      Permissions.require();
      State.data.auditLog = [];
      Audit.log('remove', 'audit', 'all', I18n.lang === 'ar' ? 'مسح سجل التعديلات' : 'Audit log cleared');
    }
  };

  function diffObjects(before, after) {
    var out = {};
    var keys = {};
    Object.keys(before || {}).forEach(function (k) { keys[k] = true; });
    Object.keys(after || {}).forEach(function (k) { keys[k] = true; });
    Object.keys(keys).forEach(function (k) {
      if (k === 'events' || k === 'lineups' || k === 'stats') return;
      var a = JSON.stringify(before ? before[k] : undefined);
      var b = JSON.stringify(after ? after[k] : undefined);
      if (a !== b) out[k] = { from: before ? before[k] : undefined, to: after ? after[k] : undefined };
    });
    return out;
  }

  /* ---------------------------------------------------------
     CRUD
     --------------------------------------------------------- */
  function makeCrud(collection, prefix, labelFn) {
    return {
      all: function () { return State.data ? State.data[collection] : []; },
      get: function (id) {
        if (!State.data) return null;
        return State.data[collection].find(function (x) { return x.id === id; }) || null;
      },
      create: function (obj) {
        Permissions.require();
        var item = Object.assign({}, obj);
        if (!item.id) item.id = Helpers.uid(prefix);
        State.data[collection].push(item);
        Audit.log('create', collection, item.id, labelFn(item), diffObjects(null, item));
        State.persist();
        return item;
      },
      update: function (id, patch) {
        Permissions.require();
        var list = State.data[collection];
        var idx = list.findIndex(function (x) { return x.id === id; });
        if (idx === -1) return null;
        var before = Helpers.clone(list[idx]);
        list[idx] = Object.assign({}, list[idx], patch);
        Audit.log('update', collection, id, labelFn(list[idx]), diffObjects(before, list[idx]));
        State.persist();
        return list[idx];
      },
      remove: function (id) {
        Permissions.require();
        var list = State.data[collection];
        var idx = list.findIndex(function (x) { return x.id === id; });
        if (idx === -1) return false;
        var removed = list.splice(idx, 1)[0];
        Audit.log('remove', collection, id, labelFn(removed), diffObjects(removed, null));
        State.persist();
        return true;
      }
    };
  }

  var Teams = makeCrud('teams', 't', function (t) { return t.name; });
  var Players = makeCrud('players', 'p', function (p) { return p.name + ' #' + p.number; });
  var Matches = makeCrud('matches', 'm', function (m) {
    var h = Teams.get(m.homeTeamId);
    var a = Teams.get(m.awayTeamId);
    return (h ? h.shortName : '?') + ' ' + (m.score ? m.score.home : 0) + ' - ' + (m.score ? m.score.away : 0) + ' ' + (a ? a.shortName : '?');
  });
  var Decisions = makeCrud('discipline', 'd', function (d) {
    var p = Players.get(d.playerId);
    return (p ? p.name : '?') + ' — ' + d.type;
  });

  var _teamRemove = Teams.remove;
  Teams.remove = function (id) {
    Permissions.require();
    State.data.players = State.data.players.filter(function (p) { return p.teamId !== id; });
    State.data.matches = State.data.matches.filter(function (m) { return m.homeTeamId !== id && m.awayTeamId !== id; });
    return _teamRemove(id);
  };

  Teams.squad = function (teamId) {
    return State.data.players.filter(function (p) { return p.teamId === teamId; })
      .sort(function (a, b) { return a.number - b.number; });
  };
  Teams.matches = function (teamId) {
    return State.data.matches.filter(function (m) { return m.homeTeamId === teamId || m.awayTeamId === teamId; })
      .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  };

  Matches.sorted = function () {
    return State.data.matches.slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  };
  Matches.addEvent = function (matchId, ev) {
    Permissions.require();
    var m = Matches.get(matchId);
    if (!m) return null;
    var e = Object.assign({ id: Helpers.uid('e') }, ev);
    e.minute = Number(e.minute) || 0;
    m.events.push(e);
    var autoRed = null;
    if (e.type === 'yellow') {
      var yellows = m.events.filter(function (x) { return x.type === 'yellow' && x.playerId === e.playerId; }).length;
      var hasRed = m.events.some(function (x) { return x.type === 'red' && x.playerId === e.playerId; });
      if (yellows >= 2 && !hasRed) {
        autoRed = { id: Helpers.uid('e'), type: 'red', minute: e.minute, teamId: e.teamId, playerId: e.playerId, auto: true };
        m.events.push(autoRed);
      }
    }
    m.events.sort(function (a, b) { return a.minute - b.minute; });
    m.score = Core.computeScore(m);
    if (m.status === 'scheduled') m.status = 'live';
    if (typeof m.minute !== 'number' || e.minute > m.minute) {
      m.minute = e.minute;
      m.minuteSetAt = new Date().toISOString();
    }
    var p = Players.get(e.playerId);
    Audit.log('create', 'events', e.id, (p ? p.name : '') + ' — ' + I18n.t(e.type) + ' ' + e.minute + "'");
    State.persist();
    return { event: e, autoRed: autoRed };
  };
  Matches.removeEvent = function (matchId, eventId) {
    Permissions.require();
    var m = Matches.get(matchId);
    if (!m) return false;
    var ev = m.events.find(function (x) { return x.id === eventId; });
    m.events = m.events.filter(function (x) { return x.id !== eventId; });
    if (ev && ev.type === 'yellow') {
      var remainingY = m.events.filter(function (x) { return x.type === 'yellow' && x.playerId === ev.playerId; }).length;
      if (remainingY < 2) m.events = m.events.filter(function (x) { return !(x.type === 'red' && x.auto && x.playerId === ev.playerId); });
    }
    m.score = Core.computeScore(m);
    Audit.log('remove', 'events', eventId, I18n.t(ev ? ev.type : 'events'));
    State.persist();
    return true;
  };
  Matches.setStatus = function (matchId, status, minute) {
    Permissions.require();
    var m = Matches.get(matchId);
    if (!m) return null;
    var before = m.status;
    m.status = status;
    if (typeof minute === 'number') m.minute = minute;
    if (status === 'live') {
      if (typeof m.minute !== 'number') m.minute = 1;
      m.minuteSetAt = new Date().toISOString();
    }
    if (status === 'finished') m.minute = 90;
    if (!m.lineups) {
      m.lineups = {
        home: Sample.pickLineup(State.data, m.homeTeamId, Helpers.seededRandom(Helpers.hashNum(m.id + 'h'))),
        away: Sample.pickLineup(State.data, m.awayTeamId, Helpers.seededRandom(Helpers.hashNum(m.id + 'a')))
      };
    }
    Audit.log('update', 'matches', matchId, before + ' → ' + status);
    State.persist();
    return m;
  };

  var League = {
    get: function () { return State.data.league; },
    settings: function () { return State.data.league.settings; },
    update: function (patch) {
      Permissions.require();
      var before = Helpers.clone(State.data.league);
      Object.assign(State.data.league, patch);
      Audit.log('update', 'league', 'league', I18n.lang === 'ar' ? 'تعديل بيانات البطولة' : 'League info updated', diffObjects(before, State.data.league));
      State.persist();
    },
    updateSettings: function (patch) {
      Permissions.require();
      var before = Helpers.clone(State.data.league.settings);
      Object.assign(State.data.league.settings, patch);
      Audit.log('update', 'settings', 'league', I18n.lang === 'ar' ? 'تعديل قواعد البطولة' : 'League rules updated', diffObjects(before, State.data.league.settings));
      State.persist();
    },
    addDeduction: function (d) {
      Permissions.require();
      var item = Object.assign({ id: Helpers.uid('pd'), date: Helpers.localISO(new Date()) }, d);
      item.amount = Number(item.amount) || 0;
      State.data.league.settings.pointsDeduction.push(item);
      var t = Teams.get(item.teamId);
      Audit.log('create', 'deduction', item.id, (t ? t.name : '') + ' −' + item.amount + ' · ' + item.reason);
      State.persist();
      return item;
    },
    removeDeduction: function (id) {
      Permissions.require();
      State.data.league.settings.pointsDeduction = State.data.league.settings.pointsDeduction.filter(function (d) { return d.id !== id; });
      Audit.log('remove', 'deduction', id, I18n.lang === 'ar' ? 'إلغاء خصم نقاط' : 'Deduction removed');
      State.persist();
    }
  };

  var Ratings = {
    set: function (matchId, playerId, rating) {
      Permissions.require();
      var list = State.data.ratings;
      var r = list.find(function (x) { return x.matchId === matchId && x.playerId === playerId; });
      var val = Helpers.clamp(Number(rating) || 0, 1, 10);
      if (r) r.rating = val;
      else list.push({ id: Helpers.uid('r'), matchId: matchId, playerId: playerId, rating: val });
    },
    commit: function (matchId) {
      Audit.log('update', 'ratings', matchId, I18n.t('ratingsSaved'));
      State.persist();
    },
    vote: function (matchId, playerId) {
      var votes = Prefs.get('votes') || {};
      if (votes[matchId]) return false;
      var voterId = Prefs.get('voterId');
      if (!voterId) { voterId = Helpers.uid('v'); Prefs.set('voterId', voterId); }
      State.data.fanVotes.push({ id: Helpers.uid('fv'), matchId: matchId, playerId: playerId, voterId: voterId, at: new Date().toISOString() });
      votes[matchId] = playerId;
      Prefs.set('votes', votes);
      State.persist();
      return true;
    },
    myVote: function (matchId) {
      var votes = Prefs.get('votes') || {};
      return votes[matchId] || null;
    }
  };

  /* ---------------------------------------------------------
     Importer / Exporter
     --------------------------------------------------------- */
  var Importer = {
    MAX_SIZE: 15 * 1024 * 1024,
    fromText: function (text) {
      var json;
      try { json = JSON.parse(text); } catch (e) {
        return { ok: false, errors: [I18n.t('invalidJson') + ': ' + e.message], warnings: [] };
      }
      var v = Validator.validate(json);
      if (!v.valid) return { ok: false, errors: v.errors, warnings: v.warnings };
      return { ok: true, data: json, errors: [], warnings: v.warnings };
    },
    fromFile: function (file) {
      if (file.size > Importer.MAX_SIZE) return Promise.resolve({ ok: false, errors: [I18n.t('fileTooLarge')], warnings: [] });
      return Helpers.readFile(file).then(Importer.fromText);
    },
    apply: function (data) {
      Storage.idbPut('before-import-' + Date.now(), State.data);
      State.replace(data);
      Audit.log('create', 'import', 'json', (I18n.lang === 'ar' ? 'استيراد ملف: ' : 'Imported file: ') + data.league.name);
    }
  };

  var Exporter = {
    json: function () {
      var data = Helpers.clone(State.data);
      data.updatedAt = new Date().toISOString();
      var name = 'league-backup-' + Helpers.localISO(new Date()).slice(0, 10) + '.json';
      Helpers.download(name, JSON.stringify(data, null, 2), 'application/json');
      Audit.log('create', 'export', 'json', name);
    },
    csv: function (rows, filename) {
      var csv = rows.map(function (r) {
        return r.map(function (c) {
          var s = String(c === null || c === undefined ? '' : c);
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        }).join(',');
      }).join('\n');
      Helpers.download(filename, '\uFEFF' + csv, 'text/csv;charset=utf-8');
    }
  };

  /* ---------------------------------------------------------
     Core helpers on data
     --------------------------------------------------------- */
  var Core = {
    VERSION: APP_VERSION,
    STORAGE_KEY: STORAGE_KEY,
    Helpers: Helpers,
    I18n: I18n,
    t: I18n.t,
    Storage: Storage,
    Prefs: Prefs,
    State: State,
    Permissions: Permissions,
    Audit: Audit,
    Validator: Validator,
    Importer: Importer,
    Exporter: Exporter,
    Teams: Teams,
    Players: Players,
    Matches: Matches,
    Decisions: Decisions,
    League: League,
    Ratings: Ratings,
    Sample: Sample,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    normalize: normalize,
    computeScore: function (m) {
      var hasGoalEvents = (m.events || []).some(function (e) { return e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal'; });
      if (!hasGoalEvents) {
        if (m.status === 'scheduled') return { home: 0, away: 0 };
        return m.score || { home: 0, away: 0 };
      }
      var s = { home: 0, away: 0 };
      (m.events || []).forEach(function (e) {
        if (e.type === 'goal' || e.type === 'penalty' || e.type === 'owngoal') {
          if (e.teamId === m.homeTeamId) s.home++;
          else if (e.teamId === m.awayTeamId) s.away++;
        }
      });
      return s;
    },
    liveMinute: function (m) {
      if (m.status !== 'live') return null;
      if (typeof m.minute === 'number' && m.minuteSetAt) {
        var extra = Math.floor((Date.now() - new Date(m.minuteSetAt).getTime()) / 60000);
        return Helpers.clamp(m.minute + extra, 1, 120);
      }
      var el = Math.floor((Date.now() - new Date(m.date).getTime()) / 60000);
      if (el <= 0) return m.minute || 1;
      if (el > 45 && el <= 60) return 'HT';
      var min = el > 60 ? el - 15 : el;
      return Helpers.clamp(Math.max(min, m.minute || 1), 1, 90);
    },
    teamName: function (id) { return I18n.name(Teams.get(id)); },
    teamShort: function (id) { return I18n.short(Teams.get(id)); },
    playerName: function (id) { return I18n.name(Players.get(id)); },
    hasData: function () { return !!(State.data && State.data.teams.length); }
  };

  global.Core = Core;
  global.I18n = I18n;
  global.Helpers = Helpers;
})(window);
