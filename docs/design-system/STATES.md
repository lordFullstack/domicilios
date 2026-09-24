# Estados (empty · error · loading)

Introducido en LOOP_VISUAL_08. Componentes en `src/shared/components/`; copy en `src/shared/constants/stateCopy.ts` (no hay i18n en el proyecto: ese archivo es la fuente única y los tests lo comparan).

## 1. Componentes
| Componente | Cuándo | Notas |
|---|---|---|
| `EmptyState` | No hay nada que mostrar | **Ilustración obligatoria** (`illustration`, sin `icon`); `size="sm"` para espacios chicos (popover). `role="status"` |
| `ErrorState` | Algo falló | Ilustración + título + descripción + **salida** (`onRetry` o `action`). `role="alert"`. `fullScreen` para pantalla completa (título = `h1`) |
| `LoadingState` | Se está cargando | Skeleton (`children`) o `Spinner`; siempre `role="status"` con `aria-label` |
| `Spinner` | Indicador de giro | **El único** (`Loader2` de lucide); decorativo (`aria-hidden`) |
| `Skeleton` | Forma del contenido que llega | Misma geometría que el contenido para evitar saltos |

No existe `SuccessState`: `OrderSuccessView` se mantiene; toasts y mensajes en línea no cambian.

## 2. Ilustraciones
Solo las 6 de LOOP_VISUAL_03: `idle` (estados sin una específica), `emptyCart`, `noResults`, `confused` (no encontrado), `sad` (fallo), `success`. Las 4 nuevas (NoOrders, NoFavorites, Location, NoConnection) → LOOP_VISUAL_03B: solo cambia el nombre en `stateCopy.ts`.

## 3. Voz
Tuteo · cálida sin ser infantil · sin exclamaciones excesivas · sin "lo sentimos" corporativo · sin tecnicismos.
Estructura: **título breve** (qué pasa) + **descripción** (qué puedes hacer o qué viene) + **CTA** (verbo: "Explorar restaurantes", "Reintentar").

## 4. Reglas
- Todo estado responde tres preguntas: qué pasó, qué puedo hacer, adónde voy. Sin salida no está terminado (los vacíos pasivos, como notificaciones, son la única excepción).
- Copy solo de `stateCopy.ts`; si falta un estado, se agrega ahí antes de usarlo.
- Un solo estilo por tipo: nada de `EmptyState role="alert"` para errores, ni "Cargando..." suelto, ni spinners propios.
- Las ilustraciones son decorativas: el mensaje lo dan título y descripción.

## 5. Dónde se usa cada estado (módulo cliente y compartidos)
| Estado | Componente | Copy |
|---|---|---|
| Carrito vacío (Carrito y Checkout) | `EmptyState` | `EMPTY_COPY.cart` |
| Sin pedidos | `EmptyState` | `EMPTY_COPY.orders` |
| Sin resultados (filtros) / sin restaurantes | `EmptyState` | `EMPTY_COPY.noResults` / `noRestaurants` |
| Sin productos (menú) / categoría vacía | `EmptyState` | `EMPTY_COPY.emptyMenu` / `emptyCategory` |
| Notificaciones vacías (página y popover `sm`) | `EmptyState` | `notificationsUnread` / `notificationsAll` |
| Error global | `ErrorState fullScreen` (`ErrorBoundary`) | `ERROR_COPY.boundary` |
| Error de carga (restaurantes, restaurante, menú) | `ErrorState` con reintento | `restaurantsNetwork/Permission/Unknown`, `restaurantLoad`, `menuLoad` |
| No encontrado (404, restaurante, pedido) | `ErrorState` (`confused`) | `notFound`, `restaurantNotFound`, `orderNotFound` |
| Restaurante suspendido | `ErrorState` | `restaurantUnavailable` |
| Carga de página / ruta | `LoadingState fullScreen` → `Spinner` | — |
| Carga de listas y mapa | `LoadingState` + `Skeleton` | etiquetas "Cargando pedidos", "Cargando pedido", "Cargando productos del pedido", "Cargando mapa" |

## 6. Blindaje (tests)
`stateCopy.test.ts` (tabla y voz), `emptyStates.test.ts` (empty states), `statesRules.test.ts` (errores, sin `icon`, loading y sin spinners paralelos: `animate-spin`/`Loader2` solo en `Spinner` y `Button`).
