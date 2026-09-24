# LOOP_VISUAL_08 — Estados con Narrativa

**Categoría:** VISUAL
**Tipo:** Sistema visual / Consistencia de estados (empty, error, loading)
**Estado:** 🟡 Pendiente
**Objetivo:** Que cada estado de la app (vacío, error, carga) cuente algo en la voz de la marca: con ilustración del cohete, copy cálido y consistente, un siguiente paso claro (CTA) y un solo componente por tipo de estado. Que dejen de existir tres estilos de error, tres de loading, dos spinners y copy con tonos distintos para lo mismo.
**NO ES SOBRE:** ilustraciones nuevas (LOOP_VISUAL_03B), successes menores (toasts y mensajes en línea), estados de admin / restaurante / domiciliario (LOOP_VISUAL_08B), color, tipografía, cards, Home, motion, features nuevas.
**Rama:** `loop/visual-08-estados` (crearla desde `main` antes de ejecutar).

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md` (plantilla maestra)
2. `docs/loops/visual/LOOP_VISUAL_09.md` (LOOP inmediatamente anterior — ya mergeado)
3. `docs/loops/visual/LOOP_VISUAL_03.md` y su reporte (las ilustraciones que este LOOP consume)
4. `docs/design-system/TYPOGRAPHY.md`, `CARDS.md` y `COLORS.md`

No leas LOOPs más antiguos salvo que este LOOP lo requiera explícitamente.

---

## 1. ROL

Actúa como:

**Senior Product Designer (UX writing) + Mobile UX + Frontend Engineer + Accessibility Specialist**

Continúa sobre el repositorio existente de Domicilios Riohacha. Los LOOPs anteriores construyeron iconografía, fotografía, seis ilustraciones del cohete, color, cards, tipografía y un Home adaptativo. Este LOOP hace que la app "hable" en los momentos en que no hay nada que mostrar, algo falló o algo está cargando.

---

## 2. REGLA ABSOLUTA

ANTES DE MODIFICAR: INSPECCIONA y reporta.

### Hallazgos de la inspección previa (24-sep-2026, sobre el repo real)

**Ilustraciones (`src/shared/illustrations/`)**
- 6 nombres: `idle`, `success`, `emptyCart`, `noResults`, `confused`, `sad` (componentes `RocketIdle`, `RocketSuccess`, `RocketEmptyCart`, `RocketNoResults`, `RocketConfused`, `RocketSad`). Se usan con `<Illustration name size className />`; `size`: `sm` 120 / `md` 180 / `lg` 240; decorativas (`aria-hidden`).
- Uso hoy (5 sitios): `success` → `OrderSuccessView`; `emptyCart` → `CartPage`; `noResults` → `RestaurantListPage` (solo el caso "filtros"); `sad` → `ErrorBoundary`; `confused` → `NotFound`. **`idle` no se usa en ningún lado.**

**Empty states (cliente + `NotificationsPage`)**
- Existe un `EmptyState` genérico (`src/shared/components/EmptyState.tsx`; props `icon` o `illustration`, `title`, `description`, `action`, `role`), con 15 usos.
- **11 empty states** en el cliente, **solo 3 con ilustración** (carrito, sin resultados por filtros, y las de página completa); el resto lleva un ícono gris de 32px:
  - `CartPage`: carrito vacío (con ilustración).
  - `CheckoutPage`: carrito vacío (ícono `ShoppingBag`, **copy distinto** del de `CartPage`).
  - `OrdersPage`: "No tienes órdenes" (ícono `ClipboardList`).
  - `RestaurantListPage`: "Todavía no hay restaurantes disponibles" (ícono `Store`) y "No encontramos restaurantes con esos filtros" (ilustración `noResults`).
  - `RestaurantsGrid` (Home): "No encontramos restaurantes" (ícono `Search`).
  - `CategoryResultsPage`: "No encontramos productos" (ícono propio).
  - `RestaurantDetailPage`: "Sin productos disponibles" (ícono `AlertTriangle`, que comunica error en un estado que no lo es).
  - `NotificationsPage`: "Todo al día" / "Sin notificaciones" (ícono `Bell`).
  - `NotificationBell` (popover): "No tienes notificaciones todavía" en un `<p>` propio, **sin `EmptyState`**.
- No existen como pantallas: EmptyFavorites, EmptyAddresses, EmptyConnection.

**Error states — 3 estilos**
- `EmptyState role="alert"` con ícono (`RestaurantLoadError`, `RestaurantsGrid`, `RestaurantDetailPage` ×4).
- Pantalla completa con ilustración (`ErrorBoundary` con `sad`; `NotFound` con `confused`).
- Texto suelto (`OrderDetailPage`: "Orden no encontrada").
- **"Algo salió mal" duplicado** (`ErrorBoundary` y `RestaurantsGrid`, con copys de apoyo distintos). `RestaurantLoadError` tiene 3 variantes por causa (`network`, `permission`, `unknown`) y `RestaurantsGrid` no las reutiliza.
- Sin conexión: `ConnectionBanner` (barra roja) y `OfflineDataBadge`. No hay `NetworkError` como pantalla.

**Loading states — 3 estilos y 2 spinners**
- Skeletons: `Skeleton`, `RestaurantCardsSkeleton`, `RestaurantDetailSkeleton`; `OrdersPage` arma el suyo en línea.
- Texto suelto: `OrderDetailPage` ("Cargando orden..."), `OrderItemsList` ("Cargando pedido...", en `gray-300`), `DeliveryTrackingSection` ("Cargando mapa...").
- Spinners: `Loader2` de lucide (`ProtectedRoute`, y dentro de `Button`) y un `div` con borde animado propio en `PageLoader` (router). Más `Loader2` sueltos en restaurante y domiciliario (fuera de alcance). No hay `LoadingState` genérico.

**Success**
- `OrderSuccessView` (ilustración `success`, dos CTAs). Toasts (`Toast`, 16 usos) y mensajes en línea. `RatingModal` sin éxito propio.

**Copy — inconsistencias**
- Mezcla de "Todavía no hay…", "No tienes…", "Sin …" para lo mismo; copy cálido junto a copy seco ("No hay productos para ordenar", "Orden no encontrada"); "Tu carrito está vacío" con dos descripciones distintas.

NO inventes. Si algo no coincide con lo anterior al ejecutar, repórtalo antes de tocar.

---

## 3. NO CREAR UN SEGUNDO DE LO QUE YA EXISTE

- **`EmptyState` existe:** se refactoriza (no se crea otro).
- **`Skeleton` existe:** es la base de todos los skeletons (no se crea otro).
- **`Illustration` existe:** se usa tal cual; NO se crean ilustraciones nuevas (las 4 nuevas van a LOOP_VISUAL_03B).
- **`ConnectionBanner` existe:** se mantiene.
- **A crear (no existen):** `ErrorState`, `LoadingState` y `Spinner` (ver Decisión 2). `SuccessState` NO se crea.

---

## 4. CONTEXTO ACTUAL

Los estados de la app funcionan pero no se sienten de la misma app: unos tienen cohete y otros un ícono gris; unos ofrecen "Reintentar" y otros dejan al usuario sin salida; "cargando" es a veces un bloque gris, a veces un texto y a veces un círculo girando de dos formas distintas. La marca tiene un personaje (el cohete) y una voz (cálida, cercana) que hoy solo aparecen en 5 lugares.

---

## 5. PROBLEMAS A RESOLVER

### PROBLEMA 1 — Empty states sin ilustración
8 de 11 usan un ícono gris. La ilustración `idle` no se usa en ningún lugar.

### PROBLEMA 2 — Copy inconsistente y duplicado
Tres formas de decir "no hay" ("Todavía no hay…", "No tienes…", "Sin …") y "Tu carrito está vacío" con dos descripciones.

### PROBLEMA 3 — Empty states sin siguiente paso
Sin restaurantes, categoría vacía, sin productos y sin notificaciones no ofrecen ninguna acción.

### PROBLEMA 4 — Tres estilos de error
`EmptyState role="alert"`, pantalla completa y texto suelto, con "Algo salió mal" duplicado y sin ilustración en la mayoría.

### PROBLEMA 5 — Error sin causa ni salida
Algunos errores no ofrecen reintentar o navegar (`OrderDetailPage`: "Orden no encontrada").

### PROBLEMA 6 — Loading con tres estilos
Skeleton, texto suelto y spinner, sin criterio.

### PROBLEMA 7 — Dos spinners
`Loader2` (lucide) y un `div` con borde animado propio (`PageLoader`).

### PROBLEMA 8 — Íconos que comunican lo contrario
`AlertTriangle` en "Sin productos disponibles" (no es un error).

### PROBLEMA 9 — Sin documentación
No hay guía de cuándo usar cada estado ni de la voz de la app.

---

## 6. DECISIONES DE DISEÑO

### Decisión 1 — Ilustraciones: las 6 existentes
Se usan solo las 6 de LOOP_VISUAL_03. Los estados sin ilustración específica usan **`idle`** (`RocketIdle`). Las 4 nuevas (NoOrders, NoFavorites, Location, NoConnection) van a **LOOP_VISUAL_03B**; cuando existan, se cambia el nombre en la tabla sin tocar la estructura.

### Decisión 2 — Componentes
| Componente | Acción | Notas |
|---|---|---|
| `EmptyState` | Refactor menor | **Ilustración obligatoria** (`illustration` requerido); se elimina el uso de `icon` en los empty states |
| `ErrorState` | **Crear** | Ilustración + título + descripción + CTA de reintento; `role="alert"`; sin depender de `EmptyState` para no mezclar semánticas |
| `LoadingState` | **Crear** | Área de carga con `Spinner` (o skeleton) y etiqueta accesible (`role="status"`, `aria-label`) |
| `Spinner` | **Crear** (único) | Usa `Loader2` de lucide; tamaños `sm`/`md`/`lg`; `aria-hidden` (el texto lo da el contenedor) |
| `SuccessState` | **NO crear** | `OrderSuccessView` queda como está; toasts y mensajes en línea no cambian |

### Decisión 3 — Voz de la app
- Tuteo ("Explora", "Tu pedido").
- Cálida sin ser infantil.
- Sin exclamaciones excesivas.
- Sin "lo sentimos" corporativo.
- Sin tecnicismos ("error 500", "excepción", "servidor").
- Estructura: **título breve** (qué pasa) + **descripción** (qué puede hacer o qué viene) + **CTA** (verbo en infinitivo o imperativo: "Explorar restaurantes", "Reintentar").

### Decisión 4 — Tabla de copy (fuente de verdad)

**EMPTY STATES**

| Estado | Ilustración | Título | Descripción | CTA |
|---|---|---|---|---|
| Carrito vacío (`CartPage` **y** `CheckoutPage`, unificados) | `emptyCart` | Tu carrito está vacío | Explora restaurantes y encuentra algo delicioso | Explorar restaurantes → `/app/restaurants` |
| Sin resultados (filtros) | `noResults` | Sin resultados | Prueba con otros filtros o cambia la búsqueda | Limpiar filtros |
| Sin restaurantes (zona) | `confused` | Aún no hay restaurantes en tu zona | Estamos trabajando para traer más opciones | *(ver "Decisiones a confirmar" 1)* |
| Sin productos (menú) | `idle` | Menú en preparación | Este restaurante aún no tiene productos disponibles | Ver otros restaurantes → `/app/restaurants` |
| Sin notificaciones | `idle` | Todo al día | Aquí verás tus notificaciones | *(sin CTA)* |
| Sin pedidos | `idle` | Aún no tienes pedidos | Cuando hagas tu primer pedido, aparecerá aquí | Explorar restaurantes → `/app/restaurants` |

**ERROR STATES**

| Estado | Ilustración | Título | Descripción | CTA |
|---|---|---|---|---|
| `ErrorBoundary` | `sad` | Algo salió mal | Intenta de nuevo en unos segundos | Reintentar |
| Carga de restaurantes (red) | `sad` | No pudimos cargar los restaurantes | Revisa tu conexión e intenta de nuevo | Reintentar |
| 404 (`NotFound`) | `confused` | No encontramos esta página | Puede que el enlace esté roto o la página ya no exista | Según sesión: "Volver al inicio" / "Iniciar sesión" |
| Sin conexión (banner) | — | *(se mantiene `ConnectionBanner` tal cual)* | — | — |

**LOADING STATES**

| Lugar | Hoy | Después |
|---|---|---|
| `OrdersPage` | skeleton armado en línea | `Skeleton` (composición con el componente base) |
| `OrderDetailPage` | texto "Cargando orden..." | `Skeleton` |
| `OrderItemsList` | texto "Cargando pedido..." | `Skeleton` |
| `DeliveryTrackingSection` | texto "Cargando mapa..." | `Skeleton` |
| `RestaurantCardsSkeleton`, `RestaurantDetailSkeleton` | skeletons | se mantienen |
| `ProtectedRoute`, `PageLoader` | `Loader2` suelto / `div` con borde | `Spinner` único (vía `LoadingState` donde sea de página completa) |

### Decisión 5 — Duplicados a unificar
- "Algo salió mal" ×2 → un solo `ErrorState`.
- "Tu carrito está vacío" ×2 → el copy de la tabla, en `CartPage` y `CheckoutPage`.
- "No hay productos" / "Sin productos disponibles" / "No encontramos productos" (categoría) → **"Menú en preparación"** donde aplique al menú de un restaurante (ver "Decisiones a confirmar" 2 para categoría).
- "Todavía no hay" / "No tienes" / "Sin" → según la tabla.

### Decisión 6 — Spinner único
`Spinner.tsx` con `Loader2` de lucide es el único spinner del módulo cliente, compartidos y router. Reemplaza el `div` de `PageLoader` y el `Loader2` de `ProtectedRoute`. `Button` puede seguir usando `Loader2` internamente o migrar a `Spinner`; el test de "no quedan spinners paralelos" lo cubre. Los `Loader2` de restaurante y domiciliario quedan para LOOP_VISUAL_08B.

### Decisión 7 — Iconografía en estados
Los estados dejan de usar íconos grises de 32px: la ilustración los reemplaza. Se elimina el `AlertTriangle` de "Sin productos disponibles" (no es un error).

### Decisiones a confirmar antes de ejecutar (propuestas de esta redacción)
1. **CTA "Cambiar dirección" en "Sin restaurantes (zona)":** el selector de dirección no existe (LOOP_CLIENT_06). Propuesta: **sin CTA** en ese estado (la tabla decía "si aplica").
2. **Estados que la tabla no cubre:** propuestas (a confirmar o ajustar):
   - `CategoryResultsPage` sin productos: `noResults` + "Sin productos en esta categoría" + "Prueba con otra categoría" + CTA "Ver categorías" → `/app/home` *(o sin CTA)*.
   - `RestaurantDetailPage` "No encontramos este restaurante" (`confused`), "Restaurante no disponible" (`sad`) y errores de carga de restaurante y menú (`sad`) → migran a `ErrorState` con el copy actual ajustado a la voz.
   - `OrderDetailPage` "Orden no encontrada": `confused` + "No encontramos este pedido" + "Puede que el enlace esté roto o el pedido ya no exista" + "Volver a mis pedidos".
   - `NotificationBell` (popover pequeño) y `NotificationsPage` (con las pestañas "sin leer" / "todas"): "Todo al día / Aquí verás tus notificaciones" para "sin leer" y "Aún no tienes notificaciones / Aquí verás tus notificaciones" para "todas"; el popover usa `EmptyState` en tamaño `sm`.
3. **Las 3 variantes de `RestaurantLoadError`** (`network`, `permission`, `unknown`): la tabla solo define "red". Propuesta: se conservan las 3 causas con la voz nueva ("No pudimos verificar tu sesión" para `permission`) dentro de `ErrorState`.
4. **Fuente de verdad del copy:** propuesta de un archivo `src/shared/constants/stateCopy.ts` con la tabla, que consumen los componentes y que los tests comparan (así el copy no se desincroniza).

---

## 7. ALCANCE

### ✅ Incluido
- Crear `ErrorState`, `LoadingState`, `Spinner`
- Refactor de `EmptyState` (ilustración obligatoria)
- Aplicar la tabla de copy a los 11 empty states + los errores (5 estilos actuales unificados en `ErrorState`) + los loading listados
- Unificar duplicados
- Un solo spinner en cliente, compartidos y router
- Tests que blinden la tabla
- `docs/design-system/STATES.md`

### 🚫 Fuera de alcance
- Las 4 ilustraciones nuevas (LOOP_VISUAL_03B)
- Successes menores (toasts, mensajes en línea) y `OrderSuccessView`
- Estados de admin, restaurante y domiciliario (LOOP_VISUAL_08B)
- `ConnectionBanner` y `OfflineDataBadge` (se mantienen)
- Color, tipografía, cards, motion; features nuevas

---

## 8. COMPONENTES A REFACTORIZAR

- `src/shared/components/EmptyState.tsx` (refactor)
- **Nuevos:** `src/shared/components/ErrorState.tsx`, `LoadingState.tsx`, `Spinner.tsx` (y, si se aprueba, `src/shared/constants/stateCopy.ts`)
- Empty states: `CartPage`, `CheckoutPage`, `OrdersPage`, `RestaurantListPage`, `RestaurantsGrid`, `CategoryResultsPage`, `RestaurantDetailPage`, `NotificationsPage`, `NotificationBell`
- Errores: `ErrorBoundary`, `RestaurantLoadError`, `RestaurantsGrid`, `RestaurantDetailPage`, `NotFound`, `OrderDetailPage`
- Loading: `OrdersPage`, `OrderDetailPage`, `OrderItemsList`, `DeliveryTrackingSection`, `ProtectedRoute`, `router/index.tsx` (`PageLoader`)

(Lista orientativa: la auditoría al ejecutar es la fuente de verdad.)

---

## 9. MOCKUPS ASCII

### Antes (sin pedidos)

```text
        ▢  (ícono gris 32px)
   No tienes órdenes
   Realiza tu primera orden ahora.
      [ Ir a restaurantes ]
```

### Después

```text
        🚀  (RocketIdle, 180px)
   Aún no tienes pedidos
   Cuando hagas tu primer pedido,
   aparecerá aquí
      [ Explorar restaurantes ]
```

### Antes (error de carga)

```text
        ⚠  (ícono)
   Algo salió mal
   No pudimos cargar los restaurantes.
      [ Intentar nuevamente ]
```

### Después

```text
        🚀  (RocketSad)
   No pudimos cargar los restaurantes
   Revisa tu conexión e intenta de nuevo
      [ Reintentar ]
```

---

## 10. REGLAS ARQUITECTÓNICAS

- Un componente por tipo de estado: `EmptyState`, `ErrorState`, `LoadingState`, `Spinner`
- NO crear componentes de estado paralelos ni estados propios en cada pantalla
- NO crear ilustraciones nuevas: solo las 6 existentes (`idle` para los que no tienen una específica)
- `EmptyState` exige `illustration`; `ErrorState` exige `illustration` y una acción de reintento o navegación
- Copy solo de la tabla (Decisión 4); si una pantalla necesita un estado nuevo, se agrega a la tabla, no se improvisa
- Sin `font-family` inline ni CSS inline; tokens y clases de los sistemas existentes
- NO cambiar handlers, hooks ni queries: solo presentación y copy
- Sin dependencias nuevas

---

## 11. A11Y ESPECÍFICA

- Empty: `role="status"`; error: `role="alert"` (se anuncia de inmediato)
- Loading: `role="status"` + `aria-label` ("Cargando pedidos", etc.); el `Spinner` es `aria-hidden` y el texto accesible lo da el contenedor
- Las ilustraciones son decorativas (`aria-hidden`): el mensaje siempre lo dan título y descripción
- Un solo `h1` por pantalla; los títulos de estado a pantalla completa (`ErrorBoundary`, `NotFound`, `OrderDetailPage`) son el `h1`; dentro de una pantalla con su propio `h1` el título del estado es `p` o `h2` según corresponda, sin saltos
- CTA con texto visible, target ≥ 44px, foco visible
- Contraste según `COLORS.md`; tipografía según `TYPOGRAPHY.md`
- Respetar `prefers-reduced-motion` (animación del `Spinner` y del cohete)

---

## 12. UX ESPECÍFICA

- Todo estado responde tres preguntas: qué pasó, qué puedo hacer, adónde voy. Sin salida no hay estado terminado
- Los errores de red ofrecen "Reintentar" y no culpan al usuario
- Los vacíos "de descubrimiento" invitan a explorar; los vacíos pasivos (notificaciones) no piden nada
- Cero saltos de layout al pasar de loading a contenido (skeletons con la misma geometría)
- El copy no usa "lo sentimos", tecnicismos ni exclamaciones (salvo `OrderSuccessView`, que no cambia)

---

## 13. PERFORMANCE

- Sin dependencias nuevas; el `Spinner` reutiliza `Loader2` (ya en el bundle)
- Las ilustraciones ya están en el bundle (LOOP_VISUAL_03); no se agregan más
- Skeletons con dimensiones fijas para evitar CLS

---

## 14. TESTS

### Reglas (blindaje)
- Todos los empty states del cliente usan `EmptyState` (incluido el popover de notificaciones)
- Todos tienen ilustración (`illustration` obligatoria, ningún `icon=` en empty states)
- El copy de cada estado coincide con la tabla (Decisión 4)
- Todos los errores usan `ErrorState` (ningún "Algo salió mal" duplicado)
- Todos los loading usan `Skeleton` o `Spinner` (sin texto "Cargando..." suelto en cliente y compartidos)
- No quedan spinners paralelos (sin `animate-spin` fuera de `Spinner` en cliente, compartidos y router)

### Unit
- `EmptyState`: renderiza ilustración, título, descripción y CTA; `role="status"`
- `ErrorState`: `role="alert"`, ilustración, CTA de reintento que llama al handler
- `LoadingState` y `Spinner`: accesibles (`role="status"`, `aria-label`, `aria-hidden` en el ícono)
- `NotFound` sigue eligiendo el CTA según sesión; `ErrorBoundary` sigue reintentando

### Visual
- Cada estado de la tabla (empty, error, loading)

### A11y
- Axe no está instalado (deuda LOOP_QA_TOOLING). Sustituto: Lighthouse Accessibility (Chrome DevTools), que corre Jorge

---

## 15. CRITERIOS DE ÉXITO

- [ ] `ErrorState`, `LoadingState` y `Spinner` creados
- [ ] `EmptyState` con ilustración obligatoria
- [ ] Los 11 empty states del cliente con ilustración, copy de la tabla y CTA (donde corresponde)
- [ ] Un solo estilo de error (`ErrorState`); sin "Algo salió mal" duplicado
- [ ] Loading con `Skeleton` o `Spinner` (sin textos sueltos)
- [ ] Un solo spinner
- [ ] Duplicados unificados (carrito, productos, "no hay")
- [ ] `docs/design-system/STATES.md` creado
- [ ] Tests que blinden la tabla
- [ ] Build, lint, tests pasan
- [ ] Sin regresiones visuales
- [ ] Consola limpia
- [ ] Lighthouse a11y ≥ 95

---

## 16. QA CRÍTICO

### División de responsabilidades
- **Claude Code** (rutas `/qa/*` temporales + `.env.local` temporal, retirados al terminar): carrito vacío, sin resultados, categoría vacía, 404, errores simulados (sin conexión / reintento), skeletons, consola, build.
- **Jorge, en la preview y con sesión:** sin pedidos (`OrdersPage`), pedido no encontrado, notificaciones vacías (pestañas "sin leer" y "todas"), popover de la campana, `ErrorBoundary` forzado, Lighthouse Accessibility.

### Checklist
1. Carrito vacío en `CartPage` y `CheckoutPage` con el mismo copy y la misma ilustración
2. Sin resultados (filtros) con `noResults` y "Limpiar filtros"
3. Sin restaurantes con `confused`
4. Sin productos (menú) con `idle` y "Ver otros restaurantes"
5. Categoría vacía con su copy
6. **(Jorge)** Sin pedidos con `idle` y "Explorar restaurantes"
7. **(Jorge)** Notificaciones vacías (2 pestañas) con `idle`
8. **(Jorge)** Popover de la campana vacío con `EmptyState` pequeño
9. `ErrorBoundary` con `sad` y "Reintentar" (test / forzado)
10. Error de carga de restaurantes con `sad` y "Reintentar"
11. 404 con `confused` y CTA según sesión
12. **(Jorge)** Orden no encontrada con `confused` y CTA
13. Loading de `OrdersPage`, `OrderDetailPage`, `OrderItemsList` y mapa con `Skeleton`
14. Un solo spinner en `ProtectedRoute` y `PageLoader`
15. Sin "Algo salió mal" duplicado
16. Copy en tuteo, sin "lo sentimos" ni tecnicismos
17. Sin saltos de layout al pasar de loading a contenido
18. Consola limpia
19. Build exitoso
20. **(Jorge)** Lighthouse Accessibility ≥ 95

---

## 17. REGLAS IMPORTANTES

- NO crear ilustraciones nuevas (LOOP_VISUAL_03B)
- NO crear `SuccessState`; NO tocar `OrderSuccessView`, toasts ni mensajes en línea
- NO tocar admin, restaurante ni domiciliario (LOOP_VISUAL_08B)
- NO cambiar handlers, hooks ni queries
- NO improvisar copy fuera de la tabla
- NO tocar `ConnectionBanner`
- NO introducir dependencias
- Reportar en vez de arreglar lo que quede fuera de alcance

---

## 18. REPORTE FINAL

### IMPLEMENTADO
<resumen>

### ARCHIVOS MODIFICADOS
<lista>

### ARCHIVOS CREADOS
<lista> (`ErrorState`, `LoadingState`, `Spinner`, `STATES.md`, tests, reporte)

### EMPTY STATES
- Antes: 11 (3 con ilustración). Después: 11 (11 con ilustración)
- Tabla aplicada: <estado → ilustración / copy / CTA>

### ERROR STATES
- Antes: 3 estilos, "Algo salió mal" ×2. Después: 1 (`ErrorState`)
- Tabla aplicada: <lista>

### LOADING STATES
- Antes: skeleton + texto + spinner. Después: `Skeleton` y `Spinner`
- Sustituciones: <lista>

### SPINNER
- Antes: 2 estilos. Después: 1 (`Spinner`)

### COPY
- Duplicados unificados: <lista>
- Voz: tuteo, sin exclamaciones, sin tecnicismos

### A11Y
- `role="status"` / `role="alert"`, ilustraciones decorativas, Lighthouse: <score>

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
- Estados de admin, restaurante y domiciliario (LOOP_VISUAL_08B)
- 4 ilustraciones nuevas (LOOP_VISUAL_03B)
- Selector de dirección (LOOP_CLIENT_06)
- Axe (LOOP_QA_TOOLING)
- <otra deuda>

### PREPARACIÓN PARA LOOP_VISUAL_03B
Cuando existan NoOrders, NoFavorites, Location y NoConnection, basta con cambiar el nombre de la ilustración en la tabla de copy; la estructura de los estados no cambia.

---

## 19. LO QUE NO DEBES HACER

- NO crear ilustraciones nuevas
- NO crear `SuccessState` ni tocar `OrderSuccessView`
- NO tocar admin, restaurante ni domiciliario
- NO cambiar lógica de datos
- NO improvisar copy
- NO dejar spinners ni textos "Cargando..." sueltos en el alcance
- NO introducir dependencias

---

## 20. REGLA FINAL

Un estado vacío, un error y una carga son momentos en que el usuario no tiene nada que mirar y necesita saber que alguien está al otro lado. Si la app responde con el cohete, una frase clara y un siguiente paso, esos momentos se vuelven parte de la marca; si responde con un ícono gris y "Algo salió mal", parecen un fallo.

**Prioridad:** CLARIDAD → SALIDA (siempre un siguiente paso) → CONSISTENCIA → CALIDEZ → ESTÉTICA

Si tienes que elegir entre un copy ingenioso y uno claro: elige el claro.
Si un estado no ofrece una salida: no está terminado.
Si dudas de qué copy usar: ve a la tabla; si no está, agrégalo a la tabla antes de usarlo.

---

## REGLA DE EJECUCIÓN

No lo ejecutes todavía.

Solo crea el archivo en `docs/loops/visual/LOOP_VISUAL_08.md` y confírmame:
- Ruta exacta
- Tamaño (líneas + KB)
- Cualquier decisión que necesites que yo confirme antes de ejecutar
