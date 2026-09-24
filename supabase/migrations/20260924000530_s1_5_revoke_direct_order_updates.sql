-- LOOP_SECURITY_01 · S1.5 — Cerrar el UPDATE directo de pedidos para los no admin
--
-- REQUIERE S1.3 (RPC) y S1.4 (frontend que las usa) aplicadas y desplegadas.
--
-- Hasta ahora la política orders_update_involved dejaba a cliente, restaurante y domiciliario
-- hacer UPDATE directo sobre orders (la barrera real era el trigger guard_order_update).
-- Con las RPC de S1.3 ya no hace falta: las funciones son SECURITY DEFINER (dueño postgres,
-- BYPASSRLS) y no dependen de ninguna política de UPDATE.
--
-- Cambios:
--   1. Se elimina orders_update_involved.
--   2. Se crea orders_update_admin: solo el admin (private.is_admin()) puede hacer UPDATE directo
--      (el panel de admin sigue funcionando).
--
-- Efecto: un cliente, restaurante o domiciliario que intente orders.update() desde el navegador
-- afecta 0 filas. Una app antigua en caché que aún haga update() directo deja de funcionar
-- (por eso esta migración va DESPUÉS del deploy de S1.4). guard_order_update queda como
-- segunda barrera para las RPC y para el admin/service_role.
--
-- No cambia SELECT ni ninguna otra política. Reversible: ver el .rollback.sql

drop policy if exists orders_update_involved on public.orders;

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
