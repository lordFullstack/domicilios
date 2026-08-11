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

  const isOpen = restaurant.status === 'open'

  return (
    <Card
      hoverable
      onClick={handleClick}
      className="!p-0 overflow-hidden cursor-pointer transition-all hover:shadow-lg"
    >
      {/* Imagen con badges superpuestos */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl">
        <span>{restaurant.image_url}</span>

        <span
          className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${
            isOpen ? 'bg-success text-white' : 'bg-danger text-white'
          }`}
        >
          {isOpen ? '🟢 Abierto' : '🔴 Cerrado'}
        </span>

        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-base shadow-sm"
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 leading-snug">{restaurant.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>

        <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">📞 {restaurant.phone}</span>
        </div>

        <Button
          fullWidth
          variant={isOpen ? 'primary' : 'outline'}
          disabled={!isOpen}
          onClick={handleClick}
        >
          {isOpen ? 'Ver menú' : 'Cerrado'}
        </Button>
      </div>
    </Card>
  )
}
