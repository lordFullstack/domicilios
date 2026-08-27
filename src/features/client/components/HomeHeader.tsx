import { MapPin, ChevronDown } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { NotificationBell } from '@/shared/components/NotificationBell'

/**
 * Ubicación fija por ahora — la app solo cubre Riohacha y no existe todavía
 * un sistema de direcciones guardadas por usuario. El botón queda preparado
 * visualmente para abrir un Bottom Sheet de selección de dirección más
 * adelante (LOOP futuro), pero hoy no navega a ningún lado.
 */
const FIXED_LOCATION = 'Riohacha, La Guajira'

export const HomeHeader = () => {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="px-5 pt-6 pb-1">
      <div className="flex items-center justify-between mb-3">
        <button
          className="touch-target focus-ring flex items-center gap-1 -ml-2 px-2 rounded-xl active:scale-[0.97] transition-transform"
          aria-label={`Entregando en ${FIXED_LOCATION}`}
        >
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-xs text-gray-500">Entregar en</span>
          <span className="text-xs font-semibold text-secondary">{FIXED_LOCATION}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
        <NotificationBell />
      </div>

      <h1 className="font-display text-xl font-bold text-secondary">
        {firstName ? `¡Hola, ${firstName}! 👋` : 'Bienvenido 👋'}
      </h1>
      <p className="text-sm text-gray-500 mt-0.5">¿Qué quieres comer hoy?</p>
    </div>
  )
}
