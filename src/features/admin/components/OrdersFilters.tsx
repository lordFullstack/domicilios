import { Restaurant, OrderStatus } from '@/shared/types'
import { ORDER_STATUS } from '@/config/constants'
import { Period } from '../hooks/useAdminStats'

const STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: '🕐 Pendiente',
  [ORDER_STATUS.CONFIRMED]: '✅ Confirmado',
  [ORDER_STATUS.PREPARING]: '👨‍🍳 Preparando',
  [ORDER_STATUS.READY]: '📦 Listo',
  [ORDER_STATUS.IN_DELIVERY]: '🚴 En camino',
  [ORDER_STATUS.DELIVERED]: '✅ Entregado',
  [ORDER_STATUS.CANCELLED]: '❌ Cancelado',
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'all', label: 'Todo' },
]

interface OrdersFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: OrderStatus | 'all'
  onStatusChange: (v: OrderStatus | 'all') => void
  restaurantFilter: string
  onRestaurantChange: (v: string) => void
  restaurants: Restaurant[]
  period: Period
  onPeriodChange: (v: Period) => void
}

export const OrdersFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  restaurantFilter,
  onRestaurantChange,
  restaurants,
  period,
  onPeriodChange,
}: OrdersFiltersProps) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    <input
      type="search"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Buscar por número o dirección..."
      aria-label="Buscar pedidos"
      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
    />

    <select
      value={statusFilter}
      onChange={(e) => onStatusChange(e.target.value as OrderStatus | 'all')}
      aria-label="Filtrar por estado"
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
    >
      <option value="all">Todos los estados</option>
      {Object.values(ORDER_STATUS).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s] || s}
        </option>
      ))}
    </select>

    <select
      value={restaurantFilter}
      onChange={(e) => onRestaurantChange(e.target.value)}
      aria-label="Filtrar por restaurante"
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
    >
      <option value="all">Todos los restaurantes</option>
      {restaurants.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>

    <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onPeriodChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            period === opt.value ? 'bg-white text-secondary shadow-card' : 'text-gray-500'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
)

export { STATUS_LABELS }
