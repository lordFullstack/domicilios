import type { CSSProperties } from 'react'
import { GLYPHS, type IconName, type GlyphPartKind } from './glyphs'

export const ICON_SIZES = { xs: 16, sm: 20, md: 24, lg: 32, xl: 48 } as const
export type IconSize = keyof typeof ICON_SIZES

/**
 * line    → reposo: todo en el color del texto (currentColor)
 * active  → seleccionado: relleno atardecer, llamas en naranja
 * onDrop  → dentro de una <Drop> atardecer: rellenos en blanco
 * onDark  → sobre azul/foto oscura: trazo del texto (poner text-white), llama naranja
 */
export type IconVariant = 'line' | 'active' | 'onDrop' | 'onDark'

// Los colores salen de styles.css (--icon-tint / --icon-accent), no de
// hex en el componente. Las variables se resuelven con `style`, porque los
// atributos de presentación SVG (fill="…") no entienden var().
const VARIANT_VARS: Record<IconVariant, Record<string, string>> = {
  line: { '--i-fill': 'none', '--i-bg': 'none', '--i-accent': 'currentColor' },
  active: { '--i-fill': 'var(--icon-tint)', '--i-bg': '#FFFFFF', '--i-accent': 'var(--icon-accent)' },
  onDrop: { '--i-fill': '#FFFFFF', '--i-bg': '#FFFFFF', '--i-accent': 'var(--icon-accent)' },
  onDark: { '--i-fill': 'none', '--i-bg': 'none', '--i-accent': 'var(--icon-accent)' },
}

const PART_STYLE: Record<GlyphPartKind, CSSProperties> = {
  fill: { fill: 'var(--i-fill)' },
  line: { fill: 'none' },
  bg: { fill: 'var(--i-bg)' },
  dot: { fill: 'currentColor', stroke: 'none' },
  accent: { fill: 'none', stroke: 'var(--i-accent)' },
}

export interface IconProps {
  name: IconName
  size?: IconSize | number
  variant?: IconVariant
  className?: string
  /**
   * Solo si el ícono va SOLO y comunica algo (sin texto al lado). Si hay
   * texto visible o el botón ya tiene aria-label, déjalo vacío: el ícono
   * queda aria-hidden, que es lo correcto el 95% de las veces.
   */
  title?: string
}

/**
 * Ícono propio de Domicilios (estilo gota). Usar para marca, categorías,
 * navegación, favorito, notificaciones, ubicación y búsqueda. Para íconos
 * utilitarios (chevrons, X, +/−) se sigue usando lucide-react con
 * strokeWidth={1.75}.
 */
export const Icon = ({ name, size = 'md', variant = 'line', className, title }: IconProps) => {
  const px = typeof size === 'number' ? size : ICON_SIZES[size]
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={VARIANT_VARS[variant] as CSSProperties}
      data-icon={name}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true, focusable: false })}
    >
      {GLYPHS[name].map(([kind, el], i) => (
        <g key={i} style={PART_STYLE[kind]}>
          {el}
        </g>
      ))}
    </svg>
  )
}
