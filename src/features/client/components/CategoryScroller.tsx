import { useNavigate } from 'react-router-dom'
import { ROUTES, RESTAURANT_CATEGORIES } from '@/config/constants'

// Un color por categoría (puramente decorativo, igual que el mapa de
// colores por estado de OrderCard) — ayuda a escanear la fila más rápido
// que si todos los círculos fueran del mismo tono. Curado dentro de la
// familia cálida de marca en vez de los pasteles por defecto de Tailwind.
const CATEGORY_COLORS: Record<string, string> = {
  Pizza: 'bg-[#FDEDE3] text-[#C2470F]',
  Burgers: 'bg-[#FCE4E1] text-[#B8371F]',
  Sushi: 'bg-[#E6EEFB] text-[#2E3A8C]',
  Postres: 'bg-[#FBE8EE] text-[#B23A63]',
  Bebidas: 'bg-[#E7F3F1] text-[#0E7C6B]',
  Asados: 'bg-[#FDF1DC] text-[#B4700A]',
  Mariscos: 'bg-[#E5F3F6] text-[#0E7490]',
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
            key={c.value}
            onClick={() => navigate(ROUTES.CLIENT_CATEGORY.replace(':category', c.value))}
            className="focus-ring flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-[0.94] transition-transform rounded-full"
          >
            <div
              className={`touch-target w-14 h-14 rounded-full flex items-center justify-center ${
                CATEGORY_COLORS[c.value] || 'bg-gray-50 text-gray-500'
              }`}
            >
              <c.icon className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <span className="text-xs text-gray-500">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
