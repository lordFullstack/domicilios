import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Order } from '@/shared/types'
import { useRestaurantById } from '@/hooks/useLocalData'
import { OrderStatusIcon } from '@/shared/constants/icons'
import { ORDER_STATUS, ROUTES } from '@/config/constants'

interface ActiveOrderCardProps {
  order: Order
}

// Pasos visibles en la barra de progreso. 'pending' comparte el primer
// paso con 'confirmed' — para el cliente, ambos significan "el restaurante
// ya lo recibió y lo va a atender".
const STEPS = [
  { key: ORDER_STATUS.CONFIRMED, label: 'Confirmado' },
  { key: ORDER_STATUS.PREPARING, label: 'Preparando' },
  { key: ORDER_STATUS.IN_DELIVERY, label: 'En camino' },
  { key: ORDER_STATUS.DELIVERED, label: 'Entregado' },
]

const stepIndex = (status: string) => {
  if (status === ORDER_STATUS.PENDING) return 0
  if (status === ORDER_STATUS.READY) return 1 // "lista" sigue siendo parte de "preparando" en la barra visual
  const idx = STEPS.findIndex((s) => s.key === status)
  return idx === -1 ? 0 : idx
}

export const ActiveOrderCard = ({ order }: ActiveOrderCardProps) => {
  const navigate = useNavigate()
  const { restaurant } = useRestaurantById(order.restaurant_id)
  const currentStep = stepIndex(order.status)
  const openOrder = () => navigate(ROUTES.CLIENT_ORDER.replace(':id', order.id))

  return (
    <div className="px-5 mb-6">
      {/* <button> nativo: responde a Enter/Espacio sin emularlo. Solo contiene texto. */}
      <button
        type="button"
        onClick={openOrder}
        className="focus-ring block w-full rounded-3xl bg-secondary p-4 text-left shadow-floating transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 mb-3">
          <OrderStatusIcon status={order.status} className="w-4 h-4 text-white" aria-hidden="true" />
          <p className="text-white font-display font-bold text-sm">
            {restaurant?.name || 'Pedido en curso'}
          </p>
        </div>

        <p className="text-white/60 text-xs mb-3 tabular-nums">Pedido #{order.id.substring(0, 8).toUpperCase()}</p>

        <div className="flex items-center gap-1.5 mb-4" aria-hidden="true">
          {STEPS.map((step, i) => (
            <div
              key={step.key}
              className={`h-1.5 flex-1 rounded-full ${i <= currentStep ? 'bg-brand-gradient' : 'bg-white/20'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white text-xs font-medium">{STEPS[currentStep]?.label}</span>
          <span className="text-white text-xs font-semibold flex items-center gap-0.5">
            Ver seguimiento <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>
      </button>
    </div>
  )
}
