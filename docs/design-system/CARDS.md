# Cards — sistema

Introducido en LOOP_VISUAL_10. Fuente: `tailwind.config.ts` (sombras) y `src/styles.css` (`.card-surface`).

## 1. Elevación
| Nivel | Token | Uso |
|---|---|---|
| 1 base | `shadow-card` (+ `.card-surface`) | Cards en reposo |
| 2 hover | `shadow-card-hover` (lo aplica `.card-surface:hover`) | Hover con puntero fino |
| 3 floating | `shadow-floating` | Sheets, modales, `ActiveOrderCard` |
| hairline | `shadow-hairline` | Solo si no se usa `.card-surface` |

Color de todas: `rgba(28,25,23,…)` (paleta cálida).

## 2. `.card-surface`
Una clase, un solo lugar. Da sombra nivel 1, hairline de 0.5px en un `::after` (para que la foto no lo tape), hover lift (`translateY(-2px)` + sombra nivel 2, solo `(hover: hover) and (pointer: fine)`) y press (`scale(0.98)`). Con `prefers-reduced-motion` no hay transform.

- `.card-surface--static`: para cards que ya contienen botones con su propio press (producto, pedido): conserva el hover, sin scale al presionar.
- Combinar siempre con `rounded-*` y `overflow-hidden` según el caso.

## 3. Radio (escala real del proyecto)
`rounded-2xl` = 20px, `rounded-3xl` = 28px (no los 16/24 px de Tailwind por defecto).
- Cards principales (restaurante, promo, pedido): `rounded-3xl`.
- Cards compactas / filas (producto, recomendados): `rounded-2xl`.

## 4. Anatomía por componente
| Componente | Foto | Notas |
|---|---|---|
| `RestaurantGridCard` | `aspect-video` | `<article>`; botón principal + corazón **hermanos** |
| `FeaturedProductStrip` (recomendados) | `aspect-[4/3]`, card `w-40` | fila inferior nombre+precio; `+` hermano absoluto |
| `MenuProductCard` (fila) | 96×96 | metadata 1 línea; `+` 44×44 |
| `OrderCard` | ícono 40×40 | estado = badge con texto; ID y total `tabular-nums` |
| `ActiveOrderCard` | — | `<button>` nativo, fondo oscuro |
| `PromoBanner`, `FeaturedSection` | banner `h-28` / `aspect-[4/3]` | insignia "Oferta" conserva coral |

## 5. Metadata de producto
Primera línea de `description`; si no hay, `category`; si no hay, nada. **Nunca** peso ni tiempo (el modelo no los tiene).

## 6. Reglas
- Card clickeable = `<button>`/`<a>`. **Nunca** un interactivo dentro de otro: el segundo va como hermano, superpuesto.
- Dentro de un `<button>` solo contenido de frase (`span`), no `div`/`p`.
- Precios, totales, IDs y fechas: `tabular-nums`.
- Foco: `.focus-ring` (outline 2px `--brand`, offset 2px).
- Fallback de imagen: `ProductImage fallback="rocket"` (usa `RocketMark`). Sin `CardImage` propio.
- Skeleton: `Skeleton` + `RestaurantCardsSkeleton` con la misma geometría (`aspect-video`, `rounded-3xl`).
