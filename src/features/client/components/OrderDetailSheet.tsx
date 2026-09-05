import { BottomSheet } from '@/shared/components/BottomSheet'
import { OrderItemsList } from '@/shared/components/OrderItemsList'
import { formatCOP } from '@/shared/utils/money'
import { Order } from '@/shared/types'

interface OrderDetailSheetProps {
  open: boolean
  onClose: () => void
  order: Order
}

export const OrderDetailSheet = ({ open, onClose, order }: OrderDetailSheetProps) => (
  <BottomSheet open={open} onClose={onClose} title="Detalles del pedido">
    <div className="flex flex-col gap-4">
      <OrderItemsList orderId={order.id} />

      <div className="border-t border-gray-100 pt-3 flex justify-between font-display font-bold text-secondary">
        <span>Total</span>
        <span className="text-primary">{formatCOP(order.total)}</span>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-bold text-gray-500 tracking-wide mb-1">ENTREGA</p>
        <p className="text-sm text-secondary">{order.delivery_address}</p>
        {order.special_instructions && (
          <p className="text-xs text-gray-500 italic mt-1">"{order.special_instructions}"</p>
        )}
      </div>
    </div>
  </BottomSheet>
)
