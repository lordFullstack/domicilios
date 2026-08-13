import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, XCircle } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { useOrders, useRestaurantById } from '@/hooks/useLocalData'
import { OrderStatusIcon } from '@/shared/constants/icons'
import { ORDER_STATUS, ROUTES } from '@/config/constants'

const TRACKER_STEPS = [
  { status: ORDER_STATUS.PENDING, label: 'Pendiente' },
  { status: ORDER_STATUS.CONFIRMED, label: 'Confirmada' },
  { status: ORDER_STATUS.PREPARING, label: 'Preparando' },
  { status: ORDER_STATUS.READY, label: 'Lista' },
  { status: ORDER_STATUS.IN_DELIVERY, label: 'En camino' },
  { status: ORDER_STATUS.DELIVERED, label: 'Entregada' },
]

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { orders, loading } = useOrders()

  const order = orders.find((o) => o.id === id)
  const { restaurant } = useRestaurantById(order?.restaurant_id || '')

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando orden...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
        <p className="text-gray-400 text-sm mb-4">Orden no encontrada</p>
        <Button onClick={() => navigate(ROUTES.CLIENT_ORDERS)}>Volver a mis órdenes</Button>
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
    <div className="min-h-screen bg-white max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.CLIENT_ORDERS)}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-secondary">
            #{order.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-400">
            {formattedDate} · {formattedTime}
          </p>
        </div>
      </div>

      <div className="px-5">
        {/* Tracker de estado */}
        {isCancelled ? (
          <div className="bg-red-50 rounded-2xl p-6 text-center mb-4">
            <XCircle className="w-10 h-10 text-danger mx-auto mb-2" />
            <p className="font-display font-bold text-danger">Esta orden fue cancelada</p>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-2xl p-4 mb-4">
            <p className="font-display font-bold text-sm text-secondary mb-4">
              Estado de tu pedido
            </p>
            <div className="flex flex-col">
              {TRACKER_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isLast = index === TRACKER_STEPS.length - 1
                return (
                  <div key={step.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? 'bg-primary' : 'bg-gray-100'
                        }`}
                      >
                        <OrderStatusIcon
                          status={step.status}
                          className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`}
                        />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 min-h-[20px] ${
                            index < currentStepIndex ? 'bg-primary' : 'bg-gray-100'
                          }`}
                        />
                      )}
                    </div>
                    <p
                      className={`text-sm pb-5 ${
                        isCompleted ? 'font-semibold text-secondary' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Restaurante */}
        <div className="border border-gray-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">{restaurant?.image_url}</span>
          <div>
            <p className="font-semibold text-sm text-secondary">{restaurant?.name}</p>
            <p className="text-xs text-gray-400">{restaurant?.address}</p>
          </div>
        </div>

        {/* Entrega */}
        <div className="border border-gray-100 rounded-2xl p-4 mb-4">
          <p className="font-display font-bold text-sm text-secondary mb-2">Entrega</p>
          <p className="text-sm text-gray-500 mb-1">{order.delivery_address}</p>
          {order.special_instructions && (
            <p className="text-xs text-gray-400 italic">"{order.special_instructions}"</p>
          )}
          {order.delivery_person_id && (
            <p className="text-xs text-primary font-semibold mt-2">Domiciliario asignado</p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <span className="font-display font-bold text-secondary">Total pagado</span>
          <span className="font-display font-bold text-xl text-primary">
            ${order.total.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  )
}
