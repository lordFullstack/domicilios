-- LOOP_SECURITY_00B — Aprobación de cuentas de restaurante y domiciliario
--
-- Problema verificado (24-sep-2026): el registro es público y cualquiera puede elegir el rol
-- 'restaurant' o 'delivery'; el perfil nace con active = true y el restaurante con
-- approved = true. Una cuenta falsa de domiciliario podría recibir pedidos con direcciones y
-- teléfonos reales, y un restaurante falso aparecería de inmediato en el catálogo.
--
-- Cambios (solo estos):
--   1. handle_new_user: los domiciliarios nacen con active = false hasta que un admin los
--      active (el panel de admin ya tiene "Activar"); clientes y dueños de restaurante nacen
--      activos. El dueño de restaurante se controla con restaurants.approved (punto 2): el
--      admin no tiene pantalla para activar cuentas de dueños, y un dueño solo ve lo suyo.
--      (Igual que antes en todo lo demás: whitelist de roles, 'admin' nunca por registro.)
--   2. restaurants.approved: el valor por defecto pasa de true a false. Un restaurante nuevo
--      no aparece para los clientes ni recibe pedidos hasta que el admin lo aprueba
--      (create_order ya exige approved).
--   3. private.guard_restaurant_write: un no-admin no puede insertar un restaurante con
--      approved = true (si no, se aprobaría a sí mismo enviando el campo explícito).
--
-- NO cambia ninguna cuenta ni restaurante existentes (los 2 restaurantes y 2 domiciliarios
-- actuales siguen activos y aprobados). Sin cambios de RLS.
-- Reversible: ver el .rollback.sql

create or replace function public.handle_new_user()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  requested_role text := new.raw_user_meta_data->>'role';
  safe_role text;
begin
  -- Whitelist explícito: 'admin' NUNCA se puede autoasignar por registro público.
  -- Los admins se crean manualmente en el backoffice, no por signUp().
  safe_role := case
    when requested_role in ('client', 'restaurant', 'delivery') then requested_role
    else 'client'
  end;

  insert into public.profiles (id, email, name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    safe_role,
    safe_role <> 'delivery'
  );
  return new;
end;
$function$;

alter table public.restaurants alter column approved set default false;

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
    if new.approved then
      raise exception 'restaurant_write_not_allowed'
        using errcode = '42501', detail = 'un restaurante nuevo debe ser aprobado por un administrador';
    end if;
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
