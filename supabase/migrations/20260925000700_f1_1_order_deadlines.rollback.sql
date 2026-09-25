-- Rollback de LOOP_FLOW_01 · F1.1
drop trigger if exists orders_set_confirm_deadline on public.orders;
drop function if exists private.set_order_confirm_deadline();
drop index if exists public.orders_confirm_deadline_idx;
drop index if exists public.orders_accept_deadline_idx;
alter table public.orders
  drop column if exists confirm_deadline,
  drop column if exists accept_deadline,
  drop column if exists cancel_reason;
alter table public.app_settings
  drop column if exists restaurant_confirm_seconds,
  drop column if exists delivery_accept_seconds;
