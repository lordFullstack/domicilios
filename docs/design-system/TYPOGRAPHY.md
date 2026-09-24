# Tipografía — sistema

Introducido en LOOP_VISUAL_05. Fuente única: `tailwind.config.ts` (`fontFamily`, `fontSize`). No hay otro archivo de tokens tipográficos (se eliminó `src/design-system/tokens/typography.ts`).

## 1. Fuentes
Cargadas en `index.html` (Google Fonts, `display=swap`):
- **Inter** 400 / 500 / 600 / 700 → `font-sans` (por defecto en `body`)
- **Sora** 500 / 600 / 700 / 800 → `font-display`

JetBrains Mono **no se carga y no existe como token**. El `#orderId` usa Inter con `tabular-nums` y `tracking-[0.01em]`.

## 2. Sora vs Inter
- **Sora (`font-display`):** títulos de pantalla, títulos de sección, nombres en cards, precios grandes, totales y momentos display.
- **Inter (`font-sans`, por defecto):** body, labels, chips, botones, metadata y captions.
- Regla práctica: si el texto se lee como **titular o cifra protagonista** → Sora; si se lee como **información de apoyo** → Inter.

## 3. Escala (tamaño / leading / tracking)
| Clase | Tamaño | Leading | Tracking | Rol |
|---|---|---|---|---|
| `text-2xs` | 11px | 16px | +0.02em | Solo labels en MAYÚSCULAS técnicos (con `tracking-[0.08em]`) |
| `text-xs` | 12px | 18px | +0.01em | Captions, metadata, badges — **mínimo del cuerpo** |
| `text-sm` | 14px | 22px | 0 | Body secundario, botones pequeños, labels |
| `text-base` | 15px | 24px | 0 | Body principal |
| `text-lg` | 17px | 26px | -0.005em | Título de pantalla secundario (Carrito, Checkout, Órdenes…) |
| `text-xl` | 20px | 28px | -0.015em | Título de pantalla (Home, Categoría, Pedido confirmado, 404) |
| `text-2xl` | 24px | 32px | -0.015em | Títulos de sección grandes |
| `text-3xl` | 30px | 36px | -0.02em | Encabezados de hero |
| `text-4xl` | 36px | 40px | -0.03em | Encabezados de hero grandes |
| `text-display` | 28px | 32px | -0.03em | **Momentos display** (ver §5) |

Notas: `text-base` es 15px (no 16px). Tracking y leading viven en `fontSize`; no se repiten por componente y `h1`–`h6` de la base ya no fijan tracking propio.

## 4. Pesos
`font-medium` (500) · `font-semibold` (600) · `font-bold` (700) · `font-extrabold` (800, solo con Sora en display). Sin `font-light` ni `font-normal` explícitos.

## 5. Momentos display
`text-display font-display font-extrabold`, máximo 2 líneas (`line-clamp-2`). Son cuatro:
1. Nombre del restaurante en `RestaurantHero`
2. Total del carrito
3. Total del checkout
4. Título de "Pedido confirmado"

Si dudas si algo es un momento display: no lo es.

## 6. Cifras
`tabular-nums` en **todas** las cifras que cambian o se comparan: precios (`formatCOP`), cantidades, IDs, fechas, horas, contadores, timestamps y ETA. Clase por sitio (sin componente `<Money>`).

## 7. Cuerpo mínimo
12px (`text-xs`). Excepción: labels en mayúsculas de 11px (`text-2xs`) con `tracking-[0.08em]`. Un badge numérico que no admita 12px se agranda; si no puede, queda en 11px con `aria-label` en el elemento padre.

## 8. Jerarquía de títulos (módulo cliente)
- **Título de pantalla (`text-xl`):** Home, Categoría, Pedido confirmado, 404.
- **Título secundario (`text-lg`):** Carrito, Checkout, Mis Órdenes, Restaurantes, Detalle de pedido, Cuenta, Notificaciones.
- Un solo `h1` por pantalla; sin saltos de nivel (h1 → h3).
