-- LOOP_FLOW_01 · pruebas de vencimiento (F1.1–F1.3)
-- Se ejecuta en una transacción abortada: el DO termina con RAISE EXCEPTION y todo se revierte;
-- los resultados viajan en el mensaje. Muta pedidos existentes (entregados/cancelados) solo dentro
-- de la transacción. Resultado esperado: todas las líneas terminan en OK.
--   T1 pending vencido -> cancelled + restaurant_timeout   T2 pending vigente no se toca
--   T3 confirmar vencido -> order_expired                  T4 asignado vencido -> reasigna al otro
--   T6 nadie acepta -> ready sin asignar + aviso, no se cancela
--   T7 nueva ronda vuelve a considerar a los excluidos     T8 aceptar a tiempo funciona
--   T9 preparing / in_delivery no se tocan                 T10 create_order intacto
--   T11 límites 30–900 en app_settings                     T12 conteo de pedidos igual

do $t$
declare
  res text := '';
  d1 uuid; d2 uuid; o1 uuid; o2 uuid; o3 uuid; o4 uuid; o5 uuid;
  own uuid;
  j jsonb; st text; dp uuid; cr text; n int; cnt0 int; att text;
begin
  select count(*) into cnt0 from public.orders;
  select id into d1 from public.profiles where role='delivery' and active order by id limit 1;
  select id into d2 from public.profiles where role='delivery' and active and id<>d1 order by id limit 1;
  select id into o1 from public.orders where status in ('delivered','cancelled') order by id limit 1;
  select id into o2 from public.orders where status in ('delivered','cancelled') and id<>o1 order by id limit 1;
  select id into o3 from public.orders where status in ('delivered','cancelled') and id not in (o1,o2) order by id limit 1;
  select id into o4 from public.orders where status in ('delivered','cancelled') and id not in (o1,o2,o3) order by id limit 1;
  select id into o5 from public.orders where status = 'delivered' and id not in (o1,o2,o3,o4) order by id limit 1;
  update public.profiles set on_shift = true where id in (d1,d2);
  update public.orders set delivery_person_id = null where delivery_person_id in (d1,d2) and status in ('ready','in_delivery');

  update public.orders set status='pending', confirm_deadline = now() - interval '1 second', cancel_reason=null, delivery_person_id=null where id=o1;
  update public.orders set status='pending', confirm_deadline = now() + interval '100 seconds', cancel_reason=null, delivery_person_id=null where id=o2;
  update public.orders set status='preparing', delivery_person_id=null where id=o4;
  update public.orders set status='in_delivery', delivery_person_id=d1 where id=o5;
  j := private.expire_overdue_orders();
  select status, cancel_reason into st, cr from public.orders where id=o1;
  res := res || format('T1: %s / %s %s' || E'\n', st, cr, case when st='cancelled' and cr='restaurant_timeout' then 'OK' else 'FALLA' end);
  select status into st from public.orders where id=o2;
  res := res || format('T2: %s %s' || E'\n', st, case when st='pending' then 'OK' else 'FALLA' end);
  select status into st from public.orders where id=o4;
  res := res || format('T9a: %s %s' || E'\n', st, case when st='preparing' then 'OK' else 'FALLA' end);
  select status into st from public.orders where id=o5;
  res := res || format('T9b: %s %s' || E'\n', st, case when st='in_delivery' then 'OK' else 'FALLA' end);

  select r.owner_id into own from public.orders o join public.restaurants r on r.id=o.restaurant_id where o.id=o2;
  update public.orders set confirm_deadline = now() - interval '1 second' where id=o2;
  perform set_config('request.jwt.claims', json_build_object('sub',own,'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', own::text, true);
  begin
    perform public.restaurant_advance_order(o2);
    res := res || 'T3: SIN ERROR FALLA' || E'\n';
  exception when others then
    res := res || format('T3: %s %s' || E'\n', sqlerrm, case when sqlerrm='order_expired' then 'OK' else 'FALLA' end);
  end;
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);

  update public.orders set status='ready', delivery_person_id=null, accept_deadline=null, assignment_round=1 where id=o3;
  update public.orders set status='delivered', delivery_person_id=null where id=o5;
  dp := private.assign_next_driver(o3);
  update public.orders set accept_deadline = now() - interval '1 second' where id=o3;
  j := private.expire_overdue_orders();
  select delivery_person_id into dp from public.orders where id=o3;
  select string_agg(outcome, ',' order by assigned_at) into att from public.order_assignment_attempts where order_id=o3;
  res := res || format('T4: reasignado a %s; intentos=%s %s' || E'\n', dp, att, case when dp is not null and att='expired,pending' then 'OK' else 'FALLA' end);

  update public.orders set accept_deadline = now() - interval '1 second' where id=o3;
  select count(*) into n from public.notifications where order_id=o3 and title like 'Sin domiciliario%';
  j := private.expire_overdue_orders();
  select status, delivery_person_id into st, dp from public.orders where id=o3;
  select count(*) - n into n from public.notifications where order_id=o3 and title like 'Sin domiciliario%';
  res := res || format('T6: status=%s dp=%s avisos=%s %s' || E'\n', st, dp, n, case when st='ready' and dp is null and n=1 then 'OK' else 'FALLA' end);

  update public.orders set assignment_round = assignment_round + 1 where id=o3;
  dp := private.assign_next_driver(o3);
  res := res || format('T7: %s %s' || E'\n', dp, case when dp is not null then 'OK' else 'FALLA' end);

  update public.orders set accept_deadline = now() + interval '100 seconds' where id=o3;
  perform set_config('request.jwt.claims', json_build_object('sub',dp,'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', dp::text, true);
  begin
    perform public.delivery_accept_order(o3);
    select status into st from public.orders where id=o3;
    res := res || format('T8: %s %s' || E'\n', st, case when st='in_delivery' then 'OK' else 'FALLA' end);
  exception when others then
    res := res || format('T8: ERROR %s FALLA' || E'\n', sqlerrm);
  end;
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  j := private.expire_overdue_orders();
  select status into st from public.orders where id=o3;
  res := res || format('T8b: %s %s' || E'\n', st, case when st='in_delivery' then 'OK' else 'FALLA' end);

  select (pg_get_functiondef('public.create_order(uuid,text,text,text,jsonb,uuid)'::regprocedure) not like '%confirm_deadline%')::text into st;
  res := res || format('T10: %s %s' || E'\n', st, case when st='true' then 'OK' else 'FALLA' end);
  begin
    update public.app_settings set delivery_accept_seconds = 10;
    res := res || 'T11: SIN ERROR FALLA' || E'\n';
  exception when check_violation then
    res := res || 'T11: OK' || E'\n';
  end;
  select count(*) into n from public.orders;
  res := res || format('T12: antes=%s ahora=%s %s', cnt0, n, case when cnt0=n then 'OK' else 'FALLA' end);
  raise exception E'RESULTADOS\n%', res;
end
$t$;
