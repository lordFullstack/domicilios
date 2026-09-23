# LOOP_ICONOS_01 — Reporte final

## Implementado
Iconografía propia (estilo gota) conectada a todo el módulo cliente y a los componentes compartidos. Sin emojis usados como íconos en el cliente (excepto 👋 del saludo, que es copy: pendiente de decisión). Admin, restaurante y domiciliario sin cambios.

## Archivos modificados
- shared/components: BottomNav (solo rol cliente), NotificationBell, EmptyState (acepta íconos propios), ErrorBoundary, ConnectionBanner, NotificationPermissionCard, DeliveryLiveMap, ProductImage (+ test)
- client/components: HomeHeader, CategoryScroller, ExploreFilterChips, ExploreFilterSheet, ExploreSearchInput, SearchBar, RestaurantGridCard, RestaurantHero, CartFloatingBar, AddressCard, OrderCard, OrderSuccessView
- client/pages: CategoryResultsPage, ClientAccountPage, OrderDetailPage (+ test de detalle: mock de tarifa)
- config/constants.ts: `RESTAURANT_CATEGORIES` sin `icon` de lucide (conserva `emoji` para admin)
- shared/icons: `brandIcon.tsx` (nuevo), `svgString.ts` (serializador propio), `index.ts`

## Eliminados
- client/components/ProductCard.tsx (código muerto, sin imports)

## Emojis eliminados
| Archivo | Emoji | Reemplazo |
|---|---|---|
| ExploreFilterChips | 🟢 y emoji de categoría | punto `bg-success` + `Icon` de categoría |
| ExploreFilterSheet | emoji de categoría | `Icon` de categoría |
| CategoryResultsPage | emoji en título, 🍽️ | `Drop` de categoría; `ProductImage` |
| ErrorBoundary | 😕 | cohete en gota atardecer |
| NotificationPermissionCard | 🔔 | campana en gota |
| ConnectionBanner | 🔴 🟡 | punto de color |
| DeliveryLiveMap | 🛵 | moto en gota azul |
| ProductImage | 🍽️ respaldo | ícono `restaurants` |
| OrderCard | 🏪 | `ProductImage` |
| AddressCard | 📍 | `pin` |
| ClientAccountPage | ✓ | `Check` de lucide |
| OrderDetailPage | ✓ en toast | texto (el toast ya tiene ícono) |

## Emojis conservados
- Los que cada restaurante guardó en `image_url` (contenido, no UI).
- 👋 del saludo del Home (copy; decisión pendiente de Jorge).
- `emoji` en `RESTAURANT_CATEGORIES` (lo usa admin hasta LOOP_ICONOS_02).

## Bugs corregidos de paso
1. `CategoryResultsPage` metía el emoji del producto en `<img src="🍕">` (imagen rota).
2. `OrderCard` imprimía `image_url` como TEXTO: con foto real se veía la URL.
3. `RestaurantDetailPage.test` tenía un error no manejado (mock sin tarifa).

## Bundle
Precache 1001.24 → 1005.87 KiB (+4.6 KiB). `iconToSvgString` usa un serializador propio: con `react-dom/server` subía +189 KiB, se descartó.

## Tests
- Build: OK · tsc: OK · Tests: 25 archivos / 168 (antes 24 / 161) · 0 warnings.
- Nuevo `features/client/iconography.test.tsx`: BottomNav con gota activa, 7 gotas de categoría, chips/banner sin emojis, header con cohete/pin/campana.

## QA
Cubiertos por tests: 1, 2, 3, 6, 9, 10, 11, 15.
Pendientes de Jorge (visual): 4, 5, 7 (mapa en vivo), 8, 12 (nitidez 16 px), 13, 14, 16.

## Deuda → LOOP_ICONOS_02
- Íconos propios de estados del pedido (hoy lucide en `constants/icons.tsx`).
- Admin / restaurante / domiciliario (emojis en encabezados, estados y filtros; barra lateral del restaurante con `Rocket` de lucide).
- `RocketMark` en Login/Registro/recuperar contraseña/hero del Home.
- Ícono de la app PWA (192/512/maskable) con gota azul + cohete.
- 👋 del saludo.
