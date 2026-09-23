import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/config/constants'
import { RocketMark } from '@/shared/components/RocketMark'

// Banner fijo de descubrimiento — no depende de Supabase (a diferencia de
// PromoBanner/FeaturedSection, que sí muestran promociones reales del
// Admin). Es simplemente la puerta de entrada visual a "ver todos los
// restaurantes", con el mismo peso visual que en la referencia aprobada.
// La marca de agua es el propio cohete de marca (variante transparente),
// no una foto de stock ni un emoji: no se rompe sin imagen real y refuerza
// la identidad en vez de sustituirla por un ícono genérico.
export const HomeHeroBanner = () => {
  const navigate = useNavigate()

  return (
    <div className="mx-5 mb-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}
        className="relative w-full text-left rounded-3xl overflow-hidden bg-brand-gradient p-5 pr-28 active:scale-[0.98] transition-transform shadow-floating"
      >
        <p className="font-display font-extrabold text-lg text-white leading-snug max-w-[70%]">
          Los mejores sabores en un solo lugar
        </p>
        <span className="inline-flex items-center gap-1.5 mt-4 bg-white text-brand-700 font-semibold text-sm px-4 py-2 rounded-full">
          Explorar
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </span>

        <RocketMark
          variant="icon"
          size={128}
          className="absolute -right-5 -bottom-7 opacity-25 rotate-12 animate-float pointer-events-none select-none"
        />
      </button>
    </div>
  )
}
