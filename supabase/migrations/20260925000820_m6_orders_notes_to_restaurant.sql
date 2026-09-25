-- LOOP_CLIENT_05C · M6 — orders.notes_to_restaurant
--
-- Nota corta del cliente para el restaurante ("sin cebolla"), separada de special_instructions
-- (que guarda la referencia de la dirección). Solo estructura: nullable, máximo 150 caracteres
-- (segunda barrera; la primera es el RPC create_order en M7, que RECHAZA lo que exceda).
-- guard_order_update NO se modifica: es lista permitida, así que un cliente no puede cambiar
-- esta columna (se verifica en el test de M7). Reversible: ver el .rollback.sql

alter table public.orders
  add column if not exists notes_to_restaurant text
    check (notes_to_restaurant is null or char_length(notes_to_restaurant) <= 150);
