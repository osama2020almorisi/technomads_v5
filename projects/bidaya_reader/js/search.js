/* ============================================================
   search.js — البحث المتقدم (v2 — مُحسَّن)
   الإصلاحات:
   - تحميل كل الصفحات دفعة واحدة بدل N+1 query
   - AbortController لإلغاء البحث القديم عند بحث جديد
   - فهرسة ذكية في الذاكرة
   - تطبيع عربي متقدم + اشتقاق جذور
   ============================================================ */
const SearchPage = (() => {

  const state = {
    chapters: [],
    chapterMap: {},
    childrenByParent: {},
    pagesByChapter: {},   // ← جديد: فهرسة مسبقة
    allPagesLoaded: false,
    isSearching: false,
    abortController: null,
    lastQuery: '',
  };

  // ═══════════════════════════════════════════
  // تطبيع عربي
  // ═══════════════════════════════════════════
  const TASHKEEL_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

  function normalize(text) {
    return String(text || '')
      .replace(TASHKEEL_RE, '')                // تشكيل + تطويل
      .replace(/[أإآٱٲٳ]/g, 'ا')
      .replace(/[ىی]/g, 'ي')
      .replace(/[ةه]/g, 'ه')                    // توحيد ة/ه
      .replace(/[ؤو]/g, 'و')
      .replace(/[ئي]/g, 'ي')
      .replace(/[^\u0621-\u064A\s0-9a-zA-Z]/g, ' ') // احتفظ بالعربية فقط
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function tokenize(text) {
    return normalize(text).split(/\s+/).filter(t => t.length > 0);
  }

  // ═══════════════════════════════════════════
  // اشتقاق جذور تقريبي
  // ═══════════════════════════════════════════
  const PREFIXES = ['وال', 'بال', 'كال', 'فال', 'لل', 'ال', 'و', 'ف', 'ب', 'ك', 'ل']
    .sort((a, b) => b.length - a.length);
  const SUFFIXES = ['كما', 'هما', 'تين', 'اته', 'ات', 'ون', 'ين', 'ان',
                    'كم', 'كن', 'نا', 'ها', 'هم', 'هن', 'ه', 'ك', 'ي', 'ة']
    .sort((a, b) => b.length - a.length);

  function stem(word) {
    let w = normalize(word);
    if (w.length < 4) return w;
    for (const p of PREFIXES) {
      if (w.startsWith(p) && w.length - p.length >= 3) {
        w = w.slice(p.length);
        break;
      }
    }
    for (const s of SUFFIXES) {
      if (w.endsWith(s) && w.length - s.length >= 3) {
        w = w.slice(0, -s.length);
        break;
      }
    }
    return w;
  }

  // ═══════════════════════════════════════════
  // تحليل الاستعلام
  // ═══════════════════════════════════════════
  function parseQuery(q) {
    const included = [];
    const excluded = [];
    const exact = [];

    const quoted = q.match(/"([^"]+)"/g) || [];
    quoted.forEach(p => exact.push(p.slice(1, -1)));

    let rest = q.replace(/"[^"]+"/g, ' ');

    rest.split(/\s+/).forEach(w => {
      if (!w) return;
      if (w.startsWith('-') && w.length > 1) excluded.push(w.slice(1));
      else included.push(w);
    });

    return { included, excluded, exact };
  }

  // ═══════════════════════════════════════════
  // مطابقة صفحة واحدة
  // ═══════════════════════════════════════════
  function pageMatches(normContent, query, opts, contentForRoot) {
    // استبعاد
    for (const ex of query.excluded) {
      if (normContent.includes(normalize(ex))) return false;
    }

    // عبارات دقيقة
    if (query.exact.length) {
      return query.exact.every(p => normContent.includes(normalize(p)));
    }

    const terms = query.included.map(t => normalize(t)).filter(Boolean);
    if (!terms.length) return true;

    if (opts.mode === 'root') {
      const words = new Set(tokenize(contentForRoot).map(stem));
      const stems = terms.map(stem);
      return opts.operator === 'AND'
        ? stems.every(s => words.has(s))
        : stems.some(s => words.has(s));
    }

    return opts.operator === 'AND'
      ? terms.every(t => normContent.includes(t))
      : terms.some(t => normContent.includes(t));
  }

  // ═══════════════════════════════════════════
  // حساب الصلة
  // ═══════════════════════════════════════════
  function relevance(normContent, query) {
    let score = 0;
    for (const t of query.included) {
      const nt = normalize(t);
      if (!nt) continue;
      const count = normContent.split(nt).length - 1;
      if (count > 0) score += 10 + (count - 1) * 5;
    }
    for (const e of query.exact) {
      const ne = normalize(e);
      if (ne && normContent.includes(ne)) score += 30;
    }
    return score;
  }

  // ═══════════════════════════════════════════
  // مقتطف
  // ═══════════════════════════════════════════
  function makeSnippet(content, query, radius = 120) {
    if (!content) return '';
    const nc = normalize(content);
    const needles = [
      ...query.exact.map(normalize),
      ...query.included.map(normalize),
    ].filter(Boolean);

    let pos = -1, len = 0;
    for (const n of needles) {
      const p = nc.indexOf(n);
      if (p >= 0) { pos = p; len = n.length; break; }
    }

    // fallback: لا تطابق في النسخة المُطبَّعة → ابحث في النص الأصلي
    if (pos < 0) {
      for (const n of needles) {
        const p = content.toLowerCase().indexOf(n);
        if (p >= 0) { pos = p; len = n.length; break; }
      }
    }

    if (pos < 0) {
      return UI.esc(content.slice(0, radius * 2)) + '…';
    }

    const start = Math.max(0, pos - radius);
    const end = Math.min(content.length, pos + len + radius);
    let s = UI.esc(content.slice(start, end));

    // أبرز أول كلمة مطابقة
    const original = content.slice(pos, pos + len);
    if (original) {
      const re = new RegExp(
        original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'
      );
      s = s.replace(re, '<mark>$&</mark>');
    }

    if (start > 0) s = '… ' + s;
    if (end < content.length) s += ' …';
    return s;
  }

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  async function init() {
    Store.loadSettings();
    UI.applyAll();

    // حمّل الفصول
    state.chapters = await DB.getAll('chapters');
    state.chapters.sort((a, b) => {
      const d = (a.order_num || 0) - (b.order_num || 0);
      return d !== 0 ? d : (a.id - b.id);
    });
    state.chapterMap = Object.fromEntries(state.chapters.map(c => [c.id, c]));

    // ابنِ فهرس الأبناء
    state.chapters.forEach(c => {
      const pid = c.parent_id || '__root';
      (state.childrenByParent[pid] ||= []).push(c);
    });

    // املأ فلتر الفصول (بمسافة بادئة مرئية)
    const sel = document.getElementById('chapterFilter');
    state.chapters.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch.id;
      const indent = ch.depth > 1 ? '─ '.repeat(ch.depth - 1) : '';
      opt.textContent = indent + '📄 ' + ch.title;
      sel.appendChild(opt);
    });

    // استرجاع استعلام من URL
    const params = new URLSearchParams(location.search);
    const qFromUrl = params.get('q');
    if (qFromUrl) {
      document.getElementById('q').value = qFromUrl;
      setTimeout(() => runSearch(), 60);
    }

    // ربط الفورم
    document.getElementById('searchForm').addEventListener('submit', e => {
      e.preventDefault();
      runSearch();
    });

    // Enter في حقل البحث يعمل أيضًا
    document.getElementById('q').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runSearch();
      }
    });
  }

  // ═══════════════════════════════════════════
  // تحميل كل الصفحات دفعة واحدة
  // ═══════════════════════════════════════════
  async function loadAllPagesOnce() {
    if (state.allPagesLoaded) return;
    const t0 = performance.now();

    const allPages = await DB.getAll('pages');

    // فهرسة حسب chapter_id
    const byChapter = {};
    for (const p of allPages) {
      const cid = p.chapter_id;
      (byChapter[cid] ||= []).push({
        id: p.id,
        page_num: p.page_num || 0,
        content: p.content || '',
        _norm: normalize(p.content || ''),  // ← تسريع البحث
      });
    }
    state.pagesByChapter = byChapter;
    state.allPagesLoaded = true;

    console.log(`✅ حُمّلت ${allPages.length} صفحة في ${(performance.now() - t0).toFixed(0)}ms`);
  }

  // ═══════════════════════════════════════════
  // البحث
  // ═══════════════════════════════════════════
  async function runSearch() {
    // إلغاء البحث السابق
    if (state.abortController) {
      state.abortController.abort();
    }
    state.abortController = new AbortController();
    const signal = state.abortController.signal;

    const q = document.getElementById('q').value.trim();
    if (!q) { UI.toast('اكتب كلمة للبحث', 'warning'); return; }

    const opts = {
      mode: document.getElementById('mode').value,
      operator: document.getElementById('operator').value,
      chapterFilter: document.getElementById('chapterFilter').value,
      limit: parseInt(document.getElementById('limit').value, 10) || 50,
    };

    const query = parseQuery(q);
    const resultsWrap = document.getElementById('resultsList');
    const infoWrap = document.getElementById('resultsInfo');

    resultsWrap.innerHTML = '<div class="panel center"><div class="spinner"></div><p>جارٍ البحث…</p></div>';
    infoWrap.hidden = true;

    state.isSearching = true;
    state.lastQuery = q;
    const t0 = performance.now();

    try {
      // ─── 1) حمّل كل الصفحات مرة واحدة ───
      await loadAllPagesOnce();
      if (signal.aborted) throw new DOMException('أُلغي', 'AbortError');

      // ─── 2) حدد الفصول المطلوب فحصها ───
      let chaptersToScan;
      if (opts.chapterFilter) {
        const cid = parseInt(opts.chapterFilter, 10);
        chaptersToScan = collectWithChildren(cid);
      } else {
        chaptersToScan = state.chapters;
      }

      const chapterIds = new Set(chaptersToScan.map(c => c.id));

      // ─── 3) ابحث في الذاكرة ───
      const results = [];
      let scanned = 0;

      for (const cid in state.pagesByChapter) {
        const cidNum = parseInt(cid, 10);
        if (!chapterIds.has(cidNum)) continue;

        const pages = state.pagesByChapter[cid];
        const ch = state.chapterMap[cidNum];
        if (!ch) continue;

        for (const p of pages) {
          if (signal.aborted) throw new DOMException('أُلغي', 'AbortError');
          scanned++;

          if (pageMatches(p._norm, query, opts, p.content)) {
            results.push({
              page_id: p.id,
              chapter_id: cidNum,
              chapter_title: ch.title,
              depth: ch.depth || 1,
              score: relevance(p._norm, query),
              snippet: makeSnippet(p.content, query),
            });
          }
        }
      }

      if (signal.aborted) throw new DOMException('أُلغي', 'AbortError');

      // ─── 4) ترتيب وعرض ───
      results.sort((a, b) => b.score - a.score);
      const total = results.length;
      const shown = results.slice(0, opts.limit);
      const elapsed = ((performance.now() - t0) / 1000).toFixed(2);

      if (!total) {
        resultsWrap.innerHTML = `
          <div class="panel center">
            <p>❌ لا نتائج لـ <b>${UI.esc(q)}</b></p>
            <p class="muted">جرّب: إزالة التشكيل، كلمات أقل، أو "بحث بالجذور"</p>
          </div>`;
      } else {
        infoWrap.hidden = false;
        infoWrap.innerHTML = `
          <strong>${total.toLocaleString('ar-EG')}</strong>
          نتيجة لـ <mark>${UI.esc(q)}</mark>
          ${total > shown.length ? ` — عرض ${shown.length}` : ''}
          <span class="muted">· ${elapsed}s · فُحص ${scanned.toLocaleString('ar-EG')} مقطع</span>
        `;
        resultsWrap.innerHTML = shown.map(r => `
          <a class="result-card" href="reader.html?c=${r.chapter_id}">
            <div class="result-title">
              <span>📄 ${UI.esc(r.chapter_title)}</span>
              ${r.depth > 1 ? `<small>مستوى ${r.depth}</small>` : ''}
            </div>
            <p>${r.snippet}</p>
          </a>
        `).join('');
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        // أُلغي — تجاهل
        return;
      }
      console.error(err);
      resultsWrap.innerHTML = `<div class="panel center err"><p>❌ خطأ: ${UI.esc(err.message)}</p></div>`;
    } finally {
      state.isSearching = false;
    }
  }

  // ═══════════════════════════════════════════
  // أدوات مساعدة
  // ═══════════════════════════════════════════
  function collectWithChildren(cid) {
    const out = [];
    const stack = [cid];
    const seen = new Set();
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      const ch = state.chapterMap[id];
      if (!ch) continue;
      out.push(ch);
      const kids = state.childrenByParent[id] || [];
      kids.forEach(k => stack.push(k.id));
    }
    return out;
  }

  return { init };
})();