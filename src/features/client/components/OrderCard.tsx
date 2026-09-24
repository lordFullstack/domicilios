import { Order } from '@/shared/types'
import { Card } from '@/shared/components/Card'
import { useRestaurantById } from '@/hooks/useLocalData'
import { OrderStatusIcon } from '@/shared/constants/icons'
import { ORDER_STATUS } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'
import { ProductImage } from '@/shared/components/ProductImage'

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

// Mismas etiquetas que OrderStatusTimeline/OrderStatusHero — una sola
// fuente de verdad para el texto de cada estado seria mejor, pero
// timeline/hero tienen copys distintos (paso corto vs. título+descripción)
// por diseño, así que esta lista solo replica las etiquetas cortas.
const getStatusLabel = (status: string): string => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'Pendiente'
    case ORDER_STATUS.CONFIRMED:
      return 'Confirmada'
    case ORDER_STATUS.PREPARING:
      return 'Preparando'
    case ORDER_STATUS.READY:
      return 'Lista'
    case ORDER_STATUS.IN_DELIVERY:
      return 'En camino'
    case ORDER_STATUS.DELIVERED:
      return 'Entregada'
    case ORDER_STATUS.CANCELLED:
      return 'Cancelada'
    default:
      return 'Desconocido'
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-800'
    case ORDER_STATUS.CONFIRMED:
      return 'bg-blue-100 text-blue-800'
    case ORDER_STATUS.PREPARING:
      return 'bg-orange-100 text-orange-800'
    case ORDER_STATUS.READY:
      return 'bg-purple-100 text-purple-800'
    case ORDER_STATUS.IN_DELIVERY:
      return 'bg-primary/10 text-primary'
    case ORDER_STATUS.DELIVERED:
      return 'bg-success/10 text-success-strong'
    case ORDER_STATUS.CANCELLED:
      return 'bg-danger/10 text-danger'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export const OrderCard = ({ order, onClick }: OrderCardProps) => {
  const { restaurant } = useRestaurantById(order.restaurant_id)

  const createdDate = new Date(order.created_at)
  const formattedDate = createdDate.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const formattedTime = createdDate.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card hoverable onClick={onClick} className="card-surface card-surface--static rounded-3xl">
      <div className="flex gap-3">
        {/* Antes imprimía image_url como TEXTO (con foto real salía la URL). */}
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
          <ProductImage imageUrl={restaurant?.image_url} alt="" fallbackIconSize={20} width={40} height={40} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-sm text-secondary truncate">
                {restaurant?.name || 'Restaurante'}
              </h2>
              <p className="text-xs text-gray-500 tabular-nums">
                #{order.id.substring(0, 8).toUpperCase()} · {formattedDate} · {formattedTime}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(
                order.status
              )}`}
            >
              <OrderStatusIcon status={order.status} className="w-3 h-3" />
              {getStatusLabel(order.status)}
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-3 line-clamp-1">{order.delivery_address}</p>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {order.delivery_person_id ? 'Domiciliario asignado' : 'Sin domiciliario'}
            </span>
            <span className="font-display font-semibold tabular-nums text-ink">{formatCOP(order.total)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
