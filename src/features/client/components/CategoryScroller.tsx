import { useNavigate } from 'react-router-dom'
import { ROUTES, RESTAURANT_CATEGORIES } from '@/config/constants'
import { Icon, Drop, CATEGORY_ICON, CATEGORY_DROP_CLASS } from '@/shared/icons'

/**
 * Búsqueda rápida por categoría — cada botón navega a CategoryResultsPage.
 * Mismo mecanismo que ya existía en ClientDashboardPage, solo se extrajo
 * a su propio componente y se le subió el touch target.
 */
export const CategoryScroller = () => {
  const navigate = useNavigate()

  return (
    <div className="mb-8">
      <h2 className="font-display text-lg font-bold text-secondary mb-4 px-5">Categorías</h2>
      {/* Máscara de desvanecido a la derecha: con 7 categorías la fila no
          entra completa en pantalla, y sin esta señal la última (Mariscos)
          pasaba inadvertida hasta hacer scroll a ciegas. */}
      <div
        className="flex gap-4 px-5 pb-1 overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,black_90%,transparent_100%)]"
      >
        {RESTAURANT_CATEGORIES.map((c) => (
          <button
            type="button"
            key={c.value}
            aria-label={`Categoría ${c.label}`}
            onClick={() => navigate(ROUTES.CLIENT_CATEGORY.replace(':category', c.value))}
            className="focus-ring flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-[0.94] transition-transform motion-reduce:transition-none rounded-2xl"
          >
            {/* Gota de color por categoría (iconografía propia). */}
            <Drop size={56} className={CATEGORY_DROP_CLASS[c.value]}>
              <Icon name={CATEGORY_ICON[c.value]} size={26} />
            </Drop>
            <span className="text-xs text-gray-500">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
