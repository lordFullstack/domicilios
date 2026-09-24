// Edge Function: send-push (v5 — LOOP_SECURITY_02)
//
// Envía una notificación Web Push a los dispositivos suscritos de UN usuario, a partir de una
// notificación que el sistema YA creó en la tabla `notifications`.
//
// Quién la llama: el trigger `notifications_send_push` de la base de datos (vía pg_net), con
// { "notification_id": "<uuid>" }. Ningún navegador la llama.
//
// Seguridad:
//  - Solo se acepta { notification_id }: el llamante no elige destinatario ni texto. El destinatario
//    es notifications.user_id y el texto es title/body de esa fila. El formato antiguo
//    { userId, type, orderId } se rechaza (400).
//  - Idempotente: `push_sent_at` se marca de forma atómica (update ... where push_sent_at is null);
//    una notificación se envía como máximo una vez aunque se llame varias veces.
//
// Secrets requeridos (Project Settings -> Edge Functions -> Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ej: mailto:tu@correo.com)
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya existen en todo proyecto Supabase.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'
import { buildPayload, parseRequest, type NotificationRow } from './payload.ts'

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

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('Faltan VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY en los secrets de Edge Functions')
      return json(500, { error: 'Push no configurado en el servidor' })
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // Reclama la notificación de forma atómica: solo una llamada gana; las repetidas no envían nada.
    const { data: notification, error: claimError } = await supabase
      .from('notifications')
      .update({ push_sent_at: new Date().toISOString() })
      .eq('id', parsed.notificationId)
      .is('push_sent_at', null)
      .select('id, user_id, title, body, type, order_id')
      .maybeSingle()

    if (claimError) throw claimError
    if (!notification) {
      return json(200, { sent: 0, reason: 'already_sent_or_unknown' })
    }
    const row = notification as NotificationRow

    const [{ data: profile }, { data: subscriptions, error: subsError }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', row.user_id).maybeSingle(),
      supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', row.user_id),
    ])
    if (subsError) throw subsError
    if (!subscriptions || subscriptions.length === 0) {
      return json(200, { sent: 0 })
    }

    const payload = buildPayload(row, profile?.role)

    let sent = 0
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

    return json(200, { sent })
  } catch (err) {
    console.error('Error en send-push:', err)
    return json(500, { error: 'Error interno' })
  }
})
