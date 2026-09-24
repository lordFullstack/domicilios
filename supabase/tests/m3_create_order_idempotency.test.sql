-- PRUEBA de M3 (LOOP_CLIENT_05) — un solo bloque que termina en excepción a propósito:
-- la transacción se aborta y NO queda ningún cambio en la base.
-- (Se ejecuta con execute_sql/SQL Editor; el resultado llega en el mensaje de la excepción.)
-- Se corre con M3 YA aplicada (verifica el estado real de create_order).
--
-- Qué demuestra:
--   1) Firma única de create_order, 6 parámetros, SECURITY DEFINER, search_path vacío.
--   2) Permisos: authenticated y service_role sí; anon no.
--   3) Sin llave -> crea el pedido con client_order_id null.
--   4) Con llave nueva -> crea el pedido y guarda la llave.
--   5) Misma llave (2a y 3a vez) -> devuelve el MISMO pedido; solo existe 1 con esa llave.
--   6) Las validaciones siguen activas (dirección inválida, carrito vacío).
--   7) La misma llave en OTRO usuario crea su propio pedido (la llave es por usuario).
--   8) anon no puede ejecutar la función.
--   9) Al final: todo revertido (el conteo de pedidos vuelve al inicial).
do $$
declare
  v_u1 uuid; v_u2 uuid; v_rid uuid; v_pid uuid; v_key uuid := gen_random_uuid();
  o1 public.orders; o2 public.orders; o3 public.orders; o4 public.orders; o5 public.orders;
  v_items jsonb; v_before int; v_inside int; v_withkey int;
  v_nsig int; v_nparams int; v_secdef boolean; v_cfg text[]; v_anon boolean; v_auth boolean; v_svc boolean;
  v_log text := '';
begin
  select count(*) into v_before from public.orders;

  select count(*), max(p.pronargs), bool_and(p.prosecdef), max(p.proconfig),
         bool_and(has_function_privilege('anon', p.oid, 'execute')),
         bool_and(has_function_privilege('authenticated', p.oid, 'execute')),
         bool_and(has_function_privilege('service_role', p.oid, 'execute'))
    into v_nsig, v_nparams, v_secdef, v_cfg, v_anon, v_auth, v_svc
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'create_order';
  v_log := '1) firmas=' || v_nsig || ' params=' || v_nparams || ' secdef=' || v_secdef || ' config=' || coalesce(v_cfg::text, 'null')
        || case when v_nsig = 1 and v_nparams = 6 and v_secdef and v_cfg = array['search_path=""'] then ' OK' else '  <-- FALLO' end;
  v_log := v_log || E'\n2) anon=' || v_anon || ' authenticated=' || v_auth || ' service_role=' || v_svc
        || case when not v_anon and v_auth and v_svc then ' OK' else '  <-- FALLO' end;

  select id into v_u1 from public.profiles where role = 'client' order by id limit 1;
  select id into v_u2 from public.profiles where role = 'client' and id <> v_u1 order by id limit 1;
  select r.id, p.id into v_rid, v_pid
    from public.restaurants r join public.products p on p.restaurant_id = r.id
   where r.approved and r.status = 'open' and p.available limit 1;
  v_items := jsonb_build_array(jsonb_build_object('product_id', v_pid, 'quantity', 1));

  perform set_config('request.jwt.claims', json_build_object('sub', v_u1, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_u1::text, true);
  set local role authenticated;

  o1 := public.create_order(v_rid, 'Direccion prueba 123', null, 'cash_on_delivery', v_items);
  v_log := v_log || E'\n3) sin llave: ' || case when o1.id is not null and o1.client_order_id is null then 'OK (client_order_id null)' else 'FALLO' end;

  o2 := public.create_order(v_rid, 'Direccion prueba 123', null, 'cash_on_delivery', v_items, v_key);
  v_log := v_log || E'\n4) llave nueva: ' || case when o2.id is not null and o2.client_order_id = v_key then 'OK (llave guardada)' else 'FALLO' end;

  o3 := public.create_order(v_rid, 'Direccion prueba 123', null, 'cash_on_delivery', v_items, v_key);
  o4 := public.create_order(v_rid, 'Direccion prueba 123', null, 'cash_on_delivery', v_items, v_key);
  v_log := v_log || E'\n5) misma llave 2a y 3a vez: ' || case when o3.id = o2.id and o4.id = o2.id then 'OK (mismo pedido)' else 'FALLO' end;

  begin
    perform public.create_order(v_rid, 'x', null, 'cash_on_delivery', v_items);
    v_log := v_log || E'\n6a) direccion invalida: NO bloqueada  <-- FALLO';
  exception when others then
    v_log := v_log || E'\n6a) direccion invalida: ' || case when sqlerrm like '%invalid_address%' then 'OK' else 'FALLO ' || sqlerrm end;
  end;
  begin
    perform public.create_order(v_rid, 'Direccion prueba 123', null, 'cash_on_delivery', '[]'::jsonb);
    v_log := v_log || E'\n6b) carrito vacio: NO bloqueado  <-- FALLO';
  exception when others then
    v_log := v_log || E'\n6b) carrito vacio: ' || case when sqlerrm like '%empty_cart%' then 'OK' else 'FALLO ' || sqlerrm end;
  end;

  if v_u2 is not null then
    perform set_config('request.jwt.claims', json_build_object('sub', v_u2, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', v_u2::text, true);
    o5 := public.create_order(v_rid, 'Direccion prueba 123', null, 'cash_on_delivery', v_items, v_key);
    v_log := v_log || E'\n7) misma llave en otro usuario: ' || case when o5.id <> o2.id and o5.user_id = v_u2 then 'OK (pedido propio)' else 'FALLO' end;
  else
    v_log := v_log || E'\n7) (omitida: solo hay un cliente)';
  end if;

  reset role;
  set local role anon;
  begin
    perform public.create_order(v_rid, 'Direccion prueba 123', null, 'cash_on_delivery', v_items);
    v_log := v_log || E'\n8) anon: NO bloqueado  <-- FALLO';
  exception when insufficient_privilege then
    v_log := v_log || E'\n8) anon: BLOQUEADO (' || sqlstate || ') OK';
  when others then
    v_log := v_log || E'\n8) anon: error distinto ' || sqlstate || ' ' || sqlerrm;
  end;
  reset role;

  select count(*) into v_withkey from public.orders where client_order_id = v_key and user_id = v_u1;
  select count(*) into v_inside from public.orders;
  v_log := v_log || E'\n   pedidos del usuario 1 con la llave: ' || v_withkey || ' (esperado 1); pedidos dentro de la prueba: ' || v_inside || ' (antes ' || v_before || ')';

  raise exception E'RESULTADO_PRUEBA_M3 (rollback total)\n%', v_log;
end $$;
