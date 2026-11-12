const CACHE = 'pickwell-v2-0-4';
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png']);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => (key.startsWith('foodcheck-') || key.startsWith('pickwell-')) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) { const cache = await caches.open(CACHE); await cache.put(request, response.clone()); }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response('Pickwell ist momentan offline. Bitte Internetverbindung prüfen und erneut laden.', {status:503,statusText:'Offline',headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
