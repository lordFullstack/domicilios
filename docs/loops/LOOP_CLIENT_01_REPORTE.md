# LOOP_CLIENT_01 — Reporte final

## Implementado
Consolidación sin features nuevas: una sola paleta (styles.css ↔ tailwind.config.ts), nombre formateado en Home y Cuenta, "Entregar en" leído de la última dirección real (adiós ciudad por IP), y a11y básica en todo el Home (aria, teclado, contraste, reduced motion). Se borró el design system paralelo muerto.

## Archivos modificados
- index.html
- tailwind.config.ts
- src/styles.css
- src/router/index.tsx (solo future flags de React Router)
- src/shared/components/BottomNav.tsx
- src/shared/components/NotificationBell.tsx
- src/shared/components/DeliveryLiveMap.tsx
- src/shared/components/OfflineDataBadge.tsx
- src/features/client/components/HomeHeader.tsx
- src/features/client/components/CategoryScroller.tsx
- src/features/client/components/RestaurantGridCard.tsx
- src/features/client/components/ActiveOrderCard.tsx
- src/features/client/components/PromoBanner.tsx
- src/features/client/components/FeaturedSection.tsx
- src/features/client/components/CartFloatingBar.tsx
- src/features/client/components/SearchBar.tsx
- src/features/client/components/HomeHeroBanner.tsx
- src/features/client/components/RestaurantsGrid.tsx
- src/features/client/components/ExploreFilterChips.tsx
- src/features/client/pages/ClientAccountPage.tsx
- src/features/delivery/pages/ProfilePage.tsx

## Archivos creados
- src/shared/utils/format.ts + format.test.ts
- src/features/client/utils/deliveryLabel.ts + deliveryLabel.test.ts
- src/shared/hooks/usePrefersReducedMotion.ts
- src/features/client/components/HomeHeader.test.tsx
- src/features/client/components/CategoryScroller.test.tsx
- src/features/client/components/RestaurantGridCard.test.tsx
- src/shared/components/NotificationBell.test.ts

## Archivos eliminados (código muerto, 0 imports)
- src/design-system/ (tokens + Button duplicados: tercera capa de tokens)
- src/features/client/pages/HomePage.tsx (no está en el router; el Home real es ClientDashboardPage)
- src/features/client/components/RestaurantCard.tsx (solo lo usaba HomePage.tsx)
- src/shared/hooks/useLocationLabel.ts (GPS + ipapi.co; única consumidora era HomeHeader)

## Tokens
| Token | Antes | Después |
|---|---|---|
| --brand | #2F5EFF | #1C2459 (brand-700) |
| --brand-soft | — | #2E3A8C (brand-500 = primary) |
| --brand-gradient | — | 135deg #1C2459 → #F4652C 62% → #FFC24B |
| --fg / --fg-muted / --border / --bg-soft / --bg-muted | slate (#0F172A…) | stone (= Tailwind gray/ink/surface) |
| ::selection | rgba(47,94,255,.25) | rgba(28,36,89,.20) |
| .text-gradient | brand → #5A85FF | var(--brand-gradient) |
| theme-color | #2F5EFF (light) + #0A0F1E (dark) | #1C2459 único |
| Tailwind | — | success/warning con variante `strong` para texto; colors.category.* |

Mapeo documentado al inicio de styles.css. Contraste de --brand sobre blanco: 13.9:1.

## Helpers
`src/shared/utils/format.ts` exporta `formatFullName(raw)` y `formatFirstName(raw)`. Diccionario de ~55 nombres/apellidos con tilde; respeta tildes existentes; seguro con emojis/números/símbolos; soporta guiones. Solo render, nunca reescribe backend.

## Home — de dónde sale la ciudad
No existe tabla `addresses` ni campo ciudad. "Entregar en" = calle de `LAST_DELIVERY_ADDRESS` (la que guarda Checkout en localStorage) + ", Riohacha"; sin dirección → "Riohacha". Se eliminó GPS/IP: la IP ubicaba al usuario donde estuviera conectado (Montelíbano). Ya no se pide permiso de ubicación al abrir la app ni se llama a ipapi.co/Nominatim.

## A11y (atributos agregados)
- NotificationBell: aria-label "Notificaciones, N sin leer" / "más de 99", aria-expanded, aria-haspopup, badge aria-hidden, 48×48, type=button, timestamps gray-300 → gray-500.
- BottomNav: aria-label del carrito con conteo, badge aria-hidden (99+), íconos aria-hidden y gray-400 → gray-500.
- CategoryScroller: type=button, aria-label "Categoría X", ícono aria-hidden, div → span dentro del botón.
- RestaurantGridCard: corazón con aria-pressed + aria-label de acción con el nombre; Enter y Espacio; tarjeta anuncia "cerrado"; "Envío gratis" con success-strong.
- ActiveOrderCard: Enter y Espacio, barra de progreso e íconos aria-hidden.
- PromoBanner: region + aria-roledescription "carrusel", pausa con hover/foco/toque, sin rotación con reduced motion, puntos aria-hidden.
- ExploreFilterChips: type=button, emojis aria-hidden; se mantiene aria-pressed (toggles, no tabs: "Abiertos" se combina con categoría).
- HomeHeader: 👋 aria-hidden, "Entregar en" deja de ser un botón sin acción.
- SearchBar, HomeHeroBanner, FeaturedSection, RestaurantsGrid, CartFloatingBar: type=button e íconos aria-hidden.

## Coral audit
Ubicaciones: 21 usos en 11 archivos — Badge (promo), NotificationBell, NotificationsPage, OrderSummaryCard, FeaturedSection (badge Oferta), FeaturedProductStrip ×3, OrderCard, MenuProductCard ×3, CheckoutPage, ClientAccountPage, CartPage ×3. 10 de ellos como color de TEXTO.
Contraste real #FF5A6B sobre blanco: 3.03:1 (no 3.9:1) → no cumple AA.
Decisión: no se toca en este LOOP (afecta Cart/Checkout, que están fuera de alcance). Se mueve a **LOOP_CORAL**.

## Tests
- Build: OK (tsc + vite build + dist/sw.js). Precache 979.42 → 978.71 KiB (sin regresión).
- Lint: N/A como ESLint — `npm run lint` = tsc → OK.
- Typecheck: OK (`npm run type-check`).
- Tests: OK — 14 archivos, 74 tests (antes 8 / 43). 0 warnings en la salida.

## QA (15 casos)
Validados con tests/build: 2, 3, 4, 11, 12 (parcial: emojis del Home y filtros).
Revisados en código, requieren confirmación visual: 5, 6, 7, 13, 14.
Pendientes de Jorge (necesitan Chrome/dispositivo real): 1 (consola en dev/prod), 8 y 9 (Axe), 10 (Lighthouse), 15 (iPhone con notch).

## Problemas encontrados (fuera de alcance)
- vite.config.ts manifest: theme_color sigue en #2F5EFF (regla 32 prohíbe tocar el manifest) → la app instalada en Android usa el azul viejo. Requiere tu OK.
- src/router/index.tsx tiene 332 líneas (>300, preexistente).
- Dependencias instaladas que el LOOP MAESTRO dice no usar: zod, react-hook-form, @hookform/resolvers, zustand, motion.
- Sin ESLint real.
- Sin uso: Layout.tsx, GlassCard.tsx, IconButton.tsx, useLocalStorage.ts.
- OrderStatusTimeline y OrderItemsList usan gray-300/400 como texto (contraste < AA).
- 8 lugares más formatean plata a mano en vez de formatCOP (restaurante, domiciliario, OrderItemsList, ProductCard, CategoryResultsPage).

## Deuda técnica generada
- "Entregar en" conserva el chevron ▾ sin acción (layout congelado); elegir dirección desde el Home queda para un LOOP futuro.
- Badge "🔥 Oferta" sigue hardcodeado (cambiarlo es copy; necesita aprobación).
- "Ver todas" de platos lleva a restaurantes (copy congelado).
- Perfil del domiciliario: el input de nombre NO se formatea, porque ese formulario guarda todos los campos juntos y reescribiría el nombre en backend al guardar.

## Preparación para LOOP_CLIENT_02
- ExploreFilterChips ya tiene type=button, emojis ocultos y decisión aria-pressed documentada.
- Tokens únicos: cualquier estado nuevo (vacío, error, cargando) usa brand/ink/surface y success/warning-strong sin inventar colores.
- `formatFullName`/`formatFirstName` y `usePrefersReducedMotion` listos para reutilizar.
- Patrón de tests con mocks de useAuth/useLocalData listo para Restaurantes/Búsqueda.
