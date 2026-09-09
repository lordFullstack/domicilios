import { InputHTMLAttributes, useId } from 'react'
import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: LucideIcon
  error?: string
}

/**
 * Input con icono, exclusivo de la pantalla de Login.
 * No reemplaza ni modifica el <Input /> compartido (src/shared/components/Input.tsx),
 * que sigue usándose sin cambios en el resto de la app.
 */
export const LoginInput = ({
  label,
  icon: Icon,
  error,
  id,
  className,
  ...props
}: LoginInputProps) => {
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
