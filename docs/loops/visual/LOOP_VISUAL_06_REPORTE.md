# LOOP_VISUAL_06 — Reporte final

### IMPLEMENTADO
Sistema de elevación cálido y documentado, vidrio único (`.glass` + `.glass--bar`), `card-surface` / `card-surface--flat` / hairline según clasificación, escala de `z-index` con `z-60` para los avisos, grano sutil en los héroes de marca, overlays de foto unificados en `ImageOverlay`, `BottomNav` más ligero y sombras fuera de sistema corregidas.

### ARCHIVOS CREADOS
`src/shared/components/GrainOverlay.tsx`, `docs/design-system/ELEVATION.md`, `docs/loops/visual/LOOP_VISUAL_06.md`, este reporte; tests: `elevation.test.ts`, `depthMigration.test.ts`, `GrainOverlay.test.tsx`.

### ARCHIVOS MODIFICADOS
`tailwind.config.ts`, `styles.css`, `vite.config.ts` (solo `test.css`, para leer `styles.css?raw` en tests), `ImageOverlay` (+ test), `BottomNav`, `ConnectionBanner`, `Toast`, `UpdatePrompt`, `DeliveryLiveMap`, `InstallAppCard`, `HomeHeroBanner`, `RestaurantHero`, `RestaurantCompactHeader`, `MenuCategoryNav`, `PromoBanner`, `AddressCard`, `CategoryResultsPage`, `OrderSummaryCard`, `OrderSuccessView`, `OrderStatusTimeline`, `ClientAccountPage`, `DeliveryTrackingSection`, `CartPage`, `CheckoutPage`, `OrderDetailPage`, `LoginPage`, `RegisterPage`, `restaurant/DashboardPage`.

### SOMBRAS — ANTES / DESPUÉS
| Token | Antes | Después |
|---|---|---|
| `sm` | `rgba(15,23,42,…)` frío | `rgba(28,25,23,…)` cálido |
| `bottom-sheet` | `0 -8px 32px rgba(15,23,42,.14)` | `0 -8px 32px rgba(28,25,23,.14)` |
| `card`, `card-hover`, `floating`, `hairline` | cálidos | sin cambio |
| `bottom-nav` | — | nuevo: `0 -4px 16px rgba(28,25,23,.08)` (solo `BottomNav`) |

### TOKENS ELIMINADOS
`xs`, `premium`, `glow-primary` (sombras) y `mesh-hero` (fondo). Sin referencias restantes (blindado por test).

### CARDS
- **A — `card-surface` (2):** `AddressCard`, `CategoryResultsPage` (cards de producto).
- **A' — `card-surface--flat` (8 usos):** `OrderSummaryCard`, `OrderSuccessView`, `OrderStatusTimeline`, `InstallAppCard`, `ClientAccountPage` (4 filas).
- **B — solo hairline (5 usos):** `DeliveryTrackingSection`, `CartPage` filas, `CheckoutPage` (opción de pago y resumen), `OrderDetailPage`.
- **C — sin cambio:** skeletons, dropdown de notificaciones, mapa, barras fijas, divisores, ítems de notificación con borde de estado.
- Ningún caso quedó sin poder migrarse.

### VIDRIOS UNIFICADOS
`RestaurantCompactHeader` (conserva `shadow-sm`) y `MenuCategoryNav` pasan a `.glass--bar` (72%, borde solo inferior). Legibilidad verificada (no se sube a 0.80).

### Z-INDEX
Escala `z-0`…`z-60` documentada en `ELEVATION.md`; `z-60` agregado a `tailwind.config.ts` y aplicado a `ConnectionBanner`, `Toast` y `UpdatePrompt`. Modales, `BottomSheet` y dropdown siguen en `z-50`; `BottomNav` en `z-40`. (Nota: la aplicación de `z-60` no estaba en el listado de la sub-tanda 2.3 pero sí en el LOOP; se incluyó en el cierre.)

### GRANO
`GrainOverlay` + clase `.grain-overlay`: ruido SVG `feTurbulence` inline (data URI), `opacity` 0.04, `mix-blend-mode: overlay`, estático, `aria-hidden`, `pointer-events-none`. Aplicado en el hero del Home siempre y en el hero del restaurante solo sin portada ni foto real (`image_url` no http). Verificado en navegador: opacidad 0.04, blend overlay, no bloquea clicks.

### OVERLAYS UNIFICADOS
`ImageOverlay`: `bottom-gradient` (0.90 → transparente al 60%) para `RestaurantHero`; `bottom-soft` (0.60 → transparente al 60%) nuevo para `PromoBanner` (overlay hermano + texto encima) y para el Dashboard del restaurante.

### SOMBRAS FUERA DE SISTEMA CORREGIDAS
`RestaurantHero` avatar (`shadow-md` → `shadow-card`; el `drop-shadow` del texto se mantiene por legibilidad), `LoginPage` y `RegisterPage` (`shadow-lg shadow-primary/25` → `shadow-floating`), `DeliveryLiveMap` (sombra en línea → `shadow-card`).

### BOTTOMNAV
`.glass` + `shadow-bottom-nav` (16px, ascendente). Verificado en navegador: `0 -4px 16px rgba(28,25,23,.08)`, `z-index` 40, se separa del contenido y se lee bien.

### TESTS
```
Build:      OK
Lint:       OK (tsc)
Typecheck:  OK
Tests:      OK — 45 archivos / 403 (antes 42 / 358)
```

### QA
Validados en navegador (rutas `/qa` temporales, retiradas): hero, header compacto y `MenuCategoryNav` sobre el menú, cards de producto de categoría, filas de cuenta, `AddressCard` en checkout, `LoginPage`, grano y `BottomNav` en el Home. **Pendientes de Jorge (con sesión):** `OrderSummaryCard` y `OrderStatusTimeline` (detalle de pedido), `PromoBanner`, Dashboard del restaurante, marcador del mapa, avisos (`ConnectionBanner`/`Toast`/`UpdatePrompt`) sobre un modal, hero del restaurante sin foto (grano), Lighthouse Accessibility.

### PROBLEMAS ENCONTRADOS
- En el hero del restaurante sin foto el fondo es `bg-primary/10` (no el degradado atardecer); el grano se aplica igual al ser fondo de marca.
- El panel de resumen del checkout (solo hairline) se ve más plano que las cards elevadas.

### DEUDA TÉCNICA GENERADA
- `design-system/primitives/Button.tsx` (3 sombras propias; esa carpeta no se importa en la app).
- Axe → LOOP_QA_TOOLING.
- Sombras con `drop-shadow` estándar en textos sobre foto (se mantienen a propósito).

### PREPARACIÓN PARA LOOP_VISUAL_07
Elevación, capas y vidrio quedan como sistema estable sobre el que animar (hover/press de `card-surface`, entradas de avisos en `z-60`).
