-- LOOP_CLIENT_05 · M1 — Cerrar los inserts directos a orders / order_items
--
-- Problema: las políticas RLS orders_insert_own y order_items_insert_own_order
-- siguen permitiendo que un cliente autenticado inserte pedidos e ítems
-- saltándose el RPC create_order (con total y unit_price arbitrarios).
--
-- Efecto: sin ninguna política de INSERT, RLS niega todo INSERT hecho con los
-- roles anon/authenticated. La ÚNICA vía para crear un pedido pasa a ser
-- public.create_order, que es SECURITY DEFINER, pertenece a postgres (rol con
-- BYPASSRLS) y por eso NO se ve afectada por este cambio.
--
-- Precondición verificada: el frontend en producción crea pedidos con
-- supabase.rpc('create_order') y el código no tiene ningún insert directo a
-- orders / order_items (src/: 0 coincidencias).
--
-- Reversible: ver 20260924000100_m1_revoke_direct_order_inserts.rollback.sql

drop policy if exists orders_insert_own on public.orders;
drop policy if exists order_items_insert_own_order on public.order_items;
