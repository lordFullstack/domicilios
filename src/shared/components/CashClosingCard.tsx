import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { Card } from '@/shared/components/Card'
import { formatCOP } from '@/shared/utils/money'
import { computeSettlement, expectedCashOnHand } from '@/shared/utils/cashSettlement'
import type { Order } from '@/shared/types'

interface CashClosingCardProps {
  /** Pedidos de UN domiciliario. */
  orders: Order[]
  /** Día a cuadrar (YYYY-MM-DD, hora de Colombia). */
  day: string
  /**
   * Si se pasa, se muestra "Mi base del día" (la escribe el domiciliario; se guarda solo en su
   * teléfono) y el efectivo que debe tener en mano. El admin no la ve: no es un dato del sistema.
   */
  baseStorageKey?: string
}

const readBase = (key?: string): string => {
  if (!key) return ''
  try {
    return localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

const Row = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex items-baseline justify-between gap-3 text-sm">
    <span className={strong ? 'font-semibold text-secondary' : 'text-gray-600'}>{label}</span>
    <span className={`tabular-nums ${strong ? 'font-display font-bold text-primary' : 'font-semibold text-secondary'}`}>{value}</span>
  </div>
)

/**
 * Cuadre diario (LOOP: cuadre de efectivo). El domiciliario adelanta el subtotal al restaurante de su
 * base y cobra el total al cliente; su ganancia es la tarifa. Todo se calcula de los pedidos entregados.
 */
export const CashClosingCard = ({ orders, day, baseStorageKey }: CashClosingCardProps) => {
  const s = computeSettlement(orders, day)
  const [baseText, setBaseText] = useState(() => readBase(baseStorageKey))
  const base = Number(baseText.replace(/\D/g, '')) || 0

  const onBase = (value: string) => {
    const digits = value.replace(/\D/g, '')
    setBaseText(digits)
    if (baseStorageKey) {
      try {
        localStorage.setItem(baseStorageKey, digits)
      } catch {
        /* sin almacenamiento: la base vale solo mientras la pantalla esté abierta */
      }
    }
  }

  const collected = formatCOP(s.collected)
  const paid = formatCOP(s.paidToRestaurants)
  const earnings = formatCOP(s.earnings)
  const inHand = formatCOP(expectedCashOnHand(base, s))

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-primary" aria-hidden="true" />
        <h2 className="font-display font-bold text-sm text-secondary">Cuadre del día</h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <Row label="Entregas" value={`${s.deliveries} (${s.cashDeliveries} en efectivo)`} />
        <Row label="Cobrado a clientes" value={collected} />
        <Row label="Pagado a restaurantes" value={paid} />
        <Row label="Tu ganancia (domicilios)" value={earnings} strong />
      </div>

      {baseStorageKey && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <label htmlFor="cash-base" className="block text-xs font-bold text-gray-500 tracking-wide mb-1.5">
            MI BASE DE HOY
          </label>
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500" aria-hidden="true">$</span>
            <input
              id="cash-base"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Con cuánto empezaste"
              value={base ? base.toLocaleString('es-CO') : ''}
              onChange={(e) => onBase(e.target.value)}
              className="focus-ring w-full min-h-[44px] rounded-2xl border border-gray-200 pl-7 pr-3 text-sm tabular-nums"
            />
          </div>
          <Row label="Debes tener en mano" value={inHand} strong />
          <p className="text-xs text-gray-500 mt-1.5">Tu base + lo que cobraste − lo que pagaste a restaurantes.</p>
        </div>
      )}
    </Card>
  )
}
