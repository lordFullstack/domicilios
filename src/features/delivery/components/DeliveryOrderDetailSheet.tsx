import { Banknote } from 'lucide-react'
import { Order } from '@/shared/types'
import { useRestaurantById } from '@/hooks/useLocalData'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { OrderItemsList } from '@/shared/components/OrderItemsList'
import { Button } from '@/shared/components/Button'
import { formatCOP } from '@/shared/utils/money'
import { PAYMENT_METHOD } from '@/config/constants'

interface DeliveryOrderDetailSheetProps {
  order: Order | null
  open: boolean
  onClose: () => void
  actionLabel: string
  actionLoading: boolean
  actionDisabled: boolean
  onAction: () => void
}

export const DeliveryOrderDetailSheet = ({
  order,
  open,
  onClose,
  actionLabel,
  actionLoading,
  actionDisabled,
  onAction,
}: DeliveryOrderDetailSheetProps) => {
  const { restaurant } = useRestaurantById(order?.restaurant_id || '')

  if (!order) return null

  return (
    <BottomSheet open={open} onClose={onClose} title="Detalle del pedido">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold text-gray-500 tracking-wide mb-1">RECOGER EN</p>
          <p className="text-sm font-semibold text-secondary">{restaurant?.name}</p>
          <p className="text-xs text-gray-500">{restaurant?.address}</p>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 tracking-wide mb-1">ENTREGAR EN</p>
          <p className="text-sm font-semibold text-secondary">{order.delivery_address}</p>
          {order.special_instructions && (
            <p className="text-xs text-gray-500 italic mt-1">"{order.special_instructions}"</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-bold text-gray-500 tracking-wide mb-2">PRODUCTOS</p>
          <OrderItemsList orderId={order.id} />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-secondary">Total</span>
          <span className="font-display font-bold text-lg text-primary">{formatCOP(order.total)}</span>
        </div>

        {order.payment_method === PAYMENT_METHOD.CASH_ON_DELIVERY && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold rounded-xl p-2.5">
            <Banknote className="w-4 h-4 flex-shrink-0" />
            Cobrar {formatCOP(order.total)} en efectivo o datáfono al entregar
          </div>
        )}

        <Button fullWidth size="lg" loading={actionLoading} disabled={actionDisabled} onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </BottomSheet>
  )
}
