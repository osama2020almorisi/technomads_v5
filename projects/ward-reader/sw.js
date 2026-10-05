/* ============================================================
   وِرد برو — Service Worker
   الإصدار 5.0
   ─────────────────────────────────────────────────────────────
   المزايا:
   • 3 كاشات منفصلة: shell / fonts / runtime
   • Cache-First لملفات التطبيق (سرعة فورية)
   • Stale-While-Revalidate لخطوط Google (offline)
   • fetchWithTimeout — لا طلبات معلقة
   • تنظيف تلقائي للكاشات القديمة عند كل تحديث
   • دعم رسائل SKIP_WAITING و CLEAR_CACHE من الصفحة
============================================================ */
'use strict';

/* ---------- إعدادات النسخة ---------- */
const CACHE_VERSION = 'ward-pro-v5.0';
const CACHE_SHELL   = CACHE_VERSION + '-shell';
const CACHE_FONTS   = CACHE_VERSION + '-fonts';
const CACHE_RUNTIME = CACHE_VERSION + '-runtime';

/* عمر افتراضي للخطوط (30 يوماً) */
const FONT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/* ---------- ملفات التطبيق الأساسية ---------- */
const SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './search-worker.js',
  './manifest.json',
  './icons/icon.svg'
];

/* ---------- نطاقات مسموحة لتخزين الخطوط ---------- */
const FONT_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/* ---------- التثبيت ---------- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_SHELL)
      .then(cache => {
        /* نستخدم Promise.allSettled حتى لا يفشل التثبيت كله إذا غاب ملف واحد */
        return Promise.allSettled(
          SHELL.map(url =>
            cache.add(url).catch(err => {
              console.warn('[SW] تعذر تخزين:', url, err && err.message);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* ---------- التنشيط ---------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => !k.startsWith(CACHE_VERSION))
          .map(k => {
            console.info('[SW] حذف كاش قديم:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
  );
});

/* ============================================================
   دوال مساعدة
============================================================ */

/* هل الطلب لخط من Google؟ */
function isFontRequest(url){
  try{
    const u = new URL(url);
    return FONT_HOSTS.includes(u.hostname);
  }catch(e){ return false; }
}

/* هل الطلب من نفس الأصل؟ */
function isSameOrigin(url){
  try{ return new URL(url).origin === self.location.origin; }
  catch(e){ return false; }
}

/* هل الطلب من نفس النطاق الأساسي؟ */
function isHttpRequest(url){
  return /^https?:/i.test(url);
}

/* fetch مع timeout — لا نعلق الانتظار أبداً */
function fetchWithTimeout(request, ms = 8000){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  /* دعم الطلبات القديمة التي لا تقبل signal */
  const opts = { signal: controller.signal };
  if(request.mode === 'navigate') opts.credentials = 'same-origin';

  return fetch(request, opts)
    .finally(() => clearTimeout(timer));
}

/* تخزين آمن للطلبات */
async function safePut(cacheName, request, response){
  if(!response || !response.ok) return;
  try{
    /* لا نُخزّن الردود opaque */
    if(response.type === 'opaque') return;

    /* لا نُخزّن الطلبات غير GET */
    if(request.method !== 'GET') return;

    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }catch(e){
    /* تجاهل الأخطاء الصامتة (quota, invalid) */
  }
}

/* ============================================================
   الاستراتيجية 1: Cache-First + تحديث بالخلفية
   للقشرة (app.js, style.css, index.html)
============================================================ */
async function cacheFirst(request, cacheName){
  try{
    const cached = await caches.match(request);

    if(cached){
      /* تحديث صامت في الخلفية (لا يُنتظر) */
      fetchWithTimeout(request, 6000)
        .then(res => safePut(cacheName, request, res))
        .catch(() => {});

      return cached;
    }

    /* لا يوجد في الكاش: اجلب من الشبكة */
    const res = await fetchWithTimeout(request);
    await safePut(cacheName, request, res);
    return res;

  }catch(err){
    /* فشل الشبكة: جرّب القشرة ثم صفحة الخطأ */
    const fallback = await caches.match(request) || await caches.match('./index.html');
    if(fallback) return fallback;

    return new Response(
      '<!doctype html><html dir="rtl"><meta charset="utf-8">' +
      '<body style="font-family:sans-serif;text-align:center;padding:60px">' +
      '<h1>غير متصل</h1><p>لا توجد نسخة مخزّنة من هذه الصفحة.</p>' +
      '<p>افتح التطبيق أولاً ثم أعد المحاولة offline.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/* ============================================================
   الاستراتيجية 2: Stale-While-Revalidate
   لخطوط Google (تُحدَّث في الخلفية دون حجب)
============================================================ */
async function staleWhileRevalidate(request, cacheName){
  const cached = await caches.match(request);

  /* الشبكة موازية — نُحدّث الكاش بغض النظر */
  const networkPromise = fetchWithTimeout(request, 6000)
    .then(res => {
      safePut(cacheName, request, res);
      return res;
    })
    .catch(() => null);

  /* إن وُجد بالكاش: أعده فوراً (والشبكة تُحدّث في الخلفية) */
  if(cached){
    networkPromise.catch(() => {});
    return cached;
  }

  /* لا يوجد بالكاش: انتظر الشبكة */
  const fresh = await networkPromise;
  if(fresh) return fresh;

  /* فشل كلي: رد فارغ بدل خطأ */
  return new Response('', {
    status: 504,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

/* ============================================================
   الاستراتيجية 3: Network-Only لأي شيء آخر
============================================================ */
async function networkOnly(request){
  try{
    return await fetchWithTimeout(request);
  }catch(err){
    return new Response('', { status: 503 });
  }
}

/* ============================================================
   اعتراض الطلبات
============================================================ */
self.addEventListener('fetch', event => {
  const req = event.request;

  /* 1) تخطّي الطلبات غير GET */
  if(req.method !== 'GET') return;

  const url = req.url;

  /* 2) تخطّي الطلبات غير HTTP (chrome-extension, devtools...) */
  if(!isHttpRequest(url)) return;

  /* 3) تخطّي طلبات الفيديو/الصوت كبيرة الحجم (لا نُخزّنها) */
  if(req.destination === 'video' || req.destination === 'audio'){
    event.respondWith(networkOnly(req));
    return;
  }

  /* 4) طلبات الملاحة (فتح التطبيق) */
  if(req.mode === 'navigate'){
    event.respondWith(cacheFirst(req, CACHE_SHELL));
    return;
  }

  /* 5) خطوط Google → Stale-While-Revalidate */
  if(isFontRequest(url)){
    event.respondWith(staleWhileRevalidate(req, CACHE_FONTS));
    return;
  }

  /* 6) نفس الأصل (ملفات التطبيق) → Cache-First */
  if(isSameOrigin(url)){
    event.respondWith(cacheFirst(req, CACHE_RUNTIME));
    return;
  }

  /* 7) أي شيء آخر → Network-Only مع timeout */
  event.respondWith(networkOnly(req));
});

/* ============================================================
   رسائل من الصفحة
============================================================ */
self.addEventListener('message', event => {
  const data = event.data;
  if(!data || !data.type) return;

  /* تفعيل النسخة الجديدة فوراً */
  if(data.type === 'SKIP_WAITING'){
    self.skipWaiting();
    return;
  }

  /* مسح كل الكاشات */
  if(data.type === 'CLEAR_CACHE'){
    event.waitUntil(
      caches.keys()
        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => {
          /* إبلاغ الصفحة */
          if(event.source && event.source.postMessage){
            event.source.postMessage({ type: 'CACHE_CLEARED' });
          }
        })
    );
    return;
  }

  /* مسح كاش محدد */
  if(data.type === 'CLEAR_SPECIFIC' && data.cacheName){
    event.waitUntil(
      caches.delete(data.cacheName).then(() => {
        if(event.source && event.source.postMessage){
          event.source.postMessage({ type: 'CACHE_CLEARED', cacheName: data.cacheName });
        }
      })
    );
    return;
  }

  /* معلومات عن الكاشات */
  if(data.type === 'INFO'){
    event.waitUntil(
      caches.keys().then(async keys => {
        const info = {};
        for(const k of keys){
          try{
            const cache = await caches.open(k);
            const reqs = await cache.keys();
            info[k] = reqs.length;
          }catch(e){ info[k] = -1; }
        }
        if(event.source && event.source.postMessage){
          event.source.postMessage({ type: 'CACHE_INFO', info, version: CACHE_VERSION });
        }
      })
    );
    return;
  }
});

/* ============================================================
   إشعار التحديث — عند تغيير الـ CACHE_VERSION
============================================================ */
self.addEventListener('controllerchange', () => {
  /* الصفحة تحتاج تحديثاً لتفعيل SW الجديد */
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      if(client.postMessage){
        client.postMessage({ type: 'CONTROLLER_CHANGED', version: CACHE_VERSION });
      }
    });
  });
});