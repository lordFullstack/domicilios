import { Banknote, MessageSquareText } from 'lucide-react'
import { PAYMENT_METHOD } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'
import type { Order } from '@/shared/types'

interface OrderPaymentInfoProps {
  order: Pick<Order, 'payment_method' | 'total' | 'cash_amount' | 'notes_to_restaurant'>
  /** El domiciliario necesita el efectivo bien visible: lleva el cambio y cobra al entregar. */
  audience: 'restaurant' | 'delivery' | 'admin' | 'client'
}

/**
 * Muestra con cuánto paga el cliente en efectivo (y el cambio a llevar) y su nota para el
 * restaurante (LOOP_CLIENT_05D). No renderiza nada si el pedido no tiene ninguno de los dos datos.
 */
export const OrderPaymentInfo = ({ order, audience }: OrderPaymentInfoProps) => {
  const isCash = order.payment_method === PAYMENT_METHOD.CASH_ON_DELIVERY
  const cash = order.cash_amount ?? null
  const change = cash !== null ? cash - Number(order.total) : null
  const notes = order.notes_to_restaurant?.trim()
  const emphasize = audience === 'delivery'

  if (!isCash && !notes) return null

  return (
    <div className="flex flex-col gap-2">
      {isCash && (
        <div
          className={
            emphasize
              ? 'flex items-start gap-2 rounded-xl bg-primary/10 p-3'
              : 'flex items-start gap-2 text-sm'
          }
        >
          <Banknote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            {emphasize && (
              <p className="text-xs font-bold text-gray-500 tracking-wide mb-0.5">COBRAR EN EFECTIVO</p>
            )}
            <p className="text-sm font-semibold text-secondary tabular-nums">
              {emphasize ? formatCOP(Number(order.total)) : 'Efectivo o datáfono'}
              {cash !== null && ` · Paga con ${formatCOP(cash)}`}
            </p>
            <p className="text-sm text-gray-600 tabular-nums">
              {cash === null
                ? emphasize
                  ? 'No indicó con cuánto paga: lleva cambio.'
                  : 'No indicó con cuánto paga.'
                : change === 0
                  ? 'Pago exacto: sin cambio.'
                  : `Cambio a devolver: ${formatCOP(change ?? 0)}`}
            </p>
          </div>
        </div>
      )}

      {notes && (
        <div className="flex items-start gap-2 rounded-xl bg-warning/10 p-3">
          <MessageSquareText className="w-4 h-4 text-warning-strong flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-500 tracking-wide mb-0.5">NOTA DEL CLIENTE</p>
            <p className="text-sm text-secondary break-words">{notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
