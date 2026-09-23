import { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger' | 'solid' | 'tertiary' | 'dangerOutline'
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
    danger: 'bg-danger text-white !font-bold hover:bg-red-600 active:scale-[0.97] disabled:bg-gray-300',
    // Criterio de CTA (docs/design-system/COLORS.md): 1 principal por pantalla
    // en gradient; varios del mismo peso en solid; terciario en tertiary;
    // destructivo en dangerOutline o danger.
    solid: 'bg-brand-700 text-white hover:bg-brand-500 active:scale-[0.97] disabled:bg-gray-300',
    tertiary: 'bg-white border-2 border-brand-700 text-brand-700 hover:bg-brand-50 active:scale-[0.97] disabled:border-gray-300 disabled:text-gray-500',
    dangerOutline: 'bg-white border-2 border-danger text-danger hover:bg-danger/10 active:scale-[0.97] disabled:border-gray-300 disabled:text-gray-500',
    // Reservado para CTAs realmente destacados (promo hero, checkout final).
    // No usar como reemplazo general de "primary" — ver LOOP_01.
    gradient: 'bg-brand-gradient text-white hover:opacity-90 active:scale-[0.97] disabled:bg-none disabled:bg-gray-300',
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
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
