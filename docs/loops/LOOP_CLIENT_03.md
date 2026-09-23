# LOOP_CLIENT_03 — DETALLE RESTAURANTE + MENÚ + VARIANTES + PRODUCT SHEET

## ROL

Actúa como:

**Senior Frontend Engineer + Mobile UX Engineer + E-commerce Menu Specialist + Accessibility Specialist + Cart Integration Specialist**

Continúa trabajando sobre el repositorio existente de Domicilios Riohacha.

LOOPs anteriores dejaron:

- CLIENT_01: una sola paleta, `format.ts`, `usePrefersReducedMotion`, a11y base del Home
- CLIENT_02: `normalizeText`, `EmptyState` con `role`, `Toast` con variante `error` y en portal,
  patrón `useSearchParams`, `RestaurantGrid`, bug de error persistente en `useRestaurants` corregido

Este LOOP convierte el Detalle del Restaurante en un menú navegable y
confiable, y define cómo llegan los productos al carrito.

> **ESTE LOOP SE DIVIDE EN DOS FASES.**
> El modelo de datos actual NO soporta variantes, extras ni notas por
> producto (ver sección 2). Inventarlos en frontend está prohibido.
>
> - **FASE 3A** — todo lo que se puede hacer con el modelo actual. Solo frontend.
> - **FASE 3B** — variantes, extras, notas y hash de personalización.
>   Requiere migración de base de datos → **plan primero, aprobación de
>   Jorge, después código.** No se ejecuta junto con 3A.

---

# 1. REGLA ABSOLUTA

ANTES DE MODIFICAR:

INSPECCIONA.

No asumas nada. No inventes nombres de archivos. No crees archivos
paralelos. Primero lee lo que ya existe.

Busca en el repositorio:

```text
RestaurantDetailPage
RestaurantDetailSkeleton
MenuProductCard
FeaturedProductStrip
ProductDetailSheet
ProductImage
QuantitySelector
BottomSheet
Toast
CartContext
useCartContext
CartFloatingBar
useRestaurantById
useProducts
useProductById
usePromotions
PRODUCT_CATEGORIES
createOrder
IntersectionObserver
visualViewport
```

Reporta antes de escribir código si algo de la sección 2 cambió desde la
auditoría (Jorge hace cambios entre sesiones).

---

# 2. ESTADO REAL AUDITADO (22-sep-2026)

Esta tabla manda sobre cualquier nombre genérico del resto del documento.

## 2.1 Lo que YA existe

| Pieza pedida | Qué existe HOY | Acción |
|---|---|---|
| RestaurantDetailPage | `features/client/pages/RestaurantDetailPage.tsx` — **386 líneas** (límite 300) | Refactor: extraer piezas, NO renombrar |
| Hero | Portada + scrim + logo + nombre + rating + "Envío gratis" + badge Abierto/Cerrado + volver + favorito | Reutilizar, extraer a `RestaurantHero` |
| Tabs de categoría | Chips sticky con `aria-pressed` que **FILTRAN** (solo muestran una categoría a la vez) | Convertir en navegación con scroll spy (sección 5) |
| Categorías | `PRODUCT_CATEGORIES` fijas: Entradas, Platos, Bebidas, Postres, Adicionales. Solo se muestran las que tienen productos | Reutilizar. NO hay categorías libres por restaurante |
| ProductRow | `MenuProductCard.tsx`: imagen, nombre, descripción, precio coral, botón "+", **stepper −/+ cuando ya está en el carrito**, "Agotado"/"Cerrado" | Refactor |
| Recomendados | `FeaturedProductStrip.tsx`: los 3 primeros productos disponibles, sin criterio | Refactor (sección 10) |
| Product sheet | `ProductDetailSheet.tsx`: imagen, descripción, `QuantitySelector`, agregar. Sin variantes (el propio archivo lo documenta) | Reutilizar en 3A; extender en 3B |
| Bottom Sheet | `shared/components/BottomSheet.tsx`: portal, `role="dialog"`, `aria-modal`, Escape, bloqueo de scroll | Mejorar a11y (sección 12). NO crear otro |
| Toast | `shared/components/Toast.tsx` (success/error, portal, `role="status"`) | Reutilizar |
| Stepper | `shared/components/QuantitySelector.tsx` | Reutilizar |
| Imagen | `shared/components/ProductImage.tsx`: foto real o emoji guardado en `image_url` | Agregar fallback `onError` |
| CartFloatingBar | Existe, safe-area desde CLIENT_01, `formatCOP` | Verificar (sección 9) |
| Cambio de restaurante con carrito | Ya existe: BottomSheet "¿Cambiar de restaurante?" + "Vaciar y agregar" | Conservar |
| Restaurante suspendido | Ya existe: pantalla "Restaurante no disponible" | Conservar |
| Offline | `useRestaurantById` / `useProducts` con caché IndexedDB + `OfflineDataBadge` | Conservar |
| Skeleton | `RestaurantDetailSkeleton.tsx` + skeleton inline de productos | Unificar (sección 13) |

## 2.2 Lo que NO existe (y no se inventa)

| Pedido | Realidad | Consecuencia |
|---|---|---|
| Variantes / tamaños / extras / opciones requeridas | `products`: id, restaurant_id, name, description, price, image_url, category, available. Nada más | Fase 3B con migración |
| Notas por producto | Ni `CartItem` ni `order_items` tienen campo de notas. `orders.special_instructions` es por pedido (lo usa Checkout para "referencia") | Fase 3B |
| Hash de personalización | `CartContext` indexa por `productId`: un producto = una línea | Fase 3B |
| Horarios ("Abre a las 11:00") | `restaurants.status` es solo `open`/`closed`, sin horas | Banner sin hora (sección 11) |
| "Disponible a partir de las 6pm" | `products.available` es booleano | Solo "Agotado" |
| Logo del restaurante | No hay campo `logo_url`: el "logo" del hero repite `cover_url` o el emoji de `image_url` | Documentar, no inventar |
| Criterio de recomendados | No hay métricas de ventas. SÍ existe `promotions.type = 'featured_product'` con `product_id` que gestiona el Admin | Usarlo (sección 10) |

## 2.3 Bugs encontrados en la auditoría (corregir en 3A)

1. **`CartContext.addItem` muta el estado**: `existing.quantity += quantity` modifica el objeto del array anterior. Reemplazar por actualización inmutable.
2. **Error de carga recarga toda la app**: el botón usa `window.location.reload()`. Debe llamar a `reload()` del hook.
3. **404 sin salida útil**: "Restaurante no encontrado" + "Volver al inicio". Debe ofrecer "Explorar otros restaurantes" (`/app/restaurants`).
4. **Favorito del hero** con colores hex en línea (`#E11D48`, `#1A1A1A`) y sin `aria-pressed` — alinear con `RestaurantGridCard` (CLIENT_01).
5. **Imagen rota**: `ProductImage` no tiene `onError`; una URL caída deja el ícono de imagen rota del navegador.

## 2.4 Riesgo de seguridad detectado (NO se corrige aquí, se audita)

`createOrder` (en `useLocalData.ts`) inserta `orders.total` y `order_items.unit_price`
**tal como los manda el cliente**, y los items en un segundo insert sin
transacción. Antes de sumar precios de variantes calculados en el cliente
(3B), hay que verificar en Supabase si existe un trigger/RPC que recalcule
precios. Si no existe, 3B DEBE incluir validación server-side.
Registrar el resultado de la verificación en el reporte.

---

# 3. NO CREAR UN SEGUNDO…

```text
CartContext / useCart
BottomSheet / Modal / Dialog
Toast
modelo de producto (types)
cálculo de precio
Stepper
```

No instalar Headless UI, Radix, focus-trap-react, react-intersection-observer
ni librerías de animación. Focus trap y scroll spy son pocas líneas y se
implementan a mano (secciones 5 y 12).

---

# ======================================================
# FASE 3A — MENÚ NAVEGABLE (solo frontend, sin tocar BD)
# ======================================================

# 4. ESTRUCTURA DE ARCHIVOS

Objetivo: `RestaurantDetailPage.tsx` ≤ 300 líneas. Extraer, no duplicar:

```text
features/client/components/
  RestaurantHero.tsx          (hero actual + favorito)
  RestaurantCompactHeader.tsx (barra sticky compacta)
  MenuCategoryNav.tsx         (chips + scroll spy)
  MenuSection.tsx             (h2 + lista de productos de una categoría)
  MenuProductCard.tsx         (refactor, conservar nombre)
  RestaurantClosedBanner.tsx
features/client/hooks/
  useScrollSpy.ts
  useStickyHeader.ts          (solo si IntersectionObserver no basta en el componente)
```

Nombres del prompt original que NO se crean porque ya existen con otro nombre:
`ProductRow` = `MenuProductCard`, `QuantityStepper` = `QuantitySelector`,
`ProductCarouselCard` = tarjeta dentro de `FeaturedProductStrip`,
`useRestaurantMenu` = `useRestaurantById` + `useProducts`.

---

# 5. CATEGORÍAS: DE FILTRO A NAVEGACIÓN CON SCROLL SPY

Hoy los chips ocultan las demás categorías. Cambiar a:

· Todas las categorías con productos se renderizan en UNA lista, cada una
  en su `MenuSection` con `<h2 id="cat-<slug>">`.
· Chips sticky debajo del header compacto.
· Tocar un chip → `scrollIntoView` de su sección, con offset del header
  sticky (`scroll-margin-top` en la sección, NO cálculos en JS).
  `behavior: 'auto'` si `usePrefersReducedMotion()`.
· Scroll spy: `useScrollSpy(ids)` con `IntersectionObserver`
  (`rootMargin` negativo arriba = alto del header sticky). El chip activo
  se actualiza y se centra en su fila.
· Mientras el scroll lo inició un tap en chip, ignorar el spy hasta que
  termine (evita que el chip "salte" por las secciones intermedias).
· Transición del chip activo: ~150 ms, desactivada con reduced motion.
· Si solo hay 1 categoría → no mostrar chips.

A11y — decisión:
· NO usar `role="tablist"`: no hay paneles que se oculten; es navegación
  dentro de la página. Usar `<nav aria-label="Categorías del menú">` con
  botones y `aria-current="true"` en el activo.
· Documentar esta decisión (el prompt original pedía tabs).

---

# 6. HEADER STICKY COMPACTO

· El hero se queda como está (NO cambiar gradiente ni scrim).
· Un `IntersectionObserver` sobre un sentinela al final del hero decide
  cuándo mostrar `RestaurantCompactHeader`: volver + nombre + rating.
· Barra con `pt` de safe-area (`env(safe-area-inset-top)`), fondo sólido o
  `glass`, transición de opacidad ~150 ms (sin animación con reduced motion).
· El botón volver SIEMPRE visible (en hero o en barra compacta).
· La barra compacta NO se anuncia como un segundo `<h1>`: usar `<p>` con
  `aria-hidden` en el nombre duplicado o un solo h1 en el hero.
· Los chips de categoría quedan pegados debajo de la barra compacta
  (`top` = alto de la barra).

---

# 7. BOTÓN "+" Y ESTADOS DEL PRODUCTO

`MenuProductCard` maneja 3 estados:

| Estado | Condición | UI |
|---|---|---|
| Agregar | disponible + restaurante abierto + no está en el carrito | Botón "+" |
| En carrito | disponible + abierto + cantidad > 0 | Stepper −/+ (YA EXISTE, conservar) con la cantidad |
| Deshabilitado | `!product.available` o restaurante cerrado | Botón deshabilitado + texto "Agotado" o "Cerrado" |

En 3A TODOS los productos son "sin variantes", así que:
· "+" agrega directo (ya funciona así). NO abrir sheet.
· Feedback: el botón muestra un check ~600 ms y vuelve a su estado;
  `navigator.vibrate?.(10)` si existe; sin animación con reduced motion.
  Anunciar con el `Toast` existente ("Costilla BBQ agregada").
· Tocar la fila (fuera del botón) → abre `ProductDetailSheet` (foto grande
  + descripción completa + cantidad). **Decisión a confirmar con Jorge**:
  el prompt original pedía "tocar la fila agrega directo"; se conserva el
  sheet informativo porque es el único lugar donde se lee la descripción
  completa y se ve la foto grande.
· Cantidad máxima por producto: 99 (validar en `QuantitySelector` y en el stepper).

Color del botón: hoy es coral (3.03:1 sobre blanco para el ícono, falla
para texto). El botón es ícono blanco sobre fondo coral: verificar ≥ 3:1
(WCAG 1.4.11). NO migrar el coral aquí: eso es LOOP_CORAL.

---

# 8. DISPONIBILIDAD Y RESTAURANTE CERRADO

## 8.1 Producto no disponible
· Opacidad reducida (ya existe `opacity-55`), botón deshabilitado, texto
  "Agotado" visible y en el nombre accesible.
· Tocar la fila sigue abriendo el sheet en modo lectura (ya funciona así:
  el sheet deshabilita "Agregar").

## 8.2 Restaurante cerrado
· `RestaurantClosedBanner` arriba del menú: "Cerrado por ahora. Puedes ver
  el menú, pero no hacer pedidos." — SIN hora de apertura (no existe el dato).
· `role="status"`.
· Botones "+" y stepper deshabilitados; el menú se puede navegar.
· Si hay productos de este restaurante en el carrito, NO se borran
  (Checkout decide; ver LOOP_CLIENT_04).

---

# 9. CARTFLOATINGBAR

Verificar (ya existe):
· Aparece con ≥ 1 item, muestra cantidad y total con `formatCOP`.
· Respeta safe-area (CLIENT_01).
· La página reserva espacio al final (hoy `pb-44`): verificar que el último
  producto no quede tapado con la barra visible.
· Tap → `/app/cart`.
· Al agregar, el total cambia sin salto de layout. Si se anima, respetar
  reduced motion.
· Botón con nombre accesible completo: "Ver carrito, 3 productos, $45.000".

NO crear otra barra.

---

# 10. RECOMENDADOS

Hoy: los 3 primeros productos disponibles (no recomienda nada).

Cambiar a:
· Fuente: `usePromotions('featured_product')` filtrado por
  `product_id` que pertenezca a este restaurante (ya lo gestiona el Admin).
  Reutilizar el hook, NO crear otro query.
· Máximo 6. Si hay 0 → ocultar la sección completa (sin título vacío).
· Tarjeta compacta con el MISMO comportamiento del producto normal
  (misma función de agregar, mismos estados).
· NO rellenar con productos al azar si no hay promociones.

---

# 11. IMÁGENES

`ProductImage`:
· `onError` → cae al placeholder (emoji del producto o ícono de marca).
· `loading="lazy"` (ya existe) + `decoding="async"`.
· `width`/`height` o `aspect-ratio` fijo en el contenedor para evitar CLS.
· `alt` = nombre del producto; en la fila, si el nombre ya está como texto
  al lado, `alt=""` (decorativa) para no leerlo dos veces. Decidir y ser
  consistente.
· El emoji de respaldo con `aria-hidden="true"`.
· Hero: `alt` descriptivo ("Portada de Asados"); logo repetido con `alt=""`.

---

# 12. BOTTOMSHEET — A11Y COMPLETA

Mejorar el componente compartido (lo usan Explorar, Checkout, logout, etc.):

· Al abrir: foco al primer elemento interactivo (o al panel con `tabIndex={-1}`).
· Focus trap: Tab / Shift+Tab ciclan dentro del panel.
· Al cerrar: foco vuelve al elemento que lo abrió (`document.activeElement`
  guardado al abrir).
· `aria-labelledby` apuntando al título cuando existe (hoy `aria-label`).
· Contenido detrás con `inert` (o `aria-hidden`) mientras está abierto.
· Cierre: X visible (hoy solo Escape y backdrop), backdrop y Escape.
  Swipe down: solo si se implementa sin librerías y sin romper el scroll
  interno; si no, documentar como deuda.
· Test de regresión en los sheets existentes (filtros de Explorar,
  logout, cambio de restaurante).

---

# 13. SKELETON, ERROR Y 404

## 13.1 Skeleton
· `RestaurantDetailSkeleton` = hero (h-52) + fila de chips + 3 filas de
  producto con la geometría real de `MenuProductCard`.
· Usar el mismo skeleton para la carga de productos (hoy es otro inline).
· `role="status"` + `aria-label="Cargando menú"`.

## 13.2 Errores
· Restaurante: error de red con `EmptyState role="alert"` + "Reintentar"
  que llama a `reload()` (NO `window.location.reload()`). Exponer `reload`
  desde `useRestaurantById` si hoy no lo expone, sin cambiar su firma.
· Productos: si falla la carga del menú pero el restaurante sí cargó,
  mostrar el hero y el error solo en la zona del menú.
· Offline con caché: conservar `OfflineDataBadge`.

## 13.3 404
· "No encontramos este restaurante" + CTA "Explorar restaurantes"
  (`/app/restaurants`) + secundaria "Volver al inicio".

---

# 14. CARRITO (solo lo necesario en 3A)

· Corregir la mutación de `addItem` (sección 2.3).
· NO cambiar la forma de `CartItem` en 3A.
· NO cambiar la clave de localStorage.
· Conservar la confirmación de cambio de restaurante.

---

# ======================================================
# FASE 3B — VARIANTES, EXTRAS Y NOTAS (requiere migración)
# ======================================================

> **No escribir código de 3B hasta que Jorge apruebe el plan de migración.**
> Entregar primero: esquema propuesto, políticas RLS, índices, orden de
> migraciones (un concepto por migración), impacto en Checkout/Admin/
> Restaurante y plan de rollback. Correr advisors de seguridad y
> performance después de aplicar.

# 15. MODELO PROPUESTO (a validar)

```text
product_option_groups
  id, product_id → products(id), name, min_select, max_select,
  required (derivado de min_select > 0), display_order

product_options
  id, group_id → product_option_groups(id), name,
  price_delta (entero COP, ≥ 0), available, display_order

order_items (columnas nuevas)
  options jsonb     -- snapshot: [{group, option, price_delta}]
  notes   text      -- máx. 150 caracteres (CHECK)
```

· Índices explícitos en todas las FKs.
· RLS: lectura pública de grupos/opciones de productos de restaurantes
  aprobados; escritura solo dueño del restaurante `OR is_admin()`, con
  `(SELECT auth.uid())`.
· Snapshot en `order_items`: si el restaurante cambia una opción después,
  el pedido histórico no cambia.

# 16. PRECIO: UNA SOLA FUNCIÓN + VALIDACIÓN EN SERVIDOR

· Frontend: `calculateItemPrice(basePrice, selections)` en
  `features/client/utils/pricing.ts`. La usan el sheet, el carrito y el
  checkout. Solo para MOSTRAR.
· Servidor: el total real lo recalcula la base de datos (trigger o RPC
  `create_order`) a partir de `products.price` + `product_options.price_delta`.
  Nunca confiar en `unit_price` / `total` que manda el cliente (ver 2.4).
· Enteros en COP, sin decimales.

# 17. CARRITO CON PERSONALIZACIÓN

· `CartItem` suma `lineId`, `options`, `notes`.
· `lineId = hashPersonalization(productId, selections, notes)`:
  determinístico (opciones ordenadas por id, notas normalizadas con trim).
· Mismo producto + misma personalización → suma cantidad.
  Distinta personalización → línea nueva.
· Migración del carrito guardado en localStorage: items viejos sin
  `lineId` reciben `lineId = productId`. NO vaciar carritos existentes.
· `removeItem` / `updateQuantity` pasan a recibir `lineId`.

# 18. PRODUCT SHEET CON OPCIONES

· Solo se abre desde "+" si el producto tiene grupos de opciones.
  Sin opciones → agregar directo (comportamiento de 3A).
· `<fieldset>` + `<legend>` por grupo; radios si `max_select = 1`,
  checkboxes si > 1; al llegar a `max_select`, deshabilitar el resto con
  explicación ("Máximo 2").
· Required sin elegir: el botón "Agregar" NO se deshabilita en silencio.
  Al tocarlo: mensaje humano junto al grupo ("Elige el término de la
  carne"), foco al grupo, sacudida corta (sin animación con reduced motion).
· Precio en vivo en el botón: "Agregar · $32.000", con `aria-live="polite"`.
· Notas: `<label>` asociado, `maxLength=150`, contador "120/150".
· Precargar la última selección del mismo producto (desde el carrito).
· Teclado móvil: `useVisualViewport` ajusta el alto del sheet cuando
  `visualViewport.height` cambia, y el footer con "Agregar" queda visible
  (`position: sticky; bottom: 0` dentro del sheet).

# 19. IMPACTO FUERA DE ESTA PANTALLA (3B)

· Carrito: mostrar opciones y notas por línea (LOOP_CLIENT_04).
· Checkout: enviar `options`/`notes`; total del servidor.
· Restaurante (pedidos) y Admin (detalle de pedido): mostrar opciones y notas.
· Admin/Restaurante: CRUD de grupos y opciones (puede ser LOOP propio).

---

# 20. A11Y ESPECÍFICA

· Hero: `alt` de portada descriptivo; logo duplicado `alt=""`.
· Rating: `aria-label="Calificación 4.9 de 5, 7 reseñas"`; "Nuevo" si 0.
· Favorito del hero: `aria-pressed` + label con el nombre (patrón CLIENT_01).
· Navegación de categorías: `<nav aria-label>` + `aria-current` (sección 5).
· Fila de producto: `<article aria-labelledby>` dentro de `<li>` de una lista por sección.
· Botón "+": `aria-label="Agregar Costilla BBQ al carrito, $28.000"`.
· Stepper: "Quitar una Costilla BBQ" / "Agregar otra Costilla BBQ", y la
  cantidad con `aria-live="polite"`.
· No disponible: `disabled` real + motivo visible ("Agotado"/"Cerrado") incluido en el nombre accesible.
· BottomSheet: sección 12.
· Toast al agregar: `role="status"` (ya lo tiene).
· Banner de cerrado: `role="status"`.
· Íconos decorativos `aria-hidden`.
· Touch targets ≥ 44 px (el stepper hoy usa `h-8 w-8` con `touch-target`: verificar área real).

---

# 21. PERFORMANCE

· `IntersectionObserver` (no listeners de `scroll` sin throttle).
· Un solo observer para todas las secciones.
· Imágenes lazy + tamaño reservado. CLS < 0.1.
· `useProductById(cart[0])` hace una query extra solo para saber el
  restaurante del carrito: documentar; se resuelve en 3B guardando
  `restaurantId` en el carrito.
· Sin dependencias nuevas.

---

# 22. CONSOLE CLEAN

Abrir un restaurante, navegar categorías, agregar, abrir y cerrar sheets,
cambiar de restaurante con carrito, volver.

```text
0 errores
0 warnings de React / keys / act()
```

---

# 23. BUILD / LINT / TYPECHECK

```bash
npm run build
npm run lint        # = tsc --noEmit (no hay ESLint)
npm run type-check
```

---

# 24. TESTS

## Fase 3A
```text
Unit:   useScrollSpy con IntersectionObserver simulado
Unit:   CartContext.addItem no muta el estado anterior
Unit:   ProductImage cae al placeholder con onError
Unit:   BottomSheet: foco inicial, trap con Tab/Shift+Tab, foco vuelve al cerrar
Integr: "+" en producto → item en CartContext + toast
Integr: producto agotado / restaurante cerrado → botón deshabilitado
Integr: tap en chip → scrollIntoView de su sección
Integr: 404 → CTA "Explorar restaurantes"
Integr: error de red → "Reintentar" llama reload() (no window.location.reload)
Integr: recomendados vacíos → sección oculta
```

## Fase 3B (cuando se apruebe)
```text
Unit:   calculateItemPrice(base, selections) — combinaciones
Unit:   validateRequiredOptions(groups, selections) → { valid, missing[] }
Unit:   hashPersonalization determinístico (orden de opciones, trim de notas)
Unit:   migración de carrito viejo (sin lineId)
Integr: "+" con opciones → sheet; sin opciones → directo
Integr: required faltante → mensaje + foco al grupo
Integr: misma personalización suma; distinta crea línea nueva
Integr: reabrir sheet precarga la última selección
```

E2E: no hay infraestructura. NO instalarla.

---

# 25. QA CRÍTICO

## Fase 3A
1. Abrir detalle con menú cargado
2. Hero completo: portada, nombre, rating, envío, abierto/cerrado
3. Scroll → aparece barra compacta con volver + nombre + rating
4. Chips de categorías visibles y scrolleables
5. Scroll de la lista → chip activo cambia
6. Tap en chip → scroll a esa categoría, sin quedar tapada por el header
7. "+" → agrega directo con check + toast
8. Producto en carrito → stepper con cantidad; − hasta 0 lo quita
9. Producto agotado → deshabilitado con "Agotado"
10. Restaurante cerrado → banner + botones deshabilitados, menú navegable
11. Recomendados solo si el Admin configuró productos destacados de este restaurante
12. Barra flotante aparece con 1 item y actualiza el total
13. Tap en barra flotante → /app/cart
14. Último producto visible con la barra flotante abierta
15. 3G lento → skeleton sin salto de layout
16. Error de red → Reintentar recarga solo los datos
17. Restaurante inexistente → 404 con "Explorar restaurantes"
18. Imagen rota → placeholder
19. Volver atrás → el carrito se mantiene
20. Agregar de otro restaurante con carrito activo → confirmación (ya existe)
21. Sheets (producto, filtros, logout) con foco atrapado y devuelto
22. Consola limpia

## Fase 3B
23. Cambiar tamaño → precio cambia
24. Extras → precio suma
25. Required sin elegir → mensaje humano
26. Notas → llegan al carrito
27. Reabrir sheet → precarga
28. Teclado abierto en notas → "Agregar" visible
29. Pedido creado → el restaurante ve opciones y notas; total recalculado en servidor

---

# 26. CRITERIOS DE ÉXITO

## Fase 3A
☐ `RestaurantDetailPage` ≤ 300 líneas
☐ Hero conservado (sin cambiar gradiente ni scrim)
☐ Header compacto sticky con volver siempre visible
☐ Categorías como navegación (no filtro) con scroll spy
☐ Tap en chip → scroll a la sección con offset correcto
☐ Reduced motion respetado en scroll y transiciones
☐ Recomendados desde promociones del Admin, ocultos si no hay
☐ "+" con 3 estados: agregar / en carrito (stepper) / deshabilitado
☐ Feedback al agregar: check + toast (+ vibración si existe)
☐ Producto agotado y restaurante cerrado deshabilitados con motivo
☐ Banner de cerrado sin inventar horario
☐ `ProductImage` con fallback `onError`
☐ CartFloatingBar verificada, sin tapar el último producto
☐ Skeleton único con geometría real, CLS < 0.1
☐ Error con retry vía `reload()`
☐ 404 con "Explorar restaurantes"
☐ `addItem` inmutable
☐ BottomSheet: foco inicial, trap, retorno, `aria-labelledby`, botón cerrar
☐ `aria-label` del "+" con nombre y precio
☐ Sin componentes paralelos, sin dependencias nuevas
☐ Consola limpia
☐ Build, lint (tsc) y tests OK
☐ Lighthouse a11y ≥ 95 y Axe 0 críticas (validación de Jorge)
☐ Sin regresiones en Home, Restaurantes, Carrito, Checkout

## Fase 3B (después de aprobación)
☐ Plan de migración aprobado por Jorge
☐ Migraciones aplicadas (un concepto por migración) + advisors limpios
☐ Precio recalculado en servidor
☐ `calculateItemPrice` única en frontend
☐ `lineId` determinístico + migración del carrito existente
☐ Sheet con fieldset/legend, min/max/required, precio en vivo, notas con contador
☐ Teclado móvil resuelto con `visualViewport`
☐ Opciones y notas visibles para restaurante y admin

---

# 27. REPORTE FINAL

Entregar en `docs/loops/LOOP_CLIENT_03_REPORTE.md` (uno por fase):

IMPLEMENTADO — resumen técnico.

ARCHIVOS MODIFICADOS / CREADOS / ELIMINADOS — lista exacta.

FUENTE DEL MENÚ — hooks y tablas.

MODELO DE PRODUCTO — campos hoy (y después de 3B).

CÁLCULO DE PRECIO — dónde vive y qué valida el servidor.

HASH DE PERSONALIZACIÓN — (3B) cómo se genera y dónde se usa.

BOTTOM SHEET — cambios de a11y y qué sheets se probaron.

FEEDBACK AL AGREGAR — cómo se comunica.

SCROLL SPY Y STICKY HEADER — implementación.

A11Y — roles, `aria-*` y focus management por componente.

MOBILE KEYBOARD — (3B) cómo se resolvió.

SEGURIDAD — resultado de la verificación de precios en servidor (2.4).

TESTS

```text
Build:     OK / FAIL
Lint:      OK (tsc) / FAIL
Typecheck: OK / FAIL
Tests:     OK / FAIL  (antes N / después M)
```

QA — casos validados y pendientes de Jorge.

PROBLEMAS ENCONTRADOS — fuera de alcance.

DEUDA TÉCNICA GENERADA.

PREPARACIÓN PARA LOOP_CLIENT_04 — Carrito QA + UX refinado.

---

# 28. LO QUE NO DEBES HACER

· NO escribir código de 3B sin plan de migración aprobado.
· NO inventar variantes, extras, notas, horarios ni logos en frontend.
· NO crear un segundo CartContext, BottomSheet, Toast, Stepper ni modelo de producto.
· NO calcular el precio en más de un lugar.
· NO confiar en precios enviados por el cliente cuando existan opciones.
· NO obligar a pasar por un sheet a productos sin opciones.
· NO usar `role="tablist"` para navegación por scroll.
· NO cambiar el gradiente ni el scrim del hero.
· NO migrar el coral (LOOP_CORAL).
· NO cambiar la clave de localStorage del carrito ni vaciar carritos existentes.
· NO romper Home, Restaurantes, Carrito, Checkout ni BottomNav.
· NO instalar librerías de UI, focus trap, intersection observer o animación.
· NO tocar `sw.ts`, manifest ni rutas.
· Archivos ≤ 300 líneas.

---

# 29. REGLA FINAL

El Detalle del Restaurante es donde el usuario decide QUÉ pedir.

Si el menú es difícil de navegar, si el "+" no da feedback claro, o si
agregar un producto confunde, el usuario abandona.

Prioridad:

CLARIDAD → VELOCIDAD PERCIBIDA → CORRECCIÓN → A11Y → ESTÉTICA

Si un producto no tiene opciones, NO lo fuerces por un sheet.
Agregar directo con un check es mejor que un sheet vacío.

Si un dato no existe en el modelo (variantes, horario, logo):

no lo inventes en la pantalla.

Y si un precio lo calcula el cliente:

el servidor tiene la última palabra.
