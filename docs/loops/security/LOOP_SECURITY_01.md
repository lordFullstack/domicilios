# LOOP_SECURITY_01 — Transiciones de pedido en el servidor (asignación automática atómica + Aceptar)

**Categoría:** SECURITY
**Tipo:** Fix / Consolidación (fortalecer la arquitectura existente) + un paso de producto acordado (Aceptar / Rechazar / En turno)
**Estado:** 🟡 Pendiente
**Objetivo:** Que todo cambio de estado de un pedido (restaurante, domiciliario, cliente) y toda escritura de GPS pasen por RPC del servidor, con la asignación de domiciliario atómica (sin carrera) y un flujo `asignado → aceptar → en camino → entregado`.
**NO ES SOBRE:** temporizadores de 120 s (LOOP_FLOW_01), push desde el servidor / seguridad de `send-push` (LOOP_SECURITY_02), checkout (05C), mostrar efectivo y notas (05D), pago en línea (07), marketplace de pedidos libres.
**Rama:** `loop/security-01-order-transitions` (desde `main`).
**Ejecución:** base de datos → tests → frontend, en sub-tandas, cada una con build + lint + tests y OK de Jorge. **Migraciones: archivo → prueba en transacción abortada → OK explícito de Jorge → una por una.** NO destructivo. Frontend solo después de confirmar la migración aplicada.
**Numeración de migraciones:** SECURITY_01 = `0005xx`. (SECURITY_02 = `0006xx`, FLOW_01 = `0007xx`, 05C pasa a `0008xx`+.)

> **DECISIONES CONFIRMADAS (Jorge / Tech Lead, 24-sep-2026):**
> 1. Las RPC son **defensa en profundidad + atomicidad**, no la corrección de una vulnerabilidad P0: `guard_order_update` ya es una barrera de autorización real.
> 2. El restaurante **puede cancelar hasta `ready`** (no solo `pending`).
> 3. **Asignación automática** y atómica (no selector manual, no marketplace). El domiciliario **solo ve y actúa sobre pedidos que ya le fueron asignados**; los pedidos `ready` sin asignar no son visibles para domiciliarios.
> 4. Flujo del domiciliario: **ASIGNADO → ACEPTAR (o RECHAZAR) → EN CAMINO → ENTREGADO**. La app pasa de "Pedidos disponibles" a **"Mis pedidos"**. No se muestra la dirección completa antes de aceptar.
> 5. **"En turno / Fuera de turno"** para el domiciliario: solo se asigna a quienes están en turno.
> 6. Piloto: 2 restaurantes + 2 domiciliarios.
> 7. Orden: base de datos → tests → frontend. Sin tocar 05C hasta cerrar seguridad.

---

## 0. LEE PRIMERO
1. `docs/loops/TEMPLATE.md`
2. `docs/security/SEGURIDAD_PEDIDOS.md` y `docs/security/guard_order_updates.sql`
3. `docs/loops/client/LOOP_CLIENT_05_REPORTE.md` (M1–M3 ya en producción)
4. Referencia (NO copiar tal cual): paquete de auditoría `domicilios-audit-pack-2026-09-24.zip` → `supabase/migrations/20260924000400_secure_order_transitions.sql`, y los 4 archivos de frontend. Es una base de ideas; se adapta a las decisiones de arriba.

## 1. ROL
**Senior Backend/Frontend Engineer (Supabase + React) + Security Reviewer + Mobile UX.** El paquete de auditoría propone RPC; este LOOP las **adapta al comportamiento real** de la app y a las decisiones de Jorge.

## 2. REGLA ABSOLUTA — INSPECCIONA ANTES DE MODIFICAR
Buscar: `updateOrder`, `acceptOrder`, `getAvailableDeliveryPerson`, `updateOrderLocation`, `availableOrders`, `handleAdvanceStatus`, `handleCancelOrder`, `handleAcceptOrder`, `handleCompleteDelivery`, `canCancel`, `triggerOrderPushNotification`, `guard_order_update`, `orders_update_involved`, `orders_select_involved_or_admin`.
**Reportar antes de tocar:** definición vigente del trigger y de las políticas de `orders`; qué triggers tiene `profiles` (¿protegen `role`/`active` contra auto-edición, ya que `profiles_update_own_or_admin` permite editar la propia fila?); quién más escribe `orders` (admin: `useAdminOrders`, `admin.service`).

## 3. ESTADO REAL AUDITADO (24-sep-2026)

### 3.1 Lo que YA existe (no reconstruir)
| Pieza | Estado real | Acción |
|---|---|---|
| Trigger `private.guard_order_update` | Lista permitida por rol (cliente cancela `pending/confirmed`; restaurante avanza en orden, cancela hasta `ready`, asigna `ready→in_delivery`; domiciliario toma pedido libre, ubicación, entrega y pago en efectivo). Admin/service sin restricción. | Se **extiende** (ver D2); no se reemplaza |
| `orders_select_involved_or_admin` | Cliente, domiciliario asignado, dueño del restaurante, admin. **El domiciliario no ve pedidos `ready` sin asignar.** | Se mantiene (decisión 3) |
| `orders_update_involved` | Permite UPDATE a cliente, domiciliario, dueño y **cualquier** domiciliario si el pedido no tiene asignado; la barrera real es el trigger. | Se cierra al final (S1.5) |
| Asignación hoy | **Automática y en el navegador:** `getAvailableDeliveryPerson()` toma el primer domiciliario (por nombre) sin pedido `in_delivery` y luego `updateOrder`. **Carrera real** entre dos restaurantes o dos toques. No considera turno. | Se pasa al servidor |
| Aceptar hoy | No existe: el restaurante pasa directo a `in_delivery`. `acceptOrder` (`useLocalData.ts:800`) solo sirve a una lista `availableOrders` que **siempre está vacía** (RLS). | Se reemplaza por Aceptar/Rechazar sobre pedidos asignados |
| Entrega / GPS / cancelar | `updateOrder` y `updateOrderLocation` con `update()` directo. | RPC |
| Push | `triggerOrderPushNotification` desde el navegador (`useLocalData.ts:784, 842–851`). | No se toca (SECURITY_02) |
| Datos reales | 2 restaurantes aprobados, 2 domiciliarios activos, 37 pedidos, tarifa $5.000. | — |

### 3.2 Lo que el paquete asumía mal (corregido)
- "P0 / vulnerabilidad de transiciones": el trigger ya la mitiga → defensa en profundidad.
- Restaurante cancela solo en `pending`: regresión frente al trigger → **hasta `ready`**.
- Asignación "por antigüedad de perfil": ignora turno y equidad → criterio propio (D3).
- "Aceptar pedidos `ready` libres": choca con RLS y con la decisión 3 → solo pedidos asignados.
- Exige un staging inexistente → pruebas en transacción abortada + QA de Jorge en preview.

### 3.3 Lo que SÍ falta (alcance real)
RPC de transición · asignación atómica · Aceptar/Rechazar · turno · registro de intentos · GPS por RPC · extensión del trigger · cierre del UPDATE directo · 12+ casos SQL · frontend (restaurante, domiciliario, cliente) · docs.

## 4. NO CREAR UN SEGUNDO…
- No duplicar la lógica de autorización: el trigger sigue como segunda barrera.
- No crear otro sistema de asignación en el cliente: se elimina `getAvailableDeliveryPerson`.
- No tocar `create_order` (05C lo modifica; este LOOP no).
- No exponer pedidos libres ni la dirección a domiciliarios sin asignación.

## 5. PROBLEMAS A RESOLVER
- **P1 — Carrera en la asignación:** dos restaurantes o dos toques asignan al mismo domiciliario.
- **P2 — Transiciones y GPS con `update()` desde el navegador:** la regla está repartida entre UI, RLS y trigger.
- **P3 — Sin turno:** se puede asignar a alguien que no está trabajando.
- **P4 — Sin Aceptar/Rechazar:** el domiciliario no puede rechazar un pedido y el restaurante no sabe si lo recibió.
- **P5 — Lista "disponibles" muerta:** UI que nunca muestra nada.

## 6. DECISIONES DE DISEÑO

### D1 — Modelo de estados (sin estados nuevos)
- `pending → confirmed → preparing → ready` (restaurante).
- **Asignado sin aceptar** = `ready` + `delivery_person_id` no nulo.
- **Aceptar** = `ready` (asignado a mí) → `in_delivery`.
- **Rechazar** = `ready` (asignado a mí) → `ready` sin domiciliario + intento marcado `rejected`; la reasignación automática se dispara en la misma transacción (D3).
- `in_delivery → delivered` (marca `paid` si es efectivo).
- Cancelar: cliente en `pending/confirmed`; restaurante hasta `ready` (si había domiciliario asignado, se libera y el intento queda `cancelled`).
- Un domiciliario tiene como máximo **1 pedido a la vez** (asignado o en camino).

### D2 — `guard_order_update`: cambio sensible, requiere OK explícito ⚠️
El trigger hoy solo permite asignar en el salto `ready→in_delivery` y que el domiciliario tome un pedido *libre*. Con el nuevo flujo hay que permitir: (a) restaurante `ready` → `ready` con `delivery_person_id` asignado / liberado; (b) domiciliario asignado a sí mismo `ready → in_delivery` (Aceptar) y `ready` → sin asignar (Rechazar).
- **Opción T1 (recomendada):** ampliar la lista permitida con esas transiciones exactas, manteniendo la política "todo lo no listado se rechaza". Se prueban los 16 escenarios existentes + los nuevos (regresión completa).
- **Opción T2:** que las RPC marquen una variable de sesión para saltar el trigger. Más simple, pero debilita la barrera; **no recomendada**.
- Nada se aplica sin OK de Jorge; la migración se prueba en transacción abortada.

### D3 — Asignación automática atómica
- Elegible: `role='delivery'`, `active`, **`on_shift`**, sin pedido asignado/en camino, y **no** presente en intentos `rejected/expired` de la ronda actual del pedido.
- Orden: quien lleva más tiempo sin recibir un pedido (equidad), luego `id`.
- Concurrencia: `FOR UPDATE` sobre la fila del pedido y **`FOR UPDATE SKIP LOCKED`** sobre la fila del domiciliario candidato, y comprobar dentro de la transacción que no tiene otro pedido activo. Dos restaurantes simultáneos nunca reciben al mismo domiciliario.
- Sin candidato → error `no_delivery_available` (el pedido queda `ready` sin asignar; el restaurante lo ve).
- `orders.assignment_round integer not null default 1`; `restaurant_retry_assignment` la incrementa (nueva ronda: los excluidos vuelven a ser elegibles).

### D4 — Datos nuevos (aditivos, con rollback)
- `profiles.on_shift boolean not null default false` (los 2 domiciliarios actuales quedan **fuera de turno** hasta que lo activen: avisar antes del piloto).
- `orders.assignment_round integer not null default 1`.
- Tabla `order_assignment_attempts` (`id`, `order_id`, `driver_id`, `round`, `assigned_at`, `resolved_at`, `outcome` ∈ `pending|accepted|rejected|expired|cancelled`). RLS: lectura para admin y dueño del restaurante del pedido; **sin escritura directa** (solo RPC).

### D5 — RPC (todas `SECURITY DEFINER`, `search_path=''`, ACL authenticated + service_role, `revoke` a public/anon)
`restaurant_advance_order` (pending→…→ready) · `restaurant_assign_delivery` · `restaurant_retry_assignment` · `restaurant_cancel_order` (hasta `ready`) · `delivery_set_shift` · `delivery_accept_order` · `delivery_reject_order` · `delivery_complete_order` · `delivery_update_location` (solo pedido propio `in_delivery`, rangos válidos) · `client_cancel_order`. Cada una valida sesión, rol activo, propiedad, estado y bloquea la fila; errores con códigos estables (`not_authenticated`, `not_authorized`, `order_not_found`, `invalid_transition`, `no_delivery_available`, `order_unavailable`, `delivery_busy`, `order_not_assigned`, `invalid_location`).

### D6 — Cierre del UPDATE directo (S1.5, al final, con OK aparte)
Cuando el frontend nuevo esté desplegado y las PWA antiguas hayan expirado, se **elimina `orders_update_involved` para no-admin** (dejando admin). Las RPC (dueño postgres) no dependen de esa política. El trigger queda como segunda barrera. Es lo que hace cierto "no hay `orders.update()` en cliente/restaurante/domiciliario".

### D7 — Frontend
- Restaurante: "Enviar" → `restaurant_assign_delivery`; mensaje `no_delivery_available`; cancelar hasta `ready` con confirmación; estados de carga por acción ("Actualizando…").
- Domiciliario: **"Mis pedidos"** (ASIGNADO → ACEPTAR/RECHAZAR → EN CAMINO → ENTREGADO), interruptor **En turno**, CTA sticky, COBRAR destacado en efectivo, "Ubicación actualizada hace X". Sin lista de disponibles.
- Cliente: cancelar por RPC (`client_cancel_order`).
- Se elimina `getAvailableDeliveryPerson`, `updateOrder`/`acceptOrder` de estos flujos y `updateOrderLocation` directo. Admin no cambia.

## 7. ALCANCE
**✅ Incluido:** D1–D7; migraciones; tests SQL y de frontend; docs (`SEGURIDAD_PEDIDOS.md`, `QA_MATRIX.md`, `LOOP_STATUS.md` desactualizados).
**🚫 Fuera:** temporizadores (FLOW_01); push del servidor (SECURITY_02); checkout/05C/05D; pago en línea; selector manual de domiciliario; marketplace; tracking avanzado; algoritmos de asignación por distancia.

## 8. SUB-TANDAS
| Sub-tanda | Contenido | Migraciones (una por una, con OK) |
|---|---|---|
| **S1.1 Base** | Columnas `on_shift`, `assignment_round`; tabla de intentos + RLS | `0005xx_order_assignment_schema` |
| **S1.2 Trigger** | Extender `guard_order_update` (D2) | `0005xx_guard_order_update_v2` |
| **S1.3 RPC** | Las 10 RPC de D5 + permisos | `0005xx_order_transition_rpcs` |
| **S1.4 Frontend + tests** | D7, tests, QA en preview | — |
| **S1.5 Cierre** | Quitar UPDATE directo no-admin; docs; reporte | `0005xx_revoke_direct_order_updates` |

## 9. ARCHIVOS
`supabase/migrations/0005xx_*` (+ `.rollback.sql`), `supabase/tests/*` (un test por migración) · `src/hooks/useLocalData.ts` (RPC wrappers; se elimina lo directo) · `src/features/restaurant/pages/DashboardPage.tsx` · `src/features/delivery/pages/DashboardPage.tsx` (+ componentes de "Mis pedidos") · `src/features/client/pages/OrderDetailPage.tsx` · `src/shared/constants/stateCopy.ts` (copy de errores de transición) · docs.
Mantener archivos ≤ 300 líneas (extraer componentes).

## 10. TESTS
**SQL (transacción abortada, resultado en el mensaje):** los 12 casos del paquete + los propios:
1. Cliente no cancela pedido ajeno · 2. Cliente no cancela tras `preparing` · 3. Restaurante A no toca pedido de B · 4. Restaurante no salta `pending→ready` · 5. Restaurante cancela hasta `ready` (y libera al domiciliario) · 6. Domiciliario B no acepta/completa pedido de A · 7. Domiciliario no escribe GPS de otro pedido ni fuera de `in_delivery` · 8. Coordenadas fuera de rango rechazadas · 9. `anon` no ejecuta ninguna RPC · 10. Pedido cancelado no avanza · 11. Pedido entregado no vuelve a `in_delivery` · 12. Domiciliario fuera de turno no recibe asignación · 13. Domiciliario con pedido activo no recibe otro (`delivery_busy`) · 14. Rechazar reasigna a otro y excluye al que rechazó · 15. Asignación secuencial: la segunda llamada no reasigna al mismo domiciliario · 16. Los 16 escenarios previos de `guard_order_update` siguen pasando · 17. Un cliente/restaurante/domiciliario no puede modificar `client_order_id`, `assignment_round` ni `total` · 18. Tras cada test, conteo de pedidos igual al inicial.
**Concurrencia — limitación honesta:** en una transacción abortada no hay ganador confirmado. Se demuestra (a) la lógica secuencial (15) y (b) que una segunda llamada **espera el bloqueo** de la primera (dos llamadas simultáneas contra la misma base). "Exactamente uno gana" con dos sesiones que confirman requeriría usuarios de prueba y escribir datos reales: queda como QA manual de Jorge en preview.
**Frontend:** wrappers de RPC (errores mapeados), "Mis pedidos" (estados y CTA), interruptor de turno, cancelar restaurante/cliente, sin `update()` de pedidos en los 3 flujos. Línea base: 46 archivos / 411 tests.

## 11. QA CRÍTICO (Jorge, en preview con sesión)
Cliente pide → restaurante confirma → prepara → listo → **Enviar** asigna a un domiciliario en turno → domiciliario ve ASIGNADO → **Aceptar** → EN CAMINO → GPS → ENTREGADO → efectivo queda `paid`. Además: rechazar reasigna; sin domiciliarios en turno → mensaje claro; dos restaurantes envían a la vez → dos domiciliarios distintos; cancelar hasta `ready`; el domiciliario no ve pedidos ajenos ni libres; app antigua en caché sigue funcionando hasta S1.5.

## 12. CRITERIOS DE ÉXITO
- [ ] Todo cambio de estado y GPS de cliente/restaurante/domiciliario pasa por RPC
- [ ] Asignación atómica y automática, solo a domiciliarios en turno y libres
- [ ] Aceptar/Rechazar operativos; el domiciliario solo ve lo asignado
- [ ] Restaurante cancela hasta `ready`
- [ ] `guard_order_update` extendido sin regresiones (16 + nuevos)
- [ ] UPDATE directo no-admin cerrado (S1.5)
- [ ] 18 casos SQL y tests de frontend en verde; build + lint + tests OK
- [ ] `SEGURIDAD_PEDIDOS.md`, `QA_MATRIX.md`, `LOOP_STATUS.md` actualizados

## 13. REPORTE FINAL
`docs/loops/security/LOOP_SECURITY_01_REPORTE.md`: IMPLEMENTADO · MIGRACIONES (fecha y verificación) · TRIGGER ANTES/DESPUÉS · RLS ANTES/DESPUÉS · TESTS (antes → después) · QA · DEUDA (FLOW_01 temporizadores, SECURITY_02 push, mostrar `cash_amount`/notas 05D) · PREPARACIÓN PARA FLOW_01.

## 14. LO QUE NO DEBES HACER
- NO aplicar DDL sin OK explícito de Jorge, una migración a la vez; NO pruebas destructivas.
- NO exponer pedidos libres ni direcciones a domiciliarios sin asignación.
- NO reemplazar `guard_order_update`: solo extender, con OK.
- NO copiar el paquete de auditoría sin adaptarlo.
- NO commitear sin "QA OK"; NO mergear sin orden explícita.
- NO desplegar el frontend antes de confirmar la migración aplicada; NO cerrar el UPDATE directo antes de que expire la caché de la PWA.

## 15. REGLA FINAL
La base de datos decide quién puede mover un pedido; el navegador solo pide. Una intención, un resultado, sin carreras.
**Prioridad:** SEGURIDAD (atomicidad) → COMPORTAMIENTO REAL (no cambiar reglas de negocio no acordadas) → UX (Mis pedidos) → LIMPIEZA (cerrar UPDATE directo).

## REGLA DE EJECUCIÓN
No lo ejecutes todavía. Solo crea el archivo y confírmame ruta + tamaño; después reporta la inspección previa y espera el OK.
