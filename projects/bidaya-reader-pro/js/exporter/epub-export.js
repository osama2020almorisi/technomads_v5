/* ═══ تصدير EPUB3 يدوي عبر JSZip ═══ */
const EpubExport = {
  async export(bookId, { withToc = true } = {}) {
    if (typeof JSZip === "undefined") throw new Error("مكتبة JSZip غير محملة");
    const book = await DB.get("books", bookId);
    if (!book) throw new Error("الكتاب غير موجود");
    const tree = await BookAPI.getChapterTree(bookId);
    const flat = BookAPI.flattenTree(tree);
    const uid = "urn:uuid:" + (crypto.randomUUID ? crypto.randomUUID() : TextUtil.uid());
    const zip = new JSZip();

    // mimetype يجب أن يكون أول ملف دون ضغط
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`);

    const esc = TextUtil.esc;
    const chapters = [];
    for (const ch of flat) {
      const pages = await BookAPI.getPages(ch.id);
      const body = pages.map((p) => `<div class="page">${p.content}</div>`).join("\n");
      chapters.push({ ch, html: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ar" lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><title>${esc(ch.title)}</title>
<style>body{font-family:"Noto Naskh Arabic",serif;line-height:2;direction:rtl;padding:1em}p{margin-bottom:1em}blockquote{border-right:4px solid #c79b3b;padding:10px 20px;background:#faf6ea}</style>
</head><body><h2>${esc(ch.title)}</h2>${body}</body></html>` });
    }

    // nav.xhtml
    const navOl = (nodes) => `<ol>${nodes.map((n) => `<li><a href="ch_${n.id}.xhtml">${esc(n.title)}</a>${n.children.length ? navOl(n.children) : ""}</li>`).join("")}</ol>`;
    const navToc = withToc ? navOl(tree) : "<ol></ol>";
    zip.file("OEBPS/nav.xhtml", `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ar" lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><title>الفهرس</title></head>
<body><nav epub:type="toc"><h1>الفهرس</h1>${navToc}</nav></body></html>`);

    // toc.ncx (توافق EPUB2)
    let playOrder = 1;
    const ncxPoints = (nodes) => nodes.map((n) => {
      const po = playOrder++;
      return `<navPoint id="np${n.id}" playOrder="${po}"><navLabel><text>${esc(n.title)}</text></navLabel><content src="ch_${n.id}.xhtml"/>${n.children.length ? ncxPoints(n.children) : ""}</navPoint>`;
    }).join("");
    zip.file("OEBPS/toc.ncx", `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="ar">
<head><meta name="dtb:uid" content="${uid}"/><meta name="dtb:depth" content="5"/></head>
<docTitle><text>${esc(book.title)}</text></docTitle>
<navMap>${ncxPoints(tree)}</navMap></ncx>`);

    // content.opf
    const manifestItems = chapters.map((c, i) =>
      `<item id="ch${c.ch.id}" href="ch_${c.ch.id}.xhtml" media-type="application/xhtml+xml"/>`).join("\n    ");
    const spineItems = chapters.map((c) => `<itemref idref="ch${c.ch.id}"/>`).join("\n    ");
    zip.file("OEBPS/content.opf", `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="ar" dir="rtl">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="pub-id">${uid}</dc:identifier>
  <dc:title>${esc(book.title)}</dc:title>
  <dc:language>${esc(book.language || "ar")}</dc:language>
  ${book.author ? `<dc:creator>${esc(book.author)}</dc:creator>` : ""}
  ${book.publisher ? `<dc:publisher>${esc(book.publisher)}</dc:publisher>` : ""}
  ${book.description ? `<dc:description>${esc(book.description.slice(0, 500))}</dc:description>` : ""}
  <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
</metadata>
<manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${manifestItems}
</manifest>
<spine toc="ncx">
    ${spineItems}
</spine>
</package>`);

    // الفصول
    chapters.forEach((c) => zip.file(`OEBPS/ch_${c.ch.id}.xhtml`, c.html));

    return await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
  },
};