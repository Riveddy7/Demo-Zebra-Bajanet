const CACHE_NAME = 'iamet-rfid-v1';
const urlsToCache = [
  '/',
  '/validation',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch - estrategia Network First para datos en tiempo real
self.addEventListener('fetch', (event) => {
  // Para las APIs, siempre intentar la red primero
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si la respuesta es exitosa, actualizar la caché
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Si la red falla, intentar obtener de la caché
          return caches.match(event.request);
        })
    );
  } else {
    // Para recursos estáticos, usar Cache First
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Si está en caché, devolverlo
          if (response) {
            return response;
          }
          // Si no, obtener de la red
          return fetch(event.request);
        }
      )
    );
  }
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});