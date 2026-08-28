const VERSION = 'proof-card-v4';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png', '/assets/hero-field-map-768.avif', '/assets/hero-field-map-1280.avif', '/assets/hero-field-map-768.webp', '/assets/hero-field-map-1280.webp', '/privacy/', '/terms/'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(SHELL);
    const builtAssets = new Set();
    for (const path of ['/index.html', '/privacy/', '/terms/']) {
      const response = await fetch(path);
      const html = await response.clone().text();
      for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) builtAssets.add(match[1]);
      await cache.put(path, response);
    }
    if (builtAssets.size) await cache.addAll([...builtAssets]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone(); caches.open(VERSION).then(cache => cache.put(url.pathname, copy)); return response;
    }).catch(async () => (await caches.match(url.pathname, { ignoreVary: true })) || (await caches.match('/', { ignoreVary: true })) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(url.pathname, { ignoreVary: true }).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(VERSION).then(cache => cache.put(url.pathname, response.clone()));
    return response;
  })));
});
