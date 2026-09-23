import { Art } from './Art'
import { RocketBase } from './RocketBase'
import { PALETTE, STROKE, type IllustrationArtProps } from './types'

/** Base neutral: cohete listo para despegar. */
export const RocketIdle = ({ className, size }: IllustrationArtProps) => (
  <Art name="idle" className={className} size={size}>
    <ellipse cx="120" cy="212" rx="34" ry="5" fill={PALETTE.soft} />
    <RocketBase y={118} face="smile" flame="small" />
    <path
      d="M184 62l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"
      fill={PALETTE.sunsetEnd}
      stroke={PALETTE.ink}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
  </Art>
)
