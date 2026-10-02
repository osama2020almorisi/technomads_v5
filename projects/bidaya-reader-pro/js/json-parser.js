/* ═══ استيراد JSON — بنية بداية ريدر أو صيغ مشابهة ═══ */
const JsonParser = {
  async parse(file) {
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch (e) { throw new Error("ملف JSON غير صالح: " + e.message); }
    // قبول عدة أشكال: كتاب مباشر أو {book, chapters, pages}
    const bookData = data.book || data;
    const title = bookData.title || file.name.replace(/\.json$/i, "");
    const chaptersData = data.chapters || bookData.chapters || [];
    const pagesData = data.pages || bookData.pages || [];
    if (!Array.isArray(chaptersData) || !chaptersData.length) {
      throw new Error("لا توجد فصول في ملف JSON");
    }
    // فصول
    const chapters = chaptersData.map((c, i) => ({
      _tmp: c.id ?? "c" + i,
      parent_id: c.parent_id ?? c.parentId ?? null,
      title: String(c.title || `فصل ${i + 1}`),
      order_num: c.order_num ?? i,
      depth: 0,
    }));
    // صفحات
    const pages = [];
    if (pagesData.length) {
      pagesData.forEach((p) => {
        if (!p.content) return;
        pages.push({
          _tmpChapter: p.chapter_id ?? p.chapterId,
          page_num: p.page_num ?? p.pageNum ?? 1,
          word_count: p.word_count ?? TextUtil.wordCount(p.content),
          content: String(p.content),
        });
      });
    } else {
      // محتوى مضمّن في الفصول
      chaptersData.forEach((c, i) => {
        const content = c.content || c.html || "";
        if (content) pages.push({ _tmpChapter: "c" + i, page_num: 1, word_count: TextUtil.wordCount(content), content: String(content) });
      });
    }
    if (!pages.length) throw new Error("لا يوجد محتوى في ملف JSON");
    const book = {
      title,
      author: bookData.author || "",
      publisher: bookData.publisher || "",
      language: bookData.language || "ar",
      cover: bookData.cover || null,
      description: bookData.description || "",
      imported_at: Date.now(),
    };
    return { book, chapters, pages, sourceFormat: "json" };
  },
};