# LOOP_SECURITY_01 — Reporte (cerrado 24-sep-2026)

**Estado:** ✅ En producción y verificado de punta a punta con pedidos reales.
**Incluye:** S0 (escalada de roles), S0b (cuentas falsas) y S1.1–S1.5 (transiciones, asignación, aceptar/rechazar).

## Hallazgos críticos que motivaron el LOOP
1. **S0 — escalada de rol:** cualquier usuario podía cambiar su propio `profiles.role` a `admin` (y `restaurants.approved`).
2. **S0b — cuentas falsas:** el registro era público; un domiciliario o restaurante falso quedaba activo/aprobado al instante y recibía direcciones reales.
3. **Asignación con carrera y sin control:** dos domiciliarios podían tomar el mismo pedido; cualquier domiciliario editaba pedidos libres; el `UPDATE` directo de `orders` seguía abierto a los roles no admin.

## IMPLEMENTADO
| Sub-tanda | Qué hace | Migración (`supabase/migrations/2026092400…`) |
|---|---|---|
| S0 | `guard_profile_update` y `guard_restaurant_write`: lista permitida; `role`, `active`, `approved`, rating no se tocan | `0450_s0_guard_profiles_restaurants` |
| S0b | Domiciliario nace inactivo; `restaurants.approved` por defecto falso; guard en INSERT | `0460_s0b_account_approval` |
| S1.1 | `profiles.on_shift`, `orders.assignment_round`, tabla `order_assignment_attempts` (pending/accepted/rejected/expired/cancelled) con índices únicos: un intento pendiente por pedido y por domiciliario | `0500_s1_1_order_assignment_schema` |
| S1.2 | `guard_order_update` v2 (lista permitida por rol; segunda barrera) | `0510_s1_2_guard_order_update_v2` |
| S1.3 | 10 RPC `SECURITY DEFINER` (`search_path` vacío; solo `authenticated`/`service_role`): `restaurant_advance_order`, `restaurant_assign_delivery`, `restaurant_retry_assignment`, `restaurant_cancel_order`, `delivery_set_shift`, `delivery_accept_order`, `delivery_reject_order`, `delivery_complete_order`, `delivery_update_location`, `client_cancel_order`; internas `require_active_role` y `assign_next_driver` (`FOR UPDATE SKIP LOCKED`) | `0520_s1_3_order_transition_rpcs` |
| S1.4 | Frontend: todas las acciones por RPC (`orderActions.service`), interruptor **En turno**, "Pedidos por aceptar", Rechazar, `ProtectedRoute` con pantalla de cuenta en revisión | commit `4697fc7` |
| S1.5 | Se revoca el `UPDATE` directo de `orders` a los roles no admin | `0530_s1_5_revoke_direct_order_updates` |

Cada migración tiene `.rollback.sql` y test SQL en `supabase/tests/` (`s0_…`, `s0b_…`, `s1_1_…`, `s1_2_…`, `s1_3_…`, `s1_5_…`), todos en transacción abortada.

## Modelo de estados (sin estados nuevos)
`ready` + `delivery_person_id` = asignado sin aceptar · aceptar → `in_delivery` · rechazar → sin domiciliario y reasignación automática en la misma transacción · el restaurante cancela hasta `ready`.

## VERIFICACIÓN EN PRODUCCIÓN (24-sep, hecha por Jorge)
Pedidos `0fd4b0cf` y `792a242c` entregados por el flujo de RPC (intentos: aceptado; rechazado → aceptado; GPS registrado; efectivo pagado); pedido `c6222af1` cancelado; 2 domiciliarios en turno.

## DECISIONES CONFIRMADAS
Cancelar el restaurante hasta `ready` · el domiciliario solo ve lo asignado (sin marketplace) · asignación automática con Aceptar/Rechazar y "En turno" · piloto de 2 restaurantes + 2 domiciliarios.

## DEUDA CONOCIDA
- La **dirección del cliente se oculta solo en la interfaz** hasta aceptar; el servidor devuelve la fila completa al domiciliario asignado (aceptado para el piloto; cerrable con una vista segura).
- El admin puede editar cualquier pedido (por diseño).
- Un domiciliario que no responde dejaba el pedido colgado → resuelto después por FLOW_01 (plazos de 120 s).

## Ver también
`SECURITY_02` (push) · `FLOW_01` (plazos) · `docs/security/SEGURIDAD_PEDIDOS.md`.
