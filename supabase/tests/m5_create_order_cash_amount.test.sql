-- LOOP_CLIENT_05C · pruebas de M4 + M5 (cash_amount)
-- Transacción abortada: el DO termina con RAISE EXCEPTION y todo se revierte; los resultados
-- viajan en el mensaje. Todas las líneas deben terminar en OK. Después, verificar por separado
-- que el conteo de pedidos no cambió.
--   C1 sin cash_amount (null) -> OK, se guarda null     C2 cash >= total -> OK y se guarda
--   C3 cash < total -> invalid_cash_amount              C4 online + cash -> invalid_cash_amount
--   C5 cash 0 / negativo -> invalid_cash_amount         C6 sobre el tope -> invalid_cash_amount
--   C7 llamada de 6 argumentos (app en caché) sigue OK  C8 el total lo calcula el servidor
--   C9 el cliente NO puede modificar cash_amount (guard_order_update)

do $t$
declare
  res text := '';
  v_user uuid; v_rest uuid; v_prod uuid;
  o public.orders; total_ numeric;
  msg text;
begin
  select p.id into v_user from public.profiles p where p.role = 'client' order by p.id limit 1;
  select r.id into v_rest from public.restaurants r
   where r.approved and exists (select 1 from public.products x where x.restaurant_id = r.id and x.available)
   order by r.id limit 1;
  update public.restaurants set status = 'open' where id = v_rest;
  select id into v_prod from public.products where restaurant_id = v_rest and available order by id limit 1;

  perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_user::text, true);

  -- C1
  o := public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery',
        jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 1)), gen_random_uuid(), null);
  total_ := o.total;
  res := res || format('C1 null: cash_amount=%s %s' || E'\n', o.cash_amount, case when o.cash_amount is null then 'OK' else 'FALLA' end);

  -- C2
  o := public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery',
        jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 1)), gen_random_uuid(), (total_ + 5000)::integer);
  res := res || format('C2 cash>=total: guardado=%s (total %s) %s' || E'\n', o.cash_amount, o.total,
        case when o.cash_amount = (total_ + 5000)::integer then 'OK' else 'FALLA' end);
  -- C8 el total es del servidor (no depende de cash)
  res := res || format('C8 total servidor: %s = %s %s' || E'\n', o.total, total_, case when o.total = total_ then 'OK' else 'FALLA' end);

  -- C9 el cliente no puede cambiar cash_amount
  begin
    update public.orders set cash_amount = 1 where id = o.id;
    res := res || 'C9 update cash_amount: SIN ERROR FALLA' || E'\n';
  exception when others then
    res := res || format('C9 update cash_amount bloqueado: %s OK' || E'\n', sqlstate);
  end;

  -- C3
  begin
    perform public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery',
        jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 1)), gen_random_uuid(), (total_ - 1)::integer);
    res := res || 'C3 cash<total: SIN ERROR FALLA' || E'\n';
  exception when others then
    res := res || format('C3 cash<total: %s %s' || E'\n', sqlerrm, case when sqlerrm = 'invalid_cash_amount' then 'OK' else 'FALLA' end);
  end;

  -- C4
  begin
    perform public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'online',
        jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 1)), gen_random_uuid(), (total_ + 5000)::integer);
    res := res || 'C4 online+cash: SIN ERROR FALLA' || E'\n';
  exception when others then
    res := res || format('C4 online+cash: %s %s' || E'\n', sqlerrm, case when sqlerrm = 'invalid_cash_amount' then 'OK' else 'FALLA' end);
  end;

  -- C5 (0 y negativo)
  foreach msg in array array['0', '-100'] loop
    begin
      perform public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery',
          jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 1)), gen_random_uuid(), msg::integer);
      res := res || format('C5 cash %s: SIN ERROR FALLA' || E'\n', msg);
    exception when others then
      res := res || format('C5 cash %s: %s %s' || E'\n', msg, sqlerrm, case when sqlerrm = 'invalid_cash_amount' then 'OK' else 'FALLA' end);
    end;
  end loop;

  -- C6 tope
  begin
    perform public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery',
        jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 1)), gen_random_uuid(), 10000001);
    res := res || 'C6 tope: SIN ERROR FALLA' || E'\n';
  exception when others then
    res := res || format('C6 tope: %s %s' || E'\n', sqlerrm, case when sqlerrm = 'invalid_cash_amount' then 'OK' else 'FALLA' end);
  end;

  -- C7 app en caché: 6 argumentos por nombre
  o := public.create_order(p_restaurant_id := v_rest, p_delivery_address := 'Calle 15 #10-20',
        p_special_instructions := 'ref', p_payment_method := 'cash_on_delivery',
        p_items := jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 1)),
        p_client_order_id := gen_random_uuid());
  res := res || format('C7 6 args: pedido %s cash=%s %s', o.id is not null, o.cash_amount, case when o.id is not null and o.cash_amount is null then 'OK' else 'FALLA' end);

  raise exception E'RESULTADOS\n%', res;
end
$t$;
