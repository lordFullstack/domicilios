import { useNavigate } from 'react-router-dom'
import { usePromotions } from '@/shared/hooks/usePromotions'
import { ROUTES } from '@/config/constants'
import { PromotionType } from '@/shared/types'

interface FeaturedSectionProps {
  type: Extract<PromotionType, 'featured_restaurant' | 'featured_product'>
  title: string
}

// Sección tipo carrusel horizontal ("Recomendados para ti") — se usa dos veces
// en el Inicio del cliente: una para restaurantes destacados, otra para productos.
export const FeaturedSection = ({ type, title }: FeaturedSectionProps) => {
  const { promotions, loading } = usePromotions(type)
  const navigate = useNavigate()

  if (loading || promotions.length === 0) return null

  const handleClick = (restaurantId?: string | null) => {
    if (restaurantId) {
      navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', restaurantId))
    }
  }

  return (
    <div className="mb-6">
      <h2 className="font-display font-bold text-sm text-gray-700 mb-3 px-5">{title}</h2>
      <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide">
        {promotions.map((promo) => (
          <button
            key={promo.id}
            onClick={() => handleClick(promo.restaurant_id)}
            disabled={!promo.restaurant_id}
            className="focus-ring flex-shrink-0 w-64 text-left rounded-2xl overflow-hidden border border-gray-100 shadow-card active:scale-95 transition-transform"
          >
            <div className="h-28 bg-primary/10 overflow-hidden flex items-center justify-center">
              {promo.image_url ? (
                <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{type === 'featured_product' ? '🍽️' : '🏪'}</span>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm text-secondary truncate">{promo.title}</p>
              {promo.subtitle && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{promo.subtitle}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
