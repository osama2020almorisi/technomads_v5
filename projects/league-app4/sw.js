/* =========================================================
   sw.js — Service Worker (offline-first PWA)
   ========================================================= */
'use strict';

var VERSION = 'league-v1.1.0';
var STATIC_CACHE = VERSION + '-static';
var RUNTIME_CACHE = VERSION + '-runtime';

var PRECACHE = [
  './',
  './index.html',
  './teams.html',
  './team.html',
  './matches.html',
  './match-live.html',
  './standings.html',
  './stats.html',
  './discipline.html',
  './settings.html',
  './admin.html',
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
  './js/core.js',
  './js/engines.js',
  './js/ui.js',
  './js/shared.js',
  './js/app.js',
  './js/pages/home.js',
  './js/pages/teams.js',
  './js/pages/team.js',
  './js/pages/matches.js',
  './js/pages/match-live.js',
  './js/pages/standings.js',
  './js/pages/stats.js',
  './js/pages/discipline.js',
  './js/pages/settings.js',
  './js/pages/admin.js',
  './data/sample-league.json',
  './data/schema.json',
  './fonts/Cairo-400-arabic.woff2',
  './fonts/Cairo-400-latin.woff2',
  './fonts/Cairo-600-arabic.woff2',
  './fonts/Cairo-600-latin.woff2',
  './fonts/Cairo-700-arabic.woff2',
  './fonts/Cairo-700-latin.woff2',
  './fonts/Cairo-800-arabic.woff2',
  './fonts/Cairo-800-latin.woff2',
  './fonts/Cairo-900-arabic.woff2',
  './fonts/Cairo-900-latin.woff2',
  './fonts/JetBrainsMono-500-latin.woff2',
  './fonts/JetBrainsMono-700-latin.woff2',
  './fonts/JetBrainsMono-800-latin.woff2',
  './fonts/Tajawal-400-arabic.woff2',
  './fonts/Tajawal-400-latin.woff2',
  './fonts/Tajawal-500-arabic.woff2',
  './fonts/Tajawal-500-latin.woff2',
  './fonts/Tajawal-700-arabic.woff2',
  './fonts/Tajawal-700-latin.woff2',
  './fonts/Tajawal-800-arabic.woff2',
  './fonts/Tajawal-800-latin.woff2',
  './fonts/fonts.css',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () { return null; });
      }));
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf(VERSION) !== 0; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function networkFirst(request) {
  return fetch(request).then(function (response) {
    if (response && response.ok) {
      var copy = response.clone();
      caches.open(RUNTIME_CACHE).then(function (c) { c.put(request, copy); });
    }
    return response;
  }).catch(function () {
    return caches.match(request, { ignoreSearch: true }).then(function (cached) {
      return cached || caches.match('./index.html');
    });
  });
}

function staleWhileRevalidate(request) {
  return caches.match(request, { ignoreSearch: true }).then(function (cached) {
    var network = fetch(request).then(function (response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(RUNTIME_CACHE).then(function (c) { c.put(request, copy); });
      }
      return response;
    }).catch(function () { return cached; });
    return cached || network;
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirst(req));
    return;
  }
  if (url.pathname.indexOf('/data/') !== -1) {
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(staleWhileRevalidate(req));
});
