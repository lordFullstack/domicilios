# LOOP_CLIENT_02 — RESTAURANTES + BÚSQUEDA + FILTROS + ESTADOS

## ROL

Actúa como:

**Senior Frontend Engineer + Search Engineer + Mobile UX Engineer + Accessibility Specialist + Data Fetching Specialist**

Continúa trabajando sobre el repositorio existente de Domicilios Riohacha.

LOOP_CLIENT_01 dejó:

- Una sola paleta (`styles.css` ↔ `tailwind.config.ts`), mapeo documentado
- `src/shared/utils/format.ts` (`formatFullName`, `formatFirstName`)
- `src/shared/hooks/usePrefersReducedMotion.ts`
- A11y básica en Home: `type="button"`, `aria-pressed` en favoritos y chips, emojis `aria-hidden`
- `success-strong` / `warning-strong` para texto con contraste AA
- Patrón de tests con mocks de `useAuth` / `useLocalData`

Este LOOP convierte la pantalla de Restaurantes en una pantalla de descubrimiento
confiable: búsqueda que responde, filtros que se entienden, URL compartible y
estados de carga/vacío/error bien resueltos.

> **NO ES UN LOOP DE CONSTRUIR DESDE CERO.**
> La mayor parte de la infraestructura ya existe (ver sección 2).
> El trabajo es completar, conectar y corregir — no duplicar.

---

# 1. REGLA ABSOLUTA

ANTES DE MODIFICAR:

INSPECCIONA.

No asumas nada. No inventes nombres de archivos. No crees archivos
paralelos. Primero lee lo que ya existe.

Busca en el repositorio:

```text
RestaurantListPage
useRestaurants
useFavorites
filters.ts
filterAndSortRestaurants
ExploreSearchInput
ExploreFilterChips
ExploreFilterSheet
RestaurantGridCard
RestaurantsGrid
RestaurantCardsSkeleton
Skeleton
EmptyState
BottomSheet
RESTAURANT_CATEGORIES
useSearchParams
debounce
normalize
```

Reporta antes de escribir código si algo de la sección 2 cambió desde la
auditoría (Jorge hace cambios entre sesiones).

---

# 2. ESTADO REAL AUDITADO (22-sep-2026)

No volver a construir lo que ya está. Esta tabla manda sobre cualquier
nombre genérico del resto del documento.

| Pieza pedida | Qué existe HOY | Acción |
|---|---|---|
| RestaurantsPage | `features/client/pages/RestaurantListPage.tsx` (110 líneas), ruta `/app/restaurants` | Refactor, NO renombrar |
| RestaurantCard | `RestaurantGridCard.tsx` (el `RestaurantCard.tsx` legacy se borró en CLIENT_01) | Reutilizar |
| RestaurantGrid | Grid inline en `RestaurantListPage` + `RestaurantsGrid.tsx` del Home (con título y "Ver todos") | Decidir extracción (sección 12) |
| RestaurantCardSkeleton | `shared/components/RestaurantCardsSkeleton.tsx` (misma geometría que la card) | Reutilizar + a11y |
| EmptyState | `shared/components/EmptyState.tsx` | Reutilizar + `role` |
| useRestaurants | `hooks/useLocalData.ts` → Supabase directo, `useState/useEffect`, `reload()` | Reutilizar, NO crear otro |
| Filtrado | `features/client/utils/filters.ts` → `filterAndSortRestaurants` (client-side, con tests) | Extender |
| Chips | `ExploreFilterChips.tsx` (Todos / 🟢 Abiertos / categorías / Filtros) con `aria-pressed` | Extender |
| Sort | `ExploreFilterSheet.tsx` (bottom sheet): "Mejor calificados", "Nombre (A-Z)" | Extender |
| Input de búsqueda | `ExploreSearchInput.tsx` con `aria-label` y botón "Limpiar búsqueda" | Extender |
| Categorías | `RESTAURANT_CATEGORIES` en `config/constants.ts` (value, label, emoji, icon) | Reutilizar |
| Debounce | No existe | Ver sección 5 (probablemente NO hace falta) |
| Normalización de tildes | No existe | Crear en `shared/utils/format.ts` (NO archivo nuevo) |
| useSearchParams / deep links | No existe | Crear `useRestaurantFilters` |
| Distancia / geolocalización de restaurantes | NO existe: `restaurants` no tiene lat/lng | Sort por cercanía NO aplica |
| Tiempo de entrega | NO existe campo | Sort por tiempo NO aplica |
| Envío gratis | NO existe `delivery_fee`: hoy todo es gratis | Sort "envío gratis primero" NO aplica |
| Zonas de cobertura | NO existen | Ver sección 9 |
| Favoritos | `useFavorites` en `useLocalData.ts`: espera respuesta + `reload()` (NO optimista) | Hacer optimista (sección 11) |
| Fetching layer | No hay React Query en uso (instalado pero NO se usa, regla del LOOP MAESTRO) | NO introducirlo |

Contexto de negocio: single-tenant, un restaurante real ("Asados") más los
que el Admin apruebe. El volumen es de unidades, no de cientos.

---

# 3. NO CREAR UN SEGUNDO FETCHING LAYER

`useRestaurants({ approvedOnly: true })` ya trae la lista completa de
restaurantes aprobados, ordenada por `rating_avg` desc y luego `name`.

No crear:

```text
useRestaurantsQuery
restaurantService.search
fetchRestaurants
useRestaurantsV2
```

No introducir TanStack Query, SWR ni Zustand para esta pantalla.

---

# 4. FILTRADO: CLIENT-SIDE (DECISIÓN DOCUMENTADA)

El filtrado sigue siendo **client-side** sobre el array que ya está en memoria.

Motivo:

```text
Volumen real:   unidades de restaurantes (single-tenant)
Paginación:     no existe en backend
Costo por tecla: 0 requests
Latencia:        < 16 ms (un filtro sobre un array pequeño)
```

Reglas:

· Fuente única: `filterAndSortRestaurants` en `utils/filters.ts`.
· NO agregar también un filtro server-side (duplicaría la verdad).
· NO usar AbortController: no hay requests por tecla que cancelar.
· Si algún día el volumen supera ~200 restaurantes o se agrega paginación,
  migrar a RPC en Supabase en un LOOP dedicado.

Documentar esta decisión en un comentario en `filters.ts` (ya existe uno:
actualizarlo, no duplicarlo).

---

# 5. BÚSQUEDA

## 5.1 Qué busca

Sobre:

· `restaurant.name`
· `restaurant.category`
· `restaurant.description` (existe en el modelo, hoy no se usa en búsqueda)

Búsqueda por **platos**: fuera de alcance. Requiere cargar productos de
todos los restaurantes (una query más). Queda como deuda para un LOOP de
Search global.

## 5.2 Normalización

Agregar a `src/shared/utils/format.ts`:

```ts
export function normalizeText(raw: string | null | undefined): string
```

Comportamiento:

```text
"Pizzá"        → "pizza"
"PIZZA"        → "pizza"
"  pa  comer " → "pa comer"
"Ñame"         → "name"
null/undefined → ""
```

Implementación: `NFD` + quitar diacríticos (`\p{Diacritic}` o rango
combinante) + `toLocaleLowerCase('es-CO')` + colapsar espacios.

Aplicar normalización a AMBOS lados (término y campos).

## 5.3 Debounce

Con filtrado client-side sobre pocos elementos, el debounce **agrega
latencia sin ahorrar nada**.

Regla:

· NO crear `useDebouncedValue` si no se usa.
· Filtrar en cada tecla (render inmediato).
· El debounce SÍ aplica a la escritura del `?q=` en la URL (sección 6):
  escribir en `searchParams` en cada tecla llena el historial. Usar
  `replace: true` para `q` y evaluar si con eso basta antes de crear un hook.
· Si al final se necesita debounce, crear UN hook genérico en
  `src/shared/hooks/useDebouncedValue.ts` con test de fake timers.

Spinner de "buscando": NO aplica (no hay espera). No simular carga.

## 5.4 Coincidencia

· Substring normalizado (`includes`). NO fuzzy.
· NO instalar Fuse.js ni similares (no existe en el repo, no se justifica
  con este volumen).

---

# 6. DEEP LINKS — useSearchParams

Crear:

```text
src/features/client/hooks/useRestaurantFilters.ts
```

Responsabilidad única: leer/escribir búsqueda + filtros + sort desde la URL.
Reemplaza los `useState` de `search` y `filters` en `RestaurantListPage`.

## 6.1 Parámetros (nombres exactos)

```text
?q=      término de búsqueda (texto libre)
?cat=    categoría en minúscula: pizza | burgers | sushi | postres | bebidas | asados | mariscos
?open=1  solo abiertos (ausente = todos)
?sort=   recommended | rating | name   (ausente = recommended)
```

Ejemplos:

```text
/app/restaurants?cat=pizza&open=1
/app/restaurants?q=pa%20comer&sort=rating
```

## 6.2 Reglas

· Params inválidos se ignoran en silencio (`?cat=tacos` → sin categoría).
  Nunca crashear por una URL editada a mano.
· Mapear `cat` ↔ `RestaurantCategory` con `RESTAURANT_CATEGORIES`
  (el value real es "Pizza"; la URL usa "pizza").
· Valores por defecto NO se escriben en la URL (URL limpia).
· Cambios de chip/sort → `setSearchParams(next)` (push: Back restaura).
· Cambios de `q` → `replace: true` (no un paso de historial por tecla).
· Refresh y compartir URL abren con los mismos filtros.
· NO cambiar rutas (regla heredada de CLIENT_01).

## 6.3 Tests

· Deep link `?cat=pizza&open=1` → chips "Pizza" y "Abiertos" activos.
· `?cat=inexistente` → sin filtro, sin error.
· Cambiar chip → URL actualizada.

---

# 7. SORT

Opciones que SÍ tienen dato real:

```text
recommended  → orden del backend (rating_avg desc, name asc)  [default]
rating       → mejor calificados: rating_avg desc; desempate rating_count desc; luego name
name         → Nombre (A-Z)
```

Diferencia entre `recommended` y `rating`: `rating` pone primero los que
tienen calificaciones reales (`rating_count > 0`); un restaurante nuevo sin
calificaciones no le gana a uno con 4.5 de 30 votos.

Opciones pedidas que NO se implementan (no inventar datos):

```text
Cercanía              → restaurants no tiene coordenadas
Tiempo de entrega     → no existe el campo
Envío gratis primero  → no existe delivery_fee (hoy todo es gratis)
```

Documentarlas en deuda técnica, no mostrarlas deshabilitadas.

UI del sort: reutilizar `ExploreFilterSheet` (bottom sheet, mobile-first).
NO crear un dropdown paralelo.

Agregar tests de `sortRestaurants` por cada criterio (extender
`filters.test.ts`, no crear otro archivo).

---

# 8. FILTROS (CHIPS)

Chips existentes: Todos · 🟢 Abiertos · categorías · Filtros.

Comportamiento esperado:

```text
Todos      → limpia categoría + abiertos (NO limpia q ni sort)
Abiertos   → toggle independiente
Categoría  → una a la vez; tocar la activa la desactiva
Abiertos + Pizza → intersección
Filtros    → abre el sheet (sort + categoría + abiertos)
```

A11y: mantener `aria-pressed` (decisión documentada en CLIENT_01: "Abiertos"
se combina con una categoría, NO son tabs mutuamente excluyentes). NO
cambiar a `role="tab"`.

Scroll horizontal: agregar el mismo indicador de desvanecido que usa
`CategoryScroller` (`mask-image`), no un indicador nuevo.

Si el chip activo queda fuera de vista al abrir con deep link, hacer
`scrollIntoView({ inline: 'center', block: 'nearest' })` respetando
`usePrefersReducedMotion` (`behavior: 'auto'` si reduce).

## 8.1 "Limpiar filtros"

· Botón visible cuando hay ≥ 2 filtros activos (contando `q`).
· NO flotante fijo: evitar un tercer elemento fijo compitiendo con
  `CartFloatingBar` y `BottomNav`. Colocarlo inline junto al contador
  (sección 10). Si Jorge prefiere flotante, validar primero que no tape
  `CartFloatingBar`.
· Limpia q + categoría + abiertos + sort → URL limpia.

---

# 9. ESTADOS DE LA UI

Todos deben existir y ser distinguibles:

| Estado | Cuándo | UI |
|---|---|---|
| Carga inicial | `loading && restaurants.length === 0` | `RestaurantCardsSkeleton` |
| Recarga (retry) | `loading && restaurants.length > 0` | Mantener grid; indicador sutil. NO volver al skeleton |
| Con resultados | `results.length > 0` | Grid |
| Sin resultados por filtros | `restaurants.length > 0 && results.length === 0` | EmptyState "No encontramos restaurantes con esos filtros" + CTA "Limpiar filtros" |
| Catálogo vacío | `!loading && !error && restaurants.length === 0` | EmptyState "Todavía no hay restaurantes disponibles" sin CTA de filtros |
| Error de red | `error` y `navigator.onLine === false` o fallo de fetch | Error state + "Reintentar" |
| Error de permisos/RLS | error con código `42501` / `PGRST301` | Error state con copy distinto ("No tienes acceso…") |

## 9.1 "Zona sin cobertura"

NO existe el concepto de zona ni de selección de dirección fuera de
Checkout. El caso "Cambiar dirección" **no aplica** en este LOOP.

El equivalente real es "Catálogo vacío". Documentar en deuda técnica.
NO crear un CTA "Cambiar dirección" que no lleva a ningún lado.

## 9.2 Errores

· Hoy `useRestaurants` guarda `'Error cargando restaurantes'` y pierde el
  código. Para distinguir red vs permisos, exponer un `errorKind:
  'network' | 'permission' | 'unknown'` desde el MISMO hook (sin romper
  la firma actual para Home y Admin).
· Copy amigable, nunca "Supabase error" ni el mensaje crudo.
· `console.error` técnico se mantiene (es el logging que existe hoy).

## 9.3 Offline

Si existe caché IndexedDB (`offlineCache.service.ts`) para esta lista,
reutilizarla y mostrar `OfflineDataBadge`. Si no existe para restaurantes,
NO crearla aquí: documentar.

---

# 10. CONTADOR DE RESULTADOS

Arriba del grid, reemplazando el título actual ("Cerca de ti" /
"Resultados para…"):

```text
12 restaurantes
1 restaurante
3 resultados para "pizza"
```

· NO decir "cerca de ti": no hay dato de distancia.
· Singular/plural correcto.
· `aria-live="polite"` + `aria-atomic="true"`.
· Durante la carga inicial no mostrar "0 restaurantes" (mostrar nada o
  "Cargando…" solo para lectores).
· Mantener un `<h2>` real (jerarquía h1 → h2); el contador puede ser el h2
  o un `<p>` con live region debajo, pero NO saltar a h3.

---

# 11. FAVORITOS — OPTIMISTIC UPDATE

Modificar `toggleFavorite` en `useFavorites` (`hooks/useLocalData.ts`),
NO crear un hook nuevo:

```text
1. Guardar estado previo
2. setFavorites(next) inmediatamente
3. Llamar a Supabase
4. Si falla → setFavorites(prev) + devolver false
5. Si funciona → NO hacer reload() completo (ya está sincronizado)
```

· Bloquear doble tap mientras hay request (ya existe `pending` en
  `RestaurantGridCard`: conservarlo).
· En error, avisar con `Toast` existente ("No pudimos guardar tu
  favorito"). NO crear otro sistema de toasts.
· Test: rollback cuando Supabase devuelve error.

No existe LOOP_CLIENT_10: el cambio vive aquí.

---

# 12. GRID RESPONSIVE

Breakpoints pedidos:

```text
320        → 1 columna
360–767    → 2 columnas
768        → 3 columnas
1024+      → 4 columnas
gap        → gap-3 constante
```

Clases: `grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`.

Nota: `AppShell` limita el ancho a `max-w-md` (448px). En tablet/desktop el
contenido NO llega a 768px, así que 3/4 columnas no se ven. Decidir con
Jorge:

```text
A) Mantener max-w-md (la app cliente es mobile-first) y documentar
B) Ampliar AppShell solo en esta pantalla (afecta BottomNav/CartFloatingBar)
```

Por defecto: A. NO romper Home.

`RestaurantCardsSkeleton` debe usar EXACTAMENTE las mismas clases de grid
que el grid real (hoy ya comparten `grid-cols-2 md:… lg:…`): si cambian,
cambian ambos a la vez.

Extracción de componente: si el grid se reutiliza en Home y Restaurantes,
extraer SOLO la lista (`RestaurantGrid` = map de `RestaurantGridCard` + clases),
y que `RestaurantsGrid` del Home lo use. NO dejar dos grids con clases
distintas.

---

# 13. SCROLL

· Al cambiar filtros: NO saltar al tope si el usuario está viendo resultados;
  si la lista se acorta, dejar que el navegador ajuste.
· Al volver con Back desde el detalle de un restaurante: restaurar filtros
  (vía URL) y, si es viable sin librerías, la posición.
· Documentar lo que no se logre.

---

# 14. A11Y ESPECÍFICA

· Input: ya tiene `aria-label="Buscar restaurantes"`; agregar
  `type="search"` y `enterKeyHint="search"`.
· Botón limpiar búsqueda: ya tiene `aria-label`; verificar `type="button"`
  e ícono `aria-hidden`.
· Chips: `aria-pressed` (consistente con CLIENT_01).
· Contador: `aria-live="polite"`.
· Skeleton: hoy tiene `aria-hidden="true"` → cambiar a contenedor con
  `role="status"` + `aria-label="Cargando restaurantes"` y los bloques
  internos `aria-hidden`.
· EmptyState: agregar prop opcional `role` (`'status'` por defecto) e ícono
  `aria-hidden`. Error → `role="alert"`. NO crear un ErrorState paralelo:
  usar EmptyState con `role="alert"`.
· Grid: `role="list"` + wrapper `role="listitem"` por card SOLO si no rompe
  el `role="button"` de `RestaurantGridCard` (verificar con Axe).
· Botón volver del header: `type="button"` e ícono `aria-hidden`.
· Header: aplicar `pt-[max(1.5rem,env(safe-area-inset-top))]` como en Home.

---

# 15. PERFORMANCE

· `useMemo` para `filterAndSortRestaurants` (ya existe) con dependencias
  correctas tras el refactor a URL.
· Normalizar los campos de restaurantes UNA vez por carga (memo), no en
  cada tecla por cada restaurante.
· Imágenes: `loading="lazy"` + dimensiones (ya en `RestaurantGridCard`).
· CLS < 0.1: skeleton con misma geometría que la card.
· No agregar dependencias.

---

# 16. CONSOLE CLEAN

Abrir Restaurantes, buscar, filtrar, ordenar, abrir un restaurante, volver.

```text
0 errores
0 warnings de React / keys / act()
0 warnings de React Router (future flags ya activos desde CLIENT_01)
```

---

# 17. BUILD

```bash
npm run build
```

0 errores de TypeScript, 0 de Vite, bundle sin regresión.

---

# 18. LINT Y TYPECHECK

```bash
npm run lint        # hoy = tsc --noEmit (no hay ESLint)
npm run type-check
```

Reportar "Lint" como N/A-ESLint.

---

# 19. TESTS

Extender (NO duplicar) `features/client/utils/filters.test.ts`:

```ts
filterRestaurants(list, { q, cat, open })   // cada combinación
sortRestaurants(list, 'recommended' | 'rating' | 'name')
búsqueda "PIZZA" y "pizzá" encuentran "Pizza Palace"
búsqueda sobre description
```

En `shared/utils/format.test.ts`:

```ts
expect(normalizeText('Pizzá')).toBe('pizza')
expect(normalizeText('  PA  COMER ')).toBe('pa comer')
expect(normalizeText(null)).toBe('')
```

Hooks / integración (`RestaurantListPage.test.tsx`, con mocks de
`useLocalData` y `MemoryRouter` con future flags):

```text
· escribir en búsqueda → cambia el grid y el contador
· chip "Abiertos" → solo abiertos
· deep link ?cat=pizza&open=1 → chips activos y grid filtrado
· sin resultados → EmptyState + "Limpiar filtros" funcional
· error → role="alert" + "Reintentar" llama reload()
· favoritos: rollback en error
· useDebouncedValue con fake timers (SOLO si se crea)
```

E2E: no existe infraestructura (no Playwright/Cypress). NO instalarla en este
LOOP.

---

# 20. QA CRÍTICO

Probar manualmente:

1. Búsqueda vacía → muestra todos
2. Búsqueda "pa comer" → filtra correctamente
3. Búsqueda "PIZZA" → encuentra "Pizza Palace"
4. Búsqueda "pizzá" → encuentra "Pizza Palace"
5. Chip "Abiertos" → solo abiertos
6. Chip "Pizza" → solo pizza
7. "Abiertos" + "Pizza" → intersección
8. Sort "Mejor calificados" → orden correcto
9. Deep link `?cat=pizza` → filtro aplicado al cargar
10. Refresh con filtros → se mantienen
11. Back → restaura estado previo
12. Sin resultados → empty state con CTA
13. "Limpiar filtros" → vuelve a todos y URL limpia
14. Error de red (DevTools offline antes de cargar) → error state + retry
15. Catálogo vacío → empty state específico (reemplaza "zona sin cobertura")
16. 3G lento → skeleton visible, sin salto de layout
17. 320px → 1 columna, sin overflow
18. 1024px → según decisión de la sección 12
19. Favorito desde el grid → cambio inmediato y persiste tras refresh
20. Consola limpia en todos los flujos

---

# 21. CRITERIOS DE ÉXITO

☐ Búsqueda responde en < 500 ms (inmediata, client-side)
☐ Búsqueda tolerante a tildes y mayúsculas (`normalizeText`)
☐ Búsqueda incluye name + category + description
☐ Chips filtran correctamente
☐ Combinación de filtros = intersección
☐ Sort recommended / rating / name funciona
☐ Sorts sin dato real documentados, NO mostrados
☐ URL refleja `q`, `cat`, `open`, `sort`
☐ Refresh mantiene filtros
☐ Compartir URL abre con filtros
☐ Back restaura estado
☐ Params inválidos ignorados sin error
☐ Skeleton en carga inicial con `role="status"`
☐ Recarga NO vuelve al skeleton
☐ CLS < 0.1
☐ Empty state por filtros con "Limpiar filtros" funcional
☐ Empty state de catálogo vacío
☐ Error de red con retry y `role="alert"`
☐ Error de permisos con copy propio
☐ Contador con singular/plural y `aria-live`
☐ Grid 1/2 cols en 320/360 + decisión documentada para 768/1024
☐ Skeleton y grid comparten clases
☐ Favoritos optimistas con rollback y toast
☐ Sin componentes paralelos (grid, skeleton, empty state, sheet)
☐ Sin dependencias nuevas
☐ Consola limpia
☐ Build exitoso
☐ Lint (tsc) exitoso
☐ Tests pasando
☐ Lighthouse a11y ≥ 95 en Restaurantes (validación de Jorge)
☐ Axe 0 violaciones críticas (validación de Jorge)
☐ Sin regresiones en Home, BottomNav ni Carrito

---

# 22. REPORTE FINAL

Al finalizar entrega (en `docs/loops/LOOP_CLIENT_02_REPORTE.md`):

IMPLEMENTADO — resumen técnico.

ARCHIVOS MODIFICADOS / CREADOS / ELIMINADOS — lista exacta.

FUENTE DE DATOS — de dónde vienen los restaurantes.

FILTRADO — client-side vs server-side y por qué.

BÚSQUEDA — campos, normalización, debounce (usado o no y por qué).

FILTROS SOPORTADOS — lista exacta.

SORT SOPORTADO — lista exacta + los descartados y por qué.

URL PARAMS — nombres y valores exactos.

EMPTY / ERROR STATES — cuántos y cuándo aparece cada uno.

A11Y — `aria-*` agregados por componente.

TESTS

```text
Build:     OK / FAIL
Lint:      OK (tsc) / FAIL
Typecheck: OK / FAIL
Tests:     OK / FAIL  (antes N / después M)
```

QA — cuáles de los 20 casos se validaron y cuáles quedan para Jorge.

PROBLEMAS ENCONTRADOS — fuera de alcance.

DEUDA TÉCNICA GENERADA.

PREPARACIÓN PARA LOOP_CLIENT_03 — Detalle Restaurante + Menú + Variantes.

---

# 23. LO QUE NO DEBES HACER

· NO renombrar `RestaurantListPage` ni cambiar rutas.
· NO crear un segundo `useRestaurants`, fetching layer o store.
· NO instalar TanStack Query activo, SWR, Zustand, Fuse.js ni librerías de debounce.
· NO filtrar a la vez client-side y server-side.
· NO crear un segundo EmptyState, Skeleton, BottomSheet ni Toast.
· NO mostrar sorts sin dato real (cercanía, tiempo, envío gratis).
· NO crear CTA "Cambiar dirección" sin flujo real detrás.
· NO simular spinners de búsqueda.
· NO tocar Checkout, CartContext, `sw.ts` ni el manifest.
· NO cambiar la estructura de la base de datos.
· NO romper Home (comparte `RestaurantGridCard`, skeleton y grid).
· NO cambiar copy aprobado fuera de esta pantalla.
· NO mezclar con búsqueda de platos ni Search global.
· Archivos ≤ 300 líneas. `useLocalData.ts` ya tiene 1120: tocar solo lo
  necesario y registrar la deuda, NO partirlo en este LOOP.

---

# 24. REGLA FINAL

La pantalla de Restaurantes es donde el usuario decide qué va a comer.

Si la búsqueda no responde, si un filtro no aplica, o si el usuario ve
"Sin resultados" sin entender por qué, la conversión cae.

Prioridad:

CORRECCIÓN → VELOCIDAD PERCIBIDA → CLARIDAD → A11Y → ESTÉTICA

Si tienes que elegir entre un filtro más sofisticado o uno que simplemente
funcione bien:

elige el que funcione bien.

Y si un filtro necesita un dato que no existe:

no lo muestres.
