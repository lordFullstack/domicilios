-- PRUEBA de M2 (LOOP_CLIENT_05) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base.
-- (Se ejecuta con execute_sql/SQL Editor; el resultado llega en el mensaje de la excepción.)
--
-- Qué demuestra:
--   1) Todos los pedidos existentes quedan con client_order_id = null (no se toca ninguno).
--   2) Dos pedidos del MISMO usuario con la MISMA llave -> el segundo falla (unique_violation).
--   3) Dos pedidos del mismo usuario SIN llave (null) -> permitido (índice parcial).
--   4) La MISMA llave en OTRO usuario -> permitido (el índice es por usuario).
--   5) Un cliente NO puede modificar client_order_id de su pedido (guard_order_update, sin tocar el trigger).
do $$
declare
  v_u1 uuid; v_u2 uuid; v_rid uuid; v_key uuid := gen_random_uuid(); v_id1 uuid; v_id2 uuid;
  v_total int; v_nulls int; v_log text := '';
begin
  -- M2 (idéntico al archivo de migración)
  alter table public.orders add column if not exists client_order_id uuid;
  create unique index if not exists orders_user_client_order_id_key
    on public.orders (user_id, client_order_id) where client_order_id is not null;

  select id into v_u1 from public.profiles where role = 'client' order by id limit 1;
  select id into v_u2 from public.profiles where role = 'client' and id <> v_u1 order by id limit 1;
  select id into v_rid from public.restaurants where approved limit 1;

  select count(*), count(*) filter (where client_order_id is null) into v_total, v_nulls from public.orders;
  v_log := '1) pedidos existentes: ' || v_total || ', con client_order_id null: ' || v_nulls || case when v_total = v_nulls then ' OK' else '  <-- FALLO' end;

  insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method, client_order_id)
  values (v_u1, v_rid, 1, 'Direccion prueba', 'cash_on_delivery', v_key) returning id into v_id1;

  begin
    insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method, client_order_id)
    values (v_u1, v_rid, 1, 'Direccion prueba', 'cash_on_delivery', v_key);
    v_log := v_log || E'\n2) misma llave, mismo usuario: NO bloqueado  <-- FALLO';
  exception when unique_violation then
    v_log := v_log || E'\n2) misma llave, mismo usuario: BLOQUEADO (unique_violation) OK';
  end;

  begin
    insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method) values (v_u1, v_rid, 1, 'Direccion prueba', 'cash_on_delivery');
    insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method) values (v_u1, v_rid, 1, 'Direccion prueba', 'cash_on_delivery');
    v_log := v_log || E'\n3) dos pedidos sin llave (null): PERMITIDOS (índice parcial) OK';
  exception when others then
    v_log := v_log || E'\n3) sin llave: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
  end;

  if v_u2 is not null then
    begin
      insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method, client_order_id)
      values (v_u2, v_rid, 1, 'Direccion prueba', 'cash_on_delivery', v_key);
      v_log := v_log || E'\n4) misma llave en OTRO usuario: PERMITIDA (índice por usuario) OK';
    exception when others then
      v_log := v_log || E'\n4) otro usuario: error ' || sqlstate || ' ' || sqlerrm || '  <-- FALLO';
    end;
  else
    v_log := v_log || E'\n4) (omitida: solo hay un cliente)';
  end if;

  -- 5) el cliente no puede modificar la llave
  perform set_config('request.jwt.claims', json_build_object('sub', v_u1, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_u1::text, true);
  set local role authenticated;
  begin
    update public.orders set client_order_id = gen_random_uuid() where id = v_id1;
    v_log := v_log || E'\n5) cliente cambia client_order_id: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n5) cliente cambia client_order_id: BLOQUEADO por guard_order_update (' || sqlstate || ') OK';
  when others then
    v_log := v_log || E'\n5) error distinto: ' || sqlstate || ' ' || sqlerrm;
  end;
  reset role;

  raise exception E'RESULTADO_PRUEBA_M2 (rollback total)\n%', v_log;
end $$;
