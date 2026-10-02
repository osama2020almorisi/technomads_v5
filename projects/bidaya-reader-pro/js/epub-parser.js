/* ═══ استيراد EPUB2/EPUB3 عبر JSZip ═══ */
const EpubParser = {
  async parse(file, onProgress = null) {
    if (typeof JSZip === "undefined") throw new Error("مكتبة JSZip غير محملة");
    const progress = (p, msg) => { if (onProgress) onProgress(p, msg); };
    progress(5, "قراءة الملف…");
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    progress(20, "تحليل الحاوية…");

    // 1) container.xml → مسار OPF
    const containerFile = zip.file("META-INF/container.xml");
    if (!containerFile) throw new Error("ملف EPUB غير صالح: container.xml مفقود");
    const containerXml = await containerFile.async("text");
    const opfPath = containerXml.match(/full-path="([^"]+)"/)?.[1];
    if (!opfPath) throw new Error("تعذر تحديد ملف content.opf");
    const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";
    progress(35, "استخراج البيانات الوصفية…");

    // 2) content.opf → metadata + manifest + spine
    const opfText = await zip.file(opfPath).async("text");
    const opfDoc = new DOMParser().parseFromString(opfText, "application/xml");
    if (opfDoc.querySelector("parsererror")) throw new Error("ملف content.opf تالف");
    const $ = (sel) => opfDoc.querySelector(sel);
    const $$ = (sel) => [...opfDoc.querySelectorAll(sel)];
    const textOf = (el) => el ? el.textContent.trim() : "";
    const meta = (name) => textOf($(`metadata > *[name="${name}"]`)) || "";

    const title = textOf($("metadata > title")) || file.name.replace(/\.epub$/i, "");
    const author = textOf($("metadata > creator")) || meta("author");
    const publisher = textOf($("metadata > publisher"));
    const language = textOf($("metadata > language")) || "ar";
    const description = textOf($("metadata > description"));
    const bookId = textOf($("metadata > identifier"));

    // manifest
    const manifest = new Map();
    $$("manifest > item").forEach((it) => {
      manifest.set(it.getAttribute("id"), {
        href: it.getAttribute("href"),
        type: it.getAttribute("media-type") || "",
        props: it.getAttribute("properties") || "",
      });
    });
    // spine
    const spineIds = $$("spine > itemref").map((r) => r.getAttribute("idref")).filter(Boolean);

    // 3) الغلاف
    progress(45, "استخراج الغلاف…");
    let cover = null;
    const coverItem = [...manifest.values()].find((m) => m.props.includes("cover-image"));
    const coverMeta = $('metadata > meta[name="cover"]');
    const coverEntry = coverItem ? zip.file(opfDir + coverItem.href)
                    : coverMeta ? zip.file(opfDir + (manifest.get(coverMeta.getAttribute("content"))?.href || ""))
                    : null;
    if (coverEntry) {
      try {
        const blob = await coverEntry.async("blob");
        cover = await new Promise((res) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result);
          fr.onerror = () => res(null);
          fr.readAsDataURL(blob);
        });
      } catch (_) { cover = null; }
    }

    // 4) الفهرس من toc.ncx (EPUB2) أو nav.xhtml (EPUB3)
    progress(55, "بناء شجرة الفصول…");
    let tocItems = [];
    const ncxItem = [...manifest.entries()].find(([, m]) => m.type.includes("ncx"));
    if (ncxItem) {
      try {
        const ncxText = await zip.file(opfDir + ncxItem[1].href).async("text");
        tocItems = this._parseNcx(ncxText);
      } catch (_) {}
    }
    if (!tocItems.length) {
      const navItem = [...manifest.entries()].find(([, m]) => m.props.includes("nav"));
      if (navItem) {
        try {
          const navText = await zip.file(opfDir + navItem[1].href).async("text");
          tocItems = this._parseNav(navText);
        } catch (_) {}
      }
    }

    // 5) قراءة محتوى الملفات المشير إليها spine
    progress(65, "استخراج محتوى الفصول…");
    const fileCache = new Map();
    const readFile = async (href) => {
      const key = opfDir + href;
      if (fileCache.has(key)) return fileCache.get(key);
      const f = zip.file(key) || zip.file(href);
      let content = null;
      if (f) {
        content = await f.async("text");
        // حل المسارات النسبية للصور
        const dir = href.includes("/") ? href.slice(0, href.lastIndexOf("/") + 1) : "";
        content = content.replace(/(src|href)=["'](?!data:|https?:|#)([^"']+)["']/g,
          (m, attr, p) => {
            const target = dir + p;
            const zf = zip.file(opfDir + target) || zip.file(target);
            if (zf && /\.(png|jpe?g|gif|webp|svg)$/i.test(p)) {
              return `${attr}="data:image-placeholder" data-src-epub="${TextUtil.esc(opfDir + target)}"`;
            }
            return m;
          });
      }
      fileCache.set(key, content);
      return content;
    };

    // إحلال الصور بـ data URL
    const embedImages = async (html) => {
      const re = /data-src-epub="([^"]+)"/g;
      let m, out = html;
      const jobs = [];
      while ((m = re.exec(html))) jobs.push(m[1]);
      await Promise.all(jobs.map(async (key) => {
        try {
          const zf = zip.file(key);
          if (!zf) return;
          const blob = await zf.async("blob");
          const type = /\.png/i.test(key) ? "image/png" : /\.gif/i.test(key) ? "image/gif" : /\.svg/i.test(key) ? "image/svg+xml" : /\.webp/i.test(key) ? "image/webp" : "image/jpeg";
          const dataUrl = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(""); fr.readAsDataURL(new Blob([blob], { type })); });
          if (dataUrl) out = out.split(`data-src-epub="${key}"`).join(`src="${dataUrl}"`).split(`data:image-placeholder" data-src-epub="${key}"`).join(`${dataUrl}"`);
        } catch (_) {}
      }));
      return out;
    };

    // خريطة href → id لربط الفهرس بالملفات
    const hrefToId = new Map();
    manifest.forEach((m, id) => hrefToId.set(decodeURIComponent(m.href), id));
    const hrefToIdLoose = new Map();
    manifest.forEach((m, id) => hrefToIdLoose.set(decodeURIComponent(m.href).split("#")[0], id));

    // 6) بناء الفصول
    const chapters = [];
    const pages = [];
    let order = 0;
    const tmpCounter = { n: 0 };
    const newTmp = () => "c" + (tmpCounter.n++);

    const addChapter = async (titleText, href, parentTmp, depth) => {
      const fileHref = href.split("#")[0];
      const spineId = hrefToId.get(decodeURIComponent(fileHref)) || hrefToIdLoose.get(decodeURIComponent(fileHref));
      let html = "";
      if (spineId && manifest.has(spineId)) {
        html = await readFile(manifest.get(spineId).href) || "";
        // قص عند المرساة إن وُجدت
        const anchor = href.split("#")[1];
        if (anchor) {
          const frag = html.match(new RegExp(`id=["']${anchor}["']`));
          if (frag) {
            const pos = html.indexOf(frag[0]);
            // القص من بداية العنصر الحاوي تقريبياً
            html = html.slice(Math.max(0, html.lastIndexOf("<", pos)));
          }
        }
      }
      const tmp = newTmp();
      chapters.push({ _tmp: tmp, parent_id: parentTmp, title: titleText.trim() || "فصل", order_num: order++, depth });
      if (html && html.trim()) {
        const embedded = await embedImages(html);
        pages.push({ _tmpChapter: tmp, page_num: 1, word_count: TextUtil.wordCount(embedded), content: embedded });
      }
      return tmp;
    };

    const maxDepth = 5; // الفهرس يصل إلى 5 أبعاد
    const buildFromToc = async (items, parentTmp = null, depth = 0) => {
      if (depth >= maxDepth) return;
      for (const it of items) {
        const tmp = await addChapter(it.title, it.href, parentTmp, depth);
        if (it.children?.length) await buildFromToc(it.children, tmp, depth + 1);
      }
    };

    if (tocItems.length) {
      await buildFromToc(tocItems);
    } else {
      // بدون فهرس: كل عنصر في spine فصل
      for (const idref of spineIds) {
        const m = manifest.get(idref);
        if (!m || !m.type.includes("html")) continue;
        const tmp = newTmp();
        const html = await readFile(m.href);
        const docH = new DOMParser().parseFromString(html || "", "text/html");
        const h = docH.querySelector("h1,h2,h3")?.textContent?.trim();
        chapters.push({ _tmp: tmp, parent_id: null, title: h || `القسم ${chapters.length + 1}`, order_num: order++, depth: 0 });
        if (html?.trim()) pages.push({ _tmpChapter: tmp, page_num: 1, word_count: TextUtil.wordCount(html), content: html });
      }
    }
    if (!chapters.length) throw new Error("لم يتم العثور على فصول في ملف EPUB");

    progress(95, "الانتهاء من التحليل…");
    const book = {
      title, author, publisher, language, cover,
      description: description.slice(0, 2000),
      book_identifier: bookId,
      imported_at: Date.now(),
    };
    return { book, chapters, pages, sourceFormat: "epub" };
  },

  // تحليل toc.ncx (EPUB2)
  _parseNcx(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    if (doc.querySelector("parsererror")) return [];
    const navPoints = [...doc.querySelectorAll("navMap > navPoint")];
    const parsePoint = (np) => ({
      title: np.querySelector("navLabel > text")?.textContent?.trim() || "فصل",
      href: np.querySelector("content")?.getAttribute("src") || "",
      children: [...np.querySelectorAll(":scope > navPoint")].map(parsePoint),
    });
    return navPoints.map(parsePoint);
  },

  // تحليل nav.xhtml (EPUB3)
  _parseNav(navText) {
    const doc = new DOMParser().parseFromString(navText, "application/xhtml+xml");
    if (doc.querySelector("parsererror")) return [];
    const ol = doc.querySelector("nav[*|type='toc'] ol, nav ol");
    if (!ol) return [];
    const parseOl = (listEl) => [...listEl.children]
      .filter((li) => li.tagName.toLowerCase() === "li")
      .map((li) => {
        const a = li.querySelector(":scope > a");
        const sub = li.querySelector(":scope > ol");
        return {
          title: a?.textContent?.trim() || "فصل",
          href: a?.getAttribute("href") || "",
          children: sub ? parseOl(sub) : [],
        };
      });
    return parseOl(ol);
  },
};