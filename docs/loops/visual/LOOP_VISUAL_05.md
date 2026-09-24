# LOOP_VISUAL_05 — Tipografía con Carácter

**Categoría:** VISUAL
**Tipo:** Sistema visual / Refinamiento
**Estado:** 🟡 Pendiente
**Objetivo:** Refinar el sistema tipográfico existente para que tenga escala por rol documentada, tracking y leading explícitos para todos los tamaños, `tabular-nums` en todas las cifras, momentos de display en pantallas clave, cuerpo mínimo de 12px y un criterio claro de cuándo usar Sora vs Inter.
**NO ES SOBRE:** cambiar fuentes, cargar JetBrains Mono, color (LOOP_VISUAL_04), iconografía (LOOP_ICONOS_01), ilustraciones (LOOP_VISUAL_03), cards (LOOP_VISUAL_10), motion (LOOP_VISUAL_07), features nuevas.
**Rama:** `loop/visual-05-tipografia` (crearla desde `main` antes de ejecutar).

> **AJUSTES CONFIRMADOS POR JORGE (23-sep-2026)** — mandan sobre cualquier otra
> sección de este documento:
> 1. **Textos < 12px:** se suben los **20** (cliente + resto de `src/`), no solo 12.
>    Única excepción: labels en mayúsculas de 11px con tracking +0.08em.
> 2. **Badges numéricos:** agrandar el círculo antes que dejar el texto en 11px. Si el
>    layout no lo permite, dejar 11px con `aria-label` en el padre. Reportar cuáles no
>    se pudieron agrandar.
> 3. **Tracking y `text-display`: decisión CERRADA** (tabla en la Decisión 3).
> 4. **`tabular-nums`:** clase por sitio (~76), **sin componente `<Money>`**. Si algún día
>    hay ~200 sitios, se refactoriza.
> 5. **Hora de notificaciones:** `text-xs` (12px) y `text-gray-500` (pasa AA). Se reporta
>    como "ajuste de color por coherencia de a11y".
> 6. **Alcance:** solo módulo cliente (y componentes compartidos que use). Admin,
>    restaurante, domiciliario y auth → LOOP_VISUAL_05B.
> 7. **Ejecución en 2 tandas** (sección 7): Tanda 1 fundamentos, Tanda 2 aplicación.
>    Sin commit; todo queda en el working tree hasta la revisión de Jorge.

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md` (plantilla maestra)
2. `docs/loops/visual/LOOP_VISUAL_10.md` (LOOP inmediatamente anterior)

No leas LOOPs más antiguos salvo que este LOOP lo requiera explícitamente.

---

## 1. ROL

Actúa como:

**Senior Product Designer (tipografía) + Mobile UX + Frontend Engineer + Accessibility Specialist**

Continúa sobre el repositorio existente de Domicilios Riohacha. Los LOOPs anteriores construyeron iconografía propia, tratamiento fotográfico, ilustraciones de marca, color disciplinado y un sistema de cards (`card-surface`). Este LOOP ordena el texto sobre esa base.

---

## 2. REGLA ABSOLUTA

ANTES DE MODIFICAR: INSPECCIONA y reporta.

### Hallazgos de la inspección previa (23-sep-2026, sobre el repo real)

**Fuentes**
- Un solo `<link>` de Google Fonts en `index.html:21` con `preconnect`: Inter 400/500/600/700 y Sora 500/600/700/800, `display=swap` en la URL.
- JetBrains Mono **no se carga**; solo existe como token (`tailwind.config.ts` y `src/design-system/tokens/typography.ts`).

**Tokens**
- `fontFamily`: `display` = Sora, `sans` = Inter, `mono` = JetBrains Mono.
- `fontSize` propio con `lineHeight` incluido: `2xs` 11px, `xs` 12px, `sm` 14px, `base` **15px**, `lg` 17px, `xl` 20px, `2xl` 24px, `3xl` 30px, `4xl` 36px. `5xl`–`7xl` usan los valores por defecto de Tailwind.
- **Tracking solo de `xl` para arriba** (-0.01em a -0.03em). `2xs`–`lg` no tienen tracking.
- No hay `letterSpacing`, `lineHeight` ni `fontWeight` propios fuera de `fontSize`.
- `styles.css` base: `body` Inter; `h1`–`h6` Sora, peso 700, tracking -0.01em (se pisa con el tracking de `text-xl+`).
- `src/design-system/tokens/typography.ts` **duplica** familias y pesos y ningún archivo lo importa.

**Uso real (todo `src/`)**
- **14 tamaños únicos**: `text-sm` 292, `text-xs` 197, `text-lg` 43, `text-2xl` 28, `text-xl` 17, `text-[11px]` 15, `text-base` 12, `text-3xl` 6, `text-[10px]` 5, `text-[2.5rem]` 2, `text-5xl` 2, `text-4xl` 2, `text-6xl` 1, `text-7xl` 1. `text-2xs` no se usa.
- **4 pesos**: `font-bold` 179, `font-semibold` 163, `font-medium` 46, `font-extrabold` 3.
- `font-display` en 124 sitios; `font-mono` en 0; sin `font-family` inline; `tracking-*` y `leading-*` en 0.
- **`tabular-nums`: 6 líneas en 5 archivos** (todas de LOOP_VISUAL_10). `formatCOP` se usa en 26 archivos y ~**70 líneas sin `tabular-nums`**.
- **Textos < 12px: 20 usos** (`text-[11px]` ×15, `text-[10px]` ×5); 11 en el módulo cliente. (La estimación previa de "12" era aproximada; el conteo real de esta inspección es 20, ver Decisión 5.)
- **`text-xs` (12px)**: 197 usos (67 en cliente).

**Jerarquía**
- h1: 38, h2: 33, h3: 12, h4–h6: 0. Sin saltos h1→h3; un h3 sin h2 en `OrderCard` y dos en `ExploreFilterSheet`.
- Título de pantalla en cliente **sin criterio único**: `text-lg` (17px) en Carrito, Checkout, Mis Órdenes, Restaurantes, Detalle de pedido, Cuenta y Notificaciones; `text-xl` (20px) en Home, Categoría, Pedido confirmado y 404; `RestaurantHero` en `text-lg` blanco.

**Códigos y cifras**
- `#orderId`: `OrderCard` y `ActiveOrderCard` (con `tabular-nums`), `OrderSuccessView` y `OrderDetailPage` (sin).
- Fechas/horas: `OrderCard`, `OrderStatusTimeline`, `OrderDetailPage`; `timeAgo` en `NotificationBell` y `NotificationsPage` (a 11px, `text-gray-300` en Notificaciones).

**Textos de 10–11px en el módulo cliente**
`RestaurantGridCard` (etiqueta de envío), `FeaturedSection` (insignia "Oferta" y subtítulo), `HomeHeader` ("Tu comida, más cerca"), `MenuProductCard` ("Agotado"), `ClientAccountPage` (contador), `BottomNav` (badge), `NotificationBell`/`NotificationsPage` (hora), `FeaturedProductStrip` (contador del `+`).

NO inventes. Si algo no coincide con lo anterior al ejecutar, repórtalo antes de tocar.

---

## 3. NO CREAR UN SEGUNDO DE LO QUE YA EXISTE

- La escala vive en `tailwind.config.ts` (`fontSize`). REFINARLA, no reescribirla.
- Las familias ya existen (`display`, `sans`). No se cargan fuentes nuevas.
- `src/design-system/tokens/typography.ts` es un duplicado: se ELIMINA, no se conecta.
- Para las cifras: usar la utilidad `tabular-nums` de Tailwind. No inventar un sistema paralelo (ver Decisión 4 para la única excepción admitida).

---

## 4. CONTEXTO ACTUAL

Hoy la tipografía "funciona" pero no tiene disciplina:
- Escala sana (9 pasos), pero con 14 tamaños distintos en uso, incluidos valores sueltos (`text-[10px]`, `text-[11px]`, `text-[2.5rem]`).
- Tracking definido solo para títulos; el cuerpo y los captions no lo tienen.
- Los mismos tipos de pantalla usan títulos de distinto tamaño.
- Las cifras (precios, IDs, horas, contadores) saltan de ancho al cambiar: 6 de ~76 sitios tienen `tabular-nums`.
- Hay texto de 10–11px, algunos con bajo contraste.
- No hay criterio escrito de cuándo Sora y cuándo Inter.
- No existe un tamaño "display" para los momentos importantes (nombre del restaurante, totales, éxito).

---

## 5. PROBLEMAS A RESOLVER

### PROBLEMA 1 — Tracking y leading incompletos
Solo `xl+` tienen tracking. `2xs`–`lg` no lo tienen y varias líneas de 10–11px heredan un interlineado que no es suyo.

### PROBLEMA 2 — Sin momento "display"
Los números y nombres más importantes (nombre del restaurante, totales, "Pedido confirmado") usan 15–20px, igual que el resto.

### PROBLEMA 3 — Cifras que saltan
~70 usos de `formatCOP` y todas las horas, IDs y contadores sin `tabular-nums`.

### PROBLEMA 4 — Texto demasiado pequeño
20 usos a 10–11px (11 en cliente). El mínimo es 12px.

### PROBLEMA 5 — Sora vs Inter sin criterio
124 usos de `font-display` sin regla escrita.

### PROBLEMA 6 — Jerarquía de títulos inconsistente
Dos tamaños distintos para el mismo rol de título de pantalla, y `RestaurantHero` fuera de ambos.

### PROBLEMA 7 — Token duplicado y token muerto
`typography.ts` duplica `tailwind.config.ts` (sin importadores) y `fontFamily.mono` apunta a una fuente que no se carga ni se usa.

### PROBLEMA 8 — Sin documentación
No existe una guía de escala por rol.

---

## 6. DECISIONES DE DISEÑO

### Decisión 1 — JetBrains Mono: no cargar
Eliminar el token `mono` de `tailwind.config.ts` (0 usos). El `#orderId` usa **Inter con `tabular-nums` y tracking +0.01em**, sin fuente monoespaciada.

### Decisión 2 — Criterio Sora vs Inter
- **Sora (`font-display`):** títulos de pantalla, títulos de sección, nombres en cards, precios grandes, totales, momentos display.
- **Inter (`font-sans`, por defecto):** body, labels, chips, botones, metadata, captions.
- Regla práctica: si el texto se **lee como titular o cifra protagonista** → Sora; si se **lee como información de apoyo** → Inter. Los precios pequeños en filas (p. ej. precio de producto en una lista) pueden seguir en Sora si ya lo están; no se migran masivamente.

### Decisión 3 — Escala: refinar, no reescribir (CERRADA)
Se mantienen `2xs` 11px, `xs` 12px, `sm` 14px, `base` 15px, `lg` 17px, `xl` 20px, `2xl` 24px, `3xl` 30px, `4xl` 36px. Tracking y leading **explícitos en todos los tamaños**:

| Token | Tamaño | Leading | Tracking |
|---|---|---|---|
| `2xs` | 11px | 16px | +0.02em |
| `xs` | 12px | 18px | +0.01em |
| `sm` | 14px | 22px | 0 |
| `base` | 15px | 24px | 0 |
| `lg` | 17px | 26px | -0.005em |
| `xl` | 20px | 28px | -0.015em |
| `2xl` | 24px | 32px | -0.015em |
| `3xl` | 30px | 36px | -0.02em |
| `4xl` | 36px | 40px | -0.03em |
| `display` (nuevo) | 28px | 32px | -0.03em |

`text-display`: Sora (`font-display`), peso 800 (`font-extrabold`, ya cargado), **máximo 2 líneas** (`line-clamp-2`).

`2xs` se conserva en la escala aunque no se use (el LOOP sube todo lo de 10–11px a 12px; el único uso legítimo de 11px son los labels en mayúsculas con tracking +0.08em).

El tracking negativo de `h1`–`h6` en `styles.css` (-0.01em) no debe pisar el del token: una sola fuente de verdad (el tracking del `fontSize`); quitar el duplicado de la base.

### Decisión 4 — `tabular-nums` masivo (CERRADA)
Aplicar en: precios (`formatCOP`), cantidades, IDs, fechas, horas, contadores, timestamps, ETA. Método: **la utilidad `tabular-nums` en cada sitio (~76). NO se crea `<Money>`.** Si en el futuro hay ~200 sitios, se refactoriza. La auditoría debe quedar **cerrada** (0 pendientes) y blindada con un test. Para `#orderId`: Inter + `tabular-nums` + `tracking-[0.01em]` (sin fuente monoespaciada).

### Decisión 5 — Cuerpo mínimo 12px (CERRADA)
Subir a `text-xs` (12px) **los 20 usos** de 10–11px (`text-[11px]` ×15, `text-[10px]` ×5; 11 en cliente, el resto en compartidos/otros módulos). **Única excepción:** labels en mayúsculas de 11px con `tracking` +0.08em (hoy no hay ninguno; si se usa alguno, documentarlo en TYPOGRAPHY.md).

**Badges numéricos** (contador de cuenta, `BottomNav`, `NotificationBell`, contador del `+`): **agrandar el círculo antes que dejar el texto en 11px**. Si el layout no permite agrandarlo, dejar 11px con `aria-label` en el padre y **reportar cuáles no se pudieron agrandar**.

**Hora de notificaciones** (`NotificationBell`, `NotificationsPage`): `text-xs` (12px) y `text-gray-500` (deja de ser `text-gray-300`, que no pasa AA). Es un ajuste de color: reportarlo en el reporte final como **"ajuste de color por coherencia de a11y"**.

### Decisión 6 — Eliminar `typography.ts`
Borrar `src/design-system/tokens/typography.ts`. `tailwind.config.ts` queda como única fuente. Verificar antes que ningún archivo lo importa (hoy: 0).

### Decisión 7 — Jerarquía de títulos de pantalla
- **Título de pantalla:** `text-xl` (20px) → Home, Categoría, Pedido confirmado, 404.
- **Título de pantalla secundario:** `text-lg` (17px) → Carrito, Checkout, Mis Órdenes, Restaurantes, Detalle de pedido, Cuenta, Notificaciones.
- Alinear el resto del módulo cliente con esta regla. `h3` sin `h2` (`OrderCard`, `ExploreFilterSheet`): reportar, y corregir solo si el cambio no altera la semántica visual.
- **Fuera del módulo cliente:** admin, restaurante, domiciliario y auth NO se tocan → LOOP_VISUAL_05B.

### Decisión 8 — Momentos display
Aplicar `text-display` (Sora, `font-extrabold`) en:
1. **Nombre del restaurante** en `RestaurantHero` (hoy `text-lg`).
2. **Total del carrito** (`CartPage`, hoy 15–17px).
3. **Total del checkout** (`CheckoutPage`, hoy 15–17px).
4. **"Pedido confirmado"** (`OrderSuccessView`, hoy `text-xl`).

Solo tamaño, peso y tracking: no cambiar color (los totales siguen en `brand-700` bold según LOOP_VISUAL_04).

---

## 7. ALCANCE

### ✅ Incluido
- Refactor de `fontSize` en `tailwind.config.ts` (tracking + leading explícitos de `2xs` a `lg`)
- Nuevo token `text-display`
- Eliminar el token `fontFamily.mono`
- `tabular-nums` masivo por clase en ~76 sitios (cliente y compartidos; sin `<Money>`)
- Subir los 20 textos < 12px a 12px (excepción: labels en mayúsculas de 11px con tracking +0.08em)
- Eliminar `typography.ts`
- Documentar Sora vs Inter
- 4 momentos display
- Jerarquía de títulos del módulo cliente
- `docs/design-system/TYPOGRAPHY.md`
- Tests que blinden las reglas

### Ejecución en 2 tandas
**Tanda 1 — Fundamentos:** `tailwind.config.ts` (escala, tracking, leading, `text-display`), eliminar el token `mono`, eliminar `typography.ts` (si nadie lo importa), `docs/design-system/TYPOGRAPHY.md`, tests de reglas tipográficas. Al terminar: build + lint + tests, reporte de Tanda 1, **esperar OK de Jorge**.

**Tanda 2 — Aplicación:** `tabular-nums` en los ~76 sitios, textos < 12px → 12px (20 usos), badges numéricos, 4 momentos display, jerarquía de títulos, criterio Sora vs Inter, hora de notificaciones (12px + `gray-500`). Al terminar: build + lint + tests, reporte final (sección 18), **NO commitear**, esperar revisión.

### 🚫 Fuera de alcance
- Cambiar fuentes o pesos cargados
- Cargar JetBrains Mono
- Color, iconografía, ilustraciones, cards, motion
- Admin, restaurante, domiciliario y auth (→ LOOP_VISUAL_05B)
- Nuevas features

---

## 8. COMPONENTES A REFACTORIZAR

No se crean componentes nuevos (sin `<Money>`, Decisión 4). Se revisan, con nombres reales:

- `tailwind.config.ts`, `src/styles.css` (base de `h1`–`h6`)
- `src/design-system/tokens/typography.ts` (eliminar)
- Cifras: `CartPage`, `CheckoutPage`, `OrderSummaryCard`, `OrderCard`, `ActiveOrderCard`, `OrderDetailPage`, `OrderSuccessView`, `OrderStatusTimeline`, `QuantitySelector`, `MenuProductCard`, `FeaturedProductStrip`, `ProductDetailSheet`, `CartFloatingBar`, `DeliveryFeeRow`, `NotificationBell`, `NotificationsPage`, `BottomNav`, `ClientAccountPage`, `MenuSection`
- Textos < 12px: `RestaurantGridCard`, `FeaturedSection`, `HomeHeader`, `MenuProductCard`, `ClientAccountPage`, `BottomNav`, `NotificationBell`, `NotificationsPage`, `FeaturedProductStrip`
- Títulos: `HomeHeader`, `CategoryResultsPage`, `OrderSuccessView`, `NotFound`, `CartPage`, `CheckoutPage`, `OrdersPage`, `RestaurantListPage`, `OrderDetailPage`, `ClientAccountPage`, `NotificationsPage`, `RestaurantHero`
- `OrderCard` y `ExploreFilterSheet` (h3 sin h2)

(Lista orientativa: la auditoría al ejecutar es la fuente de verdad.)

---

## 9. MOCKUPS ASCII

### Antes (total del carrito)

```text
Subtotal                    $28.000
Envío                        Gratis
Total                       $28.000   ← 15px, mismo peso que el resto
```

### Después

```text
Subtotal                    $28.000
Envío                        Gratis
Total                       $28.000   ← text-display (28px, Sora 800, brand-700, tabular)
```

### Antes (hero de restaurante)

```text
[foto]
pa comer express         ← 17px
```

### Después

```text
[foto]
pa comer express         ← text-display (28px, Sora 800)
```

### Jerarquía de títulos

```text
Home / Categoría / Pedido confirmado / 404   → text-xl (20px)
Carrito / Checkout / Órdenes / Restaurantes /
Detalle / Cuenta / Notificaciones            → text-lg (17px)
```

---

## 10. REGLAS ARQUITECTÓNICAS

- Una sola fuente de verdad para la tipografía: `tailwind.config.ts`
- NO cargar fuentes nuevas ni cambiar los pesos cargados
- NO usar `font-family` inline
- NO usar tamaños sueltos (`text-[Npx]`) salvo la excepción documentada
- Tracking y leading viven en `fontSize`, no repetidos por componente
- La utilidad `tabular-nums` para cifras; no CSS inline
- Respetar handlers, estado y props: solo cambian clases y, si hace falta, el elemento HTML por semántica (p. ej. `h3`→`h2`)
- NO tocar color (LOOP_VISUAL_04), salvo lo indicado en la Decisión 5 para la hora de notificaciones (reportarlo)
- Sin dependencias nuevas

---

## 11. A11Y ESPECÍFICA

- Cuerpo mínimo 12px (`text-xs`); el texto de lectura corrida ≥ 14px
- Contraste de texto según `docs/design-system/COLORS.md`
- Respetar el zoom del usuario: tamaños en `rem`, no `px` fijos
- Jerarquía semántica: un solo `h1` por pantalla; sin saltos (h1→h3); reportar los h3 sin h2
- Las cifras con `tabular-nums` no cambian lo que lee el lector de pantalla
- Verificar que los momentos display no se corten con zoom del 200% (nombre largo de restaurante)

---

## 12. UX ESPECÍFICA

- El nombre del restaurante en display puede ocupar 1–2 líneas con `truncate`/`line-clamp-2`; no romper el hero
- El total es la cifra más importante de la pantalla de compra: display + `brand-700` + `tabular-nums`
- La hora en notificaciones sube a 12px y con contraste de texto secundario
- Los badges numéricos se agrandan antes que reducir su texto
- Los títulos de pantalla del cliente siguen la regla de dos niveles (Decisión 7)

---

## 13. PERFORMANCE

- No se cargan fuentes nuevas; el peso de fuentes no cambia
- `text-display` reutiliza Sora 800 (ya cargado)
- Sin CLS por cifras (`tabular-nums` lo reduce)

---

## 14. TESTS

### Unit / reglas (blindaje)
- `tailwind.config.ts`: cada `fontSize` (de `2xs` a `4xl` y `display`) tiene `letterSpacing` y `lineHeight` explícitos con los valores de la Decisión 3
- `tailwind.config.ts`: existe `display` en `fontSize`; NO existe `fontFamily.mono`
- `src/design-system/tokens/typography.ts` no existe
- No hay `text-[10px]` ni `text-[11px]` en `src/` (salvo labels en mayúsculas con tracking +0.08em)
- Todas las cifras auditadas (lista cerrada en la auditoría) llevan `tabular-nums`
- Los 4 momentos display usan `text-display`
- Los títulos de pantalla del cliente siguen la regla de dos niveles
- Sin `font-mono` en `src/`

### Visual
- Home, Restaurantes, Detalle, Carrito, Checkout, Pedido confirmado, Órdenes, Notificaciones

### A11y
- Lighthouse Accessibility (Chrome DevTools) como sustituto de Axe (Axe no está instalado; deuda hacia LOOP_QA_TOOLING)

---

## 15. CRITERIOS DE ÉXITO

- [ ] Escala por rol documentada en `docs/design-system/TYPOGRAPHY.md`
- [ ] Tracking explícito en todos los tamaños (valores de la Decisión 3)
- [ ] Leading explícito en todos los tamaños
- [ ] `tabular-nums` en todas las cifras (auditoría cerrada)
- [ ] `text-display` (28/32, -0.03em, Sora 800, máx 2 líneas) definido y aplicado en 4 momentos
- [ ] Hora de notificaciones en 12px y `gray-500`
- [ ] Los 20 textos < 12px subidos a 12px (salvo labels en mayúsculas con tracking +0.08em)
- [ ] Badges numéricos agrandados (o listados los que no se pudo)
- [ ] `typography.ts` eliminado
- [ ] Token `mono` eliminado de `tailwind.config.ts`
- [ ] Criterio Sora vs Inter documentado
- [ ] Jerarquía de títulos unificada
- [ ] `TYPOGRAPHY.md` creado
- [ ] Tests que blinden las reglas
- [ ] Build, lint, tests pasan
- [ ] Sin regresiones visuales

---

## 16. QA CRÍTICO

### División de responsabilidades
- **Claude Code** (rutas `/qa/*` temporales + `.env.local` temporal, retirados al terminar): Home, Restaurantes, Detalle, Carrito, Checkout, jerarquía de títulos, textos de 12px, `tabular-nums`, consola, build.
- **Jorge, en la preview y con sesión:** Pedido confirmado (`OrderSuccessView`), Mis Órdenes con datos (IDs, horas, totales), campana y página de notificaciones, contador de cuenta, Lighthouse Accessibility.

### Checklist
1. Home: título en `text-xl`
2. Restaurantes: título en `text-lg`
3. Detalle: nombre del restaurante en display
4. Detalle: precios de producto alineados (`tabular-nums`)
5. Carrito: total en display y `brand-700`
6. Carrito: cantidades y precios estables al cambiar
7. Checkout: total en display
8. Checkout: título en `text-lg`
9. **(Jorge)** Pedido confirmado: título en display; `#ID` con `tabular-nums`
10. **(Jorge)** Mis Órdenes: `#ID`, fecha, hora y total tabulares
11. **(Jorge)** Notificaciones: hora a 12px, contraste de texto secundario
12. **(Jorge)** Contador de cuenta y badge de `BottomNav` legibles a 12px
13. Home: "Tu comida, más cerca" a 12px
14. Menú: "Agotado" a 12px
15. Cards: etiqueta de envío a 12px
16. Sin texto < 12px en el módulo cliente
17. Sin `font-mono` ni `text-[Npx]`
18. Consola limpia
19. Build exitoso
20. **(Jorge)** Lighthouse Accessibility

---

## 17. REGLAS IMPORTANTES

- NO cambiar fuentes ni cargar JetBrains Mono
- NO tocar color, salvo la hora de notificaciones (Decisión 5) y reportarlo
- NO tocar iconografía, ilustraciones, cards ni motion
- NO tocar admin, restaurante, domiciliario ni auth
- NO cambiar handlers, estado ni props
- NO introducir dependencias
- NO crear `<Money>` (decisión cerrada)
- NO tocar admin, restaurante, domiciliario ni auth (→ LOOP_VISUAL_05B)
- Reportar cualquier hallazgo fuera de alcance en vez de arreglarlo

---

## 18. REPORTE FINAL

### IMPLEMENTADO
<resumen>

### ARCHIVOS MODIFICADOS
<lista>

### ARCHIVOS CREADOS
<lista> (incluye `docs/design-system/TYPOGRAPHY.md`)

### ARCHIVOS ELIMINADOS
<lista> (`src/design-system/tokens/typography.ts`)

### FONTSIZE — ANTES/DESPUÉS
<tabla por token: tamaño, leading, tracking>

### TRACKING POR TAMAÑO — ANTES/DESPUÉS
<tabla>

### TABULAR-NUMS
- Antes: 6 líneas en 5 archivos
- Después: N líneas en N archivos
- Sitios auditados: N; pendientes: 0

### TEXTOS < 12PX
- Antes: 20 usos (11 en cliente)
- Después: N (excepciones documentadas: <lista>)
- Badges numéricos: agrandados <lista>; **no se pudieron agrandar** (11px + `aria-label` en el padre): <lista>

### AJUSTE DE COLOR POR COHERENCIA DE A11Y
- Hora de notificaciones: `text-gray-300` → `text-gray-500`, 11px → 12px

### TYPOGRAPHY.TS
- Eliminado (0 importadores verificados)

### MOMENTOS DISPLAY
- RestaurantHero: <antes → después>
- Total del carrito: <antes → después>
- Total del checkout: <antes → después>
- Pedido confirmado: <antes → después>

### JERARQUÍA DE TÍTULOS
- Antes: <tabla pantalla → tamaño>
- Después: <tabla>
- h3 sin h2 encontrados/corregidos: <lista>

### SORA VS INTER
- Criterio documentado en TYPOGRAPHY.md

### A11Y
- Cuerpo mínimo, zoom 200%, Lighthouse: <score>

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
- Tipografía de admin, restaurante, domiciliario y auth (LOOP_VISUAL_05B)
- Axe → LOOP_QA_TOOLING
- <otra deuda>

### PREPARACIÓN PARA LOOP_VISUAL_07
<qué quedó preparado>

---

## 19. LO QUE NO DEBES HACER

- NO cambiar ni cargar fuentes
- NO usar `font-family` inline
- NO tocar color (salvo lo indicado)
- NO tocar iconografía, ilustraciones, cards ni motion
- NO tocar admin, restaurante, domiciliario ni auth
- NO cambiar lógica
- NO introducir dependencias
- NO crear componentes sin confirmación

---

## 20. REGLA FINAL

La tipografía es la voz de la app. Una escala con criterio, cifras que no saltan, títulos que mandan y un cuerpo que se lee sin esfuerzo hacen que Domicilios Riohacha suene segura y cálida, no genérica.

**Prioridad:** LEGIBILIDAD → JERARQUÍA → CIFRAS ESTABLES → CARÁCTER → ESTÉTICA

Si tienes que elegir entre un título más grande y uno más legible: elige el legible.
Si tienes que elegir entre un texto de 11px que cabe y uno de 12px que obliga a agrandar el contenedor: agranda el contenedor.
Si dudas si algo es "momento display": no lo es. Los momentos display son cuatro y se cuentan con los dedos.

---

## REGLA DE EJECUCIÓN

No lo ejecutes todavía.

Solo crea el archivo en `docs/loops/visual/LOOP_VISUAL_05.md` y confírmame:
- Ruta exacta
- Tamaño (líneas + KB)
- Cualquier decisión que necesites que yo confirme antes de ejecutar
