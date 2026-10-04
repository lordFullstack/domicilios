import { useEffect, useRef, useState } from 'react'
import { Banknote, MapPin, MapPinOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { DeadlineCountdown } from '@/shared/components/DeadlineCountdown'
import { Toast } from '@/shared/components/Toast'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { formatCOP } from '@/shared/utils/money'
import {
  deliveryAcceptErrand,
  deliveryCompleteErrand,
  deliveryErrandPickedUp,
  deliveryQuoteErrand,
  deliveryRejectErrand,
  deliveryStartErrandDelivery,
  deliveryUpdateErrandLocation,
  errandFilePath,
  uploadErrandFile,
  type ErrandActionResult,
} from '../services/errandActions.service'
import { useMyErrands } from '../hooks/useErrands'
import { ERRAND_TYPE_EMOJI, ERRAND_TYPE_LABEL, errandAmountDue, errandStatusLabel } from '../utils/errandStatus'
import { ErrandActiveSheet, type PickedUpInput } from './ErrandActiveSheet'
import { ErrandOfferSheet } from './ErrandOfferSheet'
import type { Errand } from '../types'

/** Cada cuántos ms se manda la ubicación mientras el Domi va en camino. */
const LOCATION_UPDATE_INTERVAL_MS = 10000

interface DriverErrandsSectionProps {
  userId: string
  /** Si hay un pedido de restaurante en curso, no se puede aceptar un Domi (el servidor también lo valida). */
  hasActiveOrder: boolean
}

/**
 * Domis (mandados) en el panel del domiciliario: ofertas por responder, cotizaciones esperando al
 * cliente y el Domi activo. Va entre las tarjetas del panel; no toca el flujo de pedidos.
 */
export const DriverErrandsSection = ({ userId, hasActiveOrder }: DriverErrandsSectionProps) => {
  const isOffline = useOnlineStatus() === 'offline'
  const { errands, silentReload } = useMyErrands(userId)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; variant: 'success' | 'error' } | null>(null)

  const [locationError, setLocationError] = useState<string | null>(null)
  const [sharingLocation, setSharingLocation] = useState(false)
  const lastSentAtRef = useRef(0)

  const showToast = (text: string, variant: 'success' | 'error' = 'success') => {
    setToast({ text, variant })
    setTimeout(() => setToast(null), 2500)
  }

  const mine = errands.filter((e) => e.delivery_person_id === userId)
  const offers = mine.filter((e) => e.status === 'searching')
  const waiting = mine.filter((e) => e.status === 'quoted')
  const active = mine.filter((e) => e.status === 'accepted' || e.status === 'picked_up' || e.status === 'in_delivery')
  const activeErrand = active[0]
  const detail = mine.find((e) => e.id === detailId) ?? null
  const detailIsOffer = detail?.status === 'searching'

  // Mientras va en camino, comparte la ubicación para que el cliente la vea en el mapa.
  const inDeliveryId = activeErrand?.status === 'in_delivery' ? activeErrand.id : null
  useEffect(() => {
    if (!inDeliveryId || !('geolocation' in navigator)) {
      setSharingLocation(false)
      return
    }
    setLocationError(null)
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setSharingLocation(true)
        setLocationError(null)
        const now = Date.now()
        if (now - lastSentAtRef.current < LOCATION_UPDATE_INTERVAL_MS) return
        lastSentAtRef.current = now
        void deliveryUpdateErrandLocation(inDeliveryId, position.coords.latitude, position.coords.longitude)
      },
      (err) => {
        setSharingLocation(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Activa el permiso de ubicación para que el cliente pueda ver por dónde vas.'
            : 'No se pudo obtener tu ubicación. Revisa el GPS del celular.'
        )
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
    return () => {
      navigator.geolocation.clearWatch(watchId)
      setSharingLocation(false)
    }
  }, [inDeliveryId])

  /** Ejecuta una acción con freno de doble toque, recarga y avisa. */
  const run = async (errand: Errand, action: () => Promise<ErrandActionResult>, okText: string, closeOnOk = true) => {
    if (processingId) return
    setProcessingId(errand.id)
    const result = await action()
    await silentReload()
    setProcessingId(null)
    if (result.ok) {
      if (closeOnOk) setDetailId(null)
      showToast(okText)
    } else {
      if (result.code !== 'delivery_busy' && result.code !== 'over_budget' && result.code !== 'receipt_required') setDetailId(null)
      showToast(result.reason ?? 'No pudimos completar la acción.', 'error')
    }
  }

  const accept = (e: Errand) => run(e, () => deliveryAcceptErrand(e.id), '✓ Domi aceptado — ¡a trabajar!')
  const quote = (e: Errand, amount: number, note: string) =>
    run(e, () => deliveryQuoteErrand(e.id, amount, note), 'Cotización enviada. Esperando la respuesta del cliente.')
  const reject = (e: Errand) => run(e, () => deliveryRejectErrand(e.id), 'Listo. Lo pasamos a otro Domi.')
  const startDelivery = (e: Errand) => run(e, () => deliveryStartErrandDelivery(e.id), '✓ En camino al punto B', false)
  const complete = (e: Errand) => run(e, () => deliveryCompleteErrand(e.id), '✓ Domi entregado')

  const pickedUp = (e: Errand, input: PickedUpInput) =>
    run(
      e,
      async () => {
        let receiptPath: string | undefined
        if (e.type === 'purchase') {
          if (!input.receipt) return { ok: false, errand: null, code: 'receipt_required', reason: 'Sube la foto de la factura para continuar.' }
          receiptPath = errandFilePath(userId, e.id, 'receipt', input.receipt.extension)
          const uploaded = await uploadErrandFile(receiptPath, input.receipt)
          if (!uploaded) return { ok: false, errand: null, reason: 'No pudimos subir la factura. Revisa tu conexión.' }
        }
        return deliveryErrandPickedUp(e.id, input.purchaseAmount, receiptPath)
      },
      e.type === 'purchase' ? '✓ Compra registrada' : '✓ Recogido',
      false
    )

  const nothing = offers.length === 0 && waiting.length === 0 && active.length === 0

  return (
    <>
      <Toast message={toast?.text ?? null} variant={toast?.variant} />

      {!nothing && (
        <div className="mb-6 px-5">
          <h2 className="mb-3 font-display text-sm font-bold text-gray-700">🛵 Domis (mandados)</h2>

          {activeErrand && (
            <>
              {locationError ? (
                <div className="mb-3 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">
                  <MapPinOff className="h-4 w-4 flex-shrink-0" />
                  {locationError}
                </div>
              ) : sharingLocation ? (
                <div className="mb-3 flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-xs font-semibold text-success-strong">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  Compartiendo tu ubicación con el cliente
                </div>
              ) : null}
            </>
          )}

          <div className="flex flex-col gap-3">
            {offers.map((e) => (
              <ErrandRow key={e.id} errand={e} offer onOpen={() => setDetailId(e.id)} />
            ))}
            {waiting.map((e) => (
              <ErrandRow key={e.id} errand={e} waiting onOpen={() => setDetailId(e.id)} />
            ))}
            {active.map((e) => (
              <ErrandRow key={e.id} errand={e} onOpen={() => setDetailId(e.id)} />
            ))}
          </div>
        </div>
      )}

      <ErrandOfferSheet
        key={`offer-${detail?.id}`}
        errand={detailIsOffer ? detail : null}
        open={!!detail && detailIsOffer}
        busy={processingId === detail?.id}
        disabled={isOffline || !!processingId || hasActiveOrder}
        onAccept={accept}
        onQuote={quote}
        onReject={reject}
        onClose={() => setDetailId(null)}
      />
      <ErrandActiveSheet
        key={`active-${detail?.id}`}
        errand={!detailIsOffer ? detail : null}
        open={!!detail && !detailIsOffer && detail.status !== 'quoted'}
        busy={processingId === detail?.id}
        disabled={isOffline || !!processingId}
        onPickedUp={pickedUp}
        onStartDelivery={startDelivery}
        onComplete={complete}
        onClose={() => setDetailId(null)}
      />

      {/* CTA fijo del Domi activo, al alcance del pulgar */}
      {activeErrand && !detail && (
        <div className="safe-bottom fixed bottom-16 left-0 right-0 z-30 mx-auto max-w-md border-t border-gray-100 bg-white px-5 pb-4 pt-3">
          <p className="mb-2 truncate text-xs text-gray-500">
            🛵 Domi actual · {errandStatusLabel(activeErrand.status, activeErrand.type)}
          </p>
          <Button fullWidth size="lg" disabled={isOffline} onClick={() => setDetailId(activeErrand.id)}>
            {activeErrand.status === 'accepted'
              ? activeErrand.type === 'purchase'
                ? 'Ya lo compré'
                : 'Ya lo recogí'
              : activeErrand.status === 'picked_up'
                ? 'Salir a entregar'
                : 'Marcar como entregado'}
          </Button>
        </div>
      )}
    </>
  )
}

const ErrandRow = ({ errand, offer = false, waiting = false, onOpen }: { errand: Errand; offer?: boolean; waiting?: boolean; onOpen: () => void }) => {
  const due = errandAmountDue(errand)
  // Esperando al cliente no tiene nada que abrir: es solo informativo.
  const Wrapper = waiting ? 'div' : 'button'
  return (
    <Wrapper
      {...(waiting ? {} : { type: 'button' as const, onClick: onOpen })}
      className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ${
        waiting ? '' : 'focus-ring transition-transform active:scale-[0.98]'
      } ${offer ? 'border-2 border-domi' : 'border border-gray-100'}`}
    >
      <span className="flex-shrink-0 text-2xl" aria-hidden="true">
        {ERRAND_TYPE_EMOJI[errand.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <span className="rounded-full bg-domi px-2 py-0.5 text-xs font-bold text-white">🛵 DOMI</span>
          <span className="truncate">{ERRAND_TYPE_LABEL[errand.type]}</span>
        </p>
        <p className="truncate text-xs text-gray-500">
          {offer ? errand.description : waiting ? 'Esperando la respuesta del cliente a tu cotización' : `Entregar: ${errand.dropoff_address}`}
        </p>
        {(offer || waiting) && errand.accept_deadline && (
          <DeadlineCountdown deadline={errand.accept_deadline} prefix={offer ? 'Responde en' : 'El cliente responde en'} className="mt-1 text-base" />
        )}
      </div>
      {!offer && !waiting && due !== null && (
        <div className="flex-shrink-0 text-right">
          <p className="font-display text-sm font-bold text-primary">{formatCOP(due)}</p>
          <span className="mt-0.5 flex items-center justify-end gap-1 text-xs font-semibold text-primary">
            <Banknote className="h-3 w-3" aria-hidden="true" />
            Cobrar
          </span>
        </div>
      )}
    </Wrapper>
  )
}
