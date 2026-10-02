/* ═══ استيراد TXT — تقسيم على عناوين الفصول (مسبوقة بـ # أو سطر فاصل) ═══ */
const TxtParser = {
  async parse(file) {
    const text = await file.text();
    if (!text.trim()) throw new Error("ملف TXT فارغ");
    // دعم BOM
    const clean = text.replace(/^﻿/, "");
    // الفصل عند سطر يبدأ بـ # أو عند أسطر من واصلات/نجوم
    const lines = clean.split(/\r?\n/);
    const chapters = [];
    const pages = [];
    let curTitle = "مقدمة", curLines = [], idx = 0;

    const flush = () => {
      if (!curLines.join("").trim()) { curLines = []; return; }
      const html = curLines.map((l) => l.trim() ? `<p>${TextUtil.esc(l)}</p>` : "").join("\n");
      const id = "c" + idx;
      chapters.push({ _tmp: id, parent_id: null, title: curTitle, order_num: idx, depth: 0 });
      pages.push({ _tmpChapter: id, page_num: 1, word_count: TextUtil.wordCount(html), content: html });
      idx++;
      curLines = [];
    };

    for (const line of lines) {
      const isHeading = /^#{1,6}\s+/.test(line) || /^[-=*~]{4,}\s*$/.test(line);
      if (isHeading && curLines.join("").trim()) { flush(); curTitle = line.replace(/^#{1,6}\s+/, "").trim() || "فصل"; }
      else if (isHeading) { curTitle = line.replace(/^#{1,6}\s+/, "").trim() || curTitle; }
      else curLines.push(line);
    }
    flush();

    if (!chapters.length) throw new Error("تعذر استخراج فصول من ملف TXT");
    const book = {
      title: file.name.replace(/\.txt$/i, ""),
      author: "", publisher: "", language: "ar", cover: null,
      description: "", imported_at: Date.now(),
    };
    return { book, chapters, pages, sourceFormat: "txt" };
  },
};