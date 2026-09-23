import { useNavigate } from 'react-router-dom'
import { Flame, UtensilsCrossed, Store } from 'lucide-react'
import { usePromotions } from '@/shared/hooks/usePromotions'
import { ROUTES } from '@/config/constants'
import { PromotionType } from '@/shared/types'
import { supabaseImageUrl } from '@/shared/utils/supabaseImage'

interface FeaturedSectionProps {
  type: Extract<PromotionType, 'featured_restaurant' | 'featured_product'>
  title: string
  /**
   * 'carousel' (default): franja horizontal — usado hoy para "Recomendados
   * para ti" (restaurantes).
   * 'promoGrid': grilla 2 columnas con badge tipo ribbon — usado para
   * "Platos que te pueden gustar", según la referencia visual aprobada.
   * El texto del badge todavía NO sale de Supabase (el modelo Promotion no
   * tiene un campo para eso) — es un placeholder fijo "🔥 Oferta" a
   * propósito, para revisar el diseño antes de construir esa lógica.
   */
  variant?: 'carousel' | 'promoGrid'
}

// Sección de promociones del Inicio del cliente — se usa dos veces:
// una para restaurantes destacados (carrusel), otra para productos
// destacados (grilla con badge).
export const FeaturedSection = ({ type, title, variant = 'carousel' }: FeaturedSectionProps) => {
  const { promotions, loading } = usePromotions(type)
  const navigate = useNavigate()

  if (loading || promotions.length === 0) return null

  const handleClick = (restaurantId?: string | null) => {
    if (restaurantId) {
      navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', restaurantId))
    }
  }

  if (variant === 'promoGrid') {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="font-display font-bold text-sm text-gray-700">{title}</h2>
          <button
            type="button"
            onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}
            className="focus-ring text-xs font-semibold text-primary rounded-lg"
          >
            Ver todas &gt;
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 px-5">
          {promotions.map((promo) => (
            <button
              type="button"
              key={promo.id}
              onClick={() => handleClick(promo.restaurant_id)}
              disabled={!promo.restaurant_id}
              className="relative text-left rounded-2xl overflow-hidden border border-gray-100 shadow-card active:scale-95 transition-transform"
            >
              <div className="aspect-[4/3] bg-primary/10 overflow-hidden flex items-center justify-center">
                {promo.image_url ? (
                  <img
                    src={supabaseImageUrl(promo.image_url, { width: 300, height: 225 })}
                    alt={promo.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed className="w-7 h-7 text-primary/40" strokeWidth={1.5} aria-hidden="true" />
                )}
              </div>
              <span className="absolute top-2 left-2 flex items-center gap-1 bg-coral text-white text-[10px] font-bold px-2 py-1 rounded-full">
                <Flame className="w-3 h-3" fill="currentColor" aria-hidden="true" />
                Oferta
              </span>
              <div className="p-3">
                <p className="font-semibold text-xs text-secondary line-clamp-2">{promo.title}</p>
                {promo.subtitle && (
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{promo.subtitle}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h2 className="font-display font-bold text-sm text-gray-700 mb-3 px-5">{title}</h2>
      <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide">
        {promotions.map((promo) => (
          <button
            type="button"
            key={promo.id}
            onClick={() => handleClick(promo.restaurant_id)}
            disabled={!promo.restaurant_id}
            className="flex-shrink-0 w-64 text-left rounded-2xl overflow-hidden border border-gray-100 shadow-card active:scale-95 transition-transform"
          >
            <div className="aspect-[4/3] bg-primary/10 overflow-hidden flex items-center justify-center">
              {promo.image_url ? (
                <img
                  src={supabaseImageUrl(promo.image_url, { width: 400, height: 300 })}
                  alt={promo.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : type === 'featured_product' ? (
                <UtensilsCrossed className="w-7 h-7 text-primary/40" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Store className="w-7 h-7 text-primary/40" strokeWidth={1.5} aria-hidden="true" />
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm text-secondary truncate">{promo.title}</p>
              {promo.subtitle && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{promo.subtitle}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
