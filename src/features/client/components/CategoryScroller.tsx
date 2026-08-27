import { useNavigate } from 'react-router-dom'
import { ROUTES, RESTAURANT_CATEGORIES } from '@/config/constants'

/**
 * Búsqueda rápida por categoría — cada botón navega a CategoryResultsPage.
 * Mismo mecanismo que ya existía en ClientDashboardPage, solo se extrajo
 * a su propio componente y se le subió el touch target.
 */
export const CategoryScroller = () => {
  const navigate = useNavigate()

  return (
    <div>
      <h2 className="font-display font-bold text-sm text-gray-700 mb-2 px-5">Categorías</h2>
      <div className="flex gap-3 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {RESTAURANT_CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => navigate(ROUTES.CLIENT_CATEGORY.replace(':category', c.value))}
            className="focus-ring flex flex-col items-center gap-1 flex-shrink-0 active:scale-[0.94] transition-transform rounded-2xl"
          >
            <div className="touch-target w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
              {c.emoji}
            </div>
            <span className="text-xs text-gray-500">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
