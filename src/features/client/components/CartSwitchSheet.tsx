import { BottomSheet } from '@/shared/components/BottomSheet'
import { Button } from '@/shared/components/Button'

interface CartSwitchSheetProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Confirmación al mezclar productos de otro restaurante: el carrito solo
 * soporta un restaurante a la vez (ver CartContext).
 */
export const CartSwitchSheet = ({ open, onCancel, onConfirm }: CartSwitchSheetProps) => (
  <BottomSheet open={open} onClose={onCancel} title="¿Cambiar de restaurante?">
    <p className="text-sm text-gray-500 mb-5">
      Tu carrito tiene productos de otro restaurante. Si continúas, vamos a vaciarlo y agregar este
      producto en su lugar.
    </p>
    <div className="flex gap-3">
      <Button variant="outline" onClick={onCancel} className="flex-1">
        Cancelar
      </Button>
      <Button onClick={onConfirm} className="flex-1">
        Vaciar y agregar
      </Button>
    </div>
  </BottomSheet>
)
