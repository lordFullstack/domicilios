-- ROLLBACK de server_push: quita los dos triggers y sus funciones y la columna push_sent_at.
-- (La extensión pg_net se deja instalada: es inocua y otras cosas podrían usarla.)
-- Después hay que volver a desplegar la función send-push v4 y el frontend anterior, que
-- llamaban a la función desde el navegador.
drop trigger if exists notifications_send_push on public.notifications;
drop trigger if exists notifications_guard_update on public.notifications;
drop function if exists private.send_push_for_notification();
drop function if exists private.guard_notification_update();
alter table public.notifications drop column if exists push_sent_at;
