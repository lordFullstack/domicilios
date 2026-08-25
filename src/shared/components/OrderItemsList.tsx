import { useOrderItems } from '@/hooks/useLocalData'

interface OrderItemsListProps {
  orderId: string
  className?: string
}

// Lista compacta de "2x Pizza Margarita — $28.000" para insertar dentro
// de cualquier tarjeta de orden (restaurante, cliente, domiciliario).
export const OrderItemsList = ({ orderId, className }: OrderItemsListProps) => {
  const { items, loading } = useOrderItems(orderId)

  if (loading) {
    return <p className={`text-xs text-gray-300 ${className || ''}`}>Cargando pedido...</p>
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
          <span className="whitespace-nowrap text-gray-400">
            ${(item.unit_price * item.quantity).toLocaleString('es-CO')}
          </span>
        </li>
      ))}
    </ul>
  )
}
