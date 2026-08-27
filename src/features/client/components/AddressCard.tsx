import { MapPin, ChevronRight } from 'lucide-react'
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
        onClick={onEdit}
        className="focus-ring w-full text-left border-2 border-dashed border-gray-200 rounded-2xl p-4 active:scale-[0.98] transition-transform"
      >
        <p className="font-display font-bold text-sm text-secondary mb-1">📍 ¿Dónde entregamos?</p>
        <p className="text-xs text-gray-500 mb-2">
          Agrega una dirección para continuar con tu pedido.
        </p>
        <span className="text-sm font-semibold text-primary">Agregar dirección →</span>
      </button>
    )
  }

  return (
    <button
      onClick={onEdit}
      className="focus-ring w-full text-left border border-gray-100 rounded-2xl p-4 flex items-start gap-3 active:scale-[0.98] transition-transform"
    >
      <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-secondary truncate">
          {draft.street}
          {draft.complement ? `, ${draft.complement}` : ''}
        </p>
        <p className="text-xs text-gray-400">Riohacha, La Guajira</p>
      </div>
      <span className="flex items-center gap-0.5 text-xs font-semibold text-primary flex-shrink-0">
        Cambiar <ChevronRight className="w-3 h-3" />
      </span>
    </button>
  )
}
