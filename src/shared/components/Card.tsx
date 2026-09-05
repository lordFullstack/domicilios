import { HTMLAttributes, KeyboardEvent } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export const Card = ({ hoverable = false, className, children, onClick, onKeyDown, ...props }: CardProps) => {
  // Si la card es clickeable, debe poder activarse con teclado (Enter/
  // Espacio) y anunciarse como interactiva — si no, un div con onClick es
  // invisible para quien navega con teclado o lector de pantalla.
  const isInteractive = !!onClick

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-card p-4',
        hoverable && 'hover:shadow-card-hover transition-shadow cursor-pointer',
        isInteractive && 'focus-ring',
        className
      )}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}
