import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { NotificationBell } from '@/shared/components/NotificationBell'
import { Icon, Drop } from '@/shared/icons'
import { formatFirstName } from '@/shared/utils/format'
import { getDeliveryLabel } from '../utils/deliveryLabel'

interface HomeHeaderProps {
  /**
   * true (default): h1 visible con el saludo y "¿Qué quieres comer hoy?".
   * false: sin saludo visible; el h1 sigue existiendo pero solo para lectores
   * de pantalla ("Inicio") — p. ej. cuando hay un pedido activo y ese
   * pedido es el protagonista de la pantalla.
   */
  showGreeting?: boolean
}

export const HomeHeader = ({ showGreeting = true }: HomeHeaderProps) => {
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Logo: cohete de marca sobre gota azul (iconografía propia). */}
          <Drop size={36} className="bg-brand-700 text-white">
            <Icon name="rocket" size={22} variant="onDark" />
          </Drop>
          <div className="leading-tight">
            <p className="font-display font-bold text-base text-secondary">Domicilios</p>
            <p className="text-xs text-gray-500">Tu comida, más cerca</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      {/* Solo informativo: no es un control (antes era un <button> sin
          onClick). El chevron se conserva como señal de la función futura,
          pero es decorativo: aria-hidden y sin aria-label, para no anunciar
          una acción que no existe. */}
      {/* TODO(LOOP_CLIENT_06): selector de dirección de entrega desde el Home.
          Cuando exista, esta línea pasa a ser un <button> con su aria-label. */}
      <p className="flex items-center gap-1 py-1 mb-4 text-xs">
        <Icon name="pin" size={16} className="text-primary flex-shrink-0" />
        <span className="text-gray-500">Entregar en</span>
        <span className="font-semibold text-secondary truncate">{deliveryLabel}</span>
        <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" aria-hidden="true" />
      </p>

      {showGreeting ? (
        <>
          <h1 className="font-display text-display font-extrabold text-secondary line-clamp-2">
            {firstName ? `¡Hola, ${firstName}! ` : 'Bienvenido '}
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">¿Qué quieres comer hoy?</p>
        </>
      ) : (
        <h1 className="sr-only">Inicio</h1>
      )}
    </div>
  )
}
