-- PRUEBA de S0B (LOOP_SECURITY_00B) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base (ni la migración, ni los
-- usuarios de prueba). Requiere S0 aplicada (usa guard_restaurant_write).
--
-- Qué demuestra:
--   1) Un registro con role=delivery nace con active = false.
--   2) Un registro con role=client o restaurant nace con active = true.
--   3) Un registro que pide role=admin queda como client activo (whitelist intacta).
--   4) Un restaurante insertado por un dueño, sin approved, nace con approved = false.
--   5) Un dueño NO puede insertar un restaurante con approved = true (42501).
--   6) Un admin SÍ puede insertar/aprobar un restaurante.
--   7) Las cuentas y restaurantes EXISTENTES no cambian.
do $test$
declare
  v_before_active int; v_before_approved int; v_after_active int; v_after_approved int;
  v_d uuid := gen_random_uuid(); v_r uuid := gen_random_uuid(); v_c uuid := gen_random_uuid(); v_a uuid := gen_random_uuid();
  v_act boolean; v_role text; v_app boolean; v_admin uuid; v_rid uuid; v_log text := '';
begin
  select count(*) filter (where active), 0 into v_before_active, v_after_active from public.profiles;
  select count(*) filter (where approved) into v_before_approved from public.restaurants;

  -- ===== S0B (idéntico al archivo de migración) =====
  create or replace function public.handle_new_user()
   returns trigger language plpgsql security definer set search_path to 'public'
  as $function$
  declare
    requested_role text := new.raw_user_meta_data->>'role';
    safe_role text;
  begin
    safe_role := case when requested_role in ('client', 'restaurant', 'delivery') then requested_role else 'client' end;
    insert into public.profiles (id, email, name, role, active)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), safe_role, safe_role <> 'delivery');
    return new;
  end;
  $function$;

  alter table public.restaurants alter column approved set default false;

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
      if new.approved then
        raise exception 'restaurant_write_not_allowed' using errcode = '42501', detail = 'un restaurante nuevo debe ser aprobado por un administrador';
      end if;
      if new.rating_avg <> 0 or new.rating_count <> 0 then
        raise exception 'restaurant_write_not_allowed' using errcode = '42501', detail = 'rating_avg y rating_count solo los actualiza el sistema';
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
  -- ===== fin S0B =====

  -- 1-3) registros de prueba (dispara on_auth_user_created -> handle_new_user)
  insert into auth.users (id, email, raw_user_meta_data) values (v_d, 's0b-delivery@test.local', '{"role":"delivery","name":"D"}'::jsonb);
  insert into auth.users (id, email, raw_user_meta_data) values (v_r, 's0b-rest@test.local', '{"role":"restaurant","name":"R"}'::jsonb);
  insert into auth.users (id, email, raw_user_meta_data) values (v_c, 's0b-client@test.local', '{"role":"client","name":"C"}'::jsonb);
  insert into auth.users (id, email, raw_user_meta_data) values (v_a, 's0b-admin@test.local', '{"role":"admin","name":"A"}'::jsonb);

  select active into v_act from public.profiles where id = v_d;
  v_log := '1a) registro delivery: active=' || v_act || case when not v_act then ' OK' else '  <-- FALLO' end;
  select active into v_act from public.profiles where id = v_r;
  v_log := v_log || E'\n1b) registro restaurant: active=' || v_act || case when v_act then ' OK (se controla con approved)' else '  <-- FALLO' end;
  select active into v_act from public.profiles where id = v_c;
  v_log := v_log || E'\n2) registro client: active=' || v_act || case when v_act then ' OK' else '  <-- FALLO' end;
  select role, active into v_role, v_act from public.profiles where id = v_a;
  v_log := v_log || E'\n3) registro que pide admin: role=' || v_role || ' active=' || v_act || case when v_role = 'client' and v_act then ' OK' else '  <-- FALLO' end;

  -- 4-5) el dueño (recién registrado como restaurant) inserta restaurantes
  perform set_config('request.jwt.claims', json_build_object('sub', v_r, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_r::text, true);
  set local role authenticated;
  begin
    insert into public.restaurants (owner_id, name, description, address, phone, status)
    values (v_r, 'Prueba S0B', 'x', 'Calle 1 # 2-3', '3000000000', 'open') returning id, approved into v_rid, v_app;
    v_log := v_log || E'\n4) restaurante nuevo (createRestaurant): approved=' || v_app || case when not v_app then ' OK (pendiente de aprobación)' else '  <-- FALLO' end;
  exception when others then
    v_log := v_log || E'\n4) restaurante nuevo: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
  end;
  begin
    insert into public.restaurants (owner_id, name, description, address, phone, status, approved)
    values (v_r, 'Prueba autoaprobado', 'x', 'Calle 1 # 2-3', '3000000000', 'open', true);
    v_log := v_log || E'\n5) dueño inserta con approved=true: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n5) dueño inserta con approved=true: BLOQUEADO (' || sqlstate || ') OK';
  end;
  reset role;

  -- 6) admin aprueba
  select id into v_admin from public.profiles where role = 'admin' and id <> v_a limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_admin::text, true);
  set local role authenticated;
  begin
    update public.restaurants set approved = true where id = v_rid;
    select approved into v_app from public.restaurants where id = v_rid;
    v_log := v_log || E'\n6) admin aprueba el restaurante: approved=' || v_app || case when v_app then ' OK' else '  <-- FALLO' end;
  exception when others then
    v_log := v_log || E'\n6) admin aprueba: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
  end;
  reset role;

  -- 7) existentes intactos (se cuentan sin los usuarios/restaurantes de la prueba)
  select count(*) filter (where active) into v_after_active from public.profiles where id not in (v_d, v_r, v_c, v_a);
  select count(*) filter (where approved) into v_after_approved from public.restaurants where id <> v_rid;
  v_log := v_log || E'\n7) cuentas activas existentes: ' || v_before_active || ' -> ' || v_after_active
        || ' | restaurantes aprobados existentes: ' || v_before_approved || ' -> ' || v_after_approved
        || case when v_before_active = v_after_active and v_before_approved = v_after_approved then ' OK' else '  <-- FALLO' end;

  raise exception E'RESULTADO_PRUEBA_S0B (rollback total)\n%', v_log;
end $test$;
