/* ============================================================
   import.js — استيراد ملف JSON إلى IndexedDB (v3 — مُصلح)
   الإصلاحات:
   - بناء خريطة old_id → new_id في المرور الأول
   - دعم IDs نصية أو رقمية غير متسلسلة
   - ربط parent_id الصحيح من JSON الأصلي
   - تحقق شامل من بنية العقد
   - تقارير أخطاء مفصّلة
   ============================================================ */
const Importer = (() => {

  /**
   * ✅ جديد: تحقق وتصحيح بنية العقد recursively
   */
  function normalizeNode(node, depth = 0) {
    if (!node || typeof node !== 'object') return null;

    const clean = {
      id: node.id != null ? node.id : null,
      parent_id: node.parent_id != null ? node.parent_id : null,
      title: String(node.title || '').trim() || '(بدون عنوان)',
      order_num: Number.isFinite(node.order_num) ? node.order_num
                 : Number.isFinite(node.order) ? node.order
                 : 0,
      pages: [],
      children: [],
    };

    // الصفحات
    if (Array.isArray(node.pages)) {
      clean.pages = node.pages
        .filter(p => p && typeof p === 'object')
        .map((p, i) => ({
          page_num: Number.isFinite(p.page_num) ? p.page_num : (i + 1),
          word_count: Number.isFinite(p.word_count) ? p.word_count : 0,
          content: typeof p.content === 'string' ? p.content : String(p.content || ''),
        }));
    }

    // الأبناء
    if (Array.isArray(node.children)) {
      clean.children = node.children
        .map(c => normalizeNode(c, depth + 1))
        .filter(Boolean);
    }

    return clean;
  }

  /**
   * ✅ جديد: تحقق من بنية الملف بالكامل قبل البدء
   */
  function validateData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('ملف JSON غير صالح — ليس كائنًا');
    }
    if (!data.book || typeof data.book !== 'object') {
      throw new Error('الملف لا يحتوي على كائن "book" صالح');
    }
    if (!Array.isArray(data.chapters)) {
      throw new Error('الملف لا يحتوي على مصفوفة "chapters" صالحة');
    }
    if (data.chapters.length === 0) {
      throw new Error('مصفوفة "chapters" فارغة');
    }
    return true;
  }

  /**
   * ✅ جديد: تسوية الشجرة بالكامل مع ربط parent_id الصحيح
   */
  function flattenTree(rawRoots) {
    const chapters = [];
    const pages = [];
    const idMap = new Map();          // old_id (as String) → new_id
    const pendingParents = new Map(); // new_id → old_parent_id (للمرحلة الثانية)
    let nextChapterId = 1;
    let nextPageId = 1;

    // ─── المرور الأول: إنشاء الفصول ───
    function createChapter(node, depth) {
      const old_id = node.id;
      const new_id = nextChapterId++;

      if (old_id != null) {
        idMap.set(String(old_id), new_id);
      }

      // احفظ old_parent_id مؤقتًا لربطه في المرحلة الثانية
      if (node.parent_id != null) {
        pendingParents.set(new_id, String(node.parent_id));
      }

      chapters.push({
        id: new_id,
        parent_id: null,       // سيُحدَّث لاحقًا
        title: node.title,
        order_num: node.order_num,
        depth: depth,
        pages_count: node.pages.length,
        children_count: node.children.length,
      });

      // الصفحات
      node.pages.forEach(p => {
        pages.push({
          id: nextPageId++,
          chapter_id: new_id,
          page_num: p.page_num,
          word_count: p.word_count,
          content: p.content,
        });
      });

      // الأبناء
      node.children.forEach(child => createChapter(child, depth + 1));
    }

    rawRoots.forEach(root => createChapter(root, 1));

    // ─── المرحلة الثانية: ربط parent_id ───
    for (const ch of chapters) {
      const oldParent = pendingParents.get(ch.id);
      if (oldParent && idMap.has(oldParent)) {
        ch.parent_id = idMap.get(oldParent);
      }
      // لو parent_id لم يُعثر عليه → يبقى null (root)
    }

    // ─── المرحلة الثالثة: كشف الفصول اليتيمة ───
    const validIds = new Set(chapters.map(c => c.id));
    const orphans = chapters.filter(c => c.parent_id && !validIds.has(c.parent_id));
    if (orphans.length) {
      console.warn(`⚠️ ${orphans.length} فصلًا له parent_id غير صالح — سيُعامل كجذر`);
      orphans.forEach(c => { c.parent_id = null; });
    }

    // ─── المرحلة الرابعة: إعادة حساب depth الصحيح ───
    const byId = Object.fromEntries(chapters.map(c => [c.id, c]));
    const depthCache = new Map();
    function computeDepth(id, guard = 0) {
      if (depthCache.has(id)) return depthCache.get(id);
      if (guard > 100) return 1; // حماية من حلقات
      const ch = byId[id];
      if (!ch || !ch.parent_id || !byId[ch.parent_id]) {
        depthCache.set(id, 1);
        return 1;
      }
      const d = computeDepth(ch.parent_id, guard + 1) + 1;
      depthCache.set(id, d);
      return d;
    }
    chapters.forEach(c => { c.depth = computeDepth(c.id); });

    return { chapters, pages, idMap, orphans: orphans.length };
  }

  /**
   * استيراد ملف JSON مع تقرير تقدم
   */
  async function importFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      if (!file) { reject(new Error('لم يُحدَّد ملف')); return; }

      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 40), '📖 قراءة الملف...');
        }
      };

      reader.onerror = () => reject(reader.error || new Error('فشل قراءة الملف'));

      reader.onload = async () => {
        try {
          // ─── 1) تحليل JSON ───
          if (onProgress) onProgress(42, '🔍 تحليل JSON...');
          let data;
          try {
            data = JSON.parse(reader.result);
          } catch (e) {
            throw new Error('صيغة JSON غير صالحة: ' + e.message);
          }

          // ─── 2) تحقق ───
          if (onProgress) onProgress(46, '✅ التحقق من البنية...');
          validateData(data);

          // ─── 3) تسوية العقد ───
          if (onProgress) onProgress(50, '🧹 تنظيف البيانات...');
          const normalizedRoots = data.chapters
            .map(c => normalizeNode(c, 1))
            .filter(Boolean);

          if (!normalizedRoots.length) {
            throw new Error('لا توجد فصول صالحة بعد التنظيف');
          }

          // ─── 4) تفريغ البيانات القديمة ───
          if (onProgress) onProgress(54, '🗑️ تفريغ البيانات القديمة...');
          await DB.clearAll();

          // ─── 5) تسوية الشجرة ───
          if (onProgress) onProgress(58, '🌳 بناء الشجرة...');
          const { chapters, pages, orphans } = flattenTree(normalizedRoots);

          // ─── 6) حفظ الكتاب ───
          if (onProgress) onProgress(62, '💾 حفظ بيانات الكتاب...');
          await DB.put('book', {
            id: 1,
            title: String(data.book.title || 'بدون عنوان').trim(),
            author: String(data.book.author || '').trim(),
            description: String(data.book.description || '').trim(),
            stats: data.stats && typeof data.stats === 'object' ? data.stats : {},
            imported_at: new Date().toISOString(),
          });

          // ─── 7) إدراج الفصول على دفعات ───
          if (onProgress) onProgress(66, `📚 إدراج ${chapters.length} فصلًا...`);
          const CH_BATCH = 500;
          let chInserted = 0;
          let chFailed = 0;

          for (let i = 0; i < chapters.length; i += CH_BATCH) {
            const batch = chapters.slice(i, i + CH_BATCH);
            const res = await DB.putMany('chapters', batch);
            chInserted += res.ok;
            chFailed += res.errors.length;

            const pct = 66 + Math.round((i / chapters.length) * 10);
            if (onProgress) {
              onProgress(pct, `📚 الفصول: ${Math.min(i + CH_BATCH, chapters.length)} / ${chapters.length}`);
            }
          }

          // ─── 8) إدراج الصفحات على دفعات ───
          if (onProgress) onProgress(76, `📄 إدراج ${pages.length} صفحة...`);
          const PG_BATCH = 500;
          let pgInserted = 0;
          let pgFailed = 0;

          for (let i = 0; i < pages.length; i += PG_BATCH) {
            const batch = pages.slice(i, i + PG_BATCH);
            const res = await DB.putMany('pages', batch);
            pgInserted += res.ok;
            pgFailed += res.errors.length;

            const pct = 76 + Math.round((i / pages.length) * 22);
            if (onProgress) {
              onProgress(pct, `📄 الصفحات: ${Math.min(i + PG_BATCH, pages.length)} / ${pages.length}`);
            }
          }

          // ─── 9) إعادة تعيين اتصال DB (يمنع التخزين المؤقت) ───
          DB.reset();

          if (onProgress) onProgress(100, '✅ اكتمل الاستيراد!');

          // ─── 10) الإبلاغ ───
          resolve({
            title: data.book.title || 'الكتاب',
            chapters: chInserted,
            pages: pgInserted,
            failedChapters: chFailed,
            failedPages: pgFailed,
            orphans,
          });

        } catch (err) {
          console.error('❌ Import error:', err);
          reject(err);
        }
      };

      reader.readAsText(file, 'utf-8');
    });
  }

  async function isImported() {
    return (await DB.count('book')) > 0;
  }

  async function clearAll() {
    await DB.clearAll();
    DB.reset();
  }

  return { importFile, isImported, clearAll };
})();