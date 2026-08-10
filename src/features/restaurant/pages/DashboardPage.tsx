import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurants, useProducts } from '@/hooks/useLocalData'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { ORDER_STATUS, ROUTES } from '@/config/constants'
import { Order, OrderStatus } from '@/shared/types'

const STATUS_FLOW: Record<string, string | null> = {
  [ORDER_STATUS.PENDING]: ORDER_STATUS.CONFIRMED,
  [ORDER_STATUS.CONFIRMED]: ORDER_STATUS.PREPARING,
  [ORDER_STATUS.PREPARING]: ORDER_STATUS.READY,
  [ORDER_STATUS.READY]: ORDER_STATUS.IN_DELIVERY,
  [ORDER_STATUS.IN_DELIVERY]: null, // El domiciliario marca como entregado
  [ORDER_STATUS.DELIVERED]: null,
  [ORDER_STATUS.CANCELLED]: null,
}

const STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmada',
  [ORDER_STATUS.PREPARING]: 'Preparando',
  [ORDER_STATUS.READY]: 'Lista',
  [ORDER_STATUS.IN_DELIVERY]: 'En camino',
  [ORDER_STATUS.DELIVERED]: 'Entregada',
  [ORDER_STATUS.CANCELLED]: 'Cancelada',
}

const NEXT_ACTION_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: '✅ Confirmar Orden',
  [ORDER_STATUS.CONFIRMED]: '👨‍🍳 Empezar a Preparar',
  [ORDER_STATUS.PREPARING]: '📦 Marcar como Lista',
  [ORDER_STATUS.READY]: '🚴 Enviar a Domiciliario',
}

export const RestaurantDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants } = useRestaurants()
  const { updateOrder, getOrdersByRestaurant } = useOrders()

  // Restaurante del dueño actual
  const myRestaurant = restaurants.find((r) => r.owner_id === user?.id) || restaurants[0]
  const { products } = useProducts(myRestaurant?.id)

  const myOrders = myRestaurant ? getOrdersByRestaurant(myRestaurant.id) : []

  // Estadísticas
  const pendingOrders = myOrders.filter((o) => o.status === ORDER_STATUS.PENDING)
  const activeOrders = myOrders.filter(
    (o) => !([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED] as OrderStatus[]).includes(o.status)
  )
  const deliveredToday = myOrders.filter((o) => {
    const today = new Date().toDateString()
    return (
      o.status === ORDER_STATUS.DELIVERED &&
      new Date(o.updated_at).toDateString() === today
    )
  })
  const revenueToday = deliveredToday.reduce((sum, o) => sum + o.total, 0)

  const handleAdvanceStatus = (order: Order) => {
    const nextStatus = STATUS_FLOW[order.status]
    if (!nextStatus) return

    const updates: Partial<Order> = { status: nextStatus as any }

    // Simular asignación de domiciliario al pasar a READY
    if (nextStatus === ORDER_STATUS.IN_DELIVERY) {
      updates.delivery_person_id = 'user-delivery-1'
    }

    updateOrder(order.id, updates)
  }

  const handleCancelOrder = (order: Order) => {
    updateOrder(order.id, { status: ORDER_STATUS.CANCELLED as any })
  }

  if (!myRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-gray-600">No tienes un restaurante asignado todavía.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
          <h1 className="text-3xl font-display font-bold text-secondary mb-2">
            {myRestaurant.image_url} {myRestaurant.name}
          </h1>
          <p className="text-lg text-gray-500">Panel de gestión de pedidos</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{pendingOrders.length}</p>
              <p className="text-gray-600 text-sm mt-1">⏳ Pendientes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{activeOrders.length}</p>
              <p className="text-gray-600 text-sm mt-1">🔄 Órdenes activas</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{deliveredToday.length}</p>
              <p className="text-gray-600 text-sm mt-1">✅ Entregadas hoy</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                ${revenueToday.toLocaleString('es-CO')}
              </p>
              <p className="text-gray-600 text-sm mt-1">💰 Ingresos hoy</p>
            </div>
          </Card>
        </div>

        {/* Info rápida del negocio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <h3 className="font-bold mb-2">📋 Menú</h3>
            <p className="text-gray-600 text-sm mb-3">
              {products.length} productos • {products.filter((p) => p.available).length}{' '}
              disponibles
            </p>
            <Button
              fullWidth
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.RESTAURANT_PRODUCTS)}
            >
              📋 Gestionar menú
            </Button>
          </Card>
          <Card>
            <h3 className="font-bold mb-2">🏪 Estado del Restaurante</h3>
            <p className="text-gray-600 text-sm mb-3">
              {myRestaurant.status === 'open' ? '🟢 Abierto' : '🔴 Cerrado'}
            </p>
            <Button fullWidth variant="outline" size="sm" disabled>
              Cambiar estado (próximamente)
            </Button>
          </Card>
        </div>

        {/* Órdenes Activas */}
        <div>
          <h2 className="text-2xl font-bold mb-4">📦 Órdenes Activas</h2>

          {activeOrders.length === 0 ? (
            <Card>
              <p className="text-gray-600 text-center py-8">
                No hay órdenes activas en este momento
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <Card key={order.id}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">
                          Orden #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">📍 {order.delivery_address}</p>
                      {order.special_instructions && (
                        <p className="text-sm text-gray-500 italic">
                          "💬 {order.special_instructions}"
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary mt-2">
                        ${order.total.toLocaleString('es-CO')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {order.status === ORDER_STATUS.PENDING && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(order)}
                        >
                          ❌ Cancelar
                        </Button>
                      )}
                      {STATUS_FLOW[order.status] && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAdvanceStatus(order)}
                        >
                          {NEXT_ACTION_LABELS[order.status]}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
