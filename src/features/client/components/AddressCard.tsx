import { ChevronRight } from 'lucide-react'
import { Icon as BrandIcon } from '@/shared/icons'
import { AddressDraft } from './AddressSheet'

interface AddressCardProps {
  draft: AddressDraft
  onEdit: () => void
}

export const AddressCard = ({ draft, onEdit }: AddressCardProps) => {
  const hasAddress = draft.street.trim().length > 0

  if (!hasAddress) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="focus-ring w-full text-left border-2 border-dashed border-gray-200 rounded-2xl p-4 active:scale-[0.98] transition-transform"
      >
        <p className="font-display font-bold text-sm text-secondary mb-1 flex items-center gap-1.5">
          <BrandIcon name="pin" size="sm" className="text-primary" /> ¿Dónde entregamos?
        </p>
        <p className="text-xs text-gray-500 mb-2">
          Agrega una dirección para continuar con tu pedido.
        </p>
        <span className="text-sm font-semibold text-primary">Agregar dirección →</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      className="focus-ring w-full text-left card-surface bg-white rounded-2xl p-4 flex items-start gap-3"
    >
      <BrandIcon name="pin" size="sm" className="text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-secondary truncate">
          {draft.street}
          {draft.complement ? `, ${draft.complement}` : ''}
        </p>
        <p className="text-xs text-gray-500">Riohacha, La Guajira</p>
      </div>
      <span className="flex items-center gap-0.5 text-xs font-semibold text-primary flex-shrink-0">
        Cambiar <ChevronRight className="w-3 h-3" />
      </span>
    </button>
  )
}
