import { Art } from './Art'
import { RocketBase } from './RocketBase'
import { PALETTE, STROKE, type IllustrationArtProps } from './types'

// Destello de 4 puntas centrado en (x, y) con radio r.
const sparkle = (x: number, y: number, r: number) => {
  const k = r * 0.35
  return `M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z`
}

/** Pedido confirmado: cohete despegando, con destellos. */
export const RocketSuccess = ({ className, size }: IllustrationArtProps) => (
  <Art name="success" className={className} size={size}>
    <RocketBase y={112} tilt={8} face="joy" flame="big" />
    <path d={sparkle(48, 62, 14)} fill={PALETTE.sunsetEnd} stroke={PALETTE.ink} strokeWidth={STROKE} strokeLinejoin="round" />
    <path d={sparkle(196, 48, 10)} fill={PALETTE.sunsetMid} stroke={PALETTE.ink} strokeWidth={STROKE} strokeLinejoin="round" />
    <path d={sparkle(200, 150, 8)} fill={PALETTE.soft} stroke={PALETTE.ink} strokeWidth={STROKE} strokeLinejoin="round" />
    <circle cx="36" cy="128" r="4" fill={PALETTE.sunsetMid} />
    <circle cx="208" cy="100" r="3.5" fill={PALETTE.sunsetEnd} />
    <circle cx="70" cy="196" r="3" fill={PALETTE.soft} />
    <path d="M96 214h48M108 224h24" stroke={PALETTE.muted} strokeWidth={STROKE} strokeLinecap="round" />
  </Art>
)
