import { AdminSidebar, AdminMobileNav } from '../components/AdminSidebar'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useAdminRestaurants } from '../hooks/useAdminRestaurants'
import { useAdminOrders } from '../hooks/useAdminOrders'
import { useAdminStats } from '../hooks/useAdminStats'
import { Card } from '@/shared/components/Card'

export const AdminDashboard = () => {
  const { users, loading: loadingUsers } = useAdminUsers()
  const { restaurants, loading: loadingRestaurants } = useAdminRestaurants()
  const { allOrders: orders, loading: loadingOrders } = useAdminOrders()
  const stats = useAdminStats(users, restaurants, orders)

  const loading = loadingUsers || loadingRestaurants || loadingOrders

  return (
    <div className="min-h-screen bg-gray-50 md:pl-56">
      <AdminMobileNav />
      <AdminSidebar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
          <h1 className="font-display text-2xl font-bold text-secondary mb-1">
            👔 Panel de Administración
          </h1>
          <p className="text-sm text-gray-500">Visión general de la plataforma</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-12">Cargando estadísticas...</p>
        ) : (
          <>
            {/* Usuarios */}
            <h2 className="text-lg font-bold text-secondary mb-4">👥 Usuarios</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
                  <p className="text-gray-500 text-sm mt-1">Total usuarios</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-secondary">{stats.totalClients}</p>
                  <p className="text-gray-500 text-sm mt-1">🧑 Clientes</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-secondary">{stats.totalRestaurantOwners}</p>
                  <p className="text-gray-500 text-sm mt-1">🏪 Restaurantes</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-secondary">{stats.totalDelivery}</p>
                  <p className="text-gray-500 text-sm mt-1">🚴 Domiciliarios</p>
                </div>
              </Card>
            </div>

            {/* Órdenes */}
            <h2 className="text-lg font-bold text-secondary mb-4">📦 Órdenes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
                  <p className="text-gray-500 text-sm mt-1">Total órdenes</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-warning">{stats.activeOrders.length}</p>
                  <p className="text-gray-500 text-sm mt-1">🔄 Activas</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-success">{stats.deliveredOrders.length}</p>
                  <p className="text-gray-500 text-sm mt-1">✅ Entregadas</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-danger">{stats.cancelledOrders.length}</p>
                  <p className="text-gray-500 text-sm mt-1">❌ Canceladas</p>
                </div>
              </Card>
            </div>

            {/* Finanzas */}
            <h2 className="text-lg font-bold text-secondary mb-4">💰 Finanzas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    ${stats.totalRevenue.toLocaleString('es-CO')}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Volumen total transaccionado (GMV)</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-success">
                    ${stats.platformFee.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Comisión plataforma (15%)</p>
                </div>
              </Card>
            </div>

            {/* Rendimiento por restaurante */}
            <div>
              <h2 className="text-lg font-bold text-secondary mb-4">🏪 Rendimiento por Restaurante</h2>
              <div className="space-y-3">
                {stats.ordersByRestaurant.map(({ restaurant, totalOrders, revenue }) => (
                  <Card key={restaurant.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
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
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${revenue.toLocaleString('es-CO')}</p>
                        <p className="text-sm text-gray-500">{totalOrders} órdenes</p>
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
