/* ═══ تصدير HTML standalone بـ CSS مدمج ═══ */
const HtmlExport = {
  async export(bookId, { withToc = true } = {}) {
    const book = await DB.get("books", bookId);
    if (!book) throw new Error("الكتاب غير موجود");
    const tree = await BookAPI.getChapterTree(bookId);
    const flat = BookAPI.flattenTree(tree);

    const chapterHtmls = [];
    for (const ch of flat) {
      const pages = await BookAPI.getPages(ch.id);
      const body = pages.map((p) => `<div class="page">${p.content}</div>`).join("\n");
      chapterHtmls.push(`<section class="chapter" id="ch-${ch.id}">
<h${Math.min(6, ch.depth + 1)}>${TextUtil.esc(ch.title)}</h${Math.min(6, ch.depth + 1)}>
${body}
</section>`);
    }

    let tocHtml = "";
    if (withToc) {
      tocHtml = `<nav class="toc"><h2>الفهرس</h2><ol>${flat.map((c) =>
        `<li style="margin-inline-start:${c.depth * 18}px"><a href="#ch-${c.id}">${TextUtil.esc(c.title)}</a></li>`).join("")}</ol></nav>`;
    }

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${TextUtil.esc(book.title)}</title>
<meta name="author" content="${TextUtil.esc(book.author || "")}">
<meta name="generator" content="Bidaya Reader Pro">
<style>
body{font-family:"Noto Naskh Arabic","Amiri",serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:2;color:#29231a;background:#fffdf5;direction:rtl}
h1,h2,h3,h4{font-family:"Amiri",serif;color:#1a1a2e}
h1.book-title{text-align:center;border-bottom:3px double #c79b3b;padding-bottom:16px}
.toc{background:#faf6ea;border:1px solid #e5d9b8;border-radius:12px;padding:20px;margin:24px 0}
.toc ol{list-style:none;padding:0}
.toc a{color:#8a6a1f;text-decoration:none}
.toc a:hover{text-decoration:underline}
.chapter{margin-bottom:40px}
p{margin:0 0 1em;text-align:justify}
blockquote{border-right:4px solid #c79b3b;background:#faf6ea;padding:10px 20px;border-radius:8px}
img{max-width:100%}
</style>
</head>
<body>
<h1 class="book-title">${TextUtil.esc(book.title)}</h1>
${book.author ? `<p style="text-align:center;color:#64748b">${TextUtil.esc(book.author)}</p>` : ""}
${tocHtml}
${chapterHtmls.join("\n")}
<hr>
<p style="text-align:center;color:#8491a3;font-size:.85em">صُدّر بواسطة بداية ريدر برو</p>
</body>
</html>`;
    return new Blob([html], { type: "text/html;charset=utf-8" });
  },
};