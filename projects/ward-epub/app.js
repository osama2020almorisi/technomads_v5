/* ============================================================
   وِرد — قارئ EPUB محلي
   النسخة 3.0 — مع تصدير/استيراد JSON احترافي
   الإصلاحات السابقة + جديد:
   - ✅ تصدير كتاب واحد بصيغة JSON كامل (فهرس + فصول + صفحات)
   - ✅ تصدير المكتبة كاملة
   - ✅ استيراد كتاب من JSON
   - ✅ استيراد مكتبة كاملة من JSON
============================================================ */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const DB = 'ward-epub-db', STORE = 'books';
let db, books = [], active = null, current = 0;
let filter = 'all', category = 'all', panelTab = 'toc', toastTimer;

const enc = new TextDecoder('utf-8');

/* ---------- أدوات مساعدة ---------- */
function notify(t) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- قاعدة البيانات ---------- */
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 2);
    r.onupgradeneeded = () => {
      const dbRef = r.result;
      if (!dbRef.objectStoreNames.contains(STORE)) {
        dbRef.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    r.onsuccess = () => { db = r.result; res(); };
    r.onerror = () => rej(r.error);
  });
}

function request(mode, fn) {
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, mode);
    const s = tx.objectStore(STORE);
    const r = fn(s);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

const save = b => request('readwrite', s => s.put(b));
const remove = id => request('readwrite', s => s.delete(id));
const getAll = () => request('readonly', s => s.getAll());

/* ---------- قراءة ZIP ---------- */
function u16(v, o) { return v.getUint16(o, true); }
function u32(v, o) { return v.getUint32(o, true); }

async function unzip(file) {
  const buf = await file.arrayBuffer();
  const v = new DataView(buf);
  const bytes = new Uint8Array(buf);

  let eocd = -1;
  const maxScan = Math.min(bytes.length, 65558);
  for (let i = bytes.length - 22; i >= bytes.length - maxScan; i--) {
    if (i < 0) break;
    if (u32(v, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('ملف ZIP غير صالح (لم يُعثر على EOCD)');

  const count = u16(v, eocd + 10);
  let pos = u32(v, eocd + 16);
  const out = new Map();

  for (let n = 0; n < count; n++) {
    if (u32(v, pos) !== 0x02014b50) break;

    const method = u16(v, pos + 10);
    const size = u32(v, pos + 20);
    const nl = u16(v, pos + 28);
    const el = u16(v, pos + 30);
    const cl = u16(v, pos + 32);
    const off = u32(v, pos + 42);
    const name = enc.decode(bytes.slice(pos + 46, pos + 46 + nl));

    const lh = off;
    const ln = u16(v, lh + 26);
    const le = u16(v, lh + 28);
    const start = lh + 30 + ln + le;
    const compressed = bytes.slice(start, start + size);

    let data;
    if (method === 0) {
      data = compressed;
    } else if (method === 8) {
      if (!('DecompressionStream' in window)) {
        throw new Error('متصفحك لا يدعم فك ضغط Deflate.');
      }
      try {
        const stream = new Blob([compressed]).stream()
          .pipeThrough(new DecompressionStream('deflate-raw'));
        data = new Uint8Array(await new Response(stream).arrayBuffer());
      } catch (e) {
        throw new Error('فشل فك ضغط أحد الملفات: ' + e.message);
      }
    } else {
      pos += 46 + nl + el + cl;
      continue;
    }

    out.set(name, data);
    pos += 46 + nl + el + cl;
  }

  return out;
}

/* ---------- تحليل XML ---------- */
function parseXML(data) {
  const text = enc.decode(data);
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) {
    return new DOMParser().parseFromString(text, 'text/html');
  }
  return doc;
}

function attr(el, name) { return el.getAttribute(name) || ''; }

function cleanPath(base, href) {
  if (!href) return '';
  href = href.split('#')[0];
  if (!href) return '';

  try { href = decodeURIComponent(href); } catch (e) {}

  if (/^https?:\/\//i.test(href)) {
    try {
      const u = new URL(href);
      return u.pathname.replace(/^\/+/, '');
    } catch (e) { return href; }
  }

  if (base && !/^[a-z]+:/i.test(href)) {
    let parts = (base + '/' + href).split('/');
    const stack = [];
    for (const p of parts) {
      if (p === '' || p === '.') continue;
      if (p === '..') { stack.pop(); continue; }
      stack.push(p);
    }
    return stack.join('/');
  }

  return href.replace(/^\/+/, '');
}

function normalizePath(p) {
  if (!p) return '';
  return p.replace(/^\.\//, '').replace(/^\/+/, '').toLowerCase();
}

/* ---------- تحليل EPUB ---------- */
async function parseEpub(file) {
  const z = await unzip(file);

  let containerData = z.get('META-INF/container.xml');
  if (!containerData) {
    const key = [...z.keys()].find(k => k.toLowerCase().endsWith('container.xml'));
    if (key) containerData = z.get(key);
  }
  if (!containerData) throw new Error('ملف EPUB غير صالح: لا يوجد container.xml');

  const c = parseXML(containerData);
  const rootfile = c.getElementsByTagName('rootfile')[0];
  if (!rootfile) throw new Error('ملف EPUB غير صالح: لا يوجد rootfile');

  const opfPath = attr(rootfile, 'full-path');
  if (!opfPath) throw new Error('مسار OPF غير موجود');

  let opfData = z.get(opfPath);
  if (!opfData) {
    const norm = normalizePath(opfPath);
    const key = [...z.keys()].find(k => normalizePath(k) === norm);
    if (key) opfData = z.get(key);
  }
  if (!opfData) throw new Error('ملف OPF غير موجود: ' + opfPath);

  const opf = parseXML(opfData);
  const base = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/')) : '';

  const manifest = new Map();
  for (const it of opf.getElementsByTagName('item')) {
    const id = attr(it, 'id');
    const href = attr(it, 'href');
    if (!id || !href) continue;
    manifest.set(id, {
      href: cleanPath(base, href),
      rawHref: href,
      type: attr(it, 'media-type'),
      props: attr(it, 'properties')
    });
  }

  const spine = [];
  for (const it of opf.getElementsByTagName('itemref')) {
    const idref = attr(it, 'idref');
    const m = manifest.get(idref);
    if (m) spine.push(m);
  }

  if (spine.length === 0) throw new Error('الكتاب لا يحتوي على فصول (Spine فارغ)');

  const meta = opf.getElementsByTagName('metadata')[0];
  const getMeta = (tag) => {
    const el = meta?.getElementsByTagName(tag)[0];
    return el?.textContent?.trim() || '';
  };
  const title = getMeta('dc:title') || file.name.replace(/\.epub$/i, '') || 'بدون عنوان';
  const author = getMeta('dc:creator') || 'مؤلف غير محدد';

  let navItem = null, ncxItem = null;
  for (const m of manifest.values()) {
    if (m.props && m.props.split(/\s+/).includes('nav')) navItem = m;
    if (m.type && m.type.includes('ncx')) ncxItem = m;
  }

  let toc = [];
  if (navItem) {
    let navData = z.get(navItem.href);
    if (!navData) {
      const norm = normalizePath(navItem.href);
      const key = [...z.keys()].find(k => normalizePath(k) === norm);
      if (key) navData = z.get(key);
    }
    if (navData) {
      try {
        const doc = parseXML(navData);
        const navs = [...doc.getElementsByTagName('nav')];
        const nav = navs.find(n => {
          const t = n.getAttribute('epub:type') || n.getAttributeNS('http://www.idpf.org/2007/ops', 'type') || '';
          return t === 'toc';
        }) || navs[0];
        if (nav) {
          const ol = nav.getElementsByTagName('ol')[0];
          if (ol) toc = parseNavList(ol, navItem.href, base);
        }
      } catch (e) { console.warn('NAV parse failed', e); }
    }
  }

  if (!toc.length && ncxItem) {
    let ncxData = z.get(ncxItem.href);
    if (!ncxData) {
      const norm = normalizePath(ncxItem.href);
      const key = [...z.keys()].find(k => normalizePath(k) === norm);
      if (key) ncxData = z.get(key);
    }
    if (ncxData) {
      try {
        const doc = parseXML(ncxData);
        const navPoints = [...doc.getElementsByTagName('navPoint')];
        toc = navPoints.filter(n => !n.parentElement?.closest?.('navPoint'))
          .map(n => parseNcxPoint(n, ncxItem.href, base));
      } catch (e) { console.warn('NCX parse failed', e); }
    }
  }

  if (!toc.length) {
    toc = spine.map((m, i) => ({
      label: 'الفصل ' + (i + 1),
      href: m.href,
      children: []
    }));
  }

  const flat = [];
  function walk(nodes) {
    for (const node of nodes) {
      const target = cleanPath(base, node.href || '').split('#')[0];
      const frag = (node.href || '').split('#')[1] || '';
      let ix = spine.findIndex(x => {
        const sp = normalizePath(x.href);
        const tg = normalizePath(target);
        return sp === tg || sp.endsWith('/' + tg) || tg.endsWith('/' + sp);
      });
      if (ix < 0) ix = 0;
      flat.push({
        label: node.label,
        href: target,
        fragment: frag,
        spineIndex: ix
      });
      walk(node.children || []);
    }
  }
  walk(toc);

  if (!flat.length) {
    flat.push(...spine.map((m, i) => ({
      label: 'الفصل ' + (i + 1),
      href: m.href,
      fragment: '',
      spineIndex: i
    })));
  }

  const spineHrefsInFlat = new Set();
  flat.forEach(f => {
    const sp = spine.findIndex(s => {
      const a = normalizePath(s.href);
      const b = normalizePath(f.href);
      return a === b || a.endsWith('/' + b) || b.endsWith('/' + a);
    });
    if (sp >= 0) spineHrefsInFlat.add(sp);
  });

  const missingSpine = [];
  for (let i = 0; i < spine.length; i++) {
    if (!spineHrefsInFlat.has(i)) {
      missingSpine.push({
        label: 'صفحة ' + (i + 1),
        href: spine[i].href,
        fragment: '',
        spineIndex: i,
        isFromSpine: true
      });
    }
  }

  if (missingSpine.length > 0) {
    const combined = [...flat, ...missingSpine];
    combined.sort((a, b) => a.spineIndex - b.spineIndex);
    const seen = new Set();
    flat.length = 0;
    for (const item of combined) {
      const key = item.spineIndex + '|' + item.fragment + '|' + normalizePath(item.href);
      if (seen.has(key)) continue;
      seen.add(key);
      flat.push(item);
    }
  }

  const files = {};
  const fileIndex = {};
  for (const [k, v] of z) {
    files[k] = Array.from(v);
    const norm = normalizePath(k);
    fileIndex[norm] = k;
    const fname = k.split('/').pop();
    fileIndex[fname] = k;
    fileIndex[fname.toLowerCase()] = k;
  }

  let wordCount = 0;
  const spineKeys = new Set(spine.map(m => normalizePath(m.href)));
  for (const k of Object.keys(files)) {
    const norm = normalizePath(k);
    if (!spineKeys.has(norm)) continue;
    try {
      const html = enc.decode(new Uint8Array(files[k]));
      const matches = html.match(/[\p{L}\p{N}]+/gu);
      if (matches) wordCount += matches.length;
    } catch (e) {}
  }

  return {
    id: (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random()),
    title,
    author,
    category: 'عام',
    added: Date.now(),
    progress: 0,
    last: 0,
    marks: [],
    notes: [],
    toc,
    flat,
    spine: spine.map(m => ({ href: m.href, type: m.type })),
    files,
    fileIndex,
    opfBase: base,
    wordCount
  };
}

function parseNavList(ol, navHref, opfBase) {
  const base = navHref.includes('/') ? navHref.substring(0, navHref.lastIndexOf('/')) : '';
  return [...ol.children]
    .filter(li => li.tagName.toLowerCase() === 'li')
    .map(li => {
      const a = li.querySelector(':scope > a, :scope > span');
      const href = a?.getAttribute('href') || '';
      const sub = li.querySelector(':scope > ol');
      return {
        label: (a?.textContent || '').trim() || 'عنصر',
        href: cleanPath(base, href),
        children: sub ? parseNavList(sub, navHref, opfBase) : []
      };
    });
}

function parseNcxPoint(n, ncxHref, opfBase) {
  const base = ncxHref.includes('/') ? ncxHref.substring(0, ncxHref.lastIndexOf('/')) : '';
  const content = n.getElementsByTagName('content')[0];
  const navLabel = n.getElementsByTagName('navLabel')[0];
  return {
    label: (navLabel?.textContent || 'فصل').trim(),
    href: cleanPath(base, content?.getAttribute('src') || ''),
    children: [...n.children]
      .filter(x => x.tagName === 'navPoint')
      .map(x => parseNcxPoint(x, ncxHref, opfBase))
  };
}

function getBookFile(path) {
  if (!active || !active.files) return null;
  if (active.files[path]) return active.files[path];

  const norm = normalizePath(path);
  if (active.fileIndex?.[norm]) return active.files[active.fileIndex[norm]];

  const fname = path.split('/').pop();
  if (active.fileIndex?.[fname]) return active.files[active.fileIndex[fname]];
  if (active.fileIndex?.[fname.toLowerCase()]) return active.files[active.fileIndex[fname.toLowerCase()]];

  const key = Object.keys(active.files).find(k => {
    return normalizePath(k) === norm ||
           normalizePath(k).endsWith('/' + norm) ||
           norm.endsWith('/' + normalizePath(k));
  });
  return key ? active.files[key] : null;
}

/* ---------- عرض الواجهة ---------- */
function render() {
  const q = ($('#searchInput')?.value || '').toLowerCase();
  const shown = books.filter(b => {
    const passFilter =
      filter === 'all' ? true :
      filter === 'reading' ? (b.progress > 0 && b.progress < 100) :
      filter === 'unread' ? (b.progress === 0) :
      filter === 'finished' ? (b.progress >= 100) : true;
    const passCat = category === 'all' || b.category === category;
    const passQ = !q || `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q);
    return passFilter && passCat && passQ;
  });

  const allCount = $('#allCount');
  if (allCount) allCount.textContent = books.length;

  const bookCount = $('#bookCount');
  if (bookCount) bookCount.textContent = shown.length + ' كتاب';

  const sortVal = $('#sortSelect')?.value || 'recent';
  const sorted = [...shown].sort((a, b) => {
    if (sortVal === 'title') return a.title.localeCompare(b.title, 'ar');
    if (sortVal === 'progress') return (b.progress || 0) - (a.progress || 0);
    return (b.added || 0) - (a.added || 0);
  });

  const grid = $('#bookGrid');
  if (grid) {
    grid.innerHTML = sorted.map(b => `
      <div class="book-card">
        <div class="cover" data-open="${b.id}">
          <span class="cover-letter">${esc((b.title || 'ك').slice(0, 1))}</span>
        </div>
        <h3 title="${esc(b.title)}">${esc(b.title)}</h3>
        <p class="author">${esc(b.author)}</p>
        <div class="mini-progress"><span style="width:${b.progress || 0}%"></span></div>
        <div class="card-foot">
          <span>${b.progress || 0}%</span>
          <div class="card-actions">
            <button data-export="${b.id}" title="تصدير JSON">⇩</button>
            <button data-edit="${b.id}" title="تعديل">✎</button>
            <button data-delete="${b.id}" title="حذف">×</button>
            <button data-open="${b.id}" title="قراءة">اقرأ</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  const empty = $('#empty');
  if (empty) empty.hidden = sorted.length > 0;

  const stats = $('#stats');
  if (stats) {
    stats.innerHTML = [
      ['إجمالي الكتب', books.length],
      ['قيد القراءة', books.filter(b => b.progress > 0 && b.progress < 100).length],
      ['مكتملة', books.filter(b => b.progress >= 100).length],
      ['كلمات تقريبية', books.reduce((n, b) => n + (b.wordCount || 0), 0).toLocaleString('ar')]
    ].map(x => `<div class="stat"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
  }

  const cats = [...new Set(books.map(b => b.category || 'عام'))];
  const catEl = $('#categories');
  if (catEl) {
    catEl.innerHTML = `<button class="category ${category === 'all' ? 'active' : ''}" data-cat="all">كل المجموعات</button>` +
      cats.map(c => `<button class="category ${category === c ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  }
}

/* ---------- استيراد كتاب ---------- */
async function importFile(file) {
  if (!file) return;
  try {
    notify('جارٍ استيراد الكتاب… قد يستغرق وقتاً للكتب الكبيرة');

    const grid = $('#bookGrid');
    if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">⏳ جارٍ فك الضغط وتحليل الكتاب…</div>';

    const b = await parseEpub(file);

    await save(b);
    books.push(b);
    render();
    notify('✓ تمت إضافة "' + b.title + '" (' + b.flat.length + ' فصل)');
  } catch (e) {
    console.error(e);
    notify('✗ ' + (e.message || 'تعذر فتح الملف'));
    render();
  }
}

/* ---------- فتح كتاب ---------- */
async function openBook(id) {
  active = books.find(b => b.id === id);
  if (!active) {
    notify('الكتاب غير موجود');
    return;
  }
  if (!active.flat || !active.flat.length) {
    notify('هذا الكتاب لا يحتوي على فصول قابلة للقراءة');
    return;
  }

  $('#libraryView').hidden = true;
  $('#readerView').hidden = false;
  $('#readerTitle').textContent = active.title;
  current = Math.min(active.last || 0, active.flat.length - 1);
  await showChapter(current);
  renderPanel();
  $('#readerPanel').classList.remove('open');

  applyReaderPrefs();
}

/* ---------- محتوى الفصل ---------- */
function chapterHTML(index) {
  const item = active.flat[index];
  if (!item) return '<p>الفصل غير موجود.</p>';

  let arr = getBookFile(item.href);

  if (!arr && active.spine[item.spineIndex]) {
    arr = getBookFile(active.spine[item.spineIndex].href);
  }

  if (!arr) {
    console.warn('Missing file for:', item.href);
    return '<p>تعذر العثور على محتوى هذا الفصل.</p>' +
           '<p style="font-size:12px;color:#999;direction:ltr;text-align:left">Path: ' + esc(item.href) + '</p>';
  }

  let html;
  try {
    html = enc.decode(new Uint8Array(arr));
  } catch (e) {
    return '<p>تعذر فك ترميز محتوى الفصل.</p>';
  }

  const d = new DOMParser().parseFromString(html, 'text/html');
  d.querySelectorAll('script,style,iframe,object,form,link[rel="stylesheet"]').forEach(x => x.remove());

  d.querySelectorAll('img[src]').forEach(img => {
    const src = img.getAttribute('src');
    if (!src || /^https?:\/\//i.test(src) || src.startsWith('data:')) return;
    const base = item.href.includes('/') ? item.href.substring(0, item.href.lastIndexOf('/')) : '';
    const full = cleanPath(base, src);
    const arr2 = getBookFile(full);
    if (arr2) {
      const ext = full.split('.').pop().toLowerCase();
      const mime = ext === 'png' ? 'image/png' :
                   ext === 'gif' ? 'image/gif' :
                   ext === 'svg' ? 'image/svg+xml' :
                   ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const blob = new Blob([new Uint8Array(arr2)], { type: mime });
      img.src = URL.createObjectURL(blob);
    }
  });

  return d.body.innerHTML || d.documentElement.innerHTML || '<p>(فصل فارغ)</p>';
}

async function showChapter(i) {
  if (!active) return;
  current = Math.max(0, Math.min(i, active.flat.length - 1));
  const item = active.flat[current];

  $('#chapterKicker').textContent = 'الفصل ' + (current + 1) + ' من ' + active.flat.length;
  $('#chapterTitle').textContent = item.label;

  const content = $('#chapterContent');
  content.innerHTML = '<div style="text-align:center;padding:30px;color:#999">⏳</div>';

  setTimeout(() => {
    content.innerHTML = chapterHTML(current);
  }, 10);

  const progress = Math.round((current + 1) / active.flat.length * 100);
  active.progress = progress;
  active.last = current;

  try { await save(active); } catch (e) {}

  $('#progressFill').style.width = progress + '%';
  $('#progressLabel').textContent = progress + '%';

  $$('.tree-item').forEach(x => x.classList.toggle('current', Number(x.dataset.index) === current));
  $('#readingArea').scrollTop = 0;
}

/* ---------- لوحة الفهرس ---------- */
function renderPanel() {
  const content = $('#panelContent');
  if (!content || !active) return;

  if (panelTab === 'toc') {
    let html = '';
    let flatIdx = 0;

    function buildTree(nodes, depth) {
      for (const node of nodes) {
        const matchIdx = active.flat.findIndex(f =>
          f.label === node.label &&
          normalizePath(f.href) === normalizePath(cleanPath(active.opfBase, node.href))
        );
        const idx = matchIdx >= 0 ? matchIdx : flatIdx;

        const hasChildren = node.children && node.children.length > 0;
        html += `<div><button class="tree-item ${idx === current ? 'current' : ''}" data-index="${idx}" style="padding-inline-start:${8 + depth * 14}px">`;
        html += `<span class="tree-toggle">${hasChildren ? '›' : '·'}</span>`;
        html += esc(node.label);
        html += `</button>`;
        if (hasChildren) {
          html += `<div class="tree-children">`;
          buildTree(node.children, depth + 1);
          html += `</div>`;
        }
        html += `</div>`;
        flatIdx++;
      }
    }

    buildTree(active.toc, 0);
    content.innerHTML = html;

  } else if (panelTab === 'marks') {
    content.innerHTML = active.marks.length
      ? active.marks.map((m, i) =>
          `<div class="mark-row"><button data-markdel="${i}">×</button>` +
          `<button class="textbtn" data-mark="${i}">☆ ${esc(m.label)} <small class="muted">— فصل ${m.chapter + 1}</small></button></div>`
        ).join('')
      : '<p class="muted">لا توجد علامات بعد.</p>';

  } else {
    content.innerHTML = active.notes.map((n, i) =>
      `<div class="note-row"><button data-notedel="${i}">×</button>${esc(n.text)}<small class="muted"> — ${esc(n.chapterLabel)}</small></div>`
    ).join('') + `<button id="addNote" class="note-add">＋ إضافة ملاحظة للفصل الحالي</button>`;
  }
}

/* ---------- علامة مرجعية ---------- */
function addBookmark() {
  if (!active) return;
  active.marks.push({
    chapter: current,
    label: active.flat[current].label,
    at: Date.now()
  });
  save(active);
  renderPanel();
  notify('✓ تم حفظ العلامة');
}

/* ---------- رجوع ---------- */
function back() {
  if (!active) return;
  active = null;
  $('#readerView').hidden = true;
  $('#libraryView').hidden = false;
  render();
}

/* ---------- إعدادات القراءة ---------- */
const PREFS_KEY = 'ward-reader-prefs';

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); }
  catch (e) { return {}; }
}

function savePrefs() {
  const prefs = {
    fontSize: $('#fontSize')?.value,
    fontFamily: $('#fontFamily')?.value,
    paperTheme: $('#paperTheme')?.value,
    direction: $('#direction')?.value
  };
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function applyReaderPrefs() {
  const p = loadPrefs();
  if (p.fontSize) {
    $('#fontSize').value = p.fontSize;
    $('#chapterContent').style.setProperty('--reader-size', p.fontSize + 'px');
  }
  if (p.fontFamily) {
    $('#fontFamily').value = p.fontFamily;
    $('#chapterContent').style.setProperty('--reader-font', p.fontFamily);
  }
  if (p.paperTheme) {
    $('#paperTheme').value = p.paperTheme;
    $('#readingPaper').className = 'reading-paper ' + (p.paperTheme === 'paper' ? '' : p.paperTheme);
  }
  if (p.direction) {
    $('#direction').value = p.direction;
    $('#chapterContent').dir = p.direction === 'auto' ? 'auto' : p.direction;
  }
}

/* ---------- تحميل ملف ---------- */
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ═══════════════════════════════════════════════════════════
   ⭐ ميزة التصدير الاحترافي — JSON كامل
   ═══════════════════════════════════════════════════════════ */

/**
 * تصدير كتاب واحد بصيغة JSON كامل
 * يحتوي على: البيانات الوصفية + الفهرس + الفصول + الصفحات + العلامات
 */
function exportBookToJSON(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) {
    notify('✗ الكتاب غير موجود');
    return;
  }

  try {
    notify('⏳ جارٍ تحضير ملف التصدير…');

    // بناء JSON منظم واحترافي
    const exportData = {
      format: 'ward-reader-v1',
      formatVersion: '1.0',
      exportedAt: new Date().toISOString(),
      exportedAtTimestamp: Date.now(),

      // بيانات الكتاب
      book: {
        title: book.title || 'بدون عنوان',
        author: book.author || 'غير محدد',
        category: book.category || 'عام',
        added: book.added || Date.now(),
        wordCount: book.wordCount || 0,
        progress: book.progress || 0,
        last: book.last || 0,
        // بيانات المصدر
        sourceFormat: book.sourceFormat || 'epub',
        originalFileName: book.originalFileName || null,
        // الإحصائيات
        stats: {
          totalChapters: book.flat?.length || 0,
          totalWords: book.wordCount || 0
        }
      },

      // الفهرس الشجري
      toc: JSON.parse(JSON.stringify(book.toc || [])),

      // الفهرس المسطح (للتنقل السريع)
      flatIndex: (book.flat || []).map((f, i) => ({
        index: i,
        label: f.label,
        href: f.href,
        fragment: f.fragment || '',
        spineIndex: f.spineIndex,
        isFromSpine: !!f.isFromSpine
      })),

      // كل الفصول مع محتواها
      chapters: (book.flat || []).map((item, i) => {
        const html = extractChapterContent(book, item);
        return {
          index: i,
          title: item.label,
          href: item.href,
          fragment: item.fragment || '',
          spineIndex: item.spineIndex,
          content: html,
          wordCount: (html.match(/[\p{L}\p{N}]+/gu) || []).length
        };
      }),

      // العلامات المرجعية
      bookmarks: (book.marks || []).map(m => ({
        chapterIndex: m.chapter,
        label: m.label,
        createdAt: m.at
      })),

      // الملاحظات
      notes: (book.notes || []).map(n => ({
        chapterIndex: n.chapter,
        chapterLabel: n.chapterLabel,
        text: n.text
      }))
    };

    // إنشاء الملف
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const safeName = (book.title || 'book').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80);
    const filename = `${safeName}_${Date.now()}.json`;

    download(blob, filename);

    const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
    notify(`✓ تم تصدير "${book.title}" (${sizeMB} MB)`);

  } catch (e) {
    console.error('Export error:', e);
    notify('✗ فشل التصدير: ' + e.message);
  }
}

/**
 * استخراج محتوى فصل كنص HTML
 */
function extractChapterContent(book, item) {
  // البحث في files
  let arr = null;
  if (book.files) {
    if (book.files[item.href]) {
      arr = book.files[item.href];
    } else {
      // بحث بمسارات بديلة
      const norm = normalizePath(item.href);
      const key = Object.keys(book.files).find(k => normalizePath(k) === norm);
      if (key) arr = book.files[key];
    }
  }

  // جرب من spine
  if (!arr && book.spine && book.spine[item.spineIndex]) {
    const spineHref = book.spine[item.spineIndex].href;
    if (book.files?.[spineHref]) {
      arr = book.files[spineHref];
    }
  }

  if (!arr) return '';

  try {
    const html = enc.decode(new Uint8Array(arr));
    const d = new DOMParser().parseFromString(html, 'text/html');
    d.querySelectorAll('script,style,iframe,object,form').forEach(x => x.remove());

    // استخراج الجزء المحدد بـ Fragment
    if (item.fragment) {
      const anchor = d.getElementById(item.fragment) ||
                     d.querySelector(`[name="${item.fragment}"]`);
      if (anchor) {
        const container = d.createElement('div');
        let node = anchor.tagName === 'SPAN' || anchor.tagName === 'A'
                   ? anchor.parentElement : anchor;
        let count = 0;
        while (node && count < 200) {
          container.appendChild(node.cloneNode(true));
          let next = node.nextElementSibling;
          while (!next && node.parentElement && node.parentElement !== d.body) {
            node = node.parentElement;
            next = node.nextElementSibling;
          }
          if (!next) break;
          if (next.id && next.id !== item.fragment) break;
          node = next;
          count++;
        }
        return container.innerHTML;
      }
    }

    return d.body.innerHTML || d.documentElement.innerHTML || '';
  } catch (e) {
    return '';
  }
}

/**
 * تصدير المكتبة كاملة بصيغة JSON
 */
function exportLibraryToJSON() {
  try {
    notify('⏳ جارٍ تحضير المكتبة…');

    const exportData = {
      format: 'ward-library-v1',
      formatVersion: '1.0',
      exportedAt: new Date().toISOString(),
      exportedAtTimestamp: Date.now(),
      totalBooks: books.length,

      books: books.map(book => ({
        // بيانات الكتاب
        book: {
          title: book.title,
          author: book.author,
          category: book.category,
          added: book.added,
          wordCount: book.wordCount,
          progress: book.progress,
          last: book.last,
          sourceFormat: book.sourceFormat || 'epub'
        },

        // الفهرس الشجري
        toc: JSON.parse(JSON.stringify(book.toc || [])),

        // الفهرس المسطح
        flatIndex: (book.flat || []).map((f, i) => ({
          index: i,
          label: f.label,
          href: f.href,
          fragment: f.fragment || '',
          spineIndex: f.spineIndex
        })),

        // الفصول مع المحتوى
        chapters: (book.flat || []).map((item, i) => ({
          index: i,
          title: item.label,
          href: item.href,
          fragment: item.fragment || '',
          content: extractChapterContent(book, item)
        })),

        // العلامات
        bookmarks: (book.marks || []).map(m => ({
          chapterIndex: m.chapter,
          label: m.label,
          createdAt: m.at
        })),

        // الملاحظات
        notes: (book.notes || []).map(n => ({
          chapterIndex: n.chapter,
          chapterLabel: n.chapterLabel,
          text: n.text
        }))
      }))
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const filename = `ward-library_${Date.now()}.json`;

    download(blob, filename);

    const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
    notify(`✓ تم تصدير المكتبة كاملة (${books.length} كتاب، ${sizeMB} MB)`);

  } catch (e) {
    console.error('Export library error:', e);
    notify('✗ فشل التصدير: ' + e.message);
  }
}

/**
 * تصدير علامات وملاحظات كتاب فقط
 */
function exportBookmarksToJSON(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  const data = {
    format: 'ward-bookmarks-v1',
    formatVersion: '1.0',
    exportedAt: new Date().toISOString(),
    bookTitle: book.title,
    bookAuthor: book.author,
    bookmarks: (book.marks || []).map(m => ({
      chapterIndex: m.chapter,
      chapterLabel: m.label,
      createdAt: m.at,
      createdAtISO: new Date(m.at).toISOString()
    })),
    notes: (book.notes || []).map(n => ({
      chapterIndex: n.chapter,
      chapterLabel: n.chapterLabel,
      text: n.text
    }))
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const safeName = (book.title || 'book').replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
  download(blob, `${safeName}_markers_${Date.now()}.json`);

  notify('✓ تم تصدير العلامات والملاحظات');
}

/**
 * استيراد كتاب من ملف JSON
 */
async function importBookFromJSON(file) {
  if (!file) return;

  try {
    notify('⏳ جارٍ قراءة ملف JSON…');

    const text = await file.text();
    const data = JSON.parse(text);

    // التحقق من الصيغة
    if (!data.format || !data.format.startsWith('ward-')) {
      throw new Error('الملف ليس من صيغة وِرد المعروفة');
    }

    // استيراد مكتبة كاملة
    if (data.format === 'ward-library-v1') {
      let count = 0;
      for (const bookData of data.books || []) {
        const newBook = convertJSONToBook(bookData);
        await save(newBook);
        books.push(newBook);
        count++;
      }
      render();
      notify(`✓ تم استيراد ${count} كتاب من المكتبة`);
      return;
    }

    // استيراد كتاب واحد
    if (data.format === 'ward-reader-v1') {
      const newBook = convertJSONToBook(data);
      await save(newBook);
      books.push(newBook);
      render();
      notify(`✓ تم استيراد "${newBook.title}"`);
      return;
    }

    throw new Error('صيغة غير مدعومة: ' + data.format);

  } catch (e) {
    console.error('Import error:', e);
    notify('✗ فشل الاستيراد: ' + e.message);
  }
}

/**
 * تحويل بيانات JSON إلى بنية كتاب وِرد
 */
function convertJSONToBook(data) {
  const bookMeta = data.book || {};
  const chapters = data.chapters || [];
  const flatIndex = data.flatIndex || [];

  // إعادة بناء files و flat من chapters
  const files = {};
  const flat = [];

  chapters.forEach((ch, i) => {
    // مفتاح فريد
    const href = ch.href || `chapter_${i}.html`;
    files[href] = Array.from(new TextEncoder().encode(ch.content || ''));

    flat.push({
      label: ch.title || `فصل ${i + 1}`,
      href: href,
      fragment: ch.fragment || '',
      spineIndex: ch.spineIndex ?? i,
      isFromSpine: false
    });
  });

  // بناء spine
  const spine = flat.map(f => ({
    href: f.href,
    type: 'application/xhtml+xml'
  }));

  // بناء fileIndex
  const fileIndex = {};
  for (const k of Object.keys(files)) {
    const norm = normalizePath(k);
    fileIndex[norm] = k;
    const fname = k.split('/').pop();
    fileIndex[fname] = k;
    fileIndex[fname.toLowerCase()] = k;
  }

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random(),
    title: bookMeta.title || 'بدون عنوان',
    author: bookMeta.author || 'غير محدد',
    category: bookMeta.category || 'عام',
    added: bookMeta.added || Date.now(),
    progress: bookMeta.progress || 0,
    last: bookMeta.last || 0,
    marks: (data.bookmarks || []).map(b => ({
      chapter: b.chapterIndex || 0,
      label: b.label || '',
      at: b.createdAt || Date.now()
    })),
    notes: (data.notes || []).map(n => ({
      chapter: n.chapterIndex || 0,
      chapterLabel: n.chapterLabel || '',
      text: n.text || ''
    })),
    toc: data.toc || [],
    flat,
    spine,
    files,
    fileIndex,
    opfBase: '',
    wordCount: bookMeta.wordCount || 0,
    sourceFormat: bookMeta.sourceFormat || 'json',
    importedFrom: 'json'
  };
}

/* ---------- ربط الأحداث ---------- */
function bindEvents() {
  // استيراد EPUB
  const importBtn = $('#importBtn');
  const emptyImport = $('#emptyImport');
  const fileInput = $('#fileInput');
  if (importBtn) importBtn.onclick = () => fileInput.click();
  if (emptyImport) emptyImport.onclick = () => fileInput.click();
  if (fileInput) fileInput.onchange = e => {
    importFile(e.target.files[0]);
    e.target.value = '';
  };

  // استيراد JSON
  const importJsonBtn = $('#importJsonBtn');
  const jsonInput = $('#jsonInput');
  if (importJsonBtn && jsonInput) {
    importJsonBtn.onclick = () => jsonInput.click();
    jsonInput.onchange = e => {
      importBookFromJSON(e.target.files[0]);
      e.target.value = '';
    };
  }

  // بحث وفرز
  if ($('#searchInput')) $('#searchInput').oninput = render;
  if ($('#sortSelect')) $('#sortSelect').onchange = render;

  // فلاتر
  $$('.filter').forEach(b => b.onclick = () => {
    filter = b.dataset.filter;
    $$('.filter').forEach(x => x.classList.toggle('active', x === b));
    const lt = $('#listTitle');
    if (lt) lt.textContent = b.textContent.replace(/\d+/g, '').trim();
    render();
  });

  // تصنيفات
  if ($('#categories')) $('#categories').onclick = e => {
    const b = e.target.closest('[data-cat]');
    if (b) { category = b.dataset.cat; render(); }
  };

  // إضافة مجموعة
  if ($('#addCategory')) $('#addCategory').onclick = () => {
    const name = prompt('اسم المجموعة الجديدة:');
    if (!name || !name.trim()) return;
    notify('المجموعة "' + name.trim() + '" ستظهر بعد تعيين كتاب إليها');
    const catEl = $('#categories');
    if (catEl && !catEl.querySelector(`[data-cat="${name.trim()}"]`)) {
      const btn = document.createElement('button');
      btn.className = 'category';
      btn.dataset.cat = name.trim();
      btn.textContent = name.trim();
      catEl.appendChild(btn);
    }
  };

  // شبكة الكتب
  if ($('#bookGrid')) $('#bookGrid').onclick = async e => {
    const b = e.target.closest('[data-open],[data-edit],[data-delete],[data-export]');
    if (!b) return;

    if (b.dataset.open) {
      openBook(b.dataset.open);
      return;
    }
    if (b.dataset.export) {
      exportBookToJSON(b.dataset.export);
      return;
    }
    if (b.dataset.edit) {
      const book = books.find(x => x.id === b.dataset.edit);
      if (!book) return;
      $('#editTitle').value = book.title;
      $('#editAuthor').value = book.author;
      $('#editCategory').value = book.category;
      $('#editModal').dataset.id = book.id;
      $('#editModal').hidden = false;
      return;
    }
    if (b.dataset.delete) {
      if (!confirm('حذف الكتاب وبياناته من هذه المكتبة؟')) return;
      await remove(b.dataset.delete);
      books = books.filter(x => x.id !== b.dataset.delete);
      render();
      notify('✓ تم حذف الكتاب');
    }
  };

  // Modal
  if ($('#modalClose')) $('#modalClose').onclick = () => $('#editModal').hidden = true;
  if ($('#saveEdit')) $('#saveEdit').onclick = async () => {
    const id = $('#editModal').dataset.id;
    const b = books.find(x => x.id === id);
    if (!b) return;
    b.title = $('#editTitle').value.trim() || b.title;
    b.author = $('#editAuthor').value.trim() || 'غير محدد';
    b.category = $('#editCategory').value.trim() || 'عام';
    await save(b);
    $('#editModal').hidden = true;
    render();
    notify('✓ تم الحفظ');
  };

  // أزرار القارئ
  if ($('#backBtn')) $('#backBtn').onclick = back;
  if ($('#prevBtn')) $('#prevBtn').onclick = () => showChapter(current - 1);
  if ($('#nextBtn')) $('#nextBtn').onclick = () => showChapter(current + 1);
  if ($('#bookmarkBtn')) $('#bookmarkBtn').onclick = addBookmark;
  if ($('#tocBtn')) $('#tocBtn').onclick = () => $('#readerPanel').classList.toggle('open');

  // ⭐ زر تصدير الكتاب الحالي
  if ($('#exportBookBtn')) {
    $('#exportBookBtn').onclick = () => {
      if (active) exportBookToJSON(active.id);
    };
  }

  // قائمة الجوال
  if ($('#closeMenu')) $('#closeMenu').onclick = () => $('#sidebar').classList.remove('open');
  if ($('#menuBtn')) $('#menuBtn').onclick = () => {
    $('#sidebar').classList.add('open');
    $('#overlay').classList.add('show');
  };
  if ($('#overlay')) $('#overlay').onclick = () => {
    $('#sidebar').classList.remove('open');
    $('#overlay').classList.remove('show');
  };

  // لوحة الفهرس
  if ($('#readerPanel')) $('#readerPanel').onclick = async e => {
    const t = e.target.closest('[data-tab]');
    if (t) {
      panelTab = t.dataset.tab;
      $$('.tab').forEach(x => x.classList.toggle('active', x === t));
      renderPanel();
      return;
    }
    const a = e.target.closest('[data-index]');
    if (a) { await showChapter(Number(a.dataset.index)); return; }

    const m = e.target.closest('[data-mark]');
    if (m) { showChapter(active.marks[+m.dataset.mark].chapter); return; }

    const d = e.target.closest('[data-markdel]');
    if (d) { active.marks.splice(+d.dataset.markdel, 1); save(active); renderPanel(); return; }

    const nd = e.target.closest('[data-notedel]');
    if (nd) { active.notes.splice(+nd.dataset.notedel, 1); save(active); renderPanel(); return; }

    if (e.target.id === 'addNote') {
      const text = prompt('اكتب ملاحظتك:');
      if (text) {
        active.notes.push({
          text,
          chapter: current,
          chapterLabel: active.flat[current].label
        });
        save(active);
        renderPanel();
      }
    }
  };

  $$('.tab').forEach(t => t.onclick = () => {
    panelTab = t.dataset.tab;
    $$('.tab').forEach(x => x.classList.toggle('active', x === t));
    renderPanel();
  });

  // إعدادات القراءة
  if ($('#settingsBtn')) $('#settingsBtn').onclick = () => {
    const p = $('#settingsPop');
    p.hidden = !p.hidden;
  };
  if ($('#fontSize')) $('#fontSize').oninput = e => {
    $('#chapterContent').style.setProperty('--reader-size', e.target.value + 'px');
    savePrefs();
  };
  if ($('#fontFamily')) $('#fontFamily').onchange = e => {
    $('#chapterContent').style.setProperty('--reader-font', e.target.value);
    savePrefs();
  };
  if ($('#paperTheme')) $('#paperTheme').onchange = e => {
    $('#readingPaper').className = 'reading-paper ' + (e.target.value === 'paper' ? '' : e.target.value);
    savePrefs();
  };
  if ($('#direction')) $('#direction').onchange = e => {
    $('#chapterContent').dir = e.target.value === 'auto' ? 'auto' : e.target.value;
    savePrefs();
  };

  // ملء الشاشة
  if ($('#fullBtn')) $('#fullBtn').onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else $('#readerView').requestFullscreen?.();
  };

  // تبديل المظهر
  if ($('#themeBtn')) $('#themeBtn').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('ward-dark', document.body.classList.contains('dark'));
  };

  // قراءة صوتية
  if ($('#speakBtn')) $('#speakBtn').onclick = () => {
    if (!('speechSynthesis' in window)) {
      notify('القراءة الصوتية غير مدعومة');
      return;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      notify('تم إيقاف القراءة');
      return;
    }
    const text = $('#chapterContent').innerText;
    if (!text) { notify('لا يوجد نص للقراءة'); return; }

    const chunks = text.match(/[\s\S]{1,200}[.,!?؛،\n]/g) || [text];
    let idx = 0;
    function next() {
      if (idx >= chunks.length) return;
      const utter = new SpeechSynthesisUtterance(chunks[idx]);
      utter.lang = /[\u0600-\u06ff]/.test(chunks[idx]) ? 'ar-SA' : 'en-US';
      utter.rate = 0.95;
      utter.onend = () => { idx++; next(); };
      speechSynthesis.speak(utter);
    }
    next();
  };

  // ⭐ تصدير المكتبة كاملة
  if ($('#exportBtn')) $('#exportBtn').onclick = () => {
    if (books.length === 0) {
      notify('المكتبة فارغة');
      return;
    }
    if (confirm(`تصدير ${books.length} كتاب بصيغة JSON كاملة؟\n\nالحجم قد يكون كبيراً (عدة ميجابايت).`)) {
      exportLibraryToJSON();
    }
  };

  // اختصارات
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $('#settingsPop').hidden = true;
      $('#editModal').hidden = true;
    }
    if (active && !e.target.matches('input,textarea,select')) {
      if (e.key === 'ArrowLeft') showChapter(current + 1);
      if (e.key === 'ArrowRight') showChapter(current - 1);
      if (e.key.toLowerCase() === 'b') addBookmark();
    }
  });
}

/* ---------- بدء التشغيل ---------- */
(async () => {
  if (localStorage.getItem('ward-dark') === 'true') {
    document.body.classList.add('dark');
  }
  try {
    await openDB();
    books = await getAll();
    render();
    bindEvents();
    applyReaderPrefs();
  } catch (e) {
    console.error(e);
    notify('تعذر تشغيل التخزين المحلي');
  }
})();