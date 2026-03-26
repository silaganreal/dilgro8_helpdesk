// public/sw.js

self.addEventListener('push', function(event) {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: '/dilg-logo.png',
        badge: '/dilg-logo.png', // optional small icon
        data: { url: data.url || '/' } // can navigate user on click
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Optional: handle click
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const url = event.notification.data.url;
    event.waitUntil(clients.openWindow(url));
});
