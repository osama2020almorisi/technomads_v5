// Service Worker - Fixed v3
const CACHE_NAME = 'yunes-v3';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './css/responsive.css',
  './css/dark.css',
  './js/main.js',
  './js/scroll.js',
  './js/form.js',
  './js/filter.js',
  './js/slider.js',
  './js/reveal.js',
  './js/dv-popup.js',
  './images/logo.svg'
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
        names.map(n => {
          if (n !== CACHE_NAME) {
            console.log('Deleting old cache:', n);
            return caches.delete(n);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // للـ HTML و CSS و JS: جيب من الشبكة أولاً
  if (event.request.destination === 'document' || 
      event.request.destination === 'style' || 
      event.request.destination === 'script') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  // للباقي: الكاش أولاً
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});