import { useOrderItems } from '@/hooks/useLocalData'
import { LoadingState } from './LoadingState'
import { Skeleton } from './Skeleton'

interface OrderItemsListProps {
  orderId: string
  className?: string
}

// Lista compacta de "2x Pizza Margarita — $28.000" para insertar dentro
// de cualquier tarjeta de orden (restaurante, cliente, domiciliario).
export const OrderItemsList = ({ orderId, className }: OrderItemsListProps) => {
  const { items, loading } = useOrderItems(orderId)

  if (loading) {
    return (
      <LoadingState label="Cargando productos del pedido" className={`space-y-1.5 ${className || ''}`}>
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </LoadingState>
    )
  }

  if (items.length === 0) {
    return <p className={`text-xs text-gray-300 ${className || ''}`}>Sin detalle de productos</p>
  }

  return (
    <ul className={`space-y-1 ${className || ''}`}>
      {items.map((item) => (
        <li key={item.id} className="flex justify-between gap-2 text-xs text-gray-600">
          <span className="truncate">
            <span className="font-semibold text-secondary">{item.quantity}x</span> {item.product_name}
          </span>
          <span className="whitespace-nowrap text-gray-500">
            ${(item.unit_price * item.quantity).toLocaleString('es-CO')}
          </span>
        </li>
      ))}
    </ul>
  )
}
