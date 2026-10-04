-- DOMI — etapa 4: el admin puede cancelar un Domi atascado (domi desaparecido, cliente que no responde).
-- Mismo patrón que el resto: función SECURITY DEFINER, solo rol admin, sin UPDATE directo a la tabla.
create or replace function public.admin_cancel_errand(p_errand_id uuid)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('admin');
  v_e public.errands%rowtype;
begin
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found then raise exception 'errand_not_found'; end if;
  if v_e.status not in ('searching', 'quoted', 'accepted', 'picked_up', 'in_delivery') then
    raise exception 'invalid_transition';
  end if;

  update public.errand_quotes set status = 'expired', responded_at = now()
   where errand_id = p_errand_id and status = 'pending';
  update public.errand_assignment_attempts set outcome = 'cancelled', resolved_at = now()
   where errand_id = p_errand_id and outcome in ('pending', 'quoted');
  update public.errands set status = 'cancelled', cancel_reason = 'admin', accept_deadline = null
   where id = p_errand_id returning * into v_e;
  return v_e;
end;
$$;

revoke all on function public.admin_cancel_errand(uuid) from public, anon;
grant execute on function public.admin_cancel_errand(uuid) to authenticated, service_role;
