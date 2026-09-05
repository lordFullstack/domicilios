import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { useAdminOrders } from '../hooks/useAdminOrders'
import { useAdminStats, filterOrdersByPeriod, Period } from '../hooks/useAdminStats'
import { DashboardFilters } from '../components/DashboardFilters'
import { KpiCard } from '../components/KpiCard'
import { RevenueBarChart } from '../components/RevenueBarChart'
import { StatusBreakdown } from '../components/StatusBreakdown'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { formatCOP } from '@/shared/utils/money'
import { exportToCSV } from '../utils/csvExport'

export const AdminReportsPage = () => {
  const { users, loading: loadingUsers } = useAdminUsers()
  const { restaurants, loading: loadingRestaurants } = useAdminRestaurants()
  const { allOrders, loading: loadingOrders } = useAdminOrders()

  const [period, setPeriod] = useState<Period>('7d')
  const [restaurantFilter, setRestaurantFilter] = useState('all')

  const filteredOrders = useMemo(() => {
    const byPeriod = filterOrdersByPeriod(allOrders, period)
    return restaurantFilter === 'all' ? byPeriod : byPeriod.filter((o) => o.restaurant_id === restaurantFilter)
  }, [allOrders, period, restaurantFilter])

  const stats = useAdminStats(users, restaurants, filteredOrders)
  const loading = loadingUsers || loadingRestaurants || loadingOrders
  const mayBeIncomplete = period === 'all' && allOrders.length >= 200

  const restaurantsById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), [restaurants])

  const handleExportCSV = () => {
    const headers = ['Pedido', 'Fecha', 'Restaurante', 'Estado', 'Método de pago', 'Total']
    const rows = filteredOrders.map((o) => [
      o.id.substring(0, 8).toUpperCase(),
      new Date(o.created_at).toLocaleString('es-CO'),
      restaurantsById.get(o.restaurant_id)?.name || o.restaurant_id,
      o.status,
      o.payment_method,
      o.total,
    ])
    const filename = `pedidos_${period}_${new Date().toISOString().slice(0, 10)}.csv`
    exportToCSV(filename, headers, rows)
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div>
            <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
            <h1 className="font-display text-2xl font-bold text-secondary mb-1">Finanzas y Reportes</h1>
            <p className="text-sm text-gray-500">Ventas, pedidos y desempeño reales de la plataforma</p>
            {mayBeIncomplete && (
              <p className="text-xs text-warning mt-1">
                Mostrando hasta 200 pedidos más recientes — el total real podría ser mayor.
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleExportCSV} disabled={filteredOrders.length === 0}>
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm text-center py-12">Cargando reportes...</p>
        ) : (
          <>
            <DashboardFilters
              period={period}
              onPeriodChange={setPeriod}
              restaurants={restaurants}
              restaurantFilter={restaurantFilter}
              onRestaurantChange={setRestaurantFilter}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KpiCard value={formatCOP(stats.totalRevenue)} label="Ventas (entregados)" colorClass="text-primary" />
              <KpiCard value={stats.totalOrders} label="Pedidos en el periodo" />
              <KpiCard value={formatCOP(Math.round(stats.averageTicket))} label="Ticket promedio" />
              <KpiCard value={stats.deliveredOrders.length} label="Domicilios completados" colorClass="text-success" />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <RevenueBarChart data={stats.ordersByDay} />
              <StatusBreakdown orders={filteredOrders} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-secondary mb-4">🏪 Ingresos por Restaurante</h2>
              <div className="space-y-3">
                {stats.ordersByRestaurant.map(({ restaurant, totalOrders, revenue }) => (
                  <Card key={restaurant.id}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-secondary">{restaurant.name}</p>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCOP(revenue)}</p>
                        <p className="text-sm text-gray-500">{totalOrders} pedidos</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-500 space-y-1">
              <p>
                <strong className="text-gray-500">No disponibles</strong> — no existen en el backend, no se
                fabricaron: descuentos aplicados, comisión de plataforma, costo de domicilio.
              </p>
              <p>Cancelados en el periodo: {stats.cancelledOrders.length} · Tasa de cancelación: {stats.cancellationRate.toFixed(1)}%</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
