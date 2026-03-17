// AgenticRadio Service Worker
console.log('Service Worker loaded');

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('Failed to parse push data:', e);
    return;
  }

  const title = data.title || 'AgenticRadio';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: 'agenticradio-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window with the app
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // No existing window, open new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Optional: Handle notification dismissal
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
});
