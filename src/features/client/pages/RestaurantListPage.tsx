import { useRestaurants } from '@/hooks/useLocalData'
import { RestaurantCard } from '../components/RestaurantCard'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'

export const RestaurantListPage = () => {
  const navigate = useNavigate()
  const { restaurants, loading } = useRestaurants()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(ROUTES.CLIENT_HOME)} className="mb-4 text-primary font-semibold hover:opacity-80">
            ← Atrás
          </button>
          <h1 className="text-3xl font-display font-bold text-secondary">🏪 Todos los Restaurantes</h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando restaurantes...</p>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay restaurantes disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}
