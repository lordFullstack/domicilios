interface ImageOverlayProps {
  variant: 'bottom-gradient' | 'full-soft' | 'full-strong'
  className?: string
}

const VARIANTS: Record<ImageOverlayProps['variant'], string> = {
  // Mismo valor que ya usaba RestaurantHero — la densidad la ajustó
  // CLIENT_03 para que portadas con texto propio (letreros, teléfonos) no
  // se mezclen con el nombre del restaurante.
  'bottom-gradient': 'bg-gradient-to-t from-black/90 via-black/60 via-45% to-black/10',
  'full-soft': 'bg-black/15',
  'full-strong': 'bg-black/45',
}

/**
 * Overlay de legibilidad sobre una foto. Solo para contextos donde hay
 * texto ENCIMA de la imagen (el Hero del restaurante); las cards de
 * restaurante/producto no lo necesitan porque su texto vive debajo, en un
 * panel aparte.
 */
export const ImageOverlay = ({ variant, className }: ImageOverlayProps) => (
  <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${VARIANTS[variant]} ${className || ''}`} />
)
