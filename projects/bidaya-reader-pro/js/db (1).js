/* ═══ طبقة IndexedDB — bidaya_reader_pro ═══ */
const DB = (() => {
  const DB_NAME = "bidaya_reader_pro";
  const DB_VERSION = 1;
  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        // الكتب
        if (!db.objectStoreNames.contains("books")) {
          const books = db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
          books.createIndex("imported_at", "imported_at");
        }
        // الفصول (شجرية)
        if (!db.objectStoreNames.contains("chapters")) {
          const ch = db.createObjectStore("chapters", { keyPath: "id", autoIncrement: true });
          ch.createIndex("book_id", "book_id");
          ch.createIndex("parent_id", "parent_id");
          ch.createIndex("book_order", ["book_id", "order_num"]);
        }
        // الصفحات
        if (!db.objectStoreNames.contains("pages")) {
          const pg = db.createObjectStore("pages", { keyPath: "id", autoIncrement: true });
          pg.createIndex("chapter_id", "chapter_id");
        }
        // العلامات
        if (!db.objectStoreNames.contains("bookmarks")) {
          const bm = db.createObjectStore("bookmarks", { keyPath: "id", autoIncrement: true });
          bm.createIndex("book_id", "book_id");
          bm.createIndex("chapter_id", "chapter_id");
          bm.createIndex("created_at", "created_at");
        }
        // سجل القراءة
        if (!db.objectStoreNames.contains("history")) {
          const hs = db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
          hs.createIndex("book_id", "book_id");
          hs.createIndex("chapter_id", "chapter_id");
          hs.createIndex("visited_at", "visited_at");
        }
        // التقدم
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: ["book_id", "chapter_id"] });
        }
        // الإعدادات
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
        // القوائم المخصصة
        if (!db.objectStoreNames.contains("collections")) {
          db.createObjectStore("collections", { keyPath: "id", autoIncrement: true });
        }
      };
      req.onsuccess = () => { _db = req.result; resolve(_db); };
      req.onerror = () => reject(new Error("تعذر فتح قاعدة البيانات: " + req.error));
    });
  }

  // تنفيذ معاملة قراءة
  async function tx(store, mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      let result;
      try { result = fn(s); } catch (err) { reject(err); return; }
      t.oncomplete = () => resolve(result && result._val !== undefined ? result._val : result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }

  const promisify = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

  return {
    open,
    // عمليات أساسية
    add: (store, val) => tx(store, "readwrite", (s) => promisify(s.add(val))),
    put: (store, val) => tx(store, "readwrite", (s) => promisify(s.put(val))),
    del: (store, key) => tx(store, "readwrite", (s) => promisify(s.delete(key))),
    clear: (store) => tx(store, "readwrite", (s) => promisify(s.clear())),
    get: (store, key) => tx(store, "readonly", (s) => promisify(s.get(key))),
    all: (store) => tx(store, "readonly", (s) => promisify(s.getAll())),
    count: (store) => tx(store, "readonly", (s) => promisify(s.count())),

    // جلب بفهرس
    byIndex: (store, index, value) => tx(store, "readonly", (s) => promisify(s.index(index).getAll(value))),

    // حفظ دفعة (500 عنصر/دفعة)
    async bulkAdd(store, items, batchSize = 500, onProgress = null) {
      const db = await open();
      let done = 0;
      for (let i = 0; i < items.length; i += batchSize) {
        const chunk = items.slice(i, i + batchSize);
        await new Promise((resolve, reject) => {
          const t = db.transaction(store, "readwrite");
          const s = t.objectStore(store);
          chunk.forEach((item) => s.add(item));
          t.oncomplete = resolve;
          t.onerror = () => reject(t.error);
        });
        done += chunk.length;
        if (onProgress) onProgress(done, items.length);
      }
      return done;
    },

    async bulkPut(store, items, batchSize = 500) {
      const db = await open();
      for (let i = 0; i < items.length; i += batchSize) {
        const chunk = items.slice(i, i + batchSize);
        await new Promise((resolve, reject) => {
          const t = db.transaction(store, "readwrite");
          const s = t.objectStore(store);
          chunk.forEach((item) => s.put(item));
          t.oncomplete = resolve;
          t.onerror = () => reject(t.error);
        });
      }
    },
  };
})();