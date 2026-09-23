# LOOP_VISUAL_04 — Reporte final

### IMPLEMENTADO
Disciplina de color: coral eliminado salvo la insignia "Oferta" (`FeaturedSection`); precios/totales en `ink` / `brand-700`; botones "+" en `brand-700`; notificaciones en `danger`; `theme_color` = `#1C2459`; estados suaves con opacidades `/10`; variantes de `Button` `solid`, `tertiary`, `dangerOutline`; criterio de CTA aplicado al módulo cliente; `docs/design-system/COLORS.md`.

### ARCHIVOS CREADOS
`docs/design-system/COLORS.md`, `src/design-system/colorSystem.test.ts`, `docs/loops/visual/LOOP_VISUAL_04.md`, este reporte.

### DECISIONES
- Coral: 21 usos migrados; `Badge` promo → `bg-brand-50 text-brand-700`; ícono llama → `brand-700`.
- `danger` sin `danger-strong`: reglas en COLORS.md. 12 usos `text-xs` → `text-sm`. Botones con fondo `danger` y texto blanco en `font-bold` (todos `text-base`, 16px; ver abajo).
- `text-success`/`text-warning` → variantes `-strong`.
- `info`: sin usos reales → variante de `Badge` eliminada, token DEPRECATED.
- Aliases `primary`/`secondary`/`primary-dark`/`ink-muted` intactos → LOOP_VISUAL_04B.

### BOTONES DANGER — TAMAÑO
`CancelOrderSheet`, `CartPage` (vaciar), `LogoutConfirmSheet`, `ConfirmDialog` y `OrderDetailPanel` usan `Button` con size `md` = `text-base` (16px) bold → texto grande bold, pasa AA (3.76:1 ≥ 3:1). El `Button` de `design-system/primitives` (`sm`/`md` = `text-sm`) no tiene ningún importador.

### TESTS
```
Build:  OK    Lint (tsc): OK    Tests: 205/205 (30 archivos; antes 201/29)
```
`grep coral src/` → solo `FeaturedSection:73`. `text-danger.*text-xs` → 0 en la app (1 en el test).

### QA VISUAL (navegador, rutas /qa temporales ya retiradas)
OK: Home, detalle de restaurante, carrito, checkout, pedidos (vacío), 404. Sin regresiones visibles.

### VERIFICACIÓN MANUAL PENDIENTE
El usuario debe verificar manualmente (con sesión activa):
- [ ] Notificaciones: fondos danger/10, puntos danger
- [ ] Contador de cuenta: bg-danger
- [ ] Pedidos con estados (Pendiente/Completado/Cancelado)
- [ ] Cualquier otro uso de danger en pantallas autenticadas

No bloquea el commit.

### DEUDA / PARA 04B
- Migración de aliases (~400 usos).
- Revisión de CTAs admin/restaurante/domiciliario/auth (~90 botones).
- Axe no corrido (no instalado en el repo).
- Blanco sobre coral (3.03:1) en la insignia "Oferta" (`text-[10px]` bold): excepción conocida.
