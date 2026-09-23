import { useNavigate } from 'react-router-dom'
import { Search, AlertTriangle, ArrowRight } from 'lucide-react'
import { Restaurant } from '@/shared/types'
import { RestaurantGrid } from './RestaurantGrid'
import { RestaurantCardsSkeleton } from '@/shared/components/RestaurantCardsSkeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/Button'
import { ROUTES } from '@/config/constants'

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
      <h2 className="font-display font-bold text-sm text-gray-700 mb-3 px-5">
        Restaurantes cerca de ti
      </h2>

      {loading ? (
        <RestaurantCardsSkeleton />
      ) : error ? (
        <EmptyState
          role="alert"
          icon={AlertTriangle}
          title="Algo salió mal"
          description="No pudimos cargar los restaurantes."
          action={<Button variant="tertiary" onClick={onRetry}>Intentar nuevamente</Button>}
        />
      ) : restaurants.length > 0 ? (
        <>
          <RestaurantGrid restaurants={restaurants} />
          {/* Cierre del scroll: sin esto la lista terminaba en una tarjeta
              plana sin ninguna invitación a seguir explorando. */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.CLIENT_RESTAURANTS)}
            className="focus-ring w-full flex items-center justify-center gap-1.5 mt-4 mb-2 text-sm font-semibold text-primary"
          >
            Ver todos los restaurantes de Riohacha
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </>
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
