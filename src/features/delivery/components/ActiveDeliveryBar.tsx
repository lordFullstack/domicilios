import { Button } from '@/shared/components/Button'

interface ActiveDeliveryBarProps {
  restaurantName?: string
  loading: boolean
  disabled: boolean
  onComplete: () => void
}

export const ActiveDeliveryBar = ({ restaurantName, loading, disabled, onComplete }: ActiveDeliveryBarProps) => (
  <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-5 pt-3 pb-4 safe-bottom z-30">
    <p className="text-xs text-gray-500 mb-2 truncate">
      Entrega actual · {restaurantName || 'Cargando...'}
    </p>
    <Button fullWidth size="lg" loading={loading} disabled={disabled} onClick={onComplete}>
      Marcar como entregada
    </Button>
  </div>
)
