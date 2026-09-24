-- ROLLBACK de S1.3: elimina las 10 RPC y las 2 funciones internas.
-- Hacerlo DESPUÉS de revertir el frontend que las llama (si no, restaurante, domiciliario y
-- "cancelar" del cliente fallarían). Los pedidos y los intentos de asignación no se tocan.
drop function if exists public.restaurant_advance_order(uuid);
drop function if exists public.restaurant_assign_delivery(uuid);
drop function if exists public.restaurant_retry_assignment(uuid);
drop function if exists public.restaurant_cancel_order(uuid);
drop function if exists public.delivery_set_shift(boolean);
drop function if exists public.delivery_accept_order(uuid);
drop function if exists public.delivery_reject_order(uuid);
drop function if exists public.delivery_complete_order(uuid);
drop function if exists public.delivery_update_location(uuid, double precision, double precision);
drop function if exists public.client_cancel_order(uuid);
drop function if exists private.assign_next_driver(uuid);
drop function if exists private.require_active_role(text);
