import { useRestaurants } from '@/hooks/useLocalData'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Star, Clock } from 'lucide-react'
import { BottomNav } from '@/shared/components/BottomNav'
import { ROUTES } from '@/config/constants'

export const RestaurantListPage = () => {
  const navigate = useNavigate()
  const { restaurants, loading } = useRestaurants()

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-6 flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(ROUTES.CLIENT_HOME)}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-secondary">Restaurantes</h1>
      </div>

      {/* Contenido */}
      <div className="px-5">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Cargando restaurantes...</p>
        ) : restaurants.length > 0 ? (
          <div className="flex flex-col gap-4">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => navigate(ROUTES.CLIENT_RESTAURANT.replace(':id', restaurant.id))}
                className="text-left rounded-2xl overflow-hidden border border-gray-100 shadow-card active:scale-95 transition-transform"
              >
                <div className="h-28 flex items-center justify-center text-5xl bg-orange-50">
                  {restaurant.image_url}
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-sm text-secondary mb-1">
                    {restaurant.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      4.8
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      25-35 min
                    </span>
                    <span className={restaurant.status === 'open' ? 'text-green-600' : 'text-red-500'}>
                      {restaurant.status === 'open' ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No hay restaurantes disponibles</p>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
