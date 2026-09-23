import { useEffect, useRef } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'
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
  const rowRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  // Con un deep link (?cat=mariscos) el chip activo puede quedar fuera de
  // vista a la derecha: se trae al centro para que el filtro sea evidente.
  useEffect(() => {
    const active = rowRef.current?.querySelector<HTMLElement>('[data-category-active="true"]')
    active?.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [filters.category, reducedMotion])

  // aria-pressed (toggles) y no role="tab": "Abiertos" se combina con una
  // categoría, así que los chips NO son mutuamente excluyentes como tabs.
  return (
    // Desvanecido a la derecha: mismo indicador de "hay más" que CategoryScroller.
    <div
      ref={rowRef}
      className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,black_90%,transparent_100%)]"
    >
      <button
        type="button"
        onClick={() => onChange({ ...filters, category: undefined, onlyOpen: false })}
        className={`${chipBase} ${isAllSelected ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}
        aria-pressed={isAllSelected}
      >
        Todos
      </button>

      <button
        type="button"
        onClick={() => onChange({ ...filters, onlyOpen: !filters.onlyOpen })}
        className={`${chipBase} ${filters.onlyOpen ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}
        aria-pressed={filters.onlyOpen}
      >
        <span aria-hidden="true">🟢</span> Abiertos
      </button>

      {RESTAURANT_CATEGORIES.map((c) => {
        const active = filters.category === c.value
        return (
          <button
            type="button"
            key={c.value}
            onClick={() => onChange({ ...filters, category: active ? undefined : c.value })}
            className={`${chipBase} ${active ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}
            aria-pressed={active}
            data-category-active={active}
          >
            <span aria-hidden="true">{c.emoji}</span> {c.label}
          </button>
        )
      })}

      <button
        type="button"
        onClick={onOpenSheet}
        className={`${chipBase} border border-gray-200 text-secondary`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
        Filtros{activeCount > 0 ? ` · ${activeCount}` : ''}
      </button>
    </div>
  )
}
