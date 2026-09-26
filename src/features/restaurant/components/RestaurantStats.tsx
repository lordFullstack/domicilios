import { Clock, Flame, PackageCheck, Wallet, type LucideIcon } from 'lucide-react'
import { formatCOP } from '@/shared/utils/money'

interface RestaurantStatsProps {
  pending: number
  active: number
  deliveredToday: number
  revenueToday: number
}

const Stat = ({ icon: Icon, tone, label, children }: { icon: LucideIcon; tone: string; label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 px-3 py-2">
    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="font-display text-2xl font-bold leading-none tabular-nums text-secondary">{children}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  </div>
)

/** Métricas del día en una tarjeta blanca que se monta sobre la cabecera oscura. Solo datos reales del sistema. */
export const RestaurantStats = ({ pending, active, deliveredToday, revenueToday }: RestaurantStatsProps) => {
  const revenue = formatCOP(revenueToday)
  return (
    <section
      aria-label="Resumen de hoy"
      className="relative z-10 -mt-9 mx-5 mb-5 grid grid-cols-2 gap-y-1 rounded-3xl bg-white p-2 shadow-floating md:max-w-4xl md:mx-auto md:grid-cols-4"
    >
      <Stat icon={Clock} tone="bg-warning/10 text-warning-strong" label="Pendientes">{pending}</Stat>
      <Stat icon={Flame} tone="bg-primary/10 text-primary" label="Activas">{active}</Stat>
      <Stat icon={PackageCheck} tone="bg-success/10 text-success-strong" label="Entregadas hoy">{deliveredToday}</Stat>
      <Stat icon={Wallet} tone="bg-primary/10 text-primary" label="Ingresos hoy">
        <span className="text-xl">{revenue}</span>
      </Stat>
    </section>
  )
}
