/* ============================================================
   service-worker.js — v3 (تحديث فوري)
   ============================================================ */

const BUILD_VERSION = 'v4-2026-02';   // ← غيّر عند كل تحديث
const CACHE = `bidaya-reader-${BUILD_VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './import.html',
  './about.html',
  './reader.html',
  './search.html',
  './bookmarks.html',
  './history.html',
  './settings.html',
  './manifest.json',
  './css/reset.css',
  './css/main.css',
  './css/reader.css',
  './css/mobile.css',
  './js/db.js',
  './js/store.js',
  './js/ui.js',
  './js/import.js',
  './js/app.js',
  './js/reader.js',
  './js/search.js',
  './js/bookmarks.js',
  './js/history.js',
  './js/settings.js',
  './js/pwa.js',
];

// ═══ Install ═══
self.addEventListener('install', (e) => {
  console.log(`🛠️ SW installing: ${CACHE}`);
  e.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => {
          console.warn(`⚠️ Failed: ${url}`, err.message);
        }))
      );
      // ✅ لا تنتظر — فعّل فورًا
      return self.skipWaiting();
    })
  );
});

// ═══ Activate ═══
self.addEventListener('activate', (e) => {
  console.log(`🚀 SW activating: ${CACHE}`);
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('bidaya-reader-') && k !== CACHE)
          .map(k => {
            console.log(`🗑️ Deleting: ${k}`);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ═══ Fetch ═══
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(networkFirst(req));
  } else if (
    req.destination === 'style' ||
    req.destination === 'script' ||
    req.destination === 'font' ||
    req.destination === 'image'
  ) {
    e.respondWith(networkFirstForCode(req));
  } else {
    e.respondWith(cacheFirst(req));
  }
});

// ═══ HTML: Network-First ═══
async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.status === 200 && res.type === 'basic') {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch (_) {
    const cached = await caches.match(req);
    if (cached) return cached;
    const index = await caches.match('./index.html');
    if (index) return index;
    return new Response('Offline', { status: 503 });
  }
}

// ═══ CSS/JS: Network-First (مهم للتحديثات) ═══
async function networkFirstForCode(req) {
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.status === 200 && res.type === 'basic') {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch (_) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

// ═══ Fallback: Cache-First ═══
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.status === 200 && res.type === 'basic') {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch (_) {
    return new Response('Offline', { status: 503 });
  }
}

// ═══ رسائل ═══
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'GET_VERSION') {
    e.ports[0]?.postMessage({ version: BUILD_VERSION });
  }
});