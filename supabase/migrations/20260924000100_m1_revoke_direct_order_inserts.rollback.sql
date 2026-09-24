-- ROLLBACK de M1: restaura las dos políticas tal como estaban (verificadas en la base, 24-sep-2026).
-- Solo usar si hay que volver a permitir inserts directos (NO recomendado: reabre el hallazgo de seguridad).

create policy orders_insert_own on public.orders
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy order_items_insert_own_order on public.order_items
  for insert to authenticated
  with check (exists (
    select 1 from public.orders o
     where o.id = order_items.order_id
       and o.user_id = (select auth.uid())
  ));
