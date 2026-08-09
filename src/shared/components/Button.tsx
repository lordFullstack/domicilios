import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'accent-outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 disabled:bg-gray-400',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 disabled:bg-gray-400',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10 disabled:border-gray-400',
    ghost: 'text-primary hover:bg-primary/10 disabled:text-gray-400',
    // Sistema oscuro/premium (nuevo, opt-in) — pensado para usarse sobre bg-ink / Card variant="dark"
    accent: 'bg-ember text-ink font-semibold shadow-glow-sm hover:shadow-glow hover:bg-ember/90 disabled:bg-line disabled:shadow-none disabled:text-text-low',
    'accent-outline': 'border border-line text-text-hi hover:border-ember hover:text-ember disabled:border-line disabled:text-text-low',
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  )
}
