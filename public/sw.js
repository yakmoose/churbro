self.addEventListener('push', function(event) {
  console.log('Received a push message', event);
  if (event.data) {
    self.registration.showNotification("Chur Bro!", event.data.json());
  }
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();

  e.waitUntil(
      clients.matchAll({ type: "window" }).then((clientsArr) => {
        const hadWindowToFocus = clientsArr.some((windowClient) =>
            windowClient.url === e.notification.data.url ? (windowClient.focus(), true) : false
        );

        if (!hadWindowToFocus)
          clients
          .openWindow(e.notification.data.url)
          .then((windowClient) => (windowClient ? windowClient.focus() : null));
      })
  );
});
