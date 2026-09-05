interface OrdersBarChartProps {
  data: { label: string; count: number }[]
}

export const OrdersBarChart = ({ data }: OrdersBarChartProps) => {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div>
      <h2 className="text-lg font-bold text-secondary mb-4">📈 Pedidos por día (últimos 7 días)</h2>
      <div className="border border-gray-100 rounded-2xl p-5">
        {data.every((d) => d.count === 0) && (
          <p className="text-sm text-gray-500 text-center mb-4">Todavía no hay pedidos en este rango.</p>
        )}
        <div className="flex items-end justify-between gap-2 h-40">
          {data.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-xs font-semibold text-secondary">{d.count > 0 ? d.count : ''}</span>
              <div
                className="w-full max-w-[32px] bg-primary rounded-t-lg transition-all"
                style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 6 : 2)}%` }}
              />
              <span className="text-xs text-gray-500 capitalize">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
