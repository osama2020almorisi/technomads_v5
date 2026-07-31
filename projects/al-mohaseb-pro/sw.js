/**
 * المحاسب المالي Pro - Service Worker
 * PWA support with offline caching
 */

const CACHE_NAME = 'almohaseb-pro-v1';
const STATIC_ASSETS = [
  '/index.html',
  '/css/design-system.css',
  '/js/core/storage.js',
  '/js/core/app.js',
  '/js/core/ui.js',
  '/js/utils/helpers.js',
  '/js/modules/dashboard.js',
  '/js/modules/invoices.js',
  '/js/modules/customers.js',
  '/js/modules/products.js',
  '/js/modules/expenses.js',
  '/js/modules/reports.js',
  '/js/modules/settings.js',
  '/js/modules/auth.js',
  '/pages/dashboard.html',
  '/pages/invoices/list.html',
  '/pages/customers/list.html',
  '/pages/products/list.html',
  '/pages/expenses/list.html',
  '/pages/reports/financial.html',
  '/pages/settings/company.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls and external resources
  if (request.url.includes('api.') || 
      request.url.includes('cdnjs.') ||
      request.url.includes('googleapis.') ||
      request.url.includes('gstatic.') ||
      request.url.includes('chart.js') ||
      request.url.includes('qrserver.')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // Fetch from network
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache the response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Return offline fallback for HTML pages
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Background sync for data operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Sync pending operations when back online
  console.log('Background sync triggered');
}