-- DOMI (mandados) — etapa 1: base de datos
-- Nombre técnico: errands. Cliente pide un mandado a un domiciliario, sin restaurante.
-- Mismo patrón que los pedidos: tablas solo-lectura por RLS, transiciones SOLO vía funciones SECURITY DEFINER.

-- ───────────── 1. Configuración ─────────────
alter table public.app_settings
  add column if not exists errand_min_fee       integer not null default 5000   check (errand_min_fee between 1000 and 100000),
  add column if not exists errand_max_budget    integer not null default 100000 check (errand_max_budget between 10000 and 1000000),
  add column if not exists errand_quote_seconds integer not null default 120    check (errand_quote_seconds between 30 and 900),
  add column if not exists errand_max_rounds    integer not null default 3      check (errand_max_rounds between 1 and 10);

-- ───────────── 2. Tablas ─────────────
create table public.errands (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.profiles(id),
  delivery_person_id  uuid references public.profiles(id),
  type                text not null check (type in ('purchase', 'pickup')),
  description         text not null check (char_length(btrim(description)) between 3 and 500),
  photo_url           text,   -- ruta en el bucket privado errand-files
  pickup_address      text not null check (char_length(btrim(pickup_address)) between 3 and 200),
  pickup_notes        text check (pickup_notes is null or char_length(pickup_notes) <= 150),
  dropoff_address     text not null check (char_length(btrim(dropoff_address)) between 3 and 200),
  dropoff_notes       text check (dropoff_notes is null or char_length(dropoff_notes) <= 150),
  max_budget          integer check (max_budget is null or max_budget > 0),
  purchase_amount     integer check (purchase_amount is null or purchase_amount > 0),
  receipt_url         text,   -- ruta en errand-files
  fee                 integer check (fee is null or fee >= 0),
  status              text not null default 'searching'
                        check (status in ('searching', 'quoted', 'accepted', 'picked_up', 'in_delivery', 'delivered', 'cancelled', 'expired')),
  assignment_round    integer not null default 1,
  accept_deadline     timestamptz,
  current_lat         double precision,
  current_lng         double precision,
  location_updated_at timestamptz,
  cancel_reason       text check (cancel_reason in ('customer', 'no_domis', 'admin')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint errands_budget_matches_type check ((type = 'purchase') = (max_budget is not null)),
  constraint errands_purchase_only check (type = 'purchase' or (purchase_amount is null and receipt_url is null))
);
create index errands_client_idx on public.errands (client_id, created_at desc);
create index errands_driver_idx on public.errands (delivery_person_id) where delivery_person_id is not null;
create index errands_open_idx   on public.errands (status) where status in ('searching', 'quoted');

create table public.errand_quotes (
  id           uuid primary key default gen_random_uuid(),
  errand_id    uuid not null references public.errands(id) on delete cascade,
  driver_id    uuid not null references public.profiles(id),
  amount       integer not null check (amount > 0),
  driver_note  text not null check (char_length(btrim(driver_note)) between 3 and 200),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  client_note  text check (client_note is null or char_length(client_note) <= 200),
  created_at   timestamptz not null default now(),
  responded_at timestamptz
);
create unique index errand_quotes_one_pending on public.errand_quotes (errand_id) where status = 'pending';
create index errand_quotes_errand_idx on public.errand_quotes (errand_id, driver_id);

create table public.errand_assignment_attempts (
  id          uuid primary key default gen_random_uuid(),
  errand_id   uuid not null references public.errands(id) on delete cascade,
  driver_id   uuid not null references public.profiles(id),
  round       integer not null default 1,
  assigned_at timestamptz not null default now(),
  resolved_at timestamptz,
  outcome     text not null default 'pending'
                check (outcome in ('pending', 'quoted', 'accepted', 'rejected', 'expired', 'cancelled')),
  unique (errand_id, driver_id, round)
);

create table public.errand_ratings (
  id                 uuid primary key default gen_random_uuid(),
  errand_id          uuid not null unique references public.errands(id),
  client_id          uuid not null references public.profiles(id),
  delivery_person_id uuid not null references public.profiles(id),
  rating             smallint not null check (rating between 1 and 5),
  comment            text check (comment is null or char_length(comment) <= 300),
  created_at         timestamptz not null default now()
);

alter table public.notifications add column if not exists errand_id uuid references public.errands(id) on delete cascade;

create trigger set_updated_at_errands before update on public.errands
  for each row execute function public.set_updated_at();

-- ───────────── 3. RLS: lectura por involucrados; escritura solo por funciones ─────────────
alter table public.errands                    enable row level security;
alter table public.errand_quotes              enable row level security;
alter table public.errand_assignment_attempts enable row level security;
alter table public.errand_ratings             enable row level security;

revoke all on public.errands, public.errand_quotes, public.errand_assignment_attempts, public.errand_ratings from anon, authenticated;
grant select on public.errands, public.errand_quotes, public.errand_assignment_attempts, public.errand_ratings to authenticated;
grant insert on public.errand_ratings to authenticated;

create policy errands_select on public.errands for select to authenticated
  using (client_id = (select auth.uid()) or delivery_person_id = (select auth.uid()) or (select private.is_admin()));

create policy errand_quotes_select on public.errand_quotes for select to authenticated
  using (
    driver_id = (select auth.uid())
    or (select private.is_admin())
    or exists (select 1 from public.errands e where e.id = errand_quotes.errand_id and e.client_id = (select auth.uid()))
  );

create policy errand_attempts_select on public.errand_assignment_attempts for select to authenticated
  using (driver_id = (select auth.uid()) or (select private.is_admin()));

create policy errand_ratings_select on public.errand_ratings for select to authenticated
  using (client_id = (select auth.uid()) or delivery_person_id = (select auth.uid()) or (select private.is_admin()));

create policy errand_ratings_insert_client on public.errand_ratings for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and exists (
      select 1 from public.errands e
       where e.id = errand_ratings.errand_id and e.client_id = (select auth.uid())
         and e.status = 'delivered' and e.delivery_person_id = errand_ratings.delivery_person_id
    )
  );

create or replace function public.update_errand_rating_after_insert()
returns trigger language plpgsql security definer set search_path = 'public' as $$
begin
  update public.profiles
     set rating_count = rating_count + 1,
         rating_avg = round(((rating_avg * rating_count) + new.rating) / (rating_count + 1), 1)
   where id = new.delivery_person_id;
  return new;
end;
$$;
revoke all on function public.update_errand_rating_after_insert() from public, anon, authenticated;
create trigger trg_update_errand_rating after insert on public.errand_ratings
  for each row execute function public.update_errand_rating_after_insert();

-- ───────────── 4. Almacenamiento privado (fotos del pedido y facturas) ─────────────
-- Ruta: <uid de quien sube>/<errand_id>/<archivo>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('errand-files', 'errand-files', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy errand_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'errand-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy errand_files_update on storage.objects for update to authenticated
  using (bucket_id = 'errand-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy errand_files_select on storage.objects for select to authenticated
  using (
    bucket_id = 'errand-files'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
      or exists (
        select 1 from public.errands e
         where e.id::text = (storage.foldername(name))[2]
           and (e.client_id = (select auth.uid()) or e.delivery_person_id = (select auth.uid()))
      )
    )
  );

-- ───────────── 5. Ayudas internas ─────────────
create or replace function private.driver_has_active_errand(p_driver uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.errands e
     where e.delivery_person_id = p_driver
       and e.status in ('searching', 'quoted', 'accepted', 'picked_up', 'in_delivery')
  );
$$;

-- Ofrece el Domi al siguiente domiciliario libre de la ronda. Devuelve su id o null.
create or replace function private.assign_next_errand_driver(p_errand_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_e public.errands%rowtype;
  v_driver uuid;
  v_try int := 0;
  v_secs integer;
begin
  select * into v_e from public.errands where id = p_errand_id;
  if not found or v_e.status <> 'searching' or v_e.delivery_person_id is not null then
    return null;
  end if;

  select delivery_accept_seconds into v_secs from public.app_settings limit 1;

  while v_try < 5 loop
    v_try := v_try + 1;
    v_driver := null;

    select p.id into v_driver
      from public.profiles p
     where p.role = 'delivery' and p.active and p.on_shift
       and not exists (
         select 1 from public.orders o
          where o.delivery_person_id = p.id and o.status in ('ready', 'in_delivery')
       )
       and not private.driver_has_active_errand(p.id)
       and not exists (
         select 1 from public.errand_assignment_attempts a
          where a.errand_id = p_errand_id and a.round = v_e.assignment_round and a.driver_id = p.id
       )
     order by (select max(a2.assigned_at) from public.errand_assignment_attempts a2 where a2.driver_id = p.id) nulls first, p.id
     for update of p skip locked
     limit 1;

    if v_driver is null then
      return null;
    end if;

    begin
      insert into public.errand_assignment_attempts (errand_id, driver_id, round)
      values (p_errand_id, v_driver, v_e.assignment_round);
    exception when unique_violation then
      continue;
    end;

    update public.errands
       set delivery_person_id = v_driver,
           accept_deadline = now() + make_interval(secs => coalesce(v_secs, 120))
     where id = p_errand_id;
    return v_driver;
  end loop;

  return null;
end;
$$;

-- Busca domiciliario; si ya probó a todos los de turno pasa de ronda; sin rondas → expired.
create or replace function private.advance_errand_search(p_errand_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_e public.errands%rowtype;
  v_max integer;
begin
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found or v_e.status <> 'searching' or v_e.delivery_person_id is not null then
    return;
  end if;

  if private.assign_next_errand_driver(p_errand_id) is not null then
    return;
  end if;

  select errand_max_rounds into v_max from public.app_settings limit 1;

  if exists (select 1 from public.errand_assignment_attempts a where a.errand_id = p_errand_id and a.round = v_e.assignment_round)
     and not exists (
       select 1 from public.profiles pr
        where pr.role = 'delivery' and pr.active and pr.on_shift
          and not exists (
            select 1 from public.errand_assignment_attempts a
             where a.errand_id = p_errand_id and a.round = v_e.assignment_round and a.driver_id = pr.id
          )
     ) then
    if v_e.assignment_round >= coalesce(v_max, 3) then
      update public.errands set status = 'expired', cancel_reason = 'no_domis', accept_deadline = null where id = p_errand_id;
    else
      update public.errands set assignment_round = assignment_round + 1 where id = p_errand_id;
    end if;
  end if;
end;
$$;

-- Cron (cada 15 s): ofertas sin respuesta, cotizaciones sin respuesta del cliente, búsquedas sin domi.
create or replace function private.expire_overdue_errands()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r record;
  v_age interval;
  v_expired int := 0;
begin
  select make_interval(secs => s.errand_max_rounds * (s.delivery_accept_seconds + s.errand_quote_seconds))
    into v_age from public.app_settings s limit 1;

  for r in
    select id, delivery_person_id from public.errands
     where status = 'searching' and delivery_person_id is not null
       and accept_deadline is not null and accept_deadline < now()
     order by accept_deadline for update skip locked
  loop
    update public.errand_assignment_attempts set outcome = 'expired', resolved_at = now()
     where errand_id = r.id and driver_id = r.delivery_person_id and outcome in ('pending', 'quoted');
    update public.errands set delivery_person_id = null, accept_deadline = null where id = r.id;
    perform private.advance_errand_search(r.id);
  end loop;

  for r in
    select id, delivery_person_id from public.errands
     where status = 'quoted' and accept_deadline is not null and accept_deadline < now()
     order by accept_deadline for update skip locked
  loop
    update public.errand_quotes set status = 'expired', responded_at = now()
     where errand_id = r.id and status = 'pending';
    update public.errand_assignment_attempts set outcome = 'expired', resolved_at = now()
     where errand_id = r.id and driver_id = r.delivery_person_id and outcome in ('pending', 'quoted');
    update public.errands set status = 'searching', delivery_person_id = null, accept_deadline = null where id = r.id;
    perform private.advance_errand_search(r.id);
  end loop;

  for r in
    select id, created_at from public.errands
     where status = 'searching' and delivery_person_id is null
     order by created_at for update skip locked
  loop
    if r.created_at < now() - coalesce(v_age, interval '12 minutes') then
      update public.errands set status = 'expired', cancel_reason = 'no_domis' where id = r.id;
      v_expired := v_expired + 1;
    else
      perform private.advance_errand_search(r.id);
    end if;
  end loop;

  return jsonb_build_object('expired', v_expired);
end;
$$;

revoke all on function private.driver_has_active_errand(uuid), private.assign_next_errand_driver(uuid),
  private.advance_errand_search(uuid), private.expire_overdue_errands() from public, anon, authenticated;

-- ───────────── 6. Funciones públicas (RPC) ─────────────
-- CLIENTE: crear. p_errand_id lo genera la app (clave de idempotencia y carpeta de la foto).
create or replace function public.client_create_errand(
  p_errand_id uuid, p_type text, p_description text, p_photo_path text,
  p_pickup_address text, p_pickup_notes text, p_dropoff_address text, p_dropoff_notes text, p_max_budget integer
) returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('client');
  v_e public.errands%rowtype;
  v_cap integer;
begin
  select * into v_e from public.errands where id = p_errand_id;
  if found then
    if v_e.client_id = v_uid then return v_e; end if;
    raise exception 'errand_unavailable';
  end if;

  if p_type not in ('purchase', 'pickup') then raise exception 'invalid_type'; end if;

  if p_type = 'purchase' then
    select errand_max_budget into v_cap from public.app_settings limit 1;
    if p_max_budget is null or p_max_budget <= 0 or p_max_budget > coalesce(v_cap, 100000) then
      raise exception 'invalid_budget';
    end if;
  else
    p_max_budget := null;
  end if;

  if p_photo_path is not null and p_photo_path not like v_uid::text || '/' || p_errand_id::text || '/%' then
    raise exception 'invalid_photo';
  end if;

  if (select count(*) from public.errands e
       where e.client_id = v_uid and e.status in ('searching', 'quoted', 'accepted', 'picked_up', 'in_delivery')) >= 3 then
    raise exception 'too_many_errands';
  end if;

  if not exists (select 1 from public.profiles p where p.role = 'delivery' and p.active and p.on_shift) then
    raise exception 'no_domis_available';
  end if;

  insert into public.errands (id, client_id, type, description, photo_url, pickup_address, pickup_notes,
                              dropoff_address, dropoff_notes, max_budget)
  values (p_errand_id, v_uid, p_type, btrim(p_description), p_photo_path, btrim(p_pickup_address), nullif(btrim(p_pickup_notes), ''),
          btrim(p_dropoff_address), nullif(btrim(p_dropoff_notes), ''), p_max_budget);

  perform private.advance_errand_search(p_errand_id);

  select * into v_e from public.errands where id = p_errand_id;
  return v_e;
end;
$$;

-- CLIENTE: cancelar (hasta que el domi compre/recoja).
create or replace function public.client_cancel_errand(p_errand_id uuid)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('client');
  v_e public.errands%rowtype;
begin
  select * into v_e from public.errands where id = p_errand_id and client_id = v_uid for update;
  if not found then raise exception 'errand_not_found'; end if;
  if v_e.status not in ('searching', 'quoted', 'accepted') then raise exception 'invalid_transition'; end if;

  update public.errand_quotes set status = 'expired', responded_at = now() where errand_id = p_errand_id and status = 'pending';
  update public.errand_assignment_attempts set outcome = 'cancelled', resolved_at = now()
   where errand_id = p_errand_id and outcome in ('pending', 'quoted');
  update public.errands set status = 'cancelled', cancel_reason = 'customer', accept_deadline = null
   where id = p_errand_id returning * into v_e;
  return v_e;
end;
$$;

-- CLIENTE: aprobar o rechazar la cotización del domi. Rechazar exige nota.
create or replace function public.client_respond_errand_quote(p_errand_id uuid, p_approve boolean, p_note text default null)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('client');
  v_e public.errands%rowtype;
  v_q public.errand_quotes%rowtype;
  v_secs integer;
  v_count integer;
begin
  select * into v_e from public.errands where id = p_errand_id and client_id = v_uid for update;
  if not found then raise exception 'errand_not_found'; end if;
  if v_e.status <> 'quoted' then raise exception 'invalid_transition'; end if;
  if v_e.accept_deadline is not null and v_e.accept_deadline < now() then raise exception 'quote_expired'; end if;

  select * into v_q from public.errand_quotes where errand_id = p_errand_id and status = 'pending' for update;
  if not found then raise exception 'quote_not_found'; end if;

  if p_approve then
    update public.errand_quotes set status = 'approved', responded_at = now() where id = v_q.id;
    update public.errand_assignment_attempts set outcome = 'accepted', resolved_at = now()
     where errand_id = p_errand_id and driver_id = v_q.driver_id and outcome in ('pending', 'quoted');
    update public.errands set status = 'accepted', fee = v_q.amount, accept_deadline = null
     where id = p_errand_id returning * into v_e;
    return v_e;
  end if;

  if p_note is null or char_length(btrim(p_note)) < 3 then raise exception 'note_required'; end if;

  update public.errand_quotes set status = 'rejected', client_note = btrim(p_note), responded_at = now() where id = v_q.id;

  select count(*) into v_count from public.errand_quotes where errand_id = p_errand_id and driver_id = v_q.driver_id;
  if v_count < 2 then
    -- El domi puede re-cotizar una vez o soltar el Domi
    select delivery_accept_seconds into v_secs from public.app_settings limit 1;
    update public.errand_assignment_attempts set outcome = 'pending'
     where errand_id = p_errand_id and driver_id = v_q.driver_id and outcome = 'quoted';
    update public.errands set status = 'searching', accept_deadline = now() + make_interval(secs => coalesce(v_secs, 120))
     where id = p_errand_id;
  else
    update public.errand_assignment_attempts set outcome = 'rejected', resolved_at = now()
     where errand_id = p_errand_id and driver_id = v_q.driver_id and outcome in ('pending', 'quoted');
    update public.errands set status = 'searching', delivery_person_id = null, accept_deadline = null where id = p_errand_id;
    perform private.advance_errand_search(p_errand_id);
  end if;

  select * into v_e from public.errands where id = p_errand_id;
  return v_e;
end;
$$;

-- DOMI: aceptar al precio mínimo.
create or replace function public.delivery_errand_accept(p_errand_id uuid)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_e public.errands%rowtype;
  v_min integer;
begin
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found or v_e.delivery_person_id is distinct from v_uid then raise exception 'errand_not_assigned'; end if;
  if v_e.status <> 'searching' then raise exception 'invalid_transition'; end if;
  if v_e.accept_deadline is not null and v_e.accept_deadline < now() then raise exception 'errand_expired'; end if;
  if exists (select 1 from public.orders o where o.delivery_person_id = v_uid and o.status = 'in_delivery') then
    raise exception 'delivery_busy';
  end if;

  select errand_min_fee into v_min from public.app_settings limit 1;

  update public.errand_quotes set status = 'expired', responded_at = now()
   where errand_id = p_errand_id and status = 'pending';
  update public.errand_assignment_attempts set outcome = 'accepted', resolved_at = now()
   where errand_id = p_errand_id and driver_id = v_uid and outcome in ('pending', 'quoted');
  update public.errands set status = 'accepted', fee = coalesce(v_min, 5000), accept_deadline = null
   where id = p_errand_id returning * into v_e;
  return v_e;
end;
$$;

-- DOMI: cotizar otro precio (>= mínimo) con nota. Máximo 2 cotizaciones por Domi.
create or replace function public.delivery_errand_quote(p_errand_id uuid, p_amount integer, p_note text)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_e public.errands%rowtype;
  v_min integer;
  v_secs integer;
begin
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found or v_e.delivery_person_id is distinct from v_uid then raise exception 'errand_not_assigned'; end if;
  if v_e.status <> 'searching' then raise exception 'invalid_transition'; end if;
  if v_e.accept_deadline is not null and v_e.accept_deadline < now() then raise exception 'errand_expired'; end if;

  select errand_min_fee, errand_quote_seconds into v_min, v_secs from public.app_settings limit 1;
  if p_amount is null or p_amount < coalesce(v_min, 5000) or p_amount > 100000 then raise exception 'invalid_amount'; end if;
  if p_note is null or char_length(btrim(p_note)) < 3 then raise exception 'note_required'; end if;
  if (select count(*) from public.errand_quotes q where q.errand_id = p_errand_id and q.driver_id = v_uid) >= 2 then
    raise exception 'requote_limit';
  end if;

  insert into public.errand_quotes (errand_id, driver_id, amount, driver_note)
  values (p_errand_id, v_uid, p_amount, btrim(p_note));

  update public.errand_assignment_attempts set outcome = 'quoted'
   where errand_id = p_errand_id and driver_id = v_uid and outcome = 'pending';
  update public.errands set status = 'quoted', accept_deadline = now() + make_interval(secs => coalesce(v_secs, 120))
   where id = p_errand_id returning * into v_e;
  return v_e;
end;
$$;

-- DOMI: rechazar la oferta / soltar el Domi (pasa al siguiente domi).
create or replace function public.delivery_errand_reject(p_errand_id uuid)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_e public.errands%rowtype;
begin
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found or v_e.delivery_person_id is distinct from v_uid then raise exception 'errand_not_assigned'; end if;
  if v_e.status <> 'searching' then raise exception 'invalid_transition'; end if;

  update public.errand_assignment_attempts set outcome = 'rejected', resolved_at = now()
   where errand_id = p_errand_id and driver_id = v_uid and outcome in ('pending', 'quoted');
  update public.errands set delivery_person_id = null, accept_deadline = null where id = p_errand_id;
  perform private.advance_errand_search(p_errand_id);

  select * into v_e from public.errands where id = p_errand_id;
  return v_e;
end;
$$;

-- DOMI: ya compró / ya recogió. En compra: monto real <= presupuesto y foto de la factura obligatoria.
create or replace function public.delivery_errand_picked_up(p_errand_id uuid, p_purchase_amount integer default null, p_receipt_path text default null)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_e public.errands%rowtype;
begin
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found or v_e.delivery_person_id is distinct from v_uid then raise exception 'errand_not_assigned'; end if;
  if v_e.status <> 'accepted' then raise exception 'invalid_transition'; end if;

  if v_e.type = 'purchase' then
    if p_purchase_amount is null or p_purchase_amount <= 0 then raise exception 'invalid_amount'; end if;
    if p_purchase_amount > v_e.max_budget then raise exception 'over_budget'; end if;
    if p_receipt_path is null or p_receipt_path not like v_uid::text || '/' || p_errand_id::text || '/%'
       or not exists (select 1 from storage.objects o where o.bucket_id = 'errand-files' and o.name = p_receipt_path) then
      raise exception 'receipt_required';
    end if;
    update public.errands set status = 'picked_up', purchase_amount = p_purchase_amount, receipt_url = p_receipt_path
     where id = p_errand_id returning * into v_e;
  else
    update public.errands set status = 'picked_up' where id = p_errand_id returning * into v_e;
  end if;
  return v_e;
end;
$$;

-- DOMI: sale hacia el punto B (empieza la ubicación en vivo).
create or replace function public.delivery_errand_start_delivery(p_errand_id uuid)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_e public.errands%rowtype;
begin
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found or v_e.delivery_person_id is distinct from v_uid then raise exception 'errand_not_assigned'; end if;
  if v_e.status <> 'picked_up' then raise exception 'invalid_transition'; end if;
  update public.errands set status = 'in_delivery' where id = p_errand_id returning * into v_e;
  return v_e;
end;
$$;

create or replace function public.delivery_errand_complete(p_errand_id uuid)
returns public.errands
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_e public.errands%rowtype;
begin
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found or v_e.delivery_person_id is distinct from v_uid then raise exception 'errand_not_assigned'; end if;
  if v_e.status <> 'in_delivery' then raise exception 'invalid_transition'; end if;
  update public.errands set status = 'delivered' where id = p_errand_id returning * into v_e;
  return v_e;
end;
$$;

create or replace function public.delivery_errand_update_location(p_errand_id uuid, p_lat double precision, p_lng double precision)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_e public.errands%rowtype;
begin
  if p_lat is null or p_lat < -90 or p_lat > 90 or p_lng is null or p_lng < -180 or p_lng > 180 then
    raise exception 'invalid_location';
  end if;
  select * into v_e from public.errands where id = p_errand_id for update;
  if not found or v_e.delivery_person_id is distinct from v_uid or v_e.status <> 'in_delivery' then
    raise exception 'errand_not_assigned';
  end if;
  update public.errands set current_lat = p_lat, current_lng = p_lng, location_updated_at = now() where id = p_errand_id;
end;
$$;

revoke all on function
  public.client_create_errand(uuid, text, text, text, text, text, text, text, integer),
  public.client_cancel_errand(uuid),
  public.client_respond_errand_quote(uuid, boolean, text),
  public.delivery_errand_accept(uuid),
  public.delivery_errand_quote(uuid, integer, text),
  public.delivery_errand_reject(uuid),
  public.delivery_errand_picked_up(uuid, integer, text),
  public.delivery_errand_start_delivery(uuid),
  public.delivery_errand_complete(uuid),
  public.delivery_errand_update_location(uuid, double precision, double precision)
from public, anon;
grant execute on function
  public.client_create_errand(uuid, text, text, text, text, text, text, text, integer),
  public.client_cancel_errand(uuid),
  public.client_respond_errand_quote(uuid, boolean, text),
  public.delivery_errand_accept(uuid),
  public.delivery_errand_quote(uuid, integer, text),
  public.delivery_errand_reject(uuid),
  public.delivery_errand_picked_up(uuid, integer, text),
  public.delivery_errand_start_delivery(uuid),
  public.delivery_errand_complete(uuid),
  public.delivery_errand_update_location(uuid, double precision, double precision)
to authenticated, service_role;

-- ───────────── 7. Notificaciones ─────────────
create or replace function public.handle_errand_notification()
returns trigger language plpgsql security definer set search_path = 'public' as $$
declare
  v_msg text;
begin
  -- Cambió el estado: avisa al cliente
  if new.status is distinct from old.status then
    v_msg := case new.status
      when 'quoted'      then 'Tu Domi te envió una cotización. Revísala y respóndele.'
      when 'accepted'    then '¡Un Domi aceptó tu mandado!'
      when 'picked_up'   then case new.type when 'purchase' then 'Tu Domi ya hizo la compra' else 'Tu Domi ya recogió tu encargo' end
      when 'in_delivery' then '¡Tu Domi va en camino!'
      when 'delivered'   then 'Tu Domi fue entregado'
      when 'cancelled'   then 'Tu Domi fue cancelado'
      when 'expired'     then 'No encontramos un Domi disponible. Intenta de nuevo en unos minutos.'
      else null end;
    if v_msg is not null then
      insert into notifications (user_id, title, body, type, errand_id)
      values (new.client_id, 'Actualización de tu Domi', v_msg, 'errand', new.id);
    end if;
  end if;

  -- Nueva oferta para un domiciliario
  if new.delivery_person_id is not null and new.delivery_person_id is distinct from old.delivery_person_id
     and new.status = 'searching' then
    insert into notifications (user_id, title, body, type, errand_id)
    values (new.delivery_person_id, '🛵 Nuevo Domi',
            case new.type when 'purchase' then 'Te ofrecen un mandado de compra' else 'Te ofrecen un mandado de recogida' end,
            'errand', new.id);
  end if;

  -- El cliente rechazó la cotización y el domi puede re-cotizar
  if old.status = 'quoted' and new.status = 'searching' and new.delivery_person_id is not null
     and new.delivery_person_id = old.delivery_person_id then
    insert into notifications (user_id, title, body, type, errand_id)
    values (new.delivery_person_id, 'Cotización rechazada', 'El cliente no aceptó tu precio. Puedes cotizar de nuevo o soltar el Domi.', 'errand', new.id);
  end if;

  -- El cliente aprobó la cotización
  if old.status = 'quoted' and new.status = 'accepted' and new.delivery_person_id is not null then
    insert into notifications (user_id, title, body, type, errand_id)
    values (new.delivery_person_id, 'Cotización aprobada', 'El cliente aprobó tu precio. ¡Ya puedes empezar el Domi!', 'errand', new.id);
  end if;

  -- El cliente canceló con un domi asignado
  if new.status = 'cancelled' and old.status <> 'cancelled' and old.delivery_person_id is not null then
    insert into notifications (user_id, title, body, type, errand_id)
    values (old.delivery_person_id, 'Domi cancelado', 'El cliente canceló el mandado.', 'errand', new.id);
  end if;

  return new;
end;
$$;
revoke all on function public.handle_errand_notification() from public, anon, authenticated;
create trigger errands_notify_on_update after update on public.errands
  for each row execute function public.handle_errand_notification();

-- ───────────── 8. Integración con los pedidos existentes ─────────────
-- Un domiciliario con un Domi activo no recibe pedidos, y al revés (ya excluido arriba).
create or replace function private.assign_next_driver(p_order_id uuid)
returns uuid language plpgsql security definer set search_path to '' as $function$
declare
  v_order public.orders%rowtype;
  v_driver uuid;
  v_claims text;
  v_sub text;
  v_try int := 0;
  v_secs integer;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found or v_order.status <> 'ready' or v_order.delivery_person_id is not null then
    return null;
  end if;

  select delivery_accept_seconds into v_secs from public.app_settings limit 1;

  while v_try < 5 loop
    v_try := v_try + 1;
    v_driver := null;

    select p.id into v_driver
      from public.profiles p
     where p.role = 'delivery' and p.active and p.on_shift
       and not exists (
         select 1 from public.orders o
          where o.delivery_person_id = p.id and o.status in ('ready', 'in_delivery')
       )
       and not private.driver_has_active_errand(p.id)
       and not exists (
         select 1 from public.order_assignment_attempts a
          where a.order_id = p_order_id and a.round = v_order.assignment_round
            and a.driver_id = p.id and a.outcome in ('rejected', 'expired')
       )
     order by (select max(a2.assigned_at) from public.order_assignment_attempts a2 where a2.driver_id = p.id) nulls first, p.id
     for update of p skip locked
     limit 1;

    if v_driver is null then
      return null;
    end if;

    begin
      insert into public.order_assignment_attempts (order_id, driver_id, round)
      values (p_order_id, v_driver, v_order.assignment_round);
    exception when unique_violation then
      continue;
    end;

    v_claims := coalesce(current_setting('request.jwt.claims', true), '');
    v_sub := coalesce(current_setting('request.jwt.claim.sub', true), '');
    perform set_config('request.jwt.claims', '', true);
    perform set_config('request.jwt.claim.sub', '', true);

    update public.orders
       set delivery_person_id = v_driver,
           accept_deadline = now() + make_interval(secs => coalesce(v_secs, 120))
     where id = p_order_id;

    perform set_config('request.jwt.claims', v_claims, true);
    perform set_config('request.jwt.claim.sub', v_sub, true);
    return v_driver;
  end loop;

  return null;
end;
$function$;

create or replace function public.delivery_accept_order(p_order_id uuid)
returns public.orders language plpgsql security definer set search_path to '' as $function$
declare
  v_uid uuid := private.require_active_role('delivery');
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.delivery_person_id is distinct from v_uid then
    raise exception 'order_not_assigned';
  end if;
  if v_order.status <> 'ready' then
    raise exception 'invalid_transition';
  end if;
  if v_order.accept_deadline is not null and v_order.accept_deadline < now() then
    raise exception 'order_expired';
  end if;
  if exists (
    select 1 from public.orders o
     where o.delivery_person_id = v_uid and o.status = 'in_delivery' and o.id <> p_order_id
  ) or exists (
    select 1 from public.errands e
     where e.delivery_person_id = v_uid and e.status in ('accepted', 'picked_up', 'in_delivery')
  ) then
    raise exception 'delivery_busy';
  end if;

  update public.orders set status = 'in_delivery' where id = p_order_id returning * into v_order;

  update public.order_assignment_attempts
     set outcome = 'accepted', resolved_at = now()
   where order_id = p_order_id and driver_id = v_uid and outcome = 'pending';

  return v_order;
end;
$function$;

-- ───────────── 9. Tiempo real y cron ─────────────
alter publication supabase_realtime add table public.errands, public.errand_quotes;

select cron.schedule('expire_overdue_errands', '15 seconds', 'select private.expire_overdue_errands()');
