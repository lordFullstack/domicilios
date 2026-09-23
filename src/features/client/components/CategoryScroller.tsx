import { useNavigate } from 'react-router-dom'
import { ROUTES, RESTAURANT_CATEGORIES } from '@/config/constants'

// Un color por categoría (puramente decorativo, igual que el mapa de
// colores por estado de OrderCard) — ayuda a escanear la fila más rápido.
// Los valores viven en tailwind.config.ts (colors.category), no aquí.
const CATEGORY_COLORS: Record<string, string> = {
  Pizza: 'bg-category-pizza-bg text-category-pizza-fg',
  Burgers: 'bg-category-burgers-bg text-category-burgers-fg',
  Sushi: 'bg-category-sushi-bg text-category-sushi-fg',
  Postres: 'bg-category-postres-bg text-category-postres-fg',
  Bebidas: 'bg-category-bebidas-bg text-category-bebidas-fg',
  Asados: 'bg-category-asados-bg text-category-asados-fg',
  Mariscos: 'bg-category-mariscos-bg text-category-mariscos-fg',
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
      {/* Máscara de desvanecido a la derecha: con 7 categorías la fila no
          entra completa en pantalla, y sin esta señal la última (Mariscos)
          pasaba inadvertida hasta hacer scroll a ciegas. */}
      <div
        className="flex gap-4 px-5 pb-4 overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,black_90%,transparent_100%)]"
      >
        {RESTAURANT_CATEGORIES.map((c) => (
          <button
            type="button"
            key={c.value}
            aria-label={`Categoría ${c.label}`}
            onClick={() => navigate(ROUTES.CLIENT_CATEGORY.replace(':category', c.value))}
            className="focus-ring flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-[0.94] transition-transform rounded-full"
          >
            <span
              aria-hidden="true"
              className={`touch-target w-14 h-14 rounded-full flex items-center justify-center ${
                CATEGORY_COLORS[c.value] || 'bg-gray-50 text-gray-500'
              }`}
            >
              <c.icon className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="text-xs text-gray-500">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
