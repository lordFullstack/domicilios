-- LOOP_SECURITY_01 · S1.2 — private.guard_order_update v2 (asignación y aceptación)
--
-- El trigger sigue siendo una LISTA PERMITIDA por rol: todo cambio no listado se rechaza con
-- order_update_not_allowed (42501). Esta versión CONSERVA todas las transiciones actuales
-- (cliente, restaurante, domiciliario, admin/service_role) y AGREGA únicamente:
--
--   RESTAURANTE (dueño del restaurante del pedido)
--     A. Cancelar liberando al domiciliario asignado:
--        pending/confirmed/preparing/ready -> cancelled, con delivery_person_id -> null.
--     B. Asignar / reasignar / liberar domiciliario SIN cambiar de estado (ready -> ready):
--        cambian solo delivery_person_id y (opcional) assignment_round; el nuevo domiciliario
--        debe ser un perfil delivery ACTIVO; assignment_round solo puede quedarse igual o
--        subir de 1 en 1 ("Buscar domiciliario otra vez").
--
--   DOMICILIARIO (solo sobre un pedido que YA le fue asignado)
--     C. Aceptar: ready (asignado a él) -> in_delivery; solo cambia status.
--     D. Rechazar: ready (asignado a él) -> ready sin domiciliario; solo cambia delivery_person_id.
--
-- NO cambia: cliente (cancelar pending/confirmed), avance de estados del restaurante,
-- cancelar hasta ready, ready->in_delivery asignando (compatibilidad con la app actual hasta
-- S1.5), toma de pedido libre y entrega/ubicación/pago en efectivo del domiciliario.
-- Nadie sin rol de admin puede cambiar total, delivery_fee, user_id, restaurant_id,
-- payment_method, dirección, client_order_id ni (fuera de la regla B) assignment_round.
--
-- Reversible: ver el .rollback.sql (restaura la versión anterior, la de guard_order_updates).

create or replace function private.guard_order_update()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_changed text[];
  v_is_owner boolean;
  v_is_delivery boolean;
begin
  -- Sin usuario (service_role, SQL del dashboard, jobs): sin restricciones.
  if v_uid is null then
    return new;
  end if;
  if (select private.is_admin()) then
    return new;
  end if;

  -- Columnas que cambian (updated_at lo pone otro trigger).
  select coalesce(array_agg(n.key), '{}')
    into v_changed
    from jsonb_each(to_jsonb(new)) n
    join jsonb_each(to_jsonb(old)) o using (key)
   where n.value is distinct from o.value
     and n.key <> 'updated_at';

  if cardinality(v_changed) = 0 then
    return new;
  end if;

  select exists (select 1 from public.restaurants r where r.id = old.restaurant_id and r.owner_id = v_uid)
    into v_is_owner;
  select exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'delivery')
    into v_is_delivery;

  -- CLIENTE: solo cancelar mientras el restaurante no empezó a preparar.
  if old.user_id = v_uid
     and v_changed <@ array['status']
     and old.status in ('pending', 'confirmed') and new.status = 'cancelled' then
    return new;
  end if;

  -- RESTAURANTE: avanzar estados en orden, cancelar, asignar domiciliario.
  if v_is_owner then
    if v_changed <@ array['status'] and (
         (old.status = 'pending'   and new.status = 'confirmed') or
         (old.status = 'confirmed' and new.status = 'preparing') or
         (old.status = 'preparing' and new.status = 'ready') or
         (old.status in ('pending', 'confirmed', 'preparing', 'ready') and new.status = 'cancelled')
       ) then
      return new;
    end if;
    -- (compatibilidad) "Enviar": ready -> in_delivery asignando en el mismo paso.
    if v_changed <@ array['status', 'delivery_person_id']
       and old.status = 'ready' and new.status = 'in_delivery'
       and new.delivery_person_id is not null
       and (old.delivery_person_id is null or old.delivery_person_id = new.delivery_person_id)
       and exists (select 1 from public.profiles p where p.id = new.delivery_person_id and p.role = 'delivery') then
      return new;
    end if;
    -- A. Cancelar liberando al domiciliario asignado.
    if v_changed <@ array['status', 'delivery_person_id']
       and old.status in ('pending', 'confirmed', 'preparing', 'ready') and new.status = 'cancelled'
       and new.delivery_person_id is null then
      return new;
    end if;
    -- B. Asignar / reasignar / liberar sin cambiar de estado.
    if v_changed <@ array['delivery_person_id', 'assignment_round']
       and old.status = 'ready' and new.status = 'ready'
       and (new.delivery_person_id is null
            or exists (select 1 from public.profiles p
                        where p.id = new.delivery_person_id and p.role = 'delivery' and p.active))
       and (new.assignment_round = old.assignment_round or new.assignment_round = old.assignment_round + 1) then
      return new;
    end if;
  end if;

  if v_is_delivery then
    -- Tomar un pedido listo y libre, asignándoselo a sí mismo (compatibilidad hasta S1.5).
    if v_changed <@ array['status', 'delivery_person_id']
       and old.delivery_person_id is null and new.delivery_person_id = v_uid
       and old.status = 'ready' and new.status = 'in_delivery' then
      return new;
    end if;
    -- C. Aceptar un pedido que ya le fue asignado.
    if old.delivery_person_id = v_uid
       and v_changed <@ array['status']
       and old.status = 'ready' and new.status = 'in_delivery' then
      return new;
    end if;
    -- D. Rechazar un pedido que ya le fue asignado (queda sin domiciliario, en ready).
    if old.delivery_person_id = v_uid
       and v_changed <@ array['delivery_person_id']
       and old.status = 'ready' and new.status = 'ready'
       and new.delivery_person_id is null then
      return new;
    end if;
    -- Su pedido asignado: ubicación, entregar y marcar pagado (efectivo).
    if old.delivery_person_id = v_uid
       and v_changed <@ array['current_lat', 'current_lng', 'location_updated_at', 'status', 'payment_status']
       and new.delivery_person_id is not distinct from old.delivery_person_id
       and (new.status = old.status or (old.status = 'in_delivery' and new.status = 'delivered'))
       and (new.payment_status = old.payment_status
            or (old.payment_status = 'pending' and new.payment_status = 'paid'
                and new.status = 'delivered' and old.payment_method = 'cash_on_delivery')) then
      return new;
    end if;
  end if;

  raise exception 'order_update_not_allowed'
    using errcode = '42501',
          detail = format('Cambio no permitido en columnas: %s (estado %s → %s)', array_to_string(v_changed, ', '), old.status, new.status);
end;
$function$;
