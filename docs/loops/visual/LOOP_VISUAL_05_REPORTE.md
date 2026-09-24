# LOOP_VISUAL_05 — Reporte final

### IMPLEMENTADO
Sistema tipográfico con carácter para el módulo cliente y los componentes compartidos: tracking y leading explícitos en todos los tamaños, `text-display` para 4 momentos, `tabular-nums` en todas las cifras, cuerpo mínimo de 12px y criterio Sora vs Inter documentado.

### ARCHIVOS MODIFICADOS (28)
`tailwind.config.ts`, `src/styles.css`, `src/design-system/index.ts`, 3 archivos de admin (solo tamaño <12px), y 21 archivos del módulo cliente y compartidos (`RestaurantHero`, `CartPage`, `CheckoutPage`, `OrderSuccessView`, `OrderCard`, `OrderDetailPage`, `NotificationBell`, `NotificationsPage`, `BottomNav`, `QuantitySelector`, etc.).

### ARCHIVOS CREADOS (4)
`docs/design-system/TYPOGRAPHY.md`, `docs/loops/visual/LOOP_VISUAL_05.md`, `src/design-system/typography.test.ts`, `src/design-system/typographyApplication.test.ts` (más este reporte).

### ARCHIVOS ELIMINADOS (1)
`src/design-system/tokens/typography.ts` (duplicado; su re-export en `design-system/index.ts` también).

### FONTSIZE / TRACKING — ANTES → DESPUÉS
| Token | Antes (tracking) | Después (tracking) |
|---|---|---|
| 2xs | — | +0.02em |
| xs | — | +0.01em |
| sm, base | — | 0 |
| lg | — | -0.005em |
| xl | -0.01em | -0.015em |
| 2xl | -0.02em | -0.015em |
| 3xl | -0.02em | -0.02em |
| 4xl | -0.03em | -0.03em |
| display (nuevo) | — | -0.03em (28/32) |

### TABULAR-NUMS
- Antes: 6 líneas en 5 archivos. Después: 42 líneas en 23 archivos (módulo cliente y compartidos). Pendientes en el alcance: 0.

### TEXTOS < 12PX
- Antes: 20 usos. Después: 0. Badges numéricos agrandados: 5. No agrandados: 0.

### MOMENTOS DISPLAY
Nombre del restaurante (`RestaurantHero`), total del carrito, total del checkout, "Pedido confirmado".

### JERARQUÍA DE TÍTULOS
`text-xl`: Home, Categoría, 404. `text-lg`: Carrito, Checkout, Mis Órdenes, Restaurantes, Detalle de pedido, Cuenta, Notificaciones. "Pedido confirmado" pasa a display. `OrderCard` h3 → h2.

### AJUSTE DE COLOR POR COHERENCIA DE A11Y
Hora de `NotificationsPage`: `text-gray-300` → `text-gray-500` (y 11px → 12px).

### TESTS
```
Build:      OK
Lint:       OK (tsc)
Typecheck:  OK
Tests:      OK — 34 archivos / 241 (antes 32 / 220)
```
- **`typographyApplication.test.ts` (7 tests, pasan):** incluye el que blinda `tabular-nums` en todo `{formatCOP(` del cliente y compartidos, y el de jerarquía de títulos (`text-xl` / `text-lg`).
- **`typography.test.ts` (14 tests, pasan):** escala completa, familias, sin `typography.ts` ni `font-mono`.

### QA
Validados en navegador (rutas `/qa` temporales, ya retiradas): Home, detalle de restaurante, carrito, checkout. Pendientes de Jorge con sesión: Pedido confirmado, Mis Órdenes con datos, notificaciones, contador de cuenta, Lighthouse Accessibility.

### DEUDA TÉCNICA GENERADA
1. **`h3` sin `h2` en `ExploreFilterSheet`** (2 encabezados) → **LOOP_A11Y_01**. No se tocó.
2. **Hora en `OrderStatusTimeline` en `text-gray-400`** (bajo contraste) → **LOOP_VISUAL_04B**. No se tocó (solo se le añadió `tabular-nums`).
3. **Tipografía de admin, restaurante, domiciliario y auth** (tabular-nums, jerarquía) → **LOOP_VISUAL_05B**. Solo se subieron a 12px los 9 textos de admin que estaban por debajo.
4. **Axe no instalado** → LOOP_QA_TOOLING. Sustituto: Lighthouse Accessibility (lo corre Jorge).

### PREPARACIÓN PARA LOOP_VISUAL_07
`text-display` y la escala con tracking explícito quedan listas para animaciones de números (totales, contadores) sin saltos de ancho.
