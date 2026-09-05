import { useNavigate } from 'react-router-dom'
import { Order } from '@/shared/types'
import { ORDER_STATUS, ROUTES } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'

interface RecentOrdersListProps {
  orders: Order[]
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  [ORDER_STATUS.PENDING]: { label: 'Pendiente', color: 'text-gray-500 bg-gray-100' },
  [ORDER_STATUS.CONFIRMED]: { label: 'Confirmada', color: 'text-primary bg-primary/10' },
  [ORDER_STATUS.PREPARING]: { label: 'Preparando', color: 'text-primary bg-primary/10' },
  [ORDER_STATUS.READY]: { label: 'Lista', color: 'text-warning bg-warning/10' },
  [ORDER_STATUS.IN_DELIVERY]: { label: 'En camino', color: 'text-warning bg-warning/10' },
  [ORDER_STATUS.DELIVERED]: { label: 'Entregada', color: 'text-success bg-success/10' },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelada', color: 'text-danger bg-danger/10' },
}

// No existe una ruta de detalle de orden para Admin (Órdenes es de solo
// lectura, listado únicamente) — el drill-down real disponible es llevar
// al listado completo, no inventar una ruta que no existe.
export const RecentOrdersList = ({ orders }: RecentOrdersListProps) => {
  const navigate = useNavigate()
  const recent = orders.slice(0, 6)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-secondary">🕐 Actividad reciente</h2>
        <button
          onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
          className="text-sm font-semibold text-primary"
        >
          Ver todas →
        </button>
      </div>

      {recent.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8 border border-gray-100 rounded-2xl">
          Todavía no hay pedidos.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {recent.map((order) => {
            const status = STATUS_LABEL[order.status]
            return (
              <button
                key={order.id}
                onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
                className="border border-gray-100 rounded-2xl p-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-secondary">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{order.delivery_address}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-sm text-secondary">{formatCOP(order.total)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
