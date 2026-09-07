const CACHE_NAME = 'myfeed-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/favicon.ico'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_ASSETS).catch(function(err) {
        console.warn('Pre-caching partial error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first fetch strategy with cache fallback
self.addEventListener('fetch', function(event) {
  const req = event.request;
  // Only handle GET requests and http/https schemes
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  // Bypass API and ads from offline cache
  if (req.url.includes('/api/') || req.url.includes('pagead2') || req.url.includes('monetag')) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(function() {
        return caches.match(req).then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (req.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Network unavailable', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

self.addEventListener('push', function(event) {
  if (event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch(e) {
      data = { title: 'MyFeed.lk Breaking News', body: event.data.text() };
    }
    const options = {
      body: data.body || 'A new breaking story has been published on MyFeed.lk.',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      image: data.image || undefined,
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: data.url || 'myfeed-notification'
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'MyFeed.lk News Alert', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
