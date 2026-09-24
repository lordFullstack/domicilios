-- ROLLBACK de S1.5: restaura la política orders_update_involved tal como estaba (verificada en la
-- base el 24-sep-2026) y quita la de admin. Úsalo si una app en caché o un flujo legítimo aún
-- necesita el UPDATE directo mientras se corrige.
drop policy if exists orders_update_admin on public.orders;

drop policy if exists orders_update_involved on public.orders;
create policy orders_update_involved on public.orders
  for update to authenticated
  using (
    (user_id = (select auth.uid()))
    or (delivery_person_id = (select auth.uid()))
    or exists (
      select 1 from public.restaurants r
       where r.id = orders.restaurant_id and r.owner_id = (select auth.uid())
    )
    or (
      delivery_person_id is null
      and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'delivery')
    )
    or private.is_admin()
  );
