'use strict';
const CACHE_NAME = 'league-manager-v2.1.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  './css/main.css',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/screens.css',
  './css/animations.css',
  './css/glass.css',
  './css/dark.css',
  './css/mobile.css',
  './css/polish.css',
  './js/core.js',
  './js/engines.js',
  './js/ui.js',
  './js/pages.js',
  './js/admin.js',
  './js/app.js',
  './data/sample-league.json',
  './data/schema.json'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async path => {
      try { await cache.add(path); } catch (error) { console.warn('[SW] Skip unavailable asset:', path); }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('league-manager-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        return (await caches.match('./index.html')) || new Response('أنت غير متصل بالإنترنت.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
      return new Response('غير متصل — تعذر تحميل هذا المورد.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
