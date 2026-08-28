import { Banknote } from 'lucide-react'
import { Order } from '@/shared/types'
import { useRestaurantById } from '@/hooks/useLocalData'
import { formatCOP } from '@/shared/utils/money'
import { PAYMENT_METHOD } from '@/config/constants'

interface DeliveryOrderCardProps {
  order: Order
  onOpenDetail: (order: Order) => void
}

export const DeliveryOrderCard = ({ order, onOpenDetail }: DeliveryOrderCardProps) => {
  const { restaurant } = useRestaurantById(order.restaurant_id)

  return (
    <button
      onClick={() => onOpenDetail(order)}
      className="focus-ring w-full text-left border border-gray-100 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <span className="text-2xl flex-shrink-0">{restaurant?.image_url || '🏪'}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-secondary truncate">{restaurant?.name}</p>
        <p className="text-xs text-gray-400 truncate">Entregar: {order.delivery_address}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display font-bold text-sm text-primary">{formatCOP(order.total)}</p>
        {order.payment_method === PAYMENT_METHOD.CASH_ON_DELIVERY && (
          <span className="flex items-center gap-1 text-primary text-xs font-semibold justify-end mt-0.5">
            <Banknote className="w-3 h-3" />
            Cobrar
          </span>
        )}
      </div>
    </button>
  )
}
