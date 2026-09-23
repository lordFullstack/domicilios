# LOOP_CLIENT_04 — CARRITO QA + UX REFINADO + PERSISTENCIA ROBUSTA

## ROL

Actúa como:

**Senior Frontend Engineer + Cart State Engineer + Mobile UX + Accessibility Specialist + PWA Engineer**

Continúa trabajando sobre el repositorio existente de Domicilios Riohacha.

LOOPs anteriores dejaron:

- CLIENT_01: una sola paleta, `format.ts`, `usePrefersReducedMotion`, a11y base del Home
- CLIENT_02: `normalizeText`, `EmptyState` con `role`, patrón `useSearchParams`, `RestaurantGrid`
- CLIENT_03 (Fase 3A) + su anexo de seguridad: `addItem` inmutable, tarifa de domicilio real
  (`useDeliveryFee`, `app_settings.delivery_fee`), `create_order` como RPC server-side, trigger
  de permisos por rol sobre `orders`

Este LOOP consolida el carrito como fuente única de verdad **antes** de que
LOOP_CLIENT_05 (Checkout) lo consuma. Si el carrito tiene bugs, el checkout
hereda los bugs.

> **BUENA PARTE DE LO QUE PIDE ESTE LOOP YA ESTÁ HECHO.**
> La auditoría de la sección 2 encontró que CLIENT_03 ya resolvió la mutación
> de estado, el tope de cantidad, el merge por producto y la confirmación de
> "1 restaurante por carrito", con tests que lo prueban. Este LOOP corrige lo
> que de verdad falta — no repite lo que ya funciona.

---

# 1. REGLA ABSOLUTA

ANTES DE MODIFICAR:

INSPECCIONA.

No asumas nada. No inventes nombres de archivos. No crees archivos
paralelos. Primero lee lo que ya existe.

Busca en el repositorio:

```text
CartContext
useCartContext
CartPage
CartItemRow
CartFloatingBar
CartSwitchSheet
storage.service
STORAGE_KEYS
useDeliveryFee
DeliveryFeeRow
BroadcastChannel
storage event
MAX_ITEM_QUANTITY
```

Reporta antes de escribir código si algo de la sección 2 cambió desde la
auditoría (Jorge hace cambios entre sesiones).

---

# 2. ESTADO REAL AUDITADO (23-sep-2026)

Esta tabla manda sobre cualquier nombre genérico del resto del documento.

## 2.1 Lo que YA existe (NO reconstruir)

| Pieza pedida | Qué existe HOY | Acción |
|---|---|---|
| `addItem` inmutable | `CartContext.tsx:103-124` — usa `.map`/spread, no muta. Comentario explícito documentando el bug viejo y el fix | Ya resuelto en CLIENT_03. Verificar que sigue así, no reescribir |
| `removeItem` / `updateQuantity` / `clear` inmutables | `CartContext.tsx:126-164` — `.filter`, `.map` + spread, `setCart([])` | Ya resuelto. Reutilizar |
| Stale closures en operaciones seguidas (ej. "Vaciar y agregar") | `cartRef` (`CartContext.tsx:52-56`) — todas las operaciones leen de `cartRef.current`, no del `cart` del render | Ya resuelto. Test: `CartContext.test.tsx:35-46` |
| Tope de cantidad | `MAX_ITEM_QUANTITY = 99` exportado (`CartContext.tsx:22`), aplicado en `addItem` y `updateQuantity`. Test en `CartContext.test.tsx:48-56` | Ya resuelto. Reutilizar la constante, no inventar otro límite |
| Merge por `productId` sin variantes | `addItem` incrementa si `exists`, si no agrega línea nueva (`CartContext.tsx:108-115`) | Ya resuelto. El "hash" hoy es literalmente `productId` — documentar para que una futura Fase 3B (variantes) lo extienda, no lo reemplace |
| Regla "1 restaurante por carrito" | `CartSwitchSheet.tsx` — BottomSheet "¿Cambiar de restaurante?" con "Cancelar"/"Vaciar y agregar", ya integrado en `RestaurantDetailPage` | Ya resuelto. Reutilizar, NO crear un segundo diálogo |
| Empty state | `CartPage.tsx:45-68` — `EmptyState` con ícono `ShoppingBag`, copy, CTA "Explorar restaurantes" a `ROUTES.CLIENT_RESTAURANTS`, footer oculto | Ya resuelto |
| CTA deshabilitado sin items | El branch de carrito vacío hace `return` antes de renderizar el footer/CTA — no puede navegarse a checkout sin items | Ya resuelto |
| "Agregar más productos" | `CartPage.tsx:141-146` — navega a `ROUTES.CLIENT_RESTAURANT.replace(':id', restaurant.id)` del restaurante actual del carrito (solo se renderiza si `restaurant` existe) | Ya resuelto |
| Safe area del footer | `CartPage.tsx:151` usa `safe-bottom`; `CartFloatingBar.tsx:22` usa `bottom-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom)))]` para no pegarse al `BottomNav` | Ya resuelto |
| A11y del stepper y basura | `aria-label="Disminuir cantidad"` / `"Aumentar cantidad"` / `` `Eliminar ${product.name} del carrito` `` (`CartPage.tsx:207-227`); `CartFloatingBar` con `aria-label` completo (cantidad + total) y íconos `aria-hidden` | Parcial — ver sección 8 (falta el nombre del producto en el stepper) |
| Envío real (no hardcodeado) | `useDeliveryFee()` + `DeliveryFeeRow` ya leen `app_settings.delivery_fee` (CLIENT_03, anexo de seguridad). `CartPage.tsx:70-71` calcula `total = subtotal + (deliveryFee ?? 0)` | Ya resuelto — **el envío NO depende de este LOOP ni de uno futuro**, ya es real |
| Badge del `BottomNav` | Lee `cart` del mismo `useCartContext()` (confirmado en CLIENT_01/03) | Ya resuelto, misma fuente que todo lo demás |
| `window.location.reload()` en el flujo de carrito/checkout | No aparece en `CartContext.tsx`, `CartPage.tsx`, `CartFloatingBar.tsx` ni `CartSwitchSheet.tsx` | Confirmado: no es un bug vigente en este alcance |
| Tamaño de archivo | `CartPage.tsx` ≈ 235 líneas (bajo el límite de 300) | **NO hace falta partir en `CartItemList`/`CartSummary`/`EmptyCart` como componentes separados** — dividir ahora sería fragmentación sin necesidad real |

## 2.2 Lo que SÍ falta (alcance real de este LOOP)

| Pedido | Realidad | Acción |
|---|---|---|
| Doble papelera | Confirmado: `CartPage.tsx:86-92` (header, "Vaciar carrito", siempre visible) **y** `CartPage.tsx:222-228` (por ítem) | Decidir y aplicar (sección 3) |
| Stepper → basura en qty=1 | El botón "−" en `item.quantity === 1` sigue mostrando `Minus` y llama a `removeItem` a través de `changeQty` (`next <= 0`); el ícono no cambia, así que visualmente no comunica "esto va a eliminar" | Implementar (sección 4) |
| Precios en coral | Confirmado: `text-coral` en el precio unitario (`CartPage.tsx:203`) y en el Total del footer (`CartPage.tsx:159`) — la migración que CLIENT_01 encontró y movió a un LOOP dedicado sigue sin hacerse | Migrar en este LOOP (sección 5) |
| Persistencia versionada | `storage.service.ts:24-37` — `localStorageService.set` ya envuelve todo en `{ key, value, timestamp }`, pero **nadie lee ese `timestamp` para expirar**, y no hay `version` propio de la estructura del carrito | Implementar expiración + versión (sección 6) |
| Sync multi-tab | No existe `BroadcastChannel` ni listener de `storage` en `CartContext.tsx` | Implementar (sección 7) |
| A11y del stepper con nombre de producto | `aria-label="Disminuir cantidad"` no incluye el nombre — dos productos en la lista tienen botones indistinguibles para un lector de pantalla | Completar (sección 8) |
| Confirmación visual al eliminar | `removeItem` quita el ítem del array inmediatamente; no hay transición de salida (fade/slide) ni Toast | Agregar (sección 9) |
| Política logout → carrito | No definida en ningún LOOP anterior | Definir y documentar (sección 10) |

---

# 3. DOBLE PAPELERA: DECISIÓN

Hoy hay un ícono de basura en el header (`CartPage.tsx:86-92`, siempre
visible, abre `BottomSheet` de confirmación) y uno por ítem (elimina esa
línea sola, sin confirmación — acción de bajo riesgo, una sola línea).

Decisión de este LOOP: **mantener ambos, pero el del header solo aparece
con ≥ 2 items.**

Motivo: con 1 solo item, "vaciar todo el carrito" y "eliminar este
producto" son la misma acción — mostrar dos botones que hacen lo mismo es
redundante. Con ≥ 2 items dejan de ser equivalentes y ambos ganan sentido
(uno vacía todo con confirmación, el otro quita una línea sin fricción).

```text
cart.length <= 1  → ocultar el botón de basura del header
cart.length >= 2  → mostrarlo, con el mismo BottomSheet de confirmación de hoy
```

No cambiar el comportamiento del `BottomSheet` "¿Vaciar el carrito?" que ya
existe (`CartPage.tsx:95-118`).

---

# 4. STEPPER: "−" SE CONVIERTE EN BASURA EN qty=1

Patrón común en apps de delivery (Rappi, iFood): al llegar a cantidad 1, el
botón "−" cambia su ícono a una papelera pequeña. El usuario entiende
"bajar de 1 = eliminar" sin tener que tocar un botón de basura aparte.

En `CartItemRow` (`CartPage.tsx:177-234`):

```text
item.quantity > 1  → botón "−" con ícono Minus, aria-label "Disminuir cantidad de {product.name}"
item.quantity === 1 → mismo botón, ícono Trash2 (más chico que el de "Eliminar" del extremo derecho),
                       aria-label "Eliminar {product.name} del carrito"
                       onClick sigue llamando a changeQty(productId, -1, quantity) → removeItem
```

No duplicar lógica: `changeQty` ya decide `removeItem` vs `updateQuantity`
según el resultado (`CartPage.tsx:36-43`); esta sección es solo el cambio
visual del ícono/label según `item.quantity`.

El botón de basura del extremo derecho (`CartPage.tsx:222-228`) se
mantiene igual — sigue siendo la forma de eliminar sin pasar por 1 primero.

---

# 5. PRECIOS: CORAL → INK / BRAND-700

Migración que CLIENT_01 auditó (21 usos en 11 archivos, contraste real
3.03:1, falla AA) y movió a un LOOP dedicado. El alcance de **este** LOOP
es solo Carrito (los usos en Checkout, OrderSummaryCard, MenuProductCard,
etc. quedan para cuando se ejecute la migración completa — no tocarlos
aquí para no dejar el resto de la app a medio migrar sin plan).

En `CartPage.tsx`:

```text
Precio unitario de cada item (línea 203)  → text-coral        → text-ink (o text-secondary) font-semibold
Total del footer (línea 159)              → text-coral        → text-brand-700 font-bold
Botón "+" del stepper (línea 217)         → bg-coral          → SIN CAMBIO (es fondo, no texto; contraste distinto)
```

Verificar que `ink`/`brand-700` ya sean clases válidas en `tailwind.config.ts`
(lo son desde CLIENT_01/CLIENT_03: `brand.700 = #1C2459`, `ink.DEFAULT`).
No inventar una clase nueva.

Documentar en el reporte cuántos usos de coral-como-texto quedan fuera de
Carrito después de este LOOP (para que la migración completa, si se hace,
sepa el número real restante).

---

# 6. PERSISTENCIA: VERSIÓN + EXPIRACIÓN

`localStorageService.set` (`storage.service.ts:24-37`) ya guarda
`{ key, value, timestamp }` para **cualquier** clave del proyecto — no es
específico del carrito, y cambiarlo afecta a `LAST_DELIVERY_ADDRESS`,
`RESTAURANT_FAVORITES`, etc. **No tocar el wrapper genérico.**

En su lugar, crear una capa específica del carrito:

```text
src/features/client/utils/cartStorage.ts
```

Responsabilidad:

```ts
interface StoredCart {
  version: 1
  items: CartItem[]
}
```

- `saveCart(items: CartItem[])`: escribe `{ version: 1, items }` con
  `localStorageService.set(STORAGE_KEYS.CART, ...)` (reutiliza el wrapper
  existente, que ya aporta el `timestamp`).
- `loadCart(): CartItem[]`: lee con `localStorageService.get`, que devuelve
  `{ value, timestamp }` internamente — hay que exponer el `timestamp` desde
  el servicio genérico si hoy `get()` solo devuelve `value` (`storage.service.ts:42-52`
  descarta el `timestamp` al retornar). Verificar y, si hace falta, agregar
  un método `getWithMeta(key)` al servicio genérico (aditivo, sin romper
  `get()` para sus otros usos).
- Expiración: si `Date.now() - timestamp > 24h` → devolver `[]` (carrito
  vacío), sin lanzar.
- Si `version` no es `1` (formato futuro) o el JSON no es el esperado
  (`items` no es array) → devolver `[]`, nunca crashear.
- `CartContext.tsx` reemplaza sus llamadas directas a
  `localStorageService.get/set(STORAGE_KEYS.CART, ...)` por
  `loadCart()`/`saveCart()`. La lógica de auto-limpieza contra productos
  huérfanos (`CartContext.tsx:70-88`) se mantiene igual, solo cambia la
  fuente de lectura/escritura.

No versionar como "v2": el carrito hoy no tiene versión ninguna, así que
`version: 1` es la primera. Si en el futuro cambia la forma de `CartItem`
(ej. Fase 3B con variantes), esa migración decide cómo tratar `version: 1`
sin datos de personalización — no es parte de este LOOP.

---

# 7. SYNC MULTI-TAB

Si el usuario tiene la app abierta en dos pestañas y modifica el carrito en
una, la otra debe enterarse.

```text
src/features/client/hooks/useCartSync.ts
```

- Usar el evento nativo `storage` (se dispara automáticamente en otras
  pestañas del mismo origen cuando `localStorage` cambia — **no** en la
  pestaña que escribió). Es más simple que `BroadcastChannel` y no requiere
  que todas las pestañas mantengan un canal abierto.
- Filtrar por `event.key === STORAGE_KEYS.CART`.
- Al detectar el evento, releer con `loadCart()` (sección 6) y actualizar
  el estado del `CartContext` (`setCart`).
- No re-escribir a `localStorage` dentro del handler del evento `storage`
  (evita el loop: pestaña A escribe → evento en B → B vuelve a escribir →
  evento en A → …). El handler solo lee y actualiza estado en memoria.
- Si más adelante se necesita reaccionar dentro de la MISMA pestaña que
  hace el cambio (el evento `storage` no aplica ahí), evaluar
  `BroadcastChannel` como mejora — no es necesario para el caso pedido
  (dos pestañas), documentar como posible mejora futura.

---

# 8. A11Y: NOMBRE DEL PRODUCTO EN EL STEPPER

Completar lo que ya existe (`CartPage.tsx:207-217`):

```text
Antes: aria-label="Disminuir cantidad"
Ahora: aria-label={`Disminuir cantidad de ${product.name}`} (o "Eliminar {name} del carrito" en qty=1, sección 4)

Antes: aria-label="Aumentar cantidad"
Ahora: aria-label={`Aumentar cantidad de ${product.name}`}
```

Lo que ya está bien y NO se toca:

- `Eliminar ${product.name} del carrito` del botón de basura del extremo
  derecho — ya es descriptivo.
- `aria-label` de `CartFloatingBar` — ya incluye cantidad y total.
- El botón "Vaciar carrito" del header — su `aria-label` ya es correcto;
  solo cambia su visibilidad (sección 3), no su texto.
- El `BottomSheet` de confirmación ya hereda el focus trap de CLIENT_03.

No usar `aria-live` en el Total del footer ni en el subtotal — cambian con
cada tap de "+"/"−" y un lector de pantalla anunciándolo constantemente es
ruido, no ayuda (regla ya aplicada en otras pantallas del proyecto).

---

# 9. CONFIRMACIÓN VISUAL AL ELIMINAR

Al tocar la basura (header con ≥2 items, o la de cada ítem, o el stepper en
qty=1):

- El ítem sale de la lista con una transición corta (`opacity` + `translateY`
  o `scale`, ~150-200ms), respetando `usePrefersReducedMotion()`
  (`behavior` inmediato sin transición si el usuario la desactivó).
- Como `removeItem` es local (localStorage, no hay red de por medio), no
  hace falta un estado "optimista con rollback" real — la operación no
  falla salvo que `localStorage` esté lleno/bloqueado (ver `catch` que ya
  existe en `CartContext.tsx:132-135`, que ya maneja ese caso devolviendo
  `false` sin crashear).
- Toast opcional "Producto eliminado", sutil, no bloqueante — reutilizar el
  `Toast` compartido que ya usa `RestaurantDetailPage` (CLIENT_03), no crear
  otro sistema.

---

# 10. POLÍTICA: LOGOUT → CARRITO

No estaba definida en ningún LOOP anterior. Decisión de este LOOP:

**El carrito NO se vacía al cerrar sesión.**

Motivo: el carrito vive en `localStorage` del dispositivo, no asociado a un
`user_id` — es el mismo modelo que ya usa `LAST_DELIVERY_ADDRESS`. Un
usuario que cierra sesión por error (o para cambiar de cuenta) no debería
perder lo que estaba armando. Si otra persona usa el mismo dispositivo con
otra cuenta, verá el carrito de la sesión anterior — riesgo aceptado dado
que hoy nada en el proyecto separa datos locales por usuario (ni
favoritos, ni dirección guardada).

Documentar esta decisión en el reporte final; si Jorge prefiere lo
contrario (vaciar al logout), es un cambio de una línea en el flujo de
logout, pero requiere su confirmación explícita porque contradice el
comportamiento de todo lo demás que hoy es "por dispositivo, no por
usuario".

---

# 11. NO CREAR UN SEGUNDO…

```text
CartContext / useCart
localStorage del carrito (una sola clave: STORAGE_KEYS.CART)
merge por productId
regla de "1 restaurante por carrito" (ya vive en CartSwitchSheet)
cálculo de subtotal/total (CartContext.getTotal + deliveryFee)
BottomSheet / ConfirmDialog / Toast
Stepper (el patrón inline de CartItemRow ya cumple; no extraer un
  QuantitySelector nuevo solo para esto — RestaurantDetailPage ya tiene el
  suyo con otra forma, para otro contexto)
```

No instalar Zustand, Redux ni Jotai. El Context actual ya resuelve el
problema que motivó su creación (ver comentario en `CartContext.tsx:30-43`).

---

# 12. A11Y ESPECÍFICA DE ESTE LOOP

- Stepper: `aria-label` con nombre del producto (sección 8).
- Basura por ítem: ya correcto, sin cambios.
- Basura del header: `aria-label="Vaciar carrito"` ya existe; se mantiene
  cuando el botón es visible (≥2 items).
- Empty state: ya usa `EmptyState` — verificar que tenga `role="status"`
  (mismo componente que otras pantallas, no es exclusivo de Carrito).
- `BottomSheet` de confirmación: ya hereda `role="dialog"` + `aria-modal` +
  focus trap de CLIENT_03 — no reimplementar.
- Footer del resumen: agregar `role="region"` +
  `aria-label="Resumen del pedido"` al contenedor fijo (`CartPage.tsx:151`).
- Total: sin `aria-live` (sección 8).

---

# 13. PERFORMANCE

- `productById` (`CartPage.tsx:34`) ya evita N llamadas a Supabase por fila
  (una sola consulta al menú del restaurante) — no regresar a eso.
- La transición de salida al eliminar (sección 9) usa CSS, no JS de
  animación — sin dependencias nuevas.
- `useCartSync` (sección 7) agrega un solo listener `storage` a nivel de
  `CartProvider`, se limpia en el cleanup del `useEffect`.

---

# 14. CONSOLE CLEAN

Agregar productos, cambiar cantidades hasta 0, vaciar carrito, cambiar de
restaurante con carrito activo, abrir en dos pestañas y modificar en una.

```text
0 errores
0 warnings de React / keys / act()
```

---

# 15. BUILD, LINT Y TYPECHECK

```bash
npm run build
npm run lint        # = tsc --noEmit
npm run type-check
```

---

# 16. TESTS

Extender (NO duplicar) `src/features/client/CartContext.test.tsx` — ya
cubre inmutabilidad, "vaciar y agregar", y el tope de 99. Agregar:

```ts
// cartStorage.ts
serializeCart / deserializeCart con version: 1
deserializeCart con JSON inválido → [] , no throw
expireCart → [] si timestamp > 24h de antigüedad
deserializeCart con version distinta de 1 → [] (sin migración en este LOOP)

// CartContext
useCartSync: evento 'storage' con la clave del carrito → estado actualizado
useCartSync: evento 'storage' con otra clave → sin cambios (no dispara nada)
```

Integración (`CartPage.test.tsx`, nuevo — no existe hoy):

```text
Header de basura oculto con 1 item, visible con 2+
Stepper en qty=1 muestra ícono de basura con el aria-label correcto
Eliminar último item → EmptyState visible, footer/CTA desaparecen
Precios sin clase text-coral en Carrito
```

---

# 17. QA CRÍTICO

1. Carrito vacío → `EmptyState` visible con CTA funcional.
2. Carrito con 1 item → sin botón de basura en el header.
3. Carrito con 2+ items → botón de basura en el header visible.
4. Aumentar cantidad con "+" → subtotal y total se actualizan en vivo.
5. Disminuir cantidad con "−" hasta 1 → el propio "−" pasa a mostrarse como
   basura.
6. Tocar esa basura en qty=1 → el ítem desaparece con transición.
7. Basura del extremo derecho → elimina sin pasar por qty=1.
8. Tocar basura del header (con 2+ items) → `BottomSheet` de confirmación.
9. Confirmar vaciar → carrito vacío → `EmptyState`.
10. Cancelar vaciar → carrito intacto.
11. "Agregar más productos" → navega al restaurante actual del carrito.
12. Refresh en `/cart` → items siguen ahí.
13. Simular carrito guardado hace 25h (ajustar `timestamp` en localStorage
    manualmente) → al abrir, carrito vacío.
14. Abrir dos pestañas → modificar en una → la otra refleja el cambio.
15. `localStorage` con JSON corrupto en la clave del carrito → la app no
    crashea, carrito vacío.
16. Agregar el mismo producto 2 veces → cantidad 2, no dos líneas (ya
    funciona; confirmar que sigue así).
17. Cambiar de restaurante con items → `CartSwitchSheet` aparece (ya
    funciona; confirmar que sigue así).
18. Total del footer respeta safe-area en iPhone (ya funciona; confirmar).
19. Botones "−"/"+" con touch target ≥ 44px (ya usan `.touch-target`;
    confirmar área real con DevTools).
20. Consola limpia en todos los flujos.
21. Sin scroll horizontal en 320px.
22. Precios del Carrito sin coral (ink + brand-700).
23. Badge del `BottomNav` refleja el conteo real tras cada cambio.
24. Doble tap rápido en la basura de un ítem → no revienta ni duplica nada
    (`removeItem` filtra por `productId`; un segundo tap sobre un ítem que
    ya no está es un no-op seguro — confirmar con test).
25. Cerrar sesión con carrito activo → login con otra cuenta → el carrito
    sigue ahí (política definida en sección 10).

---

# 18. REGLAS IMPORTANTES

- NO tocar Checkout (LOOP_CLIENT_05).
- NO tocar Detalle de Restaurante (LOOP_CLIENT_03) más allá de lo que ya lo
  integra (`CartSwitchSheet`), que no cambia.
- NO crear un segundo sistema de persistencia del carrito.
- NO cambiar la clave `STORAGE_KEYS.CART` sin plan de migración (hoy no
  hace falta: `cartStorage.ts` es una capa nueva sobre la misma clave).
- NO romper `CartFloatingBar` (safe-area y a11y ya correctos).
- NO romper el badge del `BottomNav`.
- NO agregar librerías de estado (Zustand, Redux, Jotai).
- El envío ya viene de `useDeliveryFee` — **no** reintroducir un valor
  hardcodeado ni un TODO pendiente de LOOP_05, eso ya se resolvió.
- Documentar la política de "logout → carrito" (sección 10) antes de que
  alguien la cambie sin darse cuenta.

---

# 19. CRITERIOS DE ÉXITO

- [ ] `addItem`/`removeItem`/`updateQuantity`/`clear` siguen inmutables
      (verificado, no repetir el fix)
- [ ] Basura del header solo visible con ≥ 2 items
- [ ] Stepper en qty=1 se convierte en basura, con `aria-label` correcto
- [ ] Precios del Carrito migrados de coral a ink/brand-700
- [ ] `cartStorage.ts` con `version` + expiración de 24h + manejo de JSON
      corrupto sin crashear
- [ ] Sync multi-tab vía evento `storage`, sin loops
- [ ] `aria-label` del stepper incluye el nombre del producto
- [ ] Transición al eliminar, respetando reduced motion
- [ ] Política logout → carrito documentada
- [ ] `role="region"` + `aria-label` en el footer del resumen
- [ ] Sin componentes ni sistemas paralelos (Context, storage, diálogos)
- [ ] Sin dependencias nuevas
- [ ] Consola limpia
- [ ] Build, lint (tsc) y tests OK
- [ ] Tests nuevos para `cartStorage` y `useCartSync`
- [ ] Sin regresiones en `CartFloatingBar`, `BottomNav`, `CartSwitchSheet`,
      `useDeliveryFee`

---

# 20. REPORTE FINAL

Entregar en `docs/loops/LOOP_CLIENT_04_REPORTE.md`:

IMPLEMENTADO — resumen técnico.

ARCHIVOS MODIFICADOS / CREADOS — lista exacta.

YA ESTABA RESUELTO (de la sección 2.1) — confirmación de que sigue así tras
los cambios de este LOOP.

DOBLE PAPELERA — decisión aplicada (umbral de 2 items).

STEPPER → BASURA — implementación.

PRECIOS — cuántos usos de coral quedaron migrados en Carrito y cuántos
siguen pendientes fuera de alcance (Checkout, OrderSummaryCard, etc.).

PERSISTENCIA — estructura final (`version`, expiración, manejo de
corrupción), y si se agregó `getWithMeta` al `storage.service.ts` genérico.

SYNC MULTI-TAB — API usada (`storage` event) y por qué no `BroadcastChannel`.

POLÍTICA LOGOUT → CARRITO — la decisión y su justificación.

A11Y — lista de `aria-*` agregados/completados.

TESTS

```text
Build:     OK / FAIL
Lint:      OK (tsc) / FAIL
Typecheck: OK / FAIL
Tests:     OK / FAIL  (antes N / después M)
```

QA — cuáles de los 25 casos se validaron y cuáles quedan para Jorge.

DEUDA TÉCNICA GENERADA — incluir explícitamente: coral fuera de Carrito
(cuántos usos quedan), `BroadcastChannel` como mejora futura si se necesita
sync dentro de la misma pestaña.

PREPARACIÓN PARA LOOP_CLIENT_05 — Checkout + Dirección + Pago + Confirmación.

---

# 21. LO QUE NO DEBES HACER

- NO reescribir `addItem`/`removeItem`/`updateQuantity`/`clear`: ya son
  inmutables, con tests que lo prueban.
- NO crear un segundo `CartContext`, `CartSwitchSheet`, `BottomSheet` o
  `Toast`.
- NO tocar `useDeliveryFee` ni `DeliveryFeeRow` — el envío real ya está
  resuelto por CLIENT_03.
- NO partir `CartPage.tsx` en 5 componentes nuevos: con 235 líneas no lo
  necesita todavía.
- NO migrar coral fuera de Carrito en este LOOP.
- NO vaciar el carrito al cerrar sesión sin que Jorge lo pida
  explícitamente (contradice la política definida en la sección 10).
- NO tocar Checkout ni `create_order`.
- NO agregar dependencias de estado global.

---

# 22. REGLA FINAL

El carrito es la antesala del checkout. Si el carrito miente, el checkout
hereda la mentira.

Nunca dejes que el carrito tenga un estado inconsistente entre pestañas.
Nunca confíes en el estado visual sin poder explicar de dónde sale
(`cartRef`, `localStorage`, el evento `storage`).
Nunca permitas que un doble tap en eliminar rompa algo — que sea, como
mínimo, un no-op seguro.
Nunca dejes el carrito vacío sin un camino claro hacia adelante.

Prioridad:

CORRECCIÓN → INMUTABILIDAD → PERSISTENCIA → CLARIDAD → A11Y → ESTÉTICA

Si tienes que elegir entre una animación bonita al eliminar y no tocar un
`CartContext` que ya está bien probado:

no lo toques. La corrección ya está ahí — este LOOP suma lo que falta,
no reescribe lo que funciona.
