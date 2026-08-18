const cacheName = 'jey-diary-v2';
const appShell = [
  '/manifest.webmanifest',
  '/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(appShell)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== cacheName).map((name) => caches.delete(name))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }

  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(loadFromNetworkFirst(event.request));
});

async function loadFromNetworkFirst(request) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && !contentType.includes('text/html')) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    throw new Error('Network request failed and no cached response is available.');
  }
}
