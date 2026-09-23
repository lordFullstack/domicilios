# LOOP_CLIENT_03 — Reporte final (FASE 3A)

> Fase 3B (variantes, extras, notas) NO se ejecutó: requiere plan de migración aprobado.

## Implementado
Menú navegable de una sola lista con scroll spy, header compacto sticky, 3 estados del botón "+", feedback al agregar (check + toast + vibración), banner de cerrado, recomendados desde promociones del Admin, fallback de imágenes, BottomSheet accesible (foco, trap, retorno, X), skeleton con geometría real, errores con retry sin recargar la app y 404 útil. `RestaurantDetailPage` bajó de 386 a 244 líneas. Sin dependencias nuevas, sin tocar BD.

## Bugs corregidos
1. **"Vaciar y agregar" no vaciaba el carrito.** `clear()` y `addItem()` en el mismo evento leían el `cart` del render anterior: addItem volvía a meter los productos del otro restaurante. Reproducido con test sobre el código viejo (falla) y corregido con un ref síncrono en CartContext.
2. `addItem` mutaba el estado (`existing.quantity += quantity`) → ahora inmutable.
3. Error de carga usaba `window.location.reload()` → ahora `reload()` del hook (`useRestaurantById` y `useProducts` lo exponen; también limpian el error al reintentar con éxito).
4. 404 solo ofrecía "Volver al inicio" → ahora "Explorar restaurantes" + "Volver al inicio".
5. `ProductImage` sin `onError` → cae al placeholder.
6. Favorito del hero con hex en línea y sin `aria-pressed` → patrón de CLIENT_01, con toast si falla.

## Archivos modificados
- src/features/client/pages/RestaurantDetailPage.tsx
- src/features/client/CartContext.tsx
- src/features/client/components/MenuProductCard.tsx
- src/features/client/components/FeaturedProductStrip.tsx
- src/features/client/components/ProductDetailSheet.tsx
- src/features/client/components/RestaurantDetailSkeleton.tsx
- src/features/client/components/CartFloatingBar.tsx
- src/shared/components/BottomSheet.tsx
- src/shared/components/ProductImage.tsx
- src/shared/components/QuantitySelector.tsx
- src/hooks/useLocalData.ts (reload en useRestaurantById/useProducts)

## Archivos creados
- components: RestaurantHero, RestaurantCompactHeader, RestaurantClosedBanner, MenuCategoryNav, MenuSection, CartSwitchSheet
- hooks: useScrollSpy, useStickyHeader, useMenuCart, useAddedFlash
- tests: CartContext.test.tsx, BottomSheet.test.tsx, ProductImage.test.tsx, useScrollSpy.test.ts, RestaurantDetailPage.test.tsx
- docs/loops/LOOP_CLIENT_03.md

## Fuente del menú
`useRestaurantById(id)` + `useProducts(id)` (Supabase directo con caché IndexedDB offline). Recomendados: `usePromotions('featured_product')` filtrado por `active` y por productos de este restaurante (máx. 6).

## Modelo de producto
Sin cambios: id, restaurant_id, name, description, price, image_url, category, available. Sin options/variants/extras/notas.

## Cálculo de precio
Sin variantes no hay fórmula nueva: `product.price × cantidad` (CartContext.getTotal). La función única `calculateItemPrice` y la validación en servidor quedan para 3B.

## Hash de personalización
N/A en 3A (el carrito sigue indexado por productId).

## Bottom Sheet
Propio, sin librerías. Foco al panel al abrir, Tab/Shift+Tab atrapados, foco devuelto al abrir-quien, `aria-labelledby` al título (o `ariaLabel`), resto de la app `inert`, botón X visible + Escape + fondo. Afecta a todos los sheets de la app (filtros, logout, cambio de restaurante, producto).

## Feedback al agregar
"+" → la fila pasa al stepper y su "+" muestra un check ~600 ms; toast "X agregado al carrito" (`role="status"`); `navigator.vibrate(10)` si existe. La barra flotante se actualiza al instante.

## Scroll spy
Un `IntersectionObserver` para todas las secciones (franja bajo el header, -60% abajo). `select()` pausa el spy 800 ms durante el scroll programático para que el chip no "salte". Offset con `scroll-margin-top` en CSS. Reduced motion → scroll sin animación.

## Sticky header
Sentinela al final del hero + `IntersectionObserver` (callback ref). Barra fija con safe-area, `inert` y `aria-hidden` cuando está oculta, nombre como `<p>` (el h1 sigue en el hero). Chips pegados debajo.

## A11y
- Hero: portada con `alt="Portada de X"`, logo duplicado decorativo, rating con texto para lector ("Calificación 4.9 de 5, 7 reseñas").
- Categorías: `<nav aria-label="Categorías del menú">` + `aria-current` (no tablist: no hay paneles ocultos).
- Secciones: `<section aria-labelledby>` + `<h2>` + `<ul role="list">`; filas `<article aria-labelledby>`.
- "+": "Agregar Costilla BBQ al carrito, $28.000"; stepper: "Quitar Costilla BBQ del carrito" / "Quitar una unidad de…" / "Agregar otra unidad de…", cantidad con `aria-live`.
- Deshabilitado: botón `disabled` con "Costilla BBQ: agotado/cerrado".
- Banner cerrado `role="status"`; errores `role="alert"`; skeletons `role="status"`.
- CartFloatingBar: "Ver carrito, 3 productos, $45.000".
- Markup válido: nada de `<p>`/`<h3>`/`<div>` dentro de `<button>`.

## Mobile keyboard
N/A en 3A (no hay campos de texto en el sheet de producto). Queda para 3B (notas).

## Seguridad
No se pudo verificar desde aquí si Supabase recalcula `orders.total` / `order_items.unit_price` (el conector respondió sin permiso). Pendiente: correr en el SQL Editor la consulta de triggers sobre `orders` y `order_items`. Bloqueante para 3B.

## Tests
- Build: OK (tsc + vite build + dist/sw.js). Precache 983.99 → 994.16 KiB (+10 KiB).
- Lint: OK (tsc; no hay ESLint).
- Typecheck: OK.
- Tests: OK — 21 archivos, 129 tests (antes 16 / 109). 0 warnings.

## QA (casos 3A)
Cubiertos por tests: 1, 2 (rating), 6 (scroll llamado), 7, 8, 9, 10, 11, 17, 18, 20.
Revisados en código, confirmar en dispositivo: 3, 4, 5, 12, 13, 14, 15, 16, 19, 21.
Pendientes de Jorge: 22 (consola), Lighthouse, Axe, CLS medido, iPhone con notch (header compacto + chips).

## Problemas encontrados (fuera de alcance)
- Posible confianza en precios del cliente al crear pedidos + items sin transacción (ver Seguridad).
- `useProductById(cart[0])` hace una query extra solo para saber el restaurante del carrito.
- `useFavorites` por instancia (Home/Restaurantes: N queries).
- `useLocalData.ts` 1139 líneas.
- Coral en precios y botón "+" (LOOP_CORAL).

## Deuda técnica generada
- Tocar la fila abre el sheet informativo (decisión pendiente de confirmar; el prompt pedía agregar directo).
- Sin swipe-down en BottomSheet (se cierra con X, Escape o fondo).
- Banner de cerrado sin hora (no hay horarios en el modelo).
- `SPY_TOP_OFFSET` fijo en 120 px (no incluye safe-area superior; en iPhone con notch el chip activo puede cambiar unos px antes).

## Preparación para LOOP_CLIENT_04
- CartContext inmutable, con tope de 99 y operaciones encadenables en el mismo evento.
- `MAX_ITEM_QUANTITY` exportado para el stepper del carrito.
- BottomSheet accesible listo para confirmaciones del carrito (vaciar, eliminar).
- `useMenuCart` como referencia de lógica de carrito fuera de la página.
