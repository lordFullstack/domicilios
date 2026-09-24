# LOOP_CLIENT_05C — Checkout: UX del flujo (sub-tanda 2 de LOOP_CLIENT_05)

**Categoría:** CLIENT
**Tipo:** Feature (sobre un checkout que ya funciona y ya es seguro)
**Estado:** 🟡 Pendiente (decisiones D1, D2 y D4 confirmadas por Jorge)
**Objetivo:** Que un fallo del checkout tenga narrativa y salida (`ErrorState`), y que el pedido lleve dos datos útiles: con cuánto paga el cliente en efectivo (`cash_amount`) y una nota corta para el restaurante (`notes_to_restaurant`), ambos validados en el servidor.
**NO ES SOBRE:** propina (LOOP_CLIENT_05B), pago en línea (LOOP_CLIENT_07), dirección por defecto / selector de direcciones (LOOP_CLIENT_06), wizard o progreso de pasos (no aplica: el checkout es de 1 pantalla), y **mostrar** `cash_amount` / `notes_to_restaurant` a restaurante y domiciliario (**LOOP_CLIENT_05D, obligatorio antes del piloto**, ver 3.3 y sección BLOQUEANTE).
**Rama:** `loop/client-05c-checkout-ux` (crearla desde `main` antes de ejecutar).
**Orden y numeración:** va DESPUÉS de LOOP_SECURITY_01, LOOP_SECURITY_02 y LOOP_FLOW_01. Sus migraciones (M4–M7) usan los prefijos `0008xx`+ (SECURITY_01 = `0005xx`, SECURITY_02 = `0006xx`, FLOW_01 = `0007xx`).
**Ejecución:** 3 sub-tandas (2.1 ErrorState → 2.2 cash_amount → 2.3 notas + cierre), cada una con build + lint + tests y OK de Jorge. **Las migraciones se preparan como archivos, se prueban en transacción abortada y se aplican a la base real solo con OK explícito de Jorge, una por una** (protocolo de LOOP_CLIENT_05, sección 10).

> **DECISIONES YA CONFIRMADAS (heredadas de LOOP_CLIENT_05, 24-sep-2026):**
> 1. Notas al restaurante entran; propina → LOOP_CLIENT_05B.
> 2. Sin progreso visual.
> 3. Dirección por defecto → LOOP_CLIENT_06.
> 4. Cambio: `orders.cash_amount`, validado en el RPC (≥ total). Mostrarlo → otro LOOP.
> 5. `guard_order_update` NO se modifica (lista permitida): solo se **verifica** con una prueba.
> 6. Migraciones: `.sql` + transacción abortada + OK de Jorge una por una. NO destructivo.
>
> **DECISIONES DE ESTE LOOP (confirmadas por Jorge):**
> - **D1:** 4 migraciones separadas: M4 `cash_amount`, M5 RPC `cash_amount`, M6 notas, M7 RPC notas.
> - **D2:** la llave se amplía: firma = `restaurantId + items + paymentMethod + cashAmount + notes + address`. Si cualquiera cambia → UUID nuevo → pedido nuevo.
> - **D4:** notas > 150 caracteres se **rechazan** con `notes_too_long` (no se recortan). Contador en vivo en la UI.

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md`
2. `docs/loops/client/LOOP_CLIENT_05.md` y `LOOP_CLIENT_05_REPORTE.md` (sub-tanda 1 ya en producción: M1, M2, M3 + llave de idempotencia)
3. `docs/security/SEGURIDAD_PEDIDOS.md` (se actualiza en 2.3)
4. `docs/design-system/STATES.md` (`ErrorState`, `stateCopy.ts`)

No leas LOOPs más antiguos salvo que este LOOP lo requiera.

---

## 1. ROL

Actúa como: **Senior Backend/Frontend Engineer (Supabase + React) + Security Reviewer + Mobile UX + Accessibility Specialist**.

LOOP_CLIENT_05 dejó el pedido protegido (sin inserts directos, con idempotencia). LOOP_VISUAL_08 dejó `ErrorState`. Este LOOP **solo agrega** sobre eso.

---

## 2. REGLA ABSOLUTA — INSPECCIONA ANTES DE MODIFICAR

Términos a buscar: `CREATE_ORDER_ERRORS`, `createOrderErrorMessage`, `submitState`, `error`, `ErrorState`, `ERROR_COPY`, `cash_amount`, `notes_to_restaurant`, `special_instructions`, `clientOrderId`, `cartSignature`, `guard_order_update`.

**Reportar antes de tocar:** firma vigente de `create_order` en la base, columnas de `orders`, que `guard_order_update` siga siendo lista permitida, y qué pantallas leen `special_instructions` hoy. NO inventes: si algo no coincide con la sección 3, repórtalo.

---

## 3. ESTADO REAL AUDITADO (24-sep-2026, tras el merge de LOOP_CLIENT_05)

### 3.1 Lo que YA existe (no reconstruir)

| Pieza | Estado real | Acción |
|---|---|---|
| `CheckoutPage.tsx` (327 líneas) | 1 pantalla: Entrega → Método de pago → Resumen → barra fija con total. `submitState` (`idle/submitting/success/error`), `inFlightRef`, offline, `OrderSuccessView`. | Solo agregar |
| Llave de idempotencia | `clientOrderId.ts` (`getOrCreate(sig)`, `cartSignature`), sessionStorage, se limpia solo tras éxito. Hoy la firma es solo productos + cantidades. | Se amplía la firma (D2, confirmada) |
| RPC `create_order` | 6 parámetros (`…, p_client_order_id default null`), `SECURITY DEFINER`, `search_path` vacío, ACL authenticated + service_role. Una llave existente devuelve el pedido existente **sin revalidar**. | Se reemplaza la firma en M5 y M7 |
| `orders` | 17 columnas; `client_order_id uuid` ya existe. **No** hay `cash_amount` ni `notes_to_restaurant`. 0 políticas INSERT (M1). 37 pedidos. | Agregar 2 columnas |
| `guard_order_update` | Lista permitida por rol; cambios no listados → `order_update_not_allowed` (42501). Ya protege `client_order_id`. | No tocar; verificar |
| Error del checkout | **Banner en línea** (`role="alert"`, `bg-red-50`) arriba del formulario; `error` es un `string`. | Reemplazar por `ErrorState` |
| `ErrorState` | `illustration` (`sad` por defecto), `title`, `description`, `onRetry`/`action`, `fullScreen`, `role="alert"`. | Reutilizar |
| `stateCopy.ts` | `ERROR_COPY` centraliza el copy de errores. No tiene copy de checkout. | Extender |
| `CREATE_ORDER_ERRORS` | 8 códigos en español (`not_authenticated`, `invalid_address`, `invalid_payment_method`, `restaurant_unavailable`, `restaurant_closed`, `empty_cart`, `invalid_quantity`, `invalid_products`). | Extender (`invalid_cash_amount`) |
| `special_instructions` | Guarda la **referencia** de la dirección. Restaurante (`DashboardPage`), domiciliario (`DeliveryOrderDetailSheet`), admin y cliente **ya lo muestran**. | No cambiar su uso |
| `SEGURIDAD_PEDIDOS.md` | **Desactualizado:** lista M1 como "PENDIENTE" y no menciona M2/M3 ni la idempotencia. | Actualizar en 2.3 |

### 3.2 Lo que el pedido asumía mal (corregido)
- El error **no** es un componente aparte: hoy es un `string` que sirve para todo (validación previa al envío y fallo del servidor). Hay que separar los dos casos (ver P1).
- `ErrorState` ya existe; no hay que crear otro.
- Las migraciones de este LOOP no son "M4, M5 y M6" tal como se dijo: como cada sub-tanda cambia la firma del RPC, el plan real son **4 migraciones** (M4–M7, ver 6).

### 3.3 Lo que SÍ falta (alcance real)
- Pantalla de error con causas y salida (`ErrorState`).
- `orders.cash_amount` + validación en el RPC + campo en la UI.
- `orders.notes_to_restaurant` + validación en el RPC + campo en la UI.
- Prueba (transacción abortada) de que el cliente no puede modificar las columnas nuevas.
- `SEGURIDAD_PEDIDOS.md` al día (reflejar M1–M7).

> ⚠️ **Advertencia de valor:** este LOOP **guarda** `cash_amount` y `notes_to_restaurant`, pero ninguna pantalla del restaurante ni del domiciliario los muestra todavía. Hasta que exista el LOOP posterior (mostrarlos), el cliente escribirá datos que nadie ve. Recomendación: programar ese LOOP **inmediatamente después** de 05C y no lanzar 05C a usuarios reales sin él. Como `special_instructions` ya se muestra en 4 pantallas, el trabajo es pequeño. Ese LOOP es **LOOP_CLIENT_05D (mostrar en los 3 roles: restaurante, domiciliario, admin)** y es **obligatorio antes del piloto** (ver sección BLOQUEANTE PARA PILOTO).

---

## 4. NO CREAR UN SEGUNDO…

- **No** crear otro componente de error: `ErrorState` + `stateCopy.ts`.
- **No** crear otro RPC ni otro hook de checkout: se extiende `create_order` (parámetros con `default null`) y `createOrder` de `useOrders`.
- **No** crear otro helper de llave: se extiende `cartSignature`.
- **No** tocar `OrderSuccessView`, el carrito, offline ni `AddressCard/AddressSheet`.
- **No** modificar `guard_order_update`.

---

## 5. PROBLEMAS A RESOLVER

**P1 — Error de checkout sin narrativa.** Un solo banner para todo. Hay que distinguir el error **previo al envío** (falta dirección, sin conexión: se queda en línea, el botón ya lo comunica) del **fallo del servidor** (vista `ErrorState` con salida).

**P2 — Sin "pagar con cuánto".** Con efectivo, el domiciliario no sabe con qué billete pagará el cliente.

**P3 — Sin notas al restaurante.** `special_instructions` mezcla la referencia de la dirección; no hay dónde pedir "sin cebolla".

**P4 — Idempotencia y datos nuevos (hallazgo de esta auditoría).** M3 devuelve el pedido existente sin revalidar. Si una respuesta se pierde, el pedido ya existe y el cliente edita el método de pago, el cambio o la nota antes de reintentar, la firma actual (solo el carrito) reutiliza la llave y el servidor devuelve el pedido **viejo** con los datos viejos, sin avisar. Con datos nuevos que importan para el efectivo, la firma debe cubrirlos (D2, confirmada).

---

## 6. DECISIONES DE DISEÑO

### D1 — Migraciones (una por una, con OK) — ✅ CONFIRMADA

| # | Archivo | Qué hace | Sub-tanda |
|---|---|---|---|
| M4 | `orders_cash_amount` | `cash_amount integer` nullable, `check (cash_amount is null or cash_amount > 0)` | 2.2 |
| M5 | `create_order_cash_amount` | Firma con `p_cash_amount integer default null` (7 parámetros; elimina la de 6). **Validación server-side de `cash_amount`** (D3) | 2.2 |
| M6 | `orders_notes_to_restaurant` | `notes_to_restaurant text` nullable, `check (… char_length <= 150)` | 2.3 |
| M7 | `create_order_notes` | Firma con `p_notes_to_restaurant text default null` (8 parámetros; elimina la de 7). **Validación server-side de las notas** (D4); conserva intactas las validaciones de `cash_amount` de M5 | 2.3 |

Cada sub-tanda deja producción consistente. Todas son aditivas y compatibles hacia atrás (columnas nullable, parámetros con valor por defecto, una app en caché con 5 o 6 argumentos sigue resolviendo). Cada una con su `.rollback.sql` y su test SQL en `supabase/tests/`. Orden de rollback: M7 → M6 → M5 → M4.

### D2 — Firma de la llave — ✅ CONFIRMADA
`clientOrderId.ts`: `getOrCreate(sig)` con la firma ampliada:

`sig = restaurantId + items (productId:cantidad, ordenados) + paymentMethod + cashAmount + notes + address`

- **Al cambiar cualquier campo → UUID nuevo → pedido nuevo.** Con la misma firma se reutiliza (recarga o reintento tras respuesta perdida).
- `cartSignature` se reemplaza por una función de firma del pedido que recibe estos seis datos (normalizados: `trim`; `cashAmount` y `notes` vacíos = `''`). Los tests existentes de `clientOrderId` se extienden, no se duplican.
- Riesgo asumido: si el cliente cambia solo la nota tras una respuesta perdida, podría crearse un segundo pedido; es preferible a devolver un pedido con datos viejos.

### D3 — Validación de `cash_amount` en el RPC (se implementa en M5; M7 la conserva)
- Solo con `payment_method = 'cash_on_delivery'` (con `online` → `invalid_cash_amount`).
- `cash_amount >= total` calculado en el servidor (subtotal + tarifa). Tope 10.000.000. Entero positivo.
- `null` = "sin especificar" (permitido). El total sigue calculándose solo en el servidor; el cliente **nunca** lo envía.

### D4 — Validación de notas en el RPC — ✅ CONFIRMADA (se implementa en M7)
`trim`; `null` si queda vacía; **`char_length` > 150 → se rechaza** con `notes_too_long` (no se recorta en silencio: si el cliente escribió 200, debe enterarse). El `check` de M6 es la segunda barrera. La UI muestra un **contador en vivo** (`n/150`) y no deja escribir más de 150. `special_instructions` conserva su uso (referencia de la dirección).

### D5 — Vista de error (2.1)
- Fallo del **servidor o de red durante el envío** → `ErrorState` en lugar del formulario (el estado del formulario no se pierde: vive en el componente). Salidas por causa:
  - Sesión expirada (`not_authenticated`) → "Iniciar sesión".
  - Red / desconocido → "Reintentar" (mismo `client_order_id`).
  - Validación de servidor (`invalid_address`, `invalid_payment_method`, `invalid_cash_amount`, `notes_too_long`) → "Revisar mi pedido" (vuelve al formulario).
  - Restaurante cerrado / no disponible → "Volver a restaurantes".
  - Productos no disponibles / cantidades / carrito vacío → "Revisar mi carrito".
- Ilustración `sad`. Copy en `ERROR_COPY.checkout.*` (tuteo, sin "lo sentimos", sin tecnicismos), y **siempre** "Tu carrito sigue guardado".
- Errores previos al envío (sin dirección, sin conexión) **no** cambian: siguen en línea/en el botón.
- El error deja de ser un `string`: pasa a un **código** de causa que la vista traduce a copy (el mensaje de `createOrderErrorMessage` se conserva para no romper tests).

### D6 — UI de "pagar con cuánto" (2.2)
Campo numérico (`inputmode="numeric"`, COP con separador de miles) **solo con efectivo**, opcional. Muestra el cambio estimado en vivo (`pago − total`, `tabular-nums`, `aria-live="polite"`). Si `pago < total` → error asociado (`aria-describedby`) y el botón se deshabilita. Sugerencias rápidas (billetes redondos ≥ total) **fuera de alcance** para no inflar el LOOP; se anotan como mejora.

### D7 — UI de notas (2.3)
Campo separado de la referencia de dirección, `maxLength 150`, contador `n/150`, con `label` visible ("Nota para el restaurante (opcional)").

### Fuera de este LOOP
Propina → 05B · Dirección por defecto → 06 · Pago en línea → 07 · Wizard → no · Mostrar `cash_amount`/`notes_to_restaurant` en los 3 roles → **LOOP_CLIENT_05D (obligatorio antes del piloto)**.

---

## 7. ALCANCE

### ✅ Incluido
- **2.1 ErrorState:** vista de error por causa, copy en `stateCopy.ts`, `CREATE_ORDER_ERRORS` extendido.
- **2.2 cash_amount:** M4 (columna) + M5 (RPC con validación) + campo + firma de la llave ampliada (D2).
- **2.3 Notas + cierre:** M6 (columna) + M7 (RPC con validación) + campo + prueba del trigger + `SEGURIDAD_PEDIDOS.md` corregido (reflejar M1–M7) + reporte.
- Tests; migraciones versionadas con rollback y test SQL.

### 🚫 Fuera de alcance
- Propina, pago en línea, dirección por defecto, wizard.
- Mostrar los datos nuevos a restaurante/domiciliario/admin (**LOOP_CLIENT_05D**).
- Reescribir `create_order` (solo se agregan parámetros), `CheckoutPage` u `OrderSuccessView`.
- Modificar `guard_order_update`.
- Color, tipografía, iconografía, cards, motion.

---

## 8. ARCHIVOS

**Frontend (solo agregar):**
- `src/features/client/pages/CheckoutPage.tsx` (327 líneas: **extraer** a componentes nuevos para no pasar de 300 al agregar campos)
- `src/features/client/components/CheckoutError.tsx` (mapa causa → `ErrorState`), `CashAmountField.tsx`, `OrderNotesField.tsx`
- `src/features/client/utils/clientOrderId.ts` (firma ampliada)
- `src/hooks/useLocalData.ts` (`createOrder`: `cash_amount`, `notes_to_restaurant`; errores nuevos)
- `src/shared/constants/stateCopy.ts` (`ERROR_COPY.checkout.*`)
- `src/shared/types/index.ts` (`Order.cash_amount`, `Order.notes_to_restaurant`)

**Base (`supabase/`):** `migrations/` M4–M7 con `.rollback.sql`; `tests/` un test SQL por migración y `guard_order_update` para las 3 columnas.
**Docs:** `docs/security/SEGURIDAD_PEDIDOS.md`, `LOOP_CLIENT_05C_REPORTE.md`.

---

## 9. A11Y ESPECÍFICA
- `ErrorState` con `role="alert"`; foco en el título o el CTA al aparecer.
- Campo de efectivo: `label`, `inputmode="numeric"`, error con `aria-describedby`, cambio en `aria-live="polite"`.
- Notas: `label` visible y contador anunciado sin ruido (no en `aria-live` por tecla).
- Objetivos táctiles ≥ 44 px; cifras en `tabular-nums`.

## 10. PERFORMANCE
Sin dependencias nuevas; solo dos campos y una vista condicional. Sin peticiones extra.

## 11. CONSOLE CLEAN
Sin warnings ni errores nuevos en consola.

## 12. BUILD, LINT Y TYPECHECK
`npm run build` · `npm run lint` (= `tsc --noEmit`) · `npm run type-check`. Línea base: 46 archivos / 411 tests.

---

## 13. TESTS

**Unit / componente:** copy y salida por causa de `CheckoutError`; `cash_amount` (solo efectivo, ≥ total, cambio en vivo, vacío permitido); notas (150 con contador); `createOrder` envía `p_cash_amount` / `p_notes_to_restaurant` y **nunca** precios ni total; firma de la llave cambia con método de pago, cash, notas y dirección; el carrito no se vacía ante un fallo.
**Base (transacción abortada, un test SQL por migración):**
- M5 (`cash_amount`): solo con `cash_on_delivery`; `cash_amount >= total`; `cash_amount < total` → `invalid_cash_amount`; con `online` → rechazado; `null` → OK; tope; una app con 5/6 argumentos sigue funcionando.
- M7 (notas): nota de 150 → OK; 151 → `notes_too_long`; vacía → `null`; las validaciones de `cash_amount` de M5 siguen activas.
- `guard_order_update`: el cliente no puede modificar `client_order_id`, `cash_amount` ni `notes_to_restaurant` (`order_update_not_allowed`) y el trigger no cambió.
- Tras cada test: conteo de pedidos igual al inicial.

---

## 14. QA CRÍTICO
1. Error de sesión → `ErrorState` con "Iniciar sesión"
2. Error de red durante el envío → "Reintentar", mismo `client_order_id`
3. Restaurante cerrado → salida a restaurantes
4. Productos no disponibles → salida al carrito
5. Validación de servidor → vuelve al formulario sin perder lo escrito
6. El carrito sigue guardado tras cualquier error
7. Sin dirección / sin conexión → siguen en línea (sin `ErrorState`)
8. "Pagar con cuánto" solo con efectivo; opcional
9. Cambio estimado en vivo (tabular)
10. Pago < total → error y botón deshabilitado
11. `cash_amount` guardado en el pedido; total sin cambios
12. Notas: contador, tope 150, guardadas, separadas de la referencia
13. Cambiar cash/nota tras respuesta perdida → llave nueva (D2)
14. Cliente antiguo (5/6 argumentos) sigue creando pedidos
15. Cliente no puede modificar las columnas nuevas (trigger intacto)
16. `SEGURIDAD_PEDIDOS.md` actualizado
17. Sin regresiones en checkout ni `OrderSuccessView`
18. Consola limpia, build OK

**Claude Code:** tests, pruebas de base (transacción abortada), ruta `/qa/checkout` temporal (se elimina al terminar). **Jorge (preview con sesión):** pedido real, modo avión, restaurante cerrado, doble toque, Lighthouse.

---

## 15. CRITERIOS DE ÉXITO
- [ ] Fallo del checkout con `ErrorState`, causa y salida
- [ ] `cash_amount` guardado y validado ≥ total en el servidor
- [ ] `notes_to_restaurant` guardado; > 150 rechazado con `notes_too_long` en el servidor; contador en vivo en la UI
- [ ] Firma de la llave = restaurante + items + método de pago + cash + notas + dirección; cualquier cambio → UUID nuevo
- [ ] Columnas nuevas verificadas como protegidas por `guard_order_update` (trigger sin cambios)
- [ ] `SEGURIDAD_PEDIDOS.md` corregido (refleja M1–M7, sin "PENDIENTE" obsoleto)
- [ ] Build, lint, tests OK; sin regresiones
- [ ] Sección 3.1 intacta (solo se agregó)

---

## 16. REPORTE FINAL
`docs/loops/client/LOOP_CLIENT_05C_REPORTE.md`: IMPLEMENTADO · ARCHIVOS · MIGRACIONES (fecha y verificación de cada una) · DECISIONES · TESTS (Build/Lint/Typecheck/Tests, antes → después) · QA · FUERA DE ALCANCE · DEUDA (05B propina, 06 direcciones, 07 pago en línea, Axe). **El reporte debe decir expresamente que `cash_amount` y `notes_to_restaurant` se guardan pero NO los ve nadie todavía**, y que **LOOP_CLIENT_05D (mostrarlos en restaurante, domiciliario y admin) es obligatorio antes del piloto** · PREPARACIÓN PARA EL SIGUIENTE LOOP.

---

## 17. LO QUE NO DEBES HACER
- NO reescribir lo funcional (3.1). NO enviar precios ni total desde el cliente.
- NO aplicar DDL a producción sin OK explícito de Jorge, una migración a la vez.
- NO hacer pruebas destructivas: solo transacciones abortadas.
- NO modificar `guard_order_update`. NO tocar `OrderSuccessView`, carrito, offline ni dirección.
- NO introducir dependencias. NO commitear sin "QA OK"; NO mergear sin orden explícita.
- Reportar en vez de arreglar lo que quede fuera de alcance.

## 18. REGLA FINAL
El servidor decide el dinero; el cliente solo declara su intención, y esa intención debe llegar completa o fallar con una salida clara. Agrega, no rehagas.

**Prioridad:** SEGURIDAD (validar en el servidor) → CLARIDAD (errores con salida) → UTILIDAD (efectivo, notas) → EXTRAS.

---

## BLOQUEANTE PARA PILOTO

**Sin LOOP_CLIENT_05D no se lanza a usuarios reales.** 05C hace que el cliente declare con cuánto paga y deje una nota, pero ninguna pantalla del restaurante, del domiciliario ni del admin muestra esos datos hasta 05D. Lanzar antes significa que el cliente cree que avisó y nadie se entera (billete grande sin cambio, alergias ignoradas).

- **LOOP_CLIENT_05D** — mostrar `cash_amount` y `notes_to_restaurant` en los 3 roles (restaurante, domiciliario, admin).
- Debe programarse **inmediatamente después de 05C**, antes de cualquier piloto.
- Mientras 05D no esté en producción, el reporte de 05C lo marca como **bloqueante abierto**.

---

## REGLA DE EJECUCIÓN
No lo ejecutes todavía. Solo crea el archivo y confírmame ruta + tamaño; después reporta la inspección previa y espera el OK.
