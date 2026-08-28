const VERSION = 'bridge-v7';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = ['/?v=1', '/offline.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/assets/bridge-hero.webp', '/assets/main.js', '/assets/legal.js', '/assets/style.js', '/assets/style.css'];

async function precacheShell() {
  const cache = await caches.open(SHELL);
  const addFresh = async (path) => {
    const response = await fetch(new Request(path, { cache: 'reload' }));
    if (!response.ok) throw new Error(`Could not precache ${path}`);
    await cache.put(path, response);
  };
  await Promise.all(PRECACHE.map(addFresh));
  for (const path of ['/', '/privacy/', '/terms/']) {
    const response = await fetch(new Request(path, { cache: 'reload' }));
    await cache.put(path, response.clone());
    const html = await response.text();
    const resources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((url) => url && url.startsWith('/') && !url.startsWith('/#'));
    await Promise.all([...new Set(resources)].map(addFresh));
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(RUNTIME).then((cache) => cache.put(request, copy));
      return response;
    }).catch(async () => (await caches.match(request, { ignoreVary: true })) || (await caches.match('/', { ignoreVary: true })) || caches.match('/offline.html', { ignoreVary: true })));
    return;
  }

  if (['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(caches.match(request, { ignoreVary: true }).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(RUNTIME).then((cache) => cache.put(request, copy));
      return response;
    })));
  }
});
