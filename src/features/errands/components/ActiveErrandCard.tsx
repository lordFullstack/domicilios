import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '@/config/constants'
import type { Errand } from '../types'
import { ERRAND_TYPE_EMOJI, ERRAND_TYPE_LABEL, errandStatusLabel } from '../utils/errandStatus'

/** Home: acceso rápido al Domi en curso (si hay cotización por responder, se destaca). */
export const ActiveErrandCard = ({ errand }: { errand: Errand }) => {
  const navigate = useNavigate()
  const needsAnswer = errand.status === 'quoted'

  return (
    <div className="mb-6 px-5">
      <button
        type="button"
        onClick={() => navigate(ROUTES.DOMI_DETAIL.replace(':id', errand.id))}
        className={`focus-ring flex w-full items-center gap-3 rounded-3xl p-4 text-left transition-transform active:scale-[0.98] ${
          needsAnswer ? 'bg-warning/10 ring-2 ring-warning' : 'bg-domi-soft'
        }`}
      >
        <span className="text-2xl" aria-hidden="true">
          {ERRAND_TYPE_EMOJI[errand.type]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-secondary">{ERRAND_TYPE_LABEL[errand.type]} en curso</p>
          <p className="truncate text-xs text-gray-600">
            {needsAnswer ? 'Tienes una cotización por responder' : errandStatusLabel(errand.status, errand.type)}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
      </button>
    </div>
  )
}
