import { Order, User, Restaurant } from '@/shared/types'
import { formatCOP } from '@/shared/utils/money'
import { STATUS_LABELS } from './OrdersFilters'

interface OrdersTableProps {
  orders: Order[]
  usersById: Map<string, User>
  restaurantsById: Map<string, Restaurant>
  onOpenDetail: (order: Order) => void
}

export const OrdersTable = ({ orders, usersById, restaurantsById, onOpenDetail }: OrdersTableProps) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-gray-500 border-b border-gray-100">
        <th className="font-medium py-3 px-2">Pedido</th>
        <th className="font-medium py-3 px-2">Cliente</th>
        <th className="font-medium py-3 px-2">Restaurante</th>
        <th className="font-medium py-3 px-2">Estado</th>
        <th className="font-medium py-3 px-2">Total</th>
        <th className="font-medium py-3 px-2">Fecha</th>
        <th className="font-medium py-3 px-2 text-right">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {orders.map((order) => {
        const client = usersById.get(order.user_id)
        const restaurant = restaurantsById.get(order.restaurant_id)
        return (
          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
            <td className="py-3 px-2 font-semibold text-secondary">
              #{order.id.substring(0, 8).toUpperCase()}
            </td>
            <td className="py-3 px-2 text-gray-600">{client?.name || '—'}</td>
            <td className="py-3 px-2 text-gray-600">{restaurant?.name || '—'}</td>
            <td className="py-3 px-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </td>
            <td className="py-3 px-2 font-semibold text-secondary">{formatCOP(order.total)}</td>
            <td className="py-3 px-2 text-gray-500 text-xs">
              {new Date(order.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            </td>
            <td className="py-3 px-2 text-right">
              <button
                onClick={() => onOpenDetail(order)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Ver detalle
              </button>
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
)
