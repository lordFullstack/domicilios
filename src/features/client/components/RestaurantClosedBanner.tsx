import { Clock } from 'lucide-react'

/**
 * Sin hora de apertura: `restaurants.status` es solo open/closed, no
 * existen horarios en el modelo. No se inventa "Abre a las 11:00".
 */
export const RestaurantClosedBanner = () => (
  <div
    role="status"
    className="mx-5 mt-4 flex items-start gap-3 rounded-2xl bg-warning/10 px-4 py-3 text-sm text-warning-strong"
  >
    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
    <p>
      <span className="font-semibold">Cerrado por ahora.</span> Puedes ver el menú, pero no hacer pedidos.
    </p>
  </div>
)
