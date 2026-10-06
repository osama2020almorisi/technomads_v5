// Service Worker بسيط للتخزين المؤقت
const CACHE_NAME = 'yunes-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/dark.css',
  '/js/main.js',
  '/js/scroll.js',
  '/js/form.js',
  '/js/filter.js',
  '/js/slider.js',
  '/js/reveal.js',
  '/images/logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});