import { Check, Minus, Plus } from 'lucide-react'
import { Product } from '@/shared/types'
import { ProductImage } from '@/shared/components/ProductImage'
import { formatCOP } from '@/shared/utils/money'
import { MAX_ITEM_QUANTITY } from '../CartContext'
import { useAddedFlash } from '../hooks/useAddedFlash'

interface MenuProductCardProps {
  product: Product
  restaurantIsOpen: boolean
  quantity: number
  onOpenDetail: (product: Product) => void
  /** Devuelve true si se agregó de verdad (false si quedó esperando confirmación). */
  onAdd: (product: Product) => boolean
  onDecrement: (product: Product) => void
}

/**
 * Fila del menú con 3 estados en el botón:
 *  1. Agregar ("+")            → disponible, abierto, no está en el carrito
 *  2. En carrito (stepper −/+) → ya hay unidades de este producto
 *  3. Deshabilitado            → agotado o restaurante cerrado (con motivo)
 * Tocar la fila abre el sheet informativo (foto grande + descripción).
 */
export const MenuProductCard = ({
  product,
  restaurantIsOpen,
  quantity,
  onOpenDetail,
  onAdd,
  onDecrement,
}: MenuProductCardProps) => {
  const { flash, trigger } = useAddedFlash()
  const canAdd = product.available && restaurantIsOpen
  const reason = !product.available ? 'Agotado' : 'Cerrado'
  const price = formatCOP(product.price)
  const titleId = `product-${product.id}`

  const add = () => {
    if (onAdd(product)) trigger()
  }

  return (
    <li>
      <article
        aria-labelledby={titleId}
        className={`w-full overflow-hidden rounded-xl border border-gray-100 bg-white ${
          !product.available ? 'opacity-55' : 'shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 p-3">
          <button
            type="button"
            onClick={() => onOpenDetail(product)}
            aria-label={`Ver detalles de ${product.name}${canAdd ? '' : `, ${reason.toLowerCase()}`}`}
            className="focus-ring flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99] transition-transform"
          >
            <span className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center text-4xl">
              <ProductImage imageUrl={product.image_url} alt="" width={96} />
            </span>
            <span className="min-w-0 flex-1">
              {/* <span> y no <h3>/<p>: van dentro de un <button>, que solo admite
                  contenido de frase. El nombre accesible del article sale de aquí. */}
              <span id={titleId} className="block font-display text-base font-bold text-secondary">
                {product.name}
              </span>
              <span className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{product.description}</span>
              <span className="mt-2 block text-base font-bold text-coral">{price}</span>
            </span>
          </button>

          {!canAdd ? (
            <div className="flex w-14 flex-shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                disabled
                aria-label={`${product.name}: ${reason.toLowerCase()}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="text-[11px] font-medium text-gray-500" aria-hidden="true">
                {reason}
              </span>
            </div>
          ) : quantity > 0 ? (
            <div className="flex h-10 flex-shrink-0 items-center gap-1 rounded-full bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => onDecrement(product)}
                aria-label={quantity === 1 ? `Quitar ${product.name} del carrito` : `Quitar una unidad de ${product.name}`}
                className="touch-target focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-white text-secondary shadow-sm active:scale-90 transition-transform"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-6 text-center text-sm font-bold text-secondary" aria-live="polite">
                <span className="sr-only">{product.name}: </span>
                {quantity}
                <span className="sr-only"> en el carrito</span>
              </span>
              <button
                type="button"
                onClick={add}
                disabled={quantity >= MAX_ITEM_QUANTITY}
                aria-label={`Agregar otra unidad de ${product.name}, ${price}`}
                className="touch-target focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-coral text-white shadow-sm active:scale-90 transition-transform disabled:opacity-40"
              >
                {flash ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={add}
              aria-label={`Agregar ${product.name} al carrito, ${price}`}
              className="touch-target focus-ring flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-coral text-white shadow-sm active:scale-90 transition-transform"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </article>
    </li>
  )
}
