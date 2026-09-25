import { Banknote, CreditCard } from 'lucide-react'
import { Badge } from '@/shared/components/Badge'
import { PAYMENT_METHOD } from '@/config/constants'
import type { PaymentMethod } from '@/shared/types'

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

/** Método de pago del checkout: hoy solo efectivo/datáfono; el pago en línea llega con LOOP_CLIENT_07. */
export const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => {
  const cash = value === PAYMENT_METHOD.CASH_ON_DELIVERY
  return (
    <div>
      <h2 className="text-xs font-bold text-gray-500 tracking-wide mb-2">MÉTODO DE PAGO</h2>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onChange(PAYMENT_METHOD.CASH_ON_DELIVERY)}
          className={`focus-ring flex items-center gap-3 border rounded-2xl p-3 text-left transition-colors min-h-[48px] ${
            cash ? 'border-primary bg-primary/10' : 'border-gray-200'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Banknote className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-secondary">Efectivo o datáfono</p>
            <p className="text-xs text-gray-500">Pagas al recibir tu pedido</p>
          </div>
          <div
            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${cash ? 'border-primary bg-primary' : 'border-gray-300'}`}
          />
        </button>

        <div className="flex items-center gap-3 hairline rounded-2xl p-3 opacity-50 cursor-not-allowed">
          <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-500">Pagar en línea</p>
            <p className="text-xs text-gray-500">Tarjeta, PSE, Nequi</p>
          </div>
          <Badge variant="default">Próximamente</Badge>
        </div>
      </div>
    </div>
  )
}
