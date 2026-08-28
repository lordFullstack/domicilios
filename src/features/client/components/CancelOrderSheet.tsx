import { Button } from '@/shared/components/Button'
import { BottomSheet } from '@/shared/components/BottomSheet'

interface CancelOrderSheetProps {
  open: boolean
  cancelling: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export const CancelOrderSheet = ({ open, cancelling, error, onClose, onConfirm }: CancelOrderSheetProps) => (
  <BottomSheet open={open} onClose={onClose} title="¿Cancelar pedido?">
    <p className="text-sm text-gray-500 mb-4">Esta acción no se puede deshacer.</p>

    {error && (
      <div className="bg-red-50 text-danger text-sm font-semibold rounded-2xl p-3 mb-4">{error}</div>
    )}

    <div className="flex gap-3">
      <Button variant="outline" onClick={onClose} disabled={cancelling} className="flex-1">
        Volver
      </Button>
      <Button
        variant="secondary"
        onClick={onConfirm}
        loading={cancelling}
        disabled={cancelling}
        className="flex-1 !bg-danger"
      >
        {cancelling ? 'Cancelando...' : 'Cancelar pedido'}
      </Button>
    </div>
  </BottomSheet>
)
