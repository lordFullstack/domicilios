-- LOOP_CLIENT_05 · M2 — Columna client_order_id + índice único por usuario
--
-- Base de la idempotencia: el celular genera un UUID por intención de compra
-- (client_order_id). Con el índice único (user_id, client_order_id), un mismo
-- usuario no puede tener dos pedidos con la misma llave.
--
--  * La columna es NULLABLE: los pedidos existentes y los clientes antiguos
--    (app en caché que no la envía) siguen funcionando sin llave.
--  * El índice es PARCIAL (where client_order_id is not null): las filas sin
--    llave no participan, así que no hay conflicto con los pedidos actuales.
--  * Es POR USUARIO: la llave de otro usuario nunca colisiona.
--
-- No cambia RLS ni el trigger guard_order_update: al ser una lista permitida,
-- ningún cliente puede modificar client_order_id tras crear el pedido.
--
-- Reversible: ver 20260924000200_m2_orders_client_order_id.rollback.sql

alter table public.orders
  add column if not exists client_order_id uuid;

create unique index if not exists orders_user_client_order_id_key
  on public.orders (user_id, client_order_id)
  where client_order_id is not null;

comment on column public.orders.client_order_id is
  'Llave de idempotencia generada por el cliente (UUID). Unica por (user_id, client_order_id); null en pedidos antiguos.';
