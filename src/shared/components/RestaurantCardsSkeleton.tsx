import { Skeleton } from './Skeleton'
import { RESTAURANT_GRID_CLASSES } from '@/shared/constants/grid'

interface RestaurantCardsSkeletonProps {
  count?: number
}

/**
 * Grid de skeletons con la misma geometría que RestaurantGridCard
 * (aspect-[4/3] + dos líneas de texto) y las mismas clases de grid, para
 * que no haya salto de layout cuando llegan los datos reales. Usado por el
 * Home y por Restaurantes.
 */
export const RestaurantCardsSkeleton = ({ count = 4 }: RestaurantCardsSkeletonProps) => (
  <div role="status" aria-label="Cargando restaurantes" className={RESTAURANT_GRID_CLASSES}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} aria-hidden="true">
        <Skeleton className="aspect-[4/3] rounded-2xl mb-2" />
        <Skeleton className="h-3 w-3/4 rounded mb-1" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    ))}
  </div>
)
