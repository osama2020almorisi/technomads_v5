/* ============================================================
   وِرد برو — قارئ EPUB محلي احترافي | الإصدار 6.0
   ─────────────────────────────────────────────────────────────
   المزايا:
   • بناء flat من spine (كل الصفحات) + ترحيل تلقائي للقديمة
   • أرقام صفحات دقيقة في الفهرس والشريط
   • بحث ذكي عبر Web Worker (لا تجميد)
   • فهرس قابل للبحث + lazy loading (500 عنصر فقط)
   • القراءة الصوتية الاحترافية:
       - إيقاف/استئناف دقيق من نفس الموضع
       - تظليل الكلمة المقروءة (onboundary)
       - شريط تقدم داخل الصفحة
       - النقر على فقرة للقراءة منها
       - 7 أزرار سرعة سريعة + منزلق
       - مؤقت النوم (Sleep Timer)
       - قائمة أصوات مُصنّفة
       - لوحة تحكم قابلة للطي
   • حفظ debounced، touchend، حفظ موضع التمرير
============================================================ */
'use strict';

/* ---------- أدوات أساسية ---------- */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const enc = new TextDecoder('utf-8');
const DB = 'ward-epub-db', STORE = 'books';
let db, books = [], active = null, current = 0;
let filter = 'all', category = 'all', panelTab = 'toc', toastTimer;
let gridView = true, confirmResolve = null, promptResolve = null;
let editRatingVal = 0, rtAcc = 0, searchCache = new Map();
let saveTimer = null;

/* ---------- بحث: حالة العامل ---------- */
let searchWorker = null;
let searchIndexReady = false;
let searchDebounceTimer = null;
let searchSeq = 0;

const HL_COLORS = { yellow:'#ffe08a', green:'#b8e6b0', blue:'#aad4ff', pink:'#ffc4dd' };

const FONTS = [
  { label:'أميري',        css:"'Amiri', serif" },
  { label:'شهريار',       css:"'Scheherazade New', serif" },
  { label:'نسخ',          css:"'Noto Naskh Arabic', serif" },
  { label:'كوفي',         css:"'Noto Kufi Arabic', sans-serif" },
  { label:'ريم كوفي',     css:"'Reem Kufi', sans-serif" },
  { label:'رقعة',         css:"'Aref Ruqaa', serif" },
  { label:'المسيري',      css:"'El Messiri', sans-serif" },
  { label:'القاهرة',      css:"'Cairo', sans-serif" },
  { label:'تجوال',        css:"'Tajawal', sans-serif" },
  { label:'المراعي',      css:"'Almarai', sans-serif" },
  { label:'شانجا',        css:"'Changa', sans-serif" },
  { label:'مرحي',         css:"'Marhey', cursive" },
  { label:'حرمتان',       css:"'Harmattan', sans-serif" },
  { label:'لطيف',         css:"'Lateef', serif" },
  { label:'فايبز',        css:"'Vibes', cursive" },
  { label:'ركّاس',        css:"'Rakkas', serif" },
];

const DEFAULT_PREFS = {
  font:"'Amiri', serif", size:21, lineHeight:2.05, spacing:0, maxWidth:780,
  paper:'paper', dir:'auto', justify:true, dropCap:false,
  voiceRate:0.95, voiceURI:null, dark:false,
  ttsStripTashkeel: true, ttsAutoNextPage: false
};
let prefs = { ...DEFAULT_PREFS };
try { Object.assign(prefs, JSON.parse(localStorage.getItem('ward-prefs')||'{}')); } catch(e){}

function savePrefs(){ try{ localStorage.setItem('ward-prefs', JSON.stringify(prefs)); }catch(e){} }
function esc(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function uid(){ return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'id-'+Date.now()+'-'+Math.random().toString(36).slice(2); }
function notify(t){ const el=$('#toast'); if(!el) return; el.textContent=t; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),3200); }
function download(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
function fmtDur(sec){ sec=Math.round(sec||0); const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60); return h? h+' س '+m+' د' : m? m+' د' : sec+' ث'; }
function dayKey(d){ d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function todayStr(ts){ try{ return new Date(ts).toLocaleDateString('ar',{day:'numeric',month:'short'}); }catch(e){ return ''; } }

/* ---------- حفظ debounced ---------- */
function saveDebounced(book, delay=1500){
  if(!book) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{ save(book).catch(()=>{}); }, delay);
}

/* ---------- وقت القراءة ---------- */
function getRT(){ try{ return JSON.parse(localStorage.getItem('ward-rt')||'{"days":{},"total":0}'); }catch(e){ return {days:{},total:0}; } }
function addRT(sec){ const rt=getRT(); const k=dayKey(); rt.days[k]=(rt.days[k]||0)+sec; rt.total+=sec; try{ localStorage.setItem('ward-rt',JSON.stringify(rt)); }catch(e){} }

setInterval(()=>{
  if(active && !$('#readerView').hidden && !document.hidden){
    rtAcc += 5;
    active.secondsRead = (active.secondsRead||0) + 5;
    if(rtAcc >= 30){ addRT(rtAcc); rtAcc = 0; saveDebounced(active, 500); }
  }
}, 5000);

/* ---------- نوافذ التأكيد والإدخال ---------- */
function confirmDlg(title,text){ return new Promise(res=>{ $('#confirmTitle').textContent=title; $('#confirmText').textContent=text; $('#confirmModal').hidden=false; confirmResolve=res; }); }
function promptDlg(title,value){ return new Promise(res=>{ $('#promptTitle').textContent=title; $('#promptInput').value=value||''; $('#promptModal').hidden=false; promptResolve=res; setTimeout(()=>$('#promptInput').focus(),50); }); }

/* ---------- قاعدة البيانات ---------- */
function openDB(){ return new Promise((res,rej)=>{
  const r = indexedDB.open(DB, 2);
  r.onupgradeneeded = () => { const d=r.result; if(!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE,{keyPath:'id'}); };
  r.onsuccess = () => { db=r.result; res(); };
  r.onerror   = () => rej(r.error);
}); }
function req(mode,fn){ return new Promise((res,rej)=>{ const t=db.transaction(STORE,mode); const r=fn(t.objectStore(STORE)); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
const save   = b  => req('readwrite', s=>s.put(b));
const remove = id => req('readwrite', s=>s.delete(id));
const getAll = () => req('readonly',  s=>s.getAll());

/* ---------- Web Worker للبحث ---------- */
function initSearchWorker(){
  if(searchWorker) return;
  try{
    searchWorker = new Worker('search-worker.js');
    searchWorker.onmessage = (e) => {
      const data = e.data || {};
      if(data.type === 'INDEX_READY'){
        searchIndexReady = true;
        console.info('[Search] فهرس جاهز:', data.count, 'صفحة');
      }
      if(data.type === 'SEARCH_RESULTS'){
        renderSearchResults(data);
      }
      if(data.type === 'ERROR'){
        console.warn('[Search Worker]', data.error);
      }
    };
    searchWorker.onerror = (err) => {
      console.error('[Search Worker]', err);
      searchWorker = null;
    };
  }catch(e){
    console.warn('Web Worker غير مدعوم — سنستخدم البحث المتزامن');
    searchWorker = null;
  }
}

async function buildSearchIndexInBackground(){
  if(!active) return;
  if(searchCache.has(active.id)){
    if(searchWorker && !searchIndexReady){
      searchWorker.postMessage({ type:'BUILD_INDEX', payload:{ bookId: active.id, index: searchCache.get(active.id) } });
      searchIndexReady = true;
    }
    return;
  }

  const total = active.flat.length;
  const idx = [];
  const CHUNK = 50;

  for(let start = 0; start < total; start += CHUNK){
    const end = Math.min(start + CHUNK, total);
    for(let i = start; i < end; i++){
      const it = active.flat[i];
      try{
        const html = extractChapterContent(active, it);
        const text = htmlToText(html);
        idx.push({ i, label: it.label, text });
      }catch(e){
        idx.push({ i, label: it.label, text: '' });
      }
    }
    await new Promise(r => setTimeout(r, 0));
  }

  searchCache.set(active.id, idx);

  if(searchWorker){
    searchWorker.postMessage({ type:'BUILD_INDEX', payload:{ bookId: active.id, index: idx } });
    searchIndexReady = true;
  }
}

/* ---------- ZIP ---------- */
function u16(v,o){ return v.getUint16(o,true); }
function u32(v,o){ return v.getUint32(o,true); }

async function inflateRaw(uint8){
  if('DecompressionStream' in window){
    const st = new Blob([uint8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(st).arrayBuffer());
  }
  throw new Error('متصفحك لا يدعم فك ضغط ZIP — استخدم Chrome أو Firefox أو حدّث Safari إلى 16.4+');
}

async function unzip(file){
  const buf = await file.arrayBuffer();
  const v = new DataView(buf), bytes = new Uint8Array(buf);
  let eocd = -1;
  const maxScan = Math.min(bytes.length, 65558);
  for(let i = bytes.length-22; i >= bytes.length-maxScan; i--){
    if(i < 0) break;
    if(u32(v,i) === 0x06054b50){ eocd = i; break; }
  }
  if(eocd < 0) throw new Error('ملف ZIP غير صالح');
  const count = u16(v, eocd+10);
  let pos = u32(v, eocd+16);
  const out = new Map();
  for(let n = 0; n < count; n++){
    if(u32(v,pos) !== 0x02014b50) break;
    const method = u16(v,pos+10), size = u32(v,pos+20);
    const nl = u16(v,pos+28), el = u16(v,pos+30), cl = u16(v,pos+32);
    const off = u32(v,pos+42);
    const name = enc.decode(bytes.slice(pos+46, pos+46+nl));
    const lh = off, ln = u16(v,lh+26), le = u16(v,lh+28);
    const start = lh+30+ln+le;
    const comp = bytes.slice(start, start+size);
    let data;
    if(method === 0) data = comp;
    else if(method === 8){
      try{ data = await inflateRaw(comp); }
      catch(e){ throw new Error('فشل فك ضغط «'+name+'» — '+e.message); }
    } else { pos += 46+nl+el+cl; continue; }
    out.set(name, data);
    pos += 46+nl+el+cl;
  }
  return out;
}

/* ---------- XML ---------- */
function parseXML(data){
  const t = enc.decode(data);
  const d = new DOMParser().parseFromString(t, 'application/xml');
  return d.querySelector('parsererror') ? new DOMParser().parseFromString(t, 'text/html') : d;
}
function attr(el,n){ return el ? (el.getAttribute(n)||'') : ''; }

function cleanPath(base, href){
  if(!href) return '';
  href = href.split('#')[0];
  if(!href) return '';
  try{ href = decodeURIComponent(href); }catch(e){}
  if(/^https?:\/\//i.test(href)){ try{ return new URL(href).pathname.replace(/^\/+/,''); }catch(e){ return href; } }
  if(base && !/^[a-z]+:/i.test(href)){
    const stack = [];
    for(const p of (base+'/'+href).split('/')){
      if(p === '' || p === '.') continue;
      if(p === '..'){ stack.pop(); continue; }
      stack.push(p);
    }
    return stack.join('/');
  }
  return href.replace(/^\/+/,'');
}
const normalizePath = p => p ? p.replace(/^\.\//,'').replace(/^\/+/,'').toLowerCase() : '';

/* ============================================================
   تحليل EPUB
============================================================ */
async function parseEpub(file){
  const z = await unzip(file);

  let cd = z.get('META-INF/container.xml');
  if(!cd){
    const k = [...z.keys()].find(k => k.toLowerCase().endsWith('container.xml'));
    if(k) cd = z.get(k);
  }
  if(!cd) throw new Error('ملف EPUB غير صالح: لا يوجد container.xml');

  const c = parseXML(cd), rootfile = c.getElementsByTagName('rootfile')[0];
  if(!rootfile) throw new Error('لا يوجد rootfile');
  const opfPath = attr(rootfile,'full-path');
  if(!opfPath) throw new Error('مسار OPF غير موجود');

  let opfData = z.get(opfPath);
  if(!opfData){
    const n = normalizePath(opfPath);
    const k = [...z.keys()].find(k => normalizePath(k) === n);
    if(k) opfData = z.get(k);
  }
  if(!opfData) throw new Error('ملف OPF غير موجود');

  const opf = parseXML(opfData);
  const base = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/')) : '';

  /* manifest */
  const manifest = new Map();
  for(const it of opf.getElementsByTagName('item')){
    const id = attr(it,'id'), href = attr(it,'href');
    if(!id || !href) continue;
    manifest.set(id, {
      href: cleanPath(base, href),
      type: attr(it,'media-type'),
      props: attr(it,'properties')
    });
  }

  /* spine */
  const spine = [];
  for(const it of opf.getElementsByTagName('itemref')){
    const m = manifest.get(attr(it,'idref'));
    if(m && m.type && /xhtml|html|xml/i.test(m.type)) spine.push(m);
    else if(m && !m.type) spine.push(m);
  }
  if(!spine.length) throw new Error('الكتاب لا يحتوي على فصول');

  /* metadata */
  const meta = opf.getElementsByTagName('metadata')[0];
  const g = t => { const el = meta ? meta.getElementsByTagName(t)[0] : null; return el && el.textContent ? el.textContent.trim() : ''; };
  const title  = g('dc:title')   || file.name.replace(/\.epub$/i,'') || 'بدون عنوان';
  const author = g('dc:creator') || 'مؤلف غير محدد';

  /* الغلاف */
  let coverData = null;
  for(const m of manifest.values()){
    if(m.props && m.props.split(/\s+/).includes('cover-image')){
      coverData = z.get(m.href) || null;
      if(coverData) break;
    }
  }
  if(!coverData && meta){
    const mc = meta.querySelector('meta[name="cover"]');
    if(mc){
      const it = manifest.get(attr(mc,'content'));
      if(it) coverData = z.get(it.href);
    }
  }
  let cover = null;
  if(coverData){
    cover = await new Promise(r=>{
      const fr = new FileReader();
      fr.onload = () => r(fr.result);
      fr.readAsDataURL(new Blob([coverData]));
    });
  }

  /* TOC */
  let navItem = null, ncxItem = null;
  for(const m of manifest.values()){
    if(m.props && m.props.split(/\s+/).includes('nav')) navItem = m;
    if(m.type && m.type.indexOf('ncx') > -1) ncxItem = m;
  }
  let rawToc = [];
  if(navItem){
    const nd = z.get(navItem.href);
    if(nd){
      try{
        const doc = parseXML(nd);
        const navs = [...doc.getElementsByTagName('nav')];
        const nav = navs.find(n =>
          (n.getAttribute('epub:type') || n.getAttributeNS('http://www.idpf.org/2007/ops','type')) === 'toc'
        ) || navs[0];
        const ol = nav ? nav.getElementsByTagName('ol')[0] : null;
        if(ol) rawToc = parseNavList(ol, navItem.href, base);
      }catch(e){}
    }
  }
  if(!rawToc.length && ncxItem){
    const nd = z.get(ncxItem.href);
    if(nd){
      try{
        const doc = parseXML(nd);
        rawToc = [...doc.getElementsByTagName('navPoint')]
          .filter(n => !(n.parentElement && n.parentElement.closest && n.parentElement.closest('navPoint')))
          .map(n => parseNcxPoint(n, ncxItem.href, base));
      }catch(e){}
    }
  }

  /* بناء flat من spine */
  const hrefToSpine = new Map();
  spine.forEach((m,i) => {
    hrefToSpine.set(normalizePath(m.href), i);
    const f = normalizePath(m.href.split('/').pop());
    if(!hrefToSpine.has(f)) hrefToSpine.set(f, i);
  });

  const labelMap = new Map();
  const fragMap  = new Map();
  (function collectTocLabels(nodes){
    for(const node of (nodes||[])){
      const target = cleanPath(base, node.href||'').split('#')[0];
      const frag   = (node.href||'').split('#')[1] || '';
      let ix = hrefToSpine.get(normalizePath(target));
      if(ix == null) ix = hrefToSpine.get(normalizePath(target.split('/').pop()));
      if(ix != null){
        if(!labelMap.has(ix)) labelMap.set(ix, (node.label||'').trim() || ('صفحة '+(ix+1)));
        if(frag && !fragMap.has(ix)) fragMap.set(ix, frag);
      }
      if(node.children && node.children.length) collectTocLabels(node.children);
    }
  })(rawToc);

  const flat = spine.map((m, i) => ({
    label: labelMap.get(i) || ('صفحة '+(i+1)),
    href: m.href,
    fragment: fragMap.get(i) || '',
    spineIndex: i
  }));

  let toc = rawToc;
  if(!toc.length){
    toc = flat.map(f => ({ label: f.label, href: f.href, children: [] }));
  }

  const files = {};
  for(const [name, data] of z) files[name] = data;
  const fileIndex = {};
  for(const k of Object.keys(files)){
    const n = normalizePath(k);
    fileIndex[n] = k;
    const f = k.split('/').pop();
    fileIndex[f] = k;
    fileIndex[f.toLowerCase()] = k;
  }

  let wordCount = 0;
  for(const m of spine){
    const d = z.get(m.href);
    if(!d) continue;
    const txt = enc.decode(d).replace(/<[^>]*>/g,' ');
    wordCount += (txt.match(/[\p{L}\p{N}]+/gu)||[]).length;
  }

  return {
    id: uid(), title, author, category:'عام', added:Date.now(), last:0, progress:0,
    wordCount, secondsRead:0, rating:0, fav:false, cover,
    language: g('dc:language'), description: g('dc:description'), publisher: g('dc:publisher'),
    files, fileIndex,
    spine: spine.map(m=>({ href:m.href, type:m.type })),
    toc, flat, opfBase: base,
    marks: [], notes: [], highlights: [],
    sourceFormat: 'epub', originalFileName: file.name
  };
}

function parseNavList(ol, navHref, opfBase){
  const base = navHref.includes('/') ? navHref.substring(0, navHref.lastIndexOf('/')) : '';
  return [...ol.children]
    .filter(li => li.tagName.toLowerCase() === 'li')
    .map(li => {
      const a   = li.getElementsByTagName('a')[0] || li.getElementsByTagName('span')[0];
      const sub = li.getElementsByTagName('ol')[0];
      return {
        label: ((a && a.textContent) || 'فصل').trim(),
        href:  cleanPath(base, a ? a.getAttribute('href') : ''),
        children: sub ? parseNavList(sub, navHref, opfBase) : []
      };
    });
}
function parseNcxPoint(n, ncxHref, opfBase){
  const base = ncxHref.includes('/') ? ncxHref.substring(0, ncxHref.lastIndexOf('/')) : '';
  const content = n.getElementsByTagName('content')[0];
  const labelEl = n.getElementsByTagName('navLabel')[0];
  return {
    label: ((labelEl && labelEl.textContent) || 'فصل').trim(),
    href:  cleanPath(base, content ? content.getAttribute('src') : ''),
    children: [...n.children].filter(x => x.tagName === 'navPoint').map(x => parseNcxPoint(x, ncxHref, opfBase))
  };
}

function getBookFile(path){
  if(!active || !active.files) return null;
  if(active.files[path]) return active.files[path];
  const n = normalizePath(path);
  if(active.fileIndex && active.fileIndex[n]) return active.files[active.fileIndex[n]];
  const f = path.split('/').pop();
  if(active.fileIndex && active.fileIndex[f]) return active.files[active.fileIndex[f]];
  const k = Object.keys(active.files).find(k =>
    normalizePath(k) === n || normalizePath(k).endsWith('/'+n) || n.endsWith('/'+normalizePath(k))
  );
  return k ? active.files[k] : null;
}

/* ---------- محتوى الفصل ---------- */
function chapterHTML(index){
  const item = active.flat[index];
  if(!item) return '<p>الصفحة غير موجودة.</p>';
  let arr = getBookFile(item.href);
  if(!arr && active.spine[item.spineIndex]) arr = getBookFile(active.spine[item.spineIndex].href);
  if(!arr) return '<p>تعذر العثور على محتوى هذه الصفحة.</p>';
  let html;
  try{ html = enc.decode(new Uint8Array(arr)); }
  catch(e){ return '<p>تعذر فك ترميز الصفحة.</p>'; }

  const d = new DOMParser().parseFromString(html, 'text/html');
  d.querySelectorAll('script,style,iframe,object,form,link[rel="stylesheet"]').forEach(x => x.remove());
  d.querySelectorAll('img[src]').forEach(img => {
    const src = img.getAttribute('src');
    if(!src || /^https?:\/\//i.test(src) || src.indexOf('data:') === 0) return;
    const base = item.href.includes('/') ? item.href.substring(0, item.href.lastIndexOf('/')) : '';
    const arr2 = getBookFile(cleanPath(base, src));
    if(arr2){
      const ext = src.split('.').pop().toLowerCase();
      const mime = { png:'image/png', gif:'image/gif', svg:'image/svg+xml', webp:'image/webp', bmp:'image/bmp' }[ext] || 'image/jpeg';
      img.src = URL.createObjectURL(new Blob([new Uint8Array(arr2)], { type: mime }));
    }
  });
  return d.body.innerHTML || d.documentElement.innerHTML || '<p>(صفحة فارغة)</p>';
}

function extractChapterContent(book, item){
  let arr = book.files ? book.files[item.href] : null;
  if(!arr && book.files){
    const n = normalizePath(item.href);
    const k = Object.keys(book.files).find(k => normalizePath(k) === n);
    if(k) arr = book.files[k];
  }
  if(!arr && book.spine && book.spine[item.spineIndex] && book.files)
    arr = book.files[book.spine[item.spineIndex].href];
  if(!arr) return '';
  try{
    const d = new DOMParser().parseFromString(enc.decode(new Uint8Array(arr)), 'text/html');
    d.querySelectorAll('script,style,iframe,object,form').forEach(x => x.remove());
    if(item.fragment){
      const a = d.getElementById(item.fragment) || d.querySelector('[name="'+item.fragment+'"]');
      if(a){
        const box = d.createElement('div');
        let n2 = (a.tagName === 'SPAN' || a.tagName === 'A') ? a.parentElement : a;
        let cnt = 0;
        while(n2 && cnt < 200){
          box.appendChild(n2.cloneNode(true));
          let nx = n2.nextElementSibling;
          while(!nx && n2.parentElement && n2.parentElement !== d.body){
            n2 = n2.parentElement;
            nx = n2.nextElementSibling;
          }
          if(!nx) break;
          if(nx.id && nx.id !== item.fragment) break;
          n2 = nx; cnt++;
        }
        return box.innerHTML;
      }
    }
    return d.body.innerHTML || '';
  }catch(e){ return ''; }
}

function htmlToText(html){
  const d = new DOMParser().parseFromString(html,'text/html');
  d.querySelectorAll('script,style').forEach(x => x.remove());
  d.querySelectorAll('br').forEach(x => x.replaceWith('\n'));
  d.querySelectorAll('p,div,li,h1,h2,h3,h4,h5,h6,blockquote,tr').forEach(x => x.append('\n'));
  return (d.body.textContent||'').replace(/\n{3,}/g,'\n\n').trim();
}
function htmlToMD(html){
  const d = new DOMParser().parseFromString(html,'text/html');
  d.querySelectorAll('script,style').forEach(x => x.remove());
  const walk = el => {
    let out = '';
    for(const n of el.childNodes){
      if(n.nodeType === 3){ out += n.textContent.replace(/\s+/g,' '); continue; }
      if(n.nodeType !== 1) continue;
      const t = n.tagName.toLowerCase(); const inner = walk(n).trim();
      if(/^h[1-6]$/.test(t)) out += '\n\n' + '#'.repeat(+t[1]) + ' ' + inner + '\n\n';
      else if(t === 'p') out += '\n\n' + inner + '\n\n';
      else if(t === 'blockquote') out += '\n\n> ' + inner.replace(/\n/g,'\n> ') + '\n\n';
      else if(t === 'li') out += '\n- ' + inner;
      else if(t === 'img') out += '\n\n![صورة](' + (n.getAttribute('src')||'') + ')\n\n';
      else out += inner;
    }
    return out;
  };
  return walk(d.body).replace(/\n{3,}/g,'\n\n').trim();
}

/* ---------- التمييز ---------- */
function wrapText(root, query, cls, hlid){
  if(!query || !root) return false;
  const norm = s => s.replace(/\s+/g,' ').toLowerCase();
  const qn = norm(query);
  if(!qn) return false;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while((n = walker.nextNode())){
    if(n.parentElement && n.parentElement.closest('.hl')) continue;
    nodes.push(n);
  }
  let full = '', map = [];
  for(const nd of nodes){
    const t = nd.nodeValue;
    for(let i = 0; i < t.length; i++){
      if(/\s/.test(t[i])){
        if(full && !full.endsWith(' ')){ full += ' '; map.push(i); }
      } else {
        full += t[i].toLowerCase(); map.push(i);
      }
    }
  }
  const fi = full.indexOf(qn);
  if(fi < 0) return false;
  const oStart = map[fi], oEnd = map[fi + qn.length - 1];
  if(oEnd == null) return false;

  let acc = 0, sNode = null, eNode = null;
  for(const nd of nodes){
    const len = nd.nodeValue.length;
    if(!sNode && oStart < acc + len) sNode = { nd, off: oStart - acc };
    if(!eNode && oEnd < acc + len){ eNode = { nd, off: oEnd - acc }; break; }
    acc += len;
  }
  if(!sNode || !eNode) return false;

  try{
    const range = document.createRange();
    range.setStart(sNode.nd, sNode.off);
    range.setEnd(eNode.nd, eNode.off + 1);
    const span = document.createElement('span');
    span.className = 'hl ' + cls;
    span.dataset.hlid = hlid;
    range.surroundContents(span);
    return true;
  }catch(e){
    try{
      const range = document.createRange();
      range.setStart(sNode.nd, sNode.off);
      range.setEnd(eNode.nd, eNode.off + 1);
      const frag = range.extractContents();
      const span = document.createElement('span');
      span.className = 'hl ' + cls;
      span.dataset.hlid = hlid;
      span.appendChild(frag);
      range.insertNode(span);
      return true;
    }catch(e2){ return false; }
  }
}
function applyHighlights(){
  if(!active) return;
  (active.highlights||[]).forEach(h => {
    if(h.chapter === current) wrapText($('#chapterContent'), h.text, 'hl-'+h.color, h.id);
  });
}
function removeHighlight(id){
  if(!active) return;
  active.highlights = (active.highlights||[]).filter(h => h.id !== id);
  saveDebounced(active, 300);
  $$('#chapterContent [data-hlid]').forEach(s => {
    if(s.dataset.hlid === String(id)) s.replaceWith(...s.childNodes);
  });
  if(panelTab === 'highlights') renderPanel();
}

/* ---------- اختيار النص ---------- */
function setupSelection(){
  const pop = $('#selPop'), content = $('#chapterContent');
  if(!pop || !content) return;

  let selTimer = null;
  const showSelPop = () => {
    const sel = window.getSelection();
    if(!sel || sel.isCollapsed || !sel.anchorNode || !content.contains(sel.anchorNode)){ pop.hidden = true; return; }
    const text = sel.toString().trim();
    if(text.length < 2){ pop.hidden = true; return; }
    const r = sel.getRangeAt(0).getBoundingClientRect();
    pop.dataset.text = text;
    pop.hidden = false;
    const pw = pop.offsetWidth;
    let left = r.left + r.width/2 - pw/2;
    left = Math.max(8, Math.min(innerWidth - pw - 8, left));
    pop.style.left = left + 'px';
    pop.style.top  = Math.max(8, r.top - 54) + 'px';
  };
  const scheduleShow = () => { clearTimeout(selTimer); selTimer = setTimeout(showSelPop, 60); };

  document.addEventListener('mouseup', e => {
    if(e.target.closest && e.target.closest('#selPop')) return;
    scheduleShow();
  });
  document.addEventListener('touchend', e => {
    if(e.target.closest && e.target.closest('#selPop')) return;
    scheduleShow();
  });
  $('#readingArea').addEventListener('scroll', () => { pop.hidden = true; });

  pop.addEventListener('click', e => {
    const dot = e.target.closest('[data-hl]');
    if(dot && active){
      const text = pop.dataset.text;
      const ex = (active.highlights||[]).find(h => h.chapter === current && h.text === text);
      if(ex) ex.color = dot.dataset.hl;
      else active.highlights.push({ id:uid(), chapter:current, text, color:dot.dataset.hl, note:'', created:Date.now() });
      saveDebounced(active, 200);
      window.getSelection().removeAllRanges();
      pop.hidden = true;
      const scrollTop = $('#readingArea').scrollTop;
      $('#chapterContent').innerHTML = chapterHTML(current);
      afterChapterRender();
      $('#readingArea').scrollTop = scrollTop;
      notify('✓ تم التمييز');
      return;
    }
    if(e.target.closest('#selCopy')){
      const t = pop.dataset.text; pop.hidden = true;
      window.getSelection().removeAllRanges();
      if(navigator.clipboard) navigator.clipboard.writeText(t).then(() => notify('✓ تم النسخ')).catch(() => notify('✗ تعذر النسخ'));
      return;
    }
    if(e.target.closest('#selNote')){
      const text = pop.dataset.text; pop.hidden = true;
      window.getSelection().removeAllRanges();
      promptDlg('ملاحظة على الاقتباس').then(v => {
        if(v && active){
          active.notes.push({ text:v, quote:text, chapter:current, chapterLabel:active.flat[current].label });
          saveDebounced(active, 200);
          notify('✓ أُضيفت الملاحظة');
          if(panelTab === 'notes') renderPanel();
        }
      });
    }
  });
}

/* ---------- عرض المكتبة ---------- */
function render(){
  const q = ($('#searchInput') ? $('#searchInput').value : '').toLowerCase();
  $('#clearSearch').hidden = !q;

  const shown = books.filter(b => {
    const pf = filter === 'all' ? true
            : filter === 'reading'  ? (b.progress > 0 && b.progress < 100)
            : filter === 'unread'   ? (b.progress === 0)
            : filter === 'finished' ? (b.progress >= 100)
            : filter === 'fav'      ? b.fav : true;
    const pc = category === 'all' || b.category === category;
    const pq = !q || (b.title+' '+b.author+' '+(b.category||'')).toLowerCase().includes(q);
    return pf && pc && pq;
  });

  $('#allCount').textContent = books.length;
  $('#bookCount').textContent = shown.length + ' كتاب';

  const sv = $('#sortSelect') ? $('#sortSelect').value : 'recent';
  const sorted = [...shown].sort((a,b) => {
    if(sv === 'title')    return a.title.localeCompare(b.title,'ar');
    if(sv === 'author')   return a.author.localeCompare(b.author,'ar');
    if(sv === 'progress') return (b.progress||0)-(a.progress||0);
    if(sv === 'rating')   return (b.rating||0)-(a.rating||0);
    if(sv === 'time')     return (b.secondsRead||0)-(a.secondsRead||0);
    return (b.added||0)-(a.added||0);
  });

  $('#bookGrid').classList.toggle('list', !gridView);
  $('#viewGridBtn').classList.toggle('active', gridView);
  $('#viewListBtn').classList.toggle('active', !gridView);

  $('#bookGrid').innerHTML = sorted.map((b,i) => `
    <div class="book-card" style="animation-delay:${Math.min(i*35,350)}ms">
      <div class="cover" data-open="${b.id}">
        ${b.cover ? '<img src="'+b.cover+'" alt="">' : '<span class="cover-letter">'+esc((b.title||'ك').slice(0,1))+'</span>'}
        ${b.fav ? '<span class="fav-badge"><svg><use href="#i-heart-fill"/></svg></span>' : ''}
      </div>
      <div class="card-body">
        <h3 title="${esc(b.title)}" data-open="${b.id}">${esc(b.title)}</h3>
        <p class="author">${esc(b.author)}</p>
        ${b.rating ? '<div class="card-stars">'+[1,2,3,4,5].map(s => '<svg class="'+(s <= b.rating ? '' : 'off')+'"><use href="#i-'+(s <= b.rating ? 'star-fill' : 'star')+'"/></svg>').join('')+'</div>' : ''}
        <div class="mini-progress"><span style="width:${b.progress||0}%"></span></div>
        <div class="card-foot">
          <span>${b.progress||0}%${b.secondsRead ? ' · '+fmtDur(b.secondsRead) : ''}</span>
          <div class="card-actions">
            <button data-fav="${b.id}" class="${b.fav ? 'fav-on' : ''}" title="مفضلة"><svg><use href="#i-heart${b.fav ? '-fill' : ''}"/></svg></button>
            <button data-edit="${b.id}" title="تعديل"><svg><use href="#i-edit"/></svg></button>
            <button data-export="${b.id}" title="تصدير JSON"><svg><use href="#i-download"/></svg></button>
            <button data-del="${b.id}" title="حذف"><svg><use href="#i-trash"/></svg></button>
            <button data-open="${b.id}" class="read-btn">اقرأ</button>
          </div>
        </div>
      </div>
    </div>`).join('');
  $('#empty').hidden = sorted.length > 0;

  $('#stats').innerHTML = [
    ['إجمالي الكتب', books.length, 'i-book'],
    ['قيد القراءة', books.filter(b => b.progress > 0 && b.progress < 100).length, 'i-bookopen'],
    ['مكتملة', books.filter(b => b.progress >= 100).length, 'i-check'],
    ['وقت القراءة', fmtDur(getRT().total), 'i-clock'],
  ].map(x => '<div class="stat"><span class="st-ic"><svg><use href="#'+x[2]+'"/></svg></span><div><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div></div>').join('');

  const rt = getRT(); const days = []; let weekTotal = 0;
  for(let i = 6; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const v = (rt.days[dayKey(d)]||0);
    weekTotal += v;
    days.push({ label: d.toLocaleDateString('ar',{weekday:'short'}), v, today: i === 0 });
  }
  const max = Math.max.apply(null, days.map(d => d.v).concat([60]));
  $('#weekBars').innerHTML = days.map(d =>
    '<div class="wbar '+(d.today ? 'today' : '')+'" title="'+fmtDur(d.v)+'">'+
    '<b>'+(d.v ? fmtDur(d.v) : '')+'</b>'+
    '<span class="col" style="height:'+Math.max(3, d.v/max*100)+'%"></span>'+
    '<small>'+d.label+'</small></div>').join('');
  $('#weekTotal').textContent = fmtDur(weekTotal);

  const cats = [...new Set(books.map(b => b.category||'عام'))];
  $('#categories').innerHTML =
    '<button class="category '+(category === 'all' ? 'active' : '')+'" data-cat="all">كل المجموعات</button>' +
    cats.map(c => {
      const n = books.filter(b => (b.category||'عام') === c).length;
      return '<button class="category '+(category === c ? 'active' : '')+'" data-cat="'+esc(c)+'"><span>'+esc(c)+'</span><span class="muted tiny">'+n+'</span></button>';
    }).join('');

  const cont = books.filter(b => b.progress > 0 && b.progress < 100).sort((a,b) => (b.lastOpened||0)-(a.lastOpened||0))[0];
  $('#continueBtn').hidden = !cont;
  if(cont){
    $('#continueTitle').textContent = cont.title;
    $('#continueFill').style.width = cont.progress + '%';
    $('#continueBtn').dataset.open = cont.id;
  }

  if(navigator.storage && navigator.storage.estimate){
    navigator.storage.estimate().then(e => {
      const used  = (e.usage/1048576).toFixed(1);
      const quota = (e.quota/1073741824).toFixed(1);
      $('#storageInfo').textContent = used+' م.ب مستخدمة من '+quota+' ج.ب متاحة';
      $('#storageFill').style.width = Math.min(100, (e.usage/e.quota)*100)+'%';
    }).catch(() => {});
  }
}

/* ---------- الاستيراد ---------- */
async function importFiles(list){
  for(const file of list){
    if(/\.json$/i.test(file.name)){ await importBookFromJSON(file); continue; }
    await importEpub(file);
  }
}
async function importEpub(file){
  try{
    notify('⏳ جارٍ استيراد «'+file.name+'»…');
    const b = await parseEpub(file);
    const dup = books.find(x => x.title === b.title && x.author === b.author);
    if(dup){
      const ok = await confirmDlg('كتاب مكرر', '«'+b.title+'» موجود مسبقاً في مكتبتك. هل تريد إضافة نسخة أخرى؟');
      if(!ok) return;
    }
    await save(b); books.push(b); render();
    notify('✓ تمت إضافة «'+b.title+'» ('+b.flat.length+' صفحة · '+b.wordCount.toLocaleString('ar')+' كلمة)');
  }catch(e){
    console.error(e);
    notify('✗ '+file.name+': '+(e.message||'تعذر الفتح'));
  }
}
async function importBookFromJSON(file){
  try{
    notify('⏳ جارٍ قراءة '+file.name+'…');
    const data = JSON.parse(await file.text());
    if(!data.format || data.format.indexOf('ward-') !== 0)
      throw new Error('الملف ليس من صيغة وِرد');
    if(data.format === 'ward-library-v1'){
      let c = 0;
      for(const bd of data.books||[]){
        const nb = convertJSONToBook(bd);
        await save(nb); books.push(nb); c++;
      }
      render(); notify('✓ تم استيراد '+c+' كتاب من النسخة الاحتياطية');
    } else if(data.format === 'ward-reader-v1'){
      const nb = convertJSONToBook(data);
      await save(nb); books.push(nb); render();
      notify('✓ تم استيراد «'+nb.title+'»');
    } else throw new Error('صيغة غير مدعومة: '+data.format);
  }catch(e){
    console.error(e);
    notify('✗ فشل الاستيراد: '+(e.message||''));
  }
}
function convertJSONToBook(data){
  const bm = data.book||{}, chapters = data.chapters||[];
  const files = {}, flat = [];
  chapters.forEach((ch,i) => {
    const href = ch.href || ('chapter_'+i+'.html');
    files[href] = Array.from(new TextEncoder().encode(ch.content||''));
    flat.push({
      label: ch.title || ('صفحة '+(i+1)),
      href,
      fragment: ch.fragment||'',
      spineIndex: (ch.spineIndex != null ? ch.spineIndex : i)
    });
  });
  const fileIndex = {};
  for(const k of Object.keys(files)){
    const n = normalizePath(k);
    fileIndex[n] = k;
    const f = k.split('/').pop();
    fileIndex[f] = k; fileIndex[f.toLowerCase()] = k;
  }
  return {
    id: uid(), title: bm.title||'بدون عنوان', author: bm.author||'غير محدد',
    category: bm.category||'عام', added: bm.added||Date.now(), last: bm.last||0, progress: bm.progress||0,
    wordCount: bm.wordCount||0, secondsRead: bm.secondsRead||0, rating: bm.rating||0, fav: !!bm.fav,
    cover: bm.cover||null, language: bm.language||'', description: bm.description||'', publisher: bm.publisher||'',
    files, fileIndex,
    spine: flat.map(f => ({ href:f.href, type:'application/xhtml+xml' })),
    toc: data.toc||[], flat, opfBase:'',
    marks: (data.bookmarks||[]).map(m => ({
      label: m.label || m.chapterLabel || ('صفحة '+((m.chapterIndex != null ? m.chapterIndex : m.chapter)||0)+1),
      chapter: (m.chapterIndex != null ? m.chapterIndex : m.chapter)||0,
      at: m.createdAt || Date.now()
    })),
    notes: (data.notes||[]).map(n => ({
      text:n.text, quote:n.quote||'',
      chapter:(n.chapterIndex != null ? n.chapterIndex : n.chapter)||0,
      chapterLabel:n.chapterLabel||''
    })),
    highlights: (data.highlights||[]).map(h => ({
      id: h.id || uid(),
      chapter: (h.chapter != null ? h.chapter : h.chapterIndex)||0,
      text: h.text, color: h.color||'yellow', note: h.note||'', created: h.created||Date.now()
    })),
    sourceFormat: 'json', originalFileName: null
  };
}

/* ---------- التصدير ---------- */
function exportBookToJSON(bookId){
  const b = books.find(x => x.id === bookId);
  if(!b){ notify('الكتاب غير موجود'); return; }
  try{
    notify('⏳ جارٍ تحضير ملف التصدير…');
    const data = {
      format:'ward-reader-v1', formatVersion:'1.0', exportedAt:new Date().toISOString(),
      book:{
        title:b.title, author:b.author, category:b.category, added:b.added, wordCount:b.wordCount,
        progress:b.progress, last:b.last, secondsRead:b.secondsRead||0, rating:b.rating||0, fav:!!b.fav,
        cover:b.cover||null, language:b.language||'', description:b.description||'', publisher:b.publisher||'',
        sourceFormat:b.sourceFormat||'epub', originalFileName:b.originalFileName||null
      },
      toc: JSON.parse(JSON.stringify(b.toc||[])),
      flatIndex: (b.flat||[]).map((f,i) => ({ index:i, label:f.label, href:f.href, fragment:f.fragment||'', spineIndex:f.spineIndex })),
      chapters: (b.flat||[]).map((it,i) => {
        const c = extractChapterContent(b, it);
        return { index:i, title:it.label, href:it.href, fragment:it.fragment||'', spineIndex:it.spineIndex, content:c,
                 wordCount:(c.match(/[\p{L}\p{N}]+/gu)||[]).length };
      }),
      bookmarks: (b.marks||[]).map(m => ({ chapterIndex:m.chapter, label:m.label, createdAt:m.at })),
      notes: (b.notes||[]).map(n => ({ chapterIndex:n.chapter, chapterLabel:n.chapterLabel, text:n.text, quote:n.quote||'' })),
      highlights: (b.highlights||[]).map(h => ({ chapter:h.chapter, text:h.text, color:h.color, note:h.note||'', created:h.created }))
    };
    const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json;charset=utf-8' });
    const safe = (b.title||'book').replace(/[\\/:*?"<>|]/g,'_').slice(0,80);
    download(blob, safe+'.ward.json');
    notify('✓ تم تصدير «'+b.title+'» ('+(blob.size/1048576).toFixed(2)+' م.ب)');
  }catch(e){
    console.error(e);
    notify('✗ فشل التصدير: '+e.message);
  }
}
function exportLibraryToJSON(full){
  try{
    if(!books.length){ notify('المكتبة فارغة'); return; }
    notify('⏳ جارٍ تحضير النسخة الاحتياطية…');
    const data = {
      format:'ward-library-v1', formatVersion:'1.0', exportedAt:new Date().toISOString(),
      totalBooks: books.length,
      books: books.map(b => ({
        book:{
          title:b.title, author:b.author, category:b.category, added:b.added, wordCount:b.wordCount,
          progress:b.progress, last:b.last, secondsRead:b.secondsRead||0, rating:b.rating||0, fav:!!b.fav,
          cover:b.cover||null, language:b.language||'', description:b.description||'', publisher:b.publisher||'',
          sourceFormat:b.sourceFormat||'epub'
        },
        toc: b.toc||[],
        flatIndex: (b.flat||[]).map((f,i) => ({ index:i, label:f.label, href:f.href, fragment:f.fragment||'', spineIndex:f.spineIndex })),
        chapters: full ? (b.flat||[]).map((it,i) => {
          const c = extractChapterContent(b, it);
          return { index:i, title:it.label, href:it.href, fragment:it.fragment||'', spineIndex:it.spineIndex, content:c };
        }) : [],
        bookmarks: (b.marks||[]).map(m => ({ chapterIndex:m.chapter, label:m.label, createdAt:m.at })),
        notes: (b.notes||[]).map(n => ({ chapterIndex:n.chapter, chapterLabel:n.chapterLabel, text:n.text, quote:n.quote||'' })),
        highlights: (b.highlights||[]).map(h => ({ chapter:h.chapter, text:h.text, color:h.color, note:h.note||'', created:h.created }))
      }))
    };
    const blob = new Blob([JSON.stringify(data)], { type:'application/json;charset=utf-8' });
    download(blob, 'ward-library-'+Date.now()+'.json');
    notify('✓ تم التصدير ('+books.length+' كتاب · '+(blob.size/1048576).toFixed(1)+' م.ب)');
  }catch(e){ notify('✗ فشل التصدير: '+e.message); }
}
function exportCSV(){
  const rows = [['العنوان','المؤلف','التصنيف','التقدم%','التقييم','الكلمات','وقت القراءة(ث)','الصفحات']];
  for(const b of books) rows.push([b.title, b.author, b.category||'عام', b.progress||0, b.rating||0, b.wordCount||0, b.secondsRead||0, (b.flat||[]).length]);
  const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
  download(new Blob(['\ufeff'+csv], { type:'text/csv;charset=utf-8' }), 'ward-library-'+Date.now()+'.csv');
  notify('✓ تم تصدير CSV');
}
function exportMarksMD(b){
  const L = [];
  L.push('# علامات وملاحظات: '+b.title);
  L.push('**المؤلف:** '+b.author+'  '); L.push('');
  L.push('## العلامات المرجعية');
  (b.marks||[]).forEach(m => L.push('- '+m.label+' — صفحة '+(m.chapter+1)+' ('+todayStr(m.at)+')'));
  if(!(b.marks||[]).length) L.push('- لا توجد');
  L.push('','## الملاحظات');
  (b.notes||[]).forEach(n => {
    if(n.quote) L.push('> '+n.quote,'');
    L.push('- '+n.text+' — '+(n.chapterLabel||('صفحة '+(n.chapter+1))));
  });
  if(!(b.notes||[]).length) L.push('- لا توجد');
  download(new Blob([L.join('\n')], { type:'text/markdown;charset=utf-8' }), (b.title||'book')+'-ملاحظات.md');
  notify('✓ تم تصدير العلامات والملاحظات');
}
function exportHlMD(b){
  const L = ['# تمييزات: '+b.title,''];
  const names = { yellow:'أصفر', green:'أخضر', blue:'أزرق', pink:'وردي' };
  (b.highlights||[]).forEach(h => L.push('> '+h.text, '\n— '+(names[h.color]||h.color)+' · صفحة '+(h.chapter+1)+(h.note ? (' · ملاحظة: '+h.note) : '')+'\n'));
  if(!(b.highlights||[]).length) L.push('لا توجد تمييزات بعد.');
  download(new Blob([L.join('\n')], { type:'text/markdown;charset=utf-8' }), (b.title||'book')+'-تمييزات.md');
  notify('✓ تم تصدير التمييزات');
}
function printChapter(){
  if(!active) return;
  const item = active.flat[current];
  const html = chapterHTML(current);
  const w = window.open('','_blank');
  if(!w){ notify('✗ السماح بالنوافذ المنبثقة مطلوب للطباعة'); return; }
  w.document.write('<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>'+esc(item.label)+' — '+esc(active.title)+'</title>'+
  '<style>body{font-family:\'Amiri\',serif;font-size:19px;line-height:2.1;max-width:760px;margin:30px auto;padding:0 22px;color:#222}'+
  'h1{font-family:\'Tajawal\',sans-serif;font-size:22px;text-align:center;margin-bottom:30px}'+
  'img{max-width:100%}.meta{text-align:center;color:#888;font-size:12px;font-family:\'Tajawal\',sans-serif;margin-bottom:30px}</style></head>'+
  '<body><h1>'+esc(item.label)+'</h1><div class="meta">'+esc(active.title)+' — '+esc(active.author)+'</div>'+html+'</body></html>');
  w.document.close(); w.focus();
  setTimeout(() => { try{ w.print(); }catch(e){} }, 600);
}

/* ============================================================
   فتح الكتاب — مع ترحيل تلقائي
============================================================ */
async function openBook(id){
  active = books.find(b => b.id === id);
  if(!active){ notify('الكتاب غير موجود'); return; }

  /* ترحيل: إن كان flat أقصر من spine */
  if(active.spine && active.flat && active.flat.length < active.spine.length){
    console.info('[ترحيل] إعادة بناء flat من spine…');
    const hrefToSpine = new Map();
    active.spine.forEach((m,i) => {
      hrefToSpine.set(normalizePath(m.href), i);
      const f = normalizePath(m.href.split('/').pop());
      if(!hrefToSpine.has(f)) hrefToSpine.set(f, i);
    });
    const labelMap = new Map();
    const fragMap  = new Map();
    (function collect(nodes){
      for(const node of (nodes||[])){
        const t  = cleanPath(active.opfBase||'', node.href||'').split('#')[0];
        const fr = (node.href||'').split('#')[1] || '';
        let ix = hrefToSpine.get(normalizePath(t));
        if(ix == null) ix = hrefToSpine.get(normalizePath(t.split('/').pop()));
        if(ix != null){
          if(!labelMap.has(ix)) labelMap.set(ix, (node.label||'').trim() || ('صفحة '+(ix+1)));
          if(fr && !fragMap.has(ix)) fragMap.set(ix, fr);
        }
        if(node.children) collect(node.children);
      }
    })(active.toc);
    active.flat = active.spine.map((m,i) => ({
      label: labelMap.get(i) || ('صفحة '+(i+1)),
      href: m.href,
      fragment: fragMap.get(i) || '',
      spineIndex: i
    }));
    await save(active);
  }

  if(!active.flat || !active.flat.length){ notify('هذا الكتاب لا يحتوي على صفحات قابلة للقراءة'); return; }

  searchIndexReady = false;
  if(searchWorker) searchWorker.postMessage({ type:'CLEAR' });

  active.lastOpened = Date.now();
  saveDebounced(active, 500);
  searchCache.delete(active.id);

  $('#libraryView').hidden = true;
  $('#readerView').hidden = false;
  $('#readerTitle').textContent = active.title;

  current = Math.min(active.last||0, active.flat.length-1);
  await showChapter(current);
  renderPanel();
  $('#readerPanel').classList.remove('open');
  applyReaderPrefs();
  window.scrollTo(0,0);

  setTimeout(() => buildSearchIndexInBackground(), 1000);
}
function back(){
  if(rtAcc){ addRT(rtAcc); rtAcc = 0; }
  if(active) saveDebounced(active, 100);
  stopTTS();
  $('#readerView').hidden = true;
  $('#libraryView').hidden = false;
  $('#settingsPop').hidden = true;
  $('#searchPop').hidden = true;
  $('#exportPop').hidden = true;
  document.body.classList.remove('focus');
  render();
}
async function showChapter(i){
  if(!active) return;

  /* إيقاف TTS إن كان يعمل */
  if(tts.playing || tts.paused) stopTTS();

  current = Math.max(0, Math.min(i, active.flat.length-1));
  const item = active.flat[current];
  const totalPages = active.flat.length;

  $('#chapterKicker').textContent = 'صفحة '+(current+1)+' من '+totalPages;
  $('#chapterTitle').textContent = item.label;

  const content = $('#chapterContent');
  content.innerHTML = '<div style="text-align:center;padding:34px;color:var(--muted)">⏳</div>';
  setTimeout(() => { content.innerHTML = chapterHTML(current); afterChapterRender(); }, 10);

  const p = Math.round((current+1)/totalPages*100);
  active.progress = p;
  active.last = current;
  saveDebounced(active, 800);

  $('#progressRange').value = p;
  $('#progressLabel').textContent = (current+1) + ' / ' + totalPages;
  $$('.tree-item').forEach(x => x.classList.toggle('current', Number(x.dataset.index) === current));
  $('#readingArea').scrollTop = 0;
}
function afterChapterRender(){
  applyHighlights();
  const item = active ? active.flat[current] : null;
  if(!item) return;
  const text = $('#chapterContent').textContent || '';
  const wc = (text.match(/[\p{L}\p{N}]+/gu)||[]).length;
  const mins = Math.max(1, Math.round(wc/180));
  $('#chapterMeta').textContent = wc.toLocaleString('ar')+' كلمة · قراءة ≈ '+mins.toLocaleString('ar')+' د';
  const totalPages = active.flat.length;
  $('#chapterInfo').textContent = 'صفحة '+(current+1)+' من '+totalPages;
  $('#readingPaper').classList.toggle('dropcap', !!prefs.dropCap);
  $$('#chapterContent img').forEach(img => {
    img.onclick = () => { $('#imgViewerImg').src = img.src; $('#imgViewer').hidden = false; };
  });
}

/* ============================================================
   لوحة الفهرس — مع بحث داخلي
============================================================ */
function renderPanel(){
  const el = $('#panelContent');
  if(!el || !active) return;

  if(panelTab === 'toc'){
    const map = new Map();
    (active.spine||[]).forEach((s,i) => {
      map.set(normalizePath(s.href), i);
      map.set(normalizePath(s.href.split('/').pop()), i);
    });
    const resolveIdx = (href) => {
      const t = cleanPath(active.opfBase||'', href||'').split('#')[0];
      let ix = map.get(normalizePath(t));
      if(ix == null) ix = map.get(normalizePath(t.split('/').pop()));
      return ix;
    };

    const flatToc = [];
    (function collect(nodes, depth){
      for(const node of (nodes||[])){
        const ix = resolveIdx(node.href);
        flatToc.push({
          label: node.label || '',
          index: ix,
          depth,
          hasChildren: !!(node.children && node.children.length)
        });
        if(node.children) collect(node.children, depth + 1);
      }
    })(active.toc, 0);

    const MAX_VISIBLE = 500;
    let html = '';

    html += '<label class="search big toc-search">' +
            '<svg><use href="#i-search"/></svg>' +
            '<input id="tocFilter" placeholder="ابحث في الفهرس… ('+flatToc.length.toLocaleString('ar')+' عنوان)">' +
            '</label>';

    html += '<div id="tocList"></div>';
    el.innerHTML = html;

    const paintToc = (items, limit) => {
      const list = $('#tocList');
      if(!list) return;
      const slice = limit ? items.slice(0, limit) : items;
      list.innerHTML = slice.map(n => {
        const cls = 'tree-item' + (n.index === current ? ' current' : '') + (n.index == null ? ' no-target' : '');
        const page = n.index != null ? (n.index + 1) : '';
        return '<button class="'+cls+'" data-index="'+(n.index != null ? n.index : '')+'" style="padding-inline-start:'+(8 + n.depth * 13)+'px">' +
               '<span class="tree-toggle">'+(n.hasChildren ? '›' : '·')+'</span>' +
               '<span class="tree-label">'+esc(n.label)+'</span>' +
               (page ? '<span class="tree-page">'+page+'</span>' : '') +
               '</button>';
      }).join('');
      if(limit && items.length > limit){
        const more = document.createElement('button');
        more.className = 'note-add';
        more.textContent = '⬇ تحميل المزيد ('+(items.length - limit).toLocaleString('ar')+' عنوان)';
        more.onclick = () => paintToc(items, null);
        list.appendChild(more);
      }
    };

    paintToc(flatToc, flatToc.length > MAX_VISIBLE ? MAX_VISIBLE : null);

    const filterInput = $('#tocFilter');
    if(filterInput){
      filterInput.oninput = (e) => {
        const q = e.target.value.trim().toLowerCase();
        if(!q){ paintToc(flatToc, flatToc.length > MAX_VISIBLE ? MAX_VISIBLE : null); return; }
        const filtered = flatToc.filter(n => n.label.toLowerCase().includes(q));
        paintToc(filtered, 1000);
      };
    }
  } else if(panelTab === 'marks'){
    el.innerHTML = (active.marks||[]).length
      ? active.marks.map((m,i) =>
        '<div class="mark-row"><div class="grow">'+
        '<button class="textbtn" data-mark="'+i+'"><svg class="ic-inline"><use href="#i-bookmark-fill"/></svg> '+
        esc(m.label)+' <small class="muted">— صفحة '+(m.chapter+1)+' · '+todayStr(m.at)+'</small></button></div>'+
        '<button class="row-del" data-markdel="'+i+'"><svg><use href="#i-trash"/></svg></button></div>').join('')
      : '<p class="empty-panel">لا توجد علامات بعد.<br>اضغط <b>B</b> أثناء القراءة لإضافة علامة.</p>';
  } else if(panelTab === 'notes'){
    const rows = (active.notes||[]).map((n,i) =>
      '<div class="note-row"><div class="grow">'+
      (n.quote ? '<div class="hl hl-yellow" style="margin-bottom:5px">'+esc(n.quote)+'</div>' : '')+
      esc(n.text)+'<br><small class="muted">— '+esc(n.chapterLabel||('صفحة '+(n.chapter+1)))+'</small></div>'+
      '<button class="row-del" data-notedel="'+i+'"><svg><use href="#i-trash"/></svg></button></div>').join('');
    el.innerHTML = (active.notes && active.notes.length ? rows : '<p class="empty-panel">لا توجد ملاحظات بعد.</p>') +
      '<button id="addNote" class="note-add"><svg class="ic-inline"><use href="#i-plus"/></svg> إضافة ملاحظة للصفحة الحالية</button>';
  } else {
    el.innerHTML = (active.highlights||[]).length
      ? active.highlights.map((h,i) =>
        '<div class="hl-row"><span class="hl-dot-s" style="background:'+(HL_COLORS[h.color]||'#ffe08a')+'"></span>'+
        '<div class="grow"><button class="textbtn" data-hljump="'+i+'">'+
        esc(h.text.slice(0,90))+(h.text.length > 90 ? '…' : '')+
        ' <small class="muted">— صفحة '+(h.chapter+1)+'</small></button></div>'+
        '<button class="row-del" data-hldel="'+i+'"><svg><use href="#i-trash"/></svg></button></div>').join('')
      : '<p class="empty-panel">حدّد أي نص أثناء القراءة ثم اختر لوناً للتمييز.</p>';
  }
}
function addBookmark(){
  if(!active) return;
  const ex = (active.marks||[]).findIndex(m => m.chapter === current);
  if(ex >= 0){
    active.marks.splice(ex,1);
    saveDebounced(active, 200);
    notify('أُزيلت العلامة من هذه الصفحة');
  } else {
    active.marks.push({ label:active.flat[current].label, chapter:current, at:Date.now() });
    saveDebounced(active, 200);
    notify('★ أُضيفت علامة مرجعية');
  }
  if(panelTab === 'marks') renderPanel();
  const b = $('#bookmarkBtn');
  if(b){ b.style.color = 'var(--accent)'; setTimeout(() => b.style.color = '', 600); }
}

/* ============================================================
   البحث داخل الكتاب
============================================================ */
function doBookSearch(q){
  const box = $('#bookSearchResults');
  if(!active){ box.innerHTML = '<p class="muted pad">افتح كتاباً أولاً.</p>'; return; }
  if(!q || q.trim().length < 2){
    box.innerHTML = '<p class="muted pad">اكتب كلمة من حرفين على الأقل.</p>';
    return;
  }
  box.innerHTML = '<div class="sr-count">جارٍ البحث…</div>';

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    const query = q.trim();

    if(!searchIndexReady || !searchCache.has(active.id)){
      box.innerHTML = '<div class="sr-count">⏳ جارٍ فهرسة الكتاب ('+active.flat.length+' صفحة)…</div>';
      await buildSearchIndexInBackground();
    }

    if(searchWorker && searchCache.has(active.id)){
      searchWorker.postMessage({ type:'BUILD_INDEX', payload:{ bookId: active.id, index: searchCache.get(active.id) } });
      searchWorker.postMessage({ type:'SEARCH', payload:{ bookId: active.id, query, maxPerPage: 4, maxTotal: 200 } });
      return;
    }

    fallbackSearch(query);
  }, 180);
}
function fallbackSearch(query){
  const idx = searchCache.get(active.id) || [];
  const q = query.toLowerCase();
  const results = [];
  let total = 0;

  for(const ch of idx){
    const text = ch.text;
    if(!text) continue;
    const lower = text.toLowerCase();
    let pos = 0, cnt = 0;
    while(cnt < 4 && total < 200){
      const f = lower.indexOf(q, pos);
      if(f < 0) break;
      const s = Math.max(0, f - 60);
      const e = Math.min(text.length, f + q.length + 60);
      results.push({ chapter: ch.i, label: ch.label, pre: text.slice(s, f), hit: text.slice(f, f + q.length), post: text.slice(f + q.length, e) });
      pos = f + q.length;
      cnt++; total++;
    }
  }
  renderSearchResults({ results, total, query });
}
function renderSearchResults({ results, total, query }){
  const box = $('#bookSearchResults');
  if(!box) return;

  if(!results || !results.length){
    box.innerHTML = '<p class="empty-panel">لا نتائج مطابقة.</p>';
    return;
  }

  box.innerHTML = results.map(r =>
    '<button class="sr-item" data-srjump="'+r.chapter+'" data-srq="'+esc(query)+'">'+
    '<span class="sr-chap">'+esc(r.label)+' — صفحة '+(r.chapter+1)+'</span>'+
    '<span class="sr-snippet">…'+esc(r.pre)+'<mark>'+esc(r.hit)+'</mark>'+esc(r.post)+'…</span>'+
    '</button>').join('')+
    '<div class="sr-count">'+total.toLocaleString('ar')+' نتيجة'+
    (total > results.length ? ' (يُعرض '+results.length+')' : '')+'</div>';
}
function jumpSearch(ch, q){
  $('#searchPop').hidden = true;
  showChapter(ch).then(() => {
    setTimeout(() => {
      const root = $('#chapterContent');
      const lq = q.toLowerCase();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const jobs = [];
      let n;
      while((n = walker.nextNode())){
        if(n.nodeValue.toLowerCase().indexOf(lq) > -1) jobs.push(n);
      }
      for(const nd of jobs){
        const frag = document.createDocumentFragment();
        let t = nd.nodeValue, lower = t.toLowerCase();
        while(true){
          const f = lower.indexOf(lq);
          if(f < 0) break;
          if(f > 0) frag.append(t.slice(0, f));
          const m = document.createElement('mark');
          m.className = 'sr-hit';
          m.textContent = t.slice(f, f + q.length);
          frag.append(m);
          t = t.slice(f + q.length);
          lower = lower.slice(f + q.length);
        }
        frag.append(t);
        nd.replaceWith(frag);
      }
      const first = $('#chapterContent .sr-hit');
      if(first) first.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 120);
  });
}

/* ============================================================
   القراءة الصوتية الاحترافية v6.0
============================================================ */
const tts = {
  queue: [],
  i: 0,
  playing: false,
  paused: false,
  currentUtter: null,
  safetyTimer: null,
  sleepTimer: null,
  sleepRemaining: 0,
  sleepIntervalId: null,
  startTime: 0,
  currentCharIndex: 0,
  voices: [],
  chunkStart: 0,
  chunkEnd: 0,
  currentSpeechText: '',
  generation: 0,
  lastError: null,
};

function stripTashkeel(text){
  if(!prefs.ttsStripTashkeel) return text;
  return text
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/\u0670/g, '')
    .replace(/[\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '');
}

function extractParagraphs(){
  const root = $('#chapterContent');
  if(!root) return [];
  const paras = [];
  const seen = new Set();

  const semantic = root.querySelectorAll('p,h1,h2,h3,h4,h5,h6,blockquote,li');
  semantic.forEach(el => {
    if(el.querySelector('p,h1,h2,h3,h4,h5,h6,blockquote,li')) return;
    const t = (el.textContent || '').replace(/\s+/g,' ').trim();
    if(t.length < 2 || seen.has(t)) return;
    seen.add(t); paras.push(el);
  });

  if(!paras.length){
    const divs = root.querySelectorAll('div, span, section, article');
    divs.forEach(el => {
      if(el.querySelector('div, span, section, article, p, li')) return;
      const t = (el.textContent || '').replace(/\s+/g,' ').trim();
      if(t.length < 5 || seen.has(t)) return;
      seen.add(t); paras.push(el);
    });
  }

  if(!paras.length){
    const fullText = root.textContent || '';
    const sentences = fullText.split(/(?<=[.!?؟।])\s+|\n{2,}/)
      .map(s => s.trim()).filter(s => s.length > 10);
    if(sentences.length){
      const wrapper = document.createElement('div');
      sentences.forEach((sent, idx) => {
        const span = document.createElement('span');
        span.textContent = sent + ' ';
        span.style.display = 'inline';
        span.dataset.ttsFake = idx;
        wrapper.appendChild(span);
        paras.push(span);
      });
      root.appendChild(wrapper);
    }
  }

  return paras;
}

function buildVoiceList(){
  const sel = $('#voiceSelect'); if(!sel) return;
  const all = speechSynthesis.getVoices();
  tts.voices = all;

  const classify = (v) => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    if(lang.startsWith('ar')){
      if(/premium|enhanced|siri|natural/i.test(name)) return 'ar-premium';
      return 'ar';
    }
    return 'other';
  };

  const ranked = [...all].sort((a,b) => {
    const qa = classify(a), qb = classify(b);
    const order = { 'ar-premium': 0, 'ar': 1, 'other': 2 };
    return (order[qa] - order[qb]) || (a.name || '').localeCompare(b.name || '');
  });

  const groups = new Map();
  ranked.forEach(v => {
    const q = classify(v);
    if(!groups.has(q)) groups.set(q, []);
    groups.get(q).push(v);
  });

  const labels = {
    'ar-premium': '🇸🇦 عربية متميزة',
    'ar':         '🌍 عربية',
    'other':      '🌐 لغات أخرى'
  };

  let html = '';
  for(const key of ['ar-premium','ar','other']){
    const list = groups.get(key);
    if(!list || !list.length) continue;
    html += '<optgroup label="'+labels[key]+'">';
    for(const v of list){
      const selected = v.voiceURI === prefs.voiceURI ? ' selected' : '';
      const gender = /female|زينب|هدى|salma|amina|sana|laila|maryam|نورة|سلمى|زهرة/i.test(v.name) ? '♀'
                   : /male|Majed|ماجد|naayf|tarik|حمد|خالد|/i.test(v.name) ? '♂' : '';
      html += '<option value="'+esc(v.voiceURI)+'"'+selected+'>'+
              esc(v.name)+' '+gender+' — '+v.lang+'</option>';
    }
    html += '</optgroup>';
  }
  sel.innerHTML = html || '<option>لا توجد أصوات متاحة</option>';

  if(!prefs.voiceURI && ranked.length){
    const auto = ranked.find(v => classify(v) === 'ar-premium')
              || ranked.find(v => classify(v) === 'ar')
              || ranked[0];
    if(auto){
      prefs.voiceURI = auto.voiceURI;
      savePrefs();
      sel.value = auto.voiceURI;
    }
  }
}

function getSelectedVoice(){
  const uri = ($('#voiceSelect') && $('#voiceSelect').value) || prefs.voiceURI;
  let v = tts.voices.find(x => x.voiceURI === uri);
  if(v) return v;
  v = tts.voices.find(x => /ar/i.test(x.lang));
  return v || tts.voices[0] || null;
}

function applyWordHighlight(el, charIndex){
  if(!el) return;
  if(!el.dataset.ttsWords){
    const text = el.textContent;
    const words = text.split(/(\s+)/);
    let html = '';
    let idx = 0;
    for(const w of words){
      if(/^\s+$/.test(w)){ html += w; idx += w.length; continue; }
      html += '<span class="tts-word" data-cidx="'+idx+'">'+esc(w)+'</span>';
      idx += w.length;
    }
    el.dataset.ttsWords = '1';
    el.dataset.ttsOriginal = text;
    el.innerHTML = html;
  }
  const words = el.querySelectorAll('.tts-word');
  if(!words.length) return;
  let closest = null, bestDiff = Infinity;
  for(const w of words){
    const c = parseInt(w.dataset.cidx, 10);
    const diff = Math.abs(c - charIndex);
    if(diff < bestDiff){ bestDiff = diff; closest = w; }
  }
  el.querySelectorAll('.tts-word.active').forEach(x => x.classList.remove('active'));
  if(closest) closest.classList.add('active');
}

function clearWordHighlight(el){
  if(!el) return;
  if(el.dataset.ttsWords){
    el.textContent = el.dataset.ttsOriginal || el.textContent;
    delete el.dataset.ttsWords;
    delete el.dataset.ttsOriginal;
  }
}

function getCleanParagraphText(el){
  return stripTashkeel((el?.textContent || '').replace(/\s+/g,' ').trim());
}

function findTtsChunkEnd(text, start, maxLen = 260){
  if(text.length - start <= maxLen) return text.length;
  const hard = Math.min(text.length, start + maxLen);
  const softStart = Math.min(hard, start + Math.floor(maxLen * .55));
  const part = text.slice(softStart, hard);
  const punctuation = /[،؛,:.!?؟。]/g;
  let last = -1, m;
  while((m = punctuation.exec(part))) last = m.index;
  if(last >= 0) return softStart + last + 1;
  const space = text.lastIndexOf(' ', hard);
  return space > start + 80 ? space : hard;
}

function estimateTtsPosition(){
  if(!tts.currentUtter || tts.paused || !tts.currentSpeechText) return;
  const elapsed = Math.max(0,(Date.now()-tts.startTime)/1000);
  const rate = parseFloat(prefs.voiceRate || .95);
  const estimated = tts.chunkStart + Math.floor(elapsed * 13.5 * rate);
  if(estimated > tts.currentCharIndex)
    tts.currentCharIndex = Math.min(tts.chunkEnd, estimated);
}

function invalidateTtsUtterance(){
  tts.generation++;
  clearTimeout(tts.safetyTimer);
  tts.safetyTimer = null;
  tts.currentUtter = null;
}

function saveTtsPosition(){
  try{
    localStorage.setItem('ward-tts-position', JSON.stringify({
      chapter: current, paragraph: tts.i, char: tts.currentCharIndex,
      voiceURI: prefs.voiceURI, rate: prefs.voiceRate, savedAt: Date.now()
    }));
  }catch(e){}
}

function clearSavedTtsPosition(){
  try{ localStorage.removeItem('ward-tts-position'); }catch(e){}
}

function ttsSpeakFrom(startIndex = 0){
  if(!('speechSynthesis' in window)){
    notify('القراءة الصوتية غير مدعومة في متصفحك');
    return;
  }

  const paras = extractParagraphs();
  if(!paras.length){
    notify('لا يوجد نص قابل للقراءة في هذه الصفحة');
    return;
  }

  invalidateTtsUtterance();
  try{ speechSynthesis.cancel(); }catch(e){}

  tts.queue = paras;
  tts.i = Math.max(0, Math.min(startIndex, paras.length - 1));
  tts.currentCharIndex = 0;
  tts.chunkStart = 0;
  tts.chunkEnd = 0;
  tts.currentSpeechText = '';
  tts.playing = true;
  tts.paused = false;
  tts.lastError = null;

  $('#ttsBar').hidden = false;
  $('#ttsBar').classList.add('playing');
  updateTtsUI();
  speakNext();
}

function speakNext(){
  if(!tts.playing || tts.paused) return;
  if(tts.i >= tts.queue.length){
    finishTTS();
    return;
  }

  const el = tts.queue[tts.i];
  clearTtsHighlight();
  el.classList.add('tts-active');
  try{ el.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){}

  const fullText = getCleanParagraphText(el);
  if(!fullText){
    tts.i++;
    tts.currentCharIndex = 0;
    speakNext();
    return;
  }

  if(tts.currentCharIndex >= fullText.length){
    tts.i++;
    tts.currentCharIndex = 0;
    speakNext();
    return;
  }

  const start = Math.max(0,Math.min(tts.currentCharIndex,fullText.length));
  const end = findTtsChunkEnd(fullText,start,260);
  const chunk = fullText.slice(start,end).trim();

  if(!chunk){
    tts.i++;
    tts.currentCharIndex = 0;
    speakNext();
    return;
  }

  const token = ++tts.generation;
  const u = new SpeechSynthesisUtterance(chunk);
  const chosen = getSelectedVoice();
  if(chosen) u.voice = chosen;
  u.lang = (chosen && chosen.lang) || (/[\u0600-\u06ff]/.test(chunk) ? 'ar-SA' : 'en-US');
  u.rate = Math.max(.5,Math.min(2,parseFloat(prefs.voiceRate || .95)));
  u.pitch = 1;
  u.volume = 1;

  tts.currentUtter = u;
  tts.currentSpeechText = fullText;
  tts.chunkStart = start;
  tts.chunkEnd = end;
  tts.startTime = Date.now();

  u.onstart = () => {
    if(token !== tts.generation) return;
    updateTtsUI();
  };

  u.onboundary = event => {
    if(token !== tts.generation) return;
    if(event.name === 'word' || event.name === undefined){
      const rel = Math.max(0,Number(event.charIndex)||0);
      tts.currentCharIndex = Math.min(end,start+rel);
      applyWordHighlight(el,tts.currentCharIndex);
      saveTtsPosition();
    }
  };

  u.onend = () => {
    if(token !== tts.generation) return;
    tts.currentUtter = null;
    clearTimeout(tts.safetyTimer);
    if(!tts.playing || tts.paused) return;

    tts.currentCharIndex = end;
    if(tts.currentCharIndex >= fullText.length){
      tts.i++;
      tts.currentCharIndex = 0;
    }
    saveTtsPosition();
    speakNext();
  };

  u.onerror = event => {
    if(token !== tts.generation) return;
    tts.currentUtter = null;
    clearTimeout(tts.safetyTimer);
    const err = event?.error || 'unknown';
    if(err === 'canceled' || err === 'interrupted') return;

    tts.lastError = err;
    if(err === 'not-allowed' || err === 'network' || err === 'audio-busy'){
      setTimeout(() => {
        if(token === tts.generation && tts.playing && !tts.paused) speakNext();
      },180);
      return;
    }

    notify('حدث خطأ في الصوت، تتم محاولة المتابعة…');
    setTimeout(() => {
      if(token === tts.generation && tts.playing && !tts.paused){
        tts.currentCharIndex = Math.min(tts.chunkEnd,tts.currentCharIndex+1);
        speakNext();
      }
    },180);
  };

  /* Safety watchdog for browsers that fail to emit onend. */
  const duration = Math.max(7000,(chunk.length*90)/u.rate);
  tts.safetyTimer = setTimeout(() => {
    if(token !== tts.generation || !tts.playing || tts.paused || tts.currentUtter !== u) return;
    tts.currentCharIndex = end;
    try{ speechSynthesis.cancel(); }catch(e){}
    setTimeout(() => {
      if(token !== tts.generation || !tts.playing || tts.paused) return;
      if(tts.currentCharIndex >= fullText.length){
        tts.i++;
        tts.currentCharIndex = 0;
      }
      speakNext();
    },80);
  },duration+5000);

  updateTtsUI();
  try{ speechSynthesis.speak(u); }
  catch(e){ notify('تعذر تشغيل الصوت'); stopTTS(); }
}

function finishTTS(){
  const next = active && current < active.flat.length-1 ? current+1 : -1;
  const autoNext = !!prefs.ttsAutoNextPage;
  stopTTS(true);
  notify(autoNext && next >= 0 ? '✓ انتهت الصفحة — الانتقال للصفحة التالية…' : '✓ انتهت القراءة الصوتية');

  if(autoNext && next >= 0){
    setTimeout(() => {
      showChapter(next).then(() => setTimeout(() => ttsSpeakFrom(0),350));
    },500);
  }
}

function stopTTS(finished){
  tts.playing = false;
  tts.paused = false;
  invalidateTtsUtterance();
  try{ speechSynthesis.cancel(); }catch(e){}

  $$('.tts-active').forEach(x => {
    x.classList.remove('tts-active');
    clearWordHighlight(x);
  });

  tts.currentSpeechText = '';
  tts.currentCharIndex = 0;
  tts.chunkStart = 0;
  tts.chunkEnd = 0;
  tts.lastError = null;

  if(finished) clearSavedTtsPosition();

  const bar = $('#ttsBar');
  if(bar){
    bar.classList.remove('playing');
    if(finished) setTimeout(() => bar.hidden = true,300);
    else bar.hidden = true;
  }

  clearInterval(tts.sleepIntervalId);
  tts.sleepIntervalId = null;
  if(tts.sleepTimer){ clearTimeout(tts.sleepTimer); tts.sleepTimer = null; }
  tts.sleepRemaining = 0;
  updateSleepUI();
  updateTtsUI();
}

/* Android Chrome workaround: pause = capture position + cancel, resume = speak from position. */
function pauseTTS(){
  if(!tts.playing || tts.paused) return;
  estimateTtsPosition();
  saveTtsPosition();

  tts.paused = true;
  tts.playing = true;
  invalidateTtsUtterance();
  try{ speechSynthesis.cancel(); }catch(e){}

  $('#ttsBar')?.classList.remove('playing');
  updateTtsUI();
  notify('⏸ تم الإيقاف المؤقت — الموضع محفوظ');
}

function resumeTTS(){
  if(!tts.paused || !('speechSynthesis' in window)) return;
  tts.paused = false;
  tts.playing = true;
  $('#ttsBar').hidden = false;
  $('#ttsBar').classList.add('playing');
  updateTtsUI();

  try{ speechSynthesis.cancel(); }catch(e){}
  setTimeout(() => {
    if(tts.playing && !tts.paused) speakNext();
  },60);
  notify('▶ استئناف من الموضع المحفوظ');
}

function toggleTTS(){
  if(!('speechSynthesis' in window)){
    notify('القراءة الصوتية غير مدعومة في متصفحك');
    return;
  }
  if(tts.playing && !tts.paused){ pauseTTS(); return; }
  if(tts.paused){ resumeTTS(); return; }
  ttsSpeakFrom(0);
}

function ttsNext(){
  if(!tts.queue.length) return;
  const activeNow = tts.playing || tts.paused;
  tts.i = Math.min(tts.i+1,tts.queue.length-1);
  tts.currentCharIndex = 0;
  if(activeNow){
    tts.playing=true; tts.paused=false;
    invalidateTtsUtterance();
    try{ speechSynthesis.cancel(); }catch(e){}
    $('#ttsBar').hidden=false; $('#ttsBar').classList.add('playing');
    setTimeout(speakNext,50);
  }
}

function ttsPrev(){
  if(!tts.queue.length) return;
  const activeNow = tts.playing || tts.paused;
  tts.i = Math.max(tts.i-1,0);
  tts.currentCharIndex = 0;
  if(activeNow){
    tts.playing=true; tts.paused=false;
    invalidateTtsUtterance();
    try{ speechSynthesis.cancel(); }catch(e){}
    $('#ttsBar').hidden=false; $('#ttsBar').classList.add('playing');
    setTimeout(speakNext,50);
  }
}

function ttsJumpTo(index){
  if(!tts.queue.length) return;
  const activeNow = tts.playing || tts.paused;
  tts.i = Math.max(0,Math.min(index,tts.queue.length-1));
  tts.currentCharIndex = 0;
  if(activeNow){
    tts.playing=true; tts.paused=false;
    invalidateTtsUtterance();
    try{ speechSynthesis.cancel(); }catch(e){}
    $('#ttsBar').hidden=false; $('#ttsBar').classList.add('playing');
    setTimeout(speakNext,50);
  }
}

function restartCurrent(){
  if(!tts.playing && !tts.paused) return;
  tts.currentCharIndex = 0;
  tts.playing=true; tts.paused=false;
  invalidateTtsUtterance();
  try{ speechSynthesis.cancel(); }catch(e){}
  $('#ttsBar').hidden=false; $('#ttsBar').classList.add('playing');
  setTimeout(speakNext,50);
}

function updateTtsUI(){
  const bar=$('#ttsBar');
  if(!bar) return;

  const status=$('#ttsStatus');
  if(status) status.textContent=tts.queue.length
    ? ((tts.i+1)+' / '+tts.queue.length+(tts.paused?' · متوقف مؤقتًا':''))
    : '—';

  const progress=$('#ttsProgress');
  if(progress && tts.queue.length){
    progress.max=Math.max(0,tts.queue.length-1);
    progress.value=tts.i;
  }

  const speedLabel=$('#ttsSpeedLabel');
  if(speedLabel){
    const r=parseFloat(($('#voiceRate')&&$('#voiceRate').value)||prefs.voiceRate||.95);
    speedLabel.textContent='×'+r.toFixed(2);
  }

  const playBtn=$('#ttsPlay');
  if(playBtn){
    const activeNow=tts.playing&&!tts.paused;
    playBtn.classList.toggle('playing',activeNow);
    playBtn.title=activeNow?'إيقاف مؤقت — سيستأنف من نفس الموضع':(tts.paused?'استئناف القراءة':'تشغيل القراءة');
    playBtn.setAttribute('aria-label',activeNow?'إيقاف مؤقت':(tts.paused?'استئناف القراءة':'تشغيل القراءة'));
  }
}

function setSleepTimer(minutes){
  clearInterval(tts.sleepIntervalId);
  if(tts.sleepTimer){ clearTimeout(tts.sleepTimer); tts.sleepTimer = null; }

  if(!minutes || minutes <= 0){
    tts.sleepRemaining = 0;
    updateSleepUI();
    notify('أُلغي مؤقت النوم');
    return;
  }

  tts.sleepRemaining = minutes * 60;

  tts.sleepIntervalId = setInterval(() => {
    tts.sleepRemaining--;
    updateSleepUI();
    if(tts.sleepRemaining <= 0){
      clearInterval(tts.sleepIntervalId);
      tts.sleepIntervalId = null;
      stopTTS();
      notify('⏰ مؤقت النوم: توقف التشغيل');
    }
  }, 1000);

  tts.sleepTimer = setTimeout(() => {
    stopTTS();
    notify('⏰ انتهى مؤقت النوم');
  }, minutes * 60 * 1000);

  notify('⏰ سيُوقف الصوت بعد ' + minutes + ' دقيقة');
  updateSleepUI();
}

function updateSleepUI(){
  const el = $('#ttsSleepLabel');
  if(!el) return;
  if(!tts.sleepRemaining){ el.textContent = ''; el.hidden = true; return; }
  el.hidden = false;
  const m = Math.floor(tts.sleepRemaining / 60);
  const s = tts.sleepRemaining % 60;
  el.textContent = '⏰ ' + m + ':' + String(s).padStart(2, '0');
}

function setVoiceRate(rate){
  rate = Math.max(0.5, Math.min(2.0, rate));
  prefs.voiceRate = rate;
  savePrefs();

  const slider = $('#voiceRate');
  if(slider) slider.value = rate;

  const label = $('#ttsSpeedLabel');
  if(label) label.textContent = '×' + rate.toFixed(2);

  $$('#ttsBar [data-rate]').forEach(b => {
    b.classList.toggle('active', Math.abs(parseFloat(b.dataset.rate) - rate) < 0.01);
  });

  if(tts.playing && !tts.paused) restartCurrent();
}

function toggleTtsPanel(force){
  const panel = $('#ttsPanel');
  if(!panel) return;
  const show = force != null ? force : panel.hidden;
  panel.hidden = !show;
  if(show) buildVoiceList();
  const toggleBtn = $('#ttsPanelBtn');
  if(toggleBtn) toggleBtn.classList.toggle('active', show);
}

/* ---------- ربط أحداث TTS ---------- */
function bindTtsEvents(){
  const $play = $('#ttsPlay');
  if($play) $play.addEventListener('click', toggleTTS);

  const $stop = $('#ttsStop');
  if($stop) $stop.addEventListener('click', () => {
    stopTTS();
    notify('⏹ تم إيقاف القراءة');
  });

  const $prev = $('#ttsPrev');
  if($prev) $prev.addEventListener('click', ttsPrev);

  const $next = $('#ttsNext');
  if($next) $next.addEventListener('click', ttsNext);

  const $panelBtn = $('#ttsPanelBtn');
  if($panelBtn) $panelBtn.addEventListener('click', () => toggleTtsPanel());

  const $close = $('#ttsClose');
  if($close) $close.addEventListener('click', () => {
    stopTTS();
    toggleTtsPanel(false);
  });

  /* تبويبات اللوحة */
  $$('.tts-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.tab;
      $$('.tts-tab').forEach(t => t.classList.toggle('active', t === tab));
      $$('.tts-tab-content').forEach(c => {
        c.hidden = c.dataset.content !== name;
      });
    });
  });

  const progress = $('#ttsProgress');
  if(progress){
    progress.addEventListener('input', (e) => {
      const v = parseInt(e.target.value, 10);
      const status = $('#ttsStatus');
      if(status) status.textContent = (v + 1) + ' / ' + tts.queue.length;
    });
    progress.addEventListener('change', (e) => {
      const v = parseInt(e.target.value, 10);
      ttsJumpTo(v);
    });
  }

  const rate = $('#voiceRate');
  if(rate){
    rate.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const label = $('#ttsSpeedLabel');
      if(label) label.textContent = '×' + v.toFixed(2);
    });
    rate.addEventListener('change', (e) => {
      setVoiceRate(parseFloat(e.target.value));
    });
  }

  $$('#ttsBar [data-rate]').forEach(b => {
    b.addEventListener('click', () => setVoiceRate(parseFloat(b.dataset.rate)));
  });

  const $voiceSel = $('#voiceSelect');
  if($voiceSel){
    $voiceSel.addEventListener('change', (e) => {
      prefs.voiceURI = e.target.value;
      savePrefs();
      if(tts.playing && !tts.paused) restartCurrent();
      notify('✓ تم تغيير الصوت');
    });
  }

  $$('#ttsBar [data-sleep]').forEach(b => {
    b.addEventListener('click', () => {
      const min = parseInt(b.dataset.sleep, 10);
      setSleepTimer(min);
      $$('#ttsBar [data-sleep]').forEach(x => x.classList.toggle('active', x === b && min > 0));
    });
  });

  const $sleepCancel = $('#ttsSleepCancel');
  if($sleepCancel){
    $sleepCancel.addEventListener('click', () => {
      setSleepTimer(0);
      $$('#ttsBar [data-sleep]').forEach(x => x.classList.remove('active'));
    });
  }

  /* النقر على فقرة → ابدأ من هناك */
  const $content = $('#chapterContent');
  if($content){
    $content.addEventListener('click', (e) => {
      if(!tts.playing && !tts.paused) return;
      const el = e.target.closest('p, h1,h2,h3,h4,h5,h6, blockquote, li, div, span');
      if(!el) return;
      if(!$content.contains(el)) return;
      const idx = tts.queue.indexOf(el);
      if(idx >= 0){
        ttsJumpTo(idx);
        notify('↷ الانتقال إلى الفقرة ' + (idx + 1));
      }
    });
  }
}

/* تحديث دوري لتظليل الفقرات (احتياطي لـ Firefox) */
setInterval(() => {
  if(!tts.playing || tts.paused) return;
  const el = tts.queue[tts.i];
  if(!el) return;
  if(!el.querySelector('.tts-word.active')){
    /* Firefox لا يستدعي onboundary — نستخدم مؤقتاً تقريبياً */
    const text = el.textContent;
    const rate = parseFloat(($('#voiceRate') && $('#voiceRate').value) || prefs.voiceRate || 0.95);
    const elapsed = (Date.now() - tts.startTime) / 1000;
    const charsPerSec = 14 * rate;
    const estimated = Math.min(text.length, Math.floor(elapsed * charsPerSec));
    if(estimated > 0 && estimated > tts.currentCharIndex){
      tts.currentCharIndex = estimated;
      applyWordHighlight(el, estimated);
    }
  }
}, 250);


/* Mobile/Android recovery: backgrounding can interrupt the native speech engine.
   We never force-resume a user pause; only recover an unexpectedly empty utterance. */
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState !== 'visible' || !tts.playing || tts.paused) return;
  setTimeout(() => {
    if(!tts.playing || tts.paused) return;
    if(!tts.currentUtter) speakNext();
  },180);
});

/* Physical keyboard / Bluetooth keyboard shortcut. */
document.addEventListener('keydown', e => {
  if(e.code !== 'Space') return;
  if(e.target.matches('input,textarea,select,button,[contenteditable="true"]')) return;
  if($('#readerView')?.hidden) return;
  e.preventDefault();
  toggleTTS();
});

/* ---------- تفضيلات القراءة ---------- */
function buildFontGrid(){
  const g = $('#fontGrid'); if(!g) return;
  g.innerHTML = FONTS.map(f => '<button class="font-opt" data-font="'+esc(f.css)+'" style="font-family:'+esc(f.css)+'">'+f.label+'</button>').join('');
  g.onclick = e => {
    const b = e.target.closest('[data-font]'); if(!b) return;
    prefs.font = b.dataset.font; savePrefs(); applyReaderPrefs();
  };
}
function applyReaderPrefs(){
  const cc = $('#chapterContent'), paper = $('#readingPaper');
  if(!cc || !paper) return;
  cc.style.setProperty('--reader-font', prefs.font);
  cc.style.setProperty('--reader-size', prefs.size+'px');
  cc.style.setProperty('--reader-lh',   prefs.lineHeight);
  cc.style.setProperty('--reader-sp',   prefs.spacing+'px');
  cc.style.setProperty('--reader-align', prefs.justify ? 'justify' : 'start');
  cc.dir = prefs.dir;
  paper.style.setProperty('--paper-w', prefs.maxWidth+'px');
  paper.className = 'reading-paper ' + (prefs.paper === 'paper' ? '' : prefs.paper);
  paper.classList.toggle('dropcap', !!prefs.dropCap);
  if($('#fontSize')){       $('#fontSize').value       = prefs.size;        $('#fontSizeVal').textContent = prefs.size; }
  if($('#lineHeight')){     $('#lineHeight').value     = prefs.lineHeight;  $('#lineHeightVal').textContent = prefs.lineHeight; }
  if($('#letterSpacing')){  $('#letterSpacing').value  = prefs.spacing;     $('#letterSpacingVal').textContent = prefs.spacing; }
  if($('#maxWidth')){       $('#maxWidth').value       = prefs.maxWidth;    $('#maxWidthVal').textContent = prefs.maxWidth; }
  if($('#justifyToggle'))   $('#justifyToggle').checked   = !!prefs.justify;
  if($('#dropCapToggle'))   $('#dropCapToggle').checked   = !!prefs.dropCap;
  if($('#direction'))       $('#direction').value         = prefs.dir;
  if($('#voiceRate'))       $('#voiceRate').value         = prefs.voiceRate;
  if($('#ttsSpeedLabel'))   $('#ttsSpeedLabel').textContent = '×' + (prefs.voiceRate || 0.95).toFixed(2);
  $$('.font-opt').forEach(b => b.classList.toggle('active', b.dataset.font === prefs.font));
  $$('#paperSwatches [data-paper]').forEach(b => b.classList.toggle('active', b.dataset.paper === prefs.paper));
  $$('.size-quick [data-size]').forEach(b => b.classList.toggle('active', Math.abs(+b.dataset.size - prefs.size) < 3));
  $$('#ttsBar [data-rate]').forEach(b => {
    b.classList.toggle('active', Math.abs(parseFloat(b.dataset.rate) - (prefs.voiceRate || 0.95)) < 0.01);
  });
}

/* ---------- PWA ---------- */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  const b = $('#installBtn'); if(b) b.hidden = false;
});
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  try{ navigator.serviceWorker.register('sw.js').catch(() => {}); }catch(e){}
}

/* ============================================================
   ربط الأحداث
============================================================ */
function bindEvents(){
  const tools = document.querySelector('.reader-tools');
  if(tools && !$('#ttsBtn')){
    const ttsBtn = document.createElement('button');
    ttsBtn.className = 'iconbtn'; ttsBtn.id = 'ttsBtn'; ttsBtn.title = 'القراءة الصوتية (V)';
    ttsBtn.innerHTML = '<svg><use href="#i-voice"/></svg>';
    ttsBtn.onclick = toggleTTS;
    tools.insertBefore(ttsBtn, $('#settingsBtn'));

    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'iconbtn'; bookmarkBtn.id = 'bookmarkBtn'; bookmarkBtn.title = 'علامة مرجعية (B)';
    bookmarkBtn.innerHTML = '<svg><use href="#i-bookmark"/></svg>';
    bookmarkBtn.onclick = addBookmark;
    tools.insertBefore(bookmarkBtn, ttsBtn);
  }

  $('#importBtn').onclick      = () => $('#fileInput').click();
  $('#emptyImport').onclick    = () => $('#fileInput').click();
  $('#importDataBtn').onclick  = () => $('#fileInput').click();
  $('#fileInput').onchange     = e => { importFiles([...e.target.files]); e.target.value = ''; };
  $('#brandHome').onclick      = e => { e.preventDefault(); if(!$('#readerView').hidden) back(); };

  let dragCount = 0;
  window.addEventListener('dragenter', e => {
    e.preventDefault();
    if(e.dataTransfer && e.dataTransfer.types.includes('Files')){ dragCount++; $('#dropOverlay').hidden = false; }
  });
  window.addEventListener('dragleave', e => {
    e.preventDefault();
    dragCount = Math.max(0, dragCount-1);
    if(!dragCount) $('#dropOverlay').hidden = true;
  });
  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('drop', e => {
    e.preventDefault();
    dragCount = 0;
    $('#dropOverlay').hidden = true;
    if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) importFiles([...e.dataTransfer.files]);
  });

  $('#searchInput').oninput = render;
  $('#clearSearch').onclick = () => { $('#searchInput').value = ''; render(); };
  $('#sortSelect').onchange = render;
  $('#viewGridBtn').onclick = () => { gridView = true; render(); };
  $('#viewListBtn').onclick = () => { gridView = false; render(); };
  $$('.filter').forEach(f => f.onclick = () => {
    filter = f.dataset.filter;
    $$('.filter').forEach(x => x.classList.toggle('active', x === f));
    render();
  });
  $('#categories').onclick = e => {
    const c = e.target.closest('[data-cat]'); if(!c) return;
    category = c.dataset.cat; render();
  };
  $('#addCategory').onclick = async () => {
    const v = await promptDlg('اسم المجموعة الجديدة');
    if(v && v.trim()){ category = v.trim(); render(); notify('✓ أُضيفت المجموعة'); }
  };
  $('#continueBtn').onclick = e => openBook(e.currentTarget.dataset.open);

  $('#bookGrid').onclick = async e => {
    const t = e.target.closest('[data-open],[data-edit],[data-del],[data-export],[data-fav]');
    if(!t) return;
    if(t.dataset.open) return openBook(t.dataset.open);
    if(t.dataset.fav){
      const b = books.find(x => x.id === t.dataset.fav);
      if(b){ b.fav = !b.fav; await save(b); render(); notify(b.fav ? '♥ أُضيف إلى المفضلة' : 'أُزيل من المفضلة'); }
      return;
    }
    if(t.dataset.export) return exportBookToJSON(t.dataset.export);
    if(t.dataset.edit){
      const b = books.find(x => x.id === t.dataset.edit); if(!b) return;
      $('#editTitle').value = b.title;
      $('#editAuthor').value = b.author;
      $('#editCategory').value = b.category||'عام';
      $('#editFav').checked = !!b.fav;
      editRatingVal = b.rating||0;
      $('#catsList').innerHTML = [...new Set(books.map(x => x.category||'عام'))].map(c => '<option value="'+esc(c)+'">').join('');
      paintStars();
      $('#editModal').dataset.id = b.id;
      $('#editModal').hidden = false;
      return;
    }
    if(t.dataset.del){
      const b = books.find(x => x.id === t.dataset.del); if(!b) return;
      const ok = await confirmDlg('حذف الكتاب', 'سيتم حذف «'+b.title+'» وكل علاماته وملاحظاته نهائياً. متابعة؟');
      if(!ok) return;
      await remove(b.id);
      books = books.filter(x => x.id !== b.id);
      render();
      notify('✓ تم الحذف');
    }
  };
  function paintStars(){
    $$('#editRating [data-star]').forEach(b => {
      const on = +b.dataset.star <= editRatingVal;
      b.classList.toggle('on', on);
      b.innerHTML = '<svg><use href="#i-star'+(on ? '-fill' : '')+'"/></svg>';
    });
  }
  $$('#editRating [data-star]').forEach(b => b.onclick = () => {
    editRatingVal = (editRatingVal === +b.dataset.star) ? 0 : +b.dataset.star;
    paintStars();
  });
  $('#saveEdit').onclick = async () => {
    const b = books.find(x => x.id === $('#editModal').dataset.id); if(!b) return;
    b.title    = $('#editTitle').value.trim()    || b.title;
    b.author   = $('#editAuthor').value.trim()   || 'غير محدد';
    b.category = $('#editCategory').value.trim() || 'عام';
    b.rating = editRatingVal;
    b.fav    = $('#editFav').checked;
    await save(b);
    $('#editModal').hidden = true;
    render();
    notify('✓ تم الحفظ');
  };

  $('#backBtn').onclick  = back;
  $('#prevBtn').onclick  = () => showChapter(current-1);
  $('#nextBtn').onclick  = () => showChapter(current+1);
  $('#progressRange').oninput = e => {
    if(!active) return;
    const total = active.flat.length;
    const target = Math.min(total, Math.max(1, Math.round(e.target.value/100*total)));
    $('#progressLabel').textContent = target + ' / ' + total;
  };
  $('#progressRange').onchange = e => {
    if(!active) return;
    const total = active.flat.length;
    const target = Math.min(total-1, Math.max(0, Math.round(e.target.value/100*total) - 1));
    showChapter(target);
  };
  $('#tocBtn').onclick = () => $('#readerPanel').classList.toggle('open');
  $('#focusBtn').onclick = () => {
    document.body.classList.toggle('focus');
    notify(document.body.classList.contains('focus') ? 'وضع التركيز — اضغط Esc للخروج' : 'تم الخروج من وضع التركيز');
  };
  $('#fullBtn').onclick = () => {
    if(document.fullscreenElement) document.exitFullscreen();
    else { const rv = $('#readerView'); if(rv.requestFullscreen) rv.requestFullscreen().catch(() => {}); }
  };

  $$('.tab').forEach(t => t.onclick = () => {
    panelTab = t.dataset.tab;
    $$('.tab').forEach(x => x.classList.toggle('active', x === t));
    renderPanel();
  });
  $('#readerPanel').onclick = async e => {
    const t = e.target.closest('[data-tab]');
    if(t){ panelTab = t.dataset.tab; $$('.tab').forEach(x => x.classList.toggle('active', x === t)); renderPanel(); return; }
    const a = e.target.closest('[data-index]');
    if(a && a.dataset.index !== ''){
      await showChapter(+a.dataset.index);
      if(window.innerWidth <= 880) $('#readerPanel').classList.remove('open');
      return;
    }
    const m = e.target.closest('[data-mark]');
    if(m){ await showChapter(active.marks[+m.dataset.mark].chapter); return; }
    const md = e.target.closest('[data-markdel]');
    if(md){ active.marks.splice(+md.dataset.markdel,1); saveDebounced(active, 200); renderPanel(); return; }
    const nd = e.target.closest('[data-notedel]');
    if(nd){ active.notes.splice(+nd.dataset.notedel,1); saveDebounced(active, 200); renderPanel(); return; }
    const hj = e.target.closest('[data-hljump]');
    if(hj){ await showChapter(active.highlights[+hj.dataset.hljump].chapter); return; }
    const hd = e.target.closest('[data-hldel]');
    if(hd){ removeHighlight(active.highlights[+hd.dataset.hldel].id); return; }
    if(e.target.closest('#addNote')){
      const v = await promptDlg('ملاحظة للصفحة: '+active.flat[current].label);
      if(v){
        active.notes.push({ text:v, quote:'', chapter:current, chapterLabel:active.flat[current].label });
        saveDebounced(active, 200);
        renderPanel();
        notify('✓ أُضيفت الملاحظة');
      }
    }
  };

  $('#settingsBtn').onclick = () => { const p = $('#settingsPop'); p.hidden = !p.hidden; $('#searchPop').hidden = true; $('#exportPop').hidden = true; };
  $('#searchBookBtn').onclick = () => {
    const p = $('#searchPop'); p.hidden = !p.hidden;
    $('#settingsPop').hidden = true; $('#exportPop').hidden = true;
    if(!p.hidden){
      $('#bookSearchInput').focus();
      if($('#bookSearchInput').value) doBookSearch($('#bookSearchInput').value);
    }
  };
  $('#moreBtn').onclick = () => { const p = $('#exportPop'); p.hidden = !p.hidden; $('#settingsPop').hidden = true; $('#searchPop').hidden = true; };
  $('#exportBtn').onclick = () => { $('#libraryExportPop').hidden = false; };
  $('#bookSearchInput').oninput = e => doBookSearch(e.target.value);
  $('#bookSearchInput').onkeydown = e => {
    if(e.key === 'Enter'){
      const first = $('#bookSearchResults [data-srjump]');
      if(first) jumpSearch(+first.dataset.srjump, first.dataset.srq);
    }
  };
  $('#bookSearchResults').onclick = e => {
    const r = e.target.closest('[data-srjump]');
    if(r) jumpSearch(+r.dataset.srjump, r.dataset.srq);
  };

  $$('[data-close]').forEach(b => b.onclick = () => { const el = $('#'+b.dataset.close); if(el) el.hidden = true; });
  $('#confirmCancel').onclick = () => { $('#confirmModal').hidden = true; if(confirmResolve) confirmResolve(false); confirmResolve = null; };
  $('#confirmOk').onclick     = () => { $('#confirmModal').hidden = true; if(confirmResolve) confirmResolve(true);  confirmResolve = null; };
  $('#promptCancel').onclick  = () => { $('#promptModal').hidden = true;  if(promptResolve) promptResolve(null);  promptResolve = null; };
  $('#promptOk').onclick      = () => { const v = $('#promptInput').value; $('#promptModal').hidden = true; if(promptResolve) promptResolve(v); promptResolve = null; };
  $('#imgViewer').onclick     = () => { $('#imgViewer').hidden = true; };

  $('#exportPop').onclick = e => {
    const b = e.target.closest('[data-export-action]');
    if(!b || !active) return;
    const act = b.dataset.exportAction, item = active.flat[current];
    const chapterExport = () => extractChapterContent(active, item);
    if(act === 'book-json'){ exportBookToJSON(active.id); }
    else if(act === 'book-txt'){
      download(new Blob(['«'+active.title+'» — '+active.author+'\n\n'+item.label+'\n\n'+htmlToText(chapterExport())], { type:'text/plain;charset=utf-8' }), item.label+'.txt');
      notify('✓ تم تصدير TXT');
    }
    else if(act === 'book-md'){
      download(new Blob(['# '+item.label+'\n\n*'+active.title+' — '+active.author+'*\n\n'+htmlToMD(chapterExport())], { type:'text/markdown;charset=utf-8' }), item.label+'.md');
      notify('✓ تم تصدير Markdown');
    }
    else if(act === 'book-html'){
      download(new Blob(['<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>'+esc(item.label)+'</title><style>body{font-family:\'Amiri\',serif;font-size:20px;line-height:2.1;max-width:760px;margin:30px auto;padding:0 22px}img{max-width:100%}</style></head><body><h1>'+esc(item.label)+'</h1>'+chapterExport()+'</body></html>'], { type:'text/html;charset=utf-8' }), item.label+'.html');
      notify('✓ تم تصدير HTML');
    }
    else if(act === 'book-print'){ printChapter(); }
    else if(act === 'book-copy'){
      if(navigator.clipboard) navigator.clipboard.writeText(htmlToText(chapterExport())).then(() => notify('✓ نُسخت الصفحة')).catch(() => notify('✗ تعذر النسخ'));
    }
    else if(act === 'marks-md'){ exportMarksMD(active); }
    else if(act === 'hl-md'){ exportHlMD(active); }
    else if(act === 'book-share'){
      if(navigator.share) navigator.share({ title:item.label+' — '+active.title, text:htmlToText(chapterExport()).slice(0,4000) }).catch(() => {});
      else notify('المشاركة غير مدعومة');
    }
  };
  $('#libraryExportPop').onclick = e => {
    const b = e.target.closest('[data-lib-export]'); if(!b) return;
    $('#libraryExportPop').hidden = true;
    if(b.dataset.libExport === 'full') exportLibraryToJSON(true);
    else if(b.dataset.libExport === 'meta') exportLibraryToJSON(false);
    else if(b.dataset.libExport === 'csv') exportCSV();
  };

  $('#fontSize').oninput = e => { prefs.size = +e.target.value; savePrefs(); applyReaderPrefs(); };
  $$('.size-preset').forEach(b => b.onclick = () => { prefs.size = Math.max(14, Math.min(40, prefs.size + (+b.dataset.delta))); savePrefs(); applyReaderPrefs(); });
  $$('.size-quick [data-size]').forEach(b => b.onclick = () => { prefs.size = +b.dataset.size; savePrefs(); applyReaderPrefs(); });
  $('#lineHeight').oninput   = e => { prefs.lineHeight = +e.target.value; savePrefs(); applyReaderPrefs(); };
  $('#letterSpacing').oninput= e => { prefs.spacing = +e.target.value; savePrefs(); applyReaderPrefs(); };
  $('#maxWidth').oninput     = e => { prefs.maxWidth = +e.target.value; savePrefs(); applyReaderPrefs(); };
  $('#paperSwatches').onclick= e => { const b = e.target.closest('[data-paper]'); if(b){ prefs.paper = b.dataset.paper; savePrefs(); applyReaderPrefs(); } };
  $('#justifyToggle').onchange = e => { prefs.justify = e.target.checked; savePrefs(); applyReaderPrefs(); };
  $('#dropCapToggle').onchange = e => { prefs.dropCap = e.target.checked; savePrefs(); applyReaderPrefs(); };
  $('#direction').onchange     = e => { prefs.dir = e.target.value; savePrefs(); applyReaderPrefs(); };
  $('#resetPrefsBtn').onclick = () => {
    const d = prefs.dark;
    prefs = { ...DEFAULT_PREFS, dark:d };
    savePrefs(); applyReaderPrefs();
    notify('✓ أُعيدت الإعدادات الافتراضية');
  };

  /* TTS */
  bindTtsEvents();
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = () => {
      buildVoiceList();
      if($('#ttsPanel') && !$('#ttsPanel').hidden) buildVoiceList();
    };
    buildVoiceList();
  }

  $('#menuBtn').onclick    = () => { $('#sidebar').classList.add('open'); $('#overlay').classList.add('show'); };
  $('#closeMenu').onclick  = () => { $('#sidebar').classList.remove('open'); $('#overlay').classList.remove('show'); };
  $('#overlay').onclick    = () => { $('#sidebar').classList.remove('open'); $('#overlay').classList.remove('show'); };

  $('#themeBtn').onclick = () => { prefs.dark = !prefs.dark; savePrefs(); document.body.classList.toggle('dark', prefs.dark); };
  $('#helpBtn').onclick  = () => { $('#shortcutsModal').hidden = false; };
  $('#aboutBtn').onclick = () => { $('#aboutModal').hidden = false; };
  $('#installBtn').onclick = async () => {
    if(deferredInstall){ deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $('#installBtn').hidden = true; }
  };

  setupSelection();

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      ['settingsPop','searchPop','exportPop','libraryExportPop','editModal','confirmModal','promptModal','shortcutsModal','aboutModal','selPop'].forEach(id => {
        const el = $('#'+id); if(el) el.hidden = true;
      });
      $('#imgViewer').hidden = true;
      document.body.classList.remove('focus');
    }
    if(e.key === '?' && !e.target.matches('input,textarea')) $('#shortcutsModal').hidden = false;
    if(e.target.matches('input,textarea,select')) return;
    if(!$('#readerView').hidden){
      if(e.key === 'ArrowLeft')  showChapter(current+1);
      if(e.key === 'ArrowRight') showChapter(current-1);
      if(e.key.toLowerCase() === 'b') addBookmark();
      if(e.key.toLowerCase() === 'f') $('#fullBtn').click();
      if(e.key.toLowerCase() === 's') $('#searchBookBtn').click();
      if(e.key.toLowerCase() === 'v') toggleTTS();
      if(e.key === '+' || e.key === '='){ prefs.size = Math.min(40, prefs.size+1); savePrefs(); applyReaderPrefs(); }
      if(e.key === '-'){ prefs.size = Math.max(14, prefs.size-1); savePrefs(); applyReaderPrefs(); }
    }
    if(e.key.toLowerCase() === 't'){ prefs.dark = !prefs.dark; savePrefs(); document.body.classList.toggle('dark', prefs.dark); }
  });
}

/* ============================================================
   التشغيل
============================================================ */
(async () => {
  document.body.classList.toggle('dark', !!prefs.dark);
  buildFontGrid();
  initSearchWorker();
  try{
    await openDB();
    books = await getAll();
    books.forEach(b => {
      b.marks      = b.marks      || [];
      b.notes      = b.notes      || [];
      b.highlights = b.highlights || [];
    });
  }catch(e){
    console.error(e);
    notify('تعذر تشغيل التخزين المحلي');
  }
  render();
  bindEvents();
  applyReaderPrefs();
})();