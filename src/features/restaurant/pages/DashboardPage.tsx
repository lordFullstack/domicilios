import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { useOrders, useRestaurants, useProducts } from '@/hooks/useLocalData'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { BottomNav } from '@/shared/components/BottomNav'
import { ORDER_STATUS, ROUTES } from '@/config/constants'
import { Order, OrderStatus } from '@/shared/types'

const STATUS_FLOW: Record<string, string | null> = {
  [ORDER_STATUS.PENDING]: ORDER_STATUS.CONFIRMED,
  [ORDER_STATUS.CONFIRMED]: ORDER_STATUS.PREPARING,
  [ORDER_STATUS.PREPARING]: ORDER_STATUS.READY,
  [ORDER_STATUS.READY]: ORDER_STATUS.IN_DELIVERY,
  [ORDER_STATUS.IN_DELIVERY]: null,
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
  [ORDER_STATUS.PENDING]: 'Confirmar',
  [ORDER_STATUS.CONFIRMED]: 'Preparar',
  [ORDER_STATUS.PREPARING]: 'Marcar Lista',
  [ORDER_STATUS.READY]: 'Enviar',
}

export const RestaurantDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restaurants } = useRestaurants()
  const { updateOrder, getOrdersByRestaurant } = useOrders()

  const myRestaurant = restaurants.find((r) => r.owner_id === user?.id) || restaurants[0]
  const { products } = useProducts(myRestaurant?.id)

  const myOrders = myRestaurant ? getOrdersByRestaurant(myRestaurant.id) : []

  const pendingOrders = myOrders.filter((o) => o.status === ORDER_STATUS.PENDING)
  const activeOrders = myOrders.filter(
    (o) => !([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED] as OrderStatus[]).includes(o.status)
  )
  const deliveredToday = myOrders.filter((o) => {
    const today = new Date().toDateString()
    return o.status === ORDER_STATUS.DELIVERED && new Date(o.updated_at).toDateString() === today
  })
  const revenueToday = deliveredToday.reduce((sum, o) => sum + o.total, 0)

  const handleAdvanceStatus = (order: Order) => {
    const nextStatus = STATUS_FLOW[order.status]
    if (!nextStatus) return
    const updates: Partial<Order> = { status: nextStatus as any }
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
      <div className="min-h-screen bg-white flex items-center justify-center px-8">
        <p className="text-gray-400 text-sm text-center">No tienes un restaurante asignado todavía.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <span className="inline-block w-8 h-1 bg-primary rounded-full mb-3" />
        <h1 className="font-display text-xl font-bold text-secondary">
          {myRestaurant.image_url} {myRestaurant.name}
        </h1>
        <p className="text-sm text-gray-400">Panel de gestión de pedidos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-4">
        <Card className="text-center py-4">
          <p className="text-2xl font-display font-bold text-warning">{pendingOrders.length}</p>
          <p className="text-gray-400 text-xs mt-1">Pendientes</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-display font-bold text-primary">{activeOrders.length}</p>
          <p className="text-gray-400 text-xs mt-1">Activas</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-display font-bold text-success">{deliveredToday.length}</p>
          <p className="text-gray-400 text-xs mt-1">Entregadas hoy</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-lg font-display font-bold text-primary">
            ${revenueToday.toLocaleString('es-CO')}
          </p>
          <p className="text-gray-400 text-xs mt-1">Ingresos hoy</p>
        </Card>
      </div>

      {/* Info rápida */}
      <div className="px-5 mb-6 flex flex-col gap-3">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-bold text-sm text-secondary">Menú</p>
            <span className="text-xs text-gray-400">
              {products.length} productos · {products.filter((p) => p.available).length} activos
            </span>
          </div>
          <Button fullWidth variant="outline" size="sm" onClick={() => navigate(ROUTES.RESTAURANT_PRODUCTS)}>
            Gestionar menú
          </Button>
        </Card>
      </div>

      {/* Órdenes Activas */}
      <div className="px-5">
        <h2 className="font-display font-bold text-sm text-gray-700 mb-3">Órdenes Activas</h2>

        {activeOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hay órdenes activas en este momento</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeOrders.map((order) => (
              <Card key={order.id}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-secondary">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 bg-orange-50 text-primary text-xs rounded-full font-semibold">
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{order.delivery_address}</p>
                {order.special_instructions && (
                  <p className="text-xs text-gray-400 italic mb-1">"{order.special_instructions}"</p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-display font-bold text-primary">
                    ${order.total.toLocaleString('es-CO')}
                  </p>
                  <span className="text-xs text-gray-400">
                    {order.payment_method === 'cash_on_delivery' ? '💵 Contra entrega' : '💳 Pagado en línea'}
                  </span>
                </div>

                <div className="flex gap-2">
                  {order.status === ORDER_STATUS.PENDING && (
                    <Button variant="outline" size="sm" fullWidth onClick={() => handleCancelOrder(order)}>
                      Cancelar
                    </Button>
                  )}
                  {STATUS_FLOW[order.status] && (
                    <Button variant="primary" size="sm" fullWidth onClick={() => handleAdvanceStatus(order)}>
                      {NEXT_ACTION_LABELS[order.status]}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="restaurant" />
    </div>
  )
}
