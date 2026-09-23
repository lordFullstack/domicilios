export type IllustrationName = 'idle' | 'success' | 'emptyCart' | 'noResults' | 'confused' | 'sad'

/** sm 120 · md 180 (empty states) · lg 240 (éxito). El viewBox es siempre 240. */
export type IllustrationSize = 'sm' | 'md' | 'lg'

export const ILLUSTRATION_SIZES: Record<IllustrationSize, number> = { sm: 120, md: 180, lg: 240 }

export interface IllustrationArtProps {
  className?: string
  /** Lado en px (el viewBox no cambia: escala sin deformarse). */
  size?: number
}

/**
 * Paleta cerrada de las ilustraciones (mismos valores que tailwind.config.ts):
 * brand-700 = contorno, atardecer = relleno del cohete, gray-400 y brand-100
 * = elementos secundarios. Ningún color fuera de esta lista.
 */
export const PALETTE = {
  ink: '#1C2459',
  sunsetStart: '#1C2459',
  sunsetMid: '#F4652C',
  sunsetEnd: '#FFC24B',
  soft: '#DCE0F4',
  muted: '#A8A29E',
  white: '#FFFFFF',
} as const

/** Grosor de línea de todos los elementos secundarios. */
export const STROKE = 1.75
