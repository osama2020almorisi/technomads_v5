/* ═══ تصدير JSON — بنية قابلة لإعادة الاستيراد ═══ */
const JsonExport = {
  async export(bookId) {
    const book = await DB.get("books", bookId);
    if (!book) throw new Error("الكتاب غير موجود");
    const chapters = await DB.byIndex("chapters", "book_id", bookId);
    chapters.sort((a, b) => a.order_num - b.order_num);
    const pages = [];
    for (const ch of chapters) {
      const pgs = await DB.byIndex("pages", "chapter_id", ch.id);
      pgs.sort((a, b) => a.page_num - b.page_num);
      pgs.forEach((p) => pages.push({ chapter_id: ch.id, page_num: p.page_num, word_count: p.word_count, content: p.content }));
    }
    const out = {
      format: "bidaya-reader-pro",
      version: 1,
      exported_at: new Date().toISOString(),
      book: {
        title: book.title, author: book.author, publisher: book.publisher,
        language: book.language, cover: book.cover, description: book.description,
        stats: book.stats,
      },
      chapters: chapters.map((c) => ({ id: c.id, parent_id: c.parent_id, title: c.title, order_num: c.order_num, depth: c.depth })),
      pages,
    };
    return new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
  },
};