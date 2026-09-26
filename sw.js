const CACHE_NAME = 'mrcc-v11.5.0';
const CORE_ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/brand-mark.svg', '/premium-products.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('mrcc-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        const response = preload || await fetch(request);
        if (response && response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put('/index.html', copy)));
        }
        return response;
      } catch (error) {
        return (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    const networkPromise = fetch(request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
      }
      return response;
    }).catch(() => null);

    if (cached) {
      event.waitUntil(networkPromise);
      return cached;
    }

    return (await networkPromise) || Response.error();
  })());
});
