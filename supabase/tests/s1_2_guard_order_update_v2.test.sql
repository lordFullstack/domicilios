-- PRUEBA de S1.2 (LOOP_SECURITY_01) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base (ni la migración ni los pedidos
-- de prueba). Requiere S0 y S1.1 aplicadas (assignment_round). Aplica S1.2 dentro de la transacción.
--
-- REGRESIÓN (comportamiento que NO debe cambiar): R1–R14.
-- NUEVO (S1.2): N1–N15.
-- Cada caso intenta un UPDATE con la identidad de un usuario real (claims del JWT: auth.uid())
-- y anota PERMITIDO / BLOQUEADO. Se ejecuta SIN cambiar de rol de base de datos: es el mismo
-- contexto en que correrán las RPC SECURITY DEFINER (RLS no aplica, el trigger SÍ, porque
-- evalúa auth.uid()). Así se prueba el trigger aislado de las políticas RLS.
-- Hallazgo (24-sep-2026): con rol authenticated, un domiciliario NO puede rechazar por UPDATE
-- directo (la fila deja de ser visible para él y RLS lo bloquea) y las políticas de UPDATE
-- ocultan pedidos ajenos ("0 filas"); por eso Aceptar/Rechazar se hacen por RPC (S1.3).
do $test$
declare
  v_c uuid; v_o1 uuid; v_o2 uuid; v_rid uuid; v_rid2 uuid; v_d1 uuid; v_d2 uuid; v_admin uuid;
  v_oid uuid; v_orders_n int; v_log text := '';
begin
  select count(*) into v_orders_n from public.orders;

  -- pg_temp helpers
  create function pg_temp.attempt(p_uid uuid, p_sql text) returns text language plpgsql as $f$
  declare v_n int; v_res text;
  begin
    perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', p_uid::text, true);
    begin
      execute p_sql;
      get diagnostics v_n = row_count;
      v_res := case when v_n = 1 then 'PERMITIDO' else 'SIN FILAS' end;
    exception
      when insufficient_privilege then v_res := 'BLOQUEADO';
      when others then v_res := 'ERROR ' || sqlstate || ' ' || sqlerrm;
    end;
    perform set_config('request.jwt.claims', '', true);
    perform set_config('request.jwt.claim.sub', '', true);
    return v_res;
  end $f$;

  create function pg_temp.mk(p_user uuid, p_rid uuid, p_status text, p_driver uuid, p_payment text, p_round int) returns uuid language plpgsql as $f$
  declare v_id uuid;
  begin
    insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method, status, delivery_person_id, assignment_round)
    values (p_user, p_rid, 10000, 'Direccion prueba 123', p_payment, p_status, p_driver, p_round) returning id into v_id;
    return v_id;
  end $f$;

  create function pg_temp.chk(p_label text, p_expected text, p_actual text) returns text language sql as $f$
    select E'\n' || p_label || ': ' || p_actual || case when p_actual = p_expected then ' OK' else '  <-- FALLO (esperado ' || p_expected || ')' end
  $f$;

  -- ===== S1.2 (idéntico al archivo de migración) =====
  create or replace function private.guard_order_update()
   returns trigger language plpgsql security definer set search_path to ''
  as $function$
  declare
    v_uid uuid := (select auth.uid());
    v_changed text[];
    v_is_owner boolean;
    v_is_delivery boolean;
  begin
    if v_uid is null then return new; end if;
    if (select private.is_admin()) then return new; end if;
    select coalesce(array_agg(n.key), '{}') into v_changed
      from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o using (key)
     where n.value is distinct from o.value and n.key <> 'updated_at';
    if cardinality(v_changed) = 0 then return new; end if;
    select exists (select 1 from public.restaurants r where r.id = old.restaurant_id and r.owner_id = v_uid) into v_is_owner;
    select exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'delivery') into v_is_delivery;

    if old.user_id = v_uid and v_changed <@ array['status']
       and old.status in ('pending', 'confirmed') and new.status = 'cancelled' then
      return new;
    end if;

    if v_is_owner then
      if v_changed <@ array['status'] and (
           (old.status = 'pending'   and new.status = 'confirmed') or
           (old.status = 'confirmed' and new.status = 'preparing') or
           (old.status = 'preparing' and new.status = 'ready') or
           (old.status in ('pending', 'confirmed', 'preparing', 'ready') and new.status = 'cancelled')
         ) then
        return new;
      end if;
      if v_changed <@ array['status', 'delivery_person_id']
         and old.status = 'ready' and new.status = 'in_delivery'
         and new.delivery_person_id is not null
         and (old.delivery_person_id is null or old.delivery_person_id = new.delivery_person_id)
         and exists (select 1 from public.profiles p where p.id = new.delivery_person_id and p.role = 'delivery') then
        return new;
      end if;
      if v_changed <@ array['status', 'delivery_person_id']
         and old.status in ('pending', 'confirmed', 'preparing', 'ready') and new.status = 'cancelled'
         and new.delivery_person_id is null then
        return new;
      end if;
      if v_changed <@ array['delivery_person_id', 'assignment_round']
         and old.status = 'ready' and new.status = 'ready'
         and (new.delivery_person_id is null
              or exists (select 1 from public.profiles p where p.id = new.delivery_person_id and p.role = 'delivery' and p.active))
         and (new.assignment_round = old.assignment_round or new.assignment_round = old.assignment_round + 1) then
        return new;
      end if;
    end if;

    if v_is_delivery then
      if v_changed <@ array['status', 'delivery_person_id']
         and old.delivery_person_id is null and new.delivery_person_id = v_uid
         and old.status = 'ready' and new.status = 'in_delivery' then
        return new;
      end if;
      if old.delivery_person_id = v_uid and v_changed <@ array['status']
         and old.status = 'ready' and new.status = 'in_delivery' then
        return new;
      end if;
      if old.delivery_person_id = v_uid and v_changed <@ array['delivery_person_id']
         and old.status = 'ready' and new.status = 'ready' and new.delivery_person_id is null then
        return new;
      end if;
      if old.delivery_person_id = v_uid
         and v_changed <@ array['current_lat', 'current_lng', 'location_updated_at', 'status', 'payment_status']
         and new.delivery_person_id is not distinct from old.delivery_person_id
         and (new.status = old.status or (old.status = 'in_delivery' and new.status = 'delivered'))
         and (new.payment_status = old.payment_status
              or (old.payment_status = 'pending' and new.payment_status = 'paid'
                  and new.status = 'delivered' and old.payment_method = 'cash_on_delivery')) then
        return new;
      end if;
    end if;

    raise exception 'order_update_not_allowed' using errcode = '42501',
      detail = format('Cambio no permitido en columnas: %s (estado %s → %s)', array_to_string(v_changed, ', '), old.status, new.status);
  end;
  $function$;
  -- ===== fin S1.2 =====

  select id into v_admin from public.profiles where role = 'admin' limit 1;
  select id into v_d1 from public.profiles where role = 'delivery' and active order by id limit 1;
  select id into v_d2 from public.profiles where role = 'delivery' and active and id <> v_d1 order by id limit 1;
  select id into v_c from public.profiles where role = 'client' order by id limit 1;
  select id, owner_id into v_rid, v_o1 from public.restaurants where owner_id is not null order by id limit 1;   -- v_o1 = dueño 1
  select id, owner_id into v_rid2, v_o2 from public.restaurants where owner_id is not null and id <> v_rid order by id limit 1; -- v_o2 = dueño 2

  -- ============ REGRESIÓN (comportamiento actual) ============
  v_oid := pg_temp.mk(v_c, v_rid, 'pending', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R1 cliente cancela pending', 'PERMITIDO', pg_temp.attempt(v_c, format('update public.orders set status=%L where id=%L', 'cancelled', v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'preparing', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R2 cliente cancela preparing', 'BLOQUEADO', pg_temp.attempt(v_c, format('update public.orders set status=%L where id=%L', 'cancelled', v_oid)));
  v_log := v_log || pg_temp.chk('R3 cliente cambia total', 'BLOQUEADO', pg_temp.attempt(v_c, format('update public.orders set total=1 where id=%L', v_oid)));
  v_log := v_log || pg_temp.chk('R14 cliente cambia delivery_person_id', 'BLOQUEADO', pg_temp.attempt(v_c, format('update public.orders set delivery_person_id=%L where id=%L', v_d1, v_oid)));

  v_oid := pg_temp.mk(v_c, v_rid, 'pending', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R4 dueño pending->confirmed', 'PERMITIDO', pg_temp.attempt(v_o1, format('update public.orders set status=%L where id=%L', 'confirmed', v_oid)));
  v_log := v_log || pg_temp.chk('R5 dueño confirmed->ready (salta)', 'BLOQUEADO', pg_temp.attempt(v_o1, format('update public.orders set status=%L where id=%L', 'ready', v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'preparing', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R6 dueño cancela preparing', 'PERMITIDO', pg_temp.attempt(v_o1, format('update public.orders set status=%L where id=%L', 'cancelled', v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R7 dueño ready->in_delivery asignando (compat)', 'PERMITIDO', pg_temp.attempt(v_o1, format('update public.orders set status=%L, delivery_person_id=%L where id=%L', 'in_delivery', v_d1, v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R8 dueño cambia total', 'BLOQUEADO', pg_temp.attempt(v_o1, format('update public.orders set total=1 where id=%L', v_oid)));
  v_log := v_log || pg_temp.chk('R8b dueño de OTRO restaurante avanza el pedido', 'BLOQUEADO', pg_temp.attempt(v_o2, format('update public.orders set status=%L where id=%L', 'cancelled', v_oid)));

  v_oid := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R9 domiciliario toma pedido libre (compat)', 'PERMITIDO', pg_temp.attempt(v_d1, format('update public.orders set status=%L, delivery_person_id=%L where id=%L', 'in_delivery', v_d1, v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'in_delivery', v_d1, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R10 domiciliario entrega y marca pagado (efectivo)', 'PERMITIDO', pg_temp.attempt(v_d1, format('update public.orders set status=%L, payment_status=%L where id=%L', 'delivered', 'paid', v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'in_delivery', v_d1, 'online', 1);
  v_log := v_log || pg_temp.chk('R11 domiciliario marca pagado un pedido online', 'BLOQUEADO', pg_temp.attempt(v_d1, format('update public.orders set status=%L, payment_status=%L where id=%L', 'delivered', 'paid', v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'in_delivery', v_d1, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('R12 otro domiciliario cambia un pedido ajeno', 'BLOQUEADO', pg_temp.attempt(v_d2, format('update public.orders set status=%L where id=%L', 'delivered', v_oid)));
  v_log := v_log || pg_temp.chk('R13 admin cambia lo que quiera', 'PERMITIDO', pg_temp.attempt(v_admin, format('update public.orders set total=5, status=%L where id=%L', 'pending', v_oid)));

  -- ============ NUEVO (S1.2) ============
  v_oid := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('N1 dueño asigna domiciliario (ready->ready)', 'PERMITIDO', pg_temp.attempt(v_o1, format('update public.orders set delivery_person_id=%L where id=%L', v_d1, v_oid)));
  v_log := v_log || pg_temp.chk('N2 dueño reasigna a otro domiciliario', 'PERMITIDO', pg_temp.attempt(v_o1, format('update public.orders set delivery_person_id=%L where id=%L', v_d2, v_oid)));
  v_log := v_log || pg_temp.chk('N3 dueño libera al domiciliario', 'PERMITIDO', pg_temp.attempt(v_o1, format('update public.orders set delivery_person_id=null where id=%L', v_oid)));
  v_log := v_log || pg_temp.chk('N4 dueño asigna a un perfil que NO es domiciliario', 'BLOQUEADO', pg_temp.attempt(v_o1, format('update public.orders set delivery_person_id=%L where id=%L', v_c, v_oid)));
  v_log := v_log || pg_temp.chk('N6a dueño sube assignment_round en 1', 'PERMITIDO', pg_temp.attempt(v_o1, format('update public.orders set assignment_round=2 where id=%L', v_oid)));
  v_log := v_log || pg_temp.chk('N6b dueño sube assignment_round en 5', 'BLOQUEADO', pg_temp.attempt(v_o1, format('update public.orders set assignment_round=7 where id=%L', v_oid)));
  v_log := v_log || pg_temp.chk('N6c dueño baja assignment_round', 'BLOQUEADO', pg_temp.attempt(v_o1, format('update public.orders set assignment_round=1 where id=%L', v_oid)));
  v_log := v_log || pg_temp.chk('N7 dueño asigna y cambia el total a la vez', 'BLOQUEADO', pg_temp.attempt(v_o1, format('update public.orders set delivery_person_id=%L, total=1 where id=%L', v_d1, v_oid)));
  v_log := v_log || pg_temp.chk('N14 dueño de OTRO restaurante asigna', 'BLOQUEADO', pg_temp.attempt(v_o2, format('update public.orders set delivery_person_id=%L where id=%L', v_d1, v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'confirmed', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('N5 dueño asigna con el pedido en confirmed', 'BLOQUEADO', pg_temp.attempt(v_o1, format('update public.orders set delivery_person_id=%L where id=%L', v_d1, v_oid)));

  v_oid := pg_temp.mk(v_c, v_rid, 'ready', v_d1, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('N9 domiciliario B acepta un pedido asignado a A', 'BLOQUEADO', pg_temp.attempt(v_d2, format('update public.orders set status=%L where id=%L', 'in_delivery', v_oid)));
  v_log := v_log || pg_temp.chk('N11 domiciliario B se asigna un pedido que es de A', 'BLOQUEADO', pg_temp.attempt(v_d2, format('update public.orders set delivery_person_id=%L where id=%L', v_d2, v_oid)));
  v_log := v_log || pg_temp.chk('N12 domiciliario A rechaza y cambia el estado a la vez', 'BLOQUEADO', pg_temp.attempt(v_d1, format('update public.orders set delivery_person_id=null, status=%L where id=%L', 'delivered', v_oid)));
  v_log := v_log || pg_temp.chk('N8 domiciliario A acepta su pedido asignado (ready->in_delivery)', 'PERMITIDO', pg_temp.attempt(v_d1, format('update public.orders set status=%L where id=%L', 'in_delivery', v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'ready', v_d1, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('N10 domiciliario A rechaza su pedido asignado', 'PERMITIDO', pg_temp.attempt(v_d1, format('update public.orders set delivery_person_id=null where id=%L', v_oid)));

  v_oid := pg_temp.mk(v_c, v_rid, 'ready', v_d1, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('N13 dueño cancela un ready asignado liberando al domiciliario', 'PERMITIDO', pg_temp.attempt(v_o1, format('update public.orders set status=%L, delivery_person_id=null where id=%L', 'cancelled', v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'ready', v_d1, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('N13b dueño cancela y REASIGNA a otro a la vez', 'BLOQUEADO', pg_temp.attempt(v_o1, format('update public.orders set status=%L, delivery_person_id=%L where id=%L', 'cancelled', v_d2, v_oid)));
  v_oid := pg_temp.mk(v_c, v_rid, 'ready', null, 'cash_on_delivery', 1);
  v_log := v_log || pg_temp.chk('N15 cliente cambia assignment_round', 'BLOQUEADO', pg_temp.attempt(v_c, format('update public.orders set assignment_round=2 where id=%L', v_oid)));
  v_log := v_log || pg_temp.chk('N16 cliente cambia client_order_id', 'BLOQUEADO', pg_temp.attempt(v_c, format('update public.orders set client_order_id=gen_random_uuid() where id=%L', v_oid)));

  select count(*) into v_orders_n from public.orders where restaurant_id in (v_rid, v_rid2);
  raise exception E'RESULTADO_PRUEBA_S1_2 (rollback total)\n%', v_log;
end $test$;
