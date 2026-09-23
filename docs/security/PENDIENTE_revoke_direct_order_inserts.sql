-- ⚠️ APLICAR SOLO DESPUÉS de desplegar en Vercel el frontend que usa
-- supabase.rpc('create_order') (Checkout). Si se aplica antes, la versión
-- vieja de la app no podrá crear pedidos.
--
-- Cierra la última puerta: sin estas políticas, la ÚNICA forma de crear un
-- pedido es la RPC create_order (que calcula precios en el servidor).
drop policy if exists orders_insert_own on public.orders;
drop policy if exists order_items_insert_own_order on public.order_items;
