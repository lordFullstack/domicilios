-- LOOP_CLIENT_05C · M5 — create_order con p_cash_amount
--
-- REQUIERE M4 (orders.cash_amount).
--
-- La firma pasa de 6 a 7 parámetros (p_cash_amount integer default null). Se ELIMINA la de 6
-- (un "create or replace" crearía una sobrecarga) y se crea la nueva con los mismos permisos:
-- authenticated + service_role, nunca anon/public. Una app en caché que llame con 6 argumentos
-- (por nombre) sigue resolviendo a esta función gracias al default null.
--
-- Validación de cash_amount (D3), en el servidor, antes de insertar:
--   * null = "sin especificar": permitido.
--   * Solo con payment_method = 'cash_on_delivery' (con 'online' -> invalid_cash_amount).
--   * Entero positivo, tope 10.000.000, y >= total calculado en el servidor (subtotal + tarifa).
-- El total sigue calculándose solo en el servidor. Una llave de idempotencia ya usada devuelve el
-- pedido existente sin revalidar (comportamiento de M3, sin cambios).
-- Reversible: ver el .rollback.sql

drop function if exists public.create_order(uuid, text, text, text, jsonb, uuid);

create or replace function public.create_order(
  p_restaurant_id uuid,
  p_delivery_address text,
  p_special_instructions text,
  p_payment_method text,
  p_items jsonb,
  p_client_order_id uuid default null,
  p_cash_amount integer default null
)
 returns public.orders
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_restaurant public.restaurants%rowtype;
  v_req jsonb;
  v_fee integer;
  v_subtotal numeric;
  v_expected integer;
  v_found integer;
  v_order public.orders%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if p_client_order_id is not null then
    select * into v_order
      from public.orders
     where user_id = v_uid and client_order_id = p_client_order_id;
    if found then
      return v_order;
    end if;
  end if;

  if p_delivery_address is null or length(trim(p_delivery_address)) < 5 or length(p_delivery_address) > 300 then
    raise exception 'invalid_address';
  end if;

  if p_payment_method is null or p_payment_method not in ('cash_on_delivery', 'online') then
    raise exception 'invalid_payment_method';
  end if;

  if p_cash_amount is not null
     and (p_payment_method <> 'cash_on_delivery' or p_cash_amount <= 0 or p_cash_amount > 10000000) then
    raise exception 'invalid_cash_amount';
  end if;

  select * into v_restaurant from public.restaurants where id = p_restaurant_id;
  if not found or not v_restaurant.approved then
    raise exception 'restaurant_unavailable';
  end if;
  if v_restaurant.status <> 'open' then
    raise exception 'restaurant_closed';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 50 then
    raise exception 'empty_cart';
  end if;

  select jsonb_agg(jsonb_build_object('product_id', product_id, 'quantity', quantity))
    into v_req
    from (
      select x.product_id, sum(x.quantity)::integer as quantity
        from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer)
       group by x.product_id
    ) g;

  if exists (
    select 1 from jsonb_to_recordset(v_req) as r(product_id uuid, quantity integer)
     where r.product_id is null or r.quantity is null or r.quantity < 1 or r.quantity > 99
  ) then
    raise exception 'invalid_quantity';
  end if;

  v_expected := jsonb_array_length(v_req);

  select count(*), coalesce(sum(p.price * r.quantity), 0)
    into v_found, v_subtotal
    from jsonb_to_recordset(v_req) as r(product_id uuid, quantity integer)
    join public.products p on p.id = r.product_id
   where p.restaurant_id = p_restaurant_id and p.available;

  if v_found <> v_expected then
    raise exception 'invalid_products';
  end if;

  select delivery_fee into v_fee from public.app_settings where id;
  v_fee := coalesce(v_fee, 0);

  -- Con cuánto paga: nunca menos que el total que calcula el servidor.
  if p_cash_amount is not null and p_cash_amount < v_subtotal + v_fee then
    raise exception 'invalid_cash_amount';
  end if;

  begin
    insert into public.orders (
      user_id, restaurant_id, total, delivery_fee, status, payment_status,
      delivery_address, special_instructions, payment_method, client_order_id, cash_amount
    ) values (
      v_uid, p_restaurant_id, v_subtotal + v_fee, v_fee, 'pending', 'pending',
      trim(p_delivery_address), nullif(left(trim(coalesce(p_special_instructions, '')), 500), ''),
      p_payment_method, p_client_order_id, p_cash_amount
    )
    returning * into v_order;
  exception when unique_violation then
    if p_client_order_id is null then
      raise;
    end if;
    select * into v_order
      from public.orders
     where user_id = v_uid and client_order_id = p_client_order_id;
    return v_order;
  end;

  insert into public.order_items (order_id, product_id, quantity, unit_price)
  select v_order.id, r.product_id, r.quantity, p.price
    from jsonb_to_recordset(v_req) as r(product_id uuid, quantity integer)
    join public.products p on p.id = r.product_id;

  return v_order;
end;
$function$;

revoke all on function public.create_order(uuid, text, text, text, jsonb, uuid, integer) from public, anon;
grant execute on function public.create_order(uuid, text, text, text, jsonb, uuid, integer) to authenticated, service_role;
