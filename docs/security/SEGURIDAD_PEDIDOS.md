# Seguridad de pedidos — estado al 25-sep-2026

> Reescrito: la versión del 22/23-sep listaba trabajo "pendiente" que ya está en producción.
> Historial de cada cambio: `docs/loops/` (CLIENT_05, SECURITY_01, SECURITY_02, FLOW_01, CLIENT_05C).

## Principio
El navegador declara una **intención**; el **servidor decide** dinero, estados, asignación y plazos.
Nadie sin rol de admin escribe directamente en `orders`.

## Hallazgos originales (22-sep) y su cierre
| Hallazgo | Cierre |
|---|---|
| `total` y `unit_price` los mandaba el celular | `create_order` (RPC): precios y tarifa desde la base |
| `UPDATE` de `orders` sin restricción de columnas | Trigger `guard_order_update` (lista permitida por rol) + **S1.5: UPDATE directo revocado a no admin** |
| Pedido e items en dos inserts | Una sola transacción dentro de la RPC; **M1: INSERT directo revocado** |
| Pedidos duplicados por doble toque / respuesta perdida | **M2/M3: `client_order_id`** (índice único parcial) + idempotencia en la RPC |
| Cualquier usuario podía volverse admin (`profiles.role`) o aprobar su restaurante | **S0: `guard_profile_update` / `guard_restaurant_write`** |
| Domiciliarios y restaurantes falsos por auto-registro | **S0b:** el domiciliario nace inactivo; `restaurants.approved` por defecto falso |
| Asignación con carrera (dos domiciliarios, un pedido) | **S1.1–S1.3:** asignación atómica (`FOR UPDATE SKIP LOCKED` + índice único de intento pendiente) |
| `send-push` aceptaba cualquier destinatario y texto | **SECURITY_02:** solo `{notification_id}`; el push sale de una fila que el sistema ya creó |
| Pedidos esperando indefinidamente | **FLOW_01:** plazos en el servidor + `pg_cron` cada 15 s |

## Cómo se cambia un pedido hoy
Todo por RPC `SECURITY DEFINER` (`search_path` vacío; ejecutables solo por `authenticated` y `service_role`):
`create_order` · `restaurant_advance_order` · `restaurant_assign_delivery` · `restaurant_retry_assignment` ·
`restaurant_cancel_order` · `delivery_set_shift` · `delivery_accept_order` · `delivery_reject_order` ·
`delivery_complete_order` · `delivery_update_location` · `client_cancel_order` · `server_time`.
`guard_order_update` sigue como **segunda barrera** (lista permitida por rol) y no se modifica.

## `create_order` (8 parámetros, LOOP_CLIENT_05C)
`p_restaurant_id, p_delivery_address, p_special_instructions, p_payment_method, p_items, p_client_order_id, p_cash_amount, p_notes_to_restaurant`
- Restaurante aprobado y abierto; productos del restaurante y disponibles; cantidades 1–99; dirección 5–300.
- `total = subtotal + tarifa` calculado en el servidor.
- `cash_amount` (M4/M5): solo con `cash_on_delivery`, entero, ≤ 10.000.000 y ≥ total del servidor; `null` = sin especificar.
- `notes_to_restaurant` (M6/M7): `trim`; vacío → `null`; **> 150 caracteres → `notes_too_long`** (no se recorta).
- Una llave `client_order_id` ya usada devuelve el pedido existente **sin revalidar**; por eso la firma de la llave en el
  navegador cubre restaurante + productos + método de pago + efectivo + notas + dirección (cualquier cambio = pedido nuevo).
- `cash_amount`, `notes_to_restaurant` y `client_order_id` no los puede modificar el cliente (`order_update_not_allowed`, 42501).

## Migraciones (orden)
`20260924` M1 revoke inserts · M2 client_order_id · M3 idempotencia · S0 guard profiles/restaurants · S0b aprobación de cuentas ·
S1.1 esquema de asignación · S1.2 `guard_order_update` v2 · S1.3 RPC de transición · S1.5 revoke UPDATE directo · server_push.
`20260925` F1.1 plazos · F1.2 vencimiento · F1.3 cron · M4 `cash_amount` · M5 RPC cash · M6 notas · M7 RPC notas.
Cada una con `.rollback.sql`; pruebas en `supabase/tests/` (transacción abortada).

## Pendiente / límites conocidos
- **La dirección del cliente solo se oculta en la interfaz** hasta que el domiciliario acepta: el servidor aún devuelve la fila
  completa a un domiciliario asignado. Cerrable con una vista segura (recomendado dentro de LOOP_CLIENT_05D).
- El admin puede editar cualquier pedido (por diseño).
- **Leaked Password Protection** (Dashboard → Authentication): activar; no es SQL.
- Respaldos de Supabase: confirmar plan y frecuencia antes del piloto.
- Advisor 0029 sobre `create_order` es intencional (debe ser llamable por clientes autenticados).
- Mostrar `cash_amount` y `notes_to_restaurant` a restaurante, domiciliario y admin → **LOOP_CLIENT_05D (bloqueante del piloto)**.
