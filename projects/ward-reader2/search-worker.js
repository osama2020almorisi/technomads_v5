/* ============================================================
   وِرد برو — Web Worker للبحث في الكتب الضخمة
   الإصدار 5.0
   ─────────────────────────────────────────────────────────────
   الوظائف:
   • يستقبل فهرس النصوص من الـ main thread (مصفوفة صفحات)
   • ينفّذ البحث بدون تجميد الواجهة
   • يعيد النتائج مع مقتطفات (pre/hit/post) لكل نتيجة
   • يدعم البحث العربي مع تطبيع بسيط
   • يحدّ من النتائج لتجنّب استهلاك الذاكرة
   ─────────────────────────────────────────────────────────────
   الرسائل الواردة (من app.js):
   • { type: 'BUILD_INDEX', payload: { bookId, index } }
   • { type: 'SEARCH',      payload: { bookId, query, maxPerPage, maxTotal } }
   • { type: 'CLEAR' }

   الرسائل الصادرة (إلى app.js):
   • { type: 'INDEX_READY',    bookId, count }
   • { type: 'SEARCH_RESULTS', results, total, query }
   • { type: 'CLEARED' }
   • { type: 'ERROR',          error }
============================================================ */
'use strict';

/* ---------- الحالة الداخلية ---------- */
let index = null;      // مصفوفة [{ i, label, text }, ...]
let bookId = null;     // مُعرّف الكتاب الحالي
let indexSize = 0;     // عدد الصفحات في الفهرس
let totalChars = 0;    // إجمالي عدد الأحرف (إحصاء)

/* ---------- تطبيع النص العربي ---------- */
/**
 * يُنتج نسخة مُطبَّعة من النص للمقارنة:
 *   • يوحّد الألف (أ إ آ ٱ) → ا
 *   • يوحّد الياء (ى) → ي
 *   • يوحّد التاء المربوطة (ة) → ه
 *   • يُزيل التشكيل والعلامات
 *   • يحوّل إلى lowercase (للإنجليزية)
 */
function normalizeArabic(text){
  if(!text) return '';
  return text
    // التطويل
    .replace(/\u0640/g, '')
    // التشكيل والتنوين
    .replace(/[\u064B-\u065F]/g, '')
    // الألف الخنجرية
    .replace(/\u0670/g, '')
    // علامات الوقف
    .replace(/[\u06D6-\u06ED]/g, '')
    // توحيد الألف
    .replace(/[أإآٱ]/g, 'ا')
    // توحيد الياء
    .replace(/ى/g, 'ي')
    // توحيد التاء المربوطة
    .replace(/ة/g, 'ه')
    // الأرقام العربية → إنجليزية (اختياري)
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .toLowerCase();
}

/* ---------- بناء الفهرس ---------- */
function buildIndex(newIndex, newBookId){
  index = newIndex || [];
  bookId = newBookId || null;
  indexSize = index.length;

  /* حسبة إجمالية للذاكرة */
  totalChars = 0;
  for(const ch of index){
    if(ch && ch.text) totalChars += ch.text.length;
  }

  self.postMessage({
    type: 'INDEX_READY',
    bookId: bookId,
    count: indexSize,
    totalChars: totalChars
  });
}

/* ---------- البحث ---------- */
function performSearch(query, maxPerPage, maxTotal){
  if(!index || !index.length){
    self.postMessage({
      type: 'SEARCH_RESULTS',
      results: [],
      total: 0,
      query: query,
      reason: 'no-index'
    });
    return;
  }

  const rawQuery = (query || '').trim();
  if(rawQuery.length < 2){
    self.postMessage({
      type: 'SEARCH_RESULTS',
      results: [],
      total: 0,
      query: rawQuery,
      reason: 'too-short'
    });
    return;
  }

  /* نسختان للبحث: واحدة خام، وواحدة مُطبَّعة */
  const qLower  = rawQuery.toLowerCase();
  const qNorm   = normalizeArabic(rawQuery);
  const useNorm = qNorm && qNorm !== qLower;

  const results = [];
  let total = 0;

  for(let ci = 0; ci < index.length; ci++){
    if(total >= maxTotal) break;

    const ch = index[ci];
    if(!ch || !ch.text) continue;

    const text = ch.text;
    const textLower = text.toLowerCase();
    const textNorm = useNorm ? normalizeArabic(text) : textLower;

    /* ابحث في النسخة المُطبَّعة أولاً (إن اختلفت)، وإلا في الخام */
    const searchIn = useNorm ? textNorm : textLower;
    const needle   = useNorm ? qNorm   : qLower;

    let pos = 0;
    let cnt = 0;

    while(cnt < maxPerPage && total < maxTotal){
      const f = searchIn.indexOf(needle, pos);
      if(f < 0) break;

      /* حدّد موقع الظهور في النص الأصلي (قد يختلف الطول بعد التطبيع) */
      let rawStart = f;
      let rawEnd   = f + needle.length;

      if(useNorm && textNorm.length !== text.length){
        /* إعادة تعيين تقريبية: نبحث في النص الخام عن أطول تطابق */
        const approx = rawQuery;
        const found = textLower.indexOf(approx.toLowerCase(), Math.max(0, f - 20));
        if(found >= 0){
          rawStart = found;
          rawEnd   = found + approx.length;
        }
      }

      const preStart = Math.max(0, rawStart - 60);
      const postEnd  = Math.min(text.length, rawEnd + 60);

      results.push({
        chapter: ch.i,
        label: ch.label || ('صفحة ' + (ch.i + 1)),
        pre:    text.slice(preStart, rawStart),
        hit:    text.slice(rawStart, rawEnd),
        post:   text.slice(rawEnd, postEnd)
      });

      pos = f + needle.length;
      cnt++;
      total++;
    }
  }

  self.postMessage({
    type: 'SEARCH_RESULTS',
    results: results,
    total: total,
    query: rawQuery,
    normalized: useNorm ? qNorm : null
  });
}

/* ---------- مسح الحالة ---------- */
function clearAll(){
  index = null;
  bookId = null;
  indexSize = 0;
  totalChars = 0;
  self.postMessage({ type: 'CLEARED' });
}

/* ---------- استقبال الرسائل ---------- */
self.onmessage = (e) => {
  const data = e.data || {};
  const { type, payload } = data;

  try{
    switch(type){

      case 'BUILD_INDEX': {
        const { bookId: bid, index: idx } = payload || {};
        buildIndex(idx, bid);
        break;
      }

      case 'SEARCH': {
        const {
          bookId: bid,
          query,
          maxPerPage = 4,
          maxTotal = 200
        } = payload || {};

        /* التحقق من أن الفهرس يخصّ نفس الكتاب */
        if(bid && bookId && bid !== bookId){
          /* استبدل الفهرس بالكتاب الجديد إن وُجد */
          /* ملاحظة: في التصميم الحالي، الـ main thread يرسل BUILD_INDEX قبل SEARCH */
          self.postMessage({
            type: 'SEARCH_RESULTS',
            results: [],
            total: 0,
            query: query,
            reason: 'index-stale'
          });
          break;
        }

        performSearch(query, maxPerPage, maxTotal);
        break;
      }

      case 'CLEAR': {
        clearAll();
        break;
      }

      case 'PING': {
        self.postMessage({
          type: 'PONG',
          indexSize: indexSize,
          bookId: bookId
        });
        break;
      }

      default:
        self.postMessage({
          type: 'ERROR',
          error: 'unknown-message-type',
          received: type
        });
    }
  }catch(err){
    self.postMessage({
      type: 'ERROR',
      error: err && err.message ? err.message : 'unknown-error',
      stack: err && err.stack ? err.stack : null,
      received: type
    });
  }
};

/* ---------- معالجة الأخطاء العامة ---------- */
self.onerror = (event) => {
  self.postMessage({
    type: 'ERROR',
    error: 'worker-runtime-error',
    message: event && event.message ? event.message : null,
    filename: event && event.filename ? event.filename : null,
    lineno: event && event.lineno ? event.lineno : null
  });
};

self.onunhandledrejection = (event) => {
  self.postMessage({
    type: 'ERROR',
    error: 'worker-unhandled-rejection',
    reason: event && event.reason ? String(event.reason) : null
  });
};

/* ---------- إشعار الجهوزية ---------- */
self.postMessage({ type: 'READY', version: '5.0' });