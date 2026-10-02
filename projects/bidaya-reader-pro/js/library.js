/* ═══ منطق صفحة المكتبة ═══ */
(async () => {
  await Store.init();
  UI.initSidebar();
  UI.initThemeToggle();

  const grid = document.getElementById("books-grid");
  const empty = document.getElementById("library-empty");
  const searchInput = document.getElementById("library-search");
  const sortSelect = document.getElementById("sort-select");

  let allBooks = [];

  async function load() {
    allBooks = await DB.all("books");
    render();
  }

  function render() {
    const q = TextUtil.normalizeArabic(searchInput.value);
    let list = allBooks.filter((b) => {
      if (!q) return true;
      return TextUtil.normalizeArabic(b.title).includes(q) ||
             TextUtil.normalizeArabic(b.author || "").includes(q);
    });

    const sort = sortSelect.value;
    if (sort === "recent") list.sort((a, b) => (b.imported_at || 0) - (a.imported_at || 0));
    else if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title, "ar"));
    else if (sort === "words") list.sort((a, b) => (b.stats?.words || 0) - (a.stats?.words || 0));

    grid.innerHTML = "";
    if (!list.length) {
      empty.classList.remove("hidden");
      if (allBooks.length > 0 && q) {
        empty.querySelector("h3").textContent = "لا نتائج مطابقة";
        empty.querySelector("p").textContent = "جرّب كلمات بحث أخرى";
      } else {
        empty.querySelector("h3").textContent = "المكتبة فارغة";
        empty.querySelector("p").textContent = "استورد أول كتاب لتبدأ رحلتك";
      }
      return;
    }
    empty.classList.add("hidden");
    list.forEach((b) => grid.appendChild(UI.bookCard(b, {
      onDelete: async (book) => {
        allBooks = allBooks.filter((x) => x.id !== book.id);
        render();
      },
    })));
  }

  searchInput.addEventListener("input", render);
  sortSelect.addEventListener("change", render);

  await load();
})();