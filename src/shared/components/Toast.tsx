import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface ToastProps {
  message: string | null
  /** 'error' cambia el ícono (antes todo mostraba un check, incluso los fallos). */
  variant?: 'success' | 'error'
}

/**
 * Toast mínimo, sin dependencias nuevas. El componente que lo usa controla
 * cuándo aparece y desaparece (setTimeout + setState) — esto solo lo pinta.
 */
export const Toast = ({ message, variant = 'success' }: ToastProps) => {
  if (!message) return null

  // Portal a <body>: si quien lo usa está dentro de un contenedor con
  // transform/overflow (ej. una card con active:scale), un `fixed` normal
  // quedaría recortado o posicionado relativo a esa card.
  return createPortal(
    <div
      role="status"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in max-w-[90vw]"
    >
      <div className="flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-floating">
        {variant === 'error' ? (
          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" aria-hidden="true" />
        )}
        <span className="truncate">{message}</span>
      </div>
    </div>,
    document.body
  )
}
