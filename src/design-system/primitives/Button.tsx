import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

// ============================================================
// Tipos
// ============================================================
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

// ============================================================
// Estilos por variante
// ============================================================
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-[0_4px_12px_rgba(46,58,140,0.25)] hover:bg-primary-dark hover:shadow-[0_6px_20px_rgba(46,58,140,0.35)]',
  secondary:
    'bg-white text-ink ring-1 ring-black/[0.08] hover:bg-surface-soft hover:ring-black/[0.12] dark:bg-white/[0.06] dark:text-white dark:ring-white/[0.08] dark:hover:bg-white/[0.1]',
  ghost:
    'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink dark:hover:bg-white/[0.06] dark:hover:text-white',
  danger:
    'bg-danger text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:bg-red-600',
  gradient:
    'bg-brand-gradient text-white shadow-[0_8px_24px_rgba(244,101,44,0.35)] hover:opacity-95',
}

// ============================================================
// Estilos por tamaño
// ============================================================
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
}

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

// ============================================================
// Componente
// ============================================================
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          // Base
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-150 ease-out',
          'active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          // Variante
          variantStyles[variant],
          // Tamaño
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Custom
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className={clsx(iconSizeStyles[size], 'animate-spin')} />
        ) : (
          leftIcon && <span className={iconSizeStyles[size]}>{leftIcon}</span>
        )}

        {children}

        {!loading && rightIcon && (
          <span className={iconSizeStyles[size]}>{rightIcon}</span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'