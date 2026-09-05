import { Order } from '@/shared/types'
import { formatCOP } from '@/shared/utils/money'

interface DeliveryStatsGridProps {
  availableCount: number
  activeCount: number
  completedToday: Order[]
}

export const DeliveryStatsGrid = ({ availableCount, activeCount, completedToday }: DeliveryStatsGridProps) => {
  // Antes esto mostraba `total * 0.1` como "Ganancias hoy" — un 10% de
  // comisión que no existe en ningún lado del backend (no hay columna de
  // comisión/ganancia en `orders` ni `profiles`). Mostrar en cambio el
  // valor real de lo entregado, sin fingir que es la paga del domiciliario.
  const deliveredValueToday = completedToday.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="grid grid-cols-2 gap-3 px-5 mb-6">
      <div className="border border-gray-100 rounded-2xl text-center py-4">
        <p className="text-2xl font-display font-bold text-primary">{availableCount}</p>
        <p className="text-gray-500 text-xs mt-1">Disponibles</p>
      </div>
      <div className="border border-gray-100 rounded-2xl text-center py-4">
        <p className="text-2xl font-display font-bold text-warning">{activeCount}</p>
        <p className="text-gray-500 text-xs mt-1">En camino</p>
      </div>
      <div className="border border-gray-100 rounded-2xl text-center py-4">
        <p className="text-2xl font-display font-bold text-success">{completedToday.length}</p>
        <p className="text-gray-500 text-xs mt-1">Entregadas hoy</p>
      </div>
      <div className="border border-gray-100 rounded-2xl text-center py-4">
        <p className="text-lg font-display font-bold text-secondary">{formatCOP(deliveredValueToday)}</p>
        <p className="text-gray-500 text-xs mt-1">Valor entregado hoy</p>
      </div>
    </div>
  )
}
