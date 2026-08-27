import { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Elevación visual. 'floating' para elementos que flotan sobre contenido (ej. tarjeta de promo). */
  elevation?: 'card' | 'floating'
}

/**
 * Tarjeta translúcida con blur — usar con moderación (banners destacados,
 * sheets flotantes, overlays sobre imágenes). No reemplaza a `Card`, que
 * sigue siendo el estándar para listados y contenido normal.
 */
export const GlassCard = ({
  elevation = 'card',
  className,
  children,
  ...props
}: GlassCardProps) => {
  return (
    <div
      className={clsx(
        'glass rounded-2xl p-4',
        elevation === 'floating' ? 'shadow-floating' : 'shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
