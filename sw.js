/* Offline support for KosherTube Kids.
 * - Precaches the app shell so the whole interface opens with no internet.
 * - Caches YouTube thumbnail images at runtime (cache-first) so the home
 *   screen still shows pictures offline. Videos themselves are YouTube
 *   streams and still need internet; offline playback is for parent-added
 *   local files, which live in IndexedDB and never hit the network.
 * scripts/gen-sw.mjs fills PRECACHE and VERSION at build time. */
const VERSION = "1795520535568";
const SHELL = `ktk-shell-${VERSION}`;
const IMAGES = 'ktk-img-v1';
const PRECACHE = ["./","./assets/index-BSoknSis.js","./assets/index-CebjVRih.css","./icon.svg","./index.html","./manifest.webmanifest","./sw.js"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ktk-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // YouTube thumbnails: cache-first so show cards keep their pictures offline.
  if (url.hostname.endsWith('ytimg.com')) {
    e.respondWith(
      caches.open(IMAGES).then(async (cache) => {
        const hit = await cache.match(e.request);
        if (hit) return hit;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          return Response.error();
        }
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Page loads: network-first so updates arrive, cached shell when offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || Response.error())),
    );
    return;
  }

  // Static assets: cache-first, fill from network.
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put(e.request, copy));
          }
          return res;
        }),
    ),
  );
});
