# LOOP_CLIENT_02 — Reporte final

## Implementado
La pantalla Restaurantes pasa a tener la URL como fuente de verdad (?q ?cat ?open ?sort), búsqueda tolerante a tildes/mayúsculas sobre nombre + categoría + descripción, orden "Recomendados / Mejor calificados / A-Z", contador vivo, estados de carga/vacío/error diferenciados y favoritos optimistas con rollback. Todo reutilizando lo existente: sin fetching layer nuevo, sin dependencias nuevas.

## Archivos modificados
- src/features/client/pages/RestaurantListPage.tsx
- src/features/client/utils/filters.ts (+ filters.test.ts)
- src/features/client/components/ExploreFilterChips.tsx
- src/features/client/components/ExploreFilterSheet.tsx
- src/features/client/components/ExploreSearchInput.tsx
- src/features/client/components/RestaurantGridCard.tsx
- src/features/client/components/RestaurantsGrid.tsx (Home: usa el grid compartido)
- src/hooks/useLocalData.ts (useRestaurants: errorKind + limpiar error; useFavorites: optimista)
- src/shared/components/EmptyState.tsx (prop role)
- src/shared/components/RestaurantCardsSkeleton.tsx
- src/shared/components/Toast.tsx (variant error + portal)
- src/shared/utils/format.ts (+ format.test.ts): normalizeText

## Archivos creados
- src/features/client/hooks/useRestaurantFilters.ts
- src/features/client/components/RestaurantGrid.tsx
- src/features/client/components/RestaurantLoadError.tsx
- src/shared/constants/grid.ts
- src/features/client/pages/RestaurantListPage.test.tsx
- src/hooks/useFavorites.test.ts
- docs/loops/LOOP_CLIENT_02.md

## Fuente de datos
`useRestaurants({ approvedOnly: true })` en `hooks/useLocalData.ts`: Supabase directo, `restaurants` con `approved = true`, ordenado por `rating_avg` desc + `name`. Sin cambios de BD.

## Filtrado: client-side
Volumen de unidades (single-tenant), sin paginación en backend: filtrar en memoria cuesta 0 requests y < 16 ms. Fuente única: `filterAndSortRestaurants`. Sin filtro server-side paralelo. Umbral para migrar a RPC: ~200 restaurantes.

## Búsqueda
- Campos: name + category + description.
- `normalizeText`: NFD sin diacríticos, minúsculas, espacios colapsados. Texto de cada restaurante normalizado una vez (WeakMap).
- Debounce: NO. El filtrado es inmediato; la URL se actualiza con `replace` (sin un paso de historial por tecla). El input usa estado local porque con `v7_startTransition` un input controlado por la URL perdía teclas.
- Sin fuzzy, sin Fuse.js, sin spinner simulado.

## Filtros soportados
Todos (limpia categoría + abiertos) · Abiertos (toggle) · una categoría a la vez (Pizza, Burgers, Sushi, Postres, Bebidas, Asados, Mariscos). Combinación = intersección.

## Sort soportado
- recommended (default): orden del backend
- rating: con votos primero → promedio → cantidad de votos → nombre
- name: A-Z

Descartados por falta de dato: cercanía (sin coordenadas del restaurante), tiempo de entrega (sin campo), envío gratis primero (no existe delivery_fee).

## URL params
`?q=<texto>` · `?cat=pizza|burgers|sushi|postres|bebidas|asados|mariscos` · `?open=1` · `?sort=rating|name`. Defaults no se escriben; inválidos se ignoran. Chips/sort crean entrada de historial (Atrás deshace), la búsqueda usa replace.

## Estados
1. Carga inicial → skeleton (`role="status"`, "Cargando restaurantes").
2. Recarga con datos → se mantiene el grid (`aria-busy`), sin volver al skeleton.
3. Con resultados → grid + contador.
4. Sin resultados por filtros → "No encontramos restaurantes con esos filtros" + "Limpiar filtros".
5. Catálogo vacío → "Todavía no hay restaurantes disponibles" (reemplaza "zona sin cobertura": no existen zonas).
6. Error de red → "Sin conexión" + Reintentar (`role="alert"`).
7. Error de permisos (42501 / PGRST301-302) → "No pudimos verificar tu sesión".
8. Error desconocido → "No pudimos cargar los restaurantes".

Bug corregido: `useRestaurants` nunca limpiaba el error, así que tras un Reintentar exitoso (también en el Home) la pantalla seguía en error.

## A11y
- Contador: `<h2 aria-live="polite" aria-atomic="true">`, siempre montado.
- Skeleton: `role="status"` + `aria-label`, bloques `aria-hidden`.
- EmptyState: `role="status"` por defecto, `role="alert"` en errores, ícono `aria-hidden`.
- Grid: `<ul role="list">` + `<li>`.
- Búsqueda: `enterKeyHint="search"`, sin X nativa duplicada, botón limpiar `type="button"`.
- Chips: `aria-pressed` (consistente con CLIENT_01), chip activo se centra con deep link respetando reduced motion, desvanecido de "hay más".
- Sheet: `role="radiogroup"` + `role="radio"`/`aria-checked` en orden y categoría; "Solo abiertos" como `role="switch"`.
- "Limpiar filtros" inline con 44 px de alto.
- Header con safe-area superior, botón volver `type="button"`.

## Tests
- Build: OK (tsc + vite build + dist/sw.js). Precache 978.71 → 983.99 KiB (+5 KiB por la funcionalidad nueva).
- Lint: OK (tsc; no hay ESLint).
- Typecheck: OK.
- Tests: OK — 16 archivos, 109 tests (antes 14 / 74). 0 warnings.

## QA (20 casos)
Cubiertos por tests: 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 19 (optimista + rollback; persistencia tras refresh depende de Supabase).
Revisados en código, requieren confirmación visual: 10, 16, 17.
Pendientes de Jorge: 18 (1024px: se mantiene mobile-first, ver deuda), 20 (consola en dev/prod), Lighthouse, Axe y CLS medido.

## Deuda técnica generada
- Grid NO sube a 3/4 columnas: AppShell limita a 448 px (mobile-first). Si se quiere tablet/desktop, es un LOOP de layout.
- Búsqueda por platos fuera de alcance (requiere cargar productos de todos los restaurantes).
- Sorts por cercanía / tiempo / envío requieren campos nuevos en `restaurants`.
- No hay caché offline de la LISTA de restaurantes (solo de restaurante visto y su menú).
- Scroll al volver desde el detalle: los filtros se restauran por URL; la posición exacta depende del navegador.

## Problemas encontrados (fuera de alcance)
- `useFavorites` se instancia por card: cada RestaurantGridCard hace su propia query a `favorites` (N queries por pantalla). Solución: un FavoritesContext (como CartContext).
- `useLocalData.ts` tiene 1132 líneas (límite 300).
- `src/router/index.tsx` 332 líneas (preexistente).
- Pendiente de CLIENT_01: theme_color del manifest.

## Preparación para LOOP_CLIENT_03
- `normalizeText` listo para buscar productos dentro del menú.
- EmptyState con `role`, Toast con variante error y en portal, patrón `useSearchParams` reutilizable (ej. `?cat=` de menú o producto abierto).
- `RestaurantGrid` / skeleton comparten `RESTAURANT_GRID_CLASSES`.
- Patrón de test de página con mocks de useLocalData/useAuth/useCartContext.
