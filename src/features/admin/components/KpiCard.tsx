import { Card } from '@/shared/components/Card'

interface KpiCardProps {
  value: string | number
  label: string
  colorClass?: string
  span?: 'normal' | 'wide'
}

export const KpiCard = ({ value, label, colorClass = 'text-secondary', span = 'normal' }: KpiCardProps) => (
  <Card className={span === 'wide' ? 'col-span-2' : undefined}>
    <div className="text-center">
      <p className={`text-3xl font-display font-bold ${colorClass}`}>{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  </Card>
)
