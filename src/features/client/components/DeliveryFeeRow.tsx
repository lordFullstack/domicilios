import { formatCOP } from '@/shared/utils/money'

interface DeliveryFeeRowProps {
  fee: number | null
  className?: string
}

/**
 * Línea "Envío" de carrito y checkout. 0 → "Gratis"; null (no se pudo
 * leer) → se aclara que el servidor lo calcula al confirmar, nunca se
 * promete "Gratis" sin saberlo.
 */
export const DeliveryFeeRow = ({ fee, className = '' }: DeliveryFeeRowProps) => (
  <div className={`flex justify-between text-sm text-gray-500 ${className}`}>
    <span>Envío</span>
    {fee === null ? (
      <span>Se calcula al confirmar</span>
    ) : fee === 0 ? (
      <span className="text-success-strong font-semibold">Gratis</span>
    ) : (
      <span className="tabular-nums">{formatCOP(fee)}</span>
    )}
  </div>
)
