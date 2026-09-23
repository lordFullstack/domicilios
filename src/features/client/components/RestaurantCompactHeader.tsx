import { useEffect, useRef } from 'react'
import { ChevronLeft, Star } from 'lucide-react'
import { Restaurant } from '@/shared/types'
import { ratingLabel } from './RestaurantHero'

interface RestaurantCompactHeaderProps {
  restaurant: Restaurant
  visible: boolean
  onBack: () => void
}

/**
 * Barra fija que aparece cuando el hero sale de pantalla: volver + nombre +
 * rating. Oculta, queda `inert` (ni foco ni lector) para que no haya dos
 * botones "Volver". El nombre NO es un segundo <h1> (el h1 está en el hero).
 * Alto fijo 3.5rem + safe-area: los chips del menú se pegan justo debajo.
 */
export const RestaurantCompactHeader = ({ restaurant, visible, onBack }: RestaurantCompactHeaderProps) => {
  const ref = useRef<HTMLDivElement>(null)
  // `inert` por DOM: los tipos de React instalados todavía no lo incluyen.
  useEffect(() => {
    ref.current?.toggleAttribute('inert', !visible)
  }, [visible])

  return (
    <div
      ref={ref}
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-30 mx-auto max-w-md bg-white/95 backdrop-blur shadow-sm pt-[env(safe-area-inset-top)] transition-opacity duration-150 motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="touch-target focus-ring flex items-center justify-center rounded-full active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-secondary" aria-hidden="true" />
        </button>
        <p className="min-w-0 flex-1 truncate font-display font-bold text-secondary">{restaurant.name}</p>
        <p className="flex flex-shrink-0 items-center gap-1 pr-2 text-xs font-semibold text-gray-600">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
          <span className="sr-only">{ratingLabel(restaurant)}</span>
          <span aria-hidden="true">
            {restaurant.rating_count > 0 ? restaurant.rating_avg.toFixed(1) : 'Nuevo'}
          </span>
        </p>
      </div>
    </div>
  )
}
