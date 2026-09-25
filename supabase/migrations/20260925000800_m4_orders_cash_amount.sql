-- LOOP_CLIENT_05C · M4 — orders.cash_amount
--
-- Con cuánto pagará el cliente en efectivo (para que el domiciliario lleve cambio).
-- Solo estructura: nullable (null = "sin especificar") y entero positivo. La validación de negocio
-- (solo con efectivo, >= total, tope) la hace el RPC create_order en M5.
-- guard_order_update NO se modifica: es lista permitida, así que ningún usuario no admin puede
-- cambiar esta columna (se verifica en el test de M5).
-- Los pedidos existentes quedan con cash_amount = null. Reversible: ver el .rollback.sql

alter table public.orders
  add column if not exists cash_amount integer
    check (cash_amount is null or cash_amount > 0);
