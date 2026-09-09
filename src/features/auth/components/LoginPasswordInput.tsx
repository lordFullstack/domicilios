import { InputHTMLAttributes, useId, useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

interface LoginPasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
}

/**
 * Input de contraseña exclusivo del Login, con mostrar/ocultar.
 * El toggle es únicamente estado visual local (useState) — no toca
 * la lógica de autenticación ni las validaciones existentes.
 */
export const LoginPasswordInput = ({
  label,
  error,
  id,
  className,
  ...props
}: LoginPasswordInputProps) => {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          strokeWidth={2}
        />
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={clsx(
            'w-full pl-11 pr-11 py-3 border rounded-2xl text-sm bg-surface/60',
            'transition-colors duration-150',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white',
            error ? 'border-danger' : 'border-gray-200',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="touch-target absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors focus-ring rounded-xl"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-danger text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
