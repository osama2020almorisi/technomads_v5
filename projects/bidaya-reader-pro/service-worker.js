/* عامل الخدمة — استراتيجيات: HTML/CSS/JS network-first، خطوط/صور cache-first */
const VERSION = "bidaya-v1.0.0";
const STATIC_CACHE = VERSION + "-static";
const CORE = [
  "./", "./index.html", "./library.html", "./import.html", "./reader.html",
  "./editor.html", "./search.html", "./bookmarks.html", "./history.html",
  "./export.html", "./settings.html", "./about.html",
  "./manifest.json",
  "./css/reset.css", "./css/main.css", "./css/reader.css", "./css/editor.css",
  "./css/mobile.css", "./css/print.css",
  "./js/db.js", "./js/store.js", "./js/ui.js", "./js/app.js", "./js/pwa.js",
  "./js/library.js", "./js/importer.js", "./js/reader.js", "./js/editor.js",
  "./js/search.js", "./js/bookmarks.js", "./js/history.js", "./js/settings.js",
  "./js/json-parser.js", "./js/txt-parser.js", "./js/html-parser.js",
  "./js/docx-parser.js", "./js/epub-parser.js",
  "./js/exporter/json-export.js", "./js/exporter/epub-export.js",
  "./js/exporter/html-export.js", "./js/exporter/txt-export.js",
  "./js/exporter/pdf-export.js", "./js/exporter/docx-export.js",
  "./icons/icon-192.png", "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // CDN يمر مباشرة مع تخزين احتياطي

  const isHTML = req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  const isStatic = /\.(css|js)$/.test(url.pathname);
  const isAsset = /\.(png|jpg|jpeg|svg|woff2?|ttf|otf|webp)$/.test(url.pathname);

  if (isAsset) {
    // cache-first للخطوط والصور
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const clone = res.clone(); caches.open(STATIC_CACHE).then((c) => c.put(req, clone)); }
        return res;
      }).catch(() => hit))
    );
  } else if (isHTML || isStatic) {
    // network-first مع رجوع للكاش
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const clone = res.clone(); caches.open(STATIC_CACHE).then((c) => c.put(req, clone)); }
        return res;
      }).catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (req.mode === "navigate") return caches.match("./index.html");
        return new Response("", { status: 504 });
      })
    );
  }
});

// إشعار التحديث عند تغيّر الإصدار
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});