# ROADMAP — Rediseño Visual V2 (Cliente)

Este documento reemplaza el seguimiento informal por chat. Refleja el estado real
del proyecto a la fecha, más allá del plan original de LOOP_00–LOOP_10: la
dirección visual cambió a mitad de camino (referencias con gradiente
naranja→rosa, badges, más saturación) y varias pantallas ya se actualizaron a
ese nuevo estándar. Otras todavía no.

**Alcance de la identidad nueva:** es para toda la app (Cliente, Restaurante,
Domiciliario, Admin) — se empezó por Cliente por ser el rol prioritario, no
porque el resto deba quedarse con el estilo anterior. Los componentes
compartidos entre roles (`NotificationsPage`, `NotificationBell`, etc.) ya
reciben el acento nuevo aunque el rol que los usa todavía no tenga su propio
pase visual completo.

**Cómo leerlo:** cada pantalla tiene un estado (✅ Hecho / ⚠️ Parcial / ⬜
Pendiente) contra la dirección visual V2 actual (la de las referencias con
gradiente + coral), no solo contra el plan original de loops.

---

## Fase 1 — Fundación (✅ Completa)

| Ítem | Estado |
|---|---|
| Design System V2 (tokens: gradiente, coral, navy) | ✅ |
| Auth (Login/Registro/Forgot/Reset) | ✅ |
| Bug fix: CartContext no estaba montado | ✅ |

## Fase 2 — Pantallas actualizadas a la dirección visual V2 (✅ Completa)

| Pantalla | Estado | Notas |
|---|---|---|
| Home | ✅ | Hero banner, categorías circulares, grid de promos |
| Restaurante / Menú | ✅ | Header info, pills gradiente, FeaturedProductStrip, precios coral |
| Carrito | ✅ | Header con vaciar carrito, CTA gradiente, precios coral |
| Seguimiento de pedido (tracking) | ✅ | Timeline 3-estados, contacto SMS+llamada |

## Fase 3 — Pantallas con el diseño anterior (⬜ Pendiente)

Estas pantallas funcionan bien pero **todavía tienen el estilo azul-sólido de
antes de las referencias nuevas** — no se les aplicó el pase de coral/gradiente:

| Pantalla | Qué falta |
|---|---|
| Checkout | CTA final a gradiente, revisar jerarquía de color con el resto |
| Listado de restaurantes (`RestaurantListPage`) | Pase de coral/gradiente en filtros activos y cards |
| Mis Órdenes (`OrdersPage`) | Aún no tiene pase visual V2 (badges de estado, etc.) |
| Cuenta (`ClientAccountPage`) | Aún no tiene pase visual V2 |
| Notificaciones | Aún no tiene pase visual V2 |
| Resultados por categoría (`CategoryResultsPage`) | Aún no tiene pase visual V2 |

**Sugerencia de orden:** Checkout primero (es el último paso antes de pagar,
alto impacto), después Listado de restaurantes (muy visible, primera pantalla
después del Home), y por último Órdenes/Cuenta/Notificaciones/Categorías.

## Fase 4 — Datos reales pendientes de conectar a Supabase (⬜ Pendiente)

Estos son **placeholders visuales a propósito** — se mostraron para revisar el
diseño primero, como pidieron. Falta la lógica real:

| Placeholder visual | Dónde | Qué necesita en Supabase |
|---|---|---|
| Tiempo de entrega, costo de envío, distancia | `RestaurantGridCard`, `RestaurantDetailPage` | Campos nuevos en `restaurants` (o cálculo por geolocalización) |
| Badge "🔥 Oferta" | Home, sección "Platos que te pueden gustar" | Campo de descuento/badge en `promotions`, o tabla nueva |
| "Recomendados" (no "Más pedido") | Restaurante/Menú, franja destacada | Requiere trackear ventas por producto para poder decir "más pedido" de verdad |

## Fase 5 — Iniciativas nuevas, no estaban en el plan original (⬜ Pendiente)

| Ítem | Alcance | Complejidad |
|---|---|---|
| Modo oscuro | Toggle + persistencia + tokens dark en todo el Design System | Alta — es un proyecto en sí mismo, no un ajuste de loop |
| Mapa de tracking a pantalla completa (modo oscuro, con ETA) | Nueva ruta/vista, distinta al mapa embebido actual (que ya es 100% real) | Media |

## Fase 6 — Polish + Release (⬜ Pendiente, sin cambios desde el plan original)

Sigue el alcance original de LOOP_09/LOOP_10: QA responsive final, limpieza de
código muerto (`HomePage.tsx`, `RestaurantCard.tsx`, `ProductCard.tsx` — no
enrutados, detectados durante los loops anteriores), build/typecheck real
(pendiente porque este entorno no tiene acceso a red).

## Fase 7 — Extender la identidad V2 a Restaurante / Domiciliario / Admin (⬜ Pendiente)

No estaba en el plan original — se suma porque la identidad nueva es para
toda la app, no solo Cliente. Se arranca después de cerrar Cliente por
completo (Fase 3), un rol a la vez, con el mismo criterio: mostrar el diseño
primero, ajustar, recién ahí seguir.

---

## Regla de trabajo (igual que antes)

Una fase/pantalla a la vez → mostrar el resultado → ajustar → recién ahí
seguir. Los badges/tiempos/distancias quedan como placeholder visual hasta que
se decida el modelo de datos real en Supabase — no se inventa lógica de
negocio sin datos reales detrás.
