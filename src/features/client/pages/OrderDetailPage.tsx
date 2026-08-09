import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { useOrders, useRestaurantById } from '@/hooks/useLocalData'
import { ORDER_STATUS } from '@/config/constants'
import { ROUTES } from '@/config/constants'

const TRACKER_STEPS = [
  { status: ORDER_STATUS.PENDING, label: 'Pendiente', emoji: '⏳' },
  { status: ORDER_STATUS.CONFIRMED, label: 'Confirmada', emoji: '✅' },
  { status: ORDER_STATUS.PREPARING, label: 'Preparando', emoji: '👨‍🍳' },
  { status: ORDER_STATUS.READY, label: 'Lista', emoji: '📦' },
  { status: ORDER_STATUS.IN_DELIVERY, label: 'En camino', emoji: '🚴' },
  { status: ORDER_STATUS.DELIVERED, label: 'Entregada', emoji: '🎉' },
]

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { orders, loading } = useOrders()

  const order = orders.find((o) => o.id === id)
  const { restaurant } = useRestaurantById(order?.restaurant_id || '')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando orden...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Orden no encontrada</p>
          <Button onClick={() => navigate(ROUTES.CLIENT_ORDERS)}>Volver a mis órdenes</Button>
        </div>
      </div>
    )
  }

  const isCancelled = order.status === ORDER_STATUS.CANCELLED
  const currentStepIndex = TRACKER_STEPS.findIndex((s) => s.status === order.status)

  const createdDate = new Date(order.created_at)
  const formattedDate = createdDate.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedTime = createdDate.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(ROUTES.CLIENT_ORDERS)} className="text-primary font-semibold mb-6">
          ← Mis Órdenes
        </button>

        <h1 className="text-2xl font-bold mb-1">
          Orden #{order.id.substring(0, 8).toUpperCase()}
        </h1>
        <p className="text-gray-600 mb-6">
          📅 {formattedDate} • {formattedTime}
        </p>

        {/* Tracker de Estado */}
        {isCancelled ? (
          <Card className="mb-6 bg-danger/10 border border-danger/20">
            <div className="text-center py-4">
              <p className="text-4xl mb-2">❌</p>
              <p className="font-bold text-danger">Esta orden fue cancelada</p>
            </div>
          </Card>
        ) : (
          <Card className="mb-6">
            <h2 className="font-bold mb-6">Estado de tu Pedido</h2>
            <div className="flex justify-between relative">
              {/* Línea de progreso */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-0">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(currentStepIndex / (TRACKER_STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {TRACKER_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                return (
                  <div key={step.status} className="flex flex-col items-center z-10 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-2 ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.emoji}
                    </div>
                    <p
                      className={`text-xs text-center ${
                        isCompleted ? 'font-semibold text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Info del Restaurante */}
        <Card className="mb-6">
          <div className="flex gap-3 items-center">
            <span className="text-3xl">{restaurant?.image_url}</span>
            <div>
              <p className="font-bold">{restaurant?.name}</p>
              <p className="text-sm text-gray-600">{restaurant?.address}</p>
            </div>
          </div>
        </Card>

        {/* Items de la Orden */}
        <Card className="mb-6">
          <h2 className="font-bold mb-4">📦 Items</h2>
          <OrderItemsList total={order.total} />
        </Card>

        {/* Info de Entrega */}
        <Card className="mb-6">
          <h2 className="font-bold mb-3">📍 Información de Entrega</h2>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Dirección:</strong> {order.delivery_address}
          </p>
          {order.special_instructions && (
            <p className="text-sm text-gray-600">
              <strong>Instrucciones:</strong> {order.special_instructions}
            </p>
          )}
          {order.delivery_person_id && (
            <p className="text-sm text-gray-600 mt-2">🚴 Domiciliario asignado</p>
          )}
        </Card>

        {/* Total */}
        <Card>
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total Pagado</span>
            <span className="font-bold text-2xl text-primary">
              ${order.total.toLocaleString('es-CO')}
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Nota: como no guardamos order_items en esta versión MVP,
// mostramos un resumen simplificado basado en el total.
const OrderItemsList = ({
  total,
}: {
  total: number
}) => {
  return (
    <p className="text-sm text-gray-600">
      Total de la orden: <strong>${total.toLocaleString('es-CO')}</strong>
      <br />
      <span className="text-xs text-gray-400">
        (Detalle de productos disponible próximamente)
      </span>
    </p>
  )
}
