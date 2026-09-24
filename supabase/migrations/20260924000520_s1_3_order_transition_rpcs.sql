-- LOOP_SECURITY_01 · S1.3 — RPC de transición de pedidos (servidor)
--
-- REQUIERE S0, S1.1 (columnas y tabla de intentos) y S1.2 (trigger v2) aplicadas.
--
-- Todas las funciones públicas son SECURITY DEFINER con search_path vacío; solo ejecutables por
-- authenticated y service_role (nunca anon/public). Cada una valida sesión, rol ACTIVO,
-- propiedad y estado, y bloquea la fila del pedido (FOR UPDATE) antes de cambiarla.
-- El trigger private.guard_order_update (S1.2) sigue como SEGUNDA barrera: corre con auth.uid()
-- del usuario que llama.
--
-- Códigos de error estables (mensaje de la excepción):
--   not_authenticated · not_authorized · order_not_found · invalid_transition ·
--   no_delivery_available · order_unavailable · delivery_busy · order_not_assigned · invalid_location
--
-- Públicas (10):
--   restaurant_advance_order(order)     pending -> confirmed -> preparing -> ready
--   restaurant_assign_delivery(order)   ready sin domiciliario: elige automáticamente (D3)
--   restaurant_retry_assignment(order)  nueva ronda de búsqueda si nadie aceptó
--   restaurant_cancel_order(order)      hasta ready; libera al domiciliario asignado
--   delivery_set_shift(bool)            "En turno / Fuera de turno"
--   delivery_accept_order(order)        ready asignado a mí -> in_delivery (un pedido a la vez)
--   delivery_reject_order(order)        rechaza y se reasigna al siguiente en la misma transacción
--   delivery_complete_order(order)      in_delivery -> delivered (efectivo: payment_status = paid)
--   delivery_update_location(order,lat,lng)  solo mi pedido in_delivery, rangos válidos
--   client_cancel_order(order)          pending/confirmed -> cancelled
--
-- Internas (schema private, sin acceso para usuarios):
--   private.require_active_role(text)   sesión + rol activo -> uid
--   private.assign_next_driver(uuid)    asignación automática atómica (ver el comentario de la función)
--
-- create_order NO se toca. Reversible: ver el .rollback.sql

-- ---------------------------------------------------------------------------
-- Interna: exige sesión y un perfil ACTIVO con el rol pedido; devuelve el uid.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Interna: asigna el pedido (ready, sin domiciliario) al siguiente domiciliario elegible.
--
-- Elegible: rol delivery, active, on_shift, SIN pedido asignado/en camino (ready con domiciliario
-- o in_delivery) y sin intento rejected/expired en la ronda actual de ESTE pedido.
-- Orden: quien lleva más tiempo sin recibir un pedido (equidad), luego id.
--
-- Concurrencia: FOR UPDATE SKIP LOCKED sobre la fila del candidato + el índice único parcial
-- "un intento pending por domiciliario" (S1.1) como red de seguridad: si otra transacción ganó al
-- mismo candidato, el INSERT falla con unique_violation y se prueba el siguiente (máx. 5).
--
-- La escritura en orders se hace SIN identidad de usuario (se vacían los claims del JWT y se
-- restauran): la asignación la puede disparar el restaurante, el domiciliario que rechaza (o un
-- job), y ya fue validada por la RPC que llama. Devuelve el domiciliario o null.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- RESTAURANTE
-- ---------------------------------------------------------------------------
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

  -- Nueva ronda: los domiciliarios que rechazaron o dejaron vencer en la ronda anterior vuelven a ser elegibles.
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

-- ---------------------------------------------------------------------------
-- DOMICILIARIO
-- ---------------------------------------------------------------------------
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

  -- Reasignación inmediata al siguiente elegible (excluye a quien ya rechazó en esta ronda).
  -- Si no hay nadie, el pedido queda ready sin domiciliario y el restaurante lo ve.
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

-- ---------------------------------------------------------------------------
-- CLIENTE
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------
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
