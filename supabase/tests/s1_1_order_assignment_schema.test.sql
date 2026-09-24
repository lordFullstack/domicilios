-- PRUEBA de S1.1 (LOOP_SECURITY_01) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base (ni la migración).
-- Requiere S0 aplicada (usa guard_profile_update y guard_order_update).
--
-- Qué demuestra:
--   1) Todos los perfiles existentes quedan con on_shift = false y todos los pedidos con assignment_round = 1.
--   2) La tabla de intentos existe, con RLS, y vacía.
--   3) Un pedido no puede tener 2 intentos pending; un domiciliario no puede tener 2 pending.
--   4) Resuelto un intento, se puede ofrecer el pedido de nuevo (historial de intentos).
--   5) Visibilidad: dueño del restaurante del pedido, domiciliario del intento y admin lo ven;
--      el otro restaurante, otro domiciliario y el cliente NO.
--   6) Ningún usuario autenticado puede insertar/actualizar/borrar intentos (solo las RPC).
--   7) El domiciliario puede cambiar su on_shift; sigue sin poder cambiar su role.
--   8) Un cliente no puede cambiar assignment_round de su pedido (guard_order_update intacto).
--   9) Al final todo revertido.
do $test$
declare
  v_orders_n int; v_prof_n int; v_shift_false int; v_round1 int; v_att int; v_rls boolean;
  v_d1 uuid; v_d2 uuid; v_admin uuid; v_o1 uuid; v_o2 uuid; v_r1 uuid; v_r2 uuid; v_own1 uuid; v_own2 uuid; v_cli uuid;
  v_n int; v_log text := '';
begin
  select count(*) into v_orders_n from public.orders;

  -- ===== S1.1 (idéntico al archivo de migración) =====
  alter table public.profiles add column if not exists on_shift boolean not null default false;
  alter table public.orders add column if not exists assignment_round integer not null default 1;
  create table if not exists public.order_assignment_attempts (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders (id) on delete cascade,
    driver_id uuid not null references public.profiles (id),
    round integer not null default 1,
    assigned_at timestamptz not null default now(),
    resolved_at timestamptz,
    outcome text not null default 'pending' check (outcome in ('pending', 'accepted', 'rejected', 'expired', 'cancelled'))
  );
  create index if not exists order_assignment_attempts_order_round_idx on public.order_assignment_attempts (order_id, round);
  create unique index if not exists order_assignment_attempts_one_pending_per_order on public.order_assignment_attempts (order_id) where outcome = 'pending';
  create unique index if not exists order_assignment_attempts_one_pending_per_driver on public.order_assignment_attempts (driver_id) where outcome = 'pending';
  alter table public.order_assignment_attempts enable row level security;
  revoke insert, update, delete, truncate on public.order_assignment_attempts from anon, authenticated;
  drop policy if exists order_assignment_attempts_select on public.order_assignment_attempts;
  create policy order_assignment_attempts_select on public.order_assignment_attempts
    for select to authenticated
    using (
      driver_id = (select auth.uid())
      or (select private.is_admin())
      or exists (select 1 from public.orders o join public.restaurants r on r.id = o.restaurant_id
                  where o.id = order_assignment_attempts.order_id and r.owner_id = (select auth.uid()))
    );
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
    if v_changed <@ array['name', 'phone', 'avatar_url', 'vehicle_type', 'vehicle_plate', 'on_shift'] then return new; end if;
    raise exception 'profile_update_not_allowed' using errcode = '42501',
      detail = format('Cambio no permitido en columnas: %s', array_to_string(v_changed, ', '));
  end;
  $function$;
  -- ===== fin S1.1 =====

  -- 1) existentes
  select count(*), count(*) filter (where not on_shift) into v_prof_n, v_shift_false from public.profiles;
  select count(*) filter (where assignment_round = 1) into v_round1 from public.orders;
  v_log := '1) perfiles con on_shift=false: ' || v_shift_false || '/' || v_prof_n || ' | pedidos con ronda 1: ' || v_round1 || '/' || v_orders_n
        || case when v_shift_false = v_prof_n and v_round1 = v_orders_n then ' OK' else '  <-- FALLO' end;

  -- 2) tabla
  select count(*) into v_att from public.order_assignment_attempts;
  select relrowsecurity into v_rls from pg_class where oid = 'public.order_assignment_attempts'::regclass;
  v_log := v_log || E'\n2) tabla de intentos: filas=' || v_att || ' RLS=' || v_rls || case when v_att = 0 and v_rls then ' OK' else '  <-- FALLO' end;

  -- datos de prueba
  select id into v_admin from public.profiles where role = 'admin' limit 1;
  select id into v_d1 from public.profiles where role = 'delivery' order by id limit 1;
  select id into v_d2 from public.profiles where role = 'delivery' and id <> v_d1 order by id limit 1;
  -- r1 = restaurante con al menos 2 pedidos (hacen falta dos pedidos distintos para las pruebas 3b y 6)
  select r.id, r.owner_id into v_r1, v_own1 from public.restaurants r
   where r.owner_id is not null and (select count(*) from public.orders o where o.restaurant_id = r.id) >= 2
   order by (select count(*) from public.orders o where o.restaurant_id = r.id) desc, r.id limit 1;
  select r.id, r.owner_id into v_r2, v_own2 from public.restaurants r where r.owner_id is not null and r.id <> v_r1 order by r.id limit 1;
  select id, user_id into v_o1, v_cli from public.orders where restaurant_id = v_r1 order by id limit 1;
  select id into v_o2 from public.orders where restaurant_id = v_r1 and id <> v_o1 order by id limit 1;

  -- 3) unicidad de intentos pending
  insert into public.order_assignment_attempts (order_id, driver_id) values (v_o1, v_d1);
  begin
    insert into public.order_assignment_attempts (order_id, driver_id) values (v_o1, v_d2);
    v_log := v_log || E'\n3a) 2 pending para el mismo pedido: NO bloqueado  <-- FALLO';
  exception when unique_violation then
    v_log := v_log || E'\n3a) 2 pending para el mismo pedido: BLOQUEADO (unique_violation) OK';
  end;
  begin
    insert into public.order_assignment_attempts (order_id, driver_id) values (v_o2, v_d1);
    v_log := v_log || E'\n3b) 2 pending para el mismo domiciliario: NO bloqueado  <-- FALLO';
  exception when unique_violation then
    v_log := v_log || E'\n3b) 2 pending para el mismo domiciliario: BLOQUEADO (unique_violation) OK';
  end;

  -- 4) historial
  update public.order_assignment_attempts set outcome = 'rejected', resolved_at = now() where order_id = v_o1;
  insert into public.order_assignment_attempts (order_id, driver_id) values (v_o1, v_d2);
  select count(*) into v_n from public.order_assignment_attempts where order_id = v_o1;
  v_log := v_log || E'\n4) tras rechazar, se ofrece a otro: intentos del pedido=' || v_n || case when v_n = 2 then ' OK' else '  <-- FALLO' end;

  -- 5) visibilidad
  perform set_config('request.jwt.claims', json_build_object('sub', v_own1, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_own1::text, true);
  set local role authenticated;
  select count(*) into v_n from public.order_assignment_attempts;
  v_log := v_log || E'\n5a) dueño del restaurante del pedido ve: ' || v_n || case when v_n = 2 then ' OK' else '  <-- FALLO' end;
  -- 6) escritura bloqueada
  begin
    insert into public.order_assignment_attempts (order_id, driver_id) values (v_o2, v_d1);
    v_log := v_log || E'\n6a) usuario autenticado inserta intento: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n6a) usuario autenticado inserta intento: BLOQUEADO OK';
  end;
  begin
    update public.order_assignment_attempts set outcome = 'accepted' where order_id = v_o1;
    v_log := v_log || E'\n6b) usuario autenticado actualiza intento: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n6b) usuario autenticado actualiza intento: BLOQUEADO OK';
  end;
  begin
    delete from public.order_assignment_attempts where order_id = v_o1;
    v_log := v_log || E'\n6c) usuario autenticado borra intento: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n6c) usuario autenticado borra intento: BLOQUEADO OK';
  end;
  reset role;

  if v_own2 is not null then
    perform set_config('request.jwt.claims', json_build_object('sub', v_own2, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', v_own2::text, true);
    set local role authenticated;
    select count(*) into v_n from public.order_assignment_attempts;
    v_log := v_log || E'\n5b) dueño de OTRO restaurante ve: ' || v_n || case when v_n = 0 then ' OK' else '  <-- FALLO' end;
    reset role;
  end if;

  perform set_config('request.jwt.claims', json_build_object('sub', v_d1, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_d1::text, true);
  set local role authenticated;
  select count(*) into v_n from public.order_assignment_attempts;
  v_log := v_log || E'\n5c) domiciliario del intento ve solo lo suyo: ' || v_n || case when v_n = 1 then ' OK' else '  <-- FALLO' end;
  -- 7) turno
  begin
    update public.profiles set on_shift = true where id = v_d1;
    get diagnostics v_n = row_count;
    v_log := v_log || E'\n7a) domiciliario cambia su on_shift: ' || case when v_n = 1 then 'PERMITIDO OK' else 'FALLO' end;
  exception when others then
    v_log := v_log || E'\n7a) on_shift: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
  end;
  begin
    update public.profiles set role = 'admin' where id = v_d1;
    v_log := v_log || E'\n7b) domiciliario cambia su role: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n7b) domiciliario cambia su role: BLOQUEADO OK';
  end;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', v_cli, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_cli::text, true);
  set local role authenticated;
  select count(*) into v_n from public.order_assignment_attempts;
  v_log := v_log || E'\n5d) el cliente del pedido ve: ' || v_n || case when v_n = 0 then ' OK' else '  <-- FALLO' end;
  -- 8) guard_order_update
  begin
    update public.orders set assignment_round = 99 where id = v_o1;
    v_log := v_log || E'\n8) cliente cambia assignment_round: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n8) cliente cambia assignment_round: BLOQUEADO (order_update_not_allowed) OK';
  end;
  reset role;

  if v_admin is not null then
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    set local role authenticated;
    select count(*) into v_n from public.order_assignment_attempts;
    v_log := v_log || E'\n5e) admin ve: ' || v_n || case when v_n = 2 then ' OK' else '  <-- FALLO' end;
    reset role;
  end if;

  raise exception E'RESULTADO_PRUEBA_S1_1 (rollback total)\n%', v_log;
end $test$;
