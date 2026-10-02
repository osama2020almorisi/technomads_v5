/* ═══ منطق الصفحة الرئيسية ═══ */
(async () => {
  try {
    await Store.init();
    UI.initSidebar();
    UI.initThemeToggle();
    const books = (await DB.all("books")).sort((a, b) => (b.imported_at || 0) - (a.imported_at || 0));
    // الإحصائيات
    let totalCh = 0, totalWords = 0;
    books.forEach((b) => { totalCh += b.stats?.chapters || 0; totalWords += b.stats?.words || 0; });
    document.getElementById("stat-books").textContent = books.length;
    document.getElementById("stat-chapters").textContent = totalCh;
    document.getElementById("stat-words").textContent = TextUtil.formatNum(totalWords);
    document.getElementById("stat-bookmarks").textContent = await DB.count("bookmarks");
    // أحدث الكتب
    const grid = document.getElementById("recent-books");
    const recent = books.slice(0, 6);
    document.getElementById("no-books").classList.toggle("hidden", books.length > 0);
    recent.forEach((b) => grid.appendChild(UI.bookCard(b)));
  } catch (e) {
    console.error(e);
    UI.toast("حدث خطأ أثناء تحميل المكتبة: " + e.message, "error");
  }
})();