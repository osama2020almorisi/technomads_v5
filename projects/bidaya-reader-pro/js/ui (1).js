/* ═══ مكونات واجهة مشتركة: Toast، Modal، Sidebar، Theme ═══ */
const UI = (() => {
  // Toast
  function toast(msg, type = "info", duration = 3500) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.setAttribute("role", "status");
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 350); }, duration);
  }

  // Modal
  function modal({ title, body, actions = [], dismissible = true, onClose = null }) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop open";
    backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${TextUtil.esc(title)}">
      <h3>${TextUtil.esc(title)}</h3>
      <div class="modal-body">${body}</div>
      <div class="modal-actions"></div>
    </div>`;
    const actionsBox = backdrop.querySelector(".modal-actions");
    const close = () => { backdrop.remove(); document.removeEventListener("keydown", escHandler); if (onClose) onClose(); };
    actions.forEach((a) => {
      const btn = document.createElement("button");
      btn.className = `btn btn-sm ${a.class || "btn-outline"}`;
      btn.textContent = a.label;
      btn.onclick = () => { const r = a.onClick && a.onClick(backdrop); if (r !== false) close(); };
      actionsBox.appendChild(btn);
    });
    if (dismissible) {
      backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
      var escHandler = (e) => { if (e.key === "Escape") close(); };
      document.addEventListener("keydown", escHandler);
    }
    document.body.appendChild(backdrop);
    const firstInput = backdrop.querySelector("input,textarea,button.btn-primary");
    if (firstInput) firstInput.focus();
    return { close, el: backdrop };
  }

  function confirmDialog(title, message, confirmLabel = "تأكيد", danger = true) {
    return new Promise((resolve) => {
      modal({
        title,
        body: `<p style="color:var(--text-secondary)">${TextUtil.esc(message)}</p>`,
        onClose: () => resolve(false),
        actions: [
          { label: "إلغاء", class: "btn-outline", onClick: () => { resolve(false); } },
          { label: confirmLabel, class: danger ? "btn-danger" : "btn-primary", onClick: () => { resolve(true); } },
        ],
      });
    });
  }

  // Prompt
  function promptDialog(title, label, defaultValue = "") {
    return new Promise((resolve) => {
      const m = modal({
        title,
        body: `<div class="field"><label>${TextUtil.esc(label)}</label><input class="input" id="prompt-input" value="${TextUtil.esc(defaultValue)}"></div>`,
        onClose: () => resolve(null),
        actions: [
          { label: "إلغاء", class: "btn-outline", onClick: () => { resolve(null); } },
          { label: "حفظ", class: "btn-primary", onClick: (el) => {
              const v = el.querySelector("#prompt-input").value.trim();
              if (v) resolve(v); else { resolve(null); }
            } },
        ],
      });
      const input = m.el.querySelector("#prompt-input");
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { const v = input.value.trim(); m.close(); resolve(v || null); } });
    });
  }

  // Loading مع تقدم
  function showLoading(text = "جاري المعالجة…") {
    let ov = document.getElementById("global-loading");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "global-loading";
      ov.className = "loading-overlay open";
      ov.innerHTML = `<div class="spinner spinner-lg" role="status" aria-label="جاري التحميل"></div><p class="loading-text"></p>
        <div class="progress-bar hidden"><div class="fill" style="width:0%"></div></div>`;
      document.body.appendChild(ov);
    }
    ov.querySelector(".loading-text").textContent = text;
    return {
      setText(t) { ov.querySelector(".loading-text").textContent = t; },
      setProgress(p) {
        const bar = ov.querySelector(".progress-bar");
        bar.classList.remove("hidden");
        bar.querySelector(".fill").style.width = Math.min(100, p) + "%";
      },
      hide() { ov.classList.remove("open"); setTimeout(() => ov.remove(), 300); },
    };
  }

  // Sidebar للجوال
  function initSidebar() {
    const toggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!toggle || !sidebar) return;
    const close = () => {
      sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      if (backdrop) backdrop.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    if (backdrop) backdrop.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // زر المظهر
  function initThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const current = document.documentElement.dataset.theme;
      const next = current === "dark" ? "light" : "dark";
      await Store.set("theme", next);
      UI.toast(next === "dark" ? "تم تفعيل الوضع الليلي" : "تم تفعيل الوضع النهاري", "success", 2000);
    });
  }

  // تحميل بطاقة كتاب
  function bookCard(book, { onRead, onEdit, onExport, onDelete } = {}) {
    const card = document.createElement("article");
    card.className = "book-card";
    const cover = book.cover
      ? `<img src="${book.cover}" alt="غلاف ${TextUtil.esc(book.title)}" loading="lazy">`
      : `<div class="cover-title">${TextUtil.esc(book.title)}</div>`;
    card.innerHTML = `
      <div class="book-cover">${cover}</div>
      <div class="book-body">
        <h3>${TextUtil.esc(book.title)}</h3>
        <p class="book-author">${TextUtil.esc(book.author || "مؤلف مجهول")}</p>
        <div class="book-meta">
          <span>${book.stats?.chapters ?? 0} فصلاً</span>·<span>${book.stats?.pages ?? 0} صفحة</span>·<span>${TextUtil.formatNum(book.stats?.words ?? 0)} كلمة</span>
        </div>
      </div>
      <div class="book-actions"></div>`;
    const actions = card.querySelector(".book-actions");
    const mkBtn = (label, cls, fn) => {
      const b = document.createElement("button");
      b.textContent = label; if (cls) b.className = cls; b.type = "button";
      b.addEventListener("click", (e) => { e.stopPropagation(); fn(book); });
      actions.appendChild(b);
      return b;
    };
    mkBtn("قراءة", "", (b) => onRead ? onRead(b) : location.href = `reader.html?book=${b.id}`);
    mkBtn("تحرير", "", (b) => onEdit ? onEdit(b) : location.href = `editor.html?book=${b.id}`);
    mkBtn("تصدير", "", (b) => onExport ? onExport(b) : location.href = `export.html?book=${b.id}`);
    mkBtn("حذف", "danger", async (b) => {
      const ok = await UI.confirmDialog("حذف الكتاب", `سيتم حذف «${b.title}» نهائياً مع جميع فصوله وصفحاته وعلاماته. هل أنت متأكد؟`, "حذف نهائي");
      if (ok) { await BookAPI.deleteBook(b.id); UI.toast("تم حذف الكتاب", "success"); card.remove(); }
    });
    card.addEventListener("click", () => location.href = `reader.html?book=${book.id}`);
    return card;
  }

  // تنزيل ملف
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  return { toast, modal, confirmDialog, promptDialog, showLoading, initSidebar, initThemeToggle, bookCard, downloadBlob };
})();