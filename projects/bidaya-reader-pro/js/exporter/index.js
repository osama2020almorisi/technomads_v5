/* ═══════════════════════════════════════════════════════════════
   Exporter — المنسّق الموحّد لتصدير الكتب
   يربط export.html بجميع المصدرات: JSON, EPUB, HTML, TXT, PDF, DOCX
   ═══════════════════════════════════════════════════════════════ */
const Exporter = (() => {
  /* ─── تعريف الصيغ المدعومة ─── */
  const FORMATS = {
    epub: {
      icon: "📚",
      label: "EPUB",
      desc: "كتاب إلكتروني بمعايير EPUB3 — متوافق مع جميع القارئات",
      mime: "application/epub+zip",
      ext: "epub",
      needsCDN: ["JSZip"],
    },
    json: {
      icon: "🔧",
      label: "JSON",
      desc: "بنية بداية ريدر — قابلة لإعادة الاستيراد بالكامل",
      mime: "application/json",
      ext: "json",
      needsCDN: [],
    },
    html: {
      icon: "🌐",
      label: "HTML",
      desc: "صفحة ويب مستقلة بتنسيق عربي RTL + فهرس",
      mime: "text/html;charset=utf-8",
      ext: "html",
      needsCDN: [],
    },
    txt: {
      icon: "📝",
      label: "TXT",
      desc: "نص صافي مع عناوين الفصول — خفيف ومتوافق مع الجميع",
      mime: "text/plain;charset=utf-8",
      ext: "txt",
      needsCDN: [],
    },
    pdf: {
      icon: "📕",
      label: "PDF",
      desc: "مستند PDF جاهز للطباعة والنشر — تنسيق A4",
      mime: "application/pdf",
      ext: "pdf",
      needsCDN: ["html2pdf"],
    },
    docx: {
      icon: "📄",
      label: "DOCX",
      desc: "مستند Word قابل للتحرير — متوافق مع Office",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ext: "docx",
      needsCDN: ["docx"],
    },
  };

  /* ─── التحقق من تحميل مكتبات CDN ─── */
  function ensureCDN(formatKey) {
    const fmt = FORMATS[formatKey];
    if (!fmt || !fmt.needsCDN.length) return;
    const missing = fmt.needsCDN.filter((lib) => typeof window[lib] === "undefined");
    if (missing.length) {
      throw new Error(
        `صيغة ${fmt.label} تتطلب مكتبة ${missing.join("، ")} — تحقق من الاتصال بالإنترنت أول مرة`
      );
    }
  }

  /* ─── تنظيف اسم الملف من الأحرف غير الآمنة ─── */
  function safeFilename(title, ext) {
    const clean = String(title || "كتاب")
      .replace(/[\\/:*?"<>|]/g, "_")   // أحرف محظورة في Windows
      .replace(/\s+/g, " ")             // مسافات متعددة → واحدة
      .trim()
      .slice(0, 120);                   // حد أقصى للطول
    return `${clean}.${ext}`;
  }

  /* ─── جدول التوجيه للمصدّرات ─── */
  const HANDLERS = {
    async epub(bookId, options) {
      return await EpubExport.export(bookId, options);
    },
    async json(bookId) {
      return await JsonExport.export(bookId);
    },
    async html(bookId, options) {
      return await HtmlExport.export(bookId, options);
    },
    async txt(bookId) {
      return await TxtExport.export(bookId);
    },
    async pdf(bookId, options) {
      // pdf-export.js يُصدّر دالة `exportPDF` (ES module)
      // لكنه محمّل كـ <script> عادي، لذا نتحقق من globalThis
      if (typeof exportPDF === "function") {
        return await exportPDF(bookId, options);
      }
      if (globalThis.PdfExport && typeof globalThis.PdfExport.export === "function") {
        return await globalThis.PdfExport.export(bookId, options);
      }
      throw new Error("مصدّر PDF غير مُحمَّل");
    },
    async docx(bookId, options) {
      if (typeof exportDOCX === "function") {
        return await exportDOCX(bookId, options);
      }
      if (globalThis.DocxExport && typeof globalThis.DocxExport.export === "function") {
        return await globalThis.DocxExport.export(bookId, options);
      }
      throw new Error("مصدّر DOCX غير مُحمَّل");
    },
  };

  /* ─── الدالة الموحّدة للتصدير ─── */
  async function exportBook(bookId, formatKey, options = {}) {
    // 1) التحقق من الصيغة
    const fmt = FORMATS[formatKey];
    if (!fmt) {
      UI.toast(`صيغة غير معروفة: ${formatKey}`, "error");
      throw new Error(`Unknown format: ${formatKey}`);
    }
    const handler = HANDLERS[formatKey];
    if (!handler) {
      UI.toast(`المصدّر «${fmt.label}» غير مُنفَّذ`, "error");
      throw new Error(`No handler for: ${formatKey}`);
    }

    // 2) التحقق من المكتبات
    try {
      ensureCDN(formatKey);
    } catch (e) {
      UI.toast(e.message, "warning", 5000);
      throw e;
    }

    // 3) التحقق من وجود الكتاب
    const book = await DB.get("books", bookId);
    if (!book) {
      UI.toast("الكتاب غير موجود", "error");
      throw new Error("Book not found");
    }

    // 4) عرض مؤشر التحميل
    const loading = UI.showLoading(`جاري تصدير «${book.title}» بصيغة ${fmt.label}…`);

    try {
      loading.setProgress(10);
      loading.setText("جاري تجميع المحتوى…");

      const result = await handler(bookId, {
        withToc: options.withToc !== false,
        ...options,
      });

      loading.setProgress(85);
      loading.setText("جاري إنشاء الملف…");

      // 5) التعامل مع الناتج (Blob أو مسار تحميل مباشر)
      let blob = result;
      if (!(blob instanceof Blob)) {
        // بعض المصدرات (مثل PDF عبر html2pdf) تُنزّل مباشرة وتُعيد undefined
        loading.setProgress(100);
        loading.setText("اكتمل التصدير");
        setTimeout(() => loading.hide(), 400);
        UI.toast(`تم تصدير «${book.title}» بصيغة ${fmt.label}`, "success");
        return { format: formatKey, direct: true };
      }

      // 6) تنزيل الملف
      const filename = safeFilename(book.title, fmt.ext);
      loading.setProgress(95);
      UI.downloadBlob(blob, filename);

      loading.setProgress(100);
      loading.setText("اكتمل التصدير");
      setTimeout(() => loading.hide(), 400);

      UI.toast(
        `تم تصدير «${book.title}» بصيغة ${fmt.label} (${TextUtil.formatNum(blob.size)} بايت)`,
        "success",
        4000
      );
      return { format: formatKey, filename, size: blob.size, blob };
    } catch (e) {
      loading.hide();
      console.error("Export error:", e);
      UI.toast(`فشل التصدير: ${e.message}`, "error", 6000);
      throw e;
    }
  }

  /* ─── تصدير جميع الكتب كـ ZIP (اختياري — يُستخدم من settings.html) ─── */
  async function exportAllAsZip(onProgress = null) {
    if (typeof JSZip === "undefined") throw new Error("JSZip غير محمّلة");
    const books = await DB.all("books");
    if (!books.length) throw new Error("لا توجد كتب للتصدير");

    const zip = new JSZip();
    let done = 0;
    for (const book of books) {
      try {
        const blob = await JsonExport.export(book.id);
        const name = safeFilename(book.title, "json");
        zip.file(name, blob);
        done++;
        if (onProgress) onProgress(done, books.length, book.title);
      } catch (e) {
        console.warn(`تخطي «${book.title}»:`, e.message);
      }
    }
    return await zip.generateAsync(
      { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
      (meta) => { if (onProgress) onProgress(done, books.length, `ضغط… ${meta.percent.toFixed(0)}%`); }
    );
  }

  /* ─── واجهة عامة ─── */
  return {
    FORMATS,
    exportBook,
    exportAllAsZip,
    // كشف مساعدات داخلية للاختبار
    _safeFilename: safeFilename,
    _ensureCDN: ensureCDN,
  };
})();

// كشف عام للاستخدام من export.html و settings.html
window.Exporter = Exporter;