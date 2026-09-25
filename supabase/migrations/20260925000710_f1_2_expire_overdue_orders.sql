-- LOOP_FLOW_01 · F1.2 — Vencimiento de plazos (servidor)
--
-- REQUIERE F1.1 (columnas) y SECURITY_01 (S1.1–S1.3).
--
--   public.server_time()                 hora del servidor para la cuenta regresiva (D3)
--   private.notify_no_delivery(order)    avisa al restaurante y a los admin: "sin domiciliario"
--   private.assign_next_driver(order)    v2: además fija accept_deadline al asignar
--   private.expire_overdue_orders()      la ejecuta pg_cron (F1.3) sin usuario (auth.uid() nulo):
--       - pending con confirm_deadline vencido -> cancelled + cancel_reason 'restaurant_timeout'
--       - ready asignado con accept_deadline vencido -> intento 'expired', se libera y se reasigna;
--         sin candidato queda ready sin domiciliario (NO se cancela) + aviso
--   restaurant_advance_order v2          rechaza confirmar un pedido vencido (order_expired)
--   delivery_accept_order v2             rechaza aceptar un pedido vencido (order_expired)
--   delivery_reject_order v2             si no hay a quién reasignar, avisa (notify_no_delivery)
--
-- Bloqueo por fila (FOR UPDATE SKIP LOCKED): si alguien actúa justo al vencer, gana quien tome
-- primero el bloqueo. Reversible: ver el .rollback.sql

create or replace function public.server_time()
 returns timestamptz
 language sql
 stable
 security definer
 set search_path to ''
as $function$
  select now();
$function$;

revoke all on function public.server_time() from public, anon;
grant execute on function public.server_time() to authenticated, service_role;

create or replace function private.notify_no_delivery(p_order_id uuid)
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  insert into public.notifications (user_id, title, body, type, order_id)
  select r.owner_id, 'Sin domiciliario disponible',
         'Nadie aceptó el pedido. Toca "Buscar domiciliario otra vez".', 'order', o.id
    from public.orders o join public.restaurants r on r.id = o.restaurant_id
   where o.id = p_order_id and r.owner_id is not null;

  insert into public.notifications (user_id, title, body, type, order_id)
  select p.id, 'Pedido sin domiciliario', 'Un pedido listo no tiene domiciliario que lo acepte.', 'order', p_order_id
    from public.profiles p where p.role = 'admin';
end;
$function$;

revoke all on function private.notify_no_delivery(uuid) from public, anon, authenticated;

-- v2: igual que S1.3, y fija la hora límite de aceptación al asignar.
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
  v_secs integer;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found or v_order.status <> 'ready' or v_order.delivery_person_id is not null then
    return null;
  end if;

  select delivery_accept_seconds into v_secs from public.app_settings limit 1;

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
      continue;
    end;

    v_claims := coalesce(current_setting('request.jwt.claims', true), '');
    v_sub := coalesce(current_setting('request.jwt.claim.sub', true), '');
    perform set_config('request.jwt.claims', '', true);
    perform set_config('request.jwt.claim.sub', '', true);

    update public.orders
       set delivery_person_id = v_driver,
           accept_deadline = now() + make_interval(secs => coalesce(v_secs, 120))
     where id = p_order_id;

    perform set_config('request.jwt.claims', v_claims, true);
    perform set_config('request.jwt.claim.sub', v_sub, true);
    return v_driver;
  end loop;

  return null;
end;
$function$;

-- Job de vencimiento. Devuelve cuántos pedidos canceló y cuántos reasignó/liberó.
create or replace function private.expire_overdue_orders()
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  r record;
  v_cancelled int := 0;
  v_reassigned int := 0;
  v_unassigned int := 0;
begin
  -- 1) Restaurante sin responder: se devuelve al cliente.
  for r in
    select id from public.orders
     where status = 'pending' and confirm_deadline is not null and confirm_deadline < now()
     order by confirm_deadline
     for update skip locked
  loop
    update public.orders
       set status = 'cancelled', cancel_reason = 'restaurant_timeout'
     where id = r.id;
    v_cancelled := v_cancelled + 1;
  end loop;

  -- 2) Domiciliario sin responder: se reasigna a otro.
  for r in
    select id, delivery_person_id from public.orders
     where status = 'ready' and delivery_person_id is not null
       and accept_deadline is not null and accept_deadline < now()
     order by accept_deadline
     for update skip locked
  loop
    update public.order_assignment_attempts
       set outcome = 'expired', resolved_at = now()
     where order_id = r.id and driver_id = r.delivery_person_id and outcome = 'pending';

    update public.orders set delivery_person_id = null, accept_deadline = null where id = r.id;

    if private.assign_next_driver(r.id) is null then
      perform private.notify_no_delivery(r.id);
      v_unassigned := v_unassigned + 1;
    else
      v_reassigned := v_reassigned + 1;
    end if;
  end loop;

  return jsonb_build_object('cancelled', v_cancelled, 'reassigned', v_reassigned, 'unassigned', v_unassigned);
end;
$function$;

revoke all on function private.expire_overdue_orders() from public, anon, authenticated;

-- restaurant_advance_order v2: no se puede confirmar un pedido cuyo plazo ya venció.
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
  if v_order.status = 'pending' and v_order.confirm_deadline is not null and v_order.confirm_deadline < now() then
    raise exception 'order_expired';
  end if;

  update public.orders set status = v_next where id = p_order_id returning * into v_order;
  return v_order;
end;
$function$;

-- delivery_accept_order v2: no se puede aceptar una asignación vencida.
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
  if v_order.accept_deadline is not null and v_order.accept_deadline < now() then
    raise exception 'order_expired';
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

-- delivery_reject_order v2: igual, y avisa si no hay a quién reasignar.
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

  if private.assign_next_driver(p_order_id) is null then
    perform private.notify_no_delivery(p_order_id);
  end if;

  select * into v_order from public.orders where id = p_order_id;
  return v_order;
end;
$function$;

revoke all on function public.restaurant_advance_order(uuid) from public, anon;
revoke all on function public.delivery_accept_order(uuid) from public, anon;
revoke all on function public.delivery_reject_order(uuid) from public, anon;
grant execute on function public.restaurant_advance_order(uuid) to authenticated, service_role;
grant execute on function public.delivery_accept_order(uuid) to authenticated, service_role;
grant execute on function public.delivery_reject_order(uuid) to authenticated, service_role;
