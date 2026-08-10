interface RocketMarkProps {
  size?: number
  className?: string
}

// Marca decorativa del cohete de Domicilios Riohacha.
// Silueta simple en SVG (sin dependencias externas) usando la paleta de marca.
export const RocketMark = ({ size = 40, className }: RocketMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 4C30 10 32 18 30 28H18C16 18 18 10 24 4Z" fill="#F4F6FA" />
    <path d="M24 4C27 7 29 11 30 15H18C19 11 21 7 24 4Z" fill="#FF2D2D" />
    <circle cx="24" cy="16.5" r="2.8" fill="#1657E6" />
    <path d="M18 22L10 29L15 29.5L18 27.5Z" fill="#1657E6" />
    <path d="M30 22L38 29L33 29.5L30 27.5Z" fill="#1657E6" />
    <path d="M19.5 28H28.5L27 35H21Z" fill="#F4F6FA" />
    <path d="M21.5 35L19 44L24 39.5L29 44L26.5 35Z" fill="#FF8A00" />
  </svg>
)
