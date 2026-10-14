/* ============================================================
   CORE.JS — الطبقة الأساسية
   Storage | State | Router | CRUD | Audit | Permissions | Validator
   Importer | Exporter | Helpers | UpdateChecker | Sync | Lifecycle
   ============================================================ */

(function (window) {
  'use strict';

  /* ============================================================
     STORAGE MANAGER
     ============================================================ */

  const DB_NAME = 'league-manager-db';
  const DB_VERSION = 1;
  const DB_STORE = 'league';
  const LS_KEY = 'lm-league';
  const LS_AUDIT = 'lm-audit';
  const LS_THEME = 'lm-theme';
  const LS_LANG = 'lm-language';
  const LS_ROLE = 'lm-role';
  const LS_PIN = 'lm-admin-pin';

  const Storage = {
    db: null,

    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
      } catch (e) {
        console.warn('[Storage] LocalStorage limit reached:', e);
        return null;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        /* ignore */
      }
    },

    openDB() {
      if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB unavailable'));
      if (this.db) return Promise.resolve(this.db);

      return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains(DB_STORE)) {
            req.result.createObjectStore(DB_STORE);
          }
        };
        req.onsuccess = () => {
          this.db = req.result;
          resolve(this.db);
        };
        req.onerror = () => reject(req.error);
      });
    },

    async dbGet(key = 'current') {
      if (!('indexedDB' in window)) return null;
      try {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(DB_STORE, 'readonly');
          const req = tx.objectStore(DB_STORE).get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
        });
      } catch (e) {
        return null;
      }
    },

    async dbSet(data, key = 'current') {
      if (!('indexedDB' in window)) return false;
      try {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(DB_STORE, 'readwrite');
          tx.objectStore(DB_STORE).put(data, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        });
      } catch (e) {
        return false;
      }
    },

    async dbClear() {
      if (!('indexedDB' in window)) return false;
      try {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(DB_STORE, 'readwrite');
          tx.objectStore(DB_STORE).clear();
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        });
      } catch (e) {
        return false;
      }
    },

    async saveImage(id, base64) {
      return this.dbSet(base64, 'img:' + id);
    },

    async loadImage(id) {
      return this.dbGet('img:' + id);
    },

    KEYS: {
      LEAGUE: LS_KEY,
      AUDIT: LS_AUDIT,
      THEME: LS_THEME,
      LANG: LS_LANG,
      ROLE: LS_ROLE,
      PIN: LS_PIN
    }
  };

  /* ============================================================
     STATE MANAGER (Pub/Sub)
     ============================================================ */

  const State = {
    data: null,
    listeners: new Map(),

    set(path, value) {
      if (!path) return;
      const keys = path.split('.');
      let obj = this.data;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      this.emit('change', { path, value });
    },

    get(path, fallback = null) {
      if (!path) return this.data;
      const keys = path.split('.');
      let obj = this.data;
      for (const k of keys) {
        if (obj == null) return fallback;
        obj = obj[k];
      }
      return obj == null ? fallback : obj;
    },

    subscribe(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
      return () => this.listeners.get(event)?.delete(callback);
    },

    emit(event, payload) {
      this.listeners.get(event)?.forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error('[State] Listener error:', e);
        }
      });
    },

    reset() {
      this.data = null;
      this.listeners.clear();
    }
  };

  /* ============================================================
     ROUTER (SPA Navigation)
     ============================================================ */

  const Router = {
    routes: new Map(),
    current: 'home',
    params: {},

    register(name, handler) {
      this.routes.set(name, handler);
    },

    navigate(page, params = {}) {
      if (!page) return;
      this.current = page;
      this.params = params;
      document.dispatchEvent(new CustomEvent('league:route', {
        detail: { page, params }
      }));
    },

    back() {
      this.navigate('home');
    },

    onRouteChange(callback) {
      document.addEventListener('league:route', e => callback(e.detail));
    }
  };

  /* ============================================================
     AUDIT LOG
     ============================================================ */

  const Audit = {
    MAX_ENTRIES: 250,

    log(action, entity, entityId, oldValue = null, newValue = null, user = 'admin') {
      const entry = {
        timestamp: new Date().toISOString(),
        action,
        entity,
        entityId,
        oldValue,
        newValue,
        user
      };

      if (State.data) {
        if (!Array.isArray(State.data.auditLog)) State.data.auditLog = [];
        State.data.auditLog.unshift(entry);
        if (State.data.auditLog.length > this.MAX_ENTRIES) {
          State.data.auditLog.length = this.MAX_ENTRIES;
        }
      }

      const rows = Storage.get(Storage.KEYS.AUDIT, []);
      rows.unshift(entry);
      Storage.set(Storage.KEYS.AUDIT, rows.slice(0, this.MAX_ENTRIES));

      return entry;
    },

    getAll() {
      return State.data?.auditLog || Storage.get(Storage.KEYS.AUDIT, []);
    },

    getRecent(limit = 10) {
      return this.getAll().slice(0, limit);
    },

    undoLast() {
      const log = this.getAll();
      if (!log.length) return null;
      return log[0];
    },

    clear() {
      if (State.data) State.data.auditLog = [];
      Storage.remove(Storage.KEYS.AUDIT);
      Core.persist();
    },

    exportCSV() {
      const rows = this.getAll();
      const headers = ['timestamp', 'action', 'entity', 'entityId', 'user'];
      const csv = [
        headers.join(','),
        ...rows.map(r => headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(','))
      ].join('\r\n');
      return csv;
    }
  };

  /* ============================================================
     CRUD MANAGER
     ============================================================ */

  const CRUD = {
    generateId(prefix = 'id') {
      return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    },

    getCollection(entity) {
      if (!State.data || !Array.isArray(State.data[entity])) {
        throw new Error(`Collection "${entity}" not found`);
      }
      return State.data[entity];
    },

    create(entity, item) {
      const collection = this.getCollection(entity);
      if (!item.id) item.id = this.generateId(entity.slice(0, 2));
      collection.push(item);
      this.commit('create', entity, item.id);
      return item;
    },

    read(entity, id) {
      return this.getCollection(entity).find(x => x.id === id) || null;
    },

    readAll(entity, filter = null) {
      const collection = this.getCollection(entity);
      return filter ? collection.filter(filter) : collection.slice();
    },

    update(entity, id, changes) {
      const item = this.read(entity, id);
      if (!item) throw new Error(`Item ${id} not found in ${entity}`);
      const old = JSON.parse(JSON.stringify(item));
      Object.assign(item, changes);
      this.commit('update', entity, id, old, item);
      return item;
    },

    delete(entity, id) {
      const collection = this.getCollection(entity);
      const index = collection.findIndex(x => x.id === id);
      if (index === -1) return null;
      const removed = collection.splice(index, 1)[0];

      if (entity === 'teams') {
        State.data.players = State.data.players.filter(p => p.teamId !== id);
        State.data.matches = State.data.matches.filter(
          m => m.homeTeamId !== id && m.awayTeamId !== id
        );
      }
      if (entity === 'players') {
        State.data.matches.forEach(m => {
          m.events = (m.events || []).filter(e => e.playerId !== id);
        });
      }

      this.commit('delete', entity, id, removed);
      return removed;
    },

    bulkDelete(entity, ids) {
      const collection = this.getCollection(entity);
      const removed = [];
      for (const id of ids) {
        const idx = collection.findIndex(x => x.id === id);
        if (idx !== -1) removed.push(...collection.splice(idx, 1));
      }
      this.commit('bulk-delete', entity, ids.join(','), null, { count: removed.length });
      return removed;
    },

    commit(action, entity, entityId, oldValue = null, newValue = null) {
      if (State.data) {
        State.data.updatedAt = new Date().toISOString();
      }
      Core.persist();
      Audit.log(action, entity, entityId, oldValue, newValue);
    }
  };

  /* ============================================================
     PERMISSIONS
     ============================================================ */

  const Permissions = {
    DEFAULT_PIN: '1234',

    isAdmin() {
      return Storage.get(Storage.KEYS.ROLE) === 'admin';
    },

    getPin() {
      return Storage.get(Storage.KEYS.PIN) || this.DEFAULT_PIN;
    },

    setPin(pin) {
      Storage.set(Storage.KEYS.PIN, String(pin));
      Audit.log('change-pin', 'security', 'admin', null, null);
    },

    verifyPin(pin) {
      return String(pin) === String(this.getPin());
    },

    login(pin) {
      if (this.verifyPin(pin)) {
        Storage.set(Storage.KEYS.ROLE, 'admin');
        Audit.log('login', 'security', 'admin');
        return true;
      }
      return false;
    },

    logout() {
      Storage.remove(Storage.KEYS.ROLE);
      Audit.log('logout', 'security', 'admin');
    },

    toggle() {
      if (this.isAdmin()) {
        this.logout();
        return false;
      }
      return null;
    },

    can(action) {
      if (['view', 'read'].includes(action)) return true;
      return this.isAdmin();
    }
  };

  /* ============================================================
     VALIDATOR
     ============================================================ */

  const Validator = {
    validate(data) {
      const errors = [];

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { ok: false, valid: false, errors: ['الملف يجب أن يكون كائن JSON صالح.'] };
      }

      if (!data.league || typeof data.league.name !== 'string') {
        errors.push('الحقل league.name مطلوب.');
      }

      for (const k of ['teams', 'players', 'matches']) {
        if (!Array.isArray(data[k])) {
          errors.push(`الحقل ${k} يجب أن يكون مصفوفة.`);
        }
      }

      if (errors.length) return { ok: false, valid: false, errors };

      const teamIds = new Set();
      const playerIds = new Set();

      for (const [i, t] of (data.teams || []).entries()) {
        if (!t.id) {
          errors.push(`teams[${i}]: الحقل id مطلوب.`);
        } else if (teamIds.has(t.id)) {
          errors.push(`teams[${i}]: المعرّف مكرر: ${t.id}`);
        } else {
          teamIds.add(t.id);
        }
      }

      for (const [i, p] of (data.players || []).entries()) {
        if (!p.id) errors.push(`players[${i}]: الحقل id مطلوب.`);
        else if (playerIds.has(p.id)) errors.push(`players[${i}]: المعرّف مكرر: ${p.id}`);
        else playerIds.add(p.id);

        if (p.teamId && !teamIds.has(p.teamId)) {
          errors.push(`players[${i}]: الفريق ${p.teamId} غير موجود.`);
        }
      }

      for (const [i, m] of (data.matches || []).entries()) {
        if (!m.id) errors.push(`matches[${i}]: الحقل id مطلوب.`);
        if (!teamIds.has(m.homeTeamId)) errors.push(`matches[${i}]: الفريق المضيف غير موجود.`);
        if (!teamIds.has(m.awayTeamId)) errors.push(`matches[${i}]: الفريق الضيف غير موجود.`);
        if (m.homeTeamId === m.awayTeamId) {
          errors.push(`matches[${i}]: لا يمكن أن يلعب الفريق ضد نفسه.`);
        }
      }

      return {
        ok: errors.length === 0,
        valid: errors.length === 0,
        errors
      };
    },

    sanitize(data) {
      const clean = typeof structuredClone === 'function'
        ? structuredClone(data)
        : JSON.parse(JSON.stringify(data));

      clean.version = Number(clean.version) || 1;
      clean.updatedAt = clean.updatedAt || new Date().toISOString();
      clean.discipline = Array.isArray(clean.discipline) ? clean.discipline : [];
      clean.ratings = Array.isArray(clean.ratings) ? clean.ratings : [];
      clean.auditLog = Array.isArray(clean.auditLog) ? clean.auditLog : [];
      clean.fanVotes = Array.isArray(clean.fanVotes) ? clean.fanVotes : [];
      clean.events = Array.isArray(clean.events) ? clean.events : [];

      clean.league = clean.league || {};
      clean.league.settings = Object.assign({
        winPoints: 3,
        drawPoints: 1,
        lossPoints: 0,
        yellowForSuspension: 3,
        resetCardsAfterRounds: 0,
        tiebreakers: ['points', 'h2h', 'h2hDiff', 'h2hGoals', 'diff', 'goals', 'wins', 'fairplay'],
        pointsDeduction: [],
        qualificationSpots: { champions: 4, europa: 2, relegation: 3 }
      }, clean.league.settings || {});

      return clean;
    }
  };

  /* ============================================================
     IMPORTER
     ============================================================ */

  const Importer = {
    async fromFile(file) {
      if (!file) throw new Error('لم يتم اختيار ملف.');
      if (file.size > 20 * 1024 * 1024) {
        throw new Error('حجم الملف يتجاوز 20 ميجابايت.');
      }

      const text = await file.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error('الملف ليس JSON صالحاً.');
      }

      const result = Validator.validate(json);
      if (!result.ok) {
        throw new Error(result.errors.slice(0, 8).join('\n'));
      }

      return Validator.sanitize(json);
    },

    async fromURL(url) {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`فشل تحميل الملف: ${res.status}`);
      const json = await res.json();
      const result = Validator.validate(json);
      if (!result.ok) throw new Error(result.errors.slice(0, 8).join('\n'));
      return Validator.sanitize(json);
    },

    async fromDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0];
      if (file) return this.fromFile(file);
      throw new Error('لم يتم إسقاط ملف صالح.');
    }
  };

  /* ============================================================
     EXPORTER
     ============================================================ */

  const Exporter = {
    toJSON(data = State.data) {
      const json = JSON.stringify(data, null, 2);
      return new Blob([json], { type: 'application/json' });
    },

    toCSV(rows) {
      if (!Array.isArray(rows) || !rows.length) return '';
      const headers = Object.keys(rows[0]);
      const esc = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
      const csv = [
        headers.join(','),
        ...rows.map(r => headers.map(h => esc(r[h])).join(','))
      ].join('\r\n');
      return '\ufeff' + csv;
    },

    download(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    },

    exportBackup() {
      const filename = `league-backup-${new Date().toISOString().slice(0, 10)}.json`;
      this.download(this.toJSON(), filename);
      Audit.log('export', 'backup', filename);
    },

    exportAudit() {
      const csv = Audit.exportCSV();
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      this.download(blob, `league-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    },

    exportPDF() {
      window.print();
    }
  };

  /* ============================================================
     HELPERS
     ============================================================ */

  const Helpers = {
    debounce(fn, delay = 250) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    },

    throttle(fn, limit = 200) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          fn.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    clone(obj) {
      if (typeof structuredClone === 'function') {
        try {
          return structuredClone(obj);
        } catch (e) {
          /* fallback */
        }
      }
      return JSON.parse(JSON.stringify(obj));
    },

    isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    },

    formatDate(iso, locale = 'ar-SA') {
      if (!iso) return '—';
      try {
        const date = new Date(iso);
        return date.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        return '—';
      }
    },

    formatTime(iso) {
      if (!iso) return '—';
      try {
        const date = new Date(iso);
        return date.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return '—';
      }
    },

    formatDateTime(iso) {
      if (!iso) return '—';
      return `${this.formatDate(iso)} · ${this.formatTime(iso)}`;
    },

    timeAgo(iso) {
      if (!iso) return '—';
      const diff = (Date.now() - new Date(iso).getTime()) / 1000;
      if (diff < 60) return 'منذ لحظات';
      if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
      if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
      if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
      return this.formatDate(iso);
    },

    escape(value) {
      return String(value == null ? '' : value).replace(
        /[&<>"']/g,
        c => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[c])
      );
    },

    initials(name) {
      return String(name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(s => s[0] || '')
        .join('') || '؟';
    },

    randomId(prefix = 'id') {
      return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    },

    groupBy(arr, key) {
      return arr.reduce((acc, item) => {
        const group = typeof key === 'function' ? key(item) : item[key];
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
      }, {});
    },

    sortBy(arr, key, direction = 'asc') {
      const sorted = arr.slice().sort((a, b) => {
        const va = typeof key === 'function' ? key(a) : a[key];
        const vb = typeof key === 'function' ? key(b) : b[key];
        if (va < vb) return -1;
        if (va > vb) return 1;
        return 0;
      });
      return direction === 'desc' ? sorted.reverse() : sorted;
    },

    unique(arr) {
      return [...new Set(arr)];
    },

    sum(arr, key) {
      return arr.reduce((total, item) => {
        const value = typeof key === 'function' ? key(item) : item[key];
        return total + (Number(value) || 0);
      }, 0);
    },

    average(arr, key) {
      if (!arr.length) return 0;
      return this.sum(arr, key) / arr.length;
    },

    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  };

  /* ============================================================
     UPDATE CHECKER
     ============================================================ */

  const UpdateChecker = {
    compare(localData, remoteData) {
      if (!remoteData || !remoteData.updatedAt) {
        return { status: 'invalid', local: null, remote: null };
      }

      const localDate = localData?.updatedAt ? new Date(localData.updatedAt) : null;
      const remoteDate = new Date(remoteData.updatedAt);

      if (!localDate || isNaN(localDate.getTime())) {
        return {
          status: 'fresh',
          local: null,
          remote: remoteDate,
          message: 'لا توجد بيانات محلية — يمكنك الاستيراد.'
        };
      }

      if (remoteDate > localDate) {
        return {
          status: 'newer',
          local: localDate,
          remote: remoteDate,
          message: 'يوجد إصدار أحدث من البيانات.'
        };
      }

      if (remoteDate < localDate) {
        return {
          status: 'older',
          local: localDate,
          remote: remoteDate,
          message: 'الملف المحلي أحدث من الملف المُستورد.'
        };
      }

      return {
        status: 'up-to-date',
        local: localDate,
        remote: remoteDate,
        message: 'البيانات محدّثة.'
      };
    },

    async checkFromURL(url) {
      try {
        const res = await fetch(url + '?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const remote = await res.json();
        return this.compare(State.data, remote);
      } catch (e) {
        return { status: 'error', error: e.message };
      }
    },

    async checkFromFile(file) {
      try {
        const text = await file.text();
        const remote = JSON.parse(text);
        return this.compare(State.data, remote);
      } catch (e) {
        return { status: 'error', error: e.message };
      }
    }
  };

  /* ============================================================
     SYNC MANAGER
     ============================================================ */

  const Sync = {
    syncTimeout: null,
    SYNC_DELAY: 500,

    schedule() {
      if (this.syncTimeout) clearTimeout(this.syncTimeout);
      this.syncTimeout = setTimeout(() => this.flush(), this.SYNC_DELAY);
    },

    async flush() {
      if (!State.data) return;
      try {
        Storage.set(Storage.KEYS.LEAGUE, State.data);
        await Storage.dbSet(State.data);
      } catch (e) {
        console.error('[Sync] Failed:', e);
      }
    },

    async pull() {
      const dbData = await Storage.dbGet();
      if (dbData && dbData.updatedAt && State.data) {
        if (new Date(dbData.updatedAt) > new Date(State.data.updatedAt || 0)) {
          State.data = dbData;
          return true;
        }
      }
      return false;
    }
  };

  /* ============================================================
     LIFECYCLE
     ============================================================ */

  const Lifecycle = {
    listeners: new Map(),

    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
      return () => this.listeners.get(event)?.delete(callback);
    },

    emit(event, payload) {
      this.listeners.get(event)?.forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error('[Lifecycle] Listener error:', e);
        }
      });
    },

    init() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.emit('visible');
          Sync.pull().catch(() => {});
        } else {
          this.emit('hidden');
          Sync.flush().catch(() => {});
        }
      });

      window.addEventListener('beforeunload', () => {
        Sync.flush();
      });

      window.addEventListener('online', () => this.emit('online'));
      window.addEventListener('offline', () => this.emit('offline'));

      if (!navigator.onLine) {
        this.emit('offline');
      }
    }
  };

  /* ============================================================
     CORE — الواجهة الرئيسية
     ============================================================ */

  const Core = {
    async init() {
      const savedTheme = Storage.get(Storage.KEYS.THEME) || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);

      const savedLang = Storage.get(Storage.KEYS.LANG) || 'ar';
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

      Lifecycle.init();

      let data = null;

      const local = Storage.get(Storage.KEYS.LEAGUE);
      if (local) {
        const result = Validator.validate(local);
        if (result.ok) data = Validator.sanitize(local);
      }

      if (!data) {
        const dbData = await Storage.dbGet();
        if (dbData) {
          const result = Validator.validate(dbData);
          if (result.ok) data = Validator.sanitize(dbData);
        }
      }

      if (!data) {
        try {
          const res = await fetch('data/sample-league.json', { cache: 'no-store' });
          if (res.ok) {
            const json = await res.json();
            const result = Validator.validate(json);
            if (result.ok) data = Validator.sanitize(json);
          }
        } catch (e) {
          console.warn('[Core] Could not load sample-league.json:', e);
        }
      }

      if (!data) {
        data = this.fallbackData();
      }

      State.data = data;
      this.persist();

      return data;
    },

    persist() {
      if (!State.data) return;
      Storage.set(Storage.KEYS.LEAGUE, State.data);
      Storage.dbSet(State.data).catch(() => {});
      Sync.schedule();
    },

    team(id) {
      return State.data?.teams?.find(t => t.id === id) || null;
    },

    player(id) {
      return State.data?.players?.find(p => p.id === id) || null;
    },

    match(id) {
      return State.data?.matches?.find(m => m.id === id) || null;
    },

    async clear() {
      Storage.remove(Storage.KEYS.LEAGUE);
      Storage.remove(Storage.KEYS.AUDIT);
      await Storage.dbClear();
      State.data = this.fallbackData();
      this.persist();
      Audit.log('reset', 'data');
    },

    fallbackData() {
      return {
        version: 1,
        updatedAt: new Date().toISOString(),
        league: {
          name: 'دوري المحترفين',
          season: '2025/2026',
          country: 'YE',
          logo: '',
          settings: {
            winPoints: 3,
            drawPoints: 1,
            lossPoints: 0,
            yellowForSuspension: 3,
            resetCardsAfterRounds: 0,
            tiebreakers: ['points', 'h2h', 'h2hDiff', 'h2hGoals', 'diff', 'goals', 'wins', 'fairplay'],
            pointsDeduction: [],
            qualificationSpots: { champions: 4, europa: 2, relegation: 3 }
          }
        },
        teams: [],
        players: [],
        matches: [],
        events: [],
        discipline: [],
        ratings: [],
        auditLog: [],
        fanVotes: []
      };
    },

    Storage,
    State,
    Router,
    CRUD,
    Audit,
    Permissions,
    Validator,
    Importer,
    Exporter,
    Helpers,
    UpdateChecker,
    Sync,
    Lifecycle
  };

  /* ============================================================
     EXPORT
     ============================================================ */

  window.Core = Core;
  window.Helpers = Helpers;
  window.UpdateChecker = UpdateChecker;

})(window);