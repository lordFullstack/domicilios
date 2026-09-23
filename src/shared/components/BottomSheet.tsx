import { ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  /** Nombre accesible cuando el sheet no tiene `title` visible (ej. nombre del producto). */
  ariaLabel?: string
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Bottom Sheet genérico — overlay oscuro + panel que sube desde abajo.
 * Es el ÚNICO sheet de la app (filtros, producto, logout, cambio de
 * restaurante...). No crear otro.
 *
 * Accesibilidad (LOOP_CLIENT_03):
 * - Al abrir, el foco va al panel (el lector anuncia el diálogo).
 * - Tab / Shift+Tab quedan atrapados dentro del panel.
 * - Al cerrar, el foco vuelve al elemento que lo abrió.
 * - El resto de la app queda `inert` mientras está abierto.
 * - Se cierra con la X, Escape o tocando el fondo.
 */
export const BottomSheet = ({ open, onClose, title, ariaLabel, children }: BottomSheetProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // onClose suele ser una función nueva en cada render: se guarda en un ref
  // para que los efectos no se re-ejecuten (y no roben el foco) por eso.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Scroll del body bloqueado + resto de la app inerte mientras está abierto.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const appRoot = document.getElementById('root')
    appRoot?.setAttribute('inert', '')
    return () => {
      document.body.style.overflow = previousOverflow
      appRoot?.removeAttribute('inert')
    }
  }, [open])

  // Foco inicial + retorno al cerrar.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => {
      opener?.focus?.()
    }
  }, [open])

  // Escape cierra; Tab queda atrapado dentro del panel.
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel || 'Detalle'}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-t-3xl shadow-bottom-sheet safe-bottom max-h-[85vh] overflow-y-auto animate-fade-slide-up outline-none"
      >
        <div className="flex justify-center pt-3" aria-hidden="true">
          <div className="w-10 h-1.5 rounded-full bg-gray-200" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="touch-target focus-ring absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-white/90 text-gray-500 active:scale-90 transition-transform"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        {title && (
          <div className="px-5 pt-3 pb-2 pr-14">
            <h2 id={titleId} className="font-display font-bold text-lg text-secondary">
              {title}
            </h2>
          </div>
        )}
        <div className="px-5 pt-3 pb-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}
