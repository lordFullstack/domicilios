import { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  /**
   * 'light' (default) = comportamiento original, usado en todas las pantallas actuales.
   * 'dark' = nuevo sistema oscuro/premium, opt-in, para pantallas nuevas o rediseñadas.
   */
  variant?: 'light' | 'dark'
}

export const Card = ({
  hoverable = false,
  variant = 'light',
  className,
  children,
  ...props
}: CardProps) => {
  if (variant === 'dark') {
    return (
      <div
        className={clsx(
          'bg-surface border border-line rounded-xl p-4 transition-colors',
          hoverable && 'hover:bg-surface-hover hover:border-ember-dim cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm p-4',
        hoverable && 'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
