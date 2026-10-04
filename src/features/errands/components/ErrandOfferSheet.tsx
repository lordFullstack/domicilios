import { useState } from 'react'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { Button } from '@/shared/components/Button'
import { DeadlineCountdown } from '@/shared/components/DeadlineCountdown'
import { Input } from '@/shared/components/Input'
import { formatCOP } from '@/shared/utils/money'
import { useErrand, useErrandFileUrl, useErrandSettings } from '../hooks/useErrands'
import { ERRAND_TYPE_EMOJI, ERRAND_TYPE_LABEL } from '../utils/errandStatus'
import type { Errand } from '../types'

/** Tope de una cotización (el mismo que valida el servidor). */
const MAX_QUOTE = 100000

interface ErrandOfferSheetProps {
  errand: Errand | null
  open: boolean
  busy: boolean
  disabled: boolean
  onAccept: (errand: Errand) => void
  onQuote: (errand: Errand, amount: number, note: string) => void
  onReject: (errand: Errand) => void
  onClose: () => void
}

/** Oferta de un Domi: aceptar al precio mínimo, cotizar otro precio o rechazar. */
export const ErrandOfferSheet = ({ errand, open, busy, disabled, onAccept, onQuote, onReject, onClose }: ErrandOfferSheetProps) => {
  const { minFee } = useErrandSettings()
  const { quotes } = useErrand(open ? errand?.id : undefined)
  const photoUrl = useErrandFileUrl(open ? errand?.photo_url : null)
  const [quoting, setQuoting] = useState(false)
  const [amountText, setAmountText] = useState('')
  const [note, setNote] = useState('')

  if (!errand) return null

  const amount = Number(amountText.replace(/\D/g, '')) || 0
  const myQuotes = quotes.filter((q) => q.driver_id === errand.delivery_person_id)
  const lastRejected = [...myQuotes].reverse().find((q) => q.status === 'rejected')
  const canQuote = myQuotes.length < 2
  const amountError = amountText && (amount < minFee ? `El mínimo es ${formatCOP(minFee)}.` : amount > MAX_QUOTE ? `El máximo es ${formatCOP(MAX_QUOTE)}.` : null)
  const quoteReady = amount >= minFee && amount <= MAX_QUOTE && note.trim().length >= 3

  return (
    <BottomSheet open={open} onClose={onClose} title={`${ERRAND_TYPE_EMOJI[errand.type]} ${ERRAND_TYPE_LABEL[errand.type]}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-domi px-2.5 py-1 text-xs font-bold text-white dark:bg-pulse">🛵 DOMI</span>
          <DeadlineCountdown deadline={errand.accept_deadline} prefix="Responde en" />
        </div>

        {lastRejected && (
          <p className="rounded-xl bg-warning/10 p-3 text-sm text-gray-700" role="status">
            El cliente rechazó tu oferta de <strong>{formatCOP(lastRejected.amount)}</strong>: “{lastRejected.client_note}”
          </p>
        )}

        <Detail label="Mandado" value={errand.description} />
        {photoUrl && <img src={photoUrl} alt="Foto del pedido del cliente" className="h-32 w-full rounded-2xl object-cover" />}
        <Detail label={errand.type === 'purchase' ? 'Punto A · Comprar en' : 'Punto A · Recoger en'} value={errand.pickup_address} hint={errand.pickup_notes} />
        <Detail label="Punto B · Entregar en" value={errand.dropoff_address} hint={errand.dropoff_notes} />
        {errand.type === 'purchase' && errand.max_budget !== null && (
          <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
            Presupuesto máximo del cliente: <strong>{formatCOP(errand.max_budget)}</strong>. Adelantas la plata y el cliente te paga la factura + tu tarifa al recibir.
          </div>
        )}

        {quoting ? (
          <div className="flex flex-col gap-3">
            <Input
              label="Tu precio (tarifa del Domi)"
              inputMode="numeric"
              value={amount ? amount.toLocaleString('es-CO') : ''}
              onChange={(e) => setAmountText(e.target.value)}
              placeholder={`Mínimo ${formatCOP(minFee)}`}
              error={amountError || undefined}
            />
            <div>
              <label htmlFor="quote-note" className="mb-2 block text-sm font-medium text-gray-700">
                Nota para el cliente (obligatoria)
              </label>
              <textarea
                id="quote-note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 200))}
                rows={2}
                placeholder="Ej: Queda lejos y hay tráfico"
                className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button fullWidth size="lg" loading={busy} disabled={disabled || busy || !quoteReady} onClick={() => onQuote(errand, amount, note.trim())}>
              Enviar cotización
            </Button>
            <Button fullWidth variant="outline" disabled={busy} onClick={() => setQuoting(false)}>
              Volver
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button fullWidth size="lg" loading={busy} disabled={disabled || busy} onClick={() => onAccept(errand)}>
              Aceptar por {formatCOP(minFee)}
            </Button>
            {canQuote && (
              <Button fullWidth variant="outline" disabled={disabled || busy} onClick={() => setQuoting(true)}>
                Cotizar otro precio
              </Button>
            )}
            <Button fullWidth variant="outline" disabled={disabled || busy} onClick={() => onReject(errand)}>
              {lastRejected ? 'Soltar este Domi' : 'Rechazar'}
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

const Detail = ({ label, value, hint }: { label: string; value: string; hint?: string | null }) => (
  <div>
    <p className="mb-1 text-xs font-bold tracking-wide text-gray-500">{label.toUpperCase()}</p>
    <p className="text-sm font-semibold text-secondary">{value}</p>
    {hint && <p className="mt-0.5 text-xs italic text-gray-500">“{hint}”</p>}
  </div>
)
