import { useState, useEffect, ReactNode } from 'react'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { Button } from '@/shared/components/Button'
import { RESTAURANT_CATEGORIES } from '@/config/constants'
import { RestaurantFilters, DEFAULT_FILTERS, SORT_OPTIONS } from '../utils/filters'

interface ExploreFilterSheetProps {
  open: boolean
  filters: RestaurantFilters
  onClose: () => void
  onApply: (filters: RestaurantFilters) => void
}

// Opciones de orden: fuente única en utils/filters.ts (SORT_OPTIONS).

const RadioRow = ({
  label,
  selected,
  onSelect,
}: {
  label: ReactNode
  selected: boolean
  onSelect: () => void
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className="focus-ring w-full flex items-center gap-3 py-3 text-left min-h-[48px]"
  >
    <span
      aria-hidden="true"
      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
        selected ? 'border-primary' : 'border-gray-300'
      }`}
    >
      {selected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
    </span>
    <span className="text-sm text-secondary">{label}</span>
  </button>
)

const categoryLabel = (emoji: string, label: string) => (
  <>
    <span aria-hidden="true">{emoji}</span> {label}
  </>
)

// Los cambios se guardan en un borrador local y solo se aplican de verdad
// al tocar "Aplicar filtros" — así el usuario puede explorar opciones sin
// disparar un re-filtrado de la lista en cada tap.
export const ExploreFilterSheet = ({ open, filters, onClose, onApply }: ExploreFilterSheetProps) => {
  const [draft, setDraft] = useState(filters)

  // Solo al ABRIR: los filtros ahora salen de la URL y, si se sincronizara
  // con cada cambio de `filters`, cualquier re-render borraría el borrador.
  useEffect(() => {
    if (open) setDraft(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  const handleClear = () => {
    setDraft(DEFAULT_FILTERS)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Filtros">
      <div>
        <h3 id="sheet-sort" className="text-sm font-semibold text-gray-500 mb-1">Ordenar por</h3>
        <div className="divide-y divide-gray-100" role="radiogroup" aria-labelledby="sheet-sort">
          {SORT_OPTIONS.map((opt) => (
            <RadioRow
              key={opt.value}
              label={opt.label}
              selected={draft.sortBy === opt.value}
              onSelect={() => setDraft({ ...draft, sortBy: opt.value })}
            />
          ))}
        </div>

        <h3 id="sheet-cat" className="text-sm font-semibold text-gray-500 mt-4 mb-1">Categoría</h3>
        <div className="divide-y divide-gray-100" role="radiogroup" aria-labelledby="sheet-cat">
          <RadioRow
            label="Todas"
            selected={!draft.category}
            onSelect={() => setDraft({ ...draft, category: undefined })}
          />
          {RESTAURANT_CATEGORIES.map((c) => (
            <RadioRow
              key={c.value}
              label={categoryLabel(c.emoji, c.label)}
              selected={draft.category === c.value}
              onSelect={() => setDraft({ ...draft, category: c.value })}
            />
          ))}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={draft.onlyOpen}
          onClick={() => setDraft({ ...draft, onlyOpen: !draft.onlyOpen })}
          className="focus-ring w-full flex items-center justify-between py-3 mt-2 min-h-[48px]"
        >
          <span className="text-sm text-secondary">Solo restaurantes abiertos</span>
          <span
            aria-hidden="true"
            className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
              draft.onlyOpen ? 'bg-primary justify-end' : 'bg-gray-200 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow" />
          </span>
        </button>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Limpiar
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Aplicar filtros
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
