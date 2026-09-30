/* ============================================================
   history.js — سجل القراءة
   ============================================================ */
const HistoryPage = (() => {

  async function init() {
    Store.loadSettings();
    UI.applyAll();
    document.getElementById('clearBtn').addEventListener('click', clearAll);
    await render();
  }

  async function render() {
    const items = await DB.getAll('history');
    items.sort((a, b) => new Date(b.visited_at) - new Date(a.visited_at));

    // احتفظ بآخر 200 فقط
    const recent = items.slice(0, 200);
    const label = document.getElementById('countLabel');
    label.textContent = `${items.length.toLocaleString('ar-EG')} زيارة`;

    const list = document.getElementById('list');
    if (!recent.length) {
      list.innerHTML = `<div class="empty">السجل فارغ.</div>`;
      return;
    }

    // جمّع بكل فصل
    const seen = new Set();
    const unique = [];
    for (const h of recent) {
      if (seen.has(h.chapter_id)) continue;
      seen.add(h.chapter_id);
      unique.push(h);
    }

    const html = [];
    for (const h of unique) {
      const ch = await DB.get('chapters', h.chapter_id);
      if (!ch) continue;
      html.push(`
        <a class="list-row" href="reader.html?c=${h.chapter_id}">
          <span class="row-num">📄</span>
          <span>
            <strong>${UI.esc(ch.title)}</strong>
            <small>${UI.formatDate(h.visited_at)}</small>
          </span>
          <span class="row-meta">← فتح</span>
        </a>
      `);
    }
    list.innerHTML = html.join('');
  }

  async function clearAll() {
    if (!confirm('حذف كل سجل القراءة؟')) return;
    await DB.clear('history');
    UI.toast('🗑 تم الحذف', 'success');
    render();
  }

  return { init };
})();
