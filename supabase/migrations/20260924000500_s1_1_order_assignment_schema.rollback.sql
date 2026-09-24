-- ROLLBACK de S1.1: quita la tabla de intentos y las dos columnas, y restaura la lista permitida
-- de guard_profile_update de S0 (sin on_shift). Hacerlo DESPUÉS de revertir cualquier migración
-- posterior de SECURITY_01 que use estas piezas (S1.3 RPC).
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

drop table if exists public.order_assignment_attempts;
alter table public.orders drop column if exists assignment_round;
alter table public.profiles drop column if exists on_shift;
