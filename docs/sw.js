/* Avalon - service worker : toujours la version en ligne d'abord (les mises à jour du dimanche apparaissent tout de suite),
   la copie gardée en mémoire ne sert que sans connexion. */
const CACHE = 'avalon-v10';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
    const r = e.request;
    if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => { const c = res.clone(); if (res.ok) caches.open(CACHE).then(x => x.put(r, c)); return res; })
        .catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
