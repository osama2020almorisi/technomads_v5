/* ═══ الحالة العامة والإعدادات ═══ */
const Store = (() => {
  const DEFAULTS = {
    theme: "system",            // light | dark | system
    fontSize: 18,               // حجم خط القارئ (px)
    fontFamily: "reader",       // reader | body
    lineHeight: 2.1,
    autoSaveInterval: 30,       // ثواني
    printWithToc: true,
    searchScope: "all",
  };
  let cache = { ...DEFAULTS };

  async function init() {
    try {
      const rows = await DB.all("settings");
      rows.forEach((r) => { cache[r.key] = r.value; });
    } catch (e) { console.warn("تعذر تحميل الإعدادات", e); }
    applyTheme();
    return cache;
  }

  async function set(key, value) {
    cache[key] = value;
    try { await DB.put("settings", { key, value }); } catch (e) { console.error(e); }
    if (key === "theme") applyTheme();
    return value;
  }

  function get(key) { return cache[key] !== undefined ? cache[key] : DEFAULTS[key]; }

  function applyTheme() {
    const t = get("theme");
    const dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (get("theme") === "system") applyTheme();
  });

  return { init, set, get, applyTheme };
})();

/* أدوات نصية مشتركة */
const TextUtil = {
  // تطبيع عربي: إزالة التشكيل وتوحيد الأحرف
  normalizeArabic(str) {
    if (!str) return "";
    return String(str)
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "") // تشكيل وتطويل
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/ـ/g, "")
      .toLowerCase()
      .trim();
  },
  // استخراج جذر تقريبي
  rootOf(word) {
    let w = this.normalizeArabic(word);
    if (w.length <= 3) return w;
    if (/^(ال)/.test(w) && w.length > 4) w = w.slice(2);
    if (w.length > 5) w = w.slice(0, 4); // اقتطاع الضمائر واللواحق الشائعة
    return w;
  },
  stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
  },
  wordCount(html) {
    const text = this.stripHtml(html).trim();
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  },
  charCount(html) { return this.stripHtml(html).length; },
  esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  },
  formatNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + " مليون";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + " ألف";
    return String(n);
  },
  timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "الآن";
    if (m < 60) return `منذ ${m} دقيقة`;
    const h = Math.floor(m / 60);
    if (h < 24) return `منذ ${h} ساعة`;
    const d = Math.floor(h / 24);
    if (d < 30) return `منذ ${d} يوم`;
    return new Date(ts).toLocaleDateString("ar");
  },
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); },
};

/* عمليات عالية المستوى على الكتب */
const BookAPI = {
  // إنشاء كتاب كامل (كتاب + فصول + صفحات) في دفعات
  async createBook(book, chapters, pages, onProgress) {
    const bid = await DB.add("books", book);
    // ربط الفصول بالكتاب
    chapters.forEach((c) => { c.book_id = bid; });
    // ترقيم id مؤقت → حقيقي لتعيين parent_id
    const tmpToReal = new Map();
    await DB.bulkAdd("chapters", chapters, 500, async (done, total) => {
      if (onProgress) onProgress(10 + Math.round(done / total * 40), "حفظ الفصول…");
    }).then(async (lastId) => {
      // استرجاع id الحقيقية بالترتيب
      const saved = await DB.byIndex("chapters", "book_id", bid);
      chapters.forEach((c, i) => tmpToReal.set(c._tmp, saved[i].id));
      // تصحيح parent_id
      for (const real of saved) {
        if (real.parent_id && typeof real.parent_id === "string") {
          real.parent_id = tmpToReal.get(real.parent_id) ?? null;
          await DB.put("chapters", real);
        }
      }
      return saved;
    });
    const realChapters = await DB.byIndex("chapters", "book_id", bid);
    const chMap = new Map();
    realChapters.forEach((c) => chMap.set(c._tmp, c.id));
    // ربط الصفحات
    pages.forEach((p) => { p.chapter_id = chMap.get(p._tmpChapter) ?? chMap.values().next().value; });
    await DB.bulkAdd("pages", pages, 500, (done, total) => {
      if (onProgress) onProgress(50 + Math.round(done / total * 45), "حفظ الصفحات…");
    });
    if (onProgress) onProgress(98, "الانتهاء…");
    return bid;
  },

  async deleteBook(bookId) {
    const chapters = await DB.byIndex("chapters", "book_id", bookId);
    for (const ch of chapters) {
      const pages = await DB.byIndex("pages", "chapter_id", ch.id);
      for (const p of pages) await DB.del("pages", p.id);
      await DB.del("chapters", ch.id);
      await DB.del("progress", [bookId, ch.id]);
      await DB.byIndex("bookmarks", "chapter_id", ch.id).then((bms) => bms.forEach((b) => DB.del("bookmarks", b.id)));
    }
    await DB.byIndex("history", "book_id", bookId).then((hs) => hs.forEach((h) => DB.del("history", h.id)));
    await DB.byIndex("bookmarks", "book_id", bookId).then((bms) => bms.forEach((b) => DB.del("bookmarks", b.id)));
    await DB.del("books", bookId);
  },

  // فصول مرتبة كشجرة حتى 5 مستويات
  async getChapterTree(bookId) {
    const all = await DB.byIndex("chapters", "book_id", bookId);
    all.sort((a, b) => a.order_num - b.order_num);
    const map = new Map(all.map((c) => [c.id, { ...c, children: [] }]));
    const roots = [];
    map.forEach((c) => {
      if (c.parent_id && map.has(c.parent_id)) map.get(c.parent_id).children.push(c);
      else roots.push(c);
    });
    // ترتيب الأبناء
    const sortRec = (list) => { list.sort((a, b) => a.order_num - b.order_num); list.forEach((c) => sortRec(c.children)); };
    sortRec(roots);
    return roots;
  },

  // تسطيح الشجرة بالترتيب
  flattenTree(tree) {
    const out = [];
    const walk = (nodes, depth) => nodes.forEach((n) => { out.push({ ...n, depth }); walk(n.children, depth + 1); });
    walk(tree, 0);
    return out;
  },

  async getPages(chapterId) {
    const pages = await DB.byIndex("pages", "chapter_id", chapterId);
    pages.sort((a, b) => a.page_num - b.page_num);
    return pages;
  },

  async getBookStats(bookId) {
    const chapters = await DB.byIndex("chapters", "book_id", bookId);
    let pages = 0, words = 0, chars = 0;
    for (const ch of chapters) {
      const pgs = await DB.byIndex("pages", "chapter_id", ch.id);
      pages += pgs.length;
      pgs.forEach((p) => { words += p.word_count || 0; chars += (p.content || "").length; });
    }
    return { chapters: chapters.length, pages, words, chars };
  },

  async updateBookStats(bookId) {
    const stats = await this.getBookStats(bookId);
    const book = await DB.get("books", bookId);
    if (book) { book.stats = stats; await DB.put("books", book); }
    return stats;
  },

  // إعادة ترقيم order_num للأبناء المشتركين في أب
  async renumberSiblings(bookId, parentId) {
    const all = await DB.byIndex("chapters", "book_id", bookId);
    const siblings = all.filter((c) => (c.parent_id ?? null) === (parentId ?? null));
    siblings.sort((a, b) => a.order_num - b.order_num);
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i].order_num !== i) { siblings[i].order_num = i; await DB.put("chapters", siblings[i]); }
    }
  },
};