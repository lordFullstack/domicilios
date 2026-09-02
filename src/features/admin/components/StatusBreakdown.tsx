import { Order } from '@/shared/types'
import { ORDER_STATUS } from '@/config/constants'

const STATUS_META: Record<string, { label: string; color: string }> = {
  [ORDER_STATUS.PENDING]: { label: 'Pendiente', color: 'bg-gray-300' },
  [ORDER_STATUS.CONFIRMED]: { label: 'Confirmado', color: 'bg-primary/60' },
  [ORDER_STATUS.PREPARING]: { label: 'Preparando', color: 'bg-primary/60' },
  [ORDER_STATUS.READY]: { label: 'Listo', color: 'bg-warning' },
  [ORDER_STATUS.IN_DELIVERY]: { label: 'En camino', color: 'bg-warning' },
  [ORDER_STATUS.DELIVERED]: { label: 'Entregado', color: 'bg-success' },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelado', color: 'bg-danger' },
}

interface StatusBreakdownProps {
  orders: Order[]
}

export const StatusBreakdown = ({ orders }: StatusBreakdownProps) => {
  const total = orders.length

  const counts = Object.values(ORDER_STATUS).map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }))

  return (
    <div>
      <h2 className="text-lg font-bold text-secondary mb-4">📊 Pedidos por estado</h2>
      <div className="border border-gray-100 rounded-2xl p-5 space-y-3">
        {total === 0 ? (
          <p className="text-sm text-gray-400 text-center">Todavía no hay pedidos en este rango.</p>
        ) : (
          counts.map(({ status, count }) => {
            const meta = STATUS_META[status]
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={status}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{meta.label}</span>
                  <span className="font-semibold text-secondary">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${meta.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
