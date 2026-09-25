-- Rollback de LOOP_FLOW_01 · F1.2: restaura las versiones de S1.3 (sin plazos ni avisos).
-- Antes de ejecutar este archivo, ejecutar el rollback de F1.3 (desprogramar el job).
drop function if exists private.expire_overdue_orders();
drop function if exists private.notify_no_delivery(uuid);
drop function if exists public.server_time();

-- Para restaurar assign_next_driver, restaurant_advance_order, delivery_accept_order y
-- delivery_reject_order a su versión de S1.3, volver a ejecutar sus bloques
-- "create or replace" de 20260924000520_s1_3_order_transition_rpcs.sql.
