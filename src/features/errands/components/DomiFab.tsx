import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useCartContext } from '@/shared/hooks/useCartContext'
import { Toast } from '@/shared/components/Toast'
import { ROUTES } from '@/config/constants'
import { useDomisAvailable } from '../hooks/useErrands'

/** Cuánto hay que bajar el scroll antes de encoger el botón, para no parpadear con micro-movimientos. */
const SCROLL_THRESHOLD = 12

/**
 * Botón flotante "Pide tu Domi" (solo en el Home del cliente). Píldora cobalto abajo a la derecha,
 * encima del menú inferior y de la barra del carrito. Al bajar el scroll se encoge a círculo; al subir
 * se expande. Sin Domis en turno queda gris y avisa al tocarlo.
 */
export const DomiFab = () => {
  const navigate = useNavigate()
  const { cart } = useCartContext()
  const { available } = useDomisAvailable()
  const [expanded, setExpanded] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const lastY = useRef(0)
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      if (Math.abs(delta) < SCROLL_THRESHOLD) return
      setExpanded(delta < 0 || y < 40)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  const unavailable = available === false
  const hasCart = cart.length > 0

  const handleClick = () => {
    if (unavailable) {
      setNotice('Por ahora no hay Domis en turno. Intenta en unos minutos.')
      clearTimeout(noticeTimer.current)
      noticeTimer.current = setTimeout(() => setNotice(null), 3000)
      return
    }
    navigate(ROUTES.DOMI)
  }

  const label = unavailable ? 'Domis no disponibles' : 'Pide tu Domi'

  return (
    <>
      <Toast message={notice} variant="error" />
      <div
        className={clsx(
          // Alineado a la columna de la app (max-w-md) y no al borde de pantallas anchas.
          'pointer-events-none fixed inset-x-0 z-30 mx-auto flex max-w-md justify-end px-4',
          // Encima del menú inferior; con carrito, encima también de su barra (~3.5 rem más).
          hasCart
            ? 'bottom-[max(10.5rem,calc(9rem+env(safe-area-inset-bottom)))]'
            : 'bottom-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom)))]'
        )}
      >
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          aria-disabled={unavailable}
          className={clsx(
            'focus-ring pointer-events-auto flex h-14 items-center justify-center overflow-hidden rounded-full font-display text-sm font-bold text-white shadow-floating',
            'transition-[width,padding,background-color] duration-200 ease-out motion-reduce:transition-none active:scale-95',
            expanded ? 'gap-2 px-5' : 'w-14',
            unavailable ? 'bg-gray-500' : 'bg-domi hover:bg-domi-dark'
          )}
        >
          <span className="text-xl leading-none" aria-hidden="true">
            🛵
          </span>
          <span
            className={clsx(
              'whitespace-nowrap transition-[max-width,opacity] duration-200 motion-reduce:transition-none',
              expanded ? 'max-w-[11rem] opacity-100' : 'max-w-0 opacity-0'
            )}
          >
            {label}
          </span>
        </button>
      </div>
    </>
  )
}
