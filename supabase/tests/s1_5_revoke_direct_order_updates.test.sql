-- PRUEBA de S1.5 (LOOP_SECURITY_01) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base (ni la política ni los pedidos
-- de prueba). Requiere S0, S1.1, S1.2 y S1.3 aplicadas. Aplica S1.5 dentro de la transacción.
--
-- Qué demuestra:
--   1) Con S1.5, un cliente, un restaurante y un domiciliario NO pueden hacer UPDATE directo
--      sobre orders (0 filas / bloqueado), ni siquiera lo que antes el trigger permitía.
--   2) El admin SÍ puede hacer UPDATE directo.
--   3) Las RPC (S1.3) siguen funcionando sin la política: cancelar, avanzar, asignar, aceptar, entregar.
--   4) El SELECT no cambia (cada rol sigue viendo sus pedidos).
do $test$
declare
  v_c uuid; v_rid uuid; v_o1 uuid; v_d1 uuid; v_d2 uuid; v_admin uuid; v_o uuid; v_a uuid; v_n int; v_log text := '';
begin
  create function pg_temp.call(p_uid uuid, p_role text, p_sql text) returns text language plpgsql as $f$
  declare v_res text; v_n int;
  begin
    perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', p_uid::text, true);
    execute 'set local role ' || p_role;
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
  create function pg_temp.mk(p_user uuid, p_rid uuid, p_status text, p_driver uuid) returns uuid language plpgsql as $f$
  declare v_id uuid;
  begin
    insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method, status, delivery_person_id)
    values (p_user, p_rid, 10000, 'Direccion prueba 123', 'cash_on_delivery', p_status, p_driver) returning id into v_id;
    return v_id;
  end $f$;

  -- ===== S1.5 (idéntico al archivo de migración) =====
  drop policy if exists orders_update_involved on public.orders;
  drop policy if exists orders_update_admin on public.orders;
  create policy orders_update_admin on public.orders
    for update to authenticated
    using ((select private.is_admin()))
    with check ((select private.is_admin()));
  -- ===== fin S1.5 =====

  select id into v_admin from public.profiles where role = 'admin' limit 1;
  select id into v_d1 from public.profiles where role = 'delivery' and active order by id limit 1;
  select id into v_d2 from public.profiles where role = 'delivery' and active and id <> v_d1 order by id limit 1;
  select id into v_c from public.profiles where role = 'client' order by id limit 1;
  select id, owner_id into v_rid, v_o1 from public.restaurants where owner_id is not null order by id limit 1;
  update public.profiles set on_shift = true where id in (v_d1, v_d2);

  -- 1) UPDATE directo bloqueado (incluso lo que el trigger antes permitía)
  v_o := pg_temp.mk(v_c, v_rid, 'pending', null);
  v_log := v_log || pg_temp.chk('1a cliente cancela por UPDATE directo', 'SIN FILAS', pg_temp.call(v_c, 'authenticated', format('update public.orders set status=%L where id=%L', 'cancelled', v_o)));
  v_log := v_log || pg_temp.chk('1b restaurante confirma por UPDATE directo', 'SIN FILAS', pg_temp.call(v_o1, 'authenticated', format('update public.orders set status=%L where id=%L', 'confirmed', v_o)));
  v_log := v_log || pg_temp.chk('1c cliente cambia el total por UPDATE directo', 'SIN FILAS', pg_temp.call(v_c, 'authenticated', format('update public.orders set total=1 where id=%L', v_o)));
  v_log := v_log || pg_temp.chk('1d el pedido no cambió', 'pending', (select status from public.orders where id = v_o));
  v_o := pg_temp.mk(v_c, v_rid, 'ready', null);
  v_log := v_log || pg_temp.chk('1e domiciliario toma un pedido libre por UPDATE directo', 'SIN FILAS', pg_temp.call(v_d1, 'authenticated', format('update public.orders set status=%L, delivery_person_id=%L where id=%L', 'in_delivery', v_d1, v_o)));
  v_o := pg_temp.mk(v_c, v_rid, 'in_delivery', v_d1);
  v_log := v_log || pg_temp.chk('1f domiciliario entrega por UPDATE directo', 'SIN FILAS', pg_temp.call(v_d1, 'authenticated', format('update public.orders set status=%L where id=%L', 'delivered', v_o)));
  v_log := v_log || pg_temp.chk('1g domiciliario manda ubicación por UPDATE directo', 'SIN FILAS', pg_temp.call(v_d1, 'authenticated', format('update public.orders set current_lat=11.5 where id=%L', v_o)));

  -- 2) admin
  v_log := v_log || pg_temp.chk('2 admin hace UPDATE directo', 'OK', pg_temp.call(v_admin, 'authenticated', format('update public.orders set total=5 where id=%L', v_o)));

  -- 3) las RPC siguen funcionando
  v_o := pg_temp.mk(v_c, v_rid, 'pending', null);
  v_log := v_log || pg_temp.chk('3a client_cancel_order', 'OK', pg_temp.call(v_c, 'authenticated', format('select public.client_cancel_order(%L)', v_o)));
  v_o := pg_temp.mk(v_c, v_rid, 'pending', null);
  v_log := v_log || pg_temp.chk('3b restaurant_advance_order', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_advance_order(%L)', v_o)));
  v_o := pg_temp.mk(v_c, v_rid, 'ready', null);
  v_log := v_log || pg_temp.chk('3c restaurant_assign_delivery', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o)));
  select delivery_person_id into v_a from public.orders where id = v_o;
  v_log := v_log || pg_temp.chk('3d delivery_accept_order', 'OK', pg_temp.call(v_a, 'authenticated', format('select public.delivery_accept_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('3e delivery_update_location', 'OK', pg_temp.call(v_a, 'authenticated', format('select public.delivery_update_location(%L, 11.5, -72.9)', v_o)));
  v_log := v_log || pg_temp.chk('3f delivery_complete_order', 'OK', pg_temp.call(v_a, 'authenticated', format('select public.delivery_complete_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('3g estado final', 'delivered', (select status from public.orders where id = v_o));
  v_o := pg_temp.mk(v_c, v_rid, 'ready', null);
  perform pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_assign_delivery(%L)', v_o));
  select delivery_person_id into v_a from public.orders where id = v_o;
  v_log := v_log || pg_temp.chk('3h delivery_reject_order (reasigna)', 'OK', pg_temp.call(v_a, 'authenticated', format('select public.delivery_reject_order(%L)', v_o)));
  v_log := v_log || pg_temp.chk('3i restaurant_cancel_order', 'OK', pg_temp.call(v_o1, 'authenticated', format('select public.restaurant_cancel_order(%L)', v_o)));

  -- 4) SELECT intacto
  select count(*) into v_n from public.orders where user_id = v_c;
  v_log := v_log || pg_temp.chk('4a cliente ve sus pedidos', (v_n::text), (select count(*)::text from (select 1 from public.orders where user_id = v_c) x));
  perform set_config('request.jwt.claims', json_build_object('sub', v_c, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_c::text, true);
  set local role authenticated;
  select count(*) into v_n from public.orders where user_id = v_c;
  reset role;
  v_log := v_log || E'\n4b el cliente sigue viendo pedidos con la política nueva: ' || v_n || case when v_n > 0 then ' OK' else '  <-- FALLO' end;

  raise exception E'RESULTADO_PRUEBA_S1_5 (rollback total)\n%', v_log;
end $test$;
