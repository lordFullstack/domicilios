import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { useFavorites } from '@/hooks/useLocalData'
import { Restaurant } from '@/shared/types'
import { ROUTES } from '@/config/constants'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(isFavorite(restaurant.id))

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(restaurant.id)
    setIsFav(!isFav)
  }

  const handleClick = () => {
    navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', restaurant.id))
  }

  return (
    <Card
      hoverable
      onClick={handleClick}
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
    >
      {/* Imagen del restaurante */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl">
        {restaurant.image_url}
      </div>

      {/* Contenido */}
      <div className="mt-4">
        {/* Header con nombre y favorito */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
            <p className="text-sm text-gray-600">{restaurant.address}</p>
          </div>
          <button
            onClick={handleFavorite}
            className={`text-2xl ${isFav ? 'text-danger' : 'text-gray-300'} transition-colors`}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>

        {/* Información */}
        <div className="flex gap-2 mb-3 text-xs text-gray-600">
          {restaurant.status === 'open' ? (
            <span className="bg-success/10 text-success px-2 py-1 rounded">🟢 Abierto</span>
          ) : (
            <span className="bg-danger/10 text-danger px-2 py-1 rounded">🔴 Cerrado</span>
          )}
          <span className="bg-gray-100 px-2 py-1 rounded">📞 {restaurant.phone}</span>
        </div>

        {/* Botón */}
        <Button
          fullWidth
          variant={restaurant.status === 'open' ? 'primary' : 'outline'}
          disabled={restaurant.status === 'closed'}
          onClick={handleClick}
        >
          {restaurant.status === 'open' ? 'Ver menú' : 'Cerrado'}
        </Button>
      </div>
    </Card>
  )
}
