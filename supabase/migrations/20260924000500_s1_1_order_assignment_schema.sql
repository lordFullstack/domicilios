-- LOOP_SECURITY_01 · S1.1 — Esquema de asignación de domiciliario
--
-- Solo agrega estructura; no cambia ningún comportamiento ni ninguna RPC todavía.
--
--   1. profiles.on_shift boolean not null default false
--      "En turno" del domiciliario. Los domiciliarios existentes quedan FUERA de turno hasta
--      que lo activen desde su app (la asignación automática, en S1.3, solo elige en turno).
--   2. orders.assignment_round integer not null default 1
--      Ronda de asignación del pedido; el restaurante la incrementa para "Buscar domiciliario
--      otra vez" y los intentos rechazados/vencidos de rondas anteriores dejan de excluir.
--   3. public.order_assignment_attempts
--      Un registro por cada vez que un pedido se ofrece a un domiciliario:
--      pending (esperando respuesta) | accepted | rejected | expired | cancelled.
--      - Índice único parcial: un pedido tiene como máximo UN intento pending.
--      - Índice único parcial: un domiciliario tiene como máximo UN intento pending
--        (protege a nivel de base de datos contra ofrecerle dos pedidos a la vez).
--      - RLS activa, SIN políticas de escritura: solo las RPC (SECURITY DEFINER) escriben.
--        Lectura: admin, dueño del restaurante del pedido y el propio domiciliario.
--   4. private.guard_profile_update: 'on_shift' entra en la lista permitida (el domiciliario
--      cambia su propio turno). role/active/email/rating_* siguen bloqueados (S0).
--
-- Los 37 pedidos existentes quedan con assignment_round = 1 y sin intentos.
-- Reversible: ver el .rollback.sql

alter table public.profiles add column if not exists on_shift boolean not null default false;
alter table public.orders add column if not exists assignment_round integer not null default 1;

create table if not exists public.order_assignment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  driver_id uuid not null references public.profiles (id),
  round integer not null default 1,
  assigned_at timestamptz not null default now(),
  resolved_at timestamptz,
  outcome text not null default 'pending'
    check (outcome in ('pending', 'accepted', 'rejected', 'expired', 'cancelled'))
);

create index if not exists order_assignment_attempts_order_round_idx
  on public.order_assignment_attempts (order_id, round);

create unique index if not exists order_assignment_attempts_one_pending_per_order
  on public.order_assignment_attempts (order_id) where outcome = 'pending';

create unique index if not exists order_assignment_attempts_one_pending_per_driver
  on public.order_assignment_attempts (driver_id) where outcome = 'pending';

alter table public.order_assignment_attempts enable row level security;

revoke insert, update, delete, truncate on public.order_assignment_attempts from anon, authenticated;

drop policy if exists order_assignment_attempts_select on public.order_assignment_attempts;
create policy order_assignment_attempts_select on public.order_assignment_attempts
  for select to authenticated
  using (
    driver_id = (select auth.uid())
    or (select private.is_admin())
    or exists (
      select 1
        from public.orders o
        join public.restaurants r on r.id = o.restaurant_id
       where o.id = order_assignment_attempts.order_id
         and r.owner_id = (select auth.uid())
    )
  );

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

  if v_changed <@ array['name', 'phone', 'avatar_url', 'vehicle_type', 'vehicle_plate', 'on_shift'] then
    return new;
  end if;

  raise exception 'profile_update_not_allowed'
    using errcode = '42501',
          detail = format('Cambio no permitido en columnas: %s', array_to_string(v_changed, ', '));
end;
$function$;
