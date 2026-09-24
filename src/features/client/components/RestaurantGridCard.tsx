import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Icon as BrandIcon } from '@/shared/icons'
import { Restaurant } from '@/shared/types'
import { ProductImage } from '@/shared/components/ProductImage'
import { supabaseImageUrl } from '@/shared/utils/supabaseImage'
import { Badge } from '@/shared/components/Badge'
import { Toast } from '@/shared/components/Toast'
import { useDeliveryFee, deliveryFeeLabel } from '@/shared/hooks/useDeliveryFee'
import { useFavorites } from '@/hooks/useLocalData'
import { ROUTES } from '@/config/constants'

interface RestaurantGridCardProps {
  restaurant: Restaurant
}

export const RestaurantGridCard = ({ restaurant }: RestaurantGridCardProps) => {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [pending, setPending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const isOpen = restaurant.status === 'open'

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pending) return
    setPending(true)
    const ok = await toggleFavorite(restaurant.id)
    setPending(false)
    if (!ok) {
      setToast('No pudimos guardar tu favorito')
      setTimeout(() => setToast(null), 2500)
    }
  }

  const openRestaurant = () => navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', restaurant.id))
  const fav = isFavorite(restaurant.id)
  const { fee: deliveryFee } = useDeliveryFee()
  const feeLabel = deliveryFeeLabel(deliveryFee)

  // <article> con DOS interactivos HERMANOS (nunca anidados): el botón
  // principal que abre el restaurante y el corazón de favoritos, superpuesto
  // en la esquina de la foto. Antes era un <div role="button"> que contenía
  // otro <button> (interactivo dentro de interactivo).
  return (
    <article className="card-surface overflow-hidden rounded-3xl bg-white">
      <button
        type="button"
        onClick={openRestaurant}
        aria-label={isOpen ? restaurant.name : `${restaurant.name}, cerrado`}
        className="focus-ring block w-full rounded-3xl text-left"
      >
        <span className="relative block aspect-video bg-primary/10">
          {restaurant.cover_url ? (
            <img
              src={supabaseImageUrl(restaurant.cover_url, { width: 400, height: 225 })}
              alt={restaurant.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <ProductImage
              imageUrl={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              fallback="rocket"
              fallbackIconSize={32}
              emojiClassName="w-full h-full flex items-center justify-center text-4xl"
            />
          )}

          {!isOpen && (
            <span className="absolute bottom-2 left-2">
              <Badge variant="danger">Cerrado</Badge>
            </span>
          )}
        </span>

        <span className="block p-3">
          <span className="mb-1 block truncate font-display text-sm font-bold text-secondary">
            {restaurant.name}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 tabular-nums">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {restaurant.rating_count > 0
                ? `${restaurant.rating_avg.toFixed(1)} (${restaurant.rating_count})`
                : 'Nuevo'}
            </span>
          </span>
          <span className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-xs text-gray-500">{restaurant.category}</span>
            {/* Tarifa real que fija el Admin (app_settings.delivery_fee). */}
            {isOpen && feeLabel && (
              <span
                className={`flex-shrink-0 text-xs font-semibold ${deliveryFee === 0 ? 'text-success-strong' : 'text-gray-600'}`}
              >
                {feeLabel}
              </span>
            )}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={handleFavorite}
        aria-label={fav ? `Quitar ${restaurant.name} de favoritos` : `Guardar ${restaurant.name} en favoritos`}
        aria-pressed={fav}
        disabled={pending}
        className="touch-target focus-ring glass absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full active:scale-[0.9] transition-transform"
      >
        <BrandIcon
          name="heart"
          size={18}
          variant={fav ? 'active' : 'line'}
          className={fav ? 'text-rose-600' : 'text-gray-500'}
        />
      </button>
      <Toast message={toast} variant="error" />
    </article>
  )
}
