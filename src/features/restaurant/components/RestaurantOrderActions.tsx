import { useState } from 'react'
import { Button } from '@/shared/components/Button'
import { ORDER_STATUS } from '@/config/constants'
import { Order } from '@/shared/types'

const NEXT_ACTION_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Confirmar',
  [ORDER_STATUS.CONFIRMED]: 'Preparar',
  [ORDER_STATUS.PREPARING]: 'Marcar Lista',
  [ORDER_STATUS.READY]: 'Enviar',
}

// El restaurante puede cancelar hasta que el pedido está listo (LOOP_SECURITY_01).
const CANCELABLE: string[] = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY]

interface RestaurantOrderActionsProps {
  order: Order
  /** Esta acción está en curso (spinner y "Actualizando..."). */
  busy: boolean
  /** Hay una acción en curso sobre algún pedido: se bloquea el resto. */
  disabled: boolean
  onAdvance: () => void
  onCancel: () => void
}

/**
 * Una sola acción primaria por pedido + cancelar con confirmación. Un pedido
 * listo con domiciliario asignado espera a que este acepte: no hay acción.
 */
export const RestaurantOrderActions = ({ order, busy, disabled, onAdvance, onCancel }: RestaurantOrderActionsProps) => {
  const [confirming, setConfirming] = useState(false)
  const waitingDriver = order.status === ORDER_STATUS.READY && !!order.delivery_person_id
  const nextLabel = NEXT_ACTION_LABELS[order.status]

  if (confirming) {
    return (
      <div role="alertdialog" aria-label="Confirmar cancelación" className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-secondary">¿Cancelar este pedido? Avisaremos al cliente.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" fullWidth disabled={busy} onClick={() => setConfirming(false)}>
            Volver
          </Button>
          <Button
            variant="danger"
            size="sm"
            fullWidth
            loading={busy}
            disabled={disabled}
            onClick={() => {
              onCancel()
              setConfirming(false)
            }}
          >
            Sí, cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {order.status === ORDER_STATUS.READY && (
        <p className="text-xs text-gray-500">
          {waitingDriver
            ? 'Asignado a un domiciliario — esperando que acepte'
            : 'Lista — falta asignar domiciliario'}
        </p>
      )}
      <div className="flex gap-2">
        {CANCELABLE.includes(order.status) && (
          <Button variant="outline" size="sm" fullWidth disabled={disabled} onClick={() => setConfirming(true)}>
            Cancelar
          </Button>
        )}
        {nextLabel && !waitingDriver && (
          <Button variant="primary" size="sm" fullWidth loading={busy} disabled={disabled} onClick={onAdvance}>
            {busy ? 'Actualizando...' : nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
