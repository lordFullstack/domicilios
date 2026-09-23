# Seguridad de pedidos y tarifa de domicilio — 22/23-sep-2026

## Hallazgos (auditados en la base real)
1. `orders.total` y `order_items.unit_price` se guardaban tal como los mandaba el celular. Sin trigger ni RPC de validación.
2. `orders_update_involved` sin restricción de columnas: el cliente podía cambiar total, marcar su pedido `delivered`/`paid`; cualquier domiciliario podía editar pedidos libres.
3. Pedido e items en dos inserts sin transacción; el cliente podía insertar items en su pedido en cualquier momento.
4. Revisión de los 35 pedidos existentes: 0 manipulados (totales = suma de items, sin productos de otro restaurante, precios = menú).

## Migraciones aplicadas (en orden)
| # | Nombre | Qué hace |
|---|---|---|
| 1 | `app_settings_delivery_fee` | Tabla de configuración (1 fila). `delivery_fee` entero 0–100.000 COP, arranca en 0. Lectura pública, update solo `is_admin()`. |
| 2 | `orders_delivery_fee_column` | `orders.delivery_fee` (snapshot por pedido, default 0). |
| 3 | `create_order_rpc` | RPC atómica: valida restaurante (aprobado + abierto), productos (del restaurante, disponibles), cantidades 1–99, dirección; precios desde `products`, tarifa desde `app_settings`; `total = subtotal + tarifa`. |
| 4 | `create_order_rpc_no_temp_table` | Corrección: sin tabla temporal (fallaba en 2 llamadas en la misma transacción). |
| 5 | `notifications_order_id_index` | Advisor 0001 preexistente (FK sin índice). |
| 6 | `guard_order_updates` | Trigger BEFORE UPDATE por rol (ver tabla). Probado con 16 escenarios en transacción revertida. |

### Reglas del trigger (no admin)
| Rol | Permitido |
|---|---|
| Cliente | `pending`/`confirmed` → `cancelled` |
| Restaurante | pending→confirmed→preparing→ready; cancelar hasta `ready`; ready→in_delivery asignando un perfil `delivery` |
| Domiciliario | Tomar pedido `ready` libre asignándose a sí mismo; en su pedido: ubicación, in_delivery→delivered, pending→paid solo al entregar en efectivo |
| Todos | NUNCA: total, delivery_fee, user_id, restaurant_id, payment_method, dirección |

## Pendiente
- `PENDIENTE_revoke_direct_order_inserts.sql` → aplicar DESPUÉS del deploy del frontend.
- Advisor "Leaked Password Protection": activar en Dashboard → Authentication → Providers (preexistente, no es SQL).
- Advisor 0029 sobre `create_order` es intencional: la RPC debe ser llamable por clientes autenticados y necesita SECURITY DEFINER para insertar cuando se quiten los inserts directos.

## Hallazgo preexistente (no corregido)
El domiciliario NO puede ver pedidos `ready` sin asignar: la política SELECT de `orders` no lo incluye. El botón "Aceptar" de la lista de disponibles no funciona en producción; hoy los pedidos llegan al domiciliario porque el restaurante los asigna con "Enviar". Decidir si el domiciliario debe ver esos pedidos (implica ver dirección antes de aceptar).
