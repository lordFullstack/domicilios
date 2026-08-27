import { Restaurant } from '@/shared/types'
import { RestaurantGridCard } from './RestaurantGridCard'
import { Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/Button'

interface RestaurantsGridProps {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

const GridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-5" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i}>
        <Skeleton className="aspect-[4/3] rounded-2xl mb-2" />
        <Skeleton className="h-3 w-3/4 rounded mb-1" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    ))}
  </div>
)

export const RestaurantsGrid = ({ restaurants, loading, error, onRetry }: RestaurantsGridProps) => {
  return (
    <div className="px-0">
      <h2 className="font-display font-bold text-sm text-gray-700 mb-3 px-5">
        Restaurantes cerca de ti
      </h2>

      {loading ? (
        <GridSkeleton />
      ) : error ? (
        <div className="text-center py-10 px-5">
          <p className="font-display font-bold text-secondary mb-1">Algo salió mal</p>
          <p className="text-sm text-gray-500 mb-4">No pudimos cargar los restaurantes.</p>
          <Button variant="outline" onClick={onRetry}>Intentar nuevamente</Button>
        </div>
      ) : restaurants.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-5">
          {restaurants.map((restaurant) => (
            <RestaurantGridCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-5">
          <p className="font-display font-bold text-secondary mb-1">No encontramos restaurantes</p>
          <p className="text-sm text-gray-500">
            Prueba cambiando tu ubicación o revisa más tarde.
          </p>
        </div>
      )}
    </div>
  )
}
