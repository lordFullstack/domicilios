import clsx from 'clsx'
import { RESTAURANT_CATEGORIES } from '@/config/constants'
import type { RestaurantCategory } from '@/shared/types'

interface CategoryPickerProps {
  value: RestaurantCategory
  onChange: (category: RestaurantCategory) => void
  label?: string
  disabled?: boolean
}

/**
 * Tipo de comida del restaurante. De esto depende en qué botón de categoría del Inicio del cliente aparece
 * (Pizza, Burgers, Asados…): una sola categoría por restaurante.
 */
export const CategoryPicker = ({ value, onChange, label = 'Tipo de comida', disabled = false }: CategoryPickerProps) => (
  <div role="radiogroup" aria-label={label}>
    <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>
    <div className="flex flex-wrap gap-2">
      {RESTAURANT_CATEGORIES.map((c) => {
        const selected = c.value === value
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(c.value)}
            className={clsx(
              'focus-ring rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50',
              selected ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-gray-500'
            )}
          >
            {c.emoji} {c.label}
          </button>
        )
      })}
    </div>
  </div>
)
