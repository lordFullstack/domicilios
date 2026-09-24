import { Check, Plus, Flame } from 'lucide-react'
import { Product } from '@/shared/types'
import { ProductImage } from '@/shared/components/ProductImage'
import { formatCOP } from '@/shared/utils/money'
import { MAX_ITEM_QUANTITY } from '../CartContext'
import { useAddedFlash } from '../hooks/useAddedFlash'

interface FeaturedProductStripProps {
  /** Ya filtrados por quien llama: promociones `featured_product` del Admin. */
  products: Product[]
  restaurantIsOpen: boolean
  getQuantity: (productId: string) => number
  onOpenDetail: (product: Product) => void
  onAdd: (product: Product) => boolean
}

interface CardProps extends Omit<FeaturedProductStripProps, 'products' | 'getQuantity'> {
  product: Product
  quantity: number
}

const FeaturedCard = ({ product, quantity, restaurantIsOpen, onOpenDetail, onAdd }: CardProps) => {
  const { flash, trigger } = useAddedFlash()
  const canAdd = product.available && restaurantIsOpen && quantity < MAX_ITEM_QUANTITY
  const price = formatCOP(product.price)

  return (
    <li className="card-surface card-surface--static relative w-40 flex-shrink-0 overflow-hidden rounded-2xl bg-white">
      <button
        type="button"
        onClick={() => onOpenDetail(product)}
        aria-label={`Ver detalles de ${product.name}`}
        className="focus-ring block w-full text-left active:scale-[0.99] transition-transform"
      >
        <span className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gray-50 text-3xl">
          <ProductImage imageUrl={product.image_url} alt="" width={160} height={120} fallback="rocket" />
        </span>
        {/* Fila inferior: nombre + precio a la izquierda; el "+" (hermano
            absoluto, centrado en esta fila de 60px) a la derecha. */}
        <span className="flex min-h-[60px] flex-col justify-center gap-0.5 p-3 pr-14">
          <span className="block truncate font-display text-sm font-bold text-secondary">{product.name}</span>
          <span className="block text-sm font-semibold tabular-nums text-ink">{price}</span>
        </span>
      </button>

      {canAdd && (
        <button
          type="button"
          onClick={() => onAdd(product) && trigger()}
          aria-label={`Agregar ${product.name} al carrito, ${price}${quantity > 0 ? `. Ya tienes ${quantity}` : ''}`}
          className="touch-target focus-ring absolute bottom-1.5 right-1.5 flex items-center justify-center rounded-full active:scale-90 transition-transform"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-white shadow-sm">
            {flash ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {quantity > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs font-bold tabular-nums text-white"
              >
                {quantity}
              </span>
            )}
          </span>
        </button>
      )}
    </li>
  )
}

/**
 * "Recomendados" = productos que el Admin marcó como destacados
 * (promotions.type = 'featured_product') y que son de este restaurante.
 * Sin promociones → la sección no se muestra (no se rellena al azar).
 */
export const FeaturedProductStrip = ({ products, getQuantity, ...rest }: FeaturedProductStripProps) => {
  if (products.length === 0) return null

  return (
    <section className="mb-5" aria-labelledby="featured-products-title">
      <h2
        id="featured-products-title"
        className="mb-2 flex items-center gap-1.5 font-display text-base font-bold text-secondary"
      >
        <Flame className="h-4 w-4 text-brand-700" fill="currentColor" aria-hidden="true" />
        Recomendados
      </h2>
      <ul role="list" className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {products.map((product) => (
          <FeaturedCard key={product.id} product={product} quantity={getQuantity(product.id)} {...rest} />
        ))}
      </ul>
    </section>
  )
}
