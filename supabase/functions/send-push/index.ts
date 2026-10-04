// Edge Function: send-push (v8 — Web Push + FCM nativo + Domi)
//
// Envía una notificación a los dispositivos de UN usuario, a partir de una notificación que el
// sistema YA creó en la tabla `notifications`:
//   - navegadores suscritos (Web Push, como antes)  -> push_subscriptions
//   - apps Android nativas (FCM)                    -> device_tokens
//
// Quién la llama: el trigger `notifications_send_push` (vía pg_net), con { "notification_id": "<uuid>" }.
//
// Seguridad (sin cambios respecto a v5):
//  - Solo se acepta { notification_id }: el llamante no elige destinatario ni texto.
//  - Idempotente: `push_sent_at` se marca de forma atómica; una notificación se envía como máximo una vez.
//
// v8: las notificaciones de Domi (mandados) traen `errand_id` en vez de `order_id`; el push lo
// incluye para abrir la pantalla correcta (web: ruta `url`; Android: dato `errandId`).
//
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (Web Push) y FCM_SERVICE_ACCOUNT (FCM).
// Si falta FCM_SERVICE_ACCOUNT solo se omite el envío nativo; el Web Push sigue funcionando.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'
import { buildPayload, parseRequest, type NotificationRow } from './payload.ts'
import { loadServiceAccount, sendFcm } from './fcm.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Método no permitido' })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json(400, { error: 'JSON inválido' })
  }

  const parsed = parseRequest(raw)
  if (!parsed.ok) {
    return json(400, { error: parsed.error })
  }

  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:soporte@pacomerexpress.com'
    const webPushReady = Boolean(vapidPublicKey && vapidPrivateKey)
    if (webPushReady) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey!, vapidPrivateKey!)
    } else {
      console.error('Faltan VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY: se omite el Web Push')
    }
    const fcmAccount = loadServiceAccount()

    if (!webPushReady && !fcmAccount) {
      return json(500, { error: 'Push no configurado en el servidor' })
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // Reclama la notificación de forma atómica: solo una llamada gana; las repetidas no envían nada.
    const { data: notification, error: claimError } = await supabase
      .from('notifications')
      .update({ push_sent_at: new Date().toISOString() })
      .eq('id', parsed.notificationId)
      .is('push_sent_at', null)
      .select('id, user_id, title, body, type, order_id, errand_id')
      .maybeSingle()

    if (claimError) throw claimError
    if (!notification) {
      return json(200, { sent: 0, reason: 'already_sent_or_unknown' })
    }
    const row = notification as NotificationRow

    const [{ data: profile }, { data: subscriptions, error: subsError }, { data: devices, error: devicesError }] =
      await Promise.all([
        supabase.from('profiles').select('role').eq('id', row.user_id).maybeSingle(),
        supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', row.user_id),
        supabase.from('device_tokens').select('token').eq('user_id', row.user_id),
      ])
    if (subsError) throw subsError
    if (devicesError) throw devicesError

    let sent = 0

    // --- Web Push (igual que v5) ---
    if (webPushReady && subscriptions && subscriptions.length > 0) {
      const payload = buildPayload(row, profile?.role)
      await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
            sent++
          } catch (err) {
            const statusCode = (err as { statusCode?: number })?.statusCode
            if (statusCode === 404 || statusCode === 410) {
              await supabase.from('push_subscriptions').delete().eq('id', sub.id)
            } else {
              console.error('Error enviando push a', sub.endpoint, err)
            }
          }
        })
      )
    }

    // --- FCM nativo ---
    if (fcmAccount && devices && devices.length > 0) {
      const data: Record<string, string> = { title: row.title, body: row.body, type: row.type }
      if (row.order_id) data.orderId = row.order_id
      if (row.errand_id) data.errandId = row.errand_id

      await Promise.all(
        devices.map(async ({ token }) => {
          try {
            const result = await sendFcm(fcmAccount, token, data)
            if (result === 'sent') sent++
            if (result === 'invalid_token') {
              await supabase.from('device_tokens').delete().eq('token', token)
            }
          } catch (err) {
            console.error('Error enviando FCM', err)
          }
        })
      )
    }

    return json(200, { sent })
  } catch (err) {
    console.error('Error en send-push:', err)
    return json(500, { error: 'Error interno' })
  }
})
