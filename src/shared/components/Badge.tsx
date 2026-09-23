import { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'promo'
}

const variants = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-success/10 text-success-strong',
  warning: 'bg-warning/10 text-warning-strong',
  danger: 'bg-danger/10 text-danger',
  // Acento de marca — badges de promo/destacado ("Más pedido", "Nuevo").
  promo: 'bg-brand-50 text-brand-700',
}

/**
 * Etiqueta pequeña para estado de pedido, promociones, categorías o
 * disponibilidad (ej. "Abierto" / "Cerrado", "Nuevo", "En camino").
 */
export const Badge = ({ variant = 'default', className, children, ...props }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
