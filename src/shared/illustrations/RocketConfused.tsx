import { Art } from './Art'
import { RocketBase } from './RocketBase'
import { PALETTE, STROKE, type IllustrationArtProps } from './types'

/** 404: cohete inclinado, perdido, con un signo de pregunta. */
export const RocketConfused = ({ className, size }: IllustrationArtProps) => (
  <Art name="confused" className={className} size={size}>
    <RocketBase x={110} y={124} tilt={24} face="confused" flame="small" />
    <path d="M162 58c0-11 20-11 20 0 0 9-10 9-10 19" stroke={PALETTE.ink} strokeWidth={STROKE} strokeLinecap="round" />
    <circle cx="172" cy="90" r="2.4" fill={PALETTE.ink} />
    <path
      d="M60 196c-14-8-10-24 4-22s14 16 2 20"
      stroke={PALETTE.muted}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeDasharray="2 7"
    />
  </Art>
)
