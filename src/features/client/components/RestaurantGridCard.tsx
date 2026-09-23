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

  // role="button" debe responder a Enter Y Espacio como un <button> real.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return // no secuestrar el botón de favorito
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openRestaurant()
    }
  }

  // Contenedor real: no puede ser un <button> porque adentro hay otro
  // botón (favorito) — anidar <button> dentro de <button> es HTML
  // inválido y hacía que el lector de pantalla/el árbol de accesibilidad
  // no pudiera resolver un nombre para ninguno de los dos.
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={isOpen ? restaurant.name : `${restaurant.name}, cerrado`}
      onClick={openRestaurant}
      onKeyDown={handleKeyDown}
      className="focus-ring text-left rounded-2xl overflow-hidden border border-gray-100 shadow-card active:scale-[0.98] transition-transform bg-white cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-primary/10">
        {restaurant.cover_url ? (
          <img
            src={supabaseImageUrl(restaurant.cover_url, { width: 400 })}
            alt={restaurant.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <ProductImage
            imageUrl={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            emojiClassName="w-full h-full flex items-center justify-center text-4xl"
          />
        )}

        <button
          type="button"
          onClick={handleFavorite}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label={fav ? `Quitar ${restaurant.name} de favoritos` : `Guardar ${restaurant.name} en favoritos`}
          aria-pressed={fav}
          disabled={pending}
          className="touch-target focus-ring absolute top-1 right-1 w-9 h-9 rounded-full glass flex items-center justify-center active:scale-[0.9] transition-transform"
        >
          <BrandIcon
            name="heart"
            size={18}
            variant={fav ? 'active' : 'line'}
            className={fav ? 'text-rose-600' : 'text-gray-500'}
          />
        </button>

        {!isOpen && (
          <div className="absolute bottom-1 left-1">
            <Badge variant="danger">Cerrado</Badge>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="font-display font-bold text-sm text-secondary truncate mb-1">
          {restaurant.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            {restaurant.rating_count > 0
              ? `${restaurant.rating_avg.toFixed(1)} (${restaurant.rating_count})`
              : 'Nuevo'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500 truncate">{restaurant.category}</p>
          {/* Tarifa real que fija el Admin (app_settings.delivery_fee). */}
          {isOpen && feeLabel && (
            <span
              className={`text-[10px] font-semibold flex-shrink-0 ${deliveryFee === 0 ? 'text-success-strong' : 'text-gray-600'}`}
            >
              {feeLabel}
            </span>
          )}
        </div>
      </div>
      <Toast message={toast} variant="error" />
    </div>
  )
}
