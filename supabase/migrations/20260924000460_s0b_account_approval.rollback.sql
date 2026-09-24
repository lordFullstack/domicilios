-- ROLLBACK de S0B: vuelve a handle_new_user (perfil siempre activo), approved por defecto true
-- y la versión de guard_restaurant_write de S0 (sin la regla de approved en INSERT).
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
  safe_role := case
    when requested_role in ('client', 'restaurant', 'delivery') then requested_role
    else 'client'
  end;

  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    safe_role
  );
  return new;
end;
$function$;

alter table public.restaurants alter column approved set default true;

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
