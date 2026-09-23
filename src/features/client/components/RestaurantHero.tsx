import { ChevronLeft, Star } from 'lucide-react'
import { Icon as BrandIcon } from '@/shared/icons'
import { Restaurant } from '@/shared/types'
import { Badge } from '@/shared/components/Badge'
import { ProductImage } from '@/shared/components/ProductImage'
import { ImageOverlay } from '@/shared/components/ImageOverlay'
import { useDeliveryFee, deliveryFeeLabel } from '@/shared/hooks/useDeliveryFee'
import { supabaseImageUrl } from '@/shared/utils/supabaseImage'

interface RestaurantHeroProps {
  restaurant: Restaurant
  isOpen: boolean
  isFavorite: boolean
  favPending: boolean
  onBack: () => void
  onToggleFavorite: () => void
}

export const ratingLabel = (r: Restaurant) =>
  r.rating_count > 0
    ? `Calificación ${r.rating_avg.toFixed(1)} de 5, ${r.rating_count} ${r.rating_count === 1 ? 'reseña' : 'reseñas'}`
    : 'Restaurante nuevo, sin calificaciones'

/**
 * Hero del detalle — info del restaurante integrada al banner (overlay).
 * Gradiente/scrim sin cambios (regla de CLIENT_01/03). El "logo" repite la
 * portada o el emoji: no existe logo_url en el modelo.
 */
export const RestaurantHero = ({
  restaurant,
  isOpen,
  isFavorite,
  favPending,
  onBack,
  onToggleFavorite,
}: RestaurantHeroProps) => {
  const feeLabel = deliveryFeeLabel(useDeliveryFee().fee)
  return (
    <div className="relative h-52 overflow-hidden bg-primary/10">
      {restaurant.cover_url ? (
        <img
          src={supabaseImageUrl(restaurant.cover_url, { width: 800, height: 416 })}
          alt={`Portada de ${restaurant.name}`}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      ) : (
        <ProductImage
          imageUrl={restaurant.image_url}
          alt=""
          emojiClassName="w-full h-full flex items-center justify-center text-7xl"
          fallbackIconSize={64}
        />
      )}
      {/* Scrim más denso en la mitad inferior: las portadas las sube cada
        restaurante y pueden traer texto propio que se mezclaba con el nombre. */}
      <ImageOverlay variant="bottom-gradient" />

      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="touch-target focus-ring absolute left-4 w-10 h-10 rounded-full glass flex items-center justify-center active:scale-90 transition-transform"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <ChevronLeft className="w-4 h-4 text-secondary" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onToggleFavorite}
        disabled={favPending}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite ? `Quitar ${restaurant.name} de favoritos` : `Guardar ${restaurant.name} en favoritos`
        }
        className="touch-target focus-ring absolute right-4 w-10 h-10 rounded-full glass flex items-center justify-center active:scale-90 transition-transform"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <BrandIcon
          name="heart"
          size={18}
          variant={isFavorite ? 'active' : 'line'}
          className={isFavorite ? 'text-rose-600' : 'text-secondary'}
        />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-end gap-2.5">
          <div
            aria-hidden="true"
            className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/70 bg-white flex items-center justify-center text-2xl shadow-md"
          >
            {restaurant.cover_url ? (
              <img
                src={supabaseImageUrl(restaurant.cover_url, { width: 96 })}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <ProductImage imageUrl={restaurant.image_url} alt="" />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-0.5">
            <h1 className="font-display text-lg font-bold text-white truncate drop-shadow">
              {restaurant.name}
            </h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white drop-shadow">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="sr-only">{ratingLabel(restaurant)}</span>
              <span aria-hidden="true">
                {restaurant.rating_count > 0
                  ? `${restaurant.rating_avg.toFixed(1)} (${restaurant.rating_count})`
                  : 'Nuevo'}
              </span>
              {feeLabel && <span className="text-white/80">· {feeLabel}</span>}
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={isOpen ? 'success' : 'danger'}>{isOpen ? 'Abierto' : 'Cerrado'}</Badge>
          <span className="text-xs text-white/80">{restaurant.category}</span>
        </div>
      </div>
    </div>
  )
}
