import { useEffect, useRef } from 'react'
import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/shared/components/Button'
import { ERROR_COPY } from '@/shared/constants/stateCopy'
import { ROUTES } from '@/config/constants'
import type { CheckoutFailure } from '../utils/checkoutError'

const COPY = {
  session: ERROR_COPY.checkoutSession,
  network: ERROR_COPY.checkoutNetwork,
  validation: ERROR_COPY.checkoutValidation,
  closed: ERROR_COPY.checkoutClosed,
  cart: ERROR_COPY.checkoutCart,
} as const

interface CheckoutErrorProps {
  kind: CheckoutFailure
  /** Reintenta el envío con la MISMA llave de idempotencia (no duplica el pedido). */
  onRetry: () => void
  /** Vuelve al formulario sin perder lo escrito. */
  onReview: () => void
  onNavigate: (path: string) => void
}

/**
 * Fallo del servidor durante el envío: causa + salida (LOOP_CLIENT_05C, D5).
 * Siempre dice que el carrito sigue guardado. El foco pasa a la vista al aparecer.
 */
export const CheckoutError = ({ kind, onRetry, onReview, onNavigate }: CheckoutErrorProps) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])

  const copy = COPY[kind]
  const common = { illustration: copy.illustration, title: copy.title, description: copy.description }

  const action = (onClick: () => void) => (
    <Button variant="gradient" onClick={onClick}>
      {copy.cta}
    </Button>
  )

  return (
    <div ref={ref} tabIndex={-1} className="min-h-screen bg-white max-w-md mx-auto outline-none flex items-center justify-center">
      {kind === 'network' ? (
        <ErrorState {...common} onRetry={onRetry} retryLabel={copy.cta} />
      ) : (
        <ErrorState
          {...common}
          action={
            kind === 'session'
              ? action(() => onNavigate(ROUTES.LOGIN))
              : kind === 'validation'
                ? action(onReview)
                : kind === 'closed'
                  ? action(() => onNavigate(ROUTES.CLIENT_RESTAURANTS))
                  : action(() => onNavigate(ROUTES.CLIENT_CART))
          }
        />
      )}
    </div>
  )
}
