import type { ReactNode } from 'react'

interface DropProps {
  /** Lado en px (cuadrado). */
  size?: number
  /** Clases de fondo/color, ej. "bg-category-pizza-bg text-category-pizza-fg" o "bg-icon-tint". */
  className?: string
  children: ReactNode
}

/**
 * Contenedor "gota": la forma de la marca (esquina en punta arriba a la
 * derecha, como la nariz del cohete). Radio en tailwind: `rounded-drop`.
 * Usos: categorías, ícono activo de la barra inferior, logo en header.
 * Es decorativo: el nombre accesible va en el botón o texto que lo rodea.
 */
export const Drop = ({ size = 48, className = '', children }: DropProps) => (
  <span
    aria-hidden="true"
    className={`inline-flex flex-shrink-0 items-center justify-center rounded-drop ${className}`}
    style={{ width: size, height: size }}
  >
    {children}
  </span>
)
