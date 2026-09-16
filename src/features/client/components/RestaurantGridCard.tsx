import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Heart } from 'lucide-react'
import { Restaurant } from '@/shared/types'
import { ProductImage } from '@/shared/components/ProductImage'
import { Badge } from '@/shared/components/Badge'
import { useFavorites } from '@/hooks/useLocalData'
import { ROUTES } from '@/config/constants'

interface RestaurantGridCardProps {
  restaurant: Restaurant
}

export const RestaurantGridCard = ({ restaurant }: RestaurantGridCardProps) => {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [pending, setPending] = useState(false)
  const isOpen = restaurant.status === 'open'

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pending) return
    setPending(true)
    await toggleFavorite(restaurant.id)
    setPending(false)
  }

  const openRestaurant = () => navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', restaurant.id))

  // Contenedor real: no puede ser un <button> porque adentro hay otro
  // botón (favorito) — anidar <button> dentro de <button> es HTML
  // inválido y hacía que el lector de pantalla/el árbol de accesibilidad
  // no pudiera resolver un nombre para ninguno de los dos.
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={restaurant.name}
      onClick={openRestaurant}
      onKeyDown={(e) => e.key === 'Enter' && openRestaurant()}
      className="focus-ring text-left rounded-2xl overflow-hidden border border-gray-100 shadow-card active:scale-[0.98] transition-transform bg-white cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-primary/10">
        {restaurant.cover_url ? (
          <img
            src={restaurant.cover_url}
            alt={restaurant.name}
            loading="lazy"
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
          onClick={handleFavorite}
          aria-label={isFavorite(restaurant.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          disabled={pending}
          className="touch-target focus-ring absolute top-1 right-1 w-9 h-9 rounded-full glass flex items-center justify-center active:scale-[0.9] transition-transform"
        >
          <Heart
            className="w-4 h-4"
            fill={isFavorite(restaurant.id) ? '#E11D48' : 'none'}
            color={isFavorite(restaurant.id) ? '#E11D48' : '#6B7280'}
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
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {restaurant.rating_count > 0
              ? `${restaurant.rating_avg.toFixed(1)} (${restaurant.rating_count})`
              : 'Nuevo'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500 truncate">{restaurant.category}</p>
          {/* "Envío gratis" es consistente con Carrito/Checkout: el negocio
              no cobra domicilio hoy (no hay campo delivery_fee en el
              modelo), así que no es un dato inventado por pantalla. */}
          {isOpen && <span className="text-[10px] font-semibold text-success flex-shrink-0">Envío gratis</span>}
        </div>
      </div>
    </div>
  )
}
