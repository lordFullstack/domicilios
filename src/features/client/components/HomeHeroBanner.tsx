import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/config/constants'

// Banner fijo de descubrimiento — no depende de Supabase (a diferencia de
// PromoBanner/FeaturedSection, que sí muestran promociones reales del
// Admin). Es simplemente la puerta de entrada visual a "ver todos los
// restaurantes", con el mismo peso visual que en la referencia aprobada.
// El emoji reemplaza a una foto de stock: así no se rompe si no hay una
// imagen real de marca para esta pieza puntual.
export const HomeHeroBanner = () => {
  const navigate = useNavigate()

  return (
    <div className="mx-5 mb-6">
      <button
        onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}
        className="relative w-full text-left rounded-3xl overflow-hidden bg-brand-gradient p-5 pr-28 active:scale-[0.98] transition-transform shadow-floating"
      >
        <p className="font-display font-extrabold text-lg text-white leading-snug">
          Los mejores sabores en un solo lugar
        </p>
        <span className="inline-flex items-center gap-1.5 mt-4 bg-white text-primary font-semibold text-sm px-4 py-2 rounded-full">
          Explorar
          <ArrowRight className="w-4 h-4" />
        </span>

        <span
          className="absolute -right-4 -bottom-6 text-8xl opacity-90 pointer-events-none select-none"
          aria-hidden="true"
        >
          🍔
        </span>
      </button>
    </div>
  )
}
