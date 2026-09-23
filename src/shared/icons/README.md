# Iconografía propia — estilo "gota"

Diseño aprobado: lienzo "Iconografía Domicilios Riohacha" (claude.ai).

## Uso rápido

```tsx
import { Icon, Drop, CATEGORY_ICON, CATEGORY_DROP_CLASS } from '@/shared/icons'

<Icon name="home" />                                   // 24 px, línea, oculto al lector
<Icon name="heart" variant="active" className="text-brand-700" />
<Drop size={36} className="bg-icon-tint text-brand-700">
  <Icon name="home" size={22} variant="onDrop" />     // pestaña activa
</Drop>
<Drop size={56} className={CATEGORY_DROP_CLASS[cat]}>
  <Icon name={CATEGORY_ICON[cat]} size={26} />        // categoría
</Drop>
<Drop size={38} className="bg-brand-700 text-white">
  <Icon name="rocket" size={22} variant="onDark" />   // logo en header
</Drop>
```

Leaflet (no renderiza React): `import { iconToSvgString } from '@/shared/icons/svgString'`.

## Íconos (19)

| Grupo | Nombres |
|---|---|
| Marca | `rocket`, `rocketSuccess`, `moto`, `bag` |
| Categorías | `pizza`, `burger`, `sushi`, `dessert`, `drink`, `grill` (Asados · chuzo), `seafood` (Mariscos) |
| Navegación | `home`, `restaurants`, `bag` (carrito), `orders`, `profile` |
| Interfaz | `heart`, `bell`, `pin`, `search` |

## Variantes

| Variante | Cuándo | Resultado |
|---|---|---|
| `line` (default) | Reposo | Todo en `currentColor` |
| `active` | Seleccionado sin gota (favorito marcado) | Relleno atardecer (`--icon-tint`), llamas naranja |
| `onDrop` | Dentro de una `<Drop>` atardecer | Rellenos blancos, llamas naranja |
| `onDark` | Sobre azul o foto oscura (poner `text-white`) | Línea blanca, llama naranja |

## Reglas

- Grilla 24, trazo 1.75, puntas/uniones redondeadas. No escalar el trazo.
- Color por `currentColor` / clases de Tailwind. Nunca hex en el componente.
- Decorativo por defecto (`aria-hidden`). `title` solo si el ícono va solo y comunica.
- `lucide-react` sigue para utilitarios (chevron, X, +, −, check) con `strokeWidth={1.75}`.
- Nuevos íconos: se diseñan en el lienzo, se aprueban, y se agregan a `glyphs.tsx`.
