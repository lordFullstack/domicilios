import { Banknote } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurantById } from '@/hooks/useLocalData'
import { Button } from '@/shared/components/Button'
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from '@/config/constants'
import { Order } from '@/shared/types'

export const DeliveryDashboard = () => {
  const { user } = useAuth()
  const { orders, updateOrder, getOrdersByDelivery } = useOrders()

  const availableOrders = orders.filter(
    (o) => o.status === ORDER_STATUS.READY && !o.delivery_person_id
  )

  const myDeliveries = user ? getOrdersByDelivery(user.id) : []
  const activeDeliveries = myDeliveries.filter((o) => o.status === ORDER_STATUS.IN_DELIVERY)
  const completedDeliveries = myDeliveries.filter((o) => o.status === ORDER_STATUS.DELIVERED)

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
    const updates: Partial<Order> = { status: ORDER_STATUS.DELIVERED as any }
    // Si es efectivo/datáfono, el domiciliario cobra al entregar → marcar pagado
    if (order.payment_method === PAYMENT_METHOD.CASH_ON_DELIVERY) {
      updates.payment_status = PAYMENT_STATUS.PAID as any
    }
    updateOrder(order.id, updates)
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
        <h1 className="font-display text-xl font-bold text-secondary">🚴 Panel de Domiciliario</h1>
        <p className="text-sm text-gray-400">Hola {user?.name?.split(' ')[0]}, aquí tus entregas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-6">
        <div className="border border-gray-100 rounded-2xl text-center py-4">
          <p className="text-2xl font-display font-bold text-primary">{availableOrders.length}</p>
          <p className="text-gray-400 text-xs mt-1">Disponibles</p>
        </div>
        <div className="border border-gray-100 rounded-2xl text-center py-4">
          <p className="text-2xl font-display font-bold text-warning">{activeDeliveries.length}</p>
          <p className="text-gray-400 text-xs mt-1">En camino</p>
        </div>
        <div className="border border-gray-100 rounded-2xl text-center py-4">
          <p className="text-2xl font-display font-bold text-success">{todayCompleted.length}</p>
          <p className="text-gray-400 text-xs mt-1">Entregadas hoy</p>
        </div>
        <div className="border border-gray-100 rounded-2xl text-center py-4">
          <p className="text-lg font-display font-bold text-primary">
            ${earningsToday.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-400 text-xs mt-1">Ganancias hoy</p>
        </div>
      </div>

      {/* Entrega activa */}
      {activeDeliveries.length > 0 && (
        <div className="px-5 mb-6">
          <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Mi Entrega Actual</h2>
          <div className="flex flex-col gap-3">
            {activeDeliveries.map((order) => (
              <DeliveryOrderCard
                key={order.id}
                order={order}
                action={
                  <Button variant="primary" fullWidth onClick={() => handleCompleteDelivery(order)}>
                    Marcar como Entregada
                  </Button>
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Órdenes disponibles */}
      <div className="px-5 mb-6">
        <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Órdenes Disponibles</h2>

        {availableOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay órdenes disponibles en este momento</p>
        ) : (
          <div className="flex flex-col gap-3">
            {availableOrders.map((order) => (
              <DeliveryOrderCard
                key={order.id}
                order={order}
                action={
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleAcceptOrder(order)}
                    disabled={activeDeliveries.length > 0}
                  >
                    Aceptar Entrega
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Historial reciente */}
      {completedDeliveries.length > 0 && (
        <div className="px-5">
          <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Historial Reciente</h2>
          <div className="flex flex-col gap-2">
            {completedDeliveries.slice(0, 5).map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-2xl p-3 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-secondary">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{order.delivery_address}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-success font-semibold text-xs">Entregada</p>
                  <p className="text-xs text-gray-500">
                    +${(order.total * 0.1).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
    <div className="border border-gray-100 rounded-2xl p-3">
      <div className="flex gap-3 mb-3">
        <div className="text-3xl flex-shrink-0">{restaurant?.image_url || '🏪'}</div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-secondary truncate">{restaurant?.name}</p>
          <p className="text-xs text-gray-400 truncate">Recoger: {restaurant?.address}</p>
          <p className="text-xs text-gray-400 truncate">Entregar: {order.delivery_address}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-base font-display font-bold text-primary">
              ${order.total.toLocaleString('es-CO')}
            </p>
            {order.payment_method === 'cash_on_delivery' && (
              <span className="flex items-center gap-1 bg-orange-50 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                <Banknote className="w-3 h-3" />
                Cobrar al entregar
              </span>
            )}
          </div>
        </div>
      </div>
      {action}
    </div>
  )
}
