/* ═══ منطق صفحة سجل القراءة ═══ */
(async () => {
  await Store.init();
  UI.initSidebar && UI.initSidebar();
  UI.initThemeToggle();

  const list = document.getElementById("history-list");
  const clearBtn = document.getElementById("clear-history");

  // ═══ تحميل السجل ═══
  async function load() {
    list.innerHTML = "";
    try {
      const hist = await DB.all("history");

      if (!hist.length) {
        renderEmpty("السجل فارغ", "ستظهر هنا الفصول التي قرأتها مؤخراً");
        return;
      }

      // تجميع آخر زيارة لكل فصل (نتجاهل التكرار)
      const latest = new Map();
      hist.forEach((h) => {
        const k = h.chapter_id;
        const prev = latest.get(k);
        if (!prev || (h.visited_at || 0) > (prev.visited_at || 0)) {
          latest.set(k, h);
        }
      });

      const rows = [...latest.values()]
        .sort((a, b) => (b.visited_at || 0) - (a.visited_at || 0))
        .slice(0, 100);

      if (!rows.length) {
        renderEmpty("السجل فارغ", "ستظهر هنا الفصول التي قرأتها مؤخراً");
        return;
      }

      // ✅ جلب كل الكتب والفصول مرة واحدة (بدل 200 استعلام تسلسلي)
      const allBooksMap = new Map();
      const allChaptersMap = new Map();

      const [allBooks, allChapters] = await Promise.all([
        DB.all("books"),
        DB.all("chapters"),
      ]);
      allBooks.forEach((b) => allBooksMap.set(b.id, b));
      allChapters.forEach((c) => allChaptersMap.set(c.id, c));

      // تجميع حسب اليوم لعرض أنيق
      const groups = groupByDay(rows);

      groups.forEach((group) => {
        // عنوان المجموعة (اليوم)
        const groupHeader = document.createElement("div");
        groupHeader.className = "history-group-header";
        groupHeader.style.cssText = `
          display:flex;align-items:center;gap:10px;
          margin:20px 0 10px;padding:0 4px;
          font-size:.82rem;color:var(--text-muted);font-weight:700;
        `;
        groupHeader.innerHTML = `
          <span style="flex:1;height:1px;background:var(--border)"></span>
          <span style="padding:0 12px;white-space:nowrap">${group.label}</span>
          <span style="flex:1;height:1px;background:var(--border)"></span>
        `;
        list.appendChild(groupHeader);

        group.items.forEach((h) => {
          const book = allBooksMap.get(h.book_id);
          const ch = allChaptersMap.get(h.chapter_id);
          if (!book || !ch) return;

          const card = document.createElement("a");
          card.className = "card";
          card.href = `reader.html?book=${h.book_id}&chapter=${h.chapter_id}`;
          card.style.cssText = `
            display:flex;align-items:center;gap:14px;
            margin-bottom:10px;padding:14px 18px;
            text-decoration:none;color:inherit;
            transition:.2s;cursor:pointer;
          `;

          // أيقونة الكتاب (غلاف أو رمز)
          const iconHtml = book.cover
            ? `<img src="${book.cover}" alt="" style="width:48px;height:64px;object-fit:cover;border-radius:6px;flex-shrink:0">`
            : `<div style="width:48px;height:64px;border-radius:6px;background:linear-gradient(135deg,#1b3556,#1769aa);display:grid;place-items:center;color:#e2bd63;font-size:1.4rem;flex-shrink:0">📖</div>`;

          card.innerHTML = `
            ${iconHtml}
            <div style="flex:1;min-width:0">
              <div style="font-weight:800;font-size:.95rem;margin-bottom:4px;
                          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
                          color:var(--text-primary)">
                ${TextUtil.esc(ch.title)}
              </div>
              <div style="font-size:.82rem;color:var(--text-secondary);
                          overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                ${TextUtil.esc(book.title)}
              </div>
              <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
                <span class="badge badge-gold" style="font-size:.68rem">${TextUtil.timeAgo(h.visited_at)}</span>
                ${book.author ? `<span class="badge badge-blue" style="font-size:.68rem">${TextUtil.esc(book.author)}</span>` : ""}
              </div>
            </div>
            <div style="color:var(--gold);font-size:1.3rem;flex-shrink:0">←</div>
          `;

          card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-2px)";
            card.style.boxShadow = "var(--shadow-gold)";
            card.style.borderColor = "var(--gold)";
          });
          card.addEventListener("mouseleave", () => {
            card.style.transform = "";
            card.style.boxShadow = "";
            card.style.borderColor = "";
          });

          list.appendChild(card);
        });
      });

      // ═══ زر "مسح السجل القديم" ═══
      const meta = document.createElement("p");
      meta.style.cssText = "text-align:center;font-size:.78rem;color:var(--text-muted);margin-top:20px";
      meta.textContent = `يُعرض آخر ${rows.length} فصل من إجمالي ${hist.length} زيارة`;
      list.appendChild(meta);

    } catch (e) {
      console.error(e);
      list.innerHTML = `<div class="empty-state"><h3>خطأ في التحميل</h3><p>${TextUtil.esc(e.message)}</p></div>`;
    }
  }

  // ═══ تجميع السجلات حسب اليوم ═══
  function groupByDay(rows) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
      today: { label: "اليوم", items: [] },
      yesterday: { label: "أمس", items: [] },
      week: { label: "هذا الأسبوع", items: [] },
      month: { label: "هذا الشهر", items: [] },
      older: { label: "أقدم", items: [] },
    };

    rows.forEach((h) => {
      const d = new Date(h.visited_at);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) groups.today.items.push(h);
      else if (d.getTime() === yesterday.getTime()) groups.yesterday.items.push(h);
      else if (d >= weekAgo) groups.week.items.push(h);
      else if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) groups.month.items.push(h);
      else groups.older.items.push(h);
    });

    return Object.values(groups).filter((g) => g.items.length);
  }

  // ═══ حالة فارغة ═══
  function renderEmpty(title, subtitle) {
    list.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 3"/>
        </svg>
        <h3>${TextUtil.esc(title)}</h3>
        <p>${TextUtil.esc(subtitle)}</p>
        <a href="library.html" class="btn btn-primary" style="margin-top:14px">تصفّح المكتبة</a>
      </div>
    `;
  }

  // ═══ مسح السجل ═══
  if (clearBtn) {
    clearBtn.onclick = async () => {
      const ok = await UI.confirmDialog(
        "مسح السجل",
        "سيتم مسح كامل سجل القراءة نهائياً. لا يمكن التراجع.",
        "مسح الكل"
      );
      if (!ok) return;
      try {
        await DB.clear("history");
        UI.toast("تم مسح السجل", "success");
        load();
      } catch (e) {
        UI.toast("خطأ: " + e.message, "error");
      }
    };
  }

  // ═══ بدء التحميل ═══
  await load();
})();