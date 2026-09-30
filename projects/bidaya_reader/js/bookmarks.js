/* ============================================================
   bookmarks.js — العلامات المرجعية
   ============================================================ */
const BookmarksPage = (() => {

  async function init() {
    Store.loadSettings();
    UI.applyAll();
    document.getElementById('exportBtn').addEventListener('click', exportAll);
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importFile);
    await render();
  }

  async function render() {
    const items = await DB.getAll('bookmarks');
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const list = document.getElementById('list');
    const label = document.getElementById('countLabel');
    label.textContent = `${items.length.toLocaleString('ar-EG')} علامة`;

    if (!items.length) {
      list.innerHTML = `
        <div class="empty panel">
          <p>⭐ لا توجد علامات بعد.</p>
          <p class="muted">أثناء القراءة اضغط ☆ لحفظ الموضع.</p>
        </div>`;
      return;
    }

    const html = [];
    for (const bm of items) {
      const ch = await DB.get('chapters', bm.chapter_id);
      if (!ch) continue;

      html.push(`
        <div class="bookmark-card" data-id="${bm.id}">
          <a href="reader.html?c=${bm.chapter_id}" class="bm-link">
            <strong>📄 ${UI.esc(ch.title)}</strong>
            <small>${UI.formatDate(bm.created_at)}</small>
          </a>
          <textarea class="bm-note" placeholder="أضف ملاحظة…">${UI.esc(bm.note || '')}</textarea>
          <div class="bm-actions">
            <button class="btn btn-sm btn-gold" data-act="save">💾 حفظ</button>
            <button class="btn btn-sm btn-light" data-act="delete">🗑 حذف</button>
          </div>
        </div>
      `);
    }
    list.innerHTML = html.join('');

    // ربط الأزرار
    list.querySelectorAll('.bookmark-card').forEach(card => {
      const id = parseInt(card.dataset.id, 10);
      card.querySelector('[data-act="save"]').addEventListener('click', async () => {
        const note = card.querySelector('.bm-note').value;
        const bm = await DB.get('bookmarks', id);
        bm.note = note;
        await DB.put('bookmarks', bm);
        UI.toast('💾 تم حفظ الملاحظة', 'success');
      });
      card.querySelector('[data-act="delete"]').addEventListener('click', async () => {
        if (!confirm('حذف العلامة؟')) return;
        await DB.del('bookmarks', id);
        UI.toast('🗑 تم الحذف', 'success');
        render();
      });
    });
  }

  async function exportAll() {
    const items = await DB.getAll('bookmarks');
    const enriched = [];
    for (const bm of items) {
      const ch = await DB.get('chapters', bm.chapter_id);
      enriched.push({ ...bm, chapter_title: ch?.title || '' });
    }
    const blob = new Blob(
      [JSON.stringify(enriched, null, 2)],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bidaya_bookmarks_${Date.now()}.json`;
    a.click();
    UI.toast('⬇ تم التصدير', 'success');
  }

  async function importFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      const items = JSON.parse(text);
      if (!Array.isArray(items)) throw new Error('ملف غير صالح');
      for (const it of items) {
        if (!it.chapter_id) continue;
        const { id, chapter_title, ...rest } = it;
        await DB.put('bookmarks', rest);
      }
      UI.toast(`⬆ تم استيراد ${items.length} علامة`, 'success');
      await render();
    } catch (err) {
      UI.toast('❌ ' + err.message, 'error');
    } finally {
      e.target.value = '';
    }
  }

  return { init };
})();
