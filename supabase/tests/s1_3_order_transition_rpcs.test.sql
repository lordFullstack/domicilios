-- PRUEBA de S1.3 (LOOP_SECURITY_01) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base (ni las funciones, ni los pedidos
-- de prueba). Requiere S0, S1.1 y S1.2 aplicadas. El bloque "S1.3" es la migración tal cual.
--
-- Cada caso llama a la RPC como un usuario real (rol authenticated + claims del JWT) y compara el
-- mensaje de error o "OK". Además verifica los efectos en las tablas y que los claims del JWT se
-- restauran tras la asignación automática ([SUB ROTO] = fallo).
do $test$
declare
  v_c uuid; v_c2 uuid; v_rid uuid; v_o1 uuid; v_o2 uuid; v_d1 uuid; v_d2 uuid;
  v_o uuid; v_o3 uuid; v_o4 uuid; v_a uuid; v_b uuid; v_x uuid; v_n int; v_log text := '';
begin
  -- ===== S1.3 (idéntico al archivo de migración) =====

create or replace function private.require_active_role(p_role text)
 returns uuid
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = v_uid and p.role = p_role and p.active
  ) then
    raise exception 'not_authorized';
  end if;
  return v_uid;
end;
$function$;

create or replace function private.assign_next_driver(p_order_id uuid)
 returns uuid
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_order public.orders%rowtype;
  v_driver uuid;
  v_claims text;
  v_sub text;
  v_try int := 0;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found or v_order.status <> 'ready' or v_order.delivery_person_id is not null then
    return null;
  end if;

  while v_try < 5 loop
    v_try := v_try + 1;
    v_driver := null;

    select p.id into v_driver
      from public.profiles p
     where p.role = 'delivery' and p.active and p.on_shift
       and not exists (
         select 1 from public.orders o
          where o.delivery_person_id = p.id and o.status in ('ready', 'in_delivery')
       )
       and not exists (
         select 1 from public.order_assignment_attempts a
          where a.order_id = p_order_id and a.round = v_order.assignment_round
            and a.driver_id = p.id and a.outcome in ('rejected', 'expired')
       )
     order by (select max(a2.assigned_at) from public.order_assignment_attempts a2 where a2.driver_id = p.id) nulls first, p.id
     for update of p skip locked
     limit 1;

    if v_driver is null then
      return null;
    end if;

    begin
      insert into public.order_assignment_attempts (order_id, driver_id, round)
      values (p_order_id, v_driver, v_order.assignment_round);
    exception when unique_violation then
      continue; -- otra transacción ya le ofreció un pedido a este domiciliario: probar otro
    end;

    v_claims := coalesce(current_setting('request.jwt.claims', true), '');
    v_sub := coalesce(current_setting('request.jwt.claim.sub', true), '');
    perform set_config('request.jwt.claims', '', true);
    perform set_config('request.jwt.claim.sub', '', true);

    update public.orders set delivery_person_id = v_driver where id = p_order_id;

    perform set_config('request.jwt.claims', v_claims, true);
    perform set_config('request.jwt.claim.sub', v_sub, true);
    return v_driver;
  end loop;

  return null;
end;
$function$;

create or replace function public.restaurant_advance_order(p_order_id uuid)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('restaurant');
  v_order public.orders%rowtype;
  v_next text;
begin
  select o.* into v_order
    from public.orders o
    join public.restaurants r on r.id = o.restaurant_id
   where o.id = p_order_id and r.owner_id = v_uid
   for update of o;
  if not found then
    raise exception 'order_not_found';
  end if;

  v_next := case v_order.status
    when 'pending' then 'confirmed'
    when 'confirmed' then 'preparing'
    when 'preparing' then 'ready'
    else null
  end;
  if v_next is null then
    raise exception 'invalid_transition';
  end if;

  update public.orders set status = v_next where id = p_order_id returning * into v_order;
  return v_order;
end;
$function$;

create or replace function public.restaurant_assign_delivery(p_order_id uuid)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('restaurant');
  v_order public.orders%rowtype;
begin
  select o.* into v_order
    from public.orders o
    join public.restaurants r on r.id = o.restaurant_id
   where o.id = p_order_id and r.owner_id = v_uid
   for update of o;
  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.status <> 'ready' or v_order.delivery_person_id is not null then
    raise exception 'order_unavailable';
  end if;

  if private.assign_next_driver(p_order_id) is null then
    raise exception 'no_delivery_available';
  end if;

  select * into v_order from public.orders where id = p_order_id;
  return v_order;
end;
$function$;

create or replace function public.restaurant_retry_assignment(p_order_id uuid)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('restaurant');
  v_order public.orders%rowtype;
begin
  select o.* into v_order
    from public.orders o
    join public.restaurants r on r.id = o.restaurant_id
   where o.id = p_order_id and r.owner_id = v_uid
   for update of o;
  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.status <> 'ready' or v_order.delivery_person_id is not null then
    raise exception 'order_unavailable';
  end if;

  update public.orders set assignment_round = assignment_round + 1 where id = p_order_id;

  if private.assign_next_driver(p_order_id) is null then
    raise exception 'no_delivery_available'; -- revierte también el aumento de ronda
  end if;

  select * into v_order from public.orders where id = p_order_id;
  return v_order;
end;
$function$;

create or replace function public.restaurant_cancel_order(p_order_id uuid)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('restaurant');
  v_order public.orders%rowtype;
begin
  select o.* into v_order
    from public.orders o
    join public.restaurants r on r.id = o.restaurant_id
   where o.id = p_order_id and r.owner_id = v_uid
   for update of o;
  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.status not in ('pending', 'confirmed', 'preparing', 'ready') then
    raise exception 'invalid_transition';
  end if;

  update public.orders set status = 'cancelled', delivery_person_id = null
   where id = p_order_id returning * into v_order;

  update public.order_assignment_attempts
     set outcome = 'cancelled', resolved_at = now()
   where order_id = p_order_id and outcome = 'pending';

  return v_order;
end;
$function$;

create or replace function public.delivery_set_shift(p_on_shift boolean)
 returns boolean
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('delivery');
begin
  if p_on_shift is null then
    raise exception 'invalid_transition';
  end if;
  update public.profiles set on_shift = p_on_shift where id = v_uid;
  return p_on_shift;
end;
$function$;

create or replace function public.delivery_accept_order(p_order_id uuid)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.delivery_person_id is distinct from v_uid then
    raise exception 'order_not_assigned';
  end if;
  if v_order.status <> 'ready' then
    raise exception 'invalid_transition';
  end if;
  if exists (
    select 1 from public.orders o
     where o.delivery_person_id = v_uid and o.status = 'in_delivery' and o.id <> p_order_id
  ) then
    raise exception 'delivery_busy';
  end if;

  update public.orders set status = 'in_delivery' where id = p_order_id returning * into v_order;

  update public.order_assignment_attempts
     set outcome = 'accepted', resolved_at = now()
   where order_id = p_order_id and driver_id = v_uid and outcome = 'pending';

  return v_order;
end;
$function$;

create or replace function public.delivery_reject_order(p_order_id uuid)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.delivery_person_id is distinct from v_uid then
    raise exception 'order_not_assigned';
  end if;
  if v_order.status <> 'ready' then
    raise exception 'invalid_transition';
  end if;

  update public.order_assignment_attempts
     set outcome = 'rejected', resolved_at = now()
   where order_id = p_order_id and driver_id = v_uid and outcome = 'pending';

  update public.orders set delivery_person_id = null where id = p_order_id;

  perform private.assign_next_driver(p_order_id);

  select * into v_order from public.orders where id = p_order_id;
  return v_order;
end;
$function$;

create or replace function public.delivery_complete_order(p_order_id uuid)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.delivery_person_id is distinct from v_uid then
    raise exception 'order_not_assigned';
  end if;
  if v_order.status <> 'in_delivery' then
    raise exception 'invalid_transition';
  end if;

  update public.orders
     set status = 'delivered',
         payment_status = case when payment_method = 'cash_on_delivery' then 'paid' else payment_status end
   where id = p_order_id returning * into v_order;
  return v_order;
end;
$function$;

create or replace function public.delivery_update_location(p_order_id uuid, p_lat double precision, p_lng double precision)
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_order public.orders%rowtype;
begin
  if p_lat is null or p_lat < -90 or p_lat > 90 or p_lng is null or p_lng < -180 or p_lng > 180 then
    raise exception 'invalid_location';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.delivery_person_id is distinct from v_uid or v_order.status <> 'in_delivery' then
    raise exception 'order_not_assigned';
  end if;

  update public.orders
     set current_lat = p_lat, current_lng = p_lng, location_updated_at = now()
   where id = p_order_id;
end;
$function$;

create or replace function public.client_cancel_order(p_order_id uuid)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_order public.orders%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_uid and p.active) then
    raise exception 'not_authorized';
  end if;

  select * into v_order from public.orders where id = p_order_id and user_id = v_uid for update;
  if not found then
    raise exception 'order_not_found';
  end if;
  if v_order.status not in ('pending', 'confirmed') then
    raise exception 'invalid_transition';
  end if;

  update public.orders set status = 'cancelled' where id = p_order_id returning * into v_order;
  return v_order;
end;
$function$;

revoke all on function private.require_active_role(text) from public, anon, authenticated;
revoke all on function private.assign_next_driver(uuid) from public, anon, authenticated;

revoke all on function public.restaurant_advance_order(uuid) from public, anon;
revoke all on function public.restaurant_assign_delivery(uuid) from public, anon;
revoke all on function public.restaurant_retry_assignment(uuid) from public, anon;
revoke all on function public.restaurant_cancel_order(uuid) from public, anon;
revoke all on function public.delivery_set_shift(boolean) from public, anon;
revoke all on function public.delivery_accept_order(uuid) from public, anon;
revoke all on function public.delivery_reject_order(uuid) from public, anon;
revoke all on function public.delivery_complete_order(uuid) from public, anon;
revoke all on function public.delivery_update_location(uuid, double precision, double precision) from public, anon;
revoke all on function public.client_cancel_order(uuid) from public, anon;

grant execute on function public.restaurant_advance_order(uuid) to authenticated, service_role;
grant execute on function public.restaurant_assign_delivery(uuid) to authenticated, service_role;
grant execute on function public.restaurant_retry_assignment(uuid) to authenticated, service_role;
grant execute on function public.restaurant_cancel_order(uuid) to authenticated, service_role;
grant execute on function public.delivery_set_shift(boolean) to authenticated, service_role;
grant execute on function public.delivery_accept_order(uuid) to authenticated, service_role;
grant execute on function public.delivery_reject_order(uuid) to authenticated, service_role;
grant execute on function public.delivery_complete_order(uuid) to authenticated, service_role;
grant execute on function public.delivery_update_location(uuid, double precision, double precision) to authenticated, service_role;
grant execute on function public.client_cancel_order(uuid) to authenticated, service_role;

  -- ===== fin S1.3 =====

  -- ===== helpers de la prueba =====
  create function pg_temp.call(p_uid uuid, p_role text, p_sql text) returns text language plpgsql as $f$
  declare v_res text; v_sub text;
  begin
    perform set_config('request.jwt.claims', case when p_uid is null then '' else json_build_object('sub', p_uid, 'role', 'authenticated')::text end, true);
    perform set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), true);
    execute 'set local role ' || p_role;
    begin
      execute p_sql;
      v_res := 'OK';
    exception when others then
      v_res := sqlerrm;
    end;
    v_sub := coalesce(current_setting('request.jwt.claim.sub', true), '');
    reset role;
    perform set_config('request.jwt.claims', '', true);
    perform set_config('request.jwt.claim.sub', '', true);
    if p_uid is not null and v_sub <> p_uid::text then v_res := v_res || ' [SUB ROTO]'; end if;
    return v_res;
  end $f$;

  create function pg_temp.mk(p_user uuid, p_rid uuid, p_status text, p_driver uuid, p_payment text) returns uuid language plpgsql as $f$
  declare v_id uuid;
  begin
    insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method, status, delivery_person_id)
    values (p_user, p_rid, 10000, 'Direccion prueba 123', p_payment, p_status, p_driver) returning id into v_id;
    return v_id;
  end $f$;

  create function pg_temp.chk(p_label text, p_expected text, p_actual text) returns text language sql as $f$
    select E'\n' || p_label || ': ' || p_actual || case when p_actual like p_expected then ' OK' else '  <-- FALLO (esperado ' || p_expected || ')' end
  $f$;

  create function pg_temp.st(p_order uuid) returns text language sql as $f$
    select o.status || '|driver=' || coalesce(o.delivery_person_id::text, 'null') || '|ronda=' || o.assignment_round || '|pago=' || o.payment_status
      from public.orders o where o.id = p_order
  $f$;

  -- ===== datos =====
  select id into v_d1 from public.profiles where role = 'delivery' and active order by id limit 1;
  select id into v_d2 from public.profiles where role = 'delivery' and active and id <> v_d1 order by id limit 1;
  select id into v_c from public.profiles where role = 'client' order by id limit 1;
  select id into v_c2 from public.profiles where role = 'client' and id <> v_c order by id limit 1;
  select id, owner_id into v_rid, v_o1 from public.restaurants where owner_id is not null order by id limit 1;
  select owner_id into v_o2 from public.restaurants where owner_id is not null and id <> v_rid order by id limit 1;
  update public.profiles set on_shift = true where id in (v_d1, v_d2);

  -- ===== seguridad de acceso =====
  v_log := v_log || pg_temp.chk('A1 anon no ejecuta la RPC', 'permission denied%', pg_temp.call(null, 'anon', format('select public.restaurant_advance_order(%L)', gen_random_uuid())));
  v_o := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('A2 cliente llama restaurant_advance_order', 'not_authorized', pg_temp.call(v_c, 'authenticated', format('select public.restaurant_advance_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('A3 domiciliario llama restaurant_assign_delivery', 'not_authorized', pg_temp.call(v_d1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  v_log := v_log || pg_temp.chk('A4 restaurante llama delivery_accept_order', 'not_authorized', pg_temp.call(v_o1, 'authenticated', format('select public.delivery_accept_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('A5 usuario no ejecuta funciones internas', 'permission denied%', pg_temp.call(v_o1, 'authenticated', format('select private.assign_next_driver(%L)', v_o)));

  -- ===== restaurante: avanzar =====
  v_o := pg_temp.mk(v_c, v_rid, 'pending', null, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('B1 dueño pending->confirmed', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_advance_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('B2 confirmed->preparing', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_advance_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('B3 preparing->ready', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_advance_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('B4 ready no avanza por esta RPC', 'invalid_transition', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_advance_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('B5 dueño de OTRO restaurante', 'order_not_found', pg_temp.call(v_o2, 'authenticated', format('select public.restaurant_advance_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('B6 estado final del pedido', 'ready|driver=null%', pg_temp.st(v_o));

  -- ===== asignación automática + aceptar + ubicación + entregar =====
  v_log := v_log || pg_temp.chk('C1 dueño asigna domiciliario', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  select delivery_person_id into v_a from public.orders where id = v_o;
  v_b := case when v_a = v_d1 then v_d2 else v_d1 end;
  select count(*) into v_n from public.order_assignment_attempts where order_id = v_o and driver_id = v_a and outcome = 'pending';
  v_log := v_log || E'\nC2 asignado a uno de los 2 y con 1 intento pending: ' || (v_a in (v_d1, v_d2))::text || '/' || v_n || case when v_a in (v_d1, v_d2) and v_n = 1 then ' OK' else '  <-- FALLO' end;
  v_log := v_log || pg_temp.chk('C3 asignar otra vez', 'order_unavailable', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  v_log := v_log || pg_temp.chk('C4 el OTRO domiciliario acepta', 'order_not_assigned', pg_temp.call(v_b, 'authenticated', format('select public.delivery_accept_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('C5 el asignado acepta', 'OK', pg_temp.call(v_a, 'authenticated', format('select public.delivery_accept_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('C6 estado tras aceptar', 'in_delivery|driver=' || v_a || '%', pg_temp.st(v_o));
  select count(*) into v_n from public.order_assignment_attempts where order_id = v_o and outcome = 'accepted';
  v_log := v_log || E'\nC7 intento accepted: ' || v_n || case when v_n = 1 then ' OK' else '  <-- FALLO' end;
  v_log := v_log || pg_temp.chk('C8 aceptar de nuevo', 'invalid_transition', pg_temp.call(v_a, 'authenticated', format('select public.delivery_accept_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('D1 ubicación válida', 'OK', pg_temp.call(v_a, 'authenticated', format('select public.delivery_update_location(%L, 11.54, -72.91)', v_o)));
  select count(*) into v_n from public.orders where id = v_o and current_lat = 11.54 and current_lng = -72.91 and location_updated_at is not null;
  v_log := v_log || E'\nD2 ubicación guardada: ' || v_n || case when v_n = 1 then ' OK' else '  <-- FALLO' end;
  v_log := v_log || pg_temp.chk('D3 latitud fuera de rango', 'invalid_location', pg_temp.call(v_a, 'authenticated', format('select public.delivery_update_location(%L, 95, -72.9)', v_o)));
  v_log := v_log || pg_temp.chk('D4 longitud fuera de rango', 'invalid_location', pg_temp.call(v_a, 'authenticated', format('select public.delivery_update_location(%L, 11.5, -200)', v_o)));
  v_log := v_log || pg_temp.chk('D5 ubicación de un pedido ajeno', 'order_not_assigned', pg_temp.call(v_b, 'authenticated', format('select public.delivery_update_location(%L, 11.5, -72.9)', v_o)));
  v_log := v_log || pg_temp.chk('E1 el OTRO domiciliario completa', 'order_not_assigned', pg_temp.call(v_b, 'authenticated', format('select public.delivery_complete_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('E2 el asignado completa', 'OK', pg_temp.call(v_a, 'authenticated', format('select public.delivery_complete_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('E3 efectivo queda pagado', 'delivered|%|pago=paid', pg_temp.st(v_o));
  v_log := v_log || pg_temp.chk('E4 ubicación tras entregar', 'order_not_assigned', pg_temp.call(v_a, 'authenticated', format('select public.delivery_update_location(%L, 11.5, -72.9)', v_o)));
  v_log := v_log || pg_temp.chk('E5 completar de nuevo', 'invalid_transition', pg_temp.call(v_a, 'authenticated', format('select public.delivery_complete_order(%L)', v_o)));
  v_o := pg_temp.mk(v_c, v_rid, 'in_delivery', v_d1, 'online');
  v_log := v_log || pg_temp.chk('E6 completar pedido online', 'OK', pg_temp.call(v_d1, 'authenticated', format('select public.delivery_complete_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('E7 online NO se marca pagado', 'delivered|%|pago=pending', pg_temp.st(v_o));

  -- ===== un pedido a la vez / turno / inactivos =====
  v_o := pg_temp.mk(v_c, v_rid, 'in_delivery', v_d1, 'cash_on_delivery');
  v_o3 := pg_temp.mk(v_c, v_rid, 'ready', v_d1, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('F1 domiciliario con entrega activa acepta otro', 'delivery_busy', pg_temp.call(v_d1, 'authenticated', format('select public.delivery_accept_order(%L)', v_o3)));
  v_o4 := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('F2 asigna aunque uno esté ocupado', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o4)));
  select delivery_person_id into v_a from public.orders where id = v_o4;
  v_log := v_log || E'\nF3 se asignó al libre (no al ocupado): ' || (v_a = v_d2)::text || case when v_a = v_d2 then ' OK' else '  <-- FALLO' end;
  delete from public.orders where id in (v_o, v_o3, v_o4);

  update public.profiles set on_shift = false where id in (v_d1, v_d2);
  v_o := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('G1 nadie en turno', 'no_delivery_available', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  v_log := v_log || pg_temp.chk('G2 el pedido no cambia', 'ready|driver=null%', pg_temp.st(v_o));
  v_log := v_log || pg_temp.chk('H1 domiciliario se pone en turno', 'OK', pg_temp.call(v_d1, 'authenticated', 'select public.delivery_set_shift(true)'));
  v_log := v_log || pg_temp.chk('H2 cliente usa delivery_set_shift', 'not_authorized', pg_temp.call(v_c, 'authenticated', 'select public.delivery_set_shift(true)'));
  update public.profiles set on_shift = true where id = v_d2;
  update public.profiles set active = false where id = v_d1;
  v_log := v_log || pg_temp.chk('H3 domiciliario INACTIVO no puede operar', 'not_authorized', pg_temp.call(v_d1, 'authenticated', 'select public.delivery_set_shift(true)'));
  v_log := v_log || pg_temp.chk('H4 asigna solo a un activo en turno', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  select delivery_person_id into v_a from public.orders where id = v_o;
  v_log := v_log || E'\nH5 el asignado es el activo: ' || (v_a = v_d2)::text || case when v_a = v_d2 then ' OK' else '  <-- FALLO' end;
  update public.profiles set active = true, on_shift = true where id in (v_d1, v_d2);
  delete from public.orders where id = v_o;

  -- ===== rechazar / reasignar / nueva ronda =====
  v_o := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('I1 asigna', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  select delivery_person_id into v_a from public.orders where id = v_o;
  v_b := case when v_a = v_d1 then v_d2 else v_d1 end;
  v_log := v_log || pg_temp.chk('I2 el otro domiciliario rechaza', 'order_not_assigned', pg_temp.call(v_b, 'authenticated', format('select public.delivery_reject_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('I3 el asignado rechaza (y los claims se restauran)', 'OK', pg_temp.call(v_a, 'authenticated', format('select public.delivery_reject_order(%L)', v_o)));
  select delivery_person_id into v_x from public.orders where id = v_o;
  v_log := v_log || E'\nI4 se reasignó al otro: ' || (v_x = v_b)::text || case when v_x = v_b then ' OK' else '  <-- FALLO' end;
  v_log := v_log || pg_temp.chk('I5 intento del primero = rejected', '1', (select count(*)::text from public.order_assignment_attempts where order_id = v_o and driver_id = v_a and outcome = 'rejected'));
  v_log := v_log || pg_temp.chk('I6 el segundo también rechaza', 'OK', pg_temp.call(v_b, 'authenticated', format('select public.delivery_reject_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('I7 nadie más: queda ready sin domiciliario', 'ready|driver=null|ronda=1%', pg_temp.st(v_o));
  v_log := v_log || pg_temp.chk('I8 dos intentos rechazados', '2', (select count(*)::text from public.order_assignment_attempts where order_id = v_o and outcome = 'rejected'));
  v_log := v_log || pg_temp.chk('I9 asignar sin cambiar de ronda: nadie elegible', 'no_delivery_available', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  v_log := v_log || pg_temp.chk('J1 "Buscar otra vez": nueva ronda', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_retry_assignment(%L)', v_o)));
  v_log := v_log || pg_temp.chk('J2 ronda 2 y con domiciliario', 'ready|driver=%|ronda=2%', pg_temp.st(v_o));
  v_log := v_log || pg_temp.chk('J3 reintentar estando asignado', 'order_unavailable', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_retry_assignment(%L)', v_o)));
  v_log := v_log || pg_temp.chk('J4 reintentar como cliente', 'not_authorized', pg_temp.call(v_c, 'authenticated', format('select public.restaurant_retry_assignment(%L)', v_o)));
  delete from public.orders where id = v_o;

  -- ===== cancelar =====
  v_o := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery');
  perform pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o));
  v_log := v_log || pg_temp.chk('K1 restaurante cancela un ready asignado', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_cancel_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('K2 queda cancelled y sin domiciliario', 'cancelled|driver=null%', pg_temp.st(v_o));
  v_log := v_log || pg_temp.chk('K3 el intento pasa a cancelled', '1', (select count(*)::text from public.order_assignment_attempts where order_id = v_o and outcome = 'cancelled'));
  v_log := v_log || pg_temp.chk('K4 cancelar un cancelado', 'invalid_transition', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_cancel_order(%L)', v_o)));
  v_o := pg_temp.mk(v_c, v_rid, 'preparing', null, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('K5 restaurante cancela preparing', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_cancel_order(%L)', v_o)));
  v_o := pg_temp.mk(v_c, v_rid, 'in_delivery', v_d1, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('K6 restaurante NO cancela in_delivery', 'invalid_transition', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_cancel_order(%L)', v_o)));
  v_o := pg_temp.mk(v_c, v_rid, 'pending', null, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('L1 cliente cancela pending', 'OK', pg_temp.call(v_c, 'authenticated', format('select public.client_cancel_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('L2 estado cancelled', 'cancelled%', pg_temp.st(v_o));
  v_o := pg_temp.mk(v_c, v_rid, 'preparing', null, 'cash_on_delivery');
  v_log := v_log || pg_temp.chk('L3 cliente NO cancela preparing', 'invalid_transition', pg_temp.call(v_c, 'authenticated', format('select public.client_cancel_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('L4 otro cliente cancela pedido ajeno', 'order_not_found', pg_temp.call(v_c2, 'authenticated', format('select public.client_cancel_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('L5 anon no cancela', 'permission denied%', pg_temp.call(null, 'anon', format('select public.client_cancel_order(%L)', v_o)));

  -- ===== red de seguridad: un intento pending por domiciliario =====
  update public.profiles set on_shift = true where id in (v_d1, v_d2);
  v_o := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery');
  v_o3 := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery');
  delete from public.order_assignment_attempts where driver_id in (v_d1, v_d2);
  insert into public.order_assignment_attempts (order_id, driver_id, assigned_at, outcome, resolved_at) values (v_o3, v_d2, now(), 'cancelled', now());
  insert into public.order_assignment_attempts (order_id, driver_id, assigned_at) values (v_o3, v_d1, now() - interval '1 hour');
  -- d1 (más antiguo) es el primer candidato, pero ya tiene un intento pending (otro proceso): debe saltar a d2
  v_log := v_log || pg_temp.chk('M1 candidato con intento pending ajeno: prueba el siguiente', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  select delivery_person_id into v_a from public.orders where id = v_o;
  v_log := v_log || E'\nM2 quedó asignado a d2 (no a d1): ' || (v_a = v_d2)::text || case when v_a = v_d2 then ' OK' else '  <-- FALLO' end;

  raise exception E'RESULTADO_PRUEBA_S1_3 (rollback total)\n%', v_log;
end $test$;
