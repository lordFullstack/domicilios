import { OrderStatusIcon } from '@/shared/constants/icons'
import { ORDER_STATUS } from '@/config/constants'
import { OrderStatus } from '@/shared/types'

const TRACKER_STEPS = [
  { status: ORDER_STATUS.PENDING, label: 'Pendiente' },
  { status: ORDER_STATUS.CONFIRMED, label: 'Confirmada' },
  { status: ORDER_STATUS.PREPARING, label: 'Preparando' },
  { status: ORDER_STATUS.READY, label: 'Lista' },
  { status: ORDER_STATUS.IN_DELIVERY, label: 'En camino' },
  { status: ORDER_STATUS.DELIVERED, label: 'Entregada' },
]

interface OrderStatusTimelineProps {
  status: OrderStatus
  /**
   * Hora de la última actualización real del pedido (order.updated_at).
   * Solo tenemos ESTE dato — no hay un timestamp por cada paso pasado
   * (el modelo Order no lo guarda), así que se muestra únicamente junto
   * al paso actual en vez de inventar horas para los pasos anteriores.
   */
  updatedAt?: string
}

export const OrderStatusTimeline = ({ status, updatedAt }: OrderStatusTimelineProps) => {
  const currentStepIndex = TRACKER_STEPS.findIndex((s) => s.status === status)
  const updatedTime = updatedAt
    ? new Date(updatedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="border border-gray-100 rounded-2xl p-4 mb-4">
      <div className="flex flex-col">
        {TRACKER_STEPS.map((step, index) => {
          const isDone = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isLast = index === TRACKER_STEPS.length - 1
          return (
            <div key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDone
                      ? 'bg-success'
                      : isCurrent
                      ? 'bg-primary ring-4 ring-primary/15'
                      : 'bg-gray-100'
                  }`}
                >
                  <OrderStatusIcon
                    status={step.status}
                    className={`w-4 h-4 ${isDone || isCurrent ? 'text-white' : 'text-gray-400'}`}
                  />
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[20px] ${
                      index < currentStepIndex ? 'bg-success' : 'bg-gray-100'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 flex items-center justify-between pb-5">
                <p
                  className={`text-sm ${
                    isDone || isCurrent ? 'font-semibold text-secondary' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && updatedTime && (
                  <span className="text-xs text-gray-400">{updatedTime}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
