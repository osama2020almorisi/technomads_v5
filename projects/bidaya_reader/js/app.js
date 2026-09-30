/* ============================================================
   app.js — منطق الصفحة الرئيسية (v3 — نهائي)
   - إصلاح: إزالة الاعتماد على Importer
   - معالجة أخطاء شاملة
   - عرض الإحصائيات بعد التحقق
   ============================================================ */
const App = (() => {

  async function initHome() {
    try {
      Store.loadSettings();
      UI.applyAll();
      bindTopbarButtons();

      // ✅ افحص وجود الكتاب عبر DB مباشرة (بدون Importer)
      const bookCount = await DB.count('book');

      if (!bookCount) {
        renderEmptyState();
        return;
      }

      await renderStats();
    } catch (err) {
      console.error('❌ initHome error:', err);
      UI.toast('خطأ في التحميل: ' + err.message, 'error', 5000);
      renderErrorState(err);
    }
  }

  function bindTopbarButtons() {
    document.getElementById('menuBtn')?.addEventListener('click', () => {
      location.href = 'about.html';
    });
    document.getElementById('themeBtn')?.addEventListener('click', () => {
      const cur = Store.get('theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      Store.set('theme', next);
      UI.applyTheme();
    });
  }

  function renderErrorState(err) {
    const titleEl = document.getElementById('heroTitle');
    const descEl = document.getElementById('heroDesc');
    const actionsEl = document.getElementById('heroActions');
    if (!titleEl) return;
    titleEl.textContent = 'حدث خطأ';
    descEl.textContent = err?.message || 'حاول إعادة تحميل الصفحة.';
    actionsEl.innerHTML = `
      <a class="btn btn-gold btn-lg" href="import.html">📥 استيراد الكتاب</a>
      <button class="btn btn-light" onclick="location.reload()">🔄 إعادة المحاولة</button>
    `;
  }

  function renderEmptyState() {
    const titleEl = document.getElementById('heroTitle');
    const descEl = document.getElementById('heroDesc');
    const actionsEl = document.getElementById('heroActions');
    if (!titleEl) return;

    titleEl.textContent = 'ابدأ بإضافة الكتاب';
    descEl.textContent = 'لم يتم استيراد الكتاب بعد. اختر ملف JSON للبدء.';

    actionsEl.innerHTML = `
      <a class="btn btn-gold btn-lg" href="import.html">
        📥 استيراد الكتاب
      </a>
      <a class="btn btn-light" href="about.html">
        ℹ️ حول التطبيق
      </a>
    `;

    // أخفِ الأقسام الفارغة
    const hideIds = ['statsGrid', 'quickGrid', 'recentHead', 'recentList'];
    hideIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
  }

  async function renderStats() {
    try {
      // ─── حمّل البيانات بالتوازي ───
      const [book, chapters, pages] = await Promise.all([
        DB.get('book', 1),
        DB.count('chapters'),
        DB.count('pages'),
      ]);

      const words = book?.stats?.words || 0;
      const chars = book?.stats?.chars || 0;

      // ─── Hero ───
      const titleEl = document.getElementById('heroTitle');
      const descEl = document.getElementById('heroDesc');
      const actionsEl = document.getElementById('heroActions');

      if (titleEl) titleEl.textContent = book?.title || 'البداية والنهاية';
      if (descEl) {
        descEl.textContent =
          (book?.author ? 'لـ ' + book.author + ' — ' : '') +
          'مخزّن في متصفحك. اضغط للبدء أو المتابعة.';
      }

      // ─── الأزرار (متابعة أو بدء) ───
      const lastProgress = await getLastProgress();
      const actions = [];

      if (lastProgress && lastProgress.chapter_id) {
        actions.push(`
          <a class="btn btn-gold btn-lg" href="reader.html?c=${lastProgress.chapter_id}">
            📖 متابعة القراءة
          </a>
        `);
      } else {
        actions.push(`
          <a class="btn btn-gold btn-lg" href="reader.html">
            🚀 ابدأ القراءة
          </a>
        `);
      }
      actions.push(`<a class="btn btn-light" href="import.html">🔄 استيراد جديد</a>`);
      if (actionsEl) actionsEl.innerHTML = actions.join('');

      // ─── الإحصائيات ───
      const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val.toLocaleString('ar-EG');
      };
      setText('statChapters', chapters);
      setText('statPages', pages);
      setText('statWords', words);
      setText('statChars', chars);

      const statsGrid = document.getElementById('statsGrid');
      if (statsGrid) statsGrid.hidden = false;

      // ─── الروابط السريعة ───
      const quickGrid = document.getElementById('quickGrid');
      if (quickGrid) quickGrid.hidden = false;

      // ─── آخر ما قرأت ───
      await renderRecent();

    } catch (err) {
      console.error('❌ renderStats error:', err);
      UI.toast('تعذّر تحميل الإحصائيات', 'error', 4000);
    }
  }

  async function renderRecent() {
    try {
      const recent = await DB.getAll('history');
      if (!recent.length) return;

      recent.sort((a, b) => new Date(b.visited_at) - new Date(a.visited_at));

      // آخر 5 فصول فريدة
      const seen = new Set();
      const top = [];
      for (const h of recent) {
        if (seen.has(h.chapter_id)) continue;
        seen.add(h.chapter_id);
        top.push(h);
        if (top.length >= 5) break;
      }

      const html = [];
      for (const h of top) {
        const ch = await DB.get('chapters', h.chapter_id);
        if (!ch) continue;
        html.push(`
          <a class="list-row" href="reader.html?c=${h.chapter_id}">
            <span class="row-num">📄</span>
            <span>
              <strong>${UI.esc(ch.title)}</strong>
              <small>${UI.formatDate(h.visited_at)}</small>
            </span>
            <span class="row-meta">→</span>
          </a>
        `);
      }

      if (html.length) {
        const list = document.getElementById('recentList');
        const head = document.getElementById('recentHead');
        if (list) {
          list.innerHTML = html.join('');
          list.hidden = false;
        }
        if (head) head.hidden = false;
      }
    } catch (err) {
      console.warn('renderRecent failed:', err);
    }
  }

  async function getLastProgress() {
    try {
      const items = await DB.getAll('progress');
      if (!items.length) return null;
      items.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      return items[0];
    } catch (_) {
      return null;
    }
  }

  return { initHome };
})();