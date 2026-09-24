-- LOOP_SECURITY_02 — Push desde el servidor
--
-- Los avisos push dejan de dispararse desde el navegador: los dispara la base de datos cada vez que
-- se crea una notificación (handle_order_notification ya crea una por pedido nuevo, cambio de
-- estado y asignación). La función Edge send-push v5 solo acepta { notification_id } y envía el
-- push al destinatario y con el texto de ESA fila: nadie puede elegir a quién ni qué se envía.
--
-- Cambios:
--   1. Extensión pg_net (peticiones HTTP asíncronas desde la base).
--   2. notifications.push_sent_at (idempotencia: una notificación se envía como máximo una vez).
--      Las 206 notificaciones existentes se marcan como ya enviadas (no se reenvía nada antiguo).
--   3. Trigger BEFORE UPDATE en notifications: un usuario con sesión solo puede cambiar "read"
--      (hoy puede editar título, cuerpo, destinatario...). El sistema (sin usuario) no tiene límite.
--   4. Trigger AFTER INSERT en notifications: llama a send-push con { notification_id }.
--      Es asíncrono y NUNCA rompe la creación de la notificación (ni la acción del pedido):
--      cualquier fallo se ignora (la notificación dentro de la app ya existe).
--
-- Autenticación (opción A, aprobada): la función mantiene verify_jwt y se llama con la clave
-- pública (anon) del proyecto, la misma que ya viaja en la app. La seguridad no depende de un
-- secreto: la función solo puede enviar, una vez, una notificación que el sistema ya creó.
--
-- Orden de despliegue: (1) esta migración, (2) función send-push v5, (3) frontend sin llamadas
-- directas. Entre (1) y (2) el trigger recibe un 400 de la función vieja: inofensivo.
-- Reversible: ver el .rollback.sql

create extension if not exists pg_net;

alter table public.notifications add column if not exists push_sent_at timestamptz;

-- Lo anterior a esta migración ya se avisó (o no debe reenviarse): se marca como enviado.
update public.notifications set push_sent_at = created_at where push_sent_at is null;

create or replace function private.guard_notification_update()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_changed text[];
begin
  if v_uid is null then
    return new;
  end if;

  select coalesce(array_agg(n.key), '{}')
    into v_changed
    from jsonb_each(to_jsonb(new)) n
    join jsonb_each(to_jsonb(old)) o using (key)
   where n.value is distinct from o.value;

  if v_changed <@ array['read'] then
    return new;
  end if;

  raise exception 'notification_update_not_allowed'
    using errcode = '42501',
          detail = format('Cambio no permitido en columnas: %s', array_to_string(v_changed, ', '));
end;
$function$;

drop trigger if exists notifications_guard_update on public.notifications;
create trigger notifications_guard_update
  before update on public.notifications
  for each row execute function private.guard_notification_update();

create or replace function private.send_push_for_notification()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  perform net.http_post(
    url := 'https://eisgjtabunwnnsfyrwcx.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2dqdGFidW53bm5zZnlyd2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NjA1MTgsImV4cCI6MjEwMjEzNjUxOH0.P5IUtLLKzScQp9dHcF4TPQNgJmuQBjyo-Ir_vERbiuM'
    ),
    body := jsonb_build_object('notification_id', new.id)
  );
  return new;
exception when others then
  -- El aviso push es un extra: jamás debe impedir que se cree la notificación ni la acción del pedido.
  return new;
end;
$function$;

revoke all on function private.guard_notification_update() from public, anon, authenticated;
revoke all on function private.send_push_for_notification() from public, anon, authenticated;

drop trigger if exists notifications_send_push on public.notifications;
create trigger notifications_send_push
  after insert on public.notifications
  for each row execute function private.send_push_for_notification();
