import { Skeleton } from './Skeleton'

interface RestaurantCardsSkeletonProps {
  count?: number
}

/**
 * Grid de skeletons con la misma geometría que RestaurantGridCard
 * (aspect-[4/3] + dos líneas de texto), para que no haya salto de layout
 * cuando llegan los datos reales. Usado por el Home (LOOP 02) y por
 * Explorar (LOOP 03) — antes vivía duplicado dentro de RestaurantsGrid.
 */
export const RestaurantCardsSkeleton = ({ count = 4 }: RestaurantCardsSkeletonProps) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-5" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <Skeleton className="aspect-[4/3] rounded-2xl mb-2" />
        <Skeleton className="h-3 w-3/4 rounded mb-1" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    ))}
  </div>
)
