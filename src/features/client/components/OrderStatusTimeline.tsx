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
}

export const OrderStatusTimeline = ({ status }: OrderStatusTimelineProps) => {
  const currentStepIndex = TRACKER_STEPS.findIndex((s) => s.status === status)

  return (
    <div className="border border-gray-100 rounded-2xl p-4 mb-4">
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
  )
}
