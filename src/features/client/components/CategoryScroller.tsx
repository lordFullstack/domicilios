import { useNavigate } from 'react-router-dom'
import { ROUTES, RESTAURANT_CATEGORIES } from '@/config/constants'

// Un color de fondo por categoría (puramente decorativo, igual que el
// mapa de colores por estado de OrderCard) — ayuda a escanear la fila
// más rápido que si todos los círculos fueran del mismo gris.
const CATEGORY_COLORS: Record<string, string> = {
  Pizza: 'bg-orange-100',
  Burgers: 'bg-red-100',
  Sushi: 'bg-pink-100',
  Postres: 'bg-purple-100',
  Bebidas: 'bg-blue-100',
  Asados: 'bg-yellow-100',
}

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
      <div className="flex gap-4 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {RESTAURANT_CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => navigate(ROUTES.CLIENT_CATEGORY.replace(':category', c.value))}
            className="focus-ring flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-[0.94] transition-transform rounded-full"
          >
            <div
              className={`touch-target w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                CATEGORY_COLORS[c.value] || 'bg-gray-50'
              }`}
            >
              {c.emoji}
            </div>
            <span className="text-xs text-gray-500">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
