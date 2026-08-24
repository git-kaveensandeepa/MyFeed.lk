self.addEventListener('push', function(event) {
  if (event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch(e) {
      data = { title: 'MyFeed.lk News', body: event.data.text() };
    }
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      data: { url: data.url || '/' },
      vibrate: [100, 50, 100],
      requireInteraction: true
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'New Article!', options)
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
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
