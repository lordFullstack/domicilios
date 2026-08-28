import { CheckCircle2 } from 'lucide-react'

interface ToastProps {
  message: string | null
}

/**
 * Toast mínimo, sin dependencias nuevas. El componente que lo usa controla
 * cuándo aparece y desaparece (setTimeout + setState) — esto solo lo pinta.
 */
export const Toast = ({ message }: ToastProps) => {
  if (!message) return null

  return (
    <div
      role="status"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in max-w-[90vw]"
    >
      <div className="flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-floating">
        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
        <span className="truncate">{message}</span>
      </div>
    </div>
  )
}
