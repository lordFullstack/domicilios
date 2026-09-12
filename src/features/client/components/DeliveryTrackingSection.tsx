import { lazy, Suspense } from 'react'
import { Phone, MessageCircle, Bike } from 'lucide-react'

// Leaflet pesa ~155kB — antes se importaba directo, así que se descargaba
// en CADA apertura de un detalle de pedido (entregado, cancelado, etc.),
// aunque el mapa solo se muestra cuando el pedido está en camino. Con
// lazy(), solo se pide cuando este componente realmente se monta (el
// padre ya lo renderiza condicionalmente con isInDelivery).
const DeliveryLiveMap = lazy(() =>
  import('@/shared/components/DeliveryLiveMap').then((m) => ({ default: m.DeliveryLiveMap }))
)

interface DeliveryPerson {
  name: string
  avatar_url?: string | null
  vehicle_type?: string | null
  vehicle_plate?: string | null
  phone?: string | null
}

interface DeliveryTrackingSectionProps {
  deliveryPerson: DeliveryPerson | null
  liveLocation: { lat: number; lng: number; updatedAt: string } | null
}

// Solo se renderiza cuando la orden está `in_delivery` (lo decide el padre).
// Si no hay ubicación real todavía, se lo dice honestamente al usuario en
// vez de mostrar un mapa o domiciliario simulado.
export const DeliveryTrackingSection = ({ deliveryPerson, liveLocation }: DeliveryTrackingSectionProps) => (
  <div className="mb-4">
    <p className="font-display font-bold text-sm text-secondary mb-2">Tu domiciliario en camino</p>

    {deliveryPerson && (
      <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {deliveryPerson.avatar_url ? (
            <img
              src={deliveryPerson.avatar_url}
              alt={deliveryPerson.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-display font-bold text-gray-300">
              {deliveryPerson.name?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-secondary truncate">{deliveryPerson.name}</p>
          {deliveryPerson.vehicle_type && (
            <p className="flex items-center gap-1 text-xs text-gray-500 capitalize">
              <Bike className="w-3 h-3" />
              {deliveryPerson.vehicle_type}
              {deliveryPerson.vehicle_plate && ` · ${deliveryPerson.vehicle_plate}`}
            </p>
          )}
        </div>
        {deliveryPerson.phone && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`sms:${deliveryPerson.phone}`}
              aria-label={`Enviar mensaje a ${deliveryPerson.name}`}
              className="touch-target w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 text-secondary" />
            </a>
            <a
              href={`tel:${deliveryPerson.phone}`}
              aria-label={`Llamar a ${deliveryPerson.name}`}
              className="touch-target w-9 h-9 rounded-full bg-primary flex items-center justify-center"
            >
              <Phone className="w-4 h-4 text-white" />
            </a>
          </div>
        )}
      </div>
    )}

    {liveLocation ? (
      <Suspense
        fallback={
          <div className="bg-gray-50 rounded-2xl h-48 flex items-center justify-center">
            <p className="text-gray-500 text-xs">Cargando mapa...</p>
          </div>
        }
      >
        <DeliveryLiveMap lat={liveLocation.lat} lng={liveLocation.lng} updatedAt={liveLocation.updatedAt} />
      </Suspense>
    ) : (
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <p className="text-gray-500 text-xs">Esperando la ubicación del domiciliario...</p>
      </div>
    )}
  </div>
)
