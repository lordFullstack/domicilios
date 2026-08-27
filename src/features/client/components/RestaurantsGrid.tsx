import { Search, AlertTriangle } from 'lucide-react'
import { Restaurant } from '@/shared/types'
import { RestaurantGridCard } from './RestaurantGridCard'
import { RestaurantCardsSkeleton } from '@/shared/components/RestaurantCardsSkeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/Button'

interface RestaurantsGridProps {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export const RestaurantsGrid = ({ restaurants, loading, error, onRetry }: RestaurantsGridProps) => {
  return (
    <div>
      <h2 className="font-display font-bold text-sm text-gray-700 mb-3 px-5">
        Restaurantes cerca de ti
      </h2>

      {loading ? (
        <RestaurantCardsSkeleton />
      ) : error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Algo salió mal"
          description="No pudimos cargar los restaurantes."
          action={<Button variant="outline" onClick={onRetry}>Intentar nuevamente</Button>}
        />
      ) : restaurants.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-5">
          {restaurants.map((restaurant) => (
            <RestaurantGridCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No encontramos restaurantes"
          description="Prueba cambiando tu ubicación o revisa más tarde."
        />
      )}
    </div>
  )
}
