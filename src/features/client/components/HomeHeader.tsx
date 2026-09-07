import { MapPin, ChevronDown } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useLocationLabel } from '@/shared/hooks/useLocationLabel'
import { NotificationBell } from '@/shared/components/NotificationBell'

export const HomeHeader = () => {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]
  const { label: locationLabel, loading: locationLoading } = useLocationLabel()

  return (
    <div className="px-5 pt-6 pb-1">
      <div className="flex items-center justify-between mb-3">
        <button
          className="touch-target focus-ring flex items-center gap-1 -ml-2 px-2 rounded-xl active:scale-[0.97] transition-transform"
          aria-label={`Entregando en ${locationLabel}`}
        >
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-xs text-gray-500">Entregar en</span>
          <span className="text-xs font-semibold text-secondary">
            {locationLoading ? 'Ubicando...' : locationLabel}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
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
