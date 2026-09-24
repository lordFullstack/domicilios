# LOOP_VISUAL_09 — Home como Momento de Marca

**Categoría:** VISUAL
**Tipo:** Sistema visual / Rediseño de pantalla (sin features nuevas)
**Estado:** 🟡 Pendiente
**Objetivo:** Convertir el Home en la pantalla que mejor representa la marca. Compactar el header, jerarquizar el saludo, promover el pedido activo cuando existe, destacar las promos (monetización) y unificar el ritmo visual de las secciones.
**NO ES SOBRE:** features nuevas (búsqueda sticky, favoritos en Home, "volver a pedir", "abierto ahora"), backend, color (LOOP_VISUAL_04), cards (LOOP_VISUAL_10), tipografía (LOOP_VISUAL_05), iconografía, ilustraciones, motion.
**Rama:** `loop/visual-09-home` (crearla desde `main` antes de ejecutar).
**Ejecución:** tanda única (LOOP pequeño).

> **AJUSTES CONFIRMADOS POR JORGE (23-sep-2026)** — mandan sobre cualquier otra
> sección de este documento:
> 1. **`h1`:** sin pedido activo, el saludo es el `h1` (visual y semántico). Con pedido
>    activo, un `h1` `sr-only` con el texto "Inicio" y el saludo oculto.
> 2. **Hero con pedido activo:** se omite.
> 3. **"Ver todo →":** solo en "Restaurantes cerca de ti". Las `FeaturedSection`
>    conservan su "Ver todas >" interno (hacia `/restaurants`).
> 4. **Hero:** se mantiene tal cual (141px); solo se ajusta si tras compactar el header
>    se ve apretado (y se reporta).
> 5. **Saludo como prop:** `showGreeting` en `HomeHeader`. El orden y la variante con/sin
>    pedido se resuelven en `ClientDashboardPage.tsx`.
> 6. **Chevron de dirección: SE MANTIENE** (visible), con `aria-hidden="true"`, **sin
>    `aria-label`** (no es un control) y con `TODO(LOOP_CLIENT_06)` en el código. Anula la
>    decisión anterior de eliminarlo.
> 7. **"Tu comida, más cerca": NO se toca.** Aparece una sola vez (junto al logo); no hay
>    duplicado.
> 8. **Las promos YA van antes de los restaurantes** (verificado en el repo). El trabajo de
>    esa parte es subir el pedido activo, dar jerarquía y ritmo; el orden relativo
>    promos → restaurantes no cambia.
> 9. **Lista de archivos ampliada:** `CategoryScroller`, `PromoBanner`, `SearchBar`,
>    `HomeHeroBanner` y `ActiveOrderCard` (espaciado/títulos) están aprobados.

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md` (plantilla maestra)
2. `docs/loops/visual/LOOP_VISUAL_05.md` (LOOP inmediatamente anterior — ya mergeado)
3. `docs/design-system/TYPOGRAPHY.md` y `docs/design-system/CARDS.md` (sistemas que este LOOP consume)

No leas LOOPs más antiguos salvo que este LOOP lo requiera explícitamente.

---

## 1. ROL

Actúa como:

**Senior Product Designer + Mobile UX + Frontend Engineer + Accessibility Specialist**

Continúa sobre el repositorio existente de Domicilios Riohacha. Los LOOPs anteriores construyeron iconografía propia, tratamiento fotográfico, ilustraciones de marca, color disciplinado, cards con elevación y una escala tipográfica con `text-display`. Este LOOP ordena la pantalla que los reúne.

---

## 2. REGLA ABSOLUTA

ANTES DE MODIFICAR: INSPECCIONA y reporta.

### Hallazgos de la inspección previa (23-sep-2026, sobre el repo real, medidas a 448px de ancho de shell)

**Estructura**
- Página: `src/features/client/pages/ClientDashboardPage.tsx`, dentro de `AppShell` (`max-w-md` = 448px, `pb-24`, o `pb-44` con carrito).
- Orden actual de arriba abajo:

| # | Sección | Componente | Alto | Condicional |
|---|---|---|---|---|
| 1 | Header + dirección + saludo | `HomeHeader` | **198px** | no |
| 2 | Búsqueda | `SearchBar` | 66px | no |
| 3 | Hero | `HomeHeroBanner` | 141px | no |
| 4 | Categorías | `CategoryScroller` | 126px | no |
| 5 | Pedido activo | `ActiveOrderCard` | sin medir | sí (pedido no terminal) |
| 6 | Banner de promociones | `PromoBanner` | sin medir | sí (banners activos del Admin) |
| 7 | "Platos que te pueden gustar" | `FeaturedSection` (`featured_product`, `promoGrid`) | sin medir | sí |
| 8 | "Recomendados para ti" | `FeaturedSection` (`featured_restaurant`, carrusel `w-64`) | sin medir | sí |
| 9 | Restaurantes cerca de ti | `RestaurantsGrid` | 273px con 2 cards | no |
| — | Barra del carrito | `CartFloatingBar` (fija, 50px) | — | sí |
| — | Bottom nav | `BottomNav` (fija, 78px) | — | no |

- Documento completo ≈ 1,012px sin promociones. Hasta el final del hero: ~405px.

**Hero:** `HomeHeroBanner`, `bg-brand-gradient`, cohete de marca al 25% con `animate-float`, "Los mejores sabores en un solo lugar" (`font-display extrabold text-lg`) y CTA "Explorar"; navega a `CLIENT_RESTAURANTS`, igual que la búsqueda. Sin aspect ratio (padding), sin variante desktop.

**Saludo:** dentro de `HomeHeader`; es el `h1` de la página: `font-display text-xl font-bold`, "¡Hola, {nombre}! 👋" / "Bienvenido 👋", con `formatFirstName`; no usa `text-display`. Debajo, "¿Qué quieres comer hoy?" en `text-sm`.

**Header:** `HomeHeader`, no sticky, 198px + `safe-area-inset-top`. Contiene logo (gota con cohete) + "Domicilios / Tu comida, más cerca" + `NotificationBell`, la línea "Entregar en {dirección} ⌄" (`min-h-[48px]`, solo informativa: el chevron no tiene acción; el propio comentario del código dice que elegir dirección desde el Home queda para un LOOP futuro) y el saludo.

**Categorías:** `CategoryScroller`, 7 categorías fijas de `RESTAURANT_CATEGORIES`, gotas de 56px con ícono propio, scroll horizontal con máscara de desvanecido; título "Categorías" en `text-sm gray-700`.

**Pedido activo:** `ActiveOrderCard`, card oscura con barra de 4 pasos; aparece si `useOrders(user.id)` devuelve un pedido no entregado ni cancelado; hoy va **después de Categorías**.

**Promociones:** `PromoBanner` (banner `h-28` con imagen de fondo inline o degradado), `FeaturedSection` ×2 (`promoGrid` de 2 columnas con insignia "Oferta" coral; carrusel de cards `w-64`). Todas leen `promotions` (RLS) y no se muestran si no hay datos. `FeaturedProductStrip` **no** está en el Home (solo en el detalle del restaurante). La sección `promoGrid` ya tiene un enlace "Ver todas >" hacia Restaurantes.

**Restaurantes:** `RestaurantsGrid` con `RestaurantGridCard` (grid de 2 columnas desde 360px), estados de skeleton/error/vacío resueltos y enlace de cierre "Ver todos los restaurantes de Riohacha". "Cerca" es solo texto: no se filtra por ubicación.

**Datos:** restaurantes por `useRestaurants({ approvedOnly })` (Supabase); categorías fijas en `constants.ts`; promociones por `usePromotions` (Supabase); saludo por `useAuth`; dirección por `getDeliveryLabel()` (leída una vez por montaje); pedido activo por `useOrders` filtrando estados terminales.

**Títulos de sección hoy:** `text-sm font-display font-bold text-gray-700`, sin CTA salvo `promoGrid`.

**Espaciado hoy:** `mb-6`, `mb-4`, `pb-4` sueltos sin sistema.

NO inventes. Si algo no coincide con lo anterior al ejecutar, repórtalo antes de tocar. Como sin sesión no se ven pedido activo ni promociones, esas alturas se miden con datos reales (Jorge, en la preview) o con datos de prueba en un test.

---

## 3. NO CREAR UN SEGUNDO DE LO QUE YA EXISTE

REUTILIZAR: `HomeHeader`, `SearchBar`, `HomeHeroBanner`, `CategoryScroller`, `ActiveOrderCard`, `PromoBanner`, `FeaturedSection`, `RestaurantsGrid`, `CartFloatingBar`, `BottomNav`. No se crean componentes paralelos; si algo necesita una variante, se agrega como prop al componente existente.

---

## 4. CONTEXTO ACTUAL

El Home funciona y tiene buenas piezas (categorías con íconos propios, hero con marca, estados de carga resueltos), pero:
- El header ocupa casi un tercio de la primera pantalla antes del contenido.
- El saludo, que es el momento más "humano" de la pantalla, tiene el peso de un título más.
- Con un pedido en curso, lo más importante (su estado) queda debajo de las categorías.
- Las promociones (la parte monetizable) están **debajo** de todo lo demás, y compiten cuatro bloques sin jerarquía.
- Los títulos de sección casi no se ven y no invitan a seguir explorando.
- El chevron de la dirección promete una acción que no existe.
- No hay un ritmo de espaciado.

---

## 5. PROBLEMAS A RESOLVER

### PROBLEMA 1 — Header de 198px
Casi el 30% del viewport antes del contenido.

### PROBLEMA 2 — Saludo sin display
`text-xl`, sin el peso de `text-display` (LOOP_VISUAL_05).

### PROBLEMA 3 — Pedido activo debajo de las categorías
Debería estar arriba cuando existe.

### PROBLEMA 4 — (Descartado) Promos debajo de restaurantes
No es real: en el repo las promos **ya** van antes de restaurantes. Se conserva ese orden. El trabajo relacionado es el Problema 3 (subir el pedido activo) y el Problema 5 (jerarquía).

### PROBLEMA 5 — Cuatro bloques de promo apilados sin jerarquía
`PromoBanner`, "Platos que te pueden gustar", "Recomendados para ti" y luego los restaurantes: todos con el mismo peso.

### PROBLEMA 6 — Títulos de sección débiles y sin "Ver todo"
`text-sm gray-700`.

### PROBLEMA 7 — Chevron de dirección sin acción
Promete un cambio de dirección que no existe. **Decisión:** se mantiene visible como señal de la función futura, pero decorativo (`aria-hidden`, sin `aria-label`) y con `TODO(LOOP_CLIENT_06)`; el selector real es una feature de otro LOOP.

### PROBLEMA 8 — (Descartado) "Tu comida, más cerca" duplicado
No es real: el texto aparece **una sola vez** (`HomeHeader`, junto al logo). No se toca.

### PROBLEMA 9 — Hero permanente con el mismo destino que la búsqueda
Ocupa espacio en cada visita, sin distinguir si hay un pedido en curso.

### PROBLEMA 10 — Sin ritmo de espaciado
`mb-6` / `mb-4` sueltos.

---

## 6. DECISIONES DE DISEÑO

### Decisión 1 — Home adaptativo

**SIN pedido activo:**
1. Header compacto
2. Saludo (`text-display`)
3. Búsqueda
4. Hero
5. Categorías
6. Promociones (`PromoBanner` → "Platos que te pueden gustar" → "Recomendados para ti")
7. Restaurantes cerca de ti
8. `CartFloatingBar` si hay carrito

**CON pedido activo:**
1. Header compacto
2. `ActiveOrderCard` (protagonista)
3. Búsqueda
4. Categorías
5. Promociones
6. Restaurantes cerca de ti
7. `CartFloatingBar` si hay carrito

(Con pedido activo se omiten saludo visible y hero — **confirmado**. La pantalla conserva un `h1` `sr-only` "Inicio"; ver Decisión 3.)

### Decisión 2 — Header compacto
Antes: 198px con logo + título + campana + dirección + saludo + subtítulo. Después: **~120px**.
- Fila 1: logo (36px) + "Domicilios" + `NotificationBell`.
- Fila 2: dirección compacta ("Entregar en Riohacha ⌄"), con el chevron **mantenido** (decorativo: `aria-hidden="true"`, sin `aria-label`, con `TODO(LOOP_CLIENT_06)`) y sin el `min-h-[48px]` actual (no es un control).
- "Tu comida, más cerca" **se conserva** junto al logo (aparece una sola vez).
- El saludo deja de vivir dentro de la altura del header: es una sección propia justo debajo (Decisión 3).

### Decisión 3 — Saludo en `text-display`
Sección propia después del header, solo cuando no hay pedido activo: "¡Hola, {nombre}! 👋" en `font-display text-display font-extrabold` (máx. 2 líneas), con `formatFirstName`, y "¿Qué quieres comer hoy?" en `text-sm`. Es el `h1` de la pantalla (visual y semántico).

**Con pedido activo:** el saludo no se muestra; en su lugar hay un `h1` con clase `sr-only` y el texto **"Inicio"**, para que la pantalla siga teniendo un encabezado principal.

**Implementación (confirmada):** prop **`showGreeting`** de `HomeHeader` (por defecto `true`). Con `showGreeting={false}` el header renderiza solo las filas compactas y el `h1` `sr-only`. No se crea un componente paralelo. `ClientDashboardPage.tsx` decide el valor según haya pedido activo.

### Decisión 4 — Pedido activo arriba
Cuando existe, `ActiveOrderCard` va inmediatamente después del header, antes de la búsqueda. Cuando no existe, no ocupa espacio.

### Decisión 5 — Promos antes de restaurantes (YA ocurre); jerarquía dentro de promos
El orden actual ya pone las promos antes de los restaurantes; se conserva. Lo que cambia es la jerarquía interna.
Orden: `PromoBanner` (card grande destacada) → "Platos que te pueden gustar" (grid de 2 columnas con insignia "Oferta") → "Recomendados para ti" (carrusel compacto) → Restaurantes cerca de ti. Cada bloque se sigue mostrando solo si hay datos (no cambia la lógica de datos).

### Decisión 6 — Títulos de sección
Antes: `text-sm gray-700` sin CTA. Después: `text-lg font-display font-bold text-secondary` (consistente con `TYPOGRAPHY.md`: títulos secundarios en `text-lg`), y **"Ver todo →"** (`text-sm font-semibold`, `brand-700`, target ≥ 44px) **solo en "Restaurantes cerca de ti"** (destino `CLIENT_RESTAURANTS`). Las dos `FeaturedSection` **conservan su "Ver todas >" interno** (hacia `/restaurants`) sin cambiar de texto ni destino; solo reciben el nuevo estilo de título. Los títulos son `h2` bajo el `h1`.

### Decisión 7 — Chevron de dirección (CONFIRMADA)
Se **mantiene visible**, con `aria-hidden="true"`, **sin `aria-label`** y con un comentario `TODO(LOOP_CLIENT_06)` (selector de dirección). La línea sigue siendo texto informativo, no un control. Un `aria-label` tipo "Cambiar dirección de entrega" anunciaría una acción inexistente; solo se añadiría si la línea pasa a ser clicable (feature de LOOP_CLIENT_06).

### Decisión 8 — "Tu comida, más cerca" (CONFIRMADA)
No se toca. Aparece una sola vez, junto al logo del header.

### Decisión 9 — Ritmo
- Entre secciones mayores: `mb-8` (32px).
- Dentro de una sección (título → contenido): `mb-4` (16px).
- Reemplaza los `mb-6`, `mb-4` y `pb-4` sueltos por este sistema, aplicado en `ClientDashboardPage.tsx` y en los contenedores de cada sección.

### Decisión 10 — Hero (CONFIRMADO)
Se mantiene tal cual (141px) y **se omite cuando hay pedido activo**. La instrucción "quitar el texto si se ve apretado, conservando el CTA" queda como decisión de ejecución: por defecto NO se toca el texto; si tras compactar el header el conjunto se ve apretado, se reporta antes de cambiar.

### Decisión 11 — Insignia "Oferta" más visible
Sigue siendo coral (único uso permitido, LOOP_VISUAL_04). Más visible = más presencia, no otro color: tamaño de texto `text-xs` (ya), más padding, sombra sutil y posición sin tapar el sujeto de la foto. Sin cambiar lógica ni datos.

### Decisión 12 — `PromoBanner` destacado
Card grande (mayor altura que los `h-28` actuales, con `card-surface` y `rounded-3xl` ya aplicados en LOOP_VISUAL_10). Conserva su carrusel y su pausa por accesibilidad. El fondo inline con `style` es deuda conocida de LOOP_VISUAL_10; no se agrava.

---

## 7. ALCANCE

### ✅ Incluido
- Compactar el header (~120px)
- Saludo a `text-display` como sección propia
- Pedido activo arriba (si existe)
- Promos antes de restaurantes
- Títulos de sección con peso (`text-lg font-display`)
- "Ver todo →" en las secciones
- Sistema de espaciado (`mb-8` / `mb-4`)
- Chevron de dirección: se mantiene, decorativo y con `TODO(LOOP_CLIENT_06)`
- Insignia "Oferta" más visible
- Home adaptativo (con / sin pedido)
- Tests que blinden la estructura

### 🚫 Fuera de alcance
- Búsqueda sticky, favoritos en Home, "volver a pedir", "abierto ahora"
- Elegir dirección desde el Home (LOOP futuro, según el propio código)
- Filtrar "cerca de ti" por ubicación real
- Nuevas features y backend
- Color, iconografía, ilustraciones, tipografía, cards, motion (ya cubiertos por sus LOOPs)
- `RestaurantGridCard`, `FeaturedProductStrip` y demás cards (LOOP_VISUAL_10)

---

## 8. COMPONENTES A REFACTORIZAR

- `src/features/client/pages/ClientDashboardPage.tsx` (orden adaptativo y ritmo)
- `src/features/client/components/HomeHeader.tsx` (compactar; saludo como sección/prop `showGreeting`; chevron y subtítulo se mantienen)
- `src/features/client/components/ActiveOrderCard.tsx` (ajustes de espaciado si hace falta como protagonista)
- `src/features/client/components/PromoBanner.tsx` (card destacada)
- `src/features/client/components/FeaturedSection.tsx` (títulos, "Ver todo →", insignia "Oferta")
- `src/features/client/components/CategoryScroller.tsx` (título y espaciado)
- `src/features/client/components/RestaurantsGrid.tsx` (título, "Ver todo →", espaciado)
- `src/features/client/components/SearchBar.tsx` y `HomeHeroBanner.tsx` (solo espaciado)

Componentes nuevos: ninguno.

---

## 9. MOCKUPS ASCII

### Antes (sin pedido)

```text
┌──────────────────────────┐
│ ◉ Domicilios          🔔 │
│   Tu comida, más cerca   │
│ 📍 Entregar en X ⌄       │  ← 198px
│ ¡Hola, Ana! 👋           │
│ ¿Qué quieres comer hoy?  │
├──────────────────────────┤
│ 🔍 Buscar…               │
│ [ Hero degradado ]       │
│ Categorías ● ● ● ●       │
│ (pedido activo)          │
│ (promos)                 │
│ Restaurantes cerca de ti │
└──────────────────────────┘
```

### Después (sin pedido)

```text
┌──────────────────────────┐
│ ◉ Domicilios          🔔 │
│ 📍 Entregar en Riohacha  │  ← ~120px
│                          │
│ ¡Hola, Ana! 👋           │  ← text-display
│ ¿Qué quieres comer hoy?  │
│ 🔍 Buscar…               │
│ [ Hero degradado ]       │
│ Categorías ● ● ● ●       │
│ [ PromoBanner grande ]   │
│ Platos que te pueden…    │
│ Recomendados para ti     │
│ Restaurantes   Ver todo →│
└──────────────────────────┘
```

### Después (con pedido activo)

```text
┌──────────────────────────┐
│ ◉ Domicilios          🔔 │
│ 📍 Entregar en Riohacha  │
│ [ ActiveOrderCard ]      │  ← protagonista
│ 🔍 Buscar…               │
│ Categorías ● ● ● ●       │
│ Promos …                 │
│ Restaurantes   Ver todo →│
└──────────────────────────┘
```

---

## 10. REGLAS ARQUITECTÓNICAS

- NO crear componentes paralelos
- Reusar `HomeHeader`, `SearchBar`, `HomeHeroBanner`, `CategoryScroller`, `ActiveOrderCard`, `PromoBanner`, `FeaturedSection`, `RestaurantsGrid`
- **El orden y la variante (con/sin pedido) se resuelven en `ClientDashboardPage.tsx`**, no en los hijos
- Si un componente necesita variante, se agrega como prop: **`showGreeting`** en `HomeHeader` (por defecto `true`); el orden y la variante con/sin pedido se resuelven en `ClientDashboardPage.tsx`
- Los componentes que cambian de tamaño (header) se refactorizan
- NO tocar la lógica de datos (hooks, queries)
- Espaciado: `mb-8` entre secciones mayores, `mb-4` dentro de la sección; un solo sistema
- Títulos de sección: `text-lg font-display` (`TYPOGRAPHY.md`); tracking y leading vienen de la escala
- Sin `font-family` inline ni CSS inline nuevo
- Sin dependencias nuevas

---

## 11. A11Y ESPECÍFICA

- Un solo `h1` por pantalla. Sin pedido: el saludo (visual y semántico). Con pedido: `h1` `sr-only` "Inicio" y saludo oculto, para no dejar la pantalla sin encabezado principal
- Títulos de sección como `h2`; sin saltos de nivel
- "Ver todo →" (solo en Restaurantes cerca de ti): target ≥ 44px, con `aria-label` "Ver todos los restaurantes"
- La dirección es texto informativo, sin `<button>` ni rol interactivo; el chevron es decorativo (`aria-hidden="true"`, sin `aria-label`)
- `ActiveOrderCard` sigue siendo un `<button>` nativo con nombre accesible
- Orden del DOM = orden visual (sin `order-*` que rompa el foco con el teclado)
- Contraste según `COLORS.md`; tamaños según `TYPOGRAPHY.md`
- Respetar `prefers-reduced-motion` (animación del cohete del hero y rotación del `PromoBanner`, ya implementadas)

---

## 12. UX ESPECÍFICA

- El saludo es el primer texto grande de la pantalla; el ojo baja a la búsqueda y luego al hero/categorías
- Con pedido en curso, lo primero que se ve es su estado; se omiten saludo y hero para no competir con él
- Las promos aparecen antes de los restaurantes, en jerarquía decreciente: banner → grid → carrusel
- "Ver todo →" a la derecha del título, alineado por la línea base
- Cero CLS: alturas reservadas para skeletons y secciones condicionales (no empujar el contenido al llegar los datos)
- La barra del carrito no debe tapar el último contenido (el `AppShell` ya reserva `pb-44`)

### Decisiones confirmadas (antes pendientes)
1. **`h1`:** sin pedido, el saludo; con pedido, `h1` `sr-only` "Inicio" y saludo oculto.
2. **Hero con pedido activo:** se omite.
3. **"Ver todo →":** solo en Restaurantes cerca de ti; las `FeaturedSection` conservan su "Ver todas >".
4. **Hero:** tal cual (141px).

---

## 13. PERFORMANCE

- Sin cambios en las consultas (mismos hooks y queries)
- Skeletons con altura fija para no generar CLS
- Reordenar secciones no debe provocar remontajes ni nuevas peticiones
- Las imágenes conservan `loading="lazy"` salvo lo que ya sea above-the-fold

---

## 14. TESTS

### Unit / estructura (blindaje)
- `ClientDashboardPage` sin pedido activo: orden Header → Saludo → Búsqueda → Hero → Categorías → Promos → Restaurantes
- `ClientDashboardPage` con pedido activo: `ActiveOrderCard` va inmediatamente después del header y antes de la búsqueda; no hay saludo visible ni hero; existe un único `h1` `sr-only` "Inicio"
- `HomeHeader`: `showGreeting` (por defecto `true`) controla el saludo y el `h1`
- Las promos aparecen antes de "Restaurantes cerca de ti" en el DOM
- `HomeHeader`: el chevron está presente con `aria-hidden="true"` y sin `aria-label`; "Tu comida, más cerca" se conserva; la dirección no es un botón
- El saludo usa `text-display` (y `formatFirstName`)
- Títulos de sección: `h2`, `text-lg`, `font-display`
- "Ver todo →" presente en Restaurantes cerca de ti, con `aria-label` y destino correcto; las `FeaturedSection` conservan su "Ver todas >"
- Sin `mb-6` sueltos en las secciones del Home (sistema `mb-8` / `mb-4`)

### Visual
- Home sin pedido; Home con pedido; Home con promociones; Home sin promociones

### A11y
- Axe no está instalado (deuda para LOOP_QA_TOOLING). Sustituto: Lighthouse Accessibility (Chrome DevTools), que corre Jorge sobre la preview; reportar el score

---

## 15. CRITERIOS DE ÉXITO

- [ ] Header compacto (198px → ~120px)
- [ ] Saludo en `text-display`
- [ ] Pedido activo arriba cuando existe
- [ ] Promos antes de restaurantes
- [ ] Títulos de sección en `text-lg font-display`
- [ ] "Ver todo →" en Restaurantes cerca de ti (las `FeaturedSection` conservan su "Ver todas >")
- [ ] `h1`: saludo sin pedido; `h1` `sr-only` "Inicio" con pedido
- [ ] Chevron de dirección mantenido, `aria-hidden` y con `TODO(LOOP_CLIENT_06)`
- [ ] "Tu comida, más cerca" sin cambios
- [ ] Ritmo consistente (`mb-8` entre secciones, `mb-4` dentro)
- [ ] Insignia "Oferta" más visible
- [ ] Home adaptativo (con / sin pedido)
- [ ] Sin CLS
- [ ] Build, lint, tests pasan
- [ ] Sin regresiones visuales
- [ ] Consola limpia
- [ ] Lighthouse a11y ≥ 95

---

## 16. QA CRÍTICO

### División de responsabilidades
- **Claude Code** (ruta `/qa/home` temporal + `.env.local` temporal, retirados al terminar): estructura sin sesión (header, saludo genérico "Bienvenido", búsqueda, hero, categorías, restaurantes), altura del header, ritmo, "Ver todo →", ausencia de chevron y de "Tu comida, más cerca", consola, build. Con datos de prueba en tests: orden con y sin pedido activo.
- **Jorge, en la preview y con sesión:** Home con pedido activo real, Home con promociones reales (banner, grid con insignia "Oferta", carrusel), saludo con nombre, Lighthouse Accessibility.

### Checklist
1. Home sin pedido activo → estructura estándar
2. **(Jorge)** Home con pedido activo → pedido arriba
3. Header ~120px (antes 198px)
4. Saludo en `text-display`
5. Búsqueda funcional
6. Hero visible
7. Categorías con scroll horizontal
8. Promos antes de restaurantes (DOM y visual)
9. **(Jorge)** `PromoBanner` destacado
10. **(Jorge)** "Platos que te pueden gustar" con grid de 2 columnas
11. **(Jorge)** "Recomendados para ti" con carrusel
12. Restaurantes cerca con "Ver todo →"
13. Chevron de dirección visible, `aria-hidden`, sin acción
14. "Tu comida, más cerca" sin cambios (1 aparición)
15. Ritmo consistente entre secciones
16. **(Jorge)** Insignia "Oferta" visible en promos
17. `CartFloatingBar` aparece si hay carrito y no tapa contenido
18. Sin CLS
19. Consola limpia
20. **(Jorge)** Lighthouse Accessibility ≥ 95 (sustituye a Axe)

---

## 17. REGLAS IMPORTANTES

- NO agregar features (búsqueda sticky, favoritos, volver a pedir, abierto ahora)
- NO tocar la lógica de datos (hooks, queries, RLS)
- NO tocar color, iconografía, ilustraciones, tipografía base ni cards
- NO crear componentes paralelos
- NO cambiar el destino de las navegaciones existentes (salvo el "Ver todo →" nuevo, ya definido)
- NO romper funcionalidad (búsqueda, categorías, notificaciones, carrito)
- NO introducir dependencias
- Reportar en vez de arreglar lo que quede fuera de alcance

---

## 18. REPORTE FINAL

### IMPLEMENTADO
<resumen>

### ARCHIVOS MODIFICADOS
<lista>

### ARCHIVOS CREADOS
<lista> (tests, reporte)

### ALTURA DEL HEADER
- Antes: 198px
- Después: <px medido>

### ORDEN DE SECCIONES — ANTES / DESPUÉS
- Sin pedido: <antes → después>
- Con pedido: <antes → después>

### JERARQUÍA DE TÍTULOS — ANTES / DESPUÉS
- Saludo: `text-xl` → `text-display`
- Títulos de sección: `text-sm gray-700` → `text-lg font-display`
- "Ver todo →": <dónde>

### CHEVRON Y SUBTÍTULO
- Chevron de dirección: mantenido (decorativo, `aria-hidden`, `TODO(LOOP_CLIENT_06)`)
- "Tu comida, más cerca": sin cambios

### RITMO
- Sistema `mb-8` / `mb-4` aplicado en: <lista>

### PROMOS
- Antes de restaurantes; jerarquía banner → grid → carrusel

### PEDIDO ACTIVO / HOME ADAPTATIVO
- Comportamiento con y sin pedido; decisión sobre `h1` y hero con pedido

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
<deuda>

### PREPARACIÓN PARA LOOP_VISUAL_07
<qué quedó preparado para motion>

---

## 19. LO QUE NO DEBES HACER

- NO agregar features nuevas
- NO tocar la lógica de datos
- NO crear componentes paralelos
- NO tocar color, iconografía, ilustraciones, tipografía base ni cards
- NO cambiar destinos de navegación existentes
- NO romper funcionalidad
- NO introducir dependencias

---

## 20. REGLA FINAL

El Home es la primera pantalla que ve el cliente cada día. Si el header ocupa un tercio de la pantalla y las promociones quedan al fondo, la app parece un directorio; si el saludo manda, lo urgente (el pedido en curso) está arriba y lo monetizable se ve antes que la lista, la app parece un servicio con criterio.

**Prioridad:** LO URGENTE (pedido activo) → LO HUMANO (saludo) → LO ÚTIL (búsqueda, categorías) → LO COMERCIAL (promos) → LO COMPLETO (restaurantes)

Si tienes que elegir entre añadir un elemento y dar aire a los existentes: da aire.
Si algo compite con el pedido activo: gana el pedido activo.
Si dudas si algo es una feature nueva: lo es. Va a otro LOOP.

---

## REGLA DE EJECUCIÓN

No lo ejecutes todavía.

Solo crea el archivo en `docs/loops/visual/LOOP_VISUAL_09.md` y confírmame:
- Ruta exacta
- Tamaño (líneas + KB)
- Cualquier decisión que necesites que yo confirme antes de ejecutar
