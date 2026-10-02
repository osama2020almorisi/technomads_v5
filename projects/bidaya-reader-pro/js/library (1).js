/* ═══ منطق صفحة المكتبة ═══ */
(async () => {
  await Store.init();
  UI.initSidebar();
  UI.initThemeToggle();
  const grid = document.getElementById("books-grid");
  const empty = document.getElementById("library-empty");
  const searchInput = document.getElementById("library-search");
  const sortSelect = document.getElementById("sort-select");
  let books = [];

  async function load() {
    try {
      books = await DB.all("books");
      render();
    } catch (e) {
      UI.toast("خطأ في تحميل المكتبة: " + e.message, "error");
    }
  }

  function render() {
    const q = TextUtil.normalizeArabic(searchInput.value || "");
    let list = books.filter((b) =>
      !q || TextUtil.normalizeArabic(b.title).includes(q) ||
      TextUtil.normalizeArabic(b.author || "").includes(q));
    const sort = sortSelect.value;
    if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title, "ar"));
    else if (sort === "words") list.sort((a, b) => (b.stats?.words || 0) - (a.stats?.words || 0));
    else list.sort((a, b) => (b.imported_at || 0) - (a.imported_at || 0));
    grid.innerHTML = "";
    empty.classList.toggle("hidden", list.length > 0);
    list.forEach((b) => grid.appendChild(UI.bookCard(b)));
  }

  searchInput.addEventListener("input", render);
  sortSelect.addEventListener("change", render);
  await load();
})();
