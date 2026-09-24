-- LOOP_SECURITY_00 (hotfix) — Impedir la escalada de privilegios en profiles y restaurants
--
-- Problema verificado (transacción abortada, 24-sep-2026): la política
-- profiles_update_own_or_admin deja a cualquier usuario actualizar su PROPIA fila
-- completa y el rol authenticated tiene UPDATE sobre TODAS las columnas. Un cliente
-- pudo hacer  update profiles set role = 'admin'  y private.is_admin() devolvió true.
-- restaurants tiene el mismo patrón (el dueño puede tocar approved, owner_id y ratings).
--
-- Solución: la misma técnica que private.guard_order_update — un trigger BEFORE con
-- LISTA PERMITIDA por rol. Todo cambio no listado se rechaza con errcode 42501.
--
--   * Sin usuario (service_role, SQL del dashboard, Edge Functions): sin restricciones.
--   * Admin: sin restricciones.
--   * pg_trigger_depth() > 1: el UPDATE lo hizo otro trigger (p. ej. update_ratings_after_insert
--     al calificar un pedido): se permite. Un UPDATE directo del cliente tiene profundidad 1.
--   * profiles (no admin), solo: name, phone, avatar_url, vehicle_type, vehicle_plate.
--   * restaurants (no admin), UPDATE solo: name, description, image_url, address, phone,
--     status, cover_url, category.  NO: approved, owner_id, rating_avg, rating_count.
--   * restaurants INSERT (no admin): rating_avg y rating_count deben ser 0.
--     (approved sigue teniendo default true: es la regla de negocio actual, no se cambia aquí.)
--
-- No cambia ninguna política RLS ni ninguna columna. Reversible: ver el .rollback.sql

create or replace function private.guard_profile_update()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_changed text[];
begin
  if v_uid is null or pg_trigger_depth() > 1 then
    return new;
  end if;
  if (select private.is_admin()) then
    return new;
  end if;

  select coalesce(array_agg(n.key), '{}')
    into v_changed
    from jsonb_each(to_jsonb(new)) n
    join jsonb_each(to_jsonb(old)) o using (key)
   where n.value is distinct from o.value
     and n.key <> 'updated_at';

  if v_changed <@ array['name', 'phone', 'avatar_url', 'vehicle_type', 'vehicle_plate'] then
    return new;
  end if;

  raise exception 'profile_update_not_allowed'
    using errcode = '42501',
          detail = format('Cambio no permitido en columnas: %s', array_to_string(v_changed, ', '));
end;
$function$;

create or replace function private.guard_restaurant_write()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_changed text[];
begin
  if v_uid is null or pg_trigger_depth() > 1 then
    return new;
  end if;
  if (select private.is_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.rating_avg <> 0 or new.rating_count <> 0 then
      raise exception 'restaurant_write_not_allowed'
        using errcode = '42501', detail = 'rating_avg y rating_count solo los actualiza el sistema';
    end if;
    return new;
  end if;

  select coalesce(array_agg(n.key), '{}')
    into v_changed
    from jsonb_each(to_jsonb(new)) n
    join jsonb_each(to_jsonb(old)) o using (key)
   where n.value is distinct from o.value
     and n.key <> 'updated_at';

  if v_changed <@ array['name', 'description', 'image_url', 'address', 'phone', 'status', 'cover_url', 'category'] then
    return new;
  end if;

  raise exception 'restaurant_write_not_allowed'
    using errcode = '42501',
          detail = format('Cambio no permitido en columnas: %s', array_to_string(v_changed, ', '));
end;
$function$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function private.guard_profile_update();

drop trigger if exists restaurants_guard_write on public.restaurants;
create trigger restaurants_guard_write
  before insert or update on public.restaurants
  for each row execute function private.guard_restaurant_write();
