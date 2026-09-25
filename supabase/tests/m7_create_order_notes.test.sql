-- LOOP_CLIENT_05C · pruebas de M6 + M7 (notas al restaurante)
-- Transacción abortada (RAISE EXCEPTION al final). Todas las líneas deben terminar en OK.
--   N1 nota de 150 -> OK          N2 nota de 151 -> notes_too_long (no se recorta)
--   N3 vacía / solo espacios -> null   N4 trim aplicado
--   N5 las validaciones de cash_amount de M5 siguen activas
--   N6 llamadas de 6 y 7 argumentos (app en caché) siguen OK
--   N7 el cliente NO puede modificar notes_to_restaurant (guard_order_update, 42501)
--   N8 special_instructions conserva su uso (referencia de la dirección)

do $t$
declare
  res text := '';
  v_user uuid; v_rest uuid; v_prod uuid;
  o public.orders; total_ numeric;
  items_ jsonb;
begin
  select p.id into v_user from public.profiles p where p.role = 'client' order by p.id limit 1;
  select r.id into v_rest from public.restaurants r
   where r.approved and exists (select 1 from public.products x where x.restaurant_id = r.id and x.available)
   order by r.id limit 1;
  update public.restaurants set status = 'open' where id = v_rest;
  select id into v_prod from public.products where restaurant_id = v_rest and available order by id limit 1;
  items_ := jsonb_build_array(jsonb_build_object('product_id', v_prod, 'quantity', 1));
  perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_user::text, true);

  o := public.create_order(v_rest, 'Calle 15 #10-20', 'casa azul', 'cash_on_delivery', items_, gen_random_uuid(), null, repeat('a', 150));
  total_ := o.total;
  res := res || format('N1 150 chars: guardadas=%s %s' || E'\n', char_length(o.notes_to_restaurant), case when char_length(o.notes_to_restaurant) = 150 then 'OK' else 'FALLA' end);
  res := res || format('N8 special_instructions intacto: %s %s' || E'\n', o.special_instructions, case when o.special_instructions = 'casa azul' then 'OK' else 'FALLA' end);

  begin
    perform public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery', items_, gen_random_uuid(), null, repeat('a', 151));
    res := res || 'N2 151 chars: SIN ERROR FALLA' || E'\n';
  exception when others then
    res := res || format('N2 151 chars: %s %s' || E'\n', sqlerrm, case when sqlerrm = 'notes_too_long' then 'OK' else 'FALLA' end);
  end;

  o := public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery', items_, gen_random_uuid(), null, '   ');
  res := res || format('N3 solo espacios: notes=%s %s' || E'\n', coalesce(o.notes_to_restaurant, '<null>'), case when o.notes_to_restaurant is null then 'OK' else 'FALLA' end);

  o := public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery', items_, gen_random_uuid(), null, '  sin cebolla  ');
  res := res || format('N4 trim: [%s] %s' || E'\n', o.notes_to_restaurant, case when o.notes_to_restaurant = 'sin cebolla' then 'OK' else 'FALLA' end);

  begin
    perform public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery', items_, gen_random_uuid(), (total_ - 1)::integer, 'x');
    res := res || 'N5 cash<total: SIN ERROR FALLA' || E'\n';
  exception when others then
    res := res || format('N5 cash<total sigue activo: %s %s' || E'\n', sqlerrm, case when sqlerrm = 'invalid_cash_amount' then 'OK' else 'FALLA' end);
  end;

  o := public.create_order(v_rest, 'Calle 15 #10-20', 'ref', 'cash_on_delivery', items_, gen_random_uuid(), (total_ + 1000)::integer);
  res := res || format('N6a 7 args: cash=%s notes=%s %s' || E'\n', o.cash_amount, coalesce(o.notes_to_restaurant, '<null>'), case when o.cash_amount is not null and o.notes_to_restaurant is null then 'OK' else 'FALLA' end);
  o := public.create_order(p_restaurant_id := v_rest, p_delivery_address := 'Calle 15 #10-20', p_special_instructions := 'ref',
        p_payment_method := 'cash_on_delivery', p_items := items_, p_client_order_id := gen_random_uuid());
  res := res || format('N6b 6 args: pedido=%s %s' || E'\n', o.id is not null, case when o.id is not null then 'OK' else 'FALLA' end);

  begin
    update public.orders set notes_to_restaurant = 'cambiada' where id = o.id;
    res := res || 'N7 update notes: SIN ERROR FALLA';
  exception when others then
    res := res || format('N7 update notes bloqueado: %s OK', sqlstate);
  end;

  raise exception E'RESULTADOS\n%', res;
end
$t$;
