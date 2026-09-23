# LOOP_VISUAL_02 — TRATAMIENTO FOTOGRÁFICO PREMIUM

## ROL

Actúa como:

**Senior Product Designer + Art Director + Frontend Engineer + Performance Engineer**

Continúa sobre el repositorio de Domicilios Riohacha. `LOOP_VISUAL_01` (en
el repo: `LOOP_ICONOS_01.md`) ya está ejecutado: iconografía propia estilo
gota conectada al módulo cliente, sin emojis-como-ícono en Home,
Restaurantes, Detalle, Carrito y componentes compartidos.

Objetivo de este LOOP: definir y aplicar un tratamiento **consistente** de
fotografía en todo el módulo cliente. La fotografía es el 80% de la
percepción de calidad en una app de delivery — si las fotos se ven crudas,
la app se ve amateur aunque el resto del diseño esté bien.

> **PARTE DE LA BASE YA EXISTE.** `ProductImage.tsx` ya resuelve
> foto-real / emoji-de-contenido / ícono-de-respaldo con `onError`, y el
> Service Worker ya cachea Supabase Storage con `CacheFirst`. Este LOOP no
> reconstruye eso: le agrega lo que falta (aspect ratios centralizados,
> overlay reutilizable, skeleton, transición de carga, avatar) y lo
> reparte al resto de las imágenes de la app que hoy no pasan por
> `ProductImage`.

---

# 1. REGLA ABSOLUTA

ANTES DE MODIFICAR:

INSPECCIONA.

No asumas nada. No inventes nombres de archivos. No crees archivos
paralelos. Primero lee lo que ya existe.

Busca en el repositorio:

```text
ProductImage
RestaurantHero
RestaurantGridCard
RestaurantCard      (legacy, verificar si sigue vivo)
ProductCard         (legacy, verificar si sigue vivo)
ProductDetailSheet
FeaturedSection
DeliveryTrackingSection
CartItemRow
ClientAccountPage   (avatar)
sw.ts               (CacheFirst de Storage)
aspect-
object-cover
loading=
```

Reporta antes de escribir código si algo de la sección 2 cambió desde la
auditoría.

---

# 2. ESTADO REAL AUDITADO (23-sep-2026)

Esta tabla manda sobre cualquier nombre genérico del resto del documento.

## 2.1 Lo que YA existe (no reconstruir)

| Pieza pedida | Qué existe HOY | Acción |
|---|---|---|
| Componente base de imagen | `shared/components/ProductImage.tsx` — decide foto real (`http(s)://`) vs emoji guardado por el restaurante (contenido, no UI) vs ícono de respaldo (`Icon name="restaurants"`) | Es la base a extender, **no** crear un `Image.tsx` paralelo con otra lógica |
| `onError` / fallback | `ProductImage.tsx:19-33` — guarda `failedUrl` en estado y cae al ícono propio; nunca el ícono de imagen rota del navegador | Ya resuelto. Reutilizar el patrón, no reescribirlo |
| Lazy loading en fotos de producto/restaurante en grid | `ProductImage.tsx:27` (`loading="lazy"`, `decoding="async"`), `RestaurantGridCard.tsx:68`, `FeaturedSection.tsx:64` | Ya resuelto donde se usa `ProductImage`/estas cards |
| Cache de Supabase Storage | `src/sw.ts:60-62` — `CacheFirst` con `cacheName: 'supabase-images-cache'` sobre `*.supabase.co/storage/v1/object/public/*` | Ya resuelto. **No tocar `sw.ts`** |
| Overlay de legibilidad en el Hero | `RestaurantHero.tsx:55` — `bg-gradient-to-t from-black/90 via-black/60 via-45% to-black/10`, densidad ya ajustada en CLIENT_03 para que el texto del restaurante no se mezcle con fotos con texto propio (letreros, teléfonos) | Ya resuelto en el Hero. No es "sin overlay" como asumía el pedido original |
| `aria-label`/`alt` reales | `RestaurantHero.tsx:41` (`` `Portada de ${restaurant.name}` ``), `RestaurantGridCard.tsx:67` (`restaurant.name`), rating con `sr-only` + texto oculto (`RestaurantHero.tsx:101-108`) | Ya resuelto en estos dos archivos. Auditar el resto (sección 8) |
| Aspect ratio en la card de restaurante | `RestaurantGridCard.tsx:63` — `aspect-[4/3]`, consistente en Home y Restaurantes (mismo componente) | Ya resuelto — **no cambiar a 1:1**, ya está decidido y es consistente |
| Aspect ratio en el detalle de producto | `ProductDetailSheet.tsx:53` — `aspect-video` (16:9) | Ya resuelto para ese contexto |

## 2.2 Lo que el pedido original asumía mal (corregido aquí)

| Asunción original | Realidad |
|---|---|
| "Cards de restaurante con overlay + texto encima" | Las cards (`RestaurantGridCard`) **no** ponen texto sobre la foto: el nombre vive en un panel blanco debajo (`p-3`). Es una decisión ya tomada y más segura que un overlay (no depende de qué tan clara/oscura sea la foto que sube cada restaurante). Este LOOP **no** le agrega overlay a las cards — el overlay es del Hero, donde sí hay texto sobre la imagen |
| "Sin fallback" | Sí hay fallback (`ProductImage`), con ícono propio, no emoji ni ícono roto |
| "Sin alt descriptivo" | Los dos componentes más usados (`RestaurantHero`, `RestaurantGridCard`) ya tienen alt real. Falta auditar el resto (`FeaturedSection`, `DeliveryTrackingSection`, `CartItemRow`, código legacy) |
| "Sin manejo offline" | Ya existe, en el Service Worker, ver 2.1 |

## 2.3 Lo que SÍ falta (alcance real de este LOOP)

| Pedido | Realidad | Acción |
|---|---|---|
| Skeleton/placeholder mientras carga una foto individual | No existe — `.skeleton` en `styles.css` se usa para pantallas de carga completas (ej. `RestaurantCardsSkeleton`), no por-imagen dentro de `ProductImage` | Implementar (sección 4) |
| Transición fade-in al cargar | No existe — la imagen aparece de golpe cuando termina de bajar | Implementar (sección 4) |
| `width`/`height` explícitos o `aspect-ratio` reservado en TODOS los contenedores de imagen | Parcial: donde ya hay `aspect-[…]`/`aspect-video` en el contenedor padre está resuelto; donde una imagen vive suelta sin contenedor con ratio (ej. `CartItemRow`, avatar) no | Auditar y cerrar los huecos (sección 3) |
| Overlay reutilizable | No existe como componente — el del Hero está hardcodeado inline | Extraer `ImageOverlay` con las mismas variantes que ya usa el Hero, no inventar valores nuevos (sección 5) |
| Filtro cromático de marca | No existe en ningún lado | Evaluar con cautela (sección 6) — es el punto de mayor riesgo de "sobre-procesar" |
| Transformaciones de Supabase Storage (`?width=`) | No usadas en ningún lado. **Sin confirmar si el plan de Supabase del proyecto soporta el Image Transformation API** (es una función de pago por uso, no viene en todos los planes) | Verificar con Jorge antes de escribir código que asuma que existe (sección 7) |
| Avatar | No existe `Avatar.tsx`. `ClientAccountPage` resuelve "inicial sobre gradiente" inline, sin tamaños ni variante con foto | Crear `Avatar.tsx` (sección 9) |
| `RestaurantCard.tsx` / `ProductCard.tsx` (legacy) | Ambos siguen en `src/features/client/components/`, con `aspect-video`/`aspect-square` y emoji en gradiente. `ProductCard.tsx` no tiene imports (confirmado por grep). `RestaurantCard.tsx` solo lo importa `HomePage.tsx`, que a su vez **no está en el router** (código muerto documentado desde CLIENT_01) | Eliminar ambos en este LOOP — no migrarlos, no son parte de ninguna pantalla real |
| `fetchpriority` / `loading="eager"` explícito en heroes | Ninguno de los `<img>` de Hero (`RestaurantHero.tsx:39`) declara `loading` ni `fetchpriority` — queda en el default del navegador (`auto`), no garantiza carga prioritaria | Agregar explícitamente (sección 3) |

---

# 3. ASPECT RATIOS Y CARGA: CERRAR LOS HUECOS, NO REDEFINIR LO QUE YA FUNCIONA

Mapa final (lo ya resuelto se mantiene tal cual; solo se completa lo que
falta):

| Contexto | Ratio | Estado |
|---|---|---|
| Hero restaurante (`RestaurantHero.tsx:37`) | Altura fija `h-52`, no ratio relativo | **Sin cambio** — es intencional (el hero comparte alto con el header compacto de CLIENT_03; pasar a `aspect-[16/9]` rompería ese cálculo). Sí agregar `loading="eager"` + `fetchpriority="high"` al `<img>` de la portada |
| Card restaurante (`RestaurantGridCard.tsx:63`) | `aspect-[4/3]` | Ya resuelto |
| Card de oferta (`FeaturedSection.tsx`) | Verificar en código — auditar antes de tocar | Completar `aspect-[4/3]` si falta |
| Detalle de producto (`ProductDetailSheet.tsx:53`) | `aspect-video` (16:9) | Ya resuelto |
| Fila de producto en carrito (`CartItemRow` dentro de `CartPage.tsx`) | Contenedor `w-12 h-12` fijo (no `aspect-*`, pero ancho=alto ya lo hace cuadrado) | Sin cambio funcional; verificar que `ProductImage` dentro no se deforme (`object-cover` ya aplica) |
| Avatar | Sin definir hoy | Definir en `Avatar.tsx` (sección 9): `sm=32 md=48 lg=72 xl=96`, siempre círculo (`rounded-full` + contenedor cuadrado) |

`object-fit`: todo lo auditado ya usa `object-cover`. No se encontró ningún
`object-fill`. Mantener `object-cover` como default; `object-contain` solo
si en la auditoría aparece un logo (no se encontró ninguno en el módulo
cliente hoy).

---

# 4. SKELETON + TRANSICIÓN DE CARGA (dentro de `ProductImage`)

Extender `ProductImage.tsx`, no crear un componente paralelo:

```text
Estado nuevo: `loaded` (boolean, false al montar)
Mientras `isRealPhoto && !loaded`:
  - Mostrar detrás de la <img> un fondo con el gradiente suave de marca
    (`bg-brand-gradient-soft`, ya existe en tailwind.config) o `.skeleton`
    si el contexto es una lista larga (grid de restaurantes) — decidir por
    contexto, no forzar uno solo.
  - <img> con opacity-0, transition-opacity duration-300
Al disparar `onLoad`:
  - loaded = true → opacity-100
Reduced motion: transición inmediata (sin fade), respetar
  usePrefersReducedMotion() (ya existe desde CLIENT_01)
```

No es un blur-up real (LQIP) — el proyecto no genera miniaturas hoy (ver
sección 7). Placeholder de color/gradiente + fade-in cubre el objetivo real
(evitar el "flash" de fondo blanco/gris) sin inventar infraestructura de
generación de imágenes que no existe.

---

# 5. `ImageOverlay`: EXTRAER, NO INVENTAR VALORES NUEVOS

Crear `src/shared/components/ImageOverlay.tsx` con las variantes que **ya**
usa el Hero, para no tener el gradiente hardcodeado en un solo archivo:

```text
variant="bottom-gradient"  → bg-gradient-to-t from-black/90 via-black/60 via-45% to-black/10
                              (exactamente el valor de RestaurantHero.tsx:55, no el
                              rgba(28,36,89,…) que proponía el pedido original —
                              ese valor no es el que está en producción y aprobado)
variant="full-soft"        → bg-black/15   (nuevo, para fotos con overlay parejo suave)
variant="full-strong"      → bg-black/45   (nuevo)
```

Uso: `<div className="relative">...<ImageOverlay variant="bottom-gradient" />...</div>`
(overlay como `div` absoluto, igual que hoy en el Hero).

`RestaurantHero.tsx` pasa a usar `<ImageOverlay variant="bottom-gradient" />`
en vez de la clase inline — mismo resultado visual, ahora reutilizable.
No se le agrega overlay a `RestaurantGridCard` (ver 2.2): las cards no lo
necesitan porque el nombre no vive sobre la foto.

---

# 6. FILTRO CROMÁTICO: EVALUAR, NO APLICAR A CIEGAS

El pedido original propone `saturate(1.05) contrast(1.02)` global. Antes de
aplicarlo:

- Probar visualmente sobre fotos reales de los restaurantes actuales (no
  sobre fotos de stock) — un filtro que se ve bien en food photography
  profesional puede verse raro sobre una foto de celular con poca luz.
- Si se aplica, que sea una clase utilitaria (`filter saturate-[1.05]
  contrast-[1.02]`) puesta en `ProductImage`/`RestaurantHero` como opción,
  **no** en el `<img>` crudo de cada pantalla por separado.
- Es el ítem de mayor riesgo de "sobre-procesar" del LOOP completo: si al
  verlo en pantalla real la comida se ve peor (más artificial), se
  descarta y se documenta como decidido-que-no, no como pendiente.

---

# 7. TRANSFORMACIONES DE SUPABASE: VERIFICAR ANTES DE ESCRIBIR CÓDIGO

El Image Transformation API de Supabase (`?width=&height=&resize=`) es una
función que depende del plan del proyecto — no todos los planes la tienen
habilitada, y activarla tiene costo. **No asumir que está disponible.**

Antes de tocar una sola URL:

1. Probar manualmente una URL real de `cover_url`/`image_url` con
   `?width=400&quality=80` agregado y confirmar si Supabase responde una
   imagen redimensionada o el archivo original sin cambios (o un error).
2. Si funciona: crear un helper único
   `src/shared/utils/supabaseImage.ts` con
   `withTransform(url, { width, height, quality })` que ambos,
   `ProductImage` y `RestaurantHero`, usan — no repetir la construcción de
   query params en cada archivo.
3. Si NO funciona (plan sin soporte): documentarlo en el reporte final
   como bloqueado, no simular una transformación que no ocurre.

No instalar `sharp` ni ninguna librería de procesamiento — no aplica en un
proyecto Vite sin build-time image pipeline, y el pedido original ya lo
descarta.

---

# 8. A11Y: ALT REAL EN TODO LO QUE FALTA

Ya resuelto (no tocar): `RestaurantHero`, `RestaurantGridCard`.

Auditar y completar en:

```text
FeaturedSection.tsx          → alt = promo.title (verificar que no sea genérico)
DeliveryTrackingSection.tsx  → alt del avatar/foto del domiciliario si aplica
CartItemRow (CartPage.tsx)   → ya usa ProductImage con alt=product.name (confirmar)
```

Reglas (ya aplicadas en `ProductImage`, extender igual a lo nuevo):

- Foto real informativa → `alt` descriptivo real (nombre del restaurante o
  producto, no "restaurant image"/"product").
- Decorativa (ej. el ícono de respaldo, el logo repetido en el Hero) →
  `alt=""` o `aria-hidden`, como ya hace `RestaurantHero.tsx:88-96`.
- Avatar → `alt` con el nombre del usuario cuando hay foto; sin `alt`
  (decorativo, el nombre ya está en texto al lado) cuando es la inicial.

---

# 9. AVATAR

Crear `src/shared/components/Avatar.tsx`:

```text
<Avatar src={user.avatar_url} name={user.name} size="sm" | "md" | "lg" | "xl" />

sm=32px  md=48px  lg=72px  xl=96px
Con src: círculo, object-cover, ring-1 ring-white (o ring-brand-100 sobre fondo oscuro)
Sin src: iniciales (reutilizar la lógica de iniciales que ya existe en
  ClientAccountPage, no reinventarla) sobre bg-brand-gradient, texto blanco
```

`ClientAccountPage.tsx` pasa a usar `Avatar`, eliminando su bloque inline
de inicial-sobre-gradiente.

---

# 10. `Image.tsx` GENÉRICO: DECISIÓN

El pedido original propone un `Image.tsx` base nuevo con API
`aspect`/`fit`/`eager` de la que `RestaurantImage`/`ProductImage`
heredarían. Dado que `ProductImage.tsx` **ya existe, ya está integrado en
toda la app, y ya resuelve el 80% de esa API** (foto real vs contenido vs
fallback, lazy, onError), crear un `Image.tsx` paralelo duplicaría lógica.

Decisión de este LOOP: **extender `ProductImage.tsx` en el lugar** (skeleton,
fade-in, alt/decorativo) en vez de crear `shared/components/Image/` desde
cero. No crear `RestaurantImage.tsx` tampoco: `RestaurantHero` y
`RestaurantGridCard` ya son ese componente, especializados por contexto.

Si en un LOOP futuro aparece una tercera pantalla con necesidades de
imagen genuinamente distintas (no cubiertas por extender `ProductImage`),
ahí se evalúa una base compartida — no antes, por especulación.

---

# 11. NO CREAR UN SEGUNDO…

```text
Componente de imagen (ProductImage ya existe y se extiende)
Sistema de overlay (ImageOverlay es nuevo, pero único)
Servicio de storage.service.ts (irrelevante aquí, es para localStorage)
Cache de imágenes (sw.ts ya lo hace)
```

No instalar librerías de imágenes (`react-lazy-load-image-component`,
`next/image` no aplica en Vite, blurhash, etc.). No instalar `sharp` u
otro procesador — no hay pipeline de build de imágenes en este proyecto.

---

# 12. COMPONENTES A CREAR/REFACTORIZAR

```text
shared/components/ProductImage.tsx    (extender: skeleton + fade-in + alt)
shared/components/ImageOverlay.tsx    (nuevo)
shared/components/Avatar.tsx          (nuevo)
shared/utils/supabaseImage.ts         (nuevo, SOLO si la sección 7 confirma soporte)
client/components/RestaurantHero.tsx  (usar ImageOverlay, agregar loading/fetchpriority al hero)
client/components/FeaturedSection.tsx (auditar alt + aspect ratio)
client/components/DeliveryTrackingSection.tsx (auditar alt)
client/pages/ClientAccountPage.tsx    (usar Avatar)
```

Eliminar (código muerto, confirmado sin imports reales):

```text
client/components/RestaurantCard.tsx
client/components/ProductCard.tsx
```

---

# 13. A11Y ESPECÍFICA

- Toda `<img>` informativa con `alt` real (sección 8).
- Decorativas: `alt=""` o `aria-hidden`, patrón ya usado en `RestaurantHero`.
- Estado de carga del skeleton: `aria-hidden="true"` en el placeholder (no
  es contenido, es un estado transitorio) — no usar `role="status"` por
  cada imagen individual, eso es ruido si hay 20 en una grilla; el
  `role="status"` de carga ya vive a nivel de pantalla
  (`RestaurantCardsSkeleton`, etc.), no se duplica por imagen.
- Avatar: `alt` con el nombre cuando hay foto; sin rol especial cuando es
  la inicial (es texto real, ya accesible).
- Mantener todos los `aria-label`/`aria-pressed` de favoritos y botones
  que ya existen en `RestaurantHero`/`RestaurantGridCard` — este LOOP no
  los toca.

---

# 14. PERFORMANCE

- `loading="lazy"` en todo lo que no sea el hero visible al entrar a la
  pantalla (ya es el caso en `ProductImage`, `RestaurantGridCard`,
  `FeaturedSection`).
- `loading="eager"` + `fetchpriority="high"` **solo** en el `<img>` de
  `RestaurantHero.tsx:39` (hoy no tiene ninguno de los dos declarado). El
  Home no tiene un hero fotográfico propio (usa `HomeHeroBanner`, que es
  gradiente + marca de agua del cohete, sin foto) — no aplica ahí.
- `decoding="async"` ya está en `ProductImage`; agregarlo donde falte
  (`RestaurantHero.tsx:39` no lo tiene explícito, solo en la variante sin
  `cover_url`).
- CLS: los contenedores con `aspect-[…]`/altura fija ya reservan espacio;
  el hueco real es el skeleton (sección 4), que además de estética evita
  que el contenido de abajo salte cuando la imagen carga.
- No agregar transformaciones de Supabase sin confirmar soporte (sección 7)
  — pedir 2000×2000 para mostrar en 80×80 sigue pasando hasta que esa
  verificación se resuelva; documentarlo como deuda si el plan no lo
  soporta.

---

# 15. CONSOLE CLEAN

Navegar Home, Restaurantes, Detalle de un restaurante con y sin `cover_url`,
Carrito con productos, Cuenta del cliente.

```text
0 errores
0 warnings de React / keys / act()
0 errores de CORS o 404 de imágenes
```

---

# 16. BUILD, LINT Y TYPECHECK

```bash
npm run build
npm run lint        # = tsc --noEmit
npm run type-check
```

---

# 17. TESTS

Extender `ProductImage.test.tsx` (ya existe, ver LOOP_ICONOS_01):

```ts
Muestra skeleton/placeholder mientras `loaded` es false
Aplica fade-in (clase opacity) al disparar onLoad
Reduced motion: sin transición, opacity-100 inmediato
onError sigue cayendo al ícono de respaldo (no debe romperse por el cambio)
```

Nuevos:

```ts
// ImageOverlay.test.tsx
Cada variant renderiza la clase de opacidad correcta

// Avatar.test.tsx
Con src: <img> circular con el alt del nombre
Sin src: iniciales sobre bg-brand-gradient
Tamaños sm/md/lg/xl aplican el ancho/alto correcto
```

Integración:

```text
RestaurantHero: <img> del hero con loading="eager" y fetchpriority="high"
RestaurantGridCard / FeaturedSection: <img> con loading="lazy"
ClientAccountPage: usa <Avatar>, ya no el bloque inline de inicial
```

---

# 18. QA CRÍTICO

1. Hero del restaurante carga con prioridad (loading="eager" confirmado en
   DevTools → Network).
2. Cards de restaurante (Home y Restaurantes) siguen en `aspect-[4/3]`,
   sin overlay de texto (comportamiento sin cambio, confirmar que sigue
   así tras extender `ProductImage`).
3. Placeholder/skeleton visible mientras carga una foto en 3G simulado.
4. Transición fade-in suave al terminar de cargar, sin flash.
5. Reduced motion → sin fade, aparece directo.
6. Producto sin imagen (ni foto ni emoji) → ícono de respaldo (ya
   funciona; confirmar que sigue así).
7. URL de imagen rota (404 forzado) → cae al ícono de respaldo, nunca el
   ícono roto del navegador.
8. Avatar con foto → círculo, `object-cover`, sin deformar.
9. Avatar sin foto → iniciales sobre el degradado de marca.
10. Avatar en los 4 tamaños se ve proporcional.
11. `RestaurantCard.tsx`/`ProductCard.tsx` eliminados → build no rompe
    (confirmando que de verdad no los importaba nadie vivo).
12. Overlay del Hero sigue viéndose igual que antes de extraer
    `ImageOverlay` (mismo gradiente, misma densidad).
13. Filtro cromático (si se decide aplicar) — comparar antes/después con
    fotos reales, no de stock.
14. Transformación de Supabase — si se confirma soporte, una imagen grande
    se sirve redimensionada; si no, queda documentado como bloqueado.
15. Offline: las fotos ya visitadas se ven sin conexión (cache del SW, sin
    cambios de este LOOP, solo confirmar que sigue funcionando).
16. Consola limpia, sin 404 ni CORS.
17. Sin CLS visible al hacer scroll en el grid de restaurantes.
18. Build exitoso.
19. Axe: 0 violaciones de `alt` en Home, Restaurantes y Detalle.
20. `FeaturedSection`/`DeliveryTrackingSection` con `alt` real tras la
    auditoría de la sección 8.

---

# 19. REGLAS IMPORTANTES

- NO crear un `Image.tsx` genérico paralelo a `ProductImage.tsx` (sección 10).
- NO agregar overlay de texto a las cards de restaurante — esa no es la
  pantalla que lo necesita (sección 2.2).
- NO tocar `sw.ts` — el cache de imágenes ya existe y funciona.
- NO asumir que Supabase soporta transformaciones sin probarlo primero
  (sección 7).
- NO aplicar el filtro cromático sin comparar con fotos reales primero
  (sección 6).
- NO cambiar la paleta de marca ni la tipografía (fuera de alcance de este
  LOOP).
- NO tocar `constants/icons.tsx` (estados de pedido, deuda de
  `LOOP_ICONOS_02`).
- NO instalar dependencias de imágenes o procesamiento.
- Archivos ≤ 300 líneas.

---

# 20. REPORTE FINAL

Entregar en `docs/loops/LOOP_VISUAL_02_REPORTE.md`:

IMPLEMENTADO — resumen técnico.

ARCHIVOS MODIFICADOS / CREADOS / ELIMINADOS — lista exacta.

YA ESTABA RESUELTO (de la sección 2.1) — confirmación de que sigue así.

ASPECT RATIOS — mapa final por contexto, qué cambió y qué no.

OVERLAY — `ImageOverlay.tsx`: variantes y dónde se usa (solo el Hero).

SKELETON Y FADE-IN — implementación dentro de `ProductImage`.

FILTRO CROMÁTICO — se aplicó o se descartó, y por qué (sección 6).

TRANSFORMACIONES DE SUPABASE — soportadas o no en el plan del proyecto;
si no, qué queda documentado como deuda.

AVATAR — implementación + tamaños.

CÓDIGO MUERTO ELIMINADO — `RestaurantCard.tsx`, `ProductCard.tsx`,
confirmación de 0 imports antes de borrar.

A11Y — `alt` agregados/corregidos por archivo.

TESTS

```text
Build:     OK / FAIL
Lint:      OK (tsc) / FAIL
Typecheck: OK / FAIL
Tests:     OK / FAIL  (antes N / después M)
```

QA — cuáles de los 20 casos se validaron y cuáles quedan para Jorge.

DEUDA TÉCNICA GENERADA.

PREPARACIÓN PARA LOOP_VISUAL_03 — Mascota + ilustraciones.

---

# 21. REGLA FINAL

La fotografía es el 80% de la percepción de calidad en una app de
delivery. Si las fotos se ven crudas, la app se ve amateur. Si se ven
tratadas — con el mismo ratio en el mismo contexto, un placeholder mientras
cargan y un fallback si fallan — se ve premium.

Pero tratar la fotografía no significa envolver todo de nuevo: donde ya
hay una solución que funciona (`ProductImage`, el overlay del Hero, el
cache del Service Worker), este LOOP la extiende, no la reemplaza.

Prioridad:

CONSISTENCIA → RESILIENCIA → PERFORMANCE → A11Y → ESTÉTICA

Si tienes que elegir entre una imagen más grande y una que no cause CLS:
elige la que no cause CLS.

Si tienes que elegir entre construir un sistema nuevo y extender el que ya
funciona: extiende el que ya funciona.
