/* ═══ استيراد DOCX عبر Mammoth — h1-h4 فصول، وبقية المحتوى صفحات ═══ */
const DocxParser = {
  async parse(file) {
    if (typeof mammoth === "undefined") throw new Error("مكتبة mammoth غير محملة — تحقق من الاتصال أول مرة");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      styleMap: ["p[style-name='Heading 1'] => h1", "p[style-name='Heading 2'] => h2",
                 "p[style-name='Heading 3'] => h3", "p[style-name='Heading 4'] => h4"],
    });
    const html = result.value;
    if (!html.trim()) throw new Error("تعذر استخراج محتوى من ملف DOCX");
    const tmp = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
    const headings = [...tmp.body.querySelectorAll("h1,h2,h3,h4")];
    const chapters = []; const pages = [];
    if (headings.length) {
      headings.forEach((h, i) => {
        const id = "c" + i;
        chapters.push({ _tmp: id, parent_id: null, title: h.textContent.trim(), order_num: i, depth: 0 });
        let content = ""; let node = h.nextElementSibling;
        while (node && !/^H[1-4]$/.test(node.tagName)) { content += node.outerHTML; node = node.nextElementSibling; }
        pages.push({ _tmpChapter: id, page_num: 1, word_count: TextUtil.wordCount(content), content });
      });
    } else {
      chapters.push({ _tmp: "c0", parent_id: null, title: "المحتوى", order_num: 0, depth: 0 });
      pages.push({ _tmpChapter: "c0", page_num: 1, word_count: TextUtil.wordCount(html), content: html });
    }
    const book = { title: file.name.replace(/\.docx$/i, ""), author: "", publisher: "", language: "ar", cover: null, description: "", imported_at: Date.now() };
    return { book, chapters, pages, sourceFormat: "docx" };
  },
};