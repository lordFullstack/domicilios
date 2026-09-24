import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Restaurant } from '@/shared/types'
import { RestaurantGrid } from './RestaurantGrid'
import { RestaurantCardsSkeleton } from '@/shared/components/RestaurantCardsSkeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ROUTES } from '@/config/constants'
import { EMPTY_COPY, ERROR_COPY } from '@/shared/constants/stateCopy'

interface RestaurantsGridProps {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export const RestaurantsGrid = ({ restaurants, loading, error, onRetry }: RestaurantsGridProps) => {
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 px-5">
        <h2 className="font-display text-lg font-bold text-secondary">Restaurantes cerca de ti</h2>
        {!loading && !error && restaurants.length > 0 && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}
            aria-label="Ver todos los restaurantes"
            className="focus-ring flex min-h-[44px] flex-shrink-0 items-center gap-1 rounded-lg text-sm font-semibold text-brand-700"
          >
            Ver todo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {loading ? (
        <RestaurantCardsSkeleton />
      ) : error ? (
        <ErrorState
          illustration={ERROR_COPY.restaurantsNetwork.illustration}
          title={ERROR_COPY.restaurantsNetwork.title}
          description={ERROR_COPY.restaurantsNetwork.description}
          retryLabel={ERROR_COPY.restaurantsNetwork.cta}
          onRetry={onRetry}
        />
      ) : restaurants.length > 0 ? (
        // El "Ver todo →" vive junto al título (un solo CTA hacia Restaurantes).
        <RestaurantGrid restaurants={restaurants} />
      ) : (
        <EmptyState
          illustration={EMPTY_COPY.noRestaurants.illustration}
          title={EMPTY_COPY.noRestaurants.title}
          description={EMPTY_COPY.noRestaurants.description}
        />
      )}
    </div>
  )
}
