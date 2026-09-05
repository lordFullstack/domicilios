import { Restaurant } from '@/shared/types'
import { Period } from '../hooks/useAdminStats'

interface DashboardFiltersProps {
  period: Period
  onPeriodChange: (p: Period) => void
  restaurants: Restaurant[]
  restaurantFilter: string
  onRestaurantChange: (id: string) => void
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'all', label: 'Todo' },
]

export const DashboardFilters = ({
  period,
  onPeriodChange,
  restaurants,
  restaurantFilter,
  onRestaurantChange,
}: DashboardFiltersProps) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

    <select
      value={restaurantFilter}
      onChange={(e) => onRestaurantChange(e.target.value)}
      aria-label="Filtrar por restaurante"
      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-medium text-secondary bg-white"
    >
      <option value="all">Todos los restaurantes</option>
      {restaurants.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  </div>
)
