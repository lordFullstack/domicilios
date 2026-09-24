# Elevación, vidrio y capas

Introducido en LOOP_VISUAL_06. Fuente: `tailwind.config.ts` (`boxShadow`, `zIndex`) y `src/styles.css` (`.glass`, `.glass--bar`, `.card-surface`, `.hairline`). Todas las sombras usan el gris cálido `rgba(28,25,23,…)`; no hay sombras frías ni valores en corchetes.

## 1. Escala de elevación
| Nivel | Token | Valor | Uso |
|---|---|---|---|
| 0 | — | sin sombra | Fondo, contenido base, filas de lista |
| 1 | `shadow-card` | `0 1px 2px .04, 0 4px 12px .06` | Cards en reposo (`card-surface`) |
| 2 | `shadow-card-hover` | `0 2px 4px .04, 0 12px 32px .10` | Hover / elemento activo (lo aplica `.card-surface:hover`) |
| 3 | `shadow-floating` | `0 8px 24px .12` | Lo que flota: carrito flotante, banners, toasts, hero |
| — | `shadow-hairline` | `inset 0 0 0 .5px .08` | Definición sin peso (la aplica `card-surface` en `::after`) |
| — | `shadow-sm` | `0 1px 2px .04, 0 1px 3px .06` | Sombra mínima de barras |
| — | `shadow-bottom-sheet` | `0 -8px 32px .14` | Solo el `BottomSheet` real |
| — | `shadow-bottom-nav` | `0 -4px 16px .08` | Solo el `BottomNav` (ascendente, más ligera) |

Eliminados por no tener usos: `xs`, `premium`, `glow-primary` y el fondo `mesh-hero`.
Regla: si una superficie no necesita elevarse, no se eleva (solo hairline).

## 2. Vidrio
- **`.glass`**: `rgba(255,255,255,.72)`, `blur(20px) saturate(180%)`, borde blanco de 1px. Para controles flotantes y superficies con marco (`BottomNav`, botones sobre foto).
- **`.glass--bar`**: mismo fondo y blur, **solo** `border-bottom: 1px solid rgba(28,25,23,.06)`. Para barras a ancho completo (`RestaurantCompactHeader`, `MenuCategoryNav`). Si la legibilidad sobre fotos no alcanza, el alfa sube de 0.72 a 0.80.
- No se usa `backdrop-blur` ni `bg-white/95` suelto: el vidrio es siempre una de estas dos clases.

## 3. Cards y bordes
- **A — card elevada:** `card-surface` (con `card-surface--static` si tiene botones propios).
- **B — solo hairline:** filas de lista y paneles dentro de otra card: `.hairline` (0.5px), sin sombra.
- **C — sin cambio:** skeletons, popovers con su propia elevación y otros casos con motivo documentado.
- Ya no se usa `border border-gray-100` + sombra como forma de card.

## 4. Capas (`z-index`)
| Capa | Uso |
|---|---|
| `z-0` | Contenido base |
| `z-10` | Elementos elevados dentro de cards (p. ej. el corazón) |
| `z-20` | `MenuCategoryNav` |
| `z-30` | `CartFloatingBar`, `RestaurantCompactHeader` |
| `z-40` | `BottomNav` |
| `z-50` | Modales, `BottomSheet`, dropdown de notificaciones |
| `z-60` | `ConnectionBanner`, `Toast`, `UpdatePrompt` (siempre sobre los modales) |

Tailwind trae `z-0`–`z-50`; `z-60` se agrega en `tailwind.config.ts`. No se usan valores arbitrarios.

## 5. Overlays de foto (`ImageOverlay`)
| Variante | Degradado | Uso |
|---|---|---|
| `bottom-gradient` | `rgba(0,0,0,.90)` → transparente al 60% | `RestaurantHero` |
| `bottom-soft` | `rgba(0,0,0,.60)` → transparente al 60% | `PromoBanner` |
| `full-soft` / `full-strong` | `black/15` / `black/45` | Velos completos |

Backdrop de modales y sheets: `bg-black/40`.

## 6. Grano
`GrainOverlay` (`src/shared/components/GrainOverlay.tsx`) pinta la clase `.grain-overlay` de `styles.css`: ruido SVG (`feTurbulence`, `baseFrequency` 0.8) como data URI, `opacity: 0.04`, `mix-blend-mode: overlay`. Sin archivos ni peso extra, estático (sin animación: `prefers-reduced-motion` no lo afecta), `aria-hidden` y `pointer-events-none`. Va dentro de un contenedor `relative` con `overflow-hidden`.

**Solo sobre fondos de marca, nunca sobre una foto:**
- Hero del Home (`HomeHeroBanner`, degradado atardecer): siempre.
- Hero del restaurante (`RestaurantHero`): solo si no hay portada ni foto real en `image_url` (con emoji o ícono de respaldo).

## 7. BottomNav
`.glass` + `shadow-bottom-nav` (`0 -4px 16px rgba(28,25,23,.08)`), en `z-40`. `shadow-bottom-sheet` queda para el `BottomSheet` real.
