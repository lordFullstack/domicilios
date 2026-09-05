import { Minus, Plus } from 'lucide-react'

import { Product } from '@/shared/types'
import { ProductImage } from '@/shared/components/ProductImage'
import { formatCOP } from '@/shared/utils/money'

interface MenuProductCardProps {
  product: Product
  restaurantIsOpen: boolean
  quantity: number
  onOpenDetail: (product: Product) => void
  onIncrement: (product: Product) => void
  onDecrement: (product: Product) => void
}

export const MenuProductCard = ({
  product,
  restaurantIsOpen,
  quantity,
  onOpenDetail,
  onIncrement,
  onDecrement,
}: MenuProductCardProps) => {
  const canAdd = product.available && restaurantIsOpen

  return (
    <article
      className={`w-full overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow ${
        !product.available ? 'opacity-55' : 'shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          aria-label={`Ver detalles de ${product.name}`}
          className="focus-ring flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99] transition-transform"
        >
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50">
            <ProductImage imageUrl={product.image_url} alt={product.name} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold text-secondary">
              {product.name}
            </p>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
              {product.description}
            </p>

            <p className="mt-2 text-base font-bold text-primary">
              {formatCOP(product.price)}
            </p>
          </div>
        </button>

        {canAdd ? (
          quantity > 0 ? (
            <div
              className="flex h-10 flex-shrink-0 items-center gap-1 rounded-full bg-gray-50 p-1"
              aria-label={`Cantidad de ${product.name}: ${quantity}`}
            >
              <button
                type="button"
                onClick={() => onDecrement(product)}
                aria-label={`Disminuir ${product.name}`}
                className="touch-target focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-white text-secondary shadow-sm active:scale-90 transition-transform"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="min-w-6 text-center text-sm font-bold text-secondary">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrement(product)}
                aria-label={`Aumentar ${product.name}`}
                className="touch-target focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm active:scale-90 transition-transform"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onIncrement(product)}
              aria-label={`Agregar ${product.name}`}
              className="touch-target focus-ring flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm active:scale-90 transition-transform"
            >
              <Plus className="h-5 w-5" />
            </button>
          )
        ) : (
          <span className="flex-shrink-0 text-xs font-medium text-gray-500">
            {!product.available ? 'Agotado' : 'Cerrado'}
          </span>
        )}
      </div>
    </article>
  )
}
