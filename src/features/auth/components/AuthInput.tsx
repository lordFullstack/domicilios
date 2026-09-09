import { InputHTMLAttributes, useId } from 'react'
import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: LucideIcon
  error?: string
}

/**
 * Input con icono para el Registro.
 * Mismo sistema visual que el Login (LOOP 01.1), pero como archivo
 * independiente: este LOOP tiene prohibido modificar Login, así que no
 * se reutiliza LoginInput.tsx directamente ni se toca LoginPage.tsx.
 * No reemplaza ni modifica el <Input /> compartido (src/shared/components/Input.tsx).
 *
 * PENDIENTE — LOOP FUTURO: consolidar AuthInput/LoginInput en un único
 * componente compartido (requeriría tocar Login, fuera de alcance aquí).
 */
export const AuthInput = ({
  label,
  icon: Icon,
  error,
  id,
  className,
  ...props
}: AuthInputProps) => {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
        />
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={clsx(
            'w-full pl-11 pr-4 py-3 border rounded-2xl text-sm bg-surface/60',
            'transition-colors duration-150',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white',
            error ? 'border-danger' : 'border-gray-200',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-danger text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
