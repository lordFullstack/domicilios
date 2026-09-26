import { Card } from '@/shared/components/Card'
import { DeadlineCountdown } from '@/shared/components/DeadlineCountdown'
import { OrderItemsList } from '@/shared/components/OrderItemsList'
import { OrderPaymentInfo } from '@/shared/components/OrderPaymentInfo'
import { formatCOP } from '@/shared/utils/money'
import { ORDER_STATUS, PAYMENT_METHOD } from '@/config/constants'
import type { Order } from '@/shared/types'
import { RestaurantOrderActions } from './RestaurantOrderActions'

const STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmada',
  [ORDER_STATUS.PREPARING]: 'Preparando',
  [ORDER_STATUS.READY]: 'Lista',
  [ORDER_STATUS.IN_DELIVERY]: 'En camino',
  [ORDER_STATUS.DELIVERED]: 'Entregada',
  [ORDER_STATUS.CANCELLED]: 'Cancelada',
}

// Un color por estado (fondo suave + texto oscuro/fuerte: contraste AA sobre blanco).
const STATUS_CHIP: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'bg-warning/10 text-warning-strong',
  [ORDER_STATUS.CONFIRMED]: 'bg-primary/10 text-primary',
  [ORDER_STATUS.PREPARING]: 'bg-primary/10 text-primary',
  [ORDER_STATUS.READY]: 'bg-success/10 text-success-strong',
  [ORDER_STATUS.IN_DELIVERY]: 'bg-primary/10 text-primary',
}

interface RestaurantOrderCardProps {
  order: Order
  busy: boolean
  disabled: boolean
  onAdvance: () => void
  onCancel: () => void
}

/**
 * Tarjeta de un pedido activo en el panel del restaurante. Lo urgente primero: el pedido pendiente lleva un
 * anillo de color y su cuenta regresiva en grande; el resto se lee de arriba abajo (qué, para dónde, cuánto, acción).
 */
export const RestaurantOrderCard = ({ order, busy, disabled, onAdvance, onCancel }: RestaurantOrderCardProps) => {
  const pending = order.status === ORDER_STATUS.PENDING
  const total = formatCOP(order.total)
  return (
    <Card className={pending ? 'ring-2 ring-primary' : undefined}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-display font-bold text-base text-secondary tabular-nums">
          #{order.id.substring(0, 8).toUpperCase()}
        </span>
        <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${STATUS_CHIP[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {pending && order.confirm_deadline && (
        <DeadlineCountdown deadline={order.confirm_deadline} prefix="Responde en" className="mb-1 text-lg" />
      )}

      <p className="text-sm text-gray-600 mb-1">{order.delivery_address}</p>
      {order.special_instructions && (
        <p className="text-xs text-gray-500 italic mb-1">"{order.special_instructions}"</p>
      )}

      <div className="my-2">
        <OrderPaymentInfo order={order} audience="restaurant" />
      </div>

      <div className="bg-gray-50 rounded-xl p-2.5 my-2">
        <OrderItemsList orderId={order.id} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xl font-display font-bold text-secondary tabular-nums">{total}</p>
        <span className="text-xs text-gray-500">
          {order.payment_method === PAYMENT_METHOD.CASH_ON_DELIVERY ? '💵 Contra entrega' : '💳 Pagado en línea'}
        </span>
      </div>

      <RestaurantOrderActions order={order} busy={busy} disabled={disabled} onAdvance={onAdvance} onCancel={onCancel} />
    </Card>
  )
}
