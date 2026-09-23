# LOOP_CLIENT_01 — DESIGN SYSTEM ALIGNMENT + HOME QA + A11Y BASE

## ROL

Actúa como:

**Senior Frontend Engineer + Design System Engineer + PWA Engineer + Accessibility Specialist + Mobile UX Engineer**

Este es el primer LOOP de la serie CLIENT sobre el repositorio existente de
Domicilios Riohacha.

Objetivo: consolidar la base visual y de accesibilidad **antes** de escalar
pantallas. Este LOOP no agrega features. Corrige divergencias de tokens,
bugs visibles de Home, y establece la base de a11y que todas las pantallas
siguientes (CLIENT_02, CLIENT_03, CLIENT_04…) van a heredar.

> **NO ES UN LOOP DE CONSTRUIR DESDE CERO.**
> El proyecto ya tiene tokens, Home y componentes funcionando. El trabajo es
> alinear, corregir y documentar — no rediseñar ni duplicar.

---

# 1. REGLA ABSOLUTA

ANTES DE MODIFICAR:

INSPECCIONA.

No asumas nada. No inventes nombres de archivos. No crees archivos
paralelos. Primero lee lo que ya existe.

Busca en el repositorio:

```text
styles.css
tailwind.config.ts
index.html
HomePage
Home
ClientDashboardPage
ProfilePage
ClientAccountPage
BottomNav
CategoryCircle
CategoryCard
CategoryScroller
RestaurantCard
RestaurantGridCard
NotificationBadge
NotificationBell
format
formatters
currency
money
useActiveAddress
useAddress
useProfile
useAuth
useBottomNav
useLocationLabel
design-system
```

Reporta antes de escribir código si algo de la sección 2 no coincide con
lo que encuentres (Jorge hace cambios entre sesiones).

---

# 2. ESTADO REAL AUDITADO

No volver a construir lo que ya está. Esta tabla manda sobre cualquier
nombre genérico del resto del documento.

## 2.1 Lo que YA existe

| Pieza pedida | Qué existe HOY | Acción |
|---|---|---|
| Home | `features/client/pages/ClientDashboardPage.tsx`, ruta `/app/home` | Es el Home real: **NO** confundir con `HomePage.tsx` |
| HomePage.tsx | Existe el archivo, pero **no está en el router** — código muerto, 0 imports | Eliminar (sección 4) |
| RestaurantCard.tsx | Existe, pero solo lo usaba `HomePage.tsx` (muerto) | Eliminar junto con `HomePage.tsx` |
| ProfilePage | `features/delivery/pages/ProfilePage.tsx` (perfil del domiciliario). El cliente tiene `ClientAccountPage.tsx` | Tratar ambos casos, no asumir un solo "Profile" |
| Categorías de Home | `CategoryScroller.tsx` (círculos con emoji) | Refactor a11y, NO crear `CategoryCircle` nuevo |
| Card de restaurante | `RestaurantGridCard.tsx` (el `RestaurantCard.tsx` legacy es el código muerto de arriba) | Reutilizar |
| Badge de notificaciones | `shared/components/NotificationBell.tsx` | Refactor a11y |
| Chips de filtro | `features/client/components/ExploreFilterChips.tsx` | Refactor a11y |
| Tokens CSS | `src/styles.css` (`:root { --brand: #2F5EFF; ... }`, azul eléctrico legacy) | Realinear (sección 3) |
| Tokens Tailwind | `tailwind.config.ts` (`brand.500: #2E3A8C`, azul profundo del cohete) | Ya correcto; `styles.css` es el que está desalineado |
| Segundo design system | `src/design-system/` — tokens y `Button` duplicados, **tercera capa de tokens**, 0 imports reales | Eliminar (código muerto) |
| Formateo de nombres | No existe helper | Crear `src/shared/utils/format.ts` |
| Formateo de moneda | `formatCOP` ya existe y se usa en la mayoría de pantallas | Reutilizar, NO crear otro |
| Dirección activa | No hay tabla `addresses`. Existe `LAST_DELIVERY_ADDRESS` en `localStorage` (la guarda Checkout) | Usar esa como fuente de "Entregar en" |
| Ciudad mostrada en Home | `useLocationLabel.ts` — geolocalización por GPS/IP (ipapi.co/Nominatim), pide permiso al abrir la app | Eliminar: la IP ubica al usuario donde esté conectado, no donde entrega Domicilios Riohacha |
| Coral como texto | `#FF5A6B` usado como color de texto en ≥ 10 lugares (Cart, Checkout, OrderSummaryCard, MenuProductCard, FeaturedProductStrip…) | Auditar y contar (sección 12); NO migrar en este LOOP |
| `prefers-reduced-motion` | Bloque `@media` ya existe en `styles.css` | Verificar cobertura, no reescribir |

## 2.2 Lo que NO existe (y no se inventa)

| Pedido | Realidad | Consecuencia |
|---|---|---|
| `CategoryCircle` / `CategoryCard` como componentes propios | Es un `.map` inline dentro de `CategoryScroller.tsx` | Refactor a11y **dentro** de `CategoryScroller`, no crear un componente nuevo con otro nombre |
| Tabla de direcciones (`addresses`) | No existe en el modelo | "Ciudad" sale de la dirección guardada localmente + `, Riohacha` fijo, nunca de GPS/IP |
| Segundo primario / segunda paleta | No existe hoy, pero si no se documenta bien el mapeo `styles.css` ↔ `tailwind.config.ts`, el próximo LOOP puede crear uno sin darse cuenta | Un solo comentario de mapeo al inicio de `styles.css` |

---

# 3. NO CREAR UN SEGUNDO…

```text
Design System (tokens, Button, paleta)
color primario
helper de moneda (ya existe formatCOP)
hook de geolocalización
```

No instalar librerías de i18n de nombres, ni paquetes de acentuación
automática (`accents`, `diacritics`) para el diccionario de tildes: es una
tabla estática de ~50-60 entradas, no un problema de librería.

---

# 4. TOKENS: UNA SOLA FUENTE DE VERDAD

`styles.css` declara `--brand: #2F5EFF` (azul eléctrico legacy).
`tailwind.config.ts` ya tiene `brand.500: #2E3A8C` (azul profundo del
cohete de marca). Resultado: focus rings, `::selection` y `.text-gradient`
pintan con un azul que **no existe** en ninguna otra parte de la UI — un
desajuste que solo se ve al interactuar (seleccionar texto, tabular), pero
real.

Unificar a un solo sistema, con `styles.css` como el que se corrige (el
Tailwind config ya está bien):

```text
--brand           #1C2459   (brand-700 — azul profundo del cohete) → foco, selección
--brand-soft      #2E3A8C   (brand-500 = primary) → hover, activo
--brand-gradient  linear-gradient(135deg, #1C2459 0%, #F4652C 62%, #FFC24B 100%)
                  → acentos, hero, `.text-gradient`
```

Reglas:

- `::selection` pasa de `rgba(47, 94, 255, 0.25)` a `rgba(28, 36, 89, 0.20)`.
- `.text-gradient` deja de mezclar `var(--brand)` con `#5A85FF` (dos azules
  sin contraste entre sí) y usa `var(--brand-gradient)`.
- Los neutros (`--fg`, `--fg-muted`, `--border`, `--bg-soft`, `--bg-muted`)
  se alinean a la escala stone que ya usa Tailwind (`gray-900`, `gray-500`,
  etc.), no a slate.
- Documentar el mapeo completo en un comentario al inicio de `styles.css`
  (variable CSS ↔ token Tailwind), para que el próximo LOOP no tenga que
  releer ambos archivos para saber cuál es la fuente de verdad.
- `index.html` tiene un `meta theme-color` oscuro (`#0A0F1E`) que contradice
  la decisión de producto de ser una app **solo-claro** (sin modo oscuro).
  Eliminarlo; dejar un único `theme-color` con `#1C2459`.
- `vite.config.ts` (manifest de la PWA) probablemente sigue con el azul
  viejo en `theme_color`: **NO tocarlo** en este LOOP (fuera de alcance,
  cambia el manifest); reportarlo como pendiente con el visto bueno de
  Jorge.

---

# 5. FORMATEO DE NOMBRES

Home muestra el primer nombre del usuario en minúscula ("jose"); Cuenta
muestra el nombre completo también en minúscula ("jose luis"). Se ve como
un descuido, no como un dato real.

Crear `src/shared/utils/format.ts` (archivo nuevo — no existe hoy ningún
helper de nombres):

```ts
export function formatFirstName(raw?: string | null): string
export function formatFullName(raw?: string | null): string
```

Comportamiento:

- Capitaliza por palabra.
- Diccionario mínimo de tildes frecuentes en nombres/apellidos colombianos
  (José, María, Lucía, Sofía, Andrés, Ramón, Martín, Ángel, etc. — no hace
  falta exhaustividad, sí cobertura razonable).
- Si el nombre ya trae tildes, se respetan (no se "sobre-corrigen").
- Colapsa espacios dobles ("juan  carlos" → "Juan Carlos").
- `null` / `undefined` / `""` → `""`, sin lanzar.
- No rompe con emojis, números o símbolos sueltos; con guiones ("Ana-María")
  capitaliza ambos lados.

Aplicar:

- Home (`ClientDashboardPage` / su header): `formatFirstName` en el saludo.
- Cuenta del cliente (`ClientAccountPage`): `formatFullName` solo al
  **renderizar**, nunca al guardar — si el usuario escribe su nombre en un
  input en vivo, se respeta tal cual lo escribe.
- Perfil del domiciliario (`delivery/pages/ProfilePage.tsx`): si el
  formulario de edición guarda todos los campos juntos, **no** aplicar el
  formateo al input (reescribiría el nombre en backend al guardar); aplicar
  solo donde se muestra de forma no editable, si existe ese lugar.

---

# 6. CIUDAD EN HOME (SIN GPS NI IP)

Home muestra una ciudad que no es Riohacha (el caso real fue
"Montelíbano"), porque la ubicación sale de geolocalización por GPS/IP
(`useLocationLabel.ts`, con `ipapi.co`/Nominatim como respaldo) — la IP
ubica al usuario donde esté conectado a internet, no donde Domicilios
Riohacha realmente entrega.

La app es de **una sola ciudad** (Riohacha). No existe tabla `addresses` ni
campo de ciudad en el modelo. Reemplazar:

- Fuente real: la dirección que ya guarda Checkout en `localStorage`
  (`LAST_DELIVERY_ADDRESS`) — mostrar la calle + `, Riohacha`.
- Sin dirección guardada → mostrar `"Riohacha"` a secas (fallback fijo, NO
  "Elegir dirección" con una acción que no existe: no hay pantalla de
  selección de dirección fuera de Checkout).
- Eliminar `useLocationLabel.ts` y cualquier permiso de geolocalización que
  se pida al abrir la app — no debe volver a llamarse GPS ni a los
  servicios de IP.
- El chevron ▾ que acompaña "Entregar en" puede quedarse visualmente (no
  romper el layout), pero **sin acción real** detrás — documentar como
  deuda, no fingir que abre algo.

---

# 7. A11Y — CATEGORÍAS (CategoryScroller)

Los círculos de categoría (Pizza, Burgers, Sushi, Postres, Bebidas,
Mariscos) ya son parte de `CategoryScroller.tsx`. Verificar/corregir:

- Cada círculo es un `<button type="button">` real (no un `div` con
  `onClick`).
- `aria-label` descriptivo: `"Categoría Pizza"`, etc.
- El emoji/ícono es decorativo → envolver en `<span aria-hidden="true">`
  (o el ícono lucide con `aria-hidden`, según lo que use hoy el
  componente).

---

# 8. A11Y — BADGE DE NOTIFICACIONES

`NotificationBell.tsx`: el badge numérico sobre la campana necesita
`aria-label` descriptivo en el **botón contenedor** (no en el número
suelto): `"Notificaciones, 4 sin leer"` (con variante para "más de 99" si
aplica). El número visible dentro del badge queda `aria-hidden`.

---

# 9. A11Y — CORAZÓN DE FAVORITOS (RestaurantGridCard)

El botón de favorito en `RestaurantGridCard.tsx` debe tener:

- `aria-pressed` reflejando el estado real (favorito / no favorito).
- `aria-label` de acción con el nombre del restaurante: `"Guardar {nombre}
  en favoritos"` / `"Quitar {nombre} de favoritos"`.
- El ícono de corazón es decorativo (`aria-hidden`).
- Activable con Enter y Espacio (no solo click/tap).

---

# 10. A11Y — CHIPS DE FILTRO (ExploreFilterChips)

Decidir y documentar un solo patrón, sin mezclarlo:

- Si los chips son togglables independientes entre sí (ej. "Abiertos" se
  puede combinar con una categoría) → `aria-pressed`, **no** `role="tab"`.
- Si en algún punto se vuelven mutuamente excluyentes → recién ahí
  `role="tablist"`/`role="tab"`.
- Para el estado actual de `ExploreFilterChips` (categoría + "Abiertos"
  combinables): usar `aria-pressed` y dejarlo escrito en un comentario para
  que CLIENT_02 no lo cambie sin querer.

---

# 11. EMOJIS DECORATIVOS

Todo emoji que no aporte información por sí mismo (🍕🍔🍣🍰🥤👋🟢, etc.) va
envuelto en un elemento con `aria-hidden="true"`. Si el emoji **es** la
única fuente de un dato (poco probable en este LOOP), no se oculta; en ese
caso preferir texto o `aria-label` en el contenedor en vez del emoji suelto.

---

# 12. AUDITORÍA DE CORAL COMO TEXTO (SIN MIGRAR AQUÍ)

`#FF5A6B` (coral) se usa como color de **texto** en varios lugares del
carrito, checkout, resumen de pedido y tarjetas de producto. Contraste
real sobre blanco: **verificar con una herramienta de contraste** (no
asumir un número de memoria) — es candidato a fallar WCAG AA para texto
normal (mínimo 4.5:1).

Alcance de este LOOP:

- **Auditar y listar** cada archivo/línea donde coral se usa como texto
  (no como fondo de badge, donde el contraste es otro cálculo).
- **No migrar los colores aquí**: Cart y Checkout están fuera de alcance de
  CLIENT_01.
- Documentar la decisión en el reporte final y mover la migración a un LOOP
  dedicado (`LOOP_CORAL` o equivalente) si el número de ubicaciones es alto.

---

# 13. FOCUS RINGS

Verificar `:focus-visible` en todos los elementos interactivos tocados por
este LOOP (BottomNav, círculos de categoría, chips, corazón de favoritos,
botones del header de Home):

- Debe aparecer navegando con teclado (Tab).
- NO debe aparecer con click/tap del mouse o touch.
- Si algún componente tiene `outline: none` sin un `:focus-visible`
  alternativo, agregar uno (reutilizar la utilidad `.focus-ring` /
  `outline: 2px solid var(--brand)` que ya define `styles.css`, no crear
  una nueva).

---

# 14. TIPOGRAFÍA Y ESPACIADO

- Títulos usan `font-display` (Sora); cuerpo usa `font-sans` (Inter). Si
  algún título de las pantallas tocadas usa `font-sans` por error,
  corregirlo. No dejar `font-family` inline en componentes.
- Padding lateral consistente en Home (`px-4` o `px-5` — el que ya sea
  predominante; no mezclar ambos en la misma pantalla).
- Separación vertical entre secciones de Home consistente (mismo valor de
  `mb-*`/`gap-*` para bloques del mismo nivel).

---

# 15. SAFE AREAS

- El header de Home respeta `env(safe-area-inset-top)` (no debe quedar
  bajo el status bar/notch).
- `BottomNav` respeta `env(safe-area-inset-bottom)` (no debe quedar bajo el
  home indicator de iPhone).
- Usar las utilidades `.safe-top` / `.safe-bottom` que ya existen en
  `styles.css`, no reinventar el cálculo.

---

# 16. RESPONSIVE

Verificar Home en 320, 360, 375, 390, 412, 430, 768 y 1024px:

- Sin overflow horizontal.
- Sin texto cortado a media palabra donde no debería.
- Touch targets ≥ 44×44 (reutilizar `.touch-target` si ya existe esa
  utilidad).
- El hero/banner superior no debe ocupar más del ~40% del viewport visible
  en los tamaños de celular más chicos.

---

# 17. REDUCED MOTION

`styles.css` ya tiene el bloque `@media (prefers-reduced-motion: reduce)`.
Verificar que cubra TODO lo animado en Home hoy (incluyendo cualquier
animación flotante o de entrada que ya exista), no solo lo que el bloque
cubría al momento de escribirlo. Si aparece una animación nueva en este
LOOP, debe respetar el mismo bloque, sin crear una segunda regla de reduced
motion.

---

# 18. CONSOLE CLEAN

Abrir Home, Cuenta/Perfil, navegar entre tabs del `BottomNav`.

```text
0 errores
0 warnings de React (keys, act())
0 warnings/errores de Supabase
```

---

# 19. BUILD, LINT Y TYPECHECK

```bash
npm run build
npm run lint        # hoy = tsc --noEmit (no hay ESLint)
npm run type-check
```

0 errores de TypeScript, 0 de Vite, bundle sin regresión relevante de
tamaño.

---

# 20. TESTS

Crear `src/shared/utils/format.test.ts`:

```ts
formatFirstName('jose')          === 'José'
formatFirstName('jose luis')     === 'José Luis'
formatFirstName('JOSE LUIS')     === 'José Luis'
formatFirstName('maria')         === 'María'
formatFirstName('juan  carlos')  === 'Juan Carlos'  // doble espacio
formatFirstName('')              === ''
formatFirstName(null)            === ''
formatFirstName(undefined)       === ''
```

Render / integración (extender los patrones de test que ya existan para
`useAuth`/`useLocalData`, no crear un runner nuevo):

```text
getByLabelText('Categoría Pizza') existe
getByLabelText(/sin leer/) existe en NotificationBell
Corazón de favorito: aria-pressed refleja el estado
```

---

# 21. QA CRÍTICO

Probar manualmente:

1. Home carga sin errores de consola.
2. "jose" se muestra como "José".
3. "jose luis" se muestra como "José Luis" en Cuenta.
4. La ciudad mostrada es "Riohacha" (o la calle guardada + ", Riohacha"),
   nunca una ciudad distinta por IP.
5. Focus ring visible con Tab, no con click.
6. `::selection` pinta con el azul profundo nuevo, no con el azul eléctrico
   viejo.
7. `.text-gradient` (donde se use) muestra el degradado atardecer, no dos
   azules sin contraste.
8. Axe DevTools → 0 violaciones críticas en Home.
9. Axe DevTools → 0 violaciones críticas en Cuenta/Perfil.
10. Lighthouse mobile → a11y ≥ 95 en Home.
11. Corazón de favorito con `aria-pressed` correcto y anuncia la acción.
12. Emojis decorativos no se anuncian en lector de pantalla.
13. `BottomNav` no tapa contenido (safe-area correcta).
14. Home se ve bien en 320px sin overflow.
15. Home se ve bien en un iPhone con notch (safe-area superior).

---

# 22. CRITERIOS DE ÉXITO

- [ ] `styles.css` y `tailwind.config.ts` comparten una sola fuente de
      verdad de color, con el mapeo documentado
- [ ] `--brand`, `--brand-soft`, `--brand-gradient` alineados al azul del
      cohete (no al azul eléctrico legacy)
- [ ] `::selection` y `.text-gradient` usan los tokens nuevos
- [ ] `theme-color` de `index.html` único, sin variante oscura
- [ ] `formatFirstName` / `formatFullName` creados, con tests, aplicados en
      Home y Cuenta sin tocar el guardado en backend
- [ ] Ciudad de Home viene de la dirección guardada localmente +
      ", Riohacha", nunca de GPS/IP
- [ ] `useLocationLabel` (GPS/IP) eliminado, sin permiso de ubicación al
      abrir la app
- [ ] Círculos de categoría son `button` reales con `aria-label` y emoji
      `aria-hidden`
- [ ] Badge de notificaciones con `aria-label` descriptivo en el botón
      contenedor
- [ ] Corazón de favoritos con `aria-pressed` + `aria-label` de acción
- [ ] Chips de filtro con un patrón de a11y decidido y documentado
      (`aria-pressed`, no tabs, en el estado actual)
- [ ] Emojis decorativos con `aria-hidden`
- [ ] Auditoría de coral-como-texto completa y documentada (sin migrar)
- [ ] Focus rings visibles solo con teclado en todos los elementos tocados
- [ ] Tipografía y espaciado de Home consistentes
- [ ] Safe areas correctas arriba y abajo
- [ ] Sin overflow horizontal en 320–1024px
- [ ] Reduced motion cubre toda la animación existente
- [ ] Segundo design system (`src/design-system/`) eliminado
- [ ] `HomePage.tsx` y `RestaurantCard.tsx` (código muerto) eliminados
- [ ] Sin componentes ni tokens paralelos
- [ ] Sin features nuevas agregadas
- [ ] Consola limpia
- [ ] Build exitoso
- [ ] Lint (tsc) exitoso
- [ ] Tests pasando
- [ ] Lighthouse a11y ≥ 95 en Home (validación de Jorge)
- [ ] Axe 0 violaciones críticas en Home y Cuenta (validación de Jorge)
- [ ] Sin regresiones en CartContext ni en pantallas fuera de alcance

---

# 23. REPORTE FINAL

Al finalizar entrega (en `docs/loops/LOOP_CLIENT_01_REPORTE.md`):

IMPLEMENTADO — resumen técnico.

ARCHIVOS MODIFICADOS / CREADOS / ELIMINADOS — lista exacta.

TOKENS — tabla antes/después de cada variable tocada.

HELPERS — qué exporta `format.ts` y dónde se aplica.

CIUDAD EN HOME — de dónde sale ahora, qué se eliminó.

A11Y — lista de `aria-*` agregados por componente.

CORAL AUDIT — ubicaciones encontradas, contraste real medido, decisión
(migrar acá o mover a LOOP dedicado).

TESTS

```text
Build:     OK / FAIL
Lint:      OK (tsc) / FAIL
Typecheck: OK / FAIL
Tests:     OK / FAIL  (antes N / después M)
```

QA — cuáles de los 15 casos se validaron y cuáles quedan para Jorge.

PROBLEMAS ENCONTRADOS — fuera de alcance.

DEUDA TÉCNICA GENERADA.

PREPARACIÓN PARA LOOP_CLIENT_02 — Restaurantes + Búsqueda + Filtros.

---

# 24. LO QUE NO DEBES HACER

- NO agregar pantallas ni features nuevas.
- NO refactorizar `CartContext` ni tocar Checkout.
- NO tocar `sw.ts`, el manifest de la PWA ni rutas.
- NO cambiar la base de datos.
- NO instalar dependencias nuevas sin justificar.
- NO crear un segundo design system, un segundo color primario, ni tokens
  paralelos (`newTokens`, `designV2`, `brandColors`).
- NO crear `CategoryCircle`/`CategoryCard` como componente nuevo si el
  patrón ya vive dentro de `CategoryScroller`.
- NO migrar el coral en este LOOP (se audita, no se toca).
- NO cambiar copy aprobado sin autorización.
- NO cambiar el gradiente del hero ni el layout general de Home.
- NO dejar código muerto a medio borrar: si se elimina
  `src/design-system/`, `HomePage.tsx`, `RestaurantCard.tsx` o
  `useLocationLabel.ts`, confirmar 0 imports restantes antes de borrar.

---

# 25. REGLA FINAL

Este LOOP es invisible para el usuario pero fundacional para todo lo que
viene después.

Si los tokens están desalineados, los focus rings se ven raros, el
`::selection` se ve raro y los degradados se ven raros: la marca pierde
coherencia en el primer contacto con cualquier interacción.

Si los bugs de Home no se corrigen, el usuario ve su nombre en minúscula
(parece descuido) y una ciudad que no es la suya (parece que la app no
sabe dónde está).

Prioridad:

CORRECCIÓN → CONSISTENCIA → A11Y → CLARIDAD → ESTÉTICA

Si tienes que elegir entre agregar una feature nueva o dejar el sistema de
tokens limpio:

deja el sistema limpio.

Las features nuevas construidas sobre un design system inconsistente
heredan la inconsistencia.
