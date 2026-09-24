# LOOP_VISUAL_10 — Cards Premium

**Categoría:** VISUAL
**Tipo:** Sistema visual / Refinamiento
**Estado:** 🟡 Pendiente
**Objetivo:** Rediseñar todas las cards del módulo cliente con un sistema coherente de elevación, espaciado, proporciones y micro-interacciones. Que dejen de verse grandes, genéricas y planas; que se vean premium, con jerarquía y respiración.
**NO ES SOBRE:** color (LOOP_VISUAL_04), iconografía (LOOP_ICONOS_01), ilustraciones (LOOP_VISUAL_03), tipografía (LOOP_VISUAL_05), motion (LOOP_VISUAL_07).
**Rama:** `loop/visual-10-cards` (crearla desde `main` antes de ejecutar).

> **AJUSTES CONFIRMADOS POR JORGE (23-sep-2026)** — mandan sobre cualquier otra
> sección de este documento:
> 1. **Nombres reales:** los nombres del LOOP (`RestaurantCard`, `ProductCarouselCard`,
>    `ProductRow`, `PromoCard`) se leen como sus equivalentes reales (tabla en la sección 8).
>    `FeaturedProductCard`, `NotificationCard` y `ProductCard` no existen → fuera de alcance.
> 2. **Sin `CardImage`:** se extiende `ProductImage.tsx`. Fallback = `RocketMark`.
>    `CardSkeleton` solo si `Skeleton.tsx`/`RestaurantCardsSkeleton.tsx` no sirven de base.
> 3. **Sombras:** se reutilizan `shadow-card`, `shadow-card-hover`, `shadow-floating`;
>    su color pasa de `rgba(15,23,42,…)` a `rgba(28,25,23,…)`; solo se añade `shadow-hairline`.
> 4. **Botón `+`:** no es flotante; solo cambia la disposición (texto a la izquierda,
>    botón a la derecha, centrado vertical). No se toca su tamaño (36x36) ni su color.
> 5. **Metadata:** no se inventa peso ni tiempo. Se usa `category` si existe; si no, la
>    primera línea de `description` truncada; si no hay ninguna, la línea queda vacía.
>    No se toca la base de datos.
> 6. **"No cambiar lógica"** = no cambiar handlers, estado, props ni efectos. SÍ se permite
>    reestructurar JSX. El botón `+` no puede quedar anidado en el botón padre.
> 7. **QA dividido:** Claude Code usa rutas `/qa/*` temporales; el usuario verifica lo
>    autenticado en la preview (sección 16).

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md` (plantilla maestra)
2. `docs/loops/visual/LOOP_VISUAL_04.md` (LOOP inmediatamente anterior — ya ejecutado)

No leas LOOPs más antiguos salvo que este LOOP lo requiera explícitamente.

---

## 1. ROL

Actúa como:

**Senior Product Designer + Mobile UX + Frontend Engineer + Accessibility Specialist**

Continúa trabajando sobre el repositorio existente de Domicilios Riohacha.

Los LOOPs anteriores construyeron:
- Iconografía propia (Lucide + custom)
- Tratamiento fotográfico premium
- 6 ilustraciones de marca
- Color disciplinado (coral eliminado, marca unificada, Button con variantes)

---

## 2. REGLA ABSOLUTA

ANTES DE MODIFICAR: INSPECCIONA.

Busca en el repositorio TODAS las cards existentes:

```text
RestaurantCard
ProductCard
ProductRow
ProductCarouselCard
MenuProductCard
FeaturedProductCard
PromoCard
OrderCard
ActiveOrderCard
NotificationCard
EmptyState
Card
```

Revisa al menos:

```text
src/shared/components/
src/features/client/components/
src/features/client/pages/
src/features/client/RestaurantDetailPage.tsx
src/features/client/HomePage.tsx
src/features/client/RestaurantsPage.tsx
src/features/client/OrdersPage.tsx
```

Reporta ANTES de tocar:
- Lista completa de cards existentes (componente + archivo)
- Dónde se usa cada una
- Aspect ratio de cada foto
- Radio actual de cada card
- Sombra actual de cada card
- Padding interno
- Gaps entre elementos
- Estados (default, hover, pressed, disabled, loading)
- Si hay variantes (compact, featured, list)
- Si hay skeletons
- Si hay fallback de imagen

NO inventes. Si algo no aparece, dilo.

**Nombres reales (auditados 23-sep-2026):** `RestaurantGridCard`, `FeaturedProductStrip`,
`MenuProductCard`, `PromoBanner`, `FeaturedSection`, `OrderCard`, `ActiveOrderCard`,
`Card`, `EmptyState`. Las rutas `src/features/client/HomePage.tsx`, `RestaurantsPage.tsx`,
`OrdersPage.tsx` y `RestaurantDetailPage.tsx` de la lista de arriba no existen tal cual:
las páginas viven en `src/features/client/pages/` (`ClientDashboardPage`, `RestaurantListPage`,
`OrdersPage`, `RestaurantDetailPage`).

---

## 3. NO CREAR UN SEGUNDO DE LO QUE YA EXISTE

Si ya existe:

```text
RestaurantCard
ProductCard / ProductRow
PromoCard
OrderCard
Card (genérico)
```

REUTILIZAR. El objetivo es REFACTORIZAR, no duplicar.

Si necesitas variantes, agrégalas como prop al componente existente (`variant="compact" | "featured" | "list"`), no crees componentes paralelos.

---

## 4. CONTEXTO ACTUAL

Según captura y LOOPs previos, los problemas visuales son:

### Cards de "Recomendados" (ProductCarouselCard)
- Foto cuadrada que ocupa ~60% de la card
- Nombre + botón `+` a la misma altura
- Precio debajo del nombre (rompe la lectura)
- Padding interno casi nulo (texto pegado al borde)
- Sin metadata (peso, tiempo de preparación)
- Sombra invisible → se ven planas

### Cards de "Platos" (ProductRow)
- Foto grande que domina la card
- Descripción ocupa 3 líneas
- Botón `+` flotando abajo a la derecha
- Card muy alta (poca densidad de información)
- Sin separación clara entre nombre/descripción/precio

### Cards de "Restaurantes" (RestaurantCard)
- Foto con overlay sin suficiente contraste
- Chips pegados al borde
- Sin separación clara entre hero y contenido
- Radio y sombra genéricos

### Cards de "Mis Órdenes" (OrderCard)
- Layout funcional pero sin jerarquía
- Estado sin presencia visual
- Precio sin tabular

### Problemas sistemáticos
1. Proporción foto/contenido mal balanceada (foto domina)
2. Sin sistema de espaciado interno
3. Sin jerarquía visual
4. Sin elevación real (sombra plana)
5. Sin micro-interacciones (hover, press)
6. Radio genérico (rounded-2xl = 16px)
7. Sin hairline para definición

---

## 5. PROBLEMAS A RESOLVER

### PROBLEMA 1 — Foto domina la card
En ProductCarouselCard la foto ocupa 60% de la altura. Debe ser 4:3 como máximo, no cuadrada. En ProductRow debe ser 72x72 fijo.

### PROBLEMA 2 — Card muy alta
Las ProductRow tienen foto grande + descripción 3 líneas = card de 140px+. Deben ser más compactas: descripción en 1 línea truncada.

### PROBLEMA 3 — Sin padding interno
El texto está pegado a los bordes. Debe haber padding consistente (`p-4` = 16px).

### PROBLEMA 4 — Sin espaciado entre elementos
Nombre, precio y botón están pegados. Deben tener gap consistente (`gap-3`).

### PROBLEMA 5 — Sombra invisible
Las cards se ven planas. Deben tener sombra de 2-3 capas para crear elevación real.

### PROBLEMA 6 — Radio genérico
`rounded-2xl` (16px) se ve duro. Debe ser `rounded-3xl` (24px) o consistente con el sistema.

### PROBLEMA 7 — Disposición del botón `+`
El botón `+` ya es un botón circular dentro de la fila (no es flotante). El problema es solo de **disposición**: debe quedar a la derecha, centrado verticalmente, con nombre + metadata + precio a la izquierda. **No se cambia su tamaño (36x36) ni su color (ya es `brand-700`).**

### PROBLEMA 8 — Sin estados
Las cards no tienen hover, press, ni focus visible. Deben tener feedback táctil.

### PROBLEMA 9 — Sin metadata
Las cards de producto no muestran peso, tiempo, o categoría. Deben mostrar al menos 1 línea de contexto.

### PROBLEMA 10 — Sin jerarquía de variantes
Todas las cards se ven iguales. Deben existir variantes claras: featured, default, compact, list.

### PROBLEMA 11 — Sin hairline
Las cards claras sobre fondo claro se pierden. Deben tener un hairline (0.5px) para definición.

### PROBLEMA 12 — Precios sin tabular
Los precios en cards no usan `tabular-nums`, saltan al cambiar.

### PROBLEMA 13 — Sin skeleton
Mientras cargan las cards no hay skeleton consistente.

### PROBLEMA 14 — Sin fallback
Si la foto de la card falla, no hay fallback consistente.

---

## 6. DECISIONES DE DISEÑO

### Decisión 1 — Sistema de elevación (3 niveles) — REUTILIZAR TOKENS EXISTENTES

`tailwind.config.ts` ya define `shadow-card` (nivel 1), `shadow-card-hover` (nivel 2) y `shadow-floating` (nivel 3) con los mismos offsets y opacidades de abajo. **No se crean tokens nuevos de nivel.** Cambios:
- Alinear el color de esos 3 tokens de `rgba(15,23,42,…)` a `rgba(28,25,23,…)` (paleta cálida).
- Añadir únicamente `shadow-hairline`: `'inset 0 0 0 0.5px rgba(28, 25, 23, 0.08)'`.
- Verificar qué otros componentes usan `shadow-card*`/`shadow-floating` (el cambio de color es global y sutil) y reportarlo.

```
Nivel 0 (flat):
  Box-shadow: none
  Uso: cards sin foto, listas muy densas

Nivel 1 (base):
  Box-shadow:
    0 1px 2px rgba(28, 25, 23, 0.04),
    0 4px 12px rgba(28, 25, 23, 0.06)
  Uso: RestaurantCard, PromoCard, OrderCard

Nivel 2 (hover):
  Box-shadow:
    0 2px 4px rgba(28, 25, 23, 0.04),
    0 12px 32px rgba(28, 25, 23, 0.10)
  Uso: hover de RestaurantCard, ProductCard featured

Nivel 3 (floating):
  Box-shadow:
    0 8px 24px rgba(28, 25, 23, 0.12)
  Uso: modales, sheets, popovers
```

### Decisión 2 — Sistema de radio

```
sm:   rounded-lg  (8px)   → chips, badges
md:   rounded-xl  (12px)  → botones, inputs
lg:   rounded-2xl (16px)  → cards compactas, list items
xl:   rounded-3xl (24px)  → cards principales
full: rounded-full (∞)    → avatares, pills
```

Las cards principales usan `rounded-3xl` (24px).

### Decisión 3 — Sistema de espaciado (grid de 4)

```
xs:  gap-1   (4px)   → entre título y subtítulo apretado
sm:  gap-2   (8px)   → entre elementos relacionados
md:  gap-3   (12px)  → entre secciones internas
lg:  gap-4   (16px)  → padding interno estándar
xl:  gap-6   (24px)  → separación entre cards
```

Padding interno de cards: `p-4` (16px).
Gap entre elementos: `gap-3` (12px).

### Decisión 4 — Hairline

Todas las cards sobre fondo claro llevan:
```
box-shadow: inset 0 0 0 0.5px rgba(28, 25, 23, 0.08)   →  token `shadow-hairline`
```
Como `box-shadow` no se suma entre utilidades de Tailwind, la sombra de nivel y el hairline se combinan en un solo lugar (p. ej. una clase `card-surface` en `styles.css`), no repetida por card.
Esto da definición sin agregar borde visible.

### Decisión 5 — Proporciones de foto

```
ProductCarouselCard:  4:3 (aspect-[4/3])
ProductRow:           1:1 fijo a 72x72
RestaurantCard:       16:9 (aspect-video)
PromoCard:            4:3 con overlay
OrderCard:            sin foto grande (ícono 40x40)
Hero restaurante:     16:9
```

### Decisión 6 — Anatomía de cada card

**ProductCarouselCard:**
```
┌──────────────────────┐
│ [Foto 4:3]           │  ← aspect-[4/3]
│                      │
│                      │
├──────────────────────┤
│ costilla bbq       ⊕ │  ← Título truncate + botón 36x36
│ $28.000              │  ← Precio tabular-nums
└──────────────────────┘
```
- Ancho: 160px (2 cols en mobile)
- Alto: ~200px
- Padding: p-3
- Componente real: `FeaturedProductStrip.tsx`

**ProductRow** (componente real: `MenuProductCard.tsx`):
```
┌──────────────────────────────────┐
│ ┌────┐ costilla bbq         ⊕   │
│ │ 72 │ Asados (categoría/desc.)   │
│ │ 72 │ $28.000                   │
│ └────┘                           │
└──────────────────────────────────┘
```
- Foto: 72x72 fijo
- Nombre: 1 línea truncate
- Metadata: 1 línea = `category` del producto si existe; si no, primera línea de `description` truncada; si no hay ninguna, línea vacía. **No inventar peso ni tiempo de preparación; no tocar la base de datos.**
- Precio: 1 línea
- Botón `+`: 36x36 a la derecha, centrado verticalmente (solo cambia la disposición; tamaño y color no cambian)
- Padding: p-3
- Alto: ~88px

**RestaurantCard:**
```
┌──────────────────────┐
│ [Foto 16:9]          │  ← aspect-video
│  ⭐ 4.9 · Envío gratis│
├──────────────────────┤
│ pa comer express     │
│ Asados               │
└──────────────────────┘
```
- Foto 16:9 con overlay para rating
- Nombre en 1 línea truncate
- Categoría en gris
- Padding: p-3

**OrderCard:**
```
┌──────────────────────────────────┐
│ ┌──┐ pa comer express  ● Pendiente│
│ │24│ #76B01B7E · 22 sept · 12:32  │
│ └──┘                              │
│      Calle 23-7#59, apto 2        │
│                                   │
│      Sin domiciliario    $68.000  │
└──────────────────────────────────┘
```
- Ícono restaurante 40x40
- Estado como badge arriba derecha
- ID + fecha tabular
- Dirección truncada
- Precio tabular-nums abajo derecha
- Padding: p-4

### Decisión 7 — Estados

```
Default:    Nivel 1 sombra + hairline
Hover:      Nivel 2 sombra + translate-y-[-2px]
Pressed:    scale-[0.98] + sin translate
Focus:      ring-2 ring-brand-700 ring-offset-2
Disabled:   opacity-50 + pointer-events-none
Loading:    skeleton shimmer (usar .skeleton existente)
Error img:  fallback con cohete de marca
```

### Decisión 8 — Micro-interacciones

```
Hover:
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1)
  transform: translateY(-2px)
  box-shadow: sube a nivel 2

Press:
  transition: all 100ms ease-out
  transform: scale(0.98)

Focus visible:
  ring-2 ring-brand-700 ring-offset-2
```

### Decisión 9 — Variantes por contexto

| Variante | Uso | Foto | Alto | Padding |
|----------|-----|------|------|---------|
| `featured` | Home, destacados | 16:9 con overlay | ~260px | p-4 |
| `default` | Restaurantes, Promos | 4:3 o 16:9 | ~220px | p-3 |
| `compact` | Recomendados (carousel) | 4:3 | ~200px | p-3 |
| `list` | Platos (ProductRow) | 72x72 | ~88px | p-3 |
| `minimal` | Órdenes (con ícono) | 40x40 | variable | p-4 |

---

## 7. ALCANCE

### ✅ Incluido
- Auditoría completa de cards existentes
- Sistema de elevación (3 niveles) en tailwind.config
- Sistema de radio actualizado
- Sistema de hairline
- Proporciones de foto actualizadas
- Anatomía de cada card refactorizada
- Estados (default, hover, pressed, focus, disabled, loading, error)
- Micro-interacciones (hover lift, press scale)
- Variantes por contexto (featured, default, compact, list, minimal)
- Skeletons de carga
- Fallback de imagen con cohete
- `tabular-nums` en precios
- `docs/design-system/CARDS.md`
- Tests que blinden las reglas

### 🚫 Fuera de alcance
- Color (LOOP_VISUAL_04, ya ejecutado)
- Iconografía (LOOP_ICONOS_01)
- Ilustraciones (LOOP_VISUAL_03)
- Tipografía (LOOP_VISUAL_05)
- Motion avanzado (LOOP_VISUAL_07)
- Fotografías (LOOP_VISUAL_02)
- Nuevas features

---

## 8. COMPONENTES A REFACTORIZAR

No se crean componentes de card nuevos. Se refactorizan los existentes (nombres reales):

| Nombre en el LOOP | Componente real |
|---|---|
| RestaurantCard | `src/features/client/components/RestaurantGridCard.tsx` |
| ProductCarouselCard | `src/features/client/components/FeaturedProductStrip.tsx` |
| ProductRow | `src/features/client/components/MenuProductCard.tsx` |
| PromoCard | `src/features/client/components/PromoBanner.tsx` + `FeaturedSection.tsx` |
| OrderCard | `src/features/client/components/OrderCard.tsx` |
| ActiveOrderCard | `src/features/client/components/ActiveOrderCard.tsx` |
| Card | `src/shared/components/Card.tsx` |
| EmptyState | `src/shared/components/EmptyState.tsx` (solo si tiene forma de card) |

**Fuera de alcance (no existen):** `FeaturedProductCard`, `NotificationCard`, `ProductCard`.

### Auxiliares
- **`CardImage`: NO se crea.** Se extiende `src/shared/components/ProductImage.tsx` (ya tiene `onError` y skeleton). El fallback de imagen fallida usa `RocketMark` (`src/shared/components/RocketMark.tsx`); no se crea un fallback nuevo.
- **`CardSkeleton`:** inspeccionar primero `src/shared/components/Skeleton.tsx` y `RestaurantCardsSkeleton.tsx`. Solo crear `CardSkeleton.tsx` si ninguno sirve como base; reportar la decisión.

---

## 9. MOCKUPS ASCII

### Antes (ProductCarouselCard actual)

```text
┌─────────────────────┐
│                     │
│    [Foto grande]    │  ← ocupa 60%
│                     │
│                     │
│                     │
├─────────────────────┤
│ costilla bbq    ⊕   │  ← sin padding
│ $28.000             │
└─────────────────────┘
Alto: 260px
```

### Después (ProductCarouselCard refactor)

```text
┌─────────────────────┐
│                     │
│    [Foto 4:3]       │  ← aspect-[4/3]
│                     │
├─────────────────────┤
│ costilla bbq    ⊕   │  ← p-3, gap-3
│ $28.000             │  ← tabular-nums
└─────────────────────┘
Alto: 200px
```

### Antes (ProductRow actual)

```text
┌─────────────────────┐
│ [Foto]  costilla bbq│
│         descripción │
│         que ocupa   │
│         3 líneas    │
│         $28.000  ⊕  │
└─────────────────────┘
Alto: 140px
```

### Después (ProductRow refactor)

```text
┌─────────────────────┐
│ ┌───┐ costilla bbq    │
│ │72 │ Asados       ⊕ │  ← + a la derecha, centrado
│ └───┘ $28.000        │
└─────────────────────┘
Alto: 88px
(metadata = category, o 1ª línea de description; nunca peso/tiempo inventados)
```

### Antes (RestaurantCard actual)

```text
┌─────────────────────┐
│ [Foto]              │
│  ⭐4.9 · Envío      │  ← overlay sin contraste
│ pa comer express    │  ← nombre sobre foto
│ Abierto Asados      │  ← chips pegados
└─────────────────────┘
```

### Después (RestaurantCard refactor)

```text
┌─────────────────────┐
│ [Foto 16:9]         │
│  ⭐4.9 · Envío g.   │  ← overlay con contraste
├─────────────────────┤
│ pa comer express    │  ← p-3
│ Asados              │  ← gris, 1 línea
└─────────────────────┘
```

### Antes (OrderCard actual)

```text
┌─────────────────────┐
│ [24] pa comer exp.  │
│      #76B01B7E · ...│
│      Calle 23-7...  │
│      Sin dom.       │
│                $68K │
└─────────────────────┘
```

### Después (OrderCard refactor)

```text
┌─────────────────────┐
│ ┌──┐ pa comer  ●Pend│  ← estado como badge
│ │24│ #76B01B7E      │  ← tabular
│ └──┘ 22 sept · 12:32│
│      Calle 23-7...  │
│      Sin dom.  $68K │  ← tabular
└─────────────────────┘
```

---

## 10. REGLAS ARQUITECTÓNICAS

- NO crear componentes de card paralelos
- SÍ agregar variantes como prop al componente existente
- Un solo sistema de sombras: reutilizar `shadow-card` / `shadow-card-hover` / `shadow-floating` (color alineado a `rgba(28,25,23,…)`) y añadir solo `shadow-hairline`
- Un solo sistema de radio (6 niveles)
- Un solo sistema de padding (grid de 4)
- NO usar CSS inline, todo vía Tailwind
- **"No cambiar lógica" = no cambiar handlers, estado, props ni efectos.** SÍ se permite reestructurar el JSX: envolver, cambiar `div` por `article`, sacar el botón `+` del wrapper clickeable
- El botón `+` NO puede quedar anidado dentro del botón padre (viola HTML y a11y)
- NO crear `CardImage`: extender `ProductImage.tsx`; fallback con `RocketMark`
- Reusar `.skeleton` existente en styles.css
- Reusar `Icon` de LOOP_ICONOS_01
- Reusar imágenes con `Image` de LOOP_VISUAL_02 si existe
- Reusar `Button` de LOOP_VISUAL_04 para botones internos
- Los hover/press deben respetar `prefers-reduced-motion`

---

## 11. A11Y ESPECÍFICA

- Toda card clickeable debe ser `<button>` o `<a>` (no `<div onClick>`)
- Touch target mínimo: 44x44 (la card completa, no solo el contenido)
- Focus visible: `ring-2 ring-brand-700 ring-offset-2`
- El botón `+` dentro de la card debe ser independiente (no anidar botón en botón)
- `aria-label` descriptivo en el botón `+`: "Agregar costilla bbq al carrito"
- Las imágenes con `alt` descriptivo
- Los skeletons con `role="status"` y `aria-label="Cargando"`
- Los estados (badges) con texto, no solo color
- Verificar con VoiceOver/TalkBack

---

## 12. UX ESPECÍFICA

- Hover: lift -2px + sombra nivel 2 (solo desktop)
- Press: scale 0.98 (todos los dispositivos)
- Transición: 200ms `cubic-bezier(0.16, 1, 0.3, 1)`
- Reduced motion: sin transform, solo cambio de sombra
- Botón `+` siempre visible (no aparece en hover)
- Card clickeable en toda su área (excepto el botón `+`)
- Scroll horizontal en carrusel: snap a cards
- Precios con `tabular-nums`

---

## 13. PERFORMANCE

- Imágenes con `loading="lazy"` (excepto featured above-the-fold)
- `aspect-ratio` CSS para evitar CLS
- Skeleton con altura fija (evitar shift)
- CSS transitions, no JS animations
- `will-change: transform` solo en hover activo

---

## 14. TESTS

> Nota: los nombres de componentes siguen el mapeo real del
> recuadro "AJUSTES CONFIRMADOS POR JORGE".

### Unit
- CardSkeleton tiene altura correcta
- RestaurantCard muestra rating si existe
- ProductRow trunca descripción a 1 línea
- ProductCarouselCard usa aspect-[4/3]
- OrderCard usa tabular-nums
- Botón `+` tiene aria-label descriptivo
- Card con imagen fallida muestra fallback

### Visual
- Snapshot de cada variante (featured, default, compact, list, minimal)
- Snapshot de cada estado (default, hover, focus, disabled, loading, error)

### A11y
- Axe: NO se instala (deuda para LOOP_QA_TOOLING). Sustituto: Chrome DevTools Lighthouse Accessibility; reportar el score
- Axe en Restaurantes → 0 violaciones
- Axe en Carrito → 0 violaciones

---

## 15. CRITERIOS DE ÉXITO

> Nota: los nombres de componentes siguen el mapeo real del
> recuadro "AJUSTES CONFIRMADOS POR JORGE".

- [ ] Sistema de elevación (3 niveles) definido en tailwind
- [ ] Sistema de radio actualizado (rounded-3xl para cards)
- [ ] Hairline aplicado en cards claras
- [ ] RestaurantCard refactorizada con aspect 16:9
- [ ] ProductCarouselCard con aspect 4:3
- [ ] ProductRow con foto 72x72 y descripción truncada
- [ ] OrderCard con estado como badge
- [ ] Todas las cards con padding `p-3` o `p-4`
- [ ] Todas las cards con gap `gap-3`
- [ ] Todas las cards con hover lift
- [ ] Todas las cards con press scale
- [ ] Todas las cards con focus visible
- [ ] Botones `+` integrados, no flotantes
- [ ] Precios con `tabular-nums`
- [ ] Skeletons de carga
- [ ] Fallback de imagen con cohete
- [ ] `docs/design-system/CARDS.md` creado
- [ ] Tests que blinden las reglas
- [ ] Axe: 0 violaciones
- [ ] Lighthouse a11y ≥ 95
- [ ] Sin regresiones visuales

---

## 16. QA CRÍTICO

### División de responsabilidades
- **Claude Code** (rutas `/qa/*` temporales + `.env.local` temporal, ambos retirados al terminar): Home, Restaurantes, Detalle de restaurante, Carrito, Checkout, skeletons, fallback de imagen, hover/press/focus, hairline, padding, `tabular-nums`, consola, build.
- **Jorge, en la preview y con sesión** (Claude Code no inicia sesión): **Mis Órdenes con datos reales (`OrderCard` + estados)**, **campana de notificaciones**, **contador de cuenta en Perfil**, y cualquier otro estado autenticado.

### Checklist
1. Home: `RestaurantGridCard` con aspect 16:9
2. Home: `RestaurantGridCard` con hover lift en desktop
3. Home: `PromoBanner` / `FeaturedSection` con overlay de contraste
4. Restaurantes: `RestaurantGridCard` consistente
5. Detalle: `FeaturedProductStrip` con aspect 4:3
6. Detalle: `MenuProductCard` con foto 72x72
7. Detalle: `MenuProductCard` con descripción/metadata en 1 línea
8. Detalle: botón `+` a la derecha, centrado, no anidado
9. **(Jorge)** Mis Órdenes: `OrderCard` con estado como badge
10. **(Jorge)** Mis Órdenes: `OrderCard` con #ID tabular
11. **(Jorge)** Mis Órdenes: `OrderCard` con precio tabular
12. Todas las cards con padding consistente
13. Todas las cards con hover lift
14. Todas las cards con press scale
15. Todas las cards con focus visible (Tab)
16. Todas las cards con hairline definido
17. Precios con tabular-nums (no saltan al scrollear)
18. Skeleton de carga en Home
19. Fallback de imagen (RocketMark) si la URL falla
20. Sin CLS al cargar
21. Touch target ≥ 44x44
22. Botón `+` con aria-label
23. Consola limpia
24. Build exitoso
25. Axe 0 violaciones (si Axe no está instalado, reportarlo; no se instala dependencia)
26. **(Jorge)** Campana de notificaciones
27. **(Jorge)** Contador de cuenta en Perfil

---

## 17. REGLAS IMPORTANTES

- NO crear componentes de card paralelos
- NO usar CSS inline
- NO tocar color (ya está en LOOP_VISUAL_04)
- NO tocar iconografía (LOOP_ICONOS_01)
- NO tocar ilustraciones (LOOP_VISUAL_03)
- NO tocar tipografía (LOOP_VISUAL_05)
- NO tocar motion avanzado (LOOP_VISUAL_07)
- NO cambiar la lógica de las cards: handlers, estado, props y efectos intactos. SÍ se puede reestructurar el JSX (envolver, `div`→`article`, sacar el `+` del wrapper clickeable)
- NO inventar datos (peso, tiempo) ni tocar la base de datos
- NO crear `CardImage` (extender `ProductImage`)
- NO romper funcionalidad existente
- NO introducir dependencias nuevas

---

## 18. REPORTE FINAL

### IMPLEMENTADO
<resumen>

### ARCHIVOS MODIFICADOS
<lista>

### ARCHIVOS CREADOS
<lista>

### AUDITORÍA DE CARDS
- Cards existentes: N
- Cards refactorizadas: N
- Cards con variantes: N

### SISTEMA DE ELEVACIÓN
- Nivel 0, 1, 2, 3 definidos
- Aplicados en: <lista>

### SISTEMA DE RADIO
- Antes: rounded-2xl
- Después: rounded-3xl
- Aplicado en: <lista>

### PROPORCIONES DE FOTO
- Antes → Después por card

### ESTADOS
- Default, hover, pressed, focus, disabled, loading, error
- Aplicados en: <lista>

### MICRO-INTERACCIONES
- Hover: <descripción>
- Press: <descripción>
- Reduced motion: <comportamiento>

### TIPOGRAFÍA EN CARDS
- tabular-nums aplicado en: <lista>

### A11Y
- Touch targets: <validación>
- aria-label: <lista>
- Focus visible: <validación>

### DOCUMENTACIÓN
- CARDS.md creado en: <ruta>

### TESTS
```
Build:      OK / FAIL
Lint:       OK / FAIL / N/A
Typecheck:  OK / FAIL / N/A
Tests:      OK / FAIL / N/A
```

### QA
<cuáles de 25 validados>

### PROBLEMAS ENCONTRADOS
<fuera de alcance>

### DEUDA TÉCNICA GENERADA
<deuda>

### PREPARACIÓN PARA LOOP_VISUAL_07
<qué quedó preparado para motion>

---

## 19. LO QUE NO DEBES HACER

- NO crear componentes paralelos
- NO usar CSS inline
- NO tocar color
- NO tocar iconografía
- NO tocar ilustraciones
- NO tocar tipografía
- NO tocar motion
- NO cambiar lógica de cards
- NO romper funcionalidad
- NO introducir dependencias

---

## 20. REGLA FINAL

Las cards son el 80% de la superficie visual de la app. Si las cards
se ven grandes, planas y genéricas, la app se ve amateur. Si las
cards respiran, tienen jerarquía y elevación, la app se ve premium.

Cada card debe:
- Tener proporciones correctas (foto no domina)
- Respirar (padding + gap consistentes)
- Tener elevación real (sombra de 2-3 capas)
- Tener hairline para definición
- Responder al hover/press
- Ser compacta cuando debe serlo
- Ser protagonista cuando debe serlo

**Prioridad:** PROPORCIÓN → RESPIRACIÓN → JERARQUÍA → INTERACCIÓN → ESTÉTICA

Si tienes que elegir entre una card más grande y una más compacta:
elige la compacta.

Si tienes que elegir entre más padding y menos información: elige
menos información.

La información que sobra se puede mover a una pantalla de detalle.
La que queda en la card debe respirar.

---

## REGLA DE EJECUCIÓN

No lo ejecutes todavía.

Solo crea el archivo en `docs/loops/visual/LOOP_VISUAL_10.md` y confírmame:
- Ruta exacta
- Tamaño (líneas + KB)
- Cualquier decisión que necesites que yo confirme antes de ejecutar
