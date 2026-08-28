import { useState, useMemo } from 'react'
import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { useAdminOrders } from '../hooks/useAdminOrders'
import { useAdminStats, filterOrdersByPeriod, Period } from '../hooks/useAdminStats'
import { DashboardFilters } from '../components/DashboardFilters'
import { KpiCard } from '../components/KpiCard'
import { AdminAlerts } from '../components/AdminAlerts'
import { OrdersBarChart } from '../components/OrdersBarChart'
import { RecentOrdersList } from '../components/RecentOrdersList'
import { Card } from '@/shared/components/Card'
import { formatCOP } from '@/shared/utils/money'

export const AdminDashboard = () => {
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

  // fetchAllOrders() tiene un límite de 200 filas — si se llega justo a
  // ese número, las métricas de "Todo" podrían estar incompletas. Mejor
  // decirlo que mostrar un total que parece exacto y no lo es.
  const mayBeIncomplete = period === 'all' && allOrders.length >= 200

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
          <h1 className="font-display text-2xl font-bold text-secondary mb-1">
            👔 Panel de Administración
          </h1>
          <p className="text-sm text-gray-500">Visión general de la plataforma</p>
          {mayBeIncomplete && (
            <p className="text-xs text-warning mt-1">
              Mostrando hasta 200 pedidos más recientes — el total real podría ser mayor.
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-12">Cargando estadísticas...</p>
        ) : (
          <>
            <DashboardFilters
              period={period}
              onPeriodChange={setPeriod}
              restaurants={restaurants}
              restaurantFilter={restaurantFilter}
              onRestaurantChange={setRestaurantFilter}
            />

            <AdminAlerts
              restaurants={restaurants}
              cancellationRate={stats.cancellationRate}
              totalOrders={stats.totalOrders}
            />

            {/* Usuarios */}
            <h2 className="text-lg font-bold text-secondary mb-4">👥 Usuarios</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KpiCard value={stats.totalUsers} label="Total usuarios" colorClass="text-primary" />
              <KpiCard value={stats.totalClients} label="🧑 Clientes" />
              <KpiCard value={stats.totalRestaurantOwners} label="🏪 Restaurantes" />
              <KpiCard value={stats.totalDelivery} label="🚴 Domiciliarios" />
            </div>

            {/* Órdenes (según periodo/restaurante seleccionado) */}
            <h2 className="text-lg font-bold text-secondary mb-4">📦 Órdenes en el periodo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KpiCard value={stats.totalOrders} label="Total órdenes" colorClass="text-primary" />
              <KpiCard value={stats.activeOrders.length} label="🔄 Activas" colorClass="text-warning" />
              <KpiCard value={stats.deliveredOrders.length} label="✅ Entregadas" colorClass="text-success" />
              <KpiCard value={stats.cancelledOrders.length} label="❌ Canceladas" colorClass="text-danger" />
            </div>

            {/* Finanzas — solo métricas calculables con datos reales */}
            <h2 className="text-lg font-bold text-secondary mb-4">💰 Finanzas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <KpiCard
                value={formatCOP(stats.totalRevenue)}
                label="Volumen transaccionado (GMV), pedidos entregados"
                colorClass="text-primary"
                span="wide"
              />
              <KpiCard value={formatCOP(Math.round(stats.averageTicket))} label="Ticket promedio" />
            </div>

            <div className="mb-8">
              <OrdersBarChart data={stats.ordersByDay} />
            </div>

            <div className="mb-8">
              <RecentOrdersList orders={filteredOrders} />
            </div>

            {/* Rendimiento por restaurante */}
            <div>
              <h2 className="text-lg font-bold text-secondary mb-4">🏪 Rendimiento por Restaurante</h2>
              <div className="space-y-3">
                {stats.ordersByRestaurant.map(({ restaurant, totalOrders, revenue }) => (
                  <Card key={restaurant.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-secondary">{restaurant.name}</p>
                        <p className="text-sm text-gray-500">
                          {restaurant.status === 'open' ? '🟢 Abierto' : '🔴 Cerrado'}
                          {' · '}
                          {restaurant.approved ? '✅ Aprobado' : '⛔ Suspendido'}
                          {restaurant.rating_count > 0 && (
                            <> · ⭐ {restaurant.rating_avg} ({restaurant.rating_count})</>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCOP(revenue)}</p>
                        <p className="text-sm text-gray-500">{totalOrders} órdenes en el periodo</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
