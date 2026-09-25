import clsx from 'clsx'
import { Clock } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'

interface DeadlineCountdownProps {
  deadline?: string | null
  /** Texto antes del contador, p. ej. "Responde en". */
  prefix?: string
  className?: string
}

/**
 * Cuenta regresiva en texto (m:ss). Visualmente cambia cada segundo; para lectores de pantalla
 * solo se anuncia al inicio y en los últimos 10 s, no cada segundo (LOOP_FLOW_01, a11y).
 */
export const DeadlineCountdown = ({ deadline, prefix, className }: DeadlineCountdownProps) => {
  const { secondsLeft, expired, label } = useCountdown(deadline)
  if (secondsLeft === null) return null

  const urgent = secondsLeft <= 30
  const announce = secondsLeft <= 10 || secondsLeft % 60 === 0
  const spoken = expired ? 'Se acabó el tiempo' : `${prefix ?? 'Quedan'} ${secondsLeft} segundos`

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-sm font-semibold tabular-nums',
        urgent ? 'text-warning-strong' : 'text-gray-600',
        className
      )}
    >
      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
      <span aria-hidden="true">
        {prefix ? `${prefix} ` : ''}
        {label}
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {announce ? spoken : ''}
      </span>
    </span>
  )
}
