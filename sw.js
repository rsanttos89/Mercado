const version = 'mercado-v01';

const resources = [
  '/',
  '/index.html',
  '/script.js',
  '/styles.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(version).then(function(cache) {
      return cache.addAll(resources);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== version;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Força o service worker a ser ativado imediatamente após a conclusão da ativação
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const request = event.request;

  // Não armazenar em cache solicitações POST
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    // Tenta buscar na rede primeiro
    fetch(request).then(function(networkResponse) {
      // Se a resposta for válida, atualiza o cache
      if (networkResponse.ok) {
        const clonedResponse = networkResponse.clone();
        caches.open(version).then(function(cache) {
          cache.put(request, clonedResponse);
        });
      }
      return networkResponse;
    }).catch(function() {
      // Se não houver conexão, busca no cache
      return caches.match(request).then(function(cachedResponse) {
        // Se encontrou no cache, retorna
        if (cachedResponse) {
          return cachedResponse;
        }
        // Se não encontrou no cache, retorna a página de fallback
        return caches.match('/404'); // Página offline
      });
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});