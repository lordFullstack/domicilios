import { Restaurant } from '@/shared/types'
import { RESTAURANT_GRID_CLASSES } from '@/shared/constants/grid'
import { RestaurantGridCard } from './RestaurantGridCard'

interface RestaurantGridProps {
  restaurants: Restaurant[]
}

/**
 * Solo la lista (sin título, estados ni CTAs): la comparten el Home
 * (RestaurantsGrid) y Restaurantes (RestaurantListPage), así ambos usan
 * exactamente el mismo grid que el skeleton.
 * role="list" explícito: Safari/VoiceOver quita la semántica de lista a
 * los <ul> con list-style: none (que es lo que pone el preflight).
 */
export const RestaurantGrid = ({ restaurants }: RestaurantGridProps) => (
  <ul role="list" className={RESTAURANT_GRID_CLASSES}>
    {restaurants.map((restaurant) => (
      <li key={restaurant.id}>
        <RestaurantGridCard restaurant={restaurant} />
      </li>
    ))}
  </ul>
)
