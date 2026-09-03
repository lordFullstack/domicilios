/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare let self: ServiceWorkerGlobalScope

// ============================================
// Activación del Service Worker nuevo
// ============================================
// Con `strategies: 'injectManifest'`, Workbox NO agrega esta lógica solo
// (a diferencia de `generateSW`) — hay que escribirla a mano. Sin esto,
// el botón "Actualizar" del UpdatePrompt (que llama a
// updateServiceWorker(true), y este a su vez le manda un postMessage
// SKIP_WAITING al SW en espera) no tenía quién escuchara ese mensaje: el
// SW nuevo se quedaba esperando para siempre y el aviso de actualización
// nunca desaparecía (o volvía a aparecer después de recargar).
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Una vez que el SW nuevo se activa, toma el control de las pestañas ya
// abiertas de inmediato (si no, seguirían controladas por el SW viejo
// hasta que se cerraran y volvieran a abrir).
self.addEventListener('activate', () => {
  self.clients.claim()
})

// ============================================
// Precaché de los assets propios de la app (JS/CSS/HTML del build) —
// generado automáticamente por Vite en cada build.
// ============================================
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ============================================
// Fallback de navegación offline
// ============================================
// Es una SPA: React Router decide qué mostrar según la URL, pero eso
// pasa DESPUÉS de que cargue index.html. Sin esto, recargar la página (o
// abrir un link directo a, por ejemplo, /app/order/xyz) estando sin
// internet mostraba el error nativo del navegador ("No hay conexión"),
// porque esa URL exacta nunca estuvo en el precache. Con esto, cualquier
// navegación cae al shell de la app ya cacheado, y React Router toma el
// control desde ahí normalmente.
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

// ============================================
// Estrategias de caché para todo lo demás (igual que en la Fase A, pero
// ahora escritas a mano porque este SW ya no lo genera Workbox solo)
// ============================================

// Cache First: imágenes de Supabase Storage y fuentes de Google — cambian
// poco, cachearlas es lo que hace que la app sienta instantánea.
registerRoute(
  ({ url }) => url.href.includes('.supabase.co/storage/v1/object/public/'),
  new CacheFirst({
    cacheName: 'supabase-images-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

registerRoute(
  ({ url }) => url.href.includes('fonts.googleapis.com') || url.href.includes('fonts.gstatic.com'),
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// Network Only: datos vivos — nunca servir un precio o estado de pedido
// desactualizado por culpa de la caché.
registerRoute(({ url }) => url.href.includes('.supabase.co/rest/v1/'), new NetworkOnly())
registerRoute(({ url }) => url.href.includes('.supabase.co/auth/v1/'), new NetworkOnly())
registerRoute(({ url }) => url.href.includes('.supabase.co/functions/v1/'), new NetworkOnly())

// Stale While Revalidate: tiles del mapa de seguimiento del domiciliario.
registerRoute(
  ({ url }) => url.href.includes('.tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'map-tiles-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 })],
  })
)

// ============================================
// Push Notifications
// ============================================
// El payload lo arma la Edge Function `send-push` (ver supabase/functions),
// siempre con esta forma: { title, body, url, orderId }

interface PushPayload {
  title: string
  body: string
  url: string
  orderId: string
}

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload: PushPayload
  try {
    payload = event.data.json()
  } catch {
    return
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/brand/rocket-app-icon-192.png',
      badge: '/brand/rocket-app-icon-192.png',
      data: { url: payload.url, orderId: payload.orderId },
      tag: `order-${payload.orderId}`, // reemplaza notificaciones previas del mismo pedido en vez de acumularlas
    })
  )
})

// Al tocar la notificación: si ya hay una pestaña de la app abierta, la
// enfoca y navega ahí (deep link); si no, abre una nueva.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data as { url?: string })?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          if ('navigate' in client) {
            return (client as WindowClient).navigate(targetUrl)
          }
        }
      }
      return self.clients.openWindow(targetUrl)
    })
  )
})
