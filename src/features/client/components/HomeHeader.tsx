import { useMemo } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { NotificationBell } from '@/shared/components/NotificationBell'
import { RocketMark } from '@/shared/components/RocketMark'
import { formatFirstName } from '@/shared/utils/format'
import { getDeliveryLabel } from '../utils/deliveryLabel'

export const HomeHeader = () => {
  const { user } = useAuth()
  const firstName = formatFirstName(user?.name?.trim().split(/\s+/)[0])
  // Se lee una vez por montaje: la dirección solo cambia en Checkout,
  // y volver al Home desde ahí vuelve a montar este componente.
  const deliveryLabel = useMemo(() => getDeliveryLabel(), [])

  return (
    // pt con safe-area: con status bar "black-translucent" (index.html) el
    // header quedaba debajo del notch en la app instalada en iPhone. En
    // pantallas sin notch sigue siendo 1.5rem (= pt-6 de antes).
    <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RocketMark variant="square" size={36} className="rounded-xl" />
          <div className="leading-tight">
            <p className="font-display font-bold text-base text-secondary">Domicilios</p>
            <p className="text-[11px] text-gray-500">Tu comida, más cerca</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      {/* Solo informativo: antes era un <button> sin onClick (el lector de
          pantalla anunciaba una acción que no existía). Elegir dirección
          desde el Home queda para un LOOP futuro; el chevron se conserva
          porque el layout de este LOOP está congelado. */}
      <p className="flex items-center gap-1 min-h-[48px] mb-3 text-xs">
        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
        <span className="text-gray-500">Entregar en</span>
        <span className="font-semibold text-secondary truncate">{deliveryLabel}</span>
        <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" aria-hidden="true" />
      </p>

      <h1 className="font-display text-xl font-bold text-secondary">
        {firstName ? `¡Hola, ${firstName}! ` : 'Bienvenido '}
        <span aria-hidden="true">👋</span>
      </h1>
      <p className="text-sm text-gray-500 mt-0.5">¿Qué quieres comer hoy?</p>
    </div>
  )
}
