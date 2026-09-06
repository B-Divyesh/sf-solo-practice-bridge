const VERSION = new URL(self.location.href).searchParams.has('test-update') ? 'bridge-v9-test' : 'bridge-v9';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PAGES = ['/', '/demo/', '/privacy/', '/terms/', '/404.html'];
const STATIC_FILES = ['/offline.html', '/manifest.json', '/favicon.svg', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/assets/bridge-hero.webp', '/assets/bridge-social.jpg'];

async function addFresh(cache, path) {
  const response = await fetch(new Request(path, { cache: 'reload' }));
  if (!response.ok) throw new Error(`Could not precache ${path}`);
  await cache.put(path, response);
}

async function precacheShell() {
  const cache = await caches.open(SHELL);
  await Promise.all(STATIC_FILES.map((path) => addFresh(cache, path)));
  await Promise.all(PAGES.map(async (path) => {
    const response = await fetch(new Request(path, { cache: 'reload' }));
    if (!response.ok) throw new Error(`Could not precache ${path}`);
    await cache.put(path, response.clone());
    const html = await response.text();
    const resources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((url) => url.startsWith('/') && !url.startsWith('/#') && !url.endsWith('/manifest.json'));
    await Promise.all([...new Set(resources)].map((path) => addFresh(cache, path)));
  }));
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
    }).catch(async () => {
      if (url.pathname === '/demo') return (await caches.match('/demo/', { ignoreVary: true })) || caches.match('/offline.html', { ignoreVary: true });
      return (await caches.match(request, { ignoreVary: true })) || (await caches.match('/', { ignoreVary: true })) || caches.match('/offline.html', { ignoreVary: true });
    }));
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
