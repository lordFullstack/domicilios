-- LOOP_FLOW_01 · F1.1 — Horas límite de respuesta (datos)
--
-- Solo estructura; no cambia ningún comportamiento todavía.
--   1. app_settings.restaurant_confirm_seconds / delivery_accept_seconds (120 por defecto, 30–900).
--   2. orders.confirm_deadline: la fija un trigger BEFORE INSERT (create_order NO se modifica).
--   3. orders.accept_deadline: la fija la asignación de domiciliario (F1.2).
--   4. orders.cancel_reason: null = cancelación manual o pedido antiguo.
--   5. Índices parciales para que el job de vencimiento sea barato.
-- Los pedidos existentes quedan con confirm_deadline null (sin plazo): no se les aplica vencimiento.
-- Reversible: ver el .rollback.sql

alter table public.app_settings
  add column if not exists restaurant_confirm_seconds integer not null default 120
    check (restaurant_confirm_seconds between 30 and 900),
  add column if not exists delivery_accept_seconds integer not null default 120
    check (delivery_accept_seconds between 30 and 900);

alter table public.orders
  add column if not exists confirm_deadline timestamptz,
  add column if not exists accept_deadline timestamptz,
  add column if not exists cancel_reason text
    check (cancel_reason in ('customer', 'restaurant', 'restaurant_timeout', 'admin'));

create index if not exists orders_confirm_deadline_idx
  on public.orders (confirm_deadline) where status = 'pending' and confirm_deadline is not null;
create index if not exists orders_accept_deadline_idx
  on public.orders (accept_deadline) where status = 'ready' and accept_deadline is not null;

create or replace function private.set_order_confirm_deadline()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_secs integer;
begin
  if new.confirm_deadline is null and new.status = 'pending' then
    select restaurant_confirm_seconds into v_secs from public.app_settings limit 1;
    new.confirm_deadline := now() + make_interval(secs => coalesce(v_secs, 120));
  end if;
  return new;
end;
$function$;

revoke all on function private.set_order_confirm_deadline() from public, anon, authenticated;

drop trigger if exists orders_set_confirm_deadline on public.orders;
create trigger orders_set_confirm_deadline
  before insert on public.orders
  for each row execute function private.set_order_confirm_deadline();
