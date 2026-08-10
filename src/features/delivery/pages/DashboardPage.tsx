import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurantById } from '@/hooks/useLocalData'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { ORDER_STATUS } from '@/config/constants'
import { Order } from '@/shared/types'

export const DeliveryDashboard = () => {
  const { user } = useAuth()
  const { orders, updateOrder, getOrdersByDelivery } = useOrders()

  // Órdenes listas para recoger (sin domiciliario asignado)
  const availableOrders = orders.filter(
    (o) => o.status === ORDER_STATUS.READY && !o.delivery_person_id
  )

  // Mis entregas activas
  const myDeliveries = user ? getOrdersByDelivery(user.id) : []
  const activeDeliveries = myDeliveries.filter((o) => o.status === ORDER_STATUS.IN_DELIVERY)
  const completedDeliveries = myDeliveries.filter((o) => o.status === ORDER_STATUS.DELIVERED)

  // Ganancias estimadas (10% del total por entrega, mock)
  const todayCompleted = completedDeliveries.filter((o) => {
    const today = new Date().toDateString()
    return new Date(o.updated_at).toDateString() === today
  })
  const earningsToday = todayCompleted.reduce((sum, o) => sum + o.total * 0.1, 0)

  const handleAcceptOrder = (order: Order) => {
    if (!user) return
    updateOrder(order.id, {
      status: ORDER_STATUS.IN_DELIVERY as any,
      delivery_person_id: user.id,
    })
  }

  const handleCompleteDelivery = (order: Order) => {
    updateOrder(order.id, { status: ORDER_STATUS.DELIVERED as any })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
          <h1 className="text-3xl font-display font-bold text-secondary mb-2">🚴 Panel de Domiciliario</h1>
          <p className="text-lg text-gray-500">Hola {user?.name?.split(' ')[0]}, aquí tus entregas</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{availableOrders.length}</p>
              <p className="text-gray-600 text-sm mt-1">📦 Disponibles</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{activeDeliveries.length}</p>
              <p className="text-gray-600 text-sm mt-1">🚴 En camino</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{todayCompleted.length}</p>
              <p className="text-gray-600 text-sm mt-1">✅ Entregadas hoy</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                ${earningsToday.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-gray-600 text-sm mt-1">💰 Ganancias hoy</p>
            </div>
          </Card>
        </div>

        {/* Entregas Activas */}
        {activeDeliveries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🚴 Mi Entrega Actual</h2>
            <div className="space-y-4">
              {activeDeliveries.map((order) => (
                <DeliveryOrderCard
                  key={order.id}
                  order={order}
                  action={
                    <Button
                      variant="primary"
                      onClick={() => handleCompleteDelivery(order)}
                    >
                      🎉 Marcar como Entregada
                    </Button>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Órdenes Disponibles */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📦 Órdenes Disponibles</h2>

          {availableOrders.length === 0 ? (
            <Card>
              <p className="text-gray-600 text-center py-8">
                No hay órdenes disponibles en este momento
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {availableOrders.map((order) => (
                <DeliveryOrderCard
                  key={order.id}
                  order={order}
                  action={
                    <Button
                      variant="primary"
                      onClick={() => handleAcceptOrder(order)}
                      disabled={activeDeliveries.length > 0}
                    >
                      ✅ Aceptar Entrega
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Historial reciente */}
        {completedDeliveries.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📜 Historial Reciente</h2>
            <div className="space-y-3">
              {completedDeliveries.slice(0, 5).map((order) => (
                <Card key={order.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        Orden #{order.id.substring(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">{order.delivery_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-success font-bold">✅ Entregada</p>
                      <p className="text-sm text-gray-600">
                        +${(order.total * 0.1).toLocaleString('es-CO', {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente auxiliar para tarjeta de orden con info de restaurante
const DeliveryOrderCard = ({
  order,
  action,
}: {
  order: Order
  action: React.ReactNode
}) => {
  const { restaurant } = useRestaurantById(order.restaurant_id)

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="text-3xl">{restaurant?.image_url || '🏪'}</div>
          <div>
            <p className="font-bold">{restaurant?.name}</p>
            <p className="text-sm text-gray-600">📍 Recoger en: {restaurant?.address}</p>
            <p className="text-sm text-gray-600">🏠 Entregar en: {order.delivery_address}</p>
            <p className="text-lg font-bold text-primary mt-1">
              ${order.total.toLocaleString('es-CO')}
            </p>
          </div>
        </div>
        <div>{action}</div>
      </div>
    </Card>
  )
}
