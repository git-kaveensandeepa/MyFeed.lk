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
