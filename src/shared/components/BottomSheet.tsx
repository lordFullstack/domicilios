import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Bottom Sheet genérico — overlay oscuro + panel que sube desde abajo.
 * Reutilizable para cualquier caso futuro (hoy: filtros de Explorar).
 * No reemplaza a RatingModal (que tiene su propio layout de formulario),
 * pero es la base que debería usar cualquier sheet nuevo de aquí en más.
 */
export const BottomSheet = ({ open, onClose, title, children }: BottomSheetProps) => {
  // Bloquea el scroll del body mientras el sheet está abierto, y lo
  // restaura al cerrar (o si el componente se desmonta abierto).
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Escape cierra el sheet (útil en desktop, donde también se puede probar la app).
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md bg-white rounded-t-3xl shadow-bottom-sheet safe-bottom max-h-[85vh] overflow-y-auto animate-fade-slide-up"
      >
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1.5 rounded-full bg-gray-200" />
        </div>
        <div className="px-5 pt-3 pb-2">
          <h2 className="font-display font-bold text-lg text-secondary">{title}</h2>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}
