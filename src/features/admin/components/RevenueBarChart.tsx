import { formatCOP } from '@/shared/utils/money'

interface RevenueBarChartProps {
  data: { label: string; revenue: number }[]
}

export const RevenueBarChart = ({ data }: RevenueBarChartProps) => {
  const max = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div>
      <h2 className="text-lg font-bold text-secondary mb-4">💵 Ventas por día (entregados)</h2>
      <div className="border border-gray-100 rounded-2xl p-5 overflow-x-auto">
        {data.every((d) => d.revenue === 0) && (
          <p className="text-sm text-gray-400 text-center mb-4">Todavía no hay ventas en este rango.</p>
        )}
        <div className="flex items-end justify-between gap-2 h-40 min-w-[280px]">
          {data.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-semibold text-secondary whitespace-nowrap">
                {d.revenue > 0 ? formatCOP(d.revenue) : ''}
              </span>
              <div
                className="w-full max-w-[32px] bg-success rounded-t-lg transition-all"
                style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue > 0 ? 6 : 2)}%` }}
              />
              <span className="text-xs text-gray-400 capitalize">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
