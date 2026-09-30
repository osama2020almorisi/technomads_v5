/* ============================================================
   settings.js — منطق صفحة الإعدادات
   ============================================================ */
const SettingsPage = (() => {

  async function init() {
    Store.loadSettings();
    UI.applyAll();
    bindInputs();
    await renderInfo();
    setupPWAInstall();
  }

  function bindInputs() {
    const s = Store.all();

    const map = {
      theme: 'theme',
      paper: 'paper',
      fontSize: 'fontSize',
      fontFamily: 'fontFamily',
      pageSize: 'pageSize',
      resultsPerPage: 'resultsPerPage',
    };

    for (const [id, key] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.value = s[key];
      el.addEventListener('change', () => {
        let v = el.value;
        if (id === 'pageSize' || id === 'resultsPerPage') v = parseInt(v, 10) || 2000;
        Store.set(key, v);
        UI.applyAll();
        UI.toast('✅ حُفظ', 'success', 1200);
      });
    }

    // إعادة تعيين
    document.getElementById('resetBtn').addEventListener('click', () => {
      if (!confirm('إعادة كل الإعدادات للوضع الافتراضي؟')) return;
      Store.reset();
      UI.applyAll();
      for (const [id, key] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) el.value = Store.get(key);
      }
      UI.toast('🔄 أُعيدت الإعدادات', 'success');
    });

    // تصدير الكل
    document.getElementById('exportAllBtn').addEventListener('click', exportAll);
  }

  async function renderInfo() {
    const book = await DB.get('book', 1);
    const stats = await DB.stats();
    const s = Store.all();

    document.getElementById('bookInfo').textContent = book?.title || '—';
    document.getElementById('chaptersInfo').textContent =
      (stats.chapters || 0).toLocaleString('ar-EG');
    document.getElementById('pagesInfo').textContent =
      (stats.pages || 0).toLocaleString('ar-EG');
    document.getElementById('bmInfo').textContent =
      (stats.bookmarks || 0).toLocaleString('ar-EG');
    document.getElementById('histInfo').textContent =
      (stats.history || 0).toLocaleString('ar-EG');
  }

  async function exportAll() {
    const bookmarks = await DB.getAll('bookmarks');
    const history = await DB.getAll('history');
    const progress = await DB.getAll('progress');

    const data = {
      version: 1,
      exported_at: new Date().toISOString(),
      settings: Store.all(),
      bookmarks,
      history,
      progress,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bidaya_backup_${Date.now()}.json`;
    a.click();
    UI.toast('⬇ تم التصدير', 'success');
  }

  // ═══ PWA Install ═══
  let deferredPrompt = null;
  function setupPWAInstall() {
    const btn = document.getElementById('installPwaBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      btn.hidden = false;
    });

    btn?.addEventListener('click', async () => {
      if (!deferredPrompt) {
        UI.toast('📱 التطبيق مثبّت أو غير مدعوم', 'info');
        return;
      }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') UI.toast('✅ تم التثبيت', 'success');
      deferredPrompt = null;
      btn.hidden = true;
    });

    if (matchMedia('(display-mode: standalone)').matches) {
      btn.hidden = true;
    }
  }

  return { init };
})();
