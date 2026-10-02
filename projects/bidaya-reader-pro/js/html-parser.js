/* ═══ استيراد HTML — استخراج العناوين h1-h6 كفصول والمحتوى كصفحات ═══ */
const HtmlParser = {
  async parse(file) {
    const html = await file.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc.body || !doc.body.innerHTML.trim()) throw new Error("ملف HTML فارغ أو غير صالح");
    const title = doc.querySelector("title")?.textContent?.trim() || file.name.replace(/\.html?$/i, "");
    // فهرس الفصول من h1-h4
    const headings = [...doc.body.querySelectorAll("h1,h2,h3,h4")];
    const chapters = []; const pages = [];
    if (headings.length) {
      headings.forEach((h, i) => {
        const id = "c" + i;
        chapters.push({ _tmp: id, parent_id: null, title: h.textContent.trim(), order_num: i, depth: 0 });
        // جمع العناصر حتى العنوان التالي
        let content = "";
        let node = h.nextElementSibling;
        while (node && !/^H[1-4]$/.test(node.tagName)) {
          content += node.outerHTML; node = node.nextElementSibling;
        }
        pages.push({ _tmpChapter: id, page_num: 1, word_count: TextUtil.wordCount(content), content });
      });
    } else {
      chapters.push({ _tmp: "c0", parent_id: null, title: "المحتوى", order_num: 0, depth: 0 });
      pages.push({ _tmpChapter: "c0", page_num: 1, word_count: TextUtil.wordCount(doc.body.innerHTML), content: doc.body.innerHTML });
    }
    const book = {
      title, author: doc.querySelector("meta[name=author]")?.content || "",
      publisher: "", language: doc.documentElement.lang || "ar", cover: null,
      description: doc.querySelector("meta[name=description]")?.content || "",
      imported_at: Date.now(),
    };
    return { book, chapters, pages, sourceFormat: "html" };
  },
};