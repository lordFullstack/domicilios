interface RocketMarkProps {
  size?: number
  /**
   * 'icon'   → cohete recortado con fondo transparente (usar sobre cualquier color, ej. badge de login)
   * 'square' → tile cuadrado con esquinas redondeadas y fondo navy (favicon / ícono de app)
   */
  variant?: 'icon' | 'square'
  className?: string
}

// Usa el asset 3D real de la marca (no un SVG dibujado a mano) para que el
// brillo y las sombras se vean igual que en la guía de marca.
// Coloca los PNG en /public/brand/ (ver rutas abajo) al integrar este componente.
const SOURCES: Record<NonNullable<RocketMarkProps['variant']>, string> = {
  icon: '/brand/rocket-icon-transparent.png',
  square: '/brand/rocket-app-icon.png',
}

export const RocketMark = ({ size = 40, variant = 'icon', className }: RocketMarkProps) => (
  <img
    src={SOURCES[variant]}
    width={size}
    height={size}
    alt=""
    aria-hidden="true"
    className={className}
    style={{ width: size, height: size, objectFit: 'contain' }}
  />
)
