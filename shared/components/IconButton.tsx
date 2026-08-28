import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string // obligatorio: un IconButton sin texto necesita aria-label sí o sí
  variant?: 'default' | 'ghost' | 'glass'
  size?: 'sm' | 'md'
}

const variants = {
  default: 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-50 active:bg-gray-100',
  glass: 'glass text-secondary hover:bg-white/90',
}

const sizes = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12', // 48px — cumple el touch target mínimo
}

export const IconButton = ({
  variant = 'default',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={clsx(
        'touch-target focus-ring rounded-full flex items-center justify-center flex-shrink-0',
        'transition-all duration-150 active:scale-[0.94]',
        variants[variant],
        sizes[size],
        disabled && 'opacity-40 cursor-not-allowed active:scale-100',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
