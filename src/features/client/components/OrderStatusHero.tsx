import { OrderStatusIcon } from '@/shared/constants/icons'
import { ORDER_STATUS } from '@/config/constants'
import { OrderStatus } from '@/shared/types'

const STATUS_COPY: Record<OrderStatus, { title: string; description: string }> = {
  [ORDER_STATUS.PENDING]: {
    title: 'Pedido recibido',
    description: 'Estamos enviando tu pedido al restaurante.',
  },
  [ORDER_STATUS.CONFIRMED]: {
    title: 'El restaurante confirmó',
    description: 'Tu pedido fue aceptado y pronto empieza a prepararse.',
  },
  [ORDER_STATUS.PREPARING]: {
    title: 'Preparando tu pedido',
    description: 'El restaurante está preparando todo con cuidado.',
  },
  [ORDER_STATUS.READY]: {
    title: 'Pedido listo',
    description: 'Tu pedido está listo, esperando al domiciliario.',
  },
  [ORDER_STATUS.IN_DELIVERY]: {
    title: 'Tu pedido está en camino',
    description: 'El domiciliario ya viene hacia ti.',
  },
  [ORDER_STATUS.DELIVERED]: {
    title: '¡Pedido entregado!',
    description: 'Esperamos que lo disfrutes.',
  },
  [ORDER_STATUS.CANCELLED]: {
    title: 'Pedido cancelado',
    description: 'Este pedido fue cancelado.',
  },
}

interface OrderStatusHeroProps {
  status: OrderStatus
}

const colorByStatus = (status: OrderStatus) => {
  if (status === ORDER_STATUS.DELIVERED) return 'bg-success/10 text-success'
  if (status === ORDER_STATUS.CANCELLED) return 'bg-danger/10 text-danger'
  return 'bg-primary/10 text-primary'
}

export const OrderStatusHero = ({ status }: OrderStatusHeroProps) => {
  const copy = STATUS_COPY[status]

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${colorByStatus(status)}`}>
        <OrderStatusIcon status={status} className="w-7 h-7" />
      </div>
      <h2 className="font-display text-lg font-bold text-secondary mb-1">{copy.title}</h2>
      <p className="text-sm text-gray-500 max-w-[280px]">{copy.description}</p>
    </div>
  )
}
