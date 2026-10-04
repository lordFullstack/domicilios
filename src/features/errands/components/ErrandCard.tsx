import { ChevronRight } from 'lucide-react'
import { formatCOP } from '@/shared/utils/money'
import type { Errand } from '../types'
import {
  ERRAND_TYPE_EMOJI,
  ERRAND_TYPE_LABEL,
  errandAmountDue,
  errandStatusLabel,
  errandStatusTone,
  shortErrandId,
} from '../utils/errandStatus'

interface ErrandCardProps {
  errand: Errand
  onClick: () => void
}

/** Fila del historial "Domis" en Mis pedidos. */
export const ErrandCard = ({ errand, onClick }: ErrandCardProps) => {
  const date = new Date(errand.created_at)
  const when = `${date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · ${date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
  const due = errandAmountDue(errand)

  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left transition-transform active:scale-[0.98]"
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-domi-soft text-2xl" aria-hidden="true">
        {ERRAND_TYPE_EMOJI[errand.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-secondary">{ERRAND_TYPE_LABEL[errand.type]}</p>
        <p className="truncate text-xs text-gray-500">{errand.description}</p>
        <p className="mt-0.5 text-xs tabular-nums text-gray-500">
          #{shortErrandId(errand.id)} · {when}
        </p>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${errandStatusTone(errand.status)}`}>
          {errandStatusLabel(errand.status, errand.type)}
        </span>
        {due !== null && <span className="text-xs font-semibold tabular-nums text-secondary">{formatCOP(due)}</span>}
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
    </button>
  )
}
