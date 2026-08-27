// Service Worker para Notificaciones Push Flotantes de OmniTag
self.addEventListener('push', function(event) {
  let data = {
    title: 'OmniTag Notificación',
    body: 'Tienes nueva actividad en tu panel.',
    icon: '/icon-192x192.png',
    url: '/dashboard'
  }

  try {
    if (event.data) {
      const payload = event.data.json()
      data = { ...data, ...payload }
    }
  } catch (err) {
    console.error('Error parseando payload de notificacion push:', err)
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      { action: 'open', title: 'Abrir OmniTag' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
