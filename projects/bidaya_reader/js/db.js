/* ============================================================
   db.js — إدارة IndexedDB (v2 — مُصلح)
   ============================================================ */
const DB = (() => {
  const DB_NAME = 'bidaya_reader';
  const DB_VERSION = 2;
  let _db = null;
  let _openPromise = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    if (_openPromise) return _openPromise;

    _openPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;

        if (!db.objectStoreNames.contains('book')) {
          db.createObjectStore('book', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('chapters')) {
          const s = db.createObjectStore('chapters', { keyPath: 'id' });
          s.createIndex('parent_id', 'parent_id', { unique: false });
          s.createIndex('order_num', 'order_num', { unique: false });
          s.createIndex('depth', 'depth', { unique: false });
        }

        if (!db.objectStoreNames.contains('pages')) {
          const s = db.createObjectStore('pages', { keyPath: 'id' });
          s.createIndex('chapter_id', 'chapter_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('bookmarks')) {
          const s = db.createObjectStore('bookmarks', {
            keyPath: 'id', autoIncrement: true
          });
          s.createIndex('chapter_id', 'chapter_id', { unique: false });
          s.createIndex('created_at', 'created_at', { unique: false });
        }

        if (!db.objectStoreNames.contains('history')) {
          const s = db.createObjectStore('history', {
            keyPath: 'id', autoIncrement: true
          });
          s.createIndex('visited_at', 'visited_at', { unique: false });
          s.createIndex('chapter_id', 'chapter_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'chapter_id' });
        }
      };

      req.onsuccess = () => {
        _db = req.result;
        // أغلق القاعدة عند حذفها من تبويب آخر
        _db.onversionchange = () => {
          _db.close();
          _db = null;
          _openPromise = null;
        };
        resolve(_db);
      };

      req.onerror = () => {
        _openPromise = null;
        reject(req.error);
      };

      req.onblocked = () => {
        console.warn('⚠️ IndexedDB blocked — أغلق التبويبات الأخرى');
      };
    });

    return _openPromise;
  }

  // ─── عمليات عامة ───
  async function tx(store, mode = 'readonly') {
    const db = await open();
    return db.transaction(store, mode).objectStore(store);
  }

  async function put(store, value) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, 'readwrite');
      const s = t.objectStore(store);
      const r = s.put(value);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      t.onabort = () => reject(t.error || new Error('Transaction aborted'));
    });
  }

  /**
   * إدراج مجموعة من القيم.
   * ✅ مُصلح: لا يفشل إذا فشل أحد السجلات — يجمع الأخطاء ويُبلغ عنها.
   * @returns {Promise<{ok:number, errors:Array}>}
   */
  async function putMany(store, values) {
    if (!values || !values.length) return { ok: 0, errors: [] };

    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, 'readwrite');
      const s = t.objectStore(store);
      const errors = [];

      values.forEach((v, i) => {
        try {
          const req = s.put(v);
          req.onerror = (e) => {
            // امنع إلغاء المعاملة بالكامل
            e.preventDefault();
            e.stopPropagation();
            errors.push({ index: i, value: v, error: req.error?.message || 'unknown' });
          };
        } catch (err) {
          errors.push({ index: i, value: v, error: err.message });
        }
      });

      t.oncomplete = () => {
        const ok = values.length - errors.length;
        if (errors.length) {
          console.warn(`⚠️ putMany(${store}): ${ok}/${values.length} نجح`);
        }
        resolve({ ok, errors });
      };
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error('Transaction aborted'));
    });
  }

  async function get(store, key) {
    const s = await tx(store);
    return new Promise((resolve, reject) => {
      const r = s.get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }

  async function getAll(store) {
    const s = await tx(store);
    return new Promise((resolve, reject) => {
      const r = s.getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  }

  async function count(store) {
    const s = await tx(store);
    return new Promise((resolve, reject) => {
      const r = s.count();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }

  async function clear(store) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, 'readwrite');
      t.objectStore(store).clear();
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  }

  async function del(store, key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, 'readwrite');
      t.objectStore(store).delete(key);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  }

  async function byIndex(store, index, value) {
    const s = await tx(store);
    return new Promise((resolve, reject) => {
      const r = s.index(index).getAll(value);
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  }

  // ─── عمليات خاصة ───
  async function clearAll() {
    const db = await open();
    const stores = ['book', 'chapters', 'pages', 'bookmarks', 'history', 'progress'];
    return new Promise((resolve, reject) => {
      const t = db.transaction(stores, 'readwrite');
      stores.forEach(s => t.objectStore(s).clear());
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error('ClearAll aborted'));
    });
  }

  async function stats() {
    const [book, chapters, pages, bookmarks, history] = await Promise.all([
      count('book'), count('chapters'), count('pages'),
      count('bookmarks'), count('history')
    ]);
    return { book, chapters, pages, bookmarks, history };
  }

  /**
   * ✅ جديد: أعد فتح القاعدة — مفيد بعد حذف/استيراد
   */
  function reset() {
    if (_db) {
      try { _db.close(); } catch (_) {}
    }
    _db = null;
    _openPromise = null;
  }

  return {
    open, put, putMany, get, getAll, count, clear, del, byIndex,
    clearAll, stats, reset
  };
})();