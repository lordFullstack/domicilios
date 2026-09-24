# LOOP_VISUAL_08 — Reporte final

### IMPLEMENTADO
Sistema de estados con narrativa para el módulo cliente y compartidos: `EmptyState` (ilustración obligatoria), `ErrorState`, `LoadingState` y `Spinner` únicos, y el copy de la tabla aprobada en `src/shared/constants/stateCopy.ts`. Ilustraciones: solo las 6 existentes (`idle` donde no hay una específica).

### ARCHIVOS CREADOS
- Componentes: `ErrorState.tsx`, `LoadingState.tsx`, `Spinner.tsx`.
- Copy: `src/shared/constants/stateCopy.ts` (no hay i18n en el proyecto).
- Docs: `docs/design-system/STATES.md`, este reporte, `LOOP_VISUAL_08.md`.
- Tests: `ErrorState.test.tsx`, `LoadingState.test.tsx`, `Spinner.test.tsx`, `stateCopy.test.ts`, `emptyStates.test.ts`, `statesRules.test.ts`.

### ARCHIVOS MODIFICADOS
`EmptyState` (+ test), `ErrorBoundary`, `NotFound`, `NotificationsPage`, `NotificationBell`, `OrderItemsList`, `CartPage`, `CheckoutPage`, `OrdersPage`, `RestaurantListPage` (+ test), `RestaurantsGrid`, `CategoryResultsPage`, `RestaurantDetailPage`, `RestaurantLoadError`, `OrderDetailPage`, `DeliveryTrackingSection`, `ProtectedRoute`, `router/index.tsx`, `illustrations.test.tsx`, `typographyApplication.test.ts`.

### EMPTY STATES
- Antes: 11 (3 con ilustración). Después: 11 (11 con ilustración, sin `icon`).
- Tabla aplicada: carrito (`emptyCart`, unificado en Carrito y Checkout), sin pedidos (`idle`), sin resultados (`noResults`), sin restaurantes (`confused`, sin CTA por LOOP_CLIENT_06), menú en preparación (`idle`), categoría vacía (`noResults`), notificaciones (`idle`, 2 pestañas y popover `sm`).
- CTAs "Explorar restaurantes" ahora llevan a `/app/restaurants` (antes al Home).

### ERROR STATES
- Antes: 3 estilos y "Algo salió mal" duplicado. Después: 1 (`ErrorState`), sin duplicados.
- Migrados (6 sitios): `ErrorBoundary`, `RestaurantLoadError` (3 causas), error de `RestaurantsGrid`, `RestaurantDetailPage` (4: carga restaurante, no encontrado, no disponible, carga menú), `NotFound` (sin reintento, CTA según sesión), `OrderDetailPage` (pedido no encontrado).
- Ilustración: `sad` por defecto; `confused` en 404 y "no encontrado".

### LOADING STATES
- Antes: skeleton + texto + 2 spinners. Después: `Skeleton` (dentro de `LoadingState`) y `Spinner`.
- Sustituciones: `OrdersPage`, `OrderDetailPage`, `OrderItemsList`, `DeliveryTrackingSection` → `LoadingState` con skeleton; `ProtectedRoute` y `PageLoader` → `LoadingState fullScreen` (Spinner).

### SPINNER
- Antes: 2 estilos (`Loader2` suelto y un `div` con borde animado). Después: 1 (`Spinner`, `Loader2` de lucide). `Loader2`/`animate-spin` solo quedan en `Spinner` y en `Button` (indicador interno del botón).

### COPY
Duplicados unificados (carrito ×2, "Algo salió mal" ×2, "No hay / Sin / Todavía no hay productos" → "Menú en preparación"). Voz: tuteo, sin exclamaciones, sin "lo sentimos", sin tecnicismos (blindado por test).

### AJUSTES FUERA DE LA TABLA
- `ErrorState fullScreen` usa `text-xl` para el título (jerarquía de LOOP_VISUAL_05: 404 = título de pantalla); el test de tipografía ahora comprueba que `NotFound` usa `ErrorState`.
- Los CTAs de `EmptyState` y `ErrorState` van centrados (antes salían pegados a la izquierda).
- El "Sin conexión" de `RestaurantLoadError` (`network`) ahora dice "No pudimos cargar los restaurantes / Revisa tu conexión e intenta de nuevo" (copy de la tabla), no "Sin conexión".

### A11Y
`EmptyState` `role="status"`; `ErrorState` `role="alert"` (título `h1` solo en pantalla completa); `LoadingState` `role="status"` con `aria-label`; `Spinner` y las ilustraciones son decorativos (`aria-hidden`).

### TESTS
```
Build:      OK
Lint:       OK (tsc)
Typecheck:  OK
Tests:      OK — 42 archivos / 358 (antes 36 / 270)
```

### QA
En navegador (rutas `/qa` temporales, retiradas): "Aún no tienes pedidos" con `idle` y CTA a `/app/restaurants`; 404 con `confused` y "Iniciar sesión". El resto se cubre con los tests de reglas.
**Pendientes de Jorge (con sesión):** pedido no encontrado, notificaciones vacías (2 pestañas) y popover de la campana, `ErrorBoundary` forzado, errores de carga reales, carga de pedido/mapa, Lighthouse Accessibility.

### PROBLEMAS ENCONTRADOS
- `OrderDetailPage` sigue con "Orden…" en otros textos internos (fuera de la tabla).
- El `Loader2` del `Button` sigue siendo un spinner inline propio del botón (permitido por el test).

### DEUDA TÉCNICA GENERADA
- **LOOP_VISUAL_08B:** estados de admin, restaurante y domiciliario (sus `Loader2` y ~17 textos "No hay…").
- **LOOP_VISUAL_03B:** 4 ilustraciones nuevas (NoOrders, NoFavorites, Location, NoConnection): cambiar el nombre en `stateCopy.ts`.
- **LOOP_CLIENT_06:** selector de dirección ("Sin restaurantes" sin CTA).
- **LOOP_QA_TOOLING:** Axe.

### PREPARACIÓN PARA LOOP_VISUAL_07
Los estados tienen estructura estable (ilustración → título → descripción → CTA) y componentes únicos donde animar entradas.
