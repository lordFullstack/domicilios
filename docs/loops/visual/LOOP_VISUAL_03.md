# LOOP_VISUAL_03 — Mascota + Ilustraciones de Marca (núcleo de 6)

**Categoría:** VISUAL
**Tipo:** Feature visual / Identidad
**Estado:** 🟢 Aprobado — listo para ejecutar
**Objetivo:** Convertir el cohete en el hilo conductor visual de la app con un núcleo coherente de **6 ilustraciones** integradas en las pantallas que existen HOY: carrito vacío, sin resultados, error, confirmación de pedido y 404. Las 6 restantes y las integraciones que dependen de pantallas aún inexistentes van a **LOOP_VISUAL_03B**.
**NO ES SOBRE:** animación (LOOP_VISUAL_07), iconos de 24px (LOOP_VISUAL_01 / LOOP_ICONOS_01), fotografías (LOOP_VISUAL_02).

> **AJUSTES CONFIRMADOS POR JORGE (23-sep-2026)** — mandan sobre cualquier
> otra sección de este documento: relleno de atardecer (no outline),
> `EmptyState` con prop `illustration` (sin `EmptyCart.tsx` suelto), 404 real
> en `NotFound.tsx`, `OrderSuccessView` como nombre real, alcance reducido a
> pantallas existentes, núcleo de 6 ilustraciones.

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md` (plantilla maestra)
2. `docs/loops/visual/LOOP_VISUAL_02.md` (LOOP inmediatamente anterior)

No leas LOOPs más antiguos salvo que este LOOP lo requiera explícitamente.

---

## 1. ROL

Actúa como:

**Senior Product Designer + Illustrator + Frontend Engineer + Motion Designer**

Continúa trabajando sobre el repositorio existente de Domicilios Riohacha.

Los LOOPs anteriores construyeron:
- Iconografía propia (Lucide + custom)
- Tratamiento fotográfico premium (aspect ratios, overlays, fallbacks)

---

## 2. REGLA ABSOLUTA

ANTES DE MODIFICAR: INSPECCIONA.

Busca en el repositorio:

```text
Icon name="rocket"
Icon name="rocketSuccess"
Drop
EmptyState
ErrorBoundary
OrderSuccessView
NotFound
illustrations
mascot
```

Revisa al menos:

```text
src/shared/icons/
src/shared/components/
src/features/client/components/
src/features/client/pages/
src/shared/pages/
src/router/index.tsx   (ruta "*")
```

Reporta antes de crear:
- Dónde aparece hoy el cohete en la app
- Cuántos empty states existen y dónde
- Cuántos error states existen y dónde
- Cuántos success states existen y dónde
- Si existe algún sistema de ilustraciones
- Si el cohete del hero es SVG o PNG (`RocketMark` usa PNG de `/public/brand/`)

Auditado el 23-sep-2026: no existe `NotFound` (la ruta `*` redirige al login),
no existe `EmptyCart.tsx` (el carrito vacío usa `EmptyState`), la confirmación
del pedido es `OrderSuccessView`, y `ErrorBoundary` ya usa `rocket` dentro de
una `Drop`. Si algo cambió, reportarlo antes de escribir código.

---

## 3. NO CREAR UN SEGUNDO DE LO QUE YA EXISTE

El pack de íconos (`src/shared/icons/`) ya tiene el cohete:

```text
<Icon name="rocket" />          (cohete base)
<Icon name="rocketSuccess" />   (cohete de éxito)
<Drop>                          (forma de marca)
```

**Se reutilizan tal cual.** NO se crean componentes `RocketIcon`,
`RocketFilledIcon` ni `RocketSuccessIcon`. Las ilustraciones (120–240px) son
componentes distintos a los íconos de 24px, pero NO duplican sus trazos: parten
de la misma silueta del cohete que vive en `glyphs.tsx`.

Tampoco se crea un `EmptyCart.tsx` suelto: el `EmptyState` genérico
(`shared/components/EmptyState.tsx`) recibe una prop `illustration` y todos los
empty states lo usan.

---

## 4. CONTEXTO ACTUAL (verificado)

- `rocket` y `rocketSuccess` existen en el pack de íconos (LOOP_ICONOS_01).
- El cohete del hero/logo es PNG (`RocketMark`, `/public/brand/`); NO se toca.
- `ErrorBoundary` muestra `rocket` en una `Drop` de 72px (sin ilustración real).
- Carrito vacío y "sin resultados" usan `EmptyState` (ícono + texto + CTA).
- `OrderSuccessView` usa `rocketSuccess` como ilustración pequeña.
- No existe página 404: la ruta `*` hace `Navigate` al login.
- No existe sistema de ilustraciones.

---

## 5. PROBLEMAS A RESOLVER (alcance del núcleo)

### PROBLEMA 1 — Mascota sub-explotada
El cohete grande aparece en muy pocos lugares. El núcleo lo lleva a 5 contextos
que existen hoy (carrito vacío, sin resultados, error, éxito de pedido, 404).

### PROBLEMA 2 — Sin personalidad definida
Debe tener carácter consistente: rápido, confiable, cálido, con guiño local a
Riohacha sin exagerar.

### PROBLEMA 3 — Sin sistema de ilustraciones
Faltan ilustraciones de 120–240px, distintas de los íconos de 24px. Estilo:
**cohete con relleno de atardecer (`brand-gradient`)**, elementos secundarios en
línea fina 1.75 o sólidos, esquinas 2px.

### PROBLEMA 4 — Sin grid maestro
Grid 240x240, área segura 20px, cohete = 60% del canvas.

### PROBLEMA 5 — Empty states sin ilustración (solo los existentes)
Carrito vacío y sin resultados → hoy solo ícono + texto. (Favoritos, pedidos,
direcciones y conexión pasan a LOOP_VISUAL_03B: sus pantallas/estados aún no
existen o dependen de otros LOOPs.)

### PROBLEMA 6 — Success sin celebración
`OrderSuccessView` (confirmación de pedido) sin momento visual memorable.
(Calificación y dirección guardada → 03B.)

### PROBLEMA 7 — Error states fríos
`ErrorBoundary` y 404 sin empatía visual. (Pago rechazado y sin conexión → 03B.)

### PROBLEMA 8 — Sin consistencia de estilo
El cohete de las ilustraciones debe ser reconocible como el mismo del pack de
íconos y del logo: mismo relleno de atardecer, misma silueta.

---

## 6. DECISIONES DE DISEÑO

### Decisión 1 — Nombre del cohete
Opción D: sin nombre visible (el cohete habla por sí solo). **Confirmada.**

### Decisión 2 — Personalidad
- Rápido (siempre listo para despegar)
- Confiable (nunca perdido)
- Cálido (sonríe sutilmente)
- Local (guiño a Riohacha sin exagerar)

### Decisión 3 — Estilo (ACTUALIZADA)
- **Cohete con RELLENO DE ATARDECER (`brand-gradient`)**: respeta el cohete real
  del logo, del ícono de la app y del hero. NO es outline.
- Elementos secundarios (lupa, bolsa, corazón, signos): **línea fina 1.75
  uniforme** o sólidos de un solo color, consistentes con el cohete.
- Esquinas 2px, líneas continuas.
- Trazo de contorno del cohete y de los secundarios: `brand-700`.

### Decisión 4 — Paleta
- Contorno y detalles: brand-700 (#1C2459)
- Relleno del cohete / llama: brand-gradient (atardecer #1C2459 → #F4652C → #FFC24B)
- Elementos secundarios: gray-400 o brand-100
- NUNCA colores fuera de la paleta

### Decisión 5 — Tamaños
- sm: 120x120
- md: 180x180 (default empty states)
- lg: 240x240 (éxito)
(xs 80 y xl 320 quedan para 03B/onboarding: sin uso hoy.)

---

## 7. ALCANCE (REDUCIDO)

### ✅ Incluido en LOOP_VISUAL_03
- Definición del personaje (personalidad, estilo)
- **6 ilustraciones SVG**: RocketIdle, RocketSuccess, RocketEmptyCart, RocketNoResults, RocketConfused, RocketSad
- Wrapper `Illustration.tsx`
- Prop `illustration` en `EmptyState` + uso en **carrito vacío** y **sin resultados**
- **ErrorBoundary** con RocketSad
- **OrderSuccessView** con RocketSuccess
- **404 real** (`NotFound.tsx`) con RocketConfused y ruta `*` apuntando ahí
- A11y completa
- Tests unitarios y de render

### 🚫 Fuera de alcance → LOOP_VISUAL_03B
- Ilustraciones: RocketNoFavorites, RocketNoOrders, RocketLocation, RocketNoConnection, RocketRating, RocketHappy
- Integraciones: EmptyFavorites, EmptyOrders, EmptyAddresses, EmptyConnection, RatingModal

### 🚫 Fuera de alcance (otros LOOPs)
- Animaciones (LOOP_VISUAL_07)
- Iconos de 24px (LOOP_VISUAL_01 / LOOP_ICONOS_01)
- Fotografías (LOOP_VISUAL_02)
- Onboarding completo (LOOP_VISUAL_12)
- Splash screen nativo (config PWA)

---

## 8. COMPONENTES A CREAR / REFACTORIZAR

```
src/shared/illustrations/
├── index.ts
├── types.ts
├── Illustration.tsx           (wrapper)
├── RocketIdle.tsx             (base neutral)
├── RocketSuccess.tsx
├── RocketEmptyCart.tsx
├── RocketNoResults.tsx
├── RocketConfused.tsx
└── RocketSad.tsx
```

Crear:
- `src/shared/pages/NotFound.tsx` (404 real, con RocketConfused + CTA según sesión: "Volver al inicio" → /app/home, o "Iniciar sesión" → /login)

Refactorizar:
- `src/shared/components/EmptyState.tsx` — agregar prop opcional `illustration` (nombre de ilustración); sin ella se comporta igual que hoy (ícono)
- `src/features/client/pages/CartPage.tsx` — el `EmptyState` del carrito vacío usa `illustration="emptyCart"` (sin crear `EmptyCart.tsx`)
- Pantalla de resultados vacíos de Restaurantes/Categoría — `EmptyState` con `illustration="noResults"` (sin crear `EmptySearchResults.tsx`)
- `src/shared/components/ErrorBoundary.tsx` — RocketSad en lugar de la `Drop` con `rocket`
- `src/features/client/components/OrderSuccessView.tsx` — RocketSuccess (nombre real; NO existe `OrderConfirmationPage`)
- `src/router/index.tsx` — la ruta `*` renderiza `NotFound` (deja de redirigir al login)

NO se crean: `EmptyCart.tsx`, `EmptyFavorites.tsx`, `EmptyOrders.tsx`,
`EmptyAddresses.tsx`, `EmptySearchResults.tsx`, `EmptyConnection.tsx`,
`OrderConfirmationPage.tsx`, ni modificaciones a `RatingModal`.

> Nota sobre la ruta `*`: hoy manda a `/login`. `NotFound` debe funcionar con o
> sin sesión, con un único botón cuyo copy y destino dependen de la sesión
> (confirmado por Jorge):
>
> | Sesión | Botón | Navega a |
> |---|---|---|
> | Con sesión | "Volver al inicio" | `/app/home` |
> | Sin sesión | "Iniciar sesión" | `/login` |
>
> El resto del comportamiento (cohete RocketConfused, título y subcopy) es igual.

---

## 9. MOCKUP ASCII

Empty state (ejemplo carrito):

```text
┌──────────────────────────────┐
│                              │
│         ╱╲                   │
│        ╱  ╲                  │
│       │ ◯  │                 │
│       │    │                 │
│      ╱│    │╲       ▢        │
│     ╱ │    │ ╲    (bolsa)    │
│       ╲▼▼▼▼╱                 │
│                              │
│   Tu carrito está vacío      │
│                              │
│   Explora restaurantes y     │
│   encuentra algo delicioso.  │
│                              │
│   [ Explorar restaurantes ]  │
│                              │
└──────────────────────────────┘
```

---

## 10. REGLAS ARQUITECTÓNICAS

- NO crear segunda mascota (unificar en el cohete)
- NO crear segunda librería de ilustraciones
- NO mezclar estilos: cohete con relleno de atardecer + secundarios en línea fina/sólidos, igual en todas
- El cohete del hero (`RocketMark`, PNG) NO se toca
- Reusar tokens de LOOP_CLIENT_01 (`brand-gradient`, `brand-700`)
- `<Icon name="rocket">` (24px) sigue como ícono; `Illustration` (120–240px) es distinto
- NO duplicar lógica entre el pack de íconos e `Illustration`
- Cada ilustración es un componente separado (tree-shakeable)
- Wrapper `Illustration.tsx` con API consistente: `name`, `size`, `className` (sin `animate`: animación es LOOP_VISUAL_07)
- Colores por clase/token, no hex sueltos (`currentColor` + `--brand-gradient`)

---

## 11. A11Y ESPECÍFICA

- Ilustración decorativa: `aria-hidden="true"`
- Contenedor del empty state: `role="status"`
- Contenedor con `aria-label` descriptivo ("Tu carrito está vacío")
- El texto del empty state comunica, la ilustración refuerza
- NUNCA depender solo de la ilustración
- CTA con `aria-label` completo
- Verificar con VoiceOver/TalkBack

---

## 12. UX ESPECÍFICA

- Empty states: ilustración + título breve + subcopy + CTA primario
- Success: ilustración grande + copy celebratorio + CTA siguiente paso
- Error: ilustración empática + copy accionable + retry
- 404: cohete perdido + CTA según sesión: "Volver al inicio" (`/app/home`) con sesión, "Iniciar sesión" (`/login`) sin sesión
- Cada ilustración debe aportar emoción sin distraer

---

## 13. PERFORMANCE

- SVG optimizados (sin metadata, sin grupos innecesarios)
- Paths simplificados
- Sin animación CSS en este LOOP
- Cada ilustración es componente separado (tree-shaking)
- Bundle size objetivo: ≤ 2KB por ilustración minificada

---

## 14. TESTS

### Unit
- Illustration renderiza el componente correcto según name
- Illustration aplica el tamaño correcto según size
- Todas las ilustraciones con `viewBox="0 0 240 240"`
- Los trazos secundarios comparten `stroke-width=1.75`
- Ninguna ilustración tiene IDs duplicados (gradientes con id único por ilustración)

### Render
- `EmptyState` con `illustration` muestra la ilustración; sin ella, el ícono de siempre
- Carrito vacío muestra RocketEmptyCart
- Sin resultados muestra RocketNoResults
- ErrorBoundary muestra RocketSad
- OrderSuccessView muestra RocketSuccess
- Ruta desconocida muestra `NotFound` con RocketConfused; con sesión el CTA es "Volver al inicio" (→ `/app/home`), sin sesión "Iniciar sesión" (→ `/login`)
- Ilustración con `aria-hidden` cuando es decorativa
- Empty state con `role="status"`

### Visual
- Snapshot de cada ilustración

---

## 15. CRITERIOS DE ÉXITO

- [ ] 6 ilustraciones creadas (RocketIdle, Success, EmptyCart, NoResults, Confused, Sad)
- [ ] Wrapper Illustration.tsx funcional
- [ ] `EmptyState` acepta prop `illustration` sin romper usos existentes
- [ ] Carrito vacío con RocketEmptyCart (sin `EmptyCart.tsx` nuevo)
- [ ] Sin resultados con RocketNoResults
- [ ] ErrorBoundary con RocketSad
- [ ] OrderSuccessView con RocketSuccess
- [ ] `NotFound.tsx` creado con RocketConfused y ruta `*` apuntando ahí
- [ ] Todas con `viewBox` 240x240
- [ ] Cohete con relleno de atardecer; secundarios en línea 1.75 o sólidos
- [ ] Todas con paleta brand-700 + atardecer + gray-400
- [ ] Sin emojis reemplazando ilustraciones
- [ ] A11y: aria-hidden + role="status" correctos
- [ ] Consola limpia
- [ ] Build exitoso
- [ ] Lint (tsc) exitoso
- [ ] Tests pasando
- [ ] Lighthouse a11y ≥ 95 y Axe 0 críticas (validación de Jorge)
- [ ] Sin regresiones visuales

---

## 16. QA CRÍTICO

1. Carrito vacío → cohete con bolsa
2. Sin resultados de búsqueda → cohete con lupa
3. URL inexistente (ej. `/algo-que-no-existe`) → 404 con cohete perdido y CTA según sesión (ya no redirige al login)
4. ErrorBoundary (forzar un error) → cohete triste/neutral
5. Confirmación de pedido → cohete despegando
6. Todas las ilustraciones con trazo y relleno consistentes
7. Todas con la misma paleta
8. Reconocible como el mismo cohete del logo
9. Sin pixelado ni deformaciones al cambiar tamaño
10. Bundle size razonable (≤ 2KB por ilustración minificada)
11. Consola limpia
12. Build exitoso
13. A11y: aria-hidden en ilustraciones decorativas
14. A11y: role="status" en empty states
15. Sin regresión visual en Carrito, Restaurantes y Checkout
16. Responsive en 320px
17. Responsive en desktop
18. Sin emojis como fallback
19. `EmptyState` sin `illustration` se ve igual que antes
20. 404 con sesión → botón "Volver al inicio" lleva a `/app/home`; sin sesión → botón "Iniciar sesión" lleva a `/login`

---

## 17. REGLAS IMPORTANTES

- NO introducir mascota que hable en primera persona
- NO crear ilustraciones infantiles
- NO salir de la paleta de marca
- NO usar imágenes rasterizadas (solo SVG)
- NO mezclar estilos
- NO cambiar el cohete del hero sin consultar
- NO tocar iconos de LOOP_VISUAL_01
- NO tocar fotografías de LOOP_VISUAL_02
- NO animar en este LOOP
- NO crear segunda librería de ilustraciones

---

## 18. REPORTE FINAL

### IMPLEMENTADO
<resumen>

### ARCHIVOS MODIFICADOS
<lista>

### ARCHIVOS CREADOS
<lista>

### DECISIONES TOMADAS
- Nombre del cohete: A / B / C / D
- Personalidad definida: <3-5 adjetivos>
- Paleta confirmada: brand-700 + atardecer + gray-400

### ILUSTRACIONES
- Lista de las 6 con screenshot
- Bundle size por ilustración
- Stroke width confirmado

### INTEGRACIÓN
- Empty states actualizados (lista)
- Success states actualizados (lista)
- Error states actualizados (lista)
- 404 actualizado

### A11Y
<lista de role + aria-label por componente>

### TESTS
```
Build:      OK / FAIL
Lint:       OK / FAIL / N/A
Typecheck:  OK / FAIL / N/A
Tests:      OK / FAIL / N/A
```

### QA
<cuáles de 25 validados>

### PROBLEMAS ENCONTRADOS
<fuera de alcance>

### DEUDA TÉCNICA GENERADA
<deuda>

### PREPARACIÓN PARA LOOP_VISUAL_04
<qué quedó preparado>

---

## 19. LO QUE NO DEBES HACER

- NO animar (V07)
- NO tocar iconos (V01)
- NO tocar fotografías (V02)
- NO usar emojis como fallback
- NO usar imágenes rasterizadas
- NO crear segunda mascota
- NO salir de la paleta
- NO introducir dependencias nuevas sin justificar

---

## 20. REGLA FINAL

La mascota es el hilo conductor emocional de la app. Si aparece pocas veces o mal integrada, no genera reconocimiento. Si aparece bien, el usuario sonríe cada vez que ve el cohete.

Cada ilustración debe:
- Ser reconocible como el mismo cohete del logo (relleno de atardecer)
- Usar la misma paleta (brand-700 + atardecer + gray-400)
- Mantener línea fina 1.75 / sólidos consistentes en los elementos secundarios
- Aportar emoción sin ser infantil
- Reforzar el mensaje sin distraer

**Prioridad:** CONSISTENCIA → PERSONALIDAD → UTILIDAD → A11Y → ESTÉTICA

Si tienes que elegir entre 15 ilustraciones mediocres y 6 excelentes: elige las 6.

Cada ilustración que agregas debe ganarse su lugar. Lo que no entra aquí se
documenta para **LOOP_VISUAL_03B**.

---

## REGLA DE EJECUCIÓN

No lo ejecutes todavía.

Solo crea el archivo en `docs/loops/visual/LOOP_VISUAL_03.md` y confírmame:
- Ruta exacta
- Tamaño (líneas + KB)
- Cualquier decisión que necesites que yo confirme antes de ejecutar
