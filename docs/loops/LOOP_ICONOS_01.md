# LOOP_ICONOS_01 — ICONOGRAFÍA PROPIA (ESTILO GOTA)

## ROL

Actúa como:

**Senior Frontend Engineer + Design System Engineer + Accessibility Specialist**

Continúa sobre el repositorio de Domicilios Riohacha.

El pack de íconos YA ESTÁ en el repo (`src/shared/icons/`), con tests. Este
LOOP lo **conecta a la UI del cliente** y quita los emojis usados como
íconos. No diseña íconos nuevos: los trazos están aprobados en el lienzo
"Iconografía Domicilios Riohacha" y viven en `glyphs.tsx`.

> **ALCANCE: SOLO MÓDULO CLIENTE + COMPONENTES COMPARTIDOS.**
> Admin, restaurante y domiciliario van en `LOOP_ICONOS_02`, con aprobación aparte.

---

# 1. REGLA ABSOLUTA

ANTES DE MODIFICAR: INSPECCIONA.

Confirma que existe y que los tests pasan:

```text
src/shared/icons/glyphs.tsx        (19 íconos, fuente única de trazos)
src/shared/icons/Icon.tsx          (componente + variantes)
src/shared/icons/Drop.tsx          (contenedor gota)
src/shared/icons/categories.ts     (CATEGORY_ICON, CATEGORY_DROP_CLASS)
src/shared/icons/svgString.ts      (solo para Leaflet)
src/shared/icons/icons.test.tsx    (25 tests)
tailwind.config.ts                 (rounded-drop, icon-tint)
src/styles.css                     (--icon-tint, --icon-accent)
```

Reporta si algo cambió desde la entrega del pack.

---

# 2. NO CREAR UN SEGUNDO SISTEMA DE ÍCONOS

No crear:

```text
src/shared/components/Icon.tsx   (ya existe src/shared/icons/Icon.tsx)
IconV2 / BrandIcon / AppIcon
un mapa de íconos por pantalla
```

`src/shared/constants/icons.tsx` (íconos semánticos de estado de pedido con
lucide) **se queda por ahora**: los estados del pedido no tienen íconos
propios todavía. Registrar como deuda para `LOOP_ICONOS_02`.

División de responsabilidades:

| Tipo | Sistema |
|---|---|
| Identidad (marca, categorías, navegación, favorito, campana, ubicación, buscar) | `@/shared/icons` |
| Utilitarios (chevron, X, +, −, check, basura, flechas) | `lucide-react` con `strokeWidth={1.75}` |
| Estados de pedido | `constants/icons.tsx` (sin cambios en este LOOP) |

---

# 3. MAPA DE REEMPLAZOS (auditado)

## 3.1 Navegación y marca

| Archivo | Hoy | Después |
|---|---|---|
| `shared/components/BottomNav.tsx` | lucide (Home, Store…) + color | `Icon` `home` / `restaurants` / `bag` / `orders` / `profile`. Activo: `<Drop size={36} className="bg-icon-tint text-brand-700">` + `variant="onDrop"`. Reposo: `text-gray-500`. Label activo `text-brand-700 font-bold` |
| `client/components/HomeHeader.tsx` | `RocketMark` + `MapPin` lucide | `<Drop size={36} className="bg-brand-700 text-white">` + `rocket` `onDark`; `pin` para "Entregar en" |
| `shared/components/NotificationBell.tsx` | `Bell` lucide | `bell` (mantener aria-label y área de 48 px de CLIENT_01) |
| `client/components/SearchBar.tsx`, `ExploreSearchInput.tsx` | `Search` lucide | `search` |
| `client/components/CartFloatingBar.tsx` | `ShoppingBag` lucide | `bag` |
| `client/components/OrderSuccessView.tsx` | (revisar) | `rocketSuccess` como ilustración (`size="xl"`, `onDark` o `active` según fondo) |

`RocketMark` NO se borra en este LOOP: lo usan Login, Registro, recuperar
contraseña y el hero del Home como logo a color. Solo el header del Home
pasa a la gota. Decidir en `LOOP_ICONOS_02` si `RocketMark` se reemplaza.

## 3.2 Categorías

| Archivo | Hoy | Después |
|---|---|---|
| `config/constants.ts` → `RESTAURANT_CATEGORIES` | `emoji` + `icon` (lucide) | Quitar `icon` e importar `CATEGORY_ICON`. **Conservar `emoji` hasta terminar `LOOP_ICONOS_02`** (lo usa admin: `RestaurantFilters`, `RestaurantSidePanel`) |
| `client/components/CategoryScroller.tsx` | círculo + lucide + `CATEGORY_COLORS` | `<Drop size={56} className={CATEGORY_DROP_CLASS[value]}>` + `Icon` `CATEGORY_ICON[value]`, `size={26}`. Borrar `CATEGORY_COLORS` local |
| `client/components/ExploreFilterChips.tsx` | `{c.emoji}` y 🟢 | `Icon` categoría `size="xs"` dentro del chip; "Abiertos" con un punto `bg-success` de 8 px (`aria-hidden`) |
| `client/components/ExploreFilterSheet.tsx` | `categoryLabel(emoji, label)` | `Icon` categoría `size="sm"` + label |
| `client/pages/CategoryResultsPage.tsx` | `{categoryInfo?.emoji}` y 🍽️ | `Drop` + ícono de la categoría en el título; empty state con `restaurants` |

## 3.3 Favoritos

| Archivo | Después |
|---|---|
| `client/components/RestaurantGridCard.tsx` | `heart`: reposo `line text-gray-500`; marcado `variant="active"` + `text-rose-600` (mantener `aria-pressed` y labels de CLIENT_01) |
| `client/components/RestaurantHero.tsx` | igual, sobre `glass` |

## 3.4 Emojis en componentes compartidos del cliente

| Archivo | Hoy | Después |
|---|---|---|
| `shared/components/ErrorBoundary.tsx` | 😕 | `Drop size={72} bg-icon-tint` + `rocket` `onDrop` (el cohete "se cayó", no un emoji triste) |
| `shared/components/NotificationPermissionCard.tsx` | 🔔 en el texto | `bell` en `Drop` pequeña a la izquierda del texto |
| `shared/components/ConnectionBanner.tsx` | 🔴 / 🟡 en el texto | punto de color `aria-hidden` (8 px) + texto sin emoji |
| `shared/components/DeliveryLiveMap.tsx` | 🛵 en `divIcon` | `iconToSvgString({ name: 'moto', size: 18, color: '#FFFFFF', variant: 'onDark' })` dentro del círculo azul |
| `shared/components/ProductImage.tsx` | 🍽️ de respaldo | `Icon` `restaurants` en gris cuando no hay foto NI emoji. **Los emojis que el restaurante guardó en `image_url` se siguen mostrando** (son contenido, no UI) |
| `client/components/OrderCard.tsx` | 🏪 de respaldo | `Icon` `restaurants` (mismo criterio: el emoji guardado se respeta) |
| `client/components/AddressCard.tsx` | 📍 en el título | `pin` `size="sm"` |
| `client/components/HomeHeader.tsx` | 👋 | **Decisión de Jorge** (es copy, no ícono): quitar o conservar |

## 3.5 Mensajes con ✓ / ✅

| Archivo | Hoy | Después |
|---|---|---|
| `client/pages/ClientAccountPage.tsx` | "✓ Guardado" | `Check` de lucide `aria-hidden` + "Guardado" |
| `client/pages/OrderDetailPage.tsx` | "✓ N productos agregados…" | texto sin ✓ (el Toast ya muestra su ícono) |

## 3.6 Código muerto

`client/components/ProductCard.tsx` (🛒 / ✅) no tiene imports: **borrar**,
no migrar.

---

# 4. ESTADOS VISUALES

| Estado | Implementación |
|---|---|
| Reposo | `<Icon name="…" />` con `text-gray-500` o el color del texto |
| Activo en barra | `Drop` 36 px `bg-icon-tint` + `Icon variant="onDrop"` + `text-brand-700` |
| Favorito marcado | `Icon name="heart" variant="active" className="text-rose-600"` |
| Sobre oscuro | `Icon variant="onDark" className="text-white"` |
| Deshabilitado | `text-gray-400` + `disabled` en el botón (sin variante especial) |

La transición reposo → activo en la barra: `transition-colors duration-150
motion-reduce:transition-none`. La gota aparece sin animación de escala.

---

# 5. ACCESIBILIDAD

· `Icon` y `Drop` son `aria-hidden` por defecto: el nombre accesible lo da
  el botón (`aria-label`) o el texto visible. No quitar ningún `aria-label`
  existente de CLIENT_01/02/03.
· `title` en `Icon` solo si el ícono va solo y comunica algo sin texto.
· Contraste de íconos ≥ 3:1 (WCAG 1.4.11): `text-gray-500` (4.8:1) en
  reposo; NO usar `text-gray-400` salvo deshabilitado.
· La gota activa no es el único indicador: el label de la pestaña activa
  también cambia a `font-bold` + `text-brand-700`.
· Touch targets: los botones siguen en ≥ 44 px; la `Drop` va dentro.

---

# 6. PERFORMANCE

· `iconToSvgString` arrastra `react-dom/server`: importarlo SOLO en
  `DeliveryLiveMap` (directo desde `@/shared/icons/svgString`, no desde el
  índice). Verificar en el build que no entra al chunk principal.
· Los SVG son inline (sin requests). Reportar tamaño del bundle antes/después.

---

# 7. TESTS

Mantener los 25 de `icons.test.tsx`. Agregar/ajustar:

```text
BottomNav: pestaña activa renderiza una Drop y el label en negrita
CategoryScroller: cada categoría usa su Drop con clase bg-category-*
ExploreFilterChips: ningún emoji en el DOM; "Abiertos" sin 🟢
RestaurantGridCard: corazón marcado usa data-icon="heart" con la variante activa
ErrorBoundary: sin 😕
ConnectionBanner: textos sin 🔴/🟡
Barrido: test que recorre el DOM de Home, Restaurantes y Detalle y falla si
  encuentra emojis FUERA de contenido de datos (image_url)
```

Ajustar tests existentes que buscaban lucide o emojis por texto.

---

# 8. QA CRÍTICO

1. Home: header con gota azul + cohete, categorías en gotas de color
2. Barra inferior: activa con gota atardecer; cambia al navegar
3. Restaurantes: chips y sheet con íconos propios, sin emojis
4. Resultados de categoría: título con gota de la categoría
5. Favorito: reposo línea, marcado relleno; aria-pressed correcto
6. Campana: ícono propio, badge y aria-label intactos
7. Mapa de seguimiento: marcador con la moto
8. ErrorBoundary: cohete, sin emoji
9. Banner de conexión: punto de color, sin emoji
10. Producto sin foto ni emoji: ícono de respaldo
11. Producto con emoji guardado por el restaurante: se sigue viendo
12. Íconos nítidos a 16 px (chips) y 24 px (barra)
13. Contraste de íconos en reposo ≥ 3:1
14. Reduced motion: sin transiciones
15. Admin/restaurante/domiciliario: sin cambios (fuera de alcance)
16. Consola limpia

---

# 9. CRITERIOS DE ÉXITO

☐ Pack verificado (25 tests)
☐ BottomNav con íconos propios + gota activa
☐ Header del Home con gota + cohete
☐ Categorías en gotas con CATEGORY_ICON / CATEGORY_DROP_CLASS
☐ `icon` de lucide eliminado de RESTAURANT_CATEGORIES (emoji se conserva para admin)
☐ Chips, sheet y resultados sin emojis
☐ Favoritos con `heart` propio
☐ Campana, búsqueda, ubicación y carrito con íconos propios
☐ ErrorBoundary, ConnectionBanner, NotificationPermissionCard sin emojis
☐ Marcador del mapa con `moto`
☐ Respaldo de imagen con ícono; emojis de datos respetados
☐ ✓/✅ reemplazados en Cuenta y Detalle de pedido
☐ `ProductCard.tsx` muerto eliminado
☐ `react-dom/server` fuera del chunk principal
☐ Sin segundo sistema de íconos
☐ Build, tsc y tests OK
☐ Lighthouse a11y ≥ 95 y Axe 0 críticas en Home (validación de Jorge)
☐ Sin regresiones en admin/restaurante/domiciliario

---

# 10. REPORTE FINAL

`docs/loops/LOOP_ICONOS_01_REPORTE.md` con:

IMPLEMENTADO · ARCHIVOS MODIFICADOS / ELIMINADOS · EMOJIS ELIMINADOS
(archivo → emoji → reemplazo) · EMOJIS CONSERVADOS Y POR QUÉ · BUNDLE
antes/después · TESTS (build/tsc/tests antes → después) · QA (casos
validados y pendientes) · DEUDA → `LOOP_ICONOS_02`.

---

# 11. LO QUE NO DEBES HACER

· NO editar trazos en `glyphs.tsx` (cambios de diseño van al lienzo primero).
· NO crear otro componente de íconos ni mapas por pantalla.
· NO tocar admin, restaurante ni domiciliario.
· NO borrar `emoji` de `RESTAURANT_CATEGORIES` (lo usa admin).
· NO borrar `RocketMark` ni tocar Login/Registro.
· NO reemplazar los emojis que los restaurantes guardaron en `image_url`.
· NO cambiar `constants/icons.tsx` (estados de pedido).
· NO usar hex en componentes: colores por clases/tokens.
· NO tocar `sw.ts`, manifest, rutas ni base de datos.
· NO instalar dependencias.

---

# 12. LOOP_ICONOS_02 (siguiente, requiere aprobación)

· Íconos propios para estados del pedido (pendiente, confirmado,
  preparando, listo, en camino, entregado, cancelado) → diseñar en el lienzo.
· Admin / restaurante / domiciliario: encabezados con emoji (📊 📈 💵 👔
  🚴), estados 🕐 👨‍🍳 📦, abierto/cerrado 🟢/🔴, `c.emoji` en filtros.
· Decidir `RocketMark` vs `rocket` en Login/Registro.
· Quitar `emoji` de `RESTAURANT_CATEGORIES` cuando nadie lo use.
· Ícono de la app (PWA, 192/512/maskable) con la gota azul + cohete.

---

# 13. REGLA FINAL

Los íconos son la firma de la app en cada pantalla. Si conviven tres
estilos (emoji, lucide y propio) para la misma cosa, la marca no se lee.

Prioridad:

CONSISTENCIA → ACCESIBILIDAD → CLARIDAD → ESTÉTICA

Un ícono que no está en el pack no se inventa en la pantalla:
se diseña en el lienzo, se aprueba y se agrega a `glyphs.tsx`.
