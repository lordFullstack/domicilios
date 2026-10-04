import type { Errand, ErrandStatus, ErrandType } from '../types'

export const ACTIVE_ERRAND_STATUSES: ErrandStatus[] = ['searching', 'quoted', 'accepted', 'picked_up', 'in_delivery']

export const isActiveErrand = (status: ErrandStatus) => ACTIVE_ERRAND_STATUSES.includes(status)

export const ERRAND_TYPE_LABEL: Record<ErrandType, string> = {
  purchase: 'Domi de compra',
  pickup: 'Domi de recogida',
}

export const ERRAND_TYPE_EMOJI: Record<ErrandType, string> = {
  purchase: '🛒',
  pickup: '📦',
}

/** Etiqueta corta del estado (chips y tarjetas). */
export const errandStatusLabel = (status: ErrandStatus, type: ErrandType): string => {
  switch (status) {
    case 'searching':
      return 'Buscando Domi'
    case 'quoted':
      return 'Cotización por responder'
    case 'accepted':
      return 'Domi asignado'
    case 'picked_up':
      return type === 'purchase' ? 'Compra hecha' : 'Recogido'
    case 'in_delivery':
      return 'En camino'
    case 'delivered':
      return 'Entregado'
    case 'cancelled':
      return 'Cancelado'
    case 'expired':
      return 'Sin Domi disponible'
  }
}

export const errandStatusTone = (status: ErrandStatus): string => {
  switch (status) {
    case 'delivered':
      return 'bg-success/10 text-success-strong'
    case 'cancelled':
    case 'expired':
      return 'bg-danger/10 text-danger'
    case 'quoted':
      return 'bg-warning/10 text-warning-strong'
    default:
      return 'bg-domi-soft text-domi-text'
  }
}

export interface TimelineStep {
  status: ErrandStatus
  label: string
}

/** Pasos del seguimiento. `quoted` cuenta como parte del primer paso (se sigue buscando/negociando). */
export const errandTimelineSteps = (type: ErrandType): TimelineStep[] => [
  { status: 'searching', label: 'Buscando Domi' },
  { status: 'accepted', label: 'Domi asignado' },
  { status: 'picked_up', label: type === 'purchase' ? 'Compra hecha' : 'Recogido' },
  { status: 'in_delivery', label: 'En camino' },
  { status: 'delivered', label: 'Entregado' },
]

export const errandStepIndex = (status: ErrandStatus, type: ErrandType): number => {
  if (status === 'quoted') return 0
  const idx = errandTimelineSteps(type).findIndex((s) => s.status === status)
  return idx === -1 ? 0 : idx
}

/** Lo que el cliente paga en efectivo al recibir: factura (si es compra) + tarifa. null si aún no hay tarifa. */
export const errandAmountDue = (e: Pick<Errand, 'type' | 'fee' | 'purchase_amount'>): number | null => {
  if (e.fee === null) return null
  return e.fee + (e.type === 'purchase' ? e.purchase_amount ?? 0 : 0)
}

export const shortErrandId = (id: string) => id.substring(0, 8).toUpperCase()
