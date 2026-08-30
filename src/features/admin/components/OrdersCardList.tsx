import { Order, User, Restaurant } from '@/shared/types'
import { Card } from '@/shared/components/Card'
import { formatCOP } from '@/shared/utils/money'
import { STATUS_LABELS } from './OrdersFilters'

interface OrdersCardListProps {
  orders: Order[]
  usersById: Map<string, User>
  restaurantsById: Map<string, Restaurant>
  onOpenDetail: (order: Order) => void
}

export const OrdersCardList = ({ orders, usersById, restaurantsById, onOpenDetail }: OrdersCardListProps) => (
  <div className="grid gap-3">
    {orders.map((order) => {
      const client = usersById.get(order.user_id)
      const restaurant = restaurantsById.get(order.restaurant_id)
      return (
        <Card key={order.id} hoverable onClick={() => onOpenDetail(order)}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-display font-bold text-secondary">
                #{order.id.substring(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-400">{restaurant?.name} · {client?.name || '—'}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 flex-shrink-0">
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">{formatCOP(order.total)}</span>
            <span className="text-xs text-gray-400">
              {new Date(order.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        </Card>
      )
    })}
  </div>
)
