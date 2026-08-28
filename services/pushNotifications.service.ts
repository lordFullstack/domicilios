import { supabase } from '@/shared/utils/supabase'

export type PushNotificationType = 'new_order' | 'assigned' | 'ready' | 'in_delivery' | 'delivered'

// Convierte la VAPID public key (base64url) al formato Uint8Array que pide
// la Push API del navegador.
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export const isPushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

// Activa las notificaciones para el usuario actual: pide permiso (si el
// navegador ya lo negó antes, no vuelve a preguntar — eso lo controla el
// propio navegador) y guarda la suscripción en Supabase.
export const subscribeToPush = async (userId: string): Promise<'granted' | 'denied' | 'unsupported'> => {
  if (!isPushSupported()) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) {
    console.error('Falta VITE_VAPID_PUBLIC_KEY — no se puede suscribir a push')
    return 'unsupported'
  }

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  const json = subscription.toJSON()
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: json.endpoint!,
      p256dh: json.keys!.p256dh,
      auth: json.keys!.auth,
    },
    { onConflict: 'endpoint' }
  )

  if (error) {
    console.error('Error guardando suscripción push:', error)
    return 'unsupported'
  }

  return 'granted'
}

export const unsubscribeFromPush = async () => {
  if (!isPushSupported()) return
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return

  await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
  await subscription.unsubscribe()
}

// Dispara el envío de una notificación a otro usuario (ej: al restaurante
// cuando entra un pedido nuevo, al domiciliario cuando se le asigna uno).
// Se llama "fire and forget" desde useLocalData — si falla, no debe romper
// el flujo de crear/actualizar el pedido en sí.
export const triggerOrderPushNotification = async (
  userId: string,
  type: PushNotificationType,
  orderId: string
) => {
  try {
    await supabase.functions.invoke('send-push', { body: { userId, type, orderId } })
  } catch (e) {
    console.error('Error disparando notificación push:', e)
  }
}
