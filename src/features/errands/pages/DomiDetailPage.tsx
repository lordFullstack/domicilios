import { lazy, Suspense, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2, MessageCircle, Phone, Star, Wifi, WifiOff, XCircle } from 'lucide-react'
import { Avatar } from '@/shared/components/Avatar'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { Button } from '@/shared/components/Button'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { Skeleton } from '@/shared/components/Skeleton'
import { Toast } from '@/shared/components/Toast'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { ROUTES } from '@/config/constants'
import { formatCOP } from '@/shared/utils/money'
import { clientCancelErrand, clientRespondQuote } from '../services/errandActions.service'
import { useErrand, useErrandFileUrl, useErrandRating, usePublicProfile } from '../hooks/useErrands'
import { ErrandStatusTimeline } from '../components/ErrandStatusTimeline'
import { QuoteCard } from '../components/QuoteCard'
import { ErrandRatingSheet } from '../components/ErrandRatingSheet'
import { ERRAND_TYPE_EMOJI, ERRAND_TYPE_LABEL, errandAmountDue, shortErrandId } from '../utils/errandStatus'
import type { Errand } from '../types'

// Leaflet pesa ~155 kB: solo se descarga cuando el Domi va en camino.
const DeliveryLiveMap = lazy(() => import('@/shared/components/DeliveryLiveMap').then((m) => ({ default: m.DeliveryLiveMap })))

export const DomiDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isOffline = useOnlineStatus() === 'offline'
  const { errand, quotes, loading, silentReload } = useErrand(id)

  const driverVisible = !!errand && errand.status !== 'searching' && errand.status !== 'expired'
  const driver = usePublicProfile(driverVisible ? errand?.delivery_person_id : null)
  const photoUrl = useErrandFileUrl(errand?.photo_url)
  const receiptUrl = useErrandFileUrl(errand?.receipt_url)
  const { rating, loading: ratingLoading, submitting, submitRating } = useErrandRating(errand?.status === 'delivered' ? errand : null)

  const [toast, setToast] = useState<{ text: string; variant: 'success' | 'error' } | null>(null)
  const [responding, setResponding] = useState(false)
  const [respondError, setRespondError] = useState<string | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [ratingOpen, setRatingOpen] = useState(false)

  const showToast = (text: string, variant: 'success' | 'error' = 'success') => {
    setToast({ text, variant })
    setTimeout(() => setToast(null), 2500)
  }

  const goBack = () => navigate(`${ROUTES.CLIENT_ORDERS}?tab=domis`)

  if (loading) {
    return (
      <LoadingState fullScreen label="Cargando tu Domi" className="mx-auto max-w-md safe-left safe-right">
        <div className="w-full space-y-3 px-5">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </LoadingState>
    )
  }

  if (!errand) {
    return (
      <ErrorState
        fullScreen
        illustration="confused"
        className="mx-auto max-w-md safe-left safe-right"
        title="No encontramos este Domi"
        description="Puede que ya no exista o que no sea tuyo."
        action={
          <Button variant="gradient" onClick={() => navigate(ROUTES.CLIENT_HOME)}>
            Ir al inicio
          </Button>
        }
      />
    )
  }

  const pendingQuote = errand.status === 'quoted' ? [...quotes].reverse().find((q) => q.status === 'pending') : undefined
  const lastRejected =
    errand.status === 'searching' && errand.delivery_person_id ? [...quotes].reverse().find((q) => q.status === 'rejected') : undefined
  const canCancel = errand.status === 'searching' || errand.status === 'quoted' || errand.status === 'accepted'
  const isTerminalBad = errand.status === 'cancelled' || errand.status === 'expired'
  const created = new Date(errand.created_at)

  const respond = async (approve: boolean, note?: string) => {
    if (responding) return
    setResponding(true)
    setRespondError(null)
    const result = await clientRespondQuote(errand.id, approve, note)
    await silentReload()
    setResponding(false)
    if (result.ok) showToast(approve ? '✓ Precio aprobado. ¡Tu Domi va por tu mandado!' : 'Oferta rechazada. Tu Domi la revisará.')
    else setRespondError(result.reason ?? 'No pudimos enviar tu respuesta.')
  }

  const confirmCancel = async () => {
    setCancelling(true)
    setCancelError(null)
    const result = await clientCancelErrand(errand.id)
    await silentReload()
    setCancelling(false)
    if (result.ok) setCancelOpen(false)
    else setCancelError(result.reason ?? 'No pudimos cancelar el Domi. Intenta de nuevo.')
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white pb-10 safe-left safe-right">
      <Toast message={toast?.text ?? null} variant={toast?.variant} />

      <div className="flex items-center gap-3 px-5 pb-2 pt-6">
        <button
          type="button"
          onClick={goBack}
          aria-label="Volver a mis pedidos"
          className="touch-target focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 transition-transform active:scale-90"
        >
          <ChevronLeft className="h-4 w-4 text-secondary" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold tabular-nums text-secondary">
            {ERRAND_TYPE_EMOJI[errand.type]} {ERRAND_TYPE_LABEL[errand.type]}
          </h1>
          <p className="text-xs tabular-nums text-gray-500">
            #{shortErrandId(errand.id)} · {created.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })} ·{' '}
            {created.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="px-5 pb-1">
        {isOffline ? (
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <WifiOff className="h-3 w-3" /> Sin conexión · mostrando el último estado conocido
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <Wifi className="h-3 w-3 text-success" /> Actualizado en tiempo real
          </p>
        )}
      </div>

      <div className="px-5 pt-2">
        {errand.status === 'searching' && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-domi-soft p-4" role="status">
            <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-domi-text motion-reduce:animate-none" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-secondary">
                {errand.delivery_person_id ? 'Un Domi está revisando tu mandado…' : 'Buscando un Domi disponible…'}
              </p>
              <p className="text-xs text-gray-600">Te avisamos apenas responda. Puedes cerrar la app.</p>
            </div>
          </div>
        )}

        {lastRejected && (
          <p className="mb-4 rounded-2xl bg-warning/10 p-3 text-sm text-gray-700" role="status">
            Rechazaste la oferta de <strong>{formatCOP(lastRejected.amount)}</strong>. Tu Domi puede ajustar su precio una vez más o dejar el
            mandado para otro Domi.
          </p>
        )}

        {pendingQuote && (
          <QuoteCard
            quote={pendingQuote}
            driver={driver}
            deadline={errand.accept_deadline}
            busy={responding}
            error={respondError}
            onApprove={() => void respond(true)}
            onReject={(note) => void respond(false, note)}
          />
        )}

        {errand.status === 'expired' && (
          <ErrorState
            illustration="sad"
            title="No encontramos un Domi"
            description="Ningún Domi pudo tomar tu mandado ahora. Intenta de nuevo en unos minutos."
            action={
              <Button variant="gradient" onClick={() => navigate(ROUTES.DOMI)}>
                Pedir de nuevo
              </Button>
            }
          />
        )}
        {errand.status === 'cancelled' && (
          <div className="mb-4 rounded-2xl bg-red-50 p-6 text-center" role="alert">
            <XCircle className="mx-auto mb-2 h-10 w-10 text-danger" />
            <p className="font-display font-bold text-danger">Este Domi fue cancelado</p>
          </div>
        )}

        {!isTerminalBad && <ErrandStatusTimeline status={errand.status} type={errand.type} updatedAt={errand.updated_at} />}

        {driverVisible && errand.status !== 'quoted' && driver && (
          <section className="mb-4" aria-label="Tu Domi">
            <p className="mb-2 font-display text-sm font-bold text-secondary">Tu Domi</p>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
              <Avatar src={driver.avatar_url} name={driver.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-secondary">{driver.name}</p>
                <p className="flex items-center gap-1 text-xs capitalize text-gray-500">
                  {driver.rating_count > 0 && (
                    <>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      <span className="tabular-nums">{Number(driver.rating_avg).toFixed(1)}</span> ·{' '}
                    </>
                  )}
                  {driver.vehicle_type}
                  {driver.vehicle_plate && ` · ${driver.vehicle_plate}`}
                </p>
              </div>
              {driver.phone && (
                <div className="flex flex-shrink-0 items-center gap-2">
                  <a
                    href={`sms:${driver.phone}`}
                    aria-label={`Enviar mensaje a ${driver.name}`}
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-gray-50"
                  >
                    <MessageCircle className="h-4 w-4 text-secondary" />
                  </a>
                  <a
                    href={`tel:${driver.phone}`}
                    aria-label={`Llamar a ${driver.name}`}
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-primary"
                  >
                    <Phone className="h-4 w-4 text-white" />
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {errand.status === 'in_delivery' && (
          <section className="mb-4" aria-label="Ubicación de tu Domi">
            {errand.current_lat != null && errand.current_lng != null ? (
              <Suspense
                fallback={
                  <LoadingState label="Cargando mapa">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                  </LoadingState>
                }
              >
                <DeliveryLiveMap lat={errand.current_lat} lng={errand.current_lng} updatedAt={errand.location_updated_at} />
              </Suspense>
            ) : (
              <div className="rounded-2xl bg-gray-50 p-6 text-center">
                <p className="text-xs text-gray-500">Esperando la ubicación de tu Domi...</p>
              </div>
            )}
          </section>
        )}

        <ErrandSummary errand={errand} photoUrl={photoUrl} receiptUrl={receiptUrl} />

        {canCancel && (
          <Button variant="dangerOutline" fullWidth onClick={() => setCancelOpen(true)} className="mb-4">
            Cancelar Domi
          </Button>
        )}

        {errand.status === 'delivered' && !ratingLoading && (
          <div className="flex flex-col gap-3">
            {rating ? (
              <div className="flex items-center gap-2 rounded-2xl border border-gray-100 p-4">
                <Star className="h-4 w-4 flex-shrink-0 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                <p className="text-sm text-gray-500">Calificaste a tu Domi con {rating.rating}/5. ¡Gracias!</p>
              </div>
            ) : (
              <Button variant="gradient" fullWidth onClick={() => setRatingOpen(true)}>
                Calificar a mi Domi
              </Button>
            )}
            <Button variant="tertiary" fullWidth onClick={() => navigate(ROUTES.DOMI)}>
              Pedir otro Domi
            </Button>
          </div>
        )}
      </div>

      <BottomSheet open={cancelOpen} onClose={() => setCancelOpen(false)} title="¿Cancelar Domi?">
        <p className="mb-4 text-sm text-gray-500">
          {errand.status === 'accepted'
            ? 'Tu Domi ya aceptó el mandado. Puedes cancelar mientras no haya comprado o recogido.'
            : 'Esta acción no se puede deshacer.'}
        </p>
        {cancelError && (
          <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">
            {cancelError}
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="tertiary" onClick={() => setCancelOpen(false)} disabled={cancelling} className="flex-1">
            Volver
          </Button>
          <Button variant="danger" onClick={() => void confirmCancel()} loading={cancelling} disabled={cancelling} className="flex-1">
            Cancelar Domi
          </Button>
        </div>
      </BottomSheet>

      <ErrandRatingSheet
        open={ratingOpen}
        driverName={driver?.name}
        submitting={submitting}
        onClose={() => setRatingOpen(false)}
        onSubmit={async (value, comment) => {
          const ok = await submitRating(value, comment)
          if (ok) {
            setRatingOpen(false)
            showToast('¡Gracias por tu calificación!')
          } else {
            showToast('No pudimos guardar tu calificación.', 'error')
          }
        }}
      />
    </div>
  )
}

/** Detalle del mandado + tarjeta de factura/cobro. */
const ErrandSummary = ({ errand, photoUrl, receiptUrl }: { errand: Errand; photoUrl: string | null; receiptUrl: string | null }) => {
  const due = errandAmountDue(errand)
  const isPurchase = errand.type === 'purchase'

  return (
    <section className="mb-4 flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4" aria-label="Detalle del Domi">
      <Row label="Mandado" value={errand.description} />
      {photoUrl && <img src={photoUrl} alt="Foto de tu pedido" className="h-32 w-full rounded-2xl object-cover" />}
      <Row label="Punto A" value={errand.pickup_address} hint={errand.pickup_notes} />
      <Row label="Punto B" value={errand.dropoff_address} hint={errand.dropoff_notes} />

      <div className="border-t border-gray-100 pt-3">
        {isPurchase && errand.max_budget !== null && errand.purchase_amount === null && (
          <MoneyRow label="Presupuesto máximo" value={errand.max_budget} muted />
        )}
        {isPurchase && errand.purchase_amount !== null && <MoneyRow label="Compra (factura)" value={errand.purchase_amount} />}
        {errand.fee !== null && <MoneyRow label="Tarifa de tu Domi" value={errand.fee} />}
        {due !== null && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-secondary">{isPurchase && errand.purchase_amount === null ? 'Pagarás (sin compra aún)' : 'Pagas en efectivo'}</span>
            <span className="font-display text-lg font-bold tabular-nums text-secondary">{formatCOP(due)}</span>
          </div>
        )}
        {due === null && <p className="text-xs text-gray-500">La tarifa se define cuando un Domi acepte o tú apruebes su oferta.</p>}
      </div>

      {receiptUrl && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Factura de tu Domi</p>
          <a href={receiptUrl} target="_blank" rel="noreferrer">
            <img src={receiptUrl} alt="Foto de la factura de la compra" className="h-40 w-full rounded-2xl object-cover" />
          </a>
        </div>
      )}
    </section>
  )
}

const Row = ({ label, value, hint }: { label: string; value: string; hint?: string | null }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-secondary">{value}</p>
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
)

const MoneyRow = ({ label, value, muted }: { label: string; value: number; muted?: boolean }) => (
  <div className="flex items-center justify-between py-0.5">
    <span className={`text-sm ${muted ? 'text-gray-500' : 'text-gray-700'}`}>{label}</span>
    <span className={`text-sm font-semibold tabular-nums ${muted ? 'text-gray-500' : 'text-secondary'}`}>{formatCOP(value)}</span>
  </div>
)
