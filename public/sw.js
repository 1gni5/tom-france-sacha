self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('audio-pwa-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.tsx',
        '/src/App.tsx',
        '/src/index.css',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});