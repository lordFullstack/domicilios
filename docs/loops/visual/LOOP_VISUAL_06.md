# LOOP_VISUAL_06 — Profundidad + Textura

**Categoría:** VISUAL
**Tipo:** Sistema visual / Elevación y capas
**Estado:** 🟡 Pendiente
**Objetivo:** Unificar el sistema de sombras (eliminar el frío), documentar la escala de elevación, unificar el vidrio, agregar un grano sutil al hero, limpiar tokens muertos y estandarizar los overlays de foto.
**NO ES SOBRE:** color (LOOP_VISUAL_04), tipografía (LOOP_VISUAL_05), iconografía (LOOP_ICONOS_01), motion (LOOP_VISUAL_07), app shell completo (LOOP_VISUAL_11), cambios de layout, features nuevas.
**Rama:** `loop/visual-06-profundidad` (crearla desde `main` antes de ejecutar).
**Ejecución:** sub-tandas — 2.1 fundamentos (config, `.glass--bar`, `ELEVATION.md`, tests) y las siguientes según la clasificación de cards; cada una con build + lint + tests y OK de Jorge.

> **AJUSTES CONFIRMADOS POR JORGE (24-sep-2026)** — mandan sobre cualquier otra
> sección de este documento:
> 1. **`BottomNav`:** token nuevo `bottom-nav` = `0 -4px 16px rgba(28,25,23,0.08)`, solo
>    para `BottomNav`. `bottom-sheet` se conserva (cálido) para el `BottomSheet` real.
> 2. **`.glass--bar`** (variante nueva): fondo `rgba(255,255,255,0.72)`, `blur(20px)
>    saturate(180%)`, borde solo inferior `1px solid rgba(28,25,23,0.06)`. En
>    `RestaurantCompactHeader` y `MenuCategoryNav`. Se verifica la legibilidad; si falla,
>    se sube el alfa a 0.80.
> 3. **Grano:** hero del Home (degradado atardecer): sí. Hero del restaurante: solo sin
>    foto (fondo de marca). **Nunca sobre una foto.**
> 4. **`ImageOverlay`:** variante nueva `bottom-soft` (`rgba(0,0,0,0.60)` → transparente
>    al 60%); `bottom-gradient` pasa a `rgba(0,0,0,0.90)` → transparente al 60%.
>    `PromoBanner` usa `bottom-soft`; `RestaurantHero` usa `bottom-gradient`.
> 5. **Clasificación de cards A / B / C** (archivo + línea + categoría) **antes de migrar**;
>    se reporta y se espera el OK de Jorge antes de tocar esos archivos.
> 7. **`card-surface--flat`** (variante nueva): nivel 1 + hairline en `::after`, **sin hover
>    y sin press**. Para paneles informativos que merecen elevación pero no son clickeables.
> 8. **Clasificación aprobada** (A / A' / B / C, tabla en la sección 8), sombras fuera de
>    sistema, vidrios y overlays según la sección 8.
> 6. **Correcciones:** `xs` se elimina (no se le cambia el color); `z-60` se agrega a
>    `tailwind.config.ts` (`zIndex` en `extend`).

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md` (plantilla maestra)
2. `docs/loops/visual/LOOP_VISUAL_08.md` (LOOP inmediatamente anterior — ya mergeado)
3. `docs/design-system/CARDS.md` (elevación y `card-surface`, que este LOOP extiende) y `COLORS.md`

No leas LOOPs más antiguos salvo que este LOOP lo requiera explícitamente.

---

## 1. ROL

Actúa como:

**Senior Product Designer (sistemas visuales) + Mobile UX + Frontend Engineer + Accessibility Specialist**

Continúa sobre el repositorio existente de Domicilios Riohacha. Los LOOPs anteriores construyeron iconografía, fotografía, ilustraciones, color, cards con elevación (`card-surface`), tipografía, un Home adaptativo y estados con narrativa. Este LOOP ordena las capas: cuánto se eleva cada cosa, qué queda encima de qué y qué textura tienen las superficies de marca.

---

## 2. REGLA ABSOLUTA

ANTES DE MODIFICAR: INSPECCIONA y reporta.

### Hallazgos de la inspección previa (24-sep-2026, sobre el repo real)

**Sombras (`tailwind.config.ts`, `boxShadow`)**

| Token | Valor | Usos |
|---|---|---|
| `xs` | `0 1px 2px rgba(15,23,42,.04)` (frío) | 0 |
| `sm` | `0 1px 2px …/.04, 0 1px 3px …/.06` (frío `15,23,42`) | 6 |
| `card` (nivel 1) | `0 1px 2px .04, 0 4px 12px .06` (cálido `28,25,23`) | 12 |
| `card-hover` (nivel 2) | `0 2px 4px .04, 0 12px 32px .10` | 3 |
| `floating` (nivel 3) | `0 8px 24px .12` | 14 |
| `hairline` | `inset 0 0 0 .5px rgba(28,25,23,.08)` | 0 en JSX (lo aplica `card-surface` vía `::after`) |
| `bottom-sheet` | `0 -8px 32px rgba(15,23,42,.14)` (frío) | 5 |
| `premium` | inset blanco + doble capa cálida | **0** |
| `glow-primary` | `0 8px 32px rgba(46,58,140,.28)` | **0** |

- **3 tokens muertos:** `xs`, `premium`, `glow-primary`. Más el fondo **`mesh-hero`** (`backgroundImage`, dos radiales tenues): sin ningún uso.
- **Frío vs cálido:** `xs`, `sm` y `bottom-sheet` usan `15,23,42`; el resto `28,25,23`.
- **Sombras fuera del sistema:** `RestaurantHero` (`shadow-md`, `drop-shadow`), `LoginPage` y `RegisterPage` (`shadow-lg shadow-primary/25`; `shadow-primary` no existe como token), `DeliveryLiveMap` (sombra en estilo en línea), `design-system/primitives/Button.tsx` (3 sombras propias; esa carpeta no se importa en la app).

**Vidrio y `backdrop-blur`**
- `.glass` (`styles.css`): `rgba(255,255,255,.72)`, `blur(20px) saturate(180%)`, borde blanco de 1px en los 4 lados. 7 usos en cliente y compartidos (`BottomNav`, `IconButton`, `GlassCard`, corazón de las cards, botones del hero).
- **Segundo vidrio distinto:** `bg-white/95 backdrop-blur` en `RestaurantCompactHeader` y `MenuCategoryNav`.
- `BottomSheet`: fondo sólido, sin vidrio. Header del Home: plano.
- `BottomNav`: `.glass` + `shadow-bottom-sheet` (32px de blur, pesado para una barra fija).

**Cards y bordes (cliente + compartidos)**
- **3 formas de definir una card:** `card-surface` (LOOP_VISUAL_10), `border border-gray-100` + `shadow-card`, y solo `border`.
- Bordes: `border-gray-100` ×30 (`border border-gray-100` en 22), `gray-200` ×6, `gray-300` ×5, `gray-50` ×3; `ring-1` ×4; `divide-*` ×4. Hairline de 0.5px solo en `card-surface`.
- Archivos con `border border-gray-100`: `AddressCard`, `DeliveryTrackingSection`, `OrderStatusTimeline`, `OrderSuccessView`, `OrderSummaryCard`, `RestaurantDetailSkeleton`, `CartPage`, `CategoryResultsPage` (2), `CheckoutPage` (2), `ClientAccountPage` (4), `OrderDetailPage`, `OrdersPage`, `DeliveryLiveMap`, `InstallAppCard`, `NotificationBell`, `NotificationsPage` (2).

**Capas (`z-index`)**
- Sin sistema documentado. En uso: `z-10` ×4, `z-20` ×1, `z-30` ×3, `z-40` ×3, `z-50` ×14.
- **`z-50` para todo lo flotante:** modales de admin y restaurante, `BottomSheet`, dropdown de notificaciones, `ConnectionBanner`, `Toast` y `UpdatePrompt`; los tres avisos comparten la franja superior con los modales.
- Otras: `CartFloatingBar` z-30, `RestaurantCompactHeader` z-30, `MenuCategoryNav` z-20, `BottomNav` z-40.

**Fondos y overlays**
- Gradientes: `brand-gradient` ×8 (CTAs, hero), `brand-gradient-soft` ×1; `bg-gradient-to-*` propios en login/registro y en overlays de foto. Sin patrón, ruido ni grano.
- Backdrops de modales: `bg-black/40` (BottomSheet, paneles y modales de admin), `bg-black/50` (`ProductFormModal`).
- Overlays de foto: `ImageOverlay` (3 variantes; solo lo usa `RestaurantHero`), pero `PromoBanner` (`from-black/60 via-black/10`) y `restaurant/DashboardPage` (`from-black/70 via-black/30 to-black/10`) tienen el suyo.

**Elevación**
- Consistente solo dentro de las cards de LOOP_VISUAL_10 (hover sube, press baja). El resto usa sombras fijas; el dropdown de notificaciones usa `card-hover` fijo.

**Documentación:** `CARDS.md` describe niveles y `card-surface`; no hay documento de elevación general ni escala de z-index.

NO inventes. Si algo no coincide con lo anterior al ejecutar, repórtalo antes de tocar.

### A reportar ANTES de tocar (pedido explícito)
- ¿Cuántas cards migran a `card-surface`?
- ¿Cuántas quedan solo con hairline?
- ¿Algún caso donde no se puede migrar?

---

## 3. NO CREAR UN SEGUNDO DE LO QUE YA EXISTE

- **Sombras:** los tokens `card`, `card-hover`, `floating`, `hairline`, `bottom-sheet` y `sm` se conservan (cálidos). No se crean niveles nuevos.
- **Vidrio:** `.glass` es el único; si un caso lo pide, una variante suya (`.glass--bar`, ver sección 6), no otro patrón.
- **Cards:** `card-surface` / `card-surface--static` y `.hairline` ya existen. No se crea otra clase de card.
- **Overlays de foto:** `ImageOverlay` ya existe; los overlays sueltos se reemplazan por él.
- **A crear (no existen):** `GrainOverlay.tsx`, `docs/design-system/ELEVATION.md` y la escala `zIndex` en `tailwind.config.ts`.

---

## 4. CONTEXTO ACTUAL

> **Correcciones a la inspección (confirmadas):** el token `xs` se **elimina** (0 usos), no se recolorea; `z-60` **no existe** en Tailwind y se agrega en `tailwind.config.ts` (`zIndex: { 60: '60' }` dentro de `extend`).

La app ya tiene un sistema de elevación para cards (LOOP_VISUAL_10), pero el resto de las superficies (barras, paneles, modales, avisos) usa sombras y capas sueltas: dos "grises" distintos en las sombras (frío y cálido), dos maneras de hacer vidrio, tres maneras de hacer una card, todo lo flotante en `z-50` y overlays de foto con valores propios. Las superficies de marca (los héroes de gradiente) son planas, sin la textura que da sensación de material.

---

## 5. PROBLEMAS A RESOLVER

### PROBLEMA 1 — Sombras frías y cálidas mezcladas
`xs`, `sm` y `bottom-sheet` usan el gris azulado `15,23,42`, fuera de la paleta cálida.

### PROBLEMA 2 — Tokens muertos
`xs`, `premium`, `glow-primary` (sombras) y `mesh-hero` (fondo) no tienen usos.

### PROBLEMA 3 — Sin escala de elevación documentada
Los niveles existen en el código pero no en un documento.

### PROBLEMA 4 — Dos vidrios
`.glass` y `bg-white/95 backdrop-blur`.

### PROBLEMA 5 — Tres formas de card
`card-surface`, borde + sombra, solo borde.

### PROBLEMA 6 — `z-index` sin sistema
Todo lo flotante en `z-50`; los avisos superiores chocan con los modales.

### PROBLEMA 7 — Overlays de foto sueltos
`PromoBanner` y `restaurant/DashboardPage` con gradientes propios.

### PROBLEMA 8 — Sombras fuera del sistema
`RestaurantHero`, `LoginPage`, `RegisterPage`, `DeliveryLiveMap` (y las 3 del `Button` sin uso del design-system).

### PROBLEMA 9 — `BottomNav` pesado
`.glass` + sombra de 32px.

### PROBLEMA 10 — Héroes planos
El gradiente atardecer no tiene textura.

---

## 6. DECISIONES DE DISEÑO

### Decisión 1 — Sombras: todo cálido `rgba(28,25,23,…)` (CONFIRMADA)
- `sm` y `bottom-sheet` pasan de `15,23,42` a `28,25,23`.
- Se eliminan `xs`, `premium` y `glow-primary` (0 usos).
- `card`, `card-hover`, `floating` y `hairline` ya son cálidos y no cambian.
- Comentario en `tailwind.config.ts`:

```
// Sistema de elevación (LOOP_VISUAL_06):
// nivel 0: sin sombra
// nivel 1: card
// nivel 2: card-hover
// nivel 3: floating
// hairline: para definición
```

(Nota: el borrador pedía cambiar el color de `xs` y también eliminarlo; se elimina, ya que no tiene usos.)

### Decisión 2 — Vidrio único: `.glass` y su variante `.glass--bar` (CONFIRMADA)
`RestaurantCompactHeader` y `MenuCategoryNav` dejan `bg-white/95 backdrop-blur` y usan **`.glass--bar`**, variante de `.glass` para barras a ancho completo:

```
.glass--bar {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0;
  border-bottom: 1px solid rgba(28,25,23,0.06);   /* sin borde en los otros 3 lados */
}
```

**Verificación de legibilidad (obligatoria):** texto de las barras sobre fotos y chips según `COLORS.md`. Si no alcanza el contraste, el alfa sube de 0.72 a **0.80** (solo en `.glass--bar`; `.glass` no cambia). Se reporta el valor final.

### Decisión 3 — Hairline unificado en `card-surface` (CONFIRMADA)
Las cards con `border border-gray-100` migran a `card-surface` (con `card-surface--static` cuando tienen botones propios). Si una superficie no debe elevarse (fila de lista, panel dentro de otra card, skeleton), lleva solo hairline (`.hairline`, borde de 0.5px). El listado del borrador: `AddressCard`, `OrderStatusTimeline`, `OrderSuccessView` (resumen), `OrderSummaryCard`, `CartPage` (filas), `CategoryResultsPage`, `CheckoutPage`, `ClientAccountPage` (4), `OrderDetailPage`, `OrdersPage`, `InstallAppCard`, `NotificationBell`, `NotificationsPage`. **Clasificación A / A' / B / C (APROBADA por Jorge; tabla completa en la sección 8):**
- **A — card clickeable:** `card-surface` (hover, press y sombra nivel 1).
- **A' — panel elevado no clickeable:** `card-surface--flat` (variante nueva): mismo nivel 1 y hairline en `::after`, **sin hover y sin press** (levantarse al pasar el mouse sugeriría una acción que no existe).
- **B — solo hairline:** fila de lista o panel dentro de otra card: `.hairline` (0.5px), sin sombra.
- **C — sin cambio:** skeletons, dropdowns, mapas, barras fijas y divisores.

`card-surface--flat` (en `styles.css`, junto a `card-surface`):

```
.card-surface--flat {
  position: relative;
  box-shadow: 0 1px 2px rgba(28,25,23,0.04), 0 4px 12px rgba(28,25,23,0.06);   /* nivel 1 */
}
.card-surface--flat::after { /* hairline 0.5px, igual que card-surface */ }
/* sin :hover, sin :active */
```

### Decisión 4 — Escala de `z-index` (CONFIRMADA)
| Capa | Uso |
|---|---|
| `z-0` | Contenido base |
| `z-10` | Elementos elevados dentro de cards (p. ej. el corazón) |
| `z-20` | `MenuCategoryNav` |
| `z-30` | `CartFloatingBar`, `RestaurantCompactHeader` |
| `z-40` | `BottomNav` |
| `z-50` | Modales, `BottomSheet`, dropdown |
| `z-60` | `ConnectionBanner`, `Toast`, `UpdatePrompt` |

Tailwind no trae `z-60`: se añade `zIndex: { 60: '60' }` en `extend` de `tailwind.config.ts`. Los avisos superiores pasan a `z-60` para no chocar con los modales de `z-50`. Se documenta en `docs/design-system/ELEVATION.md`.

### Decisión 5 — Grano (`GrainOverlay`) (CONFIRMADA)
Overlay de ruido sutil, **solo sobre fondos de marca, nunca sobre una foto**:
- **Hero del Home** (`HomeHeroBanner`, degradado atardecer): sí.
- **Hero del restaurante** (`RestaurantHero`): **solo cuando no hay foto** (muestra el fondo de marca). Con foto, sin grano.
- Técnica: SVG inline con `feTurbulence` como `background-image` (data URI), sin peso extra ni archivos.
- `opacity` 0.03–0.05, `mix-blend-mode: overlay` o `soft-light`.
- `pointer-events-none` y `aria-hidden`; es estático (no se anima), así que `prefers-reduced-motion` no lo afecta.

### Decisión 6 — Overlays de foto en `ImageOverlay` (CONFIRMADA)
Un solo componente, con dos variantes de degradado inferior (ambas terminan en transparente al 60%):

| Variante | Degradado | Uso |
|---|---|---|
| `bottom-gradient` | `rgba(0,0,0,0.90)` → transparente al 60% | `RestaurantHero` (texto sobre foto con letreros) |
| `bottom-soft` (**nueva**) | `rgba(0,0,0,0.60)` → transparente al 60% | `PromoBanner` |

`restaurant/DashboardPage` (`from-black/70 …`) pasa a `ImageOverlay variant="bottom-soft"` (**confirmado**). `PromoBanner` usa `bottom-soft` (reestructura: el overlay es un hermano `absolute` y el texto queda encima). Las dos variantes se implementan con degradados de Tailwind (`from-black/90` / `from-black/60` → `to-transparent` en `to-60%`). Las variantes `full-soft` y `full-strong` se conservan.

### Decisión 7 — `BottomNav` más ligero: token `bottom-nav` (CONFIRMADA)
- Token nuevo en `tailwind.config.ts`: **`bottom-nav`: `0 -4px 16px rgba(28,25,23,0.08)`** (sombra ascendente, cálida, más liviana que la de 32px).
- Se aplica **solo** a `BottomNav` (`.glass` + `shadow-bottom-nav`).
- **`bottom-sheet` se conserva** (ya cálido) para el `BottomSheet` real.
- `shadow-floating` no se usa aquí: proyecta hacia abajo y quedaría fuera de la pantalla.
- Se reporta si afecta la legibilidad o la separación de la barra.

### Decisión 8 — Sombras fuera del sistema (CONFIRMADA)
- `RestaurantHero`: `shadow-md` + `drop-shadow` → `shadow-card` (los `drop-shadow` del texto sobre foto se evalúan: el texto necesita legibilidad, no elevación).
- `LoginPage` y `RegisterPage`: `shadow-lg shadow-primary/25` → `shadow-floating`.
- `DeliveryLiveMap`: sombra en línea → `shadow-floating`.
- `design-system/primitives/Button.tsx`: 3 sombras propias; esa carpeta no se importa en la app. Se deja como está (o se limpia si es trivial); se reporta.

### Decisión 9 — `mesh-hero` (CONFIRMADA)
Se **elimina** (0 usos). Si algún día se necesita, se reconstruye.

### Decisiones confirmadas (antes pendientes)
1. **`BottomNav`:** token `bottom-nav` (`0 -4px 16px rgba(28,25,23,0.08)`), solo para la barra; `bottom-sheet` intacto para el `BottomSheet`.
2. **`.glass--bar`:** `rgba(255,255,255,0.72)`, `blur(20px) saturate(180%)`, `border-bottom: 1px solid rgba(28,25,23,0.06)`; si falla la legibilidad, alfa 0.80.
3. **Grano:** Home sí; restaurante solo sin foto; nunca sobre foto.
4. **`ImageOverlay`:** `bottom-soft` (0.60) para `PromoBanner`, `bottom-gradient` (0.90) para `RestaurantHero`.
5. **Clasificación de cards A / B / C** con archivo + línea, antes de migrar y con OK de Jorge.

---

## 7. ALCANCE

### ✅ Incluido
- Sombras cálidas y eliminación de tokens muertos (`xs`, `premium`, `glow-primary`, `mesh-hero`)
- Documentar la escala de elevación
- Vidrio único (`.glass`)
- Migrar cards con borde + sombra a `card-surface` (o hairline)
- Sistema de `z-index` documentado y aplicado (`z-60` en los avisos)
- Grano en los héroes con gradiente atardecer (SVG inline)
- Overlays de foto unificados en `ImageOverlay`
- `BottomNav` más ligero
- Reemplazar sombras fuera del sistema
- `docs/design-system/ELEVATION.md`
- Tests que blinden el sistema

### 🚫 Fuera de alcance
- Motion (LOOP_VISUAL_07) y app shell completo (LOOP_VISUAL_11)
- Color, tipografía, iconografía
- Cambios de layout (solo profundidad)
- Features nuevas

---

## 8. COMPONENTES A REFACTORIZAR

**Nuevos**
- `src/shared/components/GrainOverlay.tsx`
- `docs/design-system/ELEVATION.md` (creado en la sub-tanda 2.1)

**Modificaciones de sistema**
- `tailwind.config.ts` (sombras cálidas, token `bottom-nav`, sin tokens muertos, `zIndex` con `60`) — sub-tanda 2.1
- `src/styles.css` (`.glass--bar` en 2.1; `.card-surface--flat` en 2.2)
- `ImageOverlay` (variante `bottom-soft`; `bottom-gradient` pasa a 0.90 → transparente al 60%)

### Clasificación de cards (APROBADA)

| Cat. | Archivos (línea) | Tratamiento |
|---|---|---|
| **A** | `AddressCard` (35), `CategoryResultsPage` (63) | `card-surface` (quita `border`, `shadow-card` y `active:scale` propios) |
| **A'** | `OrderSummaryCard` (21), `OrderSuccessView` (27), `OrderStatusTimeline` (32), `InstallAppCard` (11), `ClientAccountPage` (70, 97, 113, 127) | `card-surface--flat` |
| **B** | `DeliveryTrackingSection` (37), `CartPage` filas (197), `CheckoutPage` (208 opción de pago, 224 resumen), `OrderDetailPage` (242) | `.hairline` |
| **C** | Skeletons (`RestaurantDetailSkeleton` 7, `CategoryResultsPage` 48, `OrdersPage` 52, `NotificationsPage` 82), `NotificationsPage` (106, borde de estado), dropdown de `NotificationBell` (95), `DeliveryLiveMap` (28), barras fijas (`CartPage` 152, `CheckoutPage` 258), divisores internos | Sin cambio |

### Sombras fuera de sistema
- `RestaurantHero` avatar: `shadow-md` → `shadow-card`; el `drop-shadow` del texto sobre foto **se mantiene** (legibilidad).
- `LoginPage` y `RegisterPage`: `shadow-lg shadow-primary/25` → `shadow-floating`.
- `DeliveryLiveMap` marcador: `box-shadow: 0 2px 8px …` en línea → clase `shadow-card` en el HTML del marcador.

### Vidrios
- `RestaurantCompactHeader`: `bg-white/95 backdrop-blur` → `.glass--bar` (conserva `shadow-sm`).
- `MenuCategoryNav`: `bg-white/95 backdrop-blur` → `.glass--bar`.

### Overlays
- `PromoBanner` → `ImageOverlay bottom-soft` (overlay hermano + texto encima); `restaurant/DashboardPage` → `ImageOverlay bottom-soft`; `RestaurantHero` conserva `bottom-gradient` (ahora 0.90 → transparente al 60%).

### Otros
- Vidrio de `BottomNav` con `shadow-bottom-nav`; `ConnectionBanner`, `Toast`, `UpdatePrompt` a `z-60`
- Grano: `HomeHeroBanner`, `RestaurantHero` (solo sin foto)

---

## 9. MOCKUPS ASCII

### Escala de elevación

```text
nivel 0   ▭ sin sombra            (fondo, contenido base)
nivel 1   ▭ card                  (cards en reposo)
nivel 2   ▭ card-hover            (hover / pop)
nivel 3   ▭ floating              (banner, carrito flotante, toast)
hairline  ▭ 0.5px                 (definición sin peso)
```

### Capas

```text
z-60  ConnectionBanner · Toast · UpdatePrompt
z-50  Modales · BottomSheet · dropdown
z-40  BottomNav
z-30  CartFloatingBar · RestaurantCompactHeader
z-20  MenuCategoryNav
z-10  elementos elevados dentro de cards
z-0   contenido base
```

---

## 10. REGLAS ARQUITECTÓNICAS

- Todas las sombras en `rgba(28,25,23,…)`; ninguna `rgba(15,23,42,…)` en `tailwind.config.ts` ni `styles.css`
- Ninguna sombra en corchetes ni en estilo en línea en el módulo cliente, compartidos y auth
- Un solo vidrio (`.glass` y su variante `.glass--bar`)
- Una sola manera de hacer una card (`card-surface`; solo hairline donde no debe elevarse)
- `z-index` solo de la escala documentada (`z-0` a `z-60`); ningún valor arbitrario
- Un solo componente para overlays de foto (`ImageOverlay`)
- El grano es estático, decorativo (`aria-hidden`, `pointer-events-none`) y sin dependencias
- No cambiar layout, handlers ni lógica: solo profundidad
- Sin dependencias nuevas

---

## 11. A11Y ESPECÍFICA

- El vidrio no debe reducir el contraste del texto por debajo de `COLORS.md`: verificar sobre fotos y chips (`MenuCategoryNav`, `RestaurantCompactHeader`)
- El grano y los overlays son decorativos (`aria-hidden`); no afectan al contraste del texto del hero (verificar con el grano encendido)
- Orden de capas coherente con el foco: los modales (`z-50`) quedan sobre el `BottomNav` y bajo los avisos (`z-60`); los avisos no bloquean controles críticos
- Respetar `prefers-reduced-motion` (el grano no se anima; los hover de `card-surface` ya lo respetan)
- Touch targets ≥ 44px sin cambios

---

## 12. UX ESPECÍFICA

- La elevación comunica jerarquía: nivel 1 reposo, nivel 2 interacción, nivel 3 lo que flota
- El `BottomNav` debe sentirse ligero pero seguir separándose del contenido
- Los avisos superiores nunca quedan detrás de un modal (`z-60`)
- El grano se percibe como material, no como ruido: si se nota a simple vista, se baja
- Sin saltos visuales al migrar cards (mismo radio, padding y layout)

---

## 13. PERFORMANCE

- `backdrop-filter` es costoso: no se añade en superficies nuevas más allá de las ya existentes (`.glass` reemplaza a `backdrop-blur`, no suma)
- Grano: SVG en data URI (una sola rasterización), sin `filter` en vivo ni animación
- Eliminar tokens muertos reduce el CSS generado (mínimo)
- Sin CLS: solo cambian sombras, bordes y capas

---

## 14. TESTS

### Reglas (blindaje)
- `tailwind.config.ts` y `styles.css` no contienen `15,23,42`
- `tailwind.config.ts` no define `xs`, `premium`, `glow-primary` ni `mesh-hero`; define `bottom-nav` (`0 -4px 16px rgba(28,25,23,0.08)`) y `bottom-sheet` cálido
- El comentario de la escala de elevación está en `tailwind.config.ts`
- `zIndex` define `60`; `ConnectionBanner`, `Toast` y `UpdatePrompt` usan `z-60`; `BottomSheet` y el dropdown usan `z-50`; `BottomNav` `z-40`
- No queda `bg-white/95 backdrop-blur` ni `backdrop-blur` suelto fuera de `.glass` / `.glass--bar` en cliente y compartidos; `RestaurantCompactHeader` y `MenuCategoryNav` usan `.glass--bar`
- `.glass--bar` tiene `border-bottom` y ningún otro borde
- No hay `shadow-md`, `shadow-lg`, `shadow-primary` ni `shadow-[` en cliente, compartidos ni auth
- Las cards clasificadas como elevadas usan `card-surface` y no `border border-gray-100`
- `PromoBanner` usa `ImageOverlay bottom-soft`, `RestaurantHero` usa `bottom-gradient` y `restaurant/DashboardPage` usa `ImageOverlay`; sin `from-black/60` ni `from-black/70` sueltos
- `GrainOverlay`: decorativo (`aria-hidden`, `pointer-events-none`), sin animación, presente en `HomeHeroBanner`; en `RestaurantHero` solo en la rama sin foto

### Visual
- Cards de restaurante y producto, `BottomNav`, headers con vidrio, modales y sheets, avisos, héroes con grano

### A11y
- Axe no está instalado (deuda LOOP_QA_TOOLING). Sustituto: Lighthouse Accessibility (Chrome DevTools), que corre Jorge; verificar contraste con vidrio y grano

---

## 15. CRITERIOS DE ÉXITO

- [ ] Todas las sombras en `rgba(28,25,23)`
- [ ] Tokens muertos eliminados (`xs`, `premium`, `glow-primary`, `mesh-hero`)
- [ ] Sistema de elevación documentado
- [ ] Un solo vidrio (`.glass`)
- [ ] `BottomNav` con el token `bottom-nav` (sombra más sutil)
- [ ] Cards clasificadas A / B / C (archivo + línea), aprobadas por Jorge y migradas
- [ ] `z-index` documentado y aplicado
- [ ] Banner, toast y update en `z-60`
- [ ] Grano en los héroes con gradiente atardecer
- [ ] Overlays de foto unificados en `ImageOverlay`
- [ ] Sombras fuera de sistema reemplazadas
- [ ] `ELEVATION.md` creado
- [ ] Tests que blinden el sistema
- [ ] Build, lint, tests OK
- [ ] Sin regresiones visuales

---

## 16. QA CRÍTICO

### División de responsabilidades
- **Claude Code** (rutas `/qa/*` temporales + `.env.local` temporal, retirados al terminar): cards de restaurante y producto, `BottomNav`, headers con vidrio, `MenuCategoryNav`, backdrops, grano en el Home, `LoginPage`, consola, build.
- **Jorge, en la preview y con sesión:** hero del restaurante, `PromoBanner` con datos, `AddressCard` y `OrderSummaryCard` (checkout con carrito), avisos (`ConnectionBanner`, `Toast`, `UpdatePrompt`) sobre un modal, dropdown de notificaciones, Lighthouse Accessibility.

### Checklist
1. Card de restaurante con sombra cálida
2. Card de producto con sombra cálida
3. `BottomNav` más sutil (sin perder separación)
4. Header del restaurante con `.glass`
5. `MenuCategoryNav` con `.glass`
6. Modal con backdrop consistente (`black/40`)
7. `BottomSheet` con backdrop consistente
8. `ConnectionBanner` en `z-60`
9. `Toast` en `z-60`
10. `UpdatePrompt` en `z-60`
11. Dropdown de notificaciones en `z-50`
12. Modales en `z-50`
13. `BottomNav` en `z-40`
14. Grano visible (sutil) en el hero del Home
15. Grano en el hero del restaurante (según la decisión 3)
16. `PromoBanner` con `ImageOverlay`
17. `AddressCard` migrada a `card-surface`
18. `OrderSummaryCard` migrada
19. `LoginPage` con sombra del sistema
20. Sin regresiones visuales

---

## 17. REGLAS IMPORTANTES

- NO cambiar layout, handlers ni lógica
- NO tocar color, tipografía ni iconografía
- NO tocar motion ni el app shell
- NO añadir `backdrop-filter` nuevo
- NO introducir dependencias
- NO dejar valores de `z-index` fuera de la escala
- Reportar en vez de arreglar lo que quede fuera de alcance

---

## 18. REPORTE FINAL

### IMPLEMENTADO
<resumen>

### ARCHIVOS MODIFICADOS
<lista>

### ARCHIVOS CREADOS
<lista> (`GrainOverlay`, `ELEVATION.md`, tests, reporte)

### SOMBRAS — ANTES / DESPUÉS
<tabla de tokens: color antes → después>

### TOKENS ELIMINADOS
`xs`, `premium`, `glow-primary`, `mesh-hero`

### CARDS MIGRADAS A `card-surface`
<lista>

### CARDS QUE QUEDAN SOLO CON HAIRLINE
<lista con motivo>

### CASOS NO MIGRABLES
<lista con motivo>

### VIDRIOS UNIFICADOS
<lista>

### Z-INDEX
<escala aplicada, dónde>

### GRANO
<técnica, opacidad, dónde>

### OVERLAYS UNIFICADOS
<lista>

### SOMBRAS FUERA DE SISTEMA CORREGIDAS
<lista>

### BOTTOMNAV
<sombra elegida y efecto en la legibilidad>

### TESTS
```
Build:      OK / FAIL
Lint:       OK / FAIL / N/A
Typecheck:  OK / FAIL / N/A
Tests:      OK / FAIL / N/A
```

### QA
<cuáles de 20 validados; cuáles pendientes de Jorge>

### SIN REGRESIONES VISUALES
<confirmación con pantallas revisadas>

### PROBLEMAS ENCONTRADOS
<fuera de alcance>

### DEUDA TÉCNICA GENERADA
- `design-system/primitives/Button.tsx` (sombras propias, sin uso)
- Axe → LOOP_QA_TOOLING
- <otra deuda>

### PREPARACIÓN PARA LOOP_VISUAL_07
<qué quedó preparado para motion>

---

## 19. LO QUE NO DEBES HACER

- NO cambiar layout ni lógica
- NO tocar color, tipografía, iconografía ni motion
- NO añadir `backdrop-filter` nuevo
- NO usar `z-index` fuera de la escala
- NO introducir dependencias

---

## 20. REGLA FINAL

La profundidad no es decoración: es la forma de decir qué está encima de qué y qué se puede tocar. Un solo gris en las sombras, un solo vidrio, una escala de capas y una textura apenas perceptible hacen que la app se sienta hecha de un mismo material.

**Prioridad:** COHERENCIA (un sistema) → LEGIBILIDAD (nada oculto ni pesado) → SUTILEZA (que casi no se note) → MATERIAL (grano) → ESTÉTICA

Si tienes que elegir entre una sombra más visible y una más sutil: elige la sutil.
Si una superficie no necesita elevarse: no la eleves (solo hairline).
Si el grano se nota a simple vista: bájalo.

---

## REGLA DE EJECUCIÓN

No lo ejecutes todavía.

Solo crea el archivo en `docs/loops/visual/LOOP_VISUAL_06.md` y confírmame:
- Ruta exacta
- Tamaño (líneas + KB)
- Cualquier decisión que necesites que yo confirme antes de ejecutar
