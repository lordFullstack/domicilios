import { ProductImage } from '@/shared/components/ProductImage'
import { formatCOP } from '@/shared/utils/money'
import type { Product, Restaurant } from '@/shared/types'
import { DeliveryFeeRow } from './DeliveryFeeRow'

interface CheckoutSummaryProps {
  restaurant?: Restaurant | null
  cart: { productId: string; quantity: number; unitPrice: number }[]
  productById: Map<string, Product>
  subtotal: number
  deliveryFee: number | null
}

/** Resumen del checkout: restaurante, líneas, subtotal y tarifa de domicilio. */
export const CheckoutSummary = ({ restaurant, cart, productById, subtotal, deliveryFee }: CheckoutSummaryProps) => (
  <div>
    <h2 className="text-xs font-bold text-gray-500 tracking-wide mb-2">RESUMEN</h2>
    <div className="hairline rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center text-base flex-shrink-0">
          <ProductImage imageUrl={restaurant?.image_url} alt={restaurant?.name || ''} width={48} />
        </div>
        <p className="font-display font-bold text-sm text-secondary">{restaurant?.name}</p>
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        {cart.map((item) => {
          const product = productById.get(item.productId)
          if (!product) return null
          return (
            <div key={item.productId} className="flex justify-between text-sm text-gray-500">
              <span>
                {product.name} <span className="tabular-nums">x{item.quantity}</span>
              </span>
              <span className="font-semibold tabular-nums text-secondary">{formatCOP(product.price * item.quantity)}</span>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCOP(subtotal)}</span>
        </div>
        <DeliveryFeeRow fee={deliveryFee} />
      </div>
    </div>
  </div>
)
