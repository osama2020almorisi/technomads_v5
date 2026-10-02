/* ═══ منسّق الاستيراد: يوجه الملف للمحلل الصحيح ثم يحفظ ═══ */
const Importer = {
  getParser(file) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const mime = file.type || "";
    if (ext === "epub" || mime.includes("epub")) return { parser: EpubParser, label: "EPUB" };
    if (ext === "json" || mime.includes("json")) return { parser: JsonParser, label: "JSON" };
    if (ext === "txt") return { parser: TxtParser, label: "TXT" };
    if (ext === "html" || ext === "htm") return { parser: HtmlParser, label: "HTML" };
    if (ext === "docx" || mime.includes("wordprocessingml")) return { parser: DocxParser, label: "DOCX" };
    return null;
  },

  async importFile(file, onProgress = null) {
    const found = this.getParser(file);
    if (!found) throw new Error(`صيغة غير مدعومة: ${file.name} — المدعوم: EPUB, JSON, TXT, HTML, DOCX`);
    if (file.size > 200 * 1024 * 1024) throw new Error("حجم الملف كبير جداً (الحد الأقصى 200MB)");
    const loading = UI.showLoading(`تحليل ${found.label}…`);
    try {
      const parsed = await found.parser.parse(file, (p, msg) => {
        loading.setProgress(p); loading.setText(msg);
      });
      // تحقق من الصحة
      this._validate(parsed);
      // إحصائيات مبدئية
      let words = 0, chars = 0;
      parsed.pages.forEach((p) => { words += p.word_count; chars += (p.content || "").length; });
      parsed.book.stats = { chapters: parsed.chapters.length, pages: parsed.pages.length, words, chars };
      loading.setProgress(60); loading.setText("الحفظ في قاعدة البيانات…");
      const bookId = await BookAPI.createBook(parsed.book, parsed.chapters, parsed.pages,
        (p, msg) => { loading.setProgress(60 + p * 0.4); loading.setText(msg); });
      loading.setProgress(100); loading.setText("اكتمل الاستيراد");
      setTimeout(() => loading.hide(), 400);
      return { bookId, book: parsed.book, stats: parsed.book.stats, format: found.label };
    } catch (e) {
      loading.hide();
      throw e;
    }
  },

  _validate(parsed) {
    if (!parsed.book || !parsed.book.title) throw new Error("العنوان مفقود");
    if (!Array.isArray(parsed.chapters) || !parsed.chapters.length) throw new Error("لا توجد فصول");
    if (!Array.isArray(parsed.pages) || !parsed.pages.length) throw new Error("لا توجد صفحات");
    // تنظيف العناوين
    parsed.chapters.forEach((c) => { c.title = String(c.title || "فصل").slice(0, 500); });
  },
};