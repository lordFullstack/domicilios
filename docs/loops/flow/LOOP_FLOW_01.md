# LOOP_FLOW_01 — Tiempos de respuesta: 120 s para confirmar (restaurante) y aceptar (domiciliario)

**Categoría:** FLOW
**Tipo:** Feature (operación del pedido)
**Estado:** 🟡 Pendiente — **depende de LOOP_SECURITY_01 (Aceptar/Rechazar, turno, intentos) y LOOP_SECURITY_02 (push desde el servidor)**
**Objetivo:** Que un pedido nunca quede esperando indefinidamente: si el **restaurante** no confirma en 120 s, el pedido se **devuelve al cliente** (cancelación automática con aviso claro); si el **domiciliario** no acepta en 120 s, el pedido se **reasigna a otro**.
**NO ES SOBRE:** las transiciones y la asignación (SECURITY_01), la seguridad y el envío de push (SECURITY_02), checkout (05C), mostrar efectivo y notas (05D), reembolsos de pago en línea (LOOP_CLIENT_07), algoritmos de asignación por distancia.
**Rama:** `loop/flow-01-response-timers` (desde `main`, después de cerrar SECURITY_01 y 02).
**Numeración de migraciones:** `0007xx` (SECURITY_01 = `0005xx`, SECURITY_02 = `0006xx`, 05C pasa a `0008xx`+).
**Ejecución:** base de datos → tests → frontend, en sub-tandas con OK de Jorge. Migraciones una por una con OK explícito; pruebas en transacción abortada; NO destructivo. Instalar extensiones (`pg_cron`, y `pg_net` si SECURITY_02 no lo hizo) también requiere OK.

> **DECISIONES CONFIRMADAS (Jorge, 24-sep-2026):**
> 1. **Contador de 120 s** para confirmar (restaurante) y aceptar (domiciliario). Restaurante sin respuesta → se devuelve al cliente. Domiciliario sin respuesta → se reasigna a otro.
> 2. **El contador vive en el servidor** (hora límite guardada en el pedido), no en el navegador.
> 3. **Doble control:** cada acción rechaza si ya venció + tarea de `pg_cron` cada 15 s que procesa los vencidos.
> 4. **Restaurante:** cancelación con motivo `restaurant_timeout`; el cliente ve "el restaurante no respondió a tiempo, no se te cobró nada" con salidas (pedir de nuevo / otros restaurantes). Sonido repetido y pantalla encendida en el panel del restaurante.
> 5. **Domiciliario:** botón **Rechazar** (reasigna al instante) e interruptor **En turno** (ya en SECURITY_01).
> 6. **Si nadie acepta** (los 2 vencen o rechazan): el pedido queda `ready` sin domiciliario, **no se cancela**; aviso al restaurante y al admin; el restaurante puede "Buscar domiciliario otra vez" (nueva ronda). El cliente ve "Buscando domiciliario…".
> 7. **Tiempos configurables** en `app_settings` (120 s por defecto), ajustables por el admin sin desplegar código.
> 8. Pago en línea (futuro): cada cancelación automática exigirá reembolso → anotado en LOOP_CLIENT_07.

---

## 0. LEE PRIMERO
1. `docs/loops/TEMPLATE.md`
2. `docs/loops/security/LOOP_SECURITY_01.md` y su reporte (estados, intentos de asignación, turno, RPC)
3. `docs/loops/security/LOOP_SECURITY_02.md` (push desde el servidor)
4. `docs/design-system/STATES.md` (`ErrorState`), `src/features/admin/components/DeliveryFeeCard.tsx` (patrón de ajuste de `app_settings`)

## 1. ROL
**Senior Backend/Frontend Engineer (Supabase + React) + Mobile UX + Reliability.**

## 2. REGLA ABSOLUTA — INSPECCIONA ANTES DE MODIFICAR
Buscar: `pending`, `confirm_deadline`, `accept_deadline`, `cancel_reason`, `app_settings`, `useDeliveryFee`, `DeliveryFeeCard`, `order_assignment_attempts`, `on_shift`, `OrderDetailPage`, `reorder`, `cron.job`.
**Reportar antes de tocar:** estado real tras SECURITY_01/02; extensiones instaladas (`pg_cron` 1.6.4 y `pg_net` 0.20.4 están **disponibles, no instaladas**); definición vigente de `create_order` (05C la modifica: **no se toca aquí**).

## 3. ESTADO REAL AUDITADO (24-sep-2026, antes de SECURITY_01)
### 3.1 Lo que YA existe
| Pieza | Estado real | Acción |
|---|---|---|
| `app_settings` | 1 fila (`delivery_fee` = 5000); SELECT público, UPDATE solo admin | Agregar 2 columnas |
| `DeliveryFeeCard` + `useDeliveryFee` | Patrón admin de ajuste de un valor | Reutilizar el patrón |
| Realtime de `orders` | `useOrders` recarga con cada cambio | Base del contador |
| Reordenar | Existe en `OrderDetailPage` (salta productos no disponibles) | Reutilizar para "Pedir de nuevo" |
| `ErrorState` / `stateCopy.ts` | Vista de error con salida (LOOP_VISUAL_08) | Reutilizar para "El restaurante no respondió" |
| `notifications` | SELECT/UPDATE propios; sin INSERT de clientes | Aviso in-app al admin/restaurante |
| Pedidos pendientes >1 día | 0 hoy | — |
### 3.2 Lo que SÍ falta
Horas límite en el pedido · motivo de cancelación · tarea programada · reasignación automática por vencimiento · cuenta regresiva y sonido · pantallas de expiración · ajuste de tiempos · pruebas.

## 4. NO CREAR UN SEGUNDO…
Un solo mecanismo de vencimiento (función `private.expire_overdue_orders()` + `pg_cron`); no temporizadores en el navegador; no otro sistema de notificaciones (usa SECURITY_02); no otra pantalla de error (`ErrorState`); no tocar `create_order`.

## 5. PROBLEMAS A RESOLVER
- **P1** Pedido `pending` sin respuesta espera indefinidamente.
- **P2** Pedido asignado sin aceptar queda colgado.
- **P3** Sin motivo de cancelación: no se distingue cliente / restaurante / vencimiento.
- **P4** Sin aviso claro al cliente ni al operador cuando algo vence.

## 6. DECISIONES DE DISEÑO

### D1 — Datos nuevos (aditivos, con rollback)
- `orders.confirm_deadline timestamptz` (se fija con un **trigger BEFORE INSERT** = `now() + restaurant_confirm_seconds`; así **no se modifica `create_order`**).
- `orders.accept_deadline timestamptz` (la fija la asignación al asignar un domiciliario).
- `orders.cancel_reason text` con `check` ∈ `customer | restaurant | restaurant_timeout | admin` (pedidos antiguos = null).
- `app_settings.restaurant_confirm_seconds` y `delivery_accept_seconds` (`integer not null default 120 check between 30 and 900`).
- Índices parciales sobre las horas límite (`where … is not null`).
- El intento en `order_assignment_attempts` pasa a `expired` cuando vence.

### D2 — Servidor (una sola fuente de verdad)
- **`private.expire_overdue_orders()`**, invocada por `pg_cron` cada **15 s**:
  - `pending` con `confirm_deadline < now()` → `cancelled`, `cancel_reason='restaurant_timeout'`, aviso al cliente.
  - `ready` asignado con `accept_deadline < now()` → intento `expired`, se libera y se reasigna con la regla de SECURITY_01 (equidad, en turno, libre, excluyendo intentos de la ronda). Sin candidato → queda `ready` sin asignar + aviso al restaurante y admin (evento `no_delivery`).
- Corre sin usuario (`auth.uid()` nulo) → `guard_order_update` no la bloquea (regla existente del trigger).
- **Bloqueo por fila** (`FOR UPDATE SKIP LOCKED`): si el restaurante confirma justo cuando vence, gana quien tome primero el bloqueo; el otro recibe `order_expired` / `invalid_transition` y la UI lo explica.
- Las RPC de confirmar (`restaurant_advance_order` desde `pending`) y `delivery_accept_order` **rechazan** si la hora límite ya pasó (`order_expired`), para que el 0:00 del contador sea honesto. (Ajuste mínimo a las RPC de SECURITY_01.)
- **Cadencia:** con 15 s el vencimiento real cae entre 120 y 135 s.

### D3 — Reloj: hora del servidor
La app calcula la cuenta regresiva desde `confirm_deadline`/`accept_deadline` con un desfase de reloj obtenido una vez del servidor (`server_time()` RPC), no del reloj del celular. Se recalcula con el realtime de `orders`.

### D4 — Restaurante
Cuenta regresiva por pedido pendiente (`1:45`), **sonido repetido** hasta que se atienda (Web Audio, sin dependencias) y **Wake Lock** para no apagar la pantalla mientras el panel está abierto. El push de "nuevo pedido" sale del servidor (SECURITY_02). Aviso in-app "Sin domiciliario disponible" con botón **Buscar domiciliario otra vez** (nueva ronda).

### D5 — Domiciliario
El pedido ASIGNADO muestra cuenta regresiva y **Aceptar / Rechazar**. Al vencer desaparece de su lista con un aviso breve. Solo recibe pedidos si está **En turno**.

### D6 — Cliente
Seguimiento: "Esperando confirmación del restaurante (1:45)". Si vence: `ErrorState` (ilustración `sad`), título "El restaurante no respondió a tiempo", descripción "No se te cobró nada", salidas **Pedir de nuevo** (reordenar) y **Ver restaurantes**. Con el pedido `ready` sin asignar: "Buscando domiciliario…".

### D7 — Admin
Tarjeta "Tiempos de respuesta" con los dos valores (mismo patrón que `DeliveryFeeCard`); alerta de pedidos sin domiciliario. RLS existente (`app_settings_update_admin`).

## 7. ALCANCE
**✅ Incluido:** D1–D7; extensión `pg_cron`; migraciones; pruebas; docs.
**🚫 Fuera:** push del servidor (SECURITY_02); reembolsos (LOOP_CLIENT_07); asignación por distancia; estadísticas de tasa de expiración (se guarda `cancel_reason`, el reporte queda para después); cambios de checkout.

## 8. SUB-TANDAS Y MIGRACIONES (una por una, con OK)
| Sub-tanda | Contenido | Migración |
|---|---|---|
| **F1.1 Datos** | Columnas de horas límite, `cancel_reason`, ajustes en `app_settings`, trigger de `confirm_deadline`, índices | `0007xx_order_deadlines` |
| **F1.2 Vencimiento** | `expire_overdue_orders()`, `server_time()`, ajuste de RPC (rechazar vencidos) | `0007xx_expire_overdue_orders` |
| **F1.3 Programación** | Instalar `pg_cron` + programar cada 15 s | `0007xx_schedule_expiry_cron` |
| **F1.4 Frontend + tests** | D3–D7, QA en preview | — |
| **F1.5 Cierre** | Docs, reporte, verificación del cron | — |

## 9. ARCHIVOS
`supabase/migrations/0007xx_*` (+ rollback), `supabase/tests/*` · `src/hooks/` (hook de cuenta regresiva y de `server_time`) · `src/features/restaurant/` (contador, sonido, Wake Lock, alerta sin domiciliario) · `src/features/delivery/` (Aceptar/Rechazar con contador) · `src/features/client/` (`OrderDetailPage`, vista de expiración) · `src/features/admin/components/` (tarjeta de tiempos) · `src/shared/constants/stateCopy.ts` · docs. Archivos ≤ 300 líneas.

## 10. A11Y / UX
Cuenta regresiva en texto (`tabular-nums`) y con `aria-live` discreto (anunciar al inicio y a los últimos 10 s, no cada segundo); el sonido tiene alternativa visual y vibración; contraste según `COLORS.md`; objetivos táctiles ≥ 44 px; `prefers-reduced-motion` respetado.

## 11. TESTS
**SQL (transacción abortada; los vencimientos se simulan poniendo la hora límite en el pasado y llamando a `private.expire_overdue_orders()`):**
1. `pending` vencido → `cancelled` + `restaurant_timeout` · 2. `pending` no vencido no se toca · 3. Confirmar después de vencido → `order_expired` · 4. Asignado sin aceptar vencido → intento `expired`, reasigna a otro en turno y libre · 5. No reasigna al que ya venció/rechazó en la ronda · 6. Sin candidato → `ready` sin asignar + evento `no_delivery`, no se cancela · 7. Nueva ronda (`restaurant_retry_assignment`) vuelve a considerar a los excluidos · 8. Aceptar antes del vencimiento funciona y anula el vencimiento · 9. Ningún pedido `confirmed/preparing/in_delivery/delivered` es afectado · 10. `confirm_deadline` se fija por el trigger sin modificar `create_order` · 11. Los tiempos leen `app_settings` (120 por defecto, límites 30–900) · 12. Conteo de pedidos igual al inicial tras cada test.
**Programación:** tras aplicar, verificar en solo lectura que el trabajo existe en `cron.job` y que `cron.job_run_details` registra ejecuciones sin error.
**Frontend:** hook de cuenta regresiva (desfase del servidor, llega a 0), vista de expiración del cliente, Aceptar/Rechazar, tarjeta admin. Línea base tras SECURITY_01.
**Concurrencia:** misma limitación honesta que SECURITY_01 (bloqueo demostrable; "quién gana" con confirmación real queda para QA manual).

## 12. QA CRÍTICO (Jorge, en preview)
Restaurante no responde → a los ~2 min el pedido se cancela y el cliente ve la pantalla con salidas · Restaurante confirma a tiempo → no se cancela · Domiciliario no acepta → pasa al otro · Rechazar → pasa al otro al instante · Ninguno acepta → alerta al restaurante, "Buscando domiciliario…" al cliente, "Buscar otra vez" funciona · Sonido y pantalla encendida en el panel del restaurante · Cambiar los segundos en Admin surte efecto · Con el celular con el reloj adelantado/atrasado, la cuenta regresiva es correcta.

## 13. CRITERIOS DE ÉXITO
- [ ] Ningún pedido queda esperando indefinidamente
- [ ] Restaurante sin respuesta → cancelación con `restaurant_timeout` y aviso claro al cliente
- [ ] Domiciliario sin respuesta → reasignado a otro (sin repetir al mismo en la ronda)
- [ ] Nadie acepta → `ready` sin asignar, alertas, reintento manual; no se cancela
- [ ] Tiempos configurables por el admin
- [ ] Cuenta regresiva basada en la hora del servidor
- [ ] `create_order` intacto
- [ ] 12 casos SQL + tests de frontend + build + lint en verde

## 14. REPORTE FINAL
`docs/loops/flow/LOOP_FLOW_01_REPORTE.md`: IMPLEMENTADO · MIGRACIONES · CÓMO FUNCIONA EL VENCIMIENTO · TESTS (antes → después) · QA · DEUDA (reembolsos con pago en línea, estadísticas de expiración, 05D) · PREPARACIÓN PARA EL PILOTO.

## 15. LO QUE NO DEBES HACER
NO aplicar DDL ni instalar extensiones sin OK explícito; NO pruebas destructivas; NO temporizadores solo en el navegador; NO tocar `create_order`; NO cancelar cuando nadie acepta; NO commitear sin "QA OK"; NO mergear sin orden explícita.

## 16. BLOQUEANTES PARA EL PILOTO (recordatorio)
FLOW_01 no reemplaza a LOOP_CLIENT_05D (mostrar `cash_amount` y notas en los 3 roles): **sigue siendo obligatorio antes de lanzar a usuarios reales.**

## 17. REGLA FINAL
Un pedido siempre tiene un dueño que debe responder y un plazo para hacerlo; si el plazo vence, el sistema decide, avisa y sigue. **Prioridad:** FIABILIDAD (el servidor decide el plazo) → CLARIDAD (avisos con salida) → OPERACIÓN (sonido, turno, reintento) → AJUSTE (tiempos configurables).

## REGLA DE EJECUCIÓN
No lo ejecutes todavía. Solo crea el archivo y confírmame ruta + tamaño; después reporta la inspección previa y espera el OK.
