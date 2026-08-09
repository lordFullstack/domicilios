import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { useRestaurants, useOrders } from '@/hooks/useLocalData'
import { useAuth } from '@/shared/hooks/useAuth'
import { RestaurantCard } from '../components/RestaurantCard'
import { OrderCard } from '../components/OrderCard'
import { ROUTES, ORDER_STATUS } from '@/config/constants'
import { OrderStatus } from '@/shared/types'

export const ClientDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants } = useRestaurants()
  const { orders } = useOrders(user?.id)

  // Estadísticas
  const totalOrders = orders.length
  const deliveredOrders = orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length
  const activeOrders = orders.filter(o => 
    !([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED] as OrderStatus[]).includes(o.status)
  ).length
  const totalSpent = orders
    .filter(o => o.status === ORDER_STATUS.DELIVERED)
    .reduce((sum, o) => sum + o.total, 0)

  // Órdenes recientes (últimas 3)
  const recentOrders = orders.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">👋 Bienvenido, {user?.name?.split(' ')[0]}</h1>
          <p className="text-lg">¿Qué quieres ordenar hoy?</p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalOrders}</p>
              <p className="text-gray-600 text-sm mt-1">📦 Total de órdenes</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{deliveredOrders}</p>
              <p className="text-gray-600 text-sm mt-1">✅ Entregadas</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{activeOrders}</p>
              <p className="text-gray-600 text-sm mt-1">🔄 En progreso</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                ${totalSpent.toLocaleString('es-CO')}
              </p>
              <p className="text-gray-600 text-sm mt-1">💰 Total gastado</p>
            </div>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card hoverable onClick={() => navigate(ROUTES.CLIENT_HOME)}>
            <div className="text-center py-6">
              <p className="text-4xl mb-3">🍕</p>
              <h3 className="font-bold mb-1">Ordenar Comida</h3>
              <p className="text-sm text-gray-600 mb-4">Ver restaurantes disponibles</p>
              <Button fullWidth variant="primary" size="sm">
                Explorar
              </Button>
            </div>
          </Card>

          <Card hoverable onClick={() => navigate(ROUTES.CLIENT_ORDERS)}>
            <div className="text-center py-6">
              <p className="text-4xl mb-3">📦</p>
              <h3 className="font-bold mb-1">Mis Órdenes</h3>
              <p className="text-sm text-gray-600 mb-4">Ver historial y seguimiento</p>
              <Button fullWidth variant="secondary" size="sm">
                Ver todas
              </Button>
            </div>
          </Card>

          <Card hoverable onClick={() => navigate(ROUTES.CLIENT_CART)}>
            <div className="text-center py-6">
              <p className="text-4xl mb-3">🛒</p>
              <h3 className="font-bold mb-1">Mi Carrito</h3>
              <p className="text-sm text-gray-600 mb-4">Productos pendientes</p>
              <Button fullWidth variant="outline" size="sm">
                Revisar
              </Button>
            </div>
          </Card>
        </div>

        {/* Órdenes Recientes */}
        {recentOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">📦 Órdenes Recientes</h2>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => navigate(ROUTES.CLIENT_ORDER.replace(':id', order.id))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Restaurantes Destacados */}
        <div>
          <h2 className="text-2xl font-bold mb-4">⭐ Restaurantes Populares</h2>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.slice(0, 3).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-600 text-center py-8">No hay restaurantes disponibles</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
