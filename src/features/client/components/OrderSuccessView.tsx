import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { formatCOP } from '@/shared/utils/money'

interface OrderSuccessViewProps {
  orderId: string
  restaurantName: string
  total: number
  onViewOrder: () => void
  onKeepShopping: () => void
}

export const OrderSuccessView = ({
  orderId,
  restaurantName,
  total,
  onViewOrder,
  onKeepShopping,
}: OrderSuccessViewProps) => (
  <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center px-8 text-center safe-top safe-bottom">
    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
      <CheckCircle2 className="w-8 h-8 text-success" />
    </div>
    <h1 className="font-display text-xl font-bold text-secondary mb-1">¡Pedido confirmado!</h1>
    <p className="text-sm text-gray-500 mb-6">
      Pedido #{orderId.substring(0, 8).toUpperCase()}
    </p>

    <div className="w-full border border-gray-100 rounded-2xl p-4 mb-8">
      <p className="text-xs text-gray-500 mb-1">Restaurante</p>
      <p className="font-semibold text-secondary mb-3">{restaurantName}</p>
      <p className="text-xs text-gray-500 mb-1">Total</p>
      <p className="font-display font-bold text-lg text-primary">{formatCOP(total)}</p>
    </div>

    <Button fullWidth size="lg" onClick={onViewOrder} className="mb-3">
      Ver pedido
    </Button>
    <Button fullWidth variant="ghost" onClick={onKeepShopping}>
      Seguir comprando
    </Button>
  </div>
)
