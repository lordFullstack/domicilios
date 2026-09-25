import { formatCOP } from '@/shared/utils/money'

export const MAX_CASH_AMOUNT = 10_000_000 // mismo tope que el RPC create_order

/** Solo dígitos: "50.000" o "$ 50000" -> 50000; vacío -> null (= "sin especificar"). */
export const parseCashInput = (raw: string): number | null => {
  const digits = raw.replace(/\D/g, '')
  return digits === '' ? null : Number(digits)
}

/** Motivo por el que el monto no sirve (null = válido o vacío). */
export const cashAmountError = (cash: number | null, total: number): string | null => {
  if (cash === null) return null
  if (cash > MAX_CASH_AMOUNT) return `El máximo es ${formatCOP(MAX_CASH_AMOUNT)}.`
  if (cash < total) return `Debe ser al menos ${formatCOP(total)}, el total de tu pedido.`
  return null
}

interface CashAmountFieldProps {
  total: number
  /** Texto tal como lo escribe la persona. */
  value: string
  onChange: (value: string) => void
}

/**
 * "¿Con cuánto pagas?" (solo efectivo, opcional). Muestra el cambio estimado en vivo para que el
 * domiciliario lleve billetes. El servidor vuelve a validar el monto (create_order).
 */
export const CashAmountField = ({ total, value, onChange }: CashAmountFieldProps) => {
  const cash = parseCashInput(value)
  const error = cashAmountError(cash, total)
  const change = cash !== null && !error ? cash - total : null
  const shown = cash === null ? '' : cash.toLocaleString('es-CO')

  return (
    <div>
      <label htmlFor="cash-amount" className="block text-xs font-bold text-gray-500 tracking-wide mb-2">
        ¿CON CUÁNTO PAGAS? (OPCIONAL)
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500" aria-hidden="true">
          $
        </span>
        <input
          id="cash-amount"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ej: 50.000"
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby="cash-amount-help"
          className="focus-ring w-full min-h-[44px] rounded-2xl border border-gray-200 pl-7 pr-3 text-sm tabular-nums"
        />
      </div>
      <p
        id="cash-amount-help"
        aria-live="polite"
        className={`text-sm mt-1.5 tabular-nums ${error ? 'text-danger font-semibold' : 'text-gray-500'}`}
      >
        {error ??
          (change !== null
            ? change === 0
              ? 'Pago exacto: no necesitas cambio.'
              : `Te devolverán ${formatCOP(change)}.`
            : 'Así el domiciliario lleva el cambio listo.')}
      </p>
    </div>
  )
}
