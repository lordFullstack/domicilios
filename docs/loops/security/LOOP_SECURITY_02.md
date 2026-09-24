# LOOP_SECURITY_02 — Push desde el servidor y `send-push` a prueba de abuso

**Categoría:** SECURITY
**Tipo:** Fix / Consolidación
**Estado:** 🟡 Pendiente
**Objetivo:** Que ningún usuario pueda enviar notificaciones push a otro (hoy `send-push` acepta `{userId, type, orderId}` de cualquier sesión válida), y que los avisos dejen de depender del navegador de quien actúa: los dispara la base de datos, a partir de las notificaciones que ya se generan.
**NO ES SOBRE:** temporizadores (LOOP_FLOW_01, que depende de este LOOP), contenido/diseño de las notificaciones, permisos del navegador (`NotificationPermissionCard`), notificaciones por correo o SMS.
**Rama:** `loop/security-02-server-push` (desde `main`).
**Ejecución:** base de datos → función Edge → frontend, con OK de Jorge en cada despliegue. **Migraciones y despliegue de la función: uno por uno, con OK explícito; pruebas en transacción abortada; NO destructivo.** No se introducen ni se manejan credenciales en este LOOP (ver D2).
**Numeración de migraciones:** `0006xx`.

> **HALLAZGO ORIGINAL (24-sep-2026):** la Edge Function `send-push` (v4, `verify_jwt` = true) recibe `{userId, type, orderId}` y envía el push con service role sin comprobar que quien llama tenga relación con ese usuario ni con ese pedido. Los `owner_id` de los restaurantes son legibles, así que cualquier sesión válida puede enviarles "Nuevo pedido" o a un domiciliario "Pedido asignado". Además el aviso solo sale si el navegador de quien actúa sigue abierto justo después de la acción.

---

## 0. LEE PRIMERO
1. `docs/loops/TEMPLATE.md`
2. `docs/loops/security/LOOP_SECURITY_01.md` (RPC de transición: ya generan los cambios que disparan las notificaciones)
3. `src/services/pushNotifications.service.ts`, `src/sw.ts` (cómo se recibe el push)

## 1. ROL
**Senior Backend Engineer (Supabase, Postgres, Edge Functions) + Security Reviewer.**

## 2. REGLA ABSOLUTA — INSPECCIONA ANTES DE MODIFICAR
Buscar: `triggerOrderPushNotification`, `send-push`, `push_subscriptions`, `handle_order_notification`, `notifications`, `pg_net`, `push_sent_at`.
**Reportar antes de tocar:** código vigente de la función Edge, extensiones instaladas, quién inserta en `notifications`.

## 3. ESTADO REAL AUDITADO (24-sep-2026)

### 3.1 Lo que YA existe (no reconstruir)
| Pieza | Estado real | Acción |
|---|---|---|
| `notifications` | 8 columnas (`id, user_id, title, body, type, order_id, read, created_at`); **206 filas, todas `type = 'order'`**; sin triggers. RLS: SELECT y UPDATE propios, **sin INSERT** para usuarios. | Añadir `push_sent_at` + trigger |
| `handle_order_notification()` | Trigger de `orders` (INSERT/UPDATE), SECURITY DEFINER: inserta la notificación al restaurante (pedido nuevo), al cliente (cada cambio de estado) y al domiciliario (al asignársele un pedido). | Reutilizar: es la fuente única de avisos |
| `send-push` (v4) | Recibe `{userId, type, orderId}`; consulta `push_subscriptions` con service role y envía Web Push (VAPID). Sin validación del llamante. **El código no está en el repo** (solo en Supabase). | Reescribir y versionar en `supabase/functions/send-push/` |
| Push desde el navegador | `triggerOrderPushNotification` en `pushNotifications.service.ts`, llamado desde `orderActions.service.ts` (3 sitios) y `useLocalData.ts` (nuevo pedido). Fire-and-forget. | Eliminar |
| `push_subscriptions` | 4 suscripciones; política `manage_own_push_subscription` (propias). | No tocar |
| Service worker | `sw.ts` recibe `{title, body, url, orderId}`. | No tocar |
| Extensiones | `pg_net` **disponible, no instalada**; `supabase_vault` instalada. | Instalar `pg_net` (con OK) |

### 3.2 Lo que SÍ falta
Función que solo obedezca a la base · disparo desde el servidor · idempotencia · guarda de la tabla de notificaciones · función versionada en el repo · frontend sin llamadas directas · pruebas.

## 4. NO CREAR UN SEGUNDO…
Otro sistema de notificaciones: la fuente sigue siendo `notifications` (que ya alimenta la campanita). No se crean tipos nuevos ni se duplican textos: el push reutiliza `title` y `body` de la fila.

## 5. PROBLEMAS A RESOLVER
- **P1 — Push arbitrario:** cualquier sesión puede mandar un push a cualquier usuario con el texto de los 5 tipos.
- **P2 — Aviso frágil:** depende de que el navegador de quien actúa siga abierto.
- **P3 — Reenvíos/abuso:** sin idempotencia ni límite; una notificación podría dispararse varias veces.
- **P4 — Notificaciones editables:** `notifications_update_own` permite a un usuario cambiar cualquier columna de sus propias notificaciones (título, cuerpo).
- **P5 — Función fuera del repo:** no hay historial ni revisión de cambios.

## 6. DECISIONES DE DISEÑO

### D1 — El push se deriva de una notificación real (recomendada)
- La función Edge acepta **solo** `{ notification_id }`. Con service role busca esa fila y envía el push a **`notification.user_id`** con **su `title`/`body`**. El llamante no puede elegir destinatario ni texto.
- El formato antiguo `{userId, type, orderId}` se **rechaza (400)**: cierra el hueco P1 en cuanto se despliega.
- **Idempotencia:** `update notifications set push_sent_at = now() where id = $1 and push_sent_at is null returning …`; si no devuelve fila, no se envía (un id repetido o ya enviado no hace nada). Cubre P3.
- `url` de destino se calcula en la función según el rol del destinatario y el pedido (restaurante → `/restaurant/orders`, domiciliario → `/delivery/active`, cliente → `/app/order/{id}`).

### D2 — Autenticación de la llamada — ⚠️ REQUIERE CONFIRMACIÓN DE JORGE
- **Opción A (recomendada para el piloto):** la función mantiene `verify_jwt = true` y el trigger la llama con la **clave pública (anon/publishable)** del proyecto. La seguridad no descansa en un secreto: aunque alguien llame a la función, solo puede provocar el envío, una vez, de una notificación **ya creada por el sistema**, al destinatario legítimo. No hay credenciales que gestionar.
- **Opción B (endurecida):** un secreto compartido guardado en Vault (base de datos) y en los secrets de la función, que la función exige en un encabezado. Requiere que **Jorge cree ambos secretos** (yo no manejo credenciales). Se puede añadir después sin cambiar el diseño.

### D3 — Disparo desde el servidor
- Instalar `pg_net` (con OK).
- Trigger `AFTER INSERT` en `notifications` → `net.http_post` a `…/functions/v1/send-push` con `{ "notification_id": … }`. Es asíncrono: si la función falla o tarda, **nunca** rompe la acción del pedido (la notificación in-app ya existe).
- Cubre pedido nuevo, cambios de estado, asignación y (con FLOW_01) expiración, sin depender de ningún navegador.

### D4 — Guarda de `notifications`
Trigger `BEFORE UPDATE`: un usuario con sesión solo puede cambiar `read`; título, cuerpo, tipo, destinatario y `push_sent_at` solo los cambia el sistema (sin usuario). Cierra P4 y protege la idempotencia.

### D5 — Frontend
Se elimina `triggerOrderPushNotification` y sus 4 usos (`orderActions.service.ts`, `useLocalData.ts`) y sus mocks en tests. `subscribeToPush`/`unsubscribeFromPush` no cambian.

### D6 — Orden de despliegue (una acción a la vez, con OK)
1. **Migración** (`pg_net`, `push_sent_at`, guarda, trigger): mientras la función vieja siga activa, el trigger recibe 400 (formato distinto): inofensivo.
2. **Función Edge v5** (desplegada y versionada en el repo): a partir de aquí el hueco P1 queda cerrado y los push salen del servidor.
3. **Frontend** sin llamadas directas. Una app antigua en caché que aún llame a `send-push` recibe 400 y sigue funcionando (el push llega por el servidor).

## 7. ALCANCE
**✅ Incluido:** D1–D6, migración `0006xx`, función Edge v5 en `supabase/functions/send-push/`, cambio de frontend, pruebas, documentación (`SEGURIDAD_PEDIDOS.md`).
**🚫 Fuera:** secretos compartidos (opción B, hasta que Jorge decida), límites de frecuencia por usuario, cambios de texto de las notificaciones, notificaciones por otros canales, temporizadores (FLOW_01).

## 8. ARCHIVOS
`supabase/migrations/0006xx_server_push.sql` (+ rollback) · `supabase/tests/*` · `supabase/functions/send-push/index.ts` (+ `payload.ts` con la lógica pura) · `src/services/pushNotifications.service.ts`, `src/services/orderActions.service.ts`, `src/hooks/useLocalData.ts` y sus tests · `docs/security/SEGURIDAD_PEDIDOS.md`.

## 9. A11Y / PERFORMANCE / CONSOLA
Sin cambios de interfaz. El trigger es asíncrono (no añade latencia a las acciones del pedido). Sin errores nuevos en consola: al quitar las llamadas desaparece la petición `send-push` desde el navegador.

## 10. BUILD, LINT Y TYPECHECK
`npm run build` · `npm run lint` (= `tsc --noEmit`) · tests. Línea base: 51 archivos / 444 tests.

## 11. TESTS
**SQL (transacción abortada):**
1. `pg_net` instalada y el trigger existe · 2. Insertar una notificación **encola** una petición con `{"notification_id": …}` a `send-push` (se lee `net.http_request_queue`) · 3. Un usuario NO puede insertar notificaciones ajenas · 4. Un usuario puede marcar `read` en la suya y NO puede cambiar `title`, `body`, `user_id` ni `push_sent_at` · 5. Un usuario no puede tocar notificaciones de otro · 6. El sistema (sin usuario) sí puede actualizar `push_sent_at` · 7. Crear un pedido / avanzar / asignar (RPC) genera notificaciones y cada una encola una petición · 8. Conteos de tablas iguales tras la prueba.
**Función (vitest sobre la lógica pura):** rechaza el formato antiguo; rechaza `notification_id` inexistente o ya enviado; calcula el `url` por rol; no envía si no hay suscripciones; arma el payload solo con la fila.
**Frontend:** `orderActions.service` y `createOrder` ya no llaman al push; el resto de sus pruebas sigue igual.
**Manual (Jorge, en el preview):** pedido nuevo → llega el push al restaurante con el celular bloqueado y el panel cerrado; asignación → llega al domiciliario; cambio de estado → llega al cliente; ninguna petición `send-push` sale del navegador.

## 12. CRITERIOS DE ÉXITO
- [ ] `send-push` solo acepta `{notification_id}` y rechaza el formato antiguo
- [ ] El destinatario y el texto salen siempre de la fila de `notifications`
- [ ] Idempotente: una notificación se envía como máximo una vez
- [ ] El push sale del servidor (trigger + `pg_net`); ningún navegador lo dispara
- [ ] Un usuario solo puede cambiar `read` en sus notificaciones
- [ ] Función versionada en el repo
- [ ] Build, lint y tests en verde; sin regresiones

## 13. REPORTE FINAL
`docs/loops/security/LOOP_SECURITY_02_REPORTE.md`: IMPLEMENTADO · MIGRACIONES · FUNCIÓN (antes/después) · TESTS (antes → después) · QA · DEUDA (opción B con secreto compartido, límites de frecuencia) · PREPARACIÓN PARA FLOW_01.

## 14. LO QUE NO DEBES HACER
NO aplicar migraciones ni desplegar la función sin OK explícito, una a la vez; NO introducir ni guardar credenciales; NO dejar el formato antiguo aceptado "por compatibilidad"; NO cambiar los textos de las notificaciones; NO commitear sin "QA OK"; NO mergear sin orden explícita.

## 15. REGLA FINAL
Quien puede enviar un aviso es el sistema, a partir de un hecho que ya ocurrió; nadie puede pedirle al sistema que avise a otro de algo que no pasó. **Prioridad:** SEGURIDAD (cerrar el envío arbitrario) → FIABILIDAD (el aviso no depende de un navegador) → LIMPIEZA (función en el repo).

## REGLA DE EJECUCIÓN
No lo ejecutes todavía. Solo crea el archivo y confírmame ruta + tamaño; después reporta la inspección previa y espera el OK.
