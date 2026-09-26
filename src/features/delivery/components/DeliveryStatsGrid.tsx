import { Bike, Timer, Navigation, PackageCheck, type LucideIcon } from 'lucide-react'
import { Order } from '@/shared/types'

interface DeliveryStatsGridProps {
  /** Pedidos asignados a mí que aún no acepté. */
  assignedCount: number
  activeCount: number
  completedToday: Order[]
}

const Tile = ({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: string }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-3">
    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <p className="mt-2 font-display text-3xl font-bold leading-none tabular-nums text-secondary">{value}</p>
    <p className="mt-1 text-xs text-gray-500">{label}</p>
  </div>
)

/**
 * Resumen del día del domiciliario (tema noche): una tarjeta principal con las entregas de hoy y tres fichas
 * de estado. Solo cuenta lo que existe en el sistema: nada de ganancias, distancias ni tiempos inventados.
 */
export const DeliveryStatsGrid = ({ assignedCount, activeCount, completedToday }: DeliveryStatsGridProps) => (
  <div className="px-5 mb-5 flex flex-col gap-3">
    <section aria-label="Resumen de hoy" className="relative overflow-hidden rounded-3xl bg-pulse-gradient p-5 text-white">
      <p className="font-display text-sm font-semibold text-white">Entregas hoy</p>
      <p className="mt-1 font-display text-6xl font-extrabold leading-none tabular-nums">{completedToday.length}</p>
      <p className="mt-2 text-sm text-white">
        Por aceptar: <span className="tabular-nums">{assignedCount}</span> · En camino: <span className="tabular-nums">{activeCount}</span>
      </p>
      <Bike className="absolute -bottom-3 -right-2 h-28 w-28 text-white/20" aria-hidden="true" />
    </section>

    <div className="grid grid-cols-3 gap-2">
      <Tile icon={Timer} label="Por aceptar" value={assignedCount} tone="bg-warning/10 text-warning-strong" />
      <Tile icon={Navigation} label="En camino" value={activeCount} tone="bg-success/10 text-success-strong" />
      <Tile icon={PackageCheck} label="Entregadas hoy" value={completedToday.length} tone="bg-primary/10 text-primary" />
    </div>
  </div>
)
