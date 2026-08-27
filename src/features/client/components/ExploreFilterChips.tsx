import { SlidersHorizontal } from 'lucide-react'
import { RESTAURANT_CATEGORIES } from '@/config/constants'
import { RestaurantFilters, countActiveFilters } from '../utils/filters'

interface ExploreFilterChipsProps {
  filters: RestaurantFilters
  onChange: (filters: RestaurantFilters) => void
  onOpenSheet: () => void
}

const chipBase =
  'focus-ring flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap active:scale-[0.96] transition-transform min-h-[40px]'

export const ExploreFilterChips = ({ filters, onChange, onOpenSheet }: ExploreFilterChipsProps) => {
  const activeCount = countActiveFilters(filters)
  const isAllSelected = !filters.category && !filters.onlyOpen

  return (
    <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => onChange({ ...filters, category: undefined, onlyOpen: false })}
        className={`${chipBase} ${isAllSelected ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}
        aria-pressed={isAllSelected}
      >
        Todos
      </button>

      <button
        onClick={() => onChange({ ...filters, onlyOpen: !filters.onlyOpen })}
        className={`${chipBase} ${filters.onlyOpen ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}
        aria-pressed={filters.onlyOpen}
      >
        🟢 Abiertos
      </button>

      {RESTAURANT_CATEGORIES.map((c) => {
        const active = filters.category === c.value
        return (
          <button
            key={c.value}
            onClick={() => onChange({ ...filters, category: active ? undefined : c.value })}
            className={`${chipBase} ${active ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}
            aria-pressed={active}
          >
            {c.emoji} {c.label}
          </button>
        )
      })}

      <button
        onClick={onOpenSheet}
        className={`${chipBase} border border-gray-200 text-secondary`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtros{activeCount > 0 ? ` · ${activeCount}` : ''}
      </button>
    </div>
  )
}
