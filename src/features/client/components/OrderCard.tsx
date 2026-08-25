import { Order } from '@/shared/types'
import { Card } from '@/shared/components/Card'
import { useRestaurantById } from '@/hooks/useLocalData'
import { ORDER_STATUS } from '@/config/constants'

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case ORDER_STATUS.CONFIRMED:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case ORDER_STATUS.PREPARING:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case ORDER_STATUS.READY:
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case ORDER_STATUS.IN_DELIVERY:
      return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    case ORDER_STATUS.DELIVERED:
      return 'bg-green-100 text-green-800 border-green-200'
    case ORDER_STATUS.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusEmoji = (status: string): string => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return '⏳'
    case ORDER_STATUS.CONFIRMED:
      return '✅'
    case ORDER_STATUS.PREPARING:
      return '👨‍🍳'
    case ORDER_STATUS.READY:
      return '📦'
    case ORDER_STATUS.IN_DELIVERY:
      return '🚴'
    case ORDER_STATUS.DELIVERED:
      return '🎉'
    case ORDER_STATUS.CANCELLED:
      return '❌'
    default:
      return '❓'
  }
}

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
    <Card
      hoverable
      onClick={onClick}
      className="cursor-pointer transition-all hover:shadow-lg"
    >
      <div className="flex gap-4">
        {/* Emoji restaurante */}
        <div className="text-4xl">{restaurant?.image_url || '🏪'}</div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Header: Nombre y estado */}
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 truncate">
                {restaurant?.name || 'Restaurante'}
              </h3>
              <p className="text-xs text-gray-500">
                Orden #{order.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusEmoji(order.status)} {getStatusLabel(order.status)}
            </div>
          </div>

          {/* Fecha y hora */}
          <p className="text-xs text-gray-600 mb-3">
            📅 {formattedDate} • {formattedTime}
          </p>

          {/* Dirección */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
            📍 {order.delivery_address}
          </p>

          {/* Footer: Domiciliario y Total */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600">
              {order.delivery_person_id ? (
                <span>🚴 Domiciliario asignado</span>
              ) : (
                <span className="text-yellow-600">⚠️ Sin domiciliario</span>
              )}
            </div>
            <div className="text-lg font-bold text-primary">
              ${order.total.toLocaleString('es-CO')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
