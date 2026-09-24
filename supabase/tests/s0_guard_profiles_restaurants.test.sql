-- PRUEBA de S0 (LOOP_SECURITY_00) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base (ni la migración).
-- Se corre ANTES de aplicar S0 (aplica S0 dentro de la transacción) y también DESPUÉS
-- (create or replace / drop trigger if exists lo hacen idempotente).
--
-- Qué demuestra:
--   1) Un cliente NO puede cambiar su role (ni active, email, rating_*) -> 42501.
--   2) Un cliente SÍ puede cambiar name y phone.
--   3) Un dueño NO puede cambiar approved (levantar una suspensión), owner_id ni rating_* -> 42501.
--   4) Un dueño SÍ puede cambiar name, status y cover_url.
--   5) Un dueño NO puede insertar un restaurante con ratings inventados; uno normal sí.
--   6) El admin SÍ puede cambiar el rol de otro usuario y approved.
--   7) Sin usuario (service_role / SQL) no hay restricción.
--   8) Insertar una calificación (update_ratings_after_insert, actualiza ratings) sigue funcionando.
--   9) Al final todo revertido (conteos e identidad de roles iguales).
do $test$
declare
  v_client uuid; v_owner uuid; v_rid uuid; v_admin uuid; v_other uuid;
  v_before_roles text; v_after_roles text; v_log text := '';
  v_role text; v_n int; v_oid uuid; v_uid_order uuid; v_rest_of_order uuid;
begin
  select string_agg(id::text || ':' || role, ',' order by id) into v_before_roles from public.profiles;

  -- ===== S0 (idéntico al archivo de migración) =====
  create or replace function private.guard_profile_update()
   returns trigger language plpgsql security definer set search_path to ''
  as $function$
  declare
    v_uid uuid := (select auth.uid());
    v_changed text[];
  begin
    if v_uid is null or pg_trigger_depth() > 1 then return new; end if;
    if (select private.is_admin()) then return new; end if;
    select coalesce(array_agg(n.key), '{}') into v_changed
      from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o using (key)
     where n.value is distinct from o.value and n.key <> 'updated_at';
    if v_changed <@ array['name', 'phone', 'avatar_url', 'vehicle_type', 'vehicle_plate'] then return new; end if;
    raise exception 'profile_update_not_allowed' using errcode = '42501',
      detail = format('Cambio no permitido en columnas: %s', array_to_string(v_changed, ', '));
  end;
  $function$;

  create or replace function private.guard_restaurant_write()
   returns trigger language plpgsql security definer set search_path to ''
  as $function$
  declare
    v_uid uuid := (select auth.uid());
    v_changed text[];
  begin
    if v_uid is null or pg_trigger_depth() > 1 then return new; end if;
    if (select private.is_admin()) then return new; end if;
    if tg_op = 'INSERT' then
      if new.rating_avg <> 0 or new.rating_count <> 0 then
        raise exception 'restaurant_write_not_allowed' using errcode = '42501',
          detail = 'rating_avg y rating_count solo los actualiza el sistema';
      end if;
      return new;
    end if;
    select coalesce(array_agg(n.key), '{}') into v_changed
      from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o using (key)
     where n.value is distinct from o.value and n.key <> 'updated_at';
    if v_changed <@ array['name', 'description', 'image_url', 'address', 'phone', 'status', 'cover_url', 'category'] then return new; end if;
    raise exception 'restaurant_write_not_allowed' using errcode = '42501',
      detail = format('Cambio no permitido en columnas: %s', array_to_string(v_changed, ', '));
  end;
  $function$;

  drop trigger if exists profiles_guard_update on public.profiles;
  create trigger profiles_guard_update before update on public.profiles
    for each row execute function private.guard_profile_update();
  drop trigger if exists restaurants_guard_write on public.restaurants;
  create trigger restaurants_guard_write before insert or update on public.restaurants
    for each row execute function private.guard_restaurant_write();
  -- ===== fin S0 =====

  select id into v_admin from public.profiles where role = 'admin' limit 1;
  select r.owner_id, r.id into v_owner, v_rid from public.restaurants r where r.owner_id is not null order by r.id limit 1;
  select id into v_client from public.profiles where role = 'client' order by id limit 1;
  select id into v_other from public.profiles where role = 'client' and id <> v_client order by id limit 1;

  -- ---- Como CLIENTE ----
  perform set_config('request.jwt.claims', json_build_object('sub', v_client, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_client::text, true);
  set local role authenticated;

  begin
    update public.profiles set role = 'admin' where id = v_client;
    v_log := v_log || E'\n1a) cliente cambia role a admin: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n1a) cliente cambia role a admin: BLOQUEADO (' || sqlstate || ') OK';
  end;
  begin
    update public.profiles set active = false where id = v_client;
    v_log := v_log || E'\n1b) cliente cambia active: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n1b) cliente cambia active: BLOQUEADO OK';
  end;
  begin
    update public.profiles set rating_avg = 5, rating_count = 99 where id = v_client;
    v_log := v_log || E'\n1c) cliente cambia rating_*: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n1c) cliente cambia rating_*: BLOQUEADO OK';
  end;
  begin
    update public.profiles set email = 'otro@x.com' where id = v_client;
    v_log := v_log || E'\n1d) cliente cambia email: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n1d) cliente cambia email: BLOQUEADO OK';
  end;
  begin
    update public.profiles set name = 'Nombre Prueba', phone = '3000000000' where id = v_client;
    get diagnostics v_n = row_count;
    v_log := v_log || E'\n2) cliente cambia name/phone: ' || case when v_n = 1 then 'PERMITIDO OK' else 'FALLO (filas=' || v_n || ')' end;
  exception when others then
    v_log := v_log || E'\n2) cliente cambia name/phone: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
  end;
  select role into v_role from public.profiles where id = v_client;
  v_log := v_log || E'\n   rol del cliente tras los intentos: ' || v_role || case when v_role = 'client' then ' OK' else '  <-- FALLO' end;
  reset role;

  -- ---- Como DUEÑO de restaurante ----
  -- El admin suspende primero el restaurante (approved por defecto es true; sin cambio real
  -- el trigger no tendría nada que bloquear). Sin usuario = service_role, sin restricciones.
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  update public.restaurants set approved = false where id = v_rid;
  perform set_config('request.jwt.claims', json_build_object('sub', v_owner, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  set local role authenticated;

  begin
    update public.restaurants set approved = true where id = v_rid;
    v_log := v_log || E'\n3a) dueño cambia approved: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n3a) dueño cambia approved: BLOQUEADO OK';
  end;
  begin
    update public.restaurants set owner_id = v_client where id = v_rid;
    v_log := v_log || E'\n3b) dueño cambia owner_id: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n3b) dueño cambia owner_id: BLOQUEADO OK';
  end;
  begin
    update public.restaurants set rating_avg = 5, rating_count = 500 where id = v_rid;
    v_log := v_log || E'\n3c) dueño cambia rating_*: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n3c) dueño cambia rating_*: BLOQUEADO OK';
  end;
  begin
    update public.restaurants set name = name, status = 'closed', cover_url = 'https://x/y.jpg' where id = v_rid;
    get diagnostics v_n = row_count;
    v_log := v_log || E'\n4) dueño cambia name/status/cover_url: ' || case when v_n = 1 then 'PERMITIDO OK' else 'FALLO (filas=' || v_n || ')' end;
  exception when others then
    v_log := v_log || E'\n4) dueño name/status/cover_url: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
  end;
  begin
    insert into public.restaurants (owner_id, name, description, address, phone, status, rating_avg, rating_count)
    values (v_owner, 'Prueba ratings', 'x', 'Calle 1 # 2-3', '3000000000', 'open', 5, 200);
    v_log := v_log || E'\n5a) dueño inserta restaurante con ratings inventados: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n5a) dueño inserta restaurante con ratings inventados: BLOQUEADO OK';
  end;
  begin
    insert into public.restaurants (owner_id, name, description, address, phone, status)
    values (v_owner, 'Prueba normal', 'x', 'Calle 1 # 2-3', '3000000000', 'open');
    v_log := v_log || E'\n5b) dueño inserta restaurante normal (createRestaurant): PERMITIDO OK';
  exception when others then
    v_log := v_log || E'\n5b) restaurante normal: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
  end;
  reset role;

  -- ---- Como ADMIN ----
  if v_admin is not null then
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    set local role authenticated;
    begin
      update public.profiles set role = 'delivery', active = false where id = v_other;
      get diagnostics v_n = row_count;
      update public.restaurants set approved = false where id = v_rid;
      v_log := v_log || E'\n6) admin cambia role/active de otro usuario y approved: ' || case when v_n = 1 then 'PERMITIDO OK' else 'FALLO' end;
    exception when others then
      v_log := v_log || E'\n6) admin: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
    end;
    reset role;
  else
    v_log := v_log || E'\n6) (omitida: no hay admin)';
  end if;

  -- ---- Sin usuario (service_role / SQL del dashboard) ----
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  begin
    update public.profiles set rating_avg = 1 where id = v_client;
    v_log := v_log || E'\n7) sin usuario (service_role): PERMITIDO OK';
  exception when others then
    v_log := v_log || E'\n7) sin usuario: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
  end;

  -- ---- Calificar un pedido entregado: el trigger de ratings actualiza restaurants/profiles ----
  select o.id, o.user_id, o.restaurant_id into v_oid, v_uid_order, v_rest_of_order
    from public.orders o
   where o.status = 'delivered'
     and not exists (select 1 from public.order_ratings r where r.order_id = o.id)
   order by o.id limit 1;
  if v_oid is null then
    v_log := v_log || E'\n8) (omitida: no hay pedido entregado sin calificar)';
  else
    perform set_config('request.jwt.claims', json_build_object('sub', v_uid_order, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', v_uid_order::text, true);
    set local role authenticated;
    begin
      insert into public.order_ratings (order_id, client_id, restaurant_id, restaurant_rating)
      values (v_oid, v_uid_order, v_rest_of_order, 5);
      v_log := v_log || E'\n8) calificar pedido (trigger actualiza ratings): PERMITIDO OK';
    exception when others then
      v_log := v_log || E'\n8) calificar pedido: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
    end;
    reset role;
  end if;

  select string_agg(id::text || ':' || role, ',' order by id) into v_after_roles from public.profiles;
  v_log := v_log || E'\n   (dentro de la prueba el admin cambió el rol de otro usuario; se revierte al abortar)';
  raise exception E'RESULTADO_PRUEBA_S0 (rollback total)\n%', v_log;
end $test$;
