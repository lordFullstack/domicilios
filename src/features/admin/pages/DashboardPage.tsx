import { useOrders, useRestaurants } from '@/hooks/useLocalData'
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'
import { Card } from '@/shared/components/Card'
import { ORDER_STATUS, USER_ROLES } from '@/config/constants'
import { User, OrderStatus } from '@/shared/types'

export const AdminDashboard = () => {
  const { orders } = useOrders()
  const { restaurants } = useRestaurants()
  const users: User[] = localStorageService.get(STORAGE_KEYS.USERS) || []

  // Estadísticas generales
  const totalUsers = users.length
  const totalClients = users.filter((u) => u.role === USER_ROLES.CLIENT).length
  const totalRestaurantOwners = users.filter((u) => u.role === USER_ROLES.RESTAURANT).length
  const totalDelivery = users.filter((u) => u.role === USER_ROLES.DELIVERY).length

  const totalOrders = orders.length
  const deliveredOrders = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED)
  const activeOrders = orders.filter(
    (o) => !([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED] as OrderStatus[]).includes(o.status)
  )
  const cancelledOrders = orders.filter((o) => o.status === ORDER_STATUS.CANCELLED)

  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0)
  const platformFee = totalRevenue * 0.15 // 15% comisión mock

  // Órdenes por restaurante
  const ordersByRestaurant = restaurants.map((r) => {
    const restOrders = orders.filter((o) => o.restaurant_id === r.id)
    const restRevenue = restOrders
      .filter((o) => o.status === ORDER_STATUS.DELIVERED)
      .reduce((sum, o) => sum + o.total, 0)
    return {
      restaurant: r,
      totalOrders: restOrders.length,
      revenue: restRevenue,
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-secondary text-white p-8">
        <div className="max-w-6xl mx-auto">
          <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
          <h1 className="text-3xl font-display font-bold mb-2">👔 Panel de Administración</h1>
          <p className="text-lg text-gray-300">Visión general de la plataforma</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Estadísticas de Usuarios */}
        <h2 className="text-xl font-bold mb-4">👥 Usuarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalUsers}</p>
              <p className="text-gray-600 text-sm mt-1">Total usuarios</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">{totalClients}</p>
              <p className="text-gray-600 text-sm mt-1">🧑 Clientes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">{totalRestaurantOwners}</p>
              <p className="text-gray-600 text-sm mt-1">🏪 Restaurantes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">{totalDelivery}</p>
              <p className="text-gray-600 text-sm mt-1">🚴 Domiciliarios</p>
            </div>
          </Card>
        </div>

        {/* Estadísticas de Órdenes */}
        <h2 className="text-xl font-bold mb-4">📦 Órdenes</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalOrders}</p>
              <p className="text-gray-600 text-sm mt-1">Total órdenes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{activeOrders.length}</p>
              <p className="text-gray-600 text-sm mt-1">🔄 Activas</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{deliveredOrders.length}</p>
              <p className="text-gray-600 text-sm mt-1">✅ Entregadas</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-danger">{cancelledOrders.length}</p>
              <p className="text-gray-600 text-sm mt-1">❌ Canceladas</p>
            </div>
          </Card>
        </div>

        {/* Estadísticas Financieras */}
        <h2 className="text-xl font-bold mb-4">💰 Finanzas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                ${totalRevenue.toLocaleString('es-CO')}
              </p>
              <p className="text-gray-600 text-sm mt-1">Volumen total transaccionado (GMV)</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">
                ${platformFee.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-gray-600 text-sm mt-1">Comisión plataforma (15%)</p>
            </div>
          </Card>
        </div>

        {/* Rendimiento por Restaurante */}
        <div>
          <h2 className="text-xl font-bold mb-4">🏪 Rendimiento por Restaurante</h2>
          <div className="space-y-3">
            {ordersByRestaurant.map(({ restaurant, totalOrders, revenue }) => (
              <Card key={restaurant.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{restaurant.image_url}</span>
                    <div>
                      <p className="font-bold">{restaurant.name}</p>
                      <p className="text-sm text-gray-600">
                        {restaurant.status === 'open' ? '🟢 Abierto' : '🔴 Cerrado'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ${revenue.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm text-gray-600">{totalOrders} órdenes</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
