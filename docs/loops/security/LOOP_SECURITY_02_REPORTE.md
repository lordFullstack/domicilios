# LOOP_SECURITY_02 — Reporte (cerrado 25-sep-2026)

**Estado:** ✅ En producción. Verificado en el servidor: 15 de 15 notificaciones enviadas con respuesta HTTP 200.

## Problema
La función Edge `send-push` no controlaba quién la llamaba: cualquier persona con sesión podía enviar un push con texto y destinatario elegidos por ella. Además, el aviso lo disparaba el navegador de quien actuaba (si cerraba la app, no había aviso).

## IMPLEMENTADO
- **Migración `20260924000600_server_push`:** extensión `pg_net`; `notifications.push_sent_at` (una notificación se envía como máximo una vez; las 206 existentes se marcaron como enviadas); `guard_notification_update` (con sesión solo se puede cambiar `read`); trigger `AFTER INSERT` sobre `notifications` que llama a `send-push` con `{notification_id}` de forma asíncrona y **nunca rompe** la creación de la notificación.
- **Edge Function `send-push` v5:** `verify_jwt` con la clave pública (opción A, sin secreto compartido); solo acepta `{notification_id}` (el formato antiguo devuelve 400); reclama la fila con un `UPDATE … WHERE push_sent_at IS NULL` (idempotente); título y cuerpo salen de la fila, el destino de la ruta según el rol del destinatario.
- **Frontend:** `pushNotifications.service` solo suscribe/desuscribe; se eliminaron las llamadas a `send-push` del navegador.
- **Tests:** `payload.test.ts` (Edge Function) y `supabase/tests/server_push.test.sql`.

## Después del QA en teléfonos (25-sep)
- `sw.ts`: `renotify` y vibración; sin `renotify`, un aviso que reemplaza a otro con el mismo `tag` llega en silencio en Android.
- El sonido de la notificación push lo decide el sistema (interruptor de silencio, No molestar, permisos del canal); no depende del código.

## DEUDA
El push por vencimiento al cliente dice "cancelado" a secas; el motivo lo explica la pantalla.
