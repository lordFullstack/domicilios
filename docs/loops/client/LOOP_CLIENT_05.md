# LOOP_CLIENT_05 — Checkout: Seguridad + UX (cierre de huecos)

**Categoría:** CLIENT
**Tipo:** Fix / Consolidación (cierre de huecos del Checkout existente)
**Estado:** 🟡 Pendiente
**Objetivo:** Cerrar los huecos reales del Checkout que ya funciona: idempotency key, cierre de los inserts directos a `orders` / `order_items`, pantalla de error de checkout y "pagar con cuánto". **NO reescribir lo que ya funciona.**
**NO ES SOBRE:** crear el checkout desde cero (ya existe y es funcional), wizard de pasos (no aplica), pago en línea (LOOP_CLIENT_07), analytics (LOOP_ANALYTICS_01), cola offline (LOOP_PWA_02), selector de direcciones (LOOP_CLIENT_06).
**Rama:** `loop/client-05-checkout` (crearla desde `main` antes de ejecutar).
**Ejecución:** 2 sub-tandas (1 Seguridad → 2 UX del flujo), cada una con build + lint + tests y OK de Jorge. **Las migraciones SQL se preparan como archivos, se prueban en una transacción revertida y se aplican a la base real solo con OK explícito de Jorge, una por una** (ver sección 10).

> **DECISIONES CONFIRMADAS POR JORGE (24-sep-2026)** — mandan sobre cualquier otra sección:
> 1. **Notas al restaurante:** entran en este LOOP. **Propina:** va a **LOOP_CLIENT_05B** (toca dinero, total y trigger).
> 2. **Progreso visual:** NO. El checkout es de 1 pantalla.
> 3. **Dirección por defecto:** LOOP_CLIENT_06.
> 4. **Cambio:** se guarda en `orders.cash_amount`, validado en el RPC (≥ total). Mostrarlo a restaurante/domiciliario → otro LOOP.
> 5. **Estructura de `orders`:** se confía en la auditoría. Índice único `(user_id, client_order_id)`; la nueva firma de `create_order` **reemplaza** la de 5 parámetros.
> 6. **Migraciones:** se preparan los `.sql`, se prueban en transacción revertida, **NO se aplica DDL sin OK de Jorge, una por una con confirmación**.
> 7. **Aclaración técnica (verificada en la base):** el trigger `guard_order_update` funciona por **lista permitida** (todo cambio no listado se rechaza con `order_update_not_allowed`), así que las columnas nuevas quedan protegidas **sin modificar el trigger**. La sub-tanda 2d pasa de "agregar a la lista protegida" a **verificar** que el cliente no puede modificarlas (ver 2d).

> Nota de ubicación: los LOOP_CLIENT anteriores (01–04) viven en `docs/loops/`. Este documento se crea en `docs/loops/client/` por instrucción de Jorge; los reportes de LOOP_CLIENT_05 van en la misma carpeta.

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md` (plantilla maestra)
2. `docs/loops/LOOP_CLIENT_03.md`, `LOOP_CLIENT_03_REPORTE.md` y `LOOP_CLIENT_03_SEGURIDAD_TARIFA.md` (dejaron la creación de orden en el servidor)
3. `docs/security/SEGURIDAD_PEDIDOS.md` y `docs/security/PENDIENTE_revoke_direct_order_inserts.sql`
4. `docs/design-system/STATES.md` (`ErrorState`, `stateCopy.ts`)

No leas LOOPs más antiguos salvo que este LOOP lo requiera explícitamente.

---

## 1. ROL

Actúa como:

**Senior Backend/Frontend Engineer (Supabase + React) + Security Reviewer + Mobile UX + Accessibility Specialist**

LOOP_CLIENT_03 dejó la creación de pedidos en un RPC atómico del servidor (`create_order`) con precios y total calculados en la base. LOOP_VISUAL_08 dejó `ErrorState`/`EmptyState`. Este LOOP **no reconstruye** nada de eso: cierra lo que falta.

---

## 2. REGLA ABSOLUTA — INSPECCIONA ANTES DE MODIFICAR

Términos a buscar en el repo y en la base antes de escribir código: `create_order`, `createOrder`, `useOrders`, `client_order_id`, `idempot`, `cash_amount`, `tip`, `special_instructions`, `submitState`, `OrderSuccessView`, `orders_insert_own`, `order_items_insert_own_order`, `guard_order_updates`.

**Reportar antes de tocar:**
- Columnas exactas de `orders` y `order_items` (ya auditadas en la sección 3; reconfirmar al ejecutar).
- Políticas RLS de `orders` / `order_items` y triggers vigentes.
- Definición vigente de `create_order` (firma y cuerpo).
- Qué versiones del frontend están desplegadas y en caché (PWA) llamando a `create_order`.

NO inventes. Si algo no coincide con la sección 3, repórtalo antes de tocar.

---

## 3. ESTADO REAL AUDITADO (24-sep-2026)

### 3.1 Lo que YA existe (no reconstruir)

| Pieza | Estado real | Acción |
|---|---|---|
| `CheckoutPage.tsx` | Funcional, **una sola pantalla** (Entrega → Método de pago → Resumen → barra inferior). Detrás de `ProtectedRoute` (solo rol cliente). | No reescribir |
| Creación de orden | `createOrder` dentro de `useOrders` (`src/hooks/useLocalData.ts`) → RPC `create_order` (**atómica**, `SECURITY DEFINER`). | No reescribir |
| Precios server-side | El frontend envía solo `{ product_id, quantity }`; el RPC calcula precios, tarifa y total. **Nunca `unit_price`.** | No tocar |
| Validaciones del RPC | Autenticado, dirección 5–300 caracteres, método de pago (`cash_on_delivery`/`online`), restaurante aprobado y abierto, 1–50 líneas, cantidades 1–99, productos del restaurante y disponibles. | No tocar |
| Errores mapeados | `CREATE_ORDER_ERRORS` → mensajes en español. | Extender, no reemplazar |
| Doble submit (frontend) | Freno en `handleSubmit` (`submitState === 'submitting'`) + `disabled` en el botón. | Se conserva |
| Carrito tras éxito | `clear()` **después** del éxito; si falla, "Tu carrito sigue guardado". | No tocar |
| `OrderSuccessView` | Ilustración, `#ID`, total del servidor, dos CTAs. | No tocar |
| Offline | Detecta `offline`, deshabilita el botón y avisa. | No tocar |
| Dirección | `AddressCard` + `AddressSheet` (calle, complemento, referencia); última usada en `localStorage`. | No tocar (LOOP_CLIENT_06) |
| Seguridad de estados | Trigger `private.guard_order_update` (lista permitida por rol) y `orders_delivery_fee_column`. | No tocar |

### 3.2 Lo que el borrador asumía mal (corregido)
- El Checkout **no** es una maqueta ni carece de creación segura: ya es transaccional y calcula precios en el servidor.
- El RPC **no** recibe precios ni total.
- **No hay `AddressMap` ni tabla `addresses`:** la dirección es texto libre.

### 3.3 Lo que SÍ falta (alcance real)

**Base de datos (verificada en la base real, 24-sep-2026):**
- **Sin idempotency key.** `create_order` tiene 5 parámetros (`p_restaurant_id`, `p_delivery_address`, `p_special_instructions`, `p_payment_method`, `p_items`) y `orders` no tiene `client_order_id`. Un doble envío con mala red puede crear dos pedidos.
- **Los inserts directos siguen abiertos.** Las políticas `orders_insert_own` (`WITH CHECK user_id = auth.uid()`) y `order_items_insert_own_order` **siguen existiendo**: un cliente autenticado aún puede insertar pedidos e ítems saltándose el RPC (y con `total` arbitrario). El script `PENDIENTE_revoke_direct_order_inserts.sql` **no se ha aplicado**; su precondición ("aplicar después del deploy del frontend que usa el RPC") **ya se cumple** (el frontend en producción usa `create_order`).
- **Sin columnas** para "pagar con cuánto", notas al restaurante ni propina.

**Columnas actuales de `orders`:** `id`, `user_id`, `restaurant_id`, `delivery_person_id`, `total` (numeric), `status`, `delivery_address`, `special_instructions` (text, hoy guarda la "referencia" de la dirección), `created_at`, `updated_at`, `payment_method`, `payment_status`, `current_lat`, `current_lng`, `location_updated_at`, `delivery_fee` (integer). **`order_items`:** `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `created_at`.

**Trigger `private.guard_order_update` (BEFORE UPDATE, verificado):** es una **lista permitida por rol** (cliente: solo `status` `pending`/`confirmed` → `cancelled`; restaurante: transiciones de estado y asignación de domiciliario; domiciliario: ubicación, entrega y pago en efectivo; admin y `service_role` sin restricción). Cualquier otro cambio de columna lanza `order_update_not_allowed` (42501). Consecuencia: **`client_order_id`, `cash_amount` y `notes_to_restaurant` no pueden ser modificados por un cliente tras crear el pedido sin tocar el trigger.** Solo se comprueba con una prueba.
**Índices de `orders`:** `orders_pkey`, `idx_orders_user`, `idx_orders_restaurant`, `idx_orders_delivery`, `idx_orders_status`, `idx_orders_payment_status`. No hay índice sobre `client_order_id`.

**Frontend:**
- El error del checkout es un banner en línea (`role="alert"`), no una vista de error.
- "Pagar en línea" está deshabilitado ("Próximamente"); no hay campo de "pagar con cuánto".

---

## 4. NO CREAR UN SEGUNDO DE LO QUE YA EXISTE

- **No** crear otra función de creación de pedidos: se **extiende** `create_order` (parámetro nuevo con valor por defecto).
- **No** crear otro hook de checkout: se extiende `createOrder` de `useOrders`.
- **No** crear otro estado de error: se usa `ErrorState` y `stateCopy.ts` (LOOP_VISUAL_08).
- **No** crear otra vista de éxito: `OrderSuccessView` se mantiene.
- **No** tocar `guard_order_update` (lista permitida por rol): las columnas nuevas ya quedan protegidas; solo se verifica.

---

## 5. PROBLEMAS A RESOLVER

### PROBLEMA 1 — Doble pedido por reintento
Sin idempotency key, un envío duplicado (doble toque con mala red, reintento tras respuesta perdida, recarga durante el envío) puede crear dos pedidos.

### PROBLEMA 2 — Inserts directos abiertos
Cualquier cliente autenticado puede insertar en `orders`/`order_items` con `total` y `unit_price` arbitrarios, saltándose el RPC. Es el hallazgo pendiente de SEGURIDAD_PEDIDOS.

### PROBLEMA 3 — Error de checkout sin narrativa
El fallo es un banner en línea: no diferencia causas (sesión, red, validación, restaurante cerrado) ni ofrece una salida clara.

### PROBLEMA 4 — Sin "pagar con cuánto"
Con efectivo, el domiciliario no sabe con qué billete pagará el cliente ni cuánto cambio llevar.

### PROBLEMA 5 — Sin notas al restaurante
`special_instructions` mezcla la referencia de la dirección con cualquier nota.

### PROBLEMA 6 — Sin propina → **LOOP_CLIENT_05B** (fuera de este LOOP)

---

## 6. DECISIONES DE DISEÑO

### Sub-tanda 1 — SEGURIDAD (crítica)

**1a) Cierre de inserts directos (migración M1)**
- Aplicar `PENDIENTE_revoke_direct_order_inserts.sql`: `drop policy orders_insert_own on public.orders` y `drop policy order_items_insert_own_order on public.order_items`.
- Sin esas políticas, la única forma de crear un pedido es `create_order` (`SECURITY DEFINER`, `search_path` vacío), que además escribe `order_items`.
- Precondición ya cumplida (el frontend en producción usa el RPC); se reverifica antes de aplicar: que ningún cliente reciente siga insertando directo (revisar `orders` creados sin pasar por el RPC no es posible por SQL; se confía en el deploy y se comprueba que la app en producción llama `supabase.rpc('create_order')`).

**1b) Idempotency key (migraciones M2 y M3 + frontend)**
- **M2 — columna e índice:** `orders.client_order_id uuid` (nullable: pedidos existentes y clientes antiguos) + **`create unique index orders_user_client_order_id_key on public.orders (user_id, client_order_id) where client_order_id is not null`**.
- **M3 — RPC `create_order` con nueva firma:** parámetro `p_client_order_id uuid default null` (queda `create_order(p_restaurant_id, p_delivery_address, p_special_instructions, p_payment_method, p_items, p_client_order_id default null)`). **La firma de 5 parámetros se elimina** en la misma migración (`drop function` de la anterior) para no dejar una sobrecarga ambigua en PostgREST. Una app antigua (caché PWA) que llama con 5 argumentos sigue resolviendo a la función nueva gracias al valor por defecto.
  - Si viene la llave y **ya existe** un pedido del **mismo usuario** con esa llave → **devuelve el pedido existente** (sin crear otro y sin revalidar).
  - Si no existe → crea el pedido guardando la llave. Ante una carrera (dos llamadas simultáneas), la violación del índice único se captura (`unique_violation`) y se devuelve el pedido ganador.
  - Sin llave → comportamiento actual, idéntico.
  - **Se conservan todas las validaciones y el cálculo de precios y tarifa**; solo se agrega el manejo de la llave.
- **Frontend:** genera un UUID v4 al abrir el checkout y lo **envía al RPC**. Se guarda en `sessionStorage` junto con una firma del carrito (restaurante + líneas): con la misma firma se reutiliza (recarga o reintento tras respuesta perdida); si el carrito cambia se genera otra; tras un éxito se descarta.

**1c) Verificación** (transacción revertida; ver sección 14)
- Doble llamada con el mismo `client_order_id` → **1** pedido y la misma fila devuelta.
- Llamada concurrente → 1 pedido.
- `INSERT` directo en `orders` / `order_items` como cliente → **bloqueado (403 / 42501)**.
- Llamada sin llave → sigue funcionando (compatibilidad).
- La llave de otro usuario no colisiona (índice por usuario).

### Sub-tanda 2 — UX DEL FLUJO

**2a) Pantalla de error de checkout**
- Reemplaza el banner en línea por una vista con **`ErrorState`** (LOOP_VISUAL_08): ilustración `sad` (o `confused`), título, descripción y salida.
- Diferencia las causas ya mapeadas (`CREATE_ORDER_ERRORS` y offline): **sesión expirada** ("Iniciar sesión"), **red** ("Reintentar"), **validación** (dirección o método de pago → volver al formulario), **restaurante cerrado / no disponible** (volver al carrito o a restaurantes), **productos no disponibles** (revisar el carrito).
- Copy nuevo en `stateCopy.ts` (tuteo, sin "lo sentimos", sin tecnicismos). El carrito **sigue guardado** en todos los casos.
- Los errores de validación menores previos al envío (falta la dirección) **pueden seguir en línea**; la vista completa es para fallos del envío.

**2b) "Pagar con cuánto" — `cash_amount` (migración M4 + RPC M6 + UI)**
- **M4:** `orders.cash_amount integer` (nullable, `check (cash_amount is null or cash_amount > 0)`).
- **RPC (M6):** parámetro `p_cash_amount integer default null`. Validación en el servidor: solo con `cash_on_delivery`; **≥ total calculado** (subtotal + tarifa); tope razonable (p. ej. ≤ 10.000.000) → error `invalid_cash_amount`. El total sigue calculándose en el servidor.
- **UI:** input numérico (COP, `inputmode="numeric"`) visible solo con efectivo; opcional (vacío = sin especificar); valida ≥ total y muestra el **cambio estimado en vivo** (`pago − total`) en `tabular-nums` (`aria-live="polite"`).
- Mostrar `cash_amount` a restaurante y domiciliario → otro LOOP (solo se guarda).

**2c) Notas al restaurante (migración M5 + RPC M6 + UI)**
- **M5:** `orders.notes_to_restaurant text` (nullable, `check (notes_to_restaurant is null or char_length(notes_to_restaurant) <= 150)`).
- **RPC (M6):** parámetro `p_notes_to_restaurant text default null`; se recorta (`trim`), se limita a 150 caracteres y se guarda `null` si queda vacío.
- **UI:** campo de texto **separado** de la referencia de dirección (máx. 150, con contador). `special_instructions` conserva su uso actual (referencia de la dirección).
- Mostrar las notas a restaurante/domiciliario → otro LOOP (solo se guardan; confirmar en la ejecución si el panel del restaurante ya muestra `special_instructions` y qué hacer).

**2d) `guard_order_update`: verificar, no modificar**
- El trigger es una lista permitida: `client_order_id`, `cash_amount` y `notes_to_restaurant` **ya están protegidos** (un cliente que intente cambiarlas recibe `order_update_not_allowed`). **No se toca el trigger.**
- Se agrega la prueba (transacción revertida) que lo demuestra para las 3 columnas, y se documenta en `SEGURIDAD_PEDIDOS.md`.

### Migraciones previstas (una por una, con OK de Jorge)
| # | Archivo | Qué hace | Sub-tanda |
|---|---|---|---|
| M1 | `revoke_direct_order_inserts` | Elimina `orders_insert_own` y `order_items_insert_own_order` | 1 |
| M2 | `orders_client_order_id` | Columna `client_order_id` + índice único parcial `(user_id, client_order_id)` | 1 |
| M3 | `create_order_idempotency` | Nueva firma con `p_client_order_id default null` (elimina la de 5 parámetros) y manejo de la llave | 1 |
| M4 | `orders_cash_amount` | Columna `cash_amount` con `check` | 2 |
| M5 | `orders_notes_to_restaurant` | Columna `notes_to_restaurant` con `check` (≤ 150) | 2 |
| M6 | `create_order_cash_notes` | Nueva firma (añade `p_cash_amount`, `p_notes_to_restaurant`, ambos con default; reemplaza la de M3) | 2 |

*(Alternativa a confirmar en la ejecución: adelantar M4 y M5 a la sub-tanda 1 para cambiar la firma del RPC una sola vez. Por defecto se respeta el orden de arriba: M3 y M6 son dos cambios de firma separados y ambos compatibles hacia atrás.)*

### Fuera de este LOOP (confirmado)
- **Propina** → LOOP_CLIENT_05B.
- **Dirección por defecto** → LOOP_CLIENT_06.
- **Progreso visual** → no se implementa.

---

## 7. ALCANCE

### ✅ Incluido
- **Sub-tanda 1:** cierre de inserts directos (M1); idempotency key (M2, M3, frontend); verificación de seguridad
- **Sub-tanda 2:** pantalla de error del checkout con `ErrorState`; "pagar con cuánto" (`cash_amount`); notas al restaurante (`notes_to_restaurant`); verificación del trigger
- Migraciones como archivos SQL versionados, probadas en transacción revertida
- Tests que blinden las reglas
- Actualizar `SEGURIDAD_PEDIDOS.md`

### 🚫 Fuera de alcance
- Reescribir `create_order`, `CheckoutPage` o `OrderSuccessView`
- **Propina** (LOOP_CLIENT_05B)
- **Dirección por defecto** y selector de direcciones (LOOP_CLIENT_06)
- Wizard / progreso de pasos
- Pago en línea (LOOP_CLIENT_07), analytics (LOOP_ANALYTICS_01), cola offline (LOOP_PWA_02)
- Mostrar `cash_amount` y `notes_to_restaurant` a restaurante y domiciliario (otro LOOP)
- Modificar el trigger `guard_order_update` (ya protege las columnas nuevas)
- Color, tipografía, iconografía, cards, motion

---

## 8. COMPONENTES A REFACTORIZAR / ARCHIVOS

**Frontend (solo agregar):**
- `src/features/client/pages/CheckoutPage.tsx` (llave de idempotencia, campo "pagar con cuánto", campo de notas, vista de error)
- `src/hooks/useLocalData.ts` (`createOrder`: parámetros nuevos; `CREATE_ORDER_ERRORS`: mensajes nuevos, p. ej. `invalid_cash_amount`)
- `src/shared/constants/stateCopy.ts` (copy de los errores del checkout)
- Helper de la llave: `src/features/client/utils/clientOrderId.ts`
- Tipo `Order` en `src/shared/types` (`client_order_id`, `cash_amount`, `notes_to_restaurant`)
- Tests nuevos

**Base de datos (archivos SQL en `supabase/migrations/`, aplicados solo con OK, uno por uno):** M1–M6 (tabla de la sección 6).

**Documentación:** `docs/security/SEGURIDAD_PEDIDOS.md`, reporte del LOOP.

---

## 9. MOCKUPS ASCII

### Error de checkout (antes → después)

```text
Antes                                Después
┌──────────────────────┐             ┌──────────────────────┐
│ ⚠ No pudimos         │             │        🚀 (sad)      │
│   confirmar tu pedido│             │ No pudimos confirmar │
│ [Confirmar pedido]   │             │ tu pedido            │
└──────────────────────┘             │ Tu carrito sigue     │
   (banner en línea)                 │ guardado             │
                                     │   [ Reintentar ]     │
                                     └──────────────────────┘
```

### Pagar con cuánto (solo efectivo)

```text
Método de pago
(●) Efectivo o datáfono
    ¿Con cuánto pagas?   [ $ 50.000 ]
    Total $41.000  ·  Cambio $9.000      ← en vivo, tabular
```

---

## 10. REGLAS ARQUITECTÓNICAS

- **Solo agregar.** Nada de lo listado en la sección 3.1 se reemplaza.
- El servidor es la fuente de verdad: el frontend nunca envía precios ni total, ni calcula el total final.
- Las migraciones son **aditivas y compatibles hacia atrás** (columnas nullable, parámetros con valor por defecto).
- **Migraciones a la base real:** se preparan como archivos SQL y se prueban en una transacción revertida (o rama de base). **Se aplican a producción solo con OK explícito de Jorge, una a la vez**, verificando después. Nunca se ejecuta DDL sin ese OK.
- El cierre de inserts directos (1b) se aplica **después** de comprobar que el frontend desplegado usa el RPC.
- El trigger `guard_order_update` **no se modifica**: es una lista permitida y las columnas nuevas ya quedan protegidas; se verifica con una prueba.
- Copy de errores solo vía `stateCopy.ts`; `ErrorState` para los fallos del envío.
- Sin dependencias nuevas.

---

## 11. A11Y ESPECÍFICA

- El campo "pagar con cuánto" con `label` visible, `inputmode="numeric"` y mensaje de error asociado (`aria-describedby`); el cambio estimado en una región `aria-live="polite"`.
- La vista de error con `role="alert"` (vía `ErrorState`), foco en el título o en el CTA principal al aparecer.
- El botón de confirmar conserva su estado `disabled` y su etiqueta de carga.
- Contraste y tipografía según `COLORS.md` y `TYPOGRAPHY.md` (cifras con `tabular-nums`).

---

## 12. UX ESPECÍFICA

- El carrito nunca se pierde ante un fallo; el mensaje lo dice.
- Los errores se explican por causa y ofrecen la salida correcta (reintentar, iniciar sesión, volver al carrito).
- "Pagar con cuánto" es opcional y no bloquea la confirmación; el cambio se calcula al escribir.
- Un reintento tras una respuesta perdida no crea un segundo pedido (idempotencia): el usuario ve el mismo pedido.

### Decisiones confirmadas (antes pendientes)
1. Notas → este LOOP. Propina → LOOP_CLIENT_05B.
2. Progreso visual → no.
3. Dirección por defecto → LOOP_CLIENT_06.
4. Cambio → `orders.cash_amount`, validado ≥ total en el RPC; mostrarlo a restaurante/domiciliario → otro LOOP.
5. Estructura de `orders` confiada a la auditoría (índice único `(user_id, client_order_id)`, firma nueva reemplaza a la de 5 parámetros).
6. Migraciones: `.sql` + transacción revertida + OK de Jorge una por una.

---

## 13. PERFORMANCE

- El índice único parcial es liviano (solo filas con llave).
- La llave se genera una vez por checkout; sin peticiones extra.
- Sin cambios en el bundle relevantes (helper y un campo).

---

## 14. TESTS

### Unit / reglas
- Helper de `client_order_id`: genera UUID válido; reutiliza la llave con la misma firma de carrito; genera otra si el carrito cambia; se descarta tras el éxito.
- `createOrder` envía `p_client_order_id` (y `p_cash_amount` si aplica) y **nunca** `unit_price` ni total.
- `CheckoutPage`: doble submit no llama dos veces al RPC; el error del envío muestra `ErrorState` con "Reintentar"; el carrito no se vacía ante un fallo; se vacía tras el éxito.
- "Pagar con cuánto": solo visible con efectivo; valida ≥ total; muestra el cambio; vacío = permitido.
- Copy de errores nuevos coincide con `stateCopy.ts`.
- Notas al restaurante: campo separado de la referencia de dirección, máx. 150 caracteres con contador; se envía `p_notes_to_restaurant`.

### Base de datos (verificación manual documentada)
- Los casos de la sub-tanda 1c, en transacción revertida; resultado anotado en el reporte.
- `cash_amount < total` → `invalid_cash_amount`; `cash_amount` con método `online` → rechazado; notas > 150 caracteres → recortadas o rechazadas según la migración.
- El cliente no puede modificar `client_order_id`, `cash_amount` ni `notes_to_restaurant` tras crear el pedido (`order_update_not_allowed`), y el trigger no cambió.

### A11y
- Axe no está instalado (LOOP_QA_TOOLING). Sustituto: Lighthouse Accessibility (Jorge).

---

## 15. CRITERIOS DE ÉXITO

- [ ] Idempotency key implementada (frontend + RPC)
- [ ] `client_order_id` en `orders` con índice único `(user_id, client_order_id)`; firma de 5 parámetros reemplazada
- [ ] RLS bloquea inserts directos a `orders` y `order_items`
- [ ] Doble submit con el mismo `client_order_id` → 1 pedido
- [ ] Pantalla de error de checkout con `ErrorState`
- [ ] "Pagar con cuánto" si efectivo, guardado en `cash_amount` y validado ≥ total en el servidor
- [ ] Notas al restaurante (campo separado, máx. 150, guardado en `notes_to_restaurant`)
- [ ] Propina fuera de este LOOP (LOOP_CLIENT_05B)
- [ ] Columnas nuevas verificadas como protegidas por `guard_order_update` (sin modificar el trigger)
- [ ] `SEGURIDAD_PEDIDOS.md` actualizado
- [ ] Build, lint, tests OK
- [ ] Sin regresiones
- [ ] Sin reescritura de lo funcional (sección 3.1 intacta)

---

## 16. QA CRÍTICO

### División de responsabilidades
- **Claude Code:** pruebas de base en transacción revertida (con OK), tests unitarios, build, ruta `/qa/checkout` temporal para la vista de error y el campo de pago.
- **Jorge, en la preview y con sesión:** crear un pedido real de extremo a extremo, provocar un error (modo avión / restaurante cerrado), doble toque rápido, Lighthouse.

### Checklist
1. Pedido normal: se crea 1 pedido y llega `OrderSuccessView`
2. Doble toque en "Confirmar" → 1 pedido
3. Reintento tras cortar la red durante el envío → no duplica
4. Recarga de la página durante el envío → mismo `client_order_id`
5. Carrito distinto → nueva llave
6. Insert directo a `orders` desde el cliente → bloqueado
7. Insert directo a `order_items` → bloqueado
8. Cliente antiguo (sin llave) sigue creando pedidos
9. Error de sesión expirada → `ErrorState` con "Iniciar sesión"
10. Error de red → `ErrorState` con "Reintentar"
11. Restaurante cerrado → `ErrorState` con salida al carrito
12. El carrito sigue guardado tras cualquier error
13. "Pagar con cuánto" solo con efectivo
14. Cambio estimado en vivo (tabular)
15. Pago < total → error de validación
16. `cash_amount` y `notes_to_restaurant` guardados en el pedido
17. El total lo calcula el servidor (no cambia con lo que envíe el cliente)
18. `guard_order_update` no deja modificar las columnas nuevas (sin cambiar el trigger)
19. Sin regresiones en el resto del checkout
20. Consola limpia y build OK

---

## 17. REGLAS IMPORTANTES

- NO reescribir lo que funciona (sección 3.1)
- NO enviar precios ni total desde el frontend
- NO aplicar DDL a la base real sin OK explícito de Jorge
- NO eliminar el manejo de errores en español ni el freno de doble submit
- NO tocar `OrderSuccessView`, offline, carrito ni la lógica de la dirección
- NO introducir dependencias
- Reportar en vez de arreglar lo que quede fuera de alcance

---

## 18. REPORTE FINAL

### QUÉ SE AGREGÓ (no qué se reescribió)
<lista>

### MIGRACIONES (SQL)
<archivo por archivo, con fecha de aplicación y verificación>

### IDEMPOTENCY: CÓMO FUNCIONA
<llave, índice, RPC, carrera, compatibilidad>

### RLS: ANTES / DESPUÉS
<políticas de orders y order_items antes y después>

### PANTALLA DE ERROR
<causas, copy, ilustración>

### EXTRAS
<pagar con cuánto, notas, propina, según lo aprobado>

### TESTS
```
Build:      OK / FAIL
Lint:       OK / FAIL / N/A
Typecheck:  OK / FAIL / N/A
Tests:      OK / FAIL / N/A
```

### QA
<cuáles de 20 validados>

### DEUDA TÉCNICA GENERADA
- LOOP_CLIENT_05B (propina)
- LOOP_CLIENT_06 (direcciones)
- LOOP_CLIENT_07 (pago en línea)
- Mostrar `cash_amount` y `notes_to_restaurant` en restaurante/domiciliario
- Axe (LOOP_QA_TOOLING)

### PREPARACIÓN PARA LOOP_CLIENT_06 (Tracking / Direcciones)
<qué quedó preparado>

---

## 19. LO QUE NO DEBES HACER

- NO reescribir `create_order`, `CheckoutPage` ni `OrderSuccessView`
- NO aplicar migraciones a producción sin OK
- NO calcular precios ni total en el cliente
- NO modificar `guard_order_update`; NO dejar sin verificar que las columnas nuevas quedan protegidas
- NO introducir dependencias

---

## 20. REGLA FINAL

Un pedido es dinero y confianza: el servidor decide los precios y una misma intención de compra debe producir **un** pedido, siempre. Cierra los huecos, no rehagas lo que ya está bien.

**Prioridad:** SEGURIDAD (un pedido, sin inserts directos) → CLARIDAD (errores con salida) → UTILIDAD (pagar con cuánto) → EXTRAS

Si tienes que elegir entre agregar una función y proteger el pedido: protege el pedido.
Si dudas de si algo ya funciona: está en la sección 3.1; no lo toques.

---

## REGLA DE EJECUCIÓN

No lo ejecutes todavía.

Solo crea el archivo en `docs/loops/client/LOOP_CLIENT_05.md` y confírmame:
- Ruta exacta
- Tamaño (líneas + KB)
- Las 5 decisiones a confirmar antes de ejecutar
