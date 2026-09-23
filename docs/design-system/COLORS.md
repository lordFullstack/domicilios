# Color — sistema de tokens

Fuente única: `tailwind.config.ts` (+ variables `--brand*` en `src/styles.css`).
Este documento lo introdujo LOOP_VISUAL_04. Los aliases legacy (`primary`,
`primary-dark`, `secondary`, `ink-muted`) siguen vigentes y se migran en
LOOP_VISUAL_04B; **no usarlos en código nuevo**.

## 1. Tokens y uso

| Token | Valor | Úsalo para | NO lo uses para |
|---|---|---|---|
| `brand-700` | #1C2459 | Texto de marca, foco, links, botones sólidos, total destacado, botones "+" | Fondos grandes de pantalla |
| `brand-500` | #2E3A8C | Hover de `brand-700`, estados activos | Texto pequeño sobre `brand-50` cuando hay alternativa `brand-700` |
| `brand-50` / `brand-100` | #EEF0FA / #DCE0F4 | Fondos sutiles, chips inactivos, badge `promo` | Texto |
| `brand-gradient` | #1C2459 → #F4652C → #FFC24B | CTA principal de la pantalla, hero | Más de un elemento por pantalla; texto |
| `ink` | #1C1917 | Texto principal, precios (`font-semibold`) | — |
| `ink-muted` = `gray-500` | #78716C | Texto secundario | Texto < 12px |
| `gray-50…900` | rampa stone | Bordes, fondos neutros, texto de apoyo | Estados semánticos |
| `surface` (+ `soft`, `muted`, `border`) | #FFF / #FAFAF9 / #F5F5F4 / #E7E5E4 | Fondos y bordes | — |
| `success` | #10B981 | Fondo, ícono, `bg-success/10` | Texto (usar `success-strong`) |
| `success-strong` | #047857 | Texto de éxito | Fondos |
| `warning` | #F59E0B | Fondo, ícono, `bg-warning/10` | Texto (usar `warning-strong`) |
| `warning-strong` | #92400E | Texto de alerta | Fondos |
| `danger` | #EF4444 | Errores, cancelado, destructivo, no leído | Texto pequeño sin ícono (ver §3) |
| `info` | #0EA5E9 | **Deprecated**: sin usos (Badge `info` eliminado). Usar `Badge` default (neutro) | Todo: 2.77:1 como texto no pasa AA |
| `accent` | #F59E0B | Igual valor que `warning`; con mesura | Decoración |
| `coral` | #FF5A6B | **Solo** la insignia "Oferta" (`FeaturedSection`) | Todo lo demás (§4) |

Estados suaves: **no existen tokens `-soft`**. Se usan opacidades:
`bg-success/10 text-success-strong`, `bg-warning/10 text-warning-strong`,
`bg-danger/10 text-danger`. (`info` deprecado.)

## 2. Contraste (WCAG 2.x, medido)

| Par (texto / fondo) | Ratio | Veredicto |
|---|---|---|
| ink / blanco | 17.49 | AAA |
| brand-700 / blanco | 14.52 | AAA |
| blanco / brand-700 | 14.52 | AAA |
| brand-500 / blanco | 10.00 | AAA |
| brand-700 / brand-50 | 12.78 | AAA |
| gray-500 / blanco | 4.80 | AA |
| success-strong / blanco | 5.48 | AA |
| success-strong / `success/10` | 4.99 | AA |
| warning-strong / blanco | 7.09 | AAA |
| warning-strong / `warning/10` | 6.56 | AAA |
| blanco / danger | 3.76 | Solo texto grande/bold (AA large ≥ 3:1) |
| danger / blanco | 3.76 | Solo texto grande/bold |
| danger / `danger/10` | 3.29 | Solo texto grande/bold |
| blanco / coral | 3.03 | Solo texto grande/bold (la insignia "Oferta" es `text-[10px]` bold: excepción conocida) |
| info / blanco | 2.77 | No pasa AA |
| info / `info/10` | 2.51 | No pasa AA |
| success / blanco | 2.54 | No pasa (por eso existe `-strong`) |
| warning / blanco | 2.15 | No pasa (por eso existe `-strong`) |

Mínimo: 4.5:1 texto normal; 3:1 texto grande (≥ 18px, o bold ≥ 14px) y
componentes de UI.

## 3. Reglas de `danger`

No existe `danger-strong` (decisión de diseño).

**Permitido**
- Fondo `danger` + texto blanco **en `font-bold`** (botones destructivos; blanco/danger = 3.76:1 solo pasa como texto bold)
- Íconos `danger` (acompañan texto en `ink`)
- Badges y puntos (con contexto visual)
- Bordes y rings de error en inputs
- Texto grande (≥ 18px) o bold ≥ 14px

**Prohibido**
- Texto pequeño (< 14px) en `danger` sin ícono acompañante

Mensajes de error de formulario: mínimo `text-sm` (14px).

## 4. Regla del coral

`coral` sobrevive únicamente en la insignia "Oferta" de `FeaturedSection`.
Precios y totales van en `ink` semibold; el total destacado (carrito,
checkout) en `brand-700` bold; los botones "+" en `bg-brand-700`; los no
leídos de notificaciones en `danger` / `danger/10`.

## 5. Regla de CTA

- **1 CTA principal por pantalla** → `Button variant="gradient"` (`brand-gradient`).
- **Varios CTAs del mismo peso** (y confirmaciones dentro de sheets/diálogos) → `variant="solid"` (`brand-700`).
- **Terciario** → `variant="tertiary"` (surface + borde `brand-700`).
- **Destructivo** → `variant="dangerOutline"` (surface + borde `danger`) o `variant="danger"` (`bg-danger`).

Aplicado en el módulo cliente. Admin, restaurante, domiciliario y auth
conservan las variantes previas hasta LOOP_VISUAL_04B.

## 6. Manifest

`theme_color` de la PWA = `#1C2459` (`vite.config.ts`).
