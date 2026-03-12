self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('app-shell').then(cache =>
            cache.addAll(['/', '/index.html', 'manifest.json', '/assets'])
        )
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(r => r || fetch(event.request))
    );
});
