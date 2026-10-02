/* ═══ منطق صفحة الاستيراد ═══ */
(async () => {
  await Store.init();
  UI.initSidebar();
  UI.initThemeToggle();

  const zone = document.getElementById("drop-zone");
  const input = document.getElementById("file-input");
  const results = document.getElementById("import-results");

  zone.addEventListener("click", () => input.click());
  zone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") input.click(); });
  ["dragover", "dragenter"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("dragover"); }));
  zone.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));
  input.addEventListener("change", () => handleFiles(input.files));

  async function handleFiles(files) {
    for (const file of files) {
      const row = document.createElement("div");
      row.className = "card";
      row.style.cssText = "display:flex;align-items:center;gap:14px;margin-bottom:10px";
      row.innerHTML = `<div class="spinner"></div><div style="flex:1">
        <strong>${TextUtil.esc(file.name)}</strong><br>
        <small style="color:var(--text-secondary)" class="status">جاري الاستيراد…</small></div>`;
      results.prepend(row);
      try {
        const res = await Importer.importFile(file);
        row.querySelector(".spinner").outerHTML = `<span class="badge badge-green">✓ ${res.format}</span>`;
        row.querySelector(".status").textContent =
          `تم الاستيراد: ${res.stats.chapters} فصلاً · ${res.stats.pages} صفحة · ${TextUtil.formatNum(res.stats.words)} كلمة`;
        row.style.cursor = "pointer";
        row.onclick = () => location.href = `reader.html?book=${res.bookId}`;
        UI.toast(`اكتمل استيراد «${res.book.title}»`, "success");
      } catch (e) {
        row.querySelector(".spinner").outerHTML = `<span class="badge badge-red">✗</span>`;
        row.querySelector(".status").textContent = e.message;
        row.querySelector(".status").style.color = "var(--danger)";
        UI.toast("فشل استيراد " + file.name + ": " + e.message, "error", 5000);
      }
    }
    input.value = "";
  }

  // إنشاء كتاب فارغ
  document.getElementById("create-book-btn").addEventListener("click", async () => {
    const title = document.getElementById("new-book-title").value.trim();
    if (!title) { UI.toast("أدخل عنوان الكتاب أولاً", "warning"); return; }
    try {
      const loading = UI.showLoading("إنشاء الكتاب…");
      const bid = await BookAPI.createBook(
        { title, author: document.getElementById("new-book-author").value.trim(),
          publisher: "", language: "ar", cover: null, description: "", imported_at: Date.now() },
        [{ _tmp: "c0", parent_id: null, title: "المقدمة", order_num: 0, depth: 0 }],
        [{ _tmpChapter: "c0", page_num: 1, word_count: 0, content: "<p></p>" }],
        (p, m) => { loading.setProgress(p); loading.setText(m); });
      loading.hide();
      UI.toast("تم إنشاء الكتاب — يمكنك الآن تحريره", "success");
      location.href = `editor.html?book=${bid}`;
    } catch (e) { UI.toast("خطأ: " + e.message, "error"); }
  });
})();