-- PRUEBA de server_push (LOOP_SECURITY_02) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base (ni la extensión, ni las columnas,
-- ni los triggers, ni las peticiones encoladas). Requiere S0 y S1.3. Aplica la migración dentro
-- de la transacción.
--
-- Qué demuestra:
--   1) pg_net, push_sent_at y los dos triggers existen; las notificaciones existentes quedan como enviadas.
--   2) Insertar una notificación ENCOLA una petición a send-push con solo { notification_id }.
--   3) Un usuario no puede crear notificaciones (ni para sí ni para otro).
--   4) Un usuario solo puede cambiar "read" en las suyas; no título, cuerpo, destinatario ni push_sent_at.
--   5) Un usuario no puede tocar las notificaciones de otro.
--   6) El sistema (sin usuario) sí puede actualizar push_sent_at.
--   7) Las acciones reales de pedido (crear, avanzar por RPC) generan notificaciones que encolan su push.
--   8) Un fallo al encolar NUNCA rompe la creación de la notificación.
do $test$
declare
  v_c uuid; v_rid uuid; v_o1 uuid; v_o uuid; v_nid uuid; v_other uuid; v_n int; v_q0 int; v_q1 int; v_log text := '';
  v_sin_enviar int; v_total int;
begin
  select count(*), count(*) filter (where true) into v_total, v_n from public.notifications;

  -- ===== migración (idéntica al archivo) =====
  create extension if not exists pg_net;
  alter table public.notifications add column if not exists push_sent_at timestamptz;
  update public.notifications set push_sent_at = created_at where push_sent_at is null;

  create or replace function private.guard_notification_update()
   returns trigger language plpgsql security definer set search_path to ''
  as $function$
  declare
    v_uid uuid := (select auth.uid());
    v_changed text[];
  begin
    if v_uid is null then return new; end if;
    select coalesce(array_agg(n.key), '{}') into v_changed
      from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o using (key)
     where n.value is distinct from o.value;
    if v_changed <@ array['read'] then return new; end if;
    raise exception 'notification_update_not_allowed' using errcode = '42501',
      detail = format('Cambio no permitido en columnas: %s', array_to_string(v_changed, ', '));
  end;
  $function$;
  drop trigger if exists notifications_guard_update on public.notifications;
  create trigger notifications_guard_update before update on public.notifications
    for each row execute function private.guard_notification_update();

  create or replace function private.send_push_for_notification()
   returns trigger language plpgsql security definer set search_path to ''
  as $function$
  begin
    perform net.http_post(
      url := 'https://eisgjtabunwnnsfyrwcx.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object('Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2dqdGFidW53bm5zZnlyd2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NjA1MTgsImV4cCI6MjEwMjEzNjUxOH0.P5IUtLLKzScQp9dHcF4TPQNgJmuQBjyo-Ir_vERbiuM'),
      body := jsonb_build_object('notification_id', new.id));
    return new;
  exception when others then
    return new;
  end;
  $function$;
  revoke all on function private.guard_notification_update() from public, anon, authenticated;
  revoke all on function private.send_push_for_notification() from public, anon, authenticated;
  drop trigger if exists notifications_send_push on public.notifications;
  create trigger notifications_send_push after insert on public.notifications
    for each row execute function private.send_push_for_notification();
  -- ===== fin migración =====

  create function pg_temp.call(p_uid uuid, p_sql text) returns text language plpgsql as $f$
  declare v_res text; v_n int;
  begin
    perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', p_uid::text, true);
    set local role authenticated;
    begin
      execute p_sql;
      get diagnostics v_n = row_count;
      v_res := case when v_n = 0 then 'SIN FILAS' else 'OK' end;
    exception when others then v_res := sqlerrm; end;
    reset role;
    perform set_config('request.jwt.claims', '', true);
    perform set_config('request.jwt.claim.sub', '', true);
    return v_res;
  end $f$;
  create function pg_temp.chk(p_label text, p_expected text, p_actual text) returns text language sql as $f$
    select E'\n' || p_label || ': ' || p_actual || case when p_actual like p_expected then ' OK' else '  <-- FALLO (esperado ' || p_expected || ')' end
  $f$;

  select id into v_c from public.profiles where role = 'client' order by id limit 1;
  select id into v_other from public.profiles where role = 'client' and id <> v_c order by id limit 1;
  select id, owner_id into v_rid, v_o1 from public.restaurants where owner_id is not null order by id limit 1;

  -- 1) estructura
  select count(*) filter (where push_sent_at is null) into v_sin_enviar from public.notifications;
  v_log := v_log || pg_temp.chk('1a notificaciones existentes sin marcar como enviadas', '0', v_sin_enviar::text);
  v_log := v_log || pg_temp.chk('1b pg_net instalada', '1', (select count(*)::text from pg_extension where extname = 'pg_net'));
  v_log := v_log || pg_temp.chk('1c triggers de notifications', '2', (select count(*)::text from pg_trigger where tgrelid = 'public.notifications'::regclass and tgname in ('notifications_guard_update', 'notifications_send_push')));

  -- 2) insertar encola una petición con solo notification_id
  select count(*) into v_q0 from net.http_request_queue;
  insert into public.notifications (user_id, title, body, type) values (v_c, 'Prueba', 'Cuerpo de prueba', 'order') returning id into v_nid;
  select count(*) into v_q1 from net.http_request_queue;
  v_log := v_log || pg_temp.chk('2a insertar una notificación encola 1 petición', '1', (v_q1 - v_q0)::text);
  v_log := v_log || pg_temp.chk('2b la petición apunta a send-push', '%/functions/v1/send-push', (select url from net.http_request_queue order by id desc limit 1));
  v_log := v_log || pg_temp.chk('2c el cuerpo trae SOLO notification_id', 'true', (select (convert_from(body, 'utf8')::jsonb = jsonb_build_object('notification_id', v_nid))::text from net.http_request_queue order by id desc limit 1));
  v_log := v_log || pg_temp.chk('2d la notificación nueva nace sin enviar', 'true', (select (push_sent_at is null)::text from public.notifications where id = v_nid));

  -- 3) un usuario no crea notificaciones
  v_log := v_log || pg_temp.chk('3a usuario crea una notificación para sí', 'new row violates%', pg_temp.call(v_c, format('insert into public.notifications (user_id, title, body, type) values (%L, %L, %L, %L)', v_c, 'x', 'y', 'order')));
  v_log := v_log || pg_temp.chk('3b usuario crea una notificación para otro', 'new row violates%', pg_temp.call(v_c, format('insert into public.notifications (user_id, title, body, type) values (%L, %L, %L, %L)', v_other, 'x', 'y', 'order')));

  -- 4) columnas editables (el sistema ya la marcó como enviada: un usuario no puede volver a dejarla pendiente)
  update public.notifications set push_sent_at = now() where id = v_nid;
  v_log := v_log || pg_temp.chk('4a usuario marca read en la suya', 'OK', pg_temp.call(v_c, format('update public.notifications set read = true where id = %L', v_nid)));
  v_log := v_log || pg_temp.chk('4b usuario cambia el título', 'notification_update_not_allowed', pg_temp.call(v_c, format('update public.notifications set title = %L where id = %L', 'Hackeado', v_nid)));
  v_log := v_log || pg_temp.chk('4c usuario cambia el destinatario', 'notification_update_not_allowed', pg_temp.call(v_c, format('update public.notifications set user_id = %L where id = %L', v_other, v_nid)));
  v_log := v_log || pg_temp.chk('4d usuario resetea push_sent_at', 'notification_update_not_allowed', pg_temp.call(v_c, format('update public.notifications set push_sent_at = null where id = %L', v_nid)));
  v_log := v_log || pg_temp.chk('4e usuario marca read Y cambia el cuerpo', 'notification_update_not_allowed', pg_temp.call(v_c, format('update public.notifications set read = false, body = %L where id = %L', 'x', v_nid)));

  -- 5) notificaciones ajenas
  v_log := v_log || pg_temp.chk('5 otro usuario marca read en la mía', 'SIN FILAS', pg_temp.call(v_other, format('update public.notifications set read = true where id = %L', v_nid)));

  -- 6) el sistema sí
  update public.notifications set push_sent_at = now() where id = v_nid;
  v_log := v_log || pg_temp.chk('6 el sistema marca push_sent_at', 'false', (select (push_sent_at is null)::text from public.notifications where id = v_nid));

  -- 7) acciones reales de pedido -> notificaciones -> peticiones
  select count(*) into v_q0 from net.http_request_queue;
  insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method, status)
    values (v_c, v_rid, 10000, 'Direccion prueba 123', 'cash_on_delivery', 'pending') returning id into v_o;
  select count(*) into v_q1 from net.http_request_queue;
  v_log := v_log || pg_temp.chk('7a pedido nuevo: notificación al restaurante encola 1 petición', '1', (v_q1 - v_q0)::text);
  v_q0 := v_q1;
  v_log := v_log || pg_temp.chk('7b restaurant_advance_order', 'OK', pg_temp.call(v_o1, format('select public.restaurant_advance_order(%L)', v_o)));
  select count(*) into v_q1 from net.http_request_queue;
  v_log := v_log || pg_temp.chk('7c el cambio de estado notifica al cliente y encola 1 petición', '1', (v_q1 - v_q0)::text);

  -- 8) un fallo al encolar no rompe la notificación: se redefine NUESTRA función apuntando a una
  --    función inexistente (falla en ejecución) y se comprueba que el manejador de errores la contiene.
  execute replace(pg_get_functiondef('private.send_push_for_notification()'::regprocedure), 'net.http_post(', 'net.funcion_que_no_existe(');
  begin
    insert into public.notifications (user_id, title, body, type) values (v_c, 'Con fallo', 'Cuerpo', 'order');
    v_log := v_log || E'
8 con el envío fallando, la notificación igual se crea: OK';
  exception when others then
    v_log := v_log || E'
8 con el envío fallando: la creación se rompió (' || sqlerrm || ')  <-- FALLO';
  end;

  raise exception E'RESULTADO_PRUEBA_SERVER_PUSH (rollback total)\n%', v_log;
end $test$;
