import { useState } from 'react'
import { Star } from 'lucide-react'
import { Avatar } from '@/shared/components/Avatar'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { Button } from '@/shared/components/Button'
import { DeadlineCountdown } from '@/shared/components/DeadlineCountdown'
import { formatCOP } from '@/shared/utils/money'
import type { PublicProfile } from '../hooks/useErrands'
import type { ErrandQuote } from '../types'

interface QuoteCardProps {
  quote: ErrandQuote
  driver: PublicProfile | null
  /** Plazo del cliente para responder (errand.accept_deadline mientras está `quoted`). */
  deadline: string | null
  busy: boolean
  error: string | null
  onApprove: () => void
  onReject: (note: string) => void
}

/** El domi propuso otro precio: el cliente lo aprueba o lo rechaza con una nota obligatoria. */
export const QuoteCard = ({ quote, driver, deadline, busy, error, onApprove, onReject }: QuoteCardProps) => {
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const noteOk = note.trim().length >= 3

  return (
    <section className="mb-4 rounded-3xl border-2 border-warning bg-warning/10 p-4" aria-label="Cotización del Domi">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-display text-sm font-bold text-secondary">Tu Domi te hizo una oferta</p>
        <DeadlineCountdown deadline={deadline} prefix="Responde en" />
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Avatar src={driver?.avatar_url} name={driver?.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-secondary">{driver?.name ?? 'Tu Domi'}</p>
          {driver && driver.rating_count > 0 && (
            <p className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="tabular-nums">{Number(driver.rating_avg).toFixed(1)}</span>
              <span className="text-gray-500">({driver.rating_count})</span>
            </p>
          )}
        </div>
        <p className="font-display text-xl font-bold tabular-nums text-secondary">{formatCOP(quote.amount)}</p>
      </div>

      <p className="mb-4 rounded-2xl bg-white p-3 text-sm text-gray-700">“{quote.driver_note}”</p>

      {error && (
        <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="tertiary" className="flex-1" disabled={busy} onClick={() => setRejecting(true)}>
          Rechazar
        </Button>
        <Button variant="gradient" className="flex-1" loading={busy} disabled={busy} onClick={onApprove}>
          Aprobar {formatCOP(quote.amount)}
        </Button>
      </div>

      <BottomSheet open={rejecting} onClose={() => setRejecting(false)} title="¿Por qué rechazas el precio?">
        <p className="-mt-2 mb-3 text-sm text-gray-500">Tu Domi verá tu nota y podrá ajustar su precio una vez más.</p>
        <textarea
          aria-label="Nota para tu Domi"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          rows={3}
          placeholder="Ej: Es muy cerca, ¿lo dejas en $6.000?"
          className="mb-4 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-3">
          <Button variant="tertiary" className="flex-1" onClick={() => setRejecting(false)}>
            Volver
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={!noteOk || busy}
            loading={busy}
            onClick={() => {
              onReject(note.trim())
              setRejecting(false)
              setNote('')
            }}
          >
            Rechazar oferta
          </Button>
        </div>
      </BottomSheet>
    </section>
  )
}
