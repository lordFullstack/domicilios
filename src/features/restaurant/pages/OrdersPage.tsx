import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurants } from '@/hooks/useLocalData'
import { Card } from '@/shared/components/Card'
import { ROUTES, ORDER_STATUS } from '@/config/constants'

const STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: '⏳ Pendiente',
  [ORDER_STATUS.CONFIRMED]: '✅ Confirmada',
  [ORDER_STATUS.PREPARING]: '👨‍🍳 Preparando',
  [ORDER_STATUS.READY]: '📦 Lista',
  [ORDER_STATUS.IN_DELIVERY]: '🚴 En camino',
  [ORDER_STATUS.DELIVERED]: '🎉 Entregada',
  [ORDER_STATUS.CANCELLED]: '❌ Cancelada',
}

export const RestaurantOrdersPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants } = useRestaurants()
  const { getOrdersByRestaurant } = useOrders()

  const myRestaurant = restaurants.find((r) => r.owner_id === user?.id) || restaurants[0]
  const myOrders = myRestaurant ? getOrdersByRestaurant(myRestaurant.id) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-secondary to-primary text-white p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(ROUTES.RESTAURANT_DASHBOARD)}
            className="mb-4 hover:opacity-80"
          >
            ← Dashboard
          </button>
          <h1 className="text-3xl font-bold">📜 Historial de Órdenes</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {myOrders.length === 0 ? (
          <Card>
            <p className="text-gray-600 text-center py-8">Aún no hay órdenes registradas</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {myOrders.map((order) => (
              <Card key={order.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Orden #{order.id.substring(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">{order.delivery_address}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm mb-1">
                      {STATUS_LABELS[order.status]}
                    </p>
                    <p className="font-bold text-primary">
                      ${order.total.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
