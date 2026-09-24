-- PRUEBA de M1 (LOOP_CLIENT_05) — SE EJECUTA COMPLETA DENTRO DE UNA TRANSACCIÓN
-- QUE TERMINA EN ROLLBACK: no deja ningún cambio en la base.
--
-- Qué demuestra:
--   A) ANTES de M1: un cliente autenticado SÍ puede insertar directo en orders (el hallazgo).
--   B) Se aplica M1 dentro de la transacción.
--   C) DESPUÉS de M1: el INSERT directo a orders y a order_items queda BLOQUEADO (42501).
--   D) El RPC create_order SIGUE funcionando para el cliente (crea 1 pedido con sus ítems).
begin;

-- Datos de prueba reales (solo lectura): un cliente, un restaurante abierto y un producto disponible.
create temp table _t as
select
  (select id from public.profiles where role = 'client' limit 1)                                    as uid,
  (select r.id from public.restaurants r where r.approved and r.status = 'open' limit 1)            as rid;
alter table _t add column pid uuid;
update _t set pid = (select p.id from public.products p where p.restaurant_id = _t.rid and p.available limit 1);
grant select on _t to authenticated;

select 'datos' as paso, uid is not null as hay_cliente, rid is not null as hay_restaurante, pid is not null as hay_producto from _t;

-- Actuar como ese cliente autenticado.
select set_config('request.jwt.claims', json_build_object('sub', (select uid from _t), 'role', 'authenticated')::text, true);
set local role authenticated;

-- A) ANTES de M1: insert directo (debe FUNCIONAR = el hallazgo).
do $$
declare v_id uuid;
begin
  insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method)
  values ((select uid from _t), (select rid from _t), 1, 'Direccion de prueba', 'cash_on_delivery')
  returning id into v_id;
  raise notice 'A) ANTES de M1: insert directo PERMITIDO (total=1) -> id %', v_id;
end $$;

-- B) Aplicar M1 (como el dueño de las tablas).
reset role;
drop policy if exists orders_insert_own on public.orders;
drop policy if exists order_items_insert_own_order on public.order_items;

-- C) DESPUÉS de M1: insert directo bloqueado.
select set_config('request.jwt.claims', json_build_object('sub', (select uid from _t), 'role', 'authenticated')::text, true);
set local role authenticated;

do $$
begin
  begin
    insert into public.orders (user_id, restaurant_id, total, delivery_address, payment_method)
    values ((select uid from _t), (select rid from _t), 1, 'Direccion de prueba', 'cash_on_delivery');
    raise exception 'FALLO: el insert directo a orders NO fue bloqueado';
  exception when insufficient_privilege then
    raise notice 'C1) DESPUES de M1: insert directo a orders BLOQUEADO (42501) OK';
  end;
end $$;

do $$
declare v_oid uuid;
begin
  -- Un pedido existente del mismo cliente (creado antes, en el paso A) para probar order_items.
  select id into v_oid from public.orders where user_id = (select uid from _t) order by created_at desc limit 1;
  begin
    insert into public.order_items (order_id, product_id, quantity, unit_price)
    values (v_oid, (select pid from _t), 1, 1);
    raise exception 'FALLO: el insert directo a order_items NO fue bloqueado';
  exception when insufficient_privilege then
    raise notice 'C2) DESPUES de M1: insert directo a order_items BLOQUEADO (42501) OK';
  end;
end $$;

-- D) El RPC sigue funcionando.
do $$
declare v_order public.orders;
begin
  select * into v_order from public.create_order(
    (select rid from _t), 'Direccion de prueba 123', 'ref', 'cash_on_delivery',
    jsonb_build_array(jsonb_build_object('product_id', (select pid from _t), 'quantity', 1))
  );
  if v_order.id is null then raise exception 'FALLO: create_order no devolvio pedido'; end if;
  raise notice 'D) create_order SIGUE FUNCIONANDO tras M1 -> id %, total %', v_order.id, v_order.total;
end $$;

reset role;
rollback;  -- nada de lo anterior queda en la base
