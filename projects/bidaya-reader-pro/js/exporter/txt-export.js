/* ═══ تصدير TXT — نص صافي مع عناوين الفصول ═══ */
const TxtExport = {
  async export(bookId) {
    const book = await DB.get("books", bookId);
    if (!book) throw new Error("الكتاب غير موجود");
    const tree = await BookAPI.getChapterTree(bookId);
    const flat = BookAPI.flattenTree(tree);
    const parts = [`${book.title}`, book.author ? `تأليف: ${book.author}` : "", "=".repeat(50), ""];
    for (const ch of flat) {
      parts.push(ch.title);
      parts.push("-" .repeat(Math.min(60, ch.title.length + 10)));
      const pages = await BookAPI.getPages(ch.id);
      pages.forEach((p) => parts.push(TextUtil.stripHtml(p.content)));
      parts.push("");
    }
    return new Blob(["﻿" + parts.join("\n")], { type: "text/plain;charset=utf-8" });
  },
};