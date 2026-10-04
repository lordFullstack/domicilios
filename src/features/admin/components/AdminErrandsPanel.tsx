import { useMemo, useState } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { Button } from '@/shared/components/Button'
import { formatCOP } from '@/shared/utils/money'
import type { User } from '@/shared/types'
import { adminCancelErrand } from '@/features/errands/services/errandActions.service'
import { useErrand, useErrandFileUrl, useMyErrands } from '@/features/errands/hooks/useErrands'
import {
  ERRAND_TYPE_EMOJI,
  ERRAND_TYPE_LABEL,
  errandAmountDue,
  errandStatusLabel,
  errandStatusTone,
  isActiveErrand,
  shortErrandId,
} from '@/features/errands/utils/errandStatus'
import type { Errand, ErrandStatus, ErrandType } from '@/features/errands/types'
import { AdminListSkeleton } from './AdminListSkeleton'

const STATUSES: ErrandStatus[] = ['searching', 'quoted', 'accepted', 'picked_up', 'in_delivery', 'delivered', 'cancelled', 'expired']

const when = (iso: string) => {
  const d = new Date(iso)
  return `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
}

interface AdminErrandsPanelProps {
  usersById: Map<string, User>
}

/** Pestaña "Domis" de Órdenes: lista con filtros, detalle con cotizaciones y cancelación de Domis atascados. */
export const AdminErrandsPanel = ({ usersById }: AdminErrandsPanelProps) => {
  const { user } = useAuth()
  const { errands, loading, error, silentReload } = useMyErrands(user?.id)
  const [statusFilter, setStatusFilter] = useState<ErrandStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ErrandType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return errands.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      if (!q) return true
      const client = usersById.get(e.client_id)?.name ?? ''
      return [e.id, e.description, e.pickup_address, e.dropoff_address, client].some((t) => t.toLowerCase().includes(q))
    })
  }, [errands, statusFilter, typeFilter, search, usersById])

  const detail = errands.find((e) => e.id === detailId) ?? null
  const stuck = errands.filter((e) => isActiveErrand(e.status)).length

  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">
        {visible.length} de {errands.length} Domi(s) · {stuck} en curso
      </p>
      {errands.length >= 100 && <p className="mb-4 text-xs text-warning-strong">Mostrando los 100 Domis más recientes.</p>}

      <div className="mb-6 mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número, cliente o dirección..."
          aria-label="Buscar Domis"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ErrandStatus | 'all')}
          aria-label="Filtrar por estado"
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {errandStatusLabel(s, 'purchase')}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ErrandType | 'all')}
          aria-label="Filtrar por tipo"
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Compra y recogida</option>
          <option value="purchase">🛒 Compra</option>
          <option value="pickup">📦 Recogida</option>
        </select>
      </div>

      {loading && <AdminListSkeleton />}
      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && visible.length === 0 && (
        <p className="rounded-2xl border border-gray-100 bg-white py-12 text-center text-sm text-gray-500">
          {errands.length === 0 ? 'Todavía no hay Domis.' : 'Ningún Domi coincide con estos filtros.'}
        </p>
      )}

      {!loading && visible.length > 0 && (
        <ul className="flex flex-col gap-2">
          {visible.map((e) => {
            const due = errandAmountDue(e)
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setDetailId(e.id)}
                  className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {ERRAND_TYPE_EMOJI[e.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-secondary">
                      #{shortErrandId(e.id)} · {usersById.get(e.client_id)?.name ?? 'Cliente'}
                    </p>
                    <p className="truncate text-xs text-gray-500">{e.description}</p>
                    <p className="text-xs tabular-nums text-gray-500">
                      {when(e.created_at)}
                      {e.delivery_person_id && ` · Domi: ${usersById.get(e.delivery_person_id)?.name ?? '—'}`}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${errandStatusTone(e.status)}`}>
                      {errandStatusLabel(e.status, e.type)}
                    </span>
                    {due !== null && <span className="text-xs font-semibold tabular-nums text-secondary">{formatCOP(due)}</span>}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <AdminErrandDetail key={detail?.id} errand={detail} usersById={usersById} onClose={() => setDetailId(null)} onChanged={silentReload} />
    </div>
  )
}

const AdminErrandDetail = ({
  errand,
  usersById,
  onClose,
  onChanged,
}: {
  errand: Errand | null
  usersById: Map<string, User>
  onClose: () => void
  onChanged: () => Promise<void> | void
}) => {
  const { quotes } = useErrand(errand?.id)
  const photoUrl = useErrandFileUrl(errand?.photo_url)
  const receiptUrl = useErrandFileUrl(errand?.receipt_url)
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  if (!errand) return null

  const client = usersById.get(errand.client_id)
  const driver = errand.delivery_person_id ? usersById.get(errand.delivery_person_id) : undefined
  const due = errandAmountDue(errand)

  const cancel = async () => {
    setCancelling(true)
    const result = await adminCancelErrand(errand.id)
    await onChanged()
    setCancelling(false)
    setConfirming(false)
    setMessage(result.ok ? { text: '✓ Domi cancelado. Avisamos al cliente y al domiciliario.', error: false } : { text: result.reason ?? 'No pudimos cancelarlo.', error: true })
  }

  return (
    <>
      <BottomSheet open onClose={onClose} title={`${ERRAND_TYPE_EMOJI[errand.type]} ${ERRAND_TYPE_LABEL[errand.type]} #${shortErrandId(errand.id)}`}>
        <div className="flex flex-col gap-3 text-sm">
          <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${errandStatusTone(errand.status)}`}>
            {errandStatusLabel(errand.status, errand.type)}
            {errand.cancel_reason === 'admin' && ' · por admin'}
          </span>
          <Info label="Cliente" value={client ? `${client.name}${client.phone ? ` · ${client.phone}` : ''}` : '—'} />
          <Info label="Domiciliario" value={driver ? `${driver.name}${driver.phone ? ` · ${driver.phone}` : ''}` : 'Sin asignar'} />
          <Info label="Mandado" value={errand.description} />
          {photoUrl && <img src={photoUrl} alt="Foto del pedido" className="h-32 w-full rounded-2xl object-cover" />}
          <Info label="Punto A" value={errand.pickup_address} hint={errand.pickup_notes} />
          <Info label="Punto B" value={errand.dropoff_address} hint={errand.dropoff_notes} />
          <Info label="Creado" value={when(errand.created_at)} />

          <div className="rounded-xl bg-gray-50 p-3">
            {errand.max_budget !== null && <Money label="Presupuesto máximo" value={errand.max_budget} />}
            {errand.purchase_amount !== null && <Money label="Compra (factura)" value={errand.purchase_amount} />}
            {errand.fee !== null && <Money label="Tarifa del Domi" value={errand.fee} />}
            {due !== null && <Money label="Cliente paga" value={due} strong />}
            {errand.fee === null && <p className="text-xs text-gray-500">Aún sin tarifa acordada.</p>}
          </div>

          {receiptUrl && (
            <a href={receiptUrl} target="_blank" rel="noreferrer">
              <img src={receiptUrl} alt="Foto de la factura" className="h-40 w-full rounded-2xl object-cover" />
            </a>
          )}

          {quotes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold tracking-wide text-gray-500">COTIZACIONES</p>
              <ul className="flex flex-col gap-2">
                {quotes.map((q) => (
                  <li key={q.id} className="rounded-xl border border-gray-100 p-3">
                    <p className="flex items-center justify-between font-semibold text-secondary">
                      <span>{usersById.get(q.driver_id)?.name ?? 'Domi'}</span>
                      <span className="tabular-nums">{formatCOP(q.amount)}</span>
                    </p>
                    <p className="text-xs text-gray-600">Domi: “{q.driver_note}”</p>
                    {q.client_note && <p className="text-xs text-gray-600">Cliente: “{q.client_note}”</p>}
                    <p className="text-xs text-gray-500">{QUOTE_LABEL[q.status]}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message && (
            <p role="status" className={`font-semibold ${message.error ? 'text-danger' : 'text-success-strong'}`}>
              {message.text}
            </p>
          )}
          {isActiveErrand(errand.status) &&
            (confirming ? (
              // Confirmación dentro del sheet: el resto de la app queda inerte mientras está abierto.
              <div className="rounded-2xl bg-red-50 p-3" role="alertdialog" aria-label="Confirmar cancelación">
                <p className="mb-3 font-semibold text-secondary">
                  ¿Cancelar este Domi? Se cancela para el cliente y el domiciliario, y ambos reciben un aviso.
                </p>
                <div className="flex gap-3">
                  <Button variant="tertiary" className="flex-1" disabled={cancelling} onClick={() => setConfirming(false)}>
                    Volver
                  </Button>
                  <Button variant="danger" className="flex-1" loading={cancelling} disabled={cancelling} onClick={() => void cancel()}>
                    Sí, cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="dangerOutline" fullWidth onClick={() => setConfirming(true)}>
                Cancelar Domi
              </Button>
            ))}
        </div>
      </BottomSheet>

    </>
  )
}

const QUOTE_LABEL = { pending: 'Esperando al cliente', approved: 'Aprobada', rejected: 'Rechazada', expired: 'Vencida' } as const

const Info = ({ label, value, hint }: { label: string; value: string; hint?: string | null }) => (
  <div>
    <p className="text-xs font-bold tracking-wide text-gray-500">{label.toUpperCase()}</p>
    <p className="font-semibold text-secondary">{value}</p>
    {hint && <p className="text-xs italic text-gray-500">“{hint}”</p>}
  </div>
)

const Money = ({ label, value, strong }: { label: string; value: number; strong?: boolean }) => (
  <div className="flex items-center justify-between py-0.5">
    <span className={strong ? 'font-semibold text-secondary' : 'text-gray-600'}>{label}</span>
    <span className={`tabular-nums ${strong ? 'font-display font-bold text-secondary' : 'font-semibold text-secondary'}`}>{formatCOP(value)}</span>
  </div>
)
