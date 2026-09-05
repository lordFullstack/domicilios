import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
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
  const baseStyles = 'font-display font-semibold rounded-full transition-all duration-150 flex items-center justify-center gap-2 focus-ring'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:scale-[0.97] disabled:bg-gray-300',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 active:scale-[0.97] disabled:bg-gray-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5 active:scale-[0.97] disabled:border-gray-300 disabled:text-gray-500',
    ghost: 'text-primary hover:bg-primary/5 active:scale-[0.97] disabled:text-gray-500',
  }

  // min-h-[48px] en md/lg para respetar el área táctil mínima (~48px);
  // sm se reserva para contextos compactos (chips, acciones secundarias).
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2 text-base min-h-[48px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
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
