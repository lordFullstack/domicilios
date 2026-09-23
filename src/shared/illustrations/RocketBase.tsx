import { useId } from 'react'
import { PALETTE, STROKE } from './types'

export type RocketFace = 'smile' | 'joy' | 'sad' | 'confused'

interface RocketBaseProps {
  /** Centro del cohete en el lienzo de 240. */
  x?: number
  y?: number
  /** Rotación en grados (personalidad: inclinado = curioso / perdido). */
  tilt?: number
  face?: RocketFace
  flame?: 'none' | 'small' | 'big'
}

// Silueta del cohete = la del pack de íconos (glyphs.tsx, grilla de 24),
// escalada para ocupar ~60% del lienzo de 240. Relleno de atardecer; el trazo
// se divide por la escala para quedar en 1.75 reales.
const S = 6.8
const SW = STROKE / S

const FACES: Record<RocketFace, string> = {
  smile: 'M10.7 13.5q1.3 1 2.6 0',
  joy: 'M10.3 13q1.7 2.2 3.4 0',
  sad: 'M10.7 14.4q1.3-1 2.6 0',
  confused: 'M10.4 13.9q.8-.9 1.6 0t1.6 0',
}

export const RocketBase = ({ x = 120, y = 122, tilt = 0, face = 'smile', flame = 'small' }: RocketBaseProps) => {
  // id único por instancia: varias ilustraciones en la misma pantalla no
  // deben compartir el mismo <linearGradient>.
  const gid = useId().replace(/:/g, '')
  const flamePath =
    flame === 'big'
      ? 'M9.4 16.25c0 3 1 5.1 2.6 6.4 1.6-1.3 2.6-3.4 2.6-6.4Z'
      : 'M10 16.25c0 2.3.7 3.9 2 5 1.3-1.1 2-2.7 2-5Z'

  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${S}) translate(-12 -12.6)`}>
      <defs>
        <linearGradient id={`${gid}-sunset`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={PALETTE.sunsetStart} />
          <stop offset="0.62" stopColor={PALETTE.sunsetMid} />
          <stop offset="1" stopColor={PALETTE.sunsetEnd} />
        </linearGradient>
      </defs>
      {flame !== 'none' && (
        <path d={flamePath} fill={PALETTE.sunsetEnd} stroke={PALETTE.ink} strokeWidth={SW} strokeLinejoin="round" />
      )}
      <path
        d="M7.5 12.5 5 15.5v2.75h2.5M16.5 12.5 19 15.5v2.75h-2.5"
        fill={PALETTE.sunsetMid}
        stroke={PALETTE.ink}
        strokeWidth={SW}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M12 2.75c2.9 1.9 4.5 5.3 4.5 9.25v4.25h-9V12c0-3.95 1.6-7.35 4.5-9.25Z"
        fill={`url(#${gid}-sunset)`}
        stroke={PALETTE.ink}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="1.75" fill={PALETTE.white} stroke={PALETTE.ink} strokeWidth={SW} />
      <path d={FACES[face]} fill="none" stroke={PALETTE.ink} strokeWidth={SW} strokeLinecap="round" />
    </g>
  )
}
