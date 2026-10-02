/* ═══════════════════════════════════════════════════════════════
   تصدير DOCX — يستخدم مكتبة docx (UMD) لبناء مستند Word عربي RTL
   ═══════════════════════════════════════════════════════════════ */
const DocxExport = {
  /* ─── التحقق من تحميل المكتبة ─── */
  _checkLib() {
    if (typeof docx === "undefined" || !docx.Document || !docx.Packer) {
      throw new Error("مكتبة docx غير محمّلة — تحقق من الاتصال بالإنترنت أول مرة");
    }
  },

  /* ─── اسم ملف آمن ─── */
  _safeName(title) {
    return String(title || "كتاب")
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100);
  },

  /* ─── إعدادات المستند ─── */
  _buildStyles() {
    const {
      HeadingLevel, AlignmentType, BorderStyle,
    } = docx;

    return {
      default: {
        document: {
          run: {
            font: "Noto Naskh Arabic",
            size: 26, // 13pt (half-points)
            color: "1A1A2E",
          },
          paragraph: {
            spacing: { line: 480, after: 200 }, // line-height 2.0
            alignment: AlignmentType.JUSTIFIED,
            bidirectional: true, // RTL
          },
        },
        heading1: {
          run: { font: "Amiri", size: 44, bold: true, color: "C79B3B" }, // 22pt
          paragraph: { spacing: { before: 300, after: 300 }, alignment: AlignmentType.CENTER, bidirectional: true },
        },
        heading2: {
          run: { font: "Amiri", size: 36, bold: true, color: "1A1A2E" }, // 18pt
          paragraph: {
            spacing: { before: 400, after: 200 },
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: "C79B3B", space: 6 },
            },
          },
        },
        heading3: {
          run: { font: "Amiri", size: 30, bold: true, color: "1A1A2E" }, // 15pt
          paragraph: { spacing: { before: 240, after: 120 }, bidirectional: true },
        },
        heading4: {
          run: { font: "Amiri", size: 26, bold: true, color: "1A1A2E" },
          paragraph: { spacing: { before: 200, after: 100 }, bidirectional: true },
        },
      },
    };
  },

  /* ─── تحويل HTML إلى مصفوفة Paragraphs ─── */
  _htmlToParagraphs(html) {
    const {
      Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink,
    } = docx;

    const paragraphs = [];
    if (!html) return paragraphs;

    // تنظيف HTML من العناصر الضارّة
    const clean = String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "");

    const dom = new DOMParser().parseFromString(`<body>${clean}</body>`, "text/html");
    const body = dom.body;

    // مساعد: تحويل عنصر نصي إلى TextRun مع اكتشاف bold/italic
    const runsFromNode = (node) => {
      const runs = [];
      const walk = (n, opts = { bold: false, italics: false, underline: false }) => {
        if (n.nodeType === Node.TEXT_NODE) {
          const text = n.textContent.replace(/\s+/g, " ");
          if (text.trim()) {
            runs.push(new TextRun({
              text,
              bold: opts.bold,
              italics: opts.italics,
              underline: opts.underline ? {} : undefined,
              rightToLeft: true,
            }));
          }
          return;
        }
        if (n.nodeType !== Node.ELEMENT_NODE) return;
        const tag = n.tagName.toLowerCase();
        const next = {
          bold: opts.bold || tag === "b" || tag === "strong",
          italics: opts.italics || tag === "i" || tag === "em",
          underline: opts.underline || tag === "u",
        };
        // تجاهل نصوص داخل <a> لكن حافظ على النص
        n.childNodes.forEach((c) => walk(c, next));
      };
      walk(node);
      if (!runs.length) runs.push(new TextRun({ text: "", rightToLeft: true }));
      return runs;
    };

    // مساعد: تحويل <blockquote> إلى Paragraph مع تمييز
    const blockquotePara = (el) => new Paragraph({
      children: runsFromNode(el).map((r) => r), // تُنسَّق مسبقاً
      indent: { right: 400, left: 400 },
      spacing: { before: 200, after: 200 },
      shading: { fill: "FAF6EA" },
      border: {
        right: { style: docx.BorderStyle.SINGLE, size: 18, color: "C79B3B", space: 8 },
      },
      bidirectional: true,
      alignment: AlignmentType.JUSTIFIED,
    });

    // مساعد: تحويل <ul>/<ol> إلى قائمة Paragraphs
    const listPara = (li, isOrdered, level) => {
      const runs = runsFromNode(li);
      return new Paragraph({
        children: runs,
        bullet: isOrdered ? undefined : { level: Math.min(level, 4) },
        numbering: isOrdered
          ? { reference: "ordered-list", level: Math.min(level, 4) }
          : undefined,
        indent: { right: 200 + level * 300 },
        spacing: { after: 80 },
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
      });
    };

    // معالجة كل عنصر مباشر في <body>
    const processElement = (el, ctx = {}) => {
      const tag = el.tagName.toLowerCase();

      // عناوين
      if (/^h[1-6]$/.test(tag)) {
        const level = Number(tag[1]);
        const headingLevel =
          level === 1 ? HeadingLevel.HEADING_1 :
          level === 2 ? HeadingLevel.HEADING_2 :
          level === 3 ? HeadingLevel.HEADING_3 :
          HeadingLevel.HEADING_4;
        paragraphs.push(new Paragraph({
          heading: headingLevel,
          children: runsFromNode(el),
          bidirectional: true,
        }));
        return;
      }

      // فقرة عادية
      if (tag === "p") {
        // قد تحتوي <p> على <br> — نعالجها كـ runs منفصلة
        const runs = [];
        const walkP = (n, opts = {}) => {
          if (n.nodeType === Node.TEXT_NODE) {
            const text = n.textContent.replace(/\s+/g, " ");
            if (text.trim()) {
              runs.push(new TextRun({ text, bold: opts.bold, italics: opts.italics, rightToLeft: true }));
            }
            return;
          }
          if (n.nodeType !== Node.ELEMENT_NODE) return;
          if (n.tagName.toLowerCase() === "br") {
            runs.push(new TextRun({ break: 1 }));
            return;
          }
          const tg = n.tagName.toLowerCase();
          const next = {
            bold: opts.bold || tg === "b" || tg === "strong",
            italics: opts.italics || tg === "i" || tg === "em",
          };
          n.childNodes.forEach((c) => walkP(c, next));
        };
        walkP(el);
        if (!runs.length) runs.push(new TextRun({ text: "", rightToLeft: true }));
        paragraphs.push(new Paragraph({ children: runs, bidirectional: true, alignment: AlignmentType.JUSTIFIED }));
        return;
      }

      // اقتباس
      if (tag === "blockquote") {
        paragraphs.push(blockquotePara(el));
        return;
      }

      // قوائم
      if (tag === "ul" || tag === "ol") {
        const isOrdered = tag === "ol";
        const level = ctx.level || 0;
        [...el.children].forEach((li) => {
          if (li.tagName.toLowerCase() !== "li") return;
          // نص الـ li (بدون sub-lists)
          const inlineNode = li.cloneNode(true);
          [...inlineNode.querySelectorAll("ul,ol")].forEach((x) => x.remove());
          paragraphs.push(listPara(inlineNode, isOrdered, level));
          // sub-lists
          li.querySelectorAll(":scope > ul, :scope > ol").forEach((sub) => {
            processElement(sub, { level: level + 1 });
          });
        });
        return;
      }

      // فاصل
      if (tag === "hr") {
        paragraphs.push(new Paragraph({
          text: "",
          border: {
            bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: "E5D9B8", space: 8 },
          },
          spacing: { before: 200, after: 200 },
        }));
        return;
      }

      // جدول — نحوّله لفقرات بسيطة
      if (tag === "table") {
        [...el.querySelectorAll("tr")].forEach((tr) => {
          const cells = [...tr.children].map((td) => td.textContent.trim()).join(" | ");
          if (cells) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({ text: cells, rightToLeft: true, size: 22 })],
              spacing: { after: 60 },
              bidirectional: true,
            }));
          }
        });
        return;
      }

      // صورة
      if (tag === "img") {
        // تجاهل الصور (docx يحتاج arraybuffer — نتركها للنسخة القادمة)
        const alt = el.getAttribute("alt");
        if (alt) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `[صورة: ${alt}]`, italics: true, color: "8491A3", rightToLeft: true })],
            alignment: AlignmentType.CENTER,
          }));
        }
        return;
      }

      // أي عنصر آخر (div, section, article): عالج أبناءه
      if (el.children.length) {
        [...el.children].forEach((c) => processElement(c, ctx));
      } else if (el.textContent.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: el.textContent.trim(), rightToLeft: true })],
          bidirectional: true,
        }));
      }
    };

    [...body.children].forEach((el) => processElement(el, { level: 0 }));
    if (!paragraphs.length) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: "", rightToLeft: true })],
      }));
    }
    return paragraphs;
  },

  /* ─── بناء المستند الكامل ─── */
  async _buildDocument(bookId, options = {}) {
    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      AlignmentType, PageBreak, NumberFormat, convertInchesToTwip,
    } = docx;

    const withToc = options.withToc !== false;

    const book = await DB.get("books", bookId);
    if (!book) throw new Error("الكتاب غير موجود");

    const tree = await BookAPI.getChapterTree(bookId);
    const flat = BookAPI.flattenTree(tree);
    if (!flat.length) throw new Error("الكتاب لا يحتوي على فصول");

    const children = [];

    // ═══ 1) صفحة الغلاف ═══
    children.push(new Paragraph({ text: "", spacing: { before: 2400 } }));
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [new TextRun({ text: book.title, font: "Amiri", size: 56, bold: true, color: "C79B3B", rightToLeft: true })],
      spacing: { after: 400 },
    }));
    if (book.author) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: `تأليف: ${book.author}`, font: "Amiri", size: 28, color: "64748B", rightToLeft: true })],
        spacing: { after: 200 },
      }));
    }
    if (book.publisher) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: book.publisher, size: 22, color: "8491A3", rightToLeft: true })],
      }));
    }
    children.push(new Paragraph({ text: "", spacing: { before: 600 } }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "❖ ❖ ❖", color: "C79B3B", size: 32 })],
    }));
    // فاصل صفحة
    children.push(new Paragraph({ children: [new PageBreak()] }));

    // ═══ 2) الفهرس ═══
    if (withToc && flat.length > 1) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [new TextRun({ text: "الفهرس", font: "Amiri", size: 36, bold: true, color: "C79B3B", rightToLeft: true })],
        spacing: { after: 400 },
      }));
      flat.forEach((c, i) => {
        const indentRight = 200 + c.depth * 400;
        children.push(new Paragraph({
          bidirectional: true,
          indent: { right: indentRight },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: `${i + 1}. `, bold: true, color: "C79B3B", rightToLeft: true }),
            new TextRun({ text: c.title, rightToLeft: true }),
          ],
        }));
      });
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // ═══ 3) الفصول ═══
    for (let ci = 0; ci < flat.length; ci++) {
      const ch = flat[ci];
      const pages = await BookAPI.getPages(ch.id);
      if (!pages.length) continue;

      // عنوان الفصل
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        pageBreakBefore: ci > 0, // كل فصل يبدأ في صفحة جديدة
        children: [new TextRun({ text: ch.title, font: "Amiri", size: 40, bold: true, color: "1A1A2E", rightToLeft: true })],
        spacing: { before: 400, after: 400 },
      }));

      // محتوى الفصل
      for (const p of pages) {
        const paras = this._htmlToParagraphs(p.content || "");
        children.push(...paras);
      }
    }

    // ═══ 4) التذييل ═══
    children.push(new Paragraph({ text: "", spacing: { before: 600 } }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      border: { top: { style: docx.BorderStyle.SINGLE, size: 6, color: "E5D9B8", space: 8 } },
      children: [new TextRun({
        text: `صُدِّر بواسطة بداية ريدر برو — ${new Date().toLocaleDateString("ar-EG")}`,
        size: 18, color: "8491A3", rightToLeft: true,
      })],
    }));

    // ═══ 5) إنشاء المستند ═══
    const doc = new Document({
      styles: this._buildStyles(),
      numbering: {
        config: [{
          reference: "ordered-list",
          levels: [0, 1, 2, 3, 4].map((lvl) => ({
            level: lvl,
            format: NumberFormat.DECIMAL,
            text: `%${lvl + 1}.`,
            alignment: AlignmentType.RIGHT,
            style: { paragraph: { indent: { right: 200 + lvl * 300 } } },
          })),
        }],
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1.2),
              left: convertInchesToTwip(1),
            },
          },
        },
        children,
      }],
    });

    return doc;
  },

  /* ─── الدالة الرئيسية ─── */
  async export(bookId, options = {}) {
    this._checkLib();
    const { Packer } = docx;

    const book = await DB.get("books", bookId);
    if (!book) throw new Error("الكتاب غير موجود");

    const doc = await this._buildDocument(bookId, options);
    const blob = await Packer.toBlob(doc);
    return blob;
  },
};

/* ─── كشف للاستخدام من Exporter ─── */
window.DocxExport = DocxExport;

/* ─── دالة توافقية (للنسخة القديمة) ─── */
async function exportDOCX(bookId, options) {
  return await DocxExport.export(bookId, options);
}