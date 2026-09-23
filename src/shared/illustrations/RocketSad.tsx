import { Art } from './Art'
import { RocketBase } from './RocketBase'
import { PALETTE, STROKE, type IllustrationArtProps } from './types'

/** Error: cohete inclinado, sin llama, con humo. */
export const RocketSad = ({ className, size }: IllustrationArtProps) => (
  <Art name="sad" className={className} size={size}>
    <ellipse cx="120" cy="214" rx="60" ry="5" fill={PALETTE.soft} />
    <RocketBase y={122} tilt={-16} face="sad" flame="none" />
    <circle cx="176" cy="60" r="9" stroke={PALETTE.muted} strokeWidth={STROKE} />
    <circle cx="192" cy="44" r="6" stroke={PALETTE.muted} strokeWidth={STROKE} />
    <circle cx="204" cy="32" r="4" stroke={PALETTE.muted} strokeWidth={STROKE} />
  </Art>
)
