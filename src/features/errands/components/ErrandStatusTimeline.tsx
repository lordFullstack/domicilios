import { Check } from 'lucide-react'
import type { ErrandStatus, ErrandType } from '../types'
import { errandStepIndex, errandTimelineSteps } from '../utils/errandStatus'

interface ErrandStatusTimelineProps {
  status: ErrandStatus
  type: ErrandType
  /** Hora de la última actualización real; se muestra solo junto al paso actual (no hay hora por paso). */
  updatedAt?: string
}

export const ErrandStatusTimeline = ({ status, type, updatedAt }: ErrandStatusTimelineProps) => {
  const steps = errandTimelineSteps(type)
  const current = errandStepIndex(status, type)
  const updatedTime = updatedAt ? new Date(updatedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : null

  return (
    <ol className="card-surface--flat mb-4 flex flex-col rounded-2xl bg-white p-4" aria-label="Progreso del Domi">
      {steps.map((step, index) => {
        const isDone = index < current || status === 'delivered'
        const isCurrent = index === current && status !== 'delivered'
        const isLast = index === steps.length - 1
        return (
          <li key={step.status} className="flex gap-3" aria-current={isCurrent ? 'step' : undefined}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  isDone ? 'bg-success' : isCurrent ? 'bg-domi ring-4 ring-domi/15' : 'bg-gray-100'
                }`}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-white" aria-hidden="true" />
                ) : (
                  <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`} aria-hidden="true">
                    {index + 1}
                  </span>
                )}
              </div>
              {!isLast && <div className={`min-h-[20px] w-0.5 flex-1 ${index < current || status === 'delivered' ? 'bg-success' : 'bg-gray-100'}`} />}
            </div>
            <div className="flex flex-1 items-center justify-between pb-5">
              <p className={`text-sm ${isDone || isCurrent ? 'font-semibold text-secondary' : 'text-gray-500'}`}>{step.label}</p>
              {isCurrent && updatedTime && <span className="text-xs tabular-nums text-gray-500">{updatedTime}</span>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
