import { Art } from './Art'
import { RocketBase } from './RocketBase'
import { PALETTE, STROKE, type IllustrationArtProps } from './types'

/** Carrito vacío: el cohete junto a una bolsa sin nada adentro. */
export const RocketEmptyCart = ({ className, size }: IllustrationArtProps) => (
  <Art name="emptyCart" className={className} size={size}>
    <ellipse cx="120" cy="214" rx="70" ry="5" fill={PALETTE.soft} />
    <RocketBase x={92} y={112} tilt={-8} face="smile" flame="small" />
    <path
      d="M150 128h52l-4 66a6 6 0 0 1-6 5.6h-32a6 6 0 0 1-6-5.6l-4-66Z"
      fill={PALETTE.soft}
      stroke={PALETTE.ink}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <path d="M162 128v-8a14 14 0 0 1 28 0v8" stroke={PALETTE.ink} strokeWidth={STROKE} strokeLinecap="round" />
    <path d="M166 152a10 10 0 0 0 20 0" stroke={PALETTE.muted} strokeWidth={STROKE} strokeLinecap="round" />
  </Art>
)
