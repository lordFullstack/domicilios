-- ROLLBACK de M2 (solo si M3 no está aplicada, o tras hacer rollback de M3).
drop index if exists public.orders_user_client_order_id_key;
alter table public.orders drop column if exists client_order_id;
