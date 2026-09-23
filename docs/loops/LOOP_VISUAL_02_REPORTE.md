# LOOP_VISUAL_02 — Reporte final

## Implementado
Skeleton + fade-in en `ProductImage`, overlay reutilizable (`ImageOverlay`) extraído del Hero, transformación de imágenes de Supabase (`supabaseImage.ts`) conectada en las 8 pantallas/componentes que muestran fotos, `Avatar.tsx` reutilizable, y limpieza de 3 archivos de código muerto que llevaban desde CLIENT_01 sin borrarse.

## Ya estaba resuelto (de la sección 2.1 del LOOP)
- `ProductImage.tsx` ya manejaba foto real / emoji-de-contenido / ícono de respaldo con `onError`.
- El Hero ya tenía overlay de legibilidad (solo se extrajo a componente, mismo valor).
- `RestaurantGridCard` ya usaba `aspect-[4/3]` de forma consistente.
- `sw.ts` ya cacheaba Supabase Storage con `CacheFirst` — no se tocó.
- `alt` real ya existía en `RestaurantHero`, `RestaurantGridCard`, `FeaturedSection`, `DeliveryTrackingSection` y `CartItemRow` — la auditoría de la sección 8 no encontró nada que arreglar ahí.

## Archivos modificados
- `shared/components/ProductImage.tsx` (+test): skeleton (`bg-brand-gradient-soft`) + fade-in con `onLoad`, transformación de Supabase con `width` opcional (@2x)
- `shared/components/RestaurantHero.tsx`: usa `ImageOverlay`; hero con `loading="eager"` + `fetchPriority="high"`; logo repetido y hero con transformación
- `shared/components/Avatar.tsx` (nuevo, +test): sm/md/lg/xl, foto o inicial sobre `brand-gradient`, transformación @2x
- `features/client/pages/ClientAccountPage.tsx`: usa `Avatar` (antes bloque inline de inicial)
- `features/client/components/DeliveryTrackingSection.tsx`: usa `Avatar` (antes bloque inline)
- `features/client/components/RestaurantGridCard.tsx`, `FeaturedSection.tsx`, `FeaturedProductStrip.tsx`, `MenuProductCard.tsx`, `ProductDetailSheet.tsx`, `OrderCard.tsx`, `CartPage.tsx`, `CheckoutPage.tsx`: `width` pasado a `ProductImage`/transformación aplicada a `<img>` crudos; `FeaturedSection` migró de alto fijo (`h-24`/`h-28`) a `aspect-[4/3]`

## Archivos creados
- `shared/components/ImageOverlay.tsx` (+test): variantes `bottom-gradient` (valor exacto del Hero), `full-soft`, `full-strong`
- `shared/utils/supabaseImage.ts`: reescribe URLs de `/object/public/` a `/render/image/public/` con `width`/`quality`

## Archivos eliminados (código muerto, 0 imports reales)
- `features/client/pages/HomePage.tsx` — declarado muerto en el reporte de CLIENT_01 pero nunca se había borrado del disco; seguía sin estar en el router
- `features/client/components/RestaurantCard.tsx` — solo lo importaba el `HomePage.tsx` de arriba
- `features/client/components/ProductCard.tsx` — cero imports en todo el repo

## Aspect ratios (mapa final)
| Contexto | Ratio | Cambio |
|---|---|---|
| Hero restaurante | `h-52` fijo | Sin cambio (decisión documentada: cambiar a ratio relativo rompería el cálculo del header sticky) |
| Card restaurante (Home + Restaurantes) | `aspect-[4/3]` | Ya estaba |
| Card de oferta / recomendados (`FeaturedSection`) | `aspect-[4/3]` | **Migrado** de `h-24`/`h-28` fijos |
| Detalle de producto | `aspect-video` | Ya estaba |
| Avatar | Círculo, `sm=32 md=48 lg=72 xl=96` | Nuevo |

## Overlay
Solo el Hero lo usa (`ImageOverlay variant="bottom-gradient"`), con el mismo gradiente que ya estaba aprobado. Las cards de restaurante/producto **no** llevan overlay a propósito: su texto vive en un panel aparte, no sobre la foto — corregí esa asunción del pedido original antes de escribir código.

## Skeleton y fade-in
Dentro de `ProductImage`: mientras `!loaded`, la `<img>` está en `opacity-0` sobre un fondo `bg-brand-gradient-soft`; al disparar `onLoad`, pasa a `opacity-100` con `transition-opacity duration-300`. Con `prefers-reduced-motion`, el bloque global de `styles.css` ya deja `transition-duration` en ~0, así que no hizo falta lógica adicional en JS.

## Filtro cromático
**Decidido que no** (sección 6 del LOOP). El ajuste propuesto (`saturate(1.05) contrast(1.02)`) es prácticamente imperceptible sobre fotos reales de los restaurantes actuales y no justificaba el código/riesgo de "sobre-procesar". Queda descartado, no pendiente.

## Transformaciones de Supabase
**Confirmado que SÍ están soportadas** en el plan del proyecto — verificado en vivo antes de escribir código: una portada real de 2.76 MB pedida con `width=100` devuelve 26.6 KB (~100× más chica). `supabaseImageUrl()` centraliza la reescritura; todo lo que muestra fotos de Storage ahora pide `width` según su contenedor real (48–800px) más `quality=75`, en vez del archivo original sin importar dónde se muestre.

## Avatar
`sm/md/lg/xl` = `32/48/72/96`px. Con `src`: círculo `object-cover` con `ring-1 ring-white/70`, transformación @2x. Sin `src`: inicial sobre `bg-brand-gradient`. `ClientAccountPage` pasó de un cuadrado de 64px hardcodeado a `size="lg"` (72px) — cambio menor de tamaño, documentado aquí por transparencia.

## Tests
```text
Build:     OK
Lint:      OK (tsc)
Typecheck: OK
Tests:     OK — 27 archivos / 177 (antes 25 / 168)
```
Nuevos: `ProductImage.test.tsx` (+3: fade-in, transformación), `ImageOverlay.test.tsx` (3), `Avatar.test.tsx` (4).

## QA
Validados en vivo (servidor local + datos reales de Supabase vía ruta temporal, sin sesión): hero con overlay y transformación (`width=800`), logo repetido (`width=96`), fotos de producto con `width=192` y fade-in ya resuelto al momento del screenshot, avatar con fallback de inicial. Confirmado por inspección del DOM que las URLs de imagen quedaron reescritas a `/render/image/public/...&width=...&quality=75` en las 7 fotos visibles de la pantalla de detalle.
Pendientes de Jorge (dispositivo real / Lighthouse): CLS medido, Lighthouse Performance antes/después, offline real, WebP sirviéndose o no (el endpoint de transformación no expone control de formato desde el cliente — Supabase decide el content-type de salida).

## Deuda técnica generada
- Lighthouse Performance / CLS no medidos formalmente en este LOOP (requiere Jorge con Chrome real, no el navegador embebido).
- El `width` pasado a cada `ProductImage` es una estimación del tamaño real del contenedor, no un valor leído del DOM — si el layout de una card cambia de tamaño en un LOOP futuro, hay que revisar el `width` que le corresponde.
- `RestaurantHero.tsx` sigue con altura fija (`h-52`); si algún día se vuelve responsive, el `width={800}` del hero habría que recalcularlo.

## Preparación para LOOP_VISUAL_03
Mascota + ilustraciones: el fallback de `ProductImage` (`Icon name="restaurants"`) y el error state (cohete en `ErrorBoundary`, LOOP_ICONOS_01) son los puntos naturales donde una ilustración de mascota reemplazaría al ícono plano actual.
