/* ═══════════════════════════════════════════════════════════════
   تصدير PDF — يستخدم html2pdf.js (مبني على html2canvas + jsPDF)
   يبني مستنداً عربياً RTL احترافي من محتوى الكتاب
   ═══════════════════════════════════════════════════════════════ */
const PdfExport = {
  /* ─── إعدادات ثابتة ─── */
  CONFIG: {
    margin: [12, 12, 16, 12],      // [top, right, bottom, left] بالـ mm
    filename: null,                // يُحدَّد ديناميكياً من عنوان الكتاب
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: {
      scale: 2,                    // دقة مضاعفة للعربية
      useCORS: true,
      letterRendering: true,       // مهم للنص العربي
      logging: false,
      backgroundColor: "#fffdf5",
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    },
    pagebreak: {
      mode: ["avoid-all", "css", "legacy"],
      before: ".pdf-page-break",
      avoid: ["h1", "h2", "h3", "h4", "blockquote", "p", "li", "img"],
    },
  },

  /* ─── نمط CSS مدمج للمستند ─── */
  STYLES: `
    .pdf-doc {
      font-family: "Noto Naskh Arabic", "Amiri", serif;
      direction: rtl;
      text-align: right;
      color: #1a1a2e;
      background: #fffdf5;
      line-height: 2;
      padding: 4mm;
    }
    .pdf-doc .pdf-cover {
      text-align: center;
      padding: 30mm 0 20mm;
      page-break-after: always;
      border-bottom: none;
    }
    .pdf-doc .pdf-cover h1 {
      font-family: "Amiri", serif;
      font-size: 32pt;
      color: #c79b3b;
      margin: 0 0 8mm;
      line-height: 1.4;
    }
    .pdf-doc .pdf-cover .pdf-author {
      font-size: 14pt;
      color: #64748b;
      margin-bottom: 4mm;
    }
    .pdf-doc .pdf-cover .pdf-publisher {
      font-size: 11pt;
      color: #8491a3;
    }
    .pdf-doc .pdf-cover::after {
      content: "❖ ❖ ❖";
      display: block;
      color: #c79b3b;
      font-size: 14pt;
      margin-top: 20mm;
      letter-spacing: 6px;
    }
    .pdf-doc .pdf-toc {
      page-break-after: always;
      padding: 8mm 4mm;
    }
    .pdf-doc .pdf-toc h2 {
      font-family: "Amiri", serif;
      font-size: 22pt;
      color: #c79b3b;
      text-align: center;
      border-bottom: 2px solid #c79b3b;
      padding-bottom: 4mm;
      margin-bottom: 8mm;
    }
    .pdf-doc .pdf-toc ol {
      list-style: none;
      padding: 0;
      margin: 0;
      counter-reset: pdf-chapter;
    }
    .pdf-doc .pdf-toc li {
      padding: 2mm 0;
      font-size: 11pt;
      color: #29231a;
      counter-increment: pdf-chapter;
      border-bottom: 1px dotted #e5d9b8;
    }
    .pdf-doc .pdf-toc li::before {
      content: counter(pdf-chapter) ". ";
      color: #c79b3b;
      font-weight: 700;
      margin-left: 3mm;
    }
    .pdf-doc .pdf-chapter {
      page-break-before: always;
      padding: 0 2mm;
    }
    .pdf-doc .pdf-chapter:first-of-type {
      page-break-before: auto;
    }
    .pdf-doc .pdf-chapter h2 {
      font-family: "Amiri", serif;
      font-size: 20pt;
      color: #1a1a2e;
      text-align: center;
      border-bottom: 2px solid #c79b3b;
      padding-bottom: 3mm;
      margin: 0 0 6mm;
      page-break-after: avoid;
    }
    .pdf-doc .pdf-chapter p {
      font-size: 12pt;
      margin: 0 0 4mm;
      text-align: justify;
      page-break-inside: avoid;
    }
    .pdf-doc .pdf-chapter blockquote {
      border-right: 4px solid #c79b3b;
      background: #faf6ea;
      padding: 3mm 6mm;
      margin: 4mm 0;
      border-radius: 6px;
      font-style: italic;
      page-break-inside: avoid;
    }
    .pdf-doc .pdf-chapter h3,
    .pdf-doc .pdf-chapter h4 {
      font-family: "Amiri", serif;
      color: #1a1a2e;
      margin: 4mm 0 2mm;
      page-break-after: avoid;
    }
    .pdf-doc .pdf-chapter ul,
    .pdf-doc .pdf-chapter ol {
      padding-right: 8mm;
      margin: 2mm 0 4mm;
    }
    .pdf-doc .pdf-chapter img {
      max-width: 100%;
      height: auto;
      margin: 3mm auto;
      display: block;
      page-break-inside: avoid;
    }
    .pdf-doc .pdf-chapter hr {
      border: none;
      border-top: 1px solid #e5d9b8;
      margin: 6mm 0;
    }
    .pdf-doc .pdf-footer {
      text-align: center;
      color: #8491a3;
      font-size: 9pt;
      margin-top: 10mm;
      padding-top: 4mm;
      border-top: 1px solid #e5d9b8;
    }
  `,

  /* ─── إنشاء اسم ملف آمن ─── */
  _safeName(title) {
    return String(title || "كتاب")
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100);
  },

  /* ─── بناء DOM كامل للمستند ─── */
  async _buildDocument(bookId, options = {}) {
    const withToc = options.withToc !== false;

    const book = await DB.get("books", bookId);
    if (!book) throw new Error("الكتاب غير موجود");

    const tree = await BookAPI.getChapterTree(bookId);
    const flat = BookAPI.flattenTree(tree);
    if (!flat.length) throw new Error("الكتاب لا يحتوي على فصول");

    // إنشاء الحاوية
    const container = document.createElement("div");
    container.className = "pdf-doc";

    // 1) الغلاف
    const cover = document.createElement("div");
    cover.className = "pdf-cover";
    cover.innerHTML = `
      <h1>${TextUtil.esc(book.title)}</h1>
      ${book.author ? `<div class="pdf-author">تأليف: ${TextUtil.esc(book.author)}</div>` : ""}
      ${book.publisher ? `<div class="pdf-publisher">${TextUtil.esc(book.publisher)}</div>` : ""}
    `;
    container.appendChild(cover);

    // 2) الفهرس (اختياري)
    if (withToc && flat.length > 1) {
      const toc = document.createElement("div");
      toc.className = "pdf-toc";
      const items = flat.map((c) => {
        const indent = c.depth > 0 ? ` style="padding-right:${c.depth * 6}mm"` : "";
        return `<li${indent}>${TextUtil.esc(c.title)}</li>`;
      }).join("");
      toc.innerHTML = `<h2>الفهرس</h2><ol>${items}</ol>`;
      container.appendChild(toc);
    }

    // 3) الفصول
    for (const ch of flat) {
      const pages = await BookAPI.getPages(ch.id);
      if (!pages.length) continue;

      const chapterEl = document.createElement("section");
      chapterEl.className = "pdf-chapter";

      const h = document.createElement("h2");
      h.textContent = ch.title;
      chapterEl.appendChild(h);

      // إدراج محتوى الصفحات
      const contentWrap = document.createElement("div");
      contentWrap.innerHTML = pages.map((p) => p.content || "").join("\n");
      chapterEl.appendChild(contentWrap);

      container.appendChild(chapterEl);
    }

    // 4) التذييل
    const footer = document.createElement("div");
    footer.className = "pdf-footer";
    footer.textContent = `صُدِّر بواسطة بداية ريدر برو — ${new Date().toLocaleDateString("ar-EG")}`;
    container.appendChild(footer);

    return container;
  },

  /* ─── حقن الأنماط مؤقتاً ─── */
  _injectStyles() {
    const id = "pdf-export-styles";
    if (document.getElementById(id)) return id;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = this.STYLES;
    document.head.appendChild(style);
    return id;
  },

  _removeStyles(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  /* ─── الدالة الرئيسية ─── */
  async export(bookId, options = {}) {
    if (typeof html2pdf === "undefined") {
      throw new Error("مكتبة html2pdf غير محمّلة — تحقق من الاتصال بالإنترنت أول مرة");
    }

    const book = await DB.get("books", bookId);
    if (!book) throw new Error("الكتاب غير موجود");

    // 1) حقن الأنماط
    const styleId = this._injectStyles();

    // 2) بناء DOM مؤقت (خارج الشاشة لتجنب الوميض)
    const doc = await this._buildDocument(bookId, options);
    doc.style.cssText = "position:fixed;top:0;left:-99999px;width:210mm;background:#fffdf5;";

    // 3) إضافة خطوط Google للطباعة (لو لم تكن محمّلة)
    if (!document.getElementById("pdf-fonts")) {
      const link = document.createElement("link");
      link.id = "pdf-fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap";
      document.head.appendChild(link);
      // انتظار تحميل الخطوط
      await new Promise((r) => setTimeout(r, 800));
    }

    document.body.appendChild(doc);

    try {
      // 4) إعداد filename
      const filename = this._safeName(book.title) + ".pdf";
      const config = {
        ...this.CONFIG,
        filename,
      };

      // 5) توليد PDF
      // html2pdf().from(element).set(config).save()  → ينزّل مباشرة
      // لتوحيد السلوك مع Exporter، نستخدم .outputPdf("blob") بدلاً من .save()
      const worker = html2pdf().set(config).from(doc);
      const blob = await worker.outputPdf("blob");

      return blob;
    } finally {
      // 6) تنظيف
      doc.remove();
      this._removeStyles(styleId);
    }
  },

  /* ─── تصدير فصل واحد فقط (اختياري) ─── */
  async exportChapter(bookId, chapterId, options = {}) {
    if (typeof html2pdf === "undefined") throw new Error("html2pdf غير محمّلة");

    const book = await DB.get("books", bookId);
    const chapter = await DB.get("chapters", chapterId);
    if (!book || !chapter) throw new Error("الكتاب أو الفصل غير موجود");

    const styleId = this._injectStyles();
    const container = document.createElement("div");
    container.className = "pdf-doc";

    const pages = await BookAPI.getPages(chapterId);
    const section = document.createElement("section");
    section.className = "pdf-chapter";
    section.innerHTML = `<h2>${TextUtil.esc(chapter.title)}</h2>` +
      pages.map((p) => p.content || "").join("\n");
    container.appendChild(section);

    container.style.cssText = "position:fixed;top:0;left:-99999px;width:210mm;background:#fffdf5;";
    document.body.appendChild(container);

    try {
      const filename = `${this._safeName(book.title)} — ${this._safeName(chapter.title)}.pdf`;
      const blob = await html2pdf().set({ ...this.CONFIG, filename }).from(container).outputPdf("blob");
      return blob;
    } finally {
      container.remove();
      this._removeStyles(styleId);
    }
  },
};

/* ─── كشف للاستخدام من Exporter ─── */
window.PdfExport = PdfExport;

/* ─── دالة توافقية (للنسخة القديمة) ─── */
async function exportPDF(bookId, options) {
  return await PdfExport.export(bookId, options);
}