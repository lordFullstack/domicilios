import { formatCOP } from '@/shared/utils/money'

interface OrderSummaryCardProps {
  restaurantEmoji?: string
  restaurantName?: string
  itemCount: number
  total: number
  onViewDetails: () => void
}

export const OrderSummaryCard = ({
  restaurantEmoji,
  restaurantName,
  itemCount,
  total,
  onViewDetails,
}: OrderSummaryCardProps) => (
  <div className="border border-gray-100 rounded-2xl p-4 mb-4">
    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
      <span className="text-2xl">{restaurantEmoji}</span>
      <div>
        <p className="font-semibold text-sm text-secondary">{restaurantName}</p>
        <p className="text-xs text-gray-500">
          {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between mb-3">
      <span className="font-display font-bold text-secondary">Total</span>
      <span className="font-display font-bold text-lg text-primary">{formatCOP(total)}</span>
    </div>

    <button onClick={onViewDetails} className="focus-ring text-sm font-semibold text-primary">
      Ver detalles →
    </button>
  </div>
)
