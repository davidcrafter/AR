/* ============================================================
   AR Drawing Pro — Service Worker
   Full-app offline caching. Bump CACHE_VERSION to force refresh.
   ============================================================ */

const CACHE_VERSION = 'ar-drawing-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './samples.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './apple-touch-icon-167.png',
  './apple-touch-icon-152.png',
  './apple-touch-icon-120.png',
  './favicon-32.png',
  './favicon-16.png',
];

// ---------- Install: pre-cache the whole app ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // Use { cache: 'reload' } so we bypass any stale HTTP cache
      cache.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))
    ).then(() => self.skipWaiting())
  );
});

// ---------- Activate: purge old caches ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ---------- Fetch: cache-first, fall back to network ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GETs on same-origin
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Refresh cache in the background (stale-while-revalidate)
        fetch(req).then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE_VERSION).then((c) => c.put(req, res.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// Allow the page to trigger an immediate update
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
