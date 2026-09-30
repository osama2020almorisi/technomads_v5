/* ============================================================
   reader.js — القارئ (v4 — إصلاح الشجرة متعددة المستويات)
   الإصلاحات في هذه النسخة:
   - loadLazyChildren: تمرير parentDepth الصحيح
   - العقد الفرعية تُبنى بمستوياتها الحقيقية عند التوسيع
   ============================================================ */
const Reader = (() => {

  const state = {
    chapters: [],
    chaptersByParent: {},
    chapterMap: {},
    readableChapters: [],
    readableIndex: {},
    pagesByChapter: {},
    currentChapter: null,
    currentPageIndex: 0,
    currentPages: [],
    bookmarks: new Set(),
    textPages: [],
    isOpening: false,
  };

  const $ = id => document.getElementById(id);

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  async function init() {
    try {
      Store.loadSettings();
      UI.applyAll();
      bindEvents();

      const book = await DB.get('book', 1);
      if (!book) {
        showEmptyState();
        return;
      }

      await loadData();
      buildSidebar();

      const urlParams = new URLSearchParams(location.search);
      const cid = urlParams.get('c');

      if (cid) {
        await openChapter(parseInt(cid, 10));
      } else {
        await showHero();
      }
    } catch (e) {
      console.error('❌ Reader init error:', e);
      UI.toast('خطأ في التحميل: ' + e.message, 'error', 5000);
    }
  }

  function showEmptyState() {
    const tree = $('tocTree');
    if (tree) {
      tree.innerHTML = `
        <div style="padding:20px;text-align:center">
          <p style="color:#fca5a5">⚠️ لا يوجد كتاب</p>
          <a href="import.html" style="display:inline-block;padding:10px 20px;background:#c79b3b;color:#000;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:10px">
            📥 استيراد
          </a>
        </div>`;
    }
    const hero = $('readerHero');
    if (hero) {
      hero.innerHTML = `
        <div>
          <h1>لا يوجد كتاب مستورد</h1>
          <p>اضغط للانتقال إلى صفحة الاستيراد.</p>
          <a href="import.html" style="display:inline-block;padding:14px 24px;background:#c79b3b;color:#000;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;margin-top:12px">
            📥 استيراد الكتاب
          </a>
        </div>`;
    }
  }

  // ═══════════════════════════════════════════
  // LOAD DATA
  // ═══════════════════════════════════════════
  async function loadData() {
    const chapters = await DB.getAll('chapters');
    console.log(`📚 Loaded ${chapters.length} chapters`);

    chapters.sort((a, b) => {
      const d = (a.order_num || 0) - (b.order_num || 0);
      return d !== 0 ? d : (a.id - b.id);
    });

    state.chapters = chapters;
    state.chapterMap = Object.fromEntries(chapters.map(c => [c.id, c]));

    // شجرة parent → children
    const byParent = {};
    chapters.forEach(c => {
      const pid = c.parent_id || '__root';
      (byParent[pid] ||= []).push(c);
    });
    state.chaptersByParent = byParent;

    // فهرس الفصول القابلة للقراءة
    state.readableChapters = chapters.filter(
      c => !(byParent[c.id]?.length)
    );
    state.readableIndex = Object.fromEntries(
      state.readableChapters.map((c, i) => [c.id, i])
    );

    // العلامات
    try {
      const bms = await DB.getAll('bookmarks');
      state.bookmarks = new Set(bms.map(b => b.chapter_id));
    } catch (_) {
      state.bookmarks = new Set();
    }

    const sub = $('tocSubtitle');
    if (sub) sub.textContent = `${chapters.length.toLocaleString('ar-EG')} فصلًا`;

    console.log(`🌳 Roots: ${(byParent['__root'] || []).length}`);
  }

  // ═══════════════════════════════════════════
  // SIDEBAR — بناء تدريجي
  // ═══════════════════════════════════════════
  function buildSidebar() {
    const roots = state.chaptersByParent['__root'] || [];
    const tree = $('tocTree');
    if (!tree) return;

    if (!roots.length) {
      tree.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8">لا توجد فصول</div>';
      return;
    }

    let html = '';
    for (const root of roots) {
      html += renderNode(root, 0);
    }
    tree.innerHTML = html;

    attachAllEvents();
  }

  function renderNode(node, depth) {
    const kids = state.chaptersByParent[node.id] || [];
    const hasKids = kids.length > 0;
    const title = UI.esc(node.title);
    const searchKey = UI.esc((node.title || '').toLowerCase())
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;');

    const arrow = hasKids ? (depth < 1 ? '▾' : '▸') : '•';
    const cls = hasKids ? '' : 'leaf';

    let html = `
      <div class="toc-node" data-id="${node.id}" data-depth="${depth}" data-search="${searchKey}">
        <button class="toc-toggle ${cls}" type="button" aria-label="فتح/إغلاق">
          ${arrow}
        </button>
        <a class="toc-link" href="#" data-id="${node.id}">
          <span class="toc-marker">${hasKids ? '📂' : '📄'}</span>
          <span class="toc-label">${title}</span>
        </a>
      </div>
    `;

    if (hasKids) {
      // ✅ المستوى 0 (الجذور): نبني مستوى 1 فورًا مفتوحًا
      // ✅ المستويات 2+: lazy loading (يُبنى عند الضغط)
      if (depth < 1) {
        html += `<div class="toc-children open" data-parent="${node.id}">`;
        for (const k of kids) {
          html += renderNode(k, depth + 1);
        }
        html += `</div>`;
      } else {
        html += `<div class="toc-children" data-parent="${node.id}" data-lazy="1" data-depth="${depth + 1}"></div>`;
      }
    }

    return html;
  }

  /**
   * ✅ إصلاح: استقبل parentDepth ومرّره للأبناء
   */
  function loadLazyChildren(node, parentDepth = 1) {
    const kids = state.chaptersByParent[node.id] || [];
    if (!kids.length) return '';

    let html = '';
    for (const k of kids) {
      html += renderNode(k, parentDepth);
    }
    return html;
  }

  function attachAllEvents() {
    const tree = $('tocTree');
    if (!tree) return;
    if (tree.dataset.bound === '1') return;
    tree.dataset.bound = '1';

    tree.addEventListener('click', e => {
      // زر الفتح/الإغلاق
      const toggle = e.target.closest('.toc-toggle');
      if (toggle && !toggle.classList.contains('leaf')) {
        e.preventDefault();
        e.stopPropagation();

        const node = toggle.closest('.toc-node');
        const kids = node.nextElementSibling;
        if (!kids || !kids.classList.contains('toc-children')) return;

        // Lazy loading
        if (kids.dataset.lazy === '1' && !kids.dataset.loaded) {
          const chapterId = parseInt(node.dataset.id, 10);
          const chapter = state.chapterMap[chapterId];
          if (chapter) {
            // ✅ مرر العمق الحقيقي للفصل الأب
            const parentDepth = chapter.depth || 1;
            kids.innerHTML = loadLazyChildren(chapter, parentDepth);
            kids.dataset.loaded = '1';
            kids.dataset.lazy = '0';
          }
        }

        const open = kids.classList.toggle('open');
        toggle.textContent = open ? '▾' : '▸';
        return;
      }

      // فتح فصل
      const link = e.target.closest('.toc-link');
      if (link) {
        e.preventDefault();
        const id = parseInt(link.dataset.id, 10);
        openChapter(id);
        if (window.innerWidth < 900) UI.closeSidebar();
      }
    });

    // البحث في الفهرس
    const searchInput = $('tocSearch');
    if (searchInput) {
      let timer;
      searchInput.addEventListener('input', e => {
        clearTimeout(timer);
        timer = setTimeout(() => filterToc(e.target.value.trim().toLowerCase()), 250);
      });
    }
  }

  function filterToc(q) {
    const tree = $('tocTree');
    if (!tree) return;
    const nodes = tree.querySelectorAll('.toc-node');

    if (!q) {
      nodes.forEach(n => n.style.display = '');
      return;
    }

    nodes.forEach(n => n.style.display = 'none');

    nodes.forEach(node => {
      const hay = node.dataset.search || '';
      if (hay.includes(q)) {
        node.style.display = '';
        let p = node.parentElement;
        while (p && p !== tree) {
          if (p.classList.contains('toc-children')) {
            p.classList.add('open');
            const prev = p.previousElementSibling;
            if (prev && prev.classList.contains('toc-node')) {
              prev.style.display = '';
              const tg = prev.querySelector('.toc-toggle');
              if (tg && !tg.classList.contains('leaf')) tg.textContent = '▾';
            }
          } else if (p.classList.contains('toc-node')) {
            p.style.display = '';
          }
          p = p.parentElement;
        }
      }
    });
  }

  function highlightToc(chapterId) {
    document.querySelectorAll('.toc-link.active').forEach(a => a.classList.remove('active'));
    const link = document.querySelector(`.toc-link[data-id="${chapterId}"]`);
    if (!link) return;

    link.classList.add('active');

    let p = link.closest('.toc-children');
    while (p) {
      p.classList.add('open');
      const prev = p.previousElementSibling;
      if (prev && prev.classList.contains('toc-node')) {
        const tg = prev.querySelector('.toc-toggle');
        if (tg && !tg.classList.contains('leaf')) tg.textContent = '▾';
      }
      p = p.parentElement?.closest('.toc-children');
    }

    try {
      link.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (_) {}
  }

  // ═══════════════════════════════════════════
  // OPEN CHAPTER
  // ═══════════════════════════════════════════
  async function openChapter(chapterId) {
    if (state.isOpening) return;
    state.isOpening = true;

    try {
      const ch = state.chapterMap[chapterId];
      if (!ch) {
        UI.toast('❌ الفصل غير موجود', 'error');
        return;
      }

      $('readerHero').hidden = true;
      $('readerView').hidden = false;
      $('readerText').innerHTML = '<div class="spinner"></div>';

      const pages = await DB.byIndex('pages', 'chapter_id', chapterId);
      pages.sort((a, b) => (a.page_num || 0) - (b.page_num || 0));

      state.currentChapter = ch;
      state.currentPages = pages;

      const fullText = pages.map(p => p.content).join('\n\n');
      const size = Store.get('pageSize') || 2000;
      state.textPages = paginate(fullText, size);

      const progress = await DB.get('progress', chapterId);
      state.currentPageIndex = progress ? (progress.page_index || 0) : 0;
      if (state.currentPageIndex >= state.textPages.length) {
        state.currentPageIndex = 0;
      }

      $('chapterTitle').textContent = ch.title;
      const wordCount = fullText.split(/\s+/).filter(Boolean).length;
      $('chapterMeta').textContent =
        `${pages.length.toLocaleString('ar-EG')} صفحة · ${wordCount.toLocaleString('ar-EG')} كلمة`;

      $('breadcrumbs').innerHTML = buildBreadcrumbs(ch);
      $('readerTitle').textContent = ch.title;

      updateBookmarkBtn();
      renderPage();

      await DB.put('history', {
        chapter_id: chapterId,
        visited_at: new Date().toISOString(),
      });

      try {
        history.replaceState(null, '', `reader.html?c=${chapterId}`);
      } catch (_) {}

      highlightToc(chapterId);

      const scrollY = progress?.scroll_y || 0;
      window.scrollTo({ top: scrollY, behavior: 'auto' });
    } finally {
      state.isOpening = false;
    }
  }

  function buildBreadcrumbs(ch) {
    const path = [];
    let cur = ch;
    let guard = 0;
    while (cur && cur.parent_id && guard++ < 20) {
      cur = state.chapterMap[cur.parent_id];
      if (cur) path.unshift(cur);
    }
    return path.map(c =>
      `<a href="#" data-id="${c.id}" class="crumb">${UI.esc(c.title)}</a>`
    ).join(' <span>›</span> ');
  }

  // ═══════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════
  function paginate(text, size) {
    if (!text) return [''];
    size = Math.max(500, size);

    const paragraphs = text.split(/\n\n+/);
    const pages = [];
    let cur = '';
    let safety = 0;

    for (const p of paragraphs) {
      if ((cur + '\n\n' + p).length > size && cur) {
        pages.push(cur.trim());
        cur = p;
      } else {
        cur = cur ? (cur + '\n\n' + p) : p;
      }

      let innerSafety = 0;
      while (cur.length > size * 1.5 && innerSafety++ < 200) {
        let cut = cur.lastIndexOf(' ', size);
        if (cut < size * 0.5) cut = size;
        pages.push(cur.slice(0, cut).trim());
        cur = cur.slice(cut).trim();
      }

      if (++safety > 100000) {
        console.warn('⚠️ paginate: safety limit reached');
        break;
      }
    }

    if (cur.trim()) pages.push(cur.trim());
    return pages.length ? pages : [''];
  }

  function renderPage() {
    const page = state.textPages[state.currentPageIndex] || '';
    const txt = $('readerText');
    if (!txt) return;
    txt.innerHTML = page
      .split('\n\n')
      .map(p => `<p>${UI.esc(p)}</p>`)
      .join('');
    updateProgressBar();
  }

  function updateProgressBar() {
    const total = state.textPages.length;
    const cur = state.currentPageIndex + 1;
    const pct = total ? Math.round((cur / total) * 100) : 0;

    const bar = $('readerProgress');
    if (bar) bar.style.width = pct + '%';

    const info = $('readerPageInfo');
    if (info) info.textContent = `${cur} / ${total}`;

    const prevBtn = $('prevBtn');
    const nextBtn = $('nextBtn');
    if (prevBtn) prevBtn.disabled = state.currentPageIndex === 0 && !getPrevChapter();
    if (nextBtn) nextBtn.disabled = state.currentPageIndex === total - 1 && !getNextChapter();
  }

  function getPrevChapter() {
    if (!state.currentChapter) return null;
    const idx = state.readableIndex[state.currentChapter.id];
    if (idx == null || idx <= 0) return null;
    return state.readableChapters[idx - 1] || null;
  }

  function getNextChapter() {
    if (!state.currentChapter) return null;
    const idx = state.readableIndex[state.currentChapter.id];
    if (idx == null || idx >= state.readableChapters.length - 1) return null;
    return state.readableChapters[idx + 1] || null;
  }

  function nextPage() {
    if (state.currentPageIndex < state.textPages.length - 1) {
      state.currentPageIndex++;
      renderPage();
      saveProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const next = getNextChapter();
      if (next) openChapter(next.id);
    }
  }

  function prevPage() {
    if (state.currentPageIndex > 0) {
      state.currentPageIndex--;
      renderPage();
      saveProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const prev = getPrevChapter();
      if (prev) openChapter(prev.id);
    }
  }

  async function saveProgress() {
    if (!state.currentChapter) return;
    try {
      await DB.put('progress', {
        chapter_id: state.currentChapter.id,
        page_index: state.currentPageIndex,
        scroll_y: window.scrollY || 0,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('saveProgress failed:', e);
    }
  }

  // ═══════════════════════════════════════════
  // BOOKMARKS
  // ═══════════════════════════════════════════
  function updateBookmarkBtn() {
    const btn = $('bookmarkBtn');
    if (!btn || !state.currentChapter) return;
    if (state.bookmarks.has(state.currentChapter.id)) {
      btn.textContent = '★';
      btn.classList.add('active');
    } else {
      btn.textContent = '☆';
      btn.classList.remove('active');
    }
  }

  async function toggleBookmark() {
    if (!state.currentChapter) return;
    const cid = state.currentChapter.id;
    const bms = await DB.getAll('bookmarks');
    const existing = bms.find(b => b.chapter_id === cid);

    if (existing) {
      await DB.del('bookmarks', existing.id);
      state.bookmarks.delete(cid);
      UI.toast('☆ أُزيلت العلامة', 'info');
    } else {
      await DB.put('bookmarks', {
        chapter_id: cid,
        note: '',
        created_at: new Date().toISOString(),
      });
      state.bookmarks.add(cid);
      UI.toast('★ أُضيفت العلامة', 'success');
    }
    updateBookmarkBtn();
  }

  // ═══════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════
  let searchTimer = null;
  let searchAbort = null;

  async function quickSearch(query) {
    if (searchAbort) searchAbort.abort();
    searchAbort = new AbortController();
    const signal = searchAbort.signal;

    const q = query.trim();
    if (q.length < 2) {
      $('searchResults').innerHTML = '<p class="muted center">اكتب حرفين على الأقل</p>';
      return;
    }
    $('searchResults').innerHTML = '<div class="spinner"></div>';

    const results = [];
    const norm = s => String(s || '')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');

    const nq = norm(q);

    try {
      for (const ch of state.chapters) {
        if (signal.aborted) return;
        const pages = await DB.byIndex('pages', 'chapter_id', ch.id);
        for (const p of pages) {
          if (signal.aborted) return;
          const idx = norm(p.content).indexOf(nq);
          if (idx >= 0) {
            results.push({
              chapter_id: ch.id,
              chapter_title: ch.title,
              snippet: buildSnippet(p.content, idx, q.length),
            });
            if (results.length >= 30) break;
          }
        }
        if (results.length >= 30) break;
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
      throw e;
    }

    if (signal.aborted) return;

    if (!results.length) {
      $('searchResults').innerHTML = '<p class="muted center">لا نتائج</p>';
      return;
    }

    $('searchResults').innerHTML = results.map(r => `
      <a class="search-result" href="reader.html?c=${r.chapter_id}">
        <strong>${UI.esc(r.chapter_title)}</strong>
        <p>${r.snippet}</p>
      </a>
    `).join('');
  }

  function buildSnippet(text, idx, len) {
    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + len + 60);
    let s = text.slice(start, end);
    const matched = text.slice(idx, idx + len);
    if (!matched) return UI.esc(s);
    const re = new RegExp(matched.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    s = UI.esc(s).replace(re, '<mark>$&</mark>');
    if (start > 0) s = '… ' + s;
    if (end < text.length) s += ' …';
    return s;
  }

  // ═══════════════════════════════════════════
  // HERO
  // ═══════════════════════════════════════════
  async function showHero() {
    $('readerHero').hidden = false;
    $('readerView').hidden = true;

    const book = await DB.get('book', 1);
    $('heroTitle').textContent = book?.title || 'البداية والنهاية';

    const progresses = await DB.getAll('progress');
    if (progresses.length) {
      progresses.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      const last = progresses[0];
      const ch = state.chapterMap[last.chapter_id];
      if (ch) {
        $('heroDesc').textContent = `آخر قراءة: ${ch.title}`;
        const btn = $('continueBtn');
        btn.hidden = false;
        btn.onclick = () => openChapter(last.chapter_id);
      }
    } else {
      $('heroDesc').textContent = 'اختر فصلًا من الفهرس أو ابدأ من الأول.';
      $('continueBtn').hidden = true;
    }
  }

  // ═══════════════════════════════════════════
  // EVENTS
  // ═══════════════════════════════════════════
  function bindEvents() {
    $('menuBtn').addEventListener('click', UI.toggleSidebar);
    $('tocClose').addEventListener('click', UI.closeSidebar);
    $('sidebarOverlay').addEventListener('click', UI.closeSidebar);

    $('themeBtn').addEventListener('click', () => {
      const cur = Store.get('theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      Store.set('theme', next);
      UI.applyTheme();
    });

    $('prevBtn').addEventListener('click', prevPage);
    $('nextBtn').addEventListener('click', nextPage);

    $('startReadingBtn').addEventListener('click', () => {
      const first = state.readableChapters[0];
      if (first) openChapter(first.id);
    });

    $('bookmarkBtn').addEventListener('click', toggleBookmark);

    $('clearProgressBtn').addEventListener('click', async () => {
      if (!state.currentChapter) return;
      if (!confirm('حذف تقدم القراءة لهذا الفصل؟')) return;
      await DB.del('progress', state.currentChapter.id);
      state.currentPageIndex = 0;
      renderPage();
      UI.toast('🗑️ تم الحذف', 'success');
    });

    $('searchBtn').addEventListener('click', () => {
      $('searchModal').classList.add('open');
      setTimeout(() => $('searchInput').focus(), 100);
    });
    $('searchClose').addEventListener('click', () => {
      $('searchModal').classList.remove('open');
    });
    $('searchInput').addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => quickSearch(e.target.value), 400);
    });

    $('fontBtn').addEventListener('click', () => {
      const s = Store.all();
      $('setFontSize').value = s.fontSize;
      $('setFontFamily').value = s.fontFamily;
      $('setPaper').value = s.paper;
      $('setTheme').value = s.theme;
      $('fontModal').classList.add('open');
    });
    $('fontClose').addEventListener('click', () => {
      $('fontModal').classList.remove('open');
    });

    ['setFontSize', 'setFontFamily', 'setPaper', 'setTheme'].forEach(id => {
      $(id).addEventListener('change', e => {
        const key = {
          setFontSize: 'fontSize',
          setFontFamily: 'fontFamily',
          setPaper: 'paper',
          setTheme: 'theme',
        }[id];
        Store.set(key, e.target.value);
        UI.applyAll();
      });
    });

    document.querySelectorAll('.modal').forEach(m => {
      m.addEventListener('click', e => {
        if (e.target === m) m.classList.remove('open');
      });
    });

    document.addEventListener('keydown', e => {
      if (e.target.matches('input, textarea, select')) return;

      if (e.key === 'ArrowLeft') nextPage();
      else if (e.key === 'ArrowRight') prevPage();
      else if (e.key === 'Escape') {
        $('searchModal').classList.remove('open');
        $('fontModal').classList.remove('open');
      }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        $('searchModal').classList.add('open');
        setTimeout(() => $('searchInput').focus(), 100);
      }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = getPrevChapter();
        if (prev) openChapter(prev.id);
      }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
        e.preventDefault();
        const next = getNextChapter();
        if (next) openChapter(next.id);
      }
    });

    // Swipe
    let startX = 0, startY = 0;
    document.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      if (!$('readerView').offsetParent) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 80 && Math.abs(dy) < 60) {
        if (dx < 0) nextPage();
        else prevPage();
      }
    }, { passive: true });

    // Breadcrumbs
    document.body.addEventListener('click', e => {
      const crumb = e.target.closest('.crumb');
      if (crumb) {
        e.preventDefault();
        openChapter(parseInt(crumb.dataset.id, 10));
      }
    });

    // حفظ دوري كل 30 ثانية
    setInterval(() => {
      if (state.currentChapter && !document.hidden) saveProgress();
    }, 30000);
  }

  return { init };
})();