import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { useAdminOrders } from '../hooks/useAdminOrders'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { Card } from '@/shared/components/Card'
import { ORDER_STATUS } from '@/config/constants'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: '🕐 Pendiente', className: 'bg-warning/10 text-warning' },
  confirmed: { label: '✅ Confirmado', className: 'bg-primary/10 text-primary' },
  preparing: { label: '👨‍🍳 Preparando', className: 'bg-primary/10 text-primary' },
  ready: { label: '📦 Listo', className: 'bg-primary/10 text-primary' },
  in_delivery: { label: '🚴 En camino', className: 'bg-warning/10 text-warning' },
  delivered: { label: '✅ Entregado', className: 'bg-success/10 text-success' },
  cancelled: { label: '❌ Cancelado', className: 'bg-danger/10 text-danger' },
}

export const AdminOrdersPage = () => {
  const { restaurants } = useAdminRestaurants()
  const {
    orders,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    restaurantFilter,
    setRestaurantFilter,
  } = useAdminOrders()

  const restaurantName = (id: string) => restaurants.find((r) => r.id === id)?.name || 'Restaurante'

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-bold text-secondary mb-1">Órdenes</h1>
        <p className="text-sm text-gray-500 mb-6">Todos los pedidos de la plataforma (últimos 200)</p>

        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="all">Todos los estados</option>
            {Object.values(ORDER_STATUS).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]?.label || status}
              </option>
            ))}
          </select>

          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="all">Todos los restaurantes</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="text-gray-400 text-sm">Cargando órdenes...</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        {!loading && (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Orden</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Restaurante</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const statusInfo = STATUS_LABELS[o.status] || { label: o.status, className: 'bg-gray-100' }
                  return (
                    <tr key={o.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        #{o.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-medium text-secondary">
                        {restaurantName(o.restaurant_id)}
                      </td>
                      <td className="px-4 py-3">${Number(o.total).toLocaleString('es-CO')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(o.created_at).toLocaleString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No hay órdenes con estos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}
