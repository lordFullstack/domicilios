import { Art } from './Art'
import { RocketBase } from './RocketBase'
import { PALETTE, STROKE, type IllustrationArtProps } from './types'

/** Sin resultados: el cohete busca con una lupa. */
export const RocketNoResults = ({ className, size }: IllustrationArtProps) => (
  <Art name="noResults" className={className} size={size}>
    <ellipse cx="120" cy="214" rx="70" ry="5" fill={PALETTE.soft} />
    <RocketBase x={90} y={114} tilt={-10} face="confused" flame="small" />
    <circle cx="170" cy="138" r="26" fill={PALETTE.soft} stroke={PALETTE.ink} strokeWidth={STROKE} />
    <path d="M189 158l22 22" stroke={PALETTE.ink} strokeWidth={STROKE * 2.4} strokeLinecap="round" />
    <path d="M158 132a14 14 0 0 1 12-10" stroke={PALETTE.white} strokeWidth={STROKE} strokeLinecap="round" />
  </Art>
)
